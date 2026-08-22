# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.0` / Build `20029`，由用户实机确认可启动、头像/播放/主 UI 正常的 Test29 晋级，继续冻结为独立兜底。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt`，Bootstrap：`bootstrap_stable_v5_b20029.js`。
- Test：`2.0.0-test.34` / Build `20034`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20034.txt` / 规则 version `2026082240`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20034.js` / `minBuild=20034` / `defaultRelease=20034`。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1` 仅保留历史文件 `hanime1.txt`。
- Test27 / Test28 为 broken/quarantined，不允许再作为 UI 恢复基线。

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

**此方案是“恢复已知早期行为”，不是宣布已经修复；仍需 Test34 实机确认。**

### 2. 账号头像 / 片单 / 片单详情：XPath-first
当前上游 Han1mePlus 的账号契约继续作为参考：
- 片单页 `/user/<id>/playlists`
- 片单链接包含 `playlist?list=`
- 片单详情 `/playlist?list=<id>&sort=<sort>&page=<n>`
- 片单详情影片主要位于 `.playlist-video-list > div.user-tab-item-wrapper`
- 账号头像优先 `img#playlist-avatar`，首页还有 `#user-modal-dp-wrapper img` / `.profile-avatar-wrapper img`

Test33 证明单纯 CSS selector fallback 仍会少片单/少影片。因此 Test34 `account34.js`：
- `P.profile()` 在旧资料没有头像时，依次从 edit 页 `#playlist-avatar`、profile-avatar 类、首页 user-modal/profile-avatar-wrapper 用 XPath 补头像。
- 片单列表优先 XPath 扫描所有包含 `playlist?list=` 的真实节点和链接，按 list id 去重。
- 片单详情改为 XPath 解析 watch 链接；若有分页则自动从第 1 页继续合并，最多 12 页并按 video id 去重。
- 收藏、稍后看、订阅、历史也改为 XPath-first 视频卡解析。
- 保留 Test32 已验证的 browser-session 登录态修复，不再要求重新登录。

### 3. 片库筛选：完整分类直接横向展示
Test34 `library34.js` 删除 Test33 每行末尾的 `>` 完整分类入口：
- `类型 / 排序 / 日期 / 时长 / 标签` 仍保持五行紧凑结构。
- 每个维度读取当前真实 catalog 的完整选项并直接输出 `scroll_button`。
- 超出屏幕宽度时由该行横向滑动，不再弹第二层选择框。
- 选择后直接刷新当前片库。
- 只保留一个“清空筛选”动作。

### 4. 搜索：重写结果返回链
Test33 实机报 `未知链接：error:返回的值无效 (JSEngine#13)`，说明 Shell Search/页面 Search 有返回值落入非法 URL 的风险。Test34 `search34.js`：
- `E.searchPage` 与 `E.shellSearch` 都直接执行搜索并 `setResult()`。
- 影片结果统一使用现有 `HanimeLayout12.video()` 生成有效详情路由。
- 分页显式使用 `H.route('hanimeSearch', ...)`。
- 输入框只返回 `hiker://empty` 并原页刷新，不再把异常字符串当成可导航 URL。

### 5. 作者目录：三列图 + 三列文字
Test34 保留用户认可的官网式三列方图：
- 每三个作者先输出一行 `pic_3_square`。
- 紧接着输出一行三个 `text_3`，分别显示作者名与作品数量/“查看作品”。
- 点击图片和文字都进入同一个作者详情页。
- 关键词作者搜索继续直接请求 `type=artist` 页面，并使用 XPath 解析作者卡图片/名称/数量。
- 图片缺失时使用 Hanime1 官方 SVG 兜底，避免出现大面积纯空方块。

### 6. 发布门禁
- `community34.js / account34.js / creator34.js / library34.js / search34.js / settings34.js / recovery_loader.js` 本地均已执行 `node --check`，通过后才发布。
- Recovery 以 Test33 为基线，加载后显式检查 `HanimeCore / HanimeProvider / HanimePages / HanimeUI9 / HanimeLayout12`。
- Shell / Bootstrap / release / test metadata / app manifest / cloud manifest 全部锁定 Build20034。
- Stable `2.0.0 / Build20029` 完全不动。

## Test34 实机验收
- [ ] 设置页明确显示 `2.0.0-test.34 · Build 20034 · Shell v4`。
- [ ] 五行筛选中不再出现 `>`；每一行可以直接横向滑动看到该维度完整选项。
- [ ] 主搜索输入 `女友` 等关键词能直接出现影片结果，不再弹 `未知链接 / JSEngine#13`。
- [ ] “我的”顶部账号头像恢复；账号仍保持已登录状态，不要求重复登录。
- [ ] “我的片单”能显示真实多个片单，而不是只剩一个。
- [ ] 打开一个已知包含多部影片的片单，能加载真实多部影片；若有分页应合并显示。
- [ ] 打开一条明确显示有回复的主评论，更多回复能通过原始直接 comment-id 链取得；若仍为 0，后续应抓取该条真实 `/loadComment` 与 `/loadReplies` 响应，不再继续做 thread 猜测。
- [ ] 作者目录继续三列方图，并且每张图片下方可见作者名和作品信息。
- [ ] 作者与上传者详情页、推荐页、播放列表、播放、真选集、主评论头像、漫画链不回归。
- [ ] Stable 2.0.0 / Build20029 仍可独立覆盖恢复。

## 关键已验证事实
- Test32：browser Cookie 登录态能直接被“我的”识别并显示账号栏目。
- Test31：推荐页紧凑布局实机可用；播放器列表只剩真实播放项。
- Test29：实机启动正常；首页/详情 SVG 图标正常。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；说明海阔 XPath DOM 路径在真实设备可用。
- Test17：上传者 `/user/<id>` 公开作品链实机通过。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析并直接播放。
- X5 网页登录 + Cookie bridge 可用。
- 漫画首页、漫画分类与详情基本链可用。
- 主评论 `/loadComment` 正文和头像可用。
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
- Test32：`videoId + absolute index` 二次定位仍失败。
- Test33：`作者 + 正文指纹` 二次定位仍失败；后续禁止继续无限叠加启发式 thread 映射。用户要求“改回原来”，优先恢复已知早期直接协议链。
- 禁止把 `P.profile()` 成功与 `C.activeAccount()` 非空视为天然等价；browser session 与 managed account 必须显式处理。
- 禁止把浏览器 CSS selector 能力直接等同于海阔 `pdfa/pdfh`；关键列表必须提供 XPath 或分拆 selector fallback。
- 禁止把 GitHub 已发布新 Release 当成设备已运行新 Release；必须核对 Shell → Bootstrap → Remote Manager → Release → Runtime build。
- 禁止 Cloud manifest 广告 Build 高于实际 Shell/Bootstrap/minBuild/defaultRelease。
- 禁止新 JS 未做 Parse Gate + Load Smoke 就切活动 Test。

## 当前恢复链
```text
hanime1_remote_test_v4_b20034.txt
→ bootstrap_test_v4_b20034.js
→ Remote Manager id=hanime1-test
→ 2.0.0-test.34 release
→ Test34 recovery_loader
→ Test33 recovery
→ community34 / account34 / creator34 / library34 / search34 / settings34
```

Stable：
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Stable 2.0.0 / Build20029
→ immutable Test29 verified baseline
```

## 版本记录
- `2.0.0-test.34 / Build20034`：恢复原始直接回复链；XPath-first 账号/片单；完整横向筛选；搜索返回链修复；作者图下文字。
- `2.0.0-test.33 / Build20033`：指纹回复映射、selector-safe 片单、五行筛选、官网式作者 UI；实机证明回复/账号完整性/搜索仍失败。
- `2.0.0-test.32 / Build20032`：修复 browser-session 登录态；作者目录不再空白；absolute-index 回复尝试失败。
- `2.0.0-test.31 / Build20031`：推荐页、播放器列表隔离实机通过。
- `2.0.0 / Build20029`：用户确认 Test29 后晋级的正式兜底。
- `2.0.0-test.29 / Build20029`：修复 Test28 启动错误，实机启动和 SVG 图标通过。
- `2.0.0-test.27 / 28`：发布事故版本，永久隔离。
- `2.0.0-test.24 / Build20024`：Shell/Bootstrap 更新链恢复，真实头像实机出现。
- `2.0.0-test.23 / Build20023`：海阔 XPath 头像路径。
- `2.0.0-test.17 / Build20017`：上传者公开作品链实机通过。
- `2.0.0-test.12 / Build20012`：X5 Cookie bridge 登录可用。
- `2.0.0-test.11 / Build20011`：真选集、时长格式化、评论去重。
- `2.0.0-test.1`：最初 Remote Provider/UI；其 direct comment id → `/loadReplies` 是 Test34 回复恢复依据。
