# Deploy Report — Issues Study Lab

**Status: BLOCKED at Step 0 (pre-flight). No deployment attempted.**

Date: 2026-04-26
Branch: `claude/autonomous-implementation-4aVGe`
Repo: peterellisteacher-code/Stage-2-Issues-Study1

## Why the run stopped

The plan assumes this Claude Code session is running on the user's Windows
workstation, with access to the OneDrive source tree, the gcloud/netlify/gh
CLIs, and the service-account JSON at `~/.mcp-servers/ai-image/`. None of that
is true in this session. Per the kill-switch ("Any pre-flight auth check
fails" / "missing auth"), I stopped before spending any time, money, or
deploy attempts.

## Pre-flight findings

### 1. Wrong host OS — source files unreachable

- Session is running on **Linux** (`Linux 6.18.5`, `HOME=/root`), inside what
  appears to be a sandboxed VM. The git remote is a local proxy
  (`http://local_proxy@127.0.0.1:36203/git/...`), confirming this is not the
  user's machine.
- The lab source path
  `C:\Users\Peter Ellis\OneDrive\Teaching\2026\12PHIL - 2026\Issues Study\Issues_Study_Lab\`
  is a Windows path; no Windows drives, WSL mounts, or OneDrive paths are
  visible from here.
- Searched: `/mnt`, `/c/Users`, `/mnt/c/Users`, and a recursive `find /` for
  `Issues_Study_Lab`, `OneDrive*`, and `cache_handles.json`. **Zero hits.**
- There is therefore nothing to copy in Step 1. The repo contains only
  `README.md`.

### 2. Required CLIs not installed

| Tool       | Status      |
|------------|-------------|
| `gh`       | **missing** |
| `gcloud`   | **missing** |
| `netlify`  | **missing** |
| `rsync`    | **missing** |
| `robocopy` | **missing** |
| `powershell` | **missing** |
| `python` / `python3` | present |
| `docker`   | present     |

Without `gcloud`, `netlify`, or `gh`, none of Steps 0, 2, 3, 4, or 5 can run.

### 3. No service-account / auth context

- `~/.mcp-servers/ai-image/service-account.json` does not exist (no
  `~/.mcp-servers/` directory at all).
- No `~/.config/gcloud`, no `~/.netlify`, no `~/.config/gh` to inherit auth
  from.
- Even installing the CLIs would not unblock this — there is no credential
  material in the session to authenticate with, and the instructions
  explicitly say not to attempt to authenticate on the user's behalf.

## What was *not* done (and why)

| Step | Action | Skipped because |
|------|--------|-----------------|
| 0    | `gh auth status` / `gcloud auth list` / `netlify status` | CLIs not installed; no creds present |
| 1    | rsync / robocopy from OneDrive | Source path unreachable from Linux sandbox |
| 2    | `gcloud run deploy` | gcloud missing; no auth; no source code in repo |
| 3    | `netlify init` / `netlify deploy --prod` | netlify CLI missing; no frontend in repo |
| 4    | CORS env update | Depends on Step 2/3 |
| 5    | End-to-end smoke tests | Nothing deployed |

## What needs to happen next (manual, on the Windows box)

This run needs to be executed from the user's Windows machine — or from a
session that has:

1. Access to `C:\Users\Peter Ellis\OneDrive\...\Issues_Study_Lab\` (or a
   mirrored copy mounted into the sandbox).
2. `gcloud`, `netlify`, and `gh` installed and already authenticated:
   - `gcloud auth login` + `gcloud config set project gen-lang-client-0274569601`
   - `netlify login`
   - `gh auth login`
3. The Vertex runtime service-account JSON in place at
   `~/.mcp-servers/ai-image/service-account.json` (or
   `GOOGLE_APPLICATION_CREDENTIALS` pointed at it).

Once those are true, the original 7-step plan should run unchanged.

### Alternative if the user wants this done from a remote sandbox

If the intent is to run deployments from a remote Claude Code session in
future, the lab artefacts need to be checked into a private repo (or a
storage bucket the sandbox can read), and the sandbox image needs to
include `gcloud`, `netlify-cli`, and `gh` plus a credential mounting
strategy (Workload Identity, a short-lived token, or a mounted secret).
None of that is in place today.

## Costs

- **GCP / Vertex spend this session: $0.00** (no API calls made).
- **Cloud Build spend this session: $0.00** (no builds triggered).
- **Cloud Run spend this session: $0.00** (no deploys).

## Kill-switch status

- Wall time used: minimal (well under 90 min).
- Spend: $0 of $10 budget.
- Cloud Run deploy failures: 0 of 3 (none attempted).
- Pre-flight auth check: **FAILED — stop condition triggered.**
