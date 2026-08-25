# HIKER_APP_DEVELOPMENT_GUIDE 补充：酷安样本新增通用基线

日期：2026-08-25  
来源：`酷安.hk小程序.zip` + 当前全部实机截图  
完整证据：`docs/HIKER_SAMPLE_KUAN_REVIEW_20260825.md`

> 本补充只保存跨程序可复用的方法。酷安当前 API、Token 算法、版本号、设备字段和站点常量必须在未来实际开发时重新验证，不作为永久事实。

---

## 1. 多实体程序建立 Entity Registry，而不是所有内容都当 Feed

推荐基础模型：

```text
EntityRef
├─ entityType
├─ entityId
├─ providerId
├─ title
├─ subtitle
├─ cover/avatar
└─ route

Entity Types
├─ Feed
├─ User
├─ Topic
├─ Product
├─ App
├─ Collection
├─ Album
├─ Article
└─ Comment
```

服务端/Provider 数据进入 UI 前统一标准化，然后由 Dispatcher 选择 Renderer。

推荐：

```text
Raw Provider Data
→ ModelAdapter
→ EntityDispatcher
→ RendererRegistry[entityType/template]
→ UI Item[]
```

未知类型必须提供 fallback + diagnostic，不允许静默丢失整块内容。

## 2. 搜索页升级成 Search Hub

对于同时支持 3 种以上实体的程序，不要只给一个普通搜索框。

推荐：

```text
SearchType
→ Keyword Input
→ Hot Keywords
→ Search History
→ Results
```

搜索状态统一：

```js
SearchContext = {
  keyword: '',
  entityType: 'feed',
  filters: {},
  sort: '',
  cursor: null
}
```

缓存、分页、历史都以 SearchContext 为边界。

搜索历史通用策略：

- Trim。
- 去重。
- 限长 10~20 条。
- 新关键词移到最近。
- 支持单条长按删除。
- 支持一键清空。

## 3. 多级 Tab 要按“用户任务”分层

大型程序推荐：

```text
Global Task Tabs
→ Domain Tabs
→ Filter/Sort
→ Content
```

例如：

```text
发现 / 搜索 / 订阅 / 数据库
→ 各自二级栏目
```

不要把频道、筛选、状态、功能入口全部做成同一级 `scroll_button`。

## 4. 高频选项常驻，低频长选项进入系统选择面板

经验基线：

```text
3~5 个高频值 → scroll_button 常驻
6+ 个低频值 → select:// / 系统更多面板
```

适用：搜索类型、评论排序、复杂筛选、模式切换。

## 5. Feed 列表和 Feed 详情使用不同图片密度

推荐：

```text
Feed List
→ 最多展示 N 张缩略图
→ 点击帖子进入详情

Feed Detail / Reply
→ 展示完整图片
```

N 应作为用户偏好，而不是硬编码在 Renderer。

图片 Key 使用稳定资源 URL/ID；不要用标题或当前页序号做长期缓存主键。

## 6. 评论是独立 PageModel

至少包含：

```text
CommentContext
├─ entityId/feedId
├─ sort: default/latest/hot/author
├─ cursor
├─ replyTo
└─ pageScopeState
```

评论排序、游标必须按实体 ID 隔离。

页面关闭时可清 PageScope 临时状态；不要清用户长期偏好。

## 7. User / Creator 页面设计为 Entity Hub

用户页不只显示简介。

可按产品支持：

```text
Profile Header
→ Follow State
→ Feed
→ Reviews
→ Articles
→ Q&A
→ Images
→ Collections
→ Products/Works
```

演员、作者、UP、漫画家、规则作者等都可以复用这一母版。

## 8. 产品/应用数据库使用独立 Detail Contract

产品型 Entity 推荐：

```text
ProductDetail
├─ Overview
├─ Specs
├─ Discussion
├─ Rating/Review
├─ Articles/Images
├─ Related Models
└─ Action / Download（若适用）
```

不要把产品详情退化成普通 Feed 详情。

## 9. Local Subscription Store 统一管理多实体关注/收藏

推荐：

```js
SubscriptionEntry = {
  entityType: '',
  entityId: '',
  providerId: '',
  title: '',
  cover: '',
  createdAt: 0,
  sortOrder: 0
}
```

统一能力：

- Add。
- Remove。
- Contains。
- MoveTop / MoveBottom。
- ListByType。
- Migration。

不要每个实体各自维护一份散落 JSON 操作逻辑。

## 10. 局部设置 Toggle 使用 `updateItem()`

如果设置动作只改变一两个可见控件：

```text
persist setting
→ updateItem(id, patch)
```

不要为一个 Toggle `refreshPage()`。

对于需要预览的 Renderer/Theme，推荐：

```text
longClick Preview
→ 临时应用配置
→ 新预览页
→ onClose 恢复原配置
```

## 11. 生命周期要明确 PageScope

适合 `onClose` 清理：

- 当前评论排序临时状态。
- 当前详情 Tab 临时状态。
- 当前展开/折叠状态。

不应清理：

- 用户已保存主题。
- 用户搜索历史。
- 本地关注/收藏。
- 用户主动选择的长期偏好。

## 12. 小面积复杂交互可使用 `x5_webview_single + Bridge`

当原生组件无法完成高质量：

- 自动轮播。
- 复杂手势。
- 横向图片 Slider。

可以：

```text
x5_webview_single
→ 本地 versioned HTML
→ fy_bridge_app / fba Bridge
→ 只传必要数据
→ 点击回海阔原生 Page Route
```

边界：

- WebView 只承担局部交互组件。
- 主页面、导航、业务状态仍由海阔原生控制。
- HTML/JS 必须本地/versioned，不能把远程页面当核心运行时。

## 13. Entity Deep Link 是分享的长期模型

推荐分享：

```text
provider + entityType + entityId
```

接收端：

```text
Deep Link
→ Router
→ Provider 恢复 Entity
→ Detail Page
```

不要分享整个渲染数组、临时缓存或运行时对象。

## 14. 协议签名使用 Signer + TTL Cache

若目标 API 需要动态 Token：

```text
DeviceIdentityProvider
→ SignMaterial
→ Signer
→ Credential TTL Cache
→ RequestClient
```

规则：

- Token 过期才刷新。
- Token 生成不散落进页面。
- 当前站点算法/常量不进入通用 UI 模块。
- Crypto Runtime 可以用 DEX，但要小而专一。

## 15. DEX/Java 只作为窄 Runtime

适合：

- BCrypt。
- 特殊 Crypto。
- Codec。
- 性能敏感纯算法。

不适合：

- 整套业务页。
- Provider God Runtime。
- UI 路由。

要求：versioned、校验、失败可诊断、可回退。

## 16. Request Client 必须返回结构化 Result

不要长期：

```js
eval('obj=' + response)
```

推荐：

```js
{
  ok: true,
  status: 200,
  data: {},
  error: null,
  endpoint: '',
  requestId: ''
}
```

错误必须能区分：网络、协议、认证、签名、限流、业务空数据、解析失败。

---

## 17. 酷安样本形成的新通用母版

新增长期母版：

**Multi-Entity Community / 多实体社区工作台**

适合：

- 社区视频。
- 微博/论坛。
- 应用/插件市场。
- 硬件数据库。
- 漫画/小说社区。
- 规则仓库。

核心不是复制酷安 UI，而是组合：

```text
Search Hub
+ Entity Dispatcher
+ User Hub
+ Feed / Comment
+ Product/App Database
+ Local Multi-Entity Subscription
+ Deep Link
```
