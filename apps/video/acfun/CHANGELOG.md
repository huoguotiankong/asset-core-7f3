# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json`、当前 release/Bootstrap/Shell 与用户最新实机结果。接口、签名、解密和播放协议以当前 APK/源码/实机复核为准；历史猜测不能覆盖当前设备事实。
>
> **并行开发约束：** 当前对话只维护 ACFun。`registry.json`、根 `manifest.json` 等共享文件在写入前必须重新读取，只手术式修改 ACFun 项，禁止覆盖其它并行小程序状态。

## 当前恢复基线

### Stable 0.4.9 / Build149 / Shell5.11.3

- 正式 Stable 与 `latest.json` 固定在 `0.4.9 / Build149`，是所有 Test 大改失败后的恢复基线。
- 历史实机已验证：常规视频播放、极速切换、封面 XOR 解密与持久缓存、精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频底座、漫画详情/章节阅读。
- 图片解密固定合同：key `2020-zq3-888`，只 XOR 前 100 字节；JPEG/PNG/GIF/WebP 明文不重复解密；缓存目录 `hiker://files/cache/acfun_cover`。
- Stable/latest 在 Alpha16 仍保持冻结。

### Test 0.6.0-alpha16 / Build167 / Shell7.2（当前测试）

#### Alpha15 实机结果

Alpha15 是第一次真正从 Stable0.4.9 Clean Rebase 的 Test：活动 Release 只有 Stable8 个模块 + `acfun_runtime_v060_a15_clean.js`，Alpha3~14 全部退出活动链。

实机确认：

- 动漫和漫画列表封面恢复。
- 视频分类的视频仍无封面；视频详情封面同样缺失。
- 所有普通视频仍不能播放。
- 海阔播放器列表仍出现“播放 / 收藏 / 评论”，说明 Stable v042 详情页三个并列 `text_3` 被播放器当作同一播放列表候选；收藏/评论不能继续和播放按钮处于同一播放器分组。
- 漫画章节再次无法显示图片，并出现多余顶部区域。
- 短视频列表变空。
- “ACFun 全站搜索”直接报：`未知ACFun动作:searchCenter`。根因不是 SearchProvider，而是 Bootstrap v4/v5 的 `run()` dispatcher 只认识 home/search/detail/comments/favorites/history/settings/diag，新 Shell 新增 page action 后没有同步扩展 dispatcher。
- 新增有声诊断：

```text
fiction-list|audio||3|0 -> POST fiction/base/findList (8)
```

这条是当前实机成功事实：**有声列表 POST-first 合同有效**，Alpha16 禁止无关重写小说/有声列表链。

#### Alpha16 定点修复

Alpha16 保持 Alpha15 Clean Rebase 主干，只追加一个 `acfun_fix_v060_a16_media.js`，不恢复旧 Alpha overlay 链。

##### 1. 视频封面

Stable v042 `itemInfo()` 已识别：`coverImg / videoCover / cover / coverUrl / img / image / poster / verticalImg`。但当前 APP 1.9.7 静态字符串还明确存在：

```text
generatedCoverImg
templateCoverImg
videoCover
coverImg
```

Alpha16 只在 Stable `itemInfo.img` 为空时做 **fallback-only**：补 `generatedCoverImg / templateCoverImg / videoCoverImg / defaultVideoPoster / horizontalCover` 等明确字段。已有有效图片绝不覆盖。

新增诊断：

```text
acfun_a16_video_cover_raw
acfun_a16_video_cover_rendered
```

##### 2. 普通视频播放

Stable v042 详情按钮存在一个已确认问题：lazyRule 内部重新 `eval(acfun_core_src_v018)` 后调用 `ac.play()`，会把当前完整 Release 的 PlaybackAdapter 重置到早期 Core 语义；同时三个 `text_3`（播放/收藏/评论）会污染海阔播放器列表。

Alpha16 视频详情改为：

```text
Feed/Detail seed
→ 当前 Bootstrap v072 loadOnly
→ A16 PlaybackAdapter
→ seed 现成 videoUrl/path 优先
→ GET video/can/watch
→ POST video/can/watch 仅 fallback
→ __v043DecodePlayUrl
→ HLS 时 cacheM3u8
→ 单一 PlayModel {urls:[真实媒体], names:[播放]}
```

当前 Host 已有实机事实：`POST video/can/watch = 405`，因此 GET-first 优先级高于旧 Stable 历史 Method。

收藏/评论/复制标题改为 `scroll_button` 次动作，播放器只接收一个真正播放项。

新增播放探针：`acfun_a16_play_probe`。

##### 3. 短视频

历史已验证：Alpha7/8 使用 `video/list`，`loadType=2` 曾实机返回 30 条并可直接播放；Alpha15 默认状态落到 `loadType=3` 后列表为空。

Alpha16 首次迁移将短视频状态恢复到 `loadType=2`，并按当前选择值 → 2 → 3 → 4 → 1 做有限 fallback；每个 mode 同时尝试纯 `loadType` 与带 `shortVideo` 类型字段的两个版本。

短视频仍保持“卡片点击直接播放，不进入普通视频详情”。由于 A16 最终把 `ac.play` 指向当前 A16 PlaybackAdapter，A15 的短视频点击桥也会进入 Alpha16 播放链。

新增：`acfun_a16_short_probe`。

##### 4. 漫画

Alpha12 已经被实机证明真正可读：

```text
comics/base/chapterInfo {chapterId}
→ imgList/imageList/... robust extractor
→ ac.image()
→ pic_1_full
```

Alpha16 重新抽取这条**已验证合同**，而不是重新加载整个 Alpha12 Runtime：

- 第一优先 `{chapterId}` GET。
- 第二 `{chapterId}` POST。
- 再有限兼容 `{comicsId, chapterId}` GET。
- 支持 `imgList / imageList / chapterImgList / images / pageList / pics / pictures`，包括 JSON 字符串和对象数组。
- 图片仍经当前 `ac.image()` XOR InputStream Adapter。
- 阅读 Renderer 仍用 `pic_1_full`。
- 章节 URL 仅增加 `#fullTheme#`，目标是去掉普通二级页面顶部 chrome；不再用 `pics://` 承担加密图片。

新增：`acfun_a16_comic_probe / acfun_a16_comic_error`。

##### 5. Bootstrap 动作分发

Bootstrap v072 显式增加：

```text
searchCenter → ac.searchCenter()
category     → ac.category()
```

修复 Alpha15 “未知ACFun动作:searchCenter”。以后 Shell/pages 增加新 action 时，必须同步更新 Bootstrap dispatcher；页面存在函数并不等于 Shell 能调用到。

#### Alpha16 发布链

- Release：`apps/video/acfun/releases/0.6.0-alpha16/release.json`
- Build：167
- Bootstrap：`bootstrap_test_v072.js?v=7200`
- Shell：`acfun_remote_test_v072.txt`
- 规则 version：`2026082304`
- 活动模块：Stable8 + A15 Clean + A16 Focused，共10个；Alpha3~14 仍不进入活动 Release。
- JS 已执行 `node --check`；Shell 外层 JSON 与 `pages` 内层 JSON 已本地解析。
- Stable/latest 不修改。

---

## 关键测试历史

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
- `cacheM3u8` 按视频/decode URL 缓存；首次弹幕不阻塞播放。
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
