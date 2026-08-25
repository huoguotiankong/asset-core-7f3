# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC35 完整记录冻结到 `CHANGELOG_RC35_20260825.md`。RC36 不再延续 Flat Local-First，而是从 Stable 3.5.5 快启动链重新派生。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，作为最终救援基线。
- Test：`3.5.6-rc36 / Build426`，Shell `rule_repo_test_v173.txt` / rule version `2026082518`。
- 启动：`Test Shell → bootstrap_test_v173.js → Remote Manager 2.0.4 cache → Stable 3.5.5 modules + fast_hybrid_patch.js`。
- RC36 **不是 Local-First**；规则仓作为控制面优先速度、可靠性和自恢复。业务小程序 Local-First 规划不变。

## 2026-08-25 · 3.5.6-rc36 / Build426 · Stable-derived Fast Hybrid

### 用户实机事实
- RC35 中程序版本信息已经基本对上，但退出再进入测试仓首页仍需明显等待。
- 用户明确反馈：体验不像本地程序；与 Stable 3.5.5 相比没有可感知优点，缺点反而增加。
- 因此 RC35 即便功能事实修正，也不能继续作为交付架构基线。

### 根因
1. RC33 `flat_runtime_b423.js` 把 Build402 本地模块包所有历史模块逐段拼成一个 JS，再追加 RC27/RC33 patch。
2. RC34 在 B423 后继续追加 Live Catalog overlay 生成 B424；RC35 又在 B424 后追加 Per-App Channel Truth overlay 生成 B425。
3. “单 bundle”减少了 `require()` 次数，却把启动成本变成每次解析一个越来越大的历史 JS；海阔的分模块 `require()` 缓存优势被丢失。
4. RC35 为修复安装身份，在 `fastItemState()` 遇到已安装但未识别的 channel-group 时会触发 device-rule repair；首页循环可能重复进入 `deviceRuleSnapshot/getLastRules` 级别扫描。
5. 结论：**Local-First 是交付手段，不是产品目标。对控制面工具，如果本地化后更慢，就必须撤销。**

### RC36 架构
1. 完全不加载 `flat_runtime_b423/b424/b425`，也没有 Flat Builder/Entry/Control 链。
2. 直接复用 Stable 3.5.5 / Build389 的 39 个已验证模块和 Remote Manager 2.0.4 缓存机制，只追加 `fast_hybrid_patch.js`。
3. 正常首页如果已有 manifest 缓存就直接返回；关闭 Stable 原来的 TTL/probe 自动联网。联网只在首次无缓存、手动同步、主动检查程序版本时发生。
4. 首页安装状态只读仓库记录/已有 identity，不调用 `request(hiker://home@...)`，更不调用 `getLastRules()`。
5. `channelMeta()` 首页只读当前程序本地缓存；进入某个程序详情时才按需读取它自己的 `channels.json`，5 分钟内复用。
6. 新导入 Stable/Test 时写入 parent/channel/version/build/ruleVersion；旧安装身份修复只允许在当前程序详情/主动检查时运行一次。
7. 测试仓自更新重新使用 Remote Manager 2.0.4 读取 `test.json`；Raw/WebRaw/CDN 可用即工作，不把 GitHub main HEAD API 作为前置。
8. Stable 3.5.5 / Build389、Latest 不改。

### RC36 性能验收
1. 从 RC35 覆盖导入 RC36 后，**第一次**允许重新建立 Remote Manager 模块缓存。
2. 完全退出测试仓，再打开第 2 次、第 3 次；必须明显快于 RC35，目标至少不慢于 Stable 3.5.5。
3. 首页出现后不应因 60 秒 probe 或设备规则扫描继续阻塞。
4. 打开 JavBus/JavDB 详情可以有一次当前程序 channels 网络等待，但不能拖慢整个首页。
5. 当前安装若已由仓库记录应即时显示；仅历史未知版本允许在详情页做一次识别。
6. “检查测试版更新”必须可用，不再出现 `main HEAD invalid`。
7. 若 RC36 二次启动仍明显慢于 Stable，直接判失败；不允许再在 RC36 上叠更多性能补丁，应进一步缩减 Stable 模块/重写干净 Core。

### Stable 门禁
- 用户明确要求测试仓真正稳定后再升级正式版。
- RC36 的二次启动、版本中心、导入、自更新、同步和基础页面全部实机通过前，Stable 3.5.5 不得晋级。

## 历史
- RC35：`apps/tools/rule-repo/CHANGELOG_RC35_20260825.md`
- RC34：`apps/tools/rule-repo/CHANGELOG_RC34_20260825.md`
- RC32 及之前：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
