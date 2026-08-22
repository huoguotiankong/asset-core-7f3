# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.18` / Build `20018` / Shell `2026082228`。
- Stable 尚未晋级；Test18 继续采用 Recovery15 后的最小增量策略。

## 已验证实机事实
- Recovery15：用户实机确认首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test16 首次 Shell 因生成时多转义一层反斜杠导致 `eval(Function)` 报 `不允许的字符：\\`；按 Test15 已验证 Shell 原文结构重建为 `2026082226` 后，用户实机确认恢复。
- Test16 恢复后：视频详情成功区分作者与上传者；上传者头像可显示；作者名称点击关键词搜索能找到作品；但作者头像仍为空；上传者按用户名关键词搜索得到 0 部，证明上传者不能用作者/关键词搜索代替公开用户页。
- Test17：用户实机确认上传者真实公开作品已经能加载，证明 `/user/<id>` + 用户影片 Tab 路径正确；作者作品搜索继续可用。但作者头像仍为空，评论页仍显示非官网真实头像/占位头像，因此头像链继续单独修复。
- Test12 X5 WebView bridge 登录实机成功：网页内 `fy_bridge_app.getCookie('')` → `putVar()` → 规则侧 `importCookie()` → `profile()` 校验 → `Core.saveAccount()`。
- 首页真实内容、多分区与封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- 评论 `/loadComment` 可读取真实数据，楼中楼 `/loadReplies` 可用，但 Test17 前头像解析仍不完整。
- 公开片库无需登录可浏览；逐页面封面布局设置可用。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## 登录架构（当前正确链）
```text
X5 官网 /login
→ 用户完成网页登录
→ WebView 内 fy_bridge_app.getCookie('') 读取真实 Cookie（含 HttpOnly）
→ fy_bridge_app.putVar() 回传规则侧
→ Provider.importCookie()
→ /user/<id>/edit / profile 校验真实身份
→ Core.saveAccount()
```

硬约束：
- 只看到 `XSRF-TOKEN + hanime1_session` 不等于登录成功。
- 登录完成必须以能识别 `/user/<id>` 并读取账号资料为成功标准。
- 不假设 X5 Cookie 与规则 `getCookie()` 自动共享。
- 不保存账号密码；只保存账号 Cookie。

## Test13 / Test14 事故与恢复结论
- Test13、Test14 在用户手机启动阶段均报 `SyntaxError: 不允许的字符：“\\”`，来源 `JSEngine#8(eval)#89(Function)`。
- 桌面 Node/Rhino 通过不能代表海阔运行时一定兼容。
- Recovery15 完全撤出 Test13/Test14 新运行模块，恢复到 Test12 已验证运行链，并换用 `bootstrap_test_v3.js` / `hanime1_remote_test_v3.txt`；用户实机确认首页恢复。
- 后续恢复功能必须按最小增量逐块加入，每块先实机验证再继续。
- Shell 必须基于最近一次实机验证成功的原文结构做版本替换，禁止多层 JSON 再序列化造成额外反斜杠。

## Test17：上传者真实公开作品
- 基线：Test16 已实机恢复的运行链。
- 新增 `releases/2.0.0-test.17/patch_creator.js`，源文件保持零反斜杠字符。
- 上传者：不再把上传者用户名当普通关键词搜索。详情点击上传者直接携带真实 `/user/<id>` 用户 ID 进入现有影片结果页。
- `userUploads17()` 直接读取 `/user/<id>` 公共主页；若首页没有影片，则发现该用户页真实“影片/Videos” Tab URL 后继续请求，再解析 `watch?v=` 卡片和分页。
- 实机结果：上传者作品链通过；作者头像 fallback 未通过。

## Test18：作者 / 评论真实头像修复
- 基线：Test17 已实机确认上传者作品可用。
- 新增 `releases/2.0.0-test.18/patch_avatar.js`，本地 Node 语法通过且源文件为零反斜杠字符。
- 作者头像一级策略：不依赖海阔对 CSS 相邻选择器 `#video-user-avatar + img` 的兼容性，直接从详情原始 HTML 的 `video-user-avatar` 邻域提取真实 `<img>`。
- 作者头像二级策略：请求官网 `search?type=artist&query=<作者>`，按 `.search-artist-card` 精确匹配作者名并读取 `img[style*=object-fit]` / lazy image 字段。
- 作者头像最终兜底：`assets/avatar_default.svg`，本身为圆形图形，避免无图片 URL 时出现灰色方块。
- 评论：按 Han1mePlus 当前实现与官网结构，`#comment-start` 每 4 个直接子节点组成一条评论，从整组内第一个真实 `img` 读取头像；保留旧评论解析作为失败回退。
- 楼中楼：`reply-start` 每 2 个直接子节点组成一条回复，从组内真实 `img` 读取头像；失败回退旧回复链。
- UI 不新增组件，继续使用已验证的海阔 `avatar`，真实图片与圆形 SVG 均由同一头像组件渲染。
- 首页、登录、播放、真选集、上传者作品、片库、漫画和布局设置均不重写。

## Test18 待实机回归
- [ ] 首页继续正常，无启动 SyntaxError。
- [ ] 视频详情作者显示真实头像；若官网确无头像，也应显示圆形默认头像而不是灰方块。
- [ ] 上传者头像与公开作品继续正常。
- [ ] 评论列表显示官网真实用户头像；无头像账号显示圆形默认头像。
- [ ] 楼中楼回复头像同样正常。
- [ ] 评论数量、正文、回复数和翻页不退化。
- [ ] 登录、最高画质播放、真选集、漫画无回归。

## 后续恢复顺序
1. Test18：作者 + 评论/回复真实头像（当前）。
2. 实机通过后：作者目录 + 独立作者主页。
3. 再通过后：评论点赞/点踩、举报等官网元信息与交互。
4. 再通过后：账号中心与订阅作者功能。
5. 主要功能稳定后做 Consolidated Candidate，将历史增量链压缩为少量 Core / Provider / Account / Pages / UI / Runtime 模块。

---
## 版本记录
### 2.0.0-test.18 / Build 20018 / 2026-08-22
- 作者头像改为详情原 HTML 邻域解析 + 官网作者卡双重策略。
- 主评论按官网 4 节点结构解析真实头像；回复按 2 节点结构解析真实头像。
- 新增圆形 SVG 默认头像兜底。
- 保持 Test17 已实机通过的上传者公开作品及其它稳定链不变。

### 2.0.0-test.17 / Build 20017 / 2026-08-22
- 上传者点击改为真实 `/user/<id>` 公共上传作品，而非用户名关键词搜索；用户实机确认作品可加载。
- 作者头像 fallback 实机仍失败，转入 Test18 单独修复。

### 2.0.0-test.16 / Build 20016 / 2026-08-22
- Recovery15 后第一块最小增量恢复：详情分离作者与上传者。
- 首次 Shell 过度转义导致启动失败；重建 Shell 2026082226 后实机恢复。

### 2.0.0-test.15 / Build 20015 / 2026-08-22
- Recovery：彻底撤出 Test13/Test14 新运行模块，恢复 Test12 已验证链；用户实机确认首页恢复。

### 2.0.0-test.12 / Build 20012
- X5 网页 bridge Cookie 登录实机成功。
- 取消片库二次筛选弹层；新增逐页面封面布局设置。

### 2.0.0-test.11 / Build 20011
- 选集点击直接播放、纯文本筛选状态、时长格式化、评论去重。

### 2.0.0-test.8 / Build 20008
- 官网 canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页随后通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
