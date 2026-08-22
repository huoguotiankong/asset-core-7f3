# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.16` / Build `20016` / Shell `2026082226`。
- Stable 尚未晋级；Test16 为 Recovery15 后的第一块最小增量功能，首次 Shell `2026082225` 因 pages 字段过度转义在海阔启动阶段失败，已用 Test15 实机通过的 Shell 转义结构热修为 `2026082226`。

## 已验证实机事实
- Recovery15：用户实机确认首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test12 X5 WebView bridge 登录实机成功：网页内 `fy_bridge_app.getCookie('')` → `putVar()` → 规则侧 `importCookie()` → `profile()` 校验 → `Core.saveAccount()`。
- 规则侧 `getCookie()` 与 X5 WebView Cookie Jar 在当前实机环境不能假定共享；Test9-11 的直接 Cookie 同步路线已证伪。
- 首页真实内容、多分区与封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- 评论 `/loadComment` 可读取真实数据，楼中楼 `/loadReplies` 可用。
- 公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。
- 逐页面封面布局设置可用。

## Test13 / Test14 / Test16 Shell 事故与恢复结论
- Test13、Test14 在用户手机启动阶段均报 `SyntaxError: 不允许的字符：“\\”`，来源 `JSEngine#8(eval)#89(Function)`；桌面 Node/Rhino 通过并不能代表海阔运行时一定兼容。
- Test14 仅移除部分可疑模块仍失败，说明不能再靠“猜具体正则/字符”继续叠补丁。
- Recovery15 完全撤出 Test13/Test14 新运行模块，恢复到 Test12 已验证运行链，并换用全新 `bootstrap_test_v3.js` / `hanime1_remote_test_v3.txt`；用户实机确认首页恢复。
- Test16 首次发布时，新 `patch_creator.js` 本身保持零反斜杠且 Release 只是在 Recovery15 后增加该模块，但 Shell 生成过程把 `pages` 内主程序 `require(...)` 多转义了一层；用户实机再次在启动阶段报同一个 `不允许的字符：“\\”`。对比 Test15 已验证 Shell 后确认：故障来自 Shell 转义污染，不是作者/上传者业务补丁首因。
- Test16 Shell 热修原则：直接复用 Test15 已验证 Shell 原文结构，只改 `version`、Bootstrap query/build；禁止用多层 JSON 字符串二次序列化生成 `pages` 字段。热修后 Shell 为 `2026082226`。
- 后续恢复 Test13 需求必须按最小增量逐块加入，每一块先实机验证，再继续下一块。
- 新增模块优先采用 ES5 兼容写法，并在发布 Guard 中扫描反斜杠等已知风险字符；Shell 还必须与最近一次实机通过的原始转义结构逐字级对照，不得只做 JSON/Node 解析检查。

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
- 只看到 `XSRF-TOKEN + hanime1_session` 不等于登录成功；访问登录页本身即可建立匿名 Laravel Session。
- 登录完成必须以能识别 `/user/<id>` 并读取账号资料为成功标准。
- 不假设 X5 Cookie 与规则 `getCookie()` 自动共享。
- 不保存账号密码；只保存账号 Cookie。

## 已验证且禁止破坏
- X5 bridge 登录链。
- 首页/片库签名封面链。
- 视频多画质及最高画质优先顺序。
- 真选集来源 `#playlist-scroll` 且点击直接播放。
- 漫画首页/分类/详情基本数据链。
- 官网筛选 canonical `search_key`。
- 逐页面封面布局设置。

## Test16：作者 / 上传者第一阶段恢复
- 基线固定为 Recovery15；首页、登录、播放、片库、漫画、评论、布局设置均不重写。
- 新增模块 `releases/2.0.0-test.16/patch_creator.js`，源文件保持零反斜杠字符，作为海阔兼容收敛措施。
- Provider 仅覆盖 `video(id)`：
  - 作者名称继续使用官网 `#video-artist-name` / Test12 既有字段。
  - 作者头像优先 `#video-user-avatar`，再尝试相邻作者图片；过滤 placeholder/loading/spinner/transparent/data:image。
  - 上传者从 `.video-description-panel` 内 `/user/<id>` 链接解析名称、头像和用户 ID，和作者字段分开保存。
- 详情 UI 单独增加“作者与上传者”区域：作者与上传者分别显示身份、头像；点击直接进入对应关键词作品结果。
- 本版不恢复作者目录、作者公开主页、评论头像和账号中心增强，避免一次加入过多变量。

## Test16 待实机回归
- [ ] Shell `2026082226` 覆盖导入后首页继续正常，无启动 SyntaxError。
- [ ] 详情页作者名称正确，作者头像可显示。
- [ ] 详情页上传者名称正确，上传者头像可显示。
- [ ] 作者与上传者不会错误识别成同一个身份。
- [ ] 点击作者/上传者能直接进入相关作品结果。
- [ ] 登录、最高画质播放、真选集、漫画无回归。

## 后续恢复顺序
1. Test16：作者 / 上传者 + 头像（当前，Shell 热修后待验证）。
2. 实机通过后：作者目录 + 作者独立主页。
3. 再通过后：评论 / 楼中楼头像与元信息。
4. 再通过后：账号中心与订阅作者功能。
5. 主要功能稳定后做 Consolidated Candidate，将历史增量链压缩为少量 Core / Provider / Account / Pages / UI / Runtime 模块。

---
## 版本记录
### 2.0.0-test.16 / Build 20016 / 2026-08-22
- Recovery15 后第一块最小增量恢复。
- 详情页重新区分作者与上传者，并增加各自头像解析。
- 作者/上传者点击直接查看相关作品。
- 不改已验证登录、播放、首页、片库、漫画与布局链。
- 首次 Shell `2026082225` 因 `pages` 主程序入口过度转义导致海阔 `eval(Function)` 启动失败；热修 Shell `2026082226` 已恢复 Test15 实机验证过的转义结构，业务 Release 不变。

### 2.0.0-test.15 / Build 20015 / 2026-08-22
- Recovery：彻底撤出 Test13/Test14 新运行模块。
- 恢复 Test12 已实机验证链。
- 换用 Bootstrap v3 / Shell v3 与单一 Recovery Loader；用户实机确认首页恢复正常。

### 2.0.0-test.14 / Build 20014 / 2026-08-22
- 尝试修复 Test13 海阔 JS 引擎非法反斜杠错误；实机仍失败，方案废弃。
- 切换 Hanime1 官网红色 H 图标资源。

### 2.0.0-test.13 / Build 20013 / 2026-08-22
- 一次性加入作者/上传者、作者主页、账号中心、评论头像和完整分类；实机启动 SyntaxError，整体撤出运行链。

### 2.0.0-test.12 / Build 20012
- X5 网页 bridge Cookie 登录实机成功。
- 取消片库二次筛选弹层。
- 作者点击进入作品结果。
- 新增逐页面封面布局设置。

### 2.0.0-test.11 / Build 20011
- 选集点击直接播放、纯文本筛选状态、时长格式化、评论去重。

### 2.0.0-test.10 / Build 20010
- 真选集、五行筛选、评论布局继续优化。

### 2.0.0-test.8 / Build 20008
- 官网 canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页随后通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。