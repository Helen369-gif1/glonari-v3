# GLOBAL DREAM — Gia Landing Page Build Spec

**For: Claude Code (VS Code extension) · Project: Glonari / Digital Banker / Global Dream · Version 1.1 · 2026-09-28**

---

## RULE 0 — LANGUAGE (READ FIRST)

- This document and every project file are English only. Never emit Cyrillic characters into any file: not in markup, copy, CSS, comments, commit messages, filenames, or `alt` / `aria-label` / `title` attributes.
- All user-facing copy is quoted verbatim in Section 5. Copy it character for character, including the typographic apostrophe `’` and the em dash `—`. Do not rewrite, shorten, "improve", or re-punctuate it.
- If a string you need is not in this document, do not invent it. Insert `<!-- TODO: copy needed -->` and list it in your report.
- Items marked **PROPOSED** are not yet approved. Do not build them until a prompt states they are approved. As of Version 1.1 every item in this document is approved; the rule remains for future additions. Version 1.2 (2026-10-01) adds Screens 2a and 2b (Sections 5.2a and 5.2b), the second dark accent screen and the fifth header link. All of it was approved by the user on 2026-10-01.

---

## 1. WHAT WE ARE BUILDING

A single static landing page that presents **Gia**, the AI guide of Global Dream, a subsection of Digital Banker inside the Glonari platform. Four screens, scrolled top to bottom:

1. Hero — scroll-scrubbed architectural video, short phrases in sequence.
2. What Gia does — the page's single dark accent screen, calm and readable.
3. Everything connects — Gia on a tablet at the centre, five life areas connecting to her.
4. Gia in your life — a pinned horizontal story over a scroll-scrubbed walking video, four content stops with side brochures, then the final CTA.

> **Approved (2026-10-01)** — two screens are inserted between Screens 2 and 3, making six screens in this order: 1, 2, **2a — She knows you** (light: Gia remembers what matters and turns it into help), **2b — She’s on your side** (the second dark accent screen: the member stays in control of what Gia remembers, uses and shares), 3, 4. Approved Screens 1–4 keep their ids, copy and behaviour; the new screens get their own ids so nothing approved is renumbered. Specified in Sections 5.2a and 5.2b.

Plus a global site shell (header, footer) built last and only after its copy is approved.

Tone: clear, premium, calm, modern, minimal. Light theme with one dark accent screen (**Approved 2026-10-01:** two dark accent screens, Screens 2 and 2b, never adjacent). Elegant motion, never noisy. Gia is presented as the main guide throughout.

This page must not try to explain the entire Global Dream ecosystem. It helps the visitor understand who Gia is, why she matters, how she helps, and where to start.

Relationship to Global Reserve: same engineering approach, same type scale and spacing system, different palette (light Global Dream tokens). Code may be adapted from the Global Reserve repository, but this is a separate project; nothing here imports files from Global Reserve at runtime.

---

## 2. SUPPLIED ASSETS

Everything below is already prepared in the repository.

```
/CLAUDE.md
/GLOBAL-DREAM-BUILD-SPEC.md                This document
/GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md       Visual source of truth (includes Section 16 exceptions)
/media/gd-hero.mp4                         Screen 1 video, 1280x720, 24fps, 8.0s, all-keyframe, no audio, ~5.5MB
/media/gd-hero-poster.jpg                  Screen 1 first frame (reduced motion / fallback)
/media/gd-walk.mp4                         Screen 4 video, 1920x1080 (upscaled, framing unchanged), 24fps, 8.0s, all-keyframe, no audio, ~10.3MB
/media/gd-walk-poster.jpg                  Screen 4 last frame, 1920x1080 (reduced motion / fallback)
/media/gia-tablet.webp                     Screen 3 Gia video-call tablet, transparent background, 1279x1062
/media/gia-tablet.png                      Same, lossless master (not loaded by the page)
/media/logo/gd-lockup-light.webp           Official logo for light backgrounds (header, footer), 915x393, transparent (+ .png master)
/media/logo/gd-emblem-light.webp           Emblem only (globe in ring), 416x416, transparent (+ .png master)
/media/logo/gd-lockup-dark.webp            Glowing logo for dark backgrounds, 1481x722, transparent (+ .png master). Not used on the page by default; reserved for social previews or a later Screen 2 use
/media/logo/favicon-32.png, apple-touch-icon.png   Favicons made from the emblem
/favicon.ico                               16/32/48 favicon
/media/brochures/*.webp                    Eight brochure images (main + inline per brochure), extracted from the brochure PDF
/media/gd-knows.webp                       Screen 2a photo: member at home with Gia on a tablet, 3640x2048, ~262KB (added 2026-10-01)
/media/gd-side.webp                        Screen 2b photo: the same member with his phone at dusk, 2460x3072, ~181KB (added 2026-10-01)
/media/gia-avatar.webp                     Screens 2a and 2b Gia avatar, 256x256, cropped from gd-knows.webp (added 2026-10-01; used on 2a since the 2a rework)
/references/Global_Dream_Gia_Structure_EN.txt       Original content brief
/references/oceanx-horizontal-story-reference.mp4   Screen 4 motion reference (third-party site, reference only)
/references/oceanx-contact-sheet.jpg                1 frame per second of the reference
/references/oceanx-chapter-frame.jpg                One chapter at rest, full resolution
/references/gd-hero-contact-sheet.jpg               Screen 1 video overview
/references/gd-walk-contact-sheet.jpg               Screen 4 video overview
/references/gia-tablet-source.png                   Original tablet image with grey studio background
/references/screen-3-target.png                     Screen 3 approved visual target (icons, glowing lines, orbit)
/references/digital-banker-reference.png            Digital Banker dark visual reference (Screen 2 atmosphere)
/references/oceanx-brochure-panel.png                Screen 4 brochure panel reference (open chapter on the reference site)
/references/gia-brochure-source.pdf                 The Gia brochure — source of the brochure images (its copy is retired)
/references/brochure-copy.txt                       Designer-supplied brochure copy — source of all brochure copy (Section 5.4a)
```

Video preparation already done (for the record, if a new cut is supplied):

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -g 1 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart media/gd-hero.mp4
```

Do not copy text, logos, or UI from `references/oceanx-*`. It is used only for motion mechanics and composition rhythm.

---

## 3. TARGET FILE STRUCTURE

```
/index.html
/css/tokens.css          Tokens only: design-system Section 3 plus Section 16 dark accent tokens
/css/base.css            Reset, fonts, container, buttons, utilities, reveal classes
/css/screens.css         Screens 1, 2, 3 (and 2a, 2b)
/css/gia-story.css       Screen 4 stage, story modules, final CTA, brochures
/css/site-shell.css      Header and footer (built last)
/js/hero-scrub.js        Screen 1 scroll-to-video binding and phrase timeline
/js/reveal.js            Shared IntersectionObserver reveal
/js/gia-conversation.js  Screen 2 conversation rail animation
/js/gia-knows.js         Screen 2a photo, memory panel and quote animation
/js/gia-side.js          Screen 2b photo, request panel animation and switches
/js/gia-connect.js       Screen 3 life-area connection animation
/js/gia-story.js         Screen 4 scrub, horizontal modules, progress, final CTA
/js/brochure.js          Screen 4 side brochure dialogs
/js/site-shell.js        Header behaviour (built last)
/favicon.ico
/media/                  Assets listed in Section 2 (logo in /media/logo/, brochure images in /media/brochures/)
/references/             Reference material, never loaded by the page
```

- One `<section>` per screen: `id="screen-1"` to `id="screen-4"`.
- `data-screen` slugs: `hero`, `conversation`, `connects`, `life`.
- The final CTA lives inside Screen 4 and has `id="screen-4-final"` for anchor links.
- **Approved (2026-10-01):** Screens 2a and 2b are `<section id="screen-knows" data-screen="knows">` and `<section id="screen-side" data-screen="side">`, placed in the DOM between `#screen-2` and `#screen-3`. They stay `hidden` until implemented and visually verified. Load order adds `gia-knows.js` and `gia-side.js` directly after `gia-conversation.js`.
- Load order at the end of `<body>`: GSAP, then `hero-scrub.js`, `reveal.js`, `gia-conversation.js`, `gia-connect.js`, `gia-story.js`, `brochure.js`, `site-shell.js`. Each file initialises itself on `DOMContentLoaded` by finding its section.
- Fonts: one Google Fonts request: Playfair Display 500 and 700; IBM Plex Sans 400, 500, 600, 700; IBM Plex Mono 400, 500, 600; `display=swap`; preconnect to both Google hosts.
- `<title>`: `Gia — Global Dream`
- Favicons: see Section 5.5 (added in A1).

---

## 4. SHARED RULES

### 4.1 Tokens

Use the design system's `--gd-*` tokens (Section 3 of the design system) and the dark accent tokens in design-system Section 16, which are used only by Screen 2 and by the Screen 1 veil and text shadow (Section 5.1). **Approved (2026-10-01):** also by Screen 2b, which uses `--gd-night-warm` and `--gd-night-warm-surface`. No raw colour values in screen CSS except inside `tokens.css`.

### 4.2 Buttons

All CTAs on this page are `<a class="gd-button …" href="#">` (destinations TODO) except the Screen 4 brochure triggers, which are `<button type="button">`.

- `.gd-button--primary` on light: fill `--gd-gold-deep`, text `#fff`, 1px border `--gd-gold-deep`.
- `.gd-button--primary` on dark (Screen 2, and Screen 2b if a button is ever added there): fill `--gd-gold`, text `--gd-text-primary`.
- `.gd-button--secondary`: transparent, 1px `--gd-gold-line` border, text `--gd-text-primary`.
- Radius 8px, padding `16px 28px`, IBM Plex Sans 600, 15px, letter-spacing `0.01em`. Hover: 200ms, border or fill deepens slightly; no transform.
- Focus: `outline: 2px solid var(--gd-gold-deep); outline-offset: 3px` (on dark: `--gd-gold`).
- No icons inside buttons, except the small decorative dot on the Screen 4 module buttons (Section 5.4a.1). No pill buttons.

### 4.3 Terminology lock

Use exactly: `Gia` · `Global Dream` · `Digital Banker` · `Glonari` · `Glonari Home` · `Living Capacity`. The brochure quote-card role label is `GIA` (no `™`). Gia is referred to as "she". Never call Gia "the bot", "assistant", or "chatbot" in copy, `alt`, or `aria-label` text.

### 4.4 Pinned sections

Only two pinned (sticky-stage) sections exist on this page: Screen 1 and Screen 4. Everything else flows normally. Neither pin is applied under `prefers-reduced-motion: reduce`.

### 4.5 Reveal (Screens 2, 2a, 2b and 3 text)

Shared `js/reveal.js`: elements with `[data-reveal]` animate once from `opacity: 0; translateY(24px)` to rest, 600ms, `cubic-bezier(.22,.61,.36,1)`, when 25% visible. `[data-reveal-delay="n"]` adds `n × 120ms`. Reduced motion: shown at rest immediately. If JS fails, content must be visible (apply the hidden starting state only after JS adds `.js` to `<html>`).

---

## 5. SCREEN-BY-SCREEN SPEC

Copy below is final. Reproduce it verbatim.

### 5.1 Screen 1 — Hero / scroll video

**Purpose.** Introduce Gia immediately. Emotional, premium first impression. Extremely short copy.

**Mechanics** (same technique as Global Reserve Screen 1, adapted into `js/hero-scrub.js`):

- Section `#screen-1`, class `gd-hero`. Runway wrapper height `400vh`. Inner stage `position: sticky; top: 0; height: 100vh; height: 100svh`, one grid cell holding the video layer, the veil, and the text layer.
- Video `media/gd-hero.mp4` fetched as a blob (`URL.createObjectURL`), `muted playsinline`, `object-fit: cover`, explicitly `width: 100%; height: 100%`. Poster `media/gd-hero-poster.jpg`.
- `targetTime = progress × duration`. Exponential smoothing: `smoothed += (target − smoothed) × (1 − 0.001^dt)`. Seek only when `!video.seeking` and the difference exceeds `1/24` s.
- Text is split into one `<span class="word">` per word and driven by one paused GSAP timeline via `.time(smoothed)`. Word tween: 0.7s, stagger 0.03s, in `y: 36 → 0` `power3.out`, out `y: 0 → −26` `power2.in`.
- Block 1 starts appearing on page load without scroll (elapsed-since-load nudge capped at the fade duration, as in Global Reserve).

**Legibility: dark veil, light text** (approved by the designer 2026-09-29; replaces the earlier ivory veil). A static dark veil built from `--gd-night` sits above the video and below the text: `linear-gradient(to bottom, rgba(21,24,28,.62) 0%, rgba(21,24,28,.56) 40%, rgba(21,24,28,.24) 55%, rgba(21,24,28,.16) 70%, rgba(21,24,28,.12) 100%)`. It does not animate. The veil must stay positioned above the media layer in the stacking order. Tuning limits: top alpha between `.45` and `.62`, bottom alpha at least `.10`, and the lower half of the frame stays visibly light. All Screen 1 text (`GIA`, the tagline, `Start with Gia.`, `Talk. Explore. Plan.`) is `--gd-surface` (`#FFFDF8`) with `text-shadow: 0 2px 24px rgba(21,24,28,.35)`, on Screen 1 text only. The `Meet Gia` button stays `.gd-button--primary`.

> **SUPERSEDED (2026-10-01)** — the neutral `--gd-night` veil above read as a grey-black film over the warm limestone. At the user's direct request it is replaced by a **warm bronze-umber veil** built from the new token `--gd-night-umber` (`color-mix(in srgb, var(--gd-gold-deep) 45%, var(--gd-night))`, about `#4A361F`): `linear-gradient(to bottom, umber 48% 0%, 38% 40%, 14% 55%, 6% 70%, 0% 100%)`. It still does not animate and still sits above the media layer. The video gets `filter: brightness(1.08) saturate(1.1) contrast(1.03)`. The Screen 1 text shadow is now `0 2px 24px` in `--gd-night-umber` at 45%. New tuning limits: top alpha between `.45` and `.62`; the bottom may go to `0`, since there is no text in the lower half. The text colour, text position and `Meet Gia` button are unchanged. Chosen from five candidates (umber, amber, wine, sepia, night) compared side by side, see chat from 2026-10-01. Contrast check (method below) at 1920, 1440, 1024, 768 and 375 on the block 1 frame: `GIA` and the tagline pass on 100% of glyph pixels at every width (tagline minimum 4.62:1 at 1920). Blocks 2 and 3 have not yet been re-measured against the new veil.

Contrast targets, measured on glyph pixels of the light text over the rendered frame with the veil (text shadow excluded), at 1920, 1440, 1024, 768 and 375, on frames where each block is fully visible: `GIA` and blocks 2 and 3 at least 3:1, the tagline at least 4.5:1, each on at least 99% of glyph pixels. If the tagline fails, raise the veil within the limits above; if that is still not enough, move the text group higher at 1100px and below. The values above passed at every width (worst case: tagline at 1920, 99.8% of glyph pixels at 4.5:1 or more), so the text position is unchanged.

**Copy and timing** (video time in seconds, 8.0s total):

| Block | Element | Copy | Style | In | Out |
|---|---|---|---|---:|---:|
| 1 | H1 | `GIA` | Playfair Display 500, `clamp(72px, 9vw, 168px)`, line-height 1, letter-spacing `0.06em`, `--gd-surface` | 0.0 | 2.03 |
| 1 | Tagline `<p>` | `Your AI for the life you want to build.` | Playfair Display 500, `clamp(22px, 2.2vw, 40px)`, line-height 1.3, `--gd-surface`, 16px below H1 | 0.0 | 2.03 |
| 2 | `<p>` | `Start with Gia.` | Playfair Display 500, `clamp(34px, 3.8vw, 72px)`, line-height 1.15, `--gd-surface` | 3.0 | 4.54 |
| 3 | `<p>` | `Talk. Explore. Plan.` | same as block 2 | 5.3 | — (holds) |

In is the time a block's entrance starts. Out is the time its exit starts. Each exit must finish by the next block's In time: with the word tween (0.7s, stagger 0.03s), block 1's 10 words exit over 0.97s (2.03 → 3.00) and block 2's 3 words over 0.76s (4.54 → 5.30).
| 3 | Button | `Meet Gia` | `.gd-button--primary`, 32px below block 3 text | 5.5 | — (holds) |

- Block 1 fully exits before block 2 enters; block 2 fully exits before block 3 enters. No overlap.
- Block 3 and its button stay visible through the end of the runway. The button is animated as one unit (opacity + `y`), not per word.
- The button has `pointer-events: none` and `tabindex="-1"` while its opacity is below 0.5, and becomes interactive above it. Toggle via a class, not per frame style writes.
- Screen reader text: the H1 contains `GIA`; add `aria-label` on nothing else. All three blocks remain in the DOM at all times.

**Position.** All blocks share one centred column: `left: 50%; transform: translateX(-50%); width: min(80%, 1100px); text-align: center`. Top of the text group at `16%` of the stage height, which keeps the text in the upper band where the dark veil is strongest. The contrast targets above pass at this position at every tested width, so no higher position is needed at 1100px and below. Below 600px wide: `width: 88%`, top `18%`. Visually verify at 1920, 1440, 1024, 768, 375.

**Reduced motion.** No runway, no pin. Stage becomes `min-height: 100svh`, shows `gd-hero-poster.jpg` as a static cover image with the same dark veil and light text, blocks 1 and 3 plus the button visible and stacked with a 16px gap between blocks (block 2 hidden, since block 3 repeats its intent), no word animation. The tight stack keeps `Talk. Explore. Plan.` in the upper band where the veil is darkest; it meets 3:1 on at least 99% of glyph pixels at 1920, 1440, 1024, 768 and 375 (measured 100% at every width).

**Missing video.** Show the poster as a static background; text timeline still runs on scroll.

---

### 5.2 Screen 2 — What Gia does (dark accent screen)

**Purpose.** Explain Gia calmly after the emotional hero. Gia is not just a chatbot; she is a guide for decisions and next steps. Slower pacing than Screen 1.

**Why dark here.** This is the page's single dark accent, approved by the designer. It marks the change of register from the warm cinematic hero to explanation, and it links the page visually to the dark Digital Banker world (`references/digital-banker-reference.png`). Screens 3 and 4 return to light. Use only the dark tokens from design-system Section 16.

> **Approved (2026-10-01)** — Screen 2 becomes the first of two dark accent screens; the second is Screen 2b (Section 5.2b). Screen 2 itself is unchanged. The light Screen 2a follows it, so the two dark screens never touch.

**Layout.** `gd-section` padding, background `--gd-night`. Container 1200px. Editorial split `minmax(0, 1fr) minmax(0, 1fr)`, gap `--gd-grid-gap`, `align-items: center`.

- Left column: H2, body, closing lines, button.
- Right column: the conversation rail (the four action phrases).

| Element | Copy | Style |
|---|---|---|
| H2 | `One conversation can change what you see next.` | H2 standard, `--gd-night-text` |
| Body | `Gia helps you make sense of where you are, what you want, and what your next step could be.` | Lead, `--gd-night-text-2`, max-width 520px, 24px below H2 |
| Closing line 1 | `You don’t need to know where to start.` | Body, `--gd-night-text`, 48px below body |
| Closing line 2 | `You can start with Gia.` | Body, weight 600, `--gd-gold`, directly under line 1 |
| Button | `Talk to Gia` | `.gd-button--primary` dark variant, 32px below closing lines |
| Rail item 1 | `Ask a question.` | H3, `--gd-night-text` |
| Rail item 2 | `Explore an idea.` | H3 |
| Rail item 3 | `Compare possibilities.` | H3 |
| Rail item 4 | `Build a plan.` | H3 |

Markup: the rail is an `<ol class="gd-rail">` with four `<li>`. Each `<li>` holds a decorative node (`<span class="gd-rail__node" aria-hidden="true">`) and the phrase. Node contains a mono index `01`–`04` (IBM Plex Mono 500, 11px) — the index is decorative and `aria-hidden`.

**Rail geometry.** Vertical 1px line in `--gd-night-line` at the node centre. Nodes 32px circles, 1px `--gd-night-line` border, `--gd-night-surface` fill, index in `--gd-night-text-3`. Row gap 40px desktop / 28px mobile. Phrase starts 32px right of the node (20px mobile). An active node: `--gd-gold` fill, index `--gd-night`. The line has an overlay segment in `--gd-gold` whose `scaleY` grows from the top.

**Animation** (`js/gia-conversation.js`, `initGiaConversation(section)`):

1. Left column text reveals with the shared reveal (Section 4.5), delays 0/1/2/3.
2. When the rail is 35% visible, once: the gold line segment grows from node 1 to node 4 over 2.4s, `power1.inOut`. Each node activates as the line reaches it (fill transitions over 300ms) and its phrase fades in (`opacity 0 → 1`, `x: -12 → 0`, 600ms, design-system ease). Phrases start at `opacity: 0.0`, not hidden.
3. After completion, ambient loop: a small gold glow dot (6px, `box-shadow` none, just a filled dot with 40% opacity trail made by a second dot) travels down the rail from node 1 to node 4 over 2.8s, then waits 5s, then repeats. It never changes layout. Paused while the section is out of view (`IntersectionObserver`).

Reduced motion: rail complete (gold line full, all nodes active, all phrases visible), no ambient dot.

**Responsive.** At 768px and below: one column, left column first, rail after it with 48px gap. At 1100px–769px keep two columns only while each column is at least 360px; otherwise stack.

---

### 5.2a Screen 2a — She knows you

**Status.** Copy approved by the user on 2026-10-01: every string in this section is final, reproduce it verbatim. Photo-led layout approved on 2026-10-01. Build with task A9.

**Purpose.** Show what makes Gia different from other AI: she is an ongoing relationship, not a fresh start with every question. The visitor sees memory turn into help through one concrete moment, in a real home, with a real person. Plain language only. Every Glonari concept must be understandable before it is named, so this screen names no product other than Gia: no Cortex, G-Power, GLO, Gia Power or Global Connections.

**Position.** Directly after Screen 2, before Screen 2b. Section `#screen-knows`, class `gd-section gd-knows`, `data-screen="knows"`. Background `--gd-bg` (light ivory). It is the light section that separates the two dark accent screens (design-system Section 16.1).

**Asset.** `media/gd-knows.webp`, 3640×2048 (16:9), about 262KB: a man in his late forties on a sofa in a warm, lamp-lit living room at night, city lights through the window, talking and gesturing towards a tablet on the coffee table where Gia smiles on a video call. The man sits in the left 40% of the frame, the tablet spans about 44%–70% of the width, and the right 30% (lamp, sofa, plant, books) carries no important subject. No text or interface is baked into the image.

- `alt="A man relaxing at home in the evening, talking with Gia on a tablet"`, `width="3640" height="2048"`, `loading="lazy"`, `decoding="async"`.
- Gia in this photo differs from the Gia in the page videos and the Screen 3 tablet image (Appendix B, item 3).

**Composition** (top to bottom, all inside the 1200px container):

1. Header block, left-aligned, max-width 720px: H2, body.
2. Photo stage, 48px below the header (64px at 1200px and above): `<div class="gd-knows__stage">`, full container width, `aspect-ratio: 16 / 9`, radius 8px, `overflow: hidden` on the stage itself. The image fills it (`width: 100%; height: 100%; object-fit: cover; object-position: 35% 50%`). From 1200px up, the overlay column sits on the photo (see Overlays).
3. Closing row, 48px below the stage: a grid `minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.3fr)`, gap 32px, `align-items: end`: stage 1, stage 2, key line. (From 1200px up this row is replaced; see "Screen 2a rework" at the end of this section.)

| Element | Copy | Style |
|---|---|---|
| H2 | `AI should know more than your question. It should know you.` | H2 standard, `--gd-text-primary` |
| Body | `Most AI starts over every time you ask. Gia is built as an ongoing relationship. She remembers what you want her to remember — and becomes more helpful over time.` | Lead, `--gd-text-secondary`, max-width 560px, 24px below H2 |
| Stage 1 label | `AT FIRST` | Eyebrow style, `--gd-gold-deep` |
| Stage 1 text | `What you want. What matters. How you like things done.` | Body, `--gd-text-primary`, 8px below its label |
| Stage 2 label | `OVER TIME` | Eyebrow style, `--gd-gold-deep` |
| Stage 2 text | `Your goals, preferences, routines and plans.` | Body, `--gd-text-primary`, 8px below its label |
| Key line | `She doesn’t just know your question. She knows you.` | Large data phrase, `--gd-gold-deep` |

There is no button on this screen. Screen 3 carries the next call to action, and two extra buttons in a row would dilute it.

**Stages.** A `<dl class="gd-knows__stages">` with one `<div>` per stage holding `<dt>` (label) and `<dd>` (text); each stage has a 1px `--gd-line-soft` top rule and 16px padding-top. The `<dl>` uses `display: contents` inside the closing-row grid so the two stages are its first two columns.

**Overlays** (1200px and above). One overlay column (`.gd-knows__overlay`, `position: absolute`), inside the stage, right-aligned at an inset of 32px from the right, top and bottom edges of the stage, `width: min(30%, 360px)`, a flex column with the memory panel at the top and the quote card at the bottom, at least 16px apart. It must never cover the tablet or the man's face: verify at 1200, 1440 and 1920 that its left edge stays right of the tablet frame (about 70% of the stage width). If the two cards do not fit the stage height at some width, the quote card's outcome line may move outside the stage, never the panel rows. Below 1200px the overlays leave the photo (see Responsive).

> **Approved (2026-10-01, task A9)** — the geometry above conflicted with its own rule: at `min(30%, 360px)` with a 32px right inset, the overlay's left edge sits at 67.1% of the stage at 1200, 1440 and 1920, covering the tablet frame and stand (which end at about 69.7%) by about 28px, and the two cards together reach the stage's bottom edge. At the user's choice it is replaced: from 1200px up **only the memory panel sits on the photo**, top-right at a 32px inset from the top and right edges, `width: min(calc(30% - 56px), 360px)` (about 275px), so its left edge stays 24px right of the tablet (measured 72.2% at 1200, 1440 and 1920). The **quote card sits under the stage**, 24px below it, right-aligned with the stage's right edge, `width: min(480px, 100%)`; the closing row follows 48px below the quote card. The `.gd-knows__overlay` wrapper is a sibling of the stage (not a child), so the stage still clips the photo's scale-in.

**Memory panel** (`<figure class="gd-memory">`):

- Surface `--gd-surface`, 1px `--gd-line`, radius 8px, padding 20px, `--gd-shadow-soft`. Solid, no transparency, no blur, no glow: the surface carries the contrast over the photo. (Superseded: surface, border, shadow and row style are now set by "Screen 2a rework" below.)
- `<figcaption class="visually-hidden">`: `An example of what Gia remembers and how she uses it.`
- Header: mono label `WHAT GIA REMEMBERS` (IBM Plex Mono 500, 11px, `0.12em`, uppercase, `--gd-text-secondary`), preceded by a 6px `--gd-gold` square, as on the Screen 4 chapter labels.
- Memory list (`<ul class="gd-memory__list">`), 12px below the header. Each row: a 6px `--gd-gold` dot, then the text in small body (14px), `--gd-text-primary`; 8px vertical and 8px horizontal padding; radius 4px on the row so the highlight has soft corners; 1px `--gd-line-soft` divider between rows.

| Row | Copy |
|---|---|
| 1 | `Moving to the city in spring` |
| 2 | `Prefers a quiet neighbourhood` |
| 3 | `Home budget agreed in March` |
| 4 | `Daughter starts school in September` |
| 5 | `Works from home three days a week` |

**Quote card.** The brochure quote card component `.gd-quote` exactly as specified in Section 5.4a.2 (role label, quote, outcome line), on its `--gd-bg` background, padding reduced to 20px 24px inside the overlay. Gia is already visible on the tablet in the photo, so this card has no avatar. (Superseded: the card now has an elevated surface and Gia's avatar; see "Screen 2a rework" below.)

| Element | Copy |
|---|---|
| Role label | `GIA` |
| Quote | `“The home you saved just dropped in price. It still fits your budget, and it’s close to the school. Want me to arrange a viewing?”` |
| Outcome line | `Gia remembered. Gia noticed. Gia acted.` (stored in sentence case, uppercased by CSS, as in 5.4a.2) |

The memory rows and the quote are illustrative examples. They show the idea, not a real member's data.

**Animation** (`js/gia-knows.js`, `initGiaKnows(section)`):

1. Header text reveals with the shared reveal (Section 4.5), delays 0–1. The closing row reveals the same way when it enters, delays 0–2.
2. When the stage is 30% visible, once:

| Time | Event |
|---:|---|
| 0.0s | Photo: `opacity 0 → 1` and `scale 1.04 → 1` (transform on the image, the stage clips it), 1200ms, design-system ease |
| 0.6s | Memory panel: `opacity 0 → 1`, `y: 16 → 0`, 600ms |
| 1.0s–2.2s | Memory rows 1 to 5 appear in order, 300ms apart: `opacity 0 → 1`, `x: 12 → 0`, 500ms |
| 2.8s | Rows 2, 3 and 4, the memories Gia is about to use, receive a `--gd-gold-soft` background, fading in over 400ms, 120ms apart |
| 3.4s | Quote card: `opacity 0 → 1`, `y: 16 → 0`, 600ms |
| 4.1s | Outcome line: its three sentences appear one after another, 250ms apart, opacity only (each sentence is its own `<span>`) |

No ambient loop. The screen comes to rest. The photo is not pinned and has no parallax.

Reduced motion: everything visible at rest, rows 2–4 highlighted, no animation.

(Superseded: the trigger, the timings above and the "no ambient loop" rule are replaced by the motion in "Screen 2a rework" below.)

**Responsive.**

- 1199px to 769px: the overlays leave the photo. Under the stage, 24px below it, the memory panel and the quote card sit side by side in a 2-column grid (gap 24px, `align-items: start`), then the closing row.
- 768px and below: the stage becomes `aspect-ratio: 4 / 3` with `object-position: 40% 50%` so the man and the tablet both stay in frame; the panel and the quote card stack under it (gap 16px), full container width; the closing row stacks (stages in 2 columns, then the key line; below 480px everything in one column, 24px gaps).
- Verify at 1920, 1440, 1200, 1024, 768 and 375 that neither the man's face nor Gia on the tablet is cropped out or covered.

> **Approved (2026-10-01, task A9)** — "full container width" at 768px and below conflicted with the 480px panel maximum in design-system 16.10. At the user's choice the design system applies: the memory panel and the quote card are at most 480px wide at every width, left-aligned when stacked (full width only where the container is narrower than 480px).

> **Approved by the user on 2026-10-01 — Screen 2a rework.** The user reviewed the built screen and rejected it as pale, low in contrast, without visible motion and with an empty area under the photo. The changes below apply to Screen 2a only and override the conflicting parts of this section. The copy is unchanged.
>
> **Layout, 1200px and above.** The separate closing row is removed. Under the photo, 32px below it, one row: grid `minmax(0, 1fr) minmax(0, 420px)`, gap 48px, `align-items: start`. Left: the two stages side by side (gap 32px), and the key line under them (24px gap). Right: the quote card, full column width, its right edge on the photo's right edge. No empty area remains under the photo. The memory panel keeps its place on the photo (top-right, 32px inset, `width: min(calc(30% - 56px), 360px)`). The closing row moved into `.gd-knows__visual`, which becomes this grid; the overlay wrapper uses `display: contents`. Below 1200px the stacked order is unchanged: photo, memory panel and quote card, closing row.
>
> **Contrast and depth.** New token `--gd-shadow-card` (design-system Section 3).
>
> - Memory panel: background `--gd-surface-elevated`, 1px `--gd-gold-line` border, a 3px `--gd-gold` bar along its top edge (a background layer, so the radius clips it), `box-shadow: var(--gd-shadow-card)`. On the photo (1200px and up) it adds a darker contact shadow `0 8px 24px rgba(21,24,28,.28)` (written as `--gd-night` at 28%); under the photo it keeps `--gd-shadow-card` only.
> - Memory rows: the dot becomes an 8px ring (2px `--gd-gold`) with a `--gd-gold` centre. Highlighted rows 2–4: `--gd-gold-soft` background, text `--gd-gold-deep`, weight 500. The weight change does not rewrap any row (heights measured equal in both states at 1920, 1200 and 375).
> - Quote card: background `--gd-surface-elevated`, 1px `--gd-gold` border, `box-shadow: var(--gd-shadow-card)`. Its role row shows Gia's avatar (`media/gia-avatar.webp`, 40px circle, 2px `--gd-gold` ring, `alt=""`) 10px before the `GIA` label.
> - Measured contrast: `--gd-text-primary` on `--gd-surface-elevated` 15.8:1; `--gd-text-secondary` (panel label) 7.2:1; `--gd-gold-deep` (outcome line) 5.9:1; `--gd-gold-deep` on a highlighted row (`--gd-gold-soft` over white) 5.1:1.
>
> **Gold threads** (1200px and above; design-system 16.9 extended to Screen 2a). One decorative SVG `.gd-knows__threads` (`aria-hidden`, `pointer-events: none`) covers the photo and the row under it, above the photo and below both cards.
>
> - Tablet node: the Screen 3 tablet node (12px ringed dot) with a pulse ring, on the tablet's right frame edge at the vertical centre of its screen. Measured on the image: the frame leans, so its right edge at the screen's centre is at **68.2% of the image width and 53.5% of its height** (the 69.7% in the brief is the frame's top-right corner; 52% was approximate). The measured position was approved by the user on 2026-10-01. The point is mapped through the `object-fit: cover` crop of the rendered photo; recomputed after the image and fonts load and on resize (debounced 150ms).
> - Row threads: one per memory row, from the panel's left edge at the row's vertical centre to the tablet node; a cubic curve with horizontal tangents at both ends whose control points stay between its ends, so it never reaches over the tablet screen. 1.5px `--gd-gold`, round caps, glow `drop-shadow(0 0 4px)` in the Screen 3 glow colour. Rows 2–4 at full opacity, rows 1 and 5 at 35%.
> - Card thread: from the tablet's bottom frame edge (62% of the image width, 74.7% of its height) down to the quote card's top border, a vertical S-curve in the same style, ending in a 12px ringed node centred on the card's top border above the avatar (an HTML node inside the card, so it moves with it).
> - No thread crosses Gia's face or the man's face (verified at 1200, 1440 and 1920).
>
> **Motion** (`js/gia-knows.js`), triggered once when the stage is 25% visible:
>
> | Time | Event |
> |---:|---|
> | 0.0s | Photo `opacity 0 → 1`, `scale 1.08 → 1`, 1600ms, design-system ease |
> | 0.5s | Memory panel `opacity 0 → 1`, `x: 40 → 0`, 700ms |
> | 0.9s–2.1s | Rows 1–5 in order, 300ms apart: `opacity 0 → 1`, `x: 16 → 0`, 500ms; each row's thread draws (`stroke-dashoffset`) from the row to the tablet over 600ms, starting 200ms after its row |
> | 2.6s | Tablet node pops in (`scale 0 → 1`, `back.out(2.5)`) with one pulse ring (`scale 1 → 2.6`, `opacity .6 → 0`, 700ms); rows 2–4 highlight 120ms apart |
> | 3.2s | The tablet-to-card thread draws downward over 700ms |
> | 3.9s | Quote card `opacity 0 → 1`, `y: 32 → 0`, `scale .97 → 1`, 700ms; its top node pops in |
> | 4.6s | Outcome line, sentence by sentence, 250ms apart |
>
> Ambient, after the sequence, only while the section is visible (paused off-screen): every 3.5s a 6px glowing `--gd-gold` particle travels along the thread of row 2, 3 or 4 (cycling 2 → 3 → 4) to the tablet, 1.2s, ease-in-out, via `getPointAtLength`; the tablet node pulses once when it arrives.
>
> Reduced motion: everything at rest and visible, threads drawn, rows highlighted, no particle, no pulse. Below 1200px (cards under the photo): no threads and no nodes; the rest of the motion is unchanged. The section clips horizontal overflow (`overflow-x: clip`) so the panel's slide-in never causes page scrolling; no sticky stage lives inside it.

---

### 5.2b Screen 2b — She’s on your side (second dark accent screen)

**Status.** Copy approved by the user on 2026-10-01: every string in this section is final, reproduce it verbatim. Photo-led layout approved on 2026-10-01. Build with task A10, after design-system 16.1 and 16.10 are in force.

**Purpose.** Answer the question Screen 2a raises: if Gia knows this much, who is in control? Trust and control are shown, not only told. Privacy is a visible part of the story, not a footer link. The same man from 2a, later that evening, checks his phone: the home viewing Gia offered needs information from an agency, and Gia shares only what is needed.

**Why dark here.** It is the second of the page's two dark accent screens (design-system Section 16.1). The serious register suits a screen about protection, and it matches the dark privacy spread of the Gia brochure. It is not adjacent to Screen 2: Screen 2a sits between them.

**Position.** Directly after Screen 2a, before Screen 3. Section `#screen-side`, class `gd-side`, `data-screen="side"`. Background `--gd-night-warm` (a warm charcoal, design-system 16.1). The photo's warm evening light continues the colour of the section.

**Assets.**

- `media/gd-side.webp`, 2460×3072 (4:5), about 181KB: the same man on a terrace at dusk, golden lamp light, city lights and a blue evening sky behind him, smiling at a phone in his right hand, chin on his left hand. His face sits in the upper middle of the frame (about 30%–65% of the width, 15%–50% of the height), the phone at the right edge around 55%–70% of the height. The lower left (cup, fruit, blurred table) carries no important subject. No text or interface is baked in. `alt="The same man in the evening, smiling as he checks a message from Gia on his phone"`, `width="2460" height="3072"`, `loading="lazy"`, `decoding="async"`.
- `media/gia-avatar.webp`, 256×256: Gia's face, cropped from `gd-knows.webp`, so it is the same Gia as on Screen 2a. Shown as a 32px circle; decorative (`alt=""`), since the `GIA` label next to it carries the name.

**Layout.** The section is full-bleed (no container on the photo side) and has no section padding of its own: `display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); min-height: min(100svh, 960px)`.

- Photo column (`.gd-side__media`, `grid-column: 1; grid-row: 1`): touches the left, top and bottom edges of the section, `position: relative; overflow: hidden`. The image fills it (`width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%`), so the face and phone stay in frame at every height. No veil, no gradient over the photo.
- Text column (`.gd-side__text`, `grid-column: 2; grid-row: 1`): padding `var(--gd-section-pad) var(--gd-page-pad)`, content max-width 520px, vertically centred. In the DOM the text column comes first, so the H2 comes first in reading order.
- The request panel sits over the photo, bottom-left: `position: absolute; left: 32px; bottom: 32px; width: min(420px, calc(100% - 64px))`. It must never cover the man's face or the phone in his hand: verify at 1920, 1440 and 1200 and move it to the bottom inset only (never up over the face) if needed.

| Element | Copy | Style |
|---|---|---|
| H2 | `She’s on your side.` | H2 standard, `--gd-night-text` |
| Body | `Gia works under your direction. You decide what she remembers, what she can use and what she can share.` | Lead, `--gd-night-text-2`, 24px below H2 |
| Control 1 | `What Gia remembers` | Body, `--gd-night-text` |
| Control 2 | `What she can use` | Body |
| Control 3 | `What needs your approval` | Body |
| Control 4 | `What she can share` | Body |
| Controls note | `Example settings. Nothing is saved.` | `.visually-hidden`, directly after the list |
| Key line | `Your Gia. Your information. Your decision.` | Large data phrase, `--gd-gold`, 48px below the controls |
| Small print | `Glonari is designed to create value with its members, not sell their private profiles.` | Small body, `--gd-night-text-2`, 16px below the key line. Requires legal review before launch (Appendix B) |

There is no button on this screen, for the same reason as 2a.

**Controls.** A `<ul class="gd-side__controls">`, 32px below the body. Each `<li>` is one row: the label on the left, a switch on the right; 16px vertical padding; 1px `--gd-night-line` divider between rows. Each switch is `<button type="button" role="switch" aria-checked="true" aria-labelledby="…">`, labelled by its row text. Switch geometry (approved exception, design-system 16.10): track 44×24px, radius 12px; on: `--gd-gold` track with an 18px `--gd-night` thumb at the right; off: transparent track, 1px `--gd-night-line` border, `--gd-night-text-3` thumb at the left. The thumb moves with `transform`, 200ms. Focus ring: `--gd-gold`, as for other controls on dark.

The switches work only on the page: a click toggles `aria-checked` and the visual state. Nothing is saved or sent. All four start on.

**Request panel** (`<figure class="gd-request">`):

- Surface `--gd-night-warm-surface`, 1px `--gd-night-line`, radius 8px, padding 24px. Solid, no transparency, no blur, no glow: the surface carries the contrast over the photo.
- `<figcaption class="visually-hidden">`: `An example of Gia sharing only the information a company needs.`
- Header: mono label `A COMPANY REQUESTS` (IBM Plex Mono 500, 11px, `0.12em`, uppercase, `--gd-night-text-2`), preceded by a 6px `--gd-gold` square.
- Context line, 12px below: `To arrange your home viewing, the agency asks for:` Small body, `--gd-night-text`.
- Request list (`<ul class="gd-request__list">`), 12px below. Each row: the item on the left (small body, `--gd-night-text`), the status on the right (IBM Plex Mono 600, 11px, `0.08em`, uppercase via CSS) with a 12px inline-SVG glyph before it (`aria-hidden`); 10px vertical padding; 1px `--gd-night-line` divider.

| Row | Item | Status | Status colour and glyph |
|---|---|---|---|
| 1 | `Your name and contact details` | `Shared` | `--gd-night-text`, check mark in `--gd-gold` |
| 2 | `Your purchase history` | `Not needed` | `--gd-night-text-2`, dash |
| 3 | `Your location history` | `Not shared` | `--gd-night-text-2`, cross |

No red anywhere (design-system 16.3): the cross is neutral. Status text is never `--gd-gold` on the panel surface: gold on `--gd-night-warm-surface` measures about 4.4:1, below AA for 11px text, so gold appears there only in the glyph (non-text, 3:1 is enough).

- Gia's reply: one quote card, 16px below the list, using the dark variant of `.gd-quote` (design-system 16.10), whose background is `--gd-night-warm`, one step darker than the panel. Its role row shows Gia's avatar (`media/gia-avatar.webp`, 32px circle, 1px `--gd-gold-line` ring) followed 10px later by the role label `GIA` in `--gd-gold`. Quote `“They don’t need that information to complete this. I haven’t shared it.”` in `--gd-night-text`. No outcome line. This avatar is how Gia appears beside the man on this screen: the card sits on the photo next to the phone he is reading.

**Animation** (`js/gia-side.js`, `initGiaSide(section)`):

1. Text column reveals with the shared reveal (Section 4.5), delays 0 to 4. The controls list reveals as one block.
2. When the photo column is 30% visible, once:

| Time | Event |
|---:|---|
| 0.0s | Photo: `opacity 0 → 1` and `scale 1.04 → 1`, 1200ms, design-system ease |
| 0.6s | Request panel: `opacity 0 → 1`, `y: 24 → 0`, 700ms |
| 1.1s, 1.7s, 2.3s | Rows 1, 2, 3: the item appears (`opacity 0 → 1`, 400ms), then 400ms later its status appears (`opacity 0 → 1`, `scale 0.9 → 1`, 300ms) |
| 3.2s | Quote card: `opacity 0 → 1`, `y: 16 → 0`, 600ms; the avatar fades in with it |

No ambient loop. The photo is not pinned and has no parallax.

Reduced motion: everything visible at rest; the switches still toggle, without the thumb transition.

**Responsive.**

- 1100px to 769px: keep the two columns while the text column is at least 360px; otherwise stack as below.
- 768px and below (and whenever stacked): one column. The text column first, with section padding `var(--gd-section-pad-compact)` on top and 48px at the bottom. Then the photo as a full-bleed band, `aspect-ratio: 4 / 5` capped at `max-height: 80svh`, `object-position: 50% 25%`. The request panel leaves the photo and sits under it inside the page padding, overlapping the photo's bottom edge by 48px (`margin-top: -48px`, `position: relative`), with 72px section padding below it. Switch rows keep the label left and the switch right at every width.
- Verify at 1920, 1440, 1200, 1024, 768 and 375 that the man's face and the phone are never covered or cropped out.

> **Approved by the user on 2026-10-01 (task A10) — Screen 2b richer treatment.** The user rejected the first, restrained version of Screen 2a as pale and static, so Screen 2b is built with the same richer treatment from the start. The changes below apply to Screen 2b only and override the conflicting parts of this section. The copy is unchanged.
>
> **Contrast and depth.** New token `--gd-shadow-night-panel` (design-system 16.1).
>
> - Request panel: background `--gd-night-warm-surface`, 1px `--gd-gold-line` border, a 3px `--gd-gold` bar along its top edge (a background layer, so the radius clips it), `box-shadow: var(--gd-shadow-night-panel)` (`0 24px 60px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35)`).
> - Gia's quote card: avatar 40px circle with a 2px `--gd-gold` ring (as on 2a), role label `GIA` in `--gd-gold`, 1px `--gd-gold-line` border, `--gd-night-warm` background.
> - Row 1 status: check glyph in `--gd-gold`. Rows 2 and 3: once their status appears, the item text dims to `--gd-night-text-2` (300ms). They are not struck through (approved by the user on 2026-10-02): with every switch on, a struck-through row read as a contradiction, while these rows show Gia’s own judgement that the agency does not need the information. The strike-through is used only on row 1, when the member turns `What she can share` off (see Interaction below): a 1px `--gd-night-text-3` line draws through the item left to right (300ms, `transform: scaleX`), and it marks the member’s own refusal. The strike line needs the item on one line, so a request row may wrap: where the item and its status do not fit side by side, the status moves under the item, still right-aligned (row 1 below 768px; all three rows at 320px). Every item stays on one line from 320px up.
> - Text column: the key line in `--gd-gold`; a 48px-wide 1px `--gd-gold` rule 24px above the H2.
> - Measured contrast: on `--gd-night-warm` (#23201D) `--gd-night-text` 14.65:1, `--gd-night-text-2` 8.20:1, `--gd-gold` 5.05:1 (key line, quote-card `GIA` label); on `--gd-night-warm-surface` (#2E2A27) `--gd-night-text` 12.81:1, `--gd-night-text-2` 7.40:1 (panel label, dimmed items, withheld statuses), `--gd-gold` 4.42:1 (check glyph only, non-text). `--gd-night-text-3` carries no text (strike line, off-switch thumb). Switch on: `--gd-night` thumb on `--gd-gold` 5.55:1.
>
> **Gold glow and thread** (design-system 16.9 extended to Screen 2b).
>
> - Phone halo (raised by the user on 2026-10-02; the first 180px / .35 halo read too faint): two radial `--gd-gold` layers in one element with `mix-blend-mode: screen` — an outer glow about 260px across, `--gd-gold` at 60% at its centre fading to transparent at its edge (max opacity .6), and a brighter inner core about 90px across (radius 45px), `--gd-gold` at 45%, fading to transparent. The alphas sit in the layers, so the element's opacity runs 0 → 1. To keep it off the man's face, the halo is 260px except where it or its 1.8× pulse would reach the face box (30–68% of the image width, 10–42% of its height, hair included): there the size is `2 × distance to the face box ÷ 1.8`, measured with the phone point; the core keeps its 45/260 ratio. Measured sizes: 260px at 1920, 1440, 1199 and 1024 (stacked); 239px at 1200; 238px at 768; 114px at 375. Clearance between the full pulse edge and the face box: 50px at 1920, 14px at 1440, 53px at 1024, at least 0px elsewhere (at rest the halo edge is 46–207px from the face box). Centred on the phone at **87% of the image width and 59% of its height**. Measured on the image, the phone spans 77.5–97% of the width and 51.8–67.5% of the height (top-left corner at 82.6% / 52.5%; the left edge leans down to 79.5% / 58% before the fingers cover it). The point is mapped through the `object-fit: cover` crop; recomputed after the image and fonts load and on resize (debounced 150ms). Inside the photo column, which clips it.
> - Thread: one cubic curve from a 12px ringed node on the phone's left edge (**81.6% / 55.5%**) to a 12px ringed node centred on the request panel's top border, 40px from its right edge (an HTML node inside the panel). It leaves the phone horizontally and arrives on the border from above; 1.5px `--gd-gold`, round caps, one `drop-shadow(0 0 4px)` in the shared glow colour. Decorative SVG (`aria-hidden`, `pointer-events: none`) in the photo's grid cell, above the photo and below the panel. It never crosses the face (verified at 1920, 1440 and 1200; at least 89px below the chin).
> - Only in the two-column layout. Stacked: the halo stays, the thread and both nodes are dropped.
>
> **Layout fixes** (approved by the user on 2026-10-02; the geometry above broke this section's own rule that the face and phone are never covered or cropped).
>
> - Two columns from **1200px** up only; below 1200px the stacked layout applies (the 2a breakpoint). Measured: below about 1175px the 420px panel on the photo covers the phone, and narrowing it pushes it up into the face. This replaces the 1100–769px rule above.
> - Two-column photo: `object-position: 90% 30%` (was `50% 30%`, which cropped 39–63px off the phone's right side at 1440, 1200 and 1024). Only blurred background on the left is cropped; the face stays at least 95px from the column edge at 1200.
> - Stacked photo band: `width: 100%` and `max-height: max(80svh, 72vw)` (was `80svh`; 72vw confirmed by the user on 2026-10-02). On landscape tablets an 80svh band is too short to hold both the face and the phone; portrait tablets and phones are unchanged.
> - The panel, photo and thread share one grid cell (`grid-column: 1; grid-row: 1`; the panel `align-self: end; justify-self: start; margin: 32px`), so the panel is not clipped by the photo column.
>
> **Motion** (`js/gia-side.js`), triggered once when the photo column is 25% visible:
>
> | Time | Event |
> |---:|---|
> | 0.0s | Photo `opacity 0 → 1`, `scale 1.08 → 1`, 1600ms, design-system ease |
> | 0.6s | Phone halo fades in (element opacity `0 → 1`, 400ms) |
> | 1.0s | One halo pulse (a copy of the halo, `scale 1 → 1.8`, element opacity `1 → 0`, i.e. from the halo's full .6 / .45 layers, 900ms); the phone node pops in (`back.out(2.5)`); the thread draws from the phone to the panel (`stroke-dashoffset`, 700ms) |
> | 1.5s | Request panel `opacity 0 → 1`, `y: 32 → 0`, `scale .97 → 1`, 700ms; its top node pops in at 1.7s, as the thread arrives |
> | 2.2s, 2.9s, 3.6s | Rows 1–3: the item appears (300ms); a 2px `--gd-gold` scan line sweeps across the row left to right (400ms) and fades (150ms); at +0.45s the status pops in (`opacity 0 → 1`, `scale .8 → 1`, `back.out(2)`); for rows 2–3 the dim (300ms, no strike-through) follows at +0.75s |
> | 4.4s | Quote card `opacity 0 → 1`, `y: 16 → 0`, 600ms, avatar with it |
>
> - Text column: shared reveal. Switches: when the controls list is 35% visible, they turn on one after another, 200ms apart (thumb slides, track fills gold, one soft gold glow pulse on the track). With JavaScript and motion they start off; `aria-checked` is set together with the visual state at every step. Without JavaScript they render on. A switch the member has already clicked is not changed by this sequence.
> - Ambient, only while the section is visible (paused off-screen): every 4s a 6px glowing `--gd-gold` particle travels along the thread from the panel to the phone (1.2s, `getPointAtLength`); the halo pulses once (`scale 1 → 1.8`) when it arrives. Two-column layout only.
> - Interaction: turning `What she can share` off changes row 1's status from `Shared` to `Not shared` (cross glyph, `--gd-night-text-2`, the row dims like rows 2–3 and, unlike them, is struck through); turning it back on restores `Shared` and removes the strike-through. Row 1's status element is `aria-live="polite"`. The other switches only toggle. Nothing is saved or sent.
> - Reduced motion: everything at rest, thread drawn, halo static, no particle, no pulses, no scan lines; switches toggle instantly (no transition) and the share interaction still works.
>
> This replaces the animation table above and the "no ambient loop" rule for Screen 2b.

---

### 5.3 Screen 3 — Everything connects

**Purpose.** Show that Gia connects different parts of a person's life. Conceptual clarity, not product detail. Prepares the visitor for Screen 4.

**Asset.** `media/gia-tablet.webp`, 1279×1062, transparent background: Gia on a video call on a tablet. It is the centrepiece and the page's largest view of Gia (since 2026-10-01 she also appears on the tablet in the Screen 2a photo and as a small avatar on Screen 2b).

- `alt="Gia on a video call, speaking and gesturing as she explains"`, `width="1279" height="1062"`, `loading="lazy"`, `decoding="async"`.
- The screen area of the tablet inside the image is approximately `left 4.5%, top 5.2%, width 91.3%, height 89.5%`. Overlays placed "on the screen" use these percentages on a wrapper that matches the image box exactly.
- The image contains baked call controls, including a red end-call button. This is an approved asset exception (design-system Section 16.3). Never add other red to the page, and never place overlays over the bottom 16% of the screen area where the controls sit.
- Depth: `filter: drop-shadow(var(--gd-shadow-tablet))` on the image (`0 24px 48px rgba(57, 43, 24, 0.14)`). This is the screen's only drop shadow; the soft gold glows of the connection visuals (design-system Section 16.9) are the only other depth effects.

**Visual target.** `references/screen-3-target.png` (approved mockup, reworked in A4).

**Layout.** `gd-section gd-section--soft` (background `--gd-bg-soft`, the light alternate, which separates it from the ivory Screen 4 poster edge and the dark Screen 2).

> **Approved (2026-10-01)** — with Screens 2a and 2b inserted, Screen 3 follows the dark Screen 2b instead of Screen 2. Its background and layout are unchanged.

1. Centred header, max-width 720px: H2.
2. The connection stage, 64–96px below the header, full container width: a 3-column grid `minmax(0, 1fr) minmax(0, clamp(320px, 42vw, 560px)) minmax(0, 1fr)`, column gap 48px, rows `1fr auto 1fr auto 3fr auto`. Centre column: the tablet, spanning rows 1–5. Areas 1 and 2 sit in rows 2 and 4 of the left column at its outer (left) edge; areas 3 and 4 mirror them at the outer (right) edge of the right column. The flexible rows put the icons of areas 1–4 near 17% and 53% of the tablet height, above the tablet attachment points, so every line is a visible S-curve. Area 5 sits in row 6, centred under the tablet, 32px below it.
3. Text block, centred as a block (max-width 560px), left-aligned text, 64px below the stage: body paragraph 1, body paragraph 2, key line, button.

| Element | Copy | Style |
|---|---|---|
| H2 | `Your life isn’t made of separate decisions.` | H2 large centred |
| Area 1 (left, upper) | `A home.` | H3, `--gd-text-primary` |
| Area 2 (left, lower) | `Money.` | H3 |
| Area 3 (right, upper) | `A move.` | H3 |
| Area 4 (right, lower) | `Business.` | H3 |
| Area 5 (below) | `What comes next.` | H3 |
| Body 1 | `Gia helps you see how those decisions connect — and what opportunities may be relevant to you.` | Body, `--gd-text-secondary` |
| Body 2 | `She brings your goals, progress and next steps into one clear picture.` | Body, 16px below body 1 |
| Key line | `One place to understand what’s possible.` | Large data phrase, `--gd-gold-deep`, 32px below body 2 |
| Button | `Explore with Gia` | `.gd-button--primary`, 32px below key line |

The five areas are an `<ul class="gd-areas">` for semantics even though CSS places them around the tablet: the list spans the whole stage and uses `grid-template-columns: subgrid; grid-template-rows: subgrid`, and each item is placed by `grid-area` name (never positioned absolutely).

**Areas 1–4.** Each item is a centred column: an icon circle above its H3 label, 16px gap. The icon circle (`.gd-areas__icon`, `aria-hidden`) is 64px, 1px `--gd-gold` border, a `radial-gradient(closest-side, var(--gd-surface), var(--gd-gold-soft))` fill and a soft gold glow, holding a 28px inline-SVG glyph filled `--gd-gold-deep`: a house (`A home.`), a stack of coins (`Money.`), a map pin (`A move.`), a briefcase (`Business.`). Each icon circle carries its area node: a 12px ringed dot (2px `--gd-gold` border, `--gd-surface` fill, soft gold glow), centred 14px outside the circle on the side facing the tablet, level with the icon centre.

**Area 5.** No icon. A larger 20px node in flow above the label: a 7px `--gd-gold` centre on `--gd-surface`, 2px `--gd-gold` ring, a 6px `--gd-gold-soft` halo ring and a soft gold glow.

**Orbit decoration.** A static dotted ellipse (`aria-hidden`) centred on the tablet, 136% × 118% of the tablet box, 1px dotted `--gd-gold-line`, with a 6px glowing `--gd-gold` dot at its top and seven small `--gd-gold` specks (3–4px, 30–45% opacity) placed along and around it. It sits outside the floating tablet group, so it never floats, and paints below the tablet and the lines. Hidden at 1100px and below.

**Connector lines.** One absolutely positioned decorative SVG (`aria-hidden="true"`, `pointer-events: none`) covers the stage, above the tablet and below the areas. `js/gia-connect.js` measures, from layout offsets (never transformed rects), each area node's centre and five attachment points on the tablet's outer frame edge (the frame fills the image box): left edge at 36% and 64% of the tablet height for areas 1 and 2, right edge at 36% and 64% for areas 3 and 4, bottom centre for area 5. It draws one cubic S-curve per area from the area node to its attachment point, with horizontal tangents at both ends (vertical for area 5), `--gd-gold`, 2px, round caps, with a soft gold glow (one `drop-shadow` on the SVG, which also glows the tablet nodes and the particle). Each line has a node at both ends: the area node at the area end (HTML, painted above the line) and a tablet node at the attachment point (SVG, 12px ringed dot matching the area node, centred on the frame edge, painted above every line), plus an invisible pulse ring behind the tablet node. Recompute on load, after the image and fonts load, and on resize (debounced, 150ms). Never recompute during an animation frame.

**Animation** (`initGiaConnect(section)`), triggered once when the stage is 30% visible:

| Time | Event |
|---:|---|
| 0.0s | Tablet: `opacity 0 → 1`, `y: 24 → 0`, 800ms, design-system ease |
| 0.3s | Soft halo behind the tablet fades in: an ellipse `radial-gradient(closest-side, var(--gd-gold-soft), transparent)` sized 120% × 110% of the tablet, `aria-hidden` |
| 0.6s | "Live" marker on the tablet screen, top-left inside the screen area (24px inset): a 12px mono label `GIA` next to an 8px `--gd-gold` dot, on a `rgba(30,35,40,.55)` rounded-4px chip, 26px tall. Fades in 300ms. |
| 0.9s–3.8s | Per area, in order 1, 2, 3, 4, 5, each starting 240ms after the previous (area `n` starts at `t = 0.9 + 0.24 × (n − 1)` s): at `t` the area appears, `opacity 0 → 1`, `x: ±16 → 0` toward the tablet (area 5: `y: 16 → 0`), 600ms, design-system ease; at `t + 0.45` its area node scales `0 → 1`, 250ms, `back.out(2)`; at `t + 0.6` its line draws from the area toward the tablet with `stroke-dashoffset`, 700ms, `power1.inOut`; at `t + 1.3`, when the line arrives, the tablet node pops in (`scale 0 → 1`, 300ms, `back.out(2.5)`) with one pulse ring (`scale 1 → 2.4`, `opacity 0.6 → 0`, 600ms) |
| 2.4s | Text block reveals (shared reveal, delays 0–3), while the last areas are still connecting |

Ambient (after the sequence, while visible, paused off-screen):

- The live dot pulses: `opacity 1 → 0.35 → 1`, 2.4s, infinite.
- The halo breathes: `scale 1 → 1.04 → 1`, 7s, infinite, `ease-in-out`.
- Every 4s one connector carries a 6px `--gd-gold` particle from its area to the tablet (1.4s, `ease-in-out`), cycling through areas 1→5, fading in and out at the ends of the path. Implemented with `getPointAtLength` on the existing path; transform and opacity only. (6px rather than 4px: a 4px particle barely shows on the 2px line.)
- Tablet floats `y: 0 → −4px → 0`, 8s, infinite. On every float update the tablet end of each line and its tablet node are redrawn from the cached geometry plus the float offset, so both ends stay attached. Lines never detach visibly.

Reduced motion: everything at rest and visible, lines fully drawn, all nodes visible, no pulse, no halo breathing, no particle, no float, live dot static.

**Responsive.**

- 1100px and below (stacked layout): the stage becomes two rows. Row 1: tablet centred, `width: min(100%, 520px)`. Row 2: the five areas as a 2-column list (column gap 48px, row gap 24px; area 5 spans both), under a 1px `--gd-line` rule with 24px above the first row. Each area is a row with its icon circle, reduced to 48px (22px glyph), left of the label; area 5 has its 20px node, centred in a 48px slot so its label lines up with the others. The SVG lines, tablet nodes, area nodes on the icon circles, particle and orbit are hidden. Areas animate in with `y: 16 → 0`.
- 480px and below: areas in one column.
- The text block remains centred as a block, max-width 560px.

---

### 5.4 Screen 4 — Gia in your life / horizontal scroll story

**Purpose.** Concrete examples of how Gia helps in real life, as one continuous walk. Four content stops, each opening a side brochure. Final CTA at the end of the same screen.

**Reference effect.** `references/oceanx-horizontal-story-reference.mp4` (study it frame by frame before building). What to reproduce:

1. A full-bleed background video pinned for the whole runway and scrubbed by vertical scroll — the subject stays roughly central and keeps moving while the visitor scrolls.
2. Content "chapters" on one continuous horizontal track (as on 2025.oceanx.org): the track glides right to left linearly with scroll, with no holds, so each chapter enters from beyond the right edge and exits beyond the left edge while the next one follows. Chapters may cross the subject while moving.
3. Chapters sit at different heights and zones in the frame.
4. Each chapter: small mono chapter label, eyebrow in accent colour, large headline, one short line, one button.
5. Quiet persistent chrome: a thin progress line along the top of the stage and a small chapter counter in a corner.

What not to reproduce: the dark ocean palette, white-on-dark text, pill buttons with coloured dots, audio toggle, share button, or any OceanX copy or branding.

**Footage.** `media/gd-walk.mp4`, 8.0s: Gia walks toward the camera across a marble plaza in front of classical architecture under a clear blue sky, framed roughly in the centre (her figure occupies approximately 45–68% of the frame width and 30–83% of its height). The background barely moves. There is no camera pull-back in the footage; the final "wider shot" is simulated with scale (see below).

**Safe zones** (percent of the stage width, after `object-fit: cover`): Gia’s band is `40%–70%`. Chapter cards cross it while moving on the track; the final CTA card, the only card that comes to rest, stays clear of it. Left content zone: container left edge to `38%`. Right content zone: `72%` to container right edge. Verify at 1920×1080, 1440×900, 1024×768 and on 16:10 and 4:3 ratios; if cover-cropping pushes Gia outside the safe band, adjust `object-position` (default `55% 50%`), not the zones.

**Section structure.**

- `#screen-4`, class `gd-story`, `data-screen="life"`. Runway wrapper height `650vh`.
- Sticky stage: `position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden` (overflow on the stage itself only).
- Layers inside the stage, bottom to top: video (`.gd-story__video`, blob-loaded, `muted playsinline`, poster `gd-walk-poster.jpg`, cover), module layer (modules and the final CTA card), chrome layer. There is no veil on Screen 4.
- The stage's inner content is offset by the fixed header height (72px desktop / 64px mobile) so nothing important sits under the header.

**Scroll model** (`js/gia-story.js`, `initGiaStory(section)`). One normalised progress `p` from 0 (stage pinned) to 1 (pin releases). Reuse the Screen 1 smoothing formula for `p` so the video and modules move together without jitter.

- Video: `currentTime = smoothedP × duration` over the whole runway, seek only when `!video.seeking`. Gia never stops walking.
- Video scale (simulated pull-back): `scale 1.04` from `p = 0` to `0.80` (a deliberately subtle design choice), then eases to `1.00` by `p = 0.98` (`power1.inOut`), `transform-origin: 55% 60%`. Transform only; it never affects layout.
- Track (approved 2026-09-30, replaces the earlier enter/hold/exit table): the four chapter cards sit on one horizontal track and move right to left linearly with `smoothedP`, with no holds, no easing and no opacity change. Each card's screen-space left edge is `x = W + i × S − v × p` (`W` stage width, `i` = 0–3, `v` the track speed); the card moves by `translateX(x − rest)` from its zone rest position, so it keeps its zone width and vertical anchor. Spacing `S = max(0.75 × W, widest card + 0.12 × W)` (the minimum keeps the full-width mobile cards from overlapping). At `p = 0` card 4.1 is just beyond the right edge; `v` is set so card 4.4's right edge leaves the screen at `p = 0.86`. Everything is a pure function of `p`, fully reversible.
- Final CTA: the next card on the same track at the same speed, `x = rest + v × max(0, 0.94 − p)`. It settles in the left zone at `p = 0.94` and holds to `p = 1` with no exit. At the same speed it enters from the right while card 4.4 is still crossing (about `p = 0.70`, roughly 0.58 × `W` behind it).
- Spacing and the two anchor values (`0.86`, `0.94`) may be tuned in the browser for feel; if tuned, update this section in the same task.

**Zone geometry** (approved 2026-09-30, resolves the conflict between the right zone and the card width). The zones are measured from the stage edge inset by the page padding (`--gd-page-pad`), not from the 1200px container. A card is `min(440px, 34%)` of the stage width and never wider than its zone: left cards `min(440px, 34%, 38% − pad)` starting at the inset left edge; right cards `min(440px, 34%, 28% − pad)` ending at the inset right edge. Below a 1400px stage width the right zone is narrower than 340px, so every module uses the left zone.

**Module positions.** Alternate zones: 4.1 left, 4.2 right, 4.3 left, 4.4 right (all left below 1400px, see above). Vertical anchor: module top at `46%` of the stage height (below the rooflines, over the plaza and building base). All four cards share one top: if the tallest card would then run into the 96px reserved above the stage bottom for the chapter counter, the shared top moves up just enough for that card to clear it, and the shorter cards move up with it (approved 2026-09-30).

**Module component** (`<article class="gd-module">`):

- Surface: `rgba(255, 253, 248, 0.92)` (the `--gd-surface` colour at 92%), 1px `--gd-line`, radius 8px, padding 32px, width `min(440px, 34vw)` capped by its zone (see Zone geometry). No blur, no shadow. The solid surface guarantees contrast over the bright plaza.
- Chapter label: IBM Plex Mono 500, 11px, `0.12em`, uppercase, `--gd-text-secondary` (`--gd-text-tertiary` measured 3.8:1 on the card over the video), preceded by a 6px `--gd-gold` square. Format `CHAPTER 01` to `CHAPTER 04`.
- Eyebrow: eyebrow style, `--gd-gold-deep`, 12px below the label.
- H3: `clamp(24px, 2.4vw, 34px)`, 600, line-height 1.15, 12px below eyebrow.
- Text: small body, `--gd-text-secondary`, 12px below the H3.
- Button: `<button type="button" class="gd-button gd-button--secondary gd-module__cta" aria-haspopup="dialog" aria-controls="brochure-…" aria-describedby="module-…-title">`, 24px below text. It opens the module's side brochure (Section 5.4a). The module H3 carries `id="module-{homes|finances|moving|possibilities}-title"`, so each identical `Learn more` button is described by its card's heading.

| Module | Eyebrow | H3 | Text | Button | Opens |
|---|---|---|---|---|---|
| 4.1 | `FIND A HOME` | `Find a home that fits the life you want.` | `Gia helps you explore housing options, compare possibilities, and understand what may fit your plans.` | `Learn more` | `#brochure-homes` |
| 4.2 | `UNDERSTAND YOUR FINANCES` | `See what’s possible before you decide what’s next.` | `Gia helps bring your financial picture, goals, and available options together so you can plan with more clarity.` | `Learn more` | `#brochure-finances` |
| 4.3 | `PLAN A MOVE` | `Turn a move into a plan.` | `Gia can help organize the steps around moving, property decisions, and what comes next.` | `Learn more` | `#brochure-moving` |
| 4.4 | `BUILD WHAT COMES NEXT` | `Your next opportunity may start with one conversation.` | `Explore business, travel, education, and other possibilities as they become part of your journey.` | `Learn more` | `#brochure-possibilities` |

The four button labels were changed from the chapter action labels to `Learn more` on 2026-09-30; those labels now appear as each brochure's primary action (Section 5.4a.3).

> **Approved by the user on 2026-10-02 — chapter card depth and gold.** The user found the four chapter cards too faint. The changes below apply to the four `.gd-module` cards only; the final CTA card, the track, the video, the timing, the brochures and all copy are unchanged. The translucent surface is kept exactly: `--gd-surface` at 92%, no blur.
>
> - Border: 1px `--gd-gold-line` (was `--gd-line`), plus a 3px `--gd-gold` bar along the top edge, clipped by the 8px radius (the card has `overflow: clip`; it contains no sticky element).
> - Depth: `box-shadow: var(--gd-shadow-card), 0 10px 30px rgba(21,24,28,.22)` (written as `--gd-night` at 22%). This replaces "no shadow" above, for the chapter cards only.
> - `Learn more`: 1px `--gd-gold` border; on hover and focus the border turns `--gd-gold-deep` with a soft glow `0 0 0 4px var(--gd-gold-soft)`, 200ms. The focus outline (Section 4.2), the dot and the behaviour are unchanged.
> - Entrance, once per card: the first time the card becomes interactive (its `Learn more` button fully inside the stage, the existing `inert` threshold), it fades in (`opacity 0 → 1`) and rises (`y: 16 → 0`), and the gold bar draws left to right (`scaleX 0 → 1`, `transform-origin: left`), all 600ms, design-system ease. The user chose this trigger over the literal "rest position": the track has no holds, and left-zone cards reach their rest position only after crossing about 60% of the stage, so they would be invisible while crossing. The rise uses the CSS `translate` property, which composes with the track's inline `transform`; the track position stays a pure function of `p`. The entrance does not replay when scrolling back. This replaces "no opacity change" in the scroll model above for the chapter cards' one-time entrance only. Reduced motion, short viewports and no JavaScript: cards at rest, bar drawn.
> - Measured contrast on the unchanged 92% surface, over every pixel of the walk video frames behind the card zone (21 points across the runway at 1920, 1440, 1200, 1024, 768 and 375; the frames contain pure white and pure black, so the worst case equals the black-background bound): `--gd-text-primary` (H3, button) 13.0:1, `--gd-text-secondary` (label, text) 5.9:1, `--gd-gold-deep` (eyebrow) 4.8:1; over white 15.6, 7.1 and 5.8:1. All AA.
> - At rest, no chapter card overlaps Gia's figure at 1920, 1440, 1200 or 1024. Cards still cross her while moving (approved track). At 768 and 375 the docked full-width cards cover the lower part of her figure box (legs; 22% and 40% of the box), never her face or torso; this is the approved mobile docking, unchanged.

Headings on the page stay in order: H2 for the section (visually hidden, text `Gia in your life`), H3 per module, H2 for the final CTA. The visually hidden H2 uses the standard `.visually-hidden` utility.

Interactivity (approved 2026-09-30): a module's button is focusable and clickable only while the button itself is fully inside the stage (the viewport), at every width; otherwise `inert` is set on the module (toggle on threshold crossings, not every frame). Keyboard users tabbing into a module that is off-screen must never happen.

**Final CTA** (`<div id="screen-4-final" class="gd-story__final">`), left content zone, vertically centred in the stage, on a solid card identical to the module card (same surface, border, radius and padding), width `min(520px, zone width)`; on mobile full container width, docked like the modules. The static (reduced-motion) composition keeps it without a card, centred on `--gd-bg`:

| Element | Copy | Style |
|---|---|---|
| H2 | `Start with Gia.` | H2 large centred scale, left-aligned here, `--gd-text-primary` |
| Line 1 | `You don’t have to plan everything today.` | Lead, `--gd-text-secondary`, 24px below H2 |
| Line 2 | `Start with one question.` | Lead, `--gd-text-secondary` |
| Button | `Meet Gia` | `.gd-button--primary`, 48px below lines |
| Supporting line | `Talk. Explore. Plan what’s next.` | IBM Plex Mono 500, 12px, `0.06em`, sentence case (not uppercase), `--gd-text-secondary`, 16px below button |

No legibility veil: the card carries the contrast (approved 2026-09-30, replacing the earlier ivory veil, which failed AA over the video).

The final CTA follows the same `inert` rule as the modules (clickable while its `Meet Gia` button is fully inside the stage, which always includes `p ≥ 0.94`).

**Chrome.**

- Progress line: 2px tall, full stage width, top of the stage just below the header, track `--gd-line-soft`, fill `--gd-gold`, `scaleX = p`, `transform-origin: left`. `aria-hidden`.
- Chapter counter: bottom-left at the stage edge inset by the page padding, 32px from the stage bottom, IBM Plex Mono 500, 12px: `01 / 04` … `04 / 04`: the active chapter is the card whose centre is nearest 35% of the stage width; hidden once the final CTA card is nearer that point than any chapter card. `aria-hidden` (the modules themselves carry the meaning).
- Four small ticks under the counter (8px × 2px, gap 6px), the active one `--gd-gold`, others `--gd-line`. `aria-hidden`.

**Side brochures** are specified in full in Section 5.4a below. `js/brochure.js` exports `initBrochures(root)`; `js/gia-story.js` exposes nothing global — the two talk through a `CustomEvent` on the section (`gd:brochure-open` / `gd:brochure-close`) so the story can freeze and resume.

**Reduced motion, and short viewports** (`prefers-reduced-motion: reduce` or `max-height: 560px`): no runway, no pin, no scrub. Screen 4 becomes a normal section: `gd-walk-poster.jpg` as a full-bleed band (`aspect-ratio: 16/9`, max-height 80svh, `object-fit: cover`), then the four modules as a normal 2×2 grid (1 column below 768px) on `--gd-bg`, then the final CTA centred in a CTA composition (design system 7.3). Brochures work the same, without animation. Chrome hidden.

**Mobile (768px and below, normal motion).** Keep the pin and scrub. Modules and the final CTA dock to the bottom of the stage: full container width, `bottom: calc(24px + env(safe-area-inset-bottom))`. The modules share one top, set by the tallest card, so only the tallest card sits exactly at that bottom offset and shorter cards end slightly higher (approved 2026-09-30). Card padding 24px, H3 `clamp(22px, 6vw, 26px)`; the horizontal travel is the same. The final CTA card docks to the bottom like the modules. Video `object-position: 55% 40%` so Gia sits above the cards. Counter moves to the top-left under the progress line, on the small dark chip from design-system 16.2 (26px tall, `--gd-text-primary` at 55%, radius 4px, light `--gd-surface` text, count and ticks on one row).

**Missing video.** Poster as a static background, the card track still runs on scroll.

---

### 5.4a Screen 4 — Side brochures (OceanX-style reading panel)

**Reference.** `references/oceanx-brochure-panel.png` (screenshot of an open chapter panel on the reference site). What to reproduce: clicking a chapter's button opens a large panel that slides in from the right and covers almost the whole viewport, leaving a thin strip of the pinned story visible on the left. The panel is split in two: a tall media column on the left that stays in place, and a light reading column on the right that scrolls independently — tag chips, a very large title, a subtitle, body text, inline media, more body. A round close button sits at the top-right. What not to reproduce: OceanX copy, colours, map imagery, or video player.

**Content source.** `references/brochure-copy.txt` (designer-supplied, approved 2026-09-30). It fully replaces the earlier PDF-based copy, which is retired; the PDF (`references/gia-brochure-source.pdf`) remains the source of the brochure images only. All brochure copy below is used verbatim. One approved exception: in brochure 4, Story 1, the source's `the same assistant` is replaced by `Gia` (terminology lock, Section 4.3). Quoted lines keep the `“` `”` from the source file; outcome lines are stored in sentence case and uppercased with CSS.

**Mapping from the copy file** (approved 2026-09-30):

1. `CHAPTER 0n — NAME`: tag chip 1 = the chapter name (e.g. `FIND A HOME`), tag chip 2 = the chapter number (e.g. `CHAPTER 01`). The marker chip on the image keeps the chapter name.
2. The first line after the chapter heading = title H2. The bold paragraph after it = subtitle.
3. Each `###` heading = one story section (H3) with the paragraphs under it. Bulleted lists use the gold-bullet list.
4. Quoted lines = the quote card. Gia's lines carry the role label `GIA`. The first quote in chapter 02 (`“What can all of this provide for my life?”`) is the visitor's own question and is shown in the card without a label. A bold line directly after a quote = that card's outcome line.
5. The chapter 03 process line is one row of small step chips joined by arrows (Section 5.4a.2), wrapping on narrow widths; the arrows are text, so the whole sequence is read as one sentence.
6. Chapter 04's `One conversation. More possibilities.` = the closing line. Chapters 01–03 have no closing line.
7. The final bold line of each chapter = the brochure's primary action button (destination TODO), followed by `Back to the story`.
8. Images and their positions are unchanged; the inline figure follows the first story section.

#### 5.4a.1 Triggers (the buttons under the module text)

- Every module has one real `<button type="button" class="gd-button gd-button--secondary gd-module__cta" aria-haspopup="dialog" aria-controls="brochure-…" aria-describedby="module-…-title">` directly under its short text (labels in the Section 5.4 module table). It opens that module's brochure.
- The button carries a trailing 6px `--gd-gold` dot (`::after`, decorative), echoing the reference's "learn more" control. This is the only button on the page with a decorative mark (design-system Section 16.6).
- Hit area at least 44px tall; `cursor: pointer`; hover: border `--gd-gold-deep` and the dot scales to 1.3 (200ms); focus ring per Section 4.2.
- Clickable while the button itself is fully inside the stage, at every width (Section 5.4 `inert` rule).
- On click, the story freezes: the smoothing loop keeps the current `p` and stops chasing scroll until the brochure closes. The page does not scroll or jump.

#### 5.4a.2 Panel structure

Four native `<dialog class="gd-brochure" id="brochure-homes|brochure-finances|brochure-moving|brochure-possibilities" aria-labelledby="…-title">`, opened with `showModal()`.

```
dialog.gd-brochure
  button.gd-brochure__close        (top-right, fixed to the panel)
  div.gd-brochure__media           (left column, does not scroll)
    img                            (main image, cover)
    p.gd-brochure__marker          (small marker chip, bottom-left)
  div.gd-brochure__body            (right column, scrolls; tabindex="-1")
    div.gd-brochure__tags          (two chips)
    h2.gd-brochure__title
    p.gd-brochure__subtitle
    section.gd-brochure__story  ×n (h3, paragraphs, optional list, optional process row, optional quote card)
    figure.gd-brochure__figure     (inline image, after the first story section)
    p.gd-brochure__closing         (brochure 4 only)
    div.gd-brochure__actions
```

**Geometry (desktop, above 1100px).**

- Dialog: `position: fixed; inset: 0 0 0 auto; margin: 0; width: calc(100vw - 96px); max-width: none; height: 100svh; max-height: none; padding: 0; border: 0`. Display grid `minmax(0, 40fr) minmax(0, 60fr)`. The 96px strip on the left shows the dimmed pinned story behind the backdrop, as in the reference.
- Backdrop: `rgba(21, 24, 28, 0.55)`, no blur. Clicking the visible strip closes the panel.
- Media column: full panel height, `overflow: hidden`, image `object-fit: cover` with the per-brochure `object-position` below. Marker chip bottom-left, 32px inset: 10px outlined square (`1px solid --gd-gold`, 2px inner filled square) followed by the chapter eyebrow in IBM Plex Mono 500, 11px, `0.12em`, uppercase, `--gd-night-text` on a `rgba(30, 35, 40, 0.55)` chip, 28px tall (design-system 16.2).
- Body column: `--gd-surface-elevated` background, `overflow-y: auto; overscroll-behavior: contain`, padding `72px clamp(40px, 5vw, 88px) 96px`. All content inside a 640px max-width column aligned left.
- Close button: 44px circle, `--gd-text-primary` fill, white inline-SVG cross 14px, `position: absolute; top: 20px; right: 20px`, `aria-label="Close"`. Focus ring `--gd-gold`, offset 3px.

**Typography and rhythm inside the body column.**

| Element | Style | Spacing |
|---|---|---|
| Tag chip 1 | IBM Plex Mono 600, 11px, `0.08em`, uppercase; background `--gd-text-primary`, text `--gd-bg`; padding 6px 10px; radius 2px | first element |
| Tag chip 2 | same type; background `--gd-sky-soft`, text `--gd-sky-deep` | 6px after chip 1 |
| Title H2 | IBM Plex Sans 600, `clamp(40px, 4.6vw, 68px)`, line-height 1.04, `-0.03em`, `--gd-text-primary` | 20px after tags |
| Subtitle | IBM Plex Sans 500, `clamp(22px, 2vw, 28px)`, line-height 1.3, `--gd-text-primary` | 32px after title |
| Story H3 | H3 scale (design system 4.2) | 56px before, 16px after |
| Paragraph | Body scale, `--gd-text-secondary` | 16px between paragraphs |
| List | Small body, `--gd-text-primary`; 8px `--gd-gold` round bullet; row gap 10px | 24px after paragraph; a paragraph after a list starts 24px below it |
| Process row (brochure 3) | `<p class="gd-brochure__process">`: one chip per step (IBM Plex Mono 500, 12px, `--gd-text-primary`, `--gd-bg` fill, 1px `--gd-gold-line` border, radius 4px, padding 6px 10px), joined by `→` in `--gd-gold-deep`; flex row, gap 8px, wraps | 24px after paragraph |
| Figure | `aspect-ratio: 16 / 10`, radius 6px, `object-fit: cover`, full column width | 48px before and after |
| Closing line (brochure 4 only) | Lead scale, `--gd-text-tertiary` | 64px before, after a 1px `--gd-line` rule |
| Actions | `.gd-button--primary` with the brochure's action label (Section 5.4a.3, destination TODO) + `.gd-button--secondary` `Back to the story` (closes the panel) | 32px after the closing line; without one, 64px after the last story, above a 1px `--gd-line` rule with 32px padding |

**Quote card** (`<figure class="gd-quote">` with `<figcaption>` for the role and `<blockquote>` for the line):

- `--gd-bg` background, 1px `--gd-gold-line` border, radius 8px, padding 28px 32px, 24px after the story paragraph.
- Role label (`figcaption`, placed first visually): IBM Plex Mono 600, 11px, `0.1em`, uppercase, `--gd-text-primary`: `GIA` on Gia's lines. The visitor's own question (brochure 2) has no `figcaption`; its quote starts at the top of the card.
- Quote: IBM Plex Sans 400, 18px, line-height 1.6, `--gd-text-primary`, with the `“ ”` from the copy, 12px after label.
- Optional outcome line (where listed): 1px `--gd-line-soft` rule, then IBM Plex Mono 600, 12px, `0.08em`, uppercase via CSS, `--gd-gold-deep`, 16px padding-top.

**Motion.**

- Open: panel `translateX(100%) → 0`, 560ms, `cubic-bezier(.22,.61,.36,1)`; backdrop fades in over 300ms; the main image scales `1.06 → 1` over 1200ms; then the body content reveals in order (tags, title, subtitle, first story), each `opacity 0 → 1`, `y 16 → 0`, 500ms, stagger 80ms, starting 240ms after the slide begins. Later sections reveal once as they scroll into the body column (`IntersectionObserver` with the body column as `root`, threshold 0.2).
- Close: panel slides out `0 → 100%`, 380ms, `power2.in`; backdrop fades out; then the dialog closes.
- Reduced motion: no slide, no scale, no staggered reveal — instant open and close with content fully visible.

**Behaviour.**

- On open: `html.is-brochure-open { overflow: hidden }` locks the page; the story's `p` is frozen (5.4a.1); the body column scrolls to top; focus moves to the body column's title (`tabindex="-1"`).
- Close on the close button, Escape, a click on the backdrop strip, or `Back to the story`. On close: restore the exact window scroll position, unfreeze the story, return focus to the triggering module button.
- Only one brochure can be open at a time.
- Deep links: `#brochure-homes`, `#brochure-finances`, `#brochure-moving`, `#brochure-possibilities` in the URL open that brochure on load after the story has initialised; opening from a button sets the hash with `history.replaceState` (no new history entry); closing clears it the same way. An unknown hash is ignored.

**Responsive.**

- 1100px and below: panel becomes full width (`width: 100vw`), single column. The media column becomes a top band inside the scrolling body (`height: 42svh`, cover), marker chip stays bottom-left of the band; the close button stays fixed at the top-right above the band with a 1px `rgba(247,243,235,.4)` ring for contrast.
- 768px and below: body padding 24px; title `clamp(32px, 8vw, 44px)`; figure keeps 16:10; the two action buttons stack full width.
- Panel entry on mobile: `translateY(24px) → 0` with fade instead of the side slide, 420ms.

#### 5.4a.3 Brochure content

Media files are in `media/brochures/` (extracted from the brochure PDF, resized, WebP). All images get meaningful `alt` text as listed, `width`/`height` attributes, and `loading="lazy"` (they load only when the dialog first opens; set `src` from `data-src` on first open).

---

**Brochure 1 — `brochure-homes`** (opened by the `Learn more` button on module 4.1)

- Main image: `media/brochures/b-homes-main.webp` (1535×1024), `object-position: 30% 50%`, alt `A woman relaxing on her sofa with coffee, talking with Gia on a tablet`.
- Marker chip: `FIND A HOME`
- Tag chips: `FIND A HOME` · `CHAPTER 01`
- Title H2: `Find a home that fits the life you want.`
- Subtitle: `Gia helps you explore homes, understand what fits your needs, and make clearer decisions about where and how you want to live.`

Story 1 — H3 `A Home That Fits You.`
- P: `Gia can help you search for properties, compare options, research details, and keep track of the things that matter most to you.`
- P: `With your permission, she can remember your preferences, your priorities, and the criteria you have already discussed, so you do not have to start from the beginning every time.`
- List (gold bullets): `Property Discovery` · `Personal Preferences` · `Clearer Comparisons`

Figure: `media/brochures/b-homes-inline.webp` (1176×1024), `object-position: 50% 55%`, alt `A family gathered around an outdoor dinner table at night, with a tablet showing a message from Gia`.

Story 2 — H3 `Understand the Property.`
- P: `Gia can organize useful information about a home, including its condition, maintenance needs, improvements, local services, and nearby options.`
- P: `Instead of giving you disconnected pieces of information, she helps bring the details together so you can understand the property in the context of your life.`
- Quote card — role `GIA`; quote `“I found a Glonari Home that fits the criteria we’ve been discussing.”`; outcome `A better decision starts with a clearer picture.`

Story 3 — H3 `See the Home as Part of Your Life.`
- P: `A home is more than a property. It is part of the life you are building.`
- P: `Gia can help you look at housing together with your resources, your lifestyle, and the plans you have for the future. The goal is not simply to find a place, but to understand what kind of home fits the life you want to create.`

Primary action: `Explore Homes`

---

**Brochure 2 — `brochure-finances`** (opened by the `Learn more` button on module 4.2)

- Main image: `media/brochures/b-finances-main.webp` (1536×1024), `object-position: 22% 50%` (keeps the tablet in frame), alt `A woman holding a tablet showing Gia and a privacy screen that reads You’re in control`.
- Marker chip: `UNDERSTAND YOUR FINANCES`
- Tag chips: `UNDERSTAND YOUR FINANCES` · `CHAPTER 02`
- Title H2: `Understand what your resources can provide before deciding what comes next.`
- Subtitle: `Gia helps bring your financial picture together, so you can see not only what you have, but what it may support in your life.`

Story 1 — H3 `See the Bigger Picture.`
- P: `Gia can help organize your available resources in one place and make them easier to understand.`
- P: `Instead of focusing only on balances or isolated numbers, she helps translate them into practical questions about your everyday life, housing, experiences, and future plans.`
- Quote card — no label (the visitor’s own question); quote `“What can all of this provide for my life?”`

Figure: `media/brochures/b-finances-inline.webp` (1024×683), `object-position: 60% 50%`, alt `Two children walking hand in hand along a rocky shore at sunset`.

Story 2 — H3 `Understand Your Capacity.`
- P: `Gia can help you look at your finances in the context of the way you actually live.`
- P: `With your permission, she can take into account your current lifestyle, recurring costs, housing expenses, and other resources to help you understand how long they may support the life you have defined.`
- List (gold bullets): `Everyday Life` · `Housing` · `Experiences` · `Reserve Strength`
- Quote card — role `GIA`; quote `“At your current lifestyle and resources, your estimated Living Capacity is 14.7 years.”`

Story 3 — H3 `Explore What Changes.`
- P: `Gia can help you explore different possibilities before you make a decision.`
- P: `You can ask what happens if your housing costs change, if your recurring expenses are reduced, or if additional resources become available. Gia can help model those changes conversationally and show how they may affect the bigger picture.`
- P: `She can also help identify savings, better offers, smarter purchases, and ways to reduce recurring expenses.`

Primary action: `Explore Your Options`

---

**Brochure 3 — `brochure-moving`** (opened by the `Learn more` button on module 4.3)

- Main image: `media/brochures/b-moving-main.webp` (1040×1064), `object-position: 40% 50%`, alt `A woman with long hair walking down a sunlit city street`.
- Marker chip: `PLAN A MOVE`
- Tag chips: `PLAN A MOVE` · `CHAPTER 03`
- Title H2: `Turn the next step into a clear plan.`
- Subtitle: `Gia helps you organize the decisions, information, and actions involved in moving from one home to the next.`

Story 1 — H3 `Start With a Plan.`
- P: `Gia can help you move from a general idea to a more organized sequence of steps.`
- P: `She can support planning, scheduling, research, communication, property discovery, and other multi-step tasks. With your permission, she can also remember what you have already decided and what still needs attention.`
- P: `The process is simple:`
- Process row (step chips): `Understand → Plan → Ask Permission When Needed → Take Action → Monitor → Report Back`

Figure: `media/brochures/b-moving-inline.webp` (1536×1024), `object-position: 35% 40%`, alt `A young professional walking calmly through a parking structure at night, wearing an earbud`.

Story 2 — H3 `Keep the Details Together.`
- P: `Moving involves many connected decisions.`
- P: `Gia can help keep information in one place, connect the property search with your preferences, and help you stay focused on what you are trying to accomplish.`
- List (gold bullets): `Planning` · `Scheduling` · `Property Research` · `Decision Tracking`
- P: `Rather than starting over in every conversation, Gia can use the context you have allowed her to remember and continue from where you left off.`

Story 3 — H3 `Move From Property to Home.`
- P: `Gia can help you evaluate property information, local services, maintenance considerations, and other details that affect your decision.`
- P: `She can also help identify a home that matches the criteria you have already discussed.`
- P: `The goal is to make the transition easier to understand, with the next step always clearer than the last.`

Primary action: `Explore Moving`

---

**Brochure 4 — `brochure-possibilities`** (opened by the `Learn more` button on module 4.4)

- Main image: `media/brochures/b-possibilities-main.webp` (1536×1024), `object-position: 32% 50%`, alt `A business owner smiling while taking notes during a video call with Gia`.
- Marker chip: `BUILD WHAT COMES NEXT`
- Tag chips: `BUILD WHAT COMES NEXT` · `CHAPTER 04`
- Title H2: `Your next possibility can begin with one conversation.`
- Subtitle: `Gia helps you look beyond one decision and explore the opportunities that may shape what comes next in your life.`

Story 1 — H3 `More Than One Direction.`
- P: `Life does not move in one category at a time.`
- P: `Gia can help across travel, work, business opportunities, relationships, personal planning, research, and other multi-step goals. You can continue working with Gia even when the task changes.`
- List (gold bullets): `Travel` · `Work` · `Business` · `Relationships` · `New Experiences`

Figure: `media/brochures/b-possibilities-inline.webp` (1536×1024), `object-position: 40% 45%`, alt `A café owner studying on a tablet while writing notes`.

Story 2 — H3 `Discover Relevant Opportunities.`
- P: `Gia can help identify possibilities that match your interests, needs, and goals.`
- P: `This may include better offers, useful introductions, work opportunities, business opportunities, property opportunities, ways to save money, and other options available through the Glonari platform.`
- P: `The aim is not to show you everything. It is to help you notice what may actually be relevant to you.`

Story 3 — H3 `One Conversation Can Open Another Door.`
- P: `A useful introduction can lead to a new home, a business opportunity, education, travel, a new connection, or another experience you had not considered before.`
- P: `Gia helps you explore those possibilities while keeping your own priorities at the center.`
- Quote card — role `GIA`; quote `“You asked me to watch airfare to Tokyo. The price is now within your target.”`

Closing line: `One conversation. More possibilities.`

Primary action: `Explore Possibilities`

---

### 5.5 Global site shell — build last

A light version of the Global Reserve site shell. Visual rules in design-system Section 11.

- Fixed header, 72px desktop / 64px mobile, background `rgba(247, 243, 235, 0.96)`, bottom hairline `--gd-line-soft`, no blur. Overlays Screen 1 without shifting it. `scroll-padding-top` 80px / 72px.
- Brand (left): the official logo, `<a class="gd-header__brand" href="#screen-1" aria-label="Glonari Global Dream">` containing `<img src="media/logo/gd-lockup-light.webp" alt="" width="915" height="393">` (the link carries the accessible name, so the image is decorative inside it). Height 52px above 1100px, 44px at 1100px and below (width auto, never stretched). Below 360px wide, swap to the emblem only: `media/logo/gd-emblem-light.webp` (416×416), 40px square, via `<picture>` with a `(max-width: 359px)` source. No hover effect on the logo other than the focus ring. Never recolour it, add a glow or shadow, or place it on a coloured chip.
- Back arrow (left of the brand), added 2026-10-01 when this page was connected to the Glonari chain: `<a class="gd-header__back" href="../digital-banker/atrium/index.html" aria-label="Back to Digital Banker atrium">&larr;</a>` — an explicit link to the Digital Banker atrium (the screen this page is entered from), never `history.back()`. 32×44px, `--gd-text-secondary`, hover `--gd-gold-deep`, same focus ring as the other header links. Mirrors the Global Reserve header's `.site-header__back`.
- Entry veil, added 2026-10-01: a full-viewport `#entry-veil` (solid `#1c1005`, the atrium's own veil colour, `z-index: 2000`), opaque on first paint via an inline `<style>` in `<head>`, lifted by a small inline script after 90ms over 300ms (`ease-out`; instant with reduced motion) and then removed. It completes the atrium's dark-veil hand-off into this page. It is a separate layer and does not modify Screen 1's markup, CSS, JavaScript or timing.
- Navigation: `Meet Gia` → `#screen-1`, `How she helps` → `#screen-2`, `Everything connects` → `#screen-3`, `In your life` → `#screen-4`. IBM Plex Sans 500, 15px, `--gd-text-primary`, hover/active `--gd-gold-deep`.
- Fifth navigation link, approved by the user on 2026-10-01: `Your control` → `#screen-side`, placed between `How she helps` and `Everything connects` so the links follow the page order. Same style as the other links. It is added together with Screen 2b (task A10), never before: while `#screen-side` is hidden, the link would point to nothing. With five links the header may need the hamburger breakpoint re-checked; verify at 1100–1280px that the nav does not crowd the logo or the `Talk to Gia` button, and report rather than changing the breakpoint.
- Action (right): one primary header button `Talk to Gia` (reuses the approved Screen 2 label), destination TODO.
- Breakpoint 1100px: nav collapses into a CSS-line hamburger (`aria-label="Open menu"` / `"Close menu"`, `aria-expanded`, `aria-controls`) revealing a solid `--gd-bg` menu. Closes on link click, Escape (focus back to the hamburger), and outside click. No animation.
- Footer: `--gd-bg-soft`, top hairline `--gd-line-soft`, compact padding. Top row: the logo `media/logo/gd-lockup-light.webp`, `alt="Glonari Global Dream"`, width 360px desktop (never above 420px, never upscaled), `min(100%, 280px)` on mobile, height auto. Then the same nav links, then IBM Plex Mono legal and copyright lines: `<!-- TODO: copy needed — legal line -->` and `© 2026 Global Dream`.
- Favicons in `<head>`: `<link rel="icon" href="favicon.ico" sizes="any">`, `<link rel="icon" type="image/png" sizes="32x32" href="media/logo/favicon-32.png">`, `<link rel="apple-touch-icon" href="media/logo/apple-touch-icon.png">`. Added in task A1 (they belong to the document head, not the shell).

No registration or login dialogs on this page unless a later prompt adds them.

---

## 6. MEDIA CONTRACT

| Slot | Screen | File | Behaviour |
|---|---|---|---|
| Hero video | 1 | `media/gd-hero.mp4` (+ `gd-hero-poster.jpg`) | Blob-loaded, scroll-scrubbed across the 400vh runway |
| Gia tablet | 3 | `media/gia-tablet.webp` | Static image, animated only by transforms and overlays |
| Walk video | 4 | `media/gd-walk.mp4` (+ `gd-walk-poster.jpg`) | Blob-loaded, scroll-scrubbed across the 650vh runway |
| Logo | Shell | `media/logo/gd-lockup-light.webp`, `gd-emblem-light.webp` | Header and footer; never recoloured |
| Screen 2a photo and avatar | 2a | `media/gd-knows.webp`, `media/gia-avatar.webp` | Lazy static images; the photo scales in once on entry |
| Screen 2b photo and avatar | 2b | `media/gd-side.webp`, `media/gia-avatar.webp` | Lazy static images; scale-in once on entry |
| Brochure images | 5.4a | `media/brochures/b-{homes,finances,moving,possibilities}-{main,inline}.webp` | Loaded on first open of each brochure (`data-src` → `src`); ~680KB total |

Placeholder for any missing still or slot: `--gd-bg-soft` fill, 1px dashed `--gd-line`, centred IBM Plex Mono caption `Media pending` plus the expected filename, same `aspect-ratio` as the real asset. The page must never break because an asset is absent.

Blob loading: start fetching the hero video immediately; start fetching the walk video when Screen 3 is within one viewport of entering (`IntersectionObserver` with `rootMargin: "100% 0px"`) so it does not compete with the hero. Never fetch the walk video under reduced motion or short viewports.

Weight budget: videos ~15.8MB (hero ~5.5MB, walk ~10.3MB), brochure images ~0.7MB (lazy, only on open), all other assets under 1MB, total under 17.5MB. No autoplaying video on this page; both videos are scrubbed only.

---

## 7. MOTION, ACCESSIBILITY, PERFORMANCE

1. Pinned sections: Screen 1 and Screen 4 only. No parallax, no scroll hijacking, no scroll snapping, no page-level horizontal scroll.
2. All scroll-driven motion is a pure function of progress and fully reversible on upward scroll.
3. One `requestAnimationFrame` loop per pinned screen, started when its section is within one viewport of the visible area and stopped when it is further away. Ambient loops on Screens 2 and 3 pause off-screen. (Approved 2026-10-01: Screens 2a and 2b each have one, a thread particle, which also pauses off-screen.)
4. Animate `transform` and `opacity` only (plus `stroke-dashoffset` for Screen 3 lines and the Screen 2a and 2b threads, and `scaleY`/`scaleX` for rails and progress). Never animate layout properties.
5. `prefers-reduced-motion: reduce`: complete, readable, static composition on every screen as specified per screen.
6. Semantics: one `<h1>` (Screen 1). `<h2>` per screen. `<h3>` for Screen 2 rail phrases, Screen 3 areas, and Screen 4 modules. Links that navigate are `<a>`; controls that open brochures are `<button>`. **Approved (2026-10-01):** the Screen 2b switches are `<button type="button" role="switch" aria-checked>`, each labelled by its row text; the 2a and 2b panels are `<figure>` elements with a visually hidden `<figcaption>`.
7. Keyboard: visible focus rings, logical tab order, no positive `tabindex`, no focus on invisible content (`inert` rules above).
8. Contrast: all text meets WCAG AA, including text over video (checked on first, middle, and last frames).
9. Images: explicit `width`/`height`, `loading="lazy"` below the fold.
10. No console errors or warnings on load.

---

## 8. ACCEPTANCE CHECKLIST

- [ ] No Cyrillic in any project file: `LC_ALL=C.UTF-8 grep -rnP "[\x{0400}-\x{04FF}]" --include=*.{html,css,js,md} .`
- [ ] Four sections with the ids and `data-screen` values from Section 3; `#screen-4-final` exists. (Since 2026-10-01: six sections, in the order 1, 2, 2a, 2b, 3, 4.)
- [ ] Every visible string matches Section 5 character for character; every missing string is a listed TODO.
- [ ] Screen 1 scrubs smoothly, text blocks never overlap, block 3 and `Meet Gia` hold to the end, the button is only interactive when visible.
- [ ] Screen 2 is the only dark section; its rail completes once and its ambient dot pauses off-screen. (Since 2026-10-01: Screens 2 and 2b are the only dark sections and are never adjacent.)
- [ ] Screen 2a memory rows appear in order with their threads, rows 2–4 highlight before the quote card, the outcome line appears sentence by sentence; from 1200px up the only loop is the thread particle, paused off-screen.
- [ ] Screen 2b request rows resolve in order, no red is used, the switches toggle by mouse, touch and keyboard (Space and Enter) and announce their state; `What she can share` switches row 1 between `Shared` and `Not shared`; nothing is saved; the thread particle pauses off-screen.
- [ ] Screen 3 areas appear in order 1–5, lines stay attached to the tablet at every width above 1100px, and the stacked layout replaces lines below it.
- [ ] Screen 4 matches the reference mechanics: scrubbed walking video, chapters on one continuous track entering from the right and exiting to the left, progress line, counter, simulated pull-back, final CTA with no exit. Chapter cards cross Gia's safe band only while moving; the final CTA card at rest stays clear of it.
- [ ] Every module button under the text opens its brochure; the panel slides in from the right leaving a strip of the story visible, media column fixed, body column scrolling; copy matches 5.4a.3; story freezes while open; Escape/backdrop/close work; focus returns; scroll position is restored exactly.
- [ ] Reduced motion and `max-height: 560px` produce the static layouts specified.
- [ ] Layout correct at 1920, 1440, 1024, 768, 375; no horizontal page scroll.
- [ ] No framework, build step, or package manager files.

---

## APPENDIX A — PROMPTS FOR CLAUDE CODE (use in order, one per session)

**A1 — Scaffold**

> Read `CLAUDE.md`, `GLOBAL-DREAM-BUILD-SPEC.md`, and `GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md`. Create the file structure from Section 3, put the design-system Section 3 tokens and Section 16 dark tokens in `css/tokens.css`, build `css/base.css` (reset, fonts, `.gd-container`, section classes, buttons from Section 4.2, `.visually-hidden`, reveal classes) and `js/reveal.js`. Add the favicon links from Section 5.5. Scaffold the four sections with correct ids and `data-screen` values, headings only, Screens 2–4 hidden. Do not build any screen yet.

**A2 — Screen 1**

> Build Screen 1 per Section 5.1 in `index.html`, `css/screens.css`, and `js/hero-scrub.js`, adapting the Global Reserve scroll-scrub technique described there. Verify legibility on first, middle, and last frames and report contrast results. Reduced motion per spec.

**A3 — Screen 2**

> Build Screen 2 per Section 5.2 (the only dark screen) in `index.html`, `css/screens.css`, and `js/gia-conversation.js`. Unhide it only after visual verification.

**A4 — Screen 3**

> Build Screen 3 per Section 5.3 in `index.html`, `css/screens.css`, and `js/gia-connect.js`, using `media/gia-tablet.webp`.

**A5 — Screen 4 stage and modules**

> First open `references/oceanx-horizontal-story-reference.mp4` and `references/oceanx-contact-sheet.jpg` and describe the mechanics you will reproduce. Then build Screen 4 per Section 5.4 in `index.html`, `css/gia-story.css`, and `js/gia-story.js`: pinned stage, scrubbed walk video, horizontal modules, chrome, simulated pull-back, final CTA. Brochure buttons render but do nothing yet.

**A6 — Screen 4 brochures**

> First open `references/oceanx-brochure-panel.png` and describe the panel layout you will reproduce. Then build the four brochure dialogs per Section 5.4a in `index.html`, `css/gia-story.css`, and `js/brochure.js`, with the copy from 5.4a.3 verbatim, and wire the module buttons from 5.4a.1. Verify: buttons are clickable while the button is fully on screen, the story freezes while a panel is open, focus handling, Escape/backdrop/close, and exact scroll-position restore.

**A7 — Site shell**

> Build the header and footer per Section 5.5 in `css/site-shell.css` and `js/site-shell.js`.

**A9 — Screen 2a**

> Build Screen 2a per Section 5.2a in `index.html`, `css/screens.css`, and `js/gia-knows.js`, with the photo `media/gd-knows.webp`, reusing the `.gd-quote` component from Section 5.4a.2. Check the overlay never covers the man's face or Gia on the tablet. Keep the section `hidden` until visually verified. Do not change Screens 1–4.

**A10 — Screen 2b**

> Add `--gd-night-warm` and `--gd-night-warm-surface` to `css/tokens.css`, then build Screen 2b per Section 5.2b in `index.html`, `css/screens.css`, and `js/gia-side.js`, with `media/gd-side.webp` and `media/gia-avatar.webp`. Add the fifth header link `Your control` → `#screen-side` (Section 5.5), in the header and the footer nav. Measure contrast for every text colour on `--gd-night-warm` and on the panel surface and report it. Keep the section `hidden` until visually verified. Do not change Screens 1–4.

**A8 — Audit**

> Run the Section 8 checklist and report each item as pass or fail with file and line. Fix failures and re-run.

---

## APPENDIX B — OPEN ITEMS

Approved on 2026-09-28: every item previously marked PROPOSED (Screen 3 `GIA` live marker; Screen 4 `CHAPTER 01–04` labels and hidden H2 `Gia in your life`; brochure mapping, `Close`, `Back to the story`, deep links; all site-shell copy) and the official logo.

Approved on 2026-09-30: the designer-supplied brochure copy (`references/brochure-copy.txt`) and its mapping (Section 5.4a), replacing the PDF-based brochure copy; module buttons labelled `Learn more`. The optional Digital Banker paragraph in the finances brochure is no longer an open item.

Still open (the build does not wait for them — each is a TODO in place):

1. Destinations for `Meet Gia`, `Talk to Gia`, `Explore with Gia`, and the brochure primary actions (`Explore Homes`, `Explore Your Options`, `Explore Moving`, `Explore Possibilities`).
2. Footer legal line.
3. A larger version of the New Beginnings student photo (the PDF copy is 400px, so it is not used). Usage rights for the brochure photography to be confirmed. Gia's face in the brochure photos differs from the Gia in the page videos and tablet image.
4. A vector (SVG) or higher-resolution version of the logo. The supplied PNG is 1024px wide: enough for the header and a 420px footer on 2x screens, not for larger uses.
5. Optional: a version of the tablet image without baked call controls.
6. Optional: a longer walk video (12–16s) with a real camera pull-back at the end.

Added on 2026-10-01:

7. Screens 2a and 2b (Sections 5.2a and 5.2b): copy, order, photo-led layout, photos and the second dark accent screen approved 2026-10-01. Usage rights for the two new photos (made from the Gia brochure images) to be confirmed, as for item 3.
8. Legal review of the Screen 2b small print `Glonari is designed to create value with its members, not sell their private profiles.` If it is not cleared, the line is removed; the screen works without it.
9. Navigation: approved 2026-10-01, see Section 5.5. The fifth link `Your control` → `#screen-side` was added with Screen 2b (task A10) in the header and the footer. Checked at 1101, 1150, 1200 and 1280: the five links stay on one row, at least 98px from the logo and 48px from `Talk to Gia`; the 1100px hamburger breakpoint is unchanged.
10. Re-measure contrast of Screen 1 blocks 2 and 3 against the warm veil (open since the 2026-10-01 veil change).
