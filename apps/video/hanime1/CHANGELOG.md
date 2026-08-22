# Hanime1 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。已验证事实与待实机验证内容必须分开记录。

## 当前基线
- 程序：Hanime1
- App ID：`hanime1`
- Legacy：`1.2.1`，仅保留历史/回退记录；用户 2026-08-22 实机明确确认旧版本无法通过当前站点验证，后续不再作为开发运行基线。
- Test：`2.0.0-test.3` / Build `20003`，入口 `apps/video/hanime1/hanime1_remote_test_v2.txt`。
- Test Shell rule version：`2026082212`。
- Test 状态：Test1/Test2 已完成两轮海阔实机反馈；Test3 已发布并通过静态/模拟解析检查，**待首页完整度、详情封面、播放、登录/账号、漫画实机回归，禁止晋级 Stable**。
- 最后更新：2026-08-22。

## 关键技术索引
### 数据源 / API
- 视频主站候选：`https://hanime1.com`、`https://hanime1.me`、`https://www.hanime2.sbs`；Test 运行时按可用 HTML 自动选择并缓存 6 小时，异常时顺序回退。
- 视频首页：官网真实首页包含大量分区，如最新上市、最新上传、裏番、泡面番、Motion Anime、3DCG、2.5D、2D动画、AI生成、MMD 等。
- 搜索：`/search`，支持 query / genre / sort / date / duration / type / page。
- 视频详情：`/watch?v=<id>`；播放源优先解析 `video#player > source`，输出海阔多线路 PlayModel（urls/names/headers）。
- 预告：`/previews/<YYYY-MM>`。
- 漫画独立站：`https://hanimeone.me`；首页 `/comics`，详情 `/comic/<id>` + `/comic/<id>/1`，按 `data-prefix` / `data-pages` / extension 表生成 `pics://` 图片序列。

### 验证 / Cookie / 登录
- Test 2.0.0 参考 Han1mePlus/APK 的会话模型重写，但未直接复制其 Flutter 源码。
- Challenge 检测：`cf-mitigated: challenge` 或页面含 `cf-chl-` / `challenge-form` / `Just a moment` / `Attention Required` / 浏览器检查等强特征；403/429/503 只作为弱特征辅助。
- 首次挑战时自动调用海阔 `fetchCodeByWebView`，使用与参考客户端一致的移动 UA 执行浏览器 JS；Cookie 落地后自动重试原生请求。
- 自动校验失败时进入独立 `x5_webview_single` 验证页；只有站点真实触发 Challenge 才应跳验证页，当前主站若直接返回真实内容则不应强制验证。
- Cookie 分层：账号 Cookie 与 `cf_clearance` 分离保存；切换账号时仅切账号 Cookie，浏览器校验 Cookie 继续复用。
- 网页登录：X5 打开 `/login`，完成登录后同步浏览器 Cookie，再解析账号资料并写入多账号存储。

### 官网账号 / 片库 / 评论
- 账号资料：`/user/<id>/edit`；支持昵称/邮箱原生表单更新。
- 密码修改：`_method=patch,type=password,password_old,password_new,password_new_confirm`。
- 稍后看：`/user/<id>/saves`；写操作 `/save`。
- 收藏：`/user/<id>/likes`；写操作 `/like`。
- 片单：`/user/<id>/playlists`、`/playlist?list=<id>`、`/createPlaylist`、`/playlist/<id>`。
- 订阅：`/subscriptions?page=1`；写操作 `/subscribe`。
- 历史：`/user/<id>/histories?sort=latest&page=1`；删除 `/user/tab-item/<videoId>`。
- 评论：`/loadComment`、`/loadReplies`、`/createComment`、`/replyComment`。

### UI / 页面结构
- Test 参考附件 APK 信息架构，用海阔原生组件重构为探索 / 片库 / 缓存 / 设置四区。
- 探索内可切视频/漫画，并提供搜索、预告、详情、相关推荐。
- 片库对应官网稍后看 / 收藏 / 片单 / 订阅 / 历史。
- 缓存复用海阔下载中心与规则历史。
- 设置包含账号中心、网页登录、浏览器验证、线路重测和 Remote Manager 更新/回退。
- 二级页统一使用独立 `hiker://page/<path>?rule=&simple=true`。

## 首页解析故障链
### Test1 / Build 20001
- 实机：Shell/四区 UI 正常启动；主站直接返回真实首页，因此未跳验证页；首页只显示一张普通视频卡 `Claire X / Zman`。
- 结论：不是 Challenge 问题，而是首页 DOM 解析不完整。

### Test2 / Build 20002
- 修复尝试：移除 `next&&Html`，改用 Hiker `pdfa` 直接读取 `.home-rows-videos-wrapper.horizontal-row`。
- 实机：Banner `Miracle&Cafe&Diamond` 正常 + 第一张普通卡 `Claire X`，仍只有 2 个可见内容；说明 Hiker 对该站复杂首页 DOM 的列表遍历仍不可靠。
- 同轮发现：视频详情文字、简介能够解析，但详情 Hero 封面为空/占位，说明旧 `video()` 对 `<video poster>` 根节点属性读取方式有问题。

### Test3 / Build 20003
- 首页彻底不再依赖 Hiker DOM 列表遍历：直接对原始 HTML 按 `horizontal-row-title` 切分分区，再按 `horizontal-card` 开始位置切卡片块，从原始字符串解析 `watch?v=`、图片、标题、时长、评分、观看、作者、更新时间。
- 若分区解析异常，再全页扫描 `watch?v=` 作为 fallback；分区标题临时显示 `标题 · 数量`，方便实机确认解析完整度。
- 详情封面补丁：旧 `video()` 返回 cover 为空时，从原始 HTML 的 `video#player` `poster` 属性补取；仍为空则再取 `meta[property=og:image]`。
- 本地模拟回归：2 个分区（2+1 张卡）可正确解析，`og:image` 详情封面 fallback 正常；仍需真实海阔实机验证。

## 已知风险与禁止回退方案
- 旧 1.2.1 已实机确认无法通过当前验证，不再作为可用安全基线，仅保留历史记录。
- 未完成核心实机回归前不得发布新的 Remote Stable。
- 自动过检验依赖海阔 WebView 能执行站点校验脚本并写入 Cookie；若站点要求交互式 Turnstile/验证码，必须保留可见验证页兜底。
- 视频与漫画是独立域名/解析链，必须分别回归。
- 账号写操作涉及 CSRF 与当前账号 Cookie；必须实测浏览器账号同步、账号切换、资料/密码、收藏/稍后看/片单/订阅/历史/评论。
- 不允许恢复“只靠多个镜像域名盲试来绕过挑战”的旧思路。

## 回归测试清单
- [x] Test Shell 首次导入可打开
- [x] 主站无 Challenge 时可直接进入真实首页
- [ ] Test3 首页分区/卡片数量完整
- [ ] Test3 视频详情封面恢复
- [ ] 主站真正触发 Challenge 时自动 WebView 校验并恢复
- [ ] 校验失败时可见 X5 验证页可恢复
- [ ] 搜索与筛选/翻页
- [ ] 视频详情与多画质播放
- [ ] 下载入口
- [ ] 漫画首页/详情/`pics://` 阅读
- [ ] 网页登录 + 同步当前账号
- [ ] 多账号切换/移除
- [ ] 昵称/邮箱修改
- [ ] 密码修改
- [ ] 稍后看 / 收藏 / 片单创建与读取
- [ ] 订阅 / 历史
- [ ] 评论 / 回复
- [ ] Remote Test 检查更新 / 更新 / 回退

---
## 版本记录
### 2.0.0-test.3 / Build 20003 / 2026-08-22
- 第二轮实机反馈后的结构性热修。
- 首页改为原始 HTML 分区/卡片切块解析，绕开 Hiker DOM 列表遍历兼容问题。
- 分区标题增加数量诊断。
- 视频详情封面增加 `video poster` / `og:image` 双重 fallback。
- 继续保留 Test1 Core/Provider/Pages，只新增隔离 hotfix，缩小改动范围。

### 2.0.0-test.2 / Build 20002 / 2026-08-22
- 修复首页相邻节点解析并扩展 Challenge 判定，但实机仍只得到 Banner + 第一张普通卡。

### 2.0.0-test.1 / Build 20001 / 2026-08-22
- 首个 Architecture-First 重写测试版。
- 新增 Challenge/Auth/Cookie Core、Video/Comic/Account Provider、Native Pages 与 Remote Runtime。

### 1.2.1 / 2026-08-18
- 原 legacy/local 单体规则，仅保留历史记录。
