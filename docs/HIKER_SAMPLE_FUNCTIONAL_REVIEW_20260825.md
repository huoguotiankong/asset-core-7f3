# 海阔小程序样本二次复盘：UI + 功能 + 指令 + 工程模式

日期：2026-08-25  
性质：样本研究档案 / 供 GUIDE、CAUTIONS 和目标程序设计追溯  
复盘对象：新片场、网飞猫APP、瓜子影视、一起刷

> 本文是对前述样本的第二轮复盘。第一轮偏重 UI；本轮统一按“产品/UI + 功能/工程”双轨重新检查源码和实机截图。跨程序可复用的方法应继续进入 `HIKER_APP_DEVELOPMENT_GUIDE.md`，样本暴露出的风险进入 `HIKER_APP_DEVELOPMENT_CAUTIONS.md`。本文保留较完整的证据和来源，方便未来追溯。

## 0. 证据等级

```text
[源码确认]  当前上传包可读源码能够直接证明
[官方确认]  当前海阔开发者手册能够直接证明
[实机确认]  用户当前截图/点击结果能够直接证明
[推断]      根据功能现象推测，内部实现不可见；不能作为 Stable 技术事实
```

固定原则：截图能证明“效果/功能存在”，不能自动证明内部用了哪个 `col_type`、API、协议或算法；PrivateJS/Native 不可读时必须停在边界上。

---

# 1. 新片场：内容 Feed 之外，更值得学的是动态页面状态机

## 1.1 页面模块化已经形成明确职责

[源码确认] `rule.json` 把业务拆成约 20 个 `hiker://page/*` 子页面，例如：

```text
首页固定JSON
首页四大按钮
首页列表
进入搜索页
搜索页上部
app分类与搜索列表
app创作人搜索列表
创作人首页
创作人作品列表
创作人专辑列表
视频详情页
视频信息
视频评论
相似视频
app播放链接
Img
request
```

这不是现代 Provider/Adapter 架构，但已经体现“页面职责拆开”的正确方向。以后长期程序应进一步升级为：

```text
Page
→ Provider / Model
→ Adapter
→ Request / Playback / Image
```

而不是继续用大量 `eval(JSON.parse(fetch('hiker://page/...')).rule)` 串联隐式全局变量。

## 1.2 `registerTask + updateItem`：轮播 Banner 是页面状态，不是整页刷新

[源码确认][官方确认] 首页先生成 `card_pic_1`，给 Banner 设置稳定 `extra.id='banners'`，再：

```js
registerTask('新片场', 3000, $.toString((banners) => {
    updateItem('banners', {img: ..., url: ...});
}, banners));
```

官方手册确认 `registerTask(id, interval, js)` 会绑定当前页面并在离页后自动删除。

可复用结论：

- 轮播、倒计时、轻量状态刷新应优先更新一个 Item，不重建整页。
- 周期任务必须短小，执行耗时不能接近/超过间隔。
- 任务更新对象必须有稳定且全局唯一的 Item ID。
- 页面离开后无需自己常驻后台轮询；确需主动停止可 `unRegisterTask(id)`。

## 1.3 首页四入口使用“缓存内容块 + 局部替换”

[源码确认] “发现/推荐/精选/本地周边”不是每次点击整页 `refreshPage()`，而是：

```text
putMyVar 当前主栏目
→ 如果该栏目尚未缓存则加载
→ deleteItemByCls('首页')
→ updateItem 标题
→ addItemAfter(anchor, cachedItems)
```

这是成熟海阔页面应大量采用的思路：**固定骨架 + 局部内容区状态机**。

现代化要求：

- cache key 必须命名空间化并带 entity/filter/schema。
- 不把序列化 UI Item 当长期业务缓存；更推荐缓存标准 Model，再由 Renderer 重建 Item。
- 同一 `cls` 最好连续，避免官方文档所述的删除动画/input 失焦问题。

## 1.4 搜索不是一个接口：搜索前、搜索中、搜索对象类型是三个状态

[源码确认] 搜索页包含：

```text
输入框
→ 本地历史搜索
→ 热门内容
→ 热门搜索词
→ 输入关键词后：作品 / 创作人 Tab
→ 对应结果列表
```

历史记录实现：

```text
读 hiker://files/cache/新片场历史搜索.json
→ 去重旧关键词
→ 追加新关键词
→ 最多保留 28 条
→ 倒序显示最近历史
```

可复用的产品/功能模式：

- SearchState 至少区分 `idle / querying / result / empty / error`。
- 搜索前可以展示历史/热词；搜索后才显示结果类型 Tab。
- 搜索对象类型是业务模型，不应只靠 UI 文字判断，例如 `article / creator`。
- 历史记录要去重、限制数量，并提供清空动作。

现代化实现不建议继续直接写公共 cache 路径；普通程序优先规则私有 `storage0` 或 `saveFile/readFile`，避免多规则文件名碰撞。

## 1.5 创作人是一等实体，并且作品/专辑是不同集合

[源码确认][实机确认] 创作人页包含：

```text
背景图
头像/姓名/人气/粉丝
最新 / 热门 / 专辑
作品列表
专辑列表
```

作者作品和专辑分别调用不同接口，并有独立缓存。这个样本进一步证明：

```text
Person
├─ Profile
├─ Works
├─ Albums / Collections
└─ Stats
```

不能把作者/演员只当成一个搜索关键词。以后漫画作者、视频 UP、JAV 演员、导演、创作者都可以复用 PersonProvider / CollectionProvider。

## 1.6 非关键作品列表可延迟加载并锚点插入

[源码确认] `创作人作品列表_多线程` 把列表请求放进 task，结束后：

```text
deleteItem('loading')
addItemAfter('主页专辑', D)
```

样本中的 `be(tasks)` 来源于旧依赖，不能直接作为本项目通用 API；但功能模式值得继承：

```text
首屏人物资料先显示
→ Loading anchor
→ 后台/有界并发拉作品
→ 完成后在 anchor 后插入
```

当前项目应优先官方 `batchExecute` 或普通延迟请求 + 动态 UI，而不是依赖来源不清的旧 helper。

## 1.7 详情页“简介 / 评论”采用局部替换，并缓存已加载结果

[源码确认] 详情页给简介/评论两个 Tab 固定 ID；切换时：

```text
updateItem(Tab title)
deleteItemByCls(当前内容区)
addItemAfter(anchor, 简介缓存/评论缓存)
```

评论只在第一次打开时请求，之后使用当前实体缓存；相似视频同样点击时才请求和插入，再次点击删除。

可复用结论：

- 评论、相关推荐属于 P2/P3，不阻塞详情首屏。
- Tab 切换优先局部更新，不整页重载。
- 评论/推荐缓存必须按 resourceId 命名空间化。
- 切换实体时清理旧实体临时状态。

## 1.8 评论模型已经包含作者、时间、引用回复

[源码确认] 评论页解析：

```text
avatar
username
addtime → timestampToTime
content
referer.userInfo.username
referer.content
```

并把作品作者的评论用户名做特殊强调。说明 CommunityModel 至少应支持：

```text
Comment
├─ author
├─ time
├─ content
├─ referer/replyTo
└─ badges / authorFlag
```

楼中楼/引用回复不应拼死在 Renderer 文本里；新项目应结构化后再渲染。

## 1.9 播放链：媒体元数据 → 多画质 → 弹幕 → 标准 PlayModel

[源码确认] 播放流程：

```text
作品详情
→ video_library_id
→ mod-api media/<mid>
→ resource.progressive[]
→ urls[] / names[] / headers[]
→ 弹幕 txt 解析为 [{text,time}]
→ JSON PlayModel
```

每条画质 Header 使用 `User-Agent: ExoPlayerLib`。

值得继承：

- 先拿结构化真实媒体源，再交给播放器。
- 多画质才使用 `urls/names/headers`，并保持索引一一对应。
- 弹幕转换成海阔可消费的标准 JSON，与播放源解耦。

需要现代化：

- 当前样本把所有弹幕写进固定 `hiker://files/cache/danmu.json`，多视频/多页面会碰撞；必须改成 `<app>:danmu:<videoId>:<episode>` 唯一文件/缓存键。
- `catch` 后直接 `web://原网页` 会掩盖“请求/解析/弹幕/播放器”到底哪层失败；新项目必须先记录 stage，再决定是否进入 Web fallback。
- 弹幕失败不应导致主视频失败。

## 1.10 `download://`：下载是独立输出合同

[源码确认][官方确认] 详情页从媒体 API 获取直链后返回：

```text
download://<media-url>
```

官方手册当前确认 `download://http://...` 可直接下载视频、音频、APK 等文件。

长期原则：

- DownloadAdapter 与 PlaybackAdapter 可以共享“取真实媒体地址”能力，但输出合同不同。
- 下载 Header/鉴权必须按协议附带，不要默认播放能用就下载一定能用。
- 下载动作属于次级动作，不和 Primary Play 同权。

## 1.11 图片处理：`$().image()` 可把 Java Bitmap 变换封装成 ImageAdapter

[源码确认][官方确认] 创作人作品封面使用：

```js
$(cover).image(() => $.require('Img?...').compress())
```

`Img` 子页面通过 `BitmapFactory.decodeStream → JPEG 85 → ByteArrayInputStream` 返回 InputStream，并提供灰度变换。

值得学习的是职责隔离：**页面只请求“压缩后的图”，具体流变换封装在图片模块**。

不应照抄：

- 所有图片都 Java decode/重编码会增加 CPU/内存开销。
- 列表优先让服务端 thumbnail/尺寸参数解决；只有协议/图片确实需要本地转换才启用 Bitmap 处理。

---

# 2. 网飞猫APP：真正的价值是一个完整 Protocol Client

## 2.1 配置恢复顺序：缓存 → 低频健康检查 → 动态发现

[源码确认] 启动先读取：

```js
_config = storage0.getItem('_config', {})
```

为空才 `appInit()`；已有配置时按“当天是否已经检查”决定是否 heartbeat。失败后重新发现。

这是比“每次打开扫描所有域名”成熟得多的策略：

```text
cached good config
→ 低频健康检查
→ 失败才 discovery
→ discovery 成功覆盖 cache
```

长期建议再升级为：

```text
fresh cache
→ cached good host 快速请求
→ 失败时有限切备份
→ stale last-good
→ 后台/显式重新发现
```

不要让动态域名探测拖慢每次首屏。

## 2.2 DoH/TXT + 解密 + 优先级 + heartbeat 是可复用的 Endpoint Discovery 模型

[源码确认] `dns_query()`：

```text
DoH TXT
→ 逐条 AES-CBC 解密
→ 按 TXT 中优先级排序
→ heartbeat.check
→ 选出 cache / logic 域名
```

随后 `appInit()` 再请求配置组，分别给 `vod1`、`units` 资源域做有限探活。

长期抽象：

```js
EndpointDiscovery.discover()
EndpointDiscovery.probe(candidate)
EndpointDiscovery.persist(lastGood)
```

不要把 DoH/TXT 当固定方案；真正可复用的是“发现源 → 解码 → 排序 → 有界探活 → last-good cache”。

## 2.3 `get1()` 是完整请求签名层，不应散在页面

[源码确认] 请求统一做：

```text
路径规范化
query 参数排序
timestamp
app/device headers
匿名身份
HMAC-SHA1 sign
GET/POST
withStatusCode + timeout
AES-CBC 解密响应
JSON parse
```

这正是 Protocol/API Client 应承担的职责。

可复用结构：

```js
Protocol.request(endpoint, params)
├─ normalizePath
├─ ensureSession
├─ canonicalizeQuery
├─ sign
├─ fetch
├─ status validation
└─ decrypt / decode / schema validation
```

页面只能调用 `Provider`，不能自己拼 HMAC/AES。

## 2.4 匿名账号也是 Session 生命周期

[源码确认] 没有 `_anonymous.userId` 时会 POST `/user/anonymous`，获取：

```text
userId
x-token
```

随后缓存到 `storage0`，后续请求携带。

这说明“无需用户登录”不等于“没有 Session”。很多 APP 会先建立 anonymous device session；我们的 Auth 层应允许：

```text
anonymous session
→ authenticated session（用户登录后升级）
```

但样本中的固定 deviceId/deviceCreatedAt、签名 secret 只能视为历史协议常量，绝不能复制到其它项目。

## 2.5 游标分页：分页状态应按查询上下文保存并在离页时清理

[源码确认] `get2(url, key)` 从响应读取 `next`，使用 `putMyVar(key,next)` 保存；`onClose` 清掉对应 key。

这比只支持 `page=1,2,3` 更通用。长期设计：

```js
CursorState = {
  queryKey: '<provider>:<page>:<filterHash>',
  next: '',
  exhausted: false
}
```

注意：样本直接拿 URL/关键词做变量名，长期项目必须 namespace + hash，避免不同页面/关键词碰撞。

## 2.6 递归 `setTabs()`：父筛选改变时必须重置依赖子筛选

[源码确认] tabs 是递归结构；当 `type` 改变时主动清：

```text
class
area
year
sort
```

然后根据当前 type 进入对应子 tabs。

这是多维分类最值得复用的功能逻辑：

```text
FilterSchema
├─ type
│  ├─ class
│  ├─ area
│  ├─ year
│  └─ sort
└─ 不同 type 可拥有不同子 schema
```

不要把所有维度独立存储而不处理依赖，否则用户会得到“电影分类 + 动漫子类 + 旧年份”的非法组合。

## 2.7 首页渐进渲染：先可操作，再完整

[源码确认] 首页先 `setResult()`：

```text
5 个任务入口
搜索框
主栏目
anchor
Loading
```

网络返回后再：

```text
deleteItem(Loading)
addItemAfter(anchor, 内容)
```

这不仅是 UI 技巧，也是网络容错策略：即使内容接口慢，搜索/入口仍然可用。

## 2.8 生命周期清理：详情缓存要知道什么时候失效

[源码确认] 详情对同一实体使用 `storage0.getMyVar/putMyVar` 缓存详情与推荐块，并在：

```text
onClose
onRefresh
```

清理相关临时状态。

长期原则：

- 页面临时缓存和长期 stale cache 是两种东西。
- `onClose/onRefresh` 适合清 page-local selection/cursor/render cache。
- Provider response cache 应有 TTL/schema，不应该随着页面关闭全部消失。

## 2.9 `setLastChapterRule`：收藏最新集数必须能独立重新获取

[源码确认][官方确认] 影视详情使用：

```js
setLastChapterRule('js:' + $.toString((str1) => {
    // 重新请求详情
    setResult('更新至: 第' + count + '集');
}, str1));
```

官方手册特别提醒：JS 写法不能依赖当前页面已经解析出来的选集变量，否则收藏页无法独立获取最新章节。

长期要求：

- 连载影视、漫画、小说使用 `setLastChapterRule` 时必须能独立恢复 entityId 并重新请求 Provider。
- 不捕获页面内 `episodes[]` 作为唯一来源。
- latest-chapter 请求应轻量，必要时使用短缓存。

## 2.10 多播放源：线路状态与选集状态分离

[源码确认] `playSources[]` 先生成线路 `scroll_button`，活动线路索引保存为实体级状态；不同线路必要时再请求 episodes API。最终每集直接返回：

```text
<playUrl>#isVideo=true#
```

这说明：

```text
SourceSelection
≠ EpisodeSelection
```

两者必须拆开。多线路才显示线路选择；单线路保持直接播放合同。

## 2.11 展开/收起简介可直接 `findItem + updateItem`，不需要整页刷新

[源码确认][官方确认] `setDesc()` 给简介固定 ID，然后点击“展开/收起”读取 `findItem('desc').title` 并 `updateItem()` 替换文本。

适合：

- 长简介
- 调试信息局部展开
- 长标签说明

不适合把大量业务状态都塞进一段富文本字符串；结构化业务仍应使用标准 Item/Model。

## 2.12 网飞猫样本中明确不能照抄的实现债务

- 默认上映年份仍硬编码 `2025`，在 2026 已经明显陈旧：**时间默认值必须根据当前日期生成。**
- 固定 deviceId/deviceCreatedAt/签名常量属于历史协议，不可跨项目复制。
- `top.png` 外部 HTTP 占位、Base64 图标、`immersiveTheme` 不作为默认 UI 基线。
- `desc`、关键词、URL 直接拿来当状态 key 容易冲突；统一 namespace/hash。
- 弹幕示例使用固定 `danmu.xml` 文件名，同样存在实体碰撞风险。
- 请求函数里修改共享 `_config.cache` 会扩大隐式副作用；新的 Protocol Client 尽量纯函数化，endpoint 更新通过 Discovery/State 显式完成。

---

# 3. 瓜子影视 + 一起刷：同一个薄 Shell 合约复用多个产品

## 3.1 两个包的可见运行框架实际上相同

[源码确认] 除 `title/version/icon` 外，两份 `rule.json` 的：

```text
url
find_rule
search_url
searchFind
preRule
pages
col_type/detail_col_type
```

基本一致；两者都使用：

```js
$.require('csdown').home()

putMyVar('keyword', getParam('kw'))
$.require('csdown').search()
```

并共享同一段 `evalPrivateJS(...)` 入口。

这说明作者在使用一套“统一 Runtime / Shell Contract”承载不同产品。

真正值得继承的是：

```text
Common Shell Contract
home(ctx)
search(ctx)
detail(ctx)
...

+ AppConfig
+ Provider/Adapter
+ Theme/Product Modules
```

而不是共享一个不可审计 PrivateJS 黑盒。

## 3.2 我们自己的共享框架必须显式导出、版本化、可测试

以后多个同类小程序可以共享：

```text
Hiker App SDK
├─ Shell contract
├─ Router
├─ Base Renderer
├─ Filter State
├─ Search State
├─ Playback/Image helpers
└─ Diagnostics

每个 App
├─ AppConfig
├─ Provider
├─ Product navigation
└─ Theme tokens
```

禁止：

- 用规则标题隐式决定所有业务逻辑但没有显式配置。
- 多 App 依赖同一个不可回退的远程黑盒。
- 一个共享 Core 改坏后同时炸多个 Stable。

共享框架发布仍需要版本化、兼容矩阵和逐 App Test。

## 3.3 一起刷截图进一步确认人物/专题/预告/追剧都是独立业务域

[实机确认] 一起刷存在：

```text
首页
筛选
预告：即将上映 / 已上映
发现：追剧 / 专题 / 明星
明星列表 → 明星作品集合
专题 → 专题作品集合
追剧 → 星期/今日 + 类型筛选 + 更新内容
```

这强化了 Model First：

```text
VideoModel
PersonModel
CollectionModel
ScheduleGroup
RankingEntry
```

这些不应全部退化成 `VideoItem + tag string`。

## 3.4 排行/专题/明星应该有不同的 Renderer 与数据合约

[实机确认]

- 普通筛选结果：高密度三列海报。
- 追剧更新：低密度左图右文，突出“第几集、平台、简介”。
- 明星：头像/人物图 + 国家 + 作品数 +简介。
- 明星代表作品：横幅 Hero + 作品海报集合。
- 电影榜单：海报 + 评分 + 推荐语/简介 + 预览视频。

因此 Renderer 应消费不同 Model，而不是一个万能卡片通过几十个 `if` 拼字段。

---

# 4. 四个样本共同沉淀出的海阔指令/技巧

以下能力均至少在当前官方手册或可读样本中得到确认；真正进入某个 Stable 前仍需目标程序 Test 实机验证。

## 4.1 模块和路由

```text
$.exports / $.require
$(url).rule(...)
$(url).lazyRule(...)
getParam(...)
hiker://page/<path>?rule=&simple=true
```

原则：Shell 恢复 URL Context，再调用明确模块；关键实体参数不只存在 `extra` 或 `putMyVar`。

## 4.2 页面生命周期

```text
addListener('onClose', ...)
addListener('onRefresh', ...)
```

用于：

- 清当前页 cursor/selected tab/render cache。
- 释放短生命周期状态。
- 不用于删除用户长期收藏、登录 Session、last-good endpoint 等持久数据。

## 4.3 动态 UI

```text
updateItem
deleteItem
deleteItemByCls
addItemAfter
addItemBefore
findItem
```

推荐构建：

```text
stable skeleton
+ anchor/id/cls
+ section state
+ local patch
```

而不是每次筛选、Tab、展开简介都 `refreshPage()`。

## 4.4 周期任务

```text
registerTask / unRegisterTask
```

适合轮播、页面内短周期状态；不承担后台监控、重型网络轮询。

## 4.5 连载最新章节

```text
setLastChapterRule
```

适合影视剧集、漫画、小说；JS 规则必须能脱离当前详情页面独立恢复 ID 和拉取最新状态。

## 4.6 播放与下载输出合同

```text
单线路媒体：url + 必要 #isVideo=true#/Header
多线路：urls[] + names[] + headers[]
下载：download://realMediaUrl
弹幕：标准 JSON/XML 文件或模型
```

“取真实媒体地址”可以共享 Provider/Adapter；播放器和下载器是不同消费端。

## 4.7 私有状态与结构化存储

```text
putMyVar/getMyVar      page/session transient
setItem/getItem        rule-private string persistent
storage0               JSON/object persistent or scoped helpers
saveFile/readFile      rule-private file
```

长期要求：

- key 统一 `<app>:<provider>:<page/module>:<entity/filter>:<key>`。
- 临时选择不冒充事实源；URL/Model 才能恢复主业务状态。
- 固定 `danmu.json / danmu.xml / cache.json` 这种跨实体文件名禁止进入正式多页面程序。

---

# 5. 样本进入本项目时的“继承 / 改写 / 禁止”三分法

## 直接继承思想

- 固定骨架 + 局部动态更新。
- 搜索前/后不同状态和搜索类型。
- Person / Collection / Schedule / Ranking 一等模型。
- 游标分页按查询上下文保存。
- 父筛选变化重置依赖子筛选。
- 首屏先可操作，再渐进补网络内容。
- 评论/推荐/弹幕不阻塞 P0 首屏/播放。
- Protocol 请求、签名、Session、解密统一封装。
- `setLastChapterRule` 独立恢复实体并重新请求。
- 多画质才使用多线路 PlayModel。

## 需要现代化改写

- 老式 `eval(fetch(hiker://page).rule)` 隐式共享变量 → 明确 `$.exports/$.require` 模块接口。
- `putMyVar` 直接缓存整批 UI Item → 缓存标准 Model，Renderer 重建。
- 公共 cache 文件 → 规则私有文件/命名空间 cache。
- `be(tasks)` 等来源不清 helper → 官方 `batchExecute` / 有界异步。
- Java Bitmap 全量压缩 → 服务端缩略图优先，本地转换只在必要时使用。
- Web fallback → 先记录失败 stage，再按 Playback 决策树降级。

## 明确禁止照抄

- PrivateJS 黑盒作为普通项目默认 Runtime。
- 固定 deviceId、Token、签名 secret、过期域名/接口常量跨项目复制。
- 硬编码年份/月份等时间默认值。
- 固定 `danmu.json/xml` 导致多实体互相覆盖。
- 大量外部 HTTP 图标/占位图作为唯一 UI 资产。
- `immersiveTheme` 因样本好看就全局启用。
- 捕获所有异常后直接跳网页，导致无法诊断真实失败层。
- 共享 Core 无版本隔离地同时服务多个 Stable。

---

# 6. 后续每个样本固定输出模板

```text
1. 产品任务与页面地图
2. UI/视觉语法
3. 可读源码结构
4. 海阔指令/API 清单
5. 状态与生命周期
6. Search/Filter/Person/Collection 等业务模型
7. Request/Auth/Sign/Crypto
8. Image Pipeline
9. Playback/Download/Danmu
10. Cache/Concurrency/Progressive Render
11. [源码确认] 可直接继承
12. [实机确认] 产品行为
13. [推断] 待验证假设
14. 需要现代化改写的历史实现
15. 新增 GUIDE / CAUTIONS / 目标 CHANGELOG 的结论
```

这样样本越多，积累的不只是“界面图库”，而是一套可以直接指导新开发、维修和重构的海阔工程模式库。
