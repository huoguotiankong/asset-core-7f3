# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.0` / Build `20029`。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt` / 规则 version `2026082235`。
- Stable Bootstrap：`apps/video/hanime1/bootstrap_stable_v5_b20029.js` / `minBuild=20029` / `defaultRelease=20029`。
- Stable 来源：用户实机确认可正常启动的 `2.0.0-test.29 / Build20029` 原样晋级，仅叠加 Stable 版本/维护设置；Stable/Test Remote Manager 状态独立。
- Test：`2.0.0-test.32` / Build `20032`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20032.txt` / 规则 version `2026082238`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20032.js` / `minBuild=20032` / `defaultRelease=20032`。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1`：仅保留 `hanime1.txt` 历史文件，不再作为活动通道。
- **Test27、Test28 为 broken/quarantined，不允许作为当前 UI recovery base。**

## 2026-08-22 19:07：Test31 实机结果 → Test32
用户实机截图与测试确认 Test31 的真实结果：

### 已通过
- 推荐页已经从超大 blur Hero 改为紧凑“精选推荐 + 内容网格”，用户明确表示首页可以了。
- 海阔播放器的“播放列表”不再混入评论、加入片单、下载原片；当前只显示真实播放项，播放器列表污染问题通过。
- 片库已删除“公开片库”标题与说明，方向正确。

### 仍失败 / 需要继续优化
- 片库筛选仍是 5 条独立横向行 + 操作行，首屏占用仍偏大，希望更紧凑、美观。
- 点击明明显示有回复的主评论，回复页仍出现 `共0条回复 / 暂未取得回复`。
- 用户已经在网页登录成功，登录页能够显示账号资料，但首页“我的”仍显示“登录 Hanime1”，收藏、片单、稍后看、订阅、历史无法直接查看。
- 进入账号信息页也没有现代片库栏目。
- 作者目录/作者分类仍没有有效内容。

### 根因 1：Browser Session 与 Managed Account 被错误当成同一状态
当前 `HanimeCore.activeAccount()` 只读取持久化的 managed saved account：

```text
hanime2_accounts
+ hanime2_active_account
```

而网页登录/Test12 Cookie bridge 可以让 `P.profile()` 正常读取真实账号，却会处于 browser mode；`useBrowserSession()` 还会清掉 active account ID。因此出现：

```text
P.profile() = 已登录、能看到用户信息
C.activeAccount() = null
```

Test30/31 的“我的”、详情登录态和部分账号逻辑却使用 `C.activeAccount()` 判断，所以实机出现“登录页明明已登录，我的却要求重新登录”。

### Test32 账号修复
新增 `account32.js`：
- 保留 managed account 优先。
- browser mode 下，如果存在浏览器 Cookie 且 `P.profile()` 能获取账号，则生成 browser-session profile，统一作为当前有效账号。
- `C.activeAccount()` 在 managed account 为空时回退 browser-session profile。
- `P.librarySection30()` 改为从当前真实登录会话读取 `/user/<id>/saves`、`likes`、`playlists`、`histories`、`subscriptions`。
- “我的”因此继续复用 Test30 五栏目，但不再要求用户先额外“保存账号”。
- `E.accountPage` 重写为：账号资料 + `片单 / 收藏 / 稍后看 / 订阅 / 历史` + 资料修改；浏览器会话可选“保存当前登录”，但不是查看片库的前置条件。

### 根因 2：作者目录依赖了已经被覆盖掉的 artists 数据
当前运行链里 Test8 重写了 `P.search()`，其返回值固定为：

```js
{ items:list, artists:[], page:..., totalPages:... }
```

后来的 `creator28.js` 又使用：

```js
P.search({query:q,type:'artist'}).artists
```

因此作者目录关键词搜索天然会得到空数组。这不是 UI 问题，而是 Provider 契约已经被前序版本覆盖。

### Test32 作者目录修复
新增 `creator32.js`，不再只依赖 `r.artists`：
1. 有关键词时先尝试现有 direct artist parser。
2. 直接请求 `/search?query=<q>&type=artist`，解析 `.search-artist-card`。
3. selector 失败时使用局部原始 HTML fallback。
4. 仍无作者卡时，从普通影片搜索结果中按 `item.artist` 去重生成作者入口。
5. 无关键词时展示“最近查看作者 + 首页真实影片作者”去重结果，使作者目录不再天然空白。

### 更多回复：Test31 证明“页面初次绑定 ID”仍不可靠
Test31 已按 `#comment-start` 4 节点组重新绑定 `reply-section-wrapper-*`，但实机仍然 0 条，说明不能继续假设首次评论列表里的 `c.id` 一定与点击时所需线程一致。

Test32 改为**点击时重新定位线程**：

```text
评论页
→ 每个回复入口同时传 videoId + 评论绝对 index + 原 fallback id
→ 回复页重新请求 /loadComment
→ 全局提取 reply-section-wrapper-* ID 序列
→ 按 videoId + absolute index 重新得到真实 thread id
→ /loadReplies?id=<resolvedId>
→ 若为空且 resolvedId != fallback，再尝试 fallback id
```

- ID 映射只缓存非空结果 120 秒。
- 回复正文仍沿用 Test30 单请求解析；空回复不缓存。
- 空结果页面提供“重新定位并重试”，会清除映射并重新取得 `/loadComment`。
- 这轮仍需实机确认，未把“更多回复已修复”写成已验证事实。

### 片库筛选压缩
Test32 `library_ui32.js` 从 5 条完整筛选行改为 2 条横向操作带：

```text
第 1 条：类型·当前 | 全部 | 里番 | 泡面番 | Motion | 3D | ›
第 2 条：排序·当前 | 日期·当前 | 时长·当前 | 标签·当前 | 全部筛选 | 清空
```

完整选项继续通过原生 `select://` / 完整筛选页打开，减少首屏高度但不删除能力。

## 2026-08-22 18:17：Test29 实机闭环并晋级 Stable 2.0.0
用户实机确认 Test29：
- 可正常启动，不再出现 Test27 SyntaxError / Test28 `HanimeUI11` ReferenceError。
- 首页五个 SVG 导航图标正常。
- 视频详情播放/评论/加入片单/下载 SVG 图标正常。
- 视频详情封面、作者/上传者头像、主评论头像、播放主链仍正常。

同时实机暴露：
- 片库“公开片库”说明占屏。
- 更多回复仍空。
- 播放器列表混入功能按钮。
- 推荐 Hero 过大。
- 账号片单详情只有 `影片<ID>` 占位。

用户明确要求先把当前 Test29 作为正式版兜底，因此发布 Stable `2.0.0 / Build20029`：
- Stable Release 复用 immutable Test29 runtime/recovery。
- Stable 使用独立 Shell v5 / Bootstrap / Remote Manager id。
- 后续所有功能修复只进入 Test，Stable 不随未验证代码变化。

## Test30 / Test31 关键改动与结论
### 播放器列表污染
海阔会把连续同类组件识别为连续选集/播放列表。Test29 将播放、评论、片单、下载全部做成连续 `icon_4`，实机因此被自动分组。

Test30/31 改为：
- 播放：独立 `text_icon`。
- 评论/片单/下载：`icon_small_3`。
- 真正选集：`scroll_button` + `extra.cls='playlist hanime-episodes'`。

**Test31 实机已验证此问题修复。**

### 推荐页
Test30/31 将超大 `movie_1_vertical_pic_blur` 焦点位改成紧凑 `movie_1_left_pic` 精选卡，下方继续官网真实分区。

**Test31 实机已验证该方向可用。**

### 账号片单解析契约
对齐当前 Han1mePlus：
- 用户片单卡：`.user-tab-item-wrapper, .playlist-item-wrapper, .playlist-card`。
- 片单链接：`a.video-link` 或 `a[href*="playlist?list="]`。
- 标题：`.title, .playlist-title`。
- 封面：`img.main-thumb, img`。
- 片单详情影片：`.playlist-video-list > div.user-tab-item-wrapper`。
- 影片链接：`a[href*="watch"]` / `[data-href]`。
- 影片标题：`.video-title`；封面：`img.main-thumb`。

Test31 只解决 selector 风险，但实机暴露真正阻断点是 browser-session 登录态没有进入 `activeAccount()`，因此 Test32 从 Auth State 层修复，而不是继续只改列表 selector。

## 运行/交付事故历史
### Test24：代码已发布 ≠ 手机已运行
旧设置页更新按钮曾报 `HanimeBoot 未定义`；从规则仓库覆盖 Shell v4 后真实头像立即恢复。

长期规则：连续出现“代码改了但实机完全没变化”，先核对：

```text
Shell
→ Bootstrap
→ Remote Manager active release
→ Runtime build
```

专项：`docs/INCIDENT_REMOTE_RELEASE_NOT_APPLIED_20260822.md`。

### Test26：云端仓库广告 Build 与安装工件脱节
云端仓库显示 Test26，但重新导入仍运行 Test24。固定门禁：

```text
advertised build
== release build
== installerBuild
<= bootstrap minBuild
<= bootstrap defaultRelease.build
```

工具：`tools/remote_installer_guard.py`。

### Test27：发布 JS SyntaxError
`patch_experience27.js` 少右括号，设备启动直接 SyntaxError。Test27 永久 quarantine。

工具：`tools/js_syntax_guard.py`。专项：`docs/INCIDENT_JS_SYNTAX_RELEASE_20260822.md`。

### Test28：运行全局依赖错误
Test28 语法检查通过，但 UI 顶层引用不存在的 `HanimeUI11`，实机 ReferenceError。Test28 错误 UI 永久 quarantine。

结论：`node --check` 通过不等于模块可加载；发布还必须做 Load Smoke。

工具：`tools/js_runtime_smoke_guard.py`。专项：`docs/INCIDENT_JS_RUNTIME_GLOBAL_DEPENDENCY_20260822.md`。

## 已验证功能事实
- Test31：推荐页紧凑布局实机可用；播放器列表只剩真实播放项，不再混入评论/片单/下载。
- Test29：实机启动正常；首页五导航 SVG、详情操作 SVG 正常显示。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；Shell v4 交付链有效。
- Test26 build-lock：实机明确显示对应 Build，证明 build-locked 云端导入链有效。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析并直接播放。
- X5 网页登录 + Cookie bridge 可用。
- 公开片库资源无需登录可浏览。
- 漫画首页、漫画分类与详情基本链可用。
- 主评论 `/loadComment` 正文和头像可用。
- 官网预告页当前自身 HTTP 500，继续故障降级。

## 已证伪 / 禁止回退
- Test18：同时重写评论数据和头像，曾造成评论 0 条。
- Test19：全局收集主评论图片按 index 回填，不可靠。
- Test20：commentId/用户名固定字符邻域找图，不可靠。
- Test21：自写轻量 HTML DOM parser 的合成 fixture 不能代表真实页面。
- Test22：诊断层当时未可靠进入设备。
- Test25：只改 replies rows + 空结果缓存，仍回归。
- Test26：第二套作者 parser 实机不可用，不能单独作为作者目录唯一数据源。
- Test27：启动期 JavaScript SyntaxError，永久隔离。
- Test28：顶层 `HanimeUI11` ReferenceError，永久隔离错误 UI 模块。
- Test31：只在首次评论解析阶段重绑 commentId 仍不足以修复更多回复；后续必须保留点击时可重新定位线程的能力。
- 禁止把 `P.profile()` 成功和 `C.activeAccount()` 非空视为天然等价；browser session 与 managed account 必须显式统一或分别处理。
- 禁止把 GitHub 新 Release 当成手机已运行新 Release。
- 禁止 Cloud Repo 广告 Build 高于实际 Shell/Bootstrap 基线。
- 禁止新 JS 未做 Parse Gate + Load Smoke 就切活动通道。
- 禁止按文件版本号/文件名猜运行全局对象名。

## 当前恢复链
### Stable 2.0.0
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Remote Manager id=hanime1
→ Stable 2.0.0 release
→ immutable Test29 recovery
→ Test26 → Test25 → Test24 → Test23 → Test17/Test12 稳定链
→ Test29 safe replies/creator/ui/settings
→ Stable settings overlay
```

### Test32
```text
hanime1_remote_test_v4_b20032.txt
→ bootstrap_test_v4_b20032.js
→ Remote Manager id=hanime1-test
→ Test32 release
→ Test32 recovery_loader
→ Test31 → Test30 → Stable 2.0.0 recovery
→ account32.js
→ community32.js
→ creator32.js
→ library_ui32.js
→ settings32.js
```

## Test32 实机验收
- [ ] 设置明确显示 `2.0.0-test.32 · Build20032 · Shell v4`。
- [ ] 片库筛选从多行压缩为两条横向操作带，首屏明显更紧凑；完整筛选仍可打开。
- [ ] 已网页登录账号直接进入“我的”即可看到账号头像和 `片单 / 收藏 / 稍后看 / 订阅 / 历史`，不再要求重复登录。
- [ ] 账号中心同样显示五个账号栏目，同时保留资料修改入口。
- [ ] 收藏、稍后看、片单、历史至少任选两栏能加载真实内容；空栏目显示产品化空状态而不是误判未登录。
- [ ] 对同一条实机已显示“查看 X 条回复”的评论再次打开，能取得真实回复；若仍空，点“重新定位并重试”后再观察。
- [ ] 主评论正文和头像不退化。
- [ ] 作者目录无关键词时至少能显示最近作者/首页作者；输入明确作者名能返回作者结果或影片作者 fallback。
- [ ] 作者主页作品列表可打开。
- [ ] Test31 已通过的推荐页、播放器列表、播放、真选集、头像、漫画无回归。
- [ ] Stable 2.0.0 / Build20029 仍可独立覆盖恢复。

## 后续路线
1. 先完成 Test32 实机闭环；回复、登录态、作者目录中任何一项仍失败就继续在 Test 修，不动 Stable。
2. 评论社区增强：点赞数、点赞/点踩状态与动作、举报；优先对齐当前 Han1mePlus `voteComment/reportComment`。
3. 作者订阅状态/订阅动作与账号中心联动。
4. 账号中心继续完善删除历史、片单编辑/移除影片等管理动作。
5. 主要能力稳定后做 Consolidated Candidate，压缩 Test15～32 历史增量链。

---
## 版本记录
### 2.0.0-test.32 / Build20032 / 2026-08-22
- 根据 Test31 实机结果继续升级。
- 保留 Test31 已验证的推荐页与播放器列表修复。
- 片库筛选压成两条横向操作带。
- 修复 browser Cookie 登录存在但 `activeAccount()` 为空导致的“我的/账号中心”误判未登录。
- 账号中心恢复片单/收藏/稍后看/订阅/历史栏目。
- 回复入口携带 videoId + absolute comment index；回复页点击时重新定位真实 reply thread。
- 作者目录不再依赖空 `artists` 字段，增加 direct artist / homepage / video fallback。
- Stable 2.0.0 / Build20029 不变。

### 2.0.0-test.31 / Build20031 / 2026-08-22
- 继承 Test30；加固 reply-section-wrapper ID 与 `playlist?list=` selector。
- 实机确认推荐页与播放器列表修复通过。
- 实机确认更多回复、账号登录态、作者目录仍需继续修。

### 2.0.0-test.30 / Build20030 / 2026-08-22
- 基于 Stable 2.0.0：片库减负、主评论/回复重构、播放器列表隔离、推荐首屏压缩、账号片单重写。
- 未独立作为长期活动 Test，由 Test31 接续。

### 2.0.0 / Build20029 / 2026-08-22
- 按用户要求将实机可启动 Test29 晋级为正式兜底。
- Stable 使用独立 Shell v5 / Bootstrap / Remote Manager id。

### 2.0.0-test.29 / Build20029
- 修复 Test28 启动 ReferenceError；实机启动、SVG 图标正常。

### 2.0.0-test.28 / Build20028
- 顶层错误依赖 `HanimeUI11`，实机 ReferenceError；已隔离。

### 2.0.0-test.27 / Build20027
- JavaScript 括号语法错误导致启动失败；已隔离。

### 2.0.0-test.26 / Build20026
- 创作者中心、详情主操作、搜索/筛选作者入口、设置分层；形成 build-lock 交付教训。

### 2.0.0-test.25 / Build20025
- 取消头像诊断；楼中楼单请求 + 短缓存尝试。

### 2.0.0-test.24 / Build20024
- Shell v4 + Bootstrap v4 修复更新链；用户实机确认真实头像出现。

### 2.0.0-test.23 / Build20023
- 使用海阔 XPath 头像方案；后由 Test24 真正送达设备并验证。

### 2.0.0-test.17 / Build20017
- 上传者 `/user/<id>` 公共作品链实机通过。

### 2.0.0-test.12 / Build20012
- X5 Cookie bridge 登录、页面布局设置可用。

### 2.0.0-test.11 / Build20011
- 真选集、时长格式化、评论去重。

### 2.0.0-test.6 / Build20006
- WebView 验证/登录、封面、最高画质播放、漫画首页通过实机。
