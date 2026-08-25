# 哔哩.cy 样本复盘：账号型内容平台 UI + 功能 + 指令 + 工程模式

日期：2026-08-25  
样本：`哔哩.cy.hk小程序(1).zip` + 用户当前实机截图  
性质：样本研究档案 / 供后续 ACFun、B站、社区视频、创作者平台类程序设计追溯

> 证据等级：`[源码确认]` 为当前上传包 `rule.json` 可读源码直接证明；`[实机确认]` 为用户当前截图直接证明；`[推断]` 只作为研究方向，不进入 Stable 技术事实。

---

# 1. 定位：完整“登录账号型内容客户端”，而不只是视频列表

[源码确认][实机确认] 当前样本覆盖：

```text
Account
├─ 登录 / 退出
├─ 多账号切换
├─ Session 健康检查
└─ 用户头像 / MID / 会员状态

Home Modes
├─ 热映
├─ 片库
├─ 推送
├─ 热门
├─ 订阅
├─ 关注
├─ 收藏
├─ 足迹
└─ 动态

Content
├─ PGC 影视/番剧详情
├─ UGC 视频详情
├─ 分P
├─ 合集 / 系列
├─ UP 主主页
├─ 专栏
├─ 动态
└─ 评论

Mutation
├─ 点赞
├─ 收藏 / 取消收藏
├─ 稍后再看
├─ 追番 / 追剧
├─ 关注 / 取消关注
├─ 移动关注分组
└─ 发表评论

Playback
├─ DASH video/audio
├─ 清晰度名称
├─ Header
├─ durl fallback
├─ 弹幕 XML
└─ 播放历史上报
```

长期结论：这类产品不能只用 `VideoProvider + Renderer`。至少要区分 `AccountSession / Feed / Creator / Collection / Community / Mutation / Playback` 等能力域。

---

# 2. UI / 产品层复盘

## 2.1 首页：Avatar Status Bar + Mode Switcher

[源码确认][实机确认] 登录后首页第一块不是普通 Tab，而是头像 + 用户名 + `当前：热门/片库/推送/...`。点击后通过两列系统选择面板切换：

```text
账号 / 热映 / 片库 / 推送 / 热门
订阅 / 关注 / 收藏 / 足迹 / 动态
```

并通过持久状态保存当前首页 Mode。

可复用：

- 账号型工具若存在很多“我的资产/内容模式”，可用一个紧凑 Status Bar 表示当前账号和当前 Mode。
- 首页主 Mode 可以持久化，用户再次进入恢复上次工作区。
- 低频 Mode 不必全部常驻首页做按钮墙，系统选择面板是一种降密度办法。

改进：

- 自研长期程序应使用显式 `HomeModeRouter`，不要通过 `eval` 其它 page 的源码切模块。
- “账号”属于 Account Center，不应和普通内容 Mode 共用完全相同的业务语义；UI 可以同一入口，但代码域应分离。

## 2.2 片库：可折叠筛选 + 三列竖海报

[源码确认][实机确认] `vault` 使用：

- `scroll_button` 顶部大类：国创 / 电视 / 纪录片 / 综艺 / 番剧 / 电影。
- 一个折叠开关控制完整筛选是否展开。
- 筛选项按站点实际 Filter Block 动态生成。
- 内容使用三列竖海报浏览。

价值：

```text
首屏：只保留高频一级大类
需要精确搜索时：展开多维筛选
完成选择后：仍以海报库为主体
```

这比把全部地区/风格/年份/付费状态长期铺满首屏更适合高维分类库。

## 2.3 不同业务任务使用不同卡片族

[源码确认][实机确认] 该样本没有追求“全站统一一种卡片”：

- 热门：双列横图 `movie_2`，适合快速刷视频。
- 推荐 Feed：`movie_1_left_pic`，标题 + UP + 播放/点赞 metadata。
- 片库：三列海报。
- 订阅：`movie_1_vertical_pic`，突出观看进度与“更新至X话”。
- 动态：Avatar + Rich Text + 图片宫格。
- 评论：Avatar + 时间/地区 + 正文。
- 视频详情：大 Hero + 作者 + 四个核心动作 + 简介。
- 合集详情：Hero + 作者 + Folder Section + 紧凑条目列表。

长期结论：账号平台的 UI 应按照 `Feed / Library / Subscription / Community / Detail / Collection` 的阅读任务选择组件，而不是强制全站同形卡片。

## 2.4 订阅页：观看进度和最新进度同时可见

[源码确认][实机确认] 订阅页区分 `追番 / 追剧`，正文同时显示：

```text
简介
类型 / 地区
用户已看到哪里
最新更新到哪里
```

并把最新更新使用更强颜色表达。

这是非常适合动漫、短剧、连载漫画、小说的“Continuity Card”模式：**用户当前进度与服务端最新进度必须同时出现**，否则“我的追更”价值不足。

## 2.5 Dynamic Feed：内容类型驱动 Renderer

[源码确认][实机确认] 动态不是一张万能卡。源码会根据 Dynamic 类型分别渲染视频、纯文字、图片等内容；图片动态直接铺 `pic_3_square` 宫格，作者用 Avatar，正文可用 Rich Text，底部再放评论/转发/点赞统计。

长期建议升级为：

```text
DynamicAdapterRegistry
├─ VideoDynamicAdapter
├─ TextDynamicAdapter
├─ ImageDynamicAdapter
├─ ForwardDynamicAdapter
└─ UnknownDynamicAdapter
```

而不是持续扩大一个巨型 `if/else` Renderer。

## 2.6 评论页：少装饰，正文优先

[源码确认][实机确认] 评论页只保留：

```text
输入框
→ 用户头像 / 用户名 / IP属地 / 时间
→ 评论正文
→ 下一条
```

没有给每条评论套厚重 Card 背景。对于文字社区，内容密度和可读性比卡片装饰更重要。

---

# 3. Account / Session：值得学习的部分

## 3.1 多账号模型

[源码确认] 本地配置使用 `userList[]`，当前账号固定放在第 0 项，切换账号通过交换顺序实现。

应抽象成：

```js
AccountStore = {
  activeAccountId: '',
  accounts: {
    id: {
      userId: '',
      displayName: '',
      avatar: '',
      sessionRef: '',
      membership: {}
    }
  }
}
```

不建议把“数组第0项”作为长期业务合同；显式 `activeAccountId` 更稳定，也便于迁移和去重。

## 3.2 Session Health + 失效账号清理

[源码确认] 样本会调用登录状态接口判断 Session 是否有效，发现失效后清理无效 Cookie，并尝试切到仍有效账号。

这个行为值得保留，但长期实现应改为：

```text
读取本地 Session
→ fresh health-cache ? 直接使用
→ 必要时只验证 active account
→ active 失效时再处理其它账号
→ 显式提示切换 / 重登
```

不应每次普通页面打开都串行验证全部账号。

## 3.3 登录两条路径

[源码确认] 当前样本支持：

1. 用户手动输入 Cookie。
2. `x5_webview_single` 打开登录网页，WebView JS 周期读取 Cookie，用户再点击确认登录。

产品上“网页登录 + Session 捕获”值得学习；实现上不推荐高频定时轮询 Cookie。自研程序优先：

```text
Login WebView
→ 页面/导航状态达到成功条件
→ 单次读取 Session
→ 服务端验证
→ AccountStore 持久化
```

---

# 4. Read Client 与 Mutation Client 必须分层

[源码确认] 样本已经覆盖多种写操作：点赞、收藏、稍后看、订阅、关注、移动关注分组、发表评论。这类平台不能把所有 API 都当“fetch JSON”。

推荐：

```text
ReadClient
  GET feed/search/detail/profile/history/collection

MutationClient
  POST like/favorite/follow/watchLater/comment/subscribe
        ↓
CsrfProvider
        ↓
MutationResultAdapter
```

每个 Mutation 输出统一结果：

```js
{
  ok: true,
  code: 0,
  message: '',
  newState: {}
}
```

只有服务端确认成功后，Renderer 才 `updateItem()` 更新点赞数、收藏状态、关注状态。

---

# 5. WBI / 签名：协议层动态取材料

[源码确认] `getWbiEnc()` 会：

```text
nav API 获取 img_key/sub_key
→ mixin table 洗牌
→ 形成 mixin_key
→ 参数排序 + wts
→ md5(query + mixin_key)
→ w_rid
```

重要通用经验：**签名算法本身与签名材料生命周期分开**。如果签名依赖服务端动态 key，不能把当前 key 写死进页面层。

推荐：

```text
SignMaterialProvider
→ Signer
→ RequestClient
```

并对 SignMaterial 做短 TTL cache，避免每个签名请求都先额外请求一次 nav。

---

# 6. Creator / UP 主主页：Seed → Lazy Enrich

[源码确认] UP 主页为了减少反爬压力，会从上一个页面先传：

```text
mid + title + face
```

页面先用 Seed 渲染头像栏；用户点击头像时，才通过 WBI API 拉性别、签名、生日、学校、认证等更多资料，并通过 `addItemAfter/deleteItem` 展开/折叠。

这是很值得长期复用的模式：

```text
EntitySeed
→ 首屏立即渲染
→ 用户需要更多信息
→ EntityEnricher
→ 局部插入详细资料
```

适用：UP 主、演员、作者、漫画家、主播、女优、歌手等人物页。

UP 页还把“关注 / 动态 / 专栏 / 合集 / 系列 / 全部视频”拆成不同能力，而不是只展示一个作品列表。这对 ACFun/社区类程序很有参考价值。

---

# 7. Collection / Series：集合是一级实体

[源码确认][实机确认] 合集页：

```text
Hero + 简介
→ Creator
→ Section Folder
→ Section Episodes
```

Section 可以通过 `deleteItemByCls + addItemAfter` 局部折叠/展开。

长期模型：

```js
Collection = {
  id,
  title,
  description,
  cover,
  creator,
  sections: [{ id, title, count, items: [] }]
}
```

不要把合集退化成“标题搜索”或一个普通标签。

---

# 8. Cursor / Offset Pagination

[源码确认] 动态使用 `offset`，足迹使用 `max/view_at/business`，都不是传统页码分页。

正确长期状态必须带 Scope：

```text
CursorKey = app + provider + route + account + query/filter + page
```

不能只使用 `"2" / "3"` 这样的页码作为全局 key。

---

# 9. Playback：DASH Video + Audio + Danmaku 是独立媒体轨

[源码确认] 播放链核心能力：

```text
aid/cid/qn
→ playurl API
→ DASH video[] / audio[]
→ 过滤/命名画质
→ urls + audioUrls + headers + names + danmu
→ durl fallback
```

这类平台的正确媒体模型不是“一个 URL”：

```js
MediaTrackSet = {
  videoTracks: [],
  audioTracks: [],
  subtitleTracks: [],
  danmaku: null,
  headers: {},
  fallback: []
}
```

值得学习：

- video 与 audio 分离处理。
- 清晰度 ID 映射为用户可读名称。
- Header/Referer 属于媒体合同。
- DASH 失败保留 progressive/durl fallback。
- 播放历史上报与“拿播放地址”是两个独立动作。

需要改进：

- 不应为了长度相等盲目复制最后一条音轨；应根据 codec/lang/quality 建立显式 Track 匹配。
- 弹幕缓存路径应该 entity-scoped，例如 `cid + schema`，不能使用页面标题作为唯一 key。
- 会员/权限判断应该由当前官方 Session + Play API 返回共同决定，不引入可逆共享凭据。

---

# 10. PGC Detail：多个能力模块可局部操作

[源码确认] 影视/番剧二级页包含：

```text
影片信息
更新日历
订阅
评论
周边（相关系列 / PV花絮 / 竖屏 / 二创）
显示模式
解析入口
剧集范围分页
选集
Latest Chapter Rule
```

并大量使用：

```text
addListener('onClose')
setLastChapterRule()
updateItem()
addItemAfter()
deleteItem()
getMyVar/putMyVar
setItem/getItem
```

这是很好的“复杂详情页拆能力模块”的样本。

长期建议：

```text
DetailState
├─ scheduleExpanded
├─ episodeRange
├─ episodeLayout
├─ previewVisible
└─ selectedPlaybackAdapter
```

页面关闭清 transient state；用户偏好如“列表/双列模式”才持久化。

---

# 11. Search：搜索结果也是多实体

[源码确认] 主搜索不仅搜 PGC，还额外提供“UP 搜 / Video 搜”；PGC 又分番剧与影视类型。

推荐建立：

```text
SearchMode
├─ ALL
├─ CONTENT
├─ CREATOR
├─ VIDEO
├─ BANGUMI
└─ FILM_TV
```

搜索结果先归一成 Entity，再决定 Renderer，避免每个页面自行拼 HTML 标签清洗和路由。

---

# 12. 本样本中存在但不应直接继承的实现

以下只记录为历史实现，不升级为默认实践：

1. `eval(JSON.parse(request('hiker://page/...')).rule)` 用运行时字符串执行其它页面源码。
2. 外部解析脚本 `eval(fetch(...))`。
3. 可逆 Base64 包装账号凭据后用于“共享权益”。
4. 明文提供复制 Cookie / 分享凭据入口。
5. 未登录页面用 `Thread.sleep` 同步倒计时阻塞。
6. WebView 用极高频定时器持续抓 Cookie。
7. 多个页面直接读取本地凭据文件并自行提取 CSRF。
8. 动态/足迹 Cursor 使用纯页码做 `storage0` key，缺 route/account/query scope。
9. 部分带 Cookie 的请求仍使用 `http://`。
10. 大量全局中文状态 Key，如 `模式/折叠/首页/日历`，没有 App/Page namespace。
11. `immersiveTheme` 继续存在于多个详情入口；本项目仍遵守已有 `simple=true` 安全基线。
12. Dynamic Renderer 是一个不断增大的类型分支函数，长期应拆 Adapter Registry。

---

# 13. 最终沉淀：账号型内容平台 Architecture Blueprint

以后开发 ACFun、B站、社区视频、创作者平台时优先考虑：

```text
AccountSession
├─ AccountStore
├─ LoginBridge
├─ SessionHealth
└─ CsrfProvider

Protocol
├─ ReadClient
├─ MutationClient
├─ SignMaterialProvider
└─ Signer

Domain
├─ Video
├─ Series / Season / Episode
├─ Creator
├─ Collection / SeriesFolder
├─ Subscription
├─ History
├─ Dynamic
└─ Comment

Provider
├─ FeedProvider
├─ CatalogProvider
├─ CreatorProvider
├─ CollectionProvider
├─ CommunityProvider
├─ SubscriptionProvider
├─ HistoryProvider
└─ PlaybackProvider

Adapter
├─ EntityAdapter
├─ DynamicAdapterRegistry
├─ MediaTrackAdapter
└─ MutationResultAdapter

Pages
├─ ModeHub
├─ Feed
├─ Library
├─ Creator
├─ Detail
├─ Collection
├─ Community
└─ AccountCenter
```

这套结构比复制样本的巨型 API 页面更适合本项目长期远程版架构。