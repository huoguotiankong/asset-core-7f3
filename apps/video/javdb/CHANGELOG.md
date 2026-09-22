# JavDB v3 Changelog

> 2026-09-22 起将此前长篇历史归档到 `CHANGELOG_PRE_3950_20260922.md`。当前文件保留活动基线、最近实机结论、当前修复与回退边界。事实优先级：用户当前实机 > 当前 Shell / Release / 源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界

- Stable：`3.9.42 / Build2026082301`，继续冻结，是业务稳定恢复基线。
- Latest：仍指向 Stable `3.9.42`，不修改。
- 云仓当前 Test 指针：`3.9.50-test.1 / Build2026092204`；该版已被当前实机证实存在 VIP 首播回归，暂不晋级。
- VIP 专项 Hotfix：`3.9.51-test.1 / Build2026092205`，通过云口令单独验证，暂不切云仓 Test 指针。
- 磁链菜单专项：`3.9.52-test.1 / Build2026092206` 已完成 6 项菜单收敛，但当前实机发现“光鸭”仍沿用旧复制磁链 handler。
- 光鸭固定页尝试：`3.9.53-test.1 / Build2026092207`，实机提示“找不到 magnet 这个页面”，证明当前已安装光鸭规则没有固定 `magnet` page；该方案停止继续沿用。
- 光鸭动态路由 Test：`3.9.54-test.1 / Build2026092208`，点击时读取已安装 `光鸭云盘 / 光鸭` 规则的真实 pages 并动态寻找磁力/云添加/离线入口；等待实机验证。
- Base Runtime：`3.9.44-test.1 / Build2026082501` Local-First。
- Product UI：`3.9.45-test.7 / Build2026082904`。
- Shared JAV Playback Test：`1.1.0-test.1 / Build11001`，第三方播放页按需加载。

---

## 2026-09-22 · 3.9.54-test.1 / Build2026092208 · 光鸭动态页面发现

### 当前实机事实

用户截图确认 Test53 点击 `光鸭` 后海阔提示：

```text
找不到“magnet”这个页面
```

这说明跨小程序跳转本身已经发生，但当前设备安装的光鸭规则并没有注册 `magnet` 这个 page path。因此此前根据旧版本实现写死：

```text
hiker://page/magnet?rule=光鸭云盘&realurl=<magnet>
```

在当前实际安装版本上无效。

### Test54 修复方式

不再猜固定 path。长按点击 `光鸭` 时动态执行：

1. 依次读取 `request('hiker://home@光鸭云盘')`、`request('hiker://home@光鸭')`。
2. 解析当前已安装规则真实 `home_rule` 和 `pages`。
3. 根据 page 的 `name / path / rule` 对 `磁力 / 云添加 / 离线 / magnet / cloudAdd / add / diaoyong / fxlj` 等入口打分。
4. 只跳转到当前规则确实存在的 page，不再写死不存在的 `magnet`。
5. 为兼容不同光鸭版本，同时传入：`realurl / url / add / magnet / input` 五种参数名，值均为完整磁链。
6. 跳转前尝试将磁链写入剪贴板，兼容仍从剪贴板读取链接的旧版光鸭。
7. 如果当前规则没有任何专用云添加 page，则退回该已安装规则的定向搜索入口，而不是报“页面不存在”。

### 不变边界

- 长按菜单继续固定：`115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链`。
- 115 / 迅雷 / PikPak / 123 不改。
- `复制磁链` 仍只由最后一项负责。
- 磁链大小 / 高清 / 4K / 字幕 metadata 不改。
- VIP 播放继续继承 `3.9.51-test.1`，本轮完全不碰播放链。
- Stable `3.9.42`、Latest、云仓 Test 指针均不修改。

### 发布形态

- Entry：`apps/video/javdb/releases/3.9.54-test.1/local_entry.js`
- Release：`apps/video/javdb/releases/3.9.54-test.1/release.json`
- 云口令入口：`cloud/javdb/v3.9.54-test.1/import_guangya_dynamic.js`
- 云口令文本：`cloud/javdb/v3.9.54-test.1/cloud_token.txt`

### 实机验收

1. 点击 `光鸭` 不再出现“找不到 magnet 页面”。
2. 若当前光鸭规则含磁力/云添加/离线专页，应直接进入该真实页面。
3. 光鸭页面应拿到完整磁链并继续云添加/播放流程。
4. 若只能进入光鸭搜索页，说明当前安装版没有对外暴露云添加 page；届时需要读取该安装版光鸭规则源码，不能继续猜路由。

---

## 2026-09-22 · 3.9.53-test.1 / Build2026092207 · 光鸭固定 magnet 页尝试（实机证伪）

### 当前实机事实

Test52 中点击长按菜单的“光鸭”后，实际行为仍是复制磁链，并没有进入光鸭云盘播放。

Test53 因此不再复用旧 handler，改为固定：

```text
hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>
```

但当前实机明确返回：

```text
找不到“magnet”这个页面
```

结论：旧版本曾使用过的 `magnet` page 不能代表当前安装的光鸭规则。后续禁止继续写死该 path，改由 Test54 动态读取当前规则 pages。

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
- 保留基础 Runtime 已有的 迅雷 / PikPak / 光鸭 / 123 handler。
- 固定 `复制磁链` 为最后一项；基础菜单没有时使用 `copy://<magnet>` 兜底。
- 删除 `网盘播放中心` 及其它未指定长按项。
- 磁链大小 / 高清 / 4K / 字幕 metadata 继续继承 Test50/Test51，不改协议和显示逻辑。
- VIP 播放完全继承 `3.9.51-test.1`，避免把菜单验证和播放性能变量重新混在一起。

### 实机结果

- 菜单收敛方向保留。
- 当前实机发现 `光鸭` 的旧 handler 实际只是复制磁链，因此“保留旧 handler”的假设已证伪。

### 发布形态

- Entry：`apps/video/javdb/releases/3.9.52-test.1/local_entry.js`
- Release：`apps/video/javdb/releases/3.9.52-test.1/release.json`
- 云口令入口：`cloud/javdb/v3.9.52-test.1/import_magnetmenu.js`
- Stable `3.9.42`、Latest、云仓 Test 指针均未修改。

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
- `115` 路由到 `115.简 / 115Offline?add=<magnet>`。
- `光鸭` 不允许再写死旧版 `magnet` page；当前策略是运行时读取已安装光鸭规则 pages 后动态选择真实磁力/云添加入口。
- `网盘播放中心` 不再进入磁链长按菜单；如未来仍需该页面，只保留独立页面入口，不抢长按主流程。

### 恢复与回退

- 正式恢复入口：Stable `3.9.42 / Build2026082301`。
- 光鸭动态调用专项：`3.9.54-test.1 / Build2026092208`，基于 Test52，只改光鸭路由发现，等待实机验证。
- Test53：固定 `magnet` page 已被当前实机证伪，不作为调用基线。
- Test52：菜单收敛有效但光鸭旧 handler 已证伪，不作为最终菜单基线。
- VIP 专项：`3.9.51-test.1 / Build2026092205`，只验证原始 VIP HLS，不晋级 Stable。
- Test50：播放页快但首播可 `0 kb/s / 00:00`，不作为恢复基线。
- Test49：播放页快但自动换本地索引后 Seek 可长期卡死，不作为恢复基线。
- Test48：Seek 略改善但进入/起播变慢，不作为恢复基线。
- Local-First 基础回退：`3.9.44-test.1 / Build2026082501`。
- Pure Local：`3.9.41-local / Build2026082103`。
- 旧完整历史：`CHANGELOG_PRE_3950_20260922.md`；更早历史见 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。
