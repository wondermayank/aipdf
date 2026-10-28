<div align="center">

# ⚡ ThunderDocs — AI Document Generator

**Type a topic. Get a ready-to-download PDF, Word, Slides, Sheet or Markdown file — in seconds.**

[![Live](https://img.shields.io/badge/Live-aipdf.wondermayank.indevs.in-573AFC?style=for-the-badge)](https://aipdf.wondermayank.indevs.in/)
[![Powered by](https://img.shields.io/badge/Powered%20by-Tiny%20model-9A7AFB?style=for-the-badge)](https://tiny.wondermayank.in)
![Signup](https://img.shields.io/badge/Signup-Not%20needed-22c55e?style=for-the-badge)

[🌐 Open ThunderDocs](https://aipdf.wondermayank.indevs.in/) · [🤖 Meet Tiny](https://tiny.wondermayank.in) · [🧑‍💻 About the creator](#-about-the-creator)

</div>

---

## 🚀 What is ThunderDocs?

ThunderDocs turns a one-line prompt into a finished document. Pick a format, describe what you need — a resume, cover letter, essay, study notes, proposal, invoice or pitch deck — and download it instantly. It also turns pasted text into a beautifully themed PDF.

Built for students, freelancers and small businesses who need clean documents **fast, free, and without creating an account**.

🔗 **Live:** https://aipdf.wondermayank.indevs.in/

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| 🧠 | **Powered by the Tiny model** | Fast, friendly AI tuned for short structured documents |
| ⚡ | **No delay** | Output streams live as it is written — no staring at a spinner |
| 📄 | **5 export formats** | Word (.docx), PDF, Slides (.pptx), Sheet (.xlsx), Markdown (.md) |
| 🎨 | **Text → themed PDF** | Botanical Menu, Business Proposal, Study Notes themes |
| ✍️ | **Improve with AI** | Fixes grammar and clarity of your own text, then typesets it |
| 🔁 | **Regenerate** | Tweak the prompt and run again without retyping |
| 🧩 | **Rich formatting** | Bold, italic, bullets, numbered lists and sub-headings in PDF and Word |
| 🔒 | **Private by design** | Files are built in your browser — nothing is stored on a server |
| 🆓 | **Free daily use** | 3 free generations per day, no signup |
| 📱 | **Responsive** | Works on phone, tablet and desktop |
| 🔍 | **10 landing pages** | Resume, cover letter, essay, notes, proposal, pitch deck, invoice, agenda, resignation letter, README |

---

## ⚡ Why It Feels Instant

- **Streaming output** — text appears live as the model writes it
- **Client-side file creation** — no upload, no waiting for a server to build your file
- **Lazy-loaded libraries** — each export library loads only when you first use that format
- **One shared app** — every page uses the same `style.css` and `app.js`
- **Graceful fallback** — if the AI is unreachable, a demo document is built locally so the tool never breaks

---

## 🧭 How to Use

1. Open https://aipdf.wondermayank.indevs.in/
2. Choose a format (Word, PDF, Slides, Sheet or Markdown)
3. Describe what you need, e.g. *"Cover letter for a marketing internship"*
4. Press **Generate** and watch it stream in
5. Download — or **Regenerate** to refine

**Text to PDF:** paste your text, choose a theme and either **Keep text as-is** or **Improve with AI**, then export as a themed PDF or plain Markdown.

---

## 🧑‍💻 About the Creator

Hi, I'm **Thunder** (online as **Wondermayank**) — a student developer from India.

I build free educational web platforms, tools and Telegram bots for students under the **ThunderStudy** and **Wondermayank** brands — from CBSE / CUET / competitive-exam prep to AI study helpers. I love UI design, especially the soft **Thunder Clay** look, and I focus on tools that are free, fast and made for Indian students.

**Tiny** is the friendly AI model behind my tools. Meet it at [tiny.wondermayank.in](https://tiny.wondermayank.in).

- 🌐 Portfolio: [wondermayank.github.io](https://wondermayank.github.io)
- 📚 ThunderStudy: [commercesehoga.github.io](https://commercesehoga.github.io)
- 🤖 Tiny AI: [tiny.wondermayank.in](https://tiny.wondermayank.in)
- 🐙 GitHub: [@wondermayank](https://github.com/wondermayank)

---

## 🗂️ Project Structure

```
thunderdocs/
├── index.html                        main page: generator, Text-to-PDF, features, FAQ
├── resume-generator.html             ┐
├── cover-letter-generator.html       │
├── essay-generator.html              │
├── study-notes-generator.html        │  SEO landing pages — same app,
├── business-proposal-generator.html  │  unique title / meta / H1 + pre-filled example
├── pitch-deck-generator.html         │
├── invoice-generator.html            │
├── meeting-agenda-generator.html     │
├── resignation-letter-generator.html │
├── readme-generator.html             ┘
├── generate_seo_pages.py             regenerates all landing pages from index.html
├── assets/
│   ├── style.css                     all CSS, shared by every page
│   └── app.js                        all JS, shared by every page
├── api/
│   └── generate.js                   serverless function: streams model output, keeps the key hidden
├── favicon.svg
├── sitemap.xml
├── robots.txt
└── package.json
```

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| AI | Tiny model, via a serverless proxy (`api/generate.js`) |
| Hosting | Vercel |
| Domain | `aipdf.wondermayank.indevs.in` (DNS on Cloudflare) |
| Word | `docx` |
| PDF | `jsPDF` |
| Slides | `PptxGenJS` |
| Sheet | `SheetJS` |

---

## ▶️ Run Locally (no setup)

Open `index.html`, or push the folder to GitHub Pages. With no backend, **Generate** falls back to **demo mode** (a placeholder document with a "Demo content" badge) so you can test every download format right away.

---

## 🚢 Deploy

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "ThunderDocs"
gh repo create wondermayank/thunderdocs --public --source=. --push
```

### 2. Import into Vercel
- vercel.com → **Add New → Project** → import `thunderdocs`
- Framework preset: **Other** (zero-config, no build step)
- Deploy

### 3. Add the environment variable
- Project → **Settings → Environment Variables**
- Add your model provider key (the current `api/generate.js` reads `GROQ_API_KEY`) for Production, Preview and Development
- **Redeploy** so the function picks it up

### 4. Connect the domain
- Vercel → **Settings → Domains** → add `aipdf.wondermayank.indevs.in` and note the CNAME target it shows
- Cloudflare → **DNS → Add record** → `CNAME`, name `aipdf.wondermayank`, target = Vercel's value, proxy status **DNS only** (grey cloud) so Vercel can issue SSL
- Wait for "Valid Configuration" in Vercel

### 5. Verify
Open the live site, generate something, and confirm the "Demo content" badge is gone — that means the AI is answering for real.

### Changing the model
Edit the `MODELS` array in `api/generate.js`. The first entry is tried first, the next is the automatic fallback. If you switch provider, keep the streaming-forward logic (or simplify it and update `callAPIStreaming()` in `assets/app.js` to match).

---

## 📤 How Exports Work

All five formats run **in the visitor's browser** — no server-side file generation and nothing stored.

| Format | Library | Trigger |
|---|---|---|
| Word (.docx) | `docx` | `Packer.toBlob()` |
| PDF | `jsPDF` | `doc.save()` |
| Slides (.pptx) | `PptxGenJS` | `pptx.writeFile()` |
| Sheet (.xlsx) | `SheetJS` | `XLSX.writeFile()` |
| Markdown (.md) | none | plain string → `Blob` |

### Rich text
Body text understands `**bold**`, `*italic*`, `- ` bullets, `1. ` numbered lines and `##` / `###` sub-headings. The on-screen preview renders the same rules, so what you see is what you download.

### Streaming
`api/generate.js` streams plain text to the browser as it is produced. `callAPIStreaming()` in `assets/app.js` reads it live, shows it in the preview box, then parses the final JSON with `extractJson()`. Any fetch or parse failure drops back to demo mode.

### Fixed bugs worth knowing
- **Garbled PDF text:** the model wrote compound words with a non-breaking hyphen (U+2011), which jsPDF's built-in fonts can't encode — it corrupted the whole string. `sanitizeForPdf()` now normalises such characters before drawing.
- **Words glued together when copying from PDF:** each word is drawn separately, so a real trailing space is now kept on every word.
- **Long titles overflowing the page:** titles and headings now wrap (and shrink slightly if needed).
- **Word export failing:** the correct browser bundle is `docx@8.5.0/build/index.umd.js`.

---

## 🎨 Text → PDF Themes

| Theme | Look |
|---|---|
| Botanical Menu | cream background, serif type, warm green accent |
| Business Proposal | dark header band, "CONFIDENTIAL" tag, formal type |
| Study Notes | numbered sections, indigo accent, academic layout |

Output can also be plain **Markdown (.md)**, which skips the theme.

---

## 🔢 Free Limits

- **3 free generations per day**, shared by the main generator and Text-to-PDF
- **5 pages** max per Word / PDF / MD document and **5 slides** max per deck
- Limits are tracked in the visitor's browser (`localStorage`), so they are per-device and a soft fair-use limit, not hard enforcement
- Need more? Get in touch via [wondermayank.in/contact](https://wondermayank.in/contact)

---

## 🔍 SEO Landing Pages

Ten pages share one generator engine. Each is built from `index.html` with its own `<title>`, meta description, canonical URL, H1 and a pre-fill script:

```html
<script>window.THUNDERDOCS_PREFILL = {"format": "word", "prompt": "..."};</script>
```

**Add a page:** add an entry to `PAGES` in `generate_seo_pages.py`, run `python3 generate_seo_pages.py`, then add the URL to `sitemap.xml`.

**Next ideas:** lesson plan, recommendation letter, newsletter, product description, case study and syllabus generators.

---

## ❓ FAQ

**Is it free?** Yes — 3 generations per day, no signup.

**Is my text stored?** No. Files are built in your browser and nothing is saved on a server.

**Which AI does it use?** The Tiny model.

**Why is it so fast?** Output streams as it is written, and file creation happens locally.

**Which formats can I download?** Word, PDF, Slides, Sheet and Markdown.

---

## 🗺️ Roadmap

- [ ] More landing pages (lesson plan, newsletter, case study…)
- [ ] More PDF themes
- [ ] Hindi-language documents
- [ ] Server-side usage limits

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b my-feature`
3. Commit and push
4. Open a Pull Request

---

<div align="center">

Made with ⚡ by **Thunder** ([@wondermayank](https://github.com/wondermayank)) · Powered by the **Tiny** model

If ThunderDocs helped you, drop a ⭐

</div>
