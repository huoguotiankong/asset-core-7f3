# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json` 与当前 release/Bootstrap。接口、签名、解密以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前实机事实。

## 当前恢复基线

### Stable 0.4.9 / Build 149 / Shell 5.11.3

- 当前正式 Stable 与 `latest.json` 继续固定在 `0.4.9 / Build149`，是 Test 大改失败时的恢复基线。
- 已验证能力继续包括：常规视频播放、极速切换、封面 XOR 解密与持久缓存、精选/里番 Station 底座、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- 0.4.9 修复过 0.4.8 activeRelease 缓存错误根目录模块路径的问题；v047/v048/v049 正式路径使用 `apps/video/acfun/` 仓库相对路径，并保留旧状态恢复兼容。
- **Alpha9 仍不得修改 Stable/latest。**

### Test 0.6.0-alpha9 / Build 160 / Shell 6.5.0（当前测试）

#### 2026-08-22 Alpha8 实机事实

- Alpha8 已真实运行到设备，证明 Shell6.4 / Bootstrap v064 / Build159 发布链正常。
- **短视频点击卡片直接播放继续正常**，这条已经形成实机闭环，后续 UI/Provider 修改不得退化。
- **小说与有声列表已经能获取到内容**。这证明 Alpha8 的 `fiction/base/findList` GET+POST 与扩展实体识别方向有效；但进入章节后仍显示“本章暂未返回正文或音频”，所以“列表恢复”不能被误记为“小说/有声功能完成”。
- 首页同页筛选方向正确，但 `scroll_button` 把 `<font color=...>` 当普通字符串原样显示。结论：该组件不能假设支持任意 HTML；筛选按钮必须使用纯文本或已实机确认的原生选中态。
- 用户明确反馈“筛选分类都有问题”。Alpha8 仍残留历史缓存/旧选中 ID 与宽松递归分类提取的污染风险；不能只修 UI 文案，必须重新收紧 Catalog/Station/Tag 数据边界。
- 首页焦点大卡出现灰色/模糊大块且没有可靠封面。大 Hero 不应在封面字段未稳定时默认占据首屏。
- 社区 Feed 已能显示真实帖子和图片，但部分作者、正文、媒体与详情仍不完整；详情接口单独返回的数据可能比 Feed 行对象更少，不能丢掉列表已有种子数据。
- Alpha8 已解决 Alpha6/Alpha7 的顶层页面栈事故：精选/漫画/动漫/视频/里番/短视频/社区/小说/有声均在 ACFun 首页状态切换；此单页导航方向继续保持。
- 漫画章节已经切到海阔 `pics://` 原生多图阅读；本轮没有要求退回普通 `pic_1_full` 详情页模拟模式。

#### Alpha9 分类 / 筛选链重建

- 新增 `acfun_runtime_v060_a9.js`，建立独立 `a9|` taxonomy/feed/detail 缓存命名空间，避免继续直接命中 Alpha6~Alpha8 可能已经污染的分类缓存。
- Alpha9 首次迁移会清理以下历史选中状态：精选 Station、里番 Station、漫画 Station、动漫/视频 Class/Tag、社区 Category、小说/有声 Tag；不会清收藏、历史和用户普通设置。
- 分类提取不再对整个响应做“看到任意 `id/name` 就算分类”的宽泛递归：
  - Station 必须优先出现 `stationId/stationName` 等 Station 身份字段。
  - 动漫/视频 Class 优先识别 `classifyId/classTypeId/videoTypeId` 与对应标题字段。
  - Tag 优先识别 `videoTagValue/tagValue/videoTagKey/tagKey/tagId` 与 `videoTagName/tagName/tagsTitle/tagTitle`。
  - 漫画 Station、小说 Tag、社区 Category 各自使用自己的明确身份字段。
- 精选继续 first-nonempty `station/stations?classifyId=4&restricted=0` GET/POST；里番继续 first-nonempty `classifyId=24&restricted=1` GET/POST，再有限退到 `classifyId=24`。**不再 Aggregate 两组 Station 响应。**
- 动漫/视频继续以 APP 1.9.7 的 `video/classTypeList?type=2/4` 为父分类入口；Tag 继续 `video/tags/getTagsZ → video/tagTitleList`，并校验 Tag 的 parent identity。
- 漫画分类继续以 `comics/station/getComicsStations` 为主，不把普通 `id/name` 对象混入漫画 Station。
- 社区和小说分类同样重新进入独立 strict taxonomy；仍坚持“APP/API/实机响应优先”，不根据截图硬编码一个静态白名单。

#### Alpha9 首页/UI

- 新增 `acfun_ui_v060_a9_home.js`。
- 首页分类/标签/排序/频道继续使用 `select://`，固定 `col=3` 三列原生弹层；选择完成后 `refreshPage(false)` 原页刷新，不打开独立筛选页面，不增加返回栈。
- `scroll_button` 标题全部改成纯文本，如 `精选频道 · xxx ▾ / 分类 · xxx ▾ / 标签 · 全部 ▾ / 排序 · 最新 ▾`，不再塞 `<font>`。
- 当前选择 ID 如果已经不在新 strict taxonomy 中，会自动清掉并回到新列表的有效默认项，避免“UI 显示一个旧条件，但请求走另一个条件”。
- 焦点大卡默认改为关闭；用户手动开启时，只在存在有效图片的条目上使用紧凑 `movie_1_left_pic`，不再用无可靠封面的巨大 `card_pic_1` 占首屏。
- 小说/有声卡片如果真实封面字段暂未命中，用小说/耳机图标作为降级，不显示空白图片；同时缓存 `acfun_v060_fiction_seed_<id>` 原始 Feed 对象供详情合并。
- 社区卡片缓存 `acfun_v060_dynamic_seed_<id>` 原始 Feed 对象，详情不再把列表已经拥有的作者/正文/图片丢掉。
- 已实机正常的短视频 `shortCard → lazyRule → ac.play()` 直接播放链保持不变。

#### Alpha9 小说 / 有声详情、正文与音频恢复

- 当前 APK 1.9.7 静态复核已经确认存在：`fiction/base/findList`、`fiction/base/info`、`fiction/base/chapterInfo`、`fiction/other/tagList`、`fiction/commentList`，以及 `fictionId / fictionTitle / fictionUrl / fictionType / longFormAudio / chapterId / chapterTitle / chapterList`；Flutter 同时存在 `/novelReader` 与 `/novelAudioPlay` 路由。
- 上述路由/字段“存在”不等于每个参数语义已经实机验证。Alpha9 只将其作为有限兼容矩阵，最终契约仍以设备命中结果为准。
- `ac.__v060a9FictionDetail()` 对 `fiction/base/info` 尝试 GET+POST 与 `{fictionId}` / `{id}` / `{bookId}` / `{novelId}`，并与列表 Feed seed 合并。
- Fiction 封面字段扩大到 `fictionImg / fictionCover / fictionCoverImg / coverImg / coverUrl / cover / verticalCover / poster / picUrl / imageUrl / img / image / thumb`；作者同时检查嵌套 `authorInfo/user/userInfo/blogger`。
- `ac.__v060a9FictionChapter()` 对 `fiction/base/chapterInfo` 尝试 GET+POST：
  - `{fictionId, chapterId}`
  - `{fictionId, fictionChapterId}`
  - `{bookId, chapterId}`
  - `{novelId, chapterId}`
  - `{fictionId, id}`
- `ac.__v060a9ChapterPayload()` 递归识别正文：`chapterContent / fictionContent / content / text / contentText / body / paragraph / paragraphList / contentList / html / chapterText`。
- 同时识别音频/媒体：字段名含 `audio / voice / sound / longForm / media / play` 或地址扩展名为 MP3/M4A/AAC/WAV/OGG/M3U8。
- 如果章节响应只给 `fictionUrl / contentUrl / readUrl / chapterUrl / sourceUrl`，Alpha9 会有限抓取外链：JSON 继续按字段解析；HTML 先剥脚本/样式/标签再转正文。最多处理少量候选，避免无限请求。
- 有声模式下检测到音频候选后使用海阔音乐播放标记 `#isMusic=true#`；正文与音频可同时存在。
- **这部分仍是 Alpha9 待实机验证核心。** 只有设备真正出现正文/能播放音频后，才能把命中的字段与参数晋升为“已验证协议”。

#### Alpha9 社区详情恢复

- `ac.__v060a9DynamicPayload()` 同时处理 Feed seed 与 `community/dynamic/dynamicInfo` 结果，不再只信详情接口的顶层 `content`。
- 递归处理 `content / dynamicContent / contentText / text / body / markdown / description / desc / summary / remark / title`，并继续解析字段里的 JSON 字符串。
- 正文图片提取会排除 key 中含 `avatar / head / badge / frame / icon / logo` 的头像、徽章、装饰框，降低“把用户头像当帖子主图”的概率。
- 视频/媒体与普通外链单独渲染；作者会从 `user / userInfo / blogger / authorInfo` 等嵌套对象补全。
- 详情顶部改为头像 + 作者 + 时间，正文使用较舒适段落间距；底部保留评论、复制、搜索。

#### Alpha9 发布边界

- 新建不可变 Release：`releases/0.6.0-alpha9/release.json`，Build `160`。
- Alpha8 模块链末尾新增：`runtime-a9 / clean-inline-ui-a9 / fiction-community-detail-a9 / shell-settings-a9`。
- 新建 `bootstrap_test_v065.js?v=6500`，Test Shell `6.5.0-test`，`minBuild=160`。
- 新建规则壳 `acfun_remote_test_v065.txt`，规则数值 version `2026082204`，图标使用 CDN：`https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/acfun.svg`。
- Test/Candidate/channels/app manifest/registry/根 manifest 已切到 Alpha9；Stable `0.4.9 / Build149 / Shell5.11.3` 与 `latest.json` 不变。
- Alpha9 实机验收顺序：**分类弹层与结果一致性 → 精选/里番分类边界 → 小说正文 → 有声音频 → 小说/有声封面 → 社区帖子详情 → 漫画 pics:// → 短视频直接播放 → 常规视频播放/搜索。**

---

## Test 0.6.0-alpha8 / Build 159 / Shell 6.4.0（上一测试）

- 把筛选从独立二级页合并回 ACFun 首页；频道/分类/标签/排序使用 `select:// col=3`，选择后原页刷新。
- 把 `community / fiction / audio / short` 纳入同一个首页 Section，解决 Alpha6/Alpha7 顶层入口不断 push 新页面、返回栈越来越深的问题。
- 漫画章节切到海阔 `pics://url1&&url2...` 原生多图阅读，不再用普通 `pic_1_full` 页面模拟漫画正文。
- 精选/里番停止 Aggregate Station，初步分成 `classifyId=4/24` first-nonempty 请求。
- 小说/有声列表增加 `fiction/base/findList` GET+POST、`fictionType/type/isAudio/longFormAudio` 有限矩阵和更宽实体识别。Alpha8 实机确认“列表已经恢复”，但章节正文/音频仍失败，交由 Alpha9 继续。
- 社区详情增加递归正文/图片/视频/链接，但 Alpha8 实机仍显示部分作者/正文/媒体不完整。
- Alpha8 的两个明确失败点：`scroll_button` 使用 `<font>` 后原样显示 HTML；Hero 封面字段不稳定时出现灰/空大卡。Alpha9 已针对修正。

## Test 0.6.0-alpha7 / Build 158 / Shell 6.3.0（历史）

- 将 Alpha6 的 Chip 墙改成列表式筛选中心，但仍需“进筛选页 → 选择 → 返回”，后来被 Alpha8 同页弹层替代。
- 首次把短视频卡从常规视频二级页剥离，首页点击直接 `ac.play()`；此链后来经实机确认正常并一直保留。
- 漫画去除“章节名 + 页数”内容块，但仍在普通二级 Page 中 `pic_1_full`，阅读体验仍不理想；Alpha8 改 `pics://`。
- 社区继续过滤数字/测试机器分类并格式化时间；小说/有声扩大 findList 参数及分类空回退。

## Test 0.6.0-alpha6 / Build 157 / Shell 6.2.0（历史）

- Alpha5 已真实到设备后，确认分类页巨大图标/横向截断标签/整屏 Chip 难用；Alpha6 开始第一轮大重构。
- `acfun_runtime_v060_a6.js` 加入分类字段兼容、漫画 `stationId/comicsStationId`、社区/小说机器标签清洗与有限回退。
- APK 1.9.7 静态字符串发现 `pageSize=30 loadType=2`；Alpha6 将短视频 `loadType=2` 作为首候选并保留 3/4。该值最初只是 APK 静态证据，不能倒推业务语义。

## Test 0.6.0-alpha5 / Build 156 / Shell 6.1.0（历史发布链事故修复）

- Alpha4 实际没有到用户手机；根因是 Test 仍复用同一 `acfun_remote_test_v060.txt + bootstrap_test_v060.js?v=6000`，旧 activeRelease 继续启动 Alpha2。
- 旧 Test Bootstrap 又把基础入口 `requireManager()` 错写成不存在的 `manager()`，实机出现“更新异常：找不到函数manager”。
- Alpha5 起固定使用“新业务 Build + 新 Bootstrap 文件名/缓存键 + 新 Shell 数字 version + minBuild + 云仓库覆盖导入”进行不兼容 Test 迁移。

## Test 0.6.0-alpha4 / Build 155（APK 1.9.7 资源路由恢复阶段）

### APK 静态确认的资源族

- 视频：`video/list`、`video/getByClassify`、`video/classTypeList`、`station/stations`、`station/getStationMore`、`blogger/hotUpBloggers(/page)`；搜索已确认存在 `video/queryVideoByTitle → search/keyWordV2 → search/keyWord` 链。
- 漫画：`comics/station/getComicsStations`、`getStationComicsMore`、`comics/base/findList/info/chapterInfo/queryChange/getRec`、`comics/comment/commentList`。
- 小说/有声：`fiction/other/tagList`、`fiction/base/findList/info/chapterInfo`、`fiction/commentList`，并出现 `fictionType / longFormAudio`。
- 社区：`dynamic/category/tree`、`community/dynamic/list/dynamicInfo/commentList/person/list`、`coterie/list`、`coterie/coterieListByCoterId`。

### Alpha4 关键架构修复

- 恢复 `video/queryVideoByTitle` 主搜索，不再只剩 `keyWordV2/keyWord`。
- 为 video/comic/comic_chapter/fiction/fiction_chapter/dynamic 建立类型化路由，关键 entity ID 写入 URL 参数，不只依赖 `extra`。
- 使用有深度/数量上限的递归实体采集，空结果不写成成功缓存。
- 建立社区、小说/有声资源中心、五类搜索、漫画/小说/社区详情与评论、本地漫画/小说收藏等底座。

## Test 0.6.0-alpha3 / Build 154（历史）

- 实机首次证明 Alpha2 Native UI 已到达设备，同时暴露：工具入口视觉过重、漫画分类混入布局/开发项、短视频空白、部分详情“未命名 + 无封面”。
- 由此确定关键实体参数必须写 URL query；详情同时读 `MY_PARAMS + getParam()`，有 ID 但种子缺失时再向 Provider 恢复。
- 漫画用户可见分类过滤实机确认的 `竖四 / 竖两 / 坚四 / 坚两 / 05漫画频道 / 05漫画分类` 等内部/布局项，但不使用截图白名单替代动态接口。

## Test 0.6.0-alpha2 / Build 153（历史）

- 修复 Alpha1 未真正跑到手机的 Test activeRelease/Shell 缓存问题。
- 新建 v060 Shell/Bootstrap，首页形成搜索 → 五大栏目 → 高频入口 → 筛选 → Main Feed 的 Native UI 基线。

## Test 0.6.0-alpha1 / Build 152、0.5.0-rc2 / Build151、0.5.0-rc1 / Build150

- 属于 Native UI/UX 早期迭代；Alpha1 未形成有效实机闭环，RC1/RC2 的“控制面板式首页/筛选”后来均被废弃。
- 这几版的 UI 不应作为当前实现恢复目标；只有其中已经被后续版本实机保留的协议/播放/图片底座可继续使用。

---

## Stable/Core 历史协议记忆

### 0.4.8

- APP 1.9.7 确认 `video/tags/getTagsZ` 与 `video/tagTitleList`，当前标签主链以 `getTagsZ → tagTitleList` 为准；旧 Zone 只保留历史兼容。
- 精选/里番使用 Station；动漫/视频使用动态 `classTypeList`；漫画使用 `getComicsStations / info / chapterInfo`。

### 0.4.5

- 播放优先列表/详情已有 `videoUrl`；缺失才 `POST /api/video/can/watch {videoId}`。
- `cacheM3u8` 按视频/decode URL 缓存；首次弹幕不阻塞播放。

### 0.4.3

- 分类视频固定 `/api/video/getByClassify`；搜索优先 `/api/video/queryVideoByTitle`，再 `search/keyWordV2`。
- 播放链：列表直链优先；缺失时 `video/can/watch → path → /api/m3u8/h5/decode?path=...`，播放器补 UA/Referer/Origin。

### 0.4.2 / 0.4.1

- 列表/分类/搜索采用 Cache-First + stale fallback；空响应不能覆盖有效缓存。
- 封面优先 `_480`，解密后持久缓存到 `hiker://files/cache/acfun_cover`。

### 0.4.0

- 图片解密确认：`2020-zq3-888`，只 XOR 前 100 字节；正常 JPEG/PNG/GIF/WebP 不重复解密。

### Remote Core 0.2.1 / 0.2.0 / Shell 1.0.0

- `/api/video/getByClassify` 曾实机返回 HTTP 200 / code 200，游客 Token 与原生签名协议可用。
- 完整 CDN 图片 URL 不强制附加 `@Referer`；相对封面优先游客登录返回 `imgDomain`。
- 迁移为轻量 Shell + GitHub Remote Module + `latest.json` / Remote Module Manager；正常启动不主动请求 latest，只有检查/更新时访问版本元数据。

### Core 0.1.9

- APK 原生协议历史确认：`t + s(MD5) + deviceId + User-Mark + aut`。
- `encData` 使用 AES-CBC 解密。
