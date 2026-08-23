# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json / web.json`、当前 Release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件写入前必须重新读取，只手术式修改 ACFun 项。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结，作为恢复基线。
- 历史实机曾验证：常规视频列表/播放、封面 XOR 解密与持久缓存、精选/里番 Station、动态分类、短视频底座、漫画详情/章节阅读。
- Remote Manager `id=acfun`。

### Test 1.0.0-alpha11 / Build10011 / Shell9.0

- 继续作为 **原生协议研究线**，不晋级 Stable。
- Remote Manager `id=acfun-test`，与 Stable/Web 完全隔离。
- 当前主要阻塞：HLS 分片 `auth_key` 与 CDN 验签不一致；漫画原生 Reader 在多轮裁白/渲染修复后仍存在实机退化。

### Web 1.1.0-web2 / Build11002 / Native Shell1.1

- 独立程序 `acfun-web`，名称 `ACFun·网页版`，不覆盖 Stable/Test。
- **Web1 产品方向已废弃：禁止再把整站 X5 WebView 当小程序主界面。**
- Web2 目标：**海阔原生 UI + 网站终端能力兜底**。
- 首页、专题、分类、搜索、列表、详情、收藏、评论等全部使用海阔原生组件。
- 数据层复用当前已能稳定返回列表/封面的 ACFun Provider。
- 只有最终视频播放、漫画阅读进入 H5 Bridge，由网站前端自行完成授权/渲染。
- APP 风格 H5：`https://ac001dhzh5.d24m42dh.work/home`；纯网页备用：`https://ac6688.a10hkxu0.work/`；支持自定义最新网址。
- Web2 使用独立 `acfun-web` Remote Manager 状态；原始整站仅保留在设置/诊断中。

---

## 2026-08-23 · Web1 实机否定 → Web2 原生网页源兜底

用户实机反馈 Web1 打开后就是完整网页，明确要求：**“需要做出一个海阔原生的小程序”**。

因此架构改为：

```text
海阔原生首页/分类/搜索/详情
→ 当前 ACFun Provider 提供列表与元数据
→ 视频详情：原生卡片/收藏/评论
→ 点击“网页播放”才进入 H5 Bridge
→ 漫画详情：原生封面/章节目录
→ 点击“网页阅读/章节”才进入 H5 Bridge
```

Web2 Release 只继承 Clean Rewrite 的基础 `core/protocol/provider/media/ui + alpha2 device fix`，**不加载 Alpha3~Alpha11 连续失败的播放/漫画实验补丁**，最后叠加 `web-native-bridge` 与独立图片适配器，避免把失败链继续带入兜底产品。

网页 Bridge 当前策略：

- 主页面不是 WebView；
- 终端能力页使用 `x5_webview_single`；
- 默认打开 APP 风格 H5；可切纯网页/自定义域名；
- 注入轻量站内定位逻辑：优先检测已有 video/漫画图片；否则尝试网站搜索并点击匹配标题；
- 后续实机若能确定稳定的 H5 详情/播放路由，再把 Bridge 从“站内定位”升级为“精确直达”。

长期产品原则：**“网页源”表示网站作为 Provider/终端能力来源，不等于把网页整个塞进海阔。**

---

## 原生 Test 当前播放事实

### can/watch

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

### HLS / CDN

已多轮实机确认：

```text
Seed 正确
/api/m3u8/h5/decode?path=<seed> → HTTP200 / application/vnd.apple.mpegurl
HLS 使用 AES-128
KEY/TS URL 各自带短时 auth_key
video/cdn/refresh POST → 返回多条当前 type=11 CDN
```

决定性失败证据：

```text
videoUrl·native manifest → 200
videoUrl·h5 manifest     → 200
AES KEY                  → 曾可 200 / 16 bytes
首 TS                    → 403 Forbidden: invalid sign
playPath·direct          → 403 Forbidden: missing auth_key
```

none / UA / H5 / `jhg_player` / API / APP signed / Range 等 Header 组合均不能把 TS 403 变成 2xx。

因此后续禁止把主要精力退回以下方向：

- Seed/path 是否正确；
- `#isM3u8# / #noPre#`；
- `cacheM3u8()` 返回格式；
- 单纯 Referer/Header/Range；
- 海阔播放器消费方式。

当前播放排障优先级：

```text
独立 playback credential 来源
> 服务端 auth_key 与 CDN 域名配对
> 原生 m3u8 endpoint + authKey
> 客户端签名算法
> 最后才是播放器消费层
```

### Alpha10/11 关键结论

Alpha10 实机：

```text
播放签名配置：keyCount=0
播放重签探针：missing auth parts or playbackAuthKey
```

这只证明 **playbackAuthKey 没有取得**，不能证明 Type-A 公式本身已经被证伪。

APK 1.9.7 静态字符串已确认存在：

```text
playbackAuthKey
playbackDomain
getMediaUrl
playback_credential
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

Alpha11 的研究方向因此转为独立 Credential Recovery；但在用户要求建立 Web2 兜底后，原生协议研究暂停连续升版，避免继续无感知叠补丁。

---

## 漫画长期成功合同

真实数据闭环曾实机验证：

```text
GET comics/base/info?comicsId=<id>
→ chapterList
→ chapterId / chapterNum / comicsId
GET comics/base/chapterInfo?chapterId=<真实数值ID>
→ HTTP200 / code200 / encData
→ AES/CBC/PKCS5Padding 解密
→ payload.domain + imgList
```

长期规则：

- 当前有效 Method = GET；
- 当前主键 = 数值 `chapterId`；
- `encData` AES 链已验证，禁止无故重写；
- 正文结构 = `domain + imgList`；
- 正文必须使用原图，不得套封面 `_480`；
- 封面与正文 ImageAdapter 必须隔离。

原生 Reader 后续出现的问题属于 **图片渲染/版面规范化**，不是 chapterInfo/AES 问题。Alpha9~11 的首图裁白/全页四边裁白均没有形成稳定实机收益，Web2 因此不再继承这条实验链，漫画终端阅读交回网站前端。

---

## 图片长期合同

封面在 Clean Rewrite Alpha2 已实机恢复：

```text
相对 jhimage/...
→ 当前 session imgDomain
→ 列表/详情封面 _480
→ Dalvik UA + Referer=""
→ XOR decoder
→ 持久缓存
```

图片解密：

```text
key = 2020-zq3-888
只 XOR 前100字节
先判断 JPEG/PNG/GIF/WebP magic
明文图片不得重复 XOR
```

Web2 为避免依赖另一个已安装的 ACFun 规则，使用独立页面 `acfun_web_image_decoder` 和独立缓存目录。

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
video/list
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

## Clean Rewrite / Web 简史

- Alpha1：建立 `Core → Protocol/Auth → Provider/Model → Media/Image/Reader → Product UI`。
- Alpha2：恢复封面、统一参数 decode、漫画 GET-first。
- Alpha3：`jhg_player` Referer 被实机证伪为单点解法。
- Alpha4：CDN refresh、签名 AES-128 HLS、真实 chapterId 闭环。
- Alpha5：漫画正文恢复；`#noPre#`/普通本地 M3U8 播放失败。
- Alpha6：回归 `cacheM3u8`，仍失败。
- Alpha7：Stable 播放合同移植仍失败；Reader 改纯图片。
- Alpha8：GET can/watch + 首分片探针，得到 Key200/TS403。
- Alpha9：路由/Header 矩阵得到 `invalid sign / missing auth_key`。
- Alpha10：客户端签名配置实机 `keyCount=0`。
- Alpha11：恢复独立 playback credential + 域名配对研究；漫画尝试全页四边裁白。
- Web1：独立整站 X5 兜底，**实机产品方向被否定**。
- Web2：改为 **海阔原生主界面 + H5 终端能力 Bridge**。

---

## 发布前固定回归

原生 Test 每版至少验证：首页封面/专题、分类、搜索、详情、视频真实出画面且进度持续走、短视频、漫画详情/目录/章节、小说/有声、社区/评论、返回栈与 UI。

Web2 额外至少验证：

1. 首页必须是海阔原生卡片，不得出现整站网页主界面；
2. 精选/漫画/动漫/视频/里番切换正常；
3. 搜索结果和详情页保持原生；
4. 视频详情点击“网页播放”后 H5 Bridge 能定位目标并播放；
5. 漫画详情/章节列表保持原生，点击章节后 H5 Bridge 能定位并阅读；
6. APP版 H5 不可用时可切纯网页；
7. 自定义最新网址保存后立即生效；
8. Stable/Test/Web 三条 Remote Manager 状态互不污染。
