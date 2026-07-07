#!/usr/bin/env python3
"""
generate_seo_pages.py

Generates SEO landing pages for ThunderDocs — one per document type, each
pointing at the exact same app (shared /assets/style.css + /assets/app.js),
differing only in <title>/meta/canonical, the hero H1 + lead paragraph, and
a small pre-fill script that opens the page with the right format tab
selected and an example prompt already typed in.

Usage:
    python3 generate_seo_pages.py

Re-run this any time you edit index.html's structure (nav/sections/footer) —
it always regenerates every page fresh from the current index.html, so the
master file stays the single source of truth. If you only change PAGES below,
you don't need to touch index.html at all.

Add a new page: add an entry to PAGES and re-run.
"""

import re
import os
import json

SITE_ROOT = os.path.dirname(os.path.abspath(__file__))
MASTER = os.path.join(SITE_ROOT, "index.html")
DOMAIN = "https://aipdf.wondermayank.indevs.in"

with open(MASTER, encoding="utf-8") as f:
    MASTER_HTML = f.read()

DEFAULT_TITLE = "ThunderDocs — Free AI Document, PDF, Slide & Sheet Generator"
DEFAULT_DESC = (
    "Describe what you need and ThunderDocs writes it for you — essays, resumes, "
    "reports, presentations and spreadsheets, downloadable as PDF, Word, PowerPoint "
    "or Excel in seconds."
)
DEFAULT_OG_TITLE = "ThunderDocs — Free AI Document Generator"
DEFAULT_OG_DESC = (
    "Turn one prompt into a finished document. Free AI generator for essays, "
    "resumes, reports, slides and spreadsheets."
)
DEFAULT_TW_DESC = "Turn one prompt into a finished document — PDF, Word, PowerPoint or Excel."
DEFAULT_H1 = "Turn one prompt into a finished document."
DEFAULT_LEAD = (
    "Describe what you need. ThunderDocs writes it, formats it, and hands you a "
    "real file — Word, PDF, PowerPoint or Excel — no sign-up required."
)

# Each page: slug (filename without .html), format tab to open on,
# example prompt to pre-fill, and SEO copy.
PAGES = [
    dict(
        slug="resume-generator",
        format="word",
        prompt="Write a resume for a marketing coordinator with 3 years of experience",
        title="Free AI Resume Generator — Download as Word | ThunderDocs",
        desc="Describe your role and experience and get a polished, ready-to-edit resume as a downloadable Word document — free, no sign-up.",
        h1="Turn a few sentences into a polished resume.",
        lead="Describe your role, experience and skills. ThunderDocs writes and formats a ready-to-edit resume you download straight to Word.",
    ),
    dict(
        slug="cover-letter-generator",
        format="word",
        prompt="Write a cover letter for a marketing internship at a fintech startup",
        title="Free AI Cover Letter Generator | ThunderDocs",
        desc="Generate a role-specific cover letter in seconds. Describe the job and your background, download a formatted Word document — free.",
        h1="A tailored cover letter in one prompt.",
        lead="Tell ThunderDocs the role and a bit about you. Get a properly structured cover letter, ready to download as Word.",
    ),
    dict(
        slug="essay-generator",
        format="word",
        prompt="Write a 5-paragraph essay on the causes of climate change",
        title="Free AI Essay Generator | ThunderDocs",
        desc="Turn any topic into a structured essay with an intro, body and conclusion — downloadable as Word, free and with no sign-up.",
        h1="Turn any topic into a structured essay.",
        lead="Describe your essay topic. ThunderDocs writes it with a clear intro, body and conclusion, ready to download as Word.",
    ),
    dict(
        slug="study-notes-generator",
        format="word",
        prompt="Create structured study notes on Newton's Laws of Motion for a CBSE Class 11 student",
        title="Free AI Study Notes Generator | ThunderDocs",
        desc="Turn any syllabus topic into organized, exam-ready study notes — free, downloadable as Word, great for CUET/SSC/Banking prep.",
        h1="Turn a topic into exam-ready study notes.",
        lead="Describe the topic and level. ThunderDocs structures it into clear, organized notes you can download and revise from.",
    ),
    dict(
        slug="business-proposal-generator",
        format="pdf",
        prompt="Write a project proposal for launching a campus recycling program",
        title="Free AI Business Proposal Generator | ThunderDocs",
        desc="Describe your idea and get a properly structured business proposal as a downloadable PDF — free, no sign-up required.",
        h1="A structured business proposal, from one prompt.",
        lead="Describe your idea, project or pitch. ThunderDocs drafts a properly structured proposal you download as a PDF.",
    ),
    dict(
        slug="pitch-deck-generator",
        format="ppt",
        prompt="Create a 6-slide pitch deck for a student-run tutoring startup",
        title="Free AI Pitch Deck Generator | ThunderDocs",
        desc="Describe your idea and get a slide-by-slide pitch deck outline, downloadable as PowerPoint — free, no sign-up.",
        h1="Your pitch deck, outlined in one prompt.",
        lead="Describe what you're pitching. ThunderDocs drafts a slide-by-slide outline you download straight to PowerPoint.",
    ),
    dict(
        slug="invoice-generator",
        format="excel",
        prompt="Create an invoice template with item, quantity, rate and total columns for a freelance design project",
        title="Free AI Invoice Generator | ThunderDocs",
        desc="Describe the line items and get a structured invoice table, downloadable as Excel — free, no sign-up required.",
        h1="A structured invoice, from one prompt.",
        lead="Describe the line items and client details. ThunderDocs builds a structured invoice table you download as Excel.",
    ),
    dict(
        slug="meeting-agenda-generator",
        format="word",
        prompt="Create a meeting agenda for a weekly team standup covering progress, blockers and next steps",
        title="Free AI Meeting Agenda Generator | ThunderDocs",
        desc="Describe the meeting and get a ready-made agenda, downloadable as Word — free, no sign-up required.",
        h1="A ready-made agenda, from one prompt.",
        lead="Describe the meeting's purpose. ThunderDocs drafts a clear agenda you download and share as Word.",
    ),
    dict(
        slug="resignation-letter-generator",
        format="word",
        prompt="Write a formal resignation letter with two weeks notice, keeping a positive tone",
        title="Free AI Resignation Letter Generator | ThunderDocs",
        desc="Describe your situation and get a formal, professionally worded resignation letter — free, downloadable as Word.",
        h1="A professional resignation letter, in one prompt.",
        lead="Describe your notice period and tone. ThunderDocs drafts a formal resignation letter you download as Word.",
    ),
    dict(
        slug="readme-generator",
        format="md",
        prompt="Write a README for an open-source React component library",
        title="Free AI README Generator — Markdown | ThunderDocs",
        desc="Describe your project and get a structured README.md — installation, usage and sections included — free, no sign-up.",
        h1="A structured README, from one prompt.",
        lead="Describe your project. ThunderDocs drafts a structured README you download as a ready-to-commit .md file.",
    ),
]


def build_page(page: dict) -> str:
    html = MASTER_HTML
    url = f"{DOMAIN}/{page['slug']}.html"

    html = html.replace(f"<title>{DEFAULT_TITLE}</title>", f"<title>{page['title']}</title>", 1)
    html = html.replace(f'content="{DEFAULT_DESC}"', f'content="{page["desc"]}"', 1)
    html = html.replace(f'href="{DOMAIN}/"', f'href="{url}"')
    html = html.replace(f'content="{DOMAIN}/"', f'content="{url}"')
    html = html.replace(f'content="{DEFAULT_OG_TITLE}"', f'content="{page["title"]}"')
    html = html.replace(f'content="{DEFAULT_OG_DESC}"', f'content="{page["desc"]}"', 1)
    html = html.replace(f'content="{DEFAULT_TW_DESC}"', f'content="{page["desc"]}"', 1)
    html = html.replace(f'<h1 class="hero-display">{DEFAULT_H1}</h1>', f'<h1 class="hero-display">{page["h1"]}</h1>', 1)
    html = html.replace(f'<p class="lead">{DEFAULT_LEAD}</p>', f'<p class="lead">{page["lead"]}</p>', 1)

    prefill_data = json.dumps({"format": page["format"], "prompt": page["prompt"]})
    prefill = (
        f'<script>window.THUNDERDOCS_PREFILL = {prefill_data};</script>\n'
        '<script src="/assets/app.js"></script>'
    )
    html = html.replace('<script src="/assets/app.js"></script>', prefill, 1)

    return html


def main():
    generated = []
    for page in PAGES:
        out_path = os.path.join(SITE_ROOT, f"{page['slug']}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(build_page(page))
        generated.append(page["slug"] + ".html")
        print(f"wrote {page['slug']}.html")
    print(f"\n{len(generated)} pages generated.")


if __name__ == "__main__":
    main()
