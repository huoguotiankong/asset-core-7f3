# 海阔视界 8.83 第六轮：UI 组件、页面路由和跨小程序协作审计（2026-10-11）

> **状态：只读静态研究。** 对用户提供的海阔 8.83 APK 和 20 个 .hk小程序 ZIP 进行 DEX/JSON/JS 词法分析，并对照海阔开发者手册及官方旧版公开代码。没有启动/执行用户规则、没有访问规则中的业务网址、没有修改 APK 或 Stable。本文所有“检测到/出现”均**不能当作实机兼容通过**。

## 1. 输入及复查工件

- APK 文件 SHA-256：`a8f5be99018069a6081d9631b67e99c60970b361dc13b16f19f07498dda7348c`；实际类 `com.example.hikerview.constants.ArticleColTypeEnum` / `com.example.hikerview.service.parser.PageParser`。
- 官方组件文档：https://docs.189.tyrantg.com/docs/hikerview/help_col_type.html
- 官方路由文档：https://docs.189.tyrantg.com/docs/hikerview/help_link.html
- 旧公开源码 `qiusunshine/hikerView@master`：`app/src/main/java/com/example/hikerview/constants/ArticleColTypeEnum.java` 与 `app/src/main/java/com/example/hikerview/service/parser/PageParser.java`。仅用于对照，不代表当前 8.83 方法行为。
- 离线分析方法：解析 DEX 字符串/类型/方法/类定义与 `code_item` 中 `const-string` 常量引用，不做方法级完整控制流恢复；样本规则分析只读取 `rule.json`、`require.json` 以及可读 ZIP 内嵌脚本文本，**不执行**代码。
- 本轮产生的本地研究工件（未上传用户规则源内容）：`HikerView_8.83_UI_Enum_Dex_Evidence.json`、`HikerView_8.83_UI_Route_Static_Inventory.json`、`HikerView_8.83_UI_Route_Regression_Cases.json` 和可复跑脚本 `hiker_883_ui_route_audit.py`、`hiker_883_dex_ui_contract.py`。

## 2. 实际 APK UI 枚举证据（证据等级 E2：DEX 常量引用）

- `classes.dex` 中 `ArticleColTypeEnum.<clinit>` 的代码项扫描到 **56 条 UI 组件 `const-string` 候选引用、55 个去重后的类型字符串**（同一字符串可重复引用）。这比旧公开源码更有代表性。
- 常见 `movie_1/2/3`、`text_1/2/3/4/5`、`rich_text`、`avatar`、`input`、`flex_button`、`scroll_button`、`x5_webview_single` 等均有 DEX 字符串引用。
- 与旧源码名称集比较，8.83 另含 `movie_1_vertical_pic_blur`、`icon_3_round_fill`、`icon_3_fill`、`icon_5`、`icon_5_no_crop`、`card_pic_3_center`、`icon_1_left_pic` 等。**不能以旧版 ArticleColTypeEnum 完整代表 8.83**。
- 该扫描是 `const-string` 索引的轻量分析，未做完整指令解码或 `enum <init>` 一一绑定，故准确措辞为“静态初始化方法中出现的组件类型常量引用”，**不是已验证 UI 渲染成功的组件清单**。

## 3. 20 个程序的页面与布局静态覆盖（证据等级 E1：词法/声明）

| 指标 | 本轮计算结果 |
| --- | ---: |
| 程序 ZIP | 20 |
| `rule.json` 声明的子页面对象累计 | **291** |
| 声明了至少一个子页面的程序 | 19 |
| 文本中出现 `hiker://page/` | 19/20 |
| 文本中出现动态页面更新相关方法 | 19/20 |
| 文本中出现懒规则标记 | 19/20 |
| 文本中出现 `require/$.require` 相关特征 | 19/20 |
| 文本中出现 `rule=` 参数标记 | 17/20 |
| 文本中出现携带 `rule=` 的页面 URL 候选 | **13/20** |
| 文本中出现输入组件 `col_type: 'input'` 字面量特征 | 12/20 |
| 文本中出现 `x5_webview_single` 字面量特征 | 6/20 |
| 文本中出现 `addListener('onClose', ...)` 特征 | 12/20 |

- `rule.json` 主规则 `col_type` 分布：`movie_3` 12、`movie_3_marquee` 2、`text_center_1` 2，其余 `text_1`、`movie_2`、`movie_1_vertical_pic`、`pic_1_card` 各 1。
- 有 18 个程序在 `pages` 对象中声明 `movie_3` 页面作为一种预设；部分页面 `col_type` 为空，表示必须结合默认组件策略才能解读。
- 补充的可识别 UI token 覆盖面远宽于 `rule.json` 一级/子页面声明：`movie_3`、`input` 各出现于 20/20 的源码文本，但它们也可能存在于内嵌 JS 库、字符串或注释中，**不能据此称 20 个程序都实际展示过 input 控件**。
- 这 291 个是打包 `pages` 声明的静态数量，不包括远程动态 JS 临时生成的页面，更不代表 291 个用户可见导航页面。

## 4. 官方路由与 UI 组合语义：新宿主的保真边界（文档明确）

开发者手册对 `flex_button`、`scroll_button`、`card_pic_2/card_pic_2_2/card_pic_2_2_left` 有相邻元素自动组合与左右布局规则；`x5_webview_single` 还有每页单行约束、高度、浮动、页面刷新及浏览器桥接约定。

因此新客户端的 UI 管线应当是：

```
setResult() / dynamic events
  → Normalize schema (col_type, title, desc, pic_url, url, extra)
  → Stable item identity + grouping/layout pass
  → Component renderer (legacy faithfully; opt-in enhanced UI)
  → viewport state + callback actions + lifecycle
```

不可仅以“每个 JS item 对应一个平铺 Android View”替代组合渲染。需为滚动位置、事件监听、输入实时变化、悬浮 WebView、局部刷新和标题安全区保留分离的状态域。新 UI 应版本化 opt-in，旧 `col_type` 默认行为先按原版测试基线实现。

## 5. 新发现的跨小程序寻址风险（证据等级 E2 + 旧源码互证）

在 **8.83 APK 的实际** `PageParser.isPageUrl` / `PageParser.parsePageRule` 方法的 `const-string` 引用中发现：

- `hiker://page/`
- `rule`
- `title = ?`
- `找不到对应的小程序`（相关缺失提示）

与公开旧源码 `PageParser.java` 的行为结构相符：`hiker://page/<path>` 中可能通过 `rule` 指定目标小程序，旧代码通过 `LitePal.where("title = ?", targetName)` 找到相应 `ArticleListRule`。

**边界：** 8.83 中出现 `title = ?` 强烈支持“标题寻址路径仍存在”；但本轮尚未通过完整方法指令控制流和真机执行确认所有链接分支的优先级、同名规则和重命名结果。不能断言当前一切跨小程序跳转都严格只依赖规则名。

建议在新架构中设计 `StableAppId + LegacyRuleName + VersionedRoute`：
1. 入口对外兼容原始 URI、`rule=` 标题、搜索参数和 `simple` 配置。
2. 内部明确目标程序解析、权限/跨程序动作、返回结果及返回栈，不随 UI 列表复用上一个程序的 HostContext。
3. 去重/重命名/缺失目标的迁移策略先用原版实机回归记录，再决定新客户端的兼容 fallback。
4. 不要擅自把规则名当 URL 编码后的固定 App ID；也不要把旧链接无条件重写为新协议。

原生官方路由还包括 `hiker://home`、`hiker://search`、`hiker://history`、`hiker://collection`、`pics://`、`select://`、`input://` 等；**它们属于宿主动作协议，而非普通页面 URL**，应作为独立的 Action/Navigation 层处理。

## 6. 建议的可执行（但尚未执行）回归契约

本轮构建 19 个独立的测试案例，保存在 `HikerView_8.83_UI_Route_Regression_Cases.json`：
- UI-001..007：普通与连续组合组件、混合列表、嵌入 WebView、标题安全区。
- ROUTE-001..006：本地/跨小程序导航、`rule` 名称、原始 URI 保留、搜索、返回栈与缺失规则处理。
- DYN-001..002：列表节点级更新、生命周期/页面变量。
- DSL-001..002：懒规则序列化与远程模块作用域/缓存。
- PLAY-001：跨小程序磁链调用媒体播放。
- MIG-001：原版与独立测试版安装/恢复隔离。

所有案例均 **0/19 完成真机原版验证**，预期验收文案是拟定检查项，不是已确认的真实旧行为。下一步应以真正的原版 8.83 运行结果填充 `Observed/Expected/Pass/Fail`，之后再启动最小独立 Android UI/Route 宿主原型。

## 7. 对重构 Gate 的影响

- **静态 UI/Route 合同：取得可靠线索。** 已知核心数据形状、主要组件集合、组合布局和旧标题寻址风险。
- **未满足的核心条件：** 组件布局具体测量、动态生命周期、跨规则状态与旧 `rule` 解析的真机行为、Android 16 独立宿主构建、备份恢复及授权审计。
- 本轮结论：可继续做非破坏式 UI/Router 测试平台设计；**仍不宣布可以全面重构/替换原版 8.83**。

> 若将本文件并入项目知识库，维持 `asset-core-7f3@main` 的开发源职责，只写研究文档，不发布业务 Release，不改变 Shared registry/manifest/Stable。
