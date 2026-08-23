# 汤头条 Test15 历史记录

## 0.1.0-test.15 / Build 10115 — 2026-08-23

状态：**播放链实机验证成功，图片交付和短视频 UI 失败；作为后续播放恢复基线保留。**

### Test14 实机事实
- 推荐/长视频已从 PWA recommend 的 3 条恢复到 App `featuredAv` 的 36 条。
- 参考规则的 `preview_video → long host → remove seconds=30` 裸 URL 改写在短视频和免费/已购买长视频兼容线路均播放异常。
- 因此媒体 URL 改写不能代替海阔播放器交付层。

### Test15 修改
- 新增稳定播放交付桥：媒体先探测，HLS 优先 `cacheM3u8`，否则使用 `#isVideo=true#` 并显式携带 `User-Agent / Referer / X-Auth`。
- 免费/已购买短视频按 PWA兼容、PWA原始、App source_origin、240P、App preview 多候选回退。
- locked 内容仅官方 preview；普通 App 长视频继续 Test10 已验证的解密/时长校验代理。
- 推荐/长视频继续最多 36 条。
- 图片最终层改成 `1×1 placeholder → $().image() → ImageLoader 自取流`，并优先 `thumb_cover_str`。

### Test15 实机结果
- **短视频已能正常播放。**
- **免费长视频已能正常播放。**
- **收费内容官方预览已能正常播放。**
- **所有封面均不显示，只剩灰色占位区域。**
- **短视频页面使用 `pic_1_card` 形成单列超大横卡，信息密度低且与首页双列视觉不一致。**

### 结论
- Test15 的 `playback.js + playback_bridge.js` 成为后续固定播放基线，后续图片/UI 修复不得无必要改动该链。
- 图片失败点集中在 placeholder `$().image()` 交付模型，而不是 AES-CBC / legacy-CFB 解密算法本身。
