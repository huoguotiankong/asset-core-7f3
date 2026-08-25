# 我的规则仓库 CHANGELOG

> RC35 冻结历史。RC34 已冻结到 `CHANGELOG_RC34_20260825.md`；RC33 为 Flat Runtime 基线，RC35 恢复 per-app channels 权威并修复安装身份。

## 当前活动基线（冻结时）
- Stable：`3.5.5 / Build389`，继续冻结，作为最终救援基线。
- Test：`3.5.6-rc35 / Build425`，Shell `rule_repo_test_v172.txt` / rule version `2026082517`。
- 正常启动：`Micro Shell → flat_entry_v3.js → flat_runtime_b425.js`。
- 版本真相：程序详情优先读取对应 `channelsPath`；统一 `channel_catalog_snapshot` 只作为首页/离线摘要。
- 自更新：`main` 多源 cache-bust 直接读取，不再依赖 GitHub API HEAD。

## 2026-08-25 · 3.5.6-rc35 / Build425 · Per-App Channel Truth + Install Identity Repair

### 用户实机事实
- RC34 中打开 JavBus，当前安装显示“已安装 · 版本待识别”。
- RC34 的“检查版本”直接报：`无法取得 main HEAD：1:invalid | 2:invalid`。
- 同时仓库实际 `apps/video/javbus/channels.json` 已是 `2.0.1-test.1 / Build20101`，测试仓仍显示旧 `2.0.0-alpha4 / Build20004`。
- 因此 RC34 即使解决了 `_catalog` 内存遮蔽，控制面仍存在“GitHub API HEAD 硬依赖 + 统一 snapshot 自身滞后”两层问题。

### 根因
1. RC34 `flat_control_v2.js` 把 GitHub API `branches/main` / `commits/main` 当作刷新前置；目标设备 API 响应被判 `invalid` 后整个刷新链直接中断。
2. `channel_catalog_snapshot.json` 是离线聚合快照，不是强一致版本事实源；它可能晚于程序自己的 `channels.json`。
3. RC12 release 早已定义 `channelTruth = per-app-channels`，RC33 扁平化时又用统一 snapshot 覆盖 `channelMeta()`，属于架构回归。
4. RC33 快速 direct-payload 导入覆盖没有继承 RC3 Verified Install Index 的 parent/channel/version 写入；Stable/Test 同名程序后续只能识别“标题存在”，无法识别实际通道。

### RC35 修复
1. `flat_control_v3.js`：取消 GitHub API HEAD 硬依赖。Raw main / GitHub WebRaw main / jsDelivr @main 使用 cache-bust 读取；多个有效结果按 Build/revision 选择较新值。
2. `refreshApp(appId, channelsPath)`：用户进入详情/点击检查版本时直接读取该程序自己的 `channels.json`，保存到独立本地 `app_channels_<id>.json`。
3. `flat_channel_truth_patch_v1.js`：`channelMeta / fastChannelCache / loadChannelMetaLive` 优先读取 per-app 本地 channels；统一 snapshot 只作无网兜底摘要。
4. 用户主动读取程序 channels 时，对 Stable/Test `.txt` Shell 按需提取 numeric `home_rule.version` 并写入本地 channel 指纹；不在首页做 N+1 网络拉取。
5. 新导入成功后立即把 parent/channel/version/build/ruleVersion 合并进 Verified Install Index。
6. 对旧安装，读取手机 `getLastRules()` 的实际 `home_rule.version`，与当前通道 Shell 指纹匹配；唯一命中时自动恢复“当前安装：Stable/Test + 真实版本”。
7. `load-channels` 仅对当前进入的一个程序按需刷新，5 分钟内复用本地 per-app cache；正常仓库启动仍不联网。
8. RC35 Builder 只在 RC34 B424 上追加 overlay 生成 `flat_runtime_b425.js`，继续保持单本地 Runtime 正常启动。
9. Stable 3.5.5 / Build389、Latest 均不修改。

### RC35 后续实机结论：性能不合格
- 用户确认版本信息已经基本对上，但退出再进入测试仓首页仍需长时间加载，整体体验明显不如 Stable 3.5.5。
- 这说明 RC35 虽修正控制面事实，但 Local-First Flat Runtime 产品目标失败。
- 根因之一：`flat_runtime_b425.js` 继承 B424→B423，B423 又把 Build402 全量历史模块逐段拼接，再追加 RC27/RC33/RC34/RC35 overlay；每次启动仍需解析一个巨型 JS。
- 根因之二：RC35 `fastItemState()` 对“已安装但未识别”的 channel-group 自动调用安装身份 repair，可能在首页循环中重复执行 `deviceRuleSnapshot/getLastRules` 级别设备扫描。
- 结论：规则仓作为控制面/救援工具不再强制 Local-First。后续从 Stable 3.5.5 快启动链重建，业务小程序继续 Local-First。

### Stable 门禁
- Stable 3.5.5 / Build389 不因 RC35 控制面修复而晋级。
- 新 Test 必须在启动速度、版本真相、导入、自更新均至少不差于 Stable 后才考虑晋级。

### 事故记录
- `docs/INCIDENT_RULE_REPO_PER_APP_CHANNEL_TRUTH_AND_INSTALL_IDENTITY_20260825.md`
- `docs/INCIDENT_RULE_REPO_MUTABLE_CATALOG_MEMORY_CACHE_20260825.md`

## 历史
- RC34：`apps/tools/rule-repo/CHANGELOG_RC34_20260825.md`
- RC32 及之前：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
