# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC34 已冻结到 `CHANGELOG_RC34_20260825.md`；RC33 为 Flat Runtime 基线，RC35 恢复 per-app channels 权威并修复安装身份。

## 当前活动基线
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

### RC35 实机验收
1. RC34 因 self feed 本身已经坏掉，允许最后一次从 Stable 3.5.5 版本中心覆盖安装 RC35。
2. RC35 打开后，自身详情显示 `3.5.6-rc35 / Build425 · 当前运行`。
3. 打开 JavBus 详情：首次进入应直接读取 `apps/video/javbus/channels.json`，可用版本必须显示 `Stable 2.0.0 / Test 2.0.1-test.1`，不能再出现 alpha4。
4. JavBus 当前安装若是 Stable 2.0.0，识别为正式版 2.0.0；若是 Test 2.0.1-test.1，识别为测试版 2.0.1-test.1；不能继续“版本待识别”。
5. 点 JavBus“检查版本”不得再出现 `main HEAD invalid`。
6. 再检查 JavDB/ACFun 任一程序，详情应以其自身 channels.json 为准，不依赖统一 snapshot revision。
7. 从 RC35 导入任一 Stable/Test 后返回详情，应立即显示刚导入的通道/版本。
8. 后续发布 RC36 时，RC35 自身“检查版本”必须直接发现，不再依赖正式仓跳板。

### Stable 门禁
- 用户明确要求测试仓真正稳定后再升级正式版。
- RC35 未完成 per-app 版本真相、安装识别、自更新、二次启动、导入、同步和基础页面实机回归前，Stable 3.5.5 不得晋级。

### 事故记录
- `docs/INCIDENT_RULE_REPO_PER_APP_CHANNEL_TRUTH_AND_INSTALL_IDENTITY_20260825.md`
- `docs/INCIDENT_RULE_REPO_MUTABLE_CATALOG_MEMORY_CACHE_20260825.md`

## 2026-08-25 · RC34 摘要
- 修复可变 catalog 被长生命周期 `_catalog` 内存快照遮蔽。
- 后续实机证明 GitHub API HEAD 硬依赖与 snapshot 自身滞后仍未解决，冻结为历史。

## 2026-08-25 · RC33 摘要
- 首次重建单一 `flat_runtime_b423.js`，解决 Bridge v6→v10 + Build402 多模块重复加载。

## 历史
- RC34：`apps/tools/rule-repo/CHANGELOG_RC34_20260825.md`
- RC32 及之前：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`