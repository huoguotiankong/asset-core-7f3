# 汤头条 CHANGELOG

## 0.1.0-test.12 / Build 10112 — 2026-08-23

状态：**参考现成海阔规则建立双 Provider 的兼容增强版，仍为 Test；禁止晋级 Stable。**

### Test11 实机事实
- 用户实机确认 Test11 的短视频接口退化为 `code 200 / list[0]`；社区首页虽然返回 5 个入口，但旧页面把“关注 / 热门 / 发现 / 精选推荐 / 狼友交流”当内容卡片渲染，形成巨大空白区域。
- Test11 诊断同时确认：精选真实模型仍有 403 条；长视频详情已能稳定识别 `locked / coins / preview`，收费语义成立；部分免费短视频完整 HLS 已出现 `duration == expected`，说明既有 Test10 PlaybackAdapter 本身不需要推倒重写。
- 用户上传 `汤头条2.hk小程序.zip` 作为旁路参考。拆包后确认该规则使用同一站点 PWA API：`https://dpi4.tbrapi.org/pwa.php/api/...`，请求合同为 `client=pwa + AES-CFB + SHA256→MD5 sign`，PWA `system_version=3.0.1`。
- 参考规则短视频使用 `/api/MvList/smallVideoByTag`，搜索使用 `/api/MvSearch/video`；图片明确使用 `AES/CBC/PKCS5Padding`，key=`f5d965df75336270`、iv=`97b60394abc2fbe1`。这为当前短视频空列表和长视频灰封面提供了新的已验证海阔实现依据。
- 参考规则还会对 `preview_video` 改写域名并删除 `seconds=30`。这可能改变试看/付费边界，正式程序**不复制该行为**；收费内容仍以 App Provider 的 `isfree/is_pay/coins` 和官方解锁接口为准。

### Test12 修改
- **App + PWA 双 Provider**：App Provider 继续负责启动 Token、详情、收费状态、漫画、评论/社区与播放授权；新增 PWA Provider 仅作为短视频、搜索和列表兼容层。
- **PWA 协议独立模块**：新增 `pwa.js`，按参考规则恢复 `client=pwa`、固定 AES-CFB key/iv、`SHA256→MD5` 签名、表单 POST 与响应解密；使用独立 PWA device id，不污染 App 设备/Token。
- **短视频恢复**：优先调用 PWA `/api/MvList/smallVideoByTag?page=1&tag=recommend`；失败后依次回退 App `/api/MvList/smallVideoByTag` 和 `/api/MvList/small`。
- **短视频直接播放保持**：卡片仍不进二级详情，但点击后先按视频 ID 调 App `/api/MvDetail/detail`，根据真实 `source_* / isfree / is_pay / coins` 决定完整播放、官方试看或提示需解锁；不直接照抄参考规则删除试看参数。
- **图片链改用参考规则已验证边界**：在最终 Adapter 输出层覆盖封面/头像 URL，使用 `原图 URL + @js`，JS 直接读取 `input`，先识别明文 JPEG/PNG/GIF/WebP/BMP，再按参考规则执行 `AES/CBC/PKCS5Padding` 解密；避免 Test11 自建 placeholder/self-fetch 与海阔图片线程行为不一致。
- **搜索兼容**：搜索优先 PWA `/api/MvSearch/video`，无结果或失败时回 App Provider。
- **社区 UI 修复**：`community/home` 的 5 个入口改为紧凑频道 chip，不再渲染成巨大空卡；优先读取服务端动态 `api_list/params_list`，没有时尝试 `/api/community/list_post`，失败再回 `/api/community/list_post2`。帖子详情仍保留后续独立 Adapter，不伪造。
- **播放边界保持**：Test10 PlaybackAdapter 继续负责 HLS sniff、AES-CFB M3U8、包装 URL 和时长完整性校验；Test12 不重复实现播放器。
- Release / Bootstrap / Shell 派生为不可变 Test12 / Build10112；Shell rule version `2026082313`。

### Test12 实机验收
1. 首页短视频：应不再出现 `list[0]`；设置页 `ttt_last_short_provider` 应优先显示 `provider=pwa`，`ttt_last_pwa.path` 应为 `/api/MvList/smallVideoByTag`。
2. 短视频点击：直接进入播放，不打开二级详情；若 App 详情判定收费，只允许官方试看/提示解锁，不自动消费。
3. 精选/长视频封面：`ttt_last_image_policy.mode` 应为 `pwa-proven-cbc-inline`；若仍灰，提供 `ttt_last_image_diag`，重点看 `ok/mode/input/output`。
4. 搜索：PWA 有结果则显示 `PWA兼容`，PWA 失败自动回 App。
5. 社区：顶部 5 个频道应紧凑排列，不再出现大面积空白；若帖子仍未出，提供 `ttt_last_community_home + ttt_last_community_list`，继续补真实参数。
6. 免费长视频播放保持 Test10 已验证链，不因 Test12 双 Provider 退化。

## 0.1.0-test.11 / Build 10111 — 2026-08-23

状态：**Test10 实机继续修复版，仍为 Test；禁止晋级 Stable。**

### Test10 实机事实
- 短视频封面已经恢复，证明 API、图片字段和基础图片解密能力成立；精选/长视频/详情封面仍有大量灰图，说明原 APP 的图片 ModelLoader 还存在宿主图片预取之外的自取/候选重试行为。
- Test10 已正确识别媒体类型。实机 34:52 视频的详情只下发 `1080P=2 秒维护片` 与 `preview=120.1 秒`，二者都与标称 2092 秒明显不匹配；这已经不是 HLS 解密错误，而是访问权限/试看语义。
- APK 模型进一步确认 `ListLikeVideoBean` 存在 `isfree / coins / is_pay / preview_tip / preview_video`。`VideoDetailPlayerActivity` 的界面逻辑为：`isfree != 0` 显示无限看；`isfree == 0 && coins > 0` 为收费，`is_pay=true` 显示已购买，否则显示马上购买。
- APK 已确认完整解锁接口：`/api/user/watchingMvByCoins`，请求参数 `mvId`，响应 `VideoShopBean { code, msg, url }`；成功后客户端把 `url` 直接交播放器。
- 该接口属于汤币消费/解锁操作，禁止任何自动调用。

### Test11 修改
- **APP 风格图片 ModelLoader**：不再把远程封面 URL 直接交海阔图片预取后再解密。先用本地 1×1 PNG 稳定触发 image JS，再由 Test11 ImageAdapter 自己 `fetch(...,{toHex:true})` 拉真实候选 URL。
- **候选与 Header 重试**：按原 APP Loader 的职责恢复“候选 URL → 请求失败/坏响应则继续”的模式；每个候选依次尝试 okhttp UA、浏览器 UA、minimal UA，以及存在播放器 Referer 时的 Referer 模式。
- **字节判型/解密**：每次自取字节先识别 JPEG/PNG/GIF/WebP/BMP；不是正常图片才尝试 legacy HEX + AES-CFB 和 AES-CBC。成功后返回 `ByteArrayInputStream`。诊断写入 `ttt_last_image_diag`。
- **访问状态恢复**：Core 解析 `isfree / coins / is_pay / preview_tip / preview_video`，并统一生成 `free / purchased / locked` 三态。
- **收费未购买详情**：不再显示“所有线路无效”。页面明确展示汤币价格、试看按钮和解锁按钮；试看只使用官方 `preview_video`，不把试看长度与完整片长比较。
- **显式消费确认**：只有用户点击“解锁完整版”并在 `confirm://` 二次确认后，才调用 `/api/user/watchingMvByCoins`。页面加载、自动播放、预检、诊断均不会调用消费接口。
- **解锁后播放**：接口返回 URL 后继续交既有 Test10 PlaybackAdapter 做 HLS/包装 URL/时长校验。接口无 URL、余额不足、登录要求或其它业务错误均直接提示，不伪装成功。
- **免费/已购视频**：继续使用 Test10 的完整源选择和单媒体入口；短视频继续列表卡片直接播放。
- 漫画 12 个动态分类、`construct list[30]`、创作者排行榜、匿名会话等已验证链不重写。
- Release / Bootstrap / Shell 派生为不可变 Test11 / Build10111；Shell rule version `2026082312`。

### Test11 实机验收
1. 首先看精选/长视频封面。新的 `ttt_last_image_policy.mode` 应为 `app-loader-self-fetch`；`ttt_last_image_diag` 应出现候选、Header 模式、输入/输出字节数与 `plain/legacy-cfb/aes-cbc`。
2. 短视频仍应有封面并点击卡片直接播放，不得退化。
3. 打开一个此前只有 2 秒维护片 + 120 秒预览的收费长视频：详情应显示“需 N 汤币解锁完整版”，而不是“线路无效”；点击试看应允许官方 120 秒 preview 正常播放。
4. **除非确实愿意消耗汤币，不要确认“解锁完整版”**。该按钮已按原 APP 合同接入真实消费接口。
5. 找一个免费长视频测试完整播放；若免费视频仍失败，提供 `ttt_last_access_state + ttt_last_source_probe`。
6. 若长视频封面仍灰，只需提供新的 `ttt_last_image_diag`，不再重复发送整套旧诊断。

## 历史版本
- Test8–Test10：[`CHANGELOG_HISTORY_TEST8_TO_TEST10.md`](./CHANGELOG_HISTORY_TEST8_TO_TEST10.md)
- Test7 及以前：[`CHANGELOG_HISTORY_TO_TEST7.md`](./CHANGELOG_HISTORY_TO_TEST7.md)
