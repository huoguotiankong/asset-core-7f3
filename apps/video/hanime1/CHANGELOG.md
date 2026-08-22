# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Stable：`2.0.0` / Build `20029`。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt` / 规则 version `2026082235`。
- Stable Bootstrap：`apps/video/hanime1/bootstrap_stable_v5_b20029.js` / `minBuild=20029` / `defaultRelease=20029`。
- Stable 来源：用户实机可正常启动的 `2.0.0-test.29 / Build20029` 原样晋级，仅叠加 Stable 版本/维护设置；作为后续 Test 的独立远程兜底。
- Test：`2.0.0-test.30` / Build `20030`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20030.txt` / 规则 version `2026082236`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20030.js` / `minBuild=20030` / `defaultRelease=20030`。
- Remote Manager：Stable/Test 分别使用 `hanime1` / `hanime1-test` 独立状态，均为 manager `2.0.1`。
- Legacy `1.2.1`：仅保留 `hanime1.txt` 历史文件，不再作为活动通道。
- **Test27、Test28 均已隔离；不得作为当前 UI recovery base。**

## 2026-08-22 18:17：Test29 实机闭环与 Stable 2.0.0 晋级
用户从云端仓库覆盖 Test29 后确认：
- 小程序可正常启动，不再出现 Test27 SyntaxError / Test28 `HanimeUI11` ReferenceError。
- 首页五个 SVG 导航图标正常，详情播放/评论/加入片单/下载图标正常。
- 视频详情封面、作者/上传者头像、主评论头像、播放主链仍正常。

同时实机明确暴露：
- 片库顶部“公开片库”标题和说明没有实际价值，占据首屏空间。
- 点击“查看 X 条回复”进入后仍显示 `共0条回复 / 回复暂未解析出来`。
- 海阔播放器的“播放列表”错误混入 `播放 / 评论 / 加入片单 / 下载原片`，说明详情连续操作组件被软件当成连续选集。
- 推荐页的超大模糊 Hero + 下方网格观感不佳，需要重新压缩信息层级。
- 账号片单详情只能看到 `影片14322 / 影片1774 ...` 之类兜底标题，真实封面/标题没有解析出来；账号能力仍需增强。

用户明确要求：**先把当前 Test29 作为正式版兜底，再继续升级测试版。**

因此发布 Stable `2.0.0 / Build20029`：
- Stable Release 直接复用 immutable Test29 recovery，不把 Test30 未验证改动带入正式版。
- Stable 使用独立 Shell v5 / Bootstrap / Remote Manager id，不与 Test 状态互相覆盖。
- 已知的回复、账号片单、推荐 UI 等问题作为“已知非阻断缺陷”冻结在兜底 Stable，不在 Stable 上继续修改。
- 后续任何 Test30+ 回归都可以重新从云端仓库导入 Stable 2.0.0 恢复。

## Test30：基于 Stable 的当前优化
### 1. 更多回复：同时修正“主评论 ID 映射”和“回复 DOM”
此前只反复改 `/loadReplies` 解析仍不能解决，原因不能只看回复页；点击哪一个 commentId 也必须准确。

重新读取当前 `1wc10086/Han1mePlus@main` 的 `han1me_api.dart` 后确认官方当前真实结构：

```text
/loadComment
→ #comment-start.children
→ 每 4 个直接子节点 = 1 条主评论
→ 在这 4 节点组合内找 reply-section-wrapper-<commentId>

/loadReplies?id=<commentId>
→ div[id^=reply-start].children
→ 每 2 个直接子节点 = 1 条回复
→ body 中 .comment-index-text[0]=用户/时间
→ body 中 .comment-index-text[1]=正文
→ body 第一张 img=头像
```

Test30 因此：
- 主评论优先按 `#comment-start > *` 每 4 节点组装，commentId 从同组 `reply-section-wrapper-*` 取得，避免“16 回复按钮实际打开另一个无回复 commentId”。
- 回复优先按 `reply-start > *` 每 2 节点解析；失败才退回 `.comment-index-text` rows。
- `/loadReplies` 仍保持单请求。
- 只缓存非空回复 60 秒；空结果绝不缓存。
- 发布回复后清除该线程缓存。
- 主评论新解析失败时回退 Stable 原评论链，不允许为了修回复把主评论再次打成 0 条。

### 2. 海阔播放器播放列表污染
官方海阔开发手册明确：**连续的同一 `col_type` 默认会被识别为连续选集/章节**；真正的选集还可以用 `extra.cls` 中的 `playlist` 显式标识。

Test29 把 `播放 / 评论 / 加入片单 / 下载原片` 四个动作全部做成连续 `icon_4`，实机播放器因此把四个功能动作当成播放列表。

Test30 改为：
- `播放` 独立为 `text_icon`。
- `评论 / 加入片单 / 下载原片` 作为次级 `icon_small_3`。
- 真正系列选集继续用 `scroll_button`，并显式加 `extra.cls='playlist hanime-episodes'`。
- 目标：播放器列表只认识真实集数，不再出现评论/片单/下载操作。

### 3. 片库首屏减负
- 删除“公开片库”标题与说明文字，五组筛选直接出现在顶部导航下。
- 选择态由旧的黑块/黑点文本改为轻量 `✓`。
- 保留完整分类、清空筛选、直接刷新结果。

### 4. 推荐页重新排版
Test29 的 `movie_1_vertical_pic_blur` 超大焦点卡实机占屏太多。

Test30：
- 首屏焦点改为紧凑 `精选推荐 + movie_1_left_pic`。
- 下方继续保留官网真实分区和用户自定义封面布局。
- 不为了“美化”牺牲首屏可见影片数量。

### 5. 账号/片单修复
重新读取当前 Han1mePlus 上游账号/片单解析契约：
- 用户片单卡：`.user-tab-item-wrapper, .playlist-item-wrapper, .playlist-card`。
- 片单链接：`a.video-link` 或 `a[href*="playlist?list="]`。
- 片单真实标题：`.title, .playlist-title`。
- 片单封面：`img.main-thumb, img`。
- 片单详情影片：`.playlist-video-list > div.user-tab-item-wrapper`。
- 影片链接：`a[href*="watch"]` / `[data-href]`。
- 真实标题：`.video-title`；封面：`img.main-thumb`。

Test30 按这套契约重写 `P.playlist()` 和片单页，目标是不再出现纯 `影片<ID>` + 空封面。

“我的”同时改为按需栏目：`片单 / 收藏 / 稍后看 / 订阅 / 历史`，只请求当前选中的账号栏目，不再每次一次性串行拉全套账号页面。

## 2026-08-22 18:07：Test28 启动 ReferenceError
实机错误：

```text
ReferenceError: “HanimeUI11” 未定义
```

根因：`ui28.js` 顶层 IIFE 错误引用不存在的 `HanimeUI11`；真实 Test11 `ui_common.js` 只是增强 `HanimeUI10`。

结论：
- `node --check` 只能证明可解析，不能发现顶层运行全局缺失。
- Test29 增加 runtime global preflight，并新增 `tools/js_runtime_smoke_guard.py`。
- 专项事故：`docs/INCIDENT_JS_RUNTIME_GLOBAL_DEPENDENCY_20260822.md`。

## 2026-08-22 17:54：Test27 启动 SyntaxError
实机错误：

```text
SyntaxError: 在参数列表的后面缺少“)”
```

根因：`patch_experience27.js` 的 `E.repliesPage` 少一个右括号，模块 parse 阶段即失败。

结论：
- Test27 永久 quarantine，不进入后续恢复链。
- 新增 `tools/js_syntax_guard.py`；新增/修改远程 JS 在切 Test/Candidate/Stable 元数据前必须先过语法门禁。
- 专项事故：`docs/INCIDENT_JS_SYNTAX_RELEASE_20260822.md`。

## 运行/交付事故历史
### Test24：头像恢复暴露“设备实际运行版本”问题
用户从规则仓库覆盖 Shell v4 后真实头像立即出现。此前旧设置页的更新按钮曾报：

```text
“HanimeBoot” 未定义
```

长期规则：**GitHub 已发布新 Release ≠ 手机已经运行新 Release**。连续出现“代码改了但实机完全无变化”时，先核对 Shell / Bootstrap / Remote Manager active release / runtime build。

专项记录：`docs/INCIDENT_REMOTE_RELEASE_NOT_APPLIED_20260822.md`。

### Test26：云端仓库广告 Build 与实际安装工件脱节
云端仓库显示 Test26，但重新导入后设置仍是 Test24/Build20024。根因是 Cloud Repo 仍复用旧 20024 Shell/Bootstrap，Remote Manager `load()` 不会自动 fetch latest。

硬规则：

```text
advertised build
== release build
== installerBuild
<= bootstrap minBuild
<= bootstrap defaultRelease.build
```

并新增 `tools/remote_installer_guard.py`。

## 已验证功能事实
- Test29：实机启动正常；首页五导航 SVG 和详情四操作 SVG 正常显示。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；Shell v4 交付链有效。
- Test26 build-lock：实机明确显示 `2.0.0-test.26 · Build 20026 · Shell v4`，证明 build-locked 云端导入链有效。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析，点击其它集直接播放。
- X5 网页登录 + Cookie bridge 可用。
- 公开片库无需登录可浏览。
- 漫画首页、漫画分类与详情基本链可用。
- 主评论 `/loadComment` 正文和头像可用。
- 官网预告页当前自身 HTTP 500，继续故障降级。

## 已证伪 / 禁止回退
- Test18：同时重写评论数据和头像，曾造成评论 0 条。
- Test19：全局收集主评论图片按 index 回填，不可靠。
- Test20：commentId/用户名固定字符邻域找图，不可靠。
- Test21：自写轻量 HTML DOM parser，合成 fixture 不能代表真实页面。
- Test22：诊断层当时未可靠进入设备。
- Test25：只改回复 rows + 空结果缓存，实机仍出现楼中楼回归。
- Test26：作者目录第二套 HTML parser 实机不可用。
- Test27：启动期 JavaScript SyntaxError，永久隔离。
- Test28：顶层 `HanimeUI11` ReferenceError，永久隔离错误 UI 模块。
- 禁止把 GitHub 新 Release 已发布当作手机已运行新 Release。
- 禁止 Cloud Repo 广告 Build 高于实际安装 Shell/Bootstrap 基线。
- 禁止新 JS 模块未做语法检查就切通道元数据。
- 禁止把“文件版本号/文件名”推断成运行全局对象名；必须读取真实导出对象。
- `node --check` 通过不等于模块可加载；还必须做 Load Smoke。

## 当前恢复链
### Stable 2.0.0
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Remote Manager id=hanime1
→ Stable 2.0.0 release
→ Stable recovery_loader
→ immutable Test29 recovery
→ Test26 → Test25 → Test24 → Test23 → Test17/Test12 稳定链
→ Test29 safe replies/creator/ui/settings
→ Stable settings overlay
```

### Test30
```text
hanime1_remote_test_v4_b20030.txt
→ bootstrap_test_v4_b20030.js
→ Remote Manager id=hanime1-test
→ Test30 release
→ Stable 2.0.0 recovery
→ runtime preflight
→ replies30.js
→ library30.js
→ account30.js
→ ui30.js
→ settings30.js
```

## Test30 实机验收
- [ ] 设置明确显示 `2.0.0-test.30 · Build 20030 · Shell v4`。
- [ ] 片库顶部不再出现“公开片库”标题/说明，筛选直接贴近导航。
- [ ] 主评论头像/正文不退化；`查看 16 条回复 / 5 条回复` 能进入正确线程并显示内容。
- [ ] 海阔播放器“播放列表”不再出现评论/加入片单/下载原片，只保留真实选集。
- [ ] 推荐页首屏不再使用超大模糊 Hero，信息密度比 Test29 更合理。
- [ ] 我的片单能显示真实片单标题/封面；片单详情能显示真实影片标题/封面并点击进入详情。
- [ ] 收藏/稍后看/历史至少当前栏目按需加载，不因拉取其它账号栏目拖慢页面。
- [ ] 作者/上传者头像、播放、登录、漫画、片库资源无回归。
- [ ] Stable 2.0.0 可从云端仓库独立重新导入，不受 Test30 状态影响。

## 后续路线
1. Test30 先完成上述实机闭环；P0 回归先修，不继续堆功能。
2. 评论社区增强：点赞数、点赞/点踩状态与动作、举报；接口优先对齐当前 Han1mePlus `voteComment/reportComment`。
3. 作者订阅状态/订阅动作与账号中心联动。
4. 账号中心继续完善资料、订阅作者、收藏/稍后看/历史管理操作。
5. 主要能力稳定后做 Consolidated Candidate，压缩 Test15～30 历史增量链。

---
## 版本记录
### 2.0.0-test.30 / Build 20030 / 2026-08-22
- 基于 Stable 2.0.0/Test29 继续开发，不直接修改 Stable。
- 删除片库“公开片库”说明区并压缩筛选 UI。
- 主评论按 4 节点组绑定真实 reply commentId；回复按 2 节点组解析。
- 详情播放与功能动作拆分；真实选集显式 `cls=playlist`。
- 推荐首屏由超大 blur Hero 改为紧凑精选卡。
- 账号片单/片单影片按当前 Han1mePlus DOM 契约重写。
- 新 Shell/Bootstrap/minBuild/defaultRelease 锁定 Build20030。

### 2.0.0 / Build 20029 / 2026-08-22
- 按用户要求将当前实机可启动 Test29 原样晋级为正式兜底。
- Stable 使用独立 Shell v5、Bootstrap、Remote Manager id；后续 Test 不影响此基线。

### 2.0.0-test.29 / Build 20029 / 2026-08-22
- 修复 Test28 `HanimeUI11` 未定义启动错误。
- 实机确认可启动，首页与详情 SVG 图标正常。
- 实机同时确认：更多回复仍空、播放器列表混入功能按钮、推荐 UI 不理想、账号片单不完整。

### 2.0.0-test.28 / Build 20028
- 语法检查通过，但顶层错误依赖 `HanimeUI11`，实机 ReferenceError；已隔离。

### 2.0.0-test.27 / Build 20027
- JavaScript 括号语法错误导致启动失败；已隔离。

### 2.0.0-test.26 / Build 20026
- 创作者中心、详情主操作重排、搜索/筛选作者入口、设置分层；云端安装工件曾脱节后修复。

### 2.0.0-test.25 / Build 20025
- 取消头像诊断；楼中楼尝试单请求 + 短缓存。

### 2.0.0-test.24 / Build 20024
- Shell v4 + Bootstrap v4 修复更新链；用户实机确认真实头像出现。

### 2.0.0-test.23 / Build 20023
- 使用海阔 XPath 头像方案；后由 Test24 真正送达设备并验证。

### 2.0.0-test.17 / Build 20017
- 上传者 `/user/<id>` 公共作品链实机通过。

### 2.0.0-test.12 / Build 20012
- X5 Cookie bridge 登录、页面布局设置可用。

### 2.0.0-test.11 / Build 20011
- 真选集、时长格式化、评论去重。

### 2.0.0-test.6 / Build 20006
- WebView 验证/登录、封面、最高画质播放、漫画首页通过实机。
