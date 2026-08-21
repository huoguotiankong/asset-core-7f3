#!/usr/bin/env python3
"""Validate Stable/Test/Local version lineage for Hiker channel groups.

Rules:
- Test numeric base version must never be lower than Stable.
- Test build must be newer than Stable when both are numeric.
- Optional Test baseVersion must equal current Stable version.
- Optional Test targetVersion must equal the numeric base of Test version.
- Local is a derived artifact. Its numeric base cannot be lower than Stable unless
  a future policy explicitly adds a supported exception.
- Optional Local base/derived metadata must be self-consistent.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_RE = re.compile(r"^(\d+(?:\.\d+)*)")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def version_base(value: object) -> tuple[int, ...] | None:
    m = BASE_RE.match(str(value or "").strip())
    if not m:
        return None
    return tuple(int(x) for x in m.group(1).split("."))


def base_text(value: object) -> str:
    m = BASE_RE.match(str(value or "").strip())
    return m.group(1) if m else ""


def cmp_tuple(a: tuple[int, ...], b: tuple[int, ...]) -> int:
    n = max(len(a), len(b))
    aa = a + (0,) * (n - len(a))
    bb = b + (0,) * (n - len(b))
    return (aa > bb) - (aa < bb)


def fail(msg: str, errors: list[str]):
    errors.append(msg)
    print(f"[ERROR] {msg}")


def main() -> int:
    errors: list[str] = []
    manifest = load_json(ROOT / "manifest.json")

    for item in manifest.get("items", []):
        if item.get("entryType") != "channel-group":
            continue

        app_id = str(item.get("id", ""))
        channels_path = ROOT / str(item.get("channelsPath", ""))
        if not channels_path.exists():
            continue

        meta = load_json(channels_path)
        channels = {str(x.get("channel", "")): x for x in meta.get("channels", [])}
        stable = channels.get("stable")
        test = channels.get("test")
        local = channels.get("local")
        if not stable:
            fail(f"{app_id}: 多通道程序缺少 Stable", errors)
            continue

        stable_v = str(stable.get("version", ""))
        stable_base = version_base(stable_v)

        if test:
            test_v = str(test.get("version", ""))
            test_base = version_base(test_v)
            if stable_base and test_base and cmp_tuple(test_base, stable_base) < 0:
                fail(f"{app_id}: Test 基础版本不得低于 Stable: {test_v} < {stable_v}", errors)

            sb = stable.get("build")
            tb = test.get("build")
            if isinstance(sb, int) and isinstance(tb, int) and tb <= sb:
                fail(f"{app_id}: Test build 必须新于 Stable: {tb} <= {sb}", errors)

            declared_base = str(test.get("baseVersion", "") or "")
            if declared_base and declared_base != stable_v:
                fail(f"{app_id}: Test baseVersion 必须等于当前 Stable: {declared_base} != {stable_v}", errors)

            target = str(test.get("targetVersion", "") or "")
            if target and target != base_text(test_v):
                fail(f"{app_id}: Test targetVersion 与测试版本基础号不一致: {target} != {base_text(test_v)}", errors)

        if local:
            local_v = str(local.get("version", ""))
            local_base = version_base(local_v)
            if stable_base and local_base and cmp_tuple(local_base, stable_base) < 0:
                fail(f"{app_id}: Local 基础版本落后当前 Stable: {local_v} < {stable_v}", errors)

            declared_base = str(local.get("baseVersion", "") or "")
            derived_channel = str(local.get("derivedFromChannel", "") or "")
            derived_version = str(local.get("derivedFromVersion", "") or "")
            if declared_base and base_text(local_v) and declared_base != base_text(local_v):
                fail(f"{app_id}: Local baseVersion 与 Local 版本基础号不一致: {declared_base} != {base_text(local_v)}", errors)
            if derived_channel == "stable" and derived_version and derived_version != stable_v:
                fail(f"{app_id}: Local derivedFromVersion 与当前 Stable 不一致: {derived_version} != {stable_v}", errors)
            if declared_base and derived_version and declared_base != derived_version:
                fail(f"{app_id}: Local baseVersion / derivedFromVersion 不一致: {declared_base} != {derived_version}", errors)

    if errors:
        print(f"Channel version guard failed: {len(errors)} error(s)")
        return 1

    print("Channel version guard passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
