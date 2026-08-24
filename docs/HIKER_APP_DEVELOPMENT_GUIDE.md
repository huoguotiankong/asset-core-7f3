# 海阔小程序编写指南

版本：2.8
首次建立：2026-08-20  
最近增强：2026-08-24  
文档性质：**长期维护 / 开发操作系统 / 编写前必读 / 自动持续进化**

> 本文档不是 API 备忘录，而是本项目开发海阔视界 `.hk小程序` 的统一“开发操作系统”。目标不是做到“能运行”，而是在任何新对话、长对话恢复或全新项目中，仅凭三份主文档 + 目标程序 CHANGELOG/当前 Stable，就能快速恢复产品意图、正确选择海阔能力、完成成熟 UI、稳定协议层、图片/媒体处理、测试与发布，并尽量一次达到甚至超过用户预期。
>
> 长期质量排序：**稳定 > 好用 > 好看 > 快速 > 易维护 > 可扩展**。新的官方能力、成熟样本经验、实机验证过的 UI/播放/图片方法，只要具有复用价值，都必须无需用户提醒自动沉淀到本文档；新的坑同步到 `HIKER_APP_DEVELOPMENT_CAUTIONS.md`；长期产品/发布决策同步到 `PROJECT_PLAN.md`；某个程序特有的接口、签名、解密和 Bug 写进该程序自己的 `CHANGELOG.md`。

---

# 0. 开发启动协议：先恢复事实，再设计，再编码

开发/优化已有程序前固定执行：

```text
PROJECT_PLAN.md
  ↓
HIKER_APP_DEVELOPMENT_GUIDE.md
  ↓
HIKER_APP_DEVELOPMENT_CAUTIONS.md
  ↓
registry.json 定位目标程序
  ↓
目标程序 CHANGELOG.md
  ↓
stable / channels / latest / test / candidate
  ↓
当前 release.json / Bootstrap / Shell / 实际模块
  ↓
用户当前实机截图、报错、测试结果
  ↓
形成 Product Blueprint + 修改边界
  ↓
才开始编码
```

事实优先级：

```text
用户当前明确指令
> 用户实机结果
> 当前 Stable/Test/Release/实际源码
> 目标程序 CHANGELOG 已验证结论
> registry/manifest
> 本指南通用规则
> 旧聊天记忆/摘要/历史猜测
```

禁止只因为“以前好像这样写过”就直接改代码。

## 0.1 动手前必须明确的 Product Blueprint

至少在内部明确：

1. 核心用户任务。
2. 页面地图：Home / Category / Search / Detail / Player/Reader / Community / Settings。
3. 首屏信息优先级：什么必须立即出现，什么可以延迟。
4. 组件映射：每块内容用哪个原生 `col_type`，为什么。
5. 数据依赖图：哪些接口属于 P0/P1 核心链，哪些属于 P2/P3 附加链。
6. 图片链：URL、Header、缩略图、加密、缓存怎么处理。
7. 播放链：真实媒体地址怎么得到，是否需要解码、M3U8 修正、字幕/弹幕、嗅探兜底。
8. 缓存与失败策略。
9. 实机验收清单。

没有想清这些就直接堆 `d.push()`，通常只能得到“能跑但不成熟”的程序。

---

# 1. 信息来源与研究方法

可信度从高到低：

1. 当前海阔官方开发者手册。
2. 用户当前真实设备结果。
3. 本项目已经实机验证的程序和事故记录。
4. 成熟 `.hk小程序/.hkzip` 样本。
5. 实验方案。

官方主参考：

- `https://docs.189.tyrantg.com/`
- `/docs/hikerview/help_js.html`
- `/docs/hikerview/help_col_type.html`
- `/docs/hikerview/help_rules.html`
- `/docs/hikerview/help_link.html`
- `/docs/hikerview/help_auto_import.html`
- `/docs/$/method.html`
- `/docs/$/static_property.html`

样本研究档案：`docs/HIKER_SAMPLE_ARCHITECTURE_INDEX.md`。它不是第四份启动必读文档；开发时必须执行的结论已经提炼进本指南。

## 1.1 学样本：学模式，不复制历史常量

要提炼：

- 页面结构与信息架构。
- Provider/Adapter 合约。
- UI 组件组合。
- 请求、登录、Token、签名、解密分层。
- 播放与图片 Pipeline。
- 缓存、并发、动态渲染。
- 评论、网盘、下载、规则管理等业务模型。

不要照搬：

- 过期域名、Token、密钥和接口常量。
- 巨型 God Object。
- 所有项目都塞 DEX/SO/QuickJS/PrivateJS。
- 强制在线核心。
- 样本作者设备上的偶然 UI 技巧。

---

# 2. 项目质量门槛：功能“点得开”不等于完成

一个功能至少同时满足：

```text
功能正确
+ 交互路径合理
+ 视觉层级清晰
+ 首屏不过度阻塞
+ 错误/空数据可解释
+ 模块边界清楚
+ 实机验证通过
+ CHANGELOG 已记录关键事实
```

## 2.1 UI 完成定义

必须看真实设备截图/实机效果，检查：

- 一秒内能看懂页面主任务。
- 主操作是否最明显。
- 首屏是否被设置/技术信息/重复按钮挤满。
- 卡片比例是否匹配内容类型。
- 同级按钮是否统一。
- 长标题、无图、极端数据是否仍可用。
- 空状态/错误态是否像产品而不是调试页。
- 不同页面是否像同一个 App。

复杂 UI 至少经过：

```text
Test/Candidate → 实机截图 → 视觉复核 → 只改 UI 层 → 再截图
```

## 2.2 播放完成定义

至少验证：

- 冷启动首次播放。
- 第二次播放/缓存命中。
- Header/Referer/UA/Cookie。
- 多画质/多线路。
- MP4/HLS 类型识别。
- 地址过期/主线路失败后的降级。
- 字幕/弹幕（适用时）。
- 能区分“取地址/解码/Header/HLS/嗅探/播放器”哪层失败。

## 2.3 图片完成定义

至少验证：

- 明文 JPEG/PNG/GIF/WebP 不被误解密。
- 加密图片可显示。
- Header 正确。
- 解密缓存命中。
- 列表缩略图与详情/阅读原图策略合理。
- 图片错误不会拖死整页。

---

# 3. 架构基线：页面、协议、媒体必须分层

长期维护程序推荐：

```text
Shell / Bootstrap
        ↓
Core
├─ Request
├─ Cache
├─ Storage
├─ Task / Concurrency
├─ Diagnostics
└─ Update
        ↓
Protocol
├─ Domain / Endpoint
├─ Auth / Token
├─ Sign
├─ Encode / Decode
└─ Crypto Runtime
        ↓
Provider
├─ MetadataProvider
├─ SearchProvider
├─ ContentProvider
├─ PlaybackProvider
├─ CommunityProvider
└─ FileProvider
        ↓
Adapter
├─ ModelAdapter
├─ ImageAdapter
├─ PlaybackAdapter
├─ CatalogAdapter
├─ CommentAdapter
└─ DownloadAdapter
        ↓
Pages / UI
├─ Home
├─ Category
├─ Search
├─ Detail
├─ Reader / Player
├─ Community
├─ History / Favorite
└─ Settings
```

维修边界：

- 搜索坏 → SearchProvider/Search Page。
- 鉴权变 → Protocol/Auth。
- 图片加密变 → ImageAdapter。
- 播放链变 → PlaybackAdapter。
- UI 不美观 → Renderer/Page，不碰协议层。
- 评论坏 → CommunityProvider。
- 更新协议变 → Bootstrap/Update Manager。

## 3.1 规模选择

小型单站：`Core + Provider + UI`，能薄就薄。  
中型长期维护：`Page Modules + Protocol + Provider + Adapter + UI`。  
大型聚合：`Core Runtime + Provider SDK + Source Manager + Task Engine + Cache + UI`。

不要为了“架构完整”给一个简单工具造十几个空模块。

---

# 4. 海阔规则壳、路由与模块化

常见规则字段：

```text
title / author / type / version / icon / group
url / preRule / find_rule
search_url / searchFind
pages / col_type
```

`preRule` 只做轻量初始化、Cookie/兼容预处理；不做重型联网、强制检查更新、清空用户数据。

复杂二级页面优先：

```text
hiker://page/<path>?rule=<规则名>&simple=true
```

本项目默认避免会让系统标题栏与内容叠加的沉浸式详情结构。

常用路由：

```text
hiker://empty
hiker://home@规则名
hiker://history?rule=xxx
hiker://collection?rule=xxx
hiker://search?s=xxx&rule=xxx
hiker://download
rule://...
pics://url1&&url2
web://...
x5://...
video://...
download://...
```

## 4.1 静态选择与输入优先使用明确路由

2026-08-21 “我的规则仓库”RC7 实机验证了以下模式：

```text
select://{"title":"排序方式","options":["默认排序","最近更新"],"col":2,"js":"..."}
input://{"value":"","hint":"请输入内容","js":"..."}
```

适用原则：

- 固定选项、排序、运行方式、清理类型等静态选择，优先使用官方明确的 `select://` JSON 路由。
- 文本恢复、关键词等简单输入场景，可使用官方 `input://` JSON 路由。
- 不要凭旧样本猜 `$().select(...)` 等构造器的参数重载；不同海阔版本/调用形式可能把字符串参数解释成其它类型。
- `js` 回调只传完成操作所需的最小状态，跨页主键仍遵守 URL 参数 + Provider 恢复规则。
- 新路由用法仍先在 Test/Candidate 实机确认，再进入 Stable。

当前实机事实：旧 `$().select` 写法曾把第二个字符串“排序方式”错误解释为数值参数并抛出 `For input string: "排序方式"`；切换为 `select://` 后同一设备可正常显示两列原生选择面板。

模块化：

```js
// module page
$.exports = {
    load: function(){},
    render: function(){}
};

// caller
var mod = $.require('myModule');
mod.load();
```

`$.require(path, true)` 只在确实需要绕过模块缓存时使用。

---

# 5. Hiker Native Design System：UI 先设计，再编码

海阔原生组件足够做出接近 App 的页面。默认原生组件优先，不用 WebView 模拟 UI。

## 5.1 内容类型 → 组件选择

| 内容 | 首选组件 | 场景 |
|---|---|---|
| 横向视频 | `movie_2` | 视频 Feed、相关推荐 |
| 长描述/文件 | `movie_1_left_pic` / `movie_1` | 搜索、网盘文件 |
| 竖封面/海报 | `movie_3` / `movie_1_vertical_pic` | 漫画、影视、书籍 |
| 详情 Hero | `movie_1_vertical_pic_blur` | 影视/漫画/人物 |
| 大横图 | `pic_1_full` | 创作者、专题、Banner |
| 方图/头像 | `pic_3_square` / `avatar` / `icon_2_round` | 用户、图库 |
| 功能入口 | `icon_4` / `icon_small_4` / `icon_2` | 收藏、历史、设置、下载 |
| 次级统计 | `icon_small_3` | 点赞、回复、浏览 |
| 横向分类 | `scroll_button` | 主栏目、排序、少量筛选 |
| 自动换行筛选 | `flex_button` | 大量标签 |
| 富文本 | `rich_text` | 正文、简介 |
| 长纯文本 | `long_text` | 日志、诊断 |
| 搜索 | `input` / `icon_1_search` | 搜索入口 |
| 组合视觉卡 | `card_pic_*` | 少量专题/精选 |
| 分区 | `line` / `line_blank` | 语义分组 |

组件必须按真实图片比例和实机截图调整，不坚持理论模板。

## 5.2 五层视觉层级

```text
1. Identity / Hero        这是什么
2. Primary Action         最重要操作
3. Navigation / Filter    怎么切换内容
4. Main Content           真正来看的数据
5. Secondary / Utility    评论、推荐、设置、诊断
```

第 5 层不要抢占第 1 层。

## 5.3 一套 Design System

长期程序至少统一：

```js
var Design = {
    brandColor: '#...',
    textPrimary: '#...',
    textSecondary: '#...',
    iconBase: 'https://.../assets/'
};
```

原则：

- 一个主品牌色。
- 正式图标使用同一套 SVG/PNG，不让 Emoji 承担主导航。
- 同级动作使用相同组件族。
- build/schema/cache key 等工程信息移到设置/诊断。
- 普通 `movie/text` 不假设支持任意 HTML。
- **同一选中状态只使用一个主视觉信号。** 已经使用活动色/活动图标时，不再额外叠加 `●`、星号、重复文字状态；否则会出现“蓝色图标 + 黑点 + 文字”三重强调。
- 密集管理列表优先让一张主卡承载名称、版本、状态和少量辅助标签；不要默认给每个项目再追加一整行 chips。海阔横向 `flex/scroll` 在空间不足时可能出现自动溢出入口，既增加高度又产生无意义 `>`。

## 5.4 筛选设计

```text
一级栏目：常驻
高频少量筛选：scroll_button
大量低频标签：折叠，展开后 flex_button
```

不要把一级分类、二级分类、标签、排序、收藏、历史、设置、诊断全部常驻首页顶部。

原生近似布局必须服从实机效果。设计稿是左右双栏，不代表必须用连续 `text_2` 硬模拟双栏；如果实机形成大面积灰色按钮墙，应改成“主分类横向 → 子分类横向 → 高级筛选折叠 → 结果”的任务层级，而不是为了形式相似牺牲密度和可读性。

## 5.5 六类页面模板

首页：品牌/搜索 → 主栏目 → 3~5 个快捷入口 → 紧凑筛选 → 主 Feed。  
分类：当前摘要 → 主分类 → 次分类/标签 → 排序 → 结果。  
搜索：输入 → 最近/热门（可选）→ 范围/Provider → 渐进结果。  
详情：Hero → Primary Action → 次动作 → 简介/标签 → 线路/章节 → 作者/社区 → 推荐。  
播放器/阅读器：只消费标准 PlayModel/ChapterModel。  
设置：体验 / Provider / 缓存 / 登录 / 更新 / 诊断分组。

## 5.6 UI 升版必须检查“结构差异”，不能只检查代码差异

用户感知的 UI 版本变化主要来自页面骨架、首屏主任务、组件族和交互路径，而不是版本号、文案缩短或隐藏两个按钮。

发布新的 UI 大版本前，至少做一次结构对比：

```text
旧版首屏区域顺序 / 组件族 / 主操作
vs
新版首屏区域顺序 / 组件族 / 主操作
```

如果两版仍是同一套 `Hero → 筛选 → 状态 → 同款列表 → 导航`，只改描述内容、标签数量或按钮文案，应按“密度微调”标记，不应包装成新的 UI/Product 大版本。

当前设备还验证了一个额外原则：先确认目标 `col_type` 实际能显示几行标题/描述，再设计信息模型。组件只稳定露出一行时，关键状态必须放进这一行，不能把升级效果押在第二行会显示上。

## 5.7 参考图复刻先拆“视觉语法”，并跨页锁定感知锚点

参考图不是待逐像素照搬的网页稿。海阔原生 UI 应先拆出用户能直接感知的关系，再映射到当前版本已确认的组件能力：

```text
目标图
→ 首屏区域顺序
→ 数量/状态/标签/主操作的视觉权重
→ 列表、树、详情三类页面的共同语言
→ 原生组件映射
→ Test 实机截图闭环
```

管理型页面可优先验证以下映射：

- `avatar`：图标、名称与右侧短状态；关键状态不押在可能被裁切的第二行。
- `rich_text`：紧邻主卡承载少量彩色标签和一行弱摘要；只放展示语义，不模拟复杂交互。
- `icon_small_4`：四项统计入口；确需数字成为主视觉时，优先使用仓库内版本化、独立 URL 的静态 SVG 数字资产，并在原生标题保留数量兜底。当前设备不再把动态 data-URI 用作关键视觉。
- `icon_2`：只用于无需透明占位、真实数据天然成对且实机比例合适的关系；分类树若形成灰色按钮墙，应转成“可换行主分类 → 子分类清单”，不再为了双栏外形补空位。
- `icon_small_3`：排序、筛选、同步等紧凑工具栏；不与内容状态入口争夺主层级。
- `scroll_button`：明确需要横向滚动的少量入口；带数量的四项在窄屏也可能溢出，不能按项目数猜宽度。
- `flex_button`：需要留在一屏并自动换行的主分类、历史词和热门标签。

视觉大改至少同时选三类感知锚点验收，例如：首页统计与程序卡、分类树、程序/版本详情。只改首页而让分类和详情继续使用旧组件语法，用户仍会把整套产品判断为“变化不大”。原生组件无法忠实表达的局部关系应调整信息模型，不应默认切成 X5/WebView 普通界面；远程交互页面仍优先保持原生稳定性和恢复能力。

## 5.8 图片 URI、数字资产与富文本必须按实机链路设计

RC11 实机先证明 data-SVG 的 `<text>` 会被替换成错误字形；RC1 随后又证明，即使改成纯 `<rect>/<path>` 七段数字，内联 data-URI 在同一设备仍可能显示成无关图形。低透明 drawable 也没有消除 `icon_2` 空位破图。因此关键统计遵循：

```text
仓库内静态 SVG（全新、版本化 URL）
+ 原生 title 中的文本数字兜底
→ Test 实机确认
→ 再决定是否进入 Stable
```

同时遵守：

- 数字、状态等关键语义不只存在图片内；图片失败时仍能从原生标题读取。
- 动态 data-URI 仅可作为可丢失的装饰性实验，不承担数字、状态、恢复入口等核心语义。
- 当前目标设备不使用透明 SVG 维持分类双栏；布局需要空图片才能成立时，优先改信息结构。
- `rich_text` 行首普通空格/全角空格可能被 trim；需要和上方图文卡对齐时使用受控 `&nbsp;`，并以实机截图校准数量。
- `avatar` 等标题中的连续普通空格可能折叠；名称与版本之间使用明确分隔符或全角间隔，不把可读性押在两个普通空格上。
- 这些方法只用于展示层；交互、导入、更新、恢复继续由原生 Item/路由承担。

搜索/筛选同样需要按组件溢出行为设计：四个带数量的 `scroll_button` 已在窄屏出现 `>`，因此高频范围优先等宽 `text_4` 或可换行入口；低频运行方式进入 `select://`。“清空记录”属于管理动作，不与历史关键词使用同一视觉语义；热门标签使用数量受控的 `flex_button`，避免 `text_3` 形成大块灰色卡片墙。

## 5.9 新片场样本：原生 App 化视觉语法与 `gameTheme` 菜单

2026-08-24 对照项目来源中的“新片场”源码与用户实机截图复核。该样本最值得学习的不是某一张卡片，而是**整套页面在白底、少量品牌色、清晰内容层级和海阔原生组件之间形成了统一视觉语言**。

### 首页骨架

```text
顶部规则/频道导航
→ 大横幅 Banner
→ 四个图标型核心入口
→ 当前分区标题 + 搜索入口
→ 分类宫格 或 内容 Feed
```

源码对应关系：

- Banner：`card_pic_1`，使用 `registerTask + updateItem` 做轮播式更新。
- 四个核心入口：`icon_small_4`，图标承担识别，文字保持短。
- 分类库：`icon_3_fill` 三列宫格，适合大量但同级的视觉分类。
- 推荐 Feed：`avatar → text_1 → pic_1_full → icon_small_3 × 3 → line_blank`，先告诉用户“谁发布 + 什么内容”，再给大图，最后放收藏/评论/点赞等弱统计。

这类 Feed 的关键不是组件数量，而是**一张内容只突出一个主视觉大图，统计动作全部降级到图片之后**，避免首页变成按钮墙。

### 视频详情骨架

```text
大横图 Hero / 点击播放
→ 简介 | 评论 双 Tab
→ 标题 + 分类/日期/播放量
→ 正文简介
→ 点赞 / 收藏 / 分享 / 下载
→ 标签
→ 创作人
→ 相似视频
```

源码使用 `pic_1_full + text_2 + text_1/rich_text + icon_small_4 + flex_button + icon_2_round` 完成。视觉上大部分区域保持黑/灰/白，仅选中 Tab 使用单一粉色强调色，因此信息很多但不会显得花。

双 Tab 切换通过 `updateItem / deleteItemByCls / addItemAfter` 局部替换内容，不依赖整页刷新。以后详情页、评论页、作者页等高频切换优先沿用“**固定骨架 + 局部内容区更新**”的模式。

### 评论页

评论继续保留同一 Hero 与“简介/评论”Tab，不另起完全不同的页面语法。单条评论采用：

```text
头像 + 用户名 + 时间
→ 正文
→ 细分隔/自然留白
```

社区内容不需要给每条评论再套重卡片。白底、头像、弱时间、正文大字和自然分隔已经足够形成层次。

### 创作人主页

截图中的舒适感来自：

```text
大幅个人背景图
→ 头像 + 名称 + 人气/粉丝
→ 最新 / 热门 / 专辑 三段 Tab
→ 横图缩略图 + 标题 + 日期/喜欢/观看
```

该样本源码使用了 `#immersiveTheme#`，但本项目已有其它实机证明沉浸式二级页可能造成系统标题栏与内容叠加，因此**只继承视觉层级，不把 `immersiveTheme` 重新设为默认方案**。本项目仍优先普通独立二级页 / `simple=true`；只有当前目标设备实机证明沉浸式安全且确实改善体验时才局部启用。

### 搜索页

搜索页采用大面积留白 + 一个明显输入框 + 纯文本热门榜单。它说明“搜索页不一定需要很多卡片”：

```text
明显的搜索输入
→ 历史词/热门词（适用时）
→ 热门内容数字榜单
→ 搜索后再进入作品/创作人 Tab 与图文结果
```

用户尚未输入时，降低图片和控件密度，让搜索输入与热门内容成为唯一主任务；输入后再切换到结果型 UI。

### `#gameTheme#`：系统右上角圆形菜单可作为正式设计选项

海阔官方当前文档明确：页面链接加入 `#gameTheme#` 后会全屏显示，并在右上角显示菜单按钮。新片场的视频详情和搜索页使用该模式，实机截图中的右上角圆形按钮展开后提供“收藏页面 / 分享页面 / 退出页面”等系统动作。

适合考虑：

- 内容详情、作品展示、搜索、评论等希望减少普通标题栏干扰的页面。
- 页面自身主内容已经清晰，收藏/分享/退出属于低频系统动作，希望收到一个统一菜单中。
- 不想自己维护额外“三点菜单/更多菜单”样式与生命周期。

不应机械套用：

- 普通设置页、工具页、层级导航复杂的管理页。
- 页面已有自定义收藏/分享主操作，使用后会形成重复入口。
- 返回路径、状态栏、播放器切换或目标设备兼容尚未实机验证。

因此 `gameTheme` 以后作为 **UI Pattern 可选项**，不是全局默认主题。使用前必须 Test 实机确认右上角菜单、返回行为、状态栏和当前页面主操作没有冲突。

### 学视觉结果，不复制实现债务

该样本为了制造留白，在若干页面中使用了较多 `blank_block`。截图的“松弛感”值得学习，但实现方式不应照抄：

```text
目标：有呼吸感的间距
优先：组件天然间距 / line / line_blank / 信息分组 / 控件减量
最后：少量受控 blank_block
```

同样，样本中的旧远程图标地址、旧接口常量、历史主题写法只作为研究材料，不直接进入新项目。

### 可复用视觉原则

1. **大图负责情绪，小组件负责动作。** Banner/Hero/作品图尽量完整展示，动作图标不和大图争抢面积。
2. **一个页面只保留一个主强调色。** 其余使用黑、灰、白，选中态才上品牌色。
3. **作者/人物优先头像行，不把人物信息做成厚重卡片。**
4. **Feed 先主体、后统计。** 统计/点赞/评论必须弱于作品标题和图片。
5. **详情页 Tab 少而明确。** 2～3 个高频 Tab 比把所有能力铺成一排按钮更舒服。
6. **搜索前后使用不同密度。** 未搜索时留白和热榜；有结果后再转图文列表。
7. **系统级低频动作能交给 `gameTheme` 菜单时，不必重复造轮子；是否启用由页面任务决定。**
8. **视觉样本必须同时对照源码和实机截图。** 截图证明“效果”，源码解释“怎么做到”；最终只继承经过当前海阔版本验证且符合本项目规范的部分。

---

# 6. 开发工具与模板：用来加速开发，不把“自动猜”留到 Stable

本轮新增样本 `模板·Q`、`DR模板`、`获取Favicon·α` 说明：**开发工具本身也应该工程化**。

## 6.1 HTML 模板自动匹配器

`模板·Q` 的核心思路：

```text
输入待分析页面 HTML
↓
根据 DOM/CSS 特征做 Mapping
↓
得到若干候选 Parser
↓
逐个执行
↓
首个成功 Parser 输出结果
↓
记录成功模板
```

适合开发阶段快速识别常见影视模板，例如 `stui-* / myui-* / module-* / fed-*` 等结构。

推荐把自动匹配做成 DevTool：

```js
TemplateSignature = {
    keys: ['module-item','module-tab-item'],
    allKey: false,
    parserId: 'module-v1'
};
```

正式 Stable 原则：

- 已确认站点结构后，**冻结选中的 Parser/Adapter**。
- 不让每次用户打开页面都从几十个模板中“猜”。
- 自动匹配失败日志要保留候选、命中特征、失败阶段。
- 页面结构变化时重新进入开发工具匹配，再形成新 Adapter 版本。

## 6.2 动态分类生成器

模板工具的分类能力可抽象为：

```text
CategoryExtractor
→ 标准 CategoryModel
→ Selected State
→ scroll_button/flex_button Renderer
```

不要让“分类 DOM 选择器 + 状态存储 + UI”绑死在一个页面函数里。

## 6.3 Favicon / 图标发现器

开发阶段可按：

```text
站点 /favicon.ico
→ HTML <link rel=icon>（可解析时）
→ 多个 Favicon 服务作为发现兜底
→ 人工确认
→ 最终复制/固化到项目 assets
```

第三方 favicon API 适合**发现**，不适合作为正式长期唯一图标源。正式程序优先仓库自有 assets + fallback。

## 6.4 Rule Generator 与 Runtime 分离

“写源工具/DR模板/模板·Q”属于开发时能力；用户正式运行的小程序不应携带大量规则生成器、模板扫描器、编辑器逻辑，除非产品本身就是写源工具。

---

# 7. 动态 UI：局部状态机，不整页抖动

常用：

```js
updateItem(id, patch)
deleteItem(id)
deleteItemByCls(cls)
addItemAfter(id, itemOrArray)
addItemBefore(id, itemOrArray)
findItem(id)
findItemsByCls(cls)
```

统一 ID：`<app>-<page>-<module>-<entityId>`。  
统一 Class：`<app>-<page>-<section>`。

推荐：

```text
先 setResult 核心结构/缓存
↓
Loading 占位 Item
↓
异步/并发取非核心数据
↓
updateItem/addItemAfter
↓
只更新对应区域
```

一个筛选变化不要重建整页。

---

# 8. Request Layer：所有协议稳定性的入口

统一：

```text
request()
├─ normalizeUrl
├─ headers / UA / Referer / Origin
├─ cookie / auth
├─ timeout
├─ statusCode / redirect
├─ body encoding
├─ JSON/HTML/binary detection
├─ retry / fallback
├─ schema validation
└─ diagnostics
```

推荐标准返回：

```js
{
    ok: true,
    status: 200,
    source: 'network|cache|fallback',
    data: null,
    headers: {},
    error: '',
    stage: 'request|decode|schema'
}
```

按需使用海阔：

```text
withHeaders
withStatusCode
redirect:false
timeout
onlyHeaders
inputStream:true
toHex:true
fetchPC/postPC
fetchCodeByWebView
```

自行 `fetch(...,{inputStream:true})` 后必须 `closeMe(stream)`；不要泄漏流。

关键索引：

```text
新鲜缓存 → 主网络 → 备用通道 → stale cache → 诊断错误页
```

失败响应先验证，不能写成正常缓存。

---

# 9. Protocol Client：登录、签名、加解密集中处理

页面禁止散落：

```text
Token / Sign / Timestamp / DeviceId / AES / HMAC / Cookie / Host 探测
```

统一：

```js
var Protocol = {
    discoverEndpoint: function(){},
    ensureAuth: function(){},
    refreshAuth: function(){},
    buildHeaders: function(){},
    sign: function(req){},
    encodeBody: function(data){},
    decodeResponse: function(raw){},
    request: function(api,opt){}
};
```

## 9.1 Token 生命周期

光鸭/网盘类样本补强的标准：

```text
load token
→ 判断过期时间（保留安全提前量）
→ 有 refreshToken 则刷新
→ 刷新失败再要求登录
→ 保存新 token + expiry
```

不要每个 API 自己判断登录；统一 `ensureAuth()`。

## 9.2 动态域名

配置接口/DoH/TXT → 解码 → 优先级 → 有限探活 → 缓存最后有效 host。

已有 goodHost 时先用；探活短超时；失败不拖慢首屏。

## 9.3 Crypto Runtime

优先级：

```text
海阔内置 base64/AES/RSA/md5/RC4 等
→ hiker://assets/crypto-java.js
→ 单例 CryptoJS
→ 必要 Java Cipher
→ DEX/SO 仅明确需要时
```

不要每个请求/每张图重复 `eval(getCryptoJS())`。

---

# 10. Image Pipeline：封面和漫画图是一等模块

标准链：

```text
Provider 原始图片字段
→ normalizeImageUrl
→ thumb / original / reader
→ Referer/UA/Cookie Header
→ 解密缓存检查
→ 明文图片识别
→ ImageAdapter 解密/转换
→ 必要时持久缓存
→ 返回 URL / InputStream
```

## 10.1 ImageModel

```js
{
    url: '',
    headers: {},
    variant: 'thumb|original|reader',
    encrypted: true,
    codec: 'aes-cbc|aes-ecb|aes-cfb|3des|xor|base64|custom|none',
    cacheKey: '',
    fallback: ''
}
```

## 10.2 Header 与官方图片解密

优先：

```text
http://a.jpg@headers={"Referer":"...","User-Agent":"..."}
```

图片 `@js=` / `$().image()` 中 `input` 是 `InputStream`，返回也必须是 `InputStream`。复杂解密封装到子页面/模块：

```js
function imageUrl(url, headers){
    return $(url, headers).image(function(){
        return $.require('imageDecrypt').decode(input);
    });
}
```

`@js=` 放在 Header/Cookie/Referer 附加标识之后。

## 10.3 先识别明文

```text
JPEG  FF D8 FF
PNG   89 50 4E 47
GIF   47 49 46 38
WebP  RIFF .... WEBP
```

已经是正常图片就直接返回。

## 10.4 Stream 解密模式

`摸鱼日报` 等样本验证了：

```text
InputStream
→ bytes/base64 中间表示（按协议）
→ AES/3DES/XOR/自定义转换
→ bytes
→ toInputStream()
```

关键不是照抄 AES 模式，而是把**流转换职责独立到 ImageAdapter**。

## 10.5 解密缓存与性能

列表优先缩略图；首次需要时解密；成功后按 URL + codec schema 缓存；后续直接本地读取。  
详情再用高分辨率，漫画阅读器按章节加载原图。

---

# 11. Playback Pipeline：先标准化播放模型，再谈“免嗅/嗅探”

```text
VideoEntity
↓
PlaybackProvider
↓
PlaybackAdapter
↓
PlayModel
↓
海阔播放器
```

## 11.1 PlayModel

```js
{
    urls: [],
    names: [],
    headers: [],
    subtitle: '',
    danmu: '',
    lyric: '',
    audioUrls: []
}
```

单线路可直接返回 URL；多画质、不同 Header、字幕/弹幕时优先标准 JSON：

```js
return JSON.stringify({
    urls: [u1, u2],
    names: ['高清', '超清'],
    headers: [h1, h2],
    subtitle: subUrl,
    danmu: danmuUrl
});
```

`headers[i]` 必须对应 `urls[i]`。

---

# 12. “免嗅”必须按技术本质分类

以后不要把所有“能播”方案都叫免嗅。

## 12.1 A 级：真正优先的结构化免嗅

### A1. 已有直链

列表/详情已经返回 `.mp4/.m3u8/...` 或可播放 URL：直接标准化 Header/类型后播放。

### A2. 播放 API 换直链

```text
contentId / episodeId
→ 官方/APP play API
→ 多画质 URL + Header
→ PlayModel
```

这是视频 APP/网盘最理想的方式。

### A3. 静态页面源码解析

```text
fetch(player page)
→ 定位 player JSON / script / data-* / m3u8/mp4 字段
→ URI/Base64/JSON 解码
→ 直链
```

例如模板里常见 `player_aaaa`、内嵌 JSON、script 配置等。只要普通 `fetch()` 能得到真实字段，就不启动浏览器嗅探。

### A4. 协议字段解码/解密

```text
API/页面拿到 encoded play field
→ Base64/URLDecode/AES/RC4/XOR/自定义算法
→ 真实 URL
```

算法必须来自当前 APK/网页 JS/接口事实，不盲猜。

### A5. HLS 索引重建/代理

真实 URL 已知，但 M3U8 内 Key/segment/path/一次性 URL 有问题时，通过 `fixM3u8/cacheM3u8/startProxyServer/...` 处理后播放。这仍是结构化媒体处理，不是网页资源嗅探。

## 12.2 B 级：浏览器辅助“取源码”，但不是资源嗅探

`fetchCodeByWebView(url,{checkJs,...})` 用 WebView 等待 JS 渲染完成后拿 DOM/源码，再从结构化页面解析媒体字段。

它比 `video://`/`webRule` 更可控，但仍有浏览器启动成本，因此只在普通 fetch 拿不到渲染后字段时使用。

## 12.3 C 级：委托解析器 / 通免服务

DR模板里的 `lazyParse`、第三方 `aytmParse`/解析接口等属于“把 URL 交给另一个解析层”。

规则：

- **不能因为函数名叫“通免/免嗅”就默认它内部一定不嗅探。**
- 要在目标程序 CHANGELOG 记录：输入是什么、解析器来源、输出类型、是否依赖第三方服务、失败时怎么退。
- 自己能直接 API/源码解析的，优先自己解析，减少外部依赖。

## 12.4 D 级：真正的网页嗅探兜底

### `video://`

自动进入播放器并提取网页加载过的媒体资源；支持 `blockRules / videoRules / videoExcludeRules / js / cacheM3u8`。

### `webRule://`

系统 WebView 周期执行 JS，返回资源即结束。可以通过 `window._getUrls()` / bridge 获取加载过的资源，并配合 UA/Referer/blockRules。

### `x5Rule://`

与 `webRule://` 同类，但使用 X5 内核；主要作为兼容路径。

**优先 `webRule://`，X5 只在站点兼容性需要时使用。**

## 12.5 E 级：网页播放最后兜底

`x5_webview_single` / 原网页播放器仅作为无法稳定拿直链时的最后体验兜底，不作为新项目默认 Player。

## 12.6 标准播放选择器

```text
已有直链？
  是 → direct
  否
  ↓
有 play API？
  是 → API → direct
  否
  ↓
普通 fetch 能解析 player 字段？
  是 → source parse → direct
  否
  ↓
字段需要已知解码/解密？
  是 → protocol decode → direct
  否
  ↓
JS 渲染后 DOM 有字段？
  是 → fetchCodeByWebView → source parse
  否
  ↓
可用且可信的委托解析器？
  是 → delegated parser
  否/失败
  ↓
video://
  ↓
webRule://
  ↓
x5Rule://
  ↓
WebView 原页兜底
```

这条链以后是视频小程序默认决策树。

---

# 13. M3U8 / Proxy 专项

正常 HLS 能直放时先直放，不要所有链接先 `cacheM3u8()`。

适合 `cacheM3u8()`：

- 索引只能访问一次。
- 相对路径/Key 需要稳定化。
- 播放途中原索引容易失效。

官方/样本能力按需：

```text
cacheM3u8
batchCacheM3u8
fixM3u8
clearM3u8Ad / clearM3u8AdLazy
startProxyServer
cacheM3u8WithPngProxy
convertM3u8WithPngProxy
```

## 13.1 `startProxyServer`

适合：

- 动态代理 m3u8/key/segment。
- 必须改写 Header/响应内容。
- 原始地址带时效，需要播放器访问本地稳定入口。

代理播放器 URL 要确保唯一，避免播放进度串线；M3U8 代理 URL 应保留可识别的 m3u8 语义。

## 13.2 PNG 分片类 HLS

如果 segment 伪装成 `image/png`，不要在页面里手写几十行二进制逻辑，优先官方 `cacheM3u8WithPngProxy/convertM3u8WithPngProxy`。

---

# 14. 类型标识、预加载、字幕与弹幕

按协议需要使用：

```text
#isVideo=true#
#isMusic=true#
#ignoreVideo=true#
#ignoreMusic=true#
#ignoreM3U8#
#isM3u8#
#pre#
#noPre#
```

不要无脑给所有 URL 追加。

海阔默认有音视频预加载。只有站点地址强时效/预取会失效时才 `#noPre#`。

字幕：SRT/VTT/ASS。  
弹幕：B站 XML、JSON `[{text,time}]`、`web://` WebView 弹幕。  
歌词：`lyric`。

弹幕默认不是首次播放 P0 依赖：先得到可播 URL，再并发/缓存弹幕。

---

# 15. 播放失败诊断

至少区分：

```text
NO_SOURCE       Provider 没地址
AUTH_FAIL       鉴权/许可失败
SOURCE_PARSE    页面源码解析失败
DECODE_FAIL     播放字段解码失败
EXPIRED         URL 过期
HEADER_FAIL     Referer/UA/Cookie 缺失
HLS_FAIL        m3u8/key/segment 问题
PARSER_FAIL     委托解析器失败
SNIFF_FAIL      video/webRule/x5Rule 失败
PLAYER_FAIL     已得到直链但播放器失败
```

诊断要记录实际走了哪一级播放路线，不能只显示“播放失败”。

---

# 16. 漫画 / 阅读 Pipeline

```text
MetadataProvider.detail()
CatalogProvider.catalog()
ContentProvider.getChapterContent()
ImageAdapter.image()
CommunityProvider.comments()
```

阅读和下载共用 `getChapterContent()`；不要写两套章节图片接口。

```text
章节 → 图片列表 → 每张 ImageAdapter → pics://img1&&img2...
```

目录很大时分卷/分页/范围选择，不一次渲染几千项。

官方社区数据与正文 Provider 解耦：正文可替换，评论/讨论仍走官方 CommunityProvider。

---

# 17. Provider / Adapter / Model First

通用 Provider：

```js
{
    home: function(){},
    category: function(filter,page){},
    search: function(keyword,page){},
    detail: function(id){},
    catalog: function(id){},
    content: function(chapter){},
    comments: function(target,page){},
    community: function(target,page){}
}
```

基础模型：

```js
var Item = {
    id: '',
    type: 'video|comic|book|person|file',
    title: '',
    subtitle: '',
    cover: '',
    desc: '',
    tags: [],
    stats: {},
    source: '',
    raw: {}
};
```

Renderer 只消费标准模型，不在 UI 里写 `x.coverImg || x.poster || x.img...` 这种十几个字段兼容链。

---

# 18. 网盘 FileProvider

从 123/PikPak/迅雷/光鸭/云盘君样本统一：

```js
{
    login: function(){},
    ensureAuth: function(){},
    refreshAuth: function(){},
    list: function(folderId,page){},
    stat: function(fileId){},
    directUrl: function(file){},
    play: function(file){},
    download: function(file){},
    search: function(keyword,page){}
}
```

云盘君类播放经验：

```text
文件实体
→ 转码/原画接口
→ names[] + urls[] + headers[]
→ 字幕匹配
→ 弹幕（适用）
→ PlayModel
```

文件浏览页不知道每个平台 Token/签名细节。

异步转码/离线任务要有：创建任务 → 轮询状态 → 超时 → 可重试，而不是无限死循环等待。

---

# 19. 并发、渐进渲染与缓存

官方 `batchExecute(tasks, listener, successCount)`：

- 最大并发线程数 16。
- task 外部数据通过 `param`。
- listener 同步，集中 UI/状态写入。
- `successCount` 可拿到 N 个成功后停止。
- listener `return 'break'` 可中断。

多线程不要直接乱写 `putVar/putMyVar/setItem`；需要时使用 listener 或 `syncExecute()`。

首屏分级：

```text
P0 缓存/结构：立即显示
P1 核心网络：决定能否继续
P2 附加信息：异步补齐
P3 低频能力：点击才加载
```

缓存至少区分：运行时状态 / 用户设置 / 页面缓存 / stale cache / 图片解密缓存 / M3U8 索引 / 远程模块缓存。

Cache Key：

```text
<app>:<provider>:<module>:<entity>:<schema>
```

协议变更提升 schema，不要求用户手动清缓存。

---

# 20. WebView、嗅探与 Native Extension

`x5_webview_single` 适合登录/验证码/必须网页能力；普通列表/详情不用它做 UI。

Native 依赖优先级：

```text
海阔官方 JS
→ 普通 JS / 内置 Java 类
→ hikerPop / Native Extension
→ loadJavaClass DEX/SO
```

DEX/SO 只有明确缺口时引入，不为“高级”而引入。

---

# 21. 评论 / 社区 / 作者

CommunityModel：

```js
{
    id:'',
    author:{id:'',name:'',avatar:''},
    content:'',
    time:'',
    likeCount:0,
    replyCount:0,
    badges:[],
    images:[],
    replies:[]
}
```

楼中楼按需展开；更多回复必须绑定当前 commentId；评论不阻塞正文/播放。

---

# 22. Diagnostics：错误页必须能定位层级

用户层：简洁可操作。

```text
“视频暂时无法播放”
[重试] [切线路] [诊断]
```

诊断层记录：

```text
App / Page / Stage
Shell / Core / Build / Manager
Provider / Endpoint
Cache source
HTTP status
Decode stage
Image codec
Playback route
fallback chain
sanitized error
```

不输出真实 Token/Cookie/Authorization/密码。

---

# 23. 测试体系：静态正确 ≠ 实机正确

静态：JSON/JS、release 路径、版本/build、凭据扫描、Guard/Contract。  
Fixture：正常/空/缺字段/错误码/明文图/加密图/单线路/多线路。  
实机：Home / Category / Search / Detail / Player/Reader / Favorite/History / Community / Settings / 网络异常 / 更新回退。

媒体专项：

- 图片：Header、明文、密文、缓存、原图。
- 播放：直链、API、源码解析、解码、HLS、Header、过期、委托解析器、video/webRule/x5Rule、字幕/弹幕。
- 漫画：目录、超大章节、图片解密、下一章、下载共用链。

---

# 24. 发布、远程模块、自用版与分享版

自用 Remote：

```text
Shell
→ Bootstrap
→ Versioned Remote Manager
→ active release
→ versioned modules
→ 海阔 require cache
```

- 正常启动不查 latest。
- 新功能先 Candidate/Test。
- Stable release 不原地覆盖。
- 预加载/verify 后再切 active。
- previous 可真实回退。
- `stable/latest` 最后切。
- Remote Release 更新只能替换业务模块，不能自动替换已安装的规则 Shell。只要默认 Release、`minBuild`、页面清单或 Bootstrap 契约发生变化，就必须同时发布新的 Shell 文件路径、递增且不越界的规则数字 `version`、新的 Bootstrap URL/require 缓存键，并在云端仓库通道元数据中切换到新入口。
- 程序内更新页适合更新同一 Shell 能兼容的业务 Release；Shell/Bootstrap 救援必须由云端仓库覆盖导入完成。更新页应明确两者边界，不能把“更新 test.json”描述成已经下发新壳。

分享/Local：所有业务代码内置，不依赖私人 GitHub Remote Manager/latest，清除私人 repo/Raw/账号/Token/Cookie/API Secret。从 Stable 派生，不手抄第二套业务逻辑。

---

# 25. 海阔违禁词兼容

```text
UI 文本        零宽/运行时恢复
URL/域名       拼接/编码后运行时恢复
Header 名值    运行时构造
JSON key       保持协议真实语义
签名字段       恢复原值后参与签名
PrivateJS      单独检查
```

禁止整个规则 JSON 无脑 `.replace()`。

---

# 26. 样本能力基线

- **Hiker Gallery**：原生组件 Design System。
- **初学者写源工具**：工具页、输入、导入、动态管理。
- **模板·Q**：HTML Signature Mapping、候选 Parser、动态分类；仅用于开发/诊断阶段的自动匹配。
- **DR模板**：自动模板、动态分类、直链判断、通免/委托解析、`video://`、`webRule/x5Rule` 多层播放策略。
- **获取Favicon·α**：多策略图标发现；正式应用最终固化 assets。
- **JavDB2**：Page Module、搜索、收藏、登录隔离。
- **网飞猫**：API Client、动态域名、Token/HMAC/AES。
- **瓜子影视**：Native Extension 可选增强。
- **青豆剧场**：Provider/Adapter、Runtime、弹幕/解析/网盘、渐进详情。
- **聚阅**：Source SDK、Provider Manager、并发搜索、Provider 私有状态。
- **dm盒子**：Playback/Danmu/Parser 全链。
- **R星精选**：InputStream、AES/XOR、多媒体 ImageAdapter。
- **摸鱼日报**：加密 API + InputStream AES 图片流转换。
- **哔咔/阅漫君/阅动漫**：章节图片、评论、下载、图片解密。
- **哔哩/新片场/光影剧场**：App 化详情、作者、社区、相关推荐。
- **一个APP2**：Crypto Runtime 复用、API/图片 AES。
- **123/PikPak/迅雷/光鸭/云盘君**：FileProvider、Token 生命周期、直链/转码、多画质/字幕/弹幕/下载。
- **磁力君**：规则管理、动态/并发搜索。
- **MissAV**：薄入口不过度架构。
- **规则仓库历史包**：自举、Recovery、缓存、通道和 UI Contract。

只学习结构，不把历史协议常量当长期真理。

---

# 27. 本项目已验证、默认继承的经验

## ACFun

图片：缩略图 → 明文判断 → 必要解密 → 本地缓存。  
播放：已有 URL 优先，缺失才请求播放许可/解码；HLS 按需缓存；弹幕不阻塞首次播放。  
UI：主栏目/筛选/快捷入口/Feed 整体设计，顶部控制区不能无限增长。

## 我的规则仓库

- 功能多不等于产品成熟。
- build/schema/revision 不占首页主视觉。
- UI Foundation/Runtime Contract 防共享能力遗漏。
- UI 大改必须 Test + 实机截图。
- RC7 实机确认：固定选项优先明确 `select://` 路由比猜 `$().select` 参数重载更稳；备份恢复等简单输入可采用 `input://`，但仍须 Test 验证。
- RC7 实机确认：`icon_5_no_crop` 在当前设备可正常承载五项导航活动图标；这不是“所有设备永远兼容”的结论，后续不同海阔版本仍按 Test 验收。
- 同一选中状态只保留一个明显信号；活动蓝色图标已经足够时不要再叠加黑色 `●`。
- 密集程序管理页中，把 2~3 个辅助标签并入主卡描述往往比“主卡 + 独立 chips 行”更紧凑；后者在海阔原生横向组件不足宽时还可能产生额外溢出 `>`。
- 目标设计稿的布局关系要转译为海阔原生任务层级；实机证明的灰色按钮墙应放弃，不为了形式双栏继续堆 `text_2`。
- 普通 `setResult` 结果项不能凭空获得固定底栏。目标设备已证明 `x5_webview_single + desc:'float&&top'` 会露出浏览器工具栏，`list&&screen-100` 又可能让外层结果页连同底栏一起滚动；本项目当前受控方案是单个 `x5_webview_single + desc:'float&&screen-100'`，再由网页外壳锁定高度和双轴溢出。
- 固定五栏工作台采用单 DOM 内部路由：首页只让程序列表滚动，分类在右栏原地展开程序卡，搜索、详情、更新、设置和记录均替换工作区而不反复创建海阔页面；内部返回栈保存来源视图和滚动位置。
- `fba.open` 仅用于真正离开管理工作台的业务动作，例如打开/导入某个程序或更新仓库 Core。分类、搜索、详情与设置切换不得调用它；桥接 URL 仍必须携带当前 `rule`。
- 网页工作台通过 `fba.parseLazyRule` 执行动作时，lazyRule 的输入基址必须是完整 `http://` 或 `https://` 地址；原生列表常用的 `#noLoading#` 只适用于原生 Item，不可直接复用到网页桥。解析结果必须按导入口令、提示、复制、确认和合法业务 URL 分流，不能把未知文本兜底当网址打开。
- 网页桥解析出的 lazyRule 回调可能没有当前规则上下文。回调内加载子页面模块时，不能写裸 `$.require('hiker://page/<path>')`，应在生成动作时把 `hiker://page/<path>?rule=<原始规则名>` 作为显式参数传入。承担安装、恢复或诊断职责的工具还应提供版本化 Bootstrap fallback，使子页面未注册或旧 Shell 残留时仍能恢复 Core；所有加载错误返回可读 `toast://`。
- `fba.open` 子页面 URL 的 `rule` 值必须按目标设备实测传递。当前海阔版本要求原始中文规则名；对整个规则名执行 `encodeURIComponent` 会被当作另一个不存在的小程序。业务 id 可继续编码，并应在 `extra` 中保留未编码值作为参数兜底。

## JavDB v3

- Stable/Test/Local lineage 是交付契约。
- 分片/压缩 Runtime 属于交付层，业务/UI 不依赖其细节。
- Local 从 Stable 派生并做最终隐私门禁。

---

# 28. 典型反模式

```text
页面同时写网络、AES、UI、收藏、播放
每个页面复制 Token/签名
所有 Provider 一起初始化
所有筛选常驻首屏
Emoji 充当主图标体系
大量 blank_block 造布局
技术版本信息占 Hero
普通 movie/text 塞任意 HTML
评论/推荐/弹幕阻塞首屏
每次请求重复 eval CryptoJS
每张加密图反复下载解密且不缓存
不判断明文就强行解密
所有 HLS 都 cacheM3u8
有 API/源码直链仍先网页嗅探
把 video://、webRule、x5Rule 统称“免嗅”
自动模板匹配器长期留在 Stable 每次猜页面
第三方 favicon API 作为唯一正式图标源
严重 Bug 在同一 Stable release 原地 patch
错误页只有“失败”
```

---

# 29. 新项目默认目录

```text
apps/<category>/<app>/
├─ README.md
├─ CHANGELOG.md
├─ manifest.json
├─ stable.json / candidate.json / test.json
├─ bootstrap_vxxx.js
├─ assets/
└─ releases/<version>/
   ├─ core.js
   ├─ protocol.js
   ├─ request.js
   ├─ models.js
   ├─ provider.js
   ├─ image_adapter.js
   ├─ playback_adapter.js
   ├─ community.js
   ├─ ui.js
   ├─ home.js
   ├─ search.js
   ├─ detail.js
   ├─ settings.js
   └─ release.json
```

小型原型可先单文件验证协议；长期维护后尽早分层。

---

# 30. AI 的主动产品负责人职责

AI 必须同时承担：

```text
产品经理
UX/UI 设计师
架构师
协议/媒体工程师
程序员
测试负责人
发布负责人
```

用户没点出的明显 UI/性能/架构问题也应主动发现；有更符合海阔原生能力的方案时主动采用；高风险设计先 Test，不牺牲 Stable。

---

# 31. 文档自进化协议

每次开发结束自动分类：

```text
程序专属接口/签名/解密/Bug
→ 目标程序 CHANGELOG

跨程序可复用的写法/组件/架构/媒体 Pipeline
→ 本 GUIDE

已经发生或高概率踩的坑
→ HIKER_APP_DEVELOPMENT_CAUTIONS.md

长期产品/发布/仓库决策
→ PROJECT_PLAN.md
```

更新 GUIDE 时：

1. 先查是否已有同类章节。
2. 优先强化/替换旧规则，不无限追加重复段落。
3. 新 API 先核对当前官方手册。
4. 样本经验先理解源码；高风险方法再实机验证。
5. 旧方法不再推荐时明确降级/废弃。
6. 文档更新后只需简要告诉用户改了哪份、增加什么。

---

# 32. 最终 Definition of Done

### 产品/UI

- [ ] 核心任务路径清楚。
- [ ] 页面层级/组件选择经过设计。
- [ ] 主/次/低频动作有层次。
- [ ] 图标/卡片统一。
- [ ] 长文本/空数据/错误态可用。
- [ ] 实机截图至少一轮视觉检查。

### 数据/协议

- [ ] Request/Protocol/Provider/UI 分层。
- [ ] Token/签名/解密没有散落页面。
- [ ] Provider 原始字段已转标准 Model。
- [ ] 缓存 key/schema 可控。

### 图片

- [ ] Header 正确。
- [ ] 明文/加密可区分。
- [ ] ImageAdapter 返回正确 InputStream/URL。
- [ ] 解密缓存策略明确。
- [ ] 缩略图/原图层级合理。

### 播放/阅读

- [ ] 已优先尝试 A 级结构化免嗅。
- [ ] 只有前级不可行才进入委托解析/嗅探。
- [ ] 多线路 Header 对齐。
- [ ] M3U8 处理按协议使用。
- [ ] 字幕/弹幕不无谓阻塞首次播放。
- [ ] 漫画阅读/下载共用章节内容链。
- [ ] 播放失败能看到 route/stage。

### 稳定性

- [ ] Guard/静态检查通过。
- [ ] Candidate/Test 关键路径实机通过。
- [ ] Stable 未原地覆盖。
- [ ] 回退/Recovery（适用）有效。
- [ ] 目标程序 CHANGELOG 同步。
- [ ] 新通用经验已自动沉淀。
