// Cloudflare Pages Function: POST /api/generate
// Route: /tools/aipdf/api/generate. Reads the GROQ_API_KEY secret from Cloudflare.
// Tried in order; the next one is used when a model is unavailable, rate-limited or returns bad output.
const MODELS = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant'];
const SHAPE = {
  word: '{"title":string,"sections":[{"heading":string,"body":string (paragraphs split by \\n),"bullets":string[]}]}',
  pdf: '{"title":string,"sections":[{"heading":string,"body":string (paragraphs split by \\n),"bullets":string[]}]}',
  md: '{"title":string,"sections":[{"heading":string,"body":string (paragraphs split by \\n),"bullets":string[]}]}',
  ppt: '{"title":string,"slides":[{"title":string,"bullets":string[] (3-5 short points)}]} with 6-10 slides',
  excel: '{"title":string,"headers":string[],"rows":string[][] (all rows same length as headers, 8-25 rows)}',
};
const ALLOWED = ['project.wondermayank.in', 'wondermayank.in', 'wondermayank.indevs.in', 'aipdf.wondermayank.indevs.in'];
const json = (o, s = 200, CORS = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS } });

export async function onRequestOptions({ request }) {
  const o = request.headers.get('Origin');
  const ok = o && (ALLOWED.includes(new URL(o).host) || new URL(o).host === new URL(request.url).host);
  return new Response(null, { status: ok ? 204 : 403, headers: ok ? { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' } : {} });
}

export async function onRequestPost({ request, env }) {
  if (!env.GROQ_API_KEY) return json({ error: 'AI is not configured yet.' }, 500);
  let CORS = {};
  const origin = request.headers.get('Origin');
  if (origin) {
    const h = new URL(origin).host;
    if (h !== new URL(request.url).host && !ALLOWED.includes(h)) return json({ error: 'Not allowed.' }, 403);
    CORS = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' };
  }
  let b;
  try { b = await request.json(); } catch { return json({ error: 'Bad request.' }, 400); }
  const format = SHAPE[b.format] ? b.format : 'word';
  const text = String(b.prompt || '').trim().slice(0, 6000);
  if (text.length < 3) return json({ error: 'Please describe what you need.' }, 400);
  const improve = b.mode === 'improve';
  const system = 'You are ThunderDoc, a document writer. ' +
    (improve ? 'Clean up the user text: fix grammar and structure, keep every fact and the original meaning, add clear headings. Do not invent facts. ' : 'Write a complete, polished, ready-to-use document for the request. Use placeholders like [Your Name] where personal details are missing. ') +
    'Reply with ONLY valid JSON of this shape: ' + SHAPE[format] + '. No markdown, no emoji.';
  const messages = [{ role: 'system', content: system }, { role: 'user', content: text }];
  let err = 'The AI is busy right now. Try again in a minute.';
  for (const model of MODELS) {
    let r;
    try {
      r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.GROQ_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature: improve ? 0.3 : 0.6, max_tokens: 4096, response_format: { type: 'json_object' }, messages }),
      });
    } catch { continue; }
    if (r.status === 401 || r.status === 403) return json({ error: 'AI is not configured correctly.' }, 500);
    if (!r.ok) continue;
    try {
      const data = JSON.parse((await r.json()).choices[0].message.content);
      if (data && (data.sections || data.slides || data.rows)) return json({ data }, 200, CORS);
    } catch {}
  }
  return json({ error: err }, 502);
}
