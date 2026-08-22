# Hanime1 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。已验证事实与待实机验证内容必须分开记录。

## 当前基线
- Legacy：`1.2.1` 仅保留历史记录，不再作为开发运行基线。
- Test：`2.0.0-test.6` / Build `20006` / Shell `2026082215`。
- 当前目标：不追求 APK 像素级复刻；Han1mePlus/APK 只作为 Cloudflare、Cookie、登录与官网协议参考。海阔主实现以“验证后直接读取官网”为准。

## 已验证实机事实
- Test1：Shell/四区 UI 可打开；主站无 Challenge 时能直接进入真实首页。
- Test3：首页第一分区恢复 12 张卡，详情封面恢复。
- Test5：评论已能读取真实评论；详情已解析到 720 / 480 / 1080 三条画质；详情封面可见。
- Test5 仍存在：首页 Banner/卡片图片为空；漫画、预告、片库未获取到有效内容；详情与评论 UI 需要优化；播放线路顺序不是最高画质优先。

## Test6 架构重置
### Session / Cloudflare
- WebView 仅负责两件事：Cloudflare Challenge 与网页登录。
- 视频站与漫画站按 Origin 独立验证；`ensureSession(url)` 先原生 GET，只有真实 Challenge 才调用 `fetchCodeByWebView`，验证完成后重新原生 GET。
- Challenge 判定覆盖 `cf-mitigated: challenge`、`cf-chl-`、challenge-form、Turnstile、Just a moment、Verify you are human 等强特征；403/429/503 仅作为辅助。
- 浏览器 Cookie 继续由海阔 `getCookie()` 读取；通过验证后业务请求直接 fetch 官网，不把 WebView 当正文数据源。

### 官网直读 Provider
- Test6 不再加载 Test3/4/5 的热修模块；只保留 Test1 Core/Provider 作为基础协议工具，所有核心数据函数由 `patch_web_base.js` + `patch_web_more.js` 重写。
- 首页：原始 HTML 按 `horizontal-row-title` / card 分区；图片精确优先读取 `img.main-thumb[src]`，不再优先 data-src，也不再给签名 CDN 图片强加 `@headers`。
- 视频详情：直接解析 `og:title`、`video#player poster` / `og:image`、作者、观看、日期、简介、相关推荐。
- 播放：直接解析全部 `<source>`；按画质数字降序排序，最高画质排 PlayModel 第一线路；Header 使用当前 watch 页 Referer。
- 搜索：直接请求 `/search` 并解析官网视频卡。
- 预告：直接请求 `/previews/<YYYY-MM>`，从原始 HTML 解析预告卡；解析不到时 UI 保留官网 X5 入口。
- 漫画：独立站 `https://hanimeone.me`；首页/列表/详情/阅读全部改为 raw HTML；漫画站 Challenge 单独验证。
- 片库：登录后按当前 tab 单独请求 `/saves`、`/likes`、`/playlists`、`/subscriptions`、`/histories`，避免每次一次性请求全部五页。
- 评论：继续使用 `/loadComment`、`/loadReplies`、`/createComment`、`/replyComment`，保留已实机验证可读的 raw HTML 解析。

### UI
- 详情页以“封面 + 元信息 + 播放/稍后看/收藏/片单/评论/下载”为主；显示“默认优先最高画质”。
- 评论页系统标题固定为“评论”，视频全名放内容区；评论卡只显示用户名、正文、时间、回复数，避免上一版信息挤在同一行。
- 片库未登录时明确提示：只需在官网 WebView 登录一次，之后直接用浏览器 Cookie 请求官网。
- 设置页增加视频站/漫画站独立会话检查与验证入口。

## Challenge / Cookie 约束
- 不允许为了“自动过验证”对正常页面强制打开 WebView。
- 交互式 Turnstile/验证码无法保证完全无人值守；必须保留可见 X5 验证页兜底。
- 账号 Cookie 与 `cf_clearance` 不应互相覆盖；受管账号继续可保留，但默认优先浏览器会话直读。
- 不恢复“盲试多个镜像域名绕挑战”的旧方案。

## 回归清单
- [x] Shell 可打开
- [x] 首页列表数据可解析
- [x] 详情封面可见
- [x] 评论可读取真实评论
- [x] 详情可解析 720 / 480 / 1080 三条画质
- [ ] Test6 首页 Banner/卡片封面恢复
- [ ] Test6 播放默认最高画质
- [ ] Test6 预告列表
- [ ] Test6 漫画首页/详情/阅读
- [ ] Test6 网页登录后片库直读
- [ ] 搜索筛选/翻页
- [ ] 视频站真实 Challenge 自动 WebView 恢复
- [ ] 漫画站真实 Challenge 自动 WebView 恢复

---
## 版本记录
### 2.0.0-test.6 / Build 20006 / 2026-08-22
- 架构收敛版：WebView 只做验证/登录，业务全部官网直读。
- 移除 Test3-5 热修加载链，运行模块从 14 个缩减为 9 个。
- 首页图片按 `main-thumb[src]` 精确读取，不再追加图片 headers。
- 播放线路按画质降序，最高画质优先。
- 重写预告、漫画、片库直读链，并优化详情/评论 UI。

### 2.0.0-test.5 / Build 20005
- Test4 审计修正版；评论真实数据已在后续实机验证可读。

### 2.0.0-test.4 / Build 20004
- 图片/播放/评论/账号综合热修，后续由 Test6 架构重置取代。

### 2.0.0-test.3 / Build 20003
- 原始 HTML 首页分区/卡片解析，实机第一分区恢复 12 条；详情封面恢复。

### 2.0.0-test.2 / Build 20002
- 首页相邻节点与 Challenge 判定热修。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
