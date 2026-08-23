# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结在 `0.4.9 / Build149`，作为 Clean Rewrite Test 的恢复基线。
- 历史实机曾验证：常规视频列表/播放、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- Stable Remote Manager `id=acfun`；Clean Rewrite Test `id=acfun-test`，两者状态隔离。

### Test / Candidate 1.0.0-alpha11 / Build10011 / Shell9.0

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
→ next/credential-recovery-host-repair-comic-border-crop alpha11
```

Alpha11 仍属于 Clean Rewrite；Stable/latest 不修改。

---

## 2026-08-23 · Alpha10 实机结果 → Alpha11

设备实际运行：

```text
版本：1.0.0-alpha10 / Build10010
接口：https://sjacfanapi.sexbar.site
令牌：已建立
```

### 1. Alpha10 客户端重签没有真正执行：playbackAuthKey 根本没有取得

用户实机诊断：

```text
播放签名配置：
{"keyCount":0,"keys":[],"domains":[]}

播放重签探针：
missing auth parts or playbackAuthKey
```

这条事实必须永久保留：**Alpha10 看起来增加了 Type-A 客户端重签，但当前设备上没有任何候选 playbackAuthKey，因此该分支实际上无法改变播放结果。** 后续不能把“Alpha10 仍失败”解释为“Type-A 公式已经被实机证伪”；当前只证明了“密钥来源找错了”。

同时播放基础事实保持不变：

```text
GET video/can/watch → HTTP200 / canWatch=true
videoUrl → 相对 jpd/...m3u8
playPath → https://<cdn>/jpd/...m3u8
POST video/cdn/refresh → 成功返回多条 type=11 CDN 域名

videoUrl·native → manifest HTTP200
videoUrl·h5     → manifest HTTP200
首 TS           → 403 Forbidden: invalid sign
playPath·direct → 403 Forbidden: missing auth_key
```

因此仍然禁止退回以下方向：Seed、HLS hint、cacheM3u8、播放器 Header、Referer、Range 等已经重复证伪的层。

### 2. APK 明确存在独立 playback credential 语义，Clean Rewrite 之前没有完整恢复

APK 1.9.7 静态字符串除 `playbackAuthKey / playbackDomain / getMediaUrl` 外，还确认存在：

```text
playback_credential
playback credential is unavailable
missing authKey
m3u8/player/referer
sys/getDynamicDomain
sys/sdk-config
cdnRes
cdnList
/api/m3u8/play
/m3u8/play
signUrl
presignedUrl
```

而 Alpha10 只扫描：

```text
cloud remoteConfig
+ video/cdn/refresh
```

这不足以代表 APP 的真实 playback credential 来源。Alpha11 因此新增独立 Credential Recovery：

```text
can/watch 原始对象
CDN refresh
cloud remoteConfig
m3u8/player/referer 空参数
m3u8/player/referer?videoId=...
m3u8/player/referer?path=...
m3u8/player/referer?videoId=...&path=...
sys/getDynamicDomain          // root 与 /api 合同
sys/sdk-config                // root 与 /api 合同
video/getVideoById
```

递归只提取与播放有关的：

```text
playbackAuthKey / authKey / auth_key / mediaAuthKey / m3u8AuthKey / signKey
playbackDomain / mediaDomain / mp4Domain / m3u8Domain / m3u8H
referer / playerReferer
videoUrl / playPath / previewUrl / presignedUrl / signUrl
```

安全规则：诊断只记录密钥 `len / kind / md5前缀 / source / field`，CHANGELOG 和诊断都不得泄露明文 Token/Cookie/playbackAuthKey。

### 3. Alpha11 新增“保留 auth_key、只切 CDN 域名”的优先验证

Alpha9/10 已经知道：

- 服务端会生成形如 `timestamp-random-uid-md5` 的 auth_key；
- can/watch 的 `playPath` CDN 与 H5 manifest 中实际 KEY/TS CDN 可能不是同一域；
- CDN refresh 同时返回多条当前可用线路。

此前版本一直把 `manifest 中的域名 + manifest 中的 auth_key` 当作不可拆组合，却没有验证：**签名本身可能对应另一个当前线路，而 manifest 恰好拼到了错误 CDN 域。**

Alpha11 因此先做最保守的修复，不自己计算签名：

```text
取 H5 manifest 已有首 TS + KEY
→ auth_key 原样保留
→ 只替换 hostname/origin
→ 依次验证：
   manifest 原域
   can/watch playPath 域
   POST CDN refresh 返回域
   Credential Recovery 得到的 playbackDomain/mediaDomain
→ 先请求 TS
→ TS 真 2xx + 二进制后再请求 KEY
→ TS + KEY 同时成功才判定线路成立
→ 将 manifest 内所有绝对 KEY/TS URL 统一切到该工作域
→ 写入独立本地 HLS
```

这是一项 **待 Alpha11 实机验证的工程假设**，不能在 TS 2xx 前写成已确认协议。

若域名配对仍失败，Alpha11 才继续：

```text
恢复出的 authKey
→ 回灌 /api/m3u8/play?path=...&authKey=...
→ 回灌 /api/m3u8/h5/decode?path=...&authKey=...
→ 真实 TS+KEY 2xx 验证
```

只有仍无结果时，才使用 Alpha10 的客户端 Type-A 重签公式。这样排障优先级从“猜公式”改成“先恢复 APP 原凭据/原签名配对”。

### 4. 漫画 Alpha10 产品判断错误：不是“第一张顶部白边”，而是多页四边源图白画布

Alpha10 用户实机截图明确显示：

- 系统标题栏/chrome 已经消失；
- 一张漫画小画面位于白色大画布中央，左右、顶部、底部都有明显源图留白；
- 下一张图在下方继续出现；
- `漫画首图裁白` 诊断仍为空，但视觉结果本身已足够证明“只裁首图顶部”不是正确产品方案。

因此 Alpha11 不再继续调 Alpha10 的 `first/top/bestRatio`，而是换成独立 `acfunComicCrop`：

```text
每一张正文图都处理
→ 先判断 JPEG/PNG/WebP magic；必要时只 XOR 前100字节
→ Bitmap 扫描四边近白/低色差外画布
→ 找内容 bbox：top / bottom / left / right
→ 保留少量安全 padding
→ 只有 bbox 足够大且裁剪收益明确才裁
→ JPEG 96 输出到全新 alpha11 缓存目录
→ pic_1_full 全宽显示裁后的内容
```

长期结论更新：漫画 API/AES/imgList 已经稳定，后续该问题属于 **源图版面规范化**，不得再回头改 chapterInfo/AES。

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
→ 尝试少量 CDN Type-A 兼容公式
→ 每个候选直接请求首 TS
```

成功标准严格为：

```text
首 TS HTTP 2xx + 非空二进制
AND
对应 AES KEY HTTP 2xx + 至少16字节
```

Alpha10 最终实机 `keyCount=0`，所以“公式”本身尚未得到真实候选密钥验证。

### 4. 漫画 Alpha10：只裁首图顶部方案被实机截图进一步否定

Alpha9/10 都已确认 Reader 页面 chrome 被完全移除。Alpha10 仍按“第一张图顶部连续白边”建模，但最新实机截图显示白画布同时存在左右/底部以及其它页面，因此 Alpha11 已升级为所有图片四边 bbox 裁剪。

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
- Reader chrome 已经可以移除；剩余大白区域若位于图像画布，必须在 ImageAdapter 层做四边/版面规范化，不能继续用 Theme 解决。

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
11. Alpha9：所有 Header/Range 组合仍 `403 invalid sign`，绝对 playPath 为 `missing auth_key`；
12. Alpha10：`playbackAuthKey keyCount=0`，证明 cloud remoteConfig/CDN refresh 不是完整凭据来源，不能据此判定客户端签名公式失败。

因此后续播放排障优先级：

```text
独立 playback credential 来源
> 服务端 auth_key 与 CDN 域名配对
> 原生 m3u8 endpoint + authKey
> 客户端签名算法
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
- Alpha10：客户端签名配置扫描最终实机 `keyCount=0`；首图顶部裁白仍不符合实际源图版面。
- Alpha11：恢复独立 playback credential + 现有签名 CDN 域名配对 + 原生 authKey 回灌；漫画升级为所有页四边白画布裁剪。

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
