# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前恢复基线

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式 Stable 与 `latest.json` 固定在 `0.4.9 / Build149`，是所有 Test 大改失败后的恢复基线。
- 历史实机已验证：常规视频播放、极速切换、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- 图片解密固定合同：key `2020-zq3-888`，只 XOR 前 100 字节；JPEG/PNG/GIF/WebP 明文不重复解密；缓存目录 `hiker://files/cache/acfun_cover`。
- Stable/latest 在 Alpha17 仍保持冻结。

### Test 0.6.0-alpha17 / Build168 / Shell7.3（当前测试）

#### Alpha16 最新实机探针：第一次把四个问题定位到具体层

用户当前设备返回：

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

这组结果的意义：

1. **视频封面不是“没字段”。** Parser 已经找到真实相对路径 `jhimage/...jpg`，剩余问题是 ImageDomain/图片消费链。
2. **视频播放不是“没媒体地址”。** Feed seed 已经给出 `jpd/...m3u8`，`__v043DecodePlayUrl()` 也正确生成 `/api/m3u8/h5/decode?path=...`。Alpha16 之后把它交给 `cacheM3u8` 并得到 `file:///...`，播放器仍失败，因此本轮优先隔离 cache/local-file 步骤，而不是继续改 `can/watch`/字段扫描。
3. **短视频不是“接口没内容”。** `video/list + loadType=2` 明确返回 30 条。空白发生在 ModelAdapter / Renderer / 点击时运行链。
4. **漫画 `comic=none`** 说明 Alpha16 新 Reader 根本没有形成可观测调用，优先修路由主键传递，而不是继续扩大章节接口猜测。
5. 之前已经确认：`fiction-list|audio||3|0 -> POST fiction/base/findList (8)`，所以小说/有声 POST-first 列表链继续冻结，不做无关改动。

#### APK 1.9.7 当前静态证据

重新检查用户上传 APK 的 `libapp.so`，当前可确认存在：

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

这只能证明 APP 含这些合同/常量，具体 Method 和响应结构仍以实机为最高事实。

#### Alpha17 架构决策

Alpha17 **不继承 Alpha16 业务模块**。活动 Release 改为：

```text
Stable 0.4.9 八模块
+ A15 Clean Runtime/UI
+ A17 Image/Model
+ A17 Playback
+ A17 Short Renderer
+ A17 Comic Router/Reader
```

也就是说 `acfun_fix_v060_a16_media.js` 不进入 Alpha17 Release，避免继续携带已经被实机证明可疑的 `cacheM3u8 → file:///...`、旧短视频闭包和漫画路由实现。

#### Alpha17 图片链

当前视频封面探针已经明确给出：

```text
jhimage/20260725/...jpg
```

Alpha17 只对 `jhimage/` 家族做专门映射：

```text
jhimage/...
→ https://cdn.ukaim.com/jhimage/...
→ $(url,headers).image(...)
→ acfunImageDecoder
```

现有 `acfunImageDecoder` 自身先检查 JPEG/PNG/GIF/WebP Magic：

- 已是正常图片 → 原样返回。
- 不是正常图片 → 使用 `2020-zq3-888` XOR 前100字节，再检查。

因此可以安全用于该 CDN，不会对明文图片二次 XOR。

同时 Alpha17 将全局 `itemInfo()` 改为 **fallback-only 补齐**：Stable 已经得到的 `id/title/img/uri` 不覆盖，只在缺失时向嵌套对象查 `videoId / generatedCoverImg / templateCoverImg / videoUrl / playPath` 等已知字段。这样短视频返回30条时也不会因为 Stable 顶层 Parser 没读到 id 而被 Renderer 全部过滤掉。

#### Alpha17 播放链

Alpha16 探针已经证明：

```text
seed path 正常
→ decode URL 正常
→ cacheM3u8 后得到 file:///...
→ 实机仍播放失败
```

因此 Alpha17 暂时回归 Stable v043 的最小播放合同：

```text
seed videoUrl/path
→ 无 seed 才 GET video/can/watch
→ POST can/watch 仅兼容 fallback
→ __v043DecodePlayUrl
→ 远程 decode URL + PlayerHeaders
→ 海阔播放器
```

**本轮不调用 `cacheM3u8`。** 先验证远程 decode URL 能否恢复播放，再决定是否需要重新设计 HLS 缓存层。

返回 PlayModel 只有：

```js
{urls:[真实播放地址], names:['播放'], headers:[headers]}
```

收藏/评论/复制标题继续保持独立 `scroll_button`，不进入播放器线路。

#### Alpha17 短视频

Alpha16 已证明 `loadType=2 variant=0 count=30`，所以 Alpha17 不再研究“有没有数据”，只修消费链：

- 首次状态固定 `loadType=2`，有限 fallback 仍保留。
- 用 Alpha17 全局 fallback-only `itemInfo()` 解析嵌套 id/封面/媒体字段。
- 短视频栏目使用独立 Renderer。
- 点击卡片显式 require **当前 Bootstrap v073** 后调用 A17 PlaybackAdapter。

这里修掉一个之前容易漏掉的运行链问题：A15 的 `currentBootPlay()` 闭包内部硬编码 `bootstrap_test_v071.js`，后续只覆写 `ac.play` 并不能保证点击时仍处于新 Release；点击卡片可能重新加载旧 v071。Alpha17 短视频不再走这个闭包。

#### Alpha17 漫画

Alpha12 已经有实机成功事实，继续坚持：

```text
comics/base/chapterInfo {chapterId}
→ robust image extractor
→ ac.image()
→ pic_1_full
```

Alpha17 的重点不是继续改接口，而是修路由：

- 漫画详情中的每个章节 URL 直接把 `comics_id / comic_chapter_id / comic_chapter_title / content_kind` 写进 query。
- 不再依赖 `extra` 是否跨二级页面完整透传。
- URL 尾部统一为 `#fullTheme#noRecordHistory#`。
- Reader 不再主动 `setPageTitle()`，页面结果只输出漫画图片，减少顶部冗余 UI。
- Reader 仍以 `{chapterId}` GET 为第一优先，POST 和 `{comicsId,chapterId}` 仅做兼容 fallback。

#### Alpha17 发布链

- Release：`apps/video/acfun/releases/0.6.0-alpha17/release.json`
- Build：168
- Bootstrap：`bootstrap_test_v073.js?v=7300`
- Shell：`acfun_remote_test_v073.txt`
- 规则 version：`2026082305`
- Test/Candidate/Channels/App Manifest 切 Alpha17。
- Stable 0.4.9 / latest.json 不修改。
- 四个 A17 拆分模块在创建前已执行 `node --check`；发布后又回读确认 Release、Bootstrap、Shell 与模块路径存在。
- Alpha17 仍必须实机验证：视频封面、视频播放、播放器线路、短视频列表/播放、漫画章节与顶部效果；没有实机结果不得晋级 Stable。

---

## 关键测试历史

### Alpha16 / Build167 / Shell7.2 —— 已停止继承业务模块

- 在 Alpha15 Clean Rebase 上追加 focused media。
- 详情收藏/评论退出 `text_3` 播放列表；Bootstrap 增加 `searchCenter/category` dispatcher。
- 有声 `POST fiction/base/findList` 保持成功。
- 最新实机探针证明：`jhimage` 相对封面字段已找到；播放 seed/decode 已找到，但 `cacheM3u8` 后 `file:///...` 仍不可播；短视频接口已有30条；漫画探针未进入。
- 结论：Alpha17 不继承 A16 业务模块，只保留已确认的事实和产品意图。

### Alpha15 / Build166 / Shell7.1

- 真正 Clean Rebase：Stable0.4.9 八模块 + 单一 A15 Clean Runtime/UI。
- 动漫/漫画列表封面恢复，但视频分类封面仍空。
- 普通视频播放失败，播放器列表混入收藏/评论。
- 漫画章节空白、短视频列表空。
- searchCenter 因 Bootstrap dispatcher 未扩展而报错。
- 有声 `POST fiction/base/findList` 实机返回8条，成为当前有声列表主合同。

### Alpha14 / Build165 / Shell6.10 —— 停止继承

- 只跳过 Alpha13、回到 Alpha12 多层 overlay 仍不足以干净恢复。
- 实机普通视频首页/详情封面继续灰图，旧问题大量存在。
- 永久结论：recovery base 本身如果仍包含多层未完整验收 overlay，应回 Stable Clean Rebase，而不是继续删最后一层补丁。

### Alpha13 / Build164 / Shell6.9 —— 隔离失败

- 深层评分封面 Resolver 无条件覆盖已有 `img`，造成全局封面退化风险。
- `pics://` 替代 `pic_1_full` 后漫画从可读退化为不可读。
- 视频/短视频/有声播放仍失败。
- 当前 Host 实机：`POST video/can/watch → HTTP405`。

### Alpha12 / Build163 / Shell6.8 —— 历史部分成功，不再作为主干

- **漫画章节实机恢复成功。**
- 关键合同：`chapterInfo {chapterId}` + robust image list + `ac.image` + `pic_1_full`。
- 短视频和有声封面当时恢复；漫画和部分普通视频封面恢复。
- 普通视频、短视频、有声播放未闭环。

### Alpha10 / Build161 / Shell6.6

- **小说/有声分类实机恢复。**
- **小说正文实机恢复。** 真实 `.txt` 章节地址需要主动 fetch 后显示正文，不能把 URL 原样输出。

### Alpha8 / Build159 / Shell6.4

- 筛选回到首页同页 `select://`，解决不断打开新页面造成页面栈累积。
- 九栏目同页切换。
- **短视频卡片点击直接播放曾实机验证正常。**

---

## Stable/Core 长期协议记忆

### 0.4.8

- APP 1.9.7：`video/tags/getTagsZ → video/tagTitleList` 是标签主链。
- 精选/里番使用 Station；动漫/视频使用动态 `classTypeList`；漫画使用 `getComicsStations / info / chapterInfo`。

### 0.4.5

- 播放优先列表/详情已有 `videoUrl`；缺失才请求 `video/can/watch`。
- 旧版本曾使用 `cacheM3u8` 按视频/decode URL 缓存；**Alpha16 当前设备已经证明“正确 decode → cacheM3u8 → file:/// 本地地址”这一支仍可能播放失败，因此后续必须把直链播放和缓存播放分层验收，不能把 cache 成功等价成播放器成功。**
- 旧历史曾使用 POST can/watch；**2026-08-23 当前 Host 实机 POST=405，Method 不能视为永久常量。**

### 0.4.3

- 分类视频 `/api/video/getByClassify`；搜索优先 `/api/video/queryVideoByTitle`，再 `search/keyWordV2`。
- 已验证播放链：`can/watch → path → /api/m3u8/h5/decode?path=...`，播放器补 UA/Referer/Origin。

### 0.4.2 / 0.4.1

- 列表/分类/搜索 Cache-First + stale fallback；空响应不能覆盖有效缓存。
- 封面优先 `_480`，解密后持久缓存。

### 0.4.0

- 图片解密：`2020-zq3-888`，XOR 前100字节，明文图片直接返回。

### Core 0.1.9

- APK 原生协议历史确认：`t + s(MD5) + deviceId + User-Mark + aut`。
- `encData` 使用 AES-CBC 解密。
