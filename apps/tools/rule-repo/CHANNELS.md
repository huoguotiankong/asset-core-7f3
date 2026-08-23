# 我的规则仓库：正式版 / 测试版双通道

从 2026-08-20 起，海阔云仓库同时提供两个可直接导入的远程入口：

- `我的规则仓库`：正式版，绑定 Stable / latest；只接收已完成 Release Guard + 海阔实机验证，或用户在明确知悉当前验证状态后直接要求晋级的版本。
- `我的规则仓库·测试版`：测试版，绑定 `test.json`；用于实机验证新 UI、新功能和新更新协议。

两者要求：

1. 程序名称和 app id 不同，可以在海阔里同时存在。
2. Remote Manager state 必须隔离，测试版升级/回退不能改变正式版 active/previous release。
3. 测试版收藏、版本记录、搜索/导入历史等持久数据默认隔离，避免测试操作污染正式版。
4. 普通测试版本只更新 GitHub Test Release / `test.json`，不需要下载本地测试包。
5. 测试通过后创建新的正式 Stable release，再切 `stable.json` / `latest.json`；正式版用户通过远程更新升级。
6. Candidate 失败时只废弃测试版本，不修改当前正式 Stable。
7. Stable 晋级时不能机械复制 Test release：必须移除 Test 专用 state patch，并把动作恢复 Bootstrap、状态命名空间和通道身份重新绑定到 Stable。
8. Stable 晋级完成后，活动 Test 必须立即重新对齐新 Stable，并使用更高 build；不能让 `channels.json` 长期保留“Test baseVersion 低于 Stable”或“Test build <= Stable”的状态。
9. 发布必须分为“不可变资产准备”与“活动指针切换”两阶段：Release / Bootstrap / Shell 所依赖文件先落盘且可回读，最后再一次性切 `stable/test/latest/channels` 等活动指针。
10. 活动指针切换必须基于刚回读的最新 `main` HEAD 做 fast-forward；若并发任务推进了 `main`，必须在新 HEAD 上重建 tree，禁止 force 覆盖其它小程序。
11. `latest.json / test.json / channels.json` 等可变元数据不能把 jsDelivr `@main` 当唯一真相；Updater 必须容忍 Raw/WebRaw/API/CDN 任一路抖动，拒绝低于当前安全 build 的陈旧指针，并保留最后一次成功元数据/内置安全 Release。
12. 根 `manifest.json` 与 `manifest_meta.json` 必须同 revision、同 itemCount 语义完成后，才算云仓目录发布闭环。

当前：

- 正式版：**3.5.5 / Build 389 / Shell 1.5.5 / Bootstrap 1.5.5 / Manager 2.0.4**；按用户明确要求由 3.5.5-rc3 晋级。保留 Single Workspace 13.2 与同步即时刷新，正式加入 Icon Delivery 1.1 和 Remote Delivery Protocol 2.0；正式 Release 不包含 Test state/baseline patch，使用 Stable 状态命名空间与 `bootstrap_v155.js`。
- 测试版：**3.5.5-test.1 / Build 390 / Shell 1.0.36-test / Bootstrap 1.0.35-test / Manager 2.0.4**；这是 Stable 3.5.5 的同基线测试快照，业务/UI 与正式版对齐，仅恢复 Test 独立状态、身份和 Remote Manager state，作为下一轮开发的干净起点。
- 历史晋级来源：**3.5.5-rc3 / Build 389**，保留不可变 Test release；旧 Stable **3.5.4 / Build 384** 继续完整保留为正式回退基线。
