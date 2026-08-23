# 动态频道描述数组与路由参数碰撞事故

日期：2026-08-23  
来源：汤头条 Test18–Test20 实机回归

## 事故一：把动态频道描述数组误当业务内容

实机现象：
- 小说首页返回 `code 200`，结构为 `array[13]>{current,id,name,type,show_style,api_list,params_list}`，页面却显示 0 条。
- 有声首页返回 `code 200`，结构为 `array[7]>{current,id,name,type,show_style,api_list,params_list}`，页面却显示 0 条。
- 社区首页返回 5 个相同结构的频道描述，旧 Renderer 把它们当内容项，形成大面积空白和只有“关注/热门/发现/精选推荐/狼友交流”的稀疏页面。

根因：
服务端首页并不直接返回业务实体，而是返回动态路由配置：

```text
current
id
name
type
show_style
api_list
params_list
```

真正内容需要选择频道后，再调用该频道自己的 `api_list`，并携带服务端下发的 `params_list`。

固定规则：
1. 看到 `api_list + params_list`（或等价字段）时，优先识别为 **Dynamic Channel Descriptor**，不要直接交给内容 Card Adapter。
2. 正确链路是：

```text
Home Descriptor API
→ Descriptor[]
→ UserFacing Tab/Catalog
→ selected.api_list + selected.params_list
→ Real Content List API
→ Content Model
→ Renderer
```

3. `code 200` 但业务卡为 0 时，不要只扩大 recursive parser；先检查返回的是内容还是二跳路由描述。
4. Descriptor 可短缓存，避免每次切 Tab 都重复请求首页配置；真正列表缓存与 Descriptor 缓存分开。
5. 服务端 `current` 只作为默认选中态，不应阻止用户本地切换。

## 事故二：页面路由参数与服务端 API 参数同名碰撞

实机现象：
- 排行榜页面入口使用 `type=rank` 表示“当前页面类型”。
- 排行榜 API `/api/RankList/getPlayRank` 的参数也叫 `type`，但只允许：`all/daily/weekly/monthly`。
- 旧实现从页面 query 直接读取 `type` 并送到 API，导致服务端返回：

```text
code 551 · type值只能为:daily,weekly,monthly,all
```

根因：
导航路由命名空间与 Provider/API 参数命名空间未隔离。

固定规则：
1. 页面路由字段与业务 API 字段必须分命名空间：

```text
page_type / route / view
rank_type / sort_type / api_type
```

2. Provider 发请求前对枚举做白名单归一，不把任意 URL query 原样透传给服务端。
3. 关键状态优先使用应用命名空间 key，例如 `ttt20_rank_type`，而不是复用通用 `type`。
4. 当服务端报“某参数只能为若干枚举值”时，先检查是否被页面路由、筛选状态或其他同名 query 污染。
5. 页面导航参数、Provider 参数、Renderer 状态三层分离，禁止“一份 query object 全链透传”。

## 复用判断

出现以下任一情况，优先检查本事故：
- HTTP/业务 code 200，但只看到分类名/频道名，真实内容为 0。
- 响应结构里高频出现 `current/id/name/api_list/params_list`。
- API 报枚举参数非法，但 UI 看起来已经选择了合法项。
- 同一个 `type/id/page/sort` 同时承担页面路由和服务端请求语义。

## 汤头条 Test20 修复
- 小说、有声、社区首页统一先解析 Dynamic Channel Descriptor，再按 `api_list + params_list` 二跳真实内容。
- Descriptor 缓存 10 分钟，减少重复首层请求。
- 排行榜使用独立 `ttt20_rank_type`，只允许 `all/daily/weekly/monthly`。
- 创作者发现与创作者作品接口分离：发现使用创作者榜单，`/api/Creator/featured` 只在已有 `uuid` 后按 `uuid + lastId + limit` 调用。
