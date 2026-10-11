# 海阔视界 8.83 兼容客户端研究：第五轮静态样本审计与重构开工门槛（2026-10-11）

> **状态：未达到完整重构开工条件；可以继续执行独立兼容性验证与无侵入式研究。** 本文所有样本证据来自 8.83 APK、用户提供的规则 ZIP 及已输出的 DEX API 合约；本轮没有实机测试、没有修改或重签原版 APK、没有变更任一小程序 Stable/Test/Release。

## 证据及研究方法

- 8.83 APK 固定 SHA-256：`a8f5be99018069a6081d9631b67e99c60970b361dc13b16f19f07498dda7348c`；此前 DEX 审计已登记 160 个 `@JSAnnotation` 方法和参数注解，详见 `docs/HIKER_ANDROID_883_JS_COMPATIBILITY_AUDIT_20261011.md`。
- 本轮对项目已有 **20 个 .hk小程序.zip** 只读分析：`rule.json`、`require.json`、`libs.zip` 及嵌套 `data.zip/data2.zip` 中的 JS 文本。没有启动规则、访问第三方站点、公开原始规则、URL、账号或凭据。
- 方法为词法调用匹配（method/alias 正则）。结果可能包含 JS 字符串/注释中的误报、第三方 minified 库造成的重复，且**不包含动态网络加载的完整源码**；故**调用痕迹≠运行调用，也不是兼容率**。
- 本轮扫描发现 160 个注解方法中 **117 个**在样本文本中出现调用名称候选；总计 13,421 个词法候选调用（不得视为真实调用次数）；其余 43 个没有匹配（不得视为无用）。
- 程序数（20 为分母）：`hiker://page/` 19、动态更新调用特征 19、`$.require/$.importRequire` 19、懒规则特征 19、Java 桥接特征 17、`hiker://files/` 11。高频 API 按涉及样本数：`require` 19、`refreshPage` 19、`getMyVar` 18、`putMyVar` 18、`fetch` 18、`getItem` 17、`setItem` 17、`setResult` 17、`request` 16、`updateItem` 14。
- 嵌套包里总计检测到 **48 个 JS 文件、2 个 DEX、1 个 ARM64 .so**；其中一个样本的 `data2.zip` 包含 QuickJS wrapper、Java DEX、Native .so，规则文本同时出现 `QuickJsEngine`、`DexClassLoader` 相关引用。尚未证实运行时真实执行到这些分支。此类扩展必须有可控权限边界，不能直接默认开放任意 native/Dex 加载。

## 旧公开源码与当前 APK 的可确认差异

- 官方公开仓 `qiusunshine/hikerView@master/app/src/main/assets/Hikerurl.js` 文本含 `@version 2`，长度约 1,813 字符；8.83 内 `assets/Hikerurl.js` 标 `@version 6`，18,370 字节，含 `$.require`、`$.importRequire`、`Module._cache`、`goPreRule`。**旧源码绝不能当完整 8.83 规则兼容框架**。
- 8.83 内 JS 对 Node 22 的直接 `--check` 在第 221 行因重复 `let id` 报 SyntaxError；这只说明不能原样搬到现代 JS 引擎，**并不证明原版 Rhino 执行报错**。
- 当前可访问的旧公开仓根目录没有可查的 `LICENSE`，也未发现 `app/src/main/AndroidManifest.xml` 和 `gradle/wrapper/gradle-wrapper.properties`；技术上不能断言旧工程已经可直接编译，授权范围仍需核查。

## 对未来兼容宿主的架构约束

```
Rule Import + Version / Bootstrap
 -> hiker:// URI + MY_* HostContext
 -> Rhino / JS Bridge Annotation+Parameter + Hikerurl.js DSL
 -> require / $.require / preRule + cache + storage + DOM + HTTP
 -> ArticleList / setResult / dynamic EventBus / navigation lifecycle
 -> PlayData + Headers + LazyRule + Proxy + ExoPlayer / External Player
 -> Optional trusted Native/Dex extensions (explicitly gated)
```

优先固定端到端调用语义，允许未来按层替换媒体内核/UI，但不得一次更换规则引擎、路由、网络、存储和播放器而无回归依据。

## 判定何时可以正式开始重写（Gate）

| Gate | 最低客观证据 | 当前状态 |
| --- | --- | --- |
| A. 8.83 静态接口事实 | API、参数/默认值、别名、URI、核心播放模型，关键方法级调用与异常模式 | 已有基础，异常/动态控制流仍待核对 |
| B. 原版设备行为 | 在**原版 8.83**运行无害规则，验证 `refresh`、`$.require.eval`、嵌套模块、参数恢复、`fetch/require` 版本缓存、页面返回 | **未实机验证** |
| C. 代表性规则集 | 至少 8 个能力维度（本地/远程、页面动态、Cookie/登录、图片、播放器、外部程序调用、可选 DEX）有输入、输出、日志和异常用例 | **只有静态样本** |
| D. Android 安全实验 | 独立包名和签名，Android 16 能运行最小规则/页面/存储契约，有崩溃日志、不占用原版数据 | **未构建** |
| E. 恢复与授权 | 规则/收藏/历史备份恢复可证实；native/Dex 插件默认不信任、权限可控；复用代码授权明确 | **未验证** |
| F. 播放对照 | 原版与测试环境的 MP4/HLS/Headers/Proxy/seek/字幕弹幕/外部内核路径可对照 | **只有静态链** |

**决策：** 继续分析和制定最小兼容测试；目前不宣告可以进行完整重构重写。正式开工至少须具备 A 的关键合同、B 的原版行为基线、C 的代表性预期及 E 的安全边界，并对 D 给出可证实的隔离最小运行可行性。播放器 F 可单独作为后续里程碑，但 PlayData 的合同必须先固定。

## 项目遵循的边界

- 原版 8.83 不动、不覆盖；不得靠猜测导出用户应用的私有签名/数据。
- 现有 asset-core-7f3@main 仍是海阔小程序唯一正式发布源；本档案仅作为客户端研究，不创建新的正式运行依赖。
- 当前无后台研究/自动测试，用户无需为本轮承担实机测试；真正开展 Android B/D/F 验证时需明确提出测试步骤和证据。
