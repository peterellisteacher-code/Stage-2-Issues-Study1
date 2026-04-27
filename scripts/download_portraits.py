#!/usr/bin/env python3
"""
Download authentic portraits from Wikimedia Commons per the manifest at
data/portrait_credits.json, save them to assets/portraits/<id>.<ext>,
and update data/thinkers.json to point at the new files. Removes any
prior portrait file for the same id (so the AI lookalike PNG doesn't
linger in the repo alongside the new authentic image).

Run from the repo root:

    python3 scripts/download_portraits.py

Requires only the Python standard library (3.8+).

Network access required: this script reaches commons.wikimedia.org and
follows redirects to upload.wikimedia.org. It will NOT work from the
Claude Code remote sandbox (Wikimedia is firewalled there). Run it from
your own terminal, your native Claude Code session, or any environment
with public web access.

After it finishes, review `git diff` (you should see new portraits
under assets/portraits/, deletions of the old AI-generated PNGs, and
updated portrait paths in data/thinkers.json), then commit + push to
trigger the Netlify redeploy.
"""

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST = REPO_ROOT / "data" / "portrait_credits.json"
THINKERS = REPO_ROOT / "data" / "thinkers.json"
PORTRAITS_DIR = REPO_ROOT / "assets" / "portraits"

THUMB_WIDTH = 1200
USER_AGENT = "issues-study-portrait-downloader/1.0 (+educational use)"


def commons_filename(commons_url: str):
    """Extract the bare filename from a Commons file-page URL.

    https://commons.wikimedia.org/wiki/File:Foo_Bar.jpg  ->  Foo_Bar.jpg
    """
    if not commons_url or "/wiki/File:" not in commons_url:
        return None
    raw = commons_url.rsplit("/wiki/File:", 1)[1]
    # URLs may be percent-encoded; the API expects the raw filename
    return urllib.parse.unquote(raw)


def thumb_url(filename: str, width: int) -> str:
    """Build a stable thumbnail URL via Special:FilePath, which redirects
    to the actual upload.wikimedia.org URL of the requested width."""
    return (
        "https://commons.wikimedia.org/wiki/Special:FilePath/"
        + urllib.parse.quote(filename)
        + f"?width={width}"
    )


def download(url: str) -> tuple[bytes, str]:
    """GET the URL, follow redirects, return (bytes, final_url)."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read(), resp.url


def cleanup_old_portrait(stem: str, keep: Path) -> list[Path]:
    """Remove any existing portrait file for this id whose extension differs
    from the new file (e.g. delete aristotle.png after writing aristotle.jpg)."""
    removed = []
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        candidate = PORTRAITS_DIR / f"{stem}{ext}"
        if candidate.exists() and candidate.resolve() != keep.resolve():
            candidate.unlink()
            removed.append(candidate)
    return removed


def main() -> int:
    if not MANIFEST.exists():
        print(f"manifest not found: {MANIFEST}", file=sys.stderr)
        return 1

    manifest = json.loads(MANIFEST.read_text())
    thinkers = json.loads(THINKERS.read_text())
    thinkers_by_id = {t["id"]: t for t in thinkers}
    PORTRAITS_DIR.mkdir(parents=True, exist_ok=True)

    ok = 0
    skipped: list[str] = []
    failed: list[tuple[str, str]] = []

    for entry in manifest:
        fid = entry["id"]
        commons = entry.get("commons_url")
        if not commons:
            skipped.append(fid)
            print(f"SKIP  {fid}: no commons_url in manifest (manual sourcing needed)")
            continue

        filename = commons_filename(commons)
        if not filename:
            failed.append((fid, f"unparseable commons_url: {commons}"))
            print(f"FAIL  {fid}: malformed commons_url")
            continue

        url = thumb_url(filename, THUMB_WIDTH)
        try:
            data, final_url = download(url)
        except Exception as ex:
            failed.append((fid, str(ex)))
            print(f"FAIL  {fid}: download error — {ex}")
            continue

        ext = Path(urllib.parse.urlparse(final_url).path).suffix.lower() or ".jpg"
        out_path = PORTRAITS_DIR / f"{fid}{ext}"
        out_path.write_bytes(data)

        removed = cleanup_old_portrait(fid, out_path)
        if fid in thinkers_by_id:
            rel = str(out_path.relative_to(REPO_ROOT)).replace("\\", "/")
            thinkers_by_id[fid]["portrait"] = rel

        kb = len(data) // 1024
        rel_out = out_path.relative_to(REPO_ROOT)
        rm_msg = f" (removed {len(removed)} stale)" if removed else ""
        print(f"OK    {fid}: {rel_out} ({kb} KB){rm_msg}")
        ok += 1

    # Persist updated thinkers.json with stable formatting
    THINKERS.write_text(json.dumps(thinkers, indent=2, ensure_ascii=False) + "\n")

    print()
    print(f"Downloaded:       {ok}")
    print(f"Skipped (manual): {len(skipped)}{(': ' + ', '.join(skipped)) if skipped else ''}")
    print(f"Failed:           {len(failed)}")
    for fid, err in failed:
        print(f"  {fid}: {err}")

    if failed:
        print()
        print("For failures: re-check the commons_url in data/portrait_credits.json")
        print("(open it in a browser; the URL must end in /wiki/File:<exact-filename>),")
        print("fix the manifest, and rerun.")

    print()
    print("Review changes:   git diff")
    print("Commit + push:    git add -A && git commit -m '...' && git push")
    return 0 if not failed else 2


if __name__ == "__main__":
    sys.exit(main())
