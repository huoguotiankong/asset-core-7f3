# 汤头条 CHANGELOG

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
