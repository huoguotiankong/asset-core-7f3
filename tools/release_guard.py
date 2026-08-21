#!/usr/bin/env python3
"""Hiker Release Guard.

Repository-side static checks for active Hiker releases. It intentionally avoids
network access and does not mutate release metadata.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

INT32_MAX = 2_147_483_647
SECRET_PATTERNS = [
    ("GitHub PAT", re.compile(r"\bghp_[A-Za-z0-9]{30,}\b")),
    ("GitHub fine-grained PAT", re.compile(r"\bgithub_pat_[A-Za-z0-9_]{40,}\b")),
    ("private key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("hard-coded Bearer token", re.compile(r"\bBearer\s+[A-Za-z0-9._~+\-/=]{24,}\b")),
]
RULE_VERSION_RE = re.compile(r'"version"\s*:\s*(-?\d+)')
BOOTSTRAP_PATH_RE = re.compile(r'(apps/[0-9A-Za-z_./-]*bootstrap[0-9A-Za-z_.-]*\.js)')
ZERO_ARG_LAZY_RE = re.compile(r'lazyRule\s*\(\s*function\s*\(\s*\)\s*\{')
WEB_LAZY_PARSE_RE = re.compile(r'\bparseLazyRule\s*\(')
NO_SCHEME_LAZY_BASE_RE = re.compile(r'''\$\(\s*['"]#noLoading#['"]\s*\)\.lazyRule\s*\(''')
WORKSPACE_ACTION_ASSIGN_RE = re.compile(r'\.workspaceAction\s*=\s*function\b')
WORKSPACE_STATIC_ASSIGN_RE = re.compile(r'\.workspaceStaticActions\s*=\s*function\b')
BARE_RULE_REPO_CORE_RE = re.compile(
    r'''\$\.require\(\s*['"]hiker://page/ruleRepoCore['"]\s*\)'''
)
EXPLICIT_RULE_REPO_CORE_RE = re.compile(r'hiker://page/ruleRepoCore\?rule=')
BOOTSTRAP_FALLBACK_RE = re.compile(r'RuleRepoBoot\.load\s*\(')


class Guard:
    def __init__(self, root: Path):
        self.root = root.resolve()
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.active_paths: set[Path] = set()
        self.active_bootstraps: set[Path] = set()

    def err(self, msg: str): self.errors.append(msg)
    def warn(self, msg: str): self.warnings.append(msg)

    def rel(self, p: Path) -> str:
        try: return str(p.resolve().relative_to(self.root)).replace('\\', '/')
        except Exception: return str(p)

    def read_json(self, p: Path):
        try:
            return json.loads(p.read_text(encoding='utf-8'))
        except Exception as e:
            self.err(f"JSON解析失败 {self.rel(p)}: {e}")
            return None

    def path(self, raw: str) -> Path:
        return self.root / str(raw or '').lstrip('/')

    def check_local_channel_builder(self, cp: str, index: int, ch: dict):
        """Validate local channels that are generated from codec/meta/runtime instead of a static rule path."""
        meta = str(ch.get('meta', '')).strip()
        runtime = str(ch.get('runtime', '')).strip()
        codec = str(ch.get('codec', '')).strip()
        if not codec or not meta or not runtime:
            self.err(f'{cp} channels[{index}] local 通道无 path 时必须提供 codec/meta/runtime')
            return
        for label, raw in (('meta', meta), ('runtime', runtime)):
            fp = self.path(raw)
            if not fp.exists(): self.err(f'{cp} channels[{index}] local {label} 不存在: {raw}')

    def check_channel_group(self, app_id: str, item: dict):
        cp = str(item.get('channelsPath', '')).strip()
        if not cp:
            self.err(f'manifest {app_id} channel-group 缺少 channelsPath')
            return
        p = self.path(cp)
        if not p.exists():
            self.err(f'manifest {app_id} channelsPath 不存在: {cp}')
            return
        meta = self.read_json(p)
        if not isinstance(meta, dict): return
        channels = meta.get('channels')
        if not isinstance(channels, list) or not channels:
            self.err(f'{cp} 缺少 channels 数组')
            return
        ids = set()
        for i, ch in enumerate(channels):
            if not isinstance(ch, dict):
                self.err(f'{cp} channels[{i}] 不是对象'); continue
            cid = str(ch.get('id', '')).strip(); name = str(ch.get('name', '')).strip()
            if not cid: self.err(f'{cp} channels[{i}] 缺少 id')
            elif cid in ids: self.err(f'{cp} channel id 重复: {cid}')
            ids.add(cid)
            if not name: self.err(f'{cp} channels[{i}] 缺少 name')
            if ch.get('build') is not None:
                try: int(ch['build'])
                except Exception: self.err(f'{cp} channels[{i}] build 非整数: {ch.get("build")}')
            raw_path = str(ch.get('path', '')).strip()
            if raw_path:
                fp = self.path(raw_path)
                self.active_paths.add(fp)
                if not fp.exists(): self.err(f'{cp} channel 入口不存在: {raw_path}')
            elif str(ch.get('mode', '')).strip().lower() == 'local':
                self.check_local_channel_builder(cp, i, ch)
            else:
                self.err(f'{cp} channels[{i}] 缺少 path')

    def check_root_manifest(self):
        p = self.root / 'manifest.json'
        if not p.exists():
            self.err('缺少根 manifest.json')
            return
        m = self.read_json(p)
        if not isinstance(m, dict): return
        meta_path = self.root / 'manifest_meta.json'
        if meta_path.exists():
            meta = self.read_json(meta_path)
            if isinstance(meta, dict):
                mr = str(m.get('revision', '')).strip(); rr = str(meta.get('revision', '')).strip()
                if not mr: self.err('manifest.json 已启用 manifest_meta.json 但缺少 revision')
                if not rr: self.err('manifest_meta.json 缺少 revision')
                if mr and rr and mr != rr: self.err(f'manifest revision 不一致: {mr} != {rr}')
                if meta.get('itemCount') is not None and isinstance(m.get('items'), list) and int(meta['itemCount']) != len(m['items']):
                    self.err(f'manifest_meta itemCount 不一致: {meta.get("itemCount")} != {len(m["items"])}')
        items = m.get('items')
        if not isinstance(items, list):
            self.err('根 manifest.json 缺少 items 数组')
            return
        ids = set()
        for i, item in enumerate(items):
            if not isinstance(item, dict):
                self.err(f'manifest items[{i}] 不是对象'); continue
            app_id = str(item.get('id', '')).strip()
            if not app_id: self.err(f'manifest items[{i}] 缺少 id')
            elif app_id in ids: self.err(f'manifest 存在重复 id: {app_id}')
            ids.add(app_id)
            raw_path = item.get('path')
            if not raw_path:
                self.err(f'manifest {app_id or i} 缺少 path'); continue
            fp = self.path(raw_path)
            self.active_paths.add(fp)
            if not fp.exists(): self.err(f'manifest 活跃入口不存在: {raw_path}')
            icon = str(item.get('icon', '')).strip()
            if not icon: self.warn(f'manifest {app_id} 没有 icon')
            if str(item.get('entryType', '')) == 'channel-group': self.check_channel_group(app_id, item)

    def check_rule_shell_version(self, p: Path):
        if not p.exists() or p.suffix.lower() != '.txt': return
        try: text = p.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            self.err(f'无法读取规则入口 {self.rel(p)}: {e}'); return
        if '首页频道￥home_rule￥' not in text: return
        m = RULE_VERSION_RE.search(text)
        if not m:
            self.warn(f'规则入口未发现数值 version: {self.rel(p)}')
        else:
            value = int(m.group(1))
            if value < 0 or value > INT32_MAX:
                self.err(f'规则壳 version 越界 {self.rel(p)}: {value}，必须 0..{INT32_MAX}')
        for raw in BOOTSTRAP_PATH_RE.findall(text):
            bp = self.path(raw)
            self.active_bootstraps.add(bp)
            if not bp.exists(): self.err(f'活跃 Shell 引用 Bootstrap 不存在: {raw}')

    def check_bootstrap_scope(self, p: Path):
        if not p.exists(): return
        try: text = p.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            self.err(f'无法读取 Bootstrap {self.rel(p)}: {e}'); return
        for m in ZERO_ARG_LAZY_RE.finditer(text):
            snippet = text[m.start():m.start()+3500]
            if 'RULE_REPO_CONFIG' in snippet or 'RULE_REPO_MANAGER_URL' in snippet:
                self.err(f'Bootstrap lazyRule 作用域风险 {self.rel(p)}: 零参数回调直接引用 RULE_REPO_* 全局，请改为显式传参')
                break

    def check_web_lazy_bridge(self, p: Path, text: str, label: str):
        """网页桥 parseLazyRule 只接受带 HTTP(S) scheme 的动态动作输入。"""
        if WEB_LAZY_PARSE_RE.search(text) and NO_SCHEME_LAZY_BASE_RE.search(text):
            self.err(
                f'{label} 网页动作桥使用 #noLoading# lazyRule 基址: {self.rel(p)}；'
                'parseLazyRule 输入必须由完整 http/https 地址构造'
            )

    def check_declared_contract(self, release_path: Path, release: dict, module_paths: list[Path], label: str):
        contract = release.get('contract')
        if not isinstance(contract, dict): return
        required = contract.get('requiredFunctions')
        if not isinstance(required, list) or not required:
            self.err(f'{label} contract.requiredFunctions 必须是非空数组: {self.rel(release_path)}')
            return
        corpus_parts = []
        for p in module_paths:
            if not p.exists() or p.suffix.lower() != '.js': continue
            try: corpus_parts.append(p.read_text(encoding='utf-8', errors='ignore'))
            except Exception as e: self.err(f'{label} 无法读取契约模块 {self.rel(p)}: {e}')
        corpus = '\n'.join(corpus_parts)
        for raw_name in required:
            name = str(raw_name or '').strip()
            if not name or not re.match(r'^[A-Za-z_$][0-9A-Za-z_$]*$', name):
                self.err(f'{label} contract 函数名非法: {raw_name!r}')
                continue
            assign = re.compile(r'\.' + re.escape(name) + r'\s*=\s*function\b')
            literal = re.compile(r'\b' + re.escape(name) + r'\s*:\s*function\b')
            if not assign.search(corpus) and not literal.search(corpus):
                self.err(f'{label} 运行时契约缺少函数定义: {name} ({self.rel(release_path)})')

    def check_workspace_action_context(self, release_path: Path, module_paths: list[Path], label: str):
        """Check the final workspace action overrides, not immutable historical modules."""
        final_action = None
        final_static = None
        for p in module_paths:
            if not p.exists() or p.suffix.lower() != '.js':
                continue
            try:
                text = p.read_text(encoding='utf-8', errors='ignore')
            except Exception as e:
                self.err(f'{label} 无法读取动作模块 {self.rel(p)}: {e}')
                continue
            if WORKSPACE_ACTION_ASSIGN_RE.search(text):
                final_action = (p, text)
            if WORKSPACE_STATIC_ASSIGN_RE.search(text):
                final_static = (p, text)
        if not final_action and not final_static:
            return
        checked = []
        for kind, found in (('workspaceAction', final_action), ('workspaceStaticActions', final_static)):
            if not found:
                self.err(f'{label} 缺少最终 {kind} 实现: {self.rel(release_path)}')
                continue
            p, text = found
            if BARE_RULE_REPO_CORE_RE.search(text):
                self.err(
                    f'{label} 最终 {kind} 裸加载 ruleRepoCore: {self.rel(p)}；'
                    'parseLazyRule 回调必须显式携带规则名'
                )
            checked.append((p, text))
        corpus = '\n'.join(text for _, text in checked)
        if not EXPLICIT_RULE_REPO_CORE_RE.search(corpus):
            self.err(f'{label} 最终工作台动作缺少 ruleRepoCore?rule= 显式规则上下文')
        if not BOOTSTRAP_FALLBACK_RE.search(corpus):
            self.err(f'{label} 最终工作台动作缺少 RuleRepoBoot.load() Core 恢复通道')

    def validate_release(self, release_path: Path, expected_id=None, expected_build=None, label='release'):
        if not release_path.exists():
            self.err(f'{label} 指向文件不存在: {self.rel(release_path)}'); return None
        r = self.read_json(release_path)
        if not isinstance(r, dict): return None
        rid = str(r.get('id', '')); build = r.get('build')
        if expected_id is not None and rid != str(expected_id):
            self.err(f'{label} id 不一致: {rid} != {expected_id} ({self.rel(release_path)})')
        try: build_i = int(build)
        except Exception:
            self.err(f'{label} build 非整数: {build} ({self.rel(release_path)})'); build_i = None
        if expected_build is not None and build_i is not None and build_i != int(expected_build):
            self.err(f'{label} build 不一致: {build_i} != {expected_build} ({self.rel(release_path)})')
        modules = r.get('modules')
        module_paths: list[Path] = []
        if not isinstance(modules, list) or not modules:
            self.err(f'{label} 缺少 modules: {self.rel(release_path)}')
        else:
            seen = set()
            for i, mod in enumerate(modules):
                if not isinstance(mod, dict) or not mod.get('path'):
                    self.err(f'{label} modules[{i}] 缺少 path: {self.rel(release_path)}'); continue
                mp = str(mod['path']).lstrip('/')
                if mp in seen: self.warn(f'{label} 重复模块路径: {mp}')
                seen.add(mp)
                module_path = self.path(mp)
                module_paths.append(module_path)
                if not module_path.exists(): self.err(f'{label} 模块不存在: {mp}')
                elif module_path.suffix.lower() == '.js':
                    try:
                        self.check_web_lazy_bridge(
                            module_path,
                            module_path.read_text(encoding='utf-8', errors='ignore'),
                            label,
                        )
                    except Exception as e:
                        self.err(f'{label} 无法检查网页动作桥 {self.rel(module_path)}: {e}')
        self.check_declared_contract(release_path, r, module_paths, label)
        self.check_workspace_action_context(release_path, module_paths, label)
        return r

    def check_latest_files(self):
        for p in sorted((self.root / 'apps').glob('**/latest.json')) if (self.root / 'apps').exists() else []:
            latest = self.read_json(p)
            if not isinstance(latest, dict): continue
            app_id = latest.get('id'); build = latest.get('build'); rel = latest.get('release')
            if not app_id or build is None or not rel:
                self.err(f'latest 缺少 id/build/release: {self.rel(p)}'); continue
            try: int(build)
            except Exception:
                self.err(f'latest build 非整数: {self.rel(p)}'); continue
            self.validate_release(self.path(rel), app_id, int(build), f'latest {self.rel(p)}')

    def check_channels(self):
        pairs = (('stable.json', 'stable'), ('candidate.json', 'candidate'), ('test.json', 'test'))
        for name, expected in pairs:
            for p in sorted((self.root / 'apps').glob(f'**/{name}')) if (self.root / 'apps').exists() else []:
                x = self.read_json(p)
                if not isinstance(x, dict): continue
                if x.get('channel') != expected:
                    self.err(f'{self.rel(p)} channel 必须为 {expected}')
                if not x.get('id') or x.get('build') is None or not x.get('release'):
                    self.err(f'{self.rel(p)} 缺少 id/build/release'); continue
                try: build = int(x['build'])
                except Exception:
                    self.err(f'{self.rel(p)} build 非整数: {x.get("build")}'); continue
                self.validate_release(self.path(x['release']), x['id'], build, self.rel(p))

    def check_registry_changelogs(self):
        p = self.root / 'registry.json'
        if not p.exists():
            self.err('缺少 registry.json，无法检查程序级更新日志')
            return
        reg = self.read_json(p)
        if not isinstance(reg, dict): return
        apps = reg.get('apps')
        if not isinstance(apps, list):
            self.err('registry.json 缺少 apps 数组')
            return
        ids = set()
        for i, app in enumerate(apps):
            if not isinstance(app, dict):
                self.err(f'registry apps[{i}] 不是对象'); continue
            app_id = str(app.get('id', '')).strip()
            if not app_id:
                self.err(f'registry apps[{i}] 缺少 id'); continue
            if app_id in ids:
                self.err(f'registry 存在重复 id: {app_id}')
            ids.add(app_id)
            raw = str(app.get('changelog', '')).strip()
            if not raw:
                self.err(f'registry {app_id} 缺少 changelog 路径')
                continue
            cp = self.path(raw)
            if not cp.exists():
                self.err(f'registry {app_id} changelog 不存在: {raw}')
                continue
            try:
                text = cp.read_text(encoding='utf-8', errors='ignore').strip()
            except Exception as e:
                self.err(f'无法读取 {app_id} changelog: {e}')
                continue
            if len(text) < 120:
                self.warn(f'{app_id} changelog 内容过短，可能不足以承担长期技术记忆: {raw}')

    def check_secrets(self):
        roots = [self.root / x for x in ('apps', 'libs', 'templates')]
        exts = {'.js', '.json', '.txt', '.py', '.yml', '.yaml'}
        for base in roots:
            if not base.exists(): continue
            for p in base.rglob('*'):
                if not p.is_file() or p.suffix.lower() not in exts: continue
                try: text = p.read_text(encoding='utf-8', errors='ignore')
                except Exception: continue
                for label, rx in SECRET_PATTERNS:
                    if rx.search(text): self.err(f'疑似真实敏感凭据({label}): {self.rel(p)}')

    def run(self):
        self.check_root_manifest()
        for p in sorted(self.active_paths): self.check_rule_shell_version(p)
        for p in sorted(self.active_bootstraps): self.check_bootstrap_scope(p)
        self.check_latest_files()
        self.check_channels()
        self.check_registry_changelogs()
        self.check_secrets()
        return not self.errors

    def report(self):
        print('=== Hiker Release Guard ===')
        for x in self.errors: print(f'[ERROR] {x}')
        for x in self.warnings: print(f'[WARN ] {x}')
        print(f'Errors: {len(self.errors)}  Warnings: {len(self.warnings)}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='.', help='repository root')
    args = ap.parse_args()
    g = Guard(Path(args.root))
    ok = g.run(); g.report()
    return 0 if ok else 1


if __name__ == '__main__':
    raise SystemExit(main())
