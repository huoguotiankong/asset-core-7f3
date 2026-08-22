# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.0` / Build `20029`，由用户实机确认可启动、头像/播放/主 UI 正常的 Test29 晋级，继续冻结为独立兜底。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt`；Bootstrap：`bootstrap_stable_v5_b20029.js`。
- Test：`2.0.0-test.36` / Build `20036`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20036.txt` / 规则 version `2026082242`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20036.js` / `minBuild=20036` / `defaultRelease=20036`。
- Test recovery base：`2.0.0-test.32`，不是 Test34/35。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1` 仅保留历史文件 `hanime1.txt`。
- Test27 / Test28 / Test34 为 broken/quarantined，不允许再作为恢复基线。
- Test35 为内部预检过渡 build：在交付前发现继承 Test32 `settings32.js` 会把版本/更新/恢复按钮仍绑定 Build20032，因此由 Test36 supersede，未作为用户实机验收版本。

## 2026-08-22 20:32：Test34 实机严重回归 → Test36 最终恢复候选
用户实机截图证明 Test34 同时破坏了多个此前仍工作的域，不能继续在 Test34 上叠补丁。

### Test34 实机失败事实
1. **主评论从可见回归为 0 条**：Test33 虽然“更多回复”失败，但主评论仍存在；Test34 覆盖 `P.comments()` 后页面直接 `共0条评论`。
2. **账号头像仍无真实图片**：账号名称/邮箱能识别，头像仍占位。
3. **片单解析制造伪成功**：出现 7 个 `片单192779 / 192776 / ...` 裸 list ID 卡，真实标题/封面丢失；打开真实片单“待看里番”后显示 `0部`。
4. **收藏 / 稍后看 / 订阅 / 历史仍不可用**：例如稍后看实机 `0部 / 暂无内容`，与真实账号状态不符。
5. **片库运行结果与源码意图冲突**：Test34 源码声称删除 `>`，实机仍显示 `>`；同时 `全部筛选` 和 `作者目录` 入口消失。
6. **搜索仍报错**：输入 `女友` 仍出现 `未知链接：error:返回的值无效 (JSEngine#13)`。

### 为什么回到 Test32
Test32 已有实机事实：
- browser Cookie 登录态可以直接被“我的”识别，不再重复要求登录。
- 主评论仍能正常显示；当时失败的是楼中楼回复，不是主评论。
- 作者目录已有内容，不再完全空白。
- Test31 已验证的紧凑推荐页和播放器列表隔离继续存在于这条恢复链中。

因此 Test36 明确：**恢复到最后一个设备证明关键旧功能还正常的 Test32，再逐模块重建。**

## Test36 实现

### 1. 评论：本轮只恢复主评论，不再碰更多回复
Test36 不加载 `community34.js`，不重新覆盖 Test32 的 `P.comments()`。

当前上游 `1wc10086/Han1mePlus@main / han1me_api.dart` 已再次核对：

```text
/loadComment?type=video&id=<videoId>
→ JSON.comments
→ #comment-start.children
→ 每 4 个 DOM child = 1 条主评论 group
→ group 内 .comment-index-text + div[id^=reply-section-wrapper]

/loadReplies?id=<threadId>
→ JSON.replies
→ div[id^=reply-start].children
→ 每 2 个 DOM child = 1 条回复
```

Test34 把页面全部 `.comment-index-text` 全局两两配对，不等价于上游“每4节点一条主评论”的结构，实机已经证伪。

**Test36 验收先要求主评论恢复；更多回复后续单独抓真实响应再做，不再把两个问题一起改。**

### 2. 账号 / 头像 / 片单 / 收藏：按上游 selector 收敛
`account35.js` 被 Test36 作为独立账号模块加载，并保留 Test32 的 `P.sessionProfile32()` browser-session 统一。

上游当前契约：
- 头像：`/user/<id>/edit` → `img#playlist-avatar`；首页 fallback `#user-modal-dp-wrapper img` / `.profile-avatar-wrapper img`。
- 稍后看：`/user/<id>/saves`。
- 收藏：`/user/<id>/likes`。
- 片单：`/user/<id>/playlists`。
- 历史：`/user/<id>/histories?sort=latest&page=1`。
- 订阅：`/subscriptions?page=1`。
- 普通账号影片卡：`div[class^="user-tab-item-wrapper"]`。
- 订阅影片：`.content-padding-new div[class^="video-item-container"]`。
- 片单 wrapper：`.user-tab-item-wrapper / .playlist-item-wrapper / .playlist-card`。
- 片单详情影片：`.playlist-video-list > div.user-tab-item-wrapper`。

Test36 固定规则：
- selector 分拆执行，不依赖浏览器式逗号组合 selector 必然兼容。
- 片单必须同时取得真实 `list id + title` 才创建卡片。
- **禁止**只扫描到 `playlist?list=<id>` 就渲染“片单 <id>”假卡；没有真实业务字段宁可明确解析失败。
- 账号页和“我的”都优先读 `P.profile()`，让头像补取路径能真正参与当前渲染。

### 3. 片库：完整横向分类 + 恢复入口
`library35.js`：
- 类型 / 排序 / 日期 / 时长读取当前 `filterCatalog` 的完整选项，直接横向 `scroll_button` 展示。
- 不再生成 `>` 二次分类门槛。
- 标签保留常用快捷项。
- 显式恢复三个入口：`全部筛选 / 作者目录 / 清空筛选`。
- `全部筛选` 继续进入完整 `hanimeVideoFilter`；`作者目录` 直接进入 creator directory。

### 4. 搜索：避免输入回调拼接动态 URL
Test30/32 首页搜索原逻辑会在 input JS 中拼接：

```text
hiker://page/hanimeSearch?...&q='+encodeURIComponent(input)
```

Test34 实机仍出现 JSEngine#13。Test36 `search35.js` 改为：

```text
putMyVar('hanime2_search_q', input)
→ 固定进入 hiker://page/hanimeSearch?rule=&simple=true
→ searchPage 从 MyVar 读取关键词
```

Shell `searchFind` 也只负责把 `kw/q/KEY` 写入同一个 MyVar 后调用 `E.searchPage()`。

### 5. 作者目录
继续复用 Test34 中用户认可的 `creator34.js`：
- 三列方形作者图。
- 下一行三列作者名 + 作品数/“查看作品”。
- 图片和文字均进入同一作者详情。
- 作者/上传者详情仍使用 Hero + 影片列表结构。

### 6. Test35 预检问题 → Test36
Test35 业务恢复模块语法通过后，继续检查实际 recovery chain，发现 Test32 的 `settings32.js` 内部硬编码：

```text
BUILD = 2.0.0-test.32
BOOT = bootstrap_test_v4_b20032.js
VER = 20032
```

如果直接交付 Test35，设置页会显示旧 build，且“检查更新 / 更新 / 恢复安装基线”仍可能加载 20032 Bootstrap。为避免再次出现“代码业务升版但维护链仍旧”的事故：
- Test35 不作为实机验收版本。
- Test36 新增 `settings36.js`。
- 设置版本显示、检查更新、更新、重装、恢复全部固定到 `bootstrap_test_v4_b20036.js / Build20036`。

### 7. 发布门禁
- `account35.js / library35.js / search35.js / settings36.js / recovery36.js / bootstrap_test_v4_b20036.js`：`node --check` 全部通过。
- `account35 / library35 / search35 / settings36`：顶层 VM smoke 通过。
- Test36 Release 目录与共享模块路径已回读存在。
- `test.json / manifest / channels / registry / cloud manifest / Shell / Bootstrap / release` 全部指向 Build20036。
- Stable `2.0.0 / Build20029` 未修改。

## Test36 实机验收顺序
- [ ] 设置页显示 `2.0.0-test.36 · Build 20036 · Shell v4`。
- [ ] **主评论先恢复**：评论页不再 `共0条评论`；更多回复暂不作为本轮通过条件。
- [ ] “我的”仍直接识别登录态，顶部账号头像尝试恢复。
- [ ] 我的片单不再出现 `片单192779` 这类裸 ID 假卡；应显示真实标题/封面/数量。
- [ ] 打开已知有内容的片单，能解析真实影片，不再固定 0 部。
- [ ] 收藏 / 稍后看 / 订阅 / 历史逐项核对真实账号数据。
- [ ] 片库每个维度可直接横向滑动看到完整分类；页面能看到 `全部筛选 / 作者目录 / 清空筛选`。
- [ ] 首页搜索 `女友` 不再出现 JSEngine#13，并进入真实结果页。
- [ ] 作者目录保持三列方图，图片下方有作者名/作品信息。
- [ ] 推荐、播放、真选集、漫画链不回归。

## 关键已验证事实
- Test32：browser Cookie 登录态能直接被“我的”识别并显示账号栏目；主评论仍存在。
- Test31：推荐页紧凑布局实机可用；播放器列表只剩真实播放项。
- Test29：实机启动正常；首页/详情 SVG 图标正常。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；海阔 XPath DOM 路径在真实设备可工作。
- Test17：上传者 `/user/<id>` 公开作品链实机通过。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析并直接播放。
- X5 网页登录 + Cookie bridge 可用。
- 漫画首页、漫画分类与详情基本链可用。
- 官网预告页自身 HTTP 500，继续故障降级。

## 已证伪 / 永久禁止回退
- Test18：同时重写评论数据和头像曾造成评论 0 条。
- Test19：全局收集评论图片按 index 回填不可靠。
- Test20：按 commentId/用户名固定字符邻域找图不可靠。
- Test21：自写轻量 HTML DOM parser 的合成 fixture 不能代表真实页面。
- Test25：只改 replies rows + 空结果缓存仍失败。
- Test27：JavaScript SyntaxError，永久 quarantine。
- Test28：顶层 `HanimeUI11` ReferenceError，永久 quarantine。
- Test31：首次 commentId 重绑不足以修复更多回复。
- Test32：`videoId + absolute index` 二次定位仍不足以修复更多回复，但 browser-session 与主评论是当前已验证恢复点。
- Test33：`作者 + 正文指纹` thread 二次定位仍失败；禁止继续无限叠加启发式 reply 映射。
- Test34：同时覆盖 Community / Account / Library / Search 导致多域回归；永久 quarantine，不再作为 recovery base。
- 禁止把 `P.profile()` 成功和 `C.activeAccount()` 非空视为天然等价；browser session 与 managed account 必须显式处理。
- 禁止把浏览器 CSS selector 能力直接等同于海阔 `pdfa/pdfh`；关键业务列表应分拆 selector。
- 禁止只解析到 raw identifier 就制造用户可见业务卡片。
- 禁止“仓库源码显示已覆盖”就认定设备运行时已经执行；截图冲突时先查 Shell / Bootstrap / Remote state / cache / load order。
- 禁止 GitHub 新 Release 当成手机已运行新 Release。
- 禁止 Cloud manifest 广告 Build 高于实际 Shell/Bootstrap/minBuild/defaultRelease。
- 禁止新 JS 未做 Parse Gate + Load Smoke 就切活动 Test。

## 当前恢复链
```text
hanime1_remote_test_v4_b20036.txt
→ bootstrap_test_v4_b20036.js
→ Remote Manager id=hanime1-test
→ 2.0.0-test.36 release
→ Test36 recovery_loader
→ Test32 recovery_loader（设备验证恢复点）
→ account35
→ creator34
→ library35
→ search35
→ settings36
```

Test36 **不加载** `community34 / account34 / library34 / search34`。

Stable：
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Stable 2.0.0 / Build20029
→ immutable Test29 verified baseline
```

## 版本记录
- `2.0.0-test.36 / Build20036`：Test34 多域回归后的最终恢复候选；Test32 base + 隔离账号/筛选/搜索/作者模块 + 正确 settings/maintenance build 绑定。
- `2.0.0-test.35 / Build20035`：内部预检过渡 build；发现继承 settings32 仍指 Build20032，未作为实机验收版本，由 Test36 supersede。
- `2.0.0-test.34 / Build20034`：实机多域回归；主评论 0、账号裸 ID 假片单/空详情、筛选入口丢失、搜索仍 JSEngine#13；永久隔离。
- `2.0.0-test.33 / Build20033`：指纹回复映射、selector-safe 片单、五行筛选、官网式作者 UI；实机证明回复/账号完整性/搜索仍失败。
- `2.0.0-test.32 / Build20032`：browser-session 登录态修复；作者目录不再空白；主评论仍正常；当前恢复基线。
- `2.0.0-test.31 / Build20031`：推荐页、播放器列表隔离实机通过。
- `2.0.0 / Build20029`：用户确认 Test29 后晋级的正式兜底。
- `2.0.0-test.29 / Build20029`：修复 Test28 启动错误，实机启动和 SVG 图标通过。
- `2.0.0-test.27 / 28`：发布事故版本，永久隔离。
- `2.0.0-test.24 / Build20024`：Shell/Bootstrap 更新链恢复，真实头像实机出现。
- `2.0.0-test.23 / Build20023`：海阔 XPath 头像路径。
