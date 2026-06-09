# Crooked Nightstand — theme source

> This folder is the **shared theme source**. Pre-built, ready-to-upload editions
> (pink & blue) live in `../dist/`, and favicons in `../brand/`. See the
> **top-level `../README.md`** for install + the two colour editions. Rebuild both
> editions from this source with `../build.sh`.

A literary-press **Ghost theme** for a curated shelf of short stories.
A monumental ruled nameplate, a **numbered index** (CSS Roman numerals), chiselled
Fraunces titles over Spectral body text, and accents driven by your **Branding color**
on warm stone. The reading view is distraction-free: a drop cap, an architectural
blockquote, an asterism (⁂) scene break, a printer's end mark, and a reading-progress
line. Light/dark with a header toggle. Built for Ghost 5/6 — no code needed to publish.

**Subtle touches** (all respect `prefers-reduced-motion`, degrade without JS):

- **Broadsheet dateline** under the masthead — today's date, set automatically.
- **Shelf stats** — an auto-computed count + total reading time of the collection.
- **"Read" memory** — stories you've opened get a quiet ✓ marker (stored in the
  reader's browser via localStorage; nothing leaves the device).
- **Context-aware header** — while reading, the sticky bar swaps the site name for the
  story title and a live "X min left", then swaps back at the top.
- **Back-to-top with a progress ring** that fills as you read (fades in late, bottom-right).
- **Gentle scroll-reveal** of the index and large blocks — body text never animates.
- **Drawn underlines** on index titles, prev/next, and prose links.
- A soft entrance on hero/headers, and **keyboard ← / →** to move between stories.

The accent colour comes from **Settings → Design → Branding → Accent color** — set it to
whatever you like (Ghost's default is a hot pink; a deeper rose reads more elegant).

## Install

1. **Zip the theme** so `package.json` is at the *root* of the zip (the bundled
   `crooked-nightstand.zip` already is — regenerate with):
   ```bash
   cd CuratedStories
   zip -r crooked-nightstand.zip . \
     -x ".*" -x "__MACOSX*" -x "node_modules/*" -x "mockups/*" -x "*.zip"
   ```
2. Ghost admin → **Settings → Design → Change theme → Upload theme** → choose the
   zip → **Activate**.
3. **Settings → General → Title** → `Crooked Nightstand`.
4. **Settings → Design → Branding** → set the **Accent color** to your navy
   (default `#21395B`). It drives numerals, the drop cap, links, rules and marks.

## Customise (all in Ghost admin — no code)

**Settings → Design**, theme options:

- **Color scheme** — Light (default), Dark, or Auto (follows the reader's device).
- **Masthead kicker** — the small line above the nameplate (default
  "A Curated Shelf of Short Fiction").
- **Masthead intro** — the line under the nameplate.
- **Established** — the year in the colophon (e.g. `2026`).
- **Drop caps** — toggle the opening capital on stories.
- **Footer signature** — replace the default copyright line.

Per-story: the **Excerpt** (post settings) becomes the italic standfirst under the
title and the two-line dek in the index. The story's first **tag** shows as its
label (e.g. "Fiction"). Stories are numbered by their order on the page.

## The wordmark

The stacked "Crooked Nightstand" wordmark is set as text in **`partials/header.hbs`**
and **`home.hbs`** (so the second word can be ink-blue). If you ever rename the
site, update it in those two files.

## What's where

| File | Purpose |
| --- | --- |
| `default.hbs` | Base layout, fonts, no-flash theme script |
| `home.hbs` | Nameplate masthead + numbered story index |
| `index.hbs` | Index for pagination / fallback |
| `post.hbs` | Reading view (drop cap, progress bar, prev/next, CTA) |
| `page.hbs` | Static pages |
| `tag.hbs` / `author.hbs` | Collection & writer archives |
| `partials/` | Header, footer, nav, story card, pagination |
| `assets/css/screen.css` | All styling + design tokens (top of file) |
| `assets/js/main.js` | Theme toggle, reading progress, header state |
| `mockups/` | Design explorations — **not part of the theme**; excluded from the zip |

## Local development

Fonts load from Google Fonts, so it works as-is. Validate with Ghost's checker:

```bash
npx gscan .
```

Self-host the fonts later for best performance: swap the Google Fonts `<link>` in
`default.hbs` for `@font-face` rules with files in `assets/fonts/`.
