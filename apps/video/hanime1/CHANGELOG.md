# Hanime1 Changelog

> 程序级长期技术记忆。事实以用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划为准。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为运行/开发基线。
- Test：`2.0.0-test.10` / Build `20010` / Shell `2026082219`。
- 产品方向：Han1mePlus/APK 主要用于研究 Cloudflare、Cookie、官网 DOM/API 和系列结构；海阔 UI 采用原生组件重新设计，不追求像素级复制。

## 已验证实机事实
- 首页真实内容、多分区和封面已恢复。
- 视频详情封面可显示。
- 视频源可解析 1080 / 720 / 480，默认最高画质播放实机通过。
- 评论接口可读取真实评论和回复。
- 漫画首页和漫画分类链可读取。
- 公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500；程序按上游故障降级，不继续伪修。
- Test9 实机：账号密码登录仍失败；详情缺真正“选集”；播放器界面已经带出稍后看/收藏/片单/评论，详情顶部再放同类按钮造成重复；分类切换和评论 UI 仍需重构。

## 验证 / 会话架构
- WebView 仅用于 Cloudflare Challenge 与必要网页登录；正常业务直接 fetch 官网。
- 视频站与漫画站按 Origin 独立验证。
- Challenge 强特征：`cf-mitigated: challenge`、`cf-chl-`、challenge-form、Turnstile、Just a moment、Verify you are human 等。
- 账号 Cookie 与 `cf_clearance` 分离保存；交互式 Turnstile 仍必须保留可见浏览器兜底。

## 系列选集
- Han1mePlus 当前并不是把相关推荐当选集；真正系列列表来自视频详情 DOM：`#playlist-scroll .playlist-hover-wrap`。
- Test1-Test9 只解析 `#related-tabcontent`，因此始终没有选集。
- Test10 在 Provider 层新增 playlist 解析：优先 Hiker CSS 选择器，失败回退原始 HTML `playlist-scroll` 区块扫描。
- UI 将 `video.playlist` 独立展示为“选集 · N”，当前集高亮；相关推荐继续独立展示，禁止混用。

## 登录
- Han1mePlus 当前主登录实现是 InAppWebView 登录后直接读取 WebView Cookie；同时官方项目也保留“手动 Cookie 登录”。
- 海阔 X5 与规则 `getCookie()` 的 Cookie Jar 在本机实测不能可靠自动同步，因此 Test7/8 X5 同步失败。
- Test9 尝试普通 `fetch` POST CSRF 表单，实机仍失败。
- 海阔官方文档明确提供 `fetchCookie(url, options)`，专门返回响应 Cookie；Test10 改为：
  `GET /login -> CSRF -> fetchCookie(POST /login) -> 合并 Cookie -> 用显式 Cookie 请求首页/资料页 -> 校验账号 -> 保存账号`。
- 仍保留“粘贴 Cookie 登录”作为可靠备用；密码只暂存在 MyVar，提交或离开页面立即清除。
- Test10 原生 Cookie 捕获链仍需真实账号实机验证，未验证前不得宣称完整账号功能完成。

## Test10 UI / 产品结构
### 顶层导航
- 收敛为：推荐 / 片库 / 漫画 / 我的 / 设置。
- 不再在“探索”下面重复放视频/漫画二级切换。

### 片库筛选
- 参考用户提供的网飞猫截图的信息密度与筛选交互，但不照抄视觉。
- 每个筛选维度单独一行：左侧绿色维度名 + 常用选项 + 右侧 `›`。
- 常用项点击立即刷新当前片库；`›` 使用海阔 `select://` 三列弹层展示完整选项。
- 行：类型 / 排序 / 日期 / 时长 / 标签。
- 完整分类页仅作为低频 exhaustive taxonomy，不再是日常筛选必经路径。

### 视频详情
- 顶部主操作只保留：播放 / 评论 / 下载。
- 稍后看 / 收藏 / 加入片单不再在详情顶部重复堆叠，避免和海阔播放器内已经出现的操作重复。
- 新增独立选集行。
- 标签默认只展示前 12 个，剩余标签通过“三列全部标签弹层”查看并直接进入结果，避免详情页被几十个标签淹没。
- 作品信息、简介、画质、相关推荐继续保留。

### 评论
- 每条评论拆成两层：`avatar` 仅显示头像/用户名/时间/回复数；正文使用独立 rich_text。
- 每页 15 条，楼中楼相同结构，避免用户名和长正文互相挤压。

## 已验证且禁止破坏
- 首页/片库签名封面链。
- 视频多画质及最高画质优先顺序。
- 漫画首页/分类/详情基本数据链。
- 评论真实数据接口。
- 官网筛选 canonical `search_key`。

## 待 Test10 实机回归
- [ ] playlist 选集数量、顺序、当前集高亮、切集
- [ ] 播放后播放器是否不再重复显示由详情顶部带入的账号按钮
- [ ] 片库五行筛选的常用项直点与 `›` 三列完整弹层
- [ ] Test10 首页/漫画顶层导航排版
- [ ] 评论头像头部 + 正文布局
- [ ] `fetchCookie` 登录能否真实建立账号会话
- [ ] 登录后“我的”五个账号栏目
- [ ] 长标签详情的“前 12 + 全部标签弹层”

## 技术债
- Test10 为保证实机增量安全，继续在 Test9 后追加覆盖模块，Release 模块数量偏多。
- Test10 核心交互验证通过后，应建立新的 consolidated Candidate runtime，把 Test1-10 热修链压缩为 Core / Provider / Pages / Account / Runtime 少量模块，再考虑 Stable。

---
## 版本记录
### 2.0.0-test.10 / Build 20010 / 2026-08-22
- 补官网 `#playlist-scroll .playlist-hover-wrap` 真正系列选集。
- 片库改为成熟影视 App 式五行筛选 + 三列完整弹层。
- 顶层导航收敛，视频详情去除与播放器重复账号按钮。
- 登录改 `fetchCookie` 捕获会话 Cookie + 显式 Cookie 校验。
- 评论改头像头部 + 独立正文，每页 15 条。
- 标签默认折叠为前 12 个 + 全部标签弹层。

### 2.0.0-test.9 / Build 20009
- 筛选点即结果、详情标签直达结果、普通 CSRF 表单登录尝试、预告上游故障降级。

### 2.0.0-test.8 / Build 20008
- 官网真实 canonical search_key、完整视频/漫画 taxonomy、signed lazy cover、详情标签元信息。

### 2.0.0-test.6 / Build 20006
- WebView 只负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页随后通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
