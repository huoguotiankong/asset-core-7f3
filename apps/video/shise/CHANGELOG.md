# 视色 CHANGELOG

## 0.1.0-test.1 / Build 10101 — 2026-09-24

状态：**首个 Test；代码/发布合同门禁通过，等待海阔实机验证；无 Stable。**

### 站点事实与架构
- [公开规则确认] `shise.me` 被成熟 AutoPager 规则与 `xchina.co / crxs.me / litu100.xyz / 8se.me` 归为同一站型，分页 `a.next`，影片/列表/人物等内容容器共享相同结构选择器。
- [项目既有实机经验] 同站型网页存在 Cloudflare / Cookie / Referer / 媒体 Header 等运行时边界，因此首版直接采用“普通 fetch → WebView/X5 会话 → stale cache”的请求链，不把 403/验证页误判为空数据。
- 独立实现 `ShiseRemoteRuntime`，不依赖小黄书 Runtime，不继承其小说/漫画/套图业务，避免跨程序耦合。

### 功能
- 首页：品牌区、搜索、分类、女优、收藏、历史、设置、动态快速分类、三列影片卡。
- 分类：从当前 `/videos.html` 导航动态提取分类，避免硬编码站点标签。
- 搜索：`/videos/keyword-<kw>/<page>.html`，支持海阔全局搜索与独立搜索页。
- 女优/模特：`/models.html` 与分页，详情解析关联 `/video/` 作品。
- 视频详情：Hero、番号/时长、主播放、播放线路、人物、分类标签、简介、相关推荐。
- 播放：支持 `var domain + var videos`、`video/source src`、m3u8、mp4；最终播放 URL 显式携带 `Referer / Origin / User-Agent / live Cookie`。
- 兜底：未解析直链或直链播放器失败时保留 `video://详情页` 网页嗅探。
- 设置：X5 打开站点完成验证、Cookie 状态、恢复官方域名、收藏/历史/原站入口、版本诊断。

### UI
- 原生海阔组件，不用 WebView 模拟首页。
- 首页主任务前置，工程诊断下沉设置。
- 详情页使用 `movie_1_vertical_pic_blur` Hero + 独立主播放按钮；列表使用 `movie_3`；分类使用 `flex_button/scroll_button`。
- 同标题同封面做视觉签名去重；封面支持 `data-original / data-src / data-lazy-src / data-url / data-bg / data-background / poster / src / srcset / CSS url(...)`。

### 发布
- Release：`apps/video/shise/releases/0.1.0-test.1/`。
- Bootstrap：`bootstrap_test_v1_b10101.js`，Remote Manager 2.0.1，`minBuild=10101`。
- Shell：`shise_remote_test_v1_b10101.txt`，规则 version `2026092401`。
- 只写入 `asset-core-7f3@main`，无 `hiker-cloud` 运行依赖。
- 首版暂不加入根规则仓库热路径；先通过直接云口令实机验证，避免未验证新站点元数据影响“我的规则仓库”首页。实机通过后再登记根 `registry/manifest` 并进入正常目录交付。

### 本次实机验收
1. 覆盖导入 Test1，设置页确认 `0.1.0-test.1 / Build 10101`。
2. 首页检查封面、标题、番号/时长是否正确绑定，翻页是否正常。
3. 分类页检查能否读出站点真实分类并进入结果。
4. 搜索一个明确番号/关键词，确认结果与原站一致。
5. 女优页进入人物详情，确认头像/信息/关联影片。
6. 视频详情确认 Hero、主播放、人物/标签、推荐层级。
7. 播放至少测试一条 MP4/HLS：总时长、码率、拖动进度；如直链失败再测网页嗅探兜底。
8. 如出现 403/Just a moment，设置 → X5 完成验证 → 返回刷新，确认 Cookie 状态和列表恢复。
9. 未完成上述实机验证前不得晋级 Stable。
