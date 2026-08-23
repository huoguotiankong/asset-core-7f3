# 汤头条 CHANGELOG — Test17 归档

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
- 因此短视频当前页面的原生媒体契约是列表对象 `source_240`；Test15/16 的“点卡片后重新请求详情，再从详情挑 source/preview”属于偏离原 APP 的错误链，会同时增加等待并可能选到试看/占位源。

### Test17 修改
- 短视频点击后优先列表记录 `source_240`，不再先请求 `/api/MvDetail/detail`。
- HLS 只做一次 `cacheM3u8`，失败后直接带播放器 Header 交付，不再先做 HEAD 探测和多候选循环。
- 只有列表没有 `source_240` 时才回退 Test15 的详情/候选链。
- 推荐/长视频共用 App `/api/MvList/featuredAv` 5 分钟会话缓存。
- PWA `smallVideoByTag` 短视频列表缓存 3 分钟。
- `duration_str <= 5s` 时不再把明显异常时长显示在卡片上。
- 图片与长视频播放基线冻结，不修改 Test16 图片链与 Test10 长视频完整性/解密链。
- 新增诊断 `ttt_last_short_contract`、`ttt_last_feed_cache`。
- 新增跨程序事故：`docs/INCIDENT_LIST_MEDIA_CONTRACT_VS_DETAIL_REQUERY_20260823.md`。
- Test17 JS/JSON/Shell 已通过发布门禁。

### Test17 后续实机结论
- 推荐/短视频/长视频首次切换仍较慢，但第二次开始明显加快，证明会话缓存生效。
- 短视频即使改成列表 `source_240` 快路径，实际播放仍只有约 2–3 秒。
- 由此进一步确认：问题已经不是“重查详情选错源”，而是 Test17 首选的 PWA `smallVideoByTag` 列表本身下发了短切片/试看型 `source_240`；下一版应改用原 App 同名接口的精确参数，而不是继续调整播放器。
