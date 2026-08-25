# 青豆小程序样本复盘：UI + 功能 + 指令 + 工程模式

日期：2026-08-25  
样本：`青豆.hk小程序(1).zip` + 用户当前 12 张实机截图  
性质：样本研究档案 / 供 GUIDE、CAUTIONS 与后续影视类程序设计追溯

> 证据等级：`[源码确认]` 为当前上传包可读源码直接证明；`[实机确认]` 为用户当前截图直接证明；`[推断]` 只表示合理推测，不作为 Stable 技术事实。

---

# 1. 定位：它不是单纯“豆瓣皮肤”，而是可配置的影视元数据工作台

[源码确认][实机确认] 青豆把影视发现、筛选、榜单、片单、上映、详情、人物、剧照、评论、片源入口和用户自定义配置放在一个规则里。截图能看到：

```text
首页
├─ 找电影
├─ 找电视
├─ 榜单
├─ 片单
├─ 热门
├─ 将上映
├─ 搜索
├─ 收藏 / 历史
└─ 豆瓣推荐区

详情
├─ 基础资料 / 豆瓣评分
├─ 剧照
├─ 演职
├─ 短评
├─ 剧评
├─ 快速搜索
├─ 在线片源
├─ 剧情简介
└─ 相关推荐

人物
├─ 简介
├─ 获奖记录
├─ 影视作品
└─ 演员照片
```

这类程序最值得学习的是“影视 Metadata Hub / Entity Graph”思路：影片、人物、奖项、片单、榜单、剧照、评论都不是孤立字符串，而是可点击、可分页、可继续进入详情的一等实体。

---

# 2. UI / 产品层复盘

## 2.1 首页：任务入口优先于海报瀑布

[实机确认] 当前用户配置下：首页顶部先用三张竖海报建立影视氛围，随后是“找电影 / 找电视 / 榜单 / 片单 / 热门 / 将上映”等明确任务入口，再放搜索、收藏/历史和推荐内容。

这和网飞猫 Catalog 类似，但更偏“工具工作台”：用户不是只下滑找内容，还会频繁进入筛选、榜单、片单、上映页。

可复用原则：

- 影视 Metadata 工具的首屏可以先给 5~6 个高频任务入口，再进入内容 Feed。
- “榜单 / 片单 / 将上映”应是独立业务入口，不要全部伪装成普通分类筛选。
- 收藏/历史属于用户资产，可作为成对次级入口，但不抢首页 Hero。

[源码确认] 默认首页本身只是 `card_pic_1 + 6 个 icon_2`。当前截图中的三海报首页来自用户自定义首页配置；上传包没有包含该运行时配置，因此只能确认效果，不能反推其内部具体实现。

## 2.2 找电影：长筛选 + 高 metadata 列表

[源码确认][实机确认] `findMovie()` 使用多组 `scroll_button` 管理：

```text
类型
地区
年份
标签（支持多选）
排序
是否仅有片源
评分区间
```

而且支持“自定义类型 / 自定义地区 / 自定义年份 / 自定义标签”。结果并非统一三列海报：普通电影使用 `movie_1_vertical_pic`，片单/榜单等实体可以使用 `card_pic_1` 等不同组件。

可复用原则：

- 长筛选不只需要“预设项”，对长尾用户可增加受控的自定义值入口。
- 多选标签应作为 `Set<String>` / 数组建模，不要依靠 UI 标题判断选中态。
- 筛选结果 metadata 丰富时，用纵向图文列表比三列海报更适合展示“地区 / 类型 / 评分”。
- `scroll_button` 溢出 `>` 在这种真实长筛选里有合理“更多”语义。

## 2.3 榜单与片单：把“集合”当成一等实体

[实机确认] 榜单首页先选电影/电视剧，再选口碑榜单/年度榜单/类型榜单；具体榜单卡片是大面积视觉卡。进入榜单后再展示榜单说明、过滤条件和作品列表。

片单页先用横向标签切换片单类型和内容类型，然后用纵向图文列表展示“片单封面 + 标题 + 共 N 部”。

可复用原则：

```text
Collection List
→ Collection Detail
→ Collection Items
```

“榜单/片单/专题/奖项合集”都应有独立 `CollectionModel`：id、title、cover、desc、itemCount、type、period、source，而不是把它们降级成一个搜索关键词。

## 2.4 详情：元数据很多，但视觉层级仍清楚

[源码确认][实机确认] 默认详情使用 `movie_1_vertical_pic_blur` 做 Hero，再把豆瓣评分单独做成 `text_center_1` 强视觉块，下面用四个 `icon_round_small_4` 进入剧照/演职/短评/剧评。

当前截图的核心层级：

```text
Hero 基础资料
→ 豆瓣评分
→ 剧照 / 演职 / 短评 / 剧评
→ 快速搜索
→ 在线片源/尚无片源
→ 剧情简介
→ 相关推荐
```

值得继承：

- 详情页高价值子域用 4 个同级图标入口，比把 20 个信息模块全部铺在详情页更清楚。
- 评分是决策信息，可以单独强化；但不应和播放主操作抢第一层级。
- “尚无片源”是产品状态，不应隐藏；Metadata 详情仍可继续使用。
- 相关推荐放详情尾部，避免阻塞首屏。

## 2.5 剧照页：先汇总统计，再进入图片扫描

[源码确认][实机确认] `stillsList()` 使用“剧照 / 海报”两个 `scroll_button`，第一页先展示总数和来源统计，再用 `pic_2` 双列图片列表；大图点击直接打开原图。

这类媒体图库适合：

```text
Gallery summary
→ Gallery type tab
→ thumbnail grid
→ original image
```

对于剧照、海报、写真、漫画附图、作者图片等，都比“所有图片混在一页”更有结构。

## 2.6 演职与人物页：从演员列表进入完整人物图谱

[源码确认][实机确认] `credits()` 使用 `movie_1_vertical_pic` 展示中文名、拉丁名、角色/职业。点击人物进入 `elessarView()`：

```text
人物 Hero
→ 人物简介
→ 获奖记录
→ 影视作品
→ 演员照片
```

人物作品再走 `elessarWorks()` 分页；人物照片走 `elessarPhotos()`；奖项有独立 `elessarAwards()`。

这比“演员名 → 搜索演员名”成熟得多。以后演员、导演、作者、声优、UP 主等存在稳定 ID 时，应优先建立 `PersonProvider` 和关系模型。

## 2.7 短评：社区内容保持轻卡片

[源码确认][实机确认] `shortCommentList()` 支持热门/最新排序；每条评论使用 `avatar` + `rich_text` + `line`，正文内展示看过评分、赞数和日期。

长期原则：社区列表的主体是“人 + 内容”，不要给每条评论套复杂卡片、按钮墙或大封面。排序属于顶部弱控制。

---

# 3. 功能 / 工程层复盘

## 3.1 `preRule` 做配置初始化、迁移和损坏恢复

[源码确认] 启动时使用：

```text
hiker://files/rules/joker/qdb_config.js
```

若文件不存在：写入 `defaultConfigs`。  
若存在：把内置“默认首页/默认详情”同步到当前配置；若 JSON 解析失败：

```text
旧文件 → qdb_config.js.bak
→ 当前配置重建为 defaultConfigs
```

然后把配置路径写入 `putMyVar("qdb_config", file)`。

这是很值得继承的配置恢复模式：

```text
load persistent config
→ validate schema
→ migrate required defaults
→ corrupt? backup raw config
→ rebuild safe defaults
→ expose current config context
```

但长期项目不应把整份配置当任意 JS 文本；应增加 `schemaVersion`、字段验证和逐版本 migration。

## 3.2 配置系统不是一个 Settings 页面，而是 Plugin Slot

[源码确认] 青豆把以下能力全部做成可切换配置槽：

```text
homePageConfigs
 detailsViewConfigs
quickSearchConfigs
analysisConfigs
```

首页、详情、解析配置都支持：

```text
选择当前配置
➕ 新增
➖ 删除
📝 编辑
📥 导入
📤 导出
⚙️ 设置（适用时）
```

而快速搜索额外支持 `🔁` 排序与组件样式配置。

这说明成熟可配置产品不应只有：

```text
setting.foo = true
```

而可以设计：

```js
PluginSlot = {
  activeId: '',
  order: [],
  items: {
    id: {name:'', config:{}, version:1, enabled:true}
  }
};
```

适合 Source、Parser、详情 Renderer、首页 Layout、搜索目标、播放 Adapter 等可替换模块。

## 3.3 配置编辑页使用“临时编辑状态 → 显式保存 → onClose 清理”

[源码确认] `modeEditPage()` 把输入临时存入 `putMyVar`，`extra.onChange` 只更新编辑状态；用户点“保存”后才写持久配置；页面关闭时通过 `addListener('onClose', ...)` 清理临时变量。

这是正确的 Draft/Commit 模式：

```text
Persistent Config
→ Edit Draft
→ validate
→ explicit Save
→ Persistent Config

Cancel/Close
→ discard Draft
```

以后设置页避免每输入一个字符就直接覆盖正式配置，特别是解析器、远程地址、复杂 JSON/JS 这类高风险配置。

## 3.4 配置导入导出有统一 Envelope + Encoding

[源码确认] `ConfigTool.export/import` 定义了“青豆口令”格式，可选：

```text
Base64
Zipper (LZString)
Paste Service
```

导出中包含配置类型/名称/编码方式，导入后再进入编辑页面，不直接无条件启用。

可复用结论：

```js
ConfigEnvelope = {
  kind: 'home|detail|parser|search',
  schema: 1,
  name: '',
  encoding: 'plain|base64|lz|paste',
  payload: {}
};
```

导入流程必须：识别 kind → 解码 → JSON/schema 校验 → 预览 → 保存；不要把剪贴板字符串直接 `eval`。

## 3.5 默认配置保护 + 活动配置不可删除

[源码确认] 默认首页/详情不能删除；当前正在使用的配置也不能直接删除。恢复默认支持按模块重置或全部清空。

长期原则：任何 Plugin/Theme/Provider Manager 都应至少有：

- built-in default 不可删除；
- active item 不允许无替代直接删除；
- reset-one / reset-all；
- import 前验证；
- corrupt backup；
- active fallback。

## 3.6 快速搜索是“跨小程序搜索目标”配置，而不是详情页写死按钮

[源码确认] `quickSearchConfigs` 包含：

```text
order[]
显示名
目标小程序名
图标
组件样式 mode
```

详情页再生成：

```text
hiker://search?s=<当前影片名>&rule=<目标规则>
```

这可以抽象为 `SearchTargetProvider`：Metadata 小程序只负责提供实体名称，用户可以配置交给哪个小程序继续找资源。

适用于：豆瓣 → 影视源、JavDB → 播放源、漫画 Metadata → 正文源、书籍 Metadata → 阅读源。

## 3.7 自定义解析插件：值得学“接口槽”，不复制任意 `eval`

[源码确认] `analysisConfigs` 至少提供：

```text
不解析：return input
断插：读取外部配置 → eval 解析脚本 → aytmParse(input)
```

详情通过统一 `lazy` 接口把片源 URL 交给当前解析配置。

正确抽象应该是：

```js
PlaybackParser = {
  id: '',
  name: '',
  canHandle: function(ctx){},
  resolve: function(ctx){},
  settingsPage: function(){},
  version: 1
};
```

自研 Stable 不允许“用户导入任意 JS → 直接 eval 成系统级插件”作为默认架构。可配置 Parser 应使用白名单能力、版本化接口、权限边界和错误隔离。

## 3.8 请求层集中做豆瓣 API 参数、签名和重试

[源码确认] `getDoubanRes()` 统一追加 API Key、设备参数、时间戳，并用 CryptoJS `HmacSHA1` 生成 `_sig`；统一 User-Agent，解析 JSON；遇到 `localized_message` 时最多重试 5 次。

值得继承的是：

```text
Protocol.request()
→ normalize params
→ sign
→ headers
→ fetch
→ decode
→ retry policy
→ business error mapping
```

不值得复制的是样本里的固定 API Key、HMAC Secret、固定 UDID/DeviceId、旧 UA 和同步 `Thread.sleep(1000)`。这些都是历史协议常量/阻塞式实现，只能作为协议研究证据。

## 3.9 搜索结果是多实体 SearchResult，不只是影片

[源码确认] `search()` 会区分：

```text
doulist_cards
chart
movie/tv/normal subject
```

并为片单/榜单走各自详情页面。

因此 SearchModel 建议：

```js
SearchResult = {
  type: 'video|person|collection|chart|playlist',
  id: '',
  title: '',
  cover: '',
  meta: {},
  route: {}
};
```

搜索 Provider 负责类型识别，Renderer 按 type 选择卡片/路由，不在点击时再猜数据种类。

## 3.10 影片最新片源状态通过 `last_chapter_rule` 独立请求

[源码确认] 根规则 `last_chapter_rule` 从 URL 参数恢复 `type/id/title`，重新请求对应实体；未指定供应商时返回“共 N 个片源 | episodes_info”，指定 title 时返回该供应商的 `episodes_info`。

这再次验证：收藏/历史最新状态必须能脱离当前详情页独立恢复实体。

## 3.11 电视片源：API 元数据 + 网页结构解析 + Cookie 恢复

[源码确认] 详情 API 给出 `vendors`；电影可直接使用 vendor URL。电视剧则进入 `getTvUrls(id, uid)`：

```text
movie.douban.com/subject/<id>
→ 带 PC UA / 可选缓存 Cookie 请求 HTML
→ 检测登录跳转/人机验证
→ 提取 sources[...] / mixed_static
→ provider uid 映射
→ 解出 play_link 的目标 URL
```

若触发封 IP/人机验证，`releaseIP` 页面会引导导入网页插件、打开豆瓣完成登录/验证，并把 Cookie 写到缓存文件供后续请求使用。

这是一个完整的“结构化 API + HTML fallback + Browser/Cookie Recovery”样本。长期项目应拆成：

```text
MetadataProvider
PlaybackProvider
BrowserAuthRecovery
```

页面不直接承担 Cookie 插件安装、HTML Script eval 和 provider 映射。

## 3.12 相关推荐可并发/异步补齐，不必阻塞详情首屏

[源码确认] 默认详情先输出主结构，再使用 `be(...)` 请求 recommendations 并在固定 anchor 后追加结果。

可复用为：

```text
P0 Hero + Primary Metadata
P1 source / core actions
P2 recommendations / awards / extra media
```

附加推荐失败不能阻塞详情主信息。

---

# 4. 新发现的风险与不应照抄的历史债务

## 4.1 任意 JS 配置直接 `eval` 风险过大

首页配置、详情配置、解析配置本质可以保存任意代码再执行。它给高级用户极大自由，但长期自研程序若直接照搬，会带来：

- 配置文件损坏直接导致页面执行错误；
- 插件可访问文件、Cookie、网络、规则运行时；
- 导入口令成为远程代码执行通道；
- 无法做稳定 schema migration；
- 多配置之间很难静态检查和回退。

长期方案：Plugin Slot 学接口，配置内容尽量结构化；确需脚本插件时使用显式“高级/不受信任”模式并隔离权限。

## 4.2 `getDoubanRes()` 每次请求都 `eval(getCryptoJS())`

这与项目现有 Crypto Runtime 规范冲突。签名频繁调用时应单例加载 Crypto Runtime，不要每请求重复初始化。

## 4.3 重试使用 `Thread.sleep()` 会阻塞页面线程

固定 1 秒 × 最多 5 次会把网络错误放大成明显卡顿。长期使用有限重试 + timeout + backoff；P2/P3 请求失败应直接降级，不同步睡眠阻塞首屏。

## 4.4 固定设备号/API Key/HMAC Secret 不作为通用模板

样本只证明当时存在这些协议字段。任何新豆瓣/APP 协议研究必须重新确认当前 APK/API，不从旧样本复制密钥、UDID、UA 或签名常量。

## 4.5 `eval(sources[i])` 解析网页脚本非常脆

如果只是为了得到结构化 `sources`，长期优先做最小 Parser / JSON 提取；执行整段远端页面脚本会扩大行为面和兼容风险。

## 4.6 `immersiveTheme` 继续不是默认二级页策略

源码中的电影详情、演职人物等多处仍使用 `#immersiveTheme#`。用户截图本次显示正常，但本项目已有其它真实设备回归证明它会引发标题栏叠加，因此仍按“可选、Test 后使用”处理，不推翻 `simple=true` 默认规范。

## 4.7 用户自定义组件样式字符串必须校验

快速搜索允许直接输入 `flex_button / scroll_button / icon_round_small_4 / icon_small_4` 等 `col_type` 字符串。长期系统应提供枚举选择和 allowlist，不允许任意字符串直接进入 Renderer。

---

# 5. 可以直接进入长期方法库的结论

1. **Metadata Hub 应把影片、人物、榜单、片单、奖项、剧照、评论建成实体图谱。**
2. **设置系统可升级为 Plugin Slot Manager，而不是布尔开关集合。**
3. **复杂配置使用 Draft → Validate → Save；关闭页面丢弃 Draft。**
4. **用户配置必须有 built-in default、active guard、reset、backup、migration。**
5. **导入导出使用带 kind/schema/encoding 的 ConfigEnvelope，不执行未经验证的任意代码。**
6. **详情页可以提供可配置的跨小程序 Quick Search Target。**
7. **Parser/Playback Adapter 可插拔，但接口必须版本化、受控、可诊断。**
8. **搜索结果支持多实体类型，路由由 SearchProvider 明确返回。**
9. **长筛选可同时支持预设值 + 受控自定义值 + 多选标签。**
10. **Gallery 先做统计/类型切换，再做缩略图网格和原图。**
11. **人物用稳定 ID 进入 Person → Awards/Works/Photos，而不是姓名搜索替代人物模型。**
12. **API 元数据、网页片源解析和 Browser Cookie Recovery 必须分层。**
13. **推荐/附加媒体属于 P2，异步补齐，不阻塞详情主骨架。**
14. **最新集/片源状态必须由 entityId 独立请求，不能依赖当前详情临时状态。**
15. **样本的固定密钥、固定设备号、同步 sleep、任意 eval 都只作为历史证据，不作为新项目模板。**
