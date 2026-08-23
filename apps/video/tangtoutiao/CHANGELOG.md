# 汤头条 CHANGELOG

## 0.1.0-test.15 / Build 10115 — 2026-08-23

状态：**Test14 实机否定裸 URL 兼容实验后的播放交付/封面恢复版，仍为 Test；禁止晋级 Stable。**

### Test14 实机事实
- 推荐/长视频已从 PWA recommend 的 3 条恢复到 App `featuredAv` 的 36 条，说明主列表应继续使用大列表模型。
- 恢复 App 大列表后长视频封面再次大面积灰；短视频仍有可见封面，说明列表 Provider 与图片字段/请求合同存在差异。
- 用户上传参考规则的 `preview_video → long host → remove seconds=30` 裸 URL 改写，在当前海阔/当前 CDN 环境下短视频仍“播放异常”；免费/已购买长视频的“兼容线路”同样失败。
- 因此参考规则的 URL 改写只能作为候选来源，不能继续当作完整播放实现。

### 已验证的跨程序播放依据
- 黄豆短剧 Stable：播放前探 HLS，最终 URL 显式带 `User-Agent / Referer / Cookie`。
- 麻豆AI Stable：HLS 优先 `cacheM3u8`，失败才走带 Header 的代理/直连，并附 `#isVideo=true#`。
- Shared JAV Playback Stable：统一使用 `#isVideo=true#;{Referer@...&&Origin@...&&User-Agent@...}`；必要时先解析 master/最高画质。
- 结论：**媒体 URL 可访问不等于播放器后续请求能继承正确 Header/鉴权；播放器交付层必须独立设计。**

### Test15 修改
- **短视频/PWA 稳定交付桥**：新增 `playback_bridge.js`。候选地址先做响应探测；识别 HLS 时优先 `cacheM3u8(url, headers, name)`，成功后直接交本地缓存；否则使用 `#isVideo=true#` 并显式附带 `User-Agent / Referer / X-Auth`。
- **短视频多候选回退**：免费/已购买短视频依次尝试参考 `long.` 候选、原始 PWA preview、App `source_origin`、App `source_240`、App preview；不再把裸改写 URL 当唯一线路。
- **收费边界不变**：locked 短视频只允许官方 preview；不会通过参考改写或自动消费汤币绕过授权。
- **App 长视频不推倒重写**：普通长视频继续使用 Test10 已经实机验证过的 `source_* → HLS sniff/dekey → 时长完整性 → 本地代理` 链。
- **移除普通详情的“兼容线路”主入口**：避免继续暴露已经被实机否定的裸改写方案；普通免费/已购视频只保留正常“立即播放”。
- **大列表保持最多 36 条**：推荐/长视频先尝试 PWA `/api/MvList/featuredAv`；如果 PWA 能返回至少 12 条，则直接使用其列表；否则回退 App `/api/MvList/featuredAv`。
- **图片最终适配重建**：最终 Adapter 优先 `thumb_cover_str`，再回 `thumb_cover`；统一使用本地占位图触发 JS，由 ImageLoader 自己 fetch 真实图片。请求依次尝试 okhttp/browser/PWA Referer/站点 Referer/player Referer，字节再自动判定明文图片 → PWA AES-CBC → App legacy AES-CFB。
- 新增诊断：`ttt_last_pwa_featured`、`ttt_last_handoff`；继续保留 `ttt_last_short_play / ttt_last_image_policy / ttt_last_image_diag / ttt_last_source_probe`。
- 新增跨程序事故：`docs/INCIDENT_MEDIA_HANDOFF_VS_URL_REWRITE_20260823.md`。
- Release / Bootstrap / Shell 派生为不可变 Test15 / Build10115；Shell rule version `2026082316`。

### Test15 实机验收
1. 推荐/长视频仍应有约 36 条，而不是退回 3 条。
2. 观察长视频封面：新的 `ttt_last_image_policy.mode` 应为 `self-fetch-thumb-cover-str-first`；仍灰时只提供 `ttt_last_image_diag`。
3. 短视频继续点击卡片直接播放。若失败，提供 `ttt_last_short_play + ttt_last_handoff`，即可判断失败在 cacheM3u8、Header 直连还是所有候选都不可用。
4. 免费普通长视频只测试“立即播放”；Test15 不再要求测试已被否定的兼容按钮。若失败，提供 `ttt_last_source_probe + ttt_last_play_diag`。
5. 收费视频仅测试官方试看；不要为了回归确认真实汤币消费。

## 历史版本
- Test14：[`CHANGELOG_HISTORY_TEST14.md`](./CHANGELOG_HISTORY_TEST14.md)
- Test11–Test13：[`CHANGELOG_HISTORY_TEST11_TO_TEST13.md`](./CHANGELOG_HISTORY_TEST11_TO_TEST13.md)
- Test8–Test10：[`CHANGELOG_HISTORY_TEST8_TO_TEST10.md`](./CHANGELOG_HISTORY_TEST8_TO_TEST10.md)
- Test7 及以前：[`CHANGELOG_HISTORY_TO_TEST7.md`](./CHANGELOG_HISTORY_TO_TEST7.md)
