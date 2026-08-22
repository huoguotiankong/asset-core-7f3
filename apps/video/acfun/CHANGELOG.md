# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json` 与当前 release/Bootstrap。接口、签名、解密以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前实机事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它小程序并行对话已经提交的状态。

## 当前恢复基线

### Stable 0.4.9 / Build 149 / Shell 5.11.3

- 当前正式 Stable 与 `latest.json` 固定在 `0.4.9 / Build149`，仍是 Test 大改失败时的恢复基线。
- 已验证能力包括：常规视频播放、极速切换、封面 XOR 解密与持久缓存、精选/里番 Station 底座、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- 0.4.9 修复过 0.4.8 activeRelease 缓存错误根目录模块路径的问题；正式 release 使用 `apps/video/acfun/` 明确仓库相对路径，并保留旧状态恢复兼容。
- **Alpha13 仍只进入 Test/Candidate，Stable/latest 不得修改。**

### Test 0.6.0-alpha13 / Build 164 / Shell 6.9.0（当前测试）

#### 2026-08-23 Alpha12 实机事实

- **漫画章节已经真正恢复可读。** 用户实机截图确认连续章节图片已经返回并正常显示，因此 `comics/base/chapterInfo` 首选仅 `{chapterId}` 的恢复方向正式形成闭环。这个事实优先级高于 Alpha11 以前所有猜测参数。
- Alpha12 漫画仍经普通 `hiker://page/acfun_detail` + `pic_1_full` 渲染，因此系统二级页标题栏仍占据顶部区域。用户明确要求去掉这段区域，让漫画图片覆盖阅读页面。
- 普通视频仍播放失败，播放器显示“播放异常”。用户截图同时显示播放器的同级列表被“播放 / 收藏 / 评论”污染；这些并不是播放线路，不应该进入播放器列表。
- 本轮普通资源诊断 `station-more|0|1|1|3 -> station/getStationMore #0 (8)` 只证明精选 Station 列表返回 8 条，不是播放探针，不能据此判断 `can/watch`、decode、m3u8 或播放器阶段成功。
- 封面方面：**短视频和有声封面已经恢复**；漫画已有部分恢复；小说、社区及部分普通视频仍然缺图或长期灰图。由于同一图片解码器已经能显示短视频/有声/漫画图片，继续把问题归因于“统一 XOR 解密器失效”是不成立的，剩余重点仍是字段/包装结构/真实媒体 URL 选择。

#### Alpha13 明确根因：视频详情点击时重置了 Runtime

复核实际模块加载链后找到普通视频持续失败的一个明确运行时错误：

- `acfun_ui_v060_a3_detail.js` 的旧播放按钮 lazyRule 在点击时执行：

```text
getItem('acfun_core_src_v018')
→ eval(core v018)
→ ac.play(...)
```

- 这会在用户真正点击“播放”的那个执行上下文里重新定义整个 `ac`，把 Alpha10/11/12 后置模块已经覆盖的 `ac.play()` 重置回 Core v0.1.8。
- 因此此前即使首页/详情页启动时已经加载 Alpha12 Runtime，**点击播放时仍可能根本没有执行 Alpha12 的播放修复**。这是“代码看起来已修、实机连续几版仍完全相同”的关键原因之一。
- 同一个旧详情页还显式创建了三个同级动作项：`播放 / 收藏 / 评论`，海阔播放器把这些兄弟项带进播放列表，形成用户截图中的无关列表项。

Alpha13 修复：

- 普通视频详情的播放 lazyRule 不再 `eval(core v018)`；点击时显式 `require(bootstrap_test_v069.js)` + `ACFunBoot.loadOnly()`，再调用**当前 Build164 Runtime** 的 `ac.play()`。
- 短视频首页也覆盖 Alpha10 遗留的 `bootstrap_test_v066.js` 点击入口，统一绑定当前 Bootstrap v069。
- 有声章节点击同样绑定当前 Bootstrap v069，避免解析模块与真正播放时的模块版本不一致。
- 视频详情不再生成独立的“播放 / 收藏 / 评论”三张动作卡。页面只保留一个真正的播放入口；收藏、评论、复制标题改为封面长按动作，避免污染播放器线路列表。

#### Alpha13 漫画阅读 UI

- `chapterInfo {chapterId}` Provider 保持 Alpha12 已实机验证的实现，不再改动成功协议。
- 正常章节路由从普通二级页面改为当前 Bootstrap v069 lazyRule：

```text
chapterId
→ Alpha12 已验证 chapterInfo
→ imgList/imageList/...
→ ac.image()
→ pics://url1&&url2&&...
```

- 目标是直接交给海阔原生多图/漫画阅读模式，去掉普通二级页标题栏和顶部空白，使图片成为阅读主体。
- 不使用会导致系统标题叠加的 `immersiveTheme` 详情页方案；如果用户当前海阔版本对 `pics://` 的实际 UI 与预期仍不同，以实机截图为准继续调整。

#### Alpha13 视频 / 短视频播放链

- 保留已经验证过的 `video/can/watch → path → /api/m3u8/h5/decode?path=... → cacheM3u8` 主链，不把静态 APK 字符串当成已验证协议。
- 新增当前 Runtime 的实际点击探针 `acfun_v060_a13_play_probe`，记录：`paths / attempts / final / source / referer`，以后不再用列表路由诊断替代播放诊断。
- APK 1.9.7 静态字符串确认存在 `m3u8/player/referer` 与 `fetch player referer failed:`。Alpha13 因此有限尝试该接口获取播放器 Referer，并写入 `Referer / X-Referer / Origin`；这仍属于待实机验证的兼容层。
- `/api/m3u8/play?path=` 只作为 decode/cacheM3u8 失败后的后级候选，不提升为已验证主协议。

#### Alpha13 有声音频

- Alpha10 已验证有声列表/分类可用，但音频播放未形成闭环。
- APK 1.9.7 静态字符串进一步确认 `playbackDomain / playbackAuthKey / authKey / audioSource / sourcePath / playPath` 等字段存在。
- Alpha13 在 Alpha11 已有音频候选解析基础上，保存旧 Resolver 引用后再扩展，避免覆盖后递归调用自身；同时生成：
  - `playbackDomain + sourcePath/playPath`
  - `auth_key=<playbackAuthKey>` 候选
  - `authKey=<playbackAuthKey>` 候选
  - 原始无 auth 候选
- M3U8 音频仍先进入 `cacheM3u8`；最终播放出口携带当前播放器 Header。
- 新探针：`acfun_v060_a13_audio_probe`。

#### Alpha13 封面恢复

- 不重写已经成功工作的 XOR 图片解密器。
- 新 Resolver 按内容类型给字段打分，优先：`coverImg / videoCover / fictionCover / fictionImg / verticalImg / poster / thumbnail`；社区额外提高 `dynamicImg / backImg / backgroundImg / cardImg / quoteSubImg` 权重。
- 排除 `avatar / headImg / userInfo / profile / icon / logo / badge / frame / emoji / medal` 等用户头像/装饰资源，避免“有 URL 但不是内容封面”的假命中。
- 支持 JSON 字符串包装和转义 URL；相对图片继续经 `imgDomain/imageDomain/cdnDomain` 与 `ac.__v042Plain()` 恢复。
- 缺图时分别保存 `acfun_v060_a13_cover_probe_video / fiction / dynamic`，下一轮可直接看到缺图样本的原始字段片段。

#### Alpha13 发布链

- 不可变 Release：`releases/0.6.0-alpha13/release.json`，Build `164`。
- Alpha12 模块链末尾追加：`runtime-a13 / current-short-home-a13 / fullscreen-current-detail-a13 / shell-settings-a13`。
- 新 Bootstrap：`bootstrap_test_v069.js?v=6900`，`minBuild=164`。
- 新 Shell：`acfun_remote_test_v069.txt`，规则数值 version `2026082301`。
- Test/Candidate/channels/app manifest/registry/根 manifest 切到 Alpha13；共享文件写入前重新读取，仅修改 ACFun 项并保留黄豆短剧 Test3、麻豆AI Test3、JavDB Test3 等并行对话最新状态。
- `latest.json` 与 Stable 0.4.9 / Build149 / Shell5.11.3 继续冻结。
- **Alpha13 仍必须经过实机验证；尤其 `pics://` 最终显示效果、m3u8/player/referer、playbackAuthKey 都不能仅凭代码或 APK 静态字符串宣布完成。**

---

## Test 0.6.0-alpha12 / Build 163 / Shell 6.8.0

- Alpha11 诊断只证明漫画列表 `getStationComicsMore` 成功。复核 Stable v0.4.7 后确认真正已验证的漫画章节合同是 `comics/base/chapterInfo {chapterId}`。
- Alpha12 将章节请求顺序改为 `{chapterId}` GET → `{chapterId}` POST → 带 comicsId/comicId 兼容组合。
- **实机结果：漫画章节恢复成功。** 这是 Alpha12 最重要的闭环。
- 漫画页面改为纯 `pic_1_full` 后仍有系统二级页顶部区域，因此 Alpha13 再切 `pics://`。
- 视频/短视频尝试回归 Stable v0.4.5 的 decode→cacheM3u8 单线路合同，但普通视频实机仍失败；后在 Alpha13 找到“点击时 eval core v018”覆盖 Runtime 的真正上下文问题。
- 有声改为直接/选择线路出口，但实机播放仍未闭环。

## Test 0.6.0-alpha11 / Build 162 / Shell 6.7.0

- 保留 Alpha10 已恢复的小说/有声分类与小说正文，只尝试恢复视频/短视频、有声/漫画和封面。
- 视频恢复 `cacheM3u8 + headers` 并加入 `/api/m3u8/play` 候选；实机仍失败。
- 有声合并章节 seed + `chapterInfo`，递归解析 `longFormAudio/audioSource/sourcePath/playPath`；实机仍失败。
- 漫画章节矩阵遗漏 Stable 真正已验证的 `{chapterId}` 单参数调用，因此失败。
- 封面扩展 JSON 包装与 `dynamicImg/shortCover/videoImg/verticalImg`；只得到部分恢复。

## Test 0.6.0-alpha10 / Build 161 / Shell 6.6.0

- Alpha9 多域回归后，Alpha10 以 Alpha8 为恢复基线重新叠加。
- **已实机验证成功：小说/有声分类恢复；小说正文恢复，真实 `.txt` 章节源可以主动读取并显示。**
- 有声音频、常规视频、短视频、漫画章节仍失败；封面仍部分缺失。

## Test 0.6.0-alpha9 / Build 160 / Shell 6.5.0（隔离失败测试）

- strict taxonomy 过度收窄，导致小说/有声分类只剩“全部”。
- 封面发生大面积退化；常规视频播放回归；小说虽拿到 `.txt` URL 但没有读取正文。
- 不允许作为后续 recovery base。

## Test 0.6.0-alpha8 / Build 159 / Shell 6.4.0

- 筛选从独立页面合并回首页，`select:// col=3` 选择后原页刷新。
- community / fiction / audio / short 与五大主栏目统一同页切换，解决页面栈不断增长。
- 小说/有声列表恢复方向后经 Alpha10 实机确认有效。
- **短视频点击卡片直接播放曾在 Alpha8 实机验证正常。**

## Test 0.6.0-alpha7 / Build 158 / Shell 6.3.0

- 首次把短视频从常规视频详情页剥离，首页直接播放。
- 漫画去除章节顶部冗余块，为后续原生多图方向做准备。

## Test 0.6.0-alpha6 / Build 157 / Shell 6.2.0

- 开始对筛选 UI、分类字段、漫画 Station、社区/小说机器标签进行大重构。
- APK 1.9.7 静态发现 `pageSize=30 loadType=2`；仅作为探针候选。

## Test 0.6.0-alpha5 / Build 156 / Shell 6.1.0

- 修复 Test 复用同一 Shell/Bootstrap 导致旧 activeRelease 继续启动旧版本的问题。
- 从此不兼容 Test 升级固定采用“新 Build + 新 Bootstrap 文件名/缓存键 + 新 Shell 数值 version + minBuild”。

## Test 0.6.0-alpha4 / Build 155

### APK 1.9.7 静态确认资源族

- 视频：`video/list`、`video/getByClassify`、`video/classTypeList`、`station/stations`、`station/getStationMore`；搜索链 `video/queryVideoByTitle → search/keyWordV2 → search/keyWord`。
- 漫画：`comics/station/getComicsStations`、`getStationComicsMore`、`comics/base/findList/info/chapterInfo/queryChange/getRec`、`comics/comment/commentList`。
- 小说/有声：`fiction/other/tagList`、`fiction/base/findList/info/chapterInfo`、`fiction/commentList`、`fictionType / longFormAudio`。
- 社区：`dynamic/category/tree`、`community/dynamic/list/dynamicInfo/commentList/person/list`、`coterie/list`。

## Test 0.6.0-alpha3 / Build154、alpha2 / Build153、alpha1 / Build152

- Alpha3 首次证明新 Native UI 真正到达设备，同时暴露关键实体参数与详情恢复问题。
- Alpha2 修复 activeRelease/Shell 缓存，使 Native UI 真正可达设备。
- Alpha1/RC1/RC2 仅保留后续被实机验证的协议/播放/图片经验。

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
