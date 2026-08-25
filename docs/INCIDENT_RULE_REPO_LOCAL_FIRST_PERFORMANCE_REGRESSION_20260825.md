# 规则仓库 Local-First 性能回归事故（2026-08-25）

## 结论

Local-First 是交付手段，不是产品目标。**代码落在本地不代表启动更快。**

规则仓库 RC33 → RC35 将 Build402 历史模块拼成单一 Flat Runtime，再逐版追加 RC27/RC33/RC34/RC35 Overlay。用户实机最终确认：虽然版本真相和安装识别逐步修正，但首页二次启动仍明显慢于 Stable 3.5.5；整体体验“没有可感知优点，缺点反而增加”。因此 RC33-RC35 的规则仓 Local-First Flat Runtime 架构判定失败，不得继续作为后续控制面基线。

## 直接根因

1. `flat_runtime_b423.js` 将 Build402 本地模块包全部源码拼成一个巨大 JS；B424/B425 又继续追加 Overlay。每次启动减少了 `require()` 次数，却增加了巨型源码解析、编译与初始化成本。
2. Stable 3.5.5 虽是 Remote Manager 架构，但 39 个模块由海阔 `require()` 分模块缓存；二次启动实际成本低于解析巨型 Flat Runtime。
3. RC35 为修复安装身份，在首页状态循环中可能对“已安装但未识别”的多版本程序触发 `deviceRuleSnapshot/getLastRules` 级别设备扫描，进一步放大启动延迟。
4. 版本目录、安装身份、控制面刷新等可变状态被多次叠加在运行时 Overlay 上，使控制面越来越重，违反“热路径最小化”。

## 禁用做法

- 禁止因为“本地化”目标，把几十个历史补丁/模块机械拼成单一超大 Runtime 并在每次启动完整解析。
- 禁止在首页、列表渲染、统计计算等热路径自动执行 `getLastRules()`、全量规则扫描、逐程序 `request(hiker://home@...)`、N+1 channels 网络读取。
- 禁止为了保持 Local-First 名义而接受实机性能明显差于 Stable。
- 控制面程序发生性能回归时，禁止继续无限叠 RC/Bridge/Overlay；必须允许架构回退或重写干净 Core。

## 正确策略

### 规则仓库（控制面/救援工具）

优先级：**启动速度 > 稳定性/救援能力 > 版本真相正确 > 自更新可靠 > 交付形式。**

允许使用 Cache-First Remote/Hybrid：

- 正常首页只读本地 last-known-good manifest 与本地状态；不主动联网。
- Remote 模块利用海阔 `require()` 分模块缓存。
- 每程序 `channels.json` 只在进入该程序详情或主动检查版本时按需读取。
- 安装身份：新导入立即记录；历史未知身份只在当前程序详情做一次设备识别。
- 自更新不得硬依赖 GitHub HEAD API。

### 业务小程序

Local-First 规划继续执行，但必须逐程序实机验证。判断成功的标准不是“网络代码已经落本地”，而是：

- 二次启动不慢于原 Stable；
- 正常业务启动不依赖 GitHub 控制面；
- 不引入大 bundle 解析、全量设备扫描或新的主线程卡顿；
- UI/播放/账号/协议功能不退化。

## RC36

RC36 / Build426 已作为规则仓新的 Stable-derived Fast Hybrid Test：

`Test Shell → bootstrap_test_v173.js → Remote Manager 2.0.4 cache → Stable 3.5.5 modules + fast_hybrid_patch.js`

RC36 明确不是 Local-First。若第2/3次启动仍明显慢于 Stable 3.5.5，则 RC36 同样判失败，下一步应重写/裁剪干净最小 Core，而不是继续叠 RC37 性能补丁。
