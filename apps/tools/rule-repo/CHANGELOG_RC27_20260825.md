# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC26 完整记录冻结到 `CHANGELOG_RC26_20260825.md`；RC24 及之前完整历史继续保留在 `CHANGELOG_PRE_RC26_20260825.md` 和既有 Incident / pre-* 文档。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结。
- Test：`3.5.6-rc27 / Build417`，Shell `rule_repo_test_v164.txt` / rule version `2026082503`。
- Runtime 基线仍为 immutable `3.5.6-rc12 / Build402` + Local Module Manager `2.2.0` + `require(file://)`。
- RC24 本地图标包、RC25 原生 `.txt` 导入、RC26 三镜像快速版本目录全部保持。

## 2026-08-25 · 3.5.6-rc27 / Build417 · Channel Update State

### 用户实机事实
- RC26 已解决测试仓本地统一版本目录滞后：麻豆AI详情已显示 `Test 2.8.1-test.1 / Build28101`，麻豆传媒详情已显示 `Test 0.1.1-test.1 / Build10201`。
- 同一时刻首页仍显示 `16 已安装 / 0 可更新`，证明故障已从“目录刷新”收敛为“多版本更新状态计算”。
- 麻豆传媒详情还可出现“已安装 · 版本待识别”，因此更新判断不能只依赖单一 Verified Index 精确指纹，还需利用规则仓已有导入记录作为本地补充证据。

### 根因
1. 基础 `install_probe.js` 对 `channel-group` 在 `actualStatus()` 中直接返回“版本中心”，在 `stats()` 中统计已安装后立即 `continue`，因此多版本程序不会计入 updates。
2. `updates.js` 又显式使用 `x.entryType !== 'channel-group'`，即使底层状态将来能识别更新，更新中心仍会排除多版本程序。
3. RC3 的 Verified Install Index 已提供 `fastItemState()`，但旧逻辑更关注“识别当前安装通道”，没有把已安装 Stable/Test 再与本地统一目录中更高 Build 的远程通道做最终目标比较。

### RC27 修复
- 新增 `releases/test-3.5.6-rc27/channel_update_state_patch.js`，只叠加状态层，不改目录、图标、导入和 Runtime 业务。
- Stable / Test / Candidate 归为同一“远程升级线”；Local / Web 保持独立，不把本地版或网页版误判成远程升级。
- 目标版本优先比较 channel `build`；只有 build 缺失时才回退 `versionCmp()`。这样 Stable Build 高于旧 Test 时不会产生假更新，同 build 的 Stable/Test 标签差异也不会误报。
- 当前已安装远程通道来源顺序：Verified Index 已识别状态 + 规则仓 `installedMap()` 的各 channel 导入记录。仓库导入记录时间晚于旧 Verified Index 时，以更晚记录为准，解决 RC25 原生导入后状态索引未立即重建的问题。
- `fastItemState()` 现在产生 `installedBuild / targetChannel / targetVersion / targetBuild / update`；首页 `stats()`、程序卡片 `nativeStatusMeta()` 和 `actualStatus()` 均读取这一结果。
- 更新中心取消对 `channel-group` 的硬排除，直接列出 `actualStatus()==='可更新'` 的程序。
- 规则仓自身继续特殊处理为当前 Test RC27，不把自己错误计入可更新。

### 静态/逻辑门禁
- `channel_update_state_patch.js` 与 `shell_bridge_v5.js` 已通过 `node --check`。
- `rule_repo_test_v164.txt` 外层规则 JSON、内层 pages JSON、14 段 `js:` 入口全部通过解析/语法检查。
- 模拟回归：
  - 麻豆AI Stable28003 → Test28101：可更新。
  - 麻豆传媒 Stable10114 → Test10201：可更新。
  - 黄豆已安装 Test19103：无更新。
  - JavBus Stable20005 > Test20004：无更新。

### 实机验收
1. 从正式仓覆盖安装 `Test 3.5.6-rc27 / Build417`。
2. 打开测试仓首页；若麻豆AI和麻豆传媒仍是旧 Stable、黄豆已是 Test19103，首页“可更新”预期至少为 `2`，不再固定为 0。
3. 点击“可更新”卡片进入更新视图，应能看到对应多版本程序。
4. 进入底部“更新”页，应列出相同待更新程序。
5. 用户实机随后确认首页“可更新”已经显示 `2`，RC27 更新统计修复有效；但规则仓自身版本中心仍显示 RC26，后续由 RC28 专门修复自更新链。
