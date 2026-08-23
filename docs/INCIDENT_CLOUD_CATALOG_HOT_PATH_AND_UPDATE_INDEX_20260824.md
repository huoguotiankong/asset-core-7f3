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

因此推荐两层状态：

1. **Fast state**：首页使用，来自规则仓库导入记录/显式 group state；O(1) 或 O(N) 本地计算。
2. **Verified presence**：用户手动执行“刷新安装状态”时扫描真实 `hiker://home@标题`；扫描结果回写 Fast state，但不得每次首页自动执行。

产品文案不得把未经验证的 Fast state 描述成绝对真实设备状态。

## 7. 图片缓存同类原则

如果仓库 SVG/PNG 源文件已确认有效，而单个设备持续显示旧破图，优先使用单资源版本 query/path 做 cache bust：

```text
icon.svg?v=<asset-version>
```

不要为了一个图标失败全量改动所有正常资源，也不要反复原地覆盖相同 URL 期待客户端缓存自动失效。

## 8. 发布回归门槛

任何云仓首页/程序管理器改动至少验证：

1. 10/20/50 条模拟目录下首屏复杂度不会出现每项网络请求；
2. 首页网络请求数量与程序数基本解耦；
3. 已安装、可更新、收藏数字能快速出现；
4. Stable/Test/Local 任一当前通道均可正确比较同通道目标；
5. 更新中心与首页数字使用同一状态源；
6. 首次进入版本中心只加载当前程序 metadata；
7. 缓存失效/网络异常仍能打开首页；
8. 精确安装扫描只能由显式动作触发，不进入首屏热路径。

本事故首次修复实现：`我的规则仓库 3.5.6-rc1 / Single Workspace 14.0`。
