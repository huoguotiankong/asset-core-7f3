#!/usr/bin/env python3
"""Ensure every registered app changelog contains the currently declared baseline version.

This is intentionally simple: it does not parse changelog semantics. It prevents
the common failure mode where Stable/registry advances but the main technical
changelog is left behind.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def read_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def stable_from_channels(root: Path, raw: str):
    p = root / raw.lstrip('/')
    if not p.exists():
        return None
    data = read_json(p)
    channels = data.get('channels') if isinstance(data, dict) else None
    if not isinstance(channels, list):
        return None
    for ch in channels:
        if not isinstance(ch, dict):
            continue
        if str(ch.get('channel', ch.get('id', ''))).lower() == 'stable' or str(ch.get('id', '')).lower() == 'stable':
            version = str(ch.get('version', '')).strip()
            if version:
                return version
    return None


def expected_version(root: Path, app: dict):
    stable = str(app.get('stable', '')).strip()
    if stable:
        p = root / stable.lstrip('/')
        if p.exists():
            data = read_json(p)
            version = str(data.get('version', '')).strip() if isinstance(data, dict) else ''
            if version:
                return version, stable
    channels = str(app.get('channels', '')).strip()
    if channels:
        version = stable_from_channels(root, channels)
        if version:
            return version, channels
    version = str(app.get('version', '')).strip()
    return (version, 'registry.json') if version else ('', '')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='.')
    args = ap.parse_args()
    root = Path(args.root).resolve()
    reg_path = root / 'registry.json'
    if not reg_path.exists():
        print('[ERROR] 缺少 registry.json')
        return 1
    reg = read_json(reg_path)
    apps = reg.get('apps', []) if isinstance(reg, dict) else []
    errors = []
    warnings = []
    for app in apps:
        if not isinstance(app, dict):
            continue
        app_id = str(app.get('id', '')).strip() or '<unknown>'
        raw_log = str(app.get('changelog', '')).strip()
        if not raw_log:
            errors.append(f'{app_id}: registry 缺少 changelog')
            continue
        log_path = root / raw_log.lstrip('/')
        if not log_path.exists():
            errors.append(f'{app_id}: changelog 不存在 {raw_log}')
            continue
        version, source = expected_version(root, app)
        if not version:
            warnings.append(f'{app_id}: 无法推导当前基线版本，跳过 freshness 检查')
            continue
        text = log_path.read_text(encoding='utf-8', errors='ignore')
        if version not in text:
            errors.append(f'{app_id}: 当前基线 {version}（来源 {source}）未出现在主 changelog {raw_log}')
    print('=== Hiker Changelog Freshness Guard ===')
    for x in errors:
        print('[ERROR]', x)
    for x in warnings:
        print('[WARN ]', x)
    print(f'Errors: {len(errors)}  Warnings: {len(warnings)}')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
