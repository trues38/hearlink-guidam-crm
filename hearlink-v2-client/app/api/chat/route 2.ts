import { createOpenAI } from '@ai-sdk/openai';
import { WorkLogType } from '@prisma/client';
import { convertToCoreMessages, streamText, tool, type Message } from 'ai';
import { z } from 'zod';

import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 30;

type SessionContext = {
  centerId: string;
  userId: string;
};

type RateLimiterState = {
  count: number;
  resetAt: number;
};

type GlobalWithRateLimiter = typeof globalThis & {
  __chatRateLimiter?: Map<string, RateLimiterState>;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const openRouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
});

const ollama = createOpenAI({
  apiKey: process.env.OLLAMA_API_KEY ?? 'ollama',
  baseURL: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434/v1',
});

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
  session: z.object({
    centerId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

const resolveModel = () => {
  const provider = (process.env.LLM_PROVIDER ?? 'openrouter').toLowerCase();

  if (provider === 'ollama') {
    return ollama(process.env.OLLAMA_MODEL ?? 'qwen2.5:7b-instruct');
  }

  return openRouter(process.env.OPENROUTER_MODEL ?? 'openai/gpt-4.1-mini');
};

const inferScheduleType = (value: string): '상담' | '수리' | '적합' => {
  const normalized = value.toLowerCase();

  if (
    normalized.includes('수리') ||
    normalized.includes('as') ||
    normalized.includes('a/s')
  ) {
    return '수리';
  }

  if (normalized.includes('적합') || normalized.includes('피팅')) {
    return '적합';
  }

  return '상담';
};

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(value);

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return req.headers.get('x-real-ip') ?? 'unknown';
};

const isRateLimited = (key: string) => {
  const g = globalThis as GlobalWithRateLimiter;
  if (!g.__chatRateLimiter) {
    g.__chatRateLimiter = new Map<string, RateLimiterState>();
  }

  const now = Date.now();
  const state = g.__chatRateLimiter.get(key);

  if (!state || now > state.resetAt) {
    g.__chatRateLimiter.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return false;
  }

  if (state.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  state.count += 1;
  g.__chatRateLimiter.set(key, state);
  return false;
};

const writeAuditLog = async ({
  session,
  toolName,
  input,
  output,
}: {
  session: SessionContext;
  toolName: string;
  input: unknown;
  output?: unknown;
}) => {
  try {
    await prisma.copilotAuditLog.create({
      data: {
        centerId: session.centerId,
        userId: session.userId,
        toolName,
        input: input as object,
        output: output as object,
      },
    });
  } catch {
    // 감사로그 실패는 기능 자체를 중단시키지 않음
  }
};

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return Response.json(
      {
        error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.',
      },
      { status: 429 }
    );
  }

  const body = chatRequestSchema.safeParse(await req.json());

  if (!body.success) {
    return Response.json(
      {
        error: 'session(userId, centerId) 정보가 필요합니다.',
      },
      { status: 400 }
    );
  }

  const session: SessionContext = {
    centerId: body.data.session.centerId,
    userId: body.data.session.userId,
  };

  const messages = body.data.messages as Message[];

  const result = streamText({
    model: resolveModel(),
    maxSteps: 6,
    system: [
      '당신은 Hearlink CRM 코파일럿입니다.',
      '반드시 필요한 경우에만 tool을 호출하고, 응답은 한국어로 짧고 명확하게 작성하세요.',
      '고객 조회 요청은 findCustomer를 우선 호출하세요.',
      '일정 확인 요청은 getSchedules를 우선 호출하세요.',
      '업무일지 기록 요청은 createWorkLog를 호출하세요.',
      'createWorkLog는 즉시 저장이 아닌 승인요청으로 반환됩니다.',
      '도구 결과에 uiType이 있으면 해당 내용을 1~2문장으로 요약해 안내하세요.',
    ].join(' '),
    messages: convertToCoreMessages(messages),
    tools: {
      findCustomer: tool({
        description:
          '고객명/연락처로 고객을 조회하고 최근 이력(업무일지, 디바이스)을 요약한다.',
        parameters: z.object({
          query: z.string().min(1),
          limit: z.number().int().min(1).max(10).default(5),
        }),
        execute: async ({ query, limit }) => {
          const rows = await prisma.customer.findMany({
            where: {
              centerId: session.centerId,
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { contactNumber: { contains: query } },
              ],
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
              devices: {
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
              workLogs: {
                where: { centerId: session.centerId },
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
          });

          const customers = rows.map((row) => ({
            id: row.id,
            name: row.name,
            phone: row.contactNumber,
            device:
              row.devices[0] !== undefined
                ? `${row.devices[0].brand} ${row.devices[0].model}`
                : '미등록',
            lastVisit:
              row.workLogs[0] !== undefined
                ? formatDateTime(row.workLogs[0].createdAt)
                : '방문 이력 없음',
          }));

          const output = {
            uiType: 'customer_summary',
            total: customers.length,
            customer: customers[0] ?? null,
            candidates: customers,
          };

          await writeAuditLog({
            session,
            toolName: 'findCustomer',
            input: { query, limit },
            output,
          });

          return output;
        },
      }),
      getSchedules: tool({
        description: '특정 날짜 일정 목록을 조회한다.',
        parameters: z.object({
          date: z.string().describe('YYYY-MM-DD'),
          limit: z.number().int().min(1).max(20).default(8),
        }),
        execute: async ({ date, limit }) => {
          const base = new Date(`${date}T00:00:00+09:00`);

          if (Number.isNaN(base.valueOf())) {
            const invalidOutput = {
              uiType: 'schedule_list',
              date,
              schedules: [],
            };

            await writeAuditLog({
              session,
              toolName: 'getSchedules',
              input: { date, limit },
              output: invalidOutput,
            });

            return invalidOutput;
          }

          const next = new Date(base);
          next.setDate(base.getDate() + 1);

          const rows = await prisma.schedule.findMany({
            where: {
              centerId: session.centerId,
              scheduledAt: {
                gte: base,
                lt: next,
              },
            },
            include: {
              customer: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { scheduledAt: 'asc' },
            take: limit,
          });

          const schedules = rows.map((row) => {
            const displayTitle = row.customer?.name
              ? `${row.customer.name} ${row.title}`
              : row.title;

            return {
              id: row.id,
              time: new Intl.DateTimeFormat('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Seoul',
              }).format(row.scheduledAt),
              type: inferScheduleType(row.title),
              title: displayTitle,
            };
          });

          const output = {
            uiType: 'schedule_list',
            date,
            schedules,
          };

          await writeAuditLog({
            session,
            toolName: 'getSchedules',
            input: { date, limit },
            output,
          });

          return output;
        },
      }),
      createWorkLog: tool({
        description:
          '고객 업무일지를 승인 대기 상태로 생성 요청한다. 실제 DB 저장은 승인 API에서 수행한다.',
        parameters: z.object({
          content: z.string().min(2),
          type: z.nativeEnum(WorkLogType).default(WorkLogType.OTHER),
          customerId: z.string().uuid().optional(),
        }),
        execute: async ({ content, customerId, type }) => {
          const approvalPayload = {
            content,
            type,
            customerId,
            centerId: session.centerId,
            userId: session.userId,
          };

          const output = {
            uiType: 'action_confirmation',
            action: '업무일지 저장 승인',
            details: '승인 버튼을 누르면 실제 DB에 저장됩니다.',
            success: true,
            status: 'pending_approval',
            approvalPayload,
          };

          await writeAuditLog({
            session,
            toolName: 'createWorkLog',
            input: { content, type, customerId },
            output,
          });

          return output;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
