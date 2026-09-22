# JavDB v3 Changelog

> 2026-09-22 起将此前长篇历史归档到 `CHANGELOG_PRE_3950_20260922.md`。当前文件保留活动基线、最近实机结论、当前修复与回退边界。事实优先级继续为：用户当前实机 > 当前 Shell / Release / 源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界

- Stable：`3.9.42 / Build2026082301`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `3.9.42`，本轮不修改。
- Test：`3.9.50-test.1 / Build2026092204`。
- Test Shell：`cloud/javdb/v3.9.50-test.1/javdb_v3.9.50_test1_livehls.txt`，rule version `2026092204`。
- Test Release：`apps/video/javdb/releases/3.9.50-test.1/release.json`。
- Base Runtime：`3.9.44-test.1 / Build2026082501` Local-First。
- Product UI：`3.9.45-test.7 / Build2026082904`。
- Shared JAV Playback Test：`1.1.0-test.1 / Build11001`，只在第三方播放页按需加载。
- 当前 Test 未经完整实机验证，不得晋级 Stable。

---

## 2026-09-22 · 3.9.50-test.1 / Build2026092204 · VIP Live HLS No-Preload

### Test49 实机结论

用户当前设备确认：

1. `3.9.49-test.1` 的播放页面进入速度已经明显恢复，说明“扁平 Local-First + 普通页面不预加载第三方 Playback”方向有效。
2. 但 VIP 视频拖动进度条后会长时间卡住，甚至一直无法继续播放。
3. 因此 Test49 的“页面渲染后后台 `cacheM3u8` → `updateItem` 自动把前两条 VIP HLS 换成本地索引”不能继续作为默认播放链。

### 根因判断与修改边界

结合 Test49 代码和实机现象，当前首要嫌疑是：VIP HLS/子分片属于带时效或签名的媒体地址，后台提前缓存并把播放行切成本地 m3u8 后，本地索引可能继续引用已经失效、传播异常或不适合长期复用的远端分片 URL。其表现正是“首播正常，Seek 后目标分片长期拉不回来”。

本轮不再继续扩大 `cacheM3u8`，而是收回到更接近原站的实时媒体链：

- **彻底移除后台 `cacheM3u8` 预热。**
- **彻底移除 `updateItem` 自动把正常 VIP 线路换成本地索引。**
- VIP HLS 正常点击保持原实时直链，只增加 `#noPre#`，避免海阔在用户真正播放前提前预解析/预加载时效媒体地址。
- JSON 多线路继续保留原 `urls / names / headers` 合同，仅对其中 HLS URL 增加 `#noPre#`，不改 Header 数组。
- 直接 HLS + inline headers 时，`#noPre#` 放在媒体 URL 与 `;{...}` headers 后缀之间，避免破坏原 Header 合同。
- 长按保留 **原始VIP播放**：返回完全未修改的原始线路，用于和 `#noPre#` 正常播放做 A/B。
- 长按保留 **本地索引播放（备用）**：仅用户手动选择时才执行 `cacheM3u8`，不再自动替换正常线路。

### 保留功能

- 磁链大小继续自动换算：如 `4830 → 4.72G`。
- 继续识别 `高清 / 4K / 字幕 / 日期 / PikPak` 等信息。
- 真实磁链长按第一项继续为 `调用115`。
- Test49 已验证的快速播放页架构继续保留。
- 第三方 MissAV / 123AV / Jable / AV01 / TKTUBE / JavGuru 继续按需加载，本轮不改 Provider Resolver。

### 不可变引用

- Entry create commit：`8474f9b758cff4141a4ab101c34e5eef42190a52`
- Entry blob：`8857a9fc4a8245620f7fa6002c82ead3046f66ff`
- Shell create commit：`4ef54357891e6ec327cd545fc327be939d63bfce`
- Shell blob：`29e7dcc4f8d469adf07b0eb823a82611cf120cbb`
- Release metadata commit：`189742c423cf7340cd06c0f53dc9dd7a4c713668`
- Test pointer commit：`2dd5ac7f52b520b9f1fbfdb6caa08d0691a97b13`
- Channels commit：`071e054d598d758784f49c7a2999f8aa47dd7ed0`

### 待实机验证

1. VIP 播放页进入速度不能从 Test49 回退。
2. 正常点击 VIP HLS 是否能快速起播。
3. 同一视频分别拖到约 10 / 30 / 60 分钟后，是否能在合理时间恢复，而不是长期卡死。
4. 同一线路长按“原始VIP播放”与普通 `#noPre#` 播放做 A/B，判断瓶颈来自海阔预加载还是服务端/CDN Seek 本身。
5. “本地索引播放（备用）”只做诊断，不作为正常默认链。
6. 磁链大小、HD/4K/字幕与“调用115”不能回归。

---

## 2026-09-22 · 3.9.49-test.1 / Build2026092203 · Fast VIP / Warm Seek（已证伪默认自动换链）

### 实机结果

- 播放页进入速度明显改善，扁平 Runtime 方向保留。
- VIP 正常起播比 3.9.48 更快。
- 但后台将播放项无感换为 `cacheM3u8` 本地索引后，拖动进度可能长期卡死。

### 结论

`cacheM3u8` 不再视为 JavDB VIP 的默认 Seek 加速器；对可能带签名/时效性的 HLS，不允许后台生成本地索引后自动替换正在给用户使用的正常播放线路。该方案由 `3.9.50-test.1` 撤销。

---

## 2026-09-22 · 3.9.48-test.1 / Build2026092202 · Magnet Meta + VIP Seek 首轮

### 实机结果

- 磁链大小/高清/字幕增强方向有效。
- VIP `cacheM3u8` 方案使拖动比旧版稍快，但播放页进入和正式起播明显变慢。

### 结论

点击播放时同步建立完整本地 m3u8 索引会把网络与解析成本前移到起播热路径，不能作为默认方案。Test49 将同步缓存移出热路径；Test50 又进一步取消自动本地索引替换。

---

## 长期技术索引

### VIP 播放性能

- “页面快”与“Seek 快”必须分开验证，不能用同一个同步预处理解决全部问题。
- VIP 热路径禁止同步 `cacheM3u8`。
- 对带签名/时效媒体，禁止后台 `cacheM3u8` 后通过 `updateItem` 自动换掉正常线路。
- 优先保持原站实时 HLS 合同、原 Header、多线路数组对齐，再判断是否需要播放器侧优化。
- `#noPre#` 目前只作为“禁止海阔提前预加载时效媒体”的 Test 策略，最终是否保留以实机 A/B 为准。
- 若 Test50 仍然 Seek 卡顿，下一步优先抓取/对比：master/media playlist、目标分片 URL、Header/Cookie/Referer、CDN 响应、分片时长与播放器对子请求 Header 的实际行为；不再盲目叠加缓存层。

### 磁链

- 资源纯数字大小当前按 MB 解释并换算 G。
- 标题/对象 metadata 用于识别 HD/4K/字幕。
- 磁链长按第一项固定保留 `调用115`，路由到 `115.简 / 115Offline?add=<magnet>`。

### 恢复与回退

- 正式恢复入口：Stable `3.9.42 / Build2026082301`。
- 当前 Test：`3.9.50-test.1 / Build2026092204`，等待 VIP Seek 实机验证。
- Previous Test：`3.9.49-test.1 / Build2026092203`，播放页快但 Seek 可长期卡死，不作为 recovery base。
- Previous Test：`3.9.48-test.1 / Build2026092202`，Seek 略改善但播放页/起播回归，不作为 recovery base。
- Local-First 基础回退：`3.9.44-test.1 / Build2026082501`。
- Pure Local：`3.9.41-local / Build2026082103`。
- 旧完整历史：`CHANGELOG_PRE_3950_20260922.md`；Local-First 迁移前更早历史仍见 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。
