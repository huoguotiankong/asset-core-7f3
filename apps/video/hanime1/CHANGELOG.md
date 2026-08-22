# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.17` / Build `20017` / Shell `2026082227`。
- Stable 尚未晋级；Test17 继续采用 Recovery15 后的最小增量策略。

## 已验证实机事实
- Recovery15：用户实机确认首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test16 首次 Shell 因生成时多转义一层反斜杠导致 `eval(Function)` 报 `不允许的字符：\\`；按 Test15 已验证 Shell 原文结构重建为 `2026082226` 后，用户实机确认恢复。
- Test16 恢复后：视频详情成功区分作者与上传者；上传者头像可显示；作者名称点击关键词搜索能找到作品；但作者头像仍为空；上传者按用户名关键词搜索得到 0 部，证明上传者不能用作者/关键词搜索代替公开用户页。
- Test12 X5 WebView bridge 登录实机成功：网页内 `fy_bridge_app.getCookie('')` → `putVar()` → 规则侧 `importCookie()` → `profile()` 校验 → `Core.saveAccount()`。
- 首页真实内容、多分区与封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- 评论 `/loadComment` 可读取真实数据，楼中楼 `/loadReplies` 可用。
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

## Test17：作者头像 + 上传者公开作品
- 基线：Test16 已实机恢复的运行链。
- 新增 `releases/2.0.0-test.17/patch_creator.js`，源文件保持零反斜杠字符。
- 作者头像：详情原始头像为空时，调用官网 `search?type=artist&query=<作者>` 的作者卡片作为 fallback，优先精确匹配作者名并取官方作者图片。
- 上传者：不再把上传者用户名当普通关键词搜索。详情点击上传者直接携带真实 `/user/<id>` 用户 ID 进入现有影片结果页。
- `userUploads17()` 直接读取 `/user/<id>` 公共主页；若首页没有影片，则发现该用户页真实“影片/Videos” Tab URL 后继续请求，再解析 `watch?v=` 卡片和分页。
- 不新增 Shell 子页面，复用现有 `hanimeVideoResults`，降低 Shell 风险。
- 首页、登录、最高画质播放、真选集、片库、漫画和布局设置均不重写。

## Test17 待实机回归
- [ ] 首页继续正常，无启动 SyntaxError。
- [ ] 作者头像恢复。
- [ ] 上传者头像继续正常。
- [ ] 点击上传者能看到其真实公开上传作品，不再出现“作者/关键词 · 用户名 · 0部”。
- [ ] 上传者作品分页可用。
- [ ] 作者关键词作品搜索不退化。
- [ ] 登录、最高画质播放、真选集、漫画无回归。

## 后续恢复顺序
1. Test17：作者头像 + 上传者真实公开作品（当前）。
2. 实机通过后：作者目录 + 独立作者主页。
3. 再通过后：评论 / 楼中楼头像与元信息。
4. 再通过后：账号中心与订阅作者功能。
5. 主要功能稳定后做 Consolidated Candidate，将历史增量链压缩为少量 Core / Provider / Account / Pages / UI / Runtime 模块。

---
## 版本记录
### 2.0.0-test.17 / Build 20017 / 2026-08-22
- 修作者头像 fallback。
- 上传者点击改为真实 `/user/<id>` 公共上传作品，而非用户名关键词搜索。
- 保持 Recovery15/Test16 其它稳定链不变。

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
