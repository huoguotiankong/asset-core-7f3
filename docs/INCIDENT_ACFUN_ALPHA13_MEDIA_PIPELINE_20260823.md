# ACFun Alpha13 媒体链回归事故

日期：2026-08-23  
适用范围：海阔视界小程序的图片 Adapter、漫画阅读出口、Playback Adapter、Remote Release 恢复链

## 事故现象

ACFun Test `0.6.0-alpha13 / Build164 / Shell6.9` 实机出现多域回归：

- Alpha12 已实机可读的漫画章节重新不可读；只有去除部分顶部区域的 UI 方向符合预期。
- 所有栏目封面同时消失。
- 普通视频、短视频、有声仍不可播放。
- 当前设备诊断确认活动 Host 对 `POST /api/video/can/watch` 返回 HTTP 405，而 `GET /api/m3u8/player/referer` 返回 HTTP200/code200。

按项目 P0/P1 规则，Alpha13 被隔离，后续 Alpha14 直接从最后实机可用的 Alpha12 恢复，不继承 Alpha13 Bootstrap/Runtime。

## 根因一：启发式媒体扫描覆盖了已有有效字段

Alpha13 在基础 `itemInfo/ComicInfo/FictionInfo/DynamicInfo` 已经返回 `img` 后，又进行深层字段评分，只要扫描到更高分候选就无条件覆盖原 `img`。

这会把已验证 Parser 的正确媒体字段替换成深层对象里的错误图片/path。因为覆盖位于统一 Runtime 层，一个错误 Resolver 可以同时破坏视频、漫画、小说、社区等所有封面。

### 永久规则

```text
Parser / Provider 已返回有效 media
→ 直接保留
→ heuristic/deep scan 只允许在 media 缺失时 fallback
```

禁止：

```text
validMedia = parserResult
candidate = deepScan(raw)
if (candidate) validMedia = candidate
```

启发式 Resolver 必须是 fallback-only，并且需要类型校验、来源字段记录与可回退缓存。

## 根因二：官方 `pics://` 不等于当前图片解密链一定兼容

Alpha12 的实机成功链：

```text
chapterInfo {chapterId}
→ 原始图片 URL
→ ac.image()
→ $().image()/@js InputStream 解密
→ pic_1_full Renderer
```

Alpha13 为去掉二级页顶部区域，将最终出口改成 `pics://url1&&url2...`。虽然 `pics://` 是海阔官方多图模式，但当前 ACFun 图片依赖 `$().image()/@js` 的 InputStream 解密 Adapter，不能假设另一个消费路径与普通 `pic_1_full` Renderer 完全等价。实机随即从可读退化为不可读。

### 永久规则

如果图片需要 Header / Cookie / Referer / `@js` / `$().image()` / InputStream 解密：

1. 先确认当前 Renderer 已实机可用。
2. 只为 UI 目标切换展示模式时，优先保持同一 ImageAdapter/Renderer 合同。
3. 需要全屏时，优先使用海阔官方页面 `#fullTheme#` 保留 `pic_1_full`；不要为了去标题栏同时替换媒体消费链。
4. `pics://`、大图查看器、X5 等新出口必须单独实机验证后才能替代已验证 Reader。

## 根因三：当前 API Method 事实不能被历史 Stable 固化

Stable 历史记录中 `video/can/watch` 使用 POST 曾可用，但 2026-08-23 当前设备明确返回：

```text
POST sjacfanapi.../api/video/can/watch -> HTTP405
```

因此 Method 属于可变化的服务端协议事实，不应永久硬编码为“POST 就是真协议”。

### 永久规则

```text
Feed/Detail 已有媒体地址
→ 优先直接复用
→ 没有媒体地址才请求 Play/Watch API
→ 当前实机/当前 APK 决定 method
→ 历史 method 仅作兼容 fallback
```

对于 API Method、Host、Header、签名等动态协议事实，当前实机结果优先于旧 Stable 经验。

## Alpha14 恢复策略

- Bootstrap v070 直接继承 v068 / Alpha12，不加载 v069 / Alpha13。
- 删除 Alpha13 封面评分覆盖。
- 漫画恢复 `pic_1_full + ac.image()`，页面加 `#fullTheme#`。
- 播放优先 Feed/Detail media path；`can/watch` 改为 GET-first、POST fallback。
- 视频详情保留 Feed seed，避免详情响应字段更少时丢掉媒体 path。
- 短视频、有声、普通视频点击均进入当前 Bootstrap，不 eval 历史 Core。

## 发布前新增检查

- [ ] heuristic media resolver 只在当前 media 为空/无效时运行。
- [ ] 切换 `pics://`/Reader/X5 前确认图片 `@js`/InputStream Adapter 是否仍被执行。
- [ ] 只想改全屏/标题栏时优先 `#fullTheme#`，不要同时换 Reader 协议。
- [ ] Play API method 以当前实机为准，Feed/Detail 已有媒体地址时不做无意义二次授权请求。
- [ ] 多域回归 Test 不进入下一版 Bootstrap 继承链。
