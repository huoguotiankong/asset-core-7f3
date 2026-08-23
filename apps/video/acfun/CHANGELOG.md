# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结在 `0.4.9 / Build149`，作为 Clean Rewrite Test 失败时的恢复基线。
- 历史实机已验证：常规视频列表/播放、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- Stable Remote Manager `id=acfun`；Clean Rewrite Test `id=acfun-test`，两者状态隔离。

### Test / Candidate 1.0.0-alpha4 / Build10004 / Shell8.3

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
```

Alpha4 仍属于 Clean Rewrite，不回到 0.6.0 历史补丁栈；Stable/latest 不修改。

---

## 2026-08-23 · Alpha3 第三轮实机结果 → Alpha4

设备实际运行：

```text
版本：1.0.0-alpha3 / Build 10003
运行：2026.08.23-v1.0.0-alpha3
接口：https://sjacfanapi.sexbar.site
令牌：已建立
图片域：https://79eq2aouwhf6.asigoo.com
```

### 已确认继续稳定：封面链

设备已经返回本地持久缓存：

```text
jhimage/...
→ https://79eq2aouwhf6.asigoo.com/jhimage/...
→ _480
→ Dalvik UA + Referer=""
→ acfunImageDecoder
→ file:///.../acfun_next_img_a2/*.jpg
```

本轮不得再修改已经实机恢复的图片链。

### 视频：四种 Referer 线路全部失败，问题转向 CDN/鉴权合同

Alpha3 实机 Seed：

```text
id=266822
path=jpd/20260729/ur/v5/4p/b5/8e64b973232740eabd0f42af95b98c5b.m3u8
decode=https://sjacfanapi.sexbar.site/api/m3u8/h5/decode?path=...
播放凭据={"referer":"jhg_player"}
```

Alpha3 提供：

```text
APP标识   Referer/X-Referer=jhg_player
H5来源    Referer=当前 H5
接口来源  Referer=当前 API Host
无来源    不发 Referer/X-Referer
```

用户实机确认 **四条全部不可播**。因此永久结论：

- 不再继续围绕 Referer 值盲猜；
- `m3u8/player/referer → jhg_player` 只是播放合同的一部分，不是完整 CDN 配置；
- Seed/decode 已经不是当前首要疑点，必须找 APP 实际 CDN 与鉴权刷新链。

重新静态检查用户上传的 ACFun 1.9.7 `libapp.so`，新增确认：

```text
video/cdn/refresh
video/cdn/reportError
cdnList
cdnRes
playbackDomain
playbackAuthKey
mp4Domain
getMediaUrl
m3u8/player/referer
X-Referer
/api/m3u8/play
/m3u8/play
missing authKey
PlaybackCdnErrorService refreshVideoCdn failed
```

这组字符串明确表明 APP 播放前存在独立 **CDN refresh**，不能只请求 `m3u8/player/referer`。

Alpha4 PlaybackAdapter：

```text
1. Seed First：继续使用列表真实 jpd/jpc/...m3u8
2. 调用 video/cdn/refresh
3. 尝试参数：videoId+path / videoId / path / 空参数，GET/POST 有界探测
4. 从返回中递归提取 playbackDomain / playbackAuthKey / mp4Domain / cdnList
5. 优先生成 CDN直连 与 APP播放 候选
6. decode fallback 改用完整 APP 签名 Header：aut/deviceId/t/s/User-Mark + UA + Referer/X-Referer
7. 播放前主动 fetch decode URL，记录 HTTP/Content-Type/前28行响应，定位 manifest/JSON/鉴权/分片层
```

Alpha4 诊断新增：

```text
播放预检
CDN刷新
```

下一轮必须以这两段真实返回决定最终播放主链，禁止再只看播放器“播放异常”猜接口。

### 漫画：Alpha3 存在两个明确消费错误

Alpha3 实机章节探针：

```text
GET_API sjacfanapi -> HTTP 400 code=400
GET_FRONT sjacfanapi -> HTTP 400 code=400
POST_JSON sjacfanapi -> HTTP 405
POST_FRONT sjacfanapi -> HTTP 405
GET_API api2.uszim.com -> HTTP 200 code=404
BODY {"code":404,"data":null,"message":"Resource not found.","result":"fail"}
```

Alpha3 错误一：**把 HTTP 200 + 业务 code=404 当成成功 JSON**，导致 `SUCCESS_RAW` 并提前停止后续参数/Host 尝试。这是协议层假成功，必须拒绝。

Alpha3 错误二：Clean Rewrite `chapterRows()` 会深度递归，并允许通用 `id` 作为章节主键。当前传出的：

```text
chapterId=6a61d627996b9376fb7102e7
```

是 24 位十六进制 ObjectId 形态；在未看到真实 `chapterList` 首项前，不能确认它就是 API 要求的 `chapterId`。递归抓到“有 id+title 的任意对象”可能误把非章节对象当章节。

Alpha4 ComicAdapter：

```text
1. 漫画目录只读 obj.chapterList / obj.chapters，不再全对象递归抓章节
2. 记录 root keys、chapterCount、首章完整 JSON（截断3000字符）
3. 主键优先 chapterId / chapter_id；通用 id 只作后级兼容
4. 同时保留 chapterNum/chapterNo/chapterIndex/sortNum
5. Reader 依次尝试：chapterId / chapter_id / id / comicsId+chapterId / comicsId+chapter_id
6. 若有 chapterNum，再尝试 chapterNum-as-id / chapterNum / comicsId+chapterNum
7. HTTP 2xx 只有业务 code 0/200（或无业务码）且 payload 实际含 imgList/图片/canWatch 才算成功
8. HTTP200 + code404/data=null 必须继续探测，禁止缓存为章节成功结果
```

Alpha4 诊断新增：

```text
漫画详情结构
漫画章节探针（带每个参数变体标签）
```

---

## 2026-08-23 · Alpha2 第二轮实机结果 → Alpha3

设备：

```text
版本：1.0.0-alpha2 / Build 10002
接口：https://sjacfanapi.sexbar.site
图片域：https://79eq2aouwhf6.asigoo.com
```

### 封面修复成功

```text
相对 jhimage/... 优先 session imgDomain
→ asigoo _480
→ User-Agent=Dalvik
→ Referer=""
→ acfunImageDecoder
→ 持久缓存
```

图片长期合同：

```text
key = 2020-zq3-888
仅 XOR 前100字节
先检查 JPEG/PNG/GIF/WebP Magic
明文图片不得二次解密
```

### 视频 Alpha2 事实

```text
Seed = jpd/...m3u8
decode URL 正确
#isM3u8# 后播放器曾识别约09:19总时长
但黑屏、00:00不走
m3u8/player/referer = {"referer":"jhg_player"}
playbackDomain=""
hasAuth=false
```

因此 Alpha3 曾把同一 decode URL 以四种 Header 线路送播放器；Alpha4 实机已证明这四条都不够。

### 漫画 Alpha2 事实

- `comics/base/chapterInfo` 最后可见 POST 405，但旧诊断会覆盖前置 GET，不能仅凭最后一行推导 GET 结果。
- Alpha3 因此建立 GET/POST + API/H5 Origin 精确探针；Alpha4 再根据第三轮返回修复业务404假成功与章节模型误抓风险。

---

## 2026-08-23 · Alpha1 首轮实机结果 → Alpha2

Alpha1：

```text
版本：1.0.0-alpha1 / Build 10001
接口：https://sjacfanapi.sexbar.site
令牌：已建立
图片域：https://79eq2aouwhf6.asigoo.com
GET /api/video/list?loadType=2... HTTP200
```

普通视频已拿到：

```text
id=263416
path=jpd/...m3u8
decode=/api/m3u8/h5/decode?path=...
```

首轮明确问题：

- 认证/列表层已通；
- ImageAdapter 错误硬编码 `cdn.ukaim.com` 导致封面空白；
- Station query 未 decode，标题显示 `%E...`；
- Seed/decode 正确但播放失败；
- 漫画 Method/Reader 需要实机重验；
- 首页开发说明不应进入产品 UI。

Alpha2 修复了图片域、query decode、HLS 标记、播放凭据候选、漫画 GET-first 和首页说明文案。

---

## Clean Rewrite 架构

从 `1.0.0-alpha1` 起 Test 与旧 0.6.0 patch stack 完全切离：

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

- 精选/里番按真实 Station 多专题分块；
- 专题“更多”进入独立二级 Station；
- 动漫/视频：动态 ClassType → Zone/Tag → 排序；
- 漫画/小说/有声/社区各自独立 Adapter/详情/Reader；
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

### APK 已确认关键字符串

```text
imgDomain
generatedCoverImg
templateCoverImg
videoCover
video/can/watch
m3u8/player/referer
video/cdn/refresh
video/cdn/reportError
cdnList
cdnRes
playbackDomain
playbackAuthKey
mp4Domain
getMediaUrl
/api/m3u8/play
/m3u8/play
X-Referer
playback_credential
missing authKey
comics/base/info
comics/base/chapterInfo
chapterId
chapter_id
chapterNum
chapterList
chapters
chapterTitle
chapter_name
comicsId
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
video/cdn/refresh
video/cdn/reportError
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
- 当时有效合同：`chapterInfo {chapterId}` + `imgList` + `ac.image()` + `pic_1_full`。

### Alpha13
- 深层图片 Resolver 覆盖已有字段导致全局封面退化；禁止评分后强覆盖。
- `pics://` 替换 `pic_1_full` 导致漫画退化。
- 当前 Host 曾出现 `POST video/can/watch → HTTP405`，Method 不是永久常量。

### Alpha15
- 旧补丁链过长时应回 Stable Clean Rebase，而不是继续叠 overlay。
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
- HTTP 200 ≠ 业务成功；
- 泛型递归抽取器不得替代确定的业务模型；
- UI/媒体/图片必须海阔实机闭环。

### Alpha18
- 安全把通用 `path/url` 纳入媒体 Seed，但只接受 m3u8/mp4/jpc/jpd 等媒体形态，避免封面路径误判为视频。
- 远程 decode 直交播放器仍需继续验证 CDN/auth/segment/key 消费层。

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
