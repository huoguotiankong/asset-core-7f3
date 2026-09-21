# 磁力君.简开发记录

状态：**Test6 / 可管理 Provider 搜索待实机验证**  
首次纳入：2026-09-21

## 当前基线

- 基线来自用户上传的 `磁力君.简.hk小程序.zip`，原规则 `rule.json`。
- 原标题：`磁力君.简`；原规则 version：`20250604`。
- 原版共 13 个页面：`data / sou / ysfx / Main / Donate.v / configs / ruleManage / ruleEdit / password / import / rules / codetest / SelectTorrent`。
- Stable 仍保留用户设备中的原版基线，所有新改动先走 `磁力君.简·测试`。

## 产品目标（2026-09-21）

设置中的播放模式只保留：

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

115 / 迅雷 / PikPak / 光鸭 / 123 均必须调用**对应海阔小程序**，禁止再通过 Android Intent / App Scheme 拉起外部 App。

## 115 正式外部调用接口

`115.简` Stable 1.1.0 已实机验证，磁链固定通过：

```js
"hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(magnet)
```

禁止使用 `115Search?kw=`；该入口已实机证明只会把 magnet 当普通网盘搜索关键词。

## Test1 ～ Test4 失败链（已冻结）

### Test1 · 1.0.0-test.1 / 2026092101

目标：精简模式并把云盘模式改为海阔小程序调用。

实机启动报：

```text
SyntaxError: 在语句前面缺少“;”
```

根因：原版把 `MY_RULE.title` 同时作为远程 Apollo 搜索脚本文件名；测试标题 `磁力君.简·测试` 导致远程脚本取错并 `eval()` 非有效 JS。

### Test2 · 1.0.0-test.2 / 2026092102

固定远程脚本名为 `磁力君.简` 后启动恢复，但搜索 `斗破苍穹` 时 `老王磁力 / BTSOW` 等全部为空。

### Test3 · 1.0.0-test.3 / 2026092103

尝试隔离 `ciliSimpleRules.json`、关闭标题耦合 `preRule` 更新并显式加载当前 `data` 页面，实机仍全部搜不到。

### Test4 · 1.0.0-test.4 / 2026092104

从原版重新生成，搜索改为同页串行 `carryRule()` 并增加诊断，实机仍无结果。随后用户确认**原版 `磁力君.简` 搜索也已经失效**。

结论：继续修旧 `rules → configs → data.carryRule → batchExecute` 链价值很低；从 Test5 起正式废弃旧搜索体系，不再把旧 Apollo 规则作为搜索事实源。

## Test5 · 全新 Provider 搜索架构

### 元数据

- Test：`1.0.0-test.5`
- Build / rule version：`2026092105`
- Release：`apps/tools/magnet-jun/releases/1.0.0-test.5/release.json`
- Installer：`apps/tools/magnet-jun/releases/1.0.0-test.5/installer.js`
- 生成标题：`磁力君.简·测试`
- Stable：不覆盖。

### 架构边界

Test5 **不再调用旧搜索实现**：

```text
旧链（停用）
rules
→ Apollo 远程脚本
→ configs / ciliSimpleRules.json
→ data.carryRule
→ batchExecute

Test5 新链
sou UI
→ MJSearchCore
→ Provider 并发请求
→ 统一 Result Model
→ BTIH 去重
→ 排序/精准筛选
→ 统一磁链路由
```

原版 `data/configs/rules/ruleManage` 页面暂时保留在规则包内仅作为兼容遗留，但 Test5 正常搜索运行链不再引用它们；后续 Stable 收口时可进一步清理。

### 当前 Provider

#### BTDig

- 请求：`https://www.btdig.com/search?q=<keyword>&p=<page>&order=0`
- 解析 `one_result / torrent_name / torrent_size / magnet`。
- 不依赖旧磁力君搜索规则。
- 若出现验证码/Cloudflare/Forbidden，仅该 Provider 报错，不拖垮其它 Provider。

#### Knaben

- API：`https://api.knaben.org/v1`
- JSON POST；按 seeders 降序，请求分页。
- 读取 `title / hash / magnetUrl / bytes / seeders / peers / date / category`。

#### PirateBay / APIBay

- API：`https://apibay.org/q.php?q=<keyword>&cat=0`
- JSON GET。
- 使用 `info_hash` 本地构造 magnet；按 seeders/size 排序并在本地分页。

### 聚合与容错

- 默认“聚合”同时请求三个 Provider。
- 可以单独切换 `BTDig / Knaben / PirateBay`。
- 使用 BTIH/infohash 去重。
- 单 Provider 失败进入“搜索源诊断”，其它源继续展示。
- 结果统一展示：来源 / 做种数（可用时）/ 大小 / 日期。
- 默认模式按做种数、大小排序。
- 精准模式要求标题包含关键词拆分后的全部主要 token。

### 播放模式

Test5 搜索结果与“查询云数据”页面统一走 `MJSearchCore.routeMagnet()`：

```text
海阔视界 → 返回 magnet
查询云数据 → SelectTorrent
复制磁链 → copy
115云盘 → 115.简 / 115Offline?add=
迅雷云盘 → 对应海阔小程序 diaoyong
PikPak → 对应海阔小程序 diaoyong
光鸭云盘 → 对应海阔小程序 diaoyong
123云盘 → 对应海阔小程序 diaoyong
```

所有旧 Android `openAppIntent()` / PikPak App Scheme 不进入 Test5 新搜索/播放链。

## Test6 · 可管理 Provider Registry

### 元数据

- Test：`1.0.0-test.6`
- Build / rule version：`2026092106`
- Release：`apps/tools/magnet-jun/releases/1.0.0-test.6/release.json`
- Installer：`apps/tools/magnet-jun/releases/1.0.0-test.6/installer.js`
- Stable：不覆盖。

### 用户新增要求

在 Test5 全新搜索架构上恢复“规则管理”能力，要求：

```text
可导入新的磁力搜索规则
可删除失效规则
可禁用 / 启用
可自定义排序
排序交互尽量保持原版习惯
```

### 新规则仓

Test6 不回退到旧 `ciliSimpleRules.json`，新建独立 Registry：

```text
hiker://files/rules/LoyDgIk/magnetjunProviders_v2.json
```

默认初始化为：

```text
BTDig
Knaben
PirateBay
```

三个内置 Provider 也作为 Registry 条目参与管理，因此可以禁用、删除、移动、置顶；执行“重置”可恢复内置规则。

### 管理能力

`ruleManage` 页面改为新 Registry 管理器，支持：

```text
新增
导入
重置
清空
编辑（自定义脚本规则）
禁用 / 启用
删除
移动到指定序号
置顶
```

列表序号顺序就是**聚合搜索 Provider 优先级**。聚合结果按规则顺序依次合并，再按 BTIH 去重；同一磁链由排在前面的规则优先保留，因此自定义排序具有真实业务意义。

搜索页同时增加：

```text
⚙ 规则
```

并在“模式”菜单末尾增加“规则管理”，两处都可直接进入管理页。

### 导入兼容

Test6 兼容三种导入输入：

1. 原版 `磁力君.简` 搜索引擎完整口令；
2. JSON 对象 / JSON 数组；
3. Base64 编码 JSON。

对于原版规则字段：

```text
name
find
findAliUrl
basicUrl
page
user
```

继续兼容。`find` 在新 Provider 沙箱边界内通过 `new Function(s,page,user,basicUrl)` 执行，返回数组即可；单条脚本规则失败只进入该 Provider 的诊断，不影响其它 Provider。

`findAliUrl` 继续作为点击结果后的延迟解析器；字符串/对象/数组结果均有兜底处理。

### 新增/编辑

`ruleEdit` 保留原版主要编辑体验：

- 名称；
- `find` 搜索脚本；
- `findAliUrl` 链接解析脚本；
- `basicUrl`；
- 是否翻页。

保存前会做 `new Function` 语法检查，避免明显语法错误进入活动 Registry。

### 搜索核心变化

`MJSearchCore.providers()` 不再写死 Provider，而是从 `configs.getUsefulJson()` 动态生成搜索源按钮。

搜索执行：

```text
Registry 当前顺序
→ 逐 Provider 隔离执行
→ 标准化 Result Model
→ 精准筛选（可选）
→ BTIH / URL 去重
→ 保留 Registry 优先顺序
```

自定义脚本规则与内置 Provider 共用同一搜索结果和磁链播放路由，因此导入的新规则天然支持 115 / 迅雷 / PikPak / 光鸭 / 123 等现有播放模式。

### 静态验证

- `configs.js`：Node 语法检查通过。
- `import.js`：Node 语法检查通过。
- `rule_manage.js`：去除 `js:` 后 Node 语法检查通过。
- `rule_edit.js`：去除 `js:` 后 Node 语法检查通过。
- `search_core.js`：Node 语法检查通过。
- `search_page.js`：去除 `js:` 后 Node 语法检查通过。
- `installer.js`：Node 语法检查通过。
- Test6 模块固定到不可变 commit，不依赖 `@main` 热变更。

### Test6 实机验收

1. 首页应出现 `⚙ 规则`，模式菜单中也应出现“规则管理”。
2. 规则管理默认显示 `BTDig / Knaben / PirateBay` 三条规则。
3. 测试禁用一条规则：首页对应 Provider 按钮应消失；重新启用后恢复。
4. 测试“移动/置顶”：首页 Provider 顺序同步变化，聚合优先级随之变化。
5. 导入一条原版磁力搜索规则，确认可出现在规则列表和首页 Provider 按钮中。
6. 删除失效规则后，其 Provider 不再参与聚合搜索。
7. 搜索结果继续验证 `115云盘` 调用链。

未完成以上实机验证前不得晋级 Stable。

## 2026-09-21 · 独立可导入搜索规则

### BTSearch (`btsearch.love`)

- Rule：`apps/tools/magnet-jun/rules/btsearch-love.json`
- Installer：`apps/tools/magnet-jun/rules/btsearch-love-installer.js`
- Test6 Registry id：`btsearch_love`
- 使用站点当前 `/api/search` JSON 接口，不抓取搜索结果 HTML。
- 请求需要动态 `x-timestamp / x-nonce / x-sign`；签名参数按站点当前前端协议生成。
- 统一输出标题 / BTIH / magnet / bytes / 文件数 / 日期等字段，天然复用 Test6 的 115 / 迅雷 / PikPak / 光鸭 / 123 路由。
- 静态/模拟校验通过；真实设备网络调用仍以用户实机为准。

### SkrBT (`skrbtso.top`)

- Rule：`apps/tools/magnet-jun/rules/skrbtso-top.json`
- Installer：`apps/tools/magnet-jun/rules/skrbtso-top-installer.js`
- Test6 Registry id：`skrbtso_top`
- 主域：`https://skrbtso.top`；当前保留 `https://skrbtlz.top` 作为兼容回退域。
- 搜索入口：`/search?keyword=<keyword>&p=<page>`。
- 当前结果结构按 `.list-unstyled` + `a.rrt.common-link` 解析；`li.rrmi` 的 span 用于大小 / 文件数 / 日期元数据。
- 搜索列表不假定直接包含 BTIH；点击结果后通过详情页 `#magnet` 延迟取得真实 magnet，再进入统一播放路由。这修正了早期“从详情 URL 猜 40 位 hash”的错误方案。
- 若返回 Challenge / reCAPTCHA 页面，仅提示用户先在海阔网页手动完成站点验证；不实现自动绕过验证逻辑，避免把单站风控拖成聚合搜索卡死。
- 搜索 `find`、详情 `findAliUrl` 和 Installer 已通过语法检查；模拟 DOM 已验证标题、详情 URL、大小、文件数、日期解析。真实站点当前搜索请求存在 403/Challenge 风险，最终以海阔实机验证为准。
- SkrBT 规则版本 `meta.version = 2`；当前冻结规则 commit：`73767bdc0578913fdedcb6aad3dada5a3009e85e`。

### BT联盟 (`mm.btlm.in` / `se.btlm.one`)

#### v1 ～ v8 失败链

- 早期版本依次尝试了旧页面解析、固定 URL 猜测、WebView 提交、多个候选域、DOM 扫描以及动态表单识别。
- 实机已经证明：站点本身可以搜索，且页面能显示类似 `8338 条` 的结果总数，但旧规则无法稳定取得资源列表；WebView 方案还出现过超时。
- 这些版本的共同问题是没有先还原站点真实后端路由，属于试探式适配，继续堆选择器价值有限。

#### v9 / v10 · SCDht 源码级还原

- 进一步确认 BT联盟当前页面结构与开源 `SCDht` 实现一致；SCDht 路由源码明确注册：`GET /search/:k` 与 `GET /search/:k/:sort`。
- SCDht 前端 `common.js` 的搜索按钮明确执行：`window.location = '/search/' + encodeURIComponent($('#key').val())`，因此正式停止猜测 `q=`、`keyword=`、POST/API 等入口。
- SCDht `list.html` 明确使用 `ul.media-list > li.media`，结果标题为 `h4 > a.title`，详情 URL 直接包含 40 位 `InfoHash`，列表同时输出 `magnet:?xt=urn:btih:<InfoHash>`。
- v9 首次改为 `https://se.btlm.one/search/<keyword>` 的服务端 HTML 直取，不再依赖 WebView。
- v10 在 v9 基础上进一步降低海阔 DOM 解析器兼容风险：优先直接扫描 `a.title`，从详情 URL 提取 40 位 InfoHash 并本地构造 magnet；只有直提失败才回退 `parseDomForArray(...li.media)`。
- `Hot` 只作为描述元数据展示，不再错误映射成 seeders/做种数。
- Rule：`apps/tools/magnet-jun/rules/btlm-in-v10.json`。
- Installer：`apps/tools/magnet-jun/rules/btlm-in-v10-installer.js`。
- Test6 Registry id：`btlm_in`；规则目录当前指向 v10，Stable/Test6 核心均未改动。
- v10 `find` / `findAliUrl` 与 Installer 已通过 Node 语法检查；真实站点网络与海阔运行时仍必须实机验收。

#### v10 实机验收

1. 使用 v10 Installer 更新现有 `BT联盟` Provider。
2. 单独选择 `BT联盟`，搜索此前用于对照的关键词（优先继续用 `斗破苍穹`）。
3. 正常预期：直接出现资源列表，不再打开 WebView；点击结果应直接进入当前播放模式，因为 magnet 已在搜索阶段由 InfoHash 构造。
4. 再翻到第 2 页，确认 `?p=2` 分页可用。
5. 若仍失败，保留 Provider 诊断完整文字；此时重点只剩站点当前部署与原版 SCDht 的差异或网络风控，不再回退到 URL 猜测方案。

#### v11 · 详情链接二段解析（当前目录版本）

- 对 v10 的假设做了收口修正：上游 SCDht 模板可能让详情 URL 直接携带 InfoHash，但 BT联盟当前实际部署不能再强依赖这一点。此前已出现“搜索页确认命中大量结果，但列表阶段拿不到 40 位 InfoHash”的症状。
- Test6 `MJSearchCore` 原生支持脚本 Provider 返回普通 HTTP `url`，并在用户点击结果时调用该规则的 `findAliUrl`；因此搜索阶段没有必要强制提前拿到 magnet。
- v11 保留已确认的 `https://se.btlm.one/search/<keyword>` 路由和 `?p=<page>` 分页，不再回退到 `q=` / `keyword=` / WebView 等旧猜测链。
- 列表解析改为三层：优先 `a.title`；其次 `h2/h3/h4` 中的结果链接；最后扫描带 `media/result/torrent/search-item/list-item` 特征的结果容器。链接若带 InfoHash 仍直接构造 magnet；否则保留为绝对详情 URL。
- `findAliUrl` 负责第二段解析：自动补全相对 URL，优先读取显式 magnet，再从 `href/value/data/link/url` 属性、可见文本节点或 `infohash/info_hash/btih/hash` 字段中提取 40 位 InfoHash。
- Rule：`apps/tools/magnet-jun/rules/btlm-in-v11.json`；规则冻结 commit：`2bae6a0d078fb69d6949ad4b48646a859cfbf9e7`。
- Installer：`apps/tools/magnet-jun/rules/btlm-in-v11-installer.js`，安装时从上述不可变 commit 获取规则。
- 规则目录 `apps/tools/magnet-jun/rules/registry.json` 已指向 v11；Stable 与 Test6 主程序均未改动。
- 已通过 Node `new Function` 语法检查，并用模拟 HTML 验证：`a.title + 详情 URL`、`h3/h4 + 详情 URL`、列表直接 40 位 InfoHash、详情页显式 magnet 四条路径均正常。

#### v11 实机验收

1. 用 v11 Installer 更新现有 `BT联盟` Provider 后，单独选择 `BT联盟` 搜索 `斗破苍穹`。
2. 首要验收点从“列表必须直接生成 magnet”改为“能否先正常显示搜索结果列表”；若结果链接不带 hash，列表仍应出现。
3. 点击任意结果后再验证 `findAliUrl` 是否得到 magnet，并进入当前选择的播放/云盘模式。
4. 再验证第 2 页，确认 `?p=2` 仍能返回列表。
5. 若搜索页仍显示类似 `8338 条` 但规则报错，新的关键诊断应为“未提取到结果详情链接”；此时只需针对当前结果卡片 HTML 调整候选链接选择器，不再修改搜索路由。
6. 未完成上述实机验证前，v11 继续保持 `device-validation-pending`，不得晋级 Stable。

### 2026-09-21 · BT联盟冻结 / BT4G 接替验证

- 用户明确停止继续投入 BT联盟适配；`btlm_in` v11 保留历史实现，但规则目录状态改为 `frozen-after-repeated-device-failure`。除非用户以后明确重新开启，不再继续升 v12/v13。
- 新增 BT4G Provider，来源参考 `https://torrends.to/site/bt4g`；Torrends 当前列出的可用官方域包括 `bt4gprx.com / bt4g.com / bt4g.org`。
- 采用 BT4G RSS/XML 搜索接口，不抓普通 HTML：`/search?q=<keyword>&orderby=relevance&category=all&p=<page>&page=rss`。
- SearXNG 当前 BT4G 引擎同样使用上述 RSS 接口，并从每个 `<item>` 读取 `title / guid / description / link / pubDate`；其中 `<link>` 为 magnet，`description` 用于提取大小。
- Rule：`apps/tools/magnet-jun/rules/bt4g.json`；规则冻结 commit：`41500c7a82696d31211c753011f7a75d4b62734c`。
- Installer：`apps/tools/magnet-jun/rules/bt4g-installer.js`；安装器固定从上述不可变 commit 获取规则，避免 `@main` 热变更。
- 搜索时按 `basicUrl → bt4gprx.com → bt4g.com → bt4g.org` 去重后依次尝试，单个镜像出现网络错误、Challenge 或非 RSS 返回时自动尝试下一个。
- RSS 解析直接输出 `title / magnet / bytes / date / desc`，因此可直接复用 Test6 现有 115 / 迅雷 / PikPak / 光鸭 / 123 播放路由，无需详情页二段解析。
- `find` / `findAliUrl` 与 Installer 已通过 Node 语法检查；额外使用模拟 BT4G RSS 验证了标题、magnet、1.5 GB 大小换算及日期输出。
- 当前无法从开发容器直接联网请求 BT4G RSS，最终网络可达性及真实 RSS 内容仍以海阔实机为准；未实机通过前状态保持 `device-validation-pending`。
