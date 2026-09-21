# 磁力君.简开发记录

状态：**Test5 / 全新搜索架构待实机验证**  
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

### `SelectTorrent` 收口

- 打开方式同样只保留上述 8 个模式。
- 云盘播放统一调用 `MJSearchCore.routeMagnet()`，不再维护第二套 App Intent 路由。
- `whatslink.info` 元数据查询继续保留，但 magnet 参数改为 `encodeURIComponent()`。

### 静态验证

- `MJSearchCore`：Node 语法检查通过。
- 新 `sou`：Node 语法检查通过。
- 新 `SelectTorrent`：Node 语法检查通过。
- Installer：Node 语法检查通过。
- Test5 不依赖旧 `preRule` 自动更新器，`rule.preRule = ""`。

### 当前实机验收

1. 导入 Test5 后搜索此前关键词 `斗破苍穹`。
2. 分别查看“聚合 / BTDig / Knaben / PirateBay”是否至少有 Provider 返回结果；若某源不可用，应出现单源诊断而不是全页空白。
3. 搜到结果后先测试 `115云盘`，确认进入 `115.简` 的磁链离线/播放链。
4. 再逐个验证 迅雷 / PikPak / 光鸭 / 123 的真实海阔规则名与 `diaoyong` 外部调用协议。
5. 未完成实机验证前不得晋级 Stable。
