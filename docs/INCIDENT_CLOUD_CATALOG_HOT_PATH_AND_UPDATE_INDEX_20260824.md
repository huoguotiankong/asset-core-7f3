# 云端仓库首页热路径 N+1 与多版本更新索引事故（2026-08-24）

状态：长期硬约束 / 跨程序可复用。

## 1. 实机现象

“我的规则仓库” Stable 3.5.5 实机已有约 18 个程序时出现：

- 首页每次打开明显变慢；
- “已安装”能够统计，但“可更新”长期为 0；
- 程序越多，首屏等待越明显。

这不是单一 GitHub/CDN 慢，而是首页热路径的同步 I/O 设计错误。

## 2. 根因一：安装状态扫描进入首页同步热路径

历史 `install_probe.js` 为确认真实安装存在性，对每个程序调用：

```text
stats(items)
→ actualInstalled(item)
→ rulePresence(item)
→ request('hiker://home@' + title)
```

N 个程序即至少 N 次同步规则存在性探测。该能力适合“手动刷新安装状态/诊断”，不适合每次首页首屏。

### 固定规则

首页统计禁止逐项目执行：

- `request('hiker://home@...')`
- WebView 探测
- 文件系统重扫描
- 逐项网络请求
- 其它与项目数线性增长的同步 I/O

首页必须优先使用本地索引/最近成功状态；需要精确校验时放到显式“刷新状态/同步/诊断”动作。

## 3. 根因二：版本中心 metadata 在首页形成 N+1

Single Workspace 13.x 的 `hybridProgramData()` 对每个 `channel-group` 直接执行 `channelMeta(item)`。

于是首页构建变成：

```text
1 × root manifest
+ N × apps/<app>/channels.json
+ N × 本地安装存在性探测
```

当程序数量从 10 增到 20/50 时，首屏延迟会近似线性放大。

### 固定规则

父目录只提供首屏必需摘要；子资源按需加载：

```text
root manifest：名称 / 图标 / 分类 / Stable-Test-Local 摘要 / 更新时间
→ 首页立即渲染
→ 用户点击某程序
→ 只读取该程序 channels.json
→ 保存最后成功 channel metadata
→ 后续详情优先缓存
```

**详情数据不得因为“以后可能会用”而提前阻塞首页。**

## 4. 根因三：channel-group 被更新统计逻辑排除

旧代码在 `stats()` 中遇到 `channel-group` 后：

```text
统计 installed
→ continue
```

因此不会进入 update 比较。

同时更新中心又使用：

```js
p.update && !p.channel
```

进一步把多版本程序全部排除。

当前云仓主流程序正是 Stable/Test/Local 的 `channel-group`，所以用户看到“已安装很多，但可更新永远 0”。

### 固定规则

更新状态必须统一成产品合同：

```text
installedChannel = Stable | Test | Local
installedVersion
remoteTargetVersionOfSameChannel
update = remoteTargetVersion > installedVersion
```

UI 只消费统一的：

```text
installed
update
activeChannel
installedVersion
targetVersion
```

不得在 UI 层用 `!channel`、`entryType !== channel-group` 等条件绕开多版本程序。

## 5. Fast Home / Update Index 推荐架构

### 首页

```text
最后成功 root manifest
+ 本地 install/group state
→ O(N) 纯内存/本地 KV 计算
→ 立即首屏
```

普通首页不主动联网。网络刷新由用户同步、明确刷新动作或真正的后台异步机制承担。

### 更新索引

根 manifest 对多版本程序保留轻量摘要，例如：

```text
Stable 1.9.0 / Test 1.9.0-test.6 / Local 1.8.2
```

首页可直接解析同通道目标版本，不必读取每份 `channels.json`。

### 版本中心

首次进入某程序时读取对应 `channels.json`，成功后保存缓存；加载失败时保留上次成功版本中心数据并给出诊断，不让整个首页失败。

## 6. 安装状态的准确性边界

为了首屏性能，缓存/导入记录只能代表“规则仓库最近一次成功生成或交付了哪个版本”，不能百分之百证明用户最终在海阔确认覆盖安装。

因此必须区分三层状态：

1. **Delivery state**：`importHistory / installedMap / group_install`，只表示本项目曾生成/交付过导入口令，不能作为设备真相。
2. **Verified presence**：通过海阔本地规则表或 `hiker://home@标题` 确认规则实际存在。
3. **Verified identity**：在规则存在基础上进一步读取本地规则 `title + numeric version`，与 Stable/Test/Local 实际 Shell 指纹匹配，确认当前通道和版本。

### 固定规则

- `importHistory / installedMap` **禁止**直接驱动“已安装/可更新”正式统计。
- `hiker://home@标题` 只能证明存在，**不能**区分同名 Stable/Test，也不能证明版本。
- 同名多通道必须使用额外身份指纹；本项目优先使用海阔规则数值 `version`。
- 语义版本、业务 build、Shell 数值 version 是不同维度，不得默认互相相等。
- 无法确认真实版本时，应显示“已安装 / 版本待识别”，`updateKnown=false`；宁可不报更新，也禁止猜测通道制造假更新。
- 精确扫描必须由显式“同步/刷新安装状态/诊断”触发，扫描结果持久化；普通首页只读 Verified Index。

## 7. Verified Device Install Index 推荐实现

```text
显式同步
→ getRuleCount()
→ getLastRules(count) / 本地规则表
→ 得到 title + numeric version（能取得时）
→ 对未命中标题再用 hiker://home@标题做存在性兜底
→ channel-group 按需拉 channels.json
→ 读取对应 Shell，提取数值 version 形成 Channel Fingerprint
→ 精确匹配 Stable/Test/Local
→ 写入 verified_install_index
```

普通首页：

```text
root manifest cache
+ verified_install_index
→ 纯本地状态计算
→ 首屏
```

如果海阔版本无法从本地规则表暴露 numeric version，允许降级到“存在已验证、版本未知”，但不能回退到 Delivery state 猜版本。

## 8. 图片缓存同类原则

如果仓库 SVG/PNG 源文件已确认有效，而单个设备持续显示旧破图，优先使用单资源版本 query/path 做 cache bust：

```text
icon.svg?v=<asset-version>
```

不要为了一个图标失败全量改动所有正常资源，也不要反复原地覆盖相同 URL 期待客户端缓存自动失效。

## 9. 跨运行时函数序列化禁令

3.5.6-rc1 为修改 X5 客户端行为，错误覆盖 `workspaceClient()` 并在函数体中引用 Rhino 模块闭包变量 `baseWorkspaceClient`。随后 `hybridDocument()` 对该函数 `.toString()` 后注入 X5，浏览器端不存在 Rhino 闭包，导致整块工作区 `ReferenceError` 白屏。

固定规则：任何将函数通过以下方式跨运行时传输的场景：

- `Function.prototype.toString()` → X5/WebView；
- lazyRule/child page 序列化；
- 远程模块导出后再次字符串化；
- JS 字符串注入另一个 JS 引擎；

都必须满足：**序列化后的函数源码是自包含的，不依赖父作用域变量、临时别名、模块闭包或当前引擎对象。**

需要补丁时，应在源运行时先取得原函数源码字符串并完成纯文本/AST 变换，再把最终自包含函数注入目标运行时。目标运行时必须有 Render Guard/错误页，禁止静默白屏。

## 10. 发布回归门槛

任何云仓首页/程序管理器改动至少验证：

1. 10/20/50 条模拟目录下首屏复杂度不会出现每项网络请求；
2. 首页网络请求数量与程序数基本解耦；
3. 已安装、可更新、收藏数字能快速出现；
4. Stable/Test/Local 任一当前通道均可正确比较同通道目标；
5. 更新中心与首页数字使用同一状态源；
6. 首次进入版本中心只加载当前程序 metadata；
7. 缓存失效/网络异常仍能打开首页；
8. 精确安装扫描只能由显式动作触发，不进入首屏热路径；
9. Delivery state 不得伪装成 Verified device state；
10. 同名 Stable/Test 必须覆盖“存在但身份未知”“精确匹配”“真实可更新”三种测试；
11. X5/子运行时客户端必须做序列化后静态检查，禁止自由变量闭包依赖；
12. 浏览器工作区脚本异常必须有可见错误页；
13. 子资源缓存必须验证**语义有效性**，例如版本中心只有 `channels.length > 0` 才能置 `loaded=true`；
14. 多版本程序正式发布前必须实机验证“版本中心 → Stable/Test/Local 列表 → 导入/覆盖”完整链；
15. 从 X5/网页工作区触发“打开程序”必须实机验证真实原生页面能打开，不能只验证动作返回了某个 URL；
16. 至少再抽测一个其它 `channel-group`，防止只依赖当前程序的 fallback 而误判修复完成。

## 11. 空数组缓存不能代表加载成功

3.5.6-rc3 / 被撤回的 Stable 3.5.6 实机出现“版本数量 0 个 / 可用版本 0 个”。根因不是远端没有版本，而是 Fast Home 的 channel metadata 缓存只检查：

```js
Array.isArray(meta.channels)
```

因此 `{channels:[]}` 也被视为成功缓存。后续 UI 看到缓存存在就设置 `channelsLoaded=true`，永远不再发起真实 `channels.json` 请求，形成“空成功”永久遮蔽真实数据。

### 固定规则

缓存成功判定必须同时满足**结构正确 + 业务语义有效**。例如版本中心：

```text
meta 是对象
+ channels 是数组
+ channels.length > 0
+ 每个必要 channel 至少有可识别 path/version/name
→ 才允许保存 success cache / loaded=true
```

如果远端返回空数组、空对象、传播中的旧文件或解析失败：

- 不得覆盖最后一次成功缓存；
- 不得设置 `loaded=true`；
- 不得 toast“加载成功”；
- 应保留旧成功数据或显示“版本信息加载失败/待重试”。

此原则同样适用于：分类列表、线路列表、章节列表、评论分页、播放源、图片候选、域名池等所有“空集合可能代表异常”的缓存。

## 12. X5 / 网页桥禁止把 `hiker://home@规则名` 当通用跨规则打开协议

3.5.6 实机点击“打开程序”报：

```text
java.lang.IllegalArgumentException: String must not be empty
→ jsoup Selector.select
→ HomeParser.findList
```

根因链为：网页工作区动作返回 `hiker://home@规则名`，X5 再通过 `fba.open()` 构造一个 `findRule=''` 的页面描述。HomeParser 最终拿到空 selector，导致 jsoup `String must not be empty`。

`hiker://home@标题` 可以在 Rhino/原生规则环境中用于存在性探测等特定场景，但它与“网页桥跨规则打开页面”不是同一个合同，禁止混用。

### 固定规则

X5/WebView 要打开已安装海阔规则时，应先在原生/Rhino 侧取得目标规则真实 descriptor，例如：

```text
rule / title
url
findRule / find_rule
preRule
col_type
group
extra
```

然后通过受支持的原生桥（例如 `fba.open(JSON.stringify(descriptor))`）打开。必须保证：

- `url` 非空；
- `findRule` 对需要 HomeParser 的页面非空；
- 缺字段时直接可见报错/Toast，不把残缺 descriptor 交给解析器；
- 浏览器侧不得再把 `hiker://home@...` 作为通用 fallback；
- “动作生成成功”不等于“目标程序打开成功”，必须做实机终端回归。

本事故修复线：`3.5.6-rc4 / Single Workspace 14.3 · Version Center & Native Open Bridge`。

本事故首轮性能修复：`我的规则仓库 3.5.6-rc1 / Single Workspace 14.0`。
白屏恢复：`3.5.6-rc2 / Single Workspace 14.1`。
设备状态准确性修复：`3.5.6-rc3 / Single Workspace 14.2`。
版本中心/原生打开桥修复：`3.5.6-rc4 / Single Workspace 14.3`。
