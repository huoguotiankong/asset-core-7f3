# 磁力君.简开发记录

状态：**Test only / 待海阔实机验证**  
首次纳入：2026-09-21

## 当前基线

- 基线来自用户上传的 `磁力君.简.hk小程序.zip`，原规则 `rule.json`。
- 原标题：`磁力君.简`。
- 原规则 version：`20250604`。
- 原版共 13 个页面：`data / sou / ysfx / Main / Donate.v / configs / ruleManage / ruleEdit / password / import / rules / codetest / SelectTorrent`。
- 当前仓库此前没有 `磁力君.简` 的 registry / CHANGELOG / Stable/Test 元数据，因此本轮以用户上传规则 + 当前实机截图为真实基线建立程序记录。

## 2026-09-21 · 用户当前产品要求

设置页旧版模式过多，而且大量模式直接通过 Android Intent 或 App Scheme 打开第三方 App。用户要求：

```text
只保留：
海阔视界
查询云数据
复制磁链
115云盘
迅雷云盘
PikPak
光鸭云盘
123云盘
```

其中 115 / 迅雷 / PikPak / 光鸭 / 123 都必须调用**对应海阔小程序**，不再打开对应 Android App。

`规则管理 / 支持作者` 属于工具入口，不属于播放模式，本轮继续保留。

## 原版已确认问题

原 `data.getModeUrl()` 中：

- 迅雷已部分改为 `hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`；
- PikPak 仍使用 `pikpakapp://...` App Scheme；
- 115生活、二驴、新闪存云、柚子、飞驰、海马、鲨鱼、悟空、浩克、影视播放、无限云盘等仍使用 `openAppIntent()` 或 App Scheme；
- `SelectTorrent` 页面仍重复维护另一套 App Intent 分流；
- 设置菜单仍暴露上述全部旧模式；
- `查询元数据` 命名与当前产品目标不一致，统一改为 `查询云数据`。

## 依赖：115.简 Stable 1.1.0

115 磁链外部调用已在本项目中实机确认，正式接口固定为：

```js
"hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(magnet)
```

禁止回退到 `115Search?kw=`；后者已实机证明只会把 magnet 当普通搜索关键词。

## 2026-09-21 · Test1 云盘播放模式精简

### 工件

- Test：`1.0.0-test.1`
- Build / rule version：`2026092101`
- Installer：`apps/tools/magnet-jun/releases/1.0.0-test.1/installer.js`
- Release：`apps/tools/magnet-jun/releases/1.0.0-test.1/release.json`
- 生成标题：`磁力君.简·测试`
- 交付：读取手机已安装 `磁力君.简`，本地克隆并替换 `data / sou / SelectTorrent`，不覆盖原版。

### 模式列表

Test1 设置页只保留 8 个模式：

```text
海阔视界
查询云数据
复制磁链
115云盘
迅雷云盘
PikPak
光鸭云盘
123云盘
```

旧持久化模式自动迁移：

```text
查询元数据 → 查询云数据
迅雷下载 → 迅雷云盘
PIKPAK → PikPak
115生活 → 115云盘
```

其它已删除旧模式若仍残留在 `openMode`，自动回退 `海阔视界`。

### 云盘调用策略

- 115：固定调用 `115.简 / 115Offline?add=`，该链已实机验证。
- 迅雷：优先检测规则名 `迅雷`，兼容 `迅雷云盘`；调用其 `diaoyong` 页面。
- PikPak：依次检测 `PikPakM / PikPak / PIKPAK`；调用其 `diaoyong` 页面。
- 光鸭：依次检测 `光鸭云盘 / 光鸭`；调用其 `diaoyong` 页面。
- 123：依次检测 `123云盘 / 123云盘M / 123Pan / 123盘`；调用其 `diaoyong` 页面。
- 未安装对应规则时给出明确 Toast；已安装但缺少 `diaoyong` 页面时不猜参数协议，提示用户更新/反馈，避免错误拉起外部 App。

### 结构收口

- `data.getModeUrl()` 成为统一磁链模式路由。
- 新增 `$.exports.getModeUrl = getModeUrl`。
- `SelectTorrent` 不再复制一套模式实现，统一调用 `data.getModeUrl(...)`。
- Test1 生成后的完整规则不再包含 `openAppIntent`。
- `查询云数据` 路由对 magnet 使用 `encodeURIComponent`，避免 magnet 中 `&` 参数截断。

### Test1 实机失败

用户实机启动后报：

```text
SyntaxError: 在语句前面缺少“;”
```

同时出现“远程数据已更新到本地”。根因不是 115/云盘调用，而是原版把 `MY_RULE.title` 同时当作远程规则数据文件名：Test1 标题改成 `磁力君.简·测试` 后，`rules`/`preRule` 去请求并缓存不存在的测试标题脚本，随后 `eval()` 非 JS 内容失败。

## 2026-09-21 · Test2 标题耦合修复

- Test：`1.0.0-test.2`
- Build：`2026092102`
- Installer：`apps/tools/magnet-jun/releases/1.0.0-test.2/installer.js`

Test2 将 `rules` 页面中的 `MY_RULE.title` 固定回原版 `磁力君.简`，启动解析错误消失；用户实机确认首页可正常打开、设置可切换到 `115云盘`。

### Test2 实机失败：搜索规则全部空

用户搜索 `斗破苍穹`，当前可见的 `老王磁力 / BTSOW` 等规则全部返回：

```text
~~~什么资源都没有哦~~~
```

继续复核原版后确认 Test1/Test2 还有两个风险：

1. 原版 `preRule` 也有 4 处 `MY_RULE.title`，Test1 曾因此执行测试标题远程更新，并会 `deleteFile("hiker://files/rules/LoyDgIk/ciliSimpleRules.json")`；这会影响正式版和测试版共用的搜索规则缓存。
2. 搜索线程中的 `$.require("data")` 以及 `lazyRule` 传入的 `getModeUrl` 对测试标题/序列化上下文过于依赖；Test1 的 `getModeUrl` 还引用外部 helper，序列化后存在作用域丢失风险。

因此 Test2 冻结，不作为后续基线。

## 2026-09-21 · Test3 搜索运行时隔离

### 工件

- Test：`1.0.0-test.3`
- Build / rule version：`2026092103`
- Release：`apps/tools/magnet-jun/releases/1.0.0-test.3/release.json`
- Installer：`apps/tools/magnet-jun/releases/1.0.0-test.3/installer.js`
- 生成标题：`磁力君.简·测试`

### 修复边界

Test3 不再让测试版自动更新器碰正式搜索规则状态：

```text
rule.preRule = ""
```

测试搜索规则改用独立路径：

```text
hiker://files/rules/LoyDgIk/ciliSimpleRules_magnetjun_test3.json
```

首次运行时，如果正式版当前搜索规则文件存在，则复制：

```text
ciliSimpleRules.json
→ ciliSimpleRules_magnetjun_test3.json
```

因此 Test3 后续的规则管理、禁用/启用、搜索测试都不会再修改正式版搜索规则文件。

`rules` 页面继续固定读取原版远程数据名 `磁力君.简`，避免测试标题参与上游文件名。

### 搜索执行上下文修复

- 搜索线程 `$.require("data").carryRule(...)` 改为当前规则显式页面 `$.require("hiker://page/data").carryRule(...)`；
- `SelectTorrent` 调用同样显式进入 `hiker://page/data`；
- `getModeUrl()` 改为**完全自包含函数**，云盘规则检测/`diaoyong` 页面检测都放到函数内部，避免作为 `lazyRule` 参数序列化后丢失外部 helper 作用域。

### 静态验证

以用户上传原版为基线生成 Test3 mock：

- 13 个页面全部保留；
- 所有页面 `node --check` 通过；
- 生成规则不含 `openAppIntent`；
- Test3 `preRule` 不再删除/刷新正式 `ciliSimpleRules.json`；
- 设置仍只保留 8 个指定模式。

### 当前实机验收顺序

1. 先搜索 `斗破苍穹` 或此前确认能命中的关键词，确认搜索结果恢复；
2. 如果 Test3 仍然只有 `老王磁力 / BTSOW` 且原版 `磁力君.简` 也同时无结果，则判定 Test1 已重置共享规则文件或这两个上游引擎本身失效，需要进入“搜索规则恢复/更新”子任务；
3. 搜索恢复后再验证 115 / 迅雷 / PikPak / 光鸭 / 123 的海阔小程序调用。

未通过实机验证前不晋级 Stable。
