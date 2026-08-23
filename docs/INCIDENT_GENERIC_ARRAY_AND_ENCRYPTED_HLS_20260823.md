# 通用数组误选与加密 HLS 播放事故（2026-08-23）

## 1. 背景
汤头条 Test3 已经打通 API、加密签名、匿名会话和内容请求，实机能返回 49 条卡片，但出现三个具有跨程序复用价值的事故：

1. 通用递归“找最像内容的数组”误把 `banner/widget/ads` 当真实推荐，页面看似成功但业务语义完全错误。
2. 真实模型字段已经存在于 APK 时仍靠通用字段猜测，遗漏 `thumb_cover`，导致标题正常但全部灰封面。
3. 详情拿到 `source_*` 媒体 URL 后直接交播放器，但原 APP 自定义 DataSource 会先解密 M3U8 body；忽略这一层后，海阔本地代理有地址但 0 kb/s。

## 2. 固定结论：精确模型优先于通用递归
当 APK / 官方前端 / 已验证接口已经给出具体 DTO/Bean 结构时：

```text
精确字段/精确路径
> 已验证 Adapter
> 有约束的 fallback
> 通用递归扫描
```

禁止继续把“最大数组/评分最高数组”当正式业务数据源。特别是首页响应同时包含：

```text
banner
ads
widget
recommend
list
```

时，通用算法很容易把广告数组识别成主内容，形成最危险的“伪成功”。

正确做法：
- 先恢复真实响应模型。
- 为主链写专用 Adapter，例如 `data.list[].list`。
- 明确排除 `banner/ads/advert/widget`。
- 通用递归只能用于未知模块的诊断/fallback，不能覆盖已知 P0 主链。

## 3. 图片字段：源码真实字段优先
当列表标题/ID 正常但所有封面为空时，不要立即怀疑图片解密。先确认：

1. 原 App UI Adapter 实际传给 Glide/Coil/Picasso 的字段。
2. 该字段是绝对 URL、相对路径还是需要 CDN 拼接。
3. 只有 URL 已正确得到但实机仍加载失败，才继续进入 Header/Referer/图片加密/缓存诊断。

汤头条真实字段为 `ListLikeVideoBean.thumb_cover`；此前遗漏字段本身就足以造成全灰封面。

## 4. 加密 HLS：URL 可见不代表可以播放
若原 APP 有自定义 Player DataSource / Interceptor，必须恢复完整播放 Pipeline，而不是只找 `.m3u8` URL。

汤头条验证链：

```text
source_240 / source_480 / source_720 / source_1080
→ HTTP 获取 M3U8 body
→ 若 #EXTM3U：直接使用
→ 否则 player_cfg.dekey
→ HEX decode
→ IV = 前16字节
→ MD5 EVP 派生 AES Key
→ AES/CFB/NoPadding 解密
→ 得到真实 #EXTM3U
→ fixM3u8(remoteUrl, content) 修正 TS/KEY 相对路径
→ startProxyServer 返回本地播放 URL
→ 海阔播放器
```

因此播放器显示 `127.0.0.1` / `192.168.x.x` 本地代理地址本身不是故障；判断标准是代理是否输出合法 M3U8、是否产生码率、TS/KEY 是否可继续访问。

## 5. PlaybackAdapter 诊断要求
专用播放代理至少记录：
- 原始 source 是否存在，不记录完整敏感 Token。
- `dekey/refer/x_auth` 是否已取得，只记录布尔状态。
- 原 M3U8 是 plaintext 还是 AES-CFB 解密。
- 解密后是否以 `#EXTM3U` 开头。
- `fixM3u8` 后长度/嵌套 master 情况。
- 失败层级：取源 / Header / 拉索引 / 解密 / M3U8 格式 / TS/KEY。

## 6. URL 参数编码
通过 `hiker://page/...?...` 传递中文标题后，目标页不得假设 `getParam` 一定返回已解码文本。若看到 `%E7...` 出现在系统标题/播放器标题，应在统一参数 Adapter 中安全执行 `decodeURIComponent`，而不是每个页面分别修。

## 7. 发布规则
此类问题必须使用新 Test Build/Release/Bootstrap/Shell 缓存键，不原地覆盖旧 URL。真实设备截图优先于代码推断；只有推荐真实、图片真实、播放真实三条主链都通过实机回归后才允许晋级 Stable。
