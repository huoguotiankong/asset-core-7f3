# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC39 是一次明确的架构重置：停止 RC36–RC38 的 Fast Hybrid / Detail / Presence 增量实验，测试仓回到 Stable 3.5.5 的完整已验证运行时。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，作为唯一稳定产品基准与 Test 救援入口。
- Test：`3.5.6-rc39 / Build429`，Shell `rule_repo_test_v176_clean.txt` / rule version `2026082521`。
- Test 运行：`Clean Test Shell → Stable bootstrap_v155.js → Remote Manager 2.0.4 cache → Stable 3.5.5 39 modules`。
- RC39 不加载任何 Test Overlay，不是 Local-First，也暂时不提供 Test 自更新。

## 2026-08-25 · 3.5.6-rc39 / Build429 · Clean Stable Clone

### 用户实机事实
- RC38 首页显示 18 个程序且 18 个全部“已安装”，明显与真实状态不符，说明 Batch Presence 产生假阳性。
- 点击程序后仍出现“正在读取当前程序版本…”并最终提示“找不到对应的小程序”，说明 RC38 的详情控制面仍未恢复 Stable 行为。
- 从 RC33 到 RC38，测试仓在启动性能、目录真相、安装识别、详情导航、自更新和导入链上连续出现互相牵连的回归。
- 用户明确反馈：相较 Stable 3.5.5，新增优点没有形成稳定收益，缺点持续增加。

### 决策
1. 停止 RC36–RC38 增量补丁链，不再做 RC39=RC38+补丁。
2. RC39 除测试版独立标题和 numeric rule version 外，所有运行页面直接使用 Stable 3.5.5 的 `bootstrap_v155.js`。
3. 不加载 `fast_hybrid_patch.js`、Flat Runtime、Detail Bridge、Batch Presence、per-app channels overlay 等任何实验模块。
4. 首页安装统计、程序详情、版本中心、导入、搜索、分类、设置全部恢复 Stable 3.5.5 原实现。
5. 为避免再引入更新控制面变量，RC39 暂停 Test 自更新；后续候选先由 Stable 3.5.5 版本中心覆盖导入。
6. 只有 RC39 实机证明“行为与 Stable 一致且不更慢”后，才允许重新加功能。
7. 后续每次只加一个独立能力，并要求实机回归后才能进入下一项。

### RC39 实机验收
1. 从 Stable 3.5.5 版本中心覆盖导入 RC39。
2. 第一次打开能完整进入首页；第2/3次启动速度不得明显慢于 Stable。
3. 首页程序数量、已安装数、可更新数与 Stable 3.5.5 同条件表现一致。
4. 点击 Pornhub/JavBus/JavDB/MyAv 等程序，详情行为与 Stable 一致，不得出现“找不到对应的小程序”。
5. 可用版本卡、导入、分类、搜索、更新页、设置页不得出现 RC36–RC38 特有逻辑。
6. 在 RC39 完整通过前，Stable 3.5.5 不晋级，其他业务小程序本地化暂停。

## 2026-08-25 · RC36–RC38 连续失败收口
- RC36：为性能取消首页 channels / 安装探针后，多版本详情变成0个版本。
- RC37：详情按规则标题重新定位，实机提示找不到“我的规则仓库·测试版”；安装统计只剩1。
- RC38：改当前规则上下文 + Batch Presence 后，实机变成18/18假安装，详情仍提示“找不到对应的小程序”。
- 结论：规则仓作为控制面必须优先“已验证行为不变”，不能一次同时改启动、安装识别、版本真相、详情导航多个基础层。

## 历史
- RC37：`apps/tools/rule-repo/CHANGELOG_RC37_20260825.md`
- RC36：`apps/tools/rule-repo/CHANGELOG_RC36_20260825.md`
- RC35：`apps/tools/rule-repo/CHANGELOG_RC35_20260825.md`
- RC34：`apps/tools/rule-repo/CHANGELOG_RC34_20260825.md`
- RC32 及之前：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
