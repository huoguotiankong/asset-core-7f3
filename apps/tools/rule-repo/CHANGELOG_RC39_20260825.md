# 我的规则仓库 CHANGELOG

> RC39 历史冻结：停止 RC36–RC38 的 Fast Hybrid / Detail / Presence 增量实验，测试仓回到 Stable 3.5.5 的完整已验证运行时。

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

### RC39 实机结果
- 功能回归面已显著收敛，但用户实机仍反馈每次打开测试仓存在明显白屏/等待，说明启动慢并不是 RC36–RC38 Overlay 导致，而是 Stable3.5.5 本身的远程启动入口也存在等待：`Shell → bootstrap_v155 → bootstrap_v154 → Remote Manager → 39 module require cache`。
- 因此 RC40 只允许改启动入口，不得再动 Runtime 业务/版本中心/详情/安装识别。

## RC36–RC38 连续失败收口
- RC36：为性能取消首页 channels / 安装探针后，多版本详情变成0个版本。
- RC37：详情按规则标题重新定位，实机提示找不到“我的规则仓库·测试版”；安装统计只剩1。
- RC38：改当前规则上下文 + Batch Presence 后，实机变成18/18假安装，详情仍提示“找不到对应的小程序”。
