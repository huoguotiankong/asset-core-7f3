# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结在 `0.4.9 / Build149`，作为 Clean Rewrite Test 的恢复基线。
- 历史实机曾验证：常规视频列表/播放、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- Stable Remote Manager `id=acfun`；Clean Rewrite Test `id=acfun-test`，两者状态隔离。

### Test / Candidate 1.0.0-alpha10 / Build10010 / Shell8.9

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
→ next/client-cdn-sign-repair-comic-crop2-fix alpha10
```

Alpha10 仍属于 Clean Rewrite；Stable/latest 不修改。

---

## 2026-08-23 · Alpha9 实机结果 → Alpha10

设备实际运行：

```text
版本：1.0.0-alpha9 / Build10009
接口：https://sjacfanapi.sexbar.site
令牌：已建立
```

### 1. 视频根因已经从“播放器问题”收敛到 CDN auth_key 本身

真实 `video/can/watch`：

```text
GET /api/video/can/watch?videoId=<id>
→ HTTP200
→ canWatch=true
→ videoUrl=jpd/...m3u8
→ playPath=https://<当前CDN>/jpd/...m3u8
```

`video/cdn/refresh` 同时成功返回当前 CDN 线路。

Alpha9 路由矩阵得到决定性结果：

```text
videoUrl·native
→ manifest HTTP200 / HLS
→ 首 TS：none / UA / H5 / jhg / API / APP / Range 全部 HTTP403
→ body = 403 Forbidden: invalid sign
→ KEY 同样可出现 invalid sign

videoUrl·h5
→ manifest HTTP200 / HLS
→ AES KEY HTTP200 / 16 bytes
→ 首 TS 所有 Header 组合仍 HTTP403

videoUrl·root
→ /m3u8/play HTTP404

playPath·direct
→ HTTP403
→ body = 403 Forbidden: missing auth_key
```

因此后续禁止再把主要精力放在以下已被实机排除的方向：

- Seed/path 是否正确；
- `/api/m3u8/h5/decode` 是否返回真正 HLS；
- AES Key 是否能访问；
- `cacheM3u8()` 返回格式；
- `#isM3u8# / #noPre#`；
- `jhg_player / H5 / API / APP / Range` Header 组合；
- 单纯海阔播放器消费方式。

当前最可信根因是：**服务端下发的 CDN `auth_key` 与当前 CDN 实际验签合同/密钥不同步，或 H5 decode 当前生成了失效签名。**

### 2. auth_key 结构与 APK 证据

当前 HLS 的 KEY/TS URL 已多次观察到：

```text
auth_key=<timestamp>-<random>-<uid>-<md5>
```

同时 ACFun 1.9.7 APK 静态字符串已确认存在：

```text
playbackAuthKey
playbackDomain
getMediaUrl
video/cdn/refresh
video/cdn/reportError
/api/m3u8/play
/api/m3u8/h5/decode
```

这与常见 CDN Type-A 鉴权结构高度吻合。**Type-A 具体公式目前仍是待实机验证的工程假设，不得在未得到 TS 2xx 前写成已确认协议。**

### 3. Alpha10：客户端重签验证，而不是继续盲改播放器

Alpha10 新 PlaybackAdapter：

```text
can/watch GET
→ videoUrl / playPath
→ CDN refresh
→ 获取 H5 manifest
→ 提取首 KEY + 首 TS 的 timestamp/random/uid/sign
→ 从当前远程配置和 CDN 配置中只查找：
   playbackAuthKey / playback_auth_key
   mediaAuthKey / media_auth_key
   playbackDomain / mediaDomain
→ 诊断只记录 key 数量、长度、hash 前缀，不保存真实密钥
→ 尝试少量 CDN Type-A 兼容公式：
   uri-ts-rand-uid-key
   uriWithoutSlash-ts-rand-uid-key
   ts-rand-uid-uri-key
   key-uri-ts-rand-uid
→ 同时尝试服务端 timestamp / 当前秒级 timestamp，以及当前/refresh/playPath CDN 域
→ 每个候选直接请求首 TS
```

成功标准严格为：

```text
首 TS HTTP 2xx + 非空二进制
AND
对应 AES KEY HTTP 2xx + 至少16字节
```

只有满足这个条件，才：

```text
逐条重写 manifest 中所有带 auth_key 的 KEY/TS URL
→ 写入独立本地重签 M3U8
→ 交海阔播放器
```

如果当前远程配置根本没有下发 playbackAuthKey，或公式仍不匹配，则继续回退 Alpha9 路由矩阵，并输出：

```text
播放签名配置
播放重签探针
```

下一步应据此继续找真正的 `getMediaUrl/playbackAuthKey` 来源，不允许重新退回播放器 Header 猜测。

### 4. 漫画：Alpha9 裁白无异常但实机没有视觉效果

Alpha9 已确认 Reader 页面 chrome 被完全移除；剩余大块顶部白色属于第一张源图自身画布。

Alpha9 `acfunComicTrim` 没有报错但用户实机仍看到原白区。最可能原因是旧扫描规则过于敏感：

```text
单行非白像素比例只需约0.8%
```

JPEG 近白噪点/轻微压缩色差可能在 `y≈0` 就触发“已经进入正文”，导致 `first=0`，于是实际上没有裁剪。

Alpha10 改为：

```text
只处理每章第一张图
→ 新缓存目录，彻底绕过 Alpha9 已缓存首图
→ 扫描中央95%宽度
→ 最多扫描图片高度55% / 2200px
→ 内容阈值提升到约2.5%
→ 必须连续3个采样行达到阈值才判定进入正文
→ 裁剪前保留约10px缓冲
→ 后续所有图片原样显示
```

新增诊断：

```text
漫画首图裁白：
w=<宽> h=<高> maxScan=<...> found=<...> first=<...> top=<...> bestRatio=<...>
```

如果 Alpha10 仍有白边，下一轮只依据 `first/top/bestRatio` 调阈值，不动漫画接口/AES/imgList。

---

## 2026-08-23 · Alpha8 实机结果 → Alpha9

### can/watch 当前真实合同

```text
POST video/can/watch → HTTP405
GET video/can/watch?videoId=<id> → HTTP200 / canWatch=true
```

返回字段至少包括：

```text
canWatch
videoUrl
previewUrl
playPath
reasonType
```

长期结论：当前后端 `video/can/watch` 有效 Method = GET；必须保留 `videoUrl / previewUrl / playPath` 字段差异，不能只用泛型 `mediaPath()` 抹平。

### Alpha8 首分片事实

```text
manifest → HTTP200 / #EXTM3U
AES key → HTTP200 / 16 bytes
first TS → none / UA / API Header 均 HTTP403
```

因此 Key HTTP200 不能代表 HLS 可播；首 TS 的真实 HTTP 状态才是决定性证据。

### Alpha9 的价值

Alpha9 建立 `native/root/h5/direct` 路由矩阵，并测试 none/UA/H5/jhg/API/APP/Range/Cookie 等分片请求合同。最终由 Alpha9 实机拿到 `invalid sign` 和 `missing auth_key`，完成根因收敛。

---

## 漫画正文长期成功合同

真实闭环已经实机验证：

```text
GET comics/base/info?comicsId=<id>
→ chapterList
→ chapterId / chapterNum / comicsId

GET comics/base/chapterInfo?chapterId=<真实数值ID>
→ HTTP200 / code200 / encData
→ AES/CBC/PKCS5Padding 解密
→ payload.domain + imgList
→ 原图 ImageAdapter
→ pic_1_full
```

长期规则：

- 当前有效 Method = GET；
- 当前主键 = 数值 `chapterId`；
- `encData` AES 链已验证，禁止无故重写；
- 正文主结构 = `domain + imgList`；
- 正文必须使用原图，不得套封面 `_480`；
- 正文图片走独立 full-image 解密缓存；
- UI 白边问题属于图像层时，只修首图裁剪，不得重新改漫画 API。

漫画 Station 分页历史注意：UI identity 曾为 24 位 ObjectId，但 `getStationComicsMore` 实机更接受数字 stationId；当前保持数字候选映射 + `comics/base/findList` 兜底。

---

## 图片长期合同

封面已在 Clean Rewrite Alpha2 实机恢复：

```text
相对 jhimage/...
→ 当前 session imgDomain
→ 列表/详情封面 _480
→ Dalvik UA + Referer=""
→ acfunImageDecoder
→ 持久缓存
```

图片解密：

```text
key = 2020-zq3-888
只 XOR 前100字节
先判断 JPEG/PNG/GIF/WebP magic
明文图片不得重复 XOR
```

漫画正文与封面策略必须隔离。

---

## APP 1.9.7 认证/响应长期合同

```text
POST user/traveler/
headers:
  deviceId
  t = 当前毫秒时间戳
  s = MD5(t.substring(3,8))
  User-Mark = acfun
  aut = token（需要认证时）
```

`encData`：

```text
secret = token.substring(2,18)
AES/CBC/PKCS5Padding
key = secret
iv = secret
Base64 → AES decrypt → JSON
```

CHANGELOG/诊断不得保存真实 Token、Cookie、Authorization 或 playbackAuthKey 明文。

---

## 视频 HLS 历史排除链

已经实机验证并形成长期结论：

1. Seed 正确；
2. `/api/m3u8/h5/decode?path=<seed>` 返回真正 `application/vnd.apple.mpegurl`；
3. HLS 使用 AES-128；
4. KEY/TS 都带独立短时 `auth_key`；
5. `video/cdn/refresh` 返回线路域名，不等于可直接拼裸 seed；
6. Alpha3：APP/H5/API/无来源 Referer 线路均失败；
7. Alpha5：`#noPre#` 与手写普通 `file://` M3U8 无效；
8. Alpha6：官方 `cacheM3u8` 返回 `file://...##original-url` 正确，但仍不可播；
9. Alpha7：Stable 0.4.9 Header + cacheM3u8 合同移植后仍失败；
10. Alpha8：Key 200、TS 403；
11. Alpha9：所有 Header/Range 组合仍 `403 invalid sign`，绝对 playPath 为 `missing auth_key`。

因此后续播放排障优先级：

```text
auth_key 生成源 / playbackAuthKey / playbackDomain / getMediaUrl
> 原生媒体签名实现
> CDN 线路同步
> 最后才是播放器消费层
```

---

## 其它内容长期入口

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

## Clean Rewrite 简史

- Alpha1：建立 `Core → Protocol/Auth → Provider/Model → Media/Image/Reader → Product UI`。
- Alpha2：恢复封面、统一参数 decode、漫画 GET-first。
- Alpha3：`jhg_player` Referer 被实机证伪为单点解法。
- Alpha4：CDN refresh、真实签名 AES-128 HLS、真实 chapterId 闭环。
- Alpha5：漫画正文恢复；`#noPre#`/普通本地 M3U8 播放失败。
- Alpha6：回归 `cacheM3u8`，仍失败。
- Alpha7：Stable 播放合同精确移植，仍失败；Reader 改纯图片。
- Alpha8：GET can/watch + 首分片探针，得到 Key200/TS403。
- Alpha9：路由/Header 矩阵得到 `invalid sign / missing auth_key`；首次做首图裁白但阈值过敏。
- Alpha10：进入客户端 CDN 重签验证 + 首图持续内容裁白阶段。

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
