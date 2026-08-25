# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC24 及之前的完整历史已冻结到 `CHANGELOG_PRE_RC26_20260825.md`；历史 Incident / pre-* 文档继续保留，禁止删除。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，不参与本轮修改。
- Test：`3.5.6-rc26 / Build416`，Shell `rule_repo_test_v163.txt` / rule version `2026082502`。
- Test Runtime 基线仍为 immutable `3.5.6-rc12 / Build402`，Local Module Manager `2.2.0`，正常启动执行 `require(file://)` 本地模块。
- RC24 本地图标包与独立轻同步保持；RC25 普通 `.txt` 规则原生 `home_rule_url` 导入交接保持。

## 2026-08-25 · 3.5.6-rc26 / Build416 · Fast Catalog Check

### 实机事实
- 用户同一时刻实机截图确认：Stable“我的规则仓库”中的麻豆AI详情已经显示 `Test 2.8.1-test.1 / Build28101`；“我的规则仓库·测试版”同一详情却仍显示旧 `2.8.0-test.3 / Build28003`。
- 用户点击测试仓程序详情里的“检查版本”没有刷新到新 Test，反而出现前台卡住。
- GitHub `main` 当前 `channel_catalog_snapshot.json` 已包含麻豆AI `2.8.1-test.1 / Build28101` 和麻豆传媒 `0.1.1-test.1 / Build10201`，因此云端统一目录正确，故障位于测试仓本地目录刷新/检查动作。

### 根因
1. RC21 后程序详情正常热路径只读 `channel_catalog_v2.json` 本地统一版本目录；这是正确的 Local-First 设计，但旧目录不会自行变化。
2. `Single Workspace 13.1` 的 `workspaceAction('check')` 并不刷新统一目录，而是重新进入 `ruleRepoCore`、执行 `findById(id,true)` / 安装状态检查，再读取旧本地版本；因此按钮名与真实行为错位，既可能阻塞又无法得到新版本。
3. RC24 `sync_scheduler_v4.js` 的版本目录同步只对 `raw.githubusercontent.com` 做一次 `batchFetch`。Raw 单路失败时会静默保留旧 `channel_catalog_v2.json`，没有 GitHub Raw/jsDelivr 目录镜像兜底。
4. RC24 同步器自身还固定 RC24 selfMeta；RC25 通过后置 patch 修正自身身份，但控制面长期叠加容易再次回退旧真相。

### RC26 修复
- 新增 `catalog_refresh_v1.js`：主动版本检查只请求统一 `channel_catalog_snapshot.json`，不加载 Build402 Runtime、不扫描安装状态、不逐程序访问 `channels.json`。
- Raw / GitHub Raw / jsDelivr 三镜像并行短超时读取；多个有效响应同时存在时按 `revision` 选择最新者，避免陈旧 CDN/缓存覆盖新目录。
- 刷新成功后原子写入本地 `channel_catalog_v2.json`，并以正在运行的 RC26 覆盖规则仓自身 Test 真相；失败则保留旧目录并快速返回提示。
- `catalog_refresh_patch.js` 覆盖 `workspaceAction('check')`：点击“检查版本”仅运行轻量目录刷新，完成后刷新当前页面；不再重新进入完整 Runtime/安装状态链。
- 普通“轻同步”继续使用 RC24 manifest + 图标包流程，但末尾追加同一三镜像版本目录刷新作为兜底。
- 新 `shell_bridge_v4.js` 按顺序加载：已验证 Local Runtime → RC24 图标/同步 → RC25 原生导入 → RC26 快速目录控制层。
- 新 Shell `rule_repo_test_v163.txt` 使用独立本地 `shell_bridge_v4.js`，避免手机继续复用 RC25 Bridge v3 缓存。

### 发布门禁
- `catalog_refresh_v1.js`、`catalog_refresh_patch.js`、`shell_bridge_v4.js` 已通过 `node --check`。
- 新 Shell 外层 JSON、`pages` JSON及 14 段 `js:` 入口已解析/语法检查通过。
- 三镜像模拟回归验证：旧/新/较旧三份目录并存时，正确选择 revision `202608250754` 并读出麻豆AI `2.8.1-test.1`。
- Stable 3.5.5 / Build389、Runtime Build402、RC24 图标包和 RC25 原生导入均未修改。

### 实机验收
1. 从 Stable“我的规则仓库”覆盖安装 Test `3.5.6-rc26 / Build416`。
2. 打开测试仓 → 麻豆AI详情。首次打开若仍看到旧本地目录，直接点一次“检查版本”。
3. “检查版本”应短时间返回，不应再长期卡住；页面刷新后麻豆AI应显示 `Test 2.8.1-test.1 / Build28101`。
4. 再检查麻豆传媒，应显示 `Test 0.1.1-test.1 / Build10201`。
5. 执行一次“轻同步”，确认仍可结束，且首页图标不退化。
- 本轮未通过前暂停继续扩大 Hanime1/其它程序 Local-First 发布范围。

## 2026-08-25 · 3.5.6-rc25 / Build415 · Native Import Handoff
- 保留 RC24 已实机确认恢复的本地图标包、独立轻同步和本地统一版本目录。
- 普通 `.txt` Remote/Test/Stable 导入不再在规则仓 lazyRule 内执行 Raw 20s → GitHub API 20s 的完整下载，改为立即返回海阔原生 `home_rule_url` 口令，由原生导入器读取版本化 Shell。
- hkzip、特殊 codec、本地构建/改名等继续原构建链。
- RC25 没有修复统一版本目录刷新，因此被 RC26 接替。

## 2026-08-24 · 3.5.6-rc24 / Build414 · Local Icon Pack
- RC23 轻同步已获实机确认可结束；RC24 新增统一 SVG 本地图标包。
- 用户后续实机确认图标已经恢复，说明本地图标包方案有效。
- RC24 同步/图标架构继续作为 RC26 基线保留。

## 历史
- RC24 及之前完整技术记录：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
- 本次专项事故：`docs/INCIDENT_LOCAL_CATALOG_CHECK_STALE_20260825.md`
