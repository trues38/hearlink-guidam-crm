import { NextRequest } from "next/server";

const HERMES_BASE_URL = process.env.HERMES_API_URL || "http://75.119.146.249:8642";
const HERMES_API_KEY = process.env.HERMES_API_KEY || "hearlink-hermes-2026";
const CRM_API_URL = process.env.CRM_API_URL || "http://localhost:3003";

async function fetchCrmContext(userMessage: string): Promise<string> {
  const parts: string[] = [];

  try {
    const isCustomerQuery = /고객|환자|김|이|박|최|정|한|찾아|검색/.test(userMessage);
    const isScheduleQuery = /일정|예약|오늘|내일|이번주|다음주|언제/.test(userMessage);
    const isInventoryQuery = /재고|배터리|악세사리|부족|수량/.test(userMessage);

    const fetches: Promise<void>[] = [];

    if (isCustomerQuery) {
      fetches.push(
        fetch(`${CRM_API_URL}/api/customers?limit=10`)
          .then(r => r.json())
          .then(data => {
            if (data?.items?.length > 0) {
              const list = data.items.map((c: { name: string; chartNo?: string; phone?: string }) =>
                `- ${c.name} (차트: ${c.chartNo ?? "-"}, 연락처: ${c.phone ?? "-"})`
              ).join("\n");
              parts.push(`[등록된 고객 목록]\n${list}\n총 ${data.total}명 등록`);
            }
          })
          .catch(() => {})
      );
    }

    if (isScheduleQuery) {
      const today = new Date().toISOString().split("T")[0];
      fetches.push(
        fetch(`${CRM_API_URL}/api/schedules?date=${today}&limit=10`)
          .then(r => r.json())
          .then(data => {
            if (data?.items?.length > 0) {
              const list = data.items.map((s: { title: string; scheduledAt: string }) =>
                `- ${s.title} (${new Date(s.scheduledAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })})`
              ).join("\n");
              parts.push(`[오늘(${today}) 일정]\n${list}`);
            } else {
              parts.push(`[오늘(${today}) 일정] 없음`);
            }
          })
          .catch(() => {})
      );
    }

    if (isInventoryQuery) {
      fetches.push(
        fetch(`${CRM_API_URL}/api/batteries?limit=20`)
          .then(r => r.json())
          .then(data => {
            if (data?.items?.length > 0) {
              parts.push(`[배터리 재고] ${data.items.length}개 품목 등록`);
            }
          })
          .catch(() => {})
      );
    }

    await Promise.all(fetches);
  } catch {}

  return parts.length > 0 ? `\n\n[CRM 실시간 데이터]\n${parts.join("\n\n")}` : "";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userMessage = body.messages?.at(-1)?.content ?? "";

  const crmContext = await fetchCrmContext(userMessage);

  const systemPrompt = `당신은 Hearlink 보청기 센터의 AI 비서입니다. 고객 관리, 일정, 재고, 업무일지, 적합관리 등 센터 업무 전반을 도와줍니다. 한국어로 간결하고 전문적으로 답변하세요.${crmContext}`;

  const hermesRes = await fetch(`${HERMES_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HERMES_API_KEY}`,
    },
    body: JSON.stringify({
      model: "hearbot",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...(body.messages ?? []),
      ],
    }),
  });

  if (!hermesRes.ok) {
    const error = await hermesRes.text();
    return new Response(JSON.stringify({ error }), {
      status: hermesRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(hermesRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
