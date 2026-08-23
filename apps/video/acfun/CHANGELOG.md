# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结在 `0.4.9 / Build149`，作为 Clean Rewrite Test 的恢复基线。
- 历史实机曾验证：常规视频列表/播放、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- Stable Remote Manager `id=acfun`；Clean Rewrite Test `id=acfun-test`，两者状态隔离。

### Test / Candidate 1.0.0-alpha8 / Build10008 / Shell8.7

活动 Release：

```text
next/core alpha1
→ next/protocol alpha1
→ next/provider alpha1
→ next/media alpha1
→ next/ui alpha1
→ next/device-regression-fix alpha2
→ next/player-comic-transport-fix alpha3
→ next/cdn-chapter-model-fix alpha4
→ next/signed-hls-comic-full-image-fix alpha5
→ next/native-hls-cache-comic-ux-fix alpha6
→ next/stable-playback-fullscreen-comic-fix alpha7
→ next/watch-handshake-split-header-immersive-fix alpha8
```

Alpha8 仍属于 Clean Rewrite；Stable/latest 不修改。

---

## 2026-08-23 · Alpha7 实机结果 → Alpha8

设备实际运行 Alpha7：

```text
版本：1.0.0-alpha7 / Build10007
接口：https://sjacfanapi.sexbar.site
```

### 1. 视频：Stable 播放合同完整移植后仍失败

Alpha7 已把 Clean Rewrite 播放方式收敛到 Stable 0.4.9 的已验证合同：

```text
UA = WebView UA
Referer = 当前 API Host + /
Origin = 当前 API Host

decode = /api/m3u8/h5/decode?path=<seed>
cacheM3u8(decode + #isM3u8#, {headers}, fname)
→ 原样保留 file://...m3u8##original-url
```

用户实机确认：

```text
Stable兼容缓存 → 失败
Stable兼容实时 → 失败
```

并且诊断再次确认：

```text
cacheM3u8 return=
file:///.../acfun_a7_xxx.m3u8##https://sjacfanapi.sexbar.site/api/m3u8/h5/decode?...#isM3u8#
```

因此永久结论：

- `cacheM3u8()` 调用和返回合同本身已被实机确认正确；
- Stable 的 UA / API Referer / Origin 也不能单独解决当前后端播放；
- 不得再反复把根因归咎于 `#isM3u8#`、`##original-url`、`jhg_player` 或单纯 Header 差异；
- 必须继续往 **播放前会话握手、签名 CDN 分片实际请求、分片 MIME/传输形态** 收敛。

### 2. 一个此前一直被忽略的差异：有 Seed 时从未执行 can/watch

Clean Rewrite Alpha1~7 的共同逻辑是：

```text
列表/详情已有 jpd/jpc/mmc/...m3u8 seed
→ 直接 decode
→ 只有 seed 缺失时才请求 video/can/watch
```

而 `video/can/watch` 从命名与 APP 行为上都可能不仅返回地址，还可能承担：

```text
观看资格确认
会话初始化
CDN/签名上下文刷新
播放状态副作用
```

因此 Alpha8 改为：**每次播放都先执行 `video/can/watch` POST，即使已有 seed 也不跳过。**

```text
videoId
→ POST video/can/watch
→ 记录 keys / canWatch / reason / path
→ 若返回 path，优先使用该 path
→ 若无 path，才回落原 seed
```

这不是继续猜 URL，而是补回一个此前被 seed 短路的协议步骤。

### 3. Alpha8 将“API 索引 Header”和“CDN 分片 Header”彻底拆开

此前多线路还有一个结构问题：播放器 `headers` 往往同时作用于索引、KEY 和 TS。当前真实 M3U8 已证明 KEY/TS 是**带独立 auth_key 的绝对 CDN URL**，因此不应默认把 API Host 的 Referer/Origin 强行附加给 CDN 分片。

Alpha8 播放流程：

```text
can/watch 握手
→ decode
→ 用 API Header 主动 GET manifest
→ 解析第一个 AES KEY + 第一个 TS
→ 分别探测首 TS：
   1. 无 Header
   2. UA-only
   3. API Header
→ 记录 HTTP / Content-Type / toHex 字节长度
→ cacheM3u8 仍用 API Header 获取索引
→ 播放本地 cacheM3u8 返回值时，按 TS 探针选择播放器 Header
→ 优先无 Header
```

如果首分片 `Content-Type=image/png`，Alpha8 额外启用海阔官方：

```text
cacheM3u8WithPngProxy(...)
```

因为官方文档明确提供该能力处理“PNG 分段格式的 M3U8”。不能在不知道分片 MIME 的情况下继续只按普通 TS 猜。

Alpha8 新诊断：

```text
can/watch握手
播放传输探针
  manifest status / content-type / bytes
  segment none / ua / api
  key-none
  selectedPlayerHeaders
  cache return
  pngProxy
```

下一轮视频判断只看这两段，不再需要整段 M3U8。

### 4. 漫画：正文链成功，Alpha7 fullTheme 仍残留顶部白色状态栏 inset

Alpha5 起漫画正文已经实机闭环：

```text
GET comics/base/chapterInfo?chapterId=<真实数值ID>
→ code200 / encData
→ AES 解密
→ payload.domain + imgList
→ 原图 ImageAdapter
→ pic_1_full
```

用户 Alpha7 实机确认正文图继续正常，但 `#fullTheme#` 只去掉了普通页面标题/控件，屏幕顶部仍有一条白色系统状态栏区域。

Alpha8 Reader 因此只做 UI 层变化，不动漫画协议：

```text
#fullTheme#
+
#immersiveTheme#
```

Reader 本身仍只输出 `pic_1_full`，不再渲染章节名、进度、上一话、下一话等任何信息。目标是让第一张漫画图直接铺到物理屏幕顶部。

---

## 2026-08-23 · Alpha5/6 关键实机结论

### 漫画正文链已实机恢复成功

真实示例：

```text
comicsId=36164
chapterId=690769
chapterTitle=第1話
chapterCount=8
GET /api/comics/base/chapterInfo?chapterId=690769
→ HTTP200 / code200 / encData
```

解密后：

```text
keys=domain,chapterId,chapterTitle,coverImg,imgList,...
imgList count=185
```

用户实机截图确认 185 张原图可连续显示，`漫画图片错误`为空。

永久结论：

- 漫画当前有效 Method = GET；
- 当前有效主键 = 数值 `chapterId`；
- `encData` AES 链正确；
- 正文主结构 = `payload.domain + imgList`；
- 正文图片必须使用独立 full-image 解密缓存，不得回退封面 `_480`；
- 后续漫画维修不得再无故改 Method / chapterId / AES。

### 漫画 Station 分页

曾出现：

```text
getComicsStations UI id = 24位 ObjectId
getStationComicsMore stationId=<ObjectId>
→ HTTP400
```

而数字 `stationId=1` 曾 HTTP200。Alpha6 起保留 UI identity，并从：

```text
raw.stationId / comicsStationId / stationSort / sort / sortNum /
index / position / type / 当前站位序号
```

构造数字 API 候选，最后以 `comics/base/findList` 兜底。

### 视频 HLS 服务端链已确认

真实 decode：

```text
GET /api/m3u8/h5/decode?path=<seed>
→ HTTP200
→ Content-Type: application/vnd.apple.mpegurl
→ #EXTM3U
→ #EXT-X-VERSION:3
→ #EXT-X-KEY:METHOD=AES-128,URI="https://<cdn>/key/enc.key?auth_key=<短时签名>"
→ 每个 .ts 都是 https://<cdn>/...ts?auth_key=<短时签名>
```

已确认：

1. Seed 正确；
2. decode 接口正确；
3. 返回的是真正 HLS，不是 JSON/错误页；
4. AES-128 KEY URL 正常；
5. KEY 与 TS 都带服务端独立短时 `auth_key`；
6. `video/cdn/refresh` 返回的只是线路域名列表，不能自行拼成最终授权 URL；
7. Alpha5 `#noPre#` 与手写普通 `file://` M3U8 均被实机证伪；
8. Alpha6/7 已进一步证明官方 `cacheM3u8` 返回格式和 Stable Header 也不是完整根因。

### 首分片旧探针注意

Alpha5 曾出现：

```text
key ok hexLen=32
segment ok hexLen=0
```

其中 `segment ok` 只是“请求没有抛异常”的旧标记，`hexLen=0` **不能算分片内容成功**。Alpha8 已改为同时记录 HTTP/Content-Type/toHex 长度，禁止再把空二进制结果误判为成功。

---

## Clean Rewrite Alpha1 → Alpha7 摘要

### Alpha1 / Build10001 / Shell8.0

建立：

```text
Core → Protocol/Auth → Provider/Model → Media/Image/Reader → Product UI
```

首次实机：认证/列表数据已通，但封面空白、页面参数未 decode、视频播放失败、漫画合同需重验。

### Alpha2 / Build10002 / Shell8.1

- 封面相对 `jhimage/...` 改用当前 `imgDomain`；
- `asigoo + _480 + Referer="" + XOR decoder` 恢复封面；
- 统一 query decode；
- 漫画 GET-first；
- 用户实机确认封面恢复。

### Alpha3 / Build10003 / Shell8.2

实机得到：

```text
m3u8/player/referer = {"referer":"jhg_player"}
```

`APP标识 / H5来源 / 接口来源 / 无来源` 四套 Header 全部不可播，Referer 单点猜测被证伪。

### Alpha4 / Build10004 / Shell8.3

- `POST video/cdn/refresh` 成功，确认动态 CDN；
- decode 预检证明标准短时签名 AES-128 HLS；
- 漫画真实 `chapterList → 数值 chapterId → GET chapterInfo` 闭环。

### Alpha5 / Build10005 / Shell8.4

- `#noPre#` + 手写最新签名本地 M3U8；实机仍不可播；
- 漫画正文独立原图 ImageAdapter 成功，185 张正文图实机显示。

### Alpha6 / Build10006 / Shell8.5

- 回归官方 `cacheM3u8`；
- 实机确认返回 `file://...m3u8##original-url` 正确但仍不可播；
- 漫画 Reader 曾加入章节导航，后根据用户要求撤销。

### Alpha7 / Build10007 / Shell8.6

- 精确移植 Stable 0.4.9 播放 Header + cacheM3u8 合同；仍不可播；
- Reader 改为 `#fullTheme#` + 纯 `pic_1_full`；正文正常，但顶部状态栏白色 inset 仍存在。

---

## APP 1.9.7 长期协议记忆

### 认证 / 签名 / 响应

```text
POST user/traveler/
headers:
  deviceId
  t = 当前毫秒时间戳
  s = MD5(t.substring(3,8))
  User-Mark = acfun
  aut = token（登录后）
```

`encData`：

```text
secret = token.substring(2,18)
AES/CBC/PKCS5Padding
key = secret
iv = secret
Base64 → AES decrypt → JSON
```

不得在 CHANGELOG 保存真实 Token/Cookie/Authorization。

### 图片

```text
imgDomain
jhimage/...
封面 asigoo _480
XOR key 2020-zq3-888
只 XOR 前100字节
先检查 JPEG/PNG/GIF/WebP Magic
明文图片不得重复解密
```

漫画正文：

```text
payload.domain + imgList
原图，不加 _480
Dalvik UA + Referer=""
acfunImageDecoder
full-image cache
pic_1_full
```

### 视频

已发现协议/字符串：

```text
video/can/watch
m3u8/player/referer
video/cdn/refresh
video/cdn/reportError
cdnList / cdnRes
playbackDomain / playbackAuthKey / mp4Domain
getMediaUrl
/api/m3u8/h5/decode
/api/m3u8/play
/m3u8/play
X-Referer
```

当前最可信链：

```text
videoId
→ video/can/watch（Alpha8 起强制，不再被 seed 跳过）
→ path / seed
→ /api/m3u8/h5/decode?path=<path>
→ 标准 AES-128 M3U8
→ KEY/TS 为带 auth_key 的绝对 CDN URL
→ cacheM3u8 缓存索引
→ CDN 分片 Header 必须按实机探针确定，不能默认复用 API Header
```

### 漫画

```text
comics/station/getComicsStations
comics/station/getStationComicsMore
comics/base/info
  → chapterList
  → chapterId / chapterNum / comicsId
comics/base/chapterInfo?chapterId=<真实数值ID>
  → HTTP200/code200/encData
  → AES decode
  → domain + imgList
  → 原图解密缓存
  → pic_1_full
```

### 其它内容

```text
station/stations
station/getStationMore
video/classTypeList
video/getZoneListByClassifyId
video/queryVideoByZone
video/tags/getTagsZ
video/tagTitleList
video/getByClassify
video/list                    // 短视频 loadType
video/getVideoById
video/queryVideoByTitle
search/keyWordV2
fiction/other/tagList
fiction/base/findList
fiction/base/info
fiction/base/chapterInfo
community/dynamic/list
```

有声 `POST fiction/base/findList` 曾实机成功，不因漫画 Method 调整而无关重写。

---

## 关键历史回归经验

- 旧 Alpha8：同级栏目/筛选使用状态 + `refreshPage(false)`，避免返回栈膨胀；短视频曾实机直接播放成功。
- 旧 Alpha10：小说正文恢复；`.txt` 正文需要主动 fetch。
- 旧 Alpha12：漫画章节曾实机成功，核心是 `chapterInfo {chapterId}` + 图片提取 + `pic_1_full`。
- 旧 Alpha13：深层图片 Resolver 强覆盖会破坏全局封面；漫画 `pics://` 曾退化，优先 `pic_1_full`。
- 旧 Alpha15：补丁链过长时应 Clean Rebase，不继续叠 overlay。
- 旧 Alpha16：`拿到 seed / 构造 decode / cacheM3u8 返回 file:///` 都不能单独证明播放完成。
- 旧 Alpha18：远程 decode 直交播放器仍未闭环；Clean Rewrite Alpha4 最终证明 decode 响应本身有效。
- Clean Rewrite Alpha5：`writeFile` 普通本地 M3U8 与 `cacheM3u8` Hiker-aware 返回合同不是一回事。
- Clean Rewrite Alpha7：即使 Stable 播放 Header/cacheM3u8 精确移植，当前后端仍失败；下一步必须验证 can/watch 副作用和 CDN 分片真实传输。

---

## 发布前固定回归

Test 每版至少验证：

1. 首页真实封面与专题结构；
2. 专题“更多”标题正常；
3. 普通视频详情封面；
4. 普通视频真实出画面、进度持续走；
5. 短视频列表与播放；
6. 漫画详情、目录、章节原图；
7. 小说正文与有声音频；
8. 社区列表/详情/评论；
9. 搜索及类型切换；
10. 同级 Tab 连切多次后系统返回栈正常；
11. UI 大改继续以用户实机截图收敛；
12. Test 未完成回归前禁止晋级 Stable。
