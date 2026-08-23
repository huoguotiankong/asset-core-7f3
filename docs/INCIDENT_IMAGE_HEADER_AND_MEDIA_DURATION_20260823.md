# 图片 Header 丢失与媒体时长伪成功事故（2026-08-23）

## 背景
汤头条 Test8-Test10 实机连续暴露多组可跨程序复用的伪成功：

1. 图片字段已经解析到标准 HTTPS JPEG，代码因为扩展名正常而直接返回裸 URL，但海阔实机全部灰图。
2. 长视频详情标称 19:34，某 `source_240` 的 M3U8 实际 `#EXTINF` 总时长只有 57 秒；旧逻辑只过滤 `<4s` 的维护片，因此把几十秒试看/占位源错误认定为完整视频。
3. 后续通过“替换导出 `imageUrl`”修图片，实机诊断仍走旧逻辑；原因是已有 `item()/detailItem()` 已经闭包绑定旧私有函数，导出对象同名属性被替换不会改写闭包。
4. 播放器只按 `.m3u8` 后缀判断 HLS，导致 `https://cdn/https://origin/...` 这类无后缀包装 HLS 被当成普通直链，完全绕过 M3U8 解密与时长检查。

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

## 6. 导出函数 Patch 不会改写已有词法闭包
JavaScript 模块如果这样定义：

```js
function imageUrl(){ /* old */ }
function item(x){ return { cover: imageUrl(x.thumb) }; }
return { imageUrl:imageUrl, item:item };
```

后续执行：

```js
module.imageUrl = newImageUrl;
```

**不会**让 `item()` 自动调用 `newImageUrl()`。`item()` 在创建时仍引用模块词法作用域里的旧 `imageUrl`。

因此这类 Patch 只有在下列条件成立时才安全：
- 原函数内部每次通过对象属性动态调用，例如 `this.imageUrl()`；或
- 模块明确把依赖作为参数/Provider 注入；或
- Patch 同时重建所有依赖旧私有函数的上层函数。

否则必须：

```text
重建模块
或
在模块构造前注入依赖
```

不要因为导出的 `module.imageUrl` 已经变了，就推断所有页面/Adapter 都已经使用新实现。必须用实机诊断验证真正执行路径。

## 7. 媒体类型不能只靠 URL 扩展名判断
APP/服务端常见媒体地址可能是：
- 无 `.m3u8` 后缀的签名 HLS；
- CDN 网关/代理包装地址；
- `https://proxy-host/https://origin-host/path...` 形式的嵌套绝对 URL；
- Content-Type 为 `application/vnd.apple.mpegurl`、`application/x-mpegURL`、`text/plain` 或 `application/octet-stream` 的动态索引；
- URL 看起来像文件，但响应正文实际是加密后的 M3U8 文本。

如果 APK 已确认是把 `source_*` 原样交给播放器 DataSource，更不能人为增加“只有 `.m3u8` 才走 HLS”的假约束。

推荐探测顺序：

```text
业务字段语义（source_*）
→ HEAD/onlyHeaders：HTTP status + Content-Type + Content-Length
→ URL 包装形态 / 重定向
→ 受约束拉取正文
→ #EXTM3U 明文判断
→ 已知协议密文解密
→ MP4/WebM 等真实 video Content-Type
→ 未知则失败并记录诊断
```

对包装 URL 可在协议事实支持时同时尝试：

```text
服务器下发外层 URL
+ 内嵌原始绝对 URL
```

但必须记录实际采用的 `variant`，例如 `api-source / inner-source`，禁止静默换源后无法回溯。

播放诊断建议额外记录：

```text
variant
kind = hls|direct
HTTP status
Content-Type
Content-Length
M3U8 mode = plain|aes-cfb|master
actualDuration / expectedDuration / ratio
```
