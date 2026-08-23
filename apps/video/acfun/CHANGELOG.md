# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前版本边界

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式版与 `latest.json` 继续冻结在 `0.4.9 / Build149`，作为 Test 重构失败时的恢复基线。
- 历史实机已验证：常规视频列表/播放、封面 XOR 解密和持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- Stable 与 Clean Rewrite Test 使用不同 Remote Manager 状态：Stable `id=acfun`，Test `id=acfun-test`，禁止互相污染。

### Test / Candidate 1.0.0-alpha2 / Build10002 / Shell8.1

活动 Release：

```text
next/core alpha1
→ next/protocol alpha1
→ next/provider alpha1
→ next/media alpha1
→ next/ui alpha1
→ next/device-regression-fix alpha2
```

Alpha2 是 Clean Rewrite 的首轮实机回归修正版，不回到 0.6.0 历史补丁栈。

---

## 2026-08-23 · Alpha1 首轮实机结果

用户设备实际运行：

```text
版本：1.0.0-alpha1 / Build 10001
运行：2026.08.23-v1.0.0-alpha1
接口：https://sjacfanapi.sexbar.site
令牌：已建立
图片域：https://79eq2aouwhf6.asigoo.com
最近接口：GET /api/video/list?loadType=2&pageSize=15&page=1&pageNum=1 HTTP 200
```

普通视频实际拿到：

```text
id=263416
used=seed
path=jpd/20260302/cj/tp/yz/an/4180e59ba73e4bb38879101eeee63d6f.m3u8
decode=https://sjacfanapi.sexbar.site/api/m3u8/h5/decode?path=...
```

实机截图同时确认：

1. **认证/接口/列表层已经通。** 首页可返回真实标题、播放数、评论数等数据，游客令牌成功建立。
2. **视频封面全部空白。** 设备已经返回真实 `imgDomain=*.asigoo.com`，所以问题不再是“没有图片域”，而是 Alpha1 ImageAdapter 消费错误。
3. **专题页 URL 参数未解码。** 页面标题和正文直接显示 `%E8%BF%9B...`，说明海阔 `getParam()` 在该页返回编码值，必须统一安全 `decodeURIComponent`。
4. **视频 Seed 与 decode URL 均正确，但播放器报播放异常。** 不能再把问题归因于“没拿到播放地址”。
5. **漫画详情请求暴露当前 Host 方法差异。** `comics/base/info` 在 `sjacfanapi.sexbar.site` 的 POST 返回 `HTTP 405`；历史 Stable GET 合同应优先。
6. Alpha1 首页产品结构方向可继续，但“首页按专题流展示/每个专题独立成块”等开发说明不应出现在最终产品 UI。

---

## 2026-08-23 · Alpha2 修复

### 1. 图片链恢复为当前设备事实

Alpha1 错误：

```text
jhimage/... → 强制 https://cdn.ukaim.com/
并给图片请求带 API Host Referer
```

当前设备已经明确给出：

```text
imgDomain=https://79eq2aouwhf6.asigoo.com
```

Alpha2 改为：

```text
所有相对图片（包括 jhimage/...）
→ 优先当前 session imgDomain
→ *.asigoo.com 使用 _480 缩略图
→ User-Agent=Dalvik
→ Referer=""
→ acfunImageDecoder
→ 独立 a2 本地图片缓存
```

只有没有 `imgDomain` 时才使用 `cdn.ukaim.com` 作为 fallback。非 asigoo 的正常绝对图片不强制 XOR。

图片解密长期合同：

```text
key = 2020-zq3-888
仅 XOR 前 100 字节
先检查 JPEG / PNG / GIF / WebP Magic
明文图片不得二次解密
```

### 2. Query 参数统一解码

`ACFunNext.param()` 现在对 `getParam()` 返回值执行一次安全 `decodeURIComponent`，异常时退回原字符串。

目标修复：

- Station 专题标题；
- `pageTitle`；
- 搜索关键词；
- 漫画/小说章节名；
- 其它由 `A.page()` 使用 `encodeURIComponent()` 生成的 query。

以后不能假设海阔不同页面的 `getParam()` 一定自动解码。

### 3. 播放：Seed 正确后继续修“播放器消费层”

Alpha1 当前设备已经证明：

```text
真实 Seed = jpd/...m3u8
H5 decode URL = 正确构造
```

Alpha2 第一修复：给 extension-less 的 `/api/m3u8/h5/decode?path=...` URL 显式追加：

```text
#isM3u8#
```

避免海阔把 `/decode` 当普通媒体地址而不是 HLS。

同时根据 APK 1.9.7 `libapp.so` 新确认的字符串：

```text
m3u8/player/referer
playbackDomain
playbackAuthKey
/api/m3u8/play
/m3u8/play
X-Referer
playback_credential
playback credential is unavailable
missing authKey
```

增加 Playback Credential Adapter：

```text
GET/POST m3u8/player/referer
→ 读取 referer / playbackDomain / playbackAuthKey
→ 构造多条有证据的播放候选
```

当前线路顺序：

```text
H5解码：当前 API /api/m3u8/h5/decode?path=...#isM3u8#
CDN直连：playbackDomain/<seed>?auth_key=...#isM3u8#
APP播放：playbackDomain/api/m3u8/play?path=...&authKey=...#isM3u8#
APP兼容：playbackDomain/m3u8/play?path=...&auth_key=...#isM3u8#
```

播放器 Header 同时带 UA / Referer / Origin / X-Referer。诊断页记录 playback credential、实际 Seed、decode、候选线路。

注意：这一步仍需要实机确认哪一条才是当前 Host 的最终主线路；验证后应收敛成单一主链，不长期保留无意义候选。

### 4. 漫画恢复 GET-first

当前设备：

```text
POST comics/base/info → HTTP 405
```

Alpha2：

```text
comics/base/info       GET → POST fallback
comics/base/chapterInfo GET → POST fallback
```

小说/有声已经有历史实机 `POST fiction/base/findList` 成功证据，不允许因漫画 Method 问题顺手改坏小说/有声 POST-first。

### 5. UI 第一轮收敛

- 删除精选/里番首页的开发说明文案，导航后直接进入专题内容。
- 专题“更多”仍进入真正的二级 Station 页面；专题内排序属于同级状态，只 `refreshPage(false)`。
- 普通 Tab/筛选继续遵守项目导航硬约束：同级切换不得创建新的同功能 `hiker://page`。

---

## Clean Rewrite Alpha1 架构

Alpha1 从旧 0.6.0 补丁活动链完全切离，建立五层：

```text
Core
Protocol/Auth
Provider/Model
Media/Image/Reader
Product UI
```

主要产品栏目：

```text
精选 / 漫画 / 动漫 / 视频 / 里番 / 短视频
社区 / 小说 / 有声 / 我的
```

精选和里番不再使用一个全局 Station 下拉筛选，而是按真实 Station 多专题分块：专题标题 + 预览内容 + 更多页面。

二级页面统一使用 `hiker://page/<path>?rule=ACFun&simple=true`，避免沉浸式标题栏叠加。

---

## APP 1.9.7 长期协议记忆

### 认证与响应

历史确认：

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

Host/Method 属于运行时事实，不得写死为永久不变；失败时记录实际 status/code。

### 内容合同

已验证/高可信路由：

```text
station/stations
station/getStationMore
video/classTypeList
video/getZoneListByClassifyId
video/queryVideoByZone
video/tags/getTagsZ
video/tagTitleList
video/getByClassify
video/list              // 短视频 loadType
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

### 分类长期规则

- 精选/里番：Station，restricted 0/1。
- 动漫/视频：APP 动态 `classTypeList`，再 Zone/Tag。
- 标签优先 APP 1.9.7 已验证的 `getTagsZ → tagTitleList`。
- 短视频：`video/list + loadType`；历史实机 `loadType=2` 返回 30 条。
- 漫画：Station → info → chapterInfo；章节阅读使用 `pic_1_full`。
- 小说/有声：独立 Adapter；有声列表已有 POST-first 成功事实。

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
- `pics://` 替换 `pic_1_full` 导致漫画退化；当前项目漫画阅读优先已验证原生组件。
- 当前 Host 曾实机出现 `POST video/can/watch → HTTP405`，Method 不是永久常量。

### Alpha15

- Clean Rebase 证明“减少 overlay 层级”是必要的；旧补丁链过长时应回稳定基线重组，而不是继续叠补丁。
- 有声 `POST fiction/base/findList` 实机返回 8 条。

### Alpha16

实机：

```text
cover=jhimage/...
play seed=jpd/...m3u8
decode URL 构造正确
cacheM3u8 → file:///... 后仍播放失败
short loadType=2 count=30
comic reader 未进入
```

永久结论：

- 拿到 Seed ≠ 播放完成；
- 构造 decode URL ≠ 播放完成；
- cacheM3u8 成功 ≠ 播放完成；
- Provider 有 30 条 ≠ Renderer 一定显示；
- UI/媒体/图片必须海阔实机闭环。

### Alpha18

- 安全把通用 `path/url` 纳入媒体 Seed，但只接受 m3u8/mp4/jpc/jpd 等媒体形态，避免把封面 path 当视频地址。
- 尝试远程 decode 直交播放器；Clean Rewrite 后继续在播放器消费层验证。

---

## 发布前固定回归

每个 Test 版本至少验证：

1. 首页真实封面与专题结构；
2. 专题“更多”标题不出现 `%E...`；
3. 普通视频详情封面；
4. 普通视频至少一条线路真实播放；
5. 短视频列表与直接播放；
6. 漫画详情、目录、章节图片；
7. 小说正文与有声音频；
8. 社区列表/详情/评论；
9. 搜索及类型切换；
10. 同级 Tab 连切 5 次后系统返回一次即可离开当前功能页；
11. UI 大改必须继续以用户实机截图收敛；
12. Test 未完成上述回归前禁止晋级 Stable。
