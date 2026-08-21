# 海阔小程序样本架构索引

日期：2026-08-21  
最近复核：2026-08-21（新增模板/免嗅/工具样本）  
性质：研究档案 / 非启动必读 / 结论已提炼进 `HIKER_APP_DEVELOPMENT_GUIDE.md`

> 本文件记录项目来源中现有 `.hk小程序/.hkzip` 样本的持续扫描结果。它不是第四份启动文档；新对话仍按三份主文档恢复。需要追溯某种架构、UI、播放、图片解密、网盘或开发工具实现的来源时再查本文件。

## 1. 扫描原则

- 学架构和经过验证的能力，不复制整份 God Object。
- 样本代码只证明“某种写法在该样本存在”，不自动等于当前海阔最佳实践。
- 与当前官方开发手册冲突时，以当前官方能力 + 本项目实机结果为准。
- 协议、密钥、域名、接口都可能过期；只沉淀模式，不把旧常量当长期真理。
- 大型依赖、Java 反射、DEX/SO、QuickJS、PrivateJS 只作为可选扩展，不作为普通小程序默认底座。
- 开发工具中的“自动匹配/自动生成”优先用于 Dev/Test，正式 Stable 应冻结已经确认的 Parser/Adapter。

## 2. 样本能力索引

### Hiker Gallery

定位：海阔原生组件样式教材。  
重点：`movie_* / pic_* / icon_* / card_pic_* / text_* / rich_text / flex_button / scroll_button / input / x5_webview_single` 的组合方式。  
长期结论：UI 设计应先做“内容类型 → 组件映射”，不要只会 `text_center_1 + blank_block`。

### 初学者写源工具

定位：规则编辑、动态分类、输入和配置交互。  
重点：`input`、`flex_button`、`scroll_button`、动态 `updateItem/addItemAfter`、工具型页面。  
长期结论：工具页也需要信息架构，编辑区、预览区、动作区要隔离。

### 模板·Q

定位：HTML 模板识别 / 自动 Parser 选择开发工具。  
重点：`Mapping` 中维护页面特征 keys；根据 HTML 是否包含 `stui-* / myui-* / module-* / fed-*` 等特征筛出候选模板；逐个加载子页面 Parser，成功即停止；另有动态分类生成器。  
长期结论：可建立“HTML Signature → Candidate Parser → Try → Lock”开发工具，加速常见影视模板适配；但正式 Stable 应锁定确认后的 Parser，不应每次运行都动态猜模板。

### DR模板

定位：综合写源模板 / 动态分类 / 多层播放解析工具。  
重点：直链判断、自动模板、动态分类、`lazyParse` 通用解析、第三方 `aytmParse`、`video://`、`webRule://`、`x5Rule://`、可选 `cacheM3u8` 等。  
长期结论：播放能力必须按“结构化免嗅 → 委托解析 → 网页嗅探”分层，不要把所有能播方法混成一个 lazyRule；`webRule/x5Rule/video://` 本质属于嗅探兜底。

### 获取Favicon·α

定位：多策略 Favicon 发现工具。  
重点：站点 `/favicon.ico` 验证、多 favicon API 轮询、动态 `updateItem/addItemAfter` 显示候选图标。  
长期结论：第三方 favicon API 适合开发时发现，不适合作为正式唯一图标源；确认后应固化到项目 assets，并提供 fallback。

### JavDB2

定位：Page Module 中型应用。  
重点：多个内嵌页面、动态搜索、本地收藏、登录 WebView、通用列表/详情框架。  
长期结论：中型程序优先拆 Page Module；搜索、收藏、登录不要塞进首页 God Object。

### 网飞猫APP

定位：APP/API Client。  
重点：动态域名发现、DoH/TXT、Token、HMAC、AES-CBC、游标分页、统一请求入口。  
长期结论：站点协议必须集中在 Protocol/API Client；页面不直接承担签名和解密。

### 瓜子影视

定位：薄规则 + 私有/原生扩展。  
重点：PrivateJS、hikerPop、Android/Java UI 能力。  
长期结论：官方 JS API > 普通 JS > 原生/PrivateJS；Native Extension 只做明确缺口，不能成为默认依赖。

### 青豆剧场

定位：大型视频聚合平台。  
重点：Provider/Adapter、QuickJS/DRPY/CAT Runtime、并发聚合、多网盘、弹幕、解析器、TMDB/豆瓣元数据、插件管理、渐进式详情；还覆盖 `startProxyServer`、M3U8 清理/代理、网页嗅探等复杂媒体能力。  
长期结论：大型聚合应有 Provider SDK、Runtime、缓存和管理层，但普通程序不要照搬 4MB 级全家桶。

### 聚阅

定位：薄 Shell + 通用 Source SDK + Provider Manager。  
重点：主页/搜索/二级/解析合约、Provider 私有状态、并发搜索、源管理、导入更新。  
长期结论：多源阅读/漫画最适合“框架负责 UI/分页/管理，Provider 只实现数据合约”。

### dm盒子

定位：媒体解析/弹幕/聚合工具平台。  
重点：`video://`、`webRule/x5Rule`、`cacheM3u8`、多线路、字幕、弹幕、解析器和动态 UI。  
长期结论：播放应设计成分层 Playback Pipeline，不要把直链、嗅探、弹幕和解析全部写进一个 lazyRule。

### R星精选

定位：多内容 Decode/ImageAdapter 样本。  
重点：Base64/反转/JSON 解码、AES-ECB、图片 InputStream 解密、前段 XOR、`$().image()`、`pics://`、多媒体线路。  
长期结论：图片处理要有 ImageAdapter；先判断资源类型/魔数，再按协议解密并返回 InputStream。

### 摸鱼日报

定位：加密 API + 加密图片流样本。  
重点：请求数据加密/签名、CryptoJS 响应解密、`crypto-java.js`、InputStream → bytes/Base64 → AES → InputStream 的图片解密链、较丰富 `card_pic_*`/内容页。  
长期结论：图片流解密和业务 JSON 解密是两条不同链；Crypto Runtime 要复用，ImageAdapter 单独承担 Stream 变换。

### 哔咔漫画

定位：完整漫画产品。  
重点：详情、章节、评论/楼中楼、推荐、下载、`pics://` 阅读。  
长期结论：章节图片获取函数应被阅读和下载共用；Community 与 Content Provider 分层。

### 阅漫君 / 阅动漫

定位：漫画框架 + 图片加密处理。  
重点：动态分类、详情模板、AES/3DES InputStream 解密、章节和配置页。  
长期结论：复杂解密放独立子页面/模块；Reader 只消费标准图片列表。

### 哔哩.cy

定位：社区型视频客户端。  
重点：视频详情、UP 主、评论、订阅/关注/收藏/历史/动态/文章、原生卡片和动作入口。  
长期结论：详情页应是“内容 Hero + 主动作 + 业务 Tabs + 社区/相关推荐”，而不是技术字段堆叠。

### 新片场

定位：创作者视频客户端。  
重点：`pic_1_full` Hero、简介/评论切换、点赞收藏分享下载、标签、作者、相关推荐、图片 InputStream 压缩、多画质+弹幕。  
长期结论：详情页优先内容与动作；相关推荐/评论可延迟加载；图片处理模块化。

### 光影剧场

定位：影视资料/详情/评论 UI。  
重点：竖封面、筛选、动作图标、详情与社区信息组合。  
长期结论：影视程序应把元数据、播放源和评论/社区拆开。

### 一个APP2

定位：加密 APP API。  
重点：AES-CBC 请求/响应、CryptoJS 运行时复用、`$().image()` 图片 AES 解密、内容卡片。  
长期结论：Crypto Runtime 应按需初始化并复用，避免每个请求重复 `eval(getCryptoJS())`。

### 123云盘

定位：网盘 FileProvider。  
重点：账号/token、文件浏览、直链/多画质、下载、AES-CBC 协议处理。  
长期结论：网盘统一抽象 `list/stat/directUrl/play/download`，播放与文件管理分层。

### PikPak

定位：网盘账号与文件媒体。  
重点：账户、文件列表、播放/下载、动态状态更新。  
长期结论：账号生命周期与文件浏览生命周期分离。

### 迅雷

定位：网盘/下载媒体。  
重点：登录、搜索、播放、下载、媒体处理。  
长期结论：FileProvider 和 PlaybackAdapter 不应互相硬耦合。

### 光鸭云盘

定位：轻量网盘 + Token 生命周期。  
重点：`ensureToken/refreshToken`、JWT/expiry 判断、文件浏览、媒体类型、直链、多画质/下载、任务轮询。  
长期结论：登录判断集中在 Protocol/Auth，API 页面只调用 `ensureAuth()`；异步任务必须有超时/重试边界。

### 云盘君.简

定位：多网盘/解析/字幕弹幕工具。  
重点：转码/原画多线路、`urls/names/headers` 对齐、字幕、弹幕、M3U8 Proxy、图片 Header/Stream、WebView、动态 UI。  
长期结论：云盘播放标准化成 PlayModel；文件、认证、字幕、弹幕、播放代理必须拆层，多网盘不能共享私有状态。

### 磁力君.简

定位：搜索/规则管理/多源工具。  
重点：动态搜索、并发、WebView、局部刷新、规则导入/编辑/账号。  
长期结论：聚合搜索采用并发任务 + listener 渐进填充；规则管理能力可独立为 Tooling Module。

### MissAV

定位：薄入口/解析器。  
重点：较薄的页面/解析组织。  
长期结论：单站小程序能薄就薄，不为了“架构完整”强行引入大型 Runtime。

### 替换违禁词导入

定位：导入/兼容/扩展能力研究样本。  
重点：规则导入、WebView/PrivateJS/本地库、播放/M3U8/加密及兼容处理。  
长期结论：违禁词兼容必须按 UI/URL/Header/协议字段分类处理，不能全局字符串替换；综合工具样本里的媒体逻辑仍需按当前官方能力重新评估。

### 我的规则仓库 v1 / v2 / v3 救援包

定位：自举工具演进/恢复样本。  
重点：本地入口、云作用域、Remote state、缓存、Recovery。  
长期结论：自举系统必须有仓库外恢复入口，Stable release 不可原地覆盖。

## 3. 本项目自研程序的反向经验

### ACFun

- 已验证“缩略图优先 → 必要时解密 → 解密后持久缓存 → 后续直接本地文件”的图片链。
- 已验证播放优先列表/详情直链，缺失时才调用播放许可/解码接口；弹幕不应阻塞首次播放。
- 0.5.x Test 的 UI 重构说明：顶部控制区、筛选、快捷入口、内容卡片必须作为一个整体设计，不能单项堆按钮。

### JavDB v3

- Stable/Test/Local 必须有清晰 lineage；远程 Runtime、纯本地构建和隐私门禁是不同交付形态。
- 压缩/分片 Runtime 属于交付技术，不应让 UI/业务代码依赖其实现细节。

### 我的规则仓库

- 多轮实机截图证明：功能齐全不等于 UI 成熟；技术 build/schema/revision 不应抢占首页主视觉。
- UI Foundation/Runtime Contract 能防止共享 UI 函数遗漏；视觉调整也需要模块契约和 Test 通道。
- 产品化管理中心应优先层级、密度、扫描效率和恢复能力，而不是单纯增加卡片/按钮。

## 4. 当前样本统计得到的能力信号

本轮对当前容器中的约 30 个小程序包做文本级能力扫描，观察到：

- 动态 UI (`updateItem/addItemAfter/deleteItem...`) 在多数成熟包中出现，说明“局部状态机”应当是默认能力。
- 13 个左右样本使用标准多线路 `urls` 模型；多线路 PlayModel 是成熟视频/网盘的常见模式。
- AES/加密处理、InputStream、WebView/嗅探在多个样本中重复出现，说明 Protocol/Image/Playback 分层非常必要。
- `video://` 比 `webRule/x5Rule` 更常见，但官方当前明确推荐 `webRule` 作为不依赖 X5 的网页资源提取方式；新项目仍按当前官方能力排序。
- `cacheM3u8/startProxyServer` 只出现在部分复杂媒体应用，说明它们应“按协议启用”，不是默认每个视频都套。

此统计只用于发现工程趋势，不用于证明某样本的协议当前仍有效。

## 5. 使用方式

未来遇到新需求：

1. 先按三份主文档执行。
2. 需要具体参考时，从本索引定位最接近的成熟样本。
3. 回到当前官方手册确认 API 是否仍推荐。
4. 最终实现按目标程序 CHANGELOG/Stable/当前实机重新验证。
5. 新样本有可复用结论时，自动更新本索引 + GUIDE；新坑自动更新 CAUTIONS，不等待用户提醒。
