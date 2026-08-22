# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.0` / Build `20029`，由用户实机确认可启动、头像/播放/主 UI 正常的 Test29 晋级，继续冻结为独立兜底。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt`，Bootstrap：`bootstrap_stable_v5_b20029.js`。
- Test：`2.0.0-test.35` / Build `20035`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20035.txt` / 规则 version `2026082241`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20035.js` / `minBuild=20035` / `defaultRelease=20035`。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1` 仅保留历史文件 `hanime1.txt`。
- Test27 / Test28 / Test34 为 broken/quarantined，不允许再作为当前恢复基线。

## 2026-08-22 20:32：Test34 实机严重回归 → Test35 回到 Test32 恢复
用户实机截图确认 Test34 不是修复版，而是同时破坏了多个此前仍工作的域，因此停止继续在 Test34 上叠补丁。

### Test34 实机失败事实
1. **主评论严重回归**：Test33 虽然更多回复一直失败，但主评论仍能看到；Test34 改写 `P.comments()` 后直接变成 `共0条评论`。因此 Test34 的全局 `.comment-index-text` 配对方式被实机证伪。
2. **账号头像仍失败**：账号名称/邮箱能识别，但头像仍是占位图，说明 Test34 XPath-first 头像补丁没有在真实设备取得有效 URL。
3. **片单解析退化为假数据**：Test34 显示 7 个 `片单192779 / 192776 / ...` 裸 list ID 占位卡；真实标题/封面没有解析出来。进入已知片单“待看里番”后显示 `0部`，而官网真实片单有内容。
4. **收藏/稍后看/订阅/历史仍无法读取**：例如“稍后看”实机仍为 `0部 / 暂无内容`，不能把这种结果当成账号真实为空。
5. **片库 UI 与源码意图不一致**：实机仍能看到每行末尾 `>`，而 Test34 源码声称已经取消；同时 `全部筛选` 与 `作者目录` 入口消失。说明此轮还存在运行时覆盖/层级问题，不能只按源码判断已经生效。
6. **搜索仍失败**：输入 `女友` 仍弹 `未知链接：error:返回的值无效 (JSEngine#13)`，Test34 `search34.js` 没有解决真正的首页输入回调路径。

### Test35 恢复策略
- **恢复基线明确改回 Test32**，不再加载 Test34 recovery。Test32 已由实机确认 browser-session 登录态可直接被“我的”识别，而且主评论仍存在。
- **本轮暂停更多回复优化**。不加载 `community34.js`，不覆盖 Test32 的 `P.comments()`；先恢复主评论，再单独处理楼中楼。
- `account35.js` 保留 Test32 的 `P.sessionProfile32()` / browser-session 统一，只重新覆盖账号业务解析。
- 账号/片库 selector 按当前上游 `1wc10086/Han1mePlus@main` 的真实实现收敛：
  - 头像：`/user/<id>/edit` 的 `img#playlist-avatar`，首页 fallback `#user-modal-dp-wrapper img` / `.profile-avatar-wrapper img`。
  - 收藏/稍后看/历史：`div[class^="user-tab-item-wrapper"]`。
  - 订阅影片：`.content-padding-new div[class^="video-item-container"]`。
  - 片单：`.user-tab-item-wrapper / .playlist-item-wrapper / .playlist-card`，必须同时取得真实 `list id + title` 才渲染。
  - 片单详情：`.playlist-video-list > div.user-tab-item-wrapper`。
- **禁止再把裸 `playlist?list=<id>` 扫描结果直接包装成“片单 <id>”用户卡片**；没有真实 title/cover 时宁可明确显示解析失败，也不能制造伪成功。
- `library35.js` 恢复完整产品入口：五个维度的真实选项直接横向展开，并显式恢复 `全部筛选 / 作者目录 / 清空筛选`。
- `search35.js` 重新覆盖首页搜索输入：只把关键词写入 `hanime2_search_q`，随后进入固定 `hiker://page/hanimeSearch?rule=&simple=true`；不再在输入回调里拼接编码 `q` URL。搜索页继续读取 MyVar。
- 作者目录继续复用 `creator34.js` 的三列方图 + 下方作者名/作品信息布局，不重写已经认可的 UI。

### 当前上游协议复核
当前 Han1mePlus `han1me_api.dart` 明确：
- 主评论必须从 `/loadComment` JSON `comments` 中取得 `#comment-start.children`，**每4个 DOM child 为一条主评论 group**，然后在 group 内找 `.comment-index-text` 与 `div[id^="reply-section-wrapper"]`。
- 楼中楼 `/loadReplies` 的 `div[id^="reply-start"]` children **每2个 DOM child 为一条回复**。
- 这进一步证明 Test34 把所有 `.comment-index-text` 全局两两配对不是等价实现。

### Test35 发布门禁
- `account35.js / library35.js / search35.js / recovery_loader.js` 已执行 `node --check`。
- `account35 / library35 / search35` 已做顶层加载 smoke；Recovery 显式检查 `HanimeCore / HanimeProvider / HanimePages / HanimeUI9 / HanimeLayout12`。
- Shell / Bootstrap / release / test metadata / app manifest / channels / registry / cloud manifest 全部锁定 Build20035。
- Stable `2.0.0 / Build20029` 完全不动。

### Test35 实机验收顺序
- [ ] 设置页显示 `2.0.0-test.35 · Build 20035`。
- [ ] **先看主评论**：必须恢复到 Test32 那种“评论本身能显示”的状态；更多回复暂不作为本轮通过条件。
- [ ] “我的”保持已登录，账号头像尝试恢复。
- [ ] 我的片单不再出现 `片单192779` 这类裸 ID 假卡片；应显示真实标题/封面/数量。
- [ ] 打开真实片单，影片卡能按 `.playlist-video-list` 解析，不再固定 0 部。
- [ ] 收藏 / 稍后看 / 订阅 / 历史逐项检查真实账号数据。
- [ ] 片库每个筛选维度可以直接横向滑动；页面同时能看到 `全部筛选 / 作者目录 / 清空筛选`。
- [ ] 首页搜索 `女友` 不再出现 JSEngine#13。
- [ ] 作者目录仍为三列方图，图片下方有作者名/作品信息。
- [ ] 推荐、播放、真选集、漫画链不得回归。

## 2026-08-22 20:03：Test33 实机结果 → Test34
用户实机截图确认 Test33 的真实结果：

### 已确认继续保留
- Test31 已通过的紧凑推荐页继续可用。
- Test31 已通过的播放器列表隔离继续可用，评论/片单/下载不会再混进真正播放列表。
- Test32 已解决 browser-session 登录态与“我的”入口错判未登录的问题；Test33 中仍能直接进入账号栏目。
- 作者目录三列方形图片网格的总体方向被用户接受。

### Test33 仍失败 / 本轮明确要求
1. **片库筛选交互仍不对**：五行结构方向可以，但用户明确不要点 `>` 再打开完整分类。完整类型/排序/日期/时长/标签应该直接在每一行横向滑动查看和选择。
2. **更多回复仍然 0 条**：Test33 的“评论作者 + 正文指纹 → 重新定位 thread id”实机仍失败。用户明确指出早期版本曾经正常，要求改回原来的方式。
3. **账号内容仍不完整**：Test33 只识别出一个片单；该片单卡显示 6 部，但点进去只解析出 1 部，实际明显更多；账号头像仍未正确显示。
4. **主搜索失败**：首页搜索 `女友` 出现 `未知链接：error:返回的值无效 (JSEngine#13)`，说明搜索结果返回链本身有错误，而不只是数据为空。
5. **作者目录 UI**：保留三列方图，但每张图下面必须补作者名称和作品数/辅助信息，不能只有图片。

## Test34 设计与实现

### 1. 更多回复：停止继续猜 thread，恢复早期直接 comment-id 链
历史 Test1 的原始工作契约非常简单：

```text
/loadComment?type=video&id=<videoId>
→ #comment-start
→ .comment-index-text 两节点一条评论
→ 同序号 div[id^=reply-section-wrapper]
→ 直接得到 comment/thread id
→ 点击评论直接传 id
→ /loadReplies?id=<commentId>
→ .comment-index-text 两节点一条回复
```

Test31/32/33 逐步加入首次重绑、absolute index、作者+正文指纹，但实机一直 0，说明继续堆启发式映射没有价值。Test34 `community34.js`：
- 重写 `P.comments()`，恢复直接读取 `reply-section-wrapper-*` 并把这个 id 绑定到对应主评论。
- `E.commentsPage` 点击评论只传 `c.id`，不再携带 videoId/index/fingerprint 做二次猜测。
- `P.replies()` 直接请求 `/loadReplies?id=<c.id>`。
- 回复正文恢复最初 `.comment-index-text` 两节点解析，同时保留 XPath 获取楼中楼头像。
- 不再缓存空回复。

**此方案是“恢复已知早期行为”，不是宣布已经修复；Test34 实机已经证伪，并且造成主评论 0 条，永久不作为恢复基线。**

### 2. 账号头像 / 片单 / 片单详情：XPath-first
当前上游 Han1mePlus 的账号契约继续作为参考：
- 片单页 `/user/<id>/playlists`
- 片单链接包含 `playlist?list=`
- 片单详情 `/playlist?list=<id>&sort=<sort>&page=<n>`
- 片单详情影片主要位于 `.playlist-video-list > div.user-tab-item-wrapper`
- 账号头像优先 `img#playlist-avatar`，首页还有 `#user-modal-dp-wrapper img` / `.profile-avatar-wrapper img`

Test33 证明单纯 CSS selector fallback 仍会少片单/少影片。因此 Test34 `account34.js` 曾尝试 XPath-first，但实机进一步证明其 raw href fallback 会制造裸 ID 假片单，已弃用。

### 3. 片库筛选：完整分类直接横向展示
Test34 `library34.js` 源码删除了 Test33 每行末尾的 `>`，但实机仍显示 `>` 且丢失完整筛选/作者入口。这说明“仓库源码看起来正确”不能替代运行时验证。

### 4. 搜索：重写结果返回链
Test34 `search34.js` 尝试直接 `setResult()`，但实机首页搜索仍报 `未知链接：error:返回的值无效 (JSEngine#13)`，已证伪。

### 5. 作者目录：三列图 + 三列文字
Test34 的作者目录视觉方向继续保留：三列 `pic_3_square` 后接三列 `text_3`，图片和文字都进入作者详情。

### 6. Test34 实机结论
- **失败 / quarantine**。不能作为 Test35+ 的 recovery base。
- 严重故障来自同时覆盖 Community / Account / Library / Search 多域，缺乏足够的设备级隔离验证。

## 关键已验证事实
- Test32：browser Cookie 登录态能直接被“我的”识别并显示账号栏目；主评论仍存在。
- Test31：推荐页紧凑布局实机可用；播放器列表只剩真实播放项。
- Test29：实机启动正常；首页/详情 SVG 图标正常。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；说明海阔 XPath DOM 路径在真实设备可用。
- Test17：上传者 `/user/<id>` 公开作品链实机通过。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析并直接播放。
- X5 网页登录 + Cookie bridge 可用。
- 漫画首页、漫画分类与详情基本链可用。
- 主评论 `/loadComment` 正文和头像在 Test32 及更早可用；Test34 的 0 条是回归，不是站点无评论。
- 官网预告页自身 HTTP 500，继续故障降级。

## 运行/发布事故与禁止回退
- Test18：同时重写评论数据和头像曾造成评论 0 条。
- Test19：全局收集评论图片按 index 回填不可靠。
- Test20：按 commentId/用户名固定字符邻域找图不可靠。
- Test21：自写轻量 HTML DOM parser 的合成 fixture 不能代表真实网页。
- Test25：只改 replies rows + 空结果缓存仍失败。
- Test27：JavaScript SyntaxError，永久 quarantine。
- Test28：顶层依赖不存在的 `HanimeUI11` 导致 ReferenceError，永久 quarantine。
- Test31：首次 commentId 重绑不足以修复更多回复。
- Test32：`videoId + absolute index` 二次定位仍失败，但 browser-session 账号识别与主评论状态是当前已验证恢复点。
- Test33：`作者 + 正文指纹` 二次定位仍失败；后续禁止继续无限叠加启发式 thread 映射。
- Test34：同时覆盖主评论/账号/筛选/搜索导致多域回归；永久 quarantine，不再作为下一版 recovery base。
- 禁止把 `P.profile()` 成功与 `C.activeAccount()` 非空视为天然等价；browser session 与 managed account 必须显式处理。
- 禁止把浏览器 CSS selector 能力直接等同于海阔 `pdfa/pdfh`；关键列表应分拆 selector，并尽量与上游实际 DOM 结构保持一致。
- 禁止在只解析到 raw identifier、没解析到真实标题/业务 wrapper 时制造用户可见“成功卡片”。
- 禁止把 GitHub 已发布新 Release 当成设备已运行新 Release；必须核对 Shell → Bootstrap → Remote Manager → Release → Runtime build。
- 禁止 Cloud manifest 广告 Build 高于实际 Shell/Bootstrap/minBuild/defaultRelease。
- 禁止新 JS 未做 Parse Gate + Load Smoke 就切活动 Test。

## 当前恢复链
```text
hanime1_remote_test_v4_b20035.txt
→ bootstrap_test_v4_b20035.js
→ Remote Manager id=hanime1-test
→ 2.0.0-test.35 release
→ Test35 recovery_loader
→ Test32 recovery_loader（实机已验证 browser-session + 主评论恢复点）
→ account35 / creator34 / library35 / search35
```

Test35 **不加载** `community34 / account34 / library34 / search34`。

Stable：
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Stable 2.0.0 / Build20029
→ immutable Test29 verified baseline
```

## 版本记录
- `2.0.0-test.35 / Build20035`：隔离 Test34；恢复到 Test32 运行基线；主评论不再覆盖；上游精确账号/片单 selector；恢复完整筛选/作者入口；修正首页搜索路由。
- `2.0.0-test.34 / Build20034`：多域回归版本；主评论 0、账号假片单/空详情、筛选入口丢失、搜索仍 JSEngine#13；永久隔离。
- `2.0.0-test.33 / Build20033`：指纹回复映射、selector-safe 片单、五行筛选、官网式作者 UI；实机证明回复/账号完整性/搜索仍失败。
- `2.0.0-test.32 / Build20032`：修复 browser-session 登录态；作者目录不再空白；absolute-index 回复尝试失败；当前 Test35 的恢复基线。
- `2.0.0-test.31 / Build20031`：推荐页、播放器列表隔离实机通过。
- `2.0.0 / Build20029`：用户确认 Test29 后晋级的正式兜底。
- `2.0.0-test.29 / Build20029`：修复 Test28 启动错误，实机启动和 SVG 图标通过。
- `2.0.0-test.27 / 28`：发布事故版本，永久隔离。
- `2.0.0-test.24 / Build20024`：Shell/Bootstrap 更新链恢复，真实头像实机出现。
- `2.0.0-test.23 / Build20023`：海阔 XPath 头像路径。
