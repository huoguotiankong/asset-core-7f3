# HIKER_APP_DEVELOPMENT_GUIDE 补充：哔哩.cy 样本新增通用基线

日期：2026-08-25  
来源：`哔哩.cy.hk小程序(1).zip` + 当前实机截图  
完整证据：`docs/HIKER_SAMPLE_BILI_CY_REVIEW_20260825.md`

> 本补充只保存跨程序可复用的方法。B站当前 API 路径、签名细节、Cookie 字段、会员策略等属于站点协议事实，后续实际开发必须重新验证，不作为永久常量。

---

## 1. 登录账号型内容平台必须把 AccountSession 设为独立能力域

推荐：

```text
AccountSession
├─ AccountStore
├─ LoginBridge
├─ SessionHealth
├─ ActiveAccountResolver
├─ CsrfProvider
└─ AccountMigration
```

不要让 Home/Detail/Community 页面各自直接读本地 Cookie 文件、各自判断登录、各自解析 CSRF。

账号数据推荐显式 `activeAccountId`：

```js
{
  activeAccountId: 'acc-1',
  accounts: {
    'acc-1': {
      userId: '',
      displayName: '',
      avatar: '',
      membership: {},
      sessionRef: ''
    }
  }
}
```

不要依赖“数组第0项永远是当前账号”作为长期合同。

## 2. Session Health 使用 TTL + active-first

账号有效性检查属于网络成本，不应每次普通页面都验证全部账号。

推荐：

```text
local session
→ fresh health cache ? use
→ 必要时验证 active account
→ active 失效
→ 查候选账号 / 提示切换
→ 最后进入登录
```

账号很多时避免：

```text
打开首页
→ for 每个账号
→ 串行联网校验
→ 才开始显示内容
```

## 3. Login WebView 使用“成功条件触发读取”，不要高频轮询凭据

适用网页登录时：

```text
x5_webview_single
→ 用户完成登录
→ URL/DOM/session 状态命中登录成功条件
→ 单次读取 Cookie/Token
→ 服务端验证
→ 保存 Session
→ 退出 WebView
```

网页登录是认证桥，不是长期凭据监听器。

## 4. ReadClient 与 MutationClient 分开

账号型平台的“看数据”和“改数据”不是同一合同：

```text
ReadClient
  feed/search/detail/profile/history/collection

MutationClient
  like/favorite/follow/watchLater/comment/subscribe
        ↓
CsrfProvider / AuthHeaderProvider
        ↓
MutationResultAdapter
```

Mutation 统一返回：

```js
{
  ok: false,
  code: 0,
  message: '',
  statePatch: null
}
```

UI 只在 `ok=true` 后执行 `updateItem()` 更新状态和计数。

## 5. ModeHub：大量一级业务入口不要做常驻按钮墙

账号型平台可能同时有：

```text
推荐 / 热门 / 片库 / 订阅 / 关注 / 收藏 / 历史 / 动态 / 账号
```

可采用：

```text
Avatar / Account Status
+ 当前 Mode
+ 系统选择面板
```

Mode 使用持久状态恢复，但代码实现使用显式 Router：

```js
HomeModeRouter.render(mode, context)
```

禁止通过 `eval` 其它页面源码切 Mode。

## 6. Creator 页面使用 EntitySeed → Lazy Enrich

跨页先传最小稳定 Seed：

```text
creatorId
name
avatar
```

首屏直接显示；更完整的签名、认证、生日、学校、粉丝关系等资料在用户需要时再请求：

```text
Seed
→ immediate render
→ expand/profile action
→ CreatorEnricher
→ addItemAfter/updateItem
```

这可以降低首屏延迟和风控请求数。

适用：演员、导演、作者、漫画家、UP 主、主播、声优等。

## 7. Creator 不只是一个作品筛选条件

Creator 至少可以拥有：

```text
Profile
Relationship
Dynamic
Article/Post
Collection/Series
Works
```

如果数据源支持稳定 Creator ID，不要把“点击作者”退化成按名字再搜一次。

## 8. Collection / Series / Folder 使用一级实体模型

推荐：

```js
Collection = {
  id: '',
  title: '',
  description: '',
  cover: '',
  creator: null,
  sections: [
    { id: '', title: '', count: 0, items: [] }
  ]
}
```

合集、系列、片单、播放列表、漫画专题等都可以使用同一类结构。

Section 展开/折叠优先局部更新：

```text
section header id
+ item cls
→ deleteItemByCls()
→ addItemAfter()
```

无需整页刷新。

## 9. Subscription Card 同时显示“已看进度”和“最新进度”

连续内容的关键不是只有“更新至 X 集”，而是：

```text
UserProgress
LatestProgress
Delta
```

适用：番剧、电视剧、短剧、漫画、小说、有声书、课程。

推荐 Renderer：

```text
作品名
简介 / 分类
看到第 N 集
更新至第 M 集（当 M>N 时重点强调）
```

## 10. Dynamic / Activity Feed 使用 Adapter Registry

动态内容经常是 tagged union：

```text
VIDEO
TEXT
IMAGE
FORWARD
ARTICLE
LIVE
UNKNOWN
```

推荐：

```js
DynamicAdapterRegistry[type].toModel(raw)
DynamicRendererRegistry[type].render(model)
```

不要持续扩大单个 `if/else` God Renderer。

图片动态可用 Avatar + Rich Text + `pic_3_square`；视频动态使用视频卡；未知类型产品化降级，不因单项失败拖垮整个 Feed。

## 11. CursorState 必须按完整 Query Scope 隔离

Offset/Cursor 分页推荐：

```js
CursorKey = [
  appId,
  providerId,
  accountId,
  route,
  entityId,
  filterHash,
  page
].join(':')
```

历史、动态、关注等页面不能都把 `2/3/4` 当全局 cursor key。

## 12. 签名材料与 Signer 分离

如果签名依赖动态服务端材料：

```text
SignMaterialProvider
→ TTL Cache
→ Signer
→ RequestClient
```

不要每一个签名请求都先请求一次材料接口，也不要把当前动态 key 写死在页面。

## 13. 搜索建立 SearchMode + EntityResult

推荐：

```text
SearchMode
ALL / CONTENT / CREATOR / VIDEO / SERIES / ARTICLE
```

Provider 输出标准 Entity：

```js
{
  entityType: 'video|series|creator|article',
  id: '',
  title: '',
  cover: '',
  summary: '',
  metadata: {}
}
```

Renderer 根据 `entityType` 决定页面和卡片，而不是不同搜索接口各自从头写一套 UI。

## 14. DASH 播放使用 TrackSet，而不是“一个 URL”

推荐：

```js
MediaTrackSet = {
  videos: [
    { id, quality, codec, url, headers }
  ],
  audios: [
    { id, codec, language, url, headers }
  ],
  subtitles: [],
  danmaku: null,
  progressiveFallback: []
}
```

然后由 PlaybackAdapter 做：

```text
quality selection
→ video/audio compatibility
→ player model
```

不要为了数组长度一致直接复制最后一条音轨。

## 15. 播放历史上报与媒体解析分离

推荐：

```text
PlaybackProvider.resolve()
HistoryReporter.reportStart()/reportProgress()
```

即使历史上报失败，也不应导致真实媒体地址不可播放；反之媒体解析失败也不应制造“历史上报成功=播放成功”的假状态。

## 16. PGC Detail 使用可组合 Capability Modules

复杂详情页可以拆：

```text
Metadata
Schedule
Subscription
Community
RelatedSeries
Extras / PV
EpisodeLayout
EpisodeRange
PlaybackAdapterSelector
```

Transient 状态使用 `putMyVar` 并在 `onClose` 清理；长期偏好如“列表/双列”使用持久状态。

`setLastChapterRule()` 只凭稳定 entity id 独立获取最新进度，不依赖当前详情临时数组。

## 17. 账号平台 UI 组件按任务切换

可作为后续设计参考：

```text
热门快速刷       → 双列横图
推荐 Feed        → 左图右文
内容片库         → 三列海报
追更/订阅        → 带 UserProgress/LatestProgress 的竖图文
动态社区         → Avatar + RichText + 图片宫格
评论             → Avatar + Meta + 正文
视频详情         → Hero + Creator + Actions + Description
合集/系列         → Hero + Creator + Folder Sections
```

统一的是视觉 Token、间距、字号和状态色，不是强制统一卡片比例。