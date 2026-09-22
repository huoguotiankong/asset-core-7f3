# JavDB v3 Changelog

> 2026-09-22 起将此前长篇历史归档到 `CHANGELOG_PRE_3950_20260922.md`。当前文件保留活动基线、最近实机结论、当前修复与回退边界。事实优先级：用户当前实机 > 当前 Shell / Release / 源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界

- Stable：`3.9.42 / Build2026082301`，继续冻结，是业务稳定恢复基线。
- Latest：仍指向 Stable `3.9.42`，不修改。
- 云仓当前 Test 指针：`3.9.50-test.1 / Build2026092204`；该版已被当前实机证实存在 VIP 首播回归，暂不晋级。
- VIP 专项 Hotfix：`3.9.51-test.1 / Build2026092205`，通过云口令单独验证，暂不切云仓 Test 指针。
- 磁链菜单专项 Test：`3.9.52-test.1 / Build2026092206`，仅叠加长按菜单收敛，VIP 播放完全继承 Test51；等待当前实机验证。
- Base Runtime：`3.9.44-test.1 / Build2026082501` Local-First。
- Product UI：`3.9.45-test.7 / Build2026082904`。
- Shared JAV Playback Test：`1.1.0-test.1 / Build11001`，第三方播放页按需加载。

---

## 2026-09-22 · 3.9.52-test.1 / Build2026092206 · 磁链长按菜单收敛

### 修改边界

本轮不再修改 VIP 播放链，只处理用户当前明确提出的磁链长按交互：

```text
115
→ 迅雷
→ PikPak
→ 光鸭
→ 123
→ 复制磁链
```

处理规则：

- 固定 `115` 为第一项。
- 保留基础 Runtime 已有的 迅雷 / PikPak / 光鸭 / 123 实际 handler，不重新发明路由。
- 固定 `复制磁链` 为最后一项；基础菜单没有时使用 `copy://<magnet>` 兜底。
- 删除 `网盘播放中心` 及其它未指定长按项。
- 磁链大小 / 高清 / 4K / 字幕 metadata 继续继承 Test50/Test51，不改协议和显示逻辑。
- VIP 播放完全继承 `3.9.51-test.1`，避免把菜单验证和播放性能变量重新混在一起。

### 发布形态

- Entry：`apps/video/javdb/releases/3.9.52-test.1/local_entry.js`
- Release：`apps/video/javdb/releases/3.9.52-test.1/release.json`
- 云口令入口：`cloud/javdb/v3.9.52-test.1/import_magnetmenu.js`
- 云口令从现有 Test50 Shell 动态派生 Test52，只替换版本/build、本地目录和 Test52 Entry 固定 commit。
- Stable `3.9.42`、Latest、云仓 Test 指针均不修改，先做单独实机 A/B。

### 实机验收

1. 长按任意磁链，菜单只出现 6 项。
2. 顺序必须严格为：`115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链`。
3. 不再出现 `网盘播放中心` 或其它旧项。
4. 115 仍直接进入 `115.简 / 115Offline?add=<magnet>`。
5. 迅雷 / PikPak / 光鸭 / 123 各自点击行为与改版前一致。
6. 复制磁链可直接得到完整 magnet。
7. 磁链描述中的大小 / 高清 / 4K / 字幕信息仍正常显示。
8. VIP 播放表现应与 Test51 一致；如果发生变化，优先判定为运行链/缓存问题，而不是本轮菜单逻辑。

---

## 2026-09-22 · 3.9.51-test.1 / Build2026092205 · VIP 原始 HLS 隔离验证

### Test50 当前实机结论

用户截图确认：

- VIP 播放页进入很快，说明 Test49 以来的扁平 Local-First / 延迟第三方 Playback 架构有效。
- 但 `3.9.50-test.1` 点击开始播放后播放器可长期停在 `0 kb/s`，总时长保持 `00:00`，首次播放本身已经不能接受。
- 因此 `#noPre#` 在当前 JavDB VIP / 海阔播放器组合中不能继续作为默认方案；当前现象已经不是单纯 Seek 慢，而是播放器未稳定建立媒体时长/数据流。

### Test51 修改边界

本轮只做变量隔离，不再增加新的播放加速层：

```text
3.9.50 快速页面架构
→ VIP playPage 原结果
→ 仅移除 #noPre#
→ 不自动 cacheM3u8
→ 不 updateItem 自动换链
→ 原始 URL / headers 原样交给播放器
```

目标是同时保留：

1. Test49/Test50 已验证的快速进入播放页；
2. Test49 在自动换成本地索引前曾出现的快速首次起播；
3. 去掉 Test49 后台本地索引和 Test50 `#noPre#` 两个干扰变量。

### 发布形态

- Entry：`apps/video/javdb/releases/3.9.51-test.1/local_entry.js`
- Release：`apps/video/javdb/releases/3.9.51-test.1/release.json`
- 云口令使用 `cloud/javdb/v3.9.51-test.1/import_rawhls.js` 动态从 Test50 Shell 派生 Test51 导入规则。
- Stable 3.9.42 不动；当前云仓 Test 指针暂不切换，先等本机 A/B 结果。

### 下一步判定

- 如果 Test51 首播恢复快速，但 Seek 仍慢：后续直接分析 **原始 master/media playlist、目标 ts/m4s 分片、Header/Cookie/Referer、CDN 响应和播放器 Seek 子请求**，不再使用 `cacheM3u8` 或 `#noPre#` 猜测性优化。
- 如果 Test51 首播仍停在 `0 kb/s / 00:00`：说明问题已经不在这两个 Overlay，需要回到 Base VIP 线路解析/授权有效期本身检查。

---

## 2026-09-22 · 3.9.50-test.1 / Build2026092204 · VIP Live HLS No-Preload（当前实机证伪）

### 设计

- 移除 Test49 后台 `cacheM3u8` 预热与 `updateItem` 自动换本地索引。
- 默认 VIP HLS 增加 `#noPre#`，尝试避免海阔提前预解析时效媒体。
- 长按保留原始 VIP / 手动本地索引诊断入口。

### 实机结果

- 播放页进入继续很快。
- 首次播放出现长期 `0 kb/s / 00:00`，比 Test49 明显回归。
- 当前设备上 `#noPre#` 不适合作为 JavDB VIP 默认链，Test51 默认撤销。

---

## 2026-09-22 · 3.9.49-test.1 / Build2026092203 · Fast VIP / Warm Seek（自动换链已证伪）

- 播放页进入速度明显改善，扁平 Runtime 方向保留。
- 正常起播比 3.9.48 更快。
- 但后台 `cacheM3u8 → updateItem` 后，Seek 可长期卡死。
- 结论：对可能带签名/时效性的 HLS，禁止后台生成本地索引后自动替换正常线路。

---

## 2026-09-22 · 3.9.48-test.1 / Build2026092202 · Magnet Meta + VIP Seek 首轮

- 磁链大小/高清/字幕增强方向有效。
- 点击播放时同步 `cacheM3u8` 让拖动略快，但播放页进入和正式起播明显变慢。
- 结论：同步建立本地 m3u8 索引不能进入 VIP 起播热路径。

---

## 长期技术索引

### VIP 播放性能

- “页面进入、首次起播、Seek 恢复”必须分开测量。
- VIP 热路径禁止同步 `cacheM3u8`。
- 对带签名/时效媒体，禁止后台 `cacheM3u8` 后自动 `updateItem` 替换默认线路。
- `#noPre#` 已在当前设备出现 `0 kb/s / 00:00` 首播回归，禁止继续作为默认 JavDB VIP 策略，除非后续有新的实机证据。
- 下一阶段若原始 HLS 首播正常而 Seek 慢，排查顺序固定为：master playlist → media playlist → 目标分片 → Headers/Cookie/Referer → CDN 响应 → 播放器对子请求 Headers/Range/连接复用行为。
- 不再用更多缓存 Overlay 掩盖底层媒体链问题。

### 磁链

- 资源纯数字大小按 MB 解释并换算 G。
- 标题/对象 metadata 用于识别 HD/4K/字幕。
- 磁链长按固定 6 项顺序：`115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链`。
- `115` 路由到 `115.简 / 115Offline?add=<magnet>`；其它云盘项优先继承基础 Runtime 已有 handler。
- `网盘播放中心` 不再进入磁链长按菜单；如未来仍需该页面，只保留独立页面入口，不抢长按主流程。

### 恢复与回退

- 正式恢复入口：Stable `3.9.42 / Build2026082301`。
- 磁链菜单专项：`3.9.52-test.1 / Build2026092206`，基于 Test51，只改长按菜单，等待实机验证。
- VIP 专项：`3.9.51-test.1 / Build2026092205`，只验证原始 VIP HLS，不晋级 Stable。
- Test50：播放页快但首播可 `0 kb/s / 00:00`，不作为恢复基线。
- Test49：播放页快但自动换本地索引后 Seek 可长期卡死，不作为恢复基线。
- Test48：Seek 略改善但进入/起播变慢，不作为恢复基线。
- Local-First 基础回退：`3.9.44-test.1 / Build2026082501`。
- Pure Local：`3.9.41-local / Build2026082103`。
- 旧完整历史：`CHANGELOG_PRE_3950_20260922.md`；更早历史见 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。
