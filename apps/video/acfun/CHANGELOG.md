# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结在 `0.4.9 / Build149`，作为 Test 重构失败时的恢复基线。
- 历史实机已验证：常规视频列表/播放、封面 XOR 解密和持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- Stable 与 Clean Rewrite Test 使用不同 Remote Manager 状态：Stable `id=acfun`，Test `id=acfun-test`，禁止互相污染。

### Test / Candidate 1.0.0-alpha3 / Build10003 / Shell8.2

活动 Release：

```text
next/core alpha1
→ next/protocol alpha1
→ next/provider alpha1
→ next/media alpha1
→ next/ui alpha1
→ next/device-regression-fix alpha2
→ next/player-comic-transport-fix alpha3
```

Alpha3 仍属于 Clean Rewrite，不回到 0.6.0 历史补丁栈；Stable/latest 不修改。

---

## 2026-08-23 · Alpha2 第二轮实机结果 → Alpha3

设备实际运行：

```text
版本：1.0.0-alpha2 / Build 10002
运行：2026.08.23-v1.0.0-alpha2
接口：https://sjacfanapi.sexbar.site
令牌：已建立
图片域：https://79eq2aouwhf6.asigoo.com
```

### 已确认修复成功：封面

设备诊断：

```text
图片原始：jhimage/...webp
图片解析：https://79eq2aouwhf6.asigoo.com/jhimage/...webp
图片渲染：...webp_480
User-Agent=Dalvik
Referer=""
→ acfunImageDecoder
```

截图确认首页/详情封面已经恢复。以后不能再对 `jhimage/...` 无条件硬编码 `cdn.ukaim.com`；当前会话返回的 `imgDomain` 优先级最高。

图片长期合同：

```text
key = 2020-zq3-888
仅 XOR 前100字节
先检查 JPEG/PNG/GIF/WebP Magic
明文图片不得二次解密
asigoo 可用 _480 + 空 Referer
```

### 视频：Seed/decode 正确，故障已收敛到播放器 Header/分片层

Alpha2 当前实机：

```text
id=262008
used=seed
path=jpd/20260629/hp/r8/zc/92/ff194ab541b3405ea4cf3926e45d5923.m3u8
decode=https://sjacfanapi.sexbar.site/api/m3u8/h5/decode?path=...
playbackDomain=""
hasAuth=false
播放凭据={"referer":"jhg_player"}
```

播放器截图可识别总时长约 `09:19`，但画面黑、进度停在 `00:00`。因此：

1. 列表真实媒体 Seed 已经正确；
2. `/api/m3u8/h5/decode?path=...` 构造正确；
3. `#isM3u8#` 后播放器已经能把它识别为 HLS；
4. 剩余问题优先检查 **manifest/segment/key 请求 Header**，不能再回到“没拿到播放地址”方向。

关键新事实：`m3u8/player/referer` 返回的是字面值 `jhg_player`。Alpha2 把所有非 HTTP URL 的 referer 判为无效并替换成 API Host，这是错误假设。`referer` 字段可能是服务端约定的**不透明播放器凭据/防盗链标识**，不要求是合法网页 URL。

Alpha3 PlaybackAdapter：

```text
同一个 decode URL，按 Header 分成独立线路：
1. APP标识：Referer=jhg_player / X-Referer=jhg_player
2. H5来源：Referer=当前 H5 Origin
3. 接口来源：Referer=当前 API Host
4. 无来源：不发送 Referer/X-Referer
```

四条线路允许 URL 相同但 Header 不同，不能因为 URL 相同而去重。若 `playbackDomain/authKey` 后续重新出现，再追加 CDN直连 / APP播放 / APP兼容。

待实机确认哪组 Header 真正可播后，立即收敛为主线路，不长期保留探针线路。

### 漫画：章节仍空白，旧诊断不足以证明 GET 失败

Alpha2 页面可进入章节，但 `第1章` 空白。诊断最后显示：

```text
comics/base/chapterInfo
https://sjacfanapi.sexbar.site HTTP_405
https://api2.uszim.com CODE_404_Resource not found.
https://acg.imscc.cc HTTP_404
https://acapp.sexbar.site HTTP_-1
```

必须注意：Alpha2 `tryApi(GET,POST)` 内部每次都会覆盖 `api_error`，所以这个 `HTTP_405` 很可能只是**最后一次 POST** 的结果，不能据此推导前面的 GET 也 405。

另一个高风险点：Clean Rewrite 的 `rawRequest()` 会把业务 `code` 只允许 `0/200`，而 Stable `__v043ExactApi()` 对已知接口只要求 HTTP 2xx + 可解析 body。若漫画 GET 实际 `HTTP 200` 但使用其它成功业务码，Alpha2 会把正确响应误丢弃，然后继续到 POST 405。

Alpha3 对 `comics/base/chapterInfo` 单独建立传输探针：

```text
GET + API Host Origin
GET + H5 Frontend Origin
POST JSON + API Host Origin
POST JSON + H5 Frontend Origin
```

并且：

- HTTP 2xx + 非空 JSON 先进入 `payload()/encData` 解包；
- 不再仅因业务 code 不是 0/200 就立即丢弃；
- 记录每次 method/host/status/code；
- 成功时记录响应前 1800 字符；
- 章节参数继续使用 APK 已确认字段 `chapterId`，并保留 `comicsId+chapterId / comicId+chapterId` 兼容变体。

Alpha3 诊断新增 `漫画章节探针`，下一轮若仍空白，必须以这段精确结果继续定位，禁止再盲目切 Method。

---

## 2026-08-23 · Alpha1 首轮实机结果 → Alpha2

Alpha1 设备事实：

```text
版本：1.0.0-alpha1 / Build 10001
接口：https://sjacfanapi.sexbar.site
令牌：已建立
图片域：https://79eq2aouwhf6.asigoo.com
最近接口：GET /api/video/list?loadType=2&pageSize=15&page=1&pageNum=1 HTTP 200
```

普通视频：

```text
id=263416
used=seed
path=jpd/20260302/cj/tp/yz/an/4180e59ba73e4bb38879101eeee63d6f.m3u8
decode=https://sjacfanapi.sexbar.site/api/m3u8/h5/decode?path=...
```

首轮明确问题：

1. 认证/接口/列表层已经通；
2. 封面全部空白，根因是 ImageAdapter 错误覆盖真实 `imgDomain`；
3. Station “更多”标题显示 `%E...`，说明页面 query 需要自行安全 decode；
4. Seed 与 decode 已正确但播放器失败；
5. 漫画 info/chapter Method 需要按实机重新判断；
6. 首页开发说明文案不应出现在产品 UI。

Alpha2 定向修复：

- 相对图优先 session `imgDomain`；asigoo 使用 `_480 + Referer="" + XOR Decoder`；
- `ACFunNext.param()` 对 `getParam()` 安全执行一次 `decodeURIComponent`；
- decode URL 增加 `#isM3u8#`；
- 读取 APK 中 `m3u8/player/referer / playbackDomain / playbackAuthKey / X-Referer`；
- 漫画 info/chapter 改 GET-first；
- 删除首页开发说明。

---

## Clean Rewrite 架构

从 `1.0.0-alpha1` 起，Test 与旧 0.6.0 patch stack 完全切离：

```text
Core
Protocol/Auth
Provider/Model
Media/Image/Reader
Product UI
Focused Device Fixes
```

主要栏目：

```text
精选 / 漫画 / 动漫 / 视频 / 里番 / 短视频
社区 / 小说 / 有声 / 我的
```

产品规则：

- 精选/里番按真实 Station 多专题分块，不做一个全局 Station 下拉；
- 专题“更多”进入独立二级 Station；
- 动漫/视频使用动态 ClassType → Zone/Tag → 排序；
- 漫画/小说/有声/社区使用独立详情与 Reader；
- 二级页统一 `hiker://page/<path>?rule=ACFun&simple=true`；
- 同级 Tab/筛选只改状态 + `refreshPage(false)`，禁止制造返回栈；
- 普通 `title/desc` 不注入 HTML，只有 `rich_text` 使用 HTML。

---

## APP 1.9.7 长期协议记忆

### 认证/签名/响应

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
iv  = secret
Base64 decode → AES decrypt → JSON
```

当前主要 API Host 实机：

```text
https://sjacfanapi.sexbar.site
```

Host/Method/业务 code 都属于运行时合同，不能视为永久常量。

### APK 1.9.7 已确认播放/漫画字符串

```text
imgDomain
generatedCoverImg
templateCoverImg
videoCover
video/can/watch
m3u8/player/referer
playbackDomain
playbackAuthKey
/api/m3u8/play
/m3u8/play
X-Referer
playback_credential
missing authKey
comics/base/info
comics/base/chapterInfo
chapterId
comicsId
comicId
imgList
imageList
domain
canWatch
```

### 主要内容合同

```text
station/stations
station/getStationMore
video/classTypeList
video/getZoneListByClassifyId
video/queryVideoByZone
video/tags/getTagsZ
video/tagTitleList
video/getByClassify
video/list                  // 短视频 loadType
video/getVideoById
video/can/watch
video/queryVideoByTitle
search/keyWordV2
comics/station/getComicsStations
comics/station/getStationComicsMore
comics/base/info
comics/base/chapterInfo
fiction/other/tagList
fiction/base/findList
fiction/base/info
fiction/base/chapterInfo
community/dynamic/list
```

分类规则：

- 精选/里番：Station，`restricted=0/1`；
- 动漫/视频：`classTypeList` → Zone/Tag；
- 标签优先 `getTagsZ → tagTitleList`；
- 短视频：`video/list + loadType`，历史实机 `loadType=2` 返回30条；
- 漫画：Station → info → chapterInfo，Reader 使用 `pic_1_full`；
- 小说/有声：独立 Adapter；有声 `POST fiction/base/findList` 曾实机返回8条，禁止因漫画 Method 调整而无关重写。

---

## 关键历史回归经验

### 0.6.0 Alpha8
- 九栏目同页切换与筛选不压返回栈。
- 短视频卡片直接播放曾实机成功。

### Alpha10
- 小说/有声分类恢复。
- 小说正文恢复；`.txt` 章节地址需要主动 fetch 后显示正文。

### Alpha12
- 漫画章节实机恢复成功。
- 有效合同：`chapterInfo {chapterId}` + robust image extractor + `ac.image()` + `pic_1_full`。

### Alpha13
- 深层图片 Resolver 覆盖已有字段导致全局封面退化；禁止“评分后强覆盖”。
- `pics://` 替换 `pic_1_full` 导致漫画退化。
- 当前 Host 曾出现 `POST video/can/watch → HTTP405`，Method 不是永久常量。

### Alpha15
- Clean Rebase 证明旧补丁链过长时应回 Stable 重组，而不是继续叠 overlay。
- 有声 `POST fiction/base/findList` 实机返回8条。

### Alpha16

```text
cover=jhimage/...
play seed=jpd/...m3u8
decode URL 正确
cacheM3u8 → file:///... 后仍播放失败
short loadType=2 count=30
comic reader 未进入
```

永久结论：

- 拿到 Seed ≠ 播放完成；
- 构造 decode URL ≠ 播放完成；
- cacheM3u8 成功 ≠ 播放完成；
- Provider 有数据 ≠ Renderer 一定显示；
- UI/媒体/图片必须海阔实机闭环。

### Alpha18
- 安全把通用 `path/url` 纳入媒体 Seed，但只接受 m3u8/mp4/jpc/jpd 等媒体形态，避免封面路径误判为视频。
- 远程 decode 直交播放器仍需继续验证 Header/segment/key 消费层。

---

## 发布前固定回归

每个 Test 版本至少验证：

1. 首页真实封面与专题结构；
2. 专题“更多”标题不出现 `%E...`；
3. 普通视频详情封面；
4. 普通视频至少一条线路真实播放并实际走进度；
5. 短视频列表与直接播放；
6. 漫画详情、目录、章节图片；
7. 小说正文与有声音频；
8. 社区列表/详情/评论；
9. 搜索及类型切换；
10. 同级 Tab 连切5次后系统返回一次即可离开当前功能页；
11. UI 大改必须继续以用户实机截图收敛；
12. Test 未完成上述回归前禁止晋级 Stable。
