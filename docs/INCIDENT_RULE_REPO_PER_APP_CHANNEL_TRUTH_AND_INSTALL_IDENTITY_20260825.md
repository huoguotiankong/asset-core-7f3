# Incident：规则仓统一快照滞后、GitHub API HEAD 失效与安装版本待识别

日期：2026-08-25
适用：我的规则仓库、多版本程序版本中心、Local-First 控制面

## 实机症状
- 正式仓能看到新 Test，测试仓仍显示旧 Test。
- JavBus 仓库真实 `channels.json` 已是 `2.0.1-test.1 / Build20101`，测试仓仍显示 `2.0.0-alpha4 / Build20004`。
- 点“检查版本”报：`无法取得 main HEAD：1:invalid | 2:invalid`。
- 当前安装显示“已安装 · 版本待识别”，与手机实际安装版本无法对应。

## 根因
1. RC34 把 GitHub API `branches/main` / `commits/main` 当成刷新控制面的硬前置；目标设备上 API 响应被判 invalid，导致刷新链直接中断。
2. `channel_catalog_snapshot.json` 是离线聚合摘要，不具备强一致性；它可能晚于程序自己的 `channels.json`。
3. RC33 快速 direct-payload 导入覆盖直接返回规则正文，绕过 RC3 Verified Install Index 的通道身份写入；Stable/Test 同名时只能知道标题存在，无法知道实际通道。
4. 版本真相曾在 RC11 明确为 `per-app channels`，RC33 扁平化时又被统一 snapshot 覆盖，形成架构回归。

## 固定规则
- 根 manifest / 统一 snapshot 只做发现、首页摘要和离线 last-known-good，不作为程序版本详情的唯一真相。
- 程序详情与“检查版本”以该程序 `channelsPath` 指向的 `channels.json` 为权威事实源。
- 自更新不得强依赖 GitHub API HEAD；允许直接读取 `main` 多镜像并使用 cache-bust，在多个有效结果中选更高 Build/revision。
- 多版本规则导入成功时必须记录 parent/channel/version/build/ruleVersion 到 Verified Install Index。
- 对历史安装，读取手机规则 numeric `home_rule.version`，与当前 Stable/Test Shell 指纹匹配以自愈安装身份。
- `channels.json` 最好显式携带 `ruleVersion`；未携带时可在用户主动检查版本时按需读取 Shell 建立指纹，不应在首页 N+1 拉取。
- 新版发布后必须实机验证“云端 channels 更新 → 当前详情直接看到新版本 → 导入后当前安装版本可识别”。

## RC35 修复方向
- `flat_control_v3.js`：取消 GitHub API HEAD 硬依赖，支持 per-app channels 缓存与 Shell 指纹。
- `flat_channel_truth_patch_v1.js`：恢复 per-app channel truth，修复 Verified Install Index 写入与历史安装自愈。
- 统一 snapshot 保留为离线摘要，不再决定程序详情版本。
