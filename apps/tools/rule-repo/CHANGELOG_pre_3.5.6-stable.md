# 我的规则仓库 Changelog

> **程序级长期技术记忆。** 开发/优化“我的规则仓库”前，除三份全局文档外，必须先读本文件以及当前 `stable.json / test.json / candidate.json / channels.json / latest.json`、对应 Release、Bootstrap、Shell、实际模块与用户实机结果。

## 3.5.6-rc3 Test（Build 393 / Shell 1.0.39-test / Bootstrap 1.0.38-test / Manager 2.0.4）

- RC2 实机截图确认 Single Workspace 已恢复渲染且首页打开明显更快，但状态区出现新的确定性问题：云仓显示 **全部16 / 已安装3 / 可更新2**，仅把“我的规则仓库、ACFun、JavDB v3”视为已安装，并把 ACFun/JavDB 标成可更新；这与此前用户设备基本全量安装的实机事实冲突。
- 根因不是更新比较算法本身，而是 RC1/RC2 为追求首页零扫描，将 `importHistory / installedMap / group_install_v1` 当成设备安装真相。它们只能证明“规则仓库曾生成/交付过某个导入口令”，不能证明用户最终确认安装，也不能证明当前仍运行哪个 Stable/Test/Local；因此会同时造成漏报安装和同名通道误判。
- 旧 `install_probe.js` 已重新核对：`rulePresence()` 只能通过 `request('hiker://home@标题')` 返回规则是否存在，无法识别同名 Stable/Test 的真实版本。ACFun 进一步证明同名通道必须使用海阔规则数值 `version` 指纹：当前 Stable Shell 数值 version 为 `2026082103`，Test Alpha11 为 `2026082317`，语义版本和 build 并不能替代这个设备指纹。
- 本轮升级为 **Single Workspace 14.2 / Verified Device Install Index**：
  - 新增持久化 `verified_install_index_v1`，普通首页只读取该索引，继续保持零逐项安装扫描。
  - 显式“同步”升级为 **同步目录 + 刷新真实安装状态**。刷新时优先使用 `getRuleCount() + getLastRules()` 一次取得本地规则表，提取 `title + numeric version`；无法从规则表确认存在性的项目才使用旧 `hiker://home@标题` 作为存在性兜底。
  - 多版本程序显式刷新时按需读取 `channels.json`，并读取各通道实际 Shell，提取海阔规则数值 `version` 建立 `channel_fingerprint_v1`。本地同名规则数值 version 与某条 Stable/Test/Local 指纹精确匹配时，才认定当前通道。
  - 无法确认真实通道/版本时只显示 **已安装 · 版本待识别**，`update=false / updateKnown=false`，宁可保守不提示，也禁止再通过导入历史猜 Test/Stable 后制造假更新。
  - 若同名多通道均有可靠数值指纹，且实际设备 ruleVersion 明确低于所有可能目标，才允许在通道未知时安全判定“存在更新”。
  - 从规则仓库自身重新导入版本后可立即更新 Verified Index，但该快捷状态只作为本项目刚完成的交付记录；用户后续删除/外部覆盖后仍以下一次显式设备刷新结果为准。
- RC3 保留 RC2 的 X5 Render Guard、Fast Home 缓存优先、`channels.json` 详情按需加载、channel-group 更新中心支持，以及 Icon Delivery，不恢复首页 N 次同步探测。
- 新建不可变资产：`releases/test-3.5.6-rc3/verified_install_index_patch.js`、`release.json`、`bootstrap_test_v138.js`、`rule_repo_test_v139.txt`。活动 Test 已切到 **3.5.6-rc3 / Build393**；Stable **3.5.5 / Build389** 冻结不动。

### 3.5.6-rc3 实机回归重点

1. 覆盖 RC3 后先点一次“同步”。此动作允许比普通首页慢，因为它要刷新目录、读取设备规则表并建立通道指纹；完成后应提示“已安装 / 可更新 / 版本待识别”统计。
2. 同步完成后再次进入首页应继续快速打开，不应重新逐程序扫描。
3. “已安装”数量必须接近海阔设备真实安装状态，不再只显示最近从规则仓库导入的少数程序。
4. 当前已是 ACFun Stable 0.4.9、JavDB Stable 3.9.42 时，不得再仅因仓库同时存在 Test 而标成“可更新”。
5. 无法读取某条本地规则 numeric version 时，应显示“已安装/待识别”，不得误报“可更新”。
6. 首页“可更新”筛选和底部更新中心必须读取同一 Verified Index，数字与列表一致。

## 3.5.6-rc2 Test（Build 392 / Shell 1.0.38-test / Bootstrap 1.0.37-test / Manager 2.0.4）

- RC1 实机出现 X5 工作区整块白屏，但海阔顶栏与底部原生栏仍正常，证明 Shell/Bootstrap 已启动，故障集中在 Single Workspace 浏览器执行层。
- 根因确认：RC1 将 `workspaceClient` 错当成“返回 JS 字符串的生成器”，并在覆盖函数中引用 Rhino 模块闭包变量 `baseWorkspaceClient`。`hybridDocument()` 随后对覆盖后的函数执行 `.toString()` 注入 X5，浏览器端没有 Rhino 闭包，因此运行时直接 `ReferenceError: baseWorkspaceClient is not defined`。
- RC2 改为 **Rhino 端先读取原 `baseWorkspaceClient.toString()` → 完成三个纯源码替换 → 再把不含外部闭包引用的函数源码注入 X5**。跨运行时脚本禁止序列化依赖父作用域的闭包变量。
- 新增 Render Guard：工作区 JS 再发生异常时，X5 中间区域必须显示“工作区加载失败 + 错误信息 + patch 命中数”，禁止静默白屏。
- RC2 实机确认首页完整恢复，且 Fast Home 性能优化生效；随后暴露的安装/更新状态准确性问题转入 RC3 处理。

## 3.5.6-rc1 Test（Build 391 / Shell 1.0.37-test / Bootstrap 1.0.36-test / Manager 2.0.4）

- 用户在 Stable 3.5.5 实机截图确认首页已有 18 个程序、底部五栏正常，但提出两个 P0 产品问题：**首页每次打开特别慢**，以及首页“可更新”长期显示 **0**；截图同时确认麻豆传媒程序卡图标仍命中破图缓存。
- 排查真实运行链后确认首页慢不是单纯 GitHub 网络问题，而是两个同步热路径叠加：
  1. `install_probe.js` 的 `stats()` 对每个程序调用 `actualInstalled()`，继而执行 `request('hiker://home@'+title)`。18 个程序即至少一轮串行本地规则存在性探测；程序数继续增长时首屏耗时会近似线性增长。
  2. Single Workspace 13.x 的 `hybridProgramData()` 对每个 `channel-group` 在首页构建阶段立即执行 `channelMeta(item)`，导致首页额外形成 **N+1 channels.json 请求**。版本中心数据本应只在用户进入具体程序时需要，不应阻塞首页。
- “可更新 = 0”确认是代码合同缺陷，不是用户设备状态：`install_probe.js` 的 `stats()` 遇到 `channel-group` 时仅统计安装数后直接 `continue`，从未进入更新比较；而当前云仓大多数程序正是 `channel-group`。同时旧 `updatesView()` 又硬编码 `p.update && !p.channel`，即使多版本程序被算出可更新也会被更新中心再次过滤。
- 本轮升级为 **Single Workspace 14.0 / Fast Home & Update Index**：
  - 普通首页打开优先使用本地“最后一次成功目录”缓存立即渲染；联网刷新统一交给显式“同步”，首装无缓存时才进入原网络链。
  - 首页统计不再调用 `rulePresence()` 扫描全部 `hiker://home@标题`；安装/当前通道状态改用规则仓库自身导入记录与持久化 group state，避免每次首屏重新探测。
  - 根 manifest 的复合版本字段（`Stable … / Test … / Local …`）成为首页轻量 Update Index；按当前实际通道与同通道目标版本比较，`channel-group` 正式纳入“可更新”数字和更新中心。
  - 新的通道导入 raw 写入 `__repoParentId / __repoChannel / __repoBuild`，生成有效海阔导入口令后记录当前父程序、通道、版本与 build，为后续 O(1) 更新比较提供稳定状态。
  - 每个程序的 `channels.json` 改为**按需加载**：首次进入具体多版本程序时只拉该程序一份 channel metadata 并持久缓存；随后进入直接使用缓存。首页不再预取全部版本中心数据。
  - 更新中心取消 `!p.channel` 排除条件，多版本程序与单版本程序共用 `p.update` 合同。
- 对历史安装状态采用兼容迁移：优先读取新的 group state；没有新状态时从现有 `importHistory / installedMap` 推断最近一次 Stable/Test/Local 导入记录。该迁移属于性能优先的快速状态模型，**用户最终是否真的完成海阔导入仍以实机为准**；如旧设备记录不足，后续可以增加手动“刷新安装状态”扫描，而不重新塞回首页热路径。
- 麻豆传媒仓库 SVG 源文件本身有效，截图更符合设备图片缓存继续命中旧失败结果。本 Test 对 Madou 图标 URL 增加独立 `?v=2026082401` 缓存破坏，不全局刷新其它正常图标。
- 新建不可变资产：
  - `releases/test-3.5.6-rc1/home_fast_update_patch.js`
  - `releases/test-3.5.6-rc1/release.json`
  - `bootstrap_test_v136.js`
  - `rule_repo_test_v137.txt`
- 活动 Test 已切到 **3.5.6-rc1 / Build391**，`baseVersion=3.5.5`，Stable **3.5.5 / Build389** 完全冻结不变。Shell 数值 version 为 `2026082401`，固定引用不可变 Bootstrap 提交，不依赖可变 `@main` 启动核心。
- 本轮仓库并发非常活跃，18AV/JavMenu 等任务持续推进 `main`。两次旧 HEAD 的 Git Data fast-forward 均被 GitHub 422 正确拒绝；全过程未使用 force。不可变资产改用 contents API 安全落盘，最终 Test `test.json / channels.json / app manifest` 再基于最新 HEAD 一次原子活动指针切换。

### 3.5.6-rc1 实机回归重点

1. 覆盖测试版后连续退出/重新进入首页，比较首屏出现速度；第二次及以后应明显快于 3.5.5。
2. “全部 / 已安装 / 可更新 / 收藏”四个数字应快速出现，不应等待逐程序探测。
3. 若当前安装的某个 Stable/Test/Local 版本低于根目录同通道目标版本，“可更新”必须大于 0；点击数字和底部“更新”后应能看到对应多版本程序。
4. 首次点击某个多版本程序允许出现一次很短的“版本信息已加载”并刷新进入详情；再次进入应直接使用缓存。
5. 从版本中心导入 Stable/Test/Local 后重新打开仓库，应按刚导入通道显示“已安装/可更新”。
6. 麻豆传媒首页图标应恢复；如仍破图，再针对海阔/X5 图片缓存层做独立诊断，而不是继续修改有效 SVG。
7. 导入、收藏、同步、搜索、分类、设置、活动记录和 Stable recovery 不得退化。

## 历史版本

Stable 3.5.5 及此前当前日志已原样保存在 [`CHANGELOG_pre_3.5.6-rc1.md`](./CHANGELOG_pre_3.5.6-rc1.md)。更早的完整 3.5.4 及以前记录继续保存在 [`CHANGELOG_pre_3.5.5.md`](./CHANGELOG_pre_3.5.5.md)。恢复旧版本或追查历史踩坑时禁止删除这两份历史文件。
