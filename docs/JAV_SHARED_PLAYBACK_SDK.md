# JAV 类小程序共享外部播放 SDK

版本：1.2  
建立：2026-08-22  
最近更新：2026-08-23  
适用：JavDB、JavBus 以及后续按番号检索影片的海阔小程序。

## 1. 目标

第三方播放站属于高变动外部依赖。禁止在 JavDB、JavBus 等多个程序里复制同一套 MissAV/123AV/Jable 解析代码，否则站点一变需要多处维修，容易形成版本漂移。

统一架构：

```text
JAV 类业务小程序
    ↓ 只传番号 + Provider ID
shared/jav-playback/manager.js
    ↓ 按 channel 解析版本
shared/jav-playback/releases/<version>/index.js
    ↓
MissAV / 123AV / Jable / 后续 Provider
```

业务小程序只负责入口 UI、官方播放和业务数据；共享 SDK 只负责第三方站点的“番号 → 可播放结果”。

## 2. 固定入口与版本治理

固定 Manager：`shared/jav-playback/manager.js`  
通道元数据：`shared/jav-playback/channels.json`  
Release：`shared/jav-playback/releases/<version>/index.js`

硬规则：

- Stable 业务程序只加载 `stable` 指针或显式 immutable release，不直接跟随 `test`。
- Provider 失效先发新的 SDK Test release，不原地覆盖旧 Stable SDK。
- 同 URL / 同版本不得依靠覆盖修缓存问题。
- SDK 失败必须只影响第三方播放，不得拖垮业务小程序详情、搜索、官方播放、磁链、收藏等主链。
- 每个 Provider 独立解析；新增站点不修改其它 Provider。
- **某 Provider 已实机可播后默认冻结其解析逻辑。维修另一个 Provider 时不得顺手重写已验证 Provider。**
- Manager/SDK 使用 `eval` 加载时，必须同时做语法门禁和“加载后外层能读取导出对象”的作用域 smoke test；不能只靠 `node --check`。
- Stable 指针一旦发布，未来 SDK Test 只移动 `test` 指针；除非经过明确晋级，不得修改 `stable` 指针。

## 3. SDK 合约

当前统一对象：`JAVPlayback`。

最低公共方法：

```text
providers()              返回 Provider 列表
normalizeCode(code)      标准化番号
resolve(id, code)        解析一个 Provider
renderInto(d, options)   向海阔页面渲染 Provider 入口
```

`resolve()` 最终返回海阔可直接处理的播放结果：

- 单条 HLS/MP4：真实 URL + `#isVideo=true#` + 必要 Header。
- 多线路：`{urls,names,headers}`。
- 仅当结构化解析失败时才允许 `video://` / WebView 兜底。
- 未命中返回明确 toast，不伪造成功线路。

## 4. Provider 策略

### MissAV

当前实现使用“搜索驱动”链，不再猜详情 URL：

```text
/cn/search/<番号>
→ 只收集搜索页真实存在的详情
→ 默认 / 中文字幕 / 无码流出 / 无码版 / 流出版按真实 URL 标记
→ 详情页
→ packed player / source
→ master m3u8
→ RESOLUTION/BANDWIDTH 自动取最高画质
→ 必要时 WebView 读取动态详情
```

要点：

- 没有出现在搜索结果里的版本不展示。
- 优先复用海阔历史已成功的 `eval(...source...)` packed-player 链。
- 同时兼容 Dean Edwards `eval(function(p,a,c,k,e,d)...)` 结构；必要时从 seek UUID 构造 `surrit.com/<uuid>/playlist.m3u8` 仅作为后级兼容。
- master playlist 使用站点 Origin/Referer，最终播放继续携带必要 Header。
- 默认自动最高画质，不再提供无实际收益的手动画质切换。
- **截至 Stable 3.9.42 晋级时，MissAV 新链尚无新的明确海阔实机成功确认。用户明确要求晋级当前 Test5，因此 Stable 指针保留该实现，但这不等于“MissAV 已验证”。后续若失败，只发新 SDK Test 修 MissAV。**

### 123AV

双链：

```text
当前页面 player(JSON.parse(...))
        ↓失败
详情 / 搜索
→ page-video ID
→ /ajax/v/<id>/videos
→ watch[].url
→ player page
→ m3u8
        ↓失败
video://detail
```

- 支持 zh/cn/en 页面候选。
- 兼容 uncensored-leaked 详情候选。
- 多线路保持 URL/name/header 一一对应。
- `javplayer.me` 历史播放器需要对应 Referer。
- 禁止只嗅探网页导致命中广告流后伪装成正片。
- **2026-08-23 JavDB Test3 实机确认 123AV 可播放；后续维修 MissAV 时冻结 123AV 解析。**
- 123AV favicon 在实机为空，现改用仓库静态 `shared/jav-playback/assets/123av.svg`。

### Jable

- 详情：`/videos/<code>/`。
- 普通 HTML 直接提取 HLS。
- WebView 作为动态脚本兜底。
- master playlist 自动选择最高变体。
- 最终才回退原页 `video://`。
- **2026-08-23 JavDB Test3 实机确认 Jable 可播放；后续 Provider 维修默认冻结此链。**

## 5. 当前版本

### 1.0.0-test.1

通过 `eval()` 执行 IIFE 且把 `this` 当 global 导出时存在作用域风险。冻结，不原地修改。

### 1.0.0-test.2

- 改成显式 `var JAVPlayback = {...}`。
- Manager 加载后验证 `JAVPlayback.version`。
- 2026-08-23 JavDB 实机：123AV、Jable 可播放；MissAV 不可播放。
- 后续作为 123AV/Jable 已验证实现来源，不再整体重写。

### 1.0.0-test.3

- 基于 Test2 尝试恢复 MissAV 搜索 → 真实详情 → packed source，并增加 123AV 仓库图标。
- 发布后复核发现 IIFE 内 `eval(Test2)` 的导出可能只存在局部，与 JavDB Test2 的 JDB eval-scope 事故同类。
- **未要求用户实机浪费时间验证，直接冻结。**

### 1.0.0-test.4

- 顶层显式声明 `var JAVPlayback`。
- 加载 Test2 时把 `var JAVPlayback=` 转成对当前稳定导出变量的赋值，再叠加 MissAV 修复。
- 已完成 Manager 风格作用域 smoke test：加载后可读取 `version=1.0.0-test.4`，继承的 123AV/Jable 方法仍可调用。
- 123AV/Jable 解析逻辑保持 Test2 不变；123AV 改仓库静态图标。
- MissAV 改为搜索驱动真实详情 + packed source + 自动最高画质。

### Stable 指针（2026-08-23）

- 用户明确要求把 JavDB `3.9.42-test.5` 晋级 Stable `3.9.42`。
- 为避免正式版继续跟随未来 `test` 指针，`shared/jav-playback/channels.json` 的 `stable` 已固定到 immutable `releases/1.0.0-test.4/index.js` / Build10004。
- 当前 `test` 暂时也指向同一 release，状态为已晋级基线；下一次第三方播放维修必须创建新的 Test release，只移动 `test`。
- 这次“Stable 指针”表示版本治理已固定，不改变各 Provider 已验证状态：123AV/Jable 有实机成功证据，MissAV 新链仍待后续实机确认。

## 6. 新程序接入规则

1. 业务程序自己的 Stable/Test 恢复链先确认。
2. Test 中加载共享 Manager，并选择 SDK `test`。
3. Stable 只加载 SDK `stable` 或明确 immutable release。
4. 只传番号，不把业务程序详情模型泄漏给 Provider。
5. 实机逐站测试冷启动、第二次缓存、Header、最高画质、多线路与失败兜底。
6. 一个 Provider 已通过后，将其实现视为冻结基线；下一轮只修改失败 Provider。
7. 验证并明确晋级后再移动 Stable 指针。

## 7. 回归清单

- [x] Manager 可加载 SDK Test2，并在 JavDB 显示三个 Provider。
- [x] 123AV 实机可播放（2026-08-23 JavDB Test3）。
- [x] Jable 实机可播放（2026-08-23 JavDB Test3）。
- [x] SDK Test4 Manager 风格作用域 smoke test 可读取 version。
- [x] Stable 指针固定到 immutable SDK Test4，正式版不再跟随 test。
- [ ] Stable/海阔实机加载 SDK Test4 并通过 version 校验。
- [ ] 123AV 仓库静态图标正常显示。
- [ ] MissAV 只显示实际存在版本。
- [ ] MissAV 可播放并自动选择最高 HLS。
- [ ] 123AV 二次回归仍不误取广告流。
- [ ] Jable 二次回归仍正常。
- [ ] 任一 Provider 异常不影响业务程序其它功能。

## 8. 知识归属

这是跨 JavDB/JavBus/后续 JAV 程序复用的媒体 Provider 架构。JavDB 自身的接入版本和实机结果记录在 `apps/video/javdb/CHANGELOG.md`；Provider 的通用架构与版本治理以本文档和全局开发指南为长期依据。
