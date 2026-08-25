# 我的规则仓库 CHANGELOG · RC34 归档

本文件冻结 RC34 当前恢复入口，后续活动 CHANGELOG 从 RC35 开始收口。

## RC34 / Build424
- Shell：`rule_repo_test_v171.txt`
- 核心目标：取消 `channel_catalog` 长生命周期 `_catalog` 内存缓存，改为 live-file。
- 实机后续发现：虽然 live-file 修掉了内存遮蔽，但仍有两个更底层问题：
  1. Control 强依赖 GitHub API 取得 `main HEAD`，用户设备返回 `1:invalid | 2:invalid`，导致检查版本直接失败。
  2. `channel_catalog_snapshot.json` 本身可能滞后于程序自己的 `channels.json`；JavBus 已发布 `2.0.1-test.1 / Build20101`，snapshot 仍为 `2.0.0-alpha4 / Build20004`。
- 同期发现 RC33 快速导入覆盖绕过 Verified Install Index 通道身份写入，导致很多同名 Stable/Test 程序只能识别“已安装”，无法识别实际版本。
- 因此 RC34 冻结，不作为后续 Stable 晋级候选。
