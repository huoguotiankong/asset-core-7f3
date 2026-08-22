# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前恢复基线

### Stable 0.4.9 / Build 149 / Shell 5.11.3

- 正式 Stable 与 `latest.json` 继续固定在 `0.4.9 / Build149`，是所有 Test 大改失败后的恢复基线。
- 历史实机已验证：常规视频播放、极速切换、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- 图片解密固定合同：key `2020-zq3-888`，只 XOR 前 100 字节；正常 JPEG/PNG/GIF/WebP 不重复解密；缓存目录 `hiker://files/cache/acfun_cover`。
- **Alpha15 仍只进入 Test/Candidate，Stable/latest 不修改。**

### Test 0.6.0-alpha15 / Build 166 / Shell 7.1.0（当前测试）

#### 2026-08-23 Alpha14 实机失败事实

用户实机运行版本明确为：

```text
ACFun 2026.08.23-v0.6.0-alpha14
mode = test-ui-v060-alpha14-shell610
Host = https://sjacfanapi.sexbar.site
Token = YES
```

Alpha14 实机结果：

- 首页精选等普通视频卡片封面仍然全部灰图，视频详情封面同样为空。
- 漫画顶部区域方向虽然做过调整，但漫画/播放等旧问题仍未形成可靠闭环。
- 用户明确反馈“之前那些问题还是存在”，说明 Alpha14 不能作为继续叠补丁的基线。
- 诊断显示 `station/getStationMore` 可以返回数据，短视频列表也有成功记录，因此“列表有数据”与“图片/播放真正可用”必须分开判断。
- 当前实机同时给出新的 Method 事实：

```text
GET fiction/base/findList -> HTTP 405 Method Not Allowed
最近真实 fiction/base/findList -> HTTP 200 / code 200
```

这说明 fiction 路由不能继续默认 GET；结合 Alpha10 历史矩阵，Alpha15 对 fiction 系列改为 POST-first、GET 后级兼容。

#### Alpha15 架构决策：真正 Clean Rebase

Alpha14 虽然跳过了 Alpha13，但仍然直接继承 Alpha12。Alpha12 的 Release 本身已经叠加 Alpha3/A4/A6/A7/A8/A10/A11/A12 多层 Runtime/UI，其中多次重写：

- `ac.itemInfo / __v042FirstMedia`
- 封面字段 Resolver
- `ac.play`
- 漫画/小说/有声 Detail
- 首页/分类/筛选
- 资源请求 Method/参数矩阵

因此“跳过最后一个坏模块”并不能消除更早测试层残留。Alpha14 实机继续全局灰封面，证明当前恢复链仍不够干净。

Alpha15 固定改成：

```text
Stable 0.4.9 的 8 个已验证模块
  core v018
  protocol v019
  UI/cache v042
  functional v043
  fast playback v045
  APP taxonomy/comics/short v047
  APK tags v048
  release repair v049
        ↓
仅追加 1 个全新 clean runtime/UI a15
```

**Alpha3 ~ Alpha14 全部退出活动 Release。**

这次不是“继续补 Alpha14”，而是把 Test 主干重新建立在 Stable 0.4.9 上。

#### Alpha15 明确保留的 Stable 合同

以下能力本版禁止被 Test 层再次重写：

1. 普通视频 `ac.itemInfo()`：继续使用 Stable v042 字段映射。
2. 普通视频 `ac.image()`：继续使用 Stable XOR InputStream 解密 + `_480` + 持久缓存。
3. 普通视频 `ac.play()`：继续使用 Stable v045 的 `videoUrl/path → decode → cacheM3u8` 合同。
4. 精选/里番：继续使用 v047 `station/stations → station/getStationMore`。
5. 动漫/视频：继续使用 v047 `classTypeList → Zone/Tag → getByClassify/queryVideoByZone/tagTitleList`。
6. 漫画：继续使用 v047 `getComicsStations / getStationComicsMore / info / chapterInfo {chapterId}`，阅读仍为 `ac.image() + pic_1_full`。
7. 短视频：继续使用 v047 `video/list` 数据底座；Alpha15 只把点击动作重新绑定当前 Bootstrap 后调用 Stable `ac.play()`。

因此如果 Alpha15 仍出现普通视频全局灰封面，就不再猜“深层字段”，而直接查看 Alpha15 新诊断中的：

```text
原始封面
渲染地址
imgDomain
```

从 Stable 图片 Pipeline 的真实输入开始定位。

#### Alpha15 社区 / 小说 / 有声

这三类不再通过 Alpha10/11 的大 Runtime 覆盖普通视频能力，而是独立 Adapter：

- 小说/有声列表：`fiction/base/findList`，POST-first，GET fallback。
- 小说/有声分类：`fiction/other/tagList`，POST-first，GET fallback。
- 小说详情/章节：`fiction/base/info / chapterInfo`，POST-first。
- 社区：`dynamic/category/tree / community/dynamic/list / dynamicInfo`，独立缓存与路由。
- 小说/社区封面只读取各自显式字段，不修改全局 `ac.itemInfo`/`__v042FirstMedia`。
- 有声仅在自己的章节 Adapter 内识别 `playbackDomain / playbackAuthKey / audioSource / sourcePath / playPath`，不覆盖普通视频 PlaybackAdapter。

#### Alpha15 UI

- 保留九栏目：精选 / 漫画 / 动漫 / 视频 / 里番 / 短视频 / 社区 / 小说 / 有声。
- 修复 Alpha14 首页无论当前栏目是什么都把“短视频”图标画成 active 的错误。
- 筛选采用明确 `select://`：频道/分类/标签/排序各自独立，不再出现一个单独的 `>` 伪控制卡。
- 普通视频仍使用 Stable `movie_2 + ac.addVideoCard`，不自行重写视频卡片数据模型。
- 短视频保持直接播放，不进入普通视频详情。
- 搜索中心按视频/漫画/小说/有声/社区分型，但普通视频搜索仍使用既有 `queryVideoByTitle → keyWordV2 → keyWord` 主链。

#### Alpha15 发布链

- Immutable Release：`apps/video/acfun/releases/0.6.0-alpha15/release.json`
- Build：`166`
- 活动业务模块：Stable 8 + Clean A15 1，共 9 个。
- Bootstrap：`bootstrap_test_v071.js?v=7100`
  - 直接 require Stable `bootstrap_v5.js?v=5113`
  - `minBuild=166`
  - 不继承任何 Alpha12/13/14 Bootstrap。
- Shell：`acfun_remote_test_v071.txt`
  - 规则 version `2026082303`
- Test/Candidate/channels/app manifest/registry/root manifest 切 Alpha15。
- Stable 0.4.9 与 `latest.json` 继续冻结。
- 新 Runtime 与 Bootstrap 已在本地执行 `node --check`；Release JSON、Shell 外层 JSON、`pages` 内层 JSON 已解析通过。
- **Alpha15 仍必须由海阔实机验证，尤其普通视频封面/播放、漫画章节、短视频、有声、小说正文和社区。**

---

### Test 0.6.0-alpha14 / Build 165 / Shell 6.10.0（已停止继承）

#### 2026-08-23 Alpha13 实机失败事实

用户实机运行版本明确为：

```text
ACFun 2026.08.23-v0.6.0-alpha13
mode = test-ui-v060-alpha13-shell69
Host = https://sjacfanapi.sexbar.site
Token = YES
```

Alpha13 实机结果：

- **漫画从 Alpha12 已经可读，退化为不可读。** 只有“去掉顶部区域”的方向部分符合预期。
- **所有封面同时消失。** 这不是单个 Provider 的字段缺失，而是 Alpha13 全局图片覆盖层造成的系统性回归信号。
- 普通视频、短视频、有声仍不能播放。
- 诊断明确返回：

```text
GET  /api/m3u8/player/referer -> HTTP 200 / code 200
POST /api/video/can/watch      -> HTTP 405 Method Not Allowed
POST https://acapp.sexbar.site/api/video/can/watch -> timeout
```

- 最近资源路由 `a7-short|2|1 -> video/list #0 (30)` 只说明短视频列表成功返回 30 条，不能代表播放成功。

因此 **Alpha13 被正式隔离，不允许再作为 recovery base**。Bootstrap v070 不继承 v069，而是直接回到已实机证明漫画可读、部分封面正常的 Alpha12 / v068 再叠加少量 Alpha14 修复。

#### Alpha14 整体梳理结论

本轮重新读取项目主文档、海阔开发指南/注意事项、官方海阔开发者手册，并重新静态检查 ACFun APK 1.9.7。

APK `libapp.so` 当前仍能确认以下真实字符串/路由族：

```text
video/can/watch
m3u8/player/referer
/api/m3u8/play
/m3u8/play
video/cdn/refresh
videoUrl
canWatch
getMediaUrl
playbackDomain
playbackAuthKey
audioSource
sourcePath
playPath
comics/base/chapterInfo
fiction/base/chapterInfo
coverImg
videoCover
dynamicImg
imgDomain
```

同时存在：

```text
(skip API, reuse detail+canWatch)
(detail+canWatch)
```

这些静态字符串只能证明功能/字段存在，不能单独证明 HTTP Method 或参数。当前设备的 `POST can/watch = 405` 优先级高于旧 Stable 的 POST 历史，因此 Alpha14 不再硬编码 POST 为唯一主合同。

#### Alpha14 封面回归根因与处理

复核 `acfun_runtime_v060_a13.js` 找到明确高风险覆盖：Alpha13 在 `ac.itemInfo / ComicInfo / FictionInfo / DynamicInfo` 后再次执行深层评分扫描，只要找到一个“最高分候选”，就**无条件覆盖旧 Parser 已经得到的有效 `img`**。

这意味着：即使 Alpha12 原本已经正确解析出封面，Alpha13 仍可能用深层对象里的错误 path/图片候选把它替换掉。与“所有封面同时消失”的实机结果高度一致。

Alpha14：

- **彻底不加载 Alpha13 Runtime。**
- 不再对已有有效 `info.img` 做 heuristic override。
- 直接恢复 Alpha12/Alpha11 的“已有图片优先，深层 Resolver 只在缺图时兜底”行为。
- 不改已经实机工作的 XOR InputStream 解密器。

永久结论：**启发式媒体扫描只能 fallback-only，禁止覆盖 Parser 已经验证出的有效媒体字段。**

#### Alpha14 漫画阅读架构

Alpha12 已由用户截图实机证明：

```text
comics/base/chapterInfo {chapterId}
→ imgList/imageList/...
→ ac.image()
→ pic_1_full
```

可以真正显示连续漫画图片。

Alpha13 将输出改成：

```text
ac.image()
→ pics://url1&&url2...
```

后漫画立即退化。因此问题不是 `chapterInfo`，而是把带 `$().image()/@js/InputStream` 解密语义的图片地址换了一个未验证消费路径。

重新查海阔官方开发者手册确认：

- `pic_1_full` 本身就是“宽度为手机屏幕宽度，高度按图片比例自适应”的官方组件。
- 页面 URL 加 `#fullTheme#` 是官方全屏模式。
- 图片 `@js=` 的输入和返回都必须是 `InputStream`，并且 `@js=` 必须位于 Header/Cookie/Referer 标识之后。
- `pics://` 虽是官方多图模式，但**不能因为它是官方功能，就假设它与当前加密图片 Adapter 的执行链等价**；必须实机验证。

Alpha14 因此恢复 Alpha12 的 `pic_1_full + ac.image()`，只在漫画二级页面 URL 增加：

```text
#fullTheme#
```

目标是同时保留已经验证的图片解密链，并去掉普通二级页顶部 chrome。`pics://` 暂停作为 ACFun 加密漫画的主阅读出口。

#### Alpha14 视频 / 短视频播放架构

旧 Stable 的历史合同是：

```text
Feed/Detail 已有 videoUrl/path 时直接使用
→ 缺失才 can/watch
→ /api/m3u8/h5/decode?path=...
→ cacheM3u8
→ Player headers
```

Alpha10 以后多版逐渐把 `can/watch` 变成了几乎必经步骤；当前设备已经证明活动 Host 对 POST 返回 405。

Alpha14 改为：

```text
1. Feed/Detail seed 的 videoUrl/playUrl/videoUri/path/m3u8/playPath/sourcePath 优先
2. 有现成媒体 path 时，不先请求 can/watch
3. 只有没有媒体 path / 原 path 无法构造播放时：GET video/can/watch 优先
4. GET 无结果后才有限尝试 POST，保留旧 Host 兼容性
5. 相对 HLS path → 既有 /api/m3u8/h5/decode?path=...
6. cacheM3u8 + Stable PlayerHeaders
7. 单一真实播放线路，不制造收藏/评论等伪线路
```

视频详情同时改为 **Feed seed + detail/cache 合并**。详情接口字段比 Feed 少时，不再把 Feed 已有 `videoUrl/path` 覆盖掉。

短视频继续保持 Alpha8 已实机验证的产品形态：**首页卡片点击直接播放，不进入普通视频二级页**；点击时显式进入当前 Bootstrap v070。

新增播放探针：`acfun_v060_a14_play_probe`，记录：

```text
seedPaths
used = seed / watch-get / watch-post
watch method/result
cacheM3u8/decode stage
final URL 摘要
```

#### Alpha14 有声

- Alpha10 已实机验证小说/有声分类恢复，小说正文 `.txt` Source Resolver 可正常读取；这条成功链保持不动。
- Alpha11 已经能递归识别 `longFormAudio/audioSource/sourcePath/playPath`，Alpha14 继续复用，不再把音频 Resolver 和封面 Resolver 混在一个高风险 Runtime 中。
- 音频点击显式进入当前 Bootstrap v070。
- 单一音频候选优先直接 `#isMusic=true#`；多个真实候选才弹线路选择。
- 新增：`acfun_v060_a14_audio_source_probe`、`acfun_v060_a14_audio_probe`。
- `playbackAuthKey` 当前只记录存在性，不根据字段名擅自猜签名/query 规则；若实机仍失败，再根据真实章节响应定点处理。

#### Alpha14 UI 收敛

- 删除 Alpha13 视频详情页“长按上方封面：收藏 / 评论”等开发说明文本，不让技术说明占据正常内容页。
- 视频详情改为紧凑 `movie_1_left_pic` 主卡；封面缺失时使用文本播放入口，不再制造一块巨大的灰色 hero。
- 播放主任务与收藏/评论分离；收藏/评论只放长按动作。
- 筛选、分类、小说正文等 Alpha12/Alpha10 已恢复链本轮不做无关重构，先降低回归面。

#### Alpha14 发布链

- Immutable Release：`apps/video/acfun/releases/0.6.0-alpha14/release.json`
- Build：`165`
- 新模块仅 4 个：
  - `acfun_runtime_v060_a14.js`
  - `acfun_ui_v060_a14_home.js`
  - `acfun_ui_v060_a14_detail.js`
  - `acfun_ui_v060_a14_delivery.js`
- Bootstrap：`bootstrap_test_v070.js?v=7000`
  - **直接 require v068 / Alpha12，不 require v069 / Alpha13**
  - `minBuild=165`
- Shell：`acfun_remote_test_v070.txt`
  - 规则 version `2026082302`
- Alpha14 已因后续实机失败停止作为活动恢复基线。
- Stable 0.4.9 与 `latest.json` 保持冻结。

---

## 已验证/隔离测试历史

### Alpha14 / Build165 / Shell6.10 —— 已停止继承

- 目标：隔离 Alpha13、恢复 Alpha12 漫画/图片底座并 GET-first 修播放。
- 实机：普通视频首页/详情封面仍全局灰图，旧问题仍大量存在。
- 结论：**只跳过最后一个坏模块不等于干净恢复；如果 recovery base 本身包含多层实验 overlay，必须回到最后稳定发布基线 Clean Rebase。**

### Alpha13 / Build164 / Shell6.9 —— 已隔离失败测试

- 目标：修播放上下文、切 `pics://`、用评分 Resolver 补封面。
- 实机：漫画退化、所有封面消失、视频/短视频/有声仍失败。
- 永久禁止：Alpha13 不得再作为 recovery base；v069 不进入后续 Bootstrap 继承链。

### Alpha12 / Build163 / Shell6.8 —— 历史部分成功测试，不再作为主干

- **实机验证漫画章节恢复成功。**
- 真实关键合同：`comics/base/chapterInfo {chapterId}` 优先。
- 漫画连续 `pic_1_full + ac.image()` 已实机可读。
- 短视频和有声封面当时恢复；漫画和部分普通视频封面恢复。
- 普通视频、短视频、有声播放仍未闭环。

### Alpha11 / Build162 / Shell6.7

- 扩展 JSON 包装封面和音频字段；漫画参数矩阵遗漏真正已验证的 `{chapterId}` 单参数，因此失败。
- 有声识别 `longFormAudio/audioSource/sourcePath/playPath`，但播放器未闭环。

### Alpha10 / Build161 / Shell6.6

- **实机验证小说/有声分类恢复。**
- **实机验证小说正文恢复，真实 `.txt` 章节源可主动读取。**
- 有声、视频、短视频、漫画当时仍失败。

### Alpha9 / Build160 —— 已隔离失败测试

- strict taxonomy 过窄导致小说/有声分类只剩“全部”。
- 封面大面积退化；常规视频播放回归；小说只显示 `.txt` URL。
- 不允许作为 recovery base。

### Alpha8 / Build159 / Shell6.4

- 筛选回到首页同页 `select://`，解决页面栈不断增长。
- 9 个栏目同页切换。
- **短视频卡片点击直接播放曾实机验证正常。**
- 小说/有声列表恢复方向后经 Alpha10 验证有效。

### Alpha7 / Build158

- 首次把短视频从常规视频详情剥离，直接播放。
- 漫画开始去除章节顶部冗余内容。

### Alpha6 / Build157 ~ Alpha3 / Build154

- 完成 Native UI、资源族、分类/Station、关键 ID 跨页路由等早期重构。
- Alpha3 首次证明 Native UI 真正到设备；Alpha5 后开始强制采用新 Shell/Bootstrap/build 避免旧 activeRelease 缓存。

---

## Stable/Core 历史协议记忆

### 0.4.8

- APP 1.9.7 确认 `video/tags/getTagsZ` 与 `video/tagTitleList`；标签主链以 `getTagsZ → tagTitleList` 为准。
- 精选/里番使用 Station；动漫/视频使用动态 `classTypeList`；漫画使用 `getComicsStations / info / chapterInfo`。

### 0.4.5

- 播放优先列表/详情已有 `videoUrl`；缺失才请求 `video/can/watch`。
- `cacheM3u8` 按视频/decode URL 缓存；首次弹幕不阻塞播放。
- **注意：旧版本历史记录是 POST can/watch；2026-08-23 当前活动 Host 已实机返回 POST 405，不能继续把旧 Method 当永久事实。**

### 0.4.3

- 分类视频固定 `/api/video/getByClassify`；搜索优先 `/api/video/queryVideoByTitle`，再 `search/keyWordV2`。
- 历史已验证播放链：`can/watch → path → /api/m3u8/h5/decode?path=...`，播放器补 UA/Referer/Origin。

### 0.4.2 / 0.4.1

- 列表/分类/搜索使用 Cache-First + stale fallback；空响应不能覆盖有效缓存。
- 封面优先 `_480`，解密后持久缓存。

### 0.4.0

- 图片解密：`2020-zq3-888`，XOR 前100字节，明文图片直接返回。

### Remote Core 0.2.1 / 0.2.0 / Shell 1.0.0

- `/api/video/getByClassify` 曾实机 HTTP200/code200，游客 Token 与原生签名协议可用。
- 完整 CDN 图片 URL 不强制附加 Referer；相对封面优先游客登录返回 `imgDomain`。
- 迁移为轻量 Shell + GitHub Remote Module + `latest.json` / Remote Module Manager。

### Core 0.1.9

- APK 原生协议历史确认：`t + s(MD5) + deviceId + User-Mark + aut`。
- `encData` 使用 AES-CBC 解密。
