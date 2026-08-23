# 通用数组误选、加密图片与加密 HLS 播放事故（2026-08-23）

## 1. 背景
汤头条 Test3-Test8 已经打通 API、加密签名、匿名会话和内容请求，实机连续暴露了一组具有跨程序复用价值的事故：

1. 通用递归“找最像内容的数组”误把 `banner/widget/ads` 当真实推荐，页面看似成功但业务语义完全错误。
2. 真实模型字段已经存在于 APK 时仍靠通用字段猜测，遗漏 `thumb_cover`，导致标题正常但全部灰封面。
3. 详情拿到 `source_*` 媒体 URL 后直接交播放器，但原 APP 自定义 DataSource 会先解密 M3U8 body；忽略这一层后，海阔本地代理有地址但 0 kb/s。
4. 找到 `thumb_cover` 仍不等于图片链完成：原 APP 可能通过自定义 Glide/Coil ModelLoader 先解析 JSON 分辨率，再解密图片字节；把原字符串直接塞给海阔仍会灰图。
5. 海阔多线路播放返回严格 `JSON.stringify({urls,names,headers})` 时，部分运行链会把整个 JSON 当“未知链接”；播放协议必须按海阔已验证对象字面量格式或先使用单线路 `#isVideo=true#` 做隔离验证。
6. 非媒体首页接口（例如漫画 home）可能返回“分类配置”，不能因为存在数组就套 `movie_*` 内容卡；必须按真实 Bean/DTO 语义分流。
7. 诊断子页若使用错误的 `rule/ArticleListModel` 路由，普通文本或空 URL 可能被当 HTTP 地址并报 `Expected URL scheme http or https`；诊断信息应优先直接显示在当前设置页。
8. 手工拼 `<url>@js=require(...)` 可能在图片线程里静默不执行模块加载，表现为 URL 已正确但全灰图，且连图片诊断都没有生成。图片解密应优先使用海阔官方 `$(url, headers).image(...)` 生成入口，并在图片回调内使用 `$.require(...)`。
9. “播放器能播放”也不等于已经拿到真实业务视频。服务端可能返回一个可正常播放、但只有数秒的“版本停止维护/请升级”占位片。必须同时校验启动版本、实际 M3U8 时长和内容语义。
10. 新版本逻辑若依赖启动迁移，不能只在“没有 Token”时执行。旧版本遗留 Token 可能使新 Build 永远跳过启动迁移；需要独立 migration gate/version flag。
11. **详情页存在多个真实媒体 URL 也会制造播放器污染。** 海阔会把连续同类 `col_type` 识别为连续选集/章节；Hero、立即播放、各清晰度按钮都返回媒体时，会把一个单视频详情页错误组织成“上一个 / 下一个 / 列表”的播放列表上下文。
12. **同一视频不同 source 可能一部分真实、一部分占位。** 不能因为某个 240P/720P 能播就认定四档都正确，也不能因为某一档是维护片就否定整个播放链；需要 source 级预检和自动回退。
13. **普通公开图片与加密图片不能一刀切。** 已明确是公开 CDN 的标准 JPEG/PNG 时继续强制走解密 helper，反而会增加线程、兼容和缓存变量；应先按 host/扩展名/字节特征分流。

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

时，通用算法很容易把广告数组识别成主内容，形成最危险的“伪成功”。正确做法：
- 先恢复真实响应模型。
- 为主链写专用 Adapter，例如 `data.list[].list`。
- 明确排除 `banner/ads/advert/widget`。
- 通用递归只能用于未知模块的诊断/fallback，不能覆盖已知 P0 主链。

## 3. 图片链：字段正确之后还要恢复 ModelLoader / 解密器
当列表标题/ID 正常但封面为空时，排查顺序固定为：

1. 原 App UI Adapter 实际传给 Glide/Coil/Picasso 的字段。
2. 该字段是否本身是 JSON、多分辨率对象、绝对 URL 或相对路径。
3. 原 App 是否注册了自定义 ModelLoader / Decoder / OkHttp Interceptor。
4. URL 已正确得到后，先判断它是否是公开标准图片；只有字节不是 JPEG/PNG/GIF/WEBP/BMP 时，再进入图片解密器。
5. 海阔侧需要图片处理时优先使用官方 `$(url, headers).image(...)`；图片回调内调用远程模块使用 `$.require(...)`，不要手拼 `@js=require(...)`。
6. 若封面仍灰且图片回调诊断完全不存在，优先判断“图片 JS 根本未执行”，而不是继续修改 AES 算法。

汤头条验证出的图片链：

```text
ListLikeVideoBean.thumb_cover
→ 若为 JSON：选择 720 / 720p / 360 / ori 等实际 URL
→ 若为已知公开 CDN + 标准图片扩展：直接显示
→ 否则 $(url, headers).image(...)
→ 图片回调 $.require(ImageAdapter)
→ HTTP InputStream
→ 已有 JPEG/PNG/GIF/WEBP/BMP magic：直接返回
→ legacy：HEX + 固定图片 secret → AES/CFB/NoPadding
→ 新分支：AES/CBC/PKCS5Padding + 固定 Key/IV
→ ByteArrayInputStream
→ 海阔图片组件
```

因此“字段找到了”不能被当作“图片完成”，但“存在解密器”也不能变成“所有图片都强制解密”。

## 4. 加密 HLS：URL 可见、甚至能播放，都不代表业务播放完成
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

播放器显示 `127.0.0.1` / `192.168.x.x` 本地代理地址本身不是故障；判断标准是代理是否输出合法 M3U8、是否产生码率、TS/KEY 是否可继续访问。

另外必须增加**业务占位片检测**：
- 统计 M3U8 `#EXTINF` 总时长；极短（例如 <4 秒）标记 `suspiciousShort=true`。
- master M3U8 本身没有 `#EXTINF` 时，至少继续检查一层真实 child playlist，不能把 master 的 0 秒误判成可用。
- 单视频有多档 source 时，应先检查用户偏好，再按已知稳定顺序尝试其它画质；某一档失败/占位不应立刻结束整个播放。
- 只有所有候选 source 都失败或都是占位片时，才向用户明确提示，不要把数秒维护片送进播放器。
- 启动配置若返回 `versionMsg.version`，应比较当前 `system_version`；但若同一版本已经同时返回真实长视频和维护片，就必须转为**逐 source 诊断**，不能继续把所有问题归因于版本号。

## 5. 海阔播放协议：先单线路，再多线路
当媒体代理本身尚未实机验证时，不应同时引入“多线路 JSON 协议”这个第二变量。固定调试顺序：

```text
单一默认画质 URL + #isVideo=true#
→ 验证真实可播
→ 再考虑播放器内多线路
```

多线路必须使用目标海阔版本已验证的返回格式，例如：

```text
{urls:[...],names:[...],headers:[...]}
```

不要默认 `JSON.stringify({urls:...,names:...,headers:...})` 在所有播放入口都会被识别；若实机出现“未知链接: {\"urls\":...}”，说明播放器前置识别器没有把该字符串当多线路协议。

## 6. 单视频详情页：只保留一个真实媒体动作
海阔规则会把连续的同一 `col_type` 识别为连续选集/章节。因此**并非只有真正的电视剧章节页才会出现播放列表**；如果普通视频详情页多个连续条目都返回媒体 URL，也可能被原生播放器组织成“上一个 / 下一个 / 列表”。

固定规则：

```text
Hero / 封面卡 → 只展示，不返回媒体
清晰度按钮 → 只修改 state / myVar，不返回媒体
收藏 / 评论等 → 非媒体动作
唯一“立即播放”按钮 → 唯一真实媒体 URL
```

只有产品本身确实是连续剧/章节列表时，才允许多个同级条目共同构成真实播放列表。清晰度不是章节，不得用多个媒体 item 模拟清晰度。

同时必须区分两类 UI：
- **页面派生播放列表语义**：上一个/下一个/列表等，应该通过页面 item 结构修掉。
- **海阔原生播放器通用操作面板**：收藏、下载、投屏、嗅探等可能是播放器自身 UI，不应错误承诺小程序能通过业务页面全部隐藏。若剩余的是原生面板，应单独按海阔播放器能力处理。

## 7. 非视频域必须按业务语义建模
同一个大型 APP 中，`home` 不一定代表内容列表。例如汤头条 `/api/comic/home` 实机返回的是漫画分类/标签配置，而不是漫画作品。

如果服务端直接下发动态合同：

```text
current / id / name / show_style / type / api_list / params_list
```

就应优先执行每个分类自己的 `api_list + params_list`，而不是继续硬编码某个猜测的列表 API。动态入口本身就是客户端路由合同。

同样，HTTP/code 200 也不代表 Adapter 正确：排行榜实机 `array[9]` 返回 `nickname/owner_uuid/videos_count/followed_count/...` 时，真实语义是创作者排行；用视频 Adapter 得到 0 条属于**模型错误导致的伪空列表**，不是接口空数据。

## 8. PlaybackAdapter 诊断要求
专用播放代理至少记录：
- 原始 source 是否存在，不记录完整敏感 Token。
- `dekey/refer/x_auth` 是否已取得，只记录布尔状态。
- 原 M3U8 是 plaintext 还是 AES-CFB 解密。
- 解密后是否以 `#EXTM3U` 开头。
- `fixM3u8` 后长度/嵌套 master 情况。
- M3U8 `#EXTINF` 总时长，以及极短占位片标记。
- 多 source 时记录 preferred / chosen，以及每一档 `ok/duration/mode/short/error`。
- 失败层级：取源 / Header / 拉索引 / 解密 / M3U8 格式 / TS/KEY / 业务占位。

图片诊断至少记录：
- 选出的图片候选是否为 HTTP(S)。
- 当前 policy 是 direct public image 还是 image helper/decrypt。
- helper 是否生成、图片回调是否实际执行。
- 输入/输出字节长度。
- `plain / legacy-aes-cfb / aes-cbc / raw-fallback` 模式。
- 不记录密钥、Token、Cookie。

## 9. 启动迁移必须独立于旧 Token
版本、域名、播放器配置、设备协议等升级若需要“重新启动握手”，不能把条件写成：

```text
if (!token) bootstrap()
```

因为旧版本 Token 仍存在时，新 Build 的迁移逻辑会永远不执行。应使用独立迁移标记，例如：

```text
if (migration_version < required_version) bootstrapMigration()
```

或者在新 Release 增加独立 Protocol Gate。发布后才发现此类问题时，不允许原地覆盖同 Build；继续派生更高 Build，并保留中间版本用于回退。

## 10. 诊断 UI 不要反过来制造错误
设备调试页应优先把无敏感诊断字符串直接作为当前页 `long_text` 展示，并使用 `hiker://empty`。只有已经验证独立页面路由时才跳转诊断子页。

看到：

```text
ArticleListModel-HttpRequestError
Expected URL scheme 'http' or 'https' but no colon was found
```

时，应先检查诊断条目的 `url`/子规则是否把普通文本、空字符串或 `hiker://` 上下文误交给 HTTP ArticleListModel，而不是误判成远端业务 API 又失效。

## 11. URL 参数编码
通过 `hiker://page/...?...` 传递中文标题后，目标页不得假设 `getParam` 一定返回已解码文本。若看到 `%E7...` 出现在系统标题/播放器标题，应在统一参数 Adapter 中安全执行 `decodeURIComponent`，而不是每个页面分别修。

## 12. 发布规则
此类问题必须使用新 Test Build/Release/Bootstrap/Shell 缓存键，不原地覆盖旧 URL。真实设备截图优先于代码推断；只有推荐真实、图片真实、播放真实三条主链都通过实机回归后才允许晋级 Stable。
