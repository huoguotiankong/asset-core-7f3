# 酷安样本复盘：多实体社区 + 搜索中心 + 应用/数码数据库

日期：2026-08-25  
样本：`酷安.hk小程序.zip` + 用户当前全部实机截图  
性质：样本研究档案 / UI + 功能 + 指令 + 工程双轨复盘

> 证据等级：`[源码确认]` 为当前上传包 `rule.json/pages/data.zip` 可读源码直接证明；`[实机确认]` 为用户当前截图直接证明；`[推断]` 只作为研究方向，不进入 Stable 技术事实。

---

# 1. 产品定位

这套样本不是单纯“酷安资讯流”，而是一套多实体社区客户端。当前可确认的能力域包括：

```text
Home / Discover
├─ 首页 / 数码 / 发现 / 订阅 / 搜索
├─ 头条 / 热榜 / 快讯 / 话题 / 新机
├─ 酷品 / 酷图 / 看看号 / 好物榜
└─ 周榜 / 日榜 / 月榜等榜单

Search
├─ 动态
├─ 应用
├─ 游戏
├─ 用户
├─ 话题
├─ 数码
├─ 二手
├─ 问答
├─ 应用集
└─ 看看号

Community
├─ Feed 动态
├─ 图文
├─ 酷图
├─ 问答
├─ 点评
├─ 评论 / 回复
├─ 话题
├─ 动态分享
└─ 用户主页

Entity Database
├─ 数码产品
├─ 应用 / 游戏
├─ 应用集
├─ 收藏单
├─ 看看号 / 专栏
└─ 商品 / 好物

Local Subscription
├─ 用户
├─ 帖子
├─ 话题
├─ 数码
├─ 应用
├─ 应用集
└─ 看看号
```

长期结论：这类社区型产品不能只抽象成“Feed + Search”。需要显式支持多 Entity Type、统一路由和实体级页面模型。

---

# 2. UI / 产品设计复盘

## 2.1 顶部双层频道结构

[实机确认][源码确认]

页面顶部采用：

```text
海阔一级规则 Tab
→ 酷安内部一级模式：首页 / 数码 / 发现 / 订阅 / 搜索
→ 当前模式内部二级 Tab
```

内部 Tab 通过 `scroll_button` 构建，活动项使用粉色 `#FA7298` + 浅色背景。

优点：

- 一级模式稳定，二级业务随模式变化。
- 大量频道不会全部挤在一个水平条里。
- 搜索、数码、发现、订阅是真正不同任务，而不是普通筛选。

长期建议：大型多域程序采用“全局任务 Tab → 域内 Tab”，不要把所有分类放进同一级。

## 2.2 搜索页：Search Hub，而不是一个输入框

[实机确认][源码确认]

截图和源码确认搜索页由：

```text
搜索类型状态
→ 大输入框
→ 热门搜索
→ 搜索历史
→ 搜索结果
```

组成。

搜索类型通过系统选择面板切换，支持 10 种 Entity Type；历史最多保留 10 条，自动去重，长按单条可删除，并提供全量清空。

这是很成熟的“搜索中心”模式，适用于社区、资源站、规则仓库、云盘、漫画、影视等多实体产品。

## 2.3 Feed：正文优先，附件按语义分层

[源码确认][实机确认]

Feed 基本结构：

```text
Avatar Header
→ 评分/标题（若有）
→ 正文 RichText
→ 图片
→ 关联实体卡片（产品/话题/目标）
→ 点赞 / 评论 / 分享
```

没有强行把每条 Feed 装进厚卡片容器，正文和图片本身承担主要视觉权重。

图片数量由设置控制；Feed 中只展示前 N 张，详情/回复可展示完整图片。

可复用：社区 Feed 应允许“列表缩略展示 → 详情完整展开”，避免长图组拖垮首页。

## 2.4 评论页：低装饰、高可读

[实机确认][源码确认]

评论页提供 `默认 / 最新 / 热门 / 楼主` 排序，并使用用户头像、时间、正文、回复关系作为主要层级。

长期建议：评论区优先正文密度与回复关系，不需要复杂卡片装饰；排序属于页面级状态，应和 feedId 绑定。

## 2.5 用户主页：Entity Hub

[实机确认][源码确认]

用户页不是简单资料页，而是：

```text
头像 + 用户名
→ 关注/取关
→ 动态 / 点评 / 图文 / 问答 / 酷图 / 好物 / 收藏单 / 应用集
```

这是一种标准 Creator/User Hub，可迁移到：UP 主、作者、演员、漫画家、发布者、规则作者等。

## 2.6 数码产品页：数据库型页面

[实机确认]

数码库采用三列产品图，详情页再切 `关注 / 参数 / 讨论 / 点评 / 图文`。

产品详情不应该复制 Feed UI。产品本身是一等 Entity，应拥有：

```text
ProductProfile
Specs
Discussion
Rating
Article/Image Content
Related Models
```

这对于以后硬件、设备、软件应用、插件市场类小程序非常有价值。

## 2.7 设置页：功能很强，但应该重新分层

[实机确认][源码确认]

设置页当前包含：

- 帖子显示图片张数。
- 应用详情两套 UI 切换，支持长按预览。
- BUG 反馈。
- 更新日志。
- 关于作者、支持、免责声明。

值得学习的是“设置立即预览”和“切换 Renderer 后局部 `updateItem()` 更新开关图标”。

不值得复制的是把所有产品设置、开发者信息、免责内容混成一个长页面。我们长期应分 `Appearance / Content / Advanced / About`。

---

# 3. 海阔指令与功能技巧

## 3.1 `storage0` + `getMyVar/putMyVar` 分层使用

[源码确认]

样本区分了：

- 搜索历史：`storage0.getItem/setItem`，需要跨会话持久化。
- 当前 Tab、当前搜索类型、评论排序：`getMyVar/putMyVar`，用于当前运行状态。
- 部分响应实体：`storage0.putMyVar/getMyVar`，作为页面缓存。

长期建议：

```text
Persistent User Data → storage0/getItem
Page/Session State → getMyVar/putMyVar
Entity Cache → namespace + entityId + queryContext
```

不要所有状态都塞同一种存储。

## 3.2 搜索历史去重、限长、单条长按删除

[源码确认]

`_Get_keyword()`：

```text
读历史
→ 过滤同关键词
→ 超过 10 条删最老
→ push 新关键词
→ 保存
```

单条历史通过 `extra.longClick` 暴露删除菜单。

这是非常适合所有搜索页的通用 UX。

## 3.3 `select://` / `$().select` 用于高维选项面板

[源码确认][实机确认]

搜索类型、评论排序等使用系统选择面板，不在页面上永久铺开所有选项。

长期规则：

- 高频 3~5 个值可常驻 `scroll_button`。
- 低频或 6+ 项优先系统选择面板/更多菜单。

## 3.4 `updateItem()` 用于设置页 Toggle，不整页刷新

[源码确认]

应用详情 Renderer 在两个模式之间切换时，只更新两个条目的图标状态：

```text
setItem(activeRenderer)
→ updateItem(application1)
→ updateItem(application2)
```

长期建议：纯局部开关优先 `updateItem`，不要 `refreshPage()`。

## 3.5 `addListener('onClose')` 清临时状态

[源码确认]

评论排序、用户 Tab、应用详情 Tab 等页面在关闭时清理临时 `MyVar`。

长期规则：

```text
页面临时状态
→ PageScope
→ onClose 清理
```

但不要清掉用户真正需要跨会话保留的偏好。

## 3.6 动态 Entity Renderer

[源码确认]

`_layoutDetermineParse()` 按 `entityTemplate / entityType` 分发：

```text
imageCarouselCard_1
imageSquareScrollCard
iconLinkGridCard
sortSelectCard
feedListCard
imageTextGridCard
textCard
user
collection
album
liveTopic
topic/product/apk/dyh
pear_goods
feed/feed_reply/nodeRating
```

这是本样本最值得学的架构之一：服务端返回不同实体，统一进入 Dispatcher，再交给专用 Renderer。

推荐演化成：

```text
EntityDispatcher
→ Registry[entityType/entityTemplate]
→ Renderer
```

不要长期维护巨大 `if/else` God Renderer。

## 3.7 内嵌 HTML 轮播 / 横向 ScrollCard

[源码确认]

`data.zip` 内含：

- `Carousel.html`
- `ScrollCard.html`

通过 `x5_webview_single` 加载，使用 `fy_bridge_app.getInternalJs()` + `fba.getVar/open()` 与海阔页面交互。

轮播支持：

- 自动播放。
- 左右触摸/边缘点击切换。
- 指示点。
- 图片点击桥接回海阔二级页面。

这是“原生组件不够时，小面积 Web UI + Bridge”的有效模式。

长期规则：只有原生组件确实无法满足轮播/复杂手势时再引入，不把整页都改成 WebView。

## 3.8 可分享深链

[源码确认]

Feed 分享支持：

```text
普通链接分享
海阔口令分享
```

海阔口令将分享 URL 编码后路由到 `hiker://page/import.tool`，再恢复 feedId 并打开帖子详情。

可复用思想：分享的是稳定 Entity Deep Link，而不是把整页 UI/缓存序列化出去。

## 3.9 本地跨实体订阅

[源码确认]

样本维护 `subscription.js`，按实体类型分别保存：

```text
user / topic / card / album / product / apk / dyh
```

长按卡片支持：关注/取消、置顶、置底。

长期建议：本地收藏/订阅应使用统一 `SubscriptionStore<EntityRef>`，包含：

```text
entityType
entityId
providerId
title
cover
createdAt
sortOrder
```

不要为每种实体散落一套读写代码。

---

# 4. 协议与 Request 层

## 4.1 动态 Token 生成和 TTL

[源码确认]

样本生成随机 device 字符串，并基于时间戳、MD5、Base64、BCrypt 生成 v2 Token；Token 缓存 1 天后再重新生成。

长期可学的是：

```text
SignMaterial / DeviceIdentity
→ Signer
→ TTL Credential Cache
→ RequestClient
```

不可把当前酷安版本号、常量、Token 算法当永久事实。

## 4.2 Java DEX 作为算法 Runtime

[源码确认]

`bcrypt.dex` 通过：

```js
loadJavaClass('hiker://files/data/酷安/bcrypt.dex', 'org.mindrot.jbcrypt.BCrypt')
```

调用 BCrypt。

长期原则：

- 当纯 JS 算法性能/兼容性不足时，可把稳定、局部算法封装为 DEX。
- DEX 只解决 Crypto/Codec 等窄能力，不承担业务 God Runtime。
- 必须 versioned、可回退、可诊断。

## 4.3 统一 Request Client

[源码确认]

`_demol_Ajax()` 集中：

- Base URL。
- Query String。
- UA / App Token / Device Header。
- GET/POST。
- Header-only 下载跳转。
- 返回 `.data`。

模式值得继承，但需要现代化为显式错误对象而不是 `eval(response)`。

---

# 5. 需要现代化改写的实现

## 5.1 巨型 `Config.view` God Object

当前单文件页面模块超过 10 万字符，协议、状态、Renderer、搜索、详情、设置、下载、分享都放在一个对象。

以后应拆：

```text
CoolapkClient / Signer
EntityDispatcher
FeedRenderer
SearchPage
UserPage
ProductPage
AppPage
SubscriptionStore
SettingsPage
```

## 5.2 Entity Dispatcher 不能继续用长 `if/else`

当前支持类型继续增长后维护成本会指数上升。

推荐 Registry：

```js
renderers = {
  feed: renderFeed,
  user: renderUser,
  product: renderProduct,
  apk: renderApp
}
```

并为未知 Entity 提供 fallback card + diagnostic。

## 5.3 搜索状态必须按 Entity Type 隔离

样本使用 `:keyword` + `searchType`，但多页并发时仍可能互相影响。

推荐：

```text
SearchContext = { keyword, entityType, filters, sort, cursor }
cacheKey = hash(SearchContext)
```

## 5.4 评论游标/排序需要 feedId 命名空间

当前 `:replyListType`、`:replyNext` 属于泛 Key。

应改为：

```text
<app>_comment_<feedId>_sort
<app>_comment_<feedId>_cursor
```

---

# 6. 总结：酷安样本新增的长期能力母版

这套样本形成新的产品母版：

**Multi-Entity Community / 多实体社区工作台**

核心特征：

```text
多实体搜索
+ 社区 Feed
+ 用户主页
+ 评论/回复
+ 话题/榜单
+ 产品/应用数据库
+ 本地跨实体订阅
+ Entity Dispatcher
+ Deep Link 分享
```

适用未来程序：

- ACFun / B站社区增强。
- 微博/论坛/图文社区。
- 漫画/小说社区。
- 规则/插件市场。
- 应用市场/硬件数据库。
- 同时具有内容、用户、产品、话题多实体的聚合程序。

学习原则：学它的“Entity 化 + Dispatcher + Search Hub + User Hub + Local Subscription + 小面积 Web Bridge”；不复制旧协议常量、God Object、泛状态 Key 和同步阻塞等历史实现。
