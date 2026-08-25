# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC32 及之前完整记录冻结到 `CHANGELOG_RC32_20260825.md`，更早归档继续保留。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，作为最终救援基线。
- Test：`3.5.6-rc33 / Build423`，Shell `rule_repo_test_v170.txt` / rule version `2026082508`。
- Base Runtime：immutable `3.5.6-rc12 / Build402`，但正常运行不再逐模块加载 Build402。
- 新架构：`Micro Shell → flat_entry_v1.js → flat_runtime_b423.js`。

## 2026-08-25 · 3.5.6-rc33 / Build423 · Flat Runtime Rebuild

### 用户实机事实
- RC32 普通小程序导入仍慢且偶发卡住。用户描述约 10 秒导入中，前约 4 秒还能滑动，后约 6 秒整个界面冻结。
- RC32 退出后重新进入测试仓也很慢，甚至明显慢于 Stable 3.5.5。
- “诊断信息”无有效反馈，甚至会直接卡死。
- Stable 3.5.5 导入更快、较少卡住，但每次打开仍需远程 Bootstrap/模块加载，因此不能作为最终架构。

### 根因
- RC32 实际启动链为 `Shell v169 → Bridge v10 → v9 → v8 → v7 → v6 → Local Loader v5 → Build402 52个本地模块逐个 require → 多层补丁`。
- 这是 Patch-Stack-First，不是真正的单 Runtime Local-First。即使没有联网，每次页面进入仍重复大量本地文件查找、require、全局覆盖和 Runtime 重建。
- Build402 历史设置页多个序列化 action 仍 `$.require('hiker://page/ruleRepoCore')`；页面路由不是可靠模块路径，已在同步动作实机出现 `Module ... cannot be found`，诊断/备份/恢复等同类动作也存在风险。
- Build402 Fast Home 已确认：存在本地 manifest 缓存时正常首页不主动联网，因此 RC32 慢启动主因是加载栈，而不是首页偷偷联网。

### RC33 实现
1. `flat_builder_v1.js`：仅在首次迁移时执行。读取设备已安装的 Build402 Local Module Manager 包，按 RC12 release 原顺序读取 52 个本地模块，一次性合并为 `flat_runtime_b423.js`；若新设备没有 Build402 包，才一次性走 legacy loader 安装基线。
2. `flat_entry_v1.js`：正常启动只加载 Flat Control（缺失时安装）和单一 `flat_runtime_b423.js`；不再加载 Bridge v6-v10。
3. `flat_final_patch.js`：在单 bundle 内保留多版本更新状态、本地 catalog/icon、HEAD-Pinned 自更新思想、直接规则 payload 导入，并把版本身份收口到 RC33/423。
4. `flat_control_v1.js`：检查版本、同步和诊断独立运行。诊断只读本地小状态，不联网、不读取大 bundle、不重建 Runtime。
5. 设置页重写：自动检查/缓存设置直接写本地 key；立即同步、诊断、备份/恢复全部改为 Flat 本地路径，移除 `$.require('hiker://page/ruleRepoCore')`。
6. `rule_repo_test_v170.txt` 约 9.4 KB，较 RC32 约22KB再次大幅缩小。二级页面只调用本地 Flat Entry。
7. 普通无 codec `.txt` 导入：fixed ref Raw `timeout=1800ms` 优先；失败再 jsDelivr、GitHub Raw，各 `1800ms`。不再 `batchFetch` 等待全部镜像，也不再 `home_rule_url`。
8. 导入记录写入 `hc_repo_import_diag_v3`，诊断页可看到网络阶段耗时和 payload 字节数。

### RC33 实机验收（必须分首次与正常启动）
1. RC32 自身“检查版本”发现 RC33 / Build423，并覆盖导入。
2. RC33 **第一次打开**允许出现一次本地 Bundle 合并等待；只要能成功进入首页即可。
3. 完全退出后第2次、第3次重新打开，必须明显快于 RC32，并以是否接近/优于 Stable 启动为重点。
4. 设置 → 诊断信息必须快速弹出，不得联网等待或卡死；内容应显示 `Flat Runtime RC33 / Build423`、bundle ready、catalog/icon revision、最后控制/导入耗时。
5. 点“同步程序目录”应正常结束；点规则仓自身“检查版本”应快速刷新并保持 RC33。
6. 从 RC33 导入同一个普通小程序 2~3 次，记录“点击→出现导入页面”的总体验；若仍有后半段冻结，查看诊断中的 `last import ...ms / ...B`。若网络耗时很短而冻结仍长，则明确归因海阔原生 payload 解析，下一步必须继续缩小目标小程序 Shell，而不是再改网络。
7. 首页、分类、搜索、版本详情、图标、可更新统计、打开程序均不得退化。

### Stable 门禁
- 用户明确要求真正稳定解决后再升级正式版。
- RC33 未同时通过二次启动、导入、诊断、自更新、同步和基础页面回归前，Stable 3.5.5 / Build389 不得晋级。

### 事故记录
- `docs/INCIDENT_RULE_REPO_BRIDGE_STACK_FLAT_RUNTIME_20260825.md`
- `docs/INCIDENT_RULE_REPO_HOME_RULE_URL_IMPORT_STALL_20260825.md`
- `docs/INCIDENT_RULE_REPO_SELF_FEED_AND_PAGE_REQUIRE_20260825.md`

## 历史
- RC32 及之前当前链：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
