# Global Dream Light Design System

Version: 1.0  
Visual reference: supplied Glonari / Digital Banker screenshots  
Scope: light Global Dream landing page. Typography remains unchanged from the supplied dark design system.

## 1. Purpose and precedence

This file is the visual source of truth for the light Global Dream landing page.

When implementation documents disagree, use this order:

1. The current user prompt controls the scope of the task.
2. This design system controls colors, typography, spacing, grids, section rhythm, component appearance, and responsive behavior.
3. The approved build spec controls approved English copy, section order, product terminology, semantic requirements, and required functionality.
4. Previously approved screens remain unchanged unless the current prompt explicitly changes them.

Do not copy text, logos, navigation, or product-specific components from the visual references. The supplied screenshots are used only for atmosphere, palette, visual rhythm, material character, and contrast.

## 2. Design character

Global Dream should feel:

- light, calm, premium, and welcoming;
- architectural rather than decorative;
- warm rather than sterile;
- elegant without looking like a luxury-fashion site;
- digital and intelligent, but still human;
- spacious, structured, and easy to scan;
- connected to the Glonari visual world through warm limestone, gold, sky, and dark charcoal accents.

The visual balance should come from warm ivory surfaces, quiet cream architecture, restrained gold accents, clear charcoal typography, and occasional sky-blue details inspired by the atrium windows and exterior sky.

Avoid:

- pure white as the only page background;
- large dark sections unless a specific screen explicitly requires one;
- strong orange or saturated yellow backgrounds;
- bright cyan or electric blue UI accents;
- large metallic gradients;
- heavy gold fills across full sections;
- glassmorphism, excessive blur, or ornamental card styling;
- heavy shadows;
- oversized rounding;
- low-contrast beige-on-beige text;
- inconsistent section padding.

## 3. Core tokens

Add these tokens to `css/tokens.css`. Reuse them instead of repeating raw values.

```css
:root {
  /* Light page surfaces */
  --gd-bg: #F7F3EB;
  --gd-bg-soft: #EFE7DA;
  --gd-surface: #FFFDF8;
  --gd-surface-elevated: #FFFFFF;

  /* Warm architectural neutrals */
  --gd-limestone: #D8C8B2;
  --gd-sand: #C7B49A;
  --gd-stone: #A69279;

  /* Glonari gold / bronze accents */
  --gd-gold: #B9863F;
  --gd-gold-deep: #8A5A22;
  --gd-gold-soft: rgba(185, 134, 63, 0.14);
  --gd-gold-line: rgba(138, 90, 34, 0.28);

  /* Sky accents from the supplied references */
  --gd-sky: #2F95D7;
  --gd-sky-deep: #175F8A;
  --gd-sky-soft: #DCECF7;

  /* Text */
  --gd-text-primary: #1E2328;
  --gd-text-secondary: #4F5961;
  --gd-text-tertiary: #7A746B;
  --gd-text-muted: #9A948B;

  /* Rules and subtle depth */
  --gd-line: #D8CDBE;
  --gd-line-soft: rgba(91, 72, 49, 0.12);
  --gd-shadow-soft: 0 14px 40px rgba(57, 43, 24, 0.08);
  --gd-shadow-tablet: 0 24px 48px rgba(57, 43, 24, 0.14); /* drop-shadow() on the Screen 3 tablet image only */
  --gd-shadow-card: 0 18px 48px rgba(57, 43, 24, 0.18), 0 2px 6px rgba(57, 43, 24, 0.10); /* Screens 2a (memory panel and quote card, approved 2026-10-01) and 4 (chapter cards, approved 2026-10-02) only */

  /* Type — unchanged */
  --gd-font-ui: "IBM Plex Sans", system-ui, sans-serif;
  --gd-font-mono: "IBM Plex Mono", ui-monospace, monospace;

  /* Container */
  --gd-container-max: 1200px;
  --gd-page-pad: clamp(24px, 3.5vw, 48px);

  /* Spacing scale */
  --gd-space-1: 8px;
  --gd-space-2: 16px;
  --gd-space-3: 24px;
  --gd-space-4: 32px;
  --gd-space-5: 48px;
  --gd-space-6: 64px;
  --gd-space-7: 96px;
  --gd-space-8: 128px;
  --gd-space-9: 160px;

  /* Section rhythm */
  --gd-section-pad: clamp(96px, 11vw, 160px);
  --gd-section-pad-compact: clamp(72px, 8vw, 96px);
  --gd-grid-gap: clamp(48px, 6vw, 96px);
}
```

### 3.1 Color hierarchy

Use the palette with the following hierarchy:

1. `--gd-bg` is the default page background.
2. `--gd-surface` is the main card, panel, and content surface.
3. `--gd-bg-soft` is used to alternate long sections and create rhythm. Dark accent screens are a separate, limited tool governed only by Section 16.1.
4. `--gd-gold` is the primary brand accent for buttons, key lines, small markers, selected states, and important data.
5. `--gd-gold-deep` is used where gold must carry readable text or icon contrast.
6. `--gd-sky` is a secondary accent. It should appear selectively in small interface details, links, progress indicators, or atmospheric visual elements.
7. `--gd-text-primary` is the default heading color.
8. `--gd-text-secondary` is the default body-copy color.

Gold and blue should not compete inside the same small component. Gold is the primary brand accent; sky blue supports the light architectural atmosphere.

### 3.2 Accessibility and contrast

- Primary body text must remain dark on light surfaces.
- Use `--gd-gold-deep`, not the lighter gold, for small gold text.
- White text is permitted on `--gd-gold-deep` buttons.
- Dark `--gd-text-primary` text is permitted on `--gd-gold` buttons.
- Do not place `--gd-text-tertiary` over photography unless a solid or sufficiently opaque surface is behind it.

## 4. Typography

Typography is intentionally unchanged from the supplied dark design system.

### 4.1 Font roles

- Screen 1: retain its existing approved Playfair Display treatment if already established for the project.
- Standard headings and body: IBM Plex Sans.
- Eyebrows, labels, compact metadata, and technical captions: IBM Plex Mono.
- Never introduce a new font family without an explicit user request.

Use one Google Fonts request containing the required IBM Plex Sans and IBM Plex Mono weights while preserving any already approved Screen 1 family.

### 4.2 Type scale

| Role | Size | Weight | Line height | Letter spacing | Color |
|---|---:|---:|---:|---:|---|
| H1 outside Screen 1 | `clamp(40px, 5vw, 64px)` | 700 | 1.05 | `-0.03em` | primary |
| H2 standard | `clamp(32px, 4vw, 48px)` | 700 | 1.10 | `-0.02em` | primary |
| H2 large centered | `clamp(36px, 4.5vw, 56px)` | 700 | 1.10 | `-0.02em` | primary |
| H3 / item title | `clamp(20px, 2vw, 28px)` | 600 | 1.20 | `-0.01em` | primary |
| Lead | `clamp(18px, 1.8vw, 22px)` | 400 | 1.65 | normal | secondary |
| Body | `clamp(17px, 1.4vw, 20px)` | 400 | 1.70 | normal | secondary |
| Small body | `15px` | 400 | 1.60 | normal | secondary |
| Eyebrow / label | `12px` | 600 | 1.20 | `0.10em` | gold-deep or tertiary |
| Caption | `13px` | 400 | 1.55 | normal | tertiary |
| Large data phrase | `clamp(30px, 3.2vw, 46px)` | 600 | 1.08 | `-0.02em` | gold-deep |

### 4.3 Text width

- Standard text column: 500-560px.
- Centered heading block: 720px maximum.
- Centered CTA block: 800px maximum.
- Long body copy must not span the full container.
- Prefer intentional line breaks only when specified in the approved copy.

### 4.4 Vertical relationships

| Relationship | Distance |
|---|---:|
| Eyebrow to heading | 16px |
| Heading to body | 24-32px |
| Body paragraph to secondary paragraph | 16px |
| Body to stat, feature list, or primary component | 32-48px |
| Heading group to major media or grid | 64-96px |
| Item title to item body | 8px |
| Caption to related value | 12-16px |
| Divider to content below | 24px |
| Last content item to section edge | never less than the section bottom padding |

Do not position normal content using negative margins.

## 5. Layout grid

### 5.1 Standard container

```css
.gd-container {
  width: min(100%, var(--gd-container-max));
  margin-inline: auto;
  padding-inline: var(--gd-page-pad);
}
```

The `1200px` maximum includes the internal side padding. At wide viewport sizes, content should not spread beyond this container merely to fill space.

### 5.2 Desktop columns

- Standard split: `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)`.
- Standard split gap: 64px.
- Editorial split gap: 96px.
- 40/60 split: use only when required by the screen specification.
- All direct grid children must use `min-width: 0`.
- Align the top of related text and media unless the composition explicitly calls for vertical centering.

### 5.3 Section types

#### Standard section

```css
.gd-section {
  padding-block: var(--gd-section-pad);
  background: var(--gd-bg);
}
```

Target desktop padding: 160px top and 160px bottom.

#### Alternate light section

Use sparingly to separate major narrative chapters.

```css
.gd-section--soft {
  padding-block: var(--gd-section-pad);
  background: var(--gd-bg-soft);
}
```

Do not alternate background color on every screen mechanically. Use it only when it improves narrative grouping.

#### Compact section

```css
.gd-section--compact {
  padding-block: var(--gd-section-pad-compact);
}
```

Target desktop padding: 96px top and 96px bottom.

#### Viewport section

```css
.gd-section--viewport {
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding-block: var(--gd-section-pad);
}
```

The section must be allowed to grow taller than the viewport. Never use fixed `height: 100vh` for a normal content section.

Pinned or sticky scrolling is exceptional. Do not add it unless the current prompt explicitly requires it.

## 6. Section boundaries and spacing

Every section owns its top and bottom padding. Do not rely on child margins to create space between screens.

Rules:

1. A heading must never sit directly against the end of the previous screen.
2. Standard screens use at least 96px of visible space above the first content element.
3. Desktop standard screens target 160px above and below their content.
4. Compact screens target 96px above and below.
5. Mobile screens use at least 72px above and below.
6. Adjacent sections must not collapse margins.
7. Do not add arbitrary white strips between warm light sections.
8. Use borders only when they have a clear structural purpose.
9. Full-bleed media may touch the viewport edge; text may not.
10. When content is taller than the viewport, preserve section padding and allow natural document flow.

## 7. Common screen compositions

### 7.1 Split text and media

```css
.gd-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--gd-grid-gap);
  align-items: center;
}
```

Internal text rhythm:

1. Eyebrow, if present.
2. Heading after 16px.
3. Body after 24-32px.
4. Secondary component after 32-48px.

### 7.2 Centered header plus content

- Header block max-width: 720px.
- Center with `margin-inline: auto`.
- Heading to body: 24px.
- Header block to the next major component: 64-96px.
- Keep long body text left-aligned when readability is better, even if the block itself is centered.

### 7.3 CTA composition

- Content max-width: 800px.
- Heading to body: 24px.
- Body to actions: 48px.
- Button gap: 16px.
- Center content horizontally.
- On mobile, stack buttons at full width.

### 7.4 Lists and process rows

- Row padding: 24px vertically.
- Marker to text gap: 32px desktop, 20px mobile.
- Item title to description: 8px.
- Divider: `1px solid var(--gd-line-soft)`.
- Active or emphasized state: gold-deep marker or text, not a large gold fill.

## 8. Surfaces, cards, buttons, and media

### 8.1 Cards

- Base background: `var(--gd-surface)` or transparent.
- Elevated background: `var(--gd-surface-elevated)`.
- Border: `1px solid var(--gd-line)`.
- Radius: 8px.
- Internal padding: 32px desktop, 24px mobile.
- Card grid gap: 24px.
- No shadow by default.
- `var(--gd-shadow-soft)` may be used on one focal card, floating control, or image panel when separation is genuinely needed.
- Gold is an accent, never the card's full background except for small primary controls.

### 8.2 Buttons

Primary button:

```css
.gd-button--primary {
  background: var(--gd-gold-deep);
  color: #fff;
  border: 1px solid var(--gd-gold-deep);
}
```

Secondary button:

```css
.gd-button--secondary {
  background: transparent;
  color: var(--gd-text-primary);
  border: 1px solid var(--gd-gold-line);
}
```

Rules:

- Radius: 6-8px.
- Avoid pill buttons unless the component specifically requires them.
- Hover may brighten the surface slightly or deepen the border; do not use large transforms.
- Do not use saturated sky blue for primary CTA buttons.

### 8.3 Media

- Media must have an explicit `aspect-ratio`.
- Media must never determine the page width.
- Use `object-fit: cover` for photography and video.
- Photography should preserve the warm cream / gold / sky atmosphere of the supplied references.
- Avoid adding a heavy color overlay unless required for text legibility.
- Decorative canvas and images use `aria-hidden="true"` and empty alt text as appropriate.
- Missing media must preserve the intended layout.

### 8.4 Digital panels

Light digital panels should feel precise, not glassy.

- Base panel: `var(--gd-surface)`.
- Primary lines and key indicators: `var(--gd-gold)` or `var(--gd-gold-deep)`.
- Secondary informational indicators may use `var(--gd-sky)`.
- Supporting grid lines: `var(--gd-line-soft)`.
- Active state: subtle `--gd-gold-soft` or `--gd-sky-soft` background.
- Avoid neon glows and strong blue holographic effects in standard UI components.

## 9. Motion

- Text reveal: 600ms, translateY from 24px to 0, opacity from 0 to 1.
- Ease: `cubic-bezier(.22, .61, .36, 1)`.
- Content reveal runs once unless the screen specification says otherwise.
- Ambient decorative graphics may loop continuously while visible.
- Pause expensive animation while outside the viewport and resume on return.
- Looping animations must have a seamless reset and a meaningful image at every phase.
- Hover feedback: 200-300ms.
- Do not animate layout dimensions that cause surrounding content to move.
- Do not use parallax or scroll hijacking unless explicitly approved.
- Under `prefers-reduced-motion: reduce`, show a complete, readable final composition.

## 10. Responsive system

### Desktop: 1200px and above

- Container max-width: 1200px.
- Container internal padding: 48px.
- Standard section padding: 160px.
- Compact section padding: 96px.
- Two-column gap: 64-96px.
- Standard H2 max: 48px.
- Large centered H2 max: 56px.

### Tablet landscape: 769-1199px

- Page padding: 32px.
- Section padding: 96-128px.
- Two-column gap: 48-64px.
- Preserve two columns only while each column remains readable.
- Never compress a text column below approximately 360px.

### Tablet and mobile: 768px and below

- Page padding: 24px.
- Section padding: 72-96px.
- Stack split layouts to one column.
- Column gap after stacking: 48-64px.
- Do not automatically place media first. Follow the screen-specific reading order.
- H2: 32-40px depending on available width.
- Body: 17-18px.
- Cards use 24px internal padding.
- Buttons stack and become full width.

### Small mobile: 480px and below

- Page padding: 20px.
- Minimum section padding: 72px.
- H2 minimum: 30-32px.
- Never allow a heading, data phrase, or canvas to overflow the viewport.
- Avoid forced line breaks that create one-word lines.

## 11. Header and footer treatment

### Header

- Fixed or sticky behavior depends on the build specification.
- Default background: `rgba(247, 243, 235, 0.96)` or solid `--gd-bg`.
- Bottom divider: `1px solid var(--gd-line-soft)`.
- No dark header bar by default.
- No gradient.
- No heavy backdrop blur.
- Navigation text: `--gd-text-primary`.
- Hover / active navigation state: `--gd-gold-deep`.
- Primary header action: gold-deep fill with white text or transparent with gold-deep border, depending on visual density.

### Footer

- Preferred background: `--gd-bg-soft` or `--gd-text-primary` only if a deliberate dark closing contrast is requested.
- If the footer remains light, use `--gd-line-soft` as the top divider.
- Keep legal and metadata text in IBM Plex Mono.

## 12. Image and atmosphere guidance

The supplied references combine several visual cues that should guide photography and generated imagery:

- warm cream limestone and marble;
- champagne and antique-gold metal details;
- deep charcoal or black used in small controlled areas;
- vivid natural blue sky as an atmospheric counterpoint;
- warm late-afternoon or golden-hour light;
- premium contemporary interiors with classical architectural structure;
- polished floors and soft natural reflections;
- greenery used as a supporting natural accent, not a dominant brand color.

For the website itself, translate these cues into quieter UI colors. The interface should not imitate the intense orange warmth of rendered scenes. Backgrounds should stay ivory and cream; gold should stay controlled; blue should remain secondary.

## 13. Implementation rules

1. Reuse shared classes and tokens. Do not duplicate the same spacing values in every screen.
2. Use `clamp()` for fluid type and major spacing.
3. Use CSS Grid or Flexbox for layout; do not position ordinary content absolutely.
4. Reserve absolute positioning for overlays, decorative layers, and animation internals.
5. Use `box-sizing: border-box` globally.
6. Set `min-width: 0` on grid and flex children that contain text or media.
7. Keep `overflow-x` controlled without hiding genuine layout bugs.
8. Do not use fixed section heights for content sections.
9. Keep unfinished screens hidden until they are fully implemented and visually checked.
10. Modify only the files authorized by the current prompt.
11. Keep repository content in English unless the current task explicitly requests another language.
12. Do not change the approved typography when applying this light theme.

## 14. Visual QA checklist

Before reporting a screen complete, verify:

- The first content element has at least the required section top padding.
- The last content element has at least the required section bottom padding.
- Heading, body, and component spacing follows Section 4.4.
- Text aligns to the container grid.
- No body paragraph is wider than 560px unless intentionally centered in a 720px header block.
- H2 uses IBM Plex Sans, correct weight, line height, and maximum size.
- Screen background and text colors use tokens from this document.
- Gold is used as an accent rather than a large decorative fill.
- Sky blue remains secondary to gold.
- Body text maintains clear contrast against ivory and cream surfaces.
- Major columns use a 64-96px desktop gap and at least 48px after stacking.
- No content is clipped at 1440px, 1024px, 768px, or 375px widths.
- No horizontal scrolling exists.
- Motion remains meaningful after the first cycle or in its final state.
- Reduced-motion mode displays a complete static composition.
- The previous completed screen remains unchanged unless the current task explicitly changes it.
- The browser console has no errors or warnings.

## 15. Required instruction for future prompts

Start future implementation prompts with:

> Read `GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md` and the current build specification before changing files. The build spec controls approved copy, section order, product terminology, semantics, and functionality. The design system controls visual styling, typography, colors, spacing, grids, section rhythm, and responsive behavior. Do not change previously approved screens unless this prompt explicitly authorizes it. Keep the existing typography unchanged and use the light Global Dream palette from the design system.

Then specify exactly one screen or one bounded system task.

## 16. Approved exceptions

Approved by the designer on 2026-09-28. These exceptions apply only where stated. Everything else in this document remains in force.

### 16.1 Dark accent screens (Screens 2 and 2b)

One dark screen is permitted on the page, as a secondary accent. It is Screen 2 ("What Gia does"). No other section, card, or component may use a dark background, except the small dark chip permitted in 16.2.

Add these tokens to `css/tokens.css`. They are used only by Screen 2 and by the Screen 1 legibility veil and text shadow (16.4):

```css
:root {
  --gd-night: #15181C;
  --gd-night-surface: #1E2328;
  --gd-night-line: rgba(247, 243, 235, 0.12);
  --gd-night-text: #F7F3EB;
  --gd-night-text-2: rgba(247, 243, 235, 0.72);
  --gd-night-text-3: rgba(247, 243, 235, 0.48);
  --gd-night-umber: color-mix(in srgb, var(--gd-gold-deep) 45%, var(--gd-night)); /* added 2026-10-01: Screen 1 veil and text shadow only */
}
```

> **Approved (2026-10-01)** — replaces the single-dark-screen rule above. The page grew from four screens to six, and one dark screen no longer gives it a visible rhythm. The Gia brochure is dark throughout, so a second dark screen also brings the page closer to it.
>
> **Dark accent screens (Screens 2 and 2b).** Two dark accent screens are permitted on the page: Screen 2 ("What Gia does") and Screen 2b ("She’s on your side"). No other section, card, or component may use a dark background, except the small dark chip in 16.2, the brochure panel details in 16.7, and the dark panel parts of Screen 2b in 16.10. Legibility veils (16.4) are not dark screens.
>
> 1. **Never adjacent.** At least one full light section sits between two dark screens. Two dark screens in a row read as one heavy block and lose the rhythm they exist to create.
> 2. **At most two on this page.** Global Dream is the light member of the Glonari family. If dark screens reach half the page, it stops being distinct from Global Reserve and Digital Banker. A third dark screen (for example a dark final CTA) needs its own explicit approval.
> 3. **Each dark screen has its own composition.** Screen 2: text left, rail right. Screen 2b: panel left, text right. A dark screen must not repeat the layout of the other.
> 4. **Each dark screen has its own reason.** Dark marks a change of register (Screen 2: from the cinematic hero to explanation; Screen 2b: protection and control). It is not used for variety alone.
> 5. **Shared dark rules.** Everything listed below under "Rules for the dark screen" applies to both dark screens.
>
> Tokens for Screen 2b, added to the dark accent block in `css/tokens.css`:
>
> ```css
> :root {
>   --gd-night-warm: color-mix(in srgb, var(--gd-gold-deep) 12%, var(--gd-night));          /* about #23201D: Screen 2b background */
>   --gd-night-warm-surface: color-mix(in srgb, var(--gd-night-text) 5%, var(--gd-night-warm)); /* about #2E2B27: Screen 2b panel */
> }
> ```
>
> `--gd-night-warm` is a warm charcoal: related to `--gd-night` (Screen 2) but not identical, and sharing the warmth of the Screen 1 umber veil. Measured contrast on `--gd-night-warm`: `--gd-night-text` 14.6:1, `--gd-night-text-2` 8.2:1, `--gd-night-text-3` 4.4:1 (large text and non-text only), `--gd-gold` 5.1:1. On `--gd-night-warm-surface`: `--gd-night-text` 12.7:1, `--gd-night-text-2` 7.4:1, `--gd-gold` 4.4:1, so gold carries no small text on the panel surface, only glyphs and large text.
>
> **Approved by the user on 2026-10-01 (task A10).** One more Screen 2b token, in the same dark accent block: `--gd-shadow-night-panel: 0 24px 60px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.35);` — the request panel's depth over the photo, Screen 2b only. Screen 2b also carries the connection glows of 16.9 (phone halo, thread, nodes, particle, switch pulse); the "no glow effects" rule below therefore applies to Screen 2 only. Built values measured with the tokens above: `--gd-night-warm` #23201D, `--gd-night-warm-surface` #2E2A27; `--gd-night-text` 14.65:1 / 12.81:1, `--gd-night-text-2` 8.20:1 / 7.40:1, `--gd-gold` 5.05:1 / 4.42:1.

Rules for the dark screens (both Screen 2 and Screen 2b):

- Gold accent on dark is `--gd-gold` (not `--gd-gold-deep`, which is too dark on `--gd-night`). `--gd-gold` on `--gd-night` measures approximately 5.5:1 and may carry text.
- Primary button on dark: `--gd-gold` fill with `--gd-text-primary` text.
- Sky blue is not used on the dark screen.
- No gradients as fills, no glow effects, no glassmorphism. The atmosphere comes from contrast and restraint, in the spirit of the dark Digital Banker reference.
- Typography, spacing, and grid rules are identical to the light screens.

### 16.2 Small dark chip over imagery

A small label chip on top of photography or video may use `rgba(30, 35, 40, 0.55)` with light text (Screen 3 tablet "live" marker). Maximum height 28px. Not for body text.

### 16.3 Gia tablet asset

`media/gia-tablet.webp` contains baked video-call controls, including a saturated red end-call button. This red is accepted inside that image only. Do not use red anywhere else on the page, and do not place overlays on the controls.

### 16.4 Legibility veils over video

Veils over video exist purely for text legibility. They are permitted under Section 8.3 ("unless required for text legibility") and are not decorative gradient fills. A veil must never cover Gia.

- Screen 1 uses a static dark veil built from `--gd-night` (`rgba(21, 24, 28, …)` linear gradient, darkest at the top, the lower half of the frame kept visibly light) with light text in `--gd-surface` and a soft `--gd-night` text shadow. Approved by the designer on 2026-09-29, replacing the earlier ivory veil. This is a legibility veil, not a dark section; the dark-screen rule in 16.1 is unaffected. Exact values are in build spec Section 5.1.

  > **SUPERSEDED (2026-10-01)** — at the user's direct request the Screen 1 veil and text shadow are now built from `--gd-night-umber`, a warm bronze-umber mixed from `--gd-gold-deep` and `--gd-night`, instead of the neutral `--gd-night`. The veil is also lighter, fading fully to clear at the bottom, and the video is lifted slightly, so the lobby reads warm and bright rather than grey. It is still a legibility veil, not a dark section. Exact values are in build spec Section 5.1.

### 16.5 Pinned sections

Screen 1 (hero scrub) and Screen 4 (horizontal story) are the two approved pinned sections, overriding the general "pinned or sticky scrolling is exceptional" rule in Section 5.3 for these two screens only.

### 16.6 Screen 4 module button dot

The four Screen 4 module buttons (brochure triggers) carry a trailing 6px `--gd-gold` dot as a decorative mark. It is the only decorative mark permitted inside a button.

> **Approved by the user on 2026-10-02 — Screen 4 chapter cards.** For the four chapter cards (`.gd-module`) only; the final CTA card keeps the shared surface, border and no shadow.
>
> - **Surface.** Unchanged: `--gd-surface` at 92%, no blur. This is the one translucent card on the page (16.10's "always solid" applies to Screens 2a and 2b only).
> - **Border and bar.** 1px `--gd-gold-line` border and a 3px `--gd-gold` bar along the top edge, clipped by the 8px radius.
> - **Depth.** `var(--gd-shadow-card)` plus a contact shadow `0 10px 30px` in `--gd-night` at 22%. This overrides "no shadow by default" (Section 8.1) for these cards; `--gd-shadow-card` is no longer Screen 2a only.
> - **Learn more button.** 1px `--gd-gold` border; hover and focus: `--gd-gold-deep` border and a soft `0 0 0 4px var(--gd-gold-soft)` glow, 200ms, with the standard focus outline kept. This glow is permitted on these four buttons only.
> - **Entrance.** Once per card, when it first becomes interactive in the pinned story: `opacity 0 → 1`, `y: 16 → 0`, and the gold bar draws left to right (`scaleX 0 → 1`), 600ms, design-system ease. The rise never changes the track position. Reduced motion: at rest, bar drawn. Values and contrast are in build spec 5.4.

### 16.7 Screen 4 brochure panel

The side brochure panels follow the reference reading-panel pattern and may use, inside the panel only:

- a dark tag chip (`--gd-text-primary` background, `--gd-bg` text) paired with a soft sky chip (`--gd-sky-soft` background, `--gd-sky-deep` text) — the one place where gold and sky may sit side by side, because they are separate chips;
- a 44px circular close button in `--gd-text-primary`;
- a dark backdrop `rgba(21, 24, 28, 0.55)` behind the open panel;
- warm, low-light brochure photography in the fixed media column.

Everything else inside the panel uses the standard light tokens, typography, and spacing.

### 16.8 Logo

Approved 2026-09-28.

- Light backgrounds (header, footer, any ivory or cream surface): `media/logo/gd-lockup-light.webp`. Emblem-only fallback for very narrow headers and favicons: `media/logo/gd-emblem-light.webp`.
- Dark backgrounds: `media/logo/gd-lockup-dark.webp` (the glowing version). Never place the glowing version on a light surface; its glow and dark globe exist only against black.
- Minimum size: lockup 44px tall; below that use the emblem (minimum 24px).
- Clear space: at least the height of the "GLONARI" line on every side (about 10% of the lockup height).
- Do not recolour, outline, add a glow or shadow, stretch, rotate, or place the logo on a coloured chip or photograph.
- The logo's gold is its own; it is not a source for UI tokens. Interface gold stays `--gd-gold` / `--gd-gold-deep`.

### 16.9 Screen 3 connection visuals

Approved with the Screen 3 rework (visual target `references/screen-3-target.png`). These visuals apply on Screen 3 only and override, for Screen 3 only, the "avoid neon glows" guidance in Section 8.4. Nowhere else on the page may use glows, icon circles, or orbit decorations. Geometry and timing are in build spec Section 5.3.

- **Glow colour.** One shared soft gold glow, `color-mix(in srgb, var(--gd-gold) 35%, transparent)`, declared once on the section as `--gd-connect-glow`. Glows are always soft and small (blur 4–12px); never a hard or saturated neon edge.
- **Icons in circles.** Life areas 1–4 each show one icon inside a circle: 64px (48px in the stacked layout), 1px `--gd-gold` border, `radial-gradient(closest-side, var(--gd-surface), var(--gd-gold-soft))` fill, soft `--gd-gold-soft` glow (`box-shadow: 0 0 24px 6px`). The glyph is a simple solid inline SVG filled `--gd-gold-deep` (28px; 22px stacked). Icons are decorative (`aria-hidden`); the H3 label carries the meaning.
- **Nodes.** Ringed dots with a 2px `--gd-gold` ring on a `--gd-surface` fill: 12px at both ends of every line, glowing softly (`0 0 6px` glow colour). Area 5's node is 20px, with a `--gd-gold` centre, a 6px `--gd-gold-soft` halo ring and a 12px glow.
- **Lines.** 2px `--gd-gold`, round caps, softly glowing through a single `drop-shadow(0 0 4px …)` on the line layer. The same drop-shadow gives the tablet nodes and the travelling particle their glow; no other glow layer is added to the lines.
- **Orbit decoration.** A static dotted ellipse around the tablet in 1px dotted `--gd-gold-line`, one 6px glowing `--gd-gold` dot at its top, and a few small `--gd-gold` specks (3–4px, 30–45% opacity). It never animates or floats, and it is hidden in the stacked layout.
- **Tablet shadow.** The tablet image keeps its single depth shadow, `drop-shadow(var(--gd-shadow-tablet))` (Section 3). The glows above are the only other depth effects on the screen.
- Gold remains the only accent in these visuals; no sky blue is used in them.

> **Approved by the user on 2026-10-01 — extended to Screen 2a.** The connection visuals above also apply on Screen 2a, from 1200px up, as gold threads between the memory panel, Gia's tablet in the photo and the quote card. Screen 2a uses the same glow colour (it declares the same `--gd-connect-glow` value on its own section), the same 12px ringed nodes with a pulse ring and the same travelling 6px particle. Its threads are 1.5px rather than 2px, since they run over a photograph and sit close together; otherwise they follow the line rules above (`--gd-gold`, round caps, one `drop-shadow(0 0 4px …)` on the thread layer). Threads never cross a face or Gia on the tablet screen, and they are hidden wherever the cards leave the photo (below 1200px). Icon circles and the orbit decoration remain Screen 3 only. Geometry and timing are in build spec Section 5.2a ("Screen 2a rework").

> **Approved by the user on 2026-10-01 — extended to Screen 2b.** The connection visuals also apply on the dark Screen 2b, with the same line weight, glow and node style as Screen 2a: one 1.5px `--gd-gold` thread with round caps and one `drop-shadow(0 0 4px …)` in the shared glow colour (Screen 2b declares the same `--gd-connect-glow` value on its own section), joining a 12px ringed node on the phone in the man's hand to a 12px ringed node on the request panel's top border, plus the travelling 6px particle. Added for Screen 2b only: a soft radial `--gd-gold` halo on the phone, `mix-blend-mode: screen`, made of two layers in one element: an outer glow about 260px across (`--gd-gold` at 60% at its centre, max opacity .6) and a brighter inner core about 90px across (`--gd-gold` at 45%); it pulses once (`scale 1 → 1.8`) on entry and each time the particle arrives (raised by the user on 2026-10-02). It never reaches the man's face: it stays 260px except where it or its 1.8× pulse would touch the face, where it shrinks (the core keeps its ratio); measured sizes are in build spec 5.2b, a 2px `--gd-gold` scan line across each request row, and one soft gold glow pulse on each switch track as it turns on. The thread never crosses the man's face; it exists only while photo and panel sit side by side (1200px and up); stacked, the halo stays and the thread and nodes are dropped. Icon circles and the orbit decoration remain Screen 3 only. Geometry and timing are in build spec Section 5.2b ("Screen 2b richer treatment").

### 16.10 Screens 2a and 2b photographs and product panels (approved 2026-10-01)

Applies only to Screen 2a (photo, memory panel, quote card) and Screen 2b (photo, request panel, avatar, controls). Geometry, copy and timing are in build spec Sections 5.2a and 5.2b.

- **Photographs.** Each screen is led by one large photo of a member with Gia nearby, so the copy never stands alone as a text block. 2a: inside the container, radius 8px. 2b: full-bleed to the left, top and bottom edge of the section, no radius. No veils, gradients, colour overlays or filters on either photo: the panels carry their own contrast. One gentle scale-in on entry (`1.04 → 1`), no parallax, no pinning.
- **Panels over photographs.** Panels and quote cards may sit on top of the photos only where the photo carries no important subject; they never cover a face, Gia, or the device the member is using. Their surfaces are always solid, never translucent.
- **Gia avatar (2b).** `media/gia-avatar.webp` as a 32px circle with a 1px `--gd-gold-line` ring, no shadow, no glow, only in the role row of Gia's quote card on Screen 2b.
- **Panels.** Precise, not glassy (Section 8.4). 2a: `--gd-surface`, 1px `--gd-line`, radius 8px, `--gd-shadow-soft`. 2b: `--gd-night-warm-surface`, 1px `--gd-night-line`, radius 8px, no shadow. No blur, no glow, no gradient fill on either. Maximum width 480px.
- **Panel labels.** The mono label with a 6px `--gd-gold` square, as on the Screen 4 chapter labels.
- **Row highlight (2a).** `--gd-gold-soft` background on a row, radius 4px. It marks memories in use; it is not a large gold fill.
- **Status glyphs (2b).** 12px solid inline SVG: check in `--gd-gold`, dash and cross in `--gd-night-text-2`. No red, no green (Section 16.3).
- **Quote card on dark (2b).** The `.gd-quote` component from 16.7 / build spec 5.4a.2 with dark values: `--gd-night-warm` background, 1px `--gd-night-line` border, role label in `--gd-gold`, quote in `--gd-night-text`, outcome line (if any) in `--gd-gold`. Same radius, padding and type as the light card.
- **Switches (2b).** An approved exception to "no pill buttons" (Section 8.2), because a switch is not a button style: track 44×24px, radius 12px; on: `--gd-gold` track, 18px `--gd-night` thumb (5.5:1 against the track); off: transparent track, 1px `--gd-night-line` border, `--gd-night-text-3` thumb. Thumb moves by `transform`, 200ms. Focus ring `--gd-gold`, as for other controls on dark. Switches appear only on Screen 2b.
- Sky blue is not used in either panel.

> **Approved by the user on 2026-10-01 — Screen 2a rework.** For Screen 2a only, replacing the 2a values above:
>
> - **Memory panel (2a).** `--gd-surface-elevated`, 1px `--gd-gold-line` border, radius 8px, a 3px `--gd-gold` bar along the top edge inside the radius, `box-shadow: var(--gd-shadow-card)`; on the photo it adds a darker contact shadow `0 8px 24px` in `--gd-night` at 28%. Still solid, no blur, no gradient fill; maximum width 480px.
> - **Memory rows (2a).** The marker is an 8px ring (2px `--gd-gold`) with a `--gd-gold` centre. A highlighted row has a `--gd-gold-soft` background, radius 4px, and its text in `--gd-gold-deep`, weight 500.
> - **Quote card (2a).** `--gd-surface-elevated` background, 1px `--gd-gold` border, `box-shadow: var(--gd-shadow-card)`.
> - **Gia avatar (2a).** `media/gia-avatar.webp` as a 40px circle with a 2px `--gd-gold` ring, in the role row of the 2a quote card. The 2b avatar keeps its 32px size and 1px `--gd-gold-line` ring.
> - **Gold threads (2a).** Permitted on Screen 2a under 16.9.
> - Photos: the 2a photo's entry scale-in is `1.08 → 1` (2b keeps `1.04 → 1`).

> **Approved by the user on 2026-10-01 — Screen 2b richer treatment (task A10).** For Screen 2b only, replacing the 2b values above:
>
> - **Request panel (2b).** `--gd-night-warm-surface`, 1px `--gd-gold-line` border, radius 8px, a 3px `--gd-gold` bar along the top edge inside the radius, `box-shadow: var(--gd-shadow-night-panel)`. Still solid, no blur, no gradient fill; maximum width 420px on the photo, 480px at most anywhere.
> - **Gia avatar (2b).** 40px circle with a 2px `--gd-gold` ring, as on 2a (replaces the 32px / 1px `--gd-gold-line` avatar).
> - **Quote card on dark (2b).** `--gd-night-warm` background, 1px `--gd-gold-line` border, role label `GIA` in `--gd-gold`, quote in `--gd-night-text`.
> - **Withheld rows (2b).** Once a row's status shows it is not shared, its item text dims to `--gd-night-text-2` (300ms). Only a row the member withholds (row 1, when `What she can share` is off) is also struck through, with a 1px `--gd-night-text-3` line drawn left to right (300ms); rows Gia withholds by her own judgement (rows 2 and 3) are dimmed, never struck through (approved by the user on 2026-10-02). Row 1's check glyph is `--gd-gold`.
> - **Text column (2b).** Key line in `--gd-gold`; a 48px × 1px `--gd-gold` rule 24px above the H2.
> - **Glows (2b).** Phone halo, thread, nodes, particle, row scan line and switch glow pulse, as in 16.9.
> - Photos: the 2b photo's entry scale-in is also `1.08 → 1`. Two-column crop `object-position: 90% 30%`; the stacked band is full width with `max-height: max(80svh, 72vw)` (approved 2026-10-02, build spec 5.2b).
