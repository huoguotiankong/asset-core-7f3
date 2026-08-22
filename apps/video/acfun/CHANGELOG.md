# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json` 与当前 release/Bootstrap。接口、签名、解密以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前实机事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它小程序并行对话已经提交的状态。

## 当前恢复基线

### Stable 0.4.9 / Build 149 / Shell 5.11.3

- 当前正式 Stable 与 `latest.json` 固定在 `0.4.9 / Build149`，仍是 Test 大改失败时的恢复基线。
- 已验证能力包括：常规视频播放、极速切换、封面 XOR 解密与持久缓存、精选/里番 Station 底座、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- 0.4.9 修复过 0.4.8 activeRelease 缓存错误根目录模块路径的问题；正式 release 使用 `apps/video/acfun/` 明确仓库相对路径，并保留旧状态恢复兼容。
- **Alpha11 仍只进入 Test/Candidate，Stable/latest 不得修改。**

### Test 0.6.0-alpha11 / Build 162 / Shell 6.7.0（当前测试）

#### 2026-08-22 Alpha10 实机结果

Alpha10 已真正运行到设备，结论必须作为 Alpha11 的事实边界：

- **小说和有声分类已经恢复。** Alpha10 从 Alpha8 恢复宽字段分类与分模式请求的方向有效。
- **小说正文已经恢复。** `fictionUrl/contentUrl/...txt` 外部正文源主动读取、净化并显示的 Source Resolver 已形成实机闭环，Alpha11 不得破坏。
- **有声仍无法播放。** 分类和列表可用不代表音频链完成。
- **常规视频仍无法播放。** Alpha10 的 fresh `video/can/watch` 虽能构造候选，但实机播放仍失败。
- **短视频仍无法播放。** Alpha7/Alpha8 曾实机验证短视频直接播放正常，因此这是后续覆盖层造成的回归，不应重新改成普通视频二级页。
- **漫画仍无法阅读。** 不能因为代码里存在 `pics://` 就判定漫画完成。
- **封面部分恢复但不完整且首屏偏慢：** 漫画和部分普通视频等待一段时间后能出现，说明 XOR 解密/持久缓存本身仍工作；部分普通视频、全部短视频、小说、社区仍缺封面，说明主要问题仍在媒体字段/包装结构提取，而不是统一解密器整体失效。

#### Alpha11 目标与修改边界

Alpha11 不重构已经恢复的小说正文和分类，只定点处理四个剩余域：播放、音频、漫画章节、封面。

##### 1. 视频 / 短视频播放恢复

复核 Stable/Alpha8 后发现，历史实机可用链不是“拿到 decode URL 就直接扔播放器”，而是：

```text
列表/详情已有媒体 path
或 POST video/can/watch {videoId}
→ /api/m3u8/h5/decode?path=...
→ cacheM3u8(...#isM3u8#, headers)
→ JSON urls/names/headers
→ 海阔播放器
```

Alpha10 覆盖的 `ac.play()` 跳过了这层 `cacheM3u8` 规范化，普通视频与短视频又同时失败。Alpha11 因此恢复 Stable/Alpha8 的播放合同：

- Feed 已有 path 时优先使用，不无意义阻塞首击。
- Feed 无 path 时才请求 `video/can/watch`；Feed 有 path 时额外保留一次 fresh `can/watch` 作为次线路。
- 继续使用旧的 `/api/m3u8/h5/decode?path=` 解码链。
- 根据 APK 1.9.7 静态字符串，有限加入 `/api/m3u8/play?path=` 与 `/m3u8/play?path=` 兼容候选，但不把静态字符串当已验证协议。
- HLS 在交给播放器前重新执行 `cacheM3u8`，并补 UA / Referer / Origin Header。
- 短视频继续首页卡片直接 `lazyRule → ac.play()`，不恢复常规详情页。
- 诊断保存 `acfun_v060_a11_play_probe`，下一轮可区分 path、候选线路和播放器阶段。

##### 2. 有声音频链

APK 1.9.7 静态复核除 `longFormAudio` 外还发现 `audioSource / sourcePath / playPath / playbackDomain / dataSource` 等字段。Alpha10 只识别部分显式 URL，且详情页直接 `url#isMusic=true#`，对需要 Header、HLS 缓存或“祖先节点是 audio、叶子只叫 url/path”的结构不够稳。

Alpha11：

- 保存章节目录中的原始 chapter row 为 `chapter seed`，进入章节后与 `fiction/base/chapterInfo` 合并，避免详情接口比列表数据更少时丢失音频。
- 携带完整祖先路径递归识别 `longFormAudio/audioSource/sourcePath/playPath/dataSource` 及嵌套 `source.url/path`。
- 相对音频路径结合 `playbackDomain/audioDomain/mediaDomain` 恢复完整地址。
- M3U8 音频先 `cacheM3u8`，MP3/M4A/AAC/WAV/OGG 等保留直链。
- 最终通过 JSON `urls/names/headers` + `#isMusic=true#` 返回多线路，不再只拼裸 URL。
- 诊断保存 `acfun_v060_a11_audio_probe`。

##### 3. 漫画章节链

复核 Alpha8 发现一个重要运行时风险：当时的 `nativeComicUrl()` lazyRule 内部写死了 `bootstrap_test_v064.js?v=6400`。即使当前 Release 已经升到 Alpha10/11，用户点击章节时仍可能重新装载旧 Test Bootstrap；此外旧实现仅尝试 `{comicsId, chapterId}` 单一参数。

Alpha11：

- 在 release 最末重新覆盖漫画章节路由，lazyRule 显式绑定当前 `bootstrap_test_v067.js?v=6700`。
- `comics/base/chapterInfo` 有限尝试 GET/POST 与 `{comicsId,chapterId}`、`{comicId,chapterId}`、`{id,chapterId}`、`{comicsId,id:chapterId}`。
- `imgList / imageList / images / chapterImgList / pageList / pics / pictures` 支持数组、对象和 JSON 字符串包装。
- 结合 `imgDomain/imageDomain/domain` 补全相对地址，再交给既有 `ac.image()` 解密，最终返回 `pics://url1&&url2...`。
- 诊断保存 `acfun_v060_a11_comic_probe`。

##### 4. 封面恢复与首屏速度

Alpha10 实机说明图片解密器不是全局坏掉：一部分漫画/视频经过等待能够显示。Alpha11 不重写 XOR 解密器，继续使用已经验证的 `2020-zq3-888 / XOR 前100字节 / 持久缓存`。

本轮扩展媒体包装解析：

- 支持 JSON 字符串中的数组/对象和转义 URL。
- 新增/加强 `dynamicImg / shortVideoCover / shortCover / videoImg / verticalImg / backgroundImg / cardImg / quoteSubImg / imageURL / pictureUrl`，并保留 `coverImg / videoCover / fictionImg / comicsCover / generatedCoverImg / templateCoverImg` 等。
- 深层扫描排除 `avatar / head / user / profile / icon / logo / badge / frame / emoji / medal / domain / host`，避免拿头像、图标或 CDN 域名当内容封面。
- 视频、漫画、小说、社区统一先恢复真实媒体 URL，再进入同一个 `ac.image()`。
- 首次遇到加密图仍可能需要网络下载 + 解密；真正命中持久缓存后的重复访问才应明显加快，因此 Alpha11 不承诺所有首次封面零等待，重点先解决“永远没有封面”的字段缺失。

#### Alpha11 发布链与静态 Guard

- 不可变 Release：`releases/0.6.0-alpha11/release.json`，Build `162`。
- 在 Alpha10 模块链末尾追加 `runtime-a11 / current-comic-audio-detail-a11 / shell-settings-a11`。
- 新 Bootstrap：`bootstrap_test_v067.js?v=6700`，`minBuild=162`。
- 新 Shell：`acfun_remote_test_v067.txt`，规则数值 version `2026082206`。
- Test/Candidate/channels/app manifest/registry/根 manifest 切到 Alpha11；Stable 0.4.9 与 `latest.json` 保持冻结。
- 三个 Alpha11 JS + Bootstrap 均通过 `node --check`；release JSON、规则壳 JSON、内嵌 pages JSON 均解析通过；媒体 Mock 验证 JSON-string cover、`longFormAudio.source.sourcePath` 与 comic `imgList` JSON 字符串可以正确拆分。
- **这些 Guard 只证明代码/发布结构可加载，不代表视频、有声、漫画、封面已经实机成功。**

---

## Test 0.6.0-alpha10 / Build 161 / Shell 6.6.0（上一测试）

- Alpha9 因实机同时退化分类、封面、播放、小说/有声、漫画而被隔离；Alpha10 直接以 Alpha8 Build159 为恢复基线再追加四个修复模块。
- Bootstrap v066 / Shell6.6 / minBuild161 强制越过 Alpha9 Build160；Stable/latest 未动。
- **已实机验证成功：** 小说/有声分类恢复；小说正文恢复，真实 `.txt` 章节源可以被读取并显示。
- **仍失败：** 有声音频、常规视频、短视频、漫画章节；部分封面仍缺失或首次加载较慢。

---

## Test 0.6.0-alpha9 / Build 160 / Shell 6.5.0（已隔离失败测试）

- Alpha8 已真实运行到设备：短视频点击卡片直接播放正常；小说/有声列表能获取内容，但章节正文/音频仍失败。
- Alpha8 已解决顶层页面不断 push 的页面栈事故，9 个栏目同页切换；漫画章节已进入 `pics://` 原生多图方向。
- Alpha9 strict taxonomy 收得过窄，实机小说/有声分类只剩“全部”。
- Alpha9 封面字段处理发生大面积退化；除有声外小说、漫画、视频、短视频大量灰图。
- Alpha9 常规视频播放回归；小说虽拿到真实 `sjacfanapi/.../word/...txt`，却只显示 URL，没有读取正文。
- 因同一 Test 同时回归多个核心域，Alpha9 不允许作为后续 recovery base；文件仅保留用于事故追溯。

## Test 0.6.0-alpha8 / Build 159 / Shell 6.4.0

- 筛选从独立页面合并回 ACFun 首页；频道/分类/标签/排序使用 `select:// col=3`，选择后原页刷新。
- `community / fiction / audio / short` 与五大主栏目统一在首页 Section 切换，解决页面栈不断增长问题。
- 漫画章节切为 `pics://` 原生多图阅读。
- 精选/里番停止 Aggregate Station，分别按 classifyId 4/24 请求。
- 小说/有声 `fiction/base/findList` 增加 GET+POST、`fictionType/type/isAudio/longFormAudio` 有限矩阵；实机确认列表恢复。
- 社区详情开始递归解析正文/图片/视频/链接。

## Test 0.6.0-alpha7 / Build 158 / Shell 6.3.0

- 首次把短视频卡从常规视频二级页剥离，首页点击直接 `ac.play()`；后经 Alpha8 实机确认正常。
- 漫画去除章节顶部冗余块，为后续 `pics://` 做准备。
- 社区继续过滤数字/机器分类并格式化时间；小说/有声扩大 findList 参数和分类空回退。

## Test 0.6.0-alpha6 / Build 157 / Shell 6.2.0

- Alpha5 到设备后确认旧分类 UI 巨大图标、横向截断标签、整屏 Chip 难用，Alpha6 开始 UI 大重构。
- 加入分类字段兼容、漫画 `stationId/comicsStationId`、社区/小说机器标签清洗与有限回退。
- APK 1.9.7 静态发现 `pageSize=30 loadType=2`；只作为探针候选，不将静态字符串误记为已验证业务语义。

## Test 0.6.0-alpha5 / Build 156 / Shell 6.1.0

- Alpha4 实际未到手机，根因是 Test 复用同一 Shell/Bootstrap，旧 activeRelease 继续启动 Alpha2。
- 旧 Test Bootstrap 还曾把 `requireManager()` 错写成不存在的 `manager()`。
- Alpha5 起固定采用“新 Build + 新 Bootstrap 文件名/缓存键 + 新 Shell 数值 version + minBuild + 云仓库覆盖导入”处理不兼容 Test 迁移。

## Test 0.6.0-alpha4 / Build 155

### APK 1.9.7 静态确认资源族

- 视频：`video/list`、`video/getByClassify`、`video/classTypeList`、`station/stations`、`station/getStationMore`；搜索链 `video/queryVideoByTitle → search/keyWordV2 → search/keyWord`。
- 漫画：`comics/station/getComicsStations`、`getStationComicsMore`、`comics/base/findList/info/chapterInfo/queryChange/getRec`、`comics/comment/commentList`。
- 小说/有声：`fiction/other/tagList`、`fiction/base/findList/info/chapterInfo`、`fiction/commentList`、`fictionType / longFormAudio`。
- 社区：`dynamic/category/tree`、`community/dynamic/list/dynamicInfo/commentList/person/list`、`coterie/list`。
- 建立 video/comic/comic_chapter/fiction/fiction_chapter/dynamic 类型化路由，关键 entity ID 写 URL query；空结果不写成功缓存。

## Test 0.6.0-alpha3 / Build154、alpha2 / Build153、alpha1 / Build152

- Alpha3 首次证明新 Native UI 真正到达设备，同时暴露漫画分类混入布局项、短视频空白和部分详情“未命名 + 无封面”。由此确定关键实体参数必须写 URL query，详情需要 Provider 恢复。
- Alpha2 修复 activeRelease/Shell 缓存，使 Native UI 真正可达设备。
- Alpha1/RC1/RC2 属于早期 UI 试验，不再作为当前恢复目标；只保留其中被后续实机验证的协议/播放/图片经验。

---

## Stable/Core 历史协议记忆

### 0.4.8

- APP 1.9.7 确认 `video/tags/getTagsZ` 与 `video/tagTitleList`；标签主链以 `getTagsZ → tagTitleList` 为准。
- 精选/里番使用 Station；动漫/视频使用动态 `classTypeList`；漫画使用 `getComicsStations / info / chapterInfo`。

### 0.4.5

- 播放优先列表/详情已有 `videoUrl`；缺失才 `POST /api/video/can/watch {videoId}`。
- `cacheM3u8` 按视频/decode URL 缓存；首次弹幕不阻塞播放。

### 0.4.3

- 分类视频固定 `/api/video/getByClassify`；搜索优先 `/api/video/queryVideoByTitle`，再 `search/keyWordV2`。
- 已验证播放链：`video/can/watch → path → /api/m3u8/h5/decode?path=...`，播放器补 UA/Referer/Origin。

### 0.4.2 / 0.4.1

- 列表/分类/搜索使用 Cache-First + stale fallback；空响应不能覆盖有效缓存。
- 封面优先 `_480`，解密后持久缓存到 `hiker://files/cache/acfun_cover`。

### 0.4.0

- 图片解密已确认：key `2020-zq3-888`，只 XOR 前 100 字节；正常 JPEG/PNG/GIF/WebP 不重复解密。

### Remote Core 0.2.1 / 0.2.0 / Shell 1.0.0

- `/api/video/getByClassify` 曾实机返回 HTTP 200 / code 200，游客 Token 与原生签名协议可用。
- 完整 CDN 图片 URL 不强制附加 `@Referer`；相对封面优先游客登录返回 `imgDomain`。
- 迁移为轻量 Shell + GitHub Remote Module + `latest.json` / Remote Module Manager；正常启动不主动请求 latest，只有检查/更新时访问版本元数据。

### Core 0.1.9

- APK 原生协议历史确认：`t + s(MD5) + deviceId + User-Mark + aut`。
- `encData` 使用 AES-CBC 解密。
