# 我的规则仓库：正式版 / 测试版双通道

从 2026-08-20 起，海阔云仓库同时提供两个可直接导入的远程入口：

- `我的规则仓库`：正式版，绑定 Stable / latest；只接收已完成 Release Guard + 海阔实机验证的版本。
- `我的规则仓库·测试版`：测试版，绑定 `test.json`；跟随 Candidate，用于实机验证新 UI、新功能和新更新协议。

两者要求：

1. 程序名称和 app id 不同，可以在海阔里同时存在。
2. Remote Manager state 必须隔离，测试版升级/回退不能改变正式版 active/previous release。
3. 测试版收藏、版本记录、搜索/导入历史等持久数据默认隔离，避免测试操作污染正式版。
4. 普通测试版本只更新 GitHub Test Release / `test.json`，不需要下载本地测试包。
5. 测试通过后创建新的正式 Stable release，再切 `stable.json` / `latest.json`；正式版用户通过远程更新升级。
6. Candidate 失败时只废弃测试版本，不修改当前正式 Stable。

当前：

- 正式版：3.5.3 / build 377 / Shell 1.5.3。
- 测试版：3.5.4-rc7 / build 384 / Shell 1.0.30-test，基于正式版 3.5.3；Single Workspace 13.2 为程序/版本导入和设置动作显式绑定当前规则，并以 Bootstrap v130 作为 Core 恢复通道；首页局部滚动、固定五栏、分类原地展开和同页详情继续保持。
