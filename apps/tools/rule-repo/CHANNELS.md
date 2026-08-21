# 我的规则仓库：正式版 / 测试版双通道

从 2026-08-20 起，海阔云仓库同时提供两个可直接导入的远程入口：

- `我的规则仓库`：正式版，绑定 Stable / latest；只接收已完成 Release Guard + 海阔实机验证的版本。
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

当前：

- 正式版：**3.5.4 / Build 384 / Shell 1.5.4**；由已实机验证的 3.5.4-rc7 晋级，业务/UI 保持 Single Workspace 13.2，正式链使用 `bootstrap_v154.js` 与 Stable 状态命名空间。
- 测试版：**3.5.4-test.1 / Build 385 / Shell 1.0.31-test**；这是 Stable 3.5.4 的同基线测试快照，业务/UI 与正式版完全对齐，仅保留 Test 独立状态、身份和 Remote Manager state，作为下一轮开发的干净起点。
- 历史已验证候选：3.5.4-rc7 / Build 384，保留不可变 release 作为本次 Stable 晋级来源与恢复参照。
