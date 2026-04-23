import { WorkLogType } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';

const approveSchema = z.object({
  session: z.object({
    centerId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  approvalPayload: z.object({
    content: z.string().min(2),
    type: z.nativeEnum(WorkLogType),
    customerId: z.string().uuid().optional(),
  }),
});

export async function POST(req: Request) {
  const parsed = approveSchema.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json(
      {
        error: '승인 요청 payload 형식이 올바르지 않습니다.',
      },
      { status: 400 }
    );
  }

  const { session, approvalPayload } = parsed.data;

  if (approvalPayload.customerId) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: approvalPayload.customerId,
        centerId: session.centerId,
      },
      select: { id: true },
    });

    if (!customer) {
      return Response.json(
        {
          error: '해당 센터에 속한 고객이 아닙니다.',
        },
        { status: 403 }
      );
    }
  }

  const created = await prisma.workLog.create({
    data: {
      centerId: session.centerId,
      userId: session.userId,
      customerId: approvalPayload.customerId,
      content: approvalPayload.content,
      type: approvalPayload.type,
    },
  });

  await prisma.copilotAuditLog.create({
    data: {
      centerId: session.centerId,
      userId: session.userId,
      toolName: 'approveWorkLog',
      input: approvalPayload,
      output: {
        workLogId: created.id,
      },
    },
  });

  return Response.json({
    ok: true,
    workLogId: created.id,
    createdAt: created.createdAt,
  });
}
