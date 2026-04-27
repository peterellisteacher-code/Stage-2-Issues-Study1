# Issues Study — Cross-Examination

A self-guided introduction to the SACE Stage 2 Philosophy **Issues Study** (AT3 Investigation), built for Year 12 students working independently while their teacher is away. By the end of the week, each student leaves with a philosophical question committed to paper, three thinkers chosen, and first thoughts on their position.

The site speaks in the teacher's voice. The aesthetic is courtroom-adjacent: hard side-light, austere palette, no rounded corners, dialectical asymmetric layouts. Students are both witness and judge; philosophers take the stand for forty seconds each; the workshop forces self-judgement, not feedback.

## Demo

Serve the folder from a local HTTP server (the site uses `fetch()` for JSON data, which `file://` blocks):

```bash
python -m http.server 8765
# open http://localhost:8765 in Chrome
```

Or any equivalent: `npx serve`, `php -S localhost:8765`, etc.

## Six sections

| § | What it does |
|---|---|
| 1 | Hero — Veo-generated coin video; typed prompt: "What does it mean to choose a question worth defending?" |
| 2 | What this is — 5 emphasised SACE criteria (with all 8 expandable underneath) + three exemplar comparisons (A−, B, C+) showing what each grade band actually does |
| 3 | Wander the seven domains — clickable constellation of 164 questions filtered by domain |
| 4 | Meet the thinkers — 24 photorealistic portraits, hover for hook, click for first-person voiced soliloquy + transcript + linked questions |
| 5 | Question Workshop — student types their draft, reads worked examples, self-judges against the 5 criteria (✓ Granted · ? Examining · ✗ Struck), picks 3 philosophers, writes first thoughts |
| 6 | Commit — name field + format choice (written / oral / multimodal) + "Set it down & download PDF" → real PDF download via jsPDF |

## How students don't lose work

- **Autosave** to `localStorage` on every keystroke (key: `issues-study-workshop-v1`). Tab close, browser quit, machine restart — the draft survives.
- **Visible save indicator** above the name field — flashes "✓ Saved." on each input.
- **Real PDF download** — `html2canvas` + `jsPDF` rasterise an off-screen A4 sheet and trigger a true file download (filename: `Issues-Study-{Name}-{ISO-date}.pdf`). Not a print dialog.
- **mailto: fallback** — if PDF fails or the student can't print at home, "Email it to Peter instead" pre-fills the email body with the question, philosophers, and first thoughts.

## Aesthetic — "Cross-Examination"

The full design contract is in [`aesthetic-brief.md`](aesthetic-brief.md). Tokens locked in `styles-base.css`:

- **Ground** `#0E0F12` (Adversarial Black, flat, no gradient)
- **Paper** `#F2EEE6` (Witness Paper)
- **Aged** `#E8DDC9` (Aged Document — quotes)
- **Struck** `#C8423A` (Struck Through — objection ink, marks contestation, *not* error)
- **Granted** `#5B6A78` (Granted Point — when something holds, *not* "correct")

Three font families, three roles:
- **Source Serif 4** — the courtroom (section heads, philosopher names)
- **Inter** — the witness (prose body)
- **JetBrains Mono** — the evidence (philosopher hooks, bank questions, draft input)

There is also a **dynamic skin layer** — when a domain section enters the viewport or a thinker modal opens, the ground hue + accent shift subtly per domain (`html[data-domain="ethics"]`, etc.). 7 domain skins + 24 per-philosopher accent colours.

## File structure

```
cross-examination-site/
├── index.html               main 6-section page
├── print-view.html          legacy printable (uses same PDF flow)
├── styles-base.css          tokens, reset, grid, motion, dynamic skin layer
├── styles.css               @imports base + section-specific styles
├── print.css                printable / PDF-page styles
├── script.js                rendering, modal, audio player, workshop, PDF download, drone synth
├── aesthetic-brief.md       design contract
├── data/
│   ├── questions.json       164 questions (126 from school's bank + 38 hook-augmented)
│   ├── thinkers.json        24 thinkers + bios + hooks + linked-question IDs
│   ├── criteria.json        5 emphasised + all 8 SACE criteria + worked examples
│   ├── exemplars.json       A−, B, C+ extracts with annotations
│   ├── soliloquies.json     24 first-person voiced scripts (~120 words each)
│   ├── _build_questions.py  parser to regenerate questions.json from a markdown bank
│   └── _build_thinkers.py   builder to regenerate thinkers.json
└── assets/
    ├── portraits/   24 × .png  (Imagen 4 Ultra, ~1.5 MB each)
    ├── audio/       24 × .wav + 24 × .txt transcripts (~2.5 MB WAV each)
    ├── video/       1 × .mp4 (Veo 3, 1080p, 8s loop, ~5.8 MB)
    ├── music/       (empty — Lyria broken at build time; Web Audio drone in script.js)
    └── textures/    (optional SVG patterns for skin layer; falls back to none)
```

## Build / regenerate data

```bash
# Regenerate questions.json from Question Bank.md
python data/_build_questions.py

# Regenerate thinkers.json (with auto-linked question IDs)
python data/_build_thinkers.py
```

These scripts expect the source `Question Bank.md` to live at `../Question Bank.md` (one level above the site). Adjust the `BANK` path in `_build_questions.py` if you move things.

## The 24 thinkers

Balanced 7-7-7 across the three core domains plus 3 cross-cutting:

| Ethics | Epistemology | Metaphysics | Cross-cutting |
|---|---|---|---|
| Aristotle, Mill, Singer, Foot, Gilligan, Nussbaum, Confucius | Hume, Descartes, Locke, Kant, Russell, Frank Jackson, Anscombe | Plato, Nietzsche, Sartre, Beauvoir, Kierkegaard, Parfit, Bernard Williams | Hobbes (Political), Žižek (Critical), Murdoch (Aesthetic-moral) |

6 women (25%), 1 non-Western voice (Confucius), 7 contemporary (post-1950).

## Browser support

Built and tested for **Chrome at 1920×1080** (classroom projection). Graceful narrow-viewport fallback at <800px (single-column stack, hooks always visible, modal goes full-screen). Should work on any modern browser supporting CSS Grid, `aspect-ratio`, `backdrop-filter`, and Web Audio API. IE not supported.

## Credits & generation pipeline

- Portraits generated with **Imagen 4 Ultra** via Vertex AI (single shared prompt template for visual consistency across the salon).
- Soliloquy audio: **Gemini TTS** (`gemini-3.1-flash-tts-preview`), 30 voices distributed across the 24 thinkers by era / gender / register.
- Hero video: **Veo 3 Fast**, 1080p, 8s.
- Ambient drone: synthesised client-side via Web Audio API — sustained low oscillators + LFO-modulated shimmer + paper-rustle / pen-scratch / gavel-tap event sounds.
- Source materials: SACE-supplied exemplars and Assessment Advice (extracts only, copyright-respected — not redistributed in this repo).

## License

This is a teaching artefact. Source code, design tokens, and the aesthetic brief: free to study, adapt, and redistribute with attribution. Generated portraits are not redistributable — they were created with Vertex AI under usage terms. Soliloquy text is original to this project.

The SACE criteria, exemplar extracts, and bank questions originate from the South Australian Certificate of Education and prior student cohorts; those are SACE / school records, used here for educational scaffolding only.
