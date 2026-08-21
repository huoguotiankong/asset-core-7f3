#!/usr/bin/env python3
"""Validate Hiker program naming semantics across Stable/Test/Local channel groups.

Hiker treats the rule title as the identity used for overwrite imports. For normal
apps Stable/Test therefore keep the exact same title. The self-hosting rule
repository is the deliberate Stable/Test exception. Optional Local builds use
"<main name> 本地版" and are independent from Stable/Test.
"""
from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPLIT_NAME_EXCEPTIONS = {"rule-repo"}
TITLE_RE = re.compile(r'\\"title\\"\s*:\s*\\"([^\\"]+)\\"')


def fail(msg: str, errors: list[str]):
    errors.append(msg)
    print(f"[ERROR] {msg}")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def shell_title(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")
    m = TITLE_RE.search(text)
    if not m:
        m = re.search(r'"title"\s*:\s*"([^"]+)"', text)
    return m.group(1) if m else ""


def hkzip_title(path: Path) -> str:
    try:
        with zipfile.ZipFile(path, "r") as zf:
            names = zf.namelist()
            target = next((n for n in names if n == "rule.json" or n.endswith("/rule.json")), "")
            if not target:
                return ""
            data = json.loads(zf.read(target).decode("utf-8"))
            return str(data.get("title", ""))
    except Exception:
        return ""


def main() -> int:
    errors: list[str] = []
    manifest = load_json(ROOT / "manifest.json")
    for item in manifest.get("items", []):
        if item.get("entryType") != "channel-group":
            continue
        app_id = str(item.get("id", ""))
        parent_name = str(item.get("name", ""))
        channel_path = ROOT / str(item.get("channelsPath", ""))
        if not channel_path.exists():
            fail(f"{app_id}: channelsPath 不存在: {channel_path}", errors)
            continue
        meta = load_json(channel_path)
        channels = meta.get("channels", [])
        for ch in channels:
            channel = str(ch.get("channel", ""))
            name = str(ch.get("name", ""))
            codec = str(ch.get("codec", ""))
            expected_local = parent_name + " 本地版"

            if channel == "local":
                if name != expected_local:
                    fail(f"{app_id}: Local 名称必须为 '<主程序名> 本地版': {name!r} != {expected_local!r}", errors)
            elif app_id in SPLIT_NAME_EXCEPTIONS:
                if channel == "stable" and name != parent_name:
                    fail(f"{app_id}: Stable 名称必须等于主程序名: {name!r} != {parent_name!r}", errors)
                if channel == "test" and name == parent_name:
                    fail(f"{app_id}: Test 必须使用独立名称，保证自举恢复入口仍可用", errors)
            else:
                if name != parent_name:
                    fail(f"{app_id}: {channel} 必须与正式程序同名以支持覆盖安装: {name!r} != {parent_name!r}", errors)

            if codec == "javdb_local_build":
                local_title = str(ch.get("localTitle", ""))
                if local_title != name:
                    fail(f"{app_id}: Local 构建目标 title 与通道名称不一致: {local_title!r} != {name!r}", errors)
                for key in ("meta", "runtime"):
                    p = ROOT / str(ch.get(key, ""))
                    if not p.exists():
                        fail(f"{app_id}: Local 构建文件不存在: {key}={p}", errors)
                continue

            shell_path = ROOT / str(ch.get("path", ""))
            if not shell_path.exists():
                fail(f"{app_id}: {channel} Shell 不存在: {shell_path}", errors)
                continue

            if codec == "javdb_retitle_remote":
                forced = str(ch.get("forcedTitle", ""))
                if forced != name:
                    fail(f"{app_id}: {channel} forcedTitle 与通道名称不一致: {forced!r} != {name!r}", errors)
                continue

            actual_title = hkzip_title(shell_path) if codec == "hkzip" else shell_title(shell_path)
            if actual_title != name:
                fail(f"{app_id}: {channel} Shell title 与 channels.json 不一致: {actual_title!r} != {name!r}", errors)

    if errors:
        print(f"Channel name guard failed: {len(errors)} error(s)")
        return 1
    print("Channel name guard passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
