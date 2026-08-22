#!/usr/bin/env python3
"""Syntax-check Hiker JavaScript modules with Node before publishing Test/Candidate metadata.

Usage examples:
  python tools/js_syntax_guard.py --path apps/video/hanime1/releases/2.0.0-test.28
  python tools/js_syntax_guard.py --path some/module.js --path another/dir

The guard is intentionally explicit: pass only the new/changed release files or
directory so historical quarantined releases do not block current publication.
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path


def collect(root: Path, raw_paths: list[str]) -> list[Path]:
    out: list[Path] = []
    seen: set[Path] = set()
    for raw in raw_paths:
        p = (root / raw).resolve() if not Path(raw).is_absolute() else Path(raw).resolve()
        if p.is_dir():
            candidates = sorted(p.rglob('*.js'))
        else:
            candidates = [p]
        for f in candidates:
            if f.suffix.lower() != '.js' or f in seen:
                continue
            seen.add(f)
            out.append(f)
    return out


def rel(root: Path, p: Path) -> str:
    try:
        return str(p.relative_to(root)).replace('\\', '/')
    except Exception:
        return str(p)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='.', help='repository root')
    ap.add_argument('--path', action='append', required=True, help='JS file or directory; repeatable')
    args = ap.parse_args()
    root = Path(args.root).resolve()
    node = shutil.which('node')
    if not node:
        print('[ERROR] node not found; JavaScript syntax was NOT verified')
        return 2
    files = collect(root, args.path)
    if not files:
        print('[ERROR] no JavaScript files found for requested --path values')
        return 2
    errors = 0
    print('=== Hiker JavaScript Syntax Guard ===')
    for f in files:
        if not f.exists():
            print(f'[ERROR] missing: {rel(root, f)}')
            errors += 1
            continue
        cp = subprocess.run([node, '--check', str(f)], text=True, capture_output=True)
        if cp.returncode:
            errors += 1
            detail = (cp.stderr or cp.stdout or '').strip()
            print(f'[ERROR] {rel(root, f)}')
            if detail:
                print(detail)
        else:
            print(f'[ OK  ] {rel(root, f)}')
    print(f'Errors: {errors}  Files: {len(files)}')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
