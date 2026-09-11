import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You expand a human knowledge graph. Return ONLY JSON with this shape: {"nodes":[{"id":"kebab-case","label":"string","description":"string","domain":"string","educationLevel":"primary|middle-school|high-school|undergraduate|graduate|research","difficulty":1,"zoomLevel":1,"type":"concept"}],"edges":[{"source":"id","target":"id","relation":"prerequisite|contains|related_to|used_by|derived_from|generalizes|specializes"}]}. Prefer prerequisite relationships that are pedagogically defensible. Do not invent citations.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'DEEPSEEK_API_KEY is not configured.' }, { status: 503 });

  const body = await request.json();
  const topic = String(body?.topic ?? '').trim();
  const depth = Math.max(1, Math.min(12, Number(body?.depth ?? 5)));
  if (!topic) return NextResponse.json({ error: 'topic is required.' }, { status: 400 });

  const response = await fetch(process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Expand the knowledge graph around "${topic}" with about ${depth} useful neighboring concepts. Include prerequisites and more advanced successors.` }
      ]
    })
  });

  if (!response.ok) return NextResponse.json({ error: 'DeepSeek request failed.', status: response.status }, { status: 502 });
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ error: 'DeepSeek returned no content.' }, { status: 502 });

  try {
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ error: 'DeepSeek returned invalid JSON.' }, { status: 502 });
  }
}
