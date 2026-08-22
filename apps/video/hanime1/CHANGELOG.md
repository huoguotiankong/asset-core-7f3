# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.0` / Build `20029`。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt` / 规则 version `2026082235`。
- Stable Bootstrap：`apps/video/hanime1/bootstrap_stable_v5_b20029.js` / `minBuild=20029` / `defaultRelease=20029`。
- Stable 来源：用户实机确认可启动、头像/播放/主 UI 正常的 `2.0.0-test.29 / Build20029` 原样晋级；Stable/Test Remote Manager 状态独立。
- Test：`2.0.0-test.33` / Build `20033`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20033.txt` / 规则 version `2026082239`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20033.js` / `minBuild=20033` / `defaultRelease=20033`。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1`：仅保留 `hanime1.txt` 历史文件，不再作为活动通道。
- **Test27、Test28 为 broken/quarantined，不允许作为当前 UI recovery base。**

## 2026-08-22 19:35：Test32 实机结果 → Test33
用户实机截图确认 Test32 的真实结果。

### 已通过 / 必须保留
- 浏览器网页登录态已经能被首页“我的”正确识别：用户头像/账号信息出现，`片单 / 收藏 / 稍后看 / 订阅 / 历史` 五个入口可直接显示，不再重复要求登录。
- Test31 已通过的紧凑推荐页继续正常。
- Test31 已通过的播放器列表隔离继续正常，评论/片单/下载不再混入真正播放列表。
- 作者目录不再完全空白，已经能显示最近/发现的作者数据。

### Test32 仍失败 / 用户明确要求继续改
- 明明主评论显示有回复，回复页仍然 `共0条回复`；Test32 的 `videoId + absolute index` 重新定位仍不足。
- “我的”虽然识别了账号，但真实片单卡片变成 `0个 / 暂无片单`，旧版本曾经能看到片单，因此账号状态修复不能以牺牲片单解析为代价。
- Test32 两条横向筛选带会把大量选项压进同一原生选择弹层，视觉和操作都显得杂乱。用户要求改成接近网飞猫的紧凑多行筛选：每行一个维度 + 常用选项 + `>`。
- 作者目录已有数据，但排版仍不像官网。用户给出官网参考：三列作者方卡 + 名称 + 视频数量。
- 作者与上传者详情页需要向 Hanime 官网靠齐：个人资料 Hero、头像/名称/统计、栏目导航、影片网格。

## Test33：回复、片单、筛选与创作者 UI 的下一轮

### 1. 账号片单：恢复真实片单卡，不回退 Test32 登录态修复
当前上游 Han1mePlus `library()` 明确使用：

```text
/user/<id>/playlists
wrapper: .user-tab-item-wrapper | .playlist-item-wrapper | .playlist-card
link: a.video-link | a[href*="playlist?list="]
title: .title | .playlist-title
cover: img.main-thumb | img
```

Test32 使用逗号组合 selector 一次性解析，实机结果为 0 个片单。由于海阔 `pdfa` 对复杂/组合 selector 的兼容性不能按浏览器 DOM API 想当然，Test33 新增 `account33.js`：
- 不再依赖单个逗号组合 selector。
- `nodesAny()` 分别尝试四类 wrapper，再去重合并。
- wrapper 解析失败时继续扫描真实 `playlist?list=` 链接。
- 最后保留局部 raw HTML fallback，只要取得 list id 就不会直接把整个片单区误判为空。
- 继续继承 Test32 已实机通过的 browser-session 登录态统一，不要求重新登录或先保存账号。

> 当前只能确认“针对 selector 兼容风险做了恢复”；片单是否完全恢复必须等 Test33 实机验证后才能写成已修复事实。

### 2. 更多回复：从 index 映射升级为“评论指纹 + XPath 真实 DOM”
当前上游真实结构继续以 `1wc10086/Han1mePlus@main / lib/src/data/remote/han1me_api.dart` 为准：

```text
/loadComment
→ #comment-start.children
→ 每4个节点 = 1条主评论
→ group 内 div[id^=reply-section-wrapper] = thread id

/loadReplies?id=<thread id>
→ JSON.replies
→ div[id^=reply-start].children
→ 每2节点 = 1条回复
→ body .comment-index-text[0] = 用户/时间
→ body .comment-index-text[1] = 正文
```

Test31 仅靠首次 commentId 失败；Test32 再加绝对 index 仍失败。因此 Test33 `community33.js` 不再把 index 当唯一主键：
- 评论列表为每条主评论计算 `username + content` 指纹。
- 点击更多回复时重新请求当前视频 `/loadComment`。
- 用海阔 XPath 读取 `#comment-start` 真实 4 节点组，逐组重建用户名、正文、`reply-section-wrapper-*`。
- 优先用评论指纹匹配 thread id；匹配不到才退到 absolute index；最后才退原 c.id。
- `/loadReplies` 正文优先沿用 Test23 已经通过实机头像验证的海阔 XPath 路径，按 `reply-start` 每2节点解析；旧 parser 只做 fallback。
- 空回复仍不缓存。

此轮仍不提前宣称“更多回复已修复”，必须以实机为准。

### 3. 片库筛选：改成网飞猫式五行紧凑结构
Test33 `library33.js` 放弃 Test32 的“双条 + 大弹层”为主要交互，改为：

```text
类型 | 全部 | 里番 | 泡面番 | Motion | 3D | >
排序 | 最新上传 | 最新上市 | 本日排行 | 本周排行 | >
日期 | 全部 | 24小时 | 2天 | 1周 | 1月 | >
时长 | 全部 | 1分+ | 5分+ | 10分+ | 20分+ | >
标签 | 全部 | 无码 | 中字 | 1080P | 60FPS | >
```

- 选中项用轻量 `✓`，不再叠黑块/黑点。
- `>` 进入对应完整筛选分类；底部保留“全部筛选 / 清空筛选”。
- 目标是参考用户提供的网飞猫信息密度，但保持 Hanime1 当前浅色原生风格，不机械照搬其配色。

### 4. 作者目录与作者/上传者主页：向官网信息架构靠齐
Test33 `creator33.js`：
- 作者目录改为三列 `pic_3_square`，展示真实头像/Logo、作者名、作品数/辅助信息，视觉接近官网作者搜索网格。
- 作者详情使用资料 Hero + `影片 / 作者目录 / 官网搜索` 栏目导航，下方双列 `movie_2` 影片网格。
- 上传者详情额外请求 `/user/<id>` 提取名称、头像、handle、公开统计；使用资料 Hero + `影片 / 官网主页 / 搜索同名`，下方双列公开影片网格。
- 保留 Test17 已实机验证的 `/user/<id>` 公开作品链作为上传者作品数据基线。

### 5. 发布门禁
Test33 新增/修改 JS 在发布前已执行：
- `node --check`：`account33.js / community33.js / creator33.js / library33.js / settings33.js / recovery_loader.js` 全部通过。
- 顶层 Load Smoke：`account33 / community33 / creator33 / library33 / settings33` 在模拟运行全局下均可加载。
- Recovery preflight 显式要求 `HanimeCore / HanimeProvider / HanimePages / HanimeUI9 / HanimeUI10 / HanimeLayout12`，避免重演 Test28 缺运行全局事故。
- Shell / Bootstrap / release / test metadata / cloud manifest 全部锁定 Build20033。
- Stable `2.0.0 / Build20029` 完全不动。

## 2026-08-22 19:07：Test31 实机结果 → Test32
### Test31 已通过
- 推荐页从超大 blur Hero 改为紧凑“精选推荐 + 内容网格”，实机确认方向可用。
- 海阔播放器播放列表只剩真实播放项，不再混入评论、加入片单、下载原片。
- 片库删除“公开片库”冗余标题与说明。

### Test31 暴露的核心根因
Browser Session 与 Managed Account 曾被错误视为同一状态：`P.profile()` 已登录，但 `C.activeAccount()` 可能为空。Test32 通过 browser-session profile fallback 修复，**Test32 实机已确认“我的”登录态问题解决**。

作者目录此前依赖被 Test8 覆盖后固定为空的 `P.search(...type='artist').artists`。Test32 改为 direct artist HTML + 首页作者 + 普通影片作者 fallback，实机确认作者目录已经有内容；Test33 继续优化其 UI。

Test32 对更多回复增加 `videoId + absolute index` 点击时重定位，但实机仍为 0，已证伪“只靠顺序映射足够稳定”。

## 2026-08-22 18:17：Test29 晋级 Stable 2.0.0
用户实机确认 Test29：
- 可正常启动，不再出现 Test27 SyntaxError / Test28 `HanimeUI11` ReferenceError。
- 首页五个 SVG 导航图标正常。
- 视频详情播放/评论/加入片单/下载 SVG 图标正常。
- 视频详情封面、作者/上传者头像、主评论头像、播放主链正常。

用户明确要求先把该版本作为正式兜底，因此发布 Stable `2.0.0 / Build20029`。Stable 使用独立 Shell v5 / Bootstrap / Remote Manager id，后续所有修复只进入 Test。

## 已验证协议 / 功能事实
- Test32：browser Cookie 登录状态可以直接被“我的”识别并显示账号和五个账号栏目。
- Test32：作者目录已经不再空白；当前待优化的是官网式排版与详情体验。
- Test31：推荐页紧凑布局实机可用；播放器列表只剩真实播放项。
- Test29：实机启动正常；首页/详情 SVG 正常。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；说明海阔 XPath DOM 路径在真实设备可工作。
- Test17：上传者 `/user/<id>` 公共作品链实机通过。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析并直接播放。
- X5 网页登录 + Cookie bridge 可用。
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
- Test26：第二套作者 parser 不能作为作者目录唯一数据源。
- Test27：启动期 JavaScript SyntaxError，永久 quarantine。
- Test28：顶层 `HanimeUI11` ReferenceError，永久 quarantine。
- Test31：只在首次评论解析阶段重绑 commentId 不足以修复更多回复。
- Test32：`videoId + absolute index` 重新定位仍不足以修复更多回复；下一层必须使用评论内容身份/真实 DOM。
- 禁止把 `P.profile()` 成功和 `C.activeAccount()` 非空视为天然等价；browser session 与 managed account 必须显式统一或分别处理。
- 禁止把逗号组合 CSS selector 当成海阔 DOM 解析器必然兼容的浏览器行为；关键业务列表应允许 selector 分拆和 fallback，直到实机验证。
- 禁止把 GitHub 新 Release 当成手机已运行新 Release。
- 禁止 Cloud Repo 广告 Build 高于实际 Shell/Bootstrap 基线。
- 禁止新 JS 未做 Parse Gate + Load Smoke 就切活动通道。
- 禁止按文件版本号/文件名猜运行全局对象名。

## 运行/交付事故历史
### Test24：代码已发布 ≠ 手机已运行
旧设置页曾报 `HanimeBoot 未定义`；从规则仓库覆盖 Shell v4 后真实头像立即恢复。连续出现“代码变了但实机完全没变化”时，固定先核对 `Shell → Bootstrap → Remote Manager active release → Runtime build`。

### Test26：云端仓库广告 Build 与安装工件脱节
固定门禁：

```text
advertised build
== release build
== installerBuild
<= bootstrap minBuild
<= bootstrap defaultRelease.build
```

工具：`tools/remote_installer_guard.py`。

### Test27 / Test28
- Test27：JavaScript 括号语法错误，永久隔离；工具 `tools/js_syntax_guard.py`。
- Test28：语法通过但顶层引用不存在 `HanimeUI11`，实机 ReferenceError；工具 `tools/js_runtime_smoke_guard.py`。

## 当前恢复链
### Stable 2.0.0
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Remote Manager id=hanime1
→ Stable 2.0.0 release
→ immutable Test29 recovery
→ Test26 → Test25 → Test24 → Test23 → Test17/Test12 稳定链
```

### Test33
```text
hanime1_remote_test_v4_b20033.txt
→ bootstrap_test_v4_b20033.js
→ Remote Manager id=hanime1-test
→ Test33 release
→ Test33 recovery_loader
→ Test32 → Test31 → Test30 → Stable 2.0.0 recovery
→ account33.js
→ community33.js
→ creator33.js
→ library33.js
→ settings33.js
```

## Test33 实机验收
- [ ] 设置明确显示 `2.0.0-test.33 · Build 20033 · Shell v4`。
- [ ] “我的”仍能直接识别当前网页登录账号，不回归重复登录。
- [ ] `我的 → 片单` 能恢复真实片单卡；进入任意片单能看到真实影片标题/封面并打开详情。
- [ ] `收藏 / 稍后看 / 订阅 / 历史` 不因片单修复退化。
- [ ] 对已知显示 `1条 / N条回复` 的主评论打开更多回复，能显示真实楼中楼；主评论正文/头像不退化。
- [ ] 片库不再以 Test32 大选择弹层作为主交互，首屏呈现类型/排序/日期/时长/标签五行紧凑筛选。
- [ ] 作者目录为三列方卡结构，并显示作者名/头像/数量信息。
- [ ] 作者详情为资料 Hero + 双列影片；上传者详情为资料 Hero + 公开影片，点击影片正常进入详情。
- [ ] Test31 已通过的推荐页、播放器列表、播放、真选集、漫画无回归。
- [ ] Stable 2.0.0 / Build20029 仍可独立覆盖恢复。

## 后续路线
1. 先完成 Test33 实机闭环；更多回复与账号片单是本轮最高优先级，未通过前不继续叠评论点赞等功能。
2. Test33 核心链通过后，再增强评论点赞/点踩/举报、作者订阅状态与动作。
3. 账号中心继续完善删除历史、片单编辑/移除影片等管理动作。
4. 主要能力稳定后做 Consolidated Candidate，压缩 Test15～33 历史增量链。

---
## 版本记录
### 2.0.0-test.33 / Build20033 / 2026-08-22
- Test32 实机确认浏览器登录态直达“我的”已修复，但更多回复仍 0、片单卡变 0 个、筛选 UI 杂乱、创作者页面需要官网化。
- 片单卡改 selector-safe 多路径 + raw fallback。
- 更多回复改评论指纹重新定位 + XPath `reply-start` 解析。
- 片库改网飞猫式五行紧凑筛选。
- 作者目录改三列方卡；作者/上传者详情改 Hero + 双列影片。
- Stable `2.0.0 / Build20029` 不变。

### 2.0.0-test.32 / Build20032 / 2026-08-22
- browser Cookie 登录与 `activeAccount()` 状态统一；实机确认“我的”登录态恢复。
- 账号中心恢复片单/收藏/稍后看/订阅/历史入口。
- 作者目录 direct artist/homepage/video fallback；实机确认已有作者内容。
- 回复加入 `videoId + absolute index` 点击时重定位；实机仍失败。
- 两条横向筛选带；实机认为过于杂乱，由 Test33 重做。

### 2.0.0-test.31 / Build20031 / 2026-08-22
- 推荐页与播放器列表修复通过实机。
- 更多回复、账号登录态、作者目录仍需继续修。

### 2.0.0-test.30 / Build20030 / 2026-08-22
- 基于 Stable 2.0.0：片库减负、主评论/回复重构、播放器列表隔离、推荐首屏压缩、账号片单重写。

### 2.0.0 / Build20029 / 2026-08-22
- 将实机可启动 Test29 晋级为正式兜底。
- Stable 使用独立 Shell v5 / Bootstrap / Remote Manager id。

### 2.0.0-test.29 / Build20029
- 修复 Test28 启动 ReferenceError；实机启动、SVG 图标正常。

### 2.0.0-test.28 / Build20028
- 顶层错误依赖 `HanimeUI11`，实机 ReferenceError；已隔离。

### 2.0.0-test.27 / Build20027
- JavaScript 括号语法错误导致启动失败；已隔离。

### 2.0.0-test.26 / Build20026
- 创作者中心、详情主操作、搜索/筛选作者入口、设置分层；形成 build-lock 交付教训。

### 2.0.0-test.24 / Build20024
- Shell v4 + Bootstrap v4 修复更新链；用户实机确认真实头像出现。

### 2.0.0-test.23 / Build20023
- 海阔 XPath 头像方案；后由 Test24 真正送达设备并验证。

### 2.0.0-test.17 / Build20017
- 上传者 `/user/<id>` 公共作品链实机通过。

### 2.0.0-test.12 / Build20012
- X5 Cookie bridge 登录、页面布局设置可用。

### 2.0.0-test.11 / Build20011
- 真选集、时长格式化、评论去重。

### 2.0.0-test.6 / Build20006
- WebView 验证/登录、封面、最高画质播放、漫画首页通过实机。
