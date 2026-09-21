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
- `SelectTorrent` 不再复制一套模式实现，统一调用 `$.require("data").getModeUrl(...)`。
- Test1 生成后的完整规则不再包含 `openAppIntent`。
- `查询云数据` 路由对 magnet 使用 `encodeURIComponent`，避免 magnet 中 `&` 参数截断。

### 静态验证

本地使用用户上传的原版执行 Installer mock：

- 成功生成 `磁力君.简·测试`；
- 13 个原版页面全部保留；
- 所有 `js:` 页面脚本 `node --check` 通过；
- 生成规则中不再存在 `openAppIntent`；
- `data / sou / SelectTorrent` 只暴露新 8 模式（兼容旧名仅存在迁移映射中）。

### 当前实机验收重点

1. 设置弹窗模式数量与顺序是否符合预期；
2. 115云盘：选择后点击 magnet，应进入 `115.简` 的磁链播放/离线链；
3. 迅雷云盘：确认调用海阔 `迅雷` 小程序，不拉起迅雷 App；
4. PikPak：确认实际安装规则名及 `diaoyong` 外部调用页；
5. 光鸭云盘 / 123云盘：确认实际安装规则名及 `diaoyong` 外部调用页；
6. 查询云数据 / 复制磁链 / 海阔视界原有行为无回归。

未完成以上实机验证前，不晋级 Stable。
