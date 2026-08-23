# 汤头条 CHANGELOG 历史：Test8–Test10

归档日期：2026-08-23。Test7 及以前见 `CHANGELOG_HISTORY_TO_TEST7.md`。

## Test10 / Build 10110
- Test9 实机证明 Core Patch 仅覆盖导出函数，旧 `item/detailItem` 闭包仍调用旧图片函数；Test10 因此完整重建 Core。
- 所有视频/详情/漫画/排行图片统一改走 `$(url,headers).image(...) + ImageAdapter`，诊断策略为 `helper-all`。
- 播放从“URL 后缀判断”改为 Content-Type / 包装形态探测；支持 `yd-long/.../https://...` 外层和内层 URL 双候选，无 `.m3u8` 后缀也能进入 HLS/AES-CFB/M3U8 处理。
- 实机结果：短视频封面恢复；长视频/精选封面仍灰。34:52 长视频只返回 1080P 约 2 秒维护片 + 120 秒 `preview_video`，说明部分长视频并非媒体解析故障，而是访问权限/试看语义。

## Test9 / Build 10109
- 尝试给 `picx.yrfmba.cn` 标准图片补 `@headers`，但因旧 Core 闭包仍绑定 Test8 `imageUrl`，实机没有真正接管。
- 播放增加详情标称时长与 `#EXTINF` 实际时长对比，修复“19:34 长视频的 240P 实际只有 57 秒却被视为完整片源”的伪成功。
- 短视频卡片改为列表直接播放，不再先进入普通视频二级页。
- 实机暴露无后缀包装 HLS 被误判成 direct，推动 Test10 重建 Playback sniff。

## Test8 / Build 10108
- 详情页只保留一个真实媒体动作；Hero、清晰度按钮不再返回媒体 URL，修复海阔把多个同级媒体 item 识别为“上一个/下一个/列表”的播放列表污染。
- 播放增加 source 级预检，最初只过滤数秒维护片。
- 排行榜从视频模型改为真实创作者模型 `nickname/owner_uuid/videos_count/followed_count/...`。
- 漫画动态合同验证成功：`/api/comic/home` 返回 12 个分类，每项携带 `api_list + params_list`；例如 `api/comic/construct?id=7&page=1` 可返回 `list[30]`。

这些版本均为 Test，从未晋级 Stable。
