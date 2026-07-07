# ThunderDocs — AI Document Generator

A functional equivalent of aidocmaker.com, built in your ThunderStudy design system
(indigo #573AFC, Inter, flat/hairline components), with real client-side file generation.

## What's here

```
thunderdocs/
├── index.html                        the master page — nav, generator, Text-to-PDF, features, FAQ, footer
├── resume-generator.html             ┐
├── cover-letter-generator.html       │
├── essay-generator.html              │
├── study-notes-generator.html        │  SEO landing pages — same app, unique
├── business-proposal-generator.html  │  title/meta/H1 + a pre-filled example
├── pitch-deck-generator.html         │  (see "SEO landing pages" below)
├── invoice-generator.html            │
├── meeting-agenda-generator.html     │
├── resignation-letter-generator.html │
├── readme-generator.html             ┘
├── generate_seo_pages.py             regenerates all the pages above from index.html
├── assets/
│   ├── style.css                     all CSS, shared by every page
│   └── app.js                        all JS, shared by every page
├── api/
│   └── generate.js                   Vercel function: streams Groq output, hides your API key
├── favicon.svg
├── sitemap.xml
├── robots.txt
└── package.json
```

Every HTML file shares the same `assets/style.css` and `assets/app.js` — there's
one copy of the actual app logic, not eleven. This matters once you start
adding more landing pages: you're only ever duplicating a page skeleton with
different SEO copy, never the generator itself.

## Run it right now (no setup)

Just open `index.html` or push the whole folder to GitHub Pages. There's no
backend on GitHub Pages, so "Generate" automatically falls back to **demo
mode** — it builds a plausible placeholder document locally so you can test
the whole Word/PDF/PPT/Excel/MD download pipeline immediately. You'll see a
small "Demo content" badge on results in this mode.

## Deploy: Groq + Vercel + aipdf.wondermayank.indevs.in

### 1. Get a Groq key
Free at https://console.groq.com → API Keys → Create key. `api/generate.js`
is already wired to Groq's `openai/gpt-oss-120b` model (their current
recommended model — Groq retired `llama-3.3-70b-versatile` in June 2026).

### 2. Push this folder to GitHub
```
git init
git add .
git commit -m "ThunderDocs"
gh repo create wondermayank/thunderdocs --public --source=. --push
```
(or push manually to a new repo under github.com/wondermayank, same as your
other projects.)

### 3. Import into Vercel
- vercel.com → **Add New → Project** → import the `thunderdocs` repo.
- Framework preset: leave as **Other** — this is zero-config (static HTML
  pages + `assets/` + one `/api/generate.js` serverless function), no build
  step needed. All eleven `.html` files, `sitemap.xml`, `robots.txt` and
  `favicon.svg` get served automatically since they're just static files.
- Deploy.

### 4. Add the environment variable
- Project → **Settings → Environment Variables**
- Add `GROQ_API_KEY` = *(your key from step 1)*, applied to Production,
  Preview, and Development.
- **Redeploy** (Deployments tab → ⋯ → Redeploy) so the function picks it up.

### 5. Point aipdf.wondermayank.indevs.in at it
- In Vercel: Project → **Settings → Domains** → add `aipdf.wondermayank.indevs.in`
  → it'll show you a CNAME target (usually `cname.vercel-dns.com`, but use
  whatever value Vercel displays for your project).
- In Cloudflare, on the zone that manages `indevs.in`: **DNS → Add record**
  → Type `CNAME`, Name `aipdf.wondermayank` (or just `aipdf` if
  `wondermayank.indevs.in` is its own zone in your setup), Target = the value
  Vercel gave you, Proxy status = **DNS only** (grey cloud) so Vercel can issue
  the SSL certificate. You can switch it to proxied afterward if you want
  Cloudflare in front of it.
- Back in Vercel, the domain should flip to "Valid Configuration" within a
  few minutes once DNS propagates.

### 6. Verify
Visit `https://aipdf.wondermayank.indevs.in`, generate something, and confirm
the "Demo content" badge is gone — that means it's hitting Groq for real.

### Using a different provider later
Want to swap in Anthropic or OpenAI instead of Groq? Change the `fetch` URL,
headers, and `model` field in `api/generate.js`. One thing to preserve: the
function now **streams plain text back to the client** rather than returning
JSON directly (see "Streaming" below) — if you switch providers, keep the
streaming-forward logic, or simplify it back to a single JSON response and
update `callAPIStreaming()` in `assets/app.js` to match.

### A note on the model

`openai/gpt-oss-120b` is a reasoning model, which behaves slightly differently
from the plain chat model this was originally built against:
- `include_reasoning: false` and `reasoning_effort: 'low'` are set in
  `api/generate.js` to keep its internal reasoning out of the response and
  keep it fast/cheap for this kind of short structured-output task.
- The frontend extracts the outermost `{...}` block from the response before
  parsing (`extractJson()` in `assets/app.js`), in case any stray text slips
  in around the JSON.
- Groq updates its model lineup fairly often — if this model is ever retired
  too, check https://console.groq.com/docs/models and swap the `model` field.

### Streaming

`api/generate.js` calls Groq with `stream: true`, reads its
OpenAI-compatible SSE response, and forwards just the text deltas to the
browser as plain text (`res.write()` per chunk, using Vercel's supported
Node.js response streaming). The frontend (`callAPIStreaming()` in
`assets/app.js`) reads that stream progressively and shows it live:
- On the main generator, in the dark `#streamPreview` box under the Generate
  button.
- In Text-to-PDF's "Improve with AI" mode, as a running character count on
  the button itself (lighter treatment since that tool has no dedicated
  preview area).

Once the stream ends, the accumulated text is parsed with `extractJson()`
same as before. **Caveat:** this was written against Groq's documented SSE
format but couldn't be tested against a live key from the sandbox this was
built in — if it doesn't behave once deployed, check the browser console and
Vercel's function logs. Every code path still falls back to demo mode on any
fetch/parse failure, so a streaming bug degrades gracefully rather than
breaking the tool.

### Regenerate

The main generator's result panel has a **Regenerate** button next to
Download. It re-reads whatever's currently in the prompt box and runs
generation again — so you can also tweak the prompt slightly after seeing a
result and regenerate, without retyping from scratch. Counts against the
same daily limit as a normal generation.

## Rich text in PDF and Word (bold, italic, bullets, sub-headings)

**The actual cause of the garbled/oversized text, found and fixed:** the
cover letter PDF you sent showed words like "hands‑on" and "market‑entry"
rendering as corrupted, oddly-spaced text. Traced it all the way down —
Groq's model writes compound words using a **non-breaking hyphen** (U+2011,
not the plain "-" key on a keyboard). jsPDF's built-in fonts (Helvetica etc.)
only support single-byte WinAnsi text; when a string contains a character
that font's encoding table doesn't recognize, jsPDF silently re-encodes the
*entire string* as 2-byte UTF-16 — which those fonts fundamentally can't
render, so every character comes out interleaved with garbage bytes. That's
what "text size not fixed, going out of the PDF" actually was.

Confirmed by pulling jsPDF's own source and checking its encoding table
directly, then reproducing the exact corruption locally with the same
character. Fixed with a `sanitizeForPdf()` pass (in `assets/app.js`) that
runs on every string before it reaches jsPDF — it normalizes non-breaking
hyphens and similar look-alike punctuation to plain ASCII, and as a
catch-all, swaps out anything else jsPDF can't safely encode. Verified with
an automated test that re-renders the exact cover letter content and
confirms zero corrupted text runs in the output PDF.

**Also fixed while in there:** the rich-text renderer draws each word as its
own separately-positioned string (needed to support mixed bold/italic runs
mid-sentence). That meant there was no literal space character between
words in the PDF's text stream — invisible on screen, but copy-pasting text
out of a generated PDF would run every word together. Fixed by keeping a
real trailing space on each word.

Both of PDF renderers now understand a small set of markdown conventions
inside body text: `**bold**`, `*italic*`, `- ` / `* ` bullet lines, `1. `
numbered lines, and `##` / `###` sub-headings. The result preview in the
main generator renders the same conventions to HTML (safely escaped first),
so what you see there matches what ends up in the downloaded file.

The API prompt (`api/generate.js`) now explicitly asks the model to use
`**bold**` for key terms and `- ` bullets where it helps readability, so
real (non-demo) generations should actually use this formatting.

**Also fixed earlier:** titles and section headings in both PDF renderers
used to be drawn without wrapping — a long title or heading would run off
the right edge of the page instead of wrapping to a second line. Both now
measure and wrap (shrinking the font size a little if needed) before drawing.

## How the five export formats work

All five run **client-side**, in the visitor's browser — no server-side file
generation, no storage, nothing to clean up:

| Format | Library (CDN, lazy-loaded) | Trigger |
|---|---|---|
| Word (.docx) | `docx` (unpkg) | `Packer.toBlob()` → download link |
| PDF | `jsPDF` (cdnjs) | `doc.save()` |
| Slides (.pptx) | `PptxGenJS` (jsdelivr) | `pptx.writeFile()` |
| Sheet (.xlsx) | `SheetJS/xlsx` (cdnjs) | `XLSX.writeFile()` |
| Markdown (.md) | none needed | built as a plain string, downloaded as a `Blob` |

Each library is only fetched the first time that format is downloaded, so the
initial page stays light — same performance approach you used on the portfolio
carousels.

> **Fixed bug:** Word generation was failing with "Could not generate the
> file" — the code was loading `docx@8.5.0/build/index.js`, which doesn't
> exist in that package (its browser bundle is actually `build/index.umd.js`).
> Confirmed by inspecting the published package directly; fixed in `assets/app.js`.

## New: Text to PDF or Markdown (themed)

A second, separate tool on the page (`#text-to-pdf`) turns pasted text into a
formatted PDF using one of three visual themes:

| Theme | Modeled on | Look |
|---|---|---|
| Botanical Menu | your Bean & Leaf menu PDF | cream background, serif type, warm green accent |
| Business Proposal | your Bean & Leaf proposal PDF | dark header band, "CONFIDENTIAL" tag, formal type |
| Study Notes | your Class 12 Economics notes | numbered sections, indigo accent, academic layout |

Two modes:
- **Keep text as-is** — no AI call. A small client-side parser splits your
  text into a title/sections (recognizes `# Title` and `## Heading` lines,
  otherwise just typesets the paragraphs) and renders it straight into the
  chosen theme.
- **Improve with AI** — sends your text to `/api/generate` (format: `improve`),
  which fixes grammar/clarity and adds notes, then renders the result the
  same way. Falls back to a labeled demo cleanup if no backend is deployed.

Also has an **Output** toggle: **Themed PDF** (as above) or **Markdown (.md)**
— markdown skips the theme entirely and just downloads your title/sections as
a plain `.md` file.

### Limits & promo code (site-wide, shared)

The free-tier limit is now **one shared pool across the whole site** — the
main generator (Word/PDF/Slides/Sheet/MD) and the Text-to-PDF tool both draw
from the same counter, so it's 3 total free generations per day, not 3 each.

- **3 free generations per day**, tracked in the visitor's own browser
  (`localStorage`) — there's no account system, so this is per-device, not
  per-person. Someone can reset it by clearing site data or switching
  browsers; treat it as a soft/fair-use limit, not hard enforcement.
- **5 pages max** per Word/PDF/MD document, **5 slides max** per deck.
  Content beyond that is trimmed and a "free-tier limit reached" note is
  shown; the Excel/Sheet format isn't page-capped (the AI is already asked
  for a bounded 5–12 rows).
- The remaining-generations count is shown in three places that all stay in
  sync: a small badge in the **top nav bar** (hidden below ~560px to avoid
  crowding the icons there), next to the main **Generate** button, and next
  to the Text-to-PDF **Create** button.
- Promo code **`itsmepika`** removes both limits (unlimited generations,
  unlimited pages/slides) for that browser. The code isn't stored in plain
  text — the page only keeps a SHA-256 hash and compares against it — but
  since everything runs client-side, someone determined enough could still
  find it by reading the page's source and hashing guesses, or by directly
  setting the `tdocs_unlocked` localStorage key. That's an inherent limit of
  a no-backend gate; if you want it airtight later, this check would need to
  move server-side.
- When a limit is hit, a modal asks for the code and links to
  `wondermayank.in/contact` for anyone who needs one.

To change the code: replace `PROMO_HASH` in `assets/app.js` with the SHA-256
hex digest of your new code, e.g. in a terminal:
```
python3 -c "import hashlib; print(hashlib.sha256('yournewcode'.encode()).hexdigest())"
```

## SEO landing pages

aidocmaker.com's real strength for SEO/AEO is its dedicated landing pages —
one per document type, each with its own title/meta/H1 but pointing at the
same generator engine. Ten of those now exist here (resume, cover letter,
essay, study notes, business proposal, pitch deck, invoice, meeting agenda,
resignation letter, README), covering every one of the five output formats.

Each page is generated from `index.html` itself — same nav, same generator,
same footer — with only the `<title>`, meta description, canonical/og URLs,
hero H1 + lead paragraph, and a small pre-fill script swapped in:
```html
<script>window.THUNDERDOCS_PREFILL = {"format": "word", "prompt": "..."};</script>
```
`assets/app.js` checks for that on load, selects the right format tab, and
fills the prompt box — so visitors land ready to generate immediately.

**To add more pages:** open `generate_seo_pages.py`, add an entry to the
`PAGES` list (slug, format, example prompt, title, description, H1, lead),
then run:
```
python3 generate_seo_pages.py
```
This regenerates **every** page from the current `index.html`, so if you've
since edited the nav, footer, or anything else structural, all pages pick up
that change automatically. Add the new page's URL to `sitemap.xml` too.

Some strong candidates for the next batch, if you want to keep going:
lesson plan generator, recommendation letter generator, newsletter generator,
product description generator, case study generator, syllabus generator.

## Note on visual fidelity

This isn't a pixel-for-pixel clone of aidocmaker.com — that site is a
client-rendered SPA, and matching it exactly (exact spacing, fonts, animation
timing) requires live browser automation (screenshotting every state,
reading `getComputedStyle()` on every element) that isn't available from this
chat interface. That level of fidelity is realistic in **Claude Code Desktop**
with a browser MCP (Chrome/Playwright) connected, using the same
`clone-website` skill. What's built here matches the *mechanic* (prompt in,
real file out) and your actual brand system, and is ready to deploy today.
