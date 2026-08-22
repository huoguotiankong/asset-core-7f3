# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前恢复基线

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式 Stable 与 `latest.json` 固定在 `0.4.9 / Build149`，是 Test 大改失败后的恢复基线。
- 历史实机已验证：常规视频播放、极速切换、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- 图片解密固定合同：key `2020-zq3-888`，只 XOR 前100字节；JPEG/PNG/GIF/WebP 明文不重复解密。
- Stable/latest 在 Alpha18 仍冻结。

### Test 0.6.0-alpha18 / Build169 / Shell7.4（当前测试）

#### Alpha16 最新实机探针

```text
ACFun 2026.08.23-v0.6.0-alpha16
cover=jhimage/20260725/a8/d7/zg/ws/21d72fca8ed64b829fd38bbeea97e495.jpg
play={
  "id":"265755",
  "used":"seed",
  "path":"jpd/20260710/x4/x9/qj/k9/b2b3fb280fb4437a875ce81297d4ced4.m3u8",
  "decode":"https://sjacfanapi.sexbar.site/api/m3u8/h5/decode?path=jpd%2F20260710%2Fx4%2Fx9%2Fqj%2Fk9%2Fb2b3fb280fb4437a875ce81297d4ced4.m3u8",
  "url":"file:///sto..."
}
short=loadType=2 variant=0 count=30
comic=none
```

这组结果明确把四类问题定位到具体层：

1. 视频封面字段已经找到，问题是 `jhimage/...` 相对地址的 ImageDomain/图片消费链。
2. 视频 Seed 和 decode URL 都已经正确，Alpha16 在 `cacheM3u8 → file:///...` 后仍不可播，因此优先隔离缓存/本地文件步骤，不能继续误判为“没拿到播放地址”。
3. 短视频接口 `loadType=2` 已返回30条，空页属于 ModelAdapter / Renderer / 点击运行链问题，而不是 Provider 没数据。
4. `comic=none` 表明 Alpha16 漫画 Reader 没真正进入，优先修跨页主键/路由。
5. 另有当前成功事实：`fiction-list|audio||3|0 -> POST fiction/base/findList (8)`，小说/有声 POST-first 列表链禁止无关重写。

#### APK 1.9.7 静态证据

用户上传 APK 的 `libapp.so` 当前可确认存在：

```text
imgDomain
generatedCoverImg
templateCoverImg
videoCover
https://cdn.ukaim.com/
video/can/watch
m3u8/player/referer
loadType
shortVideo
comics/base/chapterInfo
fiction/base/chapterInfo
```

这些字符串只证明合同/常量存在；HTTP Method 与响应结构仍以实机为最高事实。

#### Alpha18 活动 Release

Alpha18 不继承 Alpha16 业务模块，也不加载 Alpha17 首版 Playback。当前活动链：

```text
Stable 0.4.9 八模块
+ A15 Clean Runtime/UI
+ A17 Image/Model
+ A17 Short Renderer
+ A17 Comic Router/Reader
+ A18 Validated Seed Playback
```

##### 图片：`jhimage` 专用 Adapter

当前视频封面已明确是：

```text
jhimage/...
```

Alpha17/18 只对该家族映射：

```text
jhimage/...
→ https://cdn.ukaim.com/jhimage/...
→ $(url,headers).image(...)
→ acfunImageDecoder
```

现有 `acfunImageDecoder` 会先检查 JPEG/PNG/GIF/WebP Magic；明文直接返回，非明文才 XOR 前100字节，因此不会对正常图片二次解密。

全局 `itemInfo()` 只做 fallback-only 补齐：Stable 已经有 `id/title/img/uri` 时不覆盖；缺失时再读取嵌套 `videoId/generatedCoverImg/templateCoverImg/videoUrl/playPath` 等字段。

##### 播放：Validated Seed + Remote Decode

Alpha17 发布前复核发现首版 mediaKeys 没把通用 `path` 纳入 Seed，而 Alpha16 当前设备已经明确证明有效 Seed 就是：

```text
path=jpd/...m3u8
```

因此没有让已知可能漏 Seed 的 Alpha17 成为活动测试，直接升到 Alpha18。Alpha18 规则：

```text
1. videoUrl/playUrl/videoUri/m3u8Url/m3u8/playPath/sourcePath
2. 再有限接受 path/url
3. 通用 path/url 必须匹配 m3u8/mp4/jpc/jpd 等媒体形态
4. 无 Seed 才 GET video/can/watch
5. POST can/watch 仅后级兼容
6. __v043DecodePlayUrl
7. 远程 decode URL + PlayerHeaders 直接交海阔播放器
```

本版**不调用 `cacheM3u8`**，也不把 `file:///...` 当“播放完成”的证明。返回 PlayModel 只有真实播放线路：

```js
{urls:[url], names:['播放'], headers:[headers]}
```

收藏、评论、复制标题保持 `scroll_button`，不进入播放器列表。

##### 短视频：接口已成功，只修消费链

- 首选 `loadType=2`，保留有限 fallback。
- Alpha18 使用 fallback-only `itemInfo()` 解析30条结果中的嵌套 id/封面/媒体字段。
- 短视频栏目使用独立 Renderer。
- 点击卡片显式进入当前 Bootstrap v074，再调用 A18 PlaybackAdapter。
- 这同时绕开 A15 `currentBootPlay()` 闭包硬编码 v071、可能在点击时重载旧 Release 的问题。

##### 漫画：显式主键路由 + 已验证 Reader

继续使用 Alpha12 已经实机成功的核心合同：

```text
comics/base/chapterInfo {chapterId}
→ robust image extractor
→ ac.image()
→ pic_1_full
```

Alpha17/18 的关键修复在路由：章节 URL 直接写入 `content_kind/comics_id/comic_chapter_id/comic_chapter_title` query，不再依赖 `extra` 跨页透传；尾部使用 `#fullTheme#noRecordHistory#`。Reader 不主动添加章节说明/标题内容，只输出阅读图片，减少顶部冗余区域。

#### Alpha18 发布链

- Release：`apps/video/acfun/releases/0.6.0-alpha18/release.json`
- Build：169
- Bootstrap：`bootstrap_test_v074.js?v=7400`
- Shell：`acfun_remote_test_v074.txt`
- 规则 version：`2026082306`
- Stable/latest 不修改。
- 当前 Test 必须继续实机验证：视频封面、普通视频播放、播放器线路、短视频列表/播放、漫画章节/顶部区域；未通过不得晋级 Stable。

---

## 关键测试历史

### Alpha17 / Build168 / Shell7.3 —— 未作为最终活动测试

- 首次根据 Alpha16 探针建立 `jhimage → cdn.ukaim.com`、短视频当前 Bootstrap Renderer、漫画显式 query Reader，并移除 Alpha16 业务模块。
- 发布前复核发现 Playback 没把当前设备已证明有效的通用 `path=jpd/...m3u8` 安全纳入 Seed，因此立即由 Alpha18 替换；A17旧播放模块不进入 Alpha18 Release。

### Alpha16 / Build167 / Shell7.2 —— 已停止继承业务模块

- 在 Alpha15 Clean Rebase 上追加 focused media。
- 详情收藏/评论退出 `text_3` 播放列表；Bootstrap 增加 `searchCenter/category` dispatcher。
- 最新实机探针证明：`jhimage` 相对封面字段已找到；播放 seed/decode 已找到，但 `cacheM3u8` 后 `file:///...` 仍不可播；短视频接口已有30条；漫画探针未进入。

### Alpha15 / Build166 / Shell7.1

- 真正 Clean Rebase：Stable0.4.9 八模块 + 单一 A15 Clean Runtime/UI。
- 动漫/漫画列表封面恢复，但视频分类封面仍空。
- 普通视频播放失败，播放器列表混入收藏/评论。
- 漫画章节空白、短视频列表空。
- 有声 `POST fiction/base/findList` 实机返回8条，成为当前有声列表主合同。

### Alpha14 / Build165 / Shell6.10 —— 停止继承

- 只跳过 Alpha13、回到 Alpha12 多层 overlay 仍不足以干净恢复。
- 永久结论：recovery base 本身如果仍包含多层未完整验收 overlay，应回 Stable Clean Rebase。

### Alpha13 / Build164 / Shell6.9 —— 隔离失败

- 深层评分封面 Resolver 覆盖已有 `img`，造成全局封面退化。
- `pics://` 替代 `pic_1_full` 后漫画从可读退化为不可读。
- 当前 Host 实机：`POST video/can/watch → HTTP405`。

### Alpha12 / Build163 / Shell6.8 —— 历史部分成功

- **漫画章节实机恢复成功。**
- 关键合同：`chapterInfo {chapterId}` + robust image list + `ac.image` + `pic_1_full`。
- 短视频和有声封面当时恢复；漫画和部分普通视频封面恢复。

### Alpha10 / Build161 / Shell6.6

- **小说/有声分类实机恢复。**
- **小说正文实机恢复。** `.txt` 章节地址需要主动 fetch 后显示正文。

### Alpha8 / Build159 / Shell6.4

- 筛选回到首页同页 `select://`，解决页面栈累积。
- 九栏目同页切换。
- **短视频卡片点击直接播放曾实机验证正常。**

---

## Stable/Core 长期协议记忆

### 0.4.8

- APP 1.9.7：`video/tags/getTagsZ → video/tagTitleList` 是标签主链。
- 精选/里番使用 Station；动漫/视频使用动态 `classTypeList`；漫画使用 `getComicsStations / info / chapterInfo`。

### 0.4.5

- 播放优先列表/详情已有 `videoUrl/path`，缺失才 `video/can/watch`。
- Alpha16 已证明“正确 decode → cacheM3u8 → file:/// 本地地址”仍可能播放失败；以后直链播放与缓存播放必须分层验收，不能把 cache 成功等价为播放器成功。
- 旧历史曾使用 POST can/watch；2026-08-23 当前 Host 实机 POST=405，Method 不能视为永久常量。

### 0.4.3

- 分类视频 `/api/video/getByClassify`；搜索优先 `/api/video/queryVideoByTitle`，再 `search/keyWordV2`。
- 历史已验证播放链：`can/watch → path → /api/m3u8/h5/decode?path=...`，播放器补 UA/Referer/Origin。

### 0.4.2 / 0.4.1

- 列表/分类/搜索 Cache-First + stale fallback；空响应不能覆盖有效缓存。
- 封面优先 `_480`，解密后持久缓存。

### 0.4.0

- 图片解密：`2020-zq3-888`，XOR 前100字节，明文图片直接返回。

### Core 0.1.9

- APK 原生协议历史确认：`t + s(MD5) + deviceId + User-Mark + aut`。
- `encData` 使用 AES-CBC 解密。
