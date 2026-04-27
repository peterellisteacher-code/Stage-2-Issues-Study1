# Deploy Report — Cross-Examination Issues Study

Date: 2026-04-27
Branch: `claude/autonomous-implementation-4aVGe`
Repo: peterellisteacher-code/Stage-2-Issues-Study1

This file replaces the earlier "Issues Study Lab" deploy attempt that was
blocked at pre-flight on 2026-04-26. The Lab (Cloud Run + Netlify proxy) is
**not** what's in this branch — that work is still pending and described
at the bottom of this file.

---

## Run on 2026-04-27 — Bug fixes + Netlify deploy attempt

### What ran successfully

**Code changes (committed and pushed):**
- `script.js` — three behavioural bug fixes:
  - **Drone rapid-toggle race.** When the user toggled Sound Off mid-fade
    and then On again, `_stopTimer` was cleared but `STATE.drone` was
    still set, so `if (STATE.drone) return;` short-circuited and the
    pending `linearRampToValueAtTime(0, …)` kept dragging gain to zero.
    Net result: the toggle reported "Sound: on" with no audio. Fix:
    cancel the scheduled gain values and ramp back up to 0.6 if we
    re-enter while the drone is still alive.
  - **AudioContext suspended-state resume.** `ensureAudio()` was
    fire-and-forget on `ctx.resume()`, so on iOS Safari oscillator
    `start(ctx.currentTime)` calls would schedule against a stale
    timestamp that jumped forward when the context resumed, silently
    skipping the start window. Fix: `ensureAudio()` is now `async` and
    `await`s the resume; `startDrone()` and `playUiSound()` were updated
    to await it before scheduling.
  - **Modal focus management — focus trap.** The existing code already
    saved the trigger element and restored focus on close, but Tab
    could still escape the modal into the page behind. Added a
    `trapModalFocus(e)` handler wired into the existing keydown listener
    so Tab/Shift+Tab cycles within the modal's focusable elements only.
    Replaced the racy `setTimeout(50)` focus-on-open with
    `requestAnimationFrame` so focus moves only after the modal has
    painted.
- `styles.css` — modal close button:
  - Switched `.modal__close` from `position: absolute` to
    `position: relative`, placed in the modal's grid (`grid-column: 1 / -1`,
    `justify-self: end`) so it spans the top row above the portrait and
    content rather than overlapping the portrait. Added a hover/focus
    state for visibility.
  - Updated the `<800px` media query so the single-column mobile layout
    now uses three rows (close → portrait → content) instead of leaving
    the close button stacked on top of the portrait.
- `netlify.toml` — added at repo root with publish dir `.`, no build
  command, security headers (X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy), and tiered caching (immutable for `/assets/*`,
  short-with-SWR for `/data/*.json`, must-revalidate for HTML).

**Local smoke tests (Python http.server, all returned HTTP 200):**

| Path                              | Status | Notes                                         |
|-----------------------------------|--------|-----------------------------------------------|
| `/index.html`                     | 200    | 24,492 bytes                                  |
| `/script.js`                      | 200    | parses with `node --check` after edits        |
| `/styles.css`                     | 200    | brace count balanced (245/245)                |
| `/data/questions.json`            | 200    | parses; 164 questions                         |
| `/data/thinkers.json`             | 200    | parses; 24 thinkers                           |
| `/data/criteria.json`             | 200    | parses                                        |
| `/data/exemplars.json`            | 200    | parses                                        |
| `/data/soliloquies.json`          | 200    | parses                                        |
| `/assets/portraits/kant.png`      | 200    | image/png, 1.47 MB                            |
| `/assets/audio/kant.wav`          | 200    | audio/x-wav, 2.71 MB                          |

The brief asked for "HTML, JSON, portrait, audio all 200" — all four ✓.

**§2 enrichment block** — already present in `index.html` from the
2026-04-27 source import:
- `<h3>About the assignment, in detail</h3>` intro
- `Pick-your-format` content lives inside the format-options `<details>`
  with a structured table of Written / Oral / Multimodal
- 8-FAQ accordion below it (matches the spec when the first three
  framing details are read as About + Format and the remaining eight
  as the FAQ section). No content edits needed.

### What did not run — Netlify deploy

The Netlify deploy step is **blocked on the same precondition that
blocked the previous session**: this Claude Code session runs in a
remote Linux sandbox without the Netlify CLI installed and without
any Netlify credentials.

```
$ command -v netlify
(missing)

$ env | grep -iE 'netlify_auth|netlify_personal'
(empty)

$ ls ~/.netlify ~/.config/netlify
ls: cannot access '/root/.netlify': No such file or directory
ls: cannot access '/root/.config/netlify': No such file or directory
```

I have `node v22.22.2` and `npm`/`npx`, so I could install
`netlify-cli` globally — but `netlify deploy --prod` still requires
either `netlify login` (interactive) or a `NETLIFY_AUTH_TOKEN` env var,
neither of which exists in this sandbox. Per your standing instruction
not to attempt to authenticate on your behalf, I stopped here rather
than launching a CLI that would either fail or wait for a TTY login I
can't satisfy.

### What you need to do to finish the deploy

From a machine where you're already `netlify login`'d:

```bash
git pull origin claude/autonomous-implementation-4aVGe   # get the bug fixes
netlify init                                              # link to a site
# When prompted: create new site, name it "cross-examination-issues-study"
netlify deploy --prod                                     # publishes the repo
```

The committed `netlify.toml` already specifies `publish = "."` and no
build command, so `--prod` will upload the repo root (HTML, CSS, JS,
JSON, assets) directly. First deploy should take 30–60 s including
asset upload (≈80 MB total: portraits + audio).

If you want CI auto-deploy on every push to `main`, after the first
manual deploy run `netlify link` and connect the site to the GitHub
repo via the dashboard — Netlify's GitHub app will install a build
hook automatically.

### Smoke-test plan after the deploy is live

Replace `<URL>` with the Netlify URL (e.g. `https://cross-examination-issues-study.netlify.app`):

```bash
for path in / /index.html /data/questions.json /assets/portraits/kant.png /assets/audio/kant.wav; do
  curl -s -o /dev/null -w "%{http_code}  $path\n" "<URL>$path"
done
```

All five should return `200`. The local equivalents already pass; the
only thing this confirms is that Netlify's CDN is serving the same
files with the right content types.

---

## Earlier run on 2026-04-26 — Issues Study Lab (Cloud Run + Netlify proxy)

The original 2026-04-26 task was a different deployment: the
Vertex-AI-backed Issues Study **Lab** (Flask backend on Cloud Run, static
frontend on Netlify, /api proxy redirect). That work was blocked at
pre-flight because the source files live at
`C:\Users\Peter Ellis\OneDrive\…\Issues_Study_Lab\` on the user's
Windows workstation and are not visible from this Linux sandbox, and
because the same gcloud/netlify/gh CLIs and service-account JSON are
missing here. None of that has changed; the Lab still needs to be
deployed from the Windows machine. The two deployments share zero
code (the Lab's `server.py` and `lab_corpus.json` are not in this
repo).

---

## Costs incurred this session

- GCP / Vertex spend: **$0.00** (no API calls).
- Cloud Build spend: **$0.00** (no builds).
- Cloud Run spend: **$0.00** (no deploys).
- Netlify minutes: **0** (no deploys).
- Total session spend: **$0.00**.

## Kill-switch status

- Wall time used: well under 90 min.
- Spend: $0 of $10 budget.
- Cloud Run / Netlify deploy failures: 0 (none attempted because
  CLI + auth are missing — same precondition as the previous session).
