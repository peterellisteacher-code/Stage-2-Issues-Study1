# Portrait Replacement — Handoff

**Goal:** replace the 24 AI-generated lookalike portraits at
`assets/portraits/<id>.png` with authentic period-accurate portraits or
photographs, sourced from Wikimedia Commons or equivalent rights-clear
archives.

## What's already done in this branch

- **`data/portrait_credits.json`** — a 24-entry manifest with: a recommended
  Wikimedia Commons file URL, a fallback Wikipedia article URL, the
  artist/photographer + work + date, a license guess, and a confidence
  rating. The teacher (you) does the final rights review on each entry.
- **Modal rendering** — `script.js` now reads `portrait_credits.json` at
  boot. When a thinker modal opens, the credit string is displayed as a
  small italic line over the bottom of the portrait, linked to the
  Commons / Wiki source. Hidden if no credit is available. CSS in
  `styles.css` under `.modal__portrait-credit`.
- **No image bytes have changed.** The local `assets/portraits/<id>.png`
  files are still the AI-generated ones. Visual swap requires downloading
  the real images and overwriting those PNGs.

## What still needs doing — and from where

This sandbox can't reach `commons.wikimedia.org` (the same network
allowlist that blocked the Netlify deploy also blocks Wikimedia). So
the actual download and commit has to happen from a runtime that can
reach the public web — your native Claude session, or directly from
your terminal.

### Recommended workflow

1. Open `data/portrait_credits.json`. Each entry has:
   - `commons_url` — the Commons file page where the canonical work lives
     (or `null` if I couldn't confidently identify a CC-licensed source)
   - `wiki_url` — the philosopher's Wikipedia article, as a fallback nav
     point
   - `confidence` — `high` (use as-is), `verify` (sanity-check the URL),
     or `low` (the field is `null`; you'll need to find a source yourself)

2. For each `commons_url`, click through, scroll to the file's preview,
   and save the largest JPEG or PNG version. Crop to a portrait-friendly
   3:4 aspect ratio (the existing PNGs are roughly that). Resize to
   roughly 1200×1600 to keep on-page weight reasonable.

3. Save each as `assets/portraits/<id>.png` (overwriting the existing
   AI lookalike). The filenames must match the `id` in
   `data/thinkers.json` exactly: `aristotle.png`, `descartes.png`, etc.

4. Commit and push to `claude/autonomous-implementation-4aVGe`.
   Netlify's GitHub auto-deploy will rebuild and publish.

### The seven `null` entries

These are the philosophers whose iconic Wikipedia photographs are still
copyrighted (often Steve Pyke's portraits) and whose Wikipedia article
images are used under fair use rather than a CC license:

- **foot** — Philippa Foot
- **anscombe** — G. E. M. Anscombe
- **murdoch** — Iris Murdoch
- **williams** — Bernard Williams
- **parfit** — Derek Parfit
- **jackson** — Frank Jackson
- **gilligan** — Carol Gilligan

For an educational institution, the practical options are:

1. **Use the Wikipedia fair-use image directly.** Section 107 (US) /
   educational fair-dealing (UK / Australia) covers reproducing a portrait
   of a public figure for educational, non-commercial use that
   identifies them. Most schools and universities are comfortable with
   this for teaching materials; check your institution's policy.
2. **Email the relevant institution.** Foot at Somerville Oxford,
   Anscombe at Cambridge / the Anscombe Bioethics Centre, Williams and
   Parfit at All Souls Oxford, Jackson at ANU. Most respond favourably
   to teacher requests; some will give you a permissioned headshot.
3. **Contact the photographer.** Steve Pyke in particular has been
   sympathetic to educational requests in the past. His portraits of
   Williams and Parfit are the most-recognised likenesses.

If you go with option 1, update `commons_url` in the manifest from
`null` to the Wikipedia article URL and add a `credit` line like
"Wikipedia, used under educational fair use, accessed [date]" so the
attribution renders.

## Sanity check after the swap

Open the site locally (`python3 -m http.server 8000`), click each
thinker card, and confirm the portrait + credit line look right. Watch
specifically for:

- Cropping that cuts off the face (the existing CSS uses
  `object-position: center top`, optimised for headshots — group photos
  or full-body shots will look wrong without recropping)
- Aspect ratios far from 3:4 — letterboxing or stretching can make
  unfamiliar faces look uncanny
- Credit lines longer than ~110 characters — they'll wrap awkwardly on
  the desktop modal layout. Trim to the artist + year + institution if
  needed.

## Reverting

If a swap goes wrong, `git checkout HEAD~1 -- assets/portraits/<id>.png`
restores the previous version of that one file.
