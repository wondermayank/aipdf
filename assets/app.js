/* ===================== Theme ===================== */
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();
function updateThemeIcon() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.getElementById('themeIcon').innerHTML = dark
    ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
    : '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>';
}
document.getElementById('themeToggle').addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) { html.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); }
  else { html.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); }
  updateThemeIcon();
});
updateThemeIcon();

/* ===================== Loading screen ===================== */
function hideLoading() {
  const el = document.getElementById('loading-screen');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => el.remove(), 300);
}
window.addEventListener('DOMContentLoaded', hideLoading);
setTimeout(hideLoading, 1500);

/* ===================== Nav ===================== */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 8);
});
document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

/* ===================== Feature grid data ===================== */
const FEATURES = [
  { icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path>', title: 'Essays & assignments', desc: 'A topic becomes a structured essay with intro, body and conclusion.', format: 'word', prompt: 'Write a 5-paragraph essay on the causes of climate change' },
  { icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>', title: 'Resumes & cover letters', desc: 'A polished, role-specific resume or cover letter in seconds.', format: 'word', prompt: 'Write a cover letter for a marketing internship at a fintech startup' },
  { icon: '<path d="M2 3h20v14H2z"></path><path d="M8 21h8M12 17v4"></path>', title: 'Study notes & lesson plans', desc: 'Turn a syllabus topic into organized notes or a full lesson plan.', format: 'word', prompt: 'Create structured study notes on Newton\'s Laws of Motion for a CBSE Class 11 student' },
  { icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M9 13h6M9 17h6"></path>', title: 'Reports & proposals', desc: 'Business reports, project proposals and case studies, properly formatted.', format: 'pdf', prompt: 'Write a project proposal for launching a campus recycling program' },
  { icon: '<rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M8 21h8M12 18v3"></path>', title: 'Presentations', desc: 'Describe your topic and get a slide-by-slide outline ready to present.', format: 'ppt', prompt: 'Create a 6-slide pitch deck for a student-run tutoring startup' },
  { icon: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M3 15h18M9 3v18M15 3v18"></path>', title: 'Spreadsheets', desc: 'Structured tables, trackers and budgets as a downloadable Excel file.', format: 'excel', prompt: 'Create a monthly study planner spreadsheet with subject, topic, hours and status columns' },
  { icon: '<path d="M8 12h8M8 16h5M4 6h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"></path><path d="M4 6l8 5 8-5"></path>', title: 'Meeting notes & agendas', desc: 'Summarize a meeting, or plan one with a ready-made agenda.', format: 'word', prompt: 'Create a meeting agenda for a weekly team standup covering progress, blockers and next steps' },
  { icon: '<path d="M4 4h16v16H4z"></path><path d="M8 4v16M4 8h4"></path>', title: 'Letters & memos', desc: 'Recommendation letters, resignation letters and business memos.', format: 'word', prompt: 'Write a formal resignation letter with two weeks notice, keeping a positive tone' }
];
const grid = document.getElementById('featureGrid');
FEATURES.forEach(f => {
  const card = document.createElement('div');
  card.className = 'feature-card';
  card.innerHTML = `
    <div class="icon-wrap"><svg class="icon" viewBox="0 0 24 24">${f.icon}</svg></div>
    <h3>${f.title}</h3>
    <p>${f.desc}</p>
    <span class="learn" data-format="${f.format}" data-prompt="${f.prompt.replace(/"/g, '&quot;')}" style="cursor:pointer">Try this ›</span>
  `;
  grid.appendChild(card);
});
grid.addEventListener('click', (e) => {
  const t = e.target.closest('.learn');
  if (!t) return;
  setFormat(t.dataset.format);
  document.getElementById('promptInput').value = t.dataset.prompt;
  document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
});

/* ===================== Example chips (per format) ===================== */
const EXAMPLES = {
  word: ['Cover letter for internship', 'Essay on climate change', 'Formal resignation letter'],
  pdf: ['Project proposal', '15-page research report', 'Recommendation letter'],
  ppt: ['5-slide pitch deck', 'Class presentation on photosynthesis', 'Product launch deck'],
  excel: ['Weekly study planner', 'Monthly budget tracker', 'Expense report template'],
  md: ['README for a project', 'Blog post draft', 'Documentation outline']
};
function renderChips(format) {
  const wrap = document.getElementById('exampleChips');
  wrap.innerHTML = '';
  EXAMPLES[format].forEach(text => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', () => { document.getElementById('promptInput').value = text; });
    wrap.appendChild(b);
  });
}

/* ===================== Format tabs ===================== */
let currentFormat = 'word';
function setFormat(format) {
  currentFormat = format;
  document.querySelectorAll('.format-tab').forEach(t => t.classList.toggle('active', t.dataset.format === format));
  renderChips(format);
}
document.getElementById('formatTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.format-tab');
  if (!btn) return;
  setFormat(btn.dataset.format);
});
renderChips('word');

// SEO landing pages set window.THUNDERDOCS_PREFILL (see generate_seo_pages.py)
// to open pre-selected on their document type with an example prompt ready to go.
if (window.THUNDERDOCS_PREFILL) {
  const pf = window.THUNDERDOCS_PREFILL;
  if (pf.format) setFormat(pf.format);
  if (pf.prompt) document.getElementById('promptInput').value = pf.prompt;
}

/* ===================== FAQ ===================== */
const FAQS = [
  { q: 'Is ThunderDocs free to use?', a: 'Yes. ThunderDocs is free to use — describe what you need and generate a downloadable document with no sign-up required.' },
  { q: 'What file formats can I download?', a: 'Word (.docx), PDF, PowerPoint (.pptx) and Excel (.xlsx), generated directly in your browser.' },
  { q: 'Do I need to sign up?', a: 'No account is required. Type your prompt, choose a format, and download your file immediately.' },
  { q: 'Can students use this for assignments and study notes?', a: 'Yes — essays, assignments, study notes, lesson plans and revision material work well, alongside resumes, reports and business documents.' },
  { q: 'Is my prompt or content stored anywhere?', a: 'Your prompt is sent to the AI model only to generate your document and is not stored or used for anything else.' }
];
const faqList = document.getElementById('faqList');
FAQS.forEach(f => {
  const item = document.createElement('div');
  item.className = 'faq-item';
  item.innerHTML = `
    <button class="faq-q">${f.q}<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg></button>
    <div class="faq-a"><p>${f.a}</p></div>
  `;
  item.querySelector('.faq-q').addEventListener('click', () => item.classList.toggle('open'));
  faqList.appendChild(item);
});

/* ===================== Generation ===================== */
let lastResult = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

// Builds a plausible structured document locally when no backend is deployed yet.
// Replace this by wiring up /api/generate (see README.md) for real AI generation.
function demoGenerate(prompt, format) {
  const title = prompt.trim().replace(/^./, c => c.toUpperCase());
  if (format === 'ppt') {
    return {
      title,
      slides: [
        { title: 'Introduction', bullets: ['Overview of the topic', 'Why it matters'] },
        { title: 'Key point one', bullets: ['Supporting detail', 'Example or data point'] },
        { title: 'Key point two', bullets: ['Supporting detail', 'Example or data point'] },
        { title: 'Key point three', bullets: ['Supporting detail', 'Example or data point'] },
        { title: 'Conclusion', bullets: ['Summary of key takeaways', 'Next steps'] }
      ]
    };
  }
  if (format === 'excel') {
    return {
      title,
      table: {
        headers: ['Item', 'Details', 'Status'],
        rows: [['Item 1', 'Placeholder detail', 'Pending'], ['Item 2', 'Placeholder detail', 'In progress'], ['Item 3', 'Placeholder detail', 'Done']]
      }
    };
  }
  return {
    title,
    sections: [
      { heading: 'Introduction', body: `This section introduces the topic: ${prompt}.` },
      { heading: 'Main content', body: 'This section expands on the main points relevant to the request, with supporting detail and structure.' },
      { heading: 'Conclusion', body: 'This section wraps up with a summary and closing thought.' }
    ]
  };
}

// Calls /api/generate and streams the raw text response, invoking onChunk
// with the accumulated text so far each time new data arrives (used to show
// live progress instead of a static spinner). Returns the full raw text once
// the stream ends; the caller still needs to run it through extractJson().
async function callAPIStreaming(prompt, format, onChunk) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, format })
  });
  if (!res.ok) throw new Error('API error');

  // Fallback for older/edge browsers (or a proxy) that don't expose a
  // readable stream on the response — just use the full text at once.
  if (!res.body || !res.body.getReader) {
    const text = await res.text();
    if (onChunk) onChunk(text);
    return text;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    if (onChunk) onChunk(full);
  }
  return full;
}

// Reasoning models occasionally wrap JSON with stray text or leftover code
// fences — strip those and extract the outermost {...} block before parsing.
function extractJson(raw) {
  let text = (raw || '').trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(text);
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Turns a plain-text body that may contain **bold**, *italic*, "- " bullets,
// "1. " numbered items and "### " sub-headings into safe, lightly-styled
// HTML for the result preview — same markdown conventions the PDF/Word
// renderers below understand, so the preview matches what gets downloaded.
function mdToHtml(text) {
  const lines = (text || '').replace(/\r\n/g, '\n').split(/\n+/).map(l => l.trim()).filter(Boolean);
  let html = '';
  let inList = false;
  lines.forEach(line => {
    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    const subheadMatch = line.match(/^#{2,4}\s+(.*)/);
    let content = subheadMatch ? subheadMatch[1] : bulletMatch ? bulletMatch[1] : numberedMatch ? numberedMatch[2] : line;
    content = escapeHtml(content)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    if (bulletMatch || numberedMatch) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${content}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += subheadMatch ? `<h5>${content}</h5>` : `<p>${content}</p>`;
    }
  });
  if (inList) html += '</ul>';
  return html;
}

function renderResult(data, format, isDemo) {
  lastResult = { data, format };
  document.getElementById('resultPanel').classList.remove('hidden');
  document.getElementById('demoNotice').classList.toggle('hidden', !isDemo);
  document.getElementById('truncatedNotice').classList.toggle('hidden', !data._truncated);
  document.getElementById('resultTitle').textContent = data.title || 'Untitled document';
  const body = document.getElementById('resultBody');
  body.innerHTML = '';
  if (data.sections) {
    data.sections.forEach(s => {
      body.innerHTML += `<h4>${escapeHtml(s.heading)}</h4>${mdToHtml(s.body)}`;
    });
  } else if (data.slides) {
    data.slides.forEach((s, i) => {
      body.innerHTML += `<h4>Slide ${i + 1}: ${escapeHtml(s.title)}</h4><p>${escapeHtml(s.bullets.join(' · '))}</p>`;
    });
  } else if (data.table) {
    body.innerHTML += `<p>${escapeHtml(data.table.headers.join(' | '))}</p>` +
      data.table.rows.map(r => `<p>${escapeHtml(r.join(' | '))}</p>`).join('');
  }
  const labels = { word: '.docx file', pdf: '.pdf file', ppt: '.pptx file', excel: '.xlsx file', md: '.md file' };
  document.getElementById('resultFormatLabel').textContent = 'Ready to download as ' + labels[format];
  document.getElementById('resultPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Trims a {title, sections} payload down to roughly `maxPages` worth of
// content (same ~1700-chars-per-page heuristic used for PDF rendering),
// dropping whole sections first and hard-clipping the last one if needed.
function truncateToPages(data, maxPages) {
  const CHARS_PER_PAGE = 1700;
  const budget = maxPages * CHARS_PER_PAGE;
  const original = data.sections || [];
  let used = 0;
  const kept = [];
  for (const s of original) {
    const len = (s.heading || '').length + (s.body || '').length;
    if (used >= budget) break;
    if (used + len <= budget) {
      kept.push(s);
      used += len;
    } else {
      const allowed = Math.max(0, budget - used - (s.heading || '').length);
      const body = (s.body || '').slice(0, allowed) + (allowed < (s.body || '').length ? '…' : '');
      if (body) kept.push({ heading: s.heading, body });
      used = budget;
      break;
    }
  }
  const finalSections = kept.length ? kept : original.slice(0, 1);
  return { ...data, sections: finalSections, _truncated: finalSections.length < original.length || used >= budget };
}

async function handleGenerateClick() {
  const prompt = document.getElementById('promptInput').value.trim();
  if (!prompt) { document.getElementById('promptInput').focus(); return; }

  const run = async () => {
    const btn = document.getElementById('generateBtn');
    const regenBtn = document.getElementById('regenerateBtn');
    const label = document.getElementById('generateLabel');
    const streamBox = document.getElementById('streamPreview');

    // Check the shared daily limit before spending an API call.
    const unlockedAtStart = isUnlocked();
    if (!unlockedAtStart && getUsage().count >= DAILY_LIMIT) {
      pendingGeneration = run;
      openPromoModal(`You've used today's ${DAILY_LIMIT} free generations on this device.`);
      return;
    }

    btn.disabled = true;
    if (regenBtn) regenBtn.disabled = true;
    label.textContent = 'Generating…';
    streamBox.textContent = '';
    streamBox.classList.remove('hidden');

    let isDemo = false;
    let data;
    try {
      const raw = await callAPIStreaming(prompt, currentFormat, (partial) => {
        streamBox.textContent = partial;
        streamBox.scrollTop = streamBox.scrollHeight;
      });
      data = extractJson(raw);
    } catch (err) {
      // No backend deployed yet, a network hiccup, or the model returned
      // something unparseable — fall back to local demo content.
      isDemo = true;
      data = demoGenerate(prompt, currentFormat);
    }

    // Enforce the shared 5-page / 5-slide free-tier cap.
    if (!unlockedAtStart) {
      if (currentFormat === 'ppt' && data.slides && data.slides.length > PAGE_LIMIT) {
        data = { ...data, slides: data.slides.slice(0, PAGE_LIMIT), _truncated: true };
      } else if ((currentFormat === 'word' || currentFormat === 'pdf' || currentFormat === 'md') && estimatePages(data) > PAGE_LIMIT) {
        data = truncateToPages(data, PAGE_LIMIT);
      }
    }

    streamBox.classList.add('hidden');
    renderResult(data, currentFormat, isDemo);
    if (!unlockedAtStart) { bumpUsage(); updateUsageLabel(); }
    btn.disabled = false;
    if (regenBtn) regenBtn.disabled = false;
    label.textContent = 'Generate document';
  };

  await run();
}

document.getElementById('generateBtn').addEventListener('click', handleGenerateClick);
document.getElementById('regenerateBtn').addEventListener('click', handleGenerateClick);

/* ===================== File builders ===================== */

// Shared markdown-lite conventions understood by every file builder below:
// **bold**, *italic*, "- "/"* " bullets, "1. " numbered items, and "### "
// or "## " sub-headings inside a section's body text.

// jsPDF's base14 fonts (Helvetica etc.) are simple single-byte fonts. If a
// string handed to doc.text() contains ANY character with a code point above
// 255 that isn't one of the ~27 codes jsPDF's WinAnsi table knows how to
// remap (checked directly against jsPDF 2.5.1's source), jsPDF silently
// re-encodes the *entire string* as 2-byte UTF-16 — which those fonts can't
// actually render, since they're not composite/CID fonts. The result: every
// character in the string gets interleaved with stray bytes, rendering as
// garbled, oddly-spaced text that can visually run past its expected width.
// This is exactly what happened with U+2011 (non-breaking hyphen) in
// AI-generated compound words like "hands‑on" — it isn't in jsPDF's safe
// list, so the whole line broke. Every string reaching doc.text() below is
// routed through this first.
const PDF_SAFE_HIGH_CODES = new Set([402, 8211, 8212, 8216, 8217, 8218, 8220, 8221, 8222, 8224, 8225, 8226, 8230, 8364, 8240, 8249, 8250, 710, 8482, 338, 339, 732, 352, 353, 376, 381, 382]);
function sanitizeForPdf(text) {
  if (!text) return text;
  return text
    // Dash/hyphen/minus variants jsPDF's table doesn't cover (the non-breaking
    // hyphen U+2011 is the one that actually caused the bug) — plain hyphens.
    .replace(/[\u2010\u2011\u2012\u2043\u2212]/g, '-')
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/[\u2713\u2714]/g, '-')
    // Catch-all: anything else above 255 that jsPDF can't safely remap gets
    // swapped for a plain hyphen so it can never trigger the broken path.
    .split('')
    .map(ch => {
      const code = ch.charCodeAt(0);
      return code > 255 && !PDF_SAFE_HIGH_CODES.has(code) ? '-' : ch;
    })
    .join('');
}

function tokenizeInline(line) {
  line = sanitizeForPdf(line);
  const tokens = [];
  const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
  boldParts.forEach(part => {
    if (!part) return;
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      boldMatch[1].split(/\s+/).filter(Boolean).forEach(w => tokens.push({ text: w, bold: true, italic: false }));
      return;
    }
    const italicParts = part.split(/(\*[^*]+\*)/g);
    italicParts.forEach(seg => {
      if (!seg) return;
      const italicMatch = seg.match(/^\*([^*]+)\*$/);
      if (italicMatch) {
        italicMatch[1].split(/\s+/).filter(Boolean).forEach(w => tokens.push({ text: w, bold: false, italic: true }));
      } else {
        seg.split(/\s+/).filter(Boolean).forEach(w => tokens.push({ text: w, bold: false, italic: false }));
      }
    });
  });
  return tokens;
}

// Draws word-wrapped text with mixed bold/italic runs starting at ctx.x/ctx.y.
// Calls ctx.pageBreak() whenever a line would run past the bottom margin;
// that callback must either return the y to resume at, or null to signal
// "stop, the free-tier page limit is reached" (thrown as PAGE_LIMIT_SIGNAL so
// it unwinds cleanly out of every nested loop above it).
const PAGE_LIMIT_SIGNAL = Symbol('pageLimit');
function drawRichWrapped(tokens, ctx) {
  const { doc, fontFamily, size, color, baseItalic } = ctx;
  let x = ctx.x;
  let y = ctx.y;
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(size);
  const spaceWidth = doc.getTextWidth(' ');

  tokens.forEach(tok => {
    const isItalic = tok.italic || baseItalic;
    const style = tok.bold && isItalic ? 'bolditalic' : tok.bold ? 'bold' : isItalic ? 'italic' : 'normal';
    doc.setFont(fontFamily, style);
    doc.setFontSize(size);
    const w = doc.getTextWidth(tok.text);
    if (x + w > ctx.x + ctx.maxWidth) {
      y += ctx.lineHeight;
      x = ctx.x;
      if (y > ctx.pageBottom) {
        const newY = ctx.pageBreak();
        if (newY === null) throw PAGE_LIMIT_SIGNAL;
        y = newY; x = ctx.x;
      }
    }
    doc.setTextColor(color[0], color[1], color[2]);
    // Trailing space is invisible but keeps a real space character in the
    // PDF's text stream between words, so copy-pasting text out of the PDF
    // doesn't run every word together (visual position is unaffected since
    // each word is still placed via its own tracked x/y coordinate).
    doc.text(tok.text + ' ', x, y);
    x += w + spaceWidth;
  });
  return y + ctx.lineHeight;
}

// Renders a full body string — paragraphs, bullets, numbered items and
// sub-headings — using drawRichWrapped for the actual word-wrapping.
function drawRichBody(bodyText, ctx) {
  const paragraphs = (bodyText || '').replace(/\r\n/g, '\n').split(/\n+/).map(p => p.trim()).filter(Boolean);
  let y = ctx.y;

  paragraphs.forEach(para => {
    const bulletMatch = para.match(/^[-*]\s+(.*)/);
    const numberedMatch = para.match(/^(\d+)\.\s+(.*)/);
    const subheadMatch = para.match(/^#{2,4}\s+(.*)/);

    if (y > ctx.pageBottom) {
      const newY = ctx.pageBreak();
      if (newY === null) throw PAGE_LIMIT_SIGNAL;
      y = newY;
    }

    if (subheadMatch) {
      ctx.doc.setFont(ctx.fontFamily, 'bold');
      ctx.doc.setFontSize(ctx.size + 1);
      ctx.doc.setTextColor(ctx.headingColor[0], ctx.headingColor[1], ctx.headingColor[2]);
      ctx.doc.text(sanitizeForPdf(subheadMatch[1]), ctx.x, y);
      y += ctx.lineHeight + 4;
      return;
    }

    if (bulletMatch || numberedMatch) {
      const marker = bulletMatch ? '•' : `${numberedMatch[1]}.`;
      const text = bulletMatch ? bulletMatch[1] : numberedMatch[2];
      ctx.doc.setFont(ctx.fontFamily, 'normal');
      ctx.doc.setFontSize(ctx.size);
      ctx.doc.setTextColor(ctx.color[0], ctx.color[1], ctx.color[2]);
      ctx.doc.text(sanitizeForPdf(marker), ctx.x, y);
      const indent = 16;
      y = drawRichWrapped(tokenizeInline(text), { ...ctx, x: ctx.x + indent, maxWidth: ctx.maxWidth - indent, y });
      return;
    }

    y = drawRichWrapped(tokenizeInline(para), { ...ctx, y });
    y += 6;
  });

  return y;
}

// Fits a title/heading into one or two lines, shrinking the font size if
// necessary so it never runs off the page — fixes the earlier bug where long
// titles/headings were drawn unwrapped and could overflow the page edge.
function fitHeading(doc, text, maxWidth, opts) {
  text = sanitizeForPdf(text);
  const { fontFamily, style, maxSize, minSize, maxLines } = opts;
  let size = maxSize;
  let lines;
  do {
    doc.setFont(fontFamily, style);
    doc.setFontSize(size);
    lines = doc.splitTextToSize(text || '', maxWidth);
    if (lines.length <= (maxLines || 2) || size <= minSize) break;
    size -= 1;
  } while (size > minSize);
  return { lines, size };
}

// ---- Word (.docx) ----
function tokenizeInlineRuns(line) {
  const runs = [];
  const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
  boldParts.forEach(part => {
    if (!part) return;
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) { runs.push({ text: boldMatch[1], bold: true, italics: false }); return; }
    const italicParts = part.split(/(\*[^*]+\*)/g);
    italicParts.forEach(seg => {
      if (!seg) return;
      const italicMatch = seg.match(/^\*([^*]+)\*$/);
      if (italicMatch) runs.push({ text: italicMatch[1], bold: false, italics: true });
      else runs.push({ text: seg, bold: false, italics: false });
    });
  });
  return runs;
}
function buildDocxParagraphsFromBody(bodyText, docx) {
  const { Paragraph, TextRun } = docx;
  const paragraphs = [];
  const lines = (bodyText || '').replace(/\r\n/g, '\n').split(/\n+/).map(l => l.trim()).filter(Boolean);
  lines.forEach(line => {
    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    const subheadMatch = line.match(/^#{2,4}\s+(.*)/);
    if (subheadMatch) {
      paragraphs.push(new Paragraph({ text: subheadMatch[1], heading: docx.HeadingLevel.HEADING_2, spacing: { before: 160, after: 80 } }));
      return;
    }
    const text = bulletMatch ? bulletMatch[1] : numberedMatch ? `${numberedMatch[1]}. ${numberedMatch[2]}` : line;
    const runs = tokenizeInlineRuns(text).map(r => new TextRun({ text: r.text, bold: r.bold, italics: r.italics }));
    paragraphs.push(new Paragraph({
      children: runs.length ? runs : [new TextRun(text)],
      bullet: bulletMatch ? { level: 0 } : undefined,
      spacing: { after: 100 }
    }));
  });
  return paragraphs;
}
async function downloadWord(data) {
  await loadScript('https://unpkg.com/docx@8.5.0/build/index.umd.js');
  const docx = window.docx;
  const { Document, Packer, Paragraph, HeadingLevel } = docx;
  const children = [
    new Paragraph({ text: data.title || 'Untitled document', heading: HeadingLevel.TITLE, spacing: { after: 200 } })
  ];
  (data.sections || []).forEach(s => {
    children.push(new Paragraph({ text: s.heading || '', heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } }));
    children.push(...buildDocxParagraphsFromBody(s.body, docx));
  });
  const doc = new Document({
    styles: {
      default: {
        title: { run: { color: '1A1A1A', bold: true, size: 40 } },
        heading1: { run: { color: '573AFC', bold: true, size: 26 } },
        heading2: { run: { color: '1A1A1A', bold: true, size: 22 } }
      }
    },
    sections: [{ children }]
  });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, sanitize(data.title) + '.docx');
}

// ---- PDF (plain, professional style) ----
async function downloadPdf(data) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 56;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - marginX * 2;
  const pageBottom = pageHeight - 64;
  const ink = [26, 26, 26];
  const accent = [87, 58, 252]; // ThunderStudy indigo
  let pageNum = 1;

  function footer() {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(sanitizeForPdf(`${data.title || 'Document'} · Page ${pageNum}`), pageWidth / 2, pageHeight - 32, { align: 'center' });
  }
  function newPage() {
    doc.addPage();
    pageNum += 1;
    footer();
    return 64;
  }

  const titleFit = fitHeading(doc, data.title || 'Untitled document', maxWidth, { fontFamily: 'helvetica', style: 'bold', maxSize: 22, minSize: 15, maxLines: 2 });
  doc.setTextColor(ink[0], ink[1], ink[2]);
  titleFit.lines.forEach((line, i) => doc.text(line, marginX, 60 + i * (titleFit.size + 4)));
  const titleBottom = 60 + titleFit.lines.length * (titleFit.size + 4) + 8;
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(1.5);
  doc.line(marginX, titleBottom, pageWidth - marginX, titleBottom);
  footer();
  let y = titleBottom + 28;

  try {
    (data.sections || []).forEach(s => {
      const headingFit = fitHeading(doc, s.heading || '', maxWidth, { fontFamily: 'helvetica', style: 'bold', maxSize: 14, minSize: 11, maxLines: 2 });
      if (y + headingFit.lines.length * (headingFit.size + 3) > pageBottom) y = newPage();
      doc.setTextColor(accent[0], accent[1], accent[2]);
      headingFit.lines.forEach((line, i) => doc.text(line, marginX, y + i * (headingFit.size + 3)));
      y += headingFit.lines.length * (headingFit.size + 3) + 8;

      y = drawRichBody(s.body, {
        doc, x: marginX, maxWidth, y, pageBottom,
        fontFamily: 'helvetica', size: 11, lineHeight: 15,
        color: ink, headingColor: accent, baseItalic: false,
        pageBreak: () => newPage()
      });
      y += 14;
    });
  } catch (e) {
    if (e !== PAGE_LIMIT_SIGNAL) throw e;
  }

  doc.save(sanitize(data.title) + '.pdf');
}

async function downloadPptx(data) {
  await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js');
  const pptx = new window.PptxGenJS();
  (data.slides || []).forEach(s => {
    const slide = pptx.addSlide();
    slide.addText(s.title, { x: 0.5, y: 0.4, w: 9, fontSize: 26, bold: true, color: '573AFC' });
    slide.addText(s.bullets.map(b => ({ text: b, options: { bullet: true, breakLine: true } })), { x: 0.5, y: 1.3, w: 9, fontSize: 16 });
  });
  await pptx.writeFile({ fileName: sanitize(data.title) + '.pptx' });
}

async function downloadExcel(data) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  const ws = window.XLSX.utils.aoa_to_sheet([data.table.headers, ...data.table.rows]);
  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  window.XLSX.writeFile(wb, sanitize(data.title) + '.xlsx');
}

// Shared by both the main generator's "MD" tab and the Text-to-PDF section's
// Markdown output.
function downloadMarkdown(data) {
  let md = `# ${data.title || 'Untitled document'}\n\n`;
  (data.sections || []).forEach(s => {
    md += `## ${s.heading}\n\n${s.body}\n\n`;
  });
  const blob = new Blob([md], { type: 'text/markdown' });
  triggerDownload(blob, sanitize(data.title) + '.md');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function sanitize(name) {
  return (name || 'document').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60);
}

document.getElementById('downloadBtn').addEventListener('click', async () => {
  if (!lastResult) return;
  const { data, format } = lastResult;
  const btn = document.getElementById('downloadBtn');
  btn.disabled = true;
  try {
    if (format === 'word') await downloadWord(data);
    else if (format === 'pdf') await downloadPdf(data);
    else if (format === 'ppt') await downloadPptx(data);
    else if (format === 'excel') await downloadExcel(data);
    else if (format === 'md') downloadMarkdown(data);
  } catch (err) {
    alert('Could not generate the file. Please try again.');
    console.error(err);
  }
  btn.disabled = false;
});

/* ===================== Text to PDF (themed) ===================== */

// Visual themes, loosely modeled on: a botanical cafe menu, a formal business
// proposal, and a set of academic study notes. Colors are RGB arrays for jsPDF.
const PDF_THEMES = {
  menu: {
    name: 'Botanical Menu', swatch: '#3B5D3A',
    desc: 'Warm and elegant — menus, invites, brand one-pagers.',
    bg: [251, 246, 238], ink: [43, 35, 25], accent: [59, 93, 58],
    titleFont: 'times', bodyFont: 'times', bodyStyle: 'italic',
    headingCase: 'upper', divider: true, numbered: false
  },
  proposal: {
    name: 'Business Proposal', swatch: '#1F2937',
    desc: 'Formal and structured — reports, proposals, cover pages.',
    bg: [255, 255, 255], ink: [31, 41, 55], accent: [31, 41, 55],
    titleFont: 'helvetica', bodyFont: 'helvetica', bodyStyle: 'normal',
    headingCase: 'upper', divider: false, numbered: false,
    headerBand: true, confidential: true
  },
  notes: {
    name: 'Study Notes', swatch: '#573AFC',
    desc: 'Clean academic layout — notes, revision guides, summaries.',
    bg: [255, 255, 255], ink: [26, 26, 26], accent: [87, 58, 252],
    titleFont: 'helvetica', bodyFont: 'helvetica', bodyStyle: 'normal',
    headingCase: 'none', divider: true, numbered: true
  }
};

let selectedTheme = 'menu';
let selectedMode = 'same';
let selectedOutput = 'pdf';

const themeGridEl = document.getElementById('themeGrid');
Object.entries(PDF_THEMES).forEach(([id, t]) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'theme-card' + (id === selectedTheme ? ' selected' : '');
  card.dataset.theme = id;
  card.innerHTML = `<div class="swatch" style="background:${t.swatch}"></div><h4>${t.name}</h4><p>${t.desc}</p>`;
  themeGridEl.appendChild(card);
});
themeGridEl.addEventListener('click', (e) => {
  const card = e.target.closest('.theme-card');
  if (!card) return;
  selectedTheme = card.dataset.theme;
  themeGridEl.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('selected', c === card));
});

document.getElementById('outputToggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.mode-btn');
  if (!btn) return;
  selectedOutput = btn.dataset.output;
  document.querySelectorAll('#outputToggle .mode-btn').forEach(b => b.classList.toggle('active', b === btn));
  themeGridEl.classList.toggle('hidden', selectedOutput === 'md');
  document.getElementById('ttpdfBtnLabel').textContent = selectedOutput === 'md' ? 'Create markdown file' : 'Create themed PDF';
});

document.getElementById('modeToggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.mode-btn');
  if (!btn) return;
  selectedMode = btn.dataset.mode;
  document.querySelectorAll('#modeToggle .mode-btn').forEach(b => b.classList.toggle('active', b === btn));
});

// ---- Usage limits: 3 free PDFs/day, 5 pages/PDF, unlocked by promo code ----
const DAILY_LIMIT = 3;
const PAGE_LIMIT = 5;
const PROMO_HASH = '1783212e17487e9003e02f75c5d911d39bffa3f550143a01aeb42c077c6b8a78'; // sha256 of the promo code, never stored in plain text

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
function getUsage() {
  let raw;
  try { raw = JSON.parse(localStorage.getItem('tdocs_usage') || 'null'); } catch (e) { raw = null; }
  if (!raw || raw.date !== todayStr()) return { date: todayStr(), count: 0 };
  return raw;
}
function bumpUsage() {
  const u = getUsage();
  u.count += 1;
  localStorage.setItem('tdocs_usage', JSON.stringify(u));
  return u;
}
function isUnlocked() { return localStorage.getItem('tdocs_unlocked') === '1'; }
function setUnlocked() { localStorage.setItem('tdocs_unlocked', '1'); }

function updateUsageLabel() {
  const targets = ['usageLabel', 'usageLabelMain', 'navUsageBadge']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (isUnlocked()) {
    targets.forEach(el => {
      el.textContent = 'Unlimited unlocked';
      el.classList.add('unlocked');
    });
    return;
  }
  const u = getUsage();
  const left = Math.max(0, DAILY_LIMIT - u.count);
  const text = `${left} free generation${left === 1 ? '' : 's'} left today · ${PAGE_LIMIT} pages max`;
  targets.forEach(el => {
    el.textContent = text;
    el.classList.remove('unlocked');
  });
}
updateUsageLabel();

async function verifyPromoCode(code) {
  const normalized = (code || '').trim().toLowerCase();
  if (!normalized || !window.crypto || !window.crypto.subtle) return false;
  try {
    const enc = new TextEncoder().encode(normalized);
    const digestBuf = await window.crypto.subtle.digest('SHA-256', enc);
    const hex = Array.from(new Uint8Array(digestBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex === PROMO_HASH;
  } catch (e) {
    return false;
  }
}

let pendingGeneration = null;
function openPromoModal(reasonText) {
  document.getElementById('promoReason').textContent = reasonText;
  document.getElementById('promoError').classList.add('hidden');
  document.getElementById('promoCodeInput').value = '';
  document.getElementById('promoModal').classList.remove('hidden');
  document.getElementById('promoCodeInput').focus();
}
function closePromoModal() {
  document.getElementById('promoModal').classList.add('hidden');
  pendingGeneration = null;
}
document.getElementById('promoClose').addEventListener('click', closePromoModal);
document.getElementById('promoModal').addEventListener('click', (e) => {
  if (e.target.id === 'promoModal') closePromoModal();
});
document.getElementById('promoUnlockBtn').addEventListener('click', async () => {
  const code = document.getElementById('promoCodeInput').value;
  const btn = document.getElementById('promoUnlockBtn');
  btn.disabled = true; btn.textContent = 'Checking…';
  const ok = await verifyPromoCode(code);
  btn.disabled = false; btn.textContent = 'Unlock';
  if (ok) {
    setUnlocked();
    updateUsageLabel();
    document.getElementById('promoModal').classList.add('hidden');
    const action = pendingGeneration;
    pendingGeneration = null;
    if (action) action();
  } else {
    document.getElementById('promoError').classList.remove('hidden');
  }
});

// ---- "Keep as-is" mode: lightweight markdown-lite parser, no AI call ----
function parseLite(rawText) {
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  let title = null;
  const sections = [];
  let currentHeading = null;
  let currentBody = [];

  function flush() {
    if (currentHeading !== null || currentBody.length) {
      sections.push({ heading: currentHeading || 'Notes', body: currentBody.join(' ').trim() });
    }
    currentBody = [];
  }

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('# ') && !title) { title = trimmed.replace(/^#\s+/, ''); return; }
    if (trimmed.startsWith('## ')) { flush(); currentHeading = trimmed.replace(/^##\s+/, ''); return; }
    currentBody.push(trimmed);
  });
  flush();

  const cleanSections = sections
    .map(s => ({ heading: s.heading, body: s.body.replace(/\s+/g, ' ').trim() }))
    .filter(s => s.body);

  if (!cleanSections.length) cleanSections.push({ heading: 'Notes', body: rawText.trim() });
  return { title: title || cleanSections[0].body.slice(0, 60) || 'Untitled document', sections: cleanSections };
}

// ---- "Improve with AI" mode ----
function demoImprove(text) {
  const parsed = parseLite(text);
  return {
    title: parsed.title,
    sections: parsed.sections.map(s => ({
      heading: s.heading,
      body: s.body + ' (Demo mode — connect an API key in api/generate.js for real AI improvements and notes.)'
    }))
  };
}

function estimatePages(data) {
  const totalChars = (data.sections || []).reduce((sum, s) => sum + (s.heading || '').length + (s.body || '').length, 0);
  return Math.max(1, Math.ceil(totalChars / 1700));
}

// ---- Themed jsPDF renderer ----
async function renderThemedPdf(data, themeId, maxPages) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  const { jsPDF } = window.jspdf;
  const theme = PDF_THEMES[themeId];
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const marginX = 56;
  const maxWidth = W - marginX * 2;
  const pageBottom = H - 70;
  let pagesUsed = 0;
  let truncated = false;

  function paintBackground() {
    doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
    doc.rect(0, 0, W, H, 'F');
  }
  function paintFooter() {
    doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
    doc.text(sanitizeForPdf(`${data.title || 'Document'} · Page ${pagesUsed}`), W / 2, H - 30, { align: 'center' });
  }
  // Starts a new page and returns the y position content should resume at.
  function startPage(isFirst) {
    if (pagesUsed > 0) doc.addPage();
    pagesUsed += 1;
    paintBackground();
    let y;
    if (isFirst) {
      if (theme.headerBand) {
        const titleFit = fitHeading(doc, data.title || 'Untitled document', maxWidth - 20, { fontFamily: theme.titleFont, style: 'bold', maxSize: 22, minSize: 14, maxLines: 2 });
        const bandHeight = 46 + titleFit.lines.length * (titleFit.size + 4) + (theme.confidential ? 22 : 4);
        doc.setFillColor(theme.ink[0], theme.ink[1], theme.ink[2]);
        doc.rect(0, 0, W, bandHeight, 'F');
        doc.setTextColor(255, 255, 255);
        titleFit.lines.forEach((line, i) => doc.text(line, marginX, 40 + i * (titleFit.size + 4)));
        if (theme.confidential) {
          doc.setFont(theme.titleFont, 'normal'); doc.setFontSize(9);
          doc.text('STRICTLY PRIVATE & CONFIDENTIAL', marginX, bandHeight - 12);
        }
        y = bandHeight + 34;
      } else {
        const maxSize = themeId === 'menu' ? 26 : 22;
        const titleFit = fitHeading(doc, data.title || 'Untitled document', maxWidth, { fontFamily: theme.titleFont, style: 'bold', maxSize, minSize: 15, maxLines: 2 });
        doc.setTextColor(theme.ink[0], theme.ink[1], theme.ink[2]);
        const displayLines = theme.headingCase === 'upper' ? titleFit.lines.map(l => l.toUpperCase()) : titleFit.lines;
        const startY = 58;
        displayLines.forEach((line, i) => doc.text(line, W / 2, startY + i * (titleFit.size + 4), { align: 'center' }));
        const bottomY = startY + displayLines.length * (titleFit.size + 4);
        if (theme.divider) {
          doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
          doc.setLineWidth(1);
          doc.line(marginX, bottomY + 8, W - marginX, bottomY + 8);
        }
        y = bottomY + 32;
      }
    } else {
      y = 56;
    }
    paintFooter();
    return y;
  }

  let y = startPage(true);
  const sections = data.sections || [];

  try {
    sections.forEach((s, idx) => {
      let headingText = theme.numbered ? `${idx + 1}. ${s.heading || ''}` : (s.heading || '');
      if (theme.headingCase === 'upper') headingText = headingText.toUpperCase();
      const headingFit = fitHeading(doc, headingText, maxWidth, { fontFamily: theme.titleFont, style: 'bold', maxSize: 13, minSize: 10, maxLines: 2 });

      if (y + headingFit.lines.length * (headingFit.size + 3) > pageBottom) {
        if (pagesUsed >= maxPages) { truncated = true; throw PAGE_LIMIT_SIGNAL; }
        y = startPage(false);
      }
      doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
      headingFit.lines.forEach((line, i) => doc.text(line, marginX, y + i * (headingFit.size + 3)));
      y += headingFit.lines.length * (headingFit.size + 3) + 10;

      y = drawRichBody(s.body, {
        doc, x: marginX, maxWidth, y, pageBottom,
        fontFamily: theme.bodyFont, size: 11, lineHeight: 15,
        color: theme.ink, headingColor: theme.accent,
        baseItalic: theme.bodyStyle === 'italic',
        pageBreak: () => {
          if (pagesUsed >= maxPages) { truncated = true; return null; }
          return startPage(false);
        }
      });
      y += 16;
    });
  } catch (e) {
    if (e !== PAGE_LIMIT_SIGNAL) throw e;
  }

  if (truncated) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
    doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
    doc.text(sanitizeForPdf('Content continues — unlock unlimited pages for the full document.'), marginX, H - 46);
  }

  doc.save(sanitize(data.title) + '-' + themeId + '.pdf');
}

// ---- Main Text-to-PDF button ----
document.getElementById('ttpdfBtn').addEventListener('click', async () => {
  const rawText = document.getElementById('ttpdfInput').value.trim();
  if (!rawText) { document.getElementById('ttpdfInput').focus(); return; }

  const run = async () => {
    const btn = document.getElementById('ttpdfBtn');
    const originalHTML = btn.innerHTML;

    // Check the daily-generation limit before doing any work or API calls.
    const unlockedAtStart = isUnlocked();
    if (!unlockedAtStart && getUsage().count >= DAILY_LIMIT) {
      pendingGeneration = run;
      openPromoModal(`You've used today's ${DAILY_LIMIT} free PDFs on this device.`);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating…';

    let data;
    if (selectedMode === 'improve') {
      try {
        const raw = await callAPIStreaming(rawText, 'improve', (partial) => {
          btn.textContent = `Writing… (${partial.length} chars)`;
        });
        data = extractJson(raw);
      } catch (e) {
        data = demoImprove(rawText);
      }
    } else {
      data = parseLite(rawText);
    }

    if (selectedOutput === 'md') {
      try {
        downloadMarkdown(data);
        if (!unlockedAtStart) { bumpUsage(); updateUsageLabel(); }
      } catch (err) {
        console.error(err);
        alert('Could not generate the file. Please try again.');
      }
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      return;
    }

    const estimatedPages = estimatePages(data);
    if (!unlockedAtStart && estimatedPages > PAGE_LIMIT) {
      btn.disabled = false; btn.innerHTML = originalHTML;
      pendingGeneration = run;
      openPromoModal(`This document runs longer than the free ${PAGE_LIMIT}-page limit.`);
      return;
    }

    try {
      await renderThemedPdf(data, selectedTheme, unlockedAtStart ? 999 : PAGE_LIMIT);
      if (!unlockedAtStart) { bumpUsage(); updateUsageLabel(); }
    } catch (err) {
      console.error(err);
      alert('Could not generate the PDF. Please try again.');
    }
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  };

  await run();
});
