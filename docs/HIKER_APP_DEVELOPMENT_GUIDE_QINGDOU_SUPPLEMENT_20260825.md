# HIKER_APP_DEVELOPMENT_GUIDE 补充：青豆样本新增通用基线

日期：2026-08-25  
来源：`青豆.hk小程序(1).zip` + 当前实机截图  
完整证据：`docs/HIKER_SAMPLE_QINGDOU_REVIEW_20260825.md`

> 本补充只保存跨程序可复用的开发方法；豆瓣固定接口、Key、签名常量、设备号等历史协议事实不作为长期模板。

## 1. Metadata Hub 使用实体图谱，而不是字符串跳转

影视/漫画/书籍/社区类产品如果存在稳定 ID，应至少区分：

```text
ContentEntity      影片/剧集/漫画/书籍
PersonEntity       演员/导演/作者/声优/UP 主
CollectionEntity   片单/榜单/专题/奖项合集
GalleryEntity      剧照/海报/写真/附图
CommunityEntity    短评/长评/回复
ScheduleEntity     上映/更新/日历
```

关系也应结构化：

```text
Content → Cast/Crew → Person
Person → Works → Content
Content → Collections
Content → Gallery
Content → Community
Collection → Items
```

不要把演员、榜单、片单都退化成“拿标题再搜索一次”。

## 2. Settings 可升级为 Plugin Slot Manager

可替换能力不要只做布尔开关。适合插件槽位化的能力包括：

```text
Home Layout
Detail Renderer
Quick Search Target
Playback Parser / Adapter
Metadata Provider
Image Adapter
Community Provider
```

推荐模型：

```js
PluginSlot = {
  slotId: '',
  activeId: '',
  order: [],
  items: {
    id: {
      name: '',
      version: 1,
      enabled: true,
      config: {}
    }
  }
};
```

每个 Slot 至少满足：

- built-in default 不可删除；
- active item 不可无替代直接删除；
- add / edit / delete / reorder；
- reset-one / reset-all；
- import 前校验；
- active 失效时自动回默认；
- 配置与业务 Runtime 版本兼容可检查。

## 3. 配置持久化使用 Load → Validate → Migrate → Backup → Recover

推荐：

```text
read config
→ JSON/schema validate
→ schemaVersion migration
→ 补齐 required defaults
→ 成功后进入 Runtime

解析/迁移失败
→ 保存 raw backup
→ 恢复安全默认配置
→ 给用户可读诊断
```

配置文件不要只靠“JSON 能 parse”判断有效；还要校验 `schemaVersion / kind / required fields / enum`。

关键配置写入优先采用临时文件 + 校验 + 原子替换思路，避免写到一半把唯一配置损坏。

## 4. 复杂设置采用 Draft → Validate → Commit

输入框 `onChange` 只更新 Draft，不直接覆盖正式配置：

```text
Persistent Config
→ Edit Draft
→ Validate
→ 用户显式保存
→ Commit Persistent Config
```

页面 `onClose`：清理 Draft。  
取消：不改变正式配置。  
保存失败：保留 Draft，显示字段级错误。

适合解析器、远程地址、JSON、主题、Provider、播放器配置等高风险项。

## 5. 配置导入导出使用 ConfigEnvelope

推荐：

```js
ConfigEnvelope = {
  kind: 'home|detail|parser|search|provider',
  schema: 1,
  name: '',
  version: '',
  encoding: 'plain|base64|lz|paste',
  payload: {},
  checksum: ''
};
```

导入链：

```text
识别 kind
→ 解码
→ checksum（适用）
→ schema 验证
→ 权限/能力检查
→ 预览
→ 保存为未启用配置
→ 用户显式启用
```

不要“收到口令 → 直接 eval → 立即成为活动插件”。

## 6. 可配置脚本插件必须有信任边界

高级用户确实需要脚本扩展时，区分：

```text
Built-in Adapter       官方/项目内置，可信
Structured Config      只允许声明式字段，默认推荐
Signed/Reviewed Plugin 经审查版本化脚本
Unsafe User Script     明确高级模式，不默认启用
```

脚本接口必须显式定义输入/输出，例如：

```js
PlaybackParser.resolve(ctx) -> PlayModel | URL | ErrorModel
DetailRenderer.render(model, ctx) -> Item[]
```

禁止让 Renderer、Parser 随意依赖全局临时变量。

## 7. Quick Search Target 是跨小程序委托能力

Metadata 程序不必自己承担所有资源搜索。可以定义：

```js
SearchTarget = {
  id: '',
  title: '',
  ruleName: '',
  icon: '',
  enabled: true,
  order: 0
};
```

详情页按当前实体生成：

```text
entity.title
→ hiker://search?s=<title>&rule=<target rule>
```

适用于：影视 Metadata → 影视源、JAV Metadata → 播放源、漫画 Metadata → 正文源、书籍 Metadata → 阅读源。

目标不存在/未安装时提供明确状态，不让点击静默失败。

## 8. SearchResult 必须带实体类型与路由语义

搜索 API 同时返回影片、片单、榜单、人物等类型时：

```js
SearchResult = {
  type: 'content|person|collection|chart|playlist',
  id: '',
  title: '',
  cover: '',
  meta: {},
  route: {page:'', params:{}}
};
```

Provider 在解析阶段决定类型；Renderer 只按模型渲染，不在点击时重新猜实体类型。

## 9. 长筛选支持 Preset + Custom + MultiSelect，但统一进 FilterState

成熟筛选可包含：

```text
预设类型/地区/年份
+ 自定义类型/地区/年份
+ 多选标签
+ 排序
+ 是否有源
+ 分数区间
```

所有值最终进入统一 `FilterState`，Provider 根据 `FilterSchema` 规范化；不要让每个按钮自己拼 URL、自己保存一份状态。

自定义值必须校验：年份范围、评分范围、标签数量/长度、非法字符等。

## 10. Gallery 应区分汇总、类型、缩略图和原图

推荐：

```text
Gallery Summary（总数/来源统计）
→ Gallery Type（剧照/海报/截图/工作照...）
→ Thumbnail Grid
→ Original Image
```

列表页优先缩略图；打开后才请求原图。图库类型、数量、分页属于 `GalleryProvider`，不写死在 Renderer。

## 11. BrowserAuthRecovery 与正常 API/Playback 分层

遇到网页人机验证、Cookie 缺失、IP 风控时：

```text
Protocol/API 请求
→ 检测明确 AUTH/RISK 状态
→ BrowserAuthRecovery
→ 用户完成验证
→ 读取/保存受控 Session
→ 回原任务重试
```

不要把“导入 Cookie 插件 / 打开网页 / 解析 HTML / 播放”全部塞进同一个页面函数。

恢复流程应能解释：为什么需要网页、验证完成后如何返回、Cookie 保存在哪里、如何清除。

## 12. Protocol Retry 使用预算，不用同步 sleep 堵页面

推荐：

```text
request
→ classify error
→ retryable? yes/no
→ maxAttempts / totalBudget
→ short backoff + jitter
→ final ErrorModel
```

P0 请求可有限重试；P2/P3（推荐、评论、附加媒体）默认更快失败并异步重试。禁止固定 `Thread.sleep(1000)` 连续多次阻塞页面线程。

## 13. Crypto Runtime 仍按单例复用

签名协议需要 HMAC/AES 等能力时：

```text
ProtocolClient
→ CryptoRuntime singleton
→ sign()/decode()
```

不得每个 API 请求重复 `eval(getCryptoJS())`。固定 API Key、HMAC Secret、DeviceId、UA 只能来自当前协议研究并进入目标程序 CHANGELOG，不能从历史样本复制。

## 14. “API Metadata + HTML Source Parse + Browser Recovery”是三层，不是一坨

推荐职责：

```text
MetadataProvider
  → 标题/封面/人物/评分/片源供应商元数据

PlaybackProvider
  → 根据 entity/provider 解析真实播放目标

BrowserAuthRecovery
  → 仅处理登录、人机验证、Cookie 风控恢复
```

如果 HTML 只是承载一段结构化 `sources` 数据，优先提取最小数据，不执行整段远端脚本。

## 15. 自定义 Renderer 的 `col_type` 必须 allowlist

用户可配置卡片样式时，只允许项目验证过的枚举：

```text
flex_button
scroll_button
icon_round_small_4
icon_small_4
movie_2
movie_3
...
```

非法值回退默认组件并写诊断；不要把任意字符串直接传给 Renderer。
