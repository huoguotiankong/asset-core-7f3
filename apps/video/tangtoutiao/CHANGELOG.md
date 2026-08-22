# 汤头条 CHANGELOG

## 0.1.0-test.1 / Build 10101 — 2026-08-23

状态：**首个 Test，禁止直接晋级 Stable；等待海阔实机验证。**

### APK 基线
- 来源：用户项目来源 `ttt_9.6.2_260822_3.apk`，APK `versionName=9.6.2`。
- APK 为原生 Android 大型内容应用，不是 WebView 壳；包含 IJK Player、RTMP、SQLCipher 等运行库。
- 已确认主要产品域：长/短视频、创作者/排行榜、社区/话题、图集、小说、有声、漫画、求片、合集、粉丝团、消息/私聊、收藏历史下载、AI 创作、游戏、会员/汤币等。

### 当前协议事实
- 默认 API 基线：`https://api1.wiimrdys.com/api.php`、`https://api2.wiimrdys.com/api.php`。
- Retrofit 内部请求 Host 为 `localhost`，域名拦截器把最终路径拼成：`<base encodedPath> + <endpoint encodedPath>`，因此 `/api/MvList/featuredAv` 实际为 `.../api.php/api/MvList/featuredAv`。
- 主业务接口为 POST FormUrlEncoded；公共参数拦截器补齐设备/版本/Token 后，加密拦截器先将 FormBody 转 JSON，再整体加密为 JSON 请求体。
- 请求外层字段：`timestamp / data / sign / _ver=v0`，Content-Type 最终为 `application/json; charset=utf-8`。
- `data`：AES/CFB/NoPadding；密钥材料 `132f1537f85scxpcm59f7e318b9epa51`；使用 MD5 EVP_BytesToKey 风格扩展为 32 字节 AES Key + 16 字节 IV，无 salt；输出 `IV + ciphertext` 后转**大写十六进制**。
- `timestamp`：`floor(currentTimeMillis/1000)`，按 `%010d` 格式。
- `sign`：先对 `_ver=v0&data=<DATA>&timestamp=<TS>e79465cfbb39ckcusimcuekd3b066a6e` 做 SHA-256 小写十六进制，再对所得字符串做 MD5 小写十六进制。
- 响应外层 JSON 取 `data` 后按同一 AES-CFB 算法解密，解密文本作为真实业务响应。
- 公共参数已确认：`system_oauth_id/system_oauth_type=android/system_app_type=local/system_token/system_version/app_status/new_player=fx/system_build_aff/system_build_id/bundle_id/system_iid/device_brand/device_model`，以及可选 `trace_id/aff_x_code`。
- APK `UMENG_CHANNEL` 默认回退 `a1000`；包名为 `com.tencent.mm`；本测试版 `system_version` 固定模拟 APK `9.6.2`。

### 已确认的 P0 接口参数
- `/api/MvList/featuredAv`：`page, limit`。
- `/api/MvList/small`：`page, limit`。
- `/api/MvList/style`：无业务参数。
- `/api/MvSearch/video`：`keyword, page, limit`。
- `/api/MvDetail/detail`：`id`。
- 其它已发现内容域包括 `/api/community/*`、`/api/picture/*`、`/api/novel/*`、`/api/audio/*`、`/api/comic/*`、`/api/find/*`、`/api/RankList/*`、`/api/Creator/*`、`/api/ai/*` 等，后续按实机优先级逐模块接入。

### Test1 产品结构
- 首页：搜索 + 推荐/短视频/长视频/社区/更多五个主入口 + 快捷功能区。
- 内容中心：视频、创作者、排行、社区、话题、图集、小说、有声、漫画、求片、合集、粉丝团、消息、AI、游戏等统一入口。
- 搜索：真实 `/api/MvSearch/video` 请求链。
- 详情：真实 `/api/MvDetail/detail`；优先递归识别 HLS/MP4/FLV 媒体 URL，找不到时显式失败，不伪造播放成功。
- 本地能力：收藏、观看历史。
- 设置：协议 smoke probe 与无敏感信息诊断记录。

### 待实机验证
1. 两个默认 API 域名当前是否仍有效，是否需要接 `/api/system/domainFeed`/远程域名喂源。
2. 首屏业务响应的真实 `code/data/list` schema。
3. 视频封面是否明文，是否触发 APK 的图片解密链。
4. 详情媒体 URL 的真实字段、是否还需二次播放接口/Token/HLS Header。
5. 社区/图集/小说/有声/漫画的具体列表模型与详情链。
6. 登录 Token、账号资料、收藏同步、消息等账号域；不得在无验证时写入伪账号状态。
7. UI 必须根据用户真实设备截图继续做第二轮布局和视觉密度优化。
