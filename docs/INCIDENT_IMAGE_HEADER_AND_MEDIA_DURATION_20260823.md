# 图片 Header 丢失与媒体时长伪成功事故（2026-08-23）

## 背景
汤头条 Test8 实机同时暴露两个可跨程序复用的伪成功：

1. 图片字段已经解析到标准 HTTPS JPEG，代码因为扩展名正常而直接返回裸 URL，但海阔实机全部灰图。
2. 长视频详情标称 19:34，某 `source_240` 的 M3U8 实际 `#EXTINF` 总时长只有 57 秒；旧逻辑只过滤 `<4s` 的维护片，因此把几十秒试看/占位源错误认定为完整视频。

## 1. 标准图片扩展名不等于可以丢 Header
图片显示合同必须同时考虑：

```text
URL
+ User-Agent
+ Referer / Origin（站点需要时）
+ Cookie / Token（站点需要时）
+ 是否需要字节解密
```

即使 URL 以 `.jpg/.jpeg/.png/.webp` 结尾，也不能因为“看起来是公开图片”就自动退化成裸 URL。

海阔优先级：

```text
标准明文图片 + 需要 Header
→ url@headers={...}

需要 InputStream 解密/转换
→ $(url, headers).image(function(){ return InputStream; })
```

只有已经实机验证“裸 URL 可加载”时，才允许直接返回 URL。

诊断至少记录：
- host；
- policy：`bare / header-public-image / decrypt-helper`；
- 是否附加 Header；
- 不记录 Cookie/Token 明文。

## 2. 能播放几十秒也不等于真实完整视频
播放器成功打开、M3U8 合法、有码率，都只证明技术链成立，不证明业务内容完整。

播放源预检应同时使用：

```text
详情标称时长 expectedDuration
+ M3U8 #EXTINF 实际总时长 actualDuration
+ actual / expected 比率
+ 业务画面/提示语（适用时）
```

建议规则：
- `<4s`：高度疑似维护/错误占位；
- 长视频（例如 expected >= 120s）实际时长远低于标称值时，视为试看/占位并继续回退；
- 短视频不能套用长视频阈值，60 秒视频实际 57 秒通常是正常误差；
- master M3U8 无 `#EXTINF` 时继续检查 child playlist；
- 只有所有候选源都不完整/失败时才向用户提示无完整线路。

诊断推荐：

```json
{
  "name":"240P",
  "duration":57,
  "expected":1174,
  "ratio":0.049,
  "suspicious":true
}
```

## 3. Fallback 不能退回通用 URL 扫描
当模型存在 `source_240/480/720/1080/source_origin/preview_video` 时，回退只在这些有明确语义的字段内进行。

推荐：

```text
用户偏好
→ 240P
→ 480P
→ 720P
→ 1080P
→ source_origin（仅实际媒体 URL）
→ preview_video（最后兜底）
```

`source_origin` / `preview_video` 必须先验证像真实媒体 URL，不能把页面地址、统计地址、广告地址混入播放器。

## 4. 短视频与普通详情应使用不同交互
如果产品事实已经证明短视频列表本身携带完整播放字段，并且用户任务是快速观看，优先：

```text
短视频卡片 → 直接播放
```

而不是：

```text
短视频卡片 → 普通详情 → 再点播放
```

但短视频直接播放仍应复用同一个 PlaybackAdapter、Header、解密和诊断链，禁止复制第二套播放器逻辑。

## 5. 固定回归项
涉及图片/媒体改动后至少测试：
- 一张标准 CDN JPEG 是否需要 Header；
- 一张加密/非标准图片是否仍能走 ImageAdapter；
- 1 分钟短视频；
- 5 分钟以上视频；
- 20 分钟以上视频；
- 某一画质是试看、其它画质完整的混合情况；
- 所有画质都无完整源时是否明确失败而非伪播放。
