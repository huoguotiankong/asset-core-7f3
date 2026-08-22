# Hanime1 Changelog

> 程序级长期技术记忆。事实以用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划为准。

## 当前基线
- Legacy `1.2.1`：仅保留历史。
- Test：`2.0.0-test.12` / Build `20012` / Shell `2026082221`。
- Stable 尚未晋级；Test12 等待海阔实机回归。

## 已验证实机事实
- 首页真实内容、多分区与封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- `#playlist-scroll .playlist-hover-wrap` 真选集已能解析；Test11 已改为点击集数直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- 评论接口可读取真实评论；Test11 去除了用户名/时间重复，但 UI 仍继续优化。
- 公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## Test11 实机反馈
- 登录仍未成立：规则侧只能看到 `XSRF-TOKEN, hanime1_session` 匿名会话。
- 说明 X5 WebView Cookie 与规则 `getCookie()` 在当前实机环境仍不共享。
- 片库 `›` 二次弹层仍显多余；用户要求点条件直接看到结果。
- 完整分类页信息量基本正确，但不希望再通过 `>` 才看到完整选项。
- 详情作者按钮无动作。
- 用户要求设置页增加类似 JavDB v3 的逐页面封面排版设置。

## 登录架构
- Han1mePlus 当前主登录：WebView 打开 `/login`，网页登录成功后读取 WebView Cookie。
- 海阔官方网页桥接明确支持 `fy_bridge_app.getCookie('')`，并说明可读取当前网页域名 Cookie，包括 HttpOnly；同时 `fy_bridge_app.putVar()` 可将值传给规则 JS。
- Test12 不再依赖 X5 与规则 Cookie Jar 自动共享，而是在 X5 页面注入 JS：
  `fy_bridge_app.getCookie('') -> putVar('hanime12_web_cookie') -> 原生页 importCookie() -> profile 校验账号 -> saveAccount()`。
- 登录成功跳离 `/login` 后，网页桥接触发 `refreshPage(true)`，原生页优先消费桥接 Cookie。
- 仍保留手动 Cookie 登录兜底；不保存账号密码。
- 该桥接链尚待本机实测，验证通过前不得写入跨程序 Guide。

## 筛选 / 分类
- Test12 一级片库取消所有 `› -> select://` 二次选择。
- 类型 / 排序 / 日期 / 时长：同一横向行展示完整官方选项，点击立即刷新。
- 标签：一级片库保留高频标签 + “全部标签”；全部标签进入完整分类页。
- 完整分类页所有条件均为直接结果链接，不存在“应用筛选”或再次选择。

## 详情
- 作者点击按 Han1mePlus 真实交互走 `/search?query=作者名` 语义，对应海阔 `hanimeVideoResults?query=...`，展示该作者关键词作品结果。
- 真选集继续独立于相关推荐，点击直接播放。
- 标签继续点击直达结果。

## 页面封面布局
- 参考 JavDB v3 “页面封面布局”产品模式，但 Hanime 独立实现。
- 独立作用域：推荐首页、公开片库、搜索结果、分类结果、详情相关推荐、漫画首页、漫画列表。
- 每个页面可选：三列海报 / 两列大图 / 单列图文。
- 设置持久化在 `hanime12_layout_*`，互不干扰。

## 评论
- Test12 每页 12 条。
- 头像行仅承担用户 / 时间 / 回复数；正文单独 long_text；有回复时单独显示“查看 N 条回复 ›”。
- 继续使用真实 `/loadComment` 与 `/loadReplies` 数据，不改变协议层。

## 已验证且禁止破坏
- 首页/片库签名封面链。
- 视频多画质及最高画质优先顺序。
- 真选集来源 `#playlist-scroll`。
- 漫画首页/分类/详情基本数据链。
- 官网筛选 canonical `search_key`。

## 待 Test12 实机回归
- [ ] X5 官网登录后是否自动回传 Cookie 并识别真实账号
- [ ] 手动“同步一次”是否能用 bridge Cookie 成功导入账号
- [ ] 片库所有 `>` 二次筛选是否彻底消失
- [ ] 类型/排序/日期/时长横向完整选项点击是否立即刷新
- [ ] 完整分类页点击任意项是否直接进入结果
- [ ] 详情作者是否进入该作者作品搜索结果
- [ ] 评论卡片层级与楼中楼入口是否更清晰
- [ ] 七个页面的封面布局设置是否独立生效

## 技术债
- 当前 Test1-11 为增量覆盖链；Test12 本轮按职责拆为 9 个 UI 覆盖模块，运行顺序清晰，但累计模块仍偏多。
- 核心交互稳定后必须建立 consolidated Candidate runtime，压缩为 Core / Provider / Pages / Account / UI / Runtime 少量模块，再考虑 Stable。

---
## 版本记录
### 2.0.0-test.12 / Build 20012 / 2026-08-22
- X5 网页桥接 Cookie 登录。
- 取消片库二次筛选弹层。
- 作者点击进入作品结果。
- 评论卡片继续重排。
- 新增逐页面封面布局设置。

### 2.0.0-test.11 / Build 20011
- 选集点击直接播放、纯文本筛选状态、时长格式化、评论去重、WebView 登录尝试。

### 2.0.0-test.10 / Build 20010
- 真选集、五行筛选、fetchCookie 登录尝试、评论头像头部。

### 2.0.0-test.8 / Build 20008
- 官网 canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页随后通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
