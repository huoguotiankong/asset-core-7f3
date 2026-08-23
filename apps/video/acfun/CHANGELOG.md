# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结在 `0.4.9 / Build149`，作为 Clean Rewrite Test 的恢复基线。
- 历史实机曾验证：常规视频列表/播放、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- Stable Remote Manager `id=acfun`；Clean Rewrite Test `id=acfun-test`，两者状态隔离。

### Test / Candidate 1.0.0-alpha9 / Build10009 / Shell8.8

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
→ next/native-play-matrix-segment-auth-comic-trim-fix alpha9
```

Alpha9 仍属于 Clean Rewrite；Stable/latest 不修改。

---

## 2026-08-23 · Alpha8 实机结果 → Alpha9

设备实际运行 Alpha8：

```text
版本：1.0.0-alpha8 / Build10008
接口：https://sjacfanapi.sexbar.site
```

### 1. can/watch 当前真实合同已确认：GET 有效，POST 405

Alpha8 原先假设 `video/can/watch` 需要 POST 握手，实机结果纠正为：

```text
POST /api/video/can/watch
→ HTTP405

GET /api/video/can/watch?videoId=<id>
→ HTTP200
→ canWatch=true
→ keys=canWatch,videoUrl,previewUrl,playPath,reasonType
```

实际示例中 `playPath`/媒体 path 与列表 seed 同源，说明 **can/watch 不是当前故障的唯一缺失步骤**。长期结论：

- 当前后端 `video/can/watch` 有效 Method = GET；
- 后续播放链不得优先 POST 再制造无意义 405；
- 必须完整保留并分别验证 `videoUrl / previewUrl / playPath`，不能再只用泛型 `mediaPath()` 抹平字段差异。

### 2. 视频根因进一步前移：AES Key 可取，但签名 TS 本身直接 403

Alpha8 对真实 HLS 的设备探针：

```text
manifest:
HTTP200
Content-Type=application/vnd.apple.mpegurl
#EXTM3U 正常

key:
HTTP200
Content-Type=application/octet-stream
16字节 AES Key 正常

first TS:
none      → HTTP403
UA-only   → HTTP403
API Header→ HTTP403
```

因此这是当前最重要的新事实：

```text
不是“播放器拿到流但不会播”
而是“decode 返回的首个签名 TS 在真正进入播放器前就已经被 CDN 拒绝”
```

由此永久排除/降级以下方向：

- Seed 本身错误；
- `/api/m3u8/h5/decode` 返回非 HLS；
- AES Key 无法访问；
- `cacheM3u8` 返回格式错误；
- 单纯 Hiker 播放器 UI/列表上下文问题；
- 仅靠 none / UA / API Referer 三种 Header 可以解决。

当前真正需要验证的是：**签名 TS 对应的正确原生播放路由 / 签名上下文 / Cookie / Referer literal / APP Header / Range 请求合同。**

### 3. Alpha9 PlaybackAdapter：用“首 TS 真成功”作为唯一选择标准

APK 1.9.7 静态字符串已经长期确认存在：

```text
/api/m3u8/h5/decode
/api/m3u8/play
/m3u8/play
m3u8/player/referer
video/cdn/refresh
playbackAuthKey
videoUrl
previewUrl
playPath
```

Alpha9 因此不再继续添加“看起来像播放线路”的 URL，而是建立自动验证矩阵：

```text
GET can/watch
→ 分离 videoUrl / playPath / previewUrl / 原 seed
→ POST video/cdn/refresh（作为原生播放前置状态刷新）
→ 对每个候选分别测试：
   /api/m3u8/play?path=...
   /m3u8/play?path=...
   /api/m3u8/h5/decode?path=...
→ 若返回 JSON，继续跟随其中真实媒体 URL
→ 若返回 #EXTM3U，提取 AES Key + 首 TS
→ 首 TS 逐组探测：
   none
   UA
   H5 Referer/Origin
   jhg_player + X-Referer
   API Referer/Origin
   APP signed headers
   Range bytes=0-65535
   Cookie / Cookie+jhg（若服务端返回 Set-Cookie）
→ 记录 HTTP / MIME / hexLen / 403 body
→ 只有首 TS HTTP 2xx 且确实有二进制内容，才成为播放器默认线路
```

这套逻辑的目的不是“多堆线路”，而是让下一轮直接回答：

```text
到底哪个原生 endpoint 生成可用签名？
如果仍 403，CDN 返回正文具体说了什么？
Cookie / jhg / H5 / APP / Range 是否有任何一种改变结果？
```

诊断只需关注：

```text
can/watch
CDN刷新
播放路由矩阵
```

### 4. 漫画：Alpha8 已无系统 chrome，剩余白区属于源图片本身

Alpha8 实机截图中已经看不到：

```text
系统标题栏
返回按钮
章节名
状态栏图标
上一话/下一话
```

但第一张漫画图顶部仍有大块纯白。截图可明确看出白色区域与第一张图片同一画布连续，人物内容从图片内部较低位置才开始，因此该白区已经**不是 Hiker 页面 inset**，而是源图片自身留白。

这条经验必须长期保留：

- `#fullTheme# + #immersiveTheme#` 只能处理页面 chrome/inset；
- 当 chrome 已消失后继续叠 Theme 标识无法裁掉源图像像素；
- UI 截图中“看起来像页面白边”的区域必须先判断是不是图片自身画布。

Alpha9 不再继续改 Theme，而是增加隔离的 `acfunComicTrim`：

```text
仅第一张正文图
→ XOR 解密
→ Bitmap 扫描顶部近白行
→ 只裁掉连续近白顶部
→ PNG 输出到独立缓存
→ 后续所有正文图保持原始像素/比例
```

这样不会破坏漫画正文主链，也不会把所有页面统一强裁。

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

因此 Alpha8 改为：**每次播放都先执行 `video/can/watch`，即使已有 seed 也不跳过。** Alpha8 初版设计优先 POST，但实机已在上一节纠正为当前 GET 有效。

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
```

Alpha8 的最终实机结果即：上述三种 TS 请求全部 403。

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
8. Alpha6/7 已进一步证明官方 `cacheM3u8` 返回格式和 Stable Header 也不是完整根因；
9. Alpha8 进一步证明当前 H5 decode 的首签名 TS 在 none/UA/API Header 下均 403，而 Key 正常 200。

### 首分片旧探针注意

Alpha5 曾出现：

```text
key ok hexLen=32
segment ok hexLen=0
```

其中 `segment ok` 只是“请求没有抛异常”的旧标记，`hexLen=0` **不能算分片内容成功**。Alpha8 起必须同时记录 HTTP/Content-Type/toHex 长度。

---

## Clean Rewrite Alpha1 → Alpha8 摘要

### Alpha1 / Build10001 / Shell8.0
建立 `Core → Protocol/Auth → Provider/Model → Media/Image/Reader → Product UI`；认证/列表通，但封面、参数、播放、漫画均需恢复。

### Alpha2 / Build10002 / Shell8.1
恢复 `imgDomain + asigoo _480 + Referer="" + XOR decoder` 封面；统一参数 decode；漫画 GET-first。

### Alpha3 / Build10003 / Shell8.2
得到 `m3u8/player/referer=jhg_player`；APP/H5/API/无来源四套 Header 仍不可播，Referer 单点猜测被证伪。

### Alpha4 / Build10004 / Shell8.3
`video/cdn/refresh` 成功；H5 decode 明确返回带短时签名 KEY/TS 的 AES-128 HLS；漫画真实 `chapterList → 数值 chapterId → GET chapterInfo` 闭环。

### Alpha5 / Build10005 / Shell8.4
`#noPre#` + 手写最新签名本地 M3U8 仍不可播；漫画独立原图 ImageAdapter 成功，185 张正文图实机显示。

### Alpha6 / Build10006 / Shell8.5
回归官方 `cacheM3u8`；实机确认 `file://...m3u8##original-url` 返回正确但仍不可播。

### Alpha7 / Build10007 / Shell8.6
精确移植 Stable 0.4.9 Header + cacheM3u8 仍不可播；Reader 改纯 `pic_1_full + #fullTheme#`。

### Alpha8 / Build10008 / Shell8.7
强制 can/watch，并拆分 API manifest / CDN segment Header；实机最终确认 GET can/watch 有效、Key 200、首 TS 多种 Header 均 403；漫画 theme chrome 已消失，剩余白区被确认是源图像像素。

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
videoUrl
previewUrl
playPath
```

当前实机事实：

```text
GET video/can/watch → canWatch=true
H5 decode → #EXTM3U
AES key → HTTP200
signed TS → 当前 none/UA/API Header 均 HTTP403
```

因此 Alpha9 起，播放完成判据必须是：**至少一个真实 TS 已被设备直接验证 HTTP 2xx + 非空二进制**。拿到 manifest、Key 或 cacheM3u8 URL 均不能再当“播放链完成”。

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
- Clean Rewrite Alpha7：即使 Stable 播放 Header/cacheM3u8 精确移植，当前后端仍失败。
- Clean Rewrite Alpha8：**Key HTTP200 不能代表 HLS 可播；首 TS 真实 HTTP 状态才是决定性证据。**
- Comic Reader：当 fullTheme/immersiveTheme 后 chrome 已消失，剩余白区必须先判断是否来自源图片自身，不能继续用页面 Theme 处理图像像素。

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
