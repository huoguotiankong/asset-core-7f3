# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.19` / Build `20019` / Shell `2026082229`。
- Stable 尚未晋级；Test19 是 Test18 回归后的 Recovery，运行基线直接回到已验证 Test17 再做头像附加增强。

## 已验证实机事实
- Recovery15：用户实机确认首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test16 首次 Shell 因生成时多转义一层反斜杠导致 `eval(Function)` 报 `不允许的字符：\\`；按 Test15 已验证 Shell 原文结构重建后恢复。
- Test16：视频详情成功区分作者与上传者；上传者头像可显示；作者名称点击关键词搜索能找到作品；作者头像仍为空。
- Test17：用户实机确认上传者真实公开作品已经能加载，证明 `/user/<id>` + 用户影片 Tab 路径正确；作者作品搜索继续可用。
- Test18：用户实机确认失败——作者头像仍显示灰色方块；评论页从原本可读真实评论退化成 `0 条评论`。因此 Test18 的 `P.comments/P.replies` 直接覆盖方案判定禁用，不得再作为后续基线。
- Test12 X5 WebView bridge 登录实机成功：网页内 `fy_bridge_app.getCookie('')` → `putVar()` → 规则侧 `importCookie()` → `profile()` 校验 → `Core.saveAccount()`。
- 首页真实内容、多分区与封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- Test17 及更早链的评论 `/loadComment` 可读取真实数据，楼中楼 `/loadReplies` 可用。
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
- `userUploads17()` 直接读取 `/user/<id>` 公共主页；若首页没有影片，则发现该用户页真实“影片/Videos” Tab URL 后继续请求，再解析 `watch?v=` 卡片和分页。
- 实机结果：上传者作品链通过；作者头像 fallback 未通过。

## Test18：失败的头像解析尝试
- 尝试直接替换 `P.comments/P.replies`，按 Han1mePlus DOM 的 4 节点主评论 / 2 节点回复结构重建评论。
- 尝试详情 HTML 邻域 + 作者卡补作者头像，并用 SVG 兜底。
- 实机结果：作者仍灰色方块，评论退化为 0 条。
- 结论：海阔 `pdfa` 对该直接子节点方案与 Flutter DOM 解析行为不同；SVG 兜底在该 avatar 场景也不能作为可靠方案。此路径禁用。

## Test19：评论恢复 + 非破坏头像增强
- Recovery19 **直接加载 Test17 recovery_loader**，完全绕过 Test18，因此 Test18 的评论函数不会进入运行时。
- `P.comments()` / `P.replies()` 先调用 Test17 原函数取得已经验证的数据；只有原数据成功后，才额外请求同一接口并按顺序补头像 URL。头像补取失败只保留原数据，绝不再把评论替换为空数组。
- 评论头像候选补充 `data-src / data-original / data-lazy-src / src / data-srcset / srcset`。
- 作者搜索卡同样补齐上述 lazy image 字段；优先精确作者名。
- 新增真正的 `assets/avatar_default.png` 圆形栅格兜底，替代 Test18 的 SVG 兜底。
- 上传者公开作品、登录、最高画质播放、真选集、片库、漫画与布局设置全部沿用 Test17 已验证链。
- 新增 Test19 JS 继续保持零反斜杠字符并通过 Node 静态语法检查。

## Test19 待实机回归
- [ ] 首页正常，无 SyntaxError。
- [ ] 评论数量和正文恢复，不再显示 0 条。
- [ ] 楼中楼继续可打开。
- [ ] 有真实头像的评论尽量显示官网头像；没有头像时至少显示 PNG 圆形兜底。
- [ ] 作者不再出现灰色方块；若官网作者卡存在真实图则显示真实图，否则显示 PNG 圆形兜底。
- [ ] 上传者头像/作品、登录、播放、选集、漫画无回归。

## 后续恢复顺序
1. Test19：先恢复评论并稳定头像显示（当前）。
2. 头像链实机通过后，再做作者目录 + 独立作者主页。
3. 再通过后：评论点赞/点踩、举报等官网元信息与交互。
4. 再通过后：账号中心与订阅作者功能。
5. 主要功能稳定后做 Consolidated Candidate，将历史增量链压缩为少量 Core / Provider / Account / Pages / UI / Runtime 模块。

---
## 版本记录
### 2.0.0-test.19 / Build 20019 / 2026-08-22
- Recovery：完全跳过 Test18，恢复 Test17 评论/回复数据链。
- 作者、评论、回复头像改为非破坏式附加增强。
- SVG 兜底改为真实 PNG 圆形头像。

### 2.0.0-test.18 / Build 20018 / 2026-08-22
- 实机失败：作者仍灰色方块，评论退化为 0 条；禁止继续作为基线。

### 2.0.0-test.17 / Build 20017 / 2026-08-22
- 上传者点击改为真实 `/user/<id>` 公共上传作品，而非用户名关键词搜索；用户实机确认作品可加载。

### 2.0.0-test.16 / Build 20016 / 2026-08-22
- Recovery15 后第一块最小增量恢复：详情分离作者与上传者。
- 首次 Shell 过度转义导致启动失败；重建 Shell 后实机恢复。

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
