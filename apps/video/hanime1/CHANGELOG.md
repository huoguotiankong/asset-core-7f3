# Hanime1 Changelog

> 程序级长期技术记忆。事实以用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划为准。

## 当前基线
- Legacy `1.2.1`：仅保留历史。
- Test：`2.0.0-test.11` / Build `20011` / Shell `2026082220`。
- Stable 尚未晋级；Test11 继续等待海阔实机回归。

## 已验证实机事实
- 首页真实内容、多分区和封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- 漫画首页和分类链可用；公开片库无需登录可浏览。
- 评论接口能读取真实评论。
- Test10 已确认 `#playlist-scroll .playlist-hover-wrap` 真选集解析正确，示例详情可得到 4 集。
- Test10 实机问题：点击其它集会再进一个详情页，而用户期望直接播放；当前集/筛选/顶部 Tab 的 `<b><font>` 在 `scroll_button` 被原样显示；时长仍显示原始秒数；评论用户名与时间存在重复；登录仍未成立。
- Test10 登录诊断：`HTTP 200 · CSRF 正常 · Cookie XSRF-TOKEN, hanime1_session`。这只证明匿名 Laravel 会话存在，不代表账号认证成功。

## 系列选集
- 真选集来源固定为 `#playlist-scroll .playlist-hover-wrap`；`#related-tabcontent` 仅为相关推荐，禁止混用。
- Test11：详情选集按钮直接调用 `play(episodeId)`；当前集以 `▶` 标记，点击当前集也直接播放。

## UI 兼容
- 用户当前海阔环境中，`scroll_button` 上 `<b><font ...>` 被按普通字符串显示。
- Test11 顶层 Tab、片库五行筛选、选集全部改为纯文本状态：`●` / `▌` / `▶`，不再依赖 HTML 着色。
- 原始秒数统一格式化为 `mm:ss` 或 `h:mm:ss`。

## 评论
- Test11 对评论/回复元数据做规范化：从时间字符串提取“回复数”，删除用户名末尾重复的相对时间，并去掉时间字段中的“· N 回复”重复信息。
- 评论正文改 `long_text` + 分隔线，头像行只承担用户/时间/回复数。

## 登录
- Han1mePlus 当前主登录并非原生邮箱密码 POST：它直接使用 InAppWebView 打开 `/login`，成功跳离登录页后读取 WebView Cookie；同时保留手动 Cookie 登录。
- Test9/Test10 的原生表单/fetchCookie 登录属于海阔侧额外尝试，实机未成功，因此 Test11 停止继续猜表单。
- Test11 登录页直接嵌入 `x5_webview_single` 官方登录页；用户在网页完成登录后点击“同步登录状态”，程序读取 `getCookie(base)` 并用 `profile()` 明确校验账号，再保存账号。
- 若当前海阔版本 X5 Cookie 与 `getCookie()` 仍不共享，保留手动 Cookie 登录；在实机确认前不得宣称完整账号功能已完成。

## 已验证且禁止破坏
- 首页/片库签名封面链。
- 视频多画质及最高画质优先顺序。
- 漫画首页/分类/详情基本数据链。
- 官网筛选 canonical `search_key`。

## 待 Test11 实机回归
- [ ] 选集 4 集是否全部显示，点击任意一集是否直接进播放器
- [ ] 顶部 Tab / 五行筛选 / 当前选集是否彻底没有 `<b><font>` 原样文本
- [ ] 966 秒是否显示为 `16:06`
- [ ] 评论用户名/时间是否不再重复，长评论排版是否更紧凑
- [ ] WebView 官网登录成功后“同步登录状态”能否识别账号
- [ ] 登录后的我的/稍后看/收藏/片单/订阅/历史

## 技术债
- Test11 为低风险实机增量，Release 暂时继续叠加覆盖模块。
- 等上述核心链稳定后建立 consolidated Candidate runtime，压缩 Test1-11 热修链，再考虑 Stable。

---
## 版本记录
### 2.0.0-test.11 / Build 20011 / 2026-08-22
- 选集点击改为直接播放。
- Tab/筛选/选集去 HTML，改纯文本状态标记。
- 时长秒数格式化。
- 评论用户名/时间/回复数去重并压缩排版。
- 登录回归 Han1mePlus 的 WebView 登录 + Cookie 同步路线。

### 2.0.0-test.10 / Build 20010
- 补官网真选集、五行筛选、详情去重复操作、fetchCookie 登录尝试、评论头像头部。

### 2.0.0-test.9 / Build 20009
- 筛选点即结果、详情标签直达结果、普通 CSRF 表单登录尝试。

### 2.0.0-test.8 / Build 20008
- 官网 canonical search_key、完整视频/漫画 taxonomy、signed lazy cover、详情标签元信息。

### 2.0.0-test.6 / Build 20006
- WebView 只负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页随后通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
