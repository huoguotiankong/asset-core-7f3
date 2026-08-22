# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.0` / Build `20029`。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt` / 规则 version `2026082235`。
- Stable Bootstrap：`apps/video/hanime1/bootstrap_stable_v5_b20029.js` / `minBuild=20029` / `defaultRelease=20029`。
- Stable 来源：用户实机确认可正常启动的 `2.0.0-test.29 / Build20029` 原样晋级，仅叠加 Stable 版本/维护设置；与 Test 使用独立 Remote Manager 状态。
- Test：`2.0.0-test.31` / Build `20031`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20031.txt` / 规则 version `2026082237`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20031.js` / `minBuild=20031` / `defaultRelease=20031`。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1`：仅保留 `hanime1.txt` 历史文件，不再作为活动通道。
- **Test27、Test28 均为 broken/quarantined，不允许作为当前 UI recovery base。**

## 2026-08-22 18:17：Test29 实机闭环并晋级 Stable 2.0.0
用户实机确认 Test29：
- 可正常启动，不再出现 Test27 SyntaxError / Test28 `HanimeUI11` ReferenceError。
- 首页五个 SVG 导航图标正常。
- 视频详情播放/评论/加入片单/下载 SVG 图标正常。
- 视频详情封面、作者/上传者头像、主评论头像、播放主链仍正常。

同时实机明确暴露：
- 片库顶部“公开片库”标题和说明占据首屏、没有实际价值。
- 点击“查看 X 条回复”后仍出现 `共0条回复 / 回复暂未解析出来`。
- 海阔播放器“播放列表”错误混入 `播放 / 评论 / 加入片单 / 下载原片`。
- 推荐页超大模糊 Hero + 下方网格观感不佳。
- 账号片单详情只显示 `影片14322 / 影片1774 ...` 之类兜底标题，缺真实标题/封面。

用户明确要求：**先把当前 Test29 作为正式版兜底，再继续升级测试版。**

因此发布 Stable `2.0.0 / Build20029`：
- Stable Release 直接复用 immutable Test29 runtime/recovery。
- Stable 单独使用 Shell v5 / Bootstrap / Remote Manager id，不受 Test31+ active state 影响。
- Test29 已知的回复、账号片单、推荐 UI、播放器列表问题在 Stable 作为已知非阻断缺陷冻结，不在 Stable 上直接修改。
- 后续 Test 出现 P0 回归时，可从云端仓库独立覆盖 Stable 2.0.0 恢复。

## Test31：Stable 基线上继续当前优化
Test30 是第一版实现；发布后静态复核发现两个选择器风险，在用户尚未测试 Test30 前直接新建 Test31 固化，不原地覆盖 Test30：
1. 主评论 commentId 不再依赖裸 `pdfh(...,'id')`，改从同组原始 HTML 直接提取 `reply-section-wrapper-<id>`。
2. 用户片单链接选择器改为与当前 Han1mePlus 上游一致的引号形式 `a[href*="playlist?list="]`。

因此活动 Test 直接为 Test31 / Build20031，Test30 仅保留历史中间版本。

### 1. 更多回复：同时修“主评论 ID 映射”和“回复 DOM”
重新读取当前 `1wc10086/Han1mePlus@main` 的 `han1me_api.dart` 后，当前真实结构为：

```text
/loadComment
→ #comment-start.children
→ 每 4 个直接子节点 = 1 条主评论
→ 在同一 4 节点组合内取得 reply-section-wrapper-<commentId>

/loadReplies?id=<commentId>
→ div[id^=reply-start].children
→ 每 2 个直接子节点 = 1 条回复
→ body .comment-index-text[0] = 用户/时间
→ body .comment-index-text[1] = 正文
→ body 第一张 img = 头像
```

Test31 策略：
- 继续保留 Stable/Test29 已验证的主评论正文与头像链作为数据基线。
- 额外请求 `/loadComment` 后，仅在 4 节点组数量与已有评论数量一致时，按同 index 回绑真实 `reply-section-wrapper-*` ID 与 replyCount；不一致则不覆盖原数据。
- commentId 直接通过组内原始 HTML 正则提取，避免海阔根节点属性选择器差异。
- `/loadReplies` 仍只请求一次；优先 `reply-start > *` 每 2 节点解析，失败再退回 `.comment-index-text` rows。
- 只缓存非空回复 60 秒；空结果不缓存；发布回复后清该线程缓存。

### 2. 海阔播放器播放列表污染
海阔官方组件规则：连续同 `col_type` 可被识别为连续选集/章节；真正的选集还可以通过 `extra.cls` 中 `playlist` 显式标识。

Test29 四个连续 `icon_4` 功能动作被播放器当成播放列表。

Test31（继承 Test30）改为：
- `播放` 独立为 `text_icon`。
- `评论 / 加入片单 / 下载原片` 为次级 `icon_small_3`。
- 真正系列选集使用 `scroll_button`，并显式 `extra.cls='playlist hanime-episodes'`。
- 目标：播放器播放列表只保留真实集数，不再出现评论/片单/下载功能项。

### 3. 片库首屏减负
- 删除“公开片库”标题和说明文字。
- 类型/排序/日期/时长/标签直接贴近顶部导航。
- 选择态改轻量 `✓`，不再用黑块/黑点文本。
- 保留“完整分类”“清空筛选”和点即刷新。

### 4. 推荐页重新排版
Test29 的 `movie_1_vertical_pic_blur` 焦点卡占屏过大。

Test31（继承 Test30）：
- 焦点改为紧凑 `精选推荐 + movie_1_left_pic`。
- 下方继续展示官网真实分区和用户自定义封面布局。
- 优先提高首屏信息密度，不为了大图牺牲可见影片数量。

### 5. 账号/片单增强
当前 Han1mePlus 上游契约：
- 用户片单卡：`.user-tab-item-wrapper, .playlist-item-wrapper, .playlist-card`。
- 片单链接：`a.video-link` 或 `a[href*="playlist?list="]`。
- 片单真实标题：`.title, .playlist-title`。
- 片单封面：`img.main-thumb, img`。
- 片单详情影片：`.playlist-video-list > div.user-tab-item-wrapper`。
- 影片链接：`a[href*="watch"]` / `[data-href]`。
- 真实标题：`.video-title`；封面：`img.main-thumb`。

Test31：
- `P.playlist()` 按上述真实契约重写。
- “我的”改为 `片单 / 收藏 / 稍后看 / 订阅 / 历史` 按需栏目，只请求当前栏目，避免每次串行拉全账号页面。
- 片单详情目标是显示真实标题、封面并进入影片详情，而非 `影片<ID>` 占位。

## 运行/交付事故历史
### Test24：头像问题实际包含“手机未运行到新 Release”
旧设置页更新按钮曾报：

```text
“HanimeBoot” 未定义
```

从规则仓库覆盖 Shell v4 后，真实头像立即恢复。长期规则：**GitHub 已发布新 Release ≠ 手机已经运行新 Release**。连续出现代码变了但实机完全没变化时，先核对 Shell / Bootstrap / Remote Manager active release / runtime build。

专项记录：`docs/INCIDENT_REMOTE_RELEASE_NOT_APPLIED_20260822.md`。

### Test26：云端仓库广告 Build 与安装工件脱节
云端仓库显示 Test26，但重新导入后仍运行 Test24。根因：Cloud Repo 仍复用 20024 Shell/Bootstrap，Remote Manager `load()` 不会自动 fetch latest。

固定门禁：

```text
advertised build
== release build
== installerBuild
<= bootstrap minBuild
<= bootstrap defaultRelease.build
```

工具：`tools/remote_installer_guard.py`。

### Test27：发布 JS SyntaxError
`patch_experience27.js` 少一个右括号，设备启动直接：

```text
SyntaxError: 在参数列表的后面缺少“)”
```

处理：Test27 永久 quarantine；新增 `tools/js_syntax_guard.py`；新/改远程 JS 未过语法门禁禁止切 Test/Candidate/Stable。

专项记录：`docs/INCIDENT_JS_SYNTAX_RELEASE_20260822.md`。

### Test28：运行全局依赖错误
Test28 语法检查通过，但 `ui28.js` 顶层错误引用不存在的 `HanimeUI11`；真实 Test11 只是增强 `HanimeUI10`。

设备启动：

```text
ReferenceError: “HanimeUI11” 未定义
```

处理：Test28 错误 UI 永久 quarantine；Test29 增加 runtime global preflight 和 `tools/js_runtime_smoke_guard.py`。结论：`node --check` 通过不等于模块可加载。

专项记录：`docs/INCIDENT_JS_RUNTIME_GLOBAL_DEPENDENCY_20260822.md`。

## 已验证功能事实
- Test29：实机启动正常；首页五导航 SVG、详情四操作 SVG 正常显示。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；Shell v4 交付链有效。
- Test26 build-lock：实机明确显示 `2.0.0-test.26 · Build20026 · Shell v4`，证明 build-locked 云端导入链有效。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析，点击其它集直接播放。
- X5 网页登录 + Cookie bridge 可用。
- 公开片库资源无需登录可浏览。
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
- 禁止把 GitHub 新 Release 当成手机已运行新 Release。
- 禁止 Cloud Repo 广告 Build 高于实际 Shell/Bootstrap 基线。
- 禁止新 JS 未做 Parse Gate + Load Smoke 就切活动通道。
- 禁止按文件版本号/文件名猜运行全局对象名，必须读取真实导出/增强对象。

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

### Test31
```text
hanime1_remote_test_v4_b20031.txt
→ bootstrap_test_v4_b20031.js
→ Remote Manager id=hanime1-test
→ Test31 release
→ Test31 recovery_loader
→ Test30 recovery_loader
→ Stable 2.0.0 recovery
→ runtime preflight
→ replies30 / library30 / account30 / ui30
→ patch31 selector hardening
→ settings31
```

## Test31 实机验收
- [ ] 设置明确显示 `2.0.0-test.31 · Build20031 · Shell v4`。
- [ ] 片库不再出现“公开片库”标题/说明，筛选直接贴近导航。
- [ ] 主评论正文/头像不退化；`查看16条回复 / 5条回复` 等进入正确线程并显示内容。
- [ ] 海阔播放器“播放列表”只显示真实选集，不再出现评论/加入片单/下载原片。
- [ ] 推荐页不再使用超大 blur Hero，首屏信息密度改善。
- [ ] 我的片单显示真实片单标题/封面；片单详情显示真实影片标题/封面并可进入详情。
- [ ] 收藏/稍后看/历史按需加载，不因其它账号栏目拖慢。
- [ ] 作者/上传者头像、播放、登录、漫画、片库资源无回归。
- [ ] Stable 2.0.0 可从云端仓库独立重新导入，不受 Test31 active state 影响。

## 后续路线
1. Test31 先完成以上实机闭环；任何 P0/P1 回归先修，不继续堆新功能。
2. 评论社区增强：点赞数、点赞/点踩状态与动作、举报；接口优先对齐当前 Han1mePlus `voteComment/reportComment`。
3. 作者订阅状态/订阅动作与账号中心联动。
4. 账号中心继续完善资料、订阅作者、收藏/稍后看/历史管理操作。
5. 主要能力稳定后做 Consolidated Candidate，压缩 Test15～31 历史增量链。

---
## 版本记录
### 2.0.0-test.31 / Build20031 / 2026-08-22
- 继承 Test30 当前 UI/回复/账号优化。
- 主评论 reply ID 改为从 4 节点组原始 HTML 直接提取 `reply-section-wrapper-*`。
- 片单链接使用与当前上游一致的 quoted `a[href*="playlist?list="]`。
- Test31 Shell/Bootstrap/minBuild/defaultRelease 锁定 Build20031。

### 2.0.0-test.30 / Build20030 / 2026-08-22
- 基于 Stable 2.0.0 开发：片库减负、主评论/回复重构、播放器列表隔离、推荐首屏压缩、账号片单重写。
- 用户尚未实机测试前由 Test31 替代，不作为活动 Test。

### 2.0.0 / Build20029 / 2026-08-22
- 按用户要求将当前实机可启动 Test29 原样晋级为正式兜底。
- Stable 使用独立 Shell v5 / Bootstrap / Remote Manager id。

### 2.0.0-test.29 / Build20029 / 2026-08-22
- 修复 Test28 `HanimeUI11` 未定义启动错误。
- 实机确认可启动，首页与详情 SVG 图标正常。
- 实机确认更多回复仍空、播放器列表混入功能按钮、推荐 UI 不理想、账号片单不完整。

### 2.0.0-test.28 / Build20028
- 语法检查通过，但顶层错误依赖 `HanimeUI11`，实机 ReferenceError；已隔离。

### 2.0.0-test.27 / Build20027
- JavaScript 括号语法错误导致启动失败；已隔离。

### 2.0.0-test.26 / Build20026
- 创作者中心、详情主操作重排、搜索/筛选作者入口、设置分层；云端安装工件脱节后修复。

### 2.0.0-test.25 / Build20025
- 取消头像诊断；楼中楼尝试单请求 + 短缓存。

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
