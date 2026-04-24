export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.approvalPayload?.content) {
    return Response.json({ error: '승인 payload가 없습니다.' }, { status: 400 });
  }

  // TODO: 백엔드 연동 시 실제 DB 저장 로직 추가
  return Response.json({
    ok: true,
    workLogId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
}
