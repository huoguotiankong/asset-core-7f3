# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结在 `0.4.9 / Build149`，作为 Clean Rewrite Test 失败时的恢复基线。
- 历史实机已验证：常规视频列表/播放、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- Stable Remote Manager `id=acfun`；Clean Rewrite Test `id=acfun-test`，两者状态隔离。

### Test / Candidate 1.0.0-alpha5 / Build10005 / Shell8.4

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
```

Alpha5 仍属于 Clean Rewrite；Stable/latest 不修改。

---

## 2026-08-23 · Alpha4 第四轮实机结果 → Alpha5

设备实际运行：

```text
版本：1.0.0-alpha4 / Build10004
接口：https://sjacfanapi.sexbar.site
令牌：已建立
图片域：https://79eq2aouwhf6.asigoo.com
```

### 1. 图片封面链继续确认正常

当前封面事实：

```text
jhimage/...
→ 当前 session imgDomain (*.asigoo.com)
→ 封面缩略图 _480
→ Dalvik UA + Referer=""
→ acfunImageDecoder
→ 本地持久缓存
```

图片解密长期合同：

```text
key = 2020-zq3-888
仅 XOR 前100字节
先检查 JPEG/PNG/GIF/WebP Magic
明文图片不得重复解密
```

**封面 `_480` 只属于列表/详情封面策略，不得自动套到漫画正文原图。**

### 2. 视频：后端播放链已经打通，剩余重点变成“短时签名 HLS 的播放器消费”

Alpha4 实机视频示例：

```text
videoId=14628
seed=mmc/...m3u8
decode=https://sjacfanapi.sexbar.site/api/m3u8/h5/decode?path=...
```

`POST video/cdn/refresh` 已成功返回多条当前 CDN 域名，但返回项只有 `domain/line/type/status` 等，**没有可直接附加到原始 seed 的 playbackAuthKey**。因此 Alpha4 构造的裸：

```text
https://<cdn>/<seed>.m3u8
```

不是完整授权媒体地址，不能再把“CDN refresh 返回域名”误当作“拿到了最终播放 URL”。

最关键的实机预检：

```text
GET /api/m3u8/h5/decode?path=...
→ HTTP 200
→ Content-Type: application/vnd.apple.mpegurl
→ #EXTM3U
→ #EXT-X-VERSION:3
→ #EXT-X-KEY:METHOD=AES-128,URI="https://<cdn>/key/enc.key?auth_key=<短时签名>"
→ 每个 .ts 也都是 https://<cdn>/...ts?auth_key=<短时签名>
```

由此可以确认：

1. 视频 Seed 正确；
2. H5 decode 接口正确；
3. decode 确实返回标准 HLS，而不是 JSON/错误页；
4. 媒体使用 AES-128；
5. KEY 与 TS URL 都已经由服务端生成独立 `auth_key`；
6. `auth_key` 中含当前时间信息，属于动态短时签名；
7. 不能自行用 `video/cdn/refresh` 的域名拼裸 seed 替代 decode 返回内容。

此前 Alpha2/3 对 Referer、Alpha4 对裸 CDN 的试探都不能解决问题。当前重点转为：**海阔默认音视频预加载/缓存是否使“稳定 decode URL → 动态短时签名 M3U8”在真正播放前已经过期。**

### 3. Alpha5 PlaybackAdapter

Alpha5 不再继续堆无证据 CDN 线路，改为两条真正对应当前实机协议的路径：

```text
A. 实时解码·免预载
   /api/m3u8/h5/decode?path=...
   + #isM3u8#
   + #noPre#
   + 当前签名请求 Header

B. 本地签名索引
   点击播放时立即 GET decode
   → 得到最新 #EXTM3U + AES KEY + TS auth_key
   → 原样 writeFile 到独立本地 .m3u8
   → 直接交播放器
```

同时增加：

```text
实时签名M3U8诊断
Key 探针
首个 TS 分片探针
本地签名索引路径/长度诊断
```

如果 Alpha5 仍不可播，下一轮优先依据 `Key/分片探针` 判断：

```text
manifest 成功 + key 成功 + segment 成功
→ 海阔播放器/本地索引消费问题

manifest 成功 + key/segment 失败
→ CDN auth_key 生命周期、请求 Header 或签名刷新问题
```

禁止再次退回“Seed 不对 / decode 不对 / Referer 随便换”的方向。

### 4. 漫画：接口、Method、主键已经彻底确认，不得继续探测这些层

Alpha4 漫画详情真实结构：

```text
root.chapterList 存在
chapterCount=1
first.chapterId=691609
first.chapterNum=1
first.comicsId=36510
first.chapterTitle=真实章节名
```

当前真实章节请求：

```text
GET /api/comics/base/chapterInfo?chapterId=691609
→ HTTP 200
→ code=200
→ msg=success
→ encData=<AES 加密 payload>
```

因此永久结论：

- `comics/base/chapterInfo` 当前有效 Method = GET；
- 当前有效主键 = `chapterId`；
- 真实 `chapterId` 是数值型章节 ID，不是之前误抓的 24 位 ObjectId；
- `encData` 正常返回，协议层 AES 解密链已经进入；
- 后续漫画问题只允许继续查 **解密后的 payload 结构 → 图片字段 → domain → 原图请求/解密 → pic_1_full 渲染**，不能再反复换 Method/ID。

### 5. Alpha5 Comic Reader

Alpha5 把“封面图片”和“漫画正文图片”彻底分开：

```text
封面：asigoo + _480 + decoder + cover cache
漫画正文：原始 URL（明确移除/禁止 _480）
         + Dalvik UA
         + Referer=""
         + acfunImageDecoder
         + 独立 full-image cache
         + pic_1_full
```

正文图片解析优先读取：

```text
imgList / imageList / images / pics / pictureList /
pageList / pages / contentList / chapterImages
```

并兼容数组元素是对象时的：

```text
imgUrl / imageUrl / originalUrl / url / path / src /
img / image / pic / picture
```

诊断新增：

```text
漫画解密结构：root keys / image count / first image / payload 片段
漫画图片错误
```

---

## Clean Rewrite Alpha1 → Alpha4 恢复摘要

### Alpha1 / Build10001 / Shell8.0

建立独立五层：

```text
Core → Protocol/Auth → Provider/Model → Media/Image/Reader → Product UI
```

首次实机确认：认证/列表数据已通，但封面空白、Station 参数 `%E...`、视频 decode 后播放失败、漫画请求合同需重验。

### Alpha2 / Build10002 / Shell8.1

- 修复封面：相对 `jhimage/...` 优先当前 `imgDomain`，asigoo `_480 + Referer="" + XOR decoder`。
- 统一 query decode。
- decode URL 加 HLS 标识。
- 读取 `m3u8/player/referer`。
- 漫画 GET-first。
- 用户实机确认封面恢复。

### Alpha3 / Build10003 / Shell8.2

实机得到：

```text
m3u8/player/referer = {"referer":"jhg_player"}
```

测试同一 decode URL 的 `APP标识 / H5来源 / 接口来源 / 无来源` 四套 Header，用户确认全部不可播，因此 Referer 猜测方向被证伪。

漫画精确探针暴露旧逻辑曾把 `HTTP200 + code404` 当成功，后续已禁止这种“协议假成功”。

### Alpha4 / Build10004 / Shell8.3

- 引入 `POST video/cdn/refresh`，确认 APP 存在动态 CDN 列表。
- decode 主动预检最终证明服务端返回标准、带短时签名 KEY/TS 的 AES-128 M3U8。
- 漫画目录只读真实 `chapterList/chapters`，确认真实 `chapterId`，chapterInfo GET 成功。

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
```

### 视频

```text
video/can/watch
m3u8/player/referer
video/cdn/refresh
video/cdn/reportError
cdnList / cdnRes
playbackDomain / playbackAuthKey / mp4Domain
/api/m3u8/h5/decode
/api/m3u8/play
/m3u8/play
X-Referer
```

当前最可信实际链：

```text
视频 item seed
→ /api/m3u8/h5/decode?path=<seed>
→ 服务端返回 AES-128 M3U8
→ KEY/TS 都是带短时 auth_key 的绝对 CDN URL
→ 海阔实时播放
```

`video/cdn/refresh` 当前实机返回的是线路域名列表，不能自行等同于最终已签名媒体 URL。

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
  → 图片列表
```

正文图片必须使用原图策略，不能复用封面 `_480`。

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

- Alpha8：同级栏目/筛选使用状态 + `refreshPage(false)`，避免返回栈膨胀；短视频曾实机直接播放成功。
- Alpha10：小说正文恢复；`.txt` 正文需要主动 fetch。
- Alpha12：漫画章节曾实机成功，核心是 `chapterInfo {chapterId}` + 图片提取 + `pic_1_full`。
- Alpha13：深层图片 Resolver 强覆盖会破坏全局封面；漫画 `pics://` 曾退化，优先 `pic_1_full`。
- Alpha15：补丁链过长时应 Clean Rebase，不继续叠 overlay。
- Alpha16：`拿到 seed / 构造 decode / cacheM3u8 返回 file:///` 都不能单独证明播放完成；短视频 Provider 有数据也不能证明 Renderer 正常。
- Alpha18：远程 decode 直交播放器仍未闭环，Clean Rewrite 后最终由 Alpha4 证明 decode 响应本身有效。

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
