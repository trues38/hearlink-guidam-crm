import { NextRequest } from "next/server";

const HERMES_BASE_URL = process.env.HERMES_API_URL || "http://75.119.146.249:8642";
const HERMES_API_KEY = process.env.HERMES_API_KEY || "hearlink-hermes-2026";

export async function POST(req: NextRequest) {
  const body = await req.json();

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
        {
          role: "system",
          content: "당신은 Hearlink 보청기 센터의 AI 비서입니다. 고객 관리, 일정, 재고, 업무일지, 적합관리 등 센터 업무 전반을 도와줍니다. 한국어로 간결하고 전문적으로 답변하세요.",
        },
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
