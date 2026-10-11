# 海阔视界 8.83 第八轮：Android 资源表、FileProvider 与离线探针验证（2026-10-11）

> **只读静态研究，不是原版手机的实际运行结果。** 同一 APK SHA-256：`a8f5be99018069a6081d9631b67e99c60970b361dc13b16f19f07498dda7348c`。本轮未重签、未替换 APK，未修改原版规则和任何 Stable/Test 元数据。

## 1. 使用实际 APK 资源表还原关键 ID

实现了对 `resources.arsc` 的 `ResTable_package/ResTable_type/ResTable_entry` 解码，结合 `AndroidManifest.xml` 及 3 份 AXML 子资源得到：

| 原 Manifest 资源 ID | 类型/符号 | 8.83 的实际值 |
|---|---|---|
| `@0x7f12002a` | `string/authority` | **`com.example.hikerview.provider`** |
| `@0x7f160006` | `xml/network_security_config` | `res/8G.xml`：`base-config cleartextTrafficPermitted=true` |
| `@0x7f160008` | `xml/provider_paths` | `res/zz.xml` |
| `@0x7f160000` | `xml/app_updater_paths` | `res/GY.xml` |

`provider_paths` 的声明包含 `external-path`（`name=external_files`, `path=.`）和 `files-path`（`name=files`, `path=.`）。

`app_updater_paths` 则声明 `root-path path=/`、`external-path`、`external-cache-path`、`external-files-path`、`files-path`、`cache-path` 等。更新器的 Provider Manifest 显示 `exported=false` 和 `grantUriPermissions=true`：**路径范围广不代表已经实证了漏洞；风险取决于代码何时向谁签发哪个临时 URI 授权**。新版必须按应用实际需求收窄共享路径，不直接复刻此配置。

`network_security_config` 解码为一个 `base-config`、`cleartextTrafficPermitted=true`，无额外 `domain-config` 子项；与原 Manifest `usesCleartextTraffic=true` 一致。新版对需要 HTTP 的旧规则仍应保持兼容策略，但新规则/敏感凭据应以最小权限和加密传输为默认。

## 2. 六个 Provider 的 authority 静态事实

- AndroidX FileProvider：`com.example.hikerview.provider`（此前文档只显示资源 ID）
- ShareDocumentsProvider：`com.example.hikerview.share.provider`
- MTDataFilesProvider：`com.example.hikerview.MTDataFilesProvider`
- AndroidX Startup：`com.example.hikerview.androidx-startup`
- WorkManager Initializer：`com.example.hikerview.workmanager-init`
- AppUpdaterFileProvider：`com.example.hikerview.fileProvider`

如果做与原版并存的独立 APK，必须重新命名 Provider authorities，核对硬编码 `content://`、Intent 和 URI 授权行为。不能通过修改应用包名直接实现旧包数据共享。

## 3. 两份原版测试探针已完成更严格的**离线**验证

输入：`Hiker883Probe_Main_20261011.hk小程序.zip` 和 `Hiker883Probe_Target_20261011.hk小程序.zip`。实现可复跑的 JSON/ZIP、页面路径、目标规则名称、Native JS API 合同、Node JS 语法和显式外部副作用模式的校验器：

| 检查项 | 结果 |
|---|---|
| 两份 ZIP CRC、只包含 `rule.json`、JSON 字段 | 通过 |
| `pages` 字符串化 JSON 数组、4 个唯一子页面 path | 通过 |
| 6 段 JS 的 Node.js 22 `--check` | **6/6 通过** |
| 同规则/跨规则 `hiker://page` 静态路径关联 | 均有目标 |
| `@JSAnnotation` 方法引用 | `addListener/getMyVar/getParam/putMyVar/setResult/updateItem` 均存在 |
| 预设网络/任意文件写入/命令执行特征 | 未出现 |
| 与项目中 20 份原始小程序 title 冲突 | 未发现 |
| Android 8.83 导入/运行/显示/返回栈/跨规则调用 | **尚未执行，0 项通过证据** |

验证器仅适用于本次受控探针的静态自查，不是对任意未知 JS 的安全审计工具，且 Node 语法通过**不表示 Rhino 一定接受**。

本地输出文件：`hiker_883_arsc_resolver.py`、`hiker_883_probe_contract_validator.py`、`HikerView_8.83_Resource_ID_Resolution.json`、`HikerView_8.83_Probe_Static_Validation.json`。研究工具包不包含原版 APK 或私人业务规则源。

## 4. Go / No-go 与实机验证下一步

- **可开始**：原版 8.83 的无侵入实机行为基线验证。建议先导入 Target、再导入 Main，依次检查首页连续组件、A→B 返回、动态 updateItem、跨规则 `rule=` 寻址，留存截图/日志，然后可删除两个测试规则。
- **仍未达到**：正式完整重构条件。原因是未取得原版原生运行行为、独立 Android 16 实验 APK、规则/收藏/历史数据迁移和播放器端到端对照的证据。
- **安全底线**：原版数据不动，不覆盖安装，不默认接管网页/磁力 Intent，不把 broad root-path 直接带到未来测试版，也不将本次脚本静态结果误述为通过实机。

上一轮 IPC 档案：`docs/HIKER_ANDROID_883_IPC_AND_MIGRATION_AUDIT_20261011.md`；UI/Router 回归基线：`docs/HIKER_ANDROID_883_UI_ROUTER_AUDIT_20261011.md`。
