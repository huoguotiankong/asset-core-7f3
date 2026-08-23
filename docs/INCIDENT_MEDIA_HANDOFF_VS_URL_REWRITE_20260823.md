# 海阔媒体交付：可访问 URL 不等于可稳定播放 — 2026-08-23

## 事故来源
汤头条 Test13–Test14 实机。

## 现象
- 业务接口能够返回看似有效的 MP4/HLS URL，但海阔播放器出现 `0 kb/s / 00:00` 或“播放异常”。
- 参考规则仅对 `preview_video` 做 `play host → long host`、删除 `seconds=30` 后直接交播放器，在当前 CDN/海阔环境下仍失败。
- 同一项目内已经实机稳定的黄豆短剧、麻豆AI、JAV Playback 并不是简单返回裸 URL。

## 已验证对照
### 黄豆短剧
先用真实会话 Header 探 HLS；最终播放器 URL 显式携带：
`User-Agent / Referer / Cookie`。

### 麻豆AI
HLS 优先 `cacheM3u8(url, headers, name)`；失败后才返回带 Header 的代理/直连，并附 `#isVideo=true#`。

### Shared JAV Playback
统一使用：
`url#isVideo=true#;{Referer@...&&Origin@...&&User-Agent@...}`，必要时先解析 master/最高画质。

## 根因结论
**媒体 URL 在 fetch/probe 层可访问，不代表海阔播放器后续对 m3u8、key、ts/mp4 的请求会自动继承正确 Header、Cookie、Referer、Origin 或鉴权字段。**

因此“URL 改写成功”“HTTP 200”“浏览器能打开”都不能单独作为播放完成标准。

## 固定规则
1. 对 HLS/MP4 必须区分“媒体解析”和“播放器交付”两层。
2. 对需要 Header 的媒体，最终返回必须显式携带播放器 Header；不要只在预检 fetch 中带 Header。
3. HLS 可优先尝试 `cacheM3u8` / 项目自有代理，确保后续分片地址与 Header 链稳定。
4. `#isVideo=true#` 只负责媒体类型提示，不替代 Referer/Cookie/Origin/鉴权。
5. 用户提供的现成规则可作为候选实现，但必须在当前海阔版本和当前 CDN 实机复测；不能因为旧规则曾可播就直接认定 URL 改写仍有效。
6. 收费/试看内容的 URL 改写不能用来绕过业务授权；播放兼容仅允许作用于已确认免费或已购买内容。
7. 若某条播放链已经实机证明能完成“真实时长 + 连续播放”，维修其它入口时应复用其交付层，不要重新发明裸 URL 方案。

## 汤头条 Test15 落地
- 短视频/PWA 候选：探测 → HLS 优先 `cacheM3u8` → 显式 Player Headers → 原始候选回退。
- 普通 App 长视频：继续使用 Test10 已实机验证的解密代理与时长完整性校验。
- 参考 `long.` 改写降级为候选，不再作为主播放架构。

## 回归门禁
播放完成必须由海阔实机确认：
- 有真实码率；
- 总时长与业务元数据合理一致；
- 进度持续推进；
- HLS 子分片/Key 不出现权限错误；
- 不因进入原生播放器而意外生成错误播放列表上下文。
