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
