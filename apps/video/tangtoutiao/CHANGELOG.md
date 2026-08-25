# 汤头条 CHANGELOG

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Test6→Test20 开发、协议、播放、图片与实机历史原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- 当前没有 Stable；活动通道仍为 Test。
- Test：`0.1.0-test.21 / Build10121`，从 Test20 只迁移交付/启动架构，不主动改业务协议。
- Test20：`0.1.0-test.20 / Build10120`，当前业务基线；小说/有声/社区/漫画内容链及排行榜/创作者修复继续原样继承。
- Test19：`0.1.0-test.19 / Build10119`，已知可启动恢复点。
- Test16 图片链以及 Test10/Test15 免费长视频/官方试看播放链继续视为冻结基线。
- 短视频约 2–3 秒问题仍未解决；Test21 不宣称修复。

## 2026-08-25 · 0.1.0-test.21 / Build10121 · Native Local-First

### 为什么不合并成单 Runtime bundle
Test20 的真实运行链由 25 个长期叠加的协议、兼容、播放、页面与 Runtime 模块组成，其中多个补丁显式继承上一层全局对象。为了避免把多个独立 `require()` 文件直接拼接后改变作用域/覆盖时序，Test21 不采用 ACFun 的单 bundle 方案，而使用项目已验证的 Local Module Manager 2.2.0，保持每个文件独立、保持原加载顺序。

### Test21 Release
原 Test20 25 个模块完全按原顺序保留，最后追加：
`apps/video/tangtoutiao/releases/0.1.0-test.21/final_local_patch.js`

总计 26 个本地可执行模块。Release source ref 固定为：
`e8f6c46a1b86a20c75b0f9cb5148984ad0a37b53`

最终覆盖层只做：
1. Runtime version/build 提升到 `0.1.0-test.21 / 10121`；
2. 保留 Test20 module 全量导出，仅覆盖设置页；
3. 设置页显示本地包状态、会话状态、已知短视频边界和诊断；
4. 版本更新责任交给“我的规则仓库”。

不修改：
- `/api/MvList/...` 视频 Provider；
- 长视频/试看播放链；
- 图片解密/缓存；
- 小说、有声、社区动态 `api_list + params_list` 二跳；
- 创作者、排行榜参数契约；
- 漫画 `/api//book/detail → /api/book/list_episode → /api/book/read`；
- 短视频播放算法。

### 新启动架构
```text
Shell
→ 检查 __hclocal22_tangtoutiao-test_b10121.json
→ 本地包完整：按原顺序 require(file://) 26 模块
→ 本地包缺失：只在首次安装调用 immutable Bootstrap
→ Local Module Manager 2.2.0 下载/校验/写入 26 模块
→ 后续启动不再经过 Bootstrap / Remote Manager / GitHub 业务代码
```

- Manager 固定到已经在规则仓/黄豆验证的 `v2.2.0` immutable commit `e06542e60677d5505e7383435b17cb69ec7a21ba`。
- Bootstrap：`apps/video/tangtoutiao/bootstrap_test_v21_b10121.js`，immutable ref `736483ee10f472bf06db6ab4d256080ae74d4647`。
- Shell：`apps/video/tangtoutiao/tangtoutiao_remote_test_v21_b10121.txt`，immutable ref `3958f5816d9c49ae546cb79e93bf26b87dd54f6c`。
- Shell rule version：`2026082513`。
- 正常启动只依赖海阔本地包；网站 API、图片、媒体请求仍按业务正常联网。

### 静态门禁
- `final_local_patch.js`：`node --check` 通过。
- `bootstrap_test_v21_b10121.js`：`node --check` 通过。
- Release JSON：26 模块顺序与 Test20 原 25 模块 + overlay 对齐。
- Shell 外层 JSON、9 个 pages JSON 解析通过；主运行时 loader `node --check` 通过。
- Shell rule version 在 32 位有符号整数范围内。

### 实机验收
1. “我的规则仓库”同步后应显示 `Test 0.1.0-test.21 / Build10121`。
2. 第一次覆盖安装并打开，允许等待 26 模块首次落本地。
3. 首次成功后完全退出，再第2次打开；应直接从本地包启动。
4. 回归推荐/长视频/短视频/搜索/详情/播放/收藏/历史。
5. 回归频道页：排行榜、创作者、小说、有声、社区、漫画详情→章节→正文。
6. 免费长视频和官方试看必须继续可播；封面必须继续正常。
7. 短视频仍约 2–3 秒属于既有已知问题，不把它误判成本地化回归。
8. 设置页应显示 Test21、本地包 ready、26 modules、Manager2.2.0。
9. 任何 Test20 原有正常功能在 Test21 退化，都视为本地模块加载/作用域回归；禁止建立 Stable。

## 历史
- 完整迁移前历史：`apps/video/tangtoutiao/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
