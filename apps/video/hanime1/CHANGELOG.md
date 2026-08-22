# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.0` / Build `20029`，由 Test29 实机可启动基线晋级，继续冻结为独立兜底。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt`；Bootstrap：`bootstrap_stable_v5_b20029.js`。
- Test：`2.0.0-test.38` / Build `20038`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20038.txt` / 规则 version `2026082244`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20038.js` / `minBuild=20038` / `defaultRelease=20038`。
- Test recovery base：`2.0.0-test.37`；Test37 本身恢复自 Test32。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1` 仅保留历史文件 `hanime1.txt`。
- Test27 / Test28 / Test34 为 broken/quarantined，不允许作为恢复基线。

## 2026-08-22 21:05：Test37 实机结果 → Test38

### Test37 已确认恢复
用户实机截图确认：
- **主评论恢复**：Test34 的 `0 条评论` 回归已消失，说明回到 Test32 评论主链是正确的。
- **片单列表从假卡恢复为真实卡**：能显示真实片单标题“泡面番”、真实封面和“6部影片”，不再出现 `片单192779` 这类裸 ID 伪业务卡。
- **片库入口恢复**：页面重新出现 `全部筛选 / 作者目录 / 清空筛选`。
- browser-session 登录态继续能被“我的”识别。

### Test37 仍失败
1. **搜索仍失败**：输入 `女友` 仍弹 `未知链接：error:返回的值无效 (JSEngine#13)`。
2. **更多回复仍为 0**：例如原评论显示 12 条回复，打开后仍 `共0条回复`。
3. **账号头像仍未恢复真实图片**。
4. **片单详情仍解析 0 部**：列表卡已正确显示该片单有 6 部，但进入片单详情后 `影片 0部`。
5. 收藏 / 稍后看 / 订阅 / 历史仍需继续逐项实机确认。

## Test38 设计与实现

### 1. 更多回复：恢复 Test24 已实机工作协议，并只优化请求方式
历史事实非常关键：Test24 期间用户已经确认作者/评论头像出现，随后明确反馈“评论打开更多回复速度比较慢”，说明当时 **更多回复正文链本身是能工作的**。Test24 实际继承 Test12/Test1 的原始协议：

```text
主评论 c.id
→ /loadReplies?id=<commentId>
→ JSON.replies
→ .comment-index-text 两节点一条回复
```

之后 Test31/32/33 为了修复性能/映射问题逐步加入 commentId 重绑、absolute index、作者+正文指纹，最终实机全部回到 0 条。

同时 Test23 头像层的 `P.replies()` 会：

```text
oldReplies(commentId)       # 第一次请求 /loadReplies 解析正文
→ 再次 GET /loadReplies     # 第二次请求同一接口，只为 XPath 取头像
```

这解释了“当时能看但打开更多回复比较慢”的一个直接性能来源。

Test38 `community38.js` 因此不再重新猜 thread：
- 保留 Test37 已恢复的主评论 `P.comments()`，不动主评论。
- `E.repliesPage` 直接使用评论卡已经携带的 `c.id`。
- `P.replies(commentId)` 单次请求 `/loadReplies?id=<commentId>`，同一响应同时解析回复正文和头像。
- 仅对**非空回复**做 30 秒短缓存；空结果不缓存。
- 发布回复后主动清当前 thread 缓存。

目标不是发明新协议，而是恢复“已实机工作过的身份映射”，只在同一协议内部消除重复网络请求。

### 2. 搜索：彻底取消 input 回调导航
Test36/37 虽然不再动态拼接 query URL，但 input 回调仍然返回 `hiker://page/hanimeSearch...`，实机继续 JSEngine#13，说明问题并不只在 URL 参数拼接，而是这条 **input 回调 → 返回导航 URL** 路径本身不可靠。

Test38 `search38.js`：
- 首页输入后只做 `putMyVar + refreshPage(false) + hiker://empty`。
- 首页直接在当前页面渲染首屏真实搜索结果。
- 提供 `完整搜索结果 / 同名作者 / 清除搜索` 三个正常静态路由按钮。
- 独立搜索页同样只刷新当前页，不让 input 回调承担导航。
- Shell `searchFind` 继续直接 `setResult()`。

这样搜索数据和导航彻底解耦，目标是消除 `JSEngine#13` 的返回值风险。

### 3. 账号头像：权威重探而不是“旧 avatar 为空才探”
Test37 `account37.js` 只有旧 `P.profile()` 没有 avatar 时才补取。实机仍显示占位，说明旧 profile 可能携带了无效/占位 avatar，导致补取路径没有真正接管。

Test38：
- profile cache 45 秒。
- 缓存过期后无论旧 avatar 是否非空，都重新从 `/user/<id>/edit` 与首页权威 DOM 探测。
- XPath 优先：`#playlist-avatar`、`#user-modal-dp-wrapper`、`profile-avatar-wrapper`；CSS 仅作 fallback。
- 新增“刷新账号资料”动作，可主动清 profile/session cache 后重取。

### 4. 片单详情：DOM 解析失败时增加 raw HTML watch 链
Test37 已证明片单元数据真实存在：标题/封面/数量 6 都能取到，但 `.playlist-video-list` 在海阔 `pdfa` 下返回 0。

Test38 不再把“DOM selector 为空”当成页面没有影片：
- 先走 `.playlist-video-list > div.user-tab-item-wrapper` 与 descendant selector。
- 若仍为空，从 `playlist-video-list` 附近原始 HTML 直接扫描 `watch?v=<id>` / `data-href`，再回填标题、封面、作者、时长。
- 读取分页，最多合并 12 页，按 video id 去重。
- 收藏 / 稍后看 / 订阅 / 历史同样在 DOM selector 为空时使用 raw watch 链兜底。
- 片单详情新增 `官网片单`，即使海阔 parser 仍未完全兼容也保留可用 fallback。

### 5. “我的”账号信息架构继续优化
Test37 横向 `scroll_button` 会把历史/后续入口挤到右侧。Test38 改成两行三列原生按钮：

```text
片单 | 收藏 | 稍后看
订阅 | 历史 | 账号中心
```

全部入口首屏可见，不再依赖横向末尾提示。

账号中心继续保留：
- 修改昵称。
- 修改邮箱。
- 修改密码。
- 刷新账号资料。
- 官网账号页面。
- 重新登录。
- 同步当前网页登录。

### 6. 发布门禁
- `community38.js / account38.js / search38.js / settings38.js / recovery_loader.js / bootstrap_test_v4_b20038.js` 已在本地执行 `node --check`，全部通过。
- `release.json` 已过 JSON parse。
- Shell 规则 version=`2026082244`，Bootstrap/minBuild/defaultRelease/release/test metadata 全部锁定 Build20038。
- Stable `2.0.0 / Build20029` 完全不动。

## Test38 实机验收顺序
- [ ] 设置页显示 `2.0.0-test.38 · Build 20038 · Shell v4`。
- [ ] 首页输入 `女友` 后**留在当前页直接刷新搜索结果**，不再出现 JSEngine#13。
- [ ] 点击 `完整搜索结果` 后独立搜索页能继续分页。
- [ ] 主评论仍存在，不能因为修更多回复再次回归为 0。
- [ ] 打开一条明确显示 12 条回复的主评论，能直接取得真实回复；再次打开同一 thread 应明显更快。
- [ ] “我的”顶部真实账号头像恢复；若没有，点“账号中心 → 刷新账号资料”后再看。
- [ ] “我的”六个入口两行三列全部可见。
- [ ] “泡面番”片单详情能解析出真实影片；若仍不足 6 部，记录实际解析数量。
- [ ] 收藏 / 稍后看 / 订阅 / 历史逐项核对真实账号数据。
- [ ] `全部筛选 / 作者目录 / 清空筛选` 继续存在，推荐/播放/真选集/漫画链不回归。

## 关键已验证事实
- Test37：主评论恢复；真实片单标题/封面/数量恢复；完整筛选与作者目录入口恢复；搜索/更多回复/头像/片单详情仍失败。
- Test32：browser Cookie 登录态能直接被“我的”识别；主评论仍存在。
- Test31：推荐页紧凑布局实机可用；播放器列表只剩真实播放项。
- Test29：实机启动正常；首页/详情 SVG 图标正常。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；**更多回复当时可打开但偏慢**，因此是当前恢复更多回复的最后已知工作协议基线。
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
- Test25：在已经工作链上改 replies rows/缓存后更多回复开始失效；以后优化已工作的协议时必须先保持 identity mapping 不变。
- Test27：JavaScript SyntaxError，永久 quarantine。
- Test28：顶层 `HanimeUI11` ReferenceError，永久 quarantine。
- Test31：首次 commentId 重绑不足以修复更多回复。
- Test32：`videoId + absolute index` 二次定位仍失败。
- Test33：`作者 + 正文指纹` thread 二次定位仍失败；禁止继续无限叠加启发式 reply 映射。
- Test34：同时覆盖 Community / Account / Library / Search 导致多域回归；永久 quarantine。
- **已工作的评论/回复 identity mapping 不允许为了“优化”而重写；先优化重复请求、缓存和渲染，再考虑协议变化。**
- 禁止把浏览器 CSS selector 能力直接等同于海阔 `pdfa/pdfh`；结构存在但 selector 为空时应有 XPath/raw fallback。
- 禁止只解析到 raw identifier 就制造用户可见业务卡片。
- 禁止“仓库源码显示已覆盖”就认定设备运行时已经执行；截图冲突时先查 Shell / Bootstrap / Remote state / cache / load order。
- 禁止 GitHub 新 Release 当成手机已运行新 Release。
- 禁止 Cloud manifest 广告 Build 高于实际 Shell/Bootstrap/minBuild/defaultRelease。
- 禁止新 JS 未做 Parse Gate 就切活动 Test。

## 当前恢复链
```text
hanime1_remote_test_v4_b20038.txt
→ bootstrap_test_v4_b20038.js
→ Remote Manager id=hanime1-test
→ 2.0.0-test.38 release
→ Test38 recovery_loader
→ Test37 recovery_loader（Test37 实机部分恢复）
   → Test32 recovery_loader（browser-session + 主评论恢复点）
   → account37 / creator37 / library37 / search37 / settings37
→ community38（只覆盖 replies，不覆盖 comments）
→ account38
→ search38
→ settings38
```

Stable：
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Stable 2.0.0 / Build20029
→ immutable Test29 verified baseline
```

## 版本记录
- `2.0.0-test.38 / Build20038`：Test37 实机续修；直接回复单请求、原页安全搜索、权威头像重探、账号 raw fallback、片单分页合并、账号两行导航。
- `2.0.0-test.37 / Build20037`：自包含恢复；实机确认主评论、真实片单卡、完整筛选/作者入口恢复，但搜索/回复/头像/片单详情仍失败。
- `2.0.0-test.36 / Build20036`：Test34 多域回归后的预恢复候选；随后整理为 Test37 自包含版本。
- `2.0.0-test.35 / Build20035`：内部预检 build，未作为用户验收版本。
- `2.0.0-test.34 / Build20034`：实机多域回归，永久隔离。
- `2.0.0-test.33 / Build20033`：指纹 reply 映射仍失败。
- `2.0.0-test.32 / Build20032`：browser-session 登录态修复；主评论正常；当前深层恢复点。
- `2.0.0-test.31 / Build20031`：推荐页、播放器列表隔离实机通过。
- `2.0.0 / Build20029`：正式兜底。
- `2.0.0-test.24 / Build20024`：真实头像出现；更多回复可打开但偏慢，是 reply 协议最后已知工作基线。
- `2.0.0-test.23 / Build20023`：海阔 XPath 头像层。
