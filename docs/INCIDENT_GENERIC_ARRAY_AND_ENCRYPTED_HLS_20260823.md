# 通用数组误选、加密图片与加密 HLS 播放事故（2026-08-23）

## 1. 背景
汤头条 Test3/Test4 已经打通 API、加密签名、匿名会话和内容请求，实机连续暴露了一组具有跨程序复用价值的事故：

1. 通用递归“找最像内容的数组”误把 `banner/widget/ads` 当真实推荐，页面看似成功但业务语义完全错误。
2. 真实模型字段已经存在于 APK 时仍靠通用字段猜测，遗漏 `thumb_cover`，导致标题正常但全部灰封面。
3. 详情拿到 `source_*` 媒体 URL 后直接交播放器，但原 APP 自定义 DataSource 会先解密 M3U8 body；忽略这一层后，海阔本地代理有地址但 0 kb/s。
4. 找到 `thumb_cover` 仍不等于图片链完成：原 APP 可能通过自定义 Glide/Coil ModelLoader 先解析 JSON 分辨率，再解密图片字节；把原字符串直接塞给海阔仍会灰图。
5. 海阔多线路播放返回严格 `JSON.stringify({urls,names,headers})` 时，部分运行链会把整个 JSON 当“未知链接”；播放协议必须按海阔已验证对象字面量格式或先使用单线路 `#isVideo=true#` 做隔离验证。
6. 非媒体首页接口（例如漫画 home）可能返回“分类配置”，不能因为存在数组就套 `movie_*` 内容卡；必须按真实 Bean/DTO 语义分流。
7. 诊断子页若使用错误的 `rule/ArticleListModel` 路由，普通文本或空 URL 可能被当 HTTP 地址并报 `Expected URL scheme http or https`；诊断信息应优先直接显示在当前设置页。

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

## 3. 图片链：字段正确之后还要恢复 ModelLoader / 解密器
当列表标题/ID 正常但所有封面为空时，排查顺序固定为：

1. 原 App UI Adapter 实际传给 Glide/Coil/Picasso 的字段。
2. 该字段是否本身是 JSON、多分辨率对象、绝对 URL 或相对路径。
3. 原 App 是否注册了自定义 ModelLoader / Decoder / OkHttp Interceptor。
4. URL 已正确得到但字节不是 JPEG/PNG/GIF/WEBP/BMP 时，再恢复对应图片解密器。
5. 海阔侧优先使用 `pic_url: <url>@js=...` 的 InputStream 图片解密能力，让 UI 仍使用标准图片组件，而不是先下载成临时文件。

汤头条已恢复的实际链：

```text
ListLikeVideoBean.thumb_cover
→ 若为 JSON：优先选择 720 / 720p / 360 / ori 等实际 URL
→ HTTP InputStream
→ 若已有 JPEG/PNG/GIF/WEBP/BMP magic：直接返回
→ legacy 分支：HEX + 固定图片 secret → AES/CFB/NoPadding
→ 新分支：AES/CBC/PKCS5Padding + 固定 Key/IV
→ ByteArrayInputStream
→ 海阔图片组件
```

因此“字段找到了”不能被当作“图片完成”。源码里存在自定义 GlideAppModule / ModelLoader 时必须继续追完整链。

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

## 5. 海阔播放协议：先单线路，再多线路
当媒体代理本身尚未实机验证时，不应同时引入“多线路 JSON 协议”这个第二变量。固定调试顺序：

```text
单一最高画质 URL + #isVideo=true#
→ 单独 1080P / 720P / 480P / 240P 按钮
→ 确认代理与解密真实可播
→ 再增加播放器内多线路切换
```

多线路必须使用目标海阔版本已验证的返回格式，例如对象字面量：

```text
{urls:[...],names:[...],headers:[...]}
```

不要默认 `JSON.stringify({urls:...,names:...,headers:...})` 在所有播放入口都会被识别；若实机出现“未知链接: {\"urls\":...}”，说明播放器前置识别器没有把该字符串当多线路协议。

## 6. 非视频域必须按业务语义建模
同一个大型 APP 中，`home` 不一定代表内容列表。例如汤头条 `/api/comic/home` 实机返回的是漫画分类/标签配置，而不是漫画作品。

正确链应是：

```text
comic/home → 分类 Bean
→ 分类导航
→ book/list_filter(page, sort, categories, type)
→ ComicListBean.data.list
→ 漫画详情/章节
```

禁止把分类 Bean 直接套 `movie_3`，否则会出现大面积空白图片卡 + 只有分类名的伪内容页。

## 7. PlaybackAdapter 诊断要求
专用播放代理至少记录：
- 原始 source 是否存在，不记录完整敏感 Token。
- `dekey/refer/x_auth` 是否已取得，只记录布尔状态。
- 原 M3U8 是 plaintext 还是 AES-CFB 解密。
- 解密后是否以 `#EXTM3U` 开头。
- `fixM3u8` 后长度/嵌套 master 情况。
- 失败层级：取源 / Header / 拉索引 / 解密 / M3U8 格式 / TS/KEY。

图片诊断至少记录：
- 选出的图片候选是否为 HTTP(S)。
- 输入/输出字节长度。
- `plain / legacy-aes-cfb / aes-cbc / raw-fallback` 模式。
- 不记录密钥、Token、Cookie。

## 8. 诊断 UI 不要反过来制造错误
设备调试页应优先把无敏感诊断字符串直接作为当前页 `long_text` 展示，并使用 `hiker://empty`。只有已经验证独立页面路由时才跳转诊断子页。

看到：

```text
ArticleListModel-HttpRequestError
Expected URL scheme 'http' or 'https' but no colon was found
```

时，应先检查诊断条目的 `url`/子规则是否把普通文本、空字符串或 `hiker://` 上下文误交给 HTTP ArticleListModel，而不是误判成远端业务 API 又失效。

## 9. URL 参数编码
通过 `hiker://page/...?...` 传递中文标题后，目标页不得假设 `getParam` 一定返回已解码文本。若看到 `%E7...` 出现在系统标题/播放器标题，应在统一参数 Adapter 中安全执行 `decodeURIComponent`，而不是每个页面分别修。

## 10. 发布规则
此类问题必须使用新 Test Build/Release/Bootstrap/Shell 缓存键，不原地覆盖旧 URL。真实设备截图优先于代码推断；只有推荐真实、图片真实、播放真实三条主链都通过实机回归后才允许晋级 Stable。
