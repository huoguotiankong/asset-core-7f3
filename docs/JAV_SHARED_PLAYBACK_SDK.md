# JAV 类小程序共享外部播放 SDK

版本：1.0  
建立：2026-08-22  
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

固定 Manager：

`shared/jav-playback/manager.js`

通道元数据：

`shared/jav-playback/channels.json`

Release：

`shared/jav-playback/releases/<version>/index.js`

硬规则：

- Stable 业务程序绑定已实机验证的 Stable SDK release。
- Provider 失效先发新的 SDK Test release，不原地覆盖旧 Stable SDK。
- 同 URL / 同版本不得依靠覆盖修缓存问题。
- SDK 失败必须只影响第三方播放，不得拖垮业务小程序详情、搜索、官方播放、磁链、收藏等主链。
- 每个 Provider 独立解析；新增站点不修改其它 Provider。

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

- 先探测番号实际存在的版本，未上传的版本不展示。
- 当前候选：默认视频、中文字幕、无码流出、无码版、流出版。
- 页面优先取 packed/source HLS，普通 HTML m3u8 次之，WebView 最后兜底。
- 如果得到 master playlist，自动按 RESOLUTION/BANDWIDTH 选最高画质。
- 默认不提供手动画质切换，避免额外等待和无效交互。

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

### Jable

- 详情：`/videos/<code>/`。
- 普通 HTML 直接提取 HLS。
- WebView 作为动态脚本兜底。
- master playlist 自动选择最高变体。
- 最终才回退原页 `video://`。

## 5. 当前版本

### 1.0.0-test.1

发布前发现：通过 `eval()` 执行 IIFE 且把 `this` 当 global 导出时，海阔 JS 环境中的 `this` 可能不是预期全局对象，Manager 后续直接读取 `JAVPlayback` 存在作用域风险。

该版本冻结，不原地修改。

### 1.0.0-test.2

- 改成显式 `var JAVPlayback = {...}`。
- Manager 加载后验证 `JAVPlayback.version`。
- Provider：MissAV / 123AV / Jable。
- 当前状态：静态/语法门禁通过，等待海阔实机播放回归。

## 6. 新程序接入规则

1. 业务程序自己的 Stable/Test 恢复链先确认。
2. Test 中加载共享 Manager。
3. 选择 SDK Test channel 或明确版本。
4. 只传番号，不把业务程序详情模型泄漏给 Provider。
5. 实机逐站测试冷启动、第二次缓存、Header、最高画质、多线路与失败兜底。
6. 验证后再决定 SDK Stable；业务程序 Stable 再绑定 Stable SDK。

## 7. 回归清单

- [ ] Manager 可加载当前 Test release。
- [ ] SDK version 校验通过。
- [ ] MissAV 只显示实际存在版本。
- [ ] MissAV 自动选择最高 HLS。
- [ ] 123AV 不误取广告流。
- [ ] 123AV 单线路/多线路均可播放。
- [ ] Jable 普通直解可播放。
- [ ] Jable WebView 兜底可播放。
- [ ] 任一 Provider 异常不影响业务程序其它功能。
- [ ] 新 SDK release 不覆盖旧 Stable 文件。

## 8. 知识归属

这是跨 JavDB/JavBus/后续 JAV 程序复用的媒体 Provider 架构。JavDB 自身的接入版本和实机结果继续记录在 `apps/video/javdb/CHANGELOG.md`；Provider 的通用架构与版本治理以本文档和全局开发指南为长期依据。
