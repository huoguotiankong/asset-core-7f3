# HIKER_APP_DEVELOPMENT_CAUTIONS 补充：酷安样本暴露的高概率坑

日期：2026-08-25  
来源：`酷安.hk小程序.zip` 源码 + 当前全部实机截图  
完整证据：`docs/HIKER_SAMPLE_KUAN_REVIEW_20260825.md`

---

## KA-01. 巨型 Entity Renderer 禁止长期使用连续 `if/else` 扩张

样本 `_layoutDetermineParse()` 同时处理轮播、图标、筛选、Feed、User、Product、APK、Album、Collection、Topic 等大量 Entity。

短期能运行，长期容易：

- 改一种卡片影响其它实体。
- 新类型不断追加分支。
- 未知类型直接静默消失。
- UI 与协议逻辑混合。

固定规则：

```text
EntityDispatcher
→ RendererRegistry
→ UnknownEntityFallback
```

不同 Renderer 独立测试。

## KA-02. 禁止把协议响应通过 `eval()` 解析成对象

高风险：

```js
eval('_demolMap=' + response)
```

问题：

- 远端响应一旦不是纯 JSON，可执行任意脚本。
- 解析错误难以诊断。
- 不能做 schema validation。

固定：优先 `JSON.parse` + schema/字段校验；非 JSON 协议必须进入专用 Parser，禁止通用 eval。

## KA-03. 远程 JS/库不得通过明文 HTTP 作为 Stable 运行依赖

样本 require 中存在 HTTP 的 `hikerPop.js` 和远程图片/图标资源。

固定：

- Stable Runtime/Parser/关键 UI 依赖必须 versioned 到正式仓库或本地资产。
- 能 HTTPS 就不用 HTTP。
- 第三方库先固化版本并校验，不运行 mutable latest URL。

## KA-04. `Thread.sleep` 倒计时阻塞 UI 属于禁止项

样本首次须知使用循环：

```text
Thread.sleep(1000)
→ updateItem(timer)
```

会阻塞页面线程。

固定：首次引导/免责声明不使用同步 sleep。需要倒计时使用非阻塞任务，并允许页面退出时取消。

## KA-05. 泛状态 Key 禁止用于多实体/多页面程序

样本存在：

```text
:keyword
:replyListType
:replyNext
:userTag
:apkTag
:newTag
```

大型社区中极易串页。

固定命名：

```text
<app>_<page>_<entityId>_<state>
```

搜索用 SearchContext；评论用 feedId；详情 Tab 用 entityId。

## KA-06. `storage0.putMyVar` 缓存实体时必须有 Context Key 和失效策略

不要只按：

```text
<id>:detail
```

长期缓存接口响应。

至少考虑：

```text
provider
entityType
entityId
account/session（若相关）
query/filter
schemaVersion
TTL
```

## KA-07. Device/UA/AppVersion 等协议常量禁止进入 UI 层

样本在页面大对象里固定：

- App Version。
- App Code。
- API Version。
- Device UA。
- Token 常量。

固定：全部进入 ProtocolConfig / Signer；页面只调用 RequestClient。

## KA-08. 动态 Token 算法不得当永久协议事实

酷安 Token 逻辑包含时间戳、MD5、Base64、BCrypt、Device 字符串；这些都是站点当前协议实现。

规则：

- 写入目标程序 CHANGELOG 时记录算法版本/来源/验证时间。
- 协议变化时只换 Signer。
- 不把某个旧 APK/样本算法复制到其它程序或未来 Stable 当永久常量。

## KA-09. DEX 依赖必须小而可控，禁止发展成黑盒业务 Runtime

样本 `bcrypt.dex` 属于窄 Crypto Runtime，这种用法可以接受。

但必须：

- 固定路径/version/hash。
- 加载失败可诊断。
- 只暴露算法接口。
- 不把 Page/Provider/Update 业务塞进 DEX。

## KA-10. `x5_webview_single` 局部组件必须本地化，禁止核心页面依赖远程 HTML

轮播/ScrollCard 可以用本地 HTML + Bridge。

禁止：

- 在线 HTML 是唯一首页。
- 远端 JS 变化即可改变核心逻辑。
- WebView 组件持有账号凭据/核心业务状态。

## KA-11. Bridge 参数禁止 `eval('array=' + param)` 解析

样本轮播页面存在：

```js
eval('array=' + array)
```

固定：跨 Page/WebView 传输统一 JSON 编码：

```text
encodeURIComponent(JSON.stringify(data))
→ decodeURIComponent
→ JSON.parse
```

不允许 eval 解参数。

## KA-12. 分享口令必须只携带稳定 Entity Deep Link

样本的海阔分享思路值得学，但未来禁止把 Cookie、Token、私有 Header、完整缓存对象放入分享串。

分享负载只允许：

```text
providerId + entityType + entityId + public route params
```

## KA-13. 本地关注/收藏禁止按标题判断唯一性

样本部分实体关注检查使用 `title` 匹配。

标题可能重名、改名、语言变化。

固定：

```text
(providerId, entityType, entityId)
```

作为唯一键；标题只用于显示。

## KA-14. 置顶/置底操作必须处理“不存在对象”

样本 `_Position_tool()` 在未找到对象时仍可能对空对象执行 unshift/push。

固定：

```text
find index
→ if not found return explicit error
→ remove
→ insert target position
→ persist atomically
```

## KA-15. 搜索历史删除禁止依赖未初始化局部索引

样本 `_extraSearch` 中 `tindex/abreak` 使用方式存在隐式变量风险。

固定：

```js
const index = list.indexOf(target)
if (index < 0) return
list.splice(index, 1)
```

禁止隐式全局变量承载索引和状态。

## KA-16. `forEach` 中的 `return` 不能当作 break

样本多处使用：

```js
array.forEach(item => {
  if (...) {
    found = true
    return
  }
})
```

这只返回当前回调，不会终止整个遍历。

固定：查找用 `find/findIndex/some`；需要 break 的循环用 `for...of`。

## KA-17. Request Client 不能只返回 `{}` 表示所有失败

样本 `_demol_Ajax()` 当 `.data` 缺失时 toast 后返回 `{}`。

会把：

- 登录失效。
- 签名失败。
- 限流。
- HTTP 错误。
- Schema 变化。

全部压成“空数据”。

固定使用结构化 ErrorResult，并让 UI 显示可解释状态。

## KA-18. 搜索、评论、用户页的 Page State 不得跨实体共享

尤其：

```text
comment sort/cursor
user tab
search type/keyword
product tab
```

必须按页面实例/实体隔离，避免从 A 帖返回 B 帖后仍继承旧状态。

## KA-19. 用户可调“图片展示数量”必须有上下界

样本允许输入显示图片张数。

固定：

- 非数字拒绝。
- 最小 0/1 按产品决定。
- 设置合理最大值，例如 9/12。
- 超过最大值不直接渲染全部原图。

防止误输入 999 导致 Feed 性能崩溃。

## KA-20. 设置页预览模式必须保证退出恢复

样本使用 `onClose` 恢复 Renderer，这是正确方向。

固定：预览配置必须是 Transaction：

```text
snapshot old
→ apply preview
→ render
→ onClose rollback
```

只有用户明确 Save 才持久化。

## KA-21. 默认详情页不要用远程占位图制造顶部空间

样本 `_generateTop()` 通过外部 `top.png` 生成大图占位。

本项目已有标题栏/沉浸式历史坑，固定不采用这种 hack 作为默认页面结构。

优先 `simple=true` + 正常系统标题栏 + 内容自然起始。

## KA-22. 设置、免责声明、开发者入口不得污染主任务首屏

样本把设置作为主 Tab 末尾入口是可以接受的；但具体 Settings 页面包含免责声明、捐赠、作者、BUG、日志等大量内容。

固定：

```text
Appearance / Content / Advanced / About
```

分组处理，主业务页不展示开发者技术信息。

---

# 结论

酷安样本应学习：

```text
多 Entity 搜索
Entity Dispatcher
Search Hub
User Hub
Feed/Comment
产品/应用数据库
本地跨实体订阅
小面积 Web Bridge
Token TTL / Crypto Runtime
```

明确不复制：

```text
God Object
response eval
参数 eval
同步 Thread.sleep
远程 HTTP Runtime
泛状态 Key
标题作为实体唯一键
无结构错误返回
远程占位图 UI hack
```
