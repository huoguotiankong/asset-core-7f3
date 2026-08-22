#!/usr/bin/env python3
"""Guard cloud-repository remote installer artifacts against advertised channel builds.

This catches a recurrent Hiker failure mode:
channel metadata advertises build N, but its rule path still imports an older
Bootstrap whose minBuild/defaultRelease is M < N. Remote Manager load() does not
fetch latest on normal startup, so a fresh/re-imported cloud rule can silently
keep running the older active release.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

INT32_MAX = 2_147_483_647
RULE_VERSION_RE = re.compile(r'"version"\s*:\s*(-?\d+)')
BOOTSTRAP_PATH_RE = re.compile(r'(apps/[0-9A-Za-z_./-]*bootstrap[0-9A-Za-z_.-]*\.js)')
MIN_BUILD_RE = re.compile(r'\bminBuild\s*:\s*(\d+)')
DEFAULT_BUILD_RE = re.compile(r'defaultRelease\s*:\s*\{[\s\S]*?"build"\s*:\s*(\d+)')


def load_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def rel(root: Path, path: Path) -> str:
    try:
        return str(path.resolve().relative_to(root.resolve())).replace('\\', '/')
    except Exception:
        return str(path)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='.', help='repository root')
    ap.add_argument('--channel', action='append', default=[], help='optional channel json path; may be repeated')
    args = ap.parse_args()
    root = Path(args.root).resolve()
    errors: list[str] = []
    warnings: list[str] = []

    if args.channel:
        channels = [root / x for x in args.channel]
    else:
        channels = []
        apps = root / 'apps'
        if apps.exists():
            for name in ('stable.json', 'candidate.json', 'test.json'):
                channels.extend(sorted(apps.glob(f'**/{name}')))

    for cp in channels:
        if not cp.exists():
            errors.append(f'channel metadata 不存在: {rel(root, cp)}')
            continue
        try:
            meta = load_json(cp)
        except Exception as exc:
            errors.append(f'channel metadata JSON 失败 {rel(root, cp)}: {exc}')
            continue
        if not isinstance(meta, dict):
            continue
        rule_raw = str(meta.get('rule') or '').strip()
        release_raw = str(meta.get('release') or '').strip()
        if not rule_raw or not release_raw:
            continue
        try:
            advertised = int(meta.get('build'))
        except Exception:
            errors.append(f'{rel(root, cp)} build 非整数: {meta.get("build")}')
            continue

        installer_build = meta.get('installerBuild')
        if installer_build is not None:
            try:
                installer_build = int(installer_build)
            except Exception:
                errors.append(f'{rel(root, cp)} installerBuild 非整数: {meta.get("installerBuild")}')
                installer_build = None
            if installer_build is not None and installer_build != advertised:
                errors.append(f'{rel(root, cp)} installerBuild={installer_build} 与 advertised build={advertised} 不一致')

        release_path = root / release_raw.lstrip('/')
        if not release_path.exists():
            errors.append(f'{rel(root, cp)} release 不存在: {release_raw}')
        else:
            try:
                release = load_json(release_path)
                rb = int(release.get('build'))
                if rb != advertised:
                    errors.append(f'{rel(root, cp)} release build={rb} 与 advertised build={advertised} 不一致')
            except Exception as exc:
                errors.append(f'{rel(root, cp)} release 读取失败: {exc}')

        shell = root / rule_raw.lstrip('/')
        if not shell.exists():
            errors.append(f'{rel(root, cp)} cloud installer shell 不存在: {rule_raw}')
            continue
        text = shell.read_text(encoding='utf-8', errors='ignore')
        vm = RULE_VERSION_RE.search(text)
        if vm:
            value = int(vm.group(1))
            if value < 0 or value > INT32_MAX:
                errors.append(f'{rel(root, shell)} 规则 version 越界: {value}')
        else:
            warnings.append(f'{rel(root, shell)} 未找到规则数值 version')

        boots = BOOTSTRAP_PATH_RE.findall(text)
        if not boots:
            warnings.append(f'{rel(root, cp)} installer shell 未发现可静态检查的 Bootstrap 路径')
            continue
        for boot_raw in dict.fromkeys(boots):
            boot = root / boot_raw.lstrip('/')
            if not boot.exists():
                errors.append(f'{rel(root, cp)} Bootstrap 不存在: {boot_raw}')
                continue
            btext = boot.read_text(encoding='utf-8', errors='ignore')
            mm = MIN_BUILD_RE.search(btext)
            dm = DEFAULT_BUILD_RE.search(btext)
            if mm:
                min_build = int(mm.group(1))
                if min_build < advertised:
                    errors.append(
                        f'{rel(root, cp)} advertises build {advertised}, but {boot_raw} minBuild={min_build}; '
                        'fresh/re-import may remain on an older active release'
                    )
            else:
                warnings.append(f'{boot_raw} 未发现 minBuild，无法证明重新导入会越过旧 active release')
            if dm:
                default_build = int(dm.group(1))
                if default_build < advertised:
                    errors.append(
                        f'{rel(root, cp)} advertises build {advertised}, but {boot_raw} defaultRelease.build={default_build}; '
                        'cloud repository import does not actually install the advertised build'
                    )
            else:
                warnings.append(f'{boot_raw} 未发现 defaultRelease.build，无法静态确认安装基线')

    print('=== Remote Installer Guard ===')
    for msg in errors:
        print(f'[ERROR] {msg}')
    for msg in warnings:
        print(f'[WARN ] {msg}')
    print(f'Errors: {len(errors)}  Warnings: {len(warnings)}')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
