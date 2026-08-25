# 规则仓库 Local-First Bridge 套娃与主线程卡顿事故（2026-08-25）

## 用户实机现象

用户在规则仓库 Test RC32 / Build422 实机反馈：

- 点击导入小程序仍然很慢且偶发卡住。
- 以约 10 秒导入为例：前约 4 秒页面仍可上下滑动，后约 6 秒完全冻结，无法继续操作。
- 退出重新进入测试仓库需要很久才能出现页面，甚至比 Stable 3.5.5 更慢。
- 设置中的“诊断信息”无有效结果，甚至可能直接卡死。
- Stable 3.5.5 导入明显更快且不容易卡住，但 Stable 每次启动需要远程 Bootstrap/模块加载，页面出现仍慢，因此不能简单回退 Stable 架构。

## 真实运行链

RC32 正常启动并不是“单一 Local Runtime”，而是：

```text
rule_repo_test_v169.txt
→ shell_bridge_v10.js
→ shell_bridge_v9.js
→ shell_bridge_v8.js
→ shell_bridge_v7.js
→ shell_bridge_v6.js
→ local_shell_loader_v5.js
→ Build402 本地模块包（52 个模块逐个 require）
→ RC24/25/26/27/28/29/30/31/32 多层覆盖
```

这是典型的“逻辑上 Local-First、执行上 Patch-Stack-First”。即使没有 GitHub 网络请求，每次进入页面仍要承担大量本地文件查找、`require()`、缓存检查、全局覆盖和 Runtime 重建成本。

## 导入两阶段卡顿判断

用户给出的“前半段还能滑、后半段完全冻结”说明导入至少分为两段：

1. 规则仓读取远程 Shell/规则正文时，海阔当前 UI 线程仍可响应。
2. 规则正文返回后，海阔进入规则解析、反序列化、写入/覆盖等原生导入阶段，此时出现主线程冻结。

因此导入性能不能只看网络耗时；Shell 规则体积、重复嵌套 loader、海阔解析成本同样属于热路径。

## 诊断按钮卡死根因

Build402 历史 `settings.js` 中多个序列化动作仍使用：

```text
$.require('hiker://page/ruleRepoCore')
```

`hiker://page/...` 是页面路由，不是可靠的 JS 模块路径。此前同步按钮已经实机出现 `Module "hiker://page/ruleRepoCore" cannot be found`；“诊断信息”、备份、恢复、设置等旧动作也存在同类路径。即使某些设备/上下文没有立即报错，也可能触发整套 Runtime/页面重建并造成卡顿。

## RC33 结构性修复

RC33 / Build423 不再在 RC32 上叠 Bridge v11，而是改为 Flat Runtime：

```text
Micro Shell（约 9.4 KB）
→ flat_entry_v1.js
→ flat_runtime_b423.js（设备首次启动时一次性生成）
```

`flat_runtime_b423.js` 的生成方式：

- 复用设备已经安装并验证过的 Build402 Local Module Manager 包。
- 按 `test-3.5.6-rc12/release.json` 原始顺序读取 52 个本地模块。
- 一次性合并为单 JS 文件。
- 追加 RC27 多版本更新状态与 RC33 最终行为补丁。
- 后续正常启动只 `require()` 一个 Runtime bundle，不再逐个加载 52 个模块，也不再经过 Bridge v6-v10。

首次生成可能有一次性本地合并等待；性能验收以第 2、3 次重新打开为准。

## 独立控制面

RC33 将以下动作从完整 Runtime 中拆出到 `flat_control_v1.js`：

- 测试仓自身检查版本。
- 程序目录/图标/版本同步。
- 诊断信息。

诊断只读取本地小状态，不联网、不读取大 Runtime bundle、不重建页面 Runtime。

## RC33 导入策略

普通无 codec `.txt`：

```text
fixed importRef
→ Raw immutable（timeout 1.8s）
→ jsDelivr immutable（timeout 1.8s）
→ GitHub Raw immutable（timeout 1.8s）
→ 直接返回完整“海阔视界…” payload
```

不再使用 `home_rule_url`，也不使用 RC32 的 `batchFetch` 等待全部镜像完成。正常 Raw 可用时应尽快返回。

同时 RC33 自身 Shell 从约 22 KB 缩至约 9.4 KB，降低海阔原生解析/导入成本。

## 固定规则

1. Local-First 不等于可以无限叠 Bridge；Bridge/patch 层数持续增长时必须主动扁平化。
2. 正常启动热路径不得联网；同步/检查版本必须显式由用户触发。
3. 高频页面入口优先加载一个稳定 Runtime bundle，而不是几十个小模块逐个 `require()`。
4. 诊断必须是轻量只读控制面，不得为了显示诊断信息先重建完整 Runtime。
5. 序列化 action 不得 `$.require('hiker://page/...')` 当成模块加载。
6. 导入性能必须分开测：远程规则获取耗时、海阔原生解析/导入冻结耗时。
7. 首次安装/迁移耗时与正常二次启动耗时必须分别验收，不能混为一项指标。
8. Test 尚未同时通过启动、导入、自更新、同步、诊断回归前，Stable 不得晋级。

## Stable 门禁

用户明确要求：继续升版测试版，真正稳定解决问题后再升级正式版。Stable 3.5.5 / Build389 继续作为救援基线，不参与 RC33 验证。
