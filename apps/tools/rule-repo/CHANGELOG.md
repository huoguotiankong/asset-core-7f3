# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC32 及之前完整记录冻结到 `CHANGELOG_RC32_20260825.md`；RC33 为 Flat Runtime 基线，RC34 只修复可变版本目录控制面。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，作为最终救援基线。
- Test：`3.5.6-rc34 / Build424`，Shell `rule_repo_test_v171.txt` / rule version `2026082516`。
- 正常启动：`Micro Shell → flat_entry_v2.js → flat_runtime_b424.js`。
- 目录控制面：`flat_control_v2.js → channel_catalog_v3.json`；版本详情每次读取本地文件，不再缓存为长生命周期 `_catalog`。

## 2026-08-25 · 3.5.6-rc34 / Build424 · Mutable Catalog Live-File

### 用户实机事实
- 同一时刻，正式版规则仓已经看到 JavDB v3 新 Test `3.9.44-test.1`，测试版规则仓却仍显示旧 `3.9.42-test.5`。
- 因此云端 `channel_catalog_snapshot.json` 已经更新，但测试仓本地运行视图没有更新。
- 这也使前面 ACFun Test50001/50002 的实机失败结论失去可信度：用户可能一直从旧测试目录导入旧 Shell，不能再把重复行848当成两个新 Build 都已执行的事实。
- ACFun Test50003 为诊断隔离版，主动改名为 `ACFun·测试版` 并从 Stable0.4.9 派生；它不作为后续最终 APP 测试业务线基线。

### 根因
RC33 的 `flat_control_v1.js` 能成功把最新目录写到 `channel_catalog_v2.json`，但 `flat_final_patch.js` 同时维护：

```text
var _catalog = null;
catalog() → 第一次读本地文件后长期返回 _catalog
```

因此出现：

```text
检查版本/同步
→ 新 snapshot 已写入本地文件
→ 当前 Runtime 仍读取旧 _catalog
→ refreshPage 之后仍显示旧 Test
```

这是典型的 **mutable control-plane 被误当 immutable runtime cache**。版本目录、Provider channels、domains、feature flags 等可变控制面不能使用长生命周期只读内存快照遮蔽已更新的本地 last-known-good 文件。

### RC34 修复
1. 新 `flat_control_v2.js` 使用 `channel_catalog_v3.json` / `self_channels_v4.json`，主动检查/同步仍先取得 GitHub `main` HEAD，再按 immutable SHA 拉取控制面。
2. 新 `flat_catalog_live_patch_v1.js` 不再维护 `_catalog`；`channelMeta / fastChannelCache / loadChannelMetaLive` 每次都读取当前本地 `channel_catalog_v3.json`。
3. 点击任意程序“检查版本”后，Control 写入新目录，当前页面 `refreshPage(false)` 立即从文件重新读取，并在 toast/设置页显示 revision。
4. 新 `flat_entry_v2.js` / `flat_control_v2.js` 同时覆盖旧 `flat_entry_v1.js` / `flat_control_v1.js` 本地别名，降低旧页面模块缓存重新进入 RC33 控制面的风险。
5. Build424 正常运行仍是单本地 bundle；没有用户主动检查/同步时不访问 GitHub 控制面。
6. `flat_builder_v2.js` 优先复用已存在的 `flat_runtime_b423.js`，只追加 RC34 overlay 生成 `flat_runtime_b424.js`；新设备缺 B423 时才一次性调用 RC33 Builder。
7. Stable 3.5.5 / Build389、Latest 均不修改。

### RC34 实机验收
1. 当前 RC33 自身“检查版本”必须发现 RC34 / Build424。
2. 导入 RC34 后重新打开，详情应显示 RC34 当前运行。
3. 在测试仓打开 JavDB v3：若本地目录尚旧，点一次“检查版本”，**当前页面**必须立刻从旧 `3.9.42-test.5` 变成新 `3.9.44-test.1`，无需退出测试仓、无需借正式仓刷新。
4. 设置页应显示当前 `catalog revision`；诊断应显示 `Flat Runtime RC34 / Build424` 和 `catalog <revision> (live-file)`。
5. 后续再发布一个新小程序 Test 时，测试仓必须能通过“检查版本/同步”在同一进程中立即看到，才算真正关闭该事故。

### Stable 门禁
- 用户明确要求测试仓真正稳定后再升级正式版。
- RC34 未完成自更新、目录即时刷新、二次启动、导入、诊断和基础页面实机回归前，Stable 3.5.5 不得晋级。

## 2026-08-25 · 3.5.6-rc33 / Build423 · Flat Runtime Rebuild
- RC32 被确认存在 Bridge v6→v10 + Build402 多模块重复加载，导致二次启动慢、诊断卡死。
- RC33 首次把 Build402 模块合并为单一 `flat_runtime_b423.js`，正常启动只加载 Flat Entry + 单 bundle。
- 检查版本/同步/诊断拆为独立 `flat_control_v1.js`；导入继续使用 fixed-ref direct payload。
- RC33 解决启动套娃，但留下本次“可变 catalog 被 `_catalog` 长生命周期内存缓存遮蔽”的控制面缺陷。

## 历史
- RC32 及之前当前链：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
