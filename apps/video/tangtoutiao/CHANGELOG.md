# 汤头条 CHANGELOG

## 0.1.0-test.5 / Build 10105 — 2026-08-23

状态：**Test4 实机媒体兼容修复版，仍为 Test；禁止晋级 Stable。**

### Test4 实机事实
- 视频详情主模型已正确：实机可显示真实中文标题、作者、时长、播放量、ID，并识别 `1080P/720P/480P/240P` 四档 `source_*`。说明 `data.detail + ListLikeVideoBean + source_*` 方向已经成立，不再回退通用 URL 扫描。
- 详情与列表封面仍为灰块。继续反编译 APK 后确认，`thumb_cover` 虽然是 UI Adapter 传入 Glide 的真实字段，但原 APP 注册了自定义 `GlideAppModule / ModelLoader / Decoder`，不能把 `thumb_cover` 简化为“可直接显示的普通 URL”。
- 点击播放时海阔直接弹出 `未知链接: {"urls":[...],"names":[...],"headers":[...]}`，说明 Test4 的严格 `JSON.stringify({urls,names,headers})` 在当前海阔播放入口没有被识别为多线路协议；该错误发生在播放器识别阶段，尚不能据此否定 `source_* / M3U8` 解密代理本身。
- `/api/comic/home` 实机返回 12 个漫画分类（推荐、发现、韩漫、Cosplay、3D、本子、日漫、国漫、港台漫画等），Test4 却按 `movie_3` 内容卡渲染，导致巨大空白封面块；证明该接口是分类/标签配置，不是漫画作品列表。
- “查看最近诊断”触发 `ArticleListModel-HttpRequestError: Expected URL scheme 'http' or 'https' but no colon was found`，说明 Test4 的诊断子规则路由本身错误，普通文本/空值被错误交给 HTTP ArticleListModel。

### APK 图片链复核
- `ListLikeVideoBean.thumb_cover` 仍是真实封面入口，但自定义 Glide loader 会先解析字符串；当字符串以 `{` 开头时按 JSON 选实际图片地址，已确认候选键包括 `ori / 360 / 720 / 720p`。
- 图片下载后先检查 JPEG/PNG/GIF/WEBP/BMP magic；本身已是普通图片则直接使用。
- legacy 图片密文链：HEX → 前 16 字节 IV → 图片专用 secret `e79465cfbbimgkcusimcuekd3b066a6e` → MD5 EVP 派生 AES Key → `AES/CFB/NoPadding`。
- 另一图片链使用 `AES/CBC/PKCS5Padding`，固定 Key `f5d965df75336270`、IV `97b60394abc2fbe1`。
- 海阔 Test5 使用 `<http image>@js=...` InputStream Adapter 恢复这三态：明文图片 / legacy AES-CFB / AES-CBC；诊断仅记录模式和字节长度，不记录账号 Token/Cookie。

### APK 漫画链复核
- `/api/comic/home` 返回漫画分类 Bean，核心字段为 `id / name / selected / uuid`。
- 漫画作品列表接口为 `/api//book/list_filter`，参数由 APK 明确构造为 `page / sort / categories / type`。
- 漫画列表 Bean 核心字段包括 `id / title / thumb / categories / tags / series / update_time / finished / is_free / isfree`。
- 已发现后续接口：`/api//book/detail`（详情）与 `/api/book/list_episode`（章节）；购买链 `/api//book/buy` 当前不实现伪成功。

### Test5 修改
- 新增 `ImageAdapter`：`thumb_cover/thumb` 先按 JSON 多分辨率选 URL，再通过海阔 `@js=` InputStream 执行普通图片检测、legacy AES-CFB、AES-CBC 解密并返回真实图片流。
- Core：收藏/历史保存 `coverRaw`，避免把带 `@js=` 的派生显示 URL 当原始封面再次编码；视频与漫画统一走同一图片 Adapter。
- Playback：主“立即播放”只返回当前最高可用单清晰度并附 `#isVideo=true#`，先隔离验证媒体代理；详情增加 1080P/720P/480P/240P 单独按钮。
- Playback：保留“播放器内切换”作为次级入口，但返回海阔对象字面量 `{urls:[...],names:[...],headers:[...]}`，不再使用严格 JSON 字符串。
- Playback：继续复用 Test4 已按 APK 恢复的 `source_* → 拉 M3U8 → player_cfg.dekey AES-CFB → fixM3u8 → startProxyServer` 主链。
- Comic：`comic/home` 改成紧凑三列分类导航；点击分类后调用 `/api//book/list_filter` 并按 ComicListBean 渲染漫画作品，不再把分类项当内容卡。
- Diagnostics：最近诊断直接作为设置页 `long_text + hiker://empty` 展示，不再打开会触发 ArticleListModel 的诊断子规则。

### Test5 实机验收
1. 首页与视频详情优先看封面是否恢复；若仍灰图，设置页直接查看 `ttt_last_image_diag` 的 `plain / legacy-aes-cfb / aes-cbc / raw-fallback`。
2. 播放先点“立即播放（最高画质）”或单独 `1080P/720P/...`，不要先测“播放器内切换”；若仍失败，截图播放器和设置页 `ttt_last_play_sources / ttt_last_play_diag`。
3. 漫画页应先看到紧凑分类按钮；点击一个分类后应进入作品列表，而不是 12 个巨大空白卡。
4. 设置页诊断应直接可见，不应再弹 `Expected URL scheme http or https`。
5. 只有封面、单线路播放、漫画分类列表三条链完成实机闭环后，才继续接漫画详情/章节和其它内容域。

## 0.1.0-test.4 / Build 10104 — 2026-08-23

状态：**媒体主链精确模型修复版，仍为 Test；禁止晋级 Stable。**

### Test3 实机事实
- 匿名启动会话已经真正打通：首页不再返回 401，可加载出 49 条卡片，说明 API、AES/签名、启动 Token 和内容请求主链成立。
- 首页 49 条并非真实推荐视频，而是“高端约炮 / 高端外围 / 附近约会 / 春药迷奸 / 催情迷药 / 高潮春药”等广告/推广项；说明 Test3 的递归“最佳数组”算法选中了 `banner/widget/ads`，形成了**看似成功但业务语义错误**的伪成功。
- 首页与详情全部无封面、显示灰块；APK 模型复核后确认真实视频字段为 `thumb_cover`，Test3 候选字段遗漏该字段。
- 视频详情能获得真实 ID/标题/简介，但系统顶部标题显示 `%E7...` URL 编码，说明页面参数进入 `getParam` 后需要显式 decode。
- 点击播放进入海阔播放器后显示本地 `192.168.*:52020/proxy...` 且 `0 kb/s`，无法播放。问题不是“本地代理 URL 本身错误”，而是 Test3 把未按 APP 播放器解密的媒体链直接交给海阔，代理里没有得到可播放 M3U8。

### APK 9.6.2 精确模型复核
- `/api/MvList/featuredAv` 的响应模型为 `SeeMoreDataBean`，顶层业务字段包括 `banner / list / widget`。
- `SeeMoreDataBean.list` 中每个 `ListBean` 再包含自己的 `list`；**真正推荐视频固定路径为 `data.list[].list`**。`banner/widget` 为广告/推广数据，禁止再用通用数组评分混入推荐。
- 真正视频实体为 `ListLikeVideoBean`，已确认核心字段：`id / title / thumb_cover / thumb_cover_str / member / duration_str / count_play_str / source_240 / source_480 / source_720 / source_1080 / preview_video` 等。
- 原 APP 列表适配器直接对 `thumb_cover` 调图片加载链，因此 Test4 优先使用 `thumb_cover`，`thumb_cover_str` 仅作为兜底。
- `/api/MvDetail/detail` 返回模型中的真实视频主体为 `data.detail`（`ListLikeVideoBean`），不再对整个详情对象递归猜视频实体。
- 原 APP `VideoDetailPlayerActivity` 使用 `source_240/source_480/source_720/source_1080` 作为真实播放源；Test4 不再从详情任意 URL 字段里“找第一个可疑链接”。
- 启动 `AppConfigBean.player_cfg` 提供 `dekey / refer / x_auth`。原 APP 自定义播放器数据源下载 `.m3u8` 后：若内容以 `#EXTM3U` 开头则直接使用；否则以 `dekey` 按 MD5 EVP 派生 AES Key/IV，使用 `AES/CFB/NoPadding` 解密 HEX 内容，解密结果才是真实 M3U8。

### Test4 修改
- Core：推荐固定解析 `SeeMoreDataBean.data.list[].list`，彻底排除 `banner/widget/ads`；通用递归适配仅保留给尚未恢复精确模型的其它频道，并显式跳过广告键。
- Core：视频字段切换为 `ListLikeVideoBean` 精确映射，封面优先 `thumb_cover/thumb_cover_str`；作者读 `member.nickname`；播放固定 `source_*`。
- Core：详情固定优先 `data.detail`；列表进入详情时同时携带 `source_*` 作为失败兜底。
- Core：页面参数检测 `%xx` 后 `decodeURIComponent`，修复详情系统标题和播放器标题显示 URL 编码。
- Protocol：启动配置除了 Token 外，同时持久化 `player_cfg.dekey/refer/x_auth`；诊断只记录这些配置是否存在，不输出真实值。
- PlaybackAdapter：新增专用 HLS 本地代理。代理读取远端 M3U8；明文 `#EXTM3U` 直接使用，否则按 APK 同算法用 `player_cfg.dekey` AES-CFB 解密；随后调用海阔 `fixM3u8(remoteUrl, content)` 修正 TS/KEY 相对路径，再把结果交播放器。
- PlaybackAdapter：支持 `1080P/720P/480P/240P` 多清晰度返回；嵌套 master M3U8 继续通过同一代理递归处理。
- Diagnostics：新增 `ttt_last_featured_exact / ttt_last_detail_exact / ttt_last_play_sources / ttt_last_play_diag / ttt_last_player_cfg`，后续播放失败时可以区分“没取到 source / 没取到 dekey / M3U8 解密失败 / 代理返回异常”。

### Test4 实机验收
1. 首页“今日推荐”应变为真正视频内容，不再出现约会/药物等广告推广卡。
2. 首页卡片应出现真实 `thumb_cover` 封面；详情 Hero 也应有封面。
3. 详情顶部系统标题应正常显示中文，不再显示 `%E7...`。
4. 详情应识别一个或多个 `source_*` 清晰度；点击播放后可以看到 1080P/720P/480P/240P 中实际存在的线路。
5. 播放器仍可能显示 `192.168.*` 本地代理 URL，这是 Test4 的设计：该代理负责把原 APP 的加密 M3U8 解密后再喂给海阔。验收标准是能产生码率并正常播放，而不是地址必须为远程 URL。
6. 若播放仍失败，直接进入“设置与诊断 → 查看最近诊断”，重点查看 `ttt_last_play_diag`，不得回退到通用嗅探伪成功。

## 0.1.0-test.3 / Build 10103 — 2026-08-23

状态：**第二轮实机根因修复版，仍为 Test；禁止晋级 Stable。**

### Test2 实机事实
- 用户实机首页明确返回：`code 401 · 用户已过期，请重新进入app`，`data=null`。
- 这证明当前 API 域名、最终路径、请求加密/签名与响应解密已经能够进入服务器业务层；Test2 的 P0 根因不是“列表字段没适配”，而是匿名设备身份/启动会话没有按原 APP 建立。
- Test2 的远程 Protocol/Adapter 可继续作为数据结构诊断基础，但不能跳过启动握手直接访问内容接口。
- Test2 使用 `data:image/svg+xml` 的纯几何导航图标在当前实机仍退化成彩色首字母/头像式占位图，说明 `icon_small_4` 对 data URI SVG 的兼容性不可靠；Test3 改为仓库 HTTP(S) SVG。

### APK 9.6.2 启动会话复核
- `com/tencent/mm/viewModel/x0.z(...)`：首页业务前进入 `/api/home/getOpenAdsAndVersion` 启动链，并先恢复本地身份。
- `com/tencent/mm/net/n.M1()`：公共参数真实来源包括 `system_oauth_id/system_token/system_iid` 等。
- `com/tencent/mm/ui/LaunchActivity$g.run()`：首次启动生成一个设备 ID 后，将**同一个值**同时写入 `device_id` 和 `uuid`；因此 `system_iid` 与 `system_oauth_id` 必须一致。Test1/Test2 各自随机生成两个不同 ID 是错误实现。
- `com/tencent/mm/utils/x1.a(Context)`：设备 ID 为稳定的 MD5 形态；原 APP 由 `android_id + UUID(去横线) + currentTimeMillis` 生成并持久化。海阔版保持同等稳定 32 位小写 MD5 形态并持久化。
- `com/tencent/mm/viewModel/x0$a.d(...)`：启动接口成功后读取 `BaseResponse.data` 为 `AppConfigBean`。
- `com/tencent/mm/ui/LaunchActivity.l3(AppConfigBean)`：把 `AppConfigBean.token` 保存，随后作为公共参数 `system_token` 参与内容请求。
- Token 偏好键在 APK 中为 `tangbure_token`；海阔版使用自身命名空间 `ttt_token`，不保存/输出真实敏感值到 CHANGELOG 或诊断。

### Test3 修改
- Protocol：新增统一 `ttt_device_id`，并强制 `system_oauth_id === system_iid`；旧 Test1/Test2 的两个分离 ID 不再使用。
- Protocol：没有 Token 时先调用 `/api/home/getOpenAdsAndVersion`；从启动响应提取 `AppConfigBean.token` 后再调用推荐/短视频/搜索/详情等内容接口。
- Protocol：内容接口若返回 `401` 或“用户已过期/重新进入app”，自动清 Token → 重新启动握手 → 原请求重试一次；若启动本身仍判身份过期，则重新生成匿名设备 ID 再试一次。
- Diagnostics：仅显示“设备身份是否建立 / ID 尾 6 位 / Token 是否建立 / 域名 / code/msg/schema”，不显示完整设备 ID、Token、Cookie。
- Settings：新增“重新初始化匿名身份”，用于清理 Test1/Test2 遗留错误身份并按 APK 首次启动链重建。
- UI：快捷导航图标切换为 `apps/video/tangtoutiao/assets/v010/*.svg` 远程资源，避开 data URI 兼容问题。
- UI：首页主标签收敛为“推荐 / 短视频 / 长视频 / 社区”，删除与“频道”快捷入口重复且会产生横向溢出的“更多”。
- Core：继续复用 Test2 的递归列表/字段适配，控制本轮修改范围，只解决会话 P0 与已证实 UI 兼容问题。

### Test3 实机验收
1. 重新导入 Test3 后首次首页应自动完成匿名启动握手，不再直接出现 `401 用户已过期`。
2. 若握手失败，首页应显示“启动握手失败”或“启动成功但未取得 token”的明确错误；设置页可查看无敏感信息诊断。
3. 若业务 code 成功且出现视频卡片，下一轮立即转向封面字段/图片链、详情字段和真实播放链。
4. 若业务 code 成功但仍无卡片，继续根据 `schema/list path` 精确适配，不再改身份协议。
5. 快捷入口应显示远程红色几何 SVG，不应再出现彩色首字母占位头像。

## 0.1.0-test.2 / Build 10102 — 2026-08-23

状态：**首轮实机反馈修复版。**

### Test1 实机事实
- 程序能进入首页，请求没有抛网络/解密异常，但列表未解析。
- 海阔当前实机的 `scroll_button/text_1` 等普通原生文本不会按本版写法解析 `<font>/<b>`，导致 HTML 源码直接显示。
- Data-URI SVG + Emoji 字符跨设备渲染不稳定。
- Test1 把“请求未抛异常”误当成“业务成功”；Test2 开始同时显示 `code/msg/schema`。

### Test2 修改
- UI 移除普通原生文本中的 HTML；选中态改纯文本 `●`。
- Adapter 最多 8 层递归发现数组，根据路径名 + 视频字段特征评分，并递归读取嵌套 ID/标题/封面/作者/时长/播放字段。
- Protocol 支持响应 JSON 字符串二次解包并记录 `code/msg/schema`。
- 首页/频道空列表时直接显示业务状态与响应结构。
- AES/签名核心、接口路径和播放策略本轮未改。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

状态：**首个 Test。**

### APK 与产品基线
- 来源：用户项目来源 `ttt_9.6.2_260822_3.apk`，`versionName=9.6.2`。
- 原 APP 为大型原生 Android 内容应用，包含 IJK Player、RTMP、SQLCipher 等运行库，不是简单 WebView 壳。
- 已确认产品域：长/短视频、创作者/排行榜、社区/话题、图集、小说、有声、漫画、求片、合集、粉丝团、消息/私聊、收藏历史下载、AI 创作、游戏、会员/汤币等。

### 主协议事实
- API 基线：`https://api1.wiimrdys.com/api.php`、`https://api2.wiimrdys.com/api.php`。
- 最终业务地址为 `<base>/api/...`，例如 `.../api.php/api/MvList/featuredAv`。
- 主业务接口原始 Form 参数补公共参数后转 JSON，再整体包装成 JSON 请求体：`timestamp / data / sign / _ver=v0`。
- `data`：AES/CFB/NoPadding；密钥材料 `132f1537f85scxpcm59f7e318b9epa51`；MD5 EVP_BytesToKey 风格派生 32 字节 AES Key + 16 字节 IV；输出 `IV + ciphertext` 的大写十六进制。
- `timestamp`：`floor(currentTimeMillis/1000)`，10 位秒级时间戳。
- `sign`：`SHA256('_ver=v0&data=<DATA>&timestamp=<TS>e79465cfbb39ckcusimcuekd3b066a6e')` 得小写 hex，再对该字符串做 MD5 小写 hex。
- 响应外层 JSON 的 `data` 使用同一 AES-CFB 链解密为真实业务响应。
- 公共参数包括：`system_oauth_id/system_oauth_type=android/system_app_type=local/system_token/system_version/app_status/new_player=fx/system_build_aff/system_build_id/bundle_id/system_iid/device_brand/device_model`，以及可选 `trace_id/aff_x_code`。
- APK `UMENG_CHANNEL` 回退 `a1000`；包名为 `com.tencent.mm`；测试版模拟 `system_version=9.6.2`。

### 已确认 P0 接口
- `/api/home/getOpenAdsAndVersion`：启动配置/匿名 Token 链。
- `/api/MvList/featuredAv`：`page, limit`。
- `/api/MvList/small`：`page, limit`。
- `/api/MvList/style`：无业务参数。
- `/api/MvSearch/video`：`keyword, page, limit`。
- `/api/MvDetail/detail`：`id`。
- 其它已发现域：`/api/community/*`、`/api/picture/*`、`/api/novel/*`、`/api/audio/*`、`/api/comic/*`、`/api/find/*`、`/api/RankList/*`、`/api/Creator/*`、`/api/ai/*` 等。

### 产品结构基线
- 首页：搜索、推荐/短视频/长视频/社区主内容与快捷入口。
- 内容中心：视频、创作者、排行、社区、话题、图集、小说、有声、漫画、求片、合集、粉丝团、消息、AI、游戏等。
- 搜索、视频详情、真实媒体 URL 探测、本地收藏/观看历史、设置与协议诊断已建立模块骨架。
- 付费/充值/提现等资金能力在协议和权限未验证前不伪装成功。
