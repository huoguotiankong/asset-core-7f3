# Signed / Time-Limited HLS 与 cacheM3u8 自动换链 Seek 卡死事故（2026-09-22）

状态：Test 实机确认 / 跨视频程序适用 / 后续继续验证。

## 1. 现象

JavDB v3 VIP 播放优化过程中出现两阶段回归：

1. 点击播放时同步 `cacheM3u8`：拖动略有改善，但播放页面进入和正式起播明显变慢。
2. 改为页面渲染后后台 `cacheM3u8`，再通过 `updateItem` 将播放行无感换为本地 m3u8：页面进入恢复很快，但用户拖动进度条后可能长时间卡住，甚至一直无法继续播放。

因此“建立本地 m3u8 索引”不能直接等价为“Seek 一定更快”。

## 2. 当前根因判断

对带签名、Token、短期 CDN 参数或其它时效约束的 HLS：

```text
远端 m3u8
→ cacheM3u8 提前解析/缓存
→ 本地索引固定引用当时的子 playlist / segment URL
→ 播放继续一段时间或 Seek 到远处
→ 目标分片签名/地址/请求上下文已不再有效
→ 播放器反复等待目标分片
```

具体是否为签名过期、Header/Cookie/Referer 子请求丢失、CDN Range/分片策略或播放器行为，仍需抓实际 playlist 与分片请求确认；在没有网络证据前不得把其中任一项写成唯一根因。

## 3. 固定工程规则

- `cacheM3u8` 主要用于索引缓存/一次性访问场景，**不得默认当作 Seek 加速器**。
- 热路径禁止为了“流畅拖动”同步缓存完整 HLS 索引，避免起播性能回归。
- 对疑似签名/时效 HLS，禁止“后台 cacheM3u8 成功后自动 updateItem 换掉正在给用户使用的正常播放线路”。
- 正常链优先保留原站实时 HLS URL、Headers、多线路数组与请求上下文。
- 需要诊断本地索引时，应作为显式备用动作，由用户手动触发，不得无感替换默认线路。
- 对时效媒体可在 Test 使用 `#noPre#` 禁止海阔提前预加载/预解析，但是否长期保留必须由实机 A/B 验证。

## 4. 正确排查顺序

当“首播正常、Seek 卡死/极慢”时，优先比较：

```text
master playlist
→ media playlist
→ EXTINF / TARGETDURATION / MAP / KEY / BYTERANGE
→ Seek 目标 segment URL
→ segment HTTP 状态与响应时间
→ master/media/segment Headers
→ Cookie / Referer / Origin / Authorization
→ URL 签名有效期
→ CDN/Range 行为
→ 海阔播放器对子请求 Header 的实际继承
```

先确认目标分片为什么拉不回来，再决定是刷新 playlist、补 Header、保持动态 URL、选择不同 rendition，还是需要本地代理/重写；禁止继续盲叠缓存层。

## 5. JavDB 对应版本

- `3.9.48-test.1`：点击时同步 cacheM3u8；Seek 略改善，但页面/起播变慢。
- `3.9.49-test.1`：扁平 Runtime 后页面变快；后台 cacheM3u8 + updateItem 自动换链导致 Seek 可长期卡死。
- `3.9.50-test.1`：撤销后台缓存自动换链；正常 VIP HLS 改实时直链 + `#noPre#`；原始线路与本地索引仅保留手动 A/B。

Stable 未因该实验改变。
