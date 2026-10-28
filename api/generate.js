// Vercel Serverless Function: POST /api/generate
// Reads the GROQ_API_KEY environment variable (Vercel → Settings → Environment Variables).
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

function hostOf(o) { try { return new URL(o).host; } catch { return ''; } }

function send(res, status, obj, cors = {}) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  for (const k in cors) res.setHeader(k, cors[k]);
  res.send(JSON.stringify(obj));
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  const selfHost = req.headers['x-forwarded-host'] || req.headers.host;
  const h = origin ? hostOf(origin) : '';
  const originOk = !origin || h === selfHost || ALLOWED.includes(h) || /^[a-z0-9-]+\.vercel\.app$/.test(h);

  if (req.method === 'OPTIONS') {
    if (!origin || !originOk) { res.status(403).end(); return; }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST, OPTIONS'); return send(res, 405, { error: 'Method not allowed.' }); }
  if (!process.env.GROQ_API_KEY) return send(res, 500, { error: 'AI is not configured yet.' });
  if (!originOk) return send(res, 403, { error: 'Not allowed.' });
  const CORS = origin ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' } : {};

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return send(res, 400, { error: 'Bad request.' }, CORS);

  const format = SHAPE[b.format] ? b.format : 'word';
  const text = String(b.prompt || '').trim().slice(0, 6000);
  if (text.length < 3) return send(res, 400, { error: 'Please describe what you need.' }, CORS);
  const improve = b.mode === 'improve';
  const system = 'You are ThunderDoc, a document writer. ' +
    (improve ? 'Clean up the user text: fix grammar and structure, keep every fact and the original meaning, add clear headings. Do not invent facts. ' : 'Write a complete, polished, ready-to-use document for the request. Use placeholders like [Your Name] where personal details are missing. ') +
    'Reply with ONLY valid JSON of this shape: ' + SHAPE[format] + '. No markdown, no emoji.';
  const messages = [{ role: 'system', content: system }, { role: 'user', content: text }];

  for (const model of MODELS) {
    let r;
    try {
      r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + process.env.GROQ_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature: improve ? 0.3 : 0.6, max_tokens: 4096, response_format: { type: 'json_object' }, messages }),
      });
    } catch { continue; }
    if (r.status === 401 || r.status === 403) return send(res, 500, { error: 'AI is not configured correctly.' }, CORS);
    if (!r.ok) continue;
    try {
      const data = JSON.parse((await r.json()).choices[0].message.content);
      if (data && (data.sections || data.slides || data.rows)) return send(res, 200, { data }, CORS);
    } catch {}
  }
  return send(res, 502, { error: 'The AI is busy right now. Try again in a minute.' }, CORS);
};
