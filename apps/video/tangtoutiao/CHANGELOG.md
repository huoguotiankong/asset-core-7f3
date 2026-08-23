# 汤头条 CHANGELOG

## 0.1.0-test.16 / Build 10116 — 2026-08-23

状态：**Test15 播放成功后的封面/UI 定向修复版，仍为 Test；禁止晋级 Stable。**

### Test15 实机事实
- **短视频已能正常播放。**
- **免费长视频已能正常播放。**
- **官方预览已能正常播放。**
- 因此 Test15 的 `playback.js + playback_bridge.js` 已冻结为当前播放基线，本轮不修改短视频、免费长视频、预览的媒体交付逻辑。
- 所有列表/详情封面均不显示，页面只剩灰色占位区域。
- 短视频当前使用 `pic_1_card`，形成单列超大横卡，信息密度低、滚动效率差，与推荐/长视频的双列设计不一致。

### Test16 修改
- **撤销 Test15 错误的 placeholder 图片交付方式**：不再使用 `1×1 placeholder → $().image() → callback 自取流` 作为最终卡片图片。
- **恢复实机证明过的图片交付模型**：最终封面回到 `真实远程图片 URL@js=字节转换`。
- **保留 Test15 的选图改进**：仍优先 `thumb_cover_str`，其次 `thumb_cover / cover / thumb / cover_url / img_url`，因此不是简单回滚 Test13。
- **继续三态图片判型**：真实图片字节先判断明文；否则尝试 PWA AES-CBC；仍失败再尝试 App legacy AES-CFB。
- **短视频改为双列卡片**：`pic_1_card` → `movie_2`，保留标题、作者/时长/播放数信息；点击仍直接调用 Test15 已验证的 `playShortStable()`，不进入详情页。
- 推荐/长视频数量、详情结构、免费/收费边界、购买行为均不在本轮修改范围。
- 新增专项事故：`docs/INCIDENT_IMAGE_PLACEHOLDER_CALLBACK_20260823.md`。
- 新增 `compat.js / pages_patch.js / runtime.js` 均通过 `node --check`；Bootstrap Test16 同样通过语法检查。
- Release / Bootstrap / Shell 派生为不可变 Test16 / Build10116；Shell rule version `2026082317`。

### Test16 实机验收
1. 推荐、长视频、短视频卡片应重新出现真实封面；详情页头图也应恢复。
2. 短视频页应变成双列紧凑布局，不再出现单张封面占据接近整屏宽度的情况。
3. 随机点击 2～3 个短视频，确认仍能直接播放。
4. 随机测试一个免费长视频和一个官方预览，确认 Test15 播放能力没有回归。
5. 若仍有封面为空，只提供 `ttt_last_image_policy + ttt_last_image_diag`；Test16 正常策略应看到 `inline-thumb-cover-str-first`。

## 历史版本
- Test15：[`CHANGELOG_HISTORY_TEST15.md`](./CHANGELOG_HISTORY_TEST15.md)
- Test14：[`CHANGELOG_HISTORY_TEST14.md`](./CHANGELOG_HISTORY_TEST14.md)
- Test11–Test13：[`CHANGELOG_HISTORY_TEST11_TO_TEST13.md`](./CHANGELOG_HISTORY_TEST11_TO_TEST13.md)
- Test8–Test10：[`CHANGELOG_HISTORY_TEST8_TO_TEST10.md`](./CHANGELOG_HISTORY_TEST8_TO_TEST10.md)
- Test7 及以前：[`CHANGELOG_HISTORY_TO_TEST7.md`](./CHANGELOG_HISTORY_TO_TEST7.md)
