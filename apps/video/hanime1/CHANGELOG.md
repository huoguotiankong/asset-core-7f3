# Hanime1 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。已验证事实与待实机验证内容必须分开记录。

## 当前基线
- 程序：Hanime1
- App ID：`hanime1`
- Legacy：`1.2.1`，仅保留历史/回退记录；用户 2026-08-22 实机明确确认旧版本无法通过当前站点验证，后续不再作为开发运行基线。
- Test：`2.0.0-test.2` / Build `20002`，入口 `apps/video/hanime1/hanime1_remote_test_v2.txt`。
- Test Shell rule version：`2026082211`。
- Test 状态：Test1 已完成首次海阔实机启动验证；Test2 修复首页完整解析与 Challenge 判定，**仍待播放/登录/账号/漫画实机回归，禁止晋级 Stable**。
- 最后更新：2026-08-22。

## 关键技术索引
### 数据源 / API
- 视频主站候选：`https://hanime1.com`、`https://hanime1.me`、`https://www.hanime2.sbs`；Test 运行时按可用 HTML 自动选择并缓存 6 小时，异常时顺序回退。
- 视频首页：解析 Hanime1 首页横向卡片结构；搜索走 `/search`，支持 query / genre / sort / date / duration / type / page。
- 视频详情：`/watch?v=<id>`；优先解析 `video#player > source`，输出海阔多线路 PlayModel（urls/names/headers）。
- 预告：`/previews/<YYYY-MM>`。
- 漫画独立站：`https://hanimeone.me`；首页 `/comics`，详情 `/comic/<id>` + `/comic/<id>/1`，按 `data-prefix` / `data-pages` / extension 表生成 `pics://` 图片序列。

### 验证 / Cookie / 登录
- Test 2.0.0 参考 Han1mePlus/APK 的会话模型重写，但未直接复制其 Flutter 源码。
- Cloudflare/站点校验检测：`cf-mitigated: challenge` 或页面含 `cf-chl-` / `challenge-form` / `Just a moment` / `Attention Required` / 浏览器检查等强特征；Test2 起不再把 Challenge 绑定到 HTTP 403，403/429/503 只作为弱特征辅助。
- 首次挑战时自动调用海阔 `fetchCodeByWebView`，使用与参考客户端一致的移动 UA 执行真实浏览器 JS；WebView Cookie 落地后自动重试原生请求。
- 自动校验仍失败时进入独立 `x5_webview_single` 验证页，由用户完成站点要求的交互校验后再检测。
- Cookie 分层：账号 Cookie 与 `cf_clearance` 分离保存；切换账号时仅切账号 Cookie，浏览器校验 Cookie继续复用。
- 网页登录：内嵌 X5 打开 `/login`，完成登录后“同步当前登录”读取当前浏览器 Cookie，解析账号资料并写入多账号存储。
- 账号切换/移除：本地最多保留 8 个账号 Cookie 条目；账号 ID、昵称、邮箱、头像用于管理显示。

### 官网账号 / 片库 / 评论
- 账号资料：`/user/<id>/edit`；支持昵称/邮箱原生表单更新。
- 密码修改：原生表单 `_method=patch,type=password,password_old,password_new,password_new_confirm`。
- 稍后看：`/user/<id>/saves`；加入使用 `/save` 且 `input_id=save`。
- 收藏：`/user/<id>/likes`；写操作 `/like`。
- 片单：`/user/<id>/playlists`、`/playlist?list=<id>`、`/createPlaylist`、`/playlist/<id>`。
- 订阅：`/subscriptions?page=1`；写操作 `/subscribe`。
- 历史：`/user/<id>/histories?sort=latest&page=1`；删除 `/user/tab-item/<videoId>`。
- 评论：`/loadComment`、`/loadReplies`、`/createComment`、`/replyComment`；Test 初版已接入读写，回复 ID 解析需实机重点回归。

### UI / 页面结构
- Test 参考附件 APK 的信息架构，用海阔原生组件重构为四区：探索 / 片库 / 缓存 / 设置。
- 探索内可切视频/漫画，并提供搜索、预告、详情、相关推荐。
- 片库对应官网稍后看 / 收藏 / 片单 / 订阅 / 历史。
- 缓存复用海阔下载中心与规则历史；不复制 APK 自有下载引擎。
- 设置包含账号中心、网页登录、浏览器验证、线路重测和 Test Remote Manager 更新/回退。
- 二级页统一使用独立 `hiker://page/<path>?rule=&simple=true`，实体 ID 写入 URL query，并保留 MY_PARAMS fallback。

## 已知风险与禁止回退方案
- 旧 1.2.1 已由用户实机确认无法通过当前验证，不再作为可用安全基线；仅保留历史记录。当前唯一开发运行线为 Remote Test，未完成核心实机回归前不得发布新的 Remote Stable。
- “自动过检验”依赖海阔 WebView 能正常执行站点校验脚本并写入 Cookie；若站点要求交互式 Turnstile/验证码，只能自动完成非交互部分，必须保留可见验证页兜底。
- 视频与漫画是两条独立域名/解析链，必须分别回归。
- 账号写操作涉及 CSRF 与当前账号 Cookie；必须测试：浏览器账号同步、受管账号切换、资料修改、密码修改、收藏/稍后看/片单/订阅/历史/评论。
- 评论 DOM 容易受官网结构变化影响；Test 初版的评论/楼中楼需要用真实账号实机核对。
- 不允许恢复“只靠多个镜像域名盲试来绕过挑战”的旧思路；域名回退只能解决主站可达性，Challenge 必须走浏览器验证/Cookie 复用链。

## 回归测试清单
- [x] Test Shell 首次导入可打开（2.0.0-test.1 实机通过）
- [x] 主站当前无 Challenge 时可直接进入真实首页（实机首卡 Claire X / Zman，与官网当前数据一致）
- [ ] 主站真正触发 Challenge 时自动 WebView 校验并恢复
- [ ] 校验失败时可见 X5 验证页可恢复
- [ ] 首页视频卡片/图片/分区
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

## 故障与恢复记录

- 2026-08-22 Test1 首次实机：Shell/四区 UI 正常启动，未出现验证页；首页只显示“推荐”下 1 张 `Claire X / Zman` 卡。与当天官网实时首页核对后确认该卡确为真实“最新上市”首项，因此“未跳验证页”是当前主站未触发 Challenge 的正常行为，故障点是首页 DOM 行解析。
- 根因：Hiker 中 `pdfh(titleAnchor, 'next&&Html')` 未等价于 Han1mePlus DOM 的 `titleAnchor.nextElementSibling.querySelector('.home-rows-videos-wrapper.horizontal-row')`，导致只吃到首卡/首片段。
- Test2 修复：首页直接并行读取 `#home-rows-wrapper > a.horizontal-row-title` 与 `#home-rows-wrapper .home-rows-videos-wrapper.horizontal-row`，按索引配对并对每行 `div.horizontal-card` 全量解析；无分区时再全页 fallback。Challenge 识别同步改为状态码无关的强标记判定。
- 2026-08-22：旧 1.2.1 为 legacy/local 单体规则，账号/挑战链无结构化长期记录；本轮不在原文件上直接大改，改为隔离发布 2.0.0-test.1 Remote Test，以 1.2.1 作为回退基线。

---
## 版本记录
### 2.0.0-test.2 / Build 20002 / 2026-08-22
- 根据首轮海阔实机截图热修。
- 首页解析移除 `next&&Html` 相邻节点方案，改为按官网真实 DOM 成组读取标题与 `.home-rows-videos-wrapper.horizontal-row`。
- 新增发布期 `device-hotfix` 模块；复用 Test1 已校验 Provider/Pages Blob，缩小修改边界。
- Cloudflare Challenge 判定不再仅限 HTTP 403；强页面/响应头特征可在 200/503 等状态下识别，仍只在真实 Challenge 时启动 WebView/X5 链。
- 旧 1.2.1 降级为历史记录，不再作为开发兼容目标。
- 状态：静态检查通过，待用户实机验证首页分区/卡片完整度，然后继续播放与账号链。

### 2.0.0-test.1 / Build 20001 / 2026-08-22
- 首个 Architecture-First 重写测试版。
- 新增 Challenge/Auth/Cookie Core、Video/Comic/Account Provider、Native Pages 三层模块与 Remote Runtime。
- 新增自动 WebView 校验 + 可见 X5 兜底。
- 新增完整账号入口、官网片库和评论写操作、多账号切换。
- UI 按附件 APK 的 Explore / Library / Cache / Settings 四区重新组织。
- Stable 1.2.1 未修改。
- 状态：静态检查通过，待海阔实机回归。

### 1.2.1 / 2026-08-18
- 原云仓库登记基线。
- 已知能力：视频 / 漫画 / 搜索 / 多画质。
