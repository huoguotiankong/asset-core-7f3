# 海阔视界 8.83 第七轮：Android 入口、权限、Provider 与并存迁移审计（2026-10-11）

> 证据等级：**用户提供的 APK 的二进制 Manifest 静态解码；非原版设备运行验证。** 研究基线：`海阔视界-8.83.apk`，SHA-256 `a8f5be99018069a6081d9631b67e99c60970b361dc13b16f19f07498dda7348c`。原版 APK、已安装规则、运行 Stable/Test 全部未修改。

## 一、取证方法

- 在本地容器使用 Python 标准库只读解析 `AndroidManifest.xml` 的 Android 二进制 XML：String Pool、typed attributes、`intent-filter`、`data`、组件、权限、`meta-data`。
- 生成离线研究工件 `HikerView_8.83_Manifest_IPC_Inventory.json` 及可复跑分析器 `hiker_883_manifest_audit.py`。
- 本轮方法只覆盖 Manifest 的声明与推定默认值；未反编译 `ResolveIntentActivity` 业务控制流，未运行深链、Activity、Provider，也没有检测当前手机权限是否已获批准。
- 对照 Android 官方说明：[Android 12 targetSdk 31+ exported 约束](https://developer.android.com/about/versions/12/behavior-changes-12)、[Intent/filter 规则](https://developer.android.com/guide/components/intents-filters)、[Scoped Storage](https://source.android.com/docs/core/storage/scoped)。

## 二、Manifest 组件与导出面

| 组件类型 | 声明数 | 静态推定可 exported=true |
| --- | ---: | ---: |
| Activity | 63 | 6 |
| Service | 16 | 1 |
| Receiver | 15 | 6 |
| Provider | 6 | 2 |
| 总计 | **100** | **15** |

显式 `android:exported=true` 只有 6 项；另一些带过滤器的 Activity/Receiver 省略 `exported`，根据 APK 当前 `targetSdk=30` 推定 exported=true。该统计**不代表 15 个组件都能无条件从外部访问**：权限、Intent 匹配与代码校验还会限制行为。比如两项导出的 DocumentsProvider 声明 `android.permission.MANAGE_DOCUMENTS`；WorkManager JobService 使用 `android.permission.BIND_JOB_SERVICE` 保护。

核心外部入口：

- `com.example.hikerview.ui.home.ResolveIntentActivity`：**22 组 intent-filter**，包括 `ACTION_VIEW`、`BROWSABLE`、`SEND`、`WEB_SEARCH`、`MEDIA_SEARCH`、`SEARCH`；协议/资源类型范围含 `hiker`、`http/https`、`file/content`、`magnet`、`ed2k`、`ftp`、视频/音频/图片以及 `.hiker/.hkzip/.hkpkg/.json/.js/.epub` 等后缀的匹配候选。
- `MainActivity` launcher；`WebViewActivity`、`FilmListActivity`、`VideoPlayerActivity` 带内部类别过滤器，不能因其 exported 推定为 true 就直接声称外部可通过普通隐式 URL 启动。
- Intent Filter 的多个 `<data>` 项在 Android 中有组合语义；不能从拆开的单项直接推出完整精确匹配关系。文件扩展名在清单出现也不证明真实解析/导入成功。

对下一代产品的架构影响：**系统 Intent 层与海阔 hiker:// 内部规则路由必须分层**。前者处理外部 URI/MIME/SEND/权限与用户选择；后者处理规则名称、HostContext、页面栈、跨程序状态与动作协议。暂不在测试版无条件复制所有原版 web/magnet 外部过滤器，避免同时安装时抢占链接或使系统选择器冗余。

## 三、可确定的 Provider authority（原版）

| Provider | authority | exported / 特别说明 |
| --- | --- | --- |
| ShareDocumentsProvider | `com.example.hikerview.share.provider` | true；MANAGE_DOCUMENTS |
| MTDataFilesProvider | `com.example.hikerview.MTDataFilesProvider` | true；MANAGE_DOCUMENTS |
| InitializationProvider | `com.example.hikerview.androidx-startup` | false |
| WorkManagerInitializer | `com.example.hikerview.workmanager-init` | false |
| AppUpdaterFileProvider | `com.example.hikerview.fileProvider` | false；grantUriPermissions |
| AndroidX FileProvider | `@0x7f12002a` | false；为资源 ID，真实运行字符串**尚未解析** |

新包名不能只替换 `applicationId`，必须同步更新 Provider authorities、硬编码 `content://` 引用、AppWidget/Receiver action、file paths、Intent 包名路由等。否则可能与已安装原版冲突。不能假设原版和新包之间能够直接互读私有目录，应使用**用户授权的导出/导入和 SAF**，确认规则、收藏、历史与设置的备份/恢复边界。

## 四、权限与 Android 版本升级

- 实际 Manifest 35 项 `uses-permission`（包含 `MANAGE_EXTERNAL_STORAGE`、`READ/WRITE_EXTERNAL_STORAGE`、`CAMERA`、`RECORD_AUDIO`、`SYSTEM_ALERT_WINDOW`、`POST_NOTIFICATIONS`、`REQUEST_INSTALL_PACKAGES`、`ACCESS_FINE_LOCATION` 等）；**不能从声明判断实际授权、业务必需或安全漏洞**。
- APK 使用 `minSdk=26`、`targetSdk=30`、`compileSdk=33`，应用上有 `requestLegacyExternalStorage=true`、`usesCleartextTraffic=true`，但另有 `networkSecurityConfig=@0x7f160006` 尚未解码，不能仅凭单个字段判定某个域名的最终 TLS/HTTP 安全配置。
- 未来独立构建在面向 targetSdk 31+ 时应显式写入带过滤器的 Activity/Service/Receiver 的 `android:exported`，检查 PendingIntent mutability、Scoped Storage/SAF、媒体权限、后台服务与 Android 16 真机行为。该项针对**未来目标 SDK 升级**，不是“原版 8.83 一定无法安装”。

## 五、本轮实际产生的无害设备基准测试探针

- 两个独立本地规则包：`Hiker883Probe_Target_20261011.hk小程序.zip` 与 `Hiker883Probe_Main_20261011.hk小程序.zip`。两者名称唯一，不覆盖现有规则；基于现有 ZIP 的 `rule.json`/字符串化 `pages` 数据结构生成。
- 主探针：独立首页/两级子页、`simple=true`、`pageTitle`、`getParam`、系统返回和 `onClose` 临时变量、`flex_button`/ `scroll_button` 组合、`updateItem` 动态更新、带 `rule=` 的跨规则目标页面。
- 目标探针：`entry` 二级页、规则上下文和同名私有变量的隔离状态观察。
- 所有生成的 6 段 JS 已通过 **Node.js 22 `--check` 语法校验**；ZIP 内容结构可以本地读取。**没有在海阔 8.83 内运行、没有证明规则导入成功或 API 行为正确**。无网络、账户、Cookie、外置磁链、DEX/native 加载或其他业务规则修改。
- 对应生成器和清单在本次会话的可下载 `HikerView_8.83_IPC_Research_Kit_20261011.zip`；因文件可能不自动成为仓库运行资产，后续需要在专门的测试目录复核/按授权纳入，而不是擅自加入线上 Stable。

拟议原版非侵入式手工测试：先导入 Target → 再导入 Main → 检查首页 UI 组合 → A→B 返回 → 动态更新 → 跳目标规则并返回 → 截图和日志 → 可选删除两条探针规则。使用用户当前原版 8.83，**测试结果仍为空**。

## 六、重构 Gate 更新结论

- **已经建立**：原版 Android 外部入口、Provider 固定标识、Manifest 权限的可复跑清单；隔离的原版行为测试素材。
- **尚缺**：原版实机导入/页面/返回/跨规则调用行为证据；资源 ID authority 的真实字符串；关键 `ResolveIntentActivity` 分支；Android 16 隔离包名的最小原型；数据迁移及真实播放器回归；授权许可边界。
- **决策**：可以推进纯隔离的实验宿主和自动化兼容工具设计，但**不能宣布整机重写条件成熟或对原版覆盖安装**。
