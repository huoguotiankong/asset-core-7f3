#!/usr/bin/env python3
"""Top-level JavaScript runtime smoke guard for Hiker remote modules.

This complements syntax checking. `node --check` can only prove that JavaScript
parses; it cannot catch a top-level ReferenceError such as invoking an IIFE with
an undefined global (`})(HanimeCore, HanimeUI11);`).

The guard executes each requested JS file in Node with explicit project globals
stubbed as permissive proxies. Any undeclared top-level dependency still throws.

Example:
  python tools/js_runtime_smoke_guard.py --path apps/video/hanime1/releases/2.0.0-test.29/ui29.js \
    --global HanimeCore --global HanimeProvider --global HanimePages \
    --global HanimeUI9 --global HanimeLayout12

Use only for modules whose top level should be definition-only. Network/storage
business actions must not run during module load in the first place.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

COMMON_GLOBALS = [
    '$', 'getItem', 'setItem', 'clearItem', 'getMyVar', 'putMyVar', 'clearMyVar',
    'setPageTitle', 'setResult', 'refreshPage', 'pdfa', 'pdfh', 'xpathArray', 'xpa',
    'MY_PAGE', 'MY_URL', 'input', 'require', 'fetch', 'request',
]


def collect(root: Path, raw_paths: list[str]) -> list[Path]:
    out: list[Path] = []
    seen: set[Path] = set()
    for raw in raw_paths:
        p = (root / raw).resolve() if not Path(raw).is_absolute() else Path(raw).resolve()
        candidates = sorted(p.rglob('*.js')) if p.is_dir() else [p]
        for f in candidates:
            if f.suffix.lower() == '.js' and f not in seen:
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
    ap.add_argument('--root', default='.')
    ap.add_argument('--path', action='append', required=True, help='JS file or directory; repeatable')
    ap.add_argument('--global', dest='globals', action='append', default=[], help='Known runtime global; repeatable')
    args = ap.parse_args()

    root = Path(args.root).resolve()
    node = shutil.which('node')
    if not node:
        print('[ERROR] node not found; runtime smoke test was NOT executed')
        return 2

    files = collect(root, args.path)
    if not files:
        print('[ERROR] no JavaScript files found')
        return 2

    names = []
    for n in COMMON_GLOBALS + list(args.globals):
        if n and n not in names:
            names.append(n)

    # A callable deep proxy tolerates property reads/calls/assignments while still
    # leaving undeclared identifiers truly undeclared so ReferenceError is caught.
    prelude = """
function __hikerStub(){
  const fn=function(){return __hikerStub();};
  return new Proxy(fn,{get:function(){return __hikerStub();},set:function(){return true;},apply:function(){return __hikerStub();},construct:function(){return __hikerStub();}});
}
"""
    for n in names:
        if n in {'MY_PAGE'}:
            prelude += f"globalThis[{json.dumps(n)}]=1;\n"
        elif n in {'MY_URL', 'input'}:
            prelude += f"globalThis[{json.dumps(n)}]='';\n"
        else:
            prelude += f"globalThis[{json.dumps(n)}]=__hikerStub();\n"

    errors = 0
    print('=== Hiker JavaScript Runtime Smoke Guard ===')
    for f in files:
        if not f.exists():
            print(f'[ERROR] missing: {rel(root, f)}')
            errors += 1
            continue
        src = f.read_text(encoding='utf-8')
        script = prelude + '\n' + src
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as tf:
            tf.write(script)
            tmp = tf.name
        try:
            cp = subprocess.run([node, tmp], text=True, capture_output=True)
        finally:
            Path(tmp).unlink(missing_ok=True)
        if cp.returncode:
            errors += 1
            print(f'[ERROR] {rel(root, f)}')
            detail = (cp.stderr or cp.stdout or '').strip()
            if detail:
                print(detail)
        else:
            print(f'[ OK  ] {rel(root, f)}')
    print(f'Errors: {errors}  Files: {len(files)}')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
