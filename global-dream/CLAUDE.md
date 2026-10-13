# Global Dream (Gia page) — Permanent Project Instructions

Global Dream is a subsection of the Digital Banker section of the Glonari platform. This repository contains one static landing page that presents Gia. It is a sibling of the Global Reserve project and follows the same engineering approach, with a light theme.

## Required reading

Before modifying any project file, read these documents completely:

1. `GLOBAL-DREAM-BUILD-SPEC.md`
2. `GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md`

Do not begin implementation until both documents have been read. For Screen 4, also open `references/oceanx-horizontal-story-reference.mp4` and `references/oceanx-contact-sheet.jpg` before writing code.

`references/Global_Dream_Gia_Structure_EN.txt` is the original content brief. The build spec supersedes it wherever they differ.

## Source-of-truth order

1. The current user prompt controls the scope of the current task.
2. `GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md` controls colors, typography, spacing, grids, component appearance, section rhythm, responsive behaviour, and visual motion character.
3. `GLOBAL-DREAM-BUILD-SPEC.md` controls approved English copy, screen order, product terminology, semantics, media contracts, scroll timing, accessibility, and functionality.
4. Approved screens remain unchanged unless the current prompt explicitly authorizes changes to them.

If two instructions conflict, stop and report the conflict instead of guessing.

## Scope protection

- Work on only the screen or bounded system task named in the current prompt.
- Do not modify previously approved screens.
- Once Screen 1 is approved, it is locked: do not change its HTML, CSS, JavaScript, runway, video, text positions, timing, or smoothing without explicit authorization.
- Do not fix unrelated problems. Report them instead.
- Keep unfinished screens hidden (`hidden` attribute on the section) until they are implemented and visually verified.
- Preserve existing user changes. Inspect `git status` and `git diff` before editing.
- Items marked `PROPOSED` in the build spec are not approved. Do not build them until the prompt says they are approved.

## Documentation synchronisation

Update `GLOBAL-DREAM-BUILD-SPEC.md` in the same task when the user approves a change to copy, screen order, terminology, semantics, functionality, media paths or behaviour, scroll timing, video timing, animation progress ranges, or accessibility requirements.

Update `GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md` in the same task only when the user explicitly approves a permanent change to tokens, typography, container or grid rules, section spacing, breakpoints, shared component appearance, or permanent motion principles.

Do not change a specification to justify an implementation mistake. A bug fix that restores compliance with an existing document does not require rewriting that document.

## Language

- All project files must remain in English.
- Never add Cyrillic characters to HTML, CSS, JavaScript, JSON, Markdown, comments, attributes, filenames, or commit messages.
- User-facing copy must match the build spec character for character, including typographic apostrophes (`’`) and em dashes (`—`). Do not rewrite, shorten, or re-punctuate it.
- If a string is not in the build spec, do not invent it. Insert `<!-- TODO: copy needed -->` and list it in your report.

## Implementation

- Vanilla HTML, CSS, and JavaScript. No frameworks, npm, bundlers, TypeScript, Tailwind, or React.
- The only library is GSAP 3.12.5 from `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`. Do not add ScrollTrigger or any other plugin or library without explicit permission. Scroll progress is computed by each module's own lightweight tracker.
- Each screen module exports one `init…(sectionEl)` function and creates no globals beyond that function.
- Reuse existing classes, tokens, and functions. Do not duplicate an implementation that can be safely reused.
- Respect `prefers-reduced-motion`.
- Never create page-level horizontal scrolling. Screen 4's horizontal motion is a transform inside a sticky stage driven by vertical scroll.
- Do not change layout while an animation is running.
- Missing media must not break the page.
- Serve locally with `python3 -m http.server`. The blob video fetch does not work over `file://`.

## Known pitfalls (learned on Global Reserve)

- Never set `overflow: hidden` or `overflow: auto` on any ancestor of a `position: sticky` stage. It silently breaks the pin. Contain overflow on the sticky stage itself.
- A video inside a sticky grid stage must be explicitly sized (`width: 100%; height: 100%; object-fit: cover`) or it falls back to its intrinsic ratio and overflows the stage.
- The global `* { margin: 0 }` reset removes native `<dialog>` centering. Position dialogs explicitly.
- Scrubbed videos must be all-keyframe (`-g 1`) and audio-free (`-an`). Issue a new seek only when `!video.seeking`.
- Fixed header overlays pinned stages. Do not add padding to pinned sections to compensate; place stage content with the header height in mind.

## Git workflow

Before editing: run `git status`, inspect `git diff`, identify existing user changes, and do not overwrite or revert them.

After editing: list changed files, run relevant syntax and browser checks, show `git status` and `git diff --stat`, and separate this task's changes from earlier uncommitted changes.

Do not run `git add`, commit, push, pull, reset, discard changes, or change branches unless the current prompt explicitly authorizes that exact action.

## Verification

Before reporting a screen complete:

- verify approved copy character for character;
- verify layouts at 1920, 1440, 1024, 768, and 375 CSS pixels;
- verify no horizontal page scrolling;
- verify the browser console has no project errors or warnings;
- verify reduced-motion behaviour;
- verify previously approved screens are unchanged;
- verify unfinished screens remain hidden;
- verify no Cyrillic was added: `LC_ALL=C.UTF-8 grep -rnP "[\x{0400}-\x{04FF}]" --include=*.{html,css,js,md} .`

Keep reports concise and factual: what changed, what was checked, and anything unresolved. Do not attach screenshots, contrast tables, or other captured images to reports unless the current prompt asks for them. You may still take screenshots internally when a check requires one. Time-box debugging: after two unsuccessful attempts at the same problem, stop and report instead of continuing.
