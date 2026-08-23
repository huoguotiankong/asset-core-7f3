# 汤头条 CHANGELOG

## 0.1.0-test.17 / Build 10117 — 2026-08-23

状态：**Test16 已恢复封面、普通长视频和官方预览后的短视频契约/性能修复版，仍为 Test；禁止晋级 Stable。**

### Test16 实机事实
- 推荐、长视频、短视频封面均已恢复，说明 `thumb_cover_str` 优先 + 真实 URL@js 内联 plain/AES-CBC/legacy-CFB 是当前有效图片基线。
- 免费长视频和官方预览继续正常播放，Test10/Test15 的长视频播放链保持有效。
- 顶栏推荐/短视频/长视频切换仍明显偏慢，切换后会等待较长时间才重新出现列表。
- 短视频虽然可以进入播放器，但点击等待较长，而且大量视频只显示/播放 2–3 秒，和实际内容明显不符。

### APK 逆向结论
- `ShortVideoPlayerActivity` 使用 `ListLikeVideoBean` 作为短视频列表对象。
- 原生播放器路径直接读取 `ListLikeVideoBean.source_240` 并调用播放器 `setUp(source_240, ...)`。
- 购买成功后，原 APP 才把购买接口返回的 URL 回写到同一对象的 `source_240` 再继续播放。
- 因此短视频当前页面的原生媒体契约是**列表对象 `source_240`**；Test15/16 的“点卡片后重新请求详情，再从详情挑 source/preview”属于偏离原 APP 的错误链，会同时增加等待并可能选到试看/占位源。

### Test17 修改
- **短视频列表 source_240 快路径**：点击卡片后优先使用列表记录中的 `source_240`，不再先请求 `/api/MvDetail/detail`。
- **减少播放器前串行网络**：列表 `source_240` 若为 HLS，只做一次 `cacheM3u8`；失败则直接带播放器 Header 交付，不再先做 HEAD 探测和多候选循环。
- **保留旧链作为兜底**：只有列表没有 `source_240` 时才调用 Test15 的详情/候选回退。
- **推荐/长视频共享缓存**：统一直接使用 App `/api/MvList/featuredAv`，会话缓存 5 分钟；推荐和长视频在同一份列表上切换，不再每次重打 API，也移除了此前先试 PWA featuredAv 再回 App 的额外等待。
- **短视频列表缓存**：PWA `smallVideoByTag` 结果会话缓存 3 分钟；切离短视频再返回时优先直接复用。
- **错误时长不再误导 UI**：短视频 `duration_str <= 5s` 时暂不显示时长，真实长度以播放器结果为准。
- **图片与长视频基线冻结**：Test16 图片链、Test10 长视频完整性/解密链、收费/试看语义均不修改。
- 新增诊断：`ttt_last_short_contract`、`ttt_last_feed_cache`；保留 `ttt_last_short_play / ttt_last_handoff`。
- 新增跨程序事故：`docs/INCIDENT_LIST_MEDIA_CONTRACT_VS_DETAIL_REQUERY_20260823.md`。
- Test17 `playback_bridge.js / pages_patch.js / runtime.js / Bootstrap` 均通过实际 JS 语法门禁；Release JSON / Shell JSON 通过解析门禁。
- Release / Bootstrap / Shell 派生为不可变 Test17 / Build10117；Shell rule version `2026082318`。

### Test17 实机验收
1. 第一次打开推荐后切换长视频，再切回推荐，应明显快于 Test16；诊断 `ttt_last_feed_cache.hit=true` 表示命中缓存。
2. 第一次进入短视频后离开再返回，应直接复用 3 分钟短视频缓存。
3. 随机点击 3 个短视频：进入播放器等待应明显缩短，并检查播放器真实总时长是否不再只有 2–3 秒。
4. 若短视频仍只有 2–3 秒，只提供 `ttt_last_short_contract + ttt_last_short_play + ttt_last_handoff`，即可确认 PWA 列表是否真正下发完整 `source_240`。
5. 推荐/长视频/短视频封面、免费长视频、官方预览必须保持 Test16 状态，不允许回归。

## 历史版本
- Test16：[`CHANGELOG_HISTORY_TEST16.md`](./CHANGELOG_HISTORY_TEST16.md)
- Test15：[`CHANGELOG_HISTORY_TEST15.md`](./CHANGELOG_HISTORY_TEST15.md)
- Test14：[`CHANGELOG_HISTORY_TEST14.md`](./CHANGELOG_HISTORY_TEST14.md)
- Test11–Test13：[`CHANGELOG_HISTORY_TEST11_TO_TEST13.md`](./CHANGELOG_HISTORY_TEST11_TO_TEST13.md)
- Test8–Test10：[`CHANGELOG_HISTORY_TEST8_TO_TEST10.md`](./CHANGELOG_HISTORY_TEST8_TO_TEST10.md)
- Test7 及以前：[`CHANGELOG_HISTORY_TO_TEST7.md`](./CHANGELOG_HISTORY_TO_TEST7.md)
