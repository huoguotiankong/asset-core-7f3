# 海阔视界 8.83 Android APK 静态审计基线（2026-10-11）

> 状态：**静态审计完成第一轮；未修改 APK、未在手机安装增强版、未完成动态行为验证。**
> 样本：用户上传到项目来源的 `海阔视界-8.83.apk`。**“官方原版”来自用户说明**；下列签名指纹为样本内证书，尚未和独立渠道提供的官方签名基线核对，不能据此单独证明来源。

## 一、固定样本与文件结构

| 项目 | 当前样本事实 |
| --- | --- |
| 文件 | `海阔视界-8.83.apk` |
| 文件大小 | 40,592,734 bytes（约 38.7 MiB） |
| SHA-256 | `a8f5be99018069a6081d9631b67e99c60970b361dc13b16f19f07498dda7348c` |
| ZIP 文件条目 | 2,911 |
| classes.dex | 6 个（总计 38,235 条 class_def，包含第三方库和生成类，**不等于业务源码行数**） |
| 海阔自身路径类 | `com/example/hikerview/` 下约 4,804 条 class_def（不等于人工业务类数） |
| ARM64 native .so | 19 个，样本未发现其他 ABI 目录 |
| assets | 180 个条目 |

从二进制 `AndroidManifest.xml` 解码读取：

- 包名 `com.example.hikerview`；`versionName=8.83`；`versionCode=5608`。
- `minSdkVersion=26`；`targetSdkVersion=30`；`compileSdkVersion=33`。
- `application` 使用 `com.example.hikerview.ui.Application`；`hardwareAccelerated=true`；`usesCleartextTraffic=true`；`requestLegacyExternalStorage=true`；`allowBackup=true`。
- 清单包含 63 个 Activity/Activity-alias 条目、16 个 Service、6 个 Provider、15 个 Receiver、35 个 `uses-permission`（仅代表声明，不表示逐项实际使用或已获权限）。
- Manifest 涵盖主页面、浏览器、播放、页面规则编辑、文件、下载等组件。
- APK Signing Block 存在 v2（ID `0x7109871a`）、v3（ID `0xf05368c0`）条目；旧式 `META-INF/CERT.RSA` 也存在。提取证书 SHA-256 指纹：
  `760bfacf150cbd8cc0b955e365023823c33996816cfce0a4f20a64844cdf3ec5`。
- 该指纹**不是原签名私钥**。自签增强版通常不能直接覆盖原包；必须先隔离包名、备份数据，并核对 Provider authority、文件路径、URL 路由、内外部互相调用契约。

## 二、可定位的主要引擎与模块（仅判定类/资源存在）

| 能力 | 确认存在的二进制痕迹 | 审慎结论 |
| --- | --- | --- |
| JS 执行 | `org/mozilla/javascript/` 约 1,453 个类 | APK 集成 Rhino；具体执行流、线程/作用域与 API 兼容行为待动态审计 |
| 播放器 | `com/google/android/exoplayer2/` 约 1,930 个类，`VideoPlayerActivity`、`PlayerChooser` 等 | 集成 ExoPlayer 2 包结构；目前未发现 `androidx/media3/` class_def，不等于已确认播放器仅有一种内核 |
| WebView | `com/tencent/smtt/` 约 382 个类，WebView 及 X5 相关业务类 | 集成腾讯 X5/TBS SDK 组件；具体回退、嗅探、登录/会话链待验证 |
| 规则 | `RuleImporter`、`ArticleListRule`、`ArticleListPageRule`、`PageEditor`、`RuleForegroundService` 等 | 支持定位导入、路由、二级页、页面更新关键入口 |
| 网络 | `okhttp3/`、`BrowserProxy`、`VideoDetector` 等 | HTTP/代理与嗅探能力的入口可追踪 |
| 播放相关 | `DanmuSearchPopup`、`SubtitleSearchPopup`、`M3u8ClearUtil`、`VideoCacheHolder` 等 | 有弹幕、字幕、M3U8、缓存相关代码；效果/兼容待实机 |
| 数据备份 | `WebDavBackupUtil` 等 | 有 WebDAV 相关实现，需核对数据格式与恢复 |
| 原生库 | FFmpeg、`libjlibtorrent-1.2.14.1.so`、`libxl_thunder_sdk.so`、7-Zip、Adblock | 只能确认被打包，不能视为全部功能默认启用 |

相关 assets 包括 `Hikerurl.js`、`home.js`、`bindDataToHtml.js`、`help_js.json`、`help_api.json`、`dplayer/DPlayer.min.js`、`dplayer/hls.min.js`、`theme.js` 等；后续可与本项目海阔官方 API 文档及 GitHub 旧开源核心代码做逐项兼容比对。

## 三、公开源码 / DeepCloud 参照边界

- 海阔部分公开核心源码：`https://github.com/qiusunshine/hikerView`，此前已核查源码 `app/build.gradle` 版本显示 6.8；**不可将 6.8 开源实现视为 8.83 真实业务行为**。
- DeepCloud 参照：`https://github.com/Mowen559/deepcloud-releases/releases/tag/v0.2.10`；参考独立规则兼容层、宿主能力抽象和契约测试，不直接依赖发行二进制，授权范围待核实。
- 研究优先级：**保持海阔规则兼容 > 启动/路由/页面/存储可靠 > 播放/图片增强 > UI 现代化**。新宿主可以实现兼容 API，但不得假设 Android 原生能力能由 Windows 端 Web Worker/ASAR 直接移植。

## 四、建议的下一轮专项审计

1. **规则运行调用图**：Rhino Context/Scope、`setResult`、`lazyRule`、`require`、`fetch/request`、`hiker://page`、`hiker://files`、Cookie/Header、Provider/Shell 更新链。与当前 Stable 代表性规则建立非敏感对照测试。
2. **播放器链**：`VideoPlayerActivity` → `PlayerChooser` → ExoPlayer 实例 → HLS/Range/Seek/缓存/字幕/弹幕/外置内核，分辨代码可达性与实际执行路径。
3. **页面渲染**：`ArticleListFragment`、`ArticleListAdapter`、各种 `col_type`、导航/栈/局部刷新机制；重点避免二级标题栏重叠、列表不能独立滚动。
4. **Android 兼容**：Target SDK 30 的 Scoped Storage/外部存储/通知/后台服务/Android 16 行为；先做不破坏原包的独立试验。
5. **签名及迁移**：确认授权、备份和恢复能力；新包名并存及动态/静态 Provider authorities 一并处理，防止覆盖用户现有规则、数据库和缓存。
6. **测试矩阵**：至少覆盖规则导入、登录/Cookie、JS、图片解密、分类、搜索、二级页面、播放器、调用其他小程序、收藏/历史、断网回退。

## 五、不可声称已完成事项

- 未对原 APK 做修改、重签名、构建或发布。
- 未使用真机安装 APK 测试，也未验证 Android 16 实际兼容效果。
- 未确认与所谓“官方渠道”签名一致。
- 未反编译并核对所有方法级控制流、调用图、第三方组件许可。
- 未验证任何一个现有小程序在独立宿主上的运行兼容率。

> 修订原则：以后发现动态事实与本报告静态推断冲突时，以实机证据和实际调用路径为准，并更新本报告；不得将“包里存在代码/库”误写为“该功能实机正常”。
