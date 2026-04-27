# Aesthetic Brief — Issues Study Self-Guided Site

**Project**: Year 12 SACE Philosophy "Issues Study" introduction website. Six scrolling sections. Students arrive without their teacher; by week's end they leave having committed to a philosophical question they'll defend in their AT3 investigation (30% of final grade).

**Codename**: **Cross-Examination**.

---

## Source Text Derivation

(The "text" here is the act of philosophical questioning itself, plus the assessment task.)

- **Visual world**: Hard side-lit faces in dim rooms. Margins of an old manuscript with red-ink corrections. The mouth of a courtroom witness box. The dust of an interrupted argument. A single coin rotating slowly to show its other side.
- **Sonic world**: A long pause after a question. The resonance of a stone hall. The soft rustle of paper. A gavel that doesn't echo. No melody — only weight and strike.
- **Structural pattern**: Dialectical. Claim → counter-claim → tension → judgement. Never balanced; always weighted to one side, with the response weight on the other.
- **Sensory DNA**: The discomfort of holding a position you might be wrong about. The Socratic willingness to be made foolish in public. Cold, austere, weighted, unsentimental — but never sterile. The room is a courtroom; you are both witness and judge.

---

## Content Essence

- **Core intellectual activity**: Defending a position under cross-examination. Asking "is this question worth my year?"
- **Emotional texture**: Uncomfortable confidence; serious commitment; the courage to be wrong in public.
- **Governing metaphor**: The **philosophical examination** — text-as-witness, philosopher-as-defendant, student-as-judge. Strikethroughs as objections; margin marks as adjudications.
- **Stakes register**: **Medium-high.** 30% of the year. More importantly: the first time a 17-year-old is asked to commit publicly to a position they'll defend.
- **Natural pace**: Slow, weighted, with moments of strike. The long thought followed by the sharp question.

---

## Visual Metaphor

The site is a **stage of contested ground** — a quiet, hard-lit room where claims are set down, examined, and either struck through or granted. Information arrives in pairs: a claim and its counter, a topic and its question-form, a position and its objection. The visual world is courtroom-adjacent without being legal: it's the philosophical examination room — colder than academia, hotter than law.

The **central image** the site keeps returning to: a worn coin, rotated slowly between thumb and forefinger, showing its other side. (Hero video; recurring iconography in section dividers.) The coin is the question turned over to be examined.

---

## Spatial Logic

**Dialectical asymmetry.** No layout is centred. Every section has a primary weight on one side and a counter-weight on the other, with significant negative space between — that empty space is where the question lives.

- §2 "What this is" — criteria appear in left column; exemplar evidence cuts in from the right, struck through where appropriate.
- §3 "Wander the seven domains" — domains arranged not in a grid but as a constellation: closer pairs are conceptually adjacent (Ethics ↔ Political; Epistemology ↔ Metaphysics).
- §4 "Meet the thinkers" — **NOT a 4×6 grid.** A staggered dialogue layout. Thinkers appear in conversational clusters: Plato/Aristotle as a pair; Sartre/Beauvoir adjacent; Singer/Foot facing each other across the trolley problem; Žižek standing alone on the right edge; Confucius isolated and slightly elevated. The layout teaches that philosophy is positions arguing with each other, not 24 individuals.
- §5 Workshop — left column is the student's draft; right column is the live worked-example evidence; a third margin column carries the criterion adjudications. Three columns in tension.
- §6 Commitment — single weighted line across the page, like a signature line.

---

## Composition Lock (handed to /page-composition next)

- **Grid**: 12-column, 24px gutters, 1440px max content width on a 1920px viewport. Asymmetric column spans (typical 7+5 or 8+4, never 6+6).
- **Type scale**: 18 / 24 / 32 / 43 / 57 / 76px (Perfect Fourth from 18px base).
- **Spacing tokens**: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128px.
- **Layout strategy**: CSS Grid for section-level structure; Flexbox for adjudication-row arrangements. Heavy use of `grid-template-columns: 7fr 5fr` and similar asymmetric ratios. **No** `auto-fit minmax` uniform grids.
- **Viewport**: scroll-driven, six full-viewport sections (`min-height: 100vh`) plus the hero video (full bleed). Sticky top nav, 56px tall, no border, slight backdrop-blur.
- **Spacing hierarchy**: 16px within paired claim/counter elements; 96px between dialectical pairs; 128px between sections.
- **Mobile graceful**: at <800px viewport, 12-column collapses to single column; thinker dialogue clusters become vertical pairs; workshop columns stack with criteria adjudications inline.

---

## Colour Story

A five-colour palette where every colour has a *role in the courtroom*, not a decorative function. Tokens defined as CSS custom properties.

| Token | Hex | Role | Meaning |
|---|---|---|---|
| `--ground` | **#0E0F12** | The room | Adversarial Black — flat, single value, no gradient. The colour of a hard-light examination room at night. |
| `--paper` | **#F2EEE6** | The witness | Witness Paper — warm-leaning off-white. Used for primary text and the "voice" of philosophers in soliloquy modals. |
| `--aged` | **#E8DDC9** | The document | Aged Document — slightly fleshier ivory. Used for quoted bank questions, hook lines, and anything that should read as "human said this." |
| `--struck` | **#C8423A** | The objection | Struck Through — the colour of red ink on a manuscript. Marks **contestation**, never "wrong." Appears on strikethrough lines, on the margin annotation when a topic-not-question example is shown, on the workshop's "struggling" state. |
| `--granted` | **#5B6A78** | The adjudication | Granted Point — cold grey-blue. When a criterion holds up, when an objection is conceded, when a question passes the test. Different concept from "correct" — *granted*. |

**Anti-default note:** The two signals (`--struck` and `--granted`) deliberately avoid green/red. Red exists but means *the objection raised in a margin*, not *the wrong answer*. There is no "correct" feedback colour because the workshop is judgement-based, not test-based.

---

## Typography

Three families, each with a courtroom role:

- **Display (Source Serif 4)** — the framing. Section headers, the names of the seven domains, the philosopher names. Weight 600. Tight tracking (-0.01em). Connects to: *the framing of a trial — formal but not pompous.* Loaded from Google Fonts CDN.
- **Body (Inter)** — the testimony. All prose, criteria explanations, workshop instructions, exemplar annotations. Weight 400 with 500 for emphasis. Generous line-height 1.65. Connects to: *witness speaking plainly under examination.*
- **Hook (JetBrains Mono)** — the evidence on the table. Philosopher hook quotes. Bank questions. Workshop draft input. The hero video overlay. Weight 400, occasional 700 for emphasis. Connects to: *transcript of an interrogation, the grain of language being scrutinised.* Monospace because it reads as TYPED — cold, deliberate, exactly what was said.

Type pairing rationale: **Source Serif 4 is the courtroom**, **Inter is the witness**, **JetBrains Mono is the evidence**. Three voices, three registers, never substituted for each other. Site rule: any quoted question or philosophical hook is in JetBrains Mono. Any heading is in Source Serif 4. Any explanation is in Inter.

---

## Sound Identity

**Sonic world**: **resonant + filtered + sparse.** Sustained tones, no melody, no jingles. The acoustic of a stone hall after someone has spoken.

| Event | Sound |
|---|---|
| **Section enters viewport** | Sustained low drone fades up (Lyria-supplied ambient track for that section). 4-second fade. |
| **Soliloquy starts (modal opens)** | A single low resonant tone (~200 Hz, sine + slight harmonic) fades up over 800ms before the voice — "clearing the air for testimony." |
| **Soliloquy ends** | A single soft tap — gavel-like but smaller, like a pen set down. Lower-mid frequency, no reverb tail. |
| **Criterion ticked (workshop)** | A *paper rustle* — filtered noise, 250ms, very soft. The sound of a hand turning to the next page of evidence. |
| **Criterion struck (struggling state)** | A single short **scratch** — like pen scoring through text. Brief, slightly unsettling. Reinforces the strikethrough animation. |
| **Save commitment (Set Down)** | A three-tone sustained chord, played consecutively (not arpeggiated). Open fifth + minor sixth — deliberately ambiguous, neither triumphant major nor mournful minor. The ambiguity matters: you're committing to a question, not declaring victory. |
| **Background ambient** | Lyria tracks (4 total — see §sonic plan). Each section has its own register. |

**Lyria tracks plan** (4 total, ~30s each, looping):
1. **Hero ambient** — slow, contemplative drone with single low piano notes. The sound of a room before something serious happens.
2. **Domain wandering** — slightly more open, breath-like. Wind through stone passages. Encourages exploration.
3. **Workshop focus** — sparser still, with subtle ticking texture. The sound of careful concentration. Pulse around 60bpm but no melodic drive.
4. **Commitment moment** — fuller, sustained chord underpinning. Brief — plays only when the Set Down button is clicked, ~12 seconds, then silence.

---

## Animation Character

**Movement style**: **weight, then strike.** Most motion is slow and considered (600-1000ms with `cubic-bezier(0.16, 1, 0.3, 1)` — slow start, slow end). Specific moments are sharp, decisive (150ms, ease-out) — they are the visual punchline.

| Event | Animation |
|---|---|
| **Section enter** | Content fades in from 0 to 1 opacity over 700ms while the layout settles. No translate. No scale. |
| **Hook quote appears (philosopher hover)** | Quote types out character-by-character in JetBrains Mono into the margin space. ~50ms per char. The cursor blinks at the end. |
| **Strikethrough on topic-style example** | Text appears, hovers for 500ms, then a red ink line strokes across L→R in 220ms with `ease-out`. A satisfying objection. |
| **Margin annotation** | Worked example slides in from the right edge by 12px and fades from 0 to 1 over 600ms, with a 1.5° rotation. Like a hand-pinned note. |
| **Criterion state change** | The margin mark (✓ / ? / ✗) wipes in via a clip-path mask, 180ms, as if drawn by a pen stroke. The mark itself is hand-drawn SVG, not a font glyph. |
| **Set Down click** | Button text changes to "Setting down..."; the page dims by 20% for 800ms; the printable view fades into a new tab; a sustained chord plays. |

**No floating particles. No glow. No box-shadow. No scale-on-hover. No bouncy easings.** The aesthetic is flat, hard-edged, cinematic in stillness. When something moves, it means something.

---

## Interaction Model

**Primary interaction**: **Self-judgement against worked examples.** In §5 Workshop, the student types their question, then for each of the 5 criteria they read 2-3 worked examples (good vs bad) and decide for themselves whether their draft meets it. Click the criterion mark to cycle: unmarked → ✓ Granted → ? Under examination → ✗ Struck. The site never tells them; they decide.

**Secondary interaction**: **Reveal-on-hover for hook quotes.** Hover a philosopher portrait → their hook quote types into the margin. Click → modal opens with full soliloquy + audio + transcript + linked questions.

**Why these interactions**: philosophy is judgement, not pattern-matching. The interaction model embodies the cognitive work — the student does the philosophical adjudication, just as they will in their final response.

---

## Ludonarrative Alignment

**Mode**: harmony with one deliberate dissonance.

- **Harmony**: Site teaches careful, weighted philosophical questioning; aesthetic is careful, weighted, austere. Slow animations reward considered thought. Self-judgement workshop forces the student to commit.
- **Dissonance**: At the save moment, language is firm and slightly judging — *"You are setting down this question as the position you will defend."* This is uncomfortable on purpose. Year 12s often want to keep options open; the site asks them to commit. The discomfort *is* the lesson — committing to a defensible position is the AT3 task.

---

## Rendering Approach

- **Medium**: Photography-based portraits (Imagen 4 Ultra) + Veo 3 hero video + CSS/SVG for everything structural. No pixel art, no illustration, no game sprites.
- **Why**: The cross-examination metaphor demands photographic seriousness. Illustration would soften the register. Pixel art would trivialise. The 24 thinkers must read as *real people who are looking past you*, not characters.
- **Downstream skills**: none required (no PixelLab, no web-animation skill — CSS/SVG handles all motion).

---

## Imagen 4 Ultra Portrait Prompt Template

The single template, plugged with each philosopher's identifier, drives all 24 portraits + 1 hero portrait variant. Critical: the template must produce **one cohesive salon** when the 24 portraits are seen together.

```
A photorealistic portrait of {PHILOSOPHER_NAME}, {PERIOD_AND_DESCRIPTOR},
shown from chest-up in a three-quarter pose against a flat near-black background
of #0E0F12. Single hard cinematographic side-lighting source from camera left at
roughly 30 degrees, casting a strong vertical shadow that fills the right half
of the face — the lighting is unforgiving, like an examination-room lamp. The
subject is mid-thought: not smiling, not glaring, listening intently to an
argument they may disagree with. Their gaze is directed past the camera at the
unseen interlocutor, never at the lens. Period-appropriate clothing in muted
tones only — charcoal, off-white, slate, faded ivory, ash; never bright,
never saturated. Skin tone rendered naturally, never glamourised; visible
texture and weight on the face. Painterly photographic quality, like a
contemporary editorial portrait shot on a 50mm prime lens at f/2.8, ISO 800,
slight grain. Cool colour grading with subtle warmth in the highlights only.
Composition: 4:5 portrait aspect, philosopher fills the central two-thirds of
the frame, head positioned in the upper third per rule-of-thirds. Empty
right-side shadow occupies one-third of the composition.
NO props, NO text, NO scrolls, NO books, NO candles, NO additional figures,
NO classical iconography. The portrait must read as a serious contemporary
photograph — not a painting, not a sculpture reference, not a costume study.
Style consistency: every philosopher in this series shares this exact lighting,
framing, mood, palette, and grade so they read as one continuous salon.
```

**Per-philosopher `{PERIOD_AND_DESCRIPTOR}` examples** (24 to be filled in when generation runs):
- Plato: "ancient Greek philosopher of the 5th century BCE, fit and bearded, in a plain unadorned grey wool himation"
- Žižek: "21st-century Slovenian philosopher in his sixties, full beard, worn black turtleneck, deeply expressive face mid-objection"
- Beauvoir: "20th-century French philosopher in her forties, hair pinned up severely, in a charcoal blouse, sharp intelligent gaze"
- (etc — full list authored at portrait-generation step)

**Generation pipeline**:
1. Generate one **reference portrait** (Plato, since he's iconic and grounds the series) using Imagen 4 Ultra. Inspect for style fit.
2. Use that reference as a style anchor (via Imagen 4's reference-image capability) for the remaining 23 + hero variant.
3. Generate 3 variants per philosopher; manually select the one that best fits the salon. Total: 25 final + ~50 rejected = ~75 generation calls × $0.06 (Ultra) = ~$4.50.
4. Hero image: a tighter crop of one of the philosopher portraits (likely Plato or a generic figure) used as backdrop ghost behind the Veo video.

---

## Veo 3 Hero Video Brief

8-second 1080p loop, plays muted-by-default behind the hero text overlay.

**Subject**: A single hand at a wooden table, slowly rotating an old, well-worn coin between thumb and forefinger. The coin's faces are illegible — worn down by handling. Hard side-lighting from camera left. Background flat black (#0E0F12).

**Motion**: Extremely slow rotation — 8 seconds for one quarter-turn. The hand barely moves; the coin catches the light as it pivots. Loop seamlessly by playing the 8 seconds forward, then reverse-played for the next 8 seconds.

**Audio**: Hero Lyria track underneath, very quiet (loaded muted, one-click to unmute).

**Text overlay** (HTML/CSS, not in the video itself): in JetBrains Mono, types character-by-character at first scroll: `> What does it mean to choose a question worth defending?`. Cursor blinks at the end. Below, in Source Serif 4, the deliverable: "By Friday — choose your question. Set it down. Defend it."

---

## Anti-Default Check

| # | Default | What I did instead |
|---|---|---|
| 1 | Dark gradient background | Flat #0E0F12, single value, no gradient. The colour is the room, not a backdrop. |
| 2 | Georgia / system serif body | Source Serif 4 (display) + Inter (body) + JetBrains Mono (hooks). Three roles, never substituted. |
| 3 | Rounded rectangles | All borders square. Photographs are rectangular, never rounded. The aesthetic is hard-edged. |
| 4 | Blue + gold / teal + amber | Adversarial Black + Witness Paper + Aged Document + Struck Through red + Granted grey-blue. |
| 5 | Green = correct, red = wrong | Red means *objection raised in a margin* (Struck Through). The "correct" colour doesn't exist; *Granted* means the criterion holds, conceptually different. |
| 6 | Centred grid of cards | Asymmetric, dialectically paired layouts. Thinkers in dialogue clusters, never uniform grid. |
| 7 | Ascending beep on success | Resonant low tones, gavel taps, paper rustles, ambiguous sustained chord on commitment. |
| 8 | Descending buzz on wrong | No "wrong" sound. Workshop is judgement-based; struggling state gets a single pen-scratch noise. |
| 9 | Hover scale + glow | Hover types a hook quote into margin. No scale. No glow. No box-shadow. |
| 10 | Linear Boot→Instructions→Game→Results flow | Single scrolling page, six sections, sticky nav. Continuous experience. |
| 11 | Linear progress bar | No bar. Progress is the section the student is in; the sticky nav highlights it. |
| 12 | Screen shake / red flash on wrong | None. Pen-scratch sound and red strikethrough animation only when the student themselves marks something Struck. |
| 13 | Generic congratulations | Language of formal commitment: "Set Down," "Granted," "Under examination," "Objected." No "Well done!" |
| 14 | Could swap content and design still works? | **No.** This aesthetic only works for adversarial philosophical examination. It would be wrong for friendly intros, wrong for vocab drills, wrong for anything below stakes-medium. |

---

## Notes for /page-composition (next skill)

- Lock to the Composition Lock section above.
- Use 12-column grid with asymmetric ratios (typical `7fr 5fr`, `8fr 4fr`, `5fr 7fr`); explicitly avoid `repeat(3, 1fr)` uniform grids.
- Section transitions are full-bleed; section content is constrained to 1440px max-width and aligned left within that, with the right column carrying counter-weight, evidence, or empty space.
- Sticky nav: 56px tall, `position: sticky`, `top: 0`, `backdrop-filter: blur(12px)`, background `rgba(14, 15, 18, 0.7)`. Items in JetBrains Mono.
- Print stylesheet (`print.css`): single-page A4. White ground, paper-coloured accents, no images, monospace question, serif quotes from chosen philosophers, signature line at the bottom. Maintain the cross-examination register even in print.
- Photographs maintain 4:5 aspect ratio in all viewports; thumbnails are 280px wide on desktop, scaled proportionally on mobile.

---

## Tokens — ready for use in `styles.css`

```css
:root {
  /* Colour tokens */
  --ground: #0E0F12;
  --paper: #F2EEE6;
  --aged: #E8DDC9;
  --struck: #C8423A;
  --granted: #5B6A78;

  /* Type scale (Perfect Fourth from 18px) */
  --t-base: 18px;
  --t-step1: 24px;
  --t-step2: 32px;
  --t-step3: 43px;
  --t-step4: 57px;
  --t-step5: 76px;

  /* Spacing tokens (8px grid) */
  --s-1: 8px;
  --s-2: 16px;
  --s-3: 24px;
  --s-4: 32px;
  --s-5: 48px;
  --s-6: 64px;
  --s-7: 96px;
  --s-8: 128px;

  /* Type families */
  --f-display: "Source Serif 4", Georgia, serif;
  --f-body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --f-hook: "JetBrains Mono", Consolas, monospace;

  /* Motion tokens */
  --ease-considered: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-strike: cubic-bezier(0.25, 0.1, 0.25, 1);
  --t-slow: 700ms;
  --t-considered: 600ms;
  --t-strike: 180ms;
  --t-quick: 220ms;
}
```

Google Fonts CDN URL (single request):
```
https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap
```

---

End of brief. The site is a courtroom; the visitor is both witness and judge; the philosophers are speaking under examination across 2,500 years; by the end, the visitor sets down a question they will defend.
