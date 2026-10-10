# 海阔视界 8.83 第三轮静态审计：播放数据链与脚本兼容层（2026-10-11）

> **证据类型：APK 内 6 个 DEX 的直接调用指令、方法体常量字符串、assets 内 JS 源码；非真机结果。**
> 样本 SHA-256：`a8f5be99018069a6081d9631b67e99c60970b361dc13b16f19f07498dda7348c`。相关档案：`HIKER_ANDROID_883_APK_AUDIT_20261011.md`、`HIKER_ANDROID_883_METHOD_AUDIT_20261011.md`。本次没有修改 APK、Stable/Test 或任何现有小程序。

## A. 播放引擎新发现

### A1. 确认原生 ExoPlayer 精确版本与媒体类型构建链

- `com.google.android.exoplayer2.ExoPlayerLibraryInfo.<clinit>` 内有明确常量 `ExoPlayerLib/2.15.1`，证明打包的 ExoPlayer 库自报版本 **2.15.1**，不能仅以“ExoPlayer 2”笼统描述。
- `chuangyuan.ycj.videolibrary.whole.WholeMediaSource.initMyMediaSource(Uri, boolean)` 直接构建四类 MediaSource：
  - `ProgressiveMediaSource.Factory`（普通/渐进媒体）；
  - `HlsMediaSource.Factory`，含 `DefaultHlsDataSourceFactory`、可配置的 extractor、playlist tracker；
  - `SsMediaSource.Factory`（SmoothStreaming）；
  - `DashMediaSource.Factory`（DASH）。
- 同一方法调用 `MediaSourceBuilder.UriProxy.proxy(Uri,int)` 和 `getDataSource()`，说明媒体 URI 可以在构建源之前经代理转换。**只能确认直接调用引用存在，具体条件和媒体识别逻辑还需要控制流或真机核查。**
- `chuangyuan.ycj.videolibrary.upstream.DefaultDataSource.<init>(Context,String,int,int,boolean)` 调用 `DefaultHttpDataSource.Factory` 的 User-Agent、connect/read timeout 与 `setAllowCrossProtocolRedirects` 配置接口。这意味着网络数据源的 Header/超时/跳转也需要独立作为播放器升级的兼容合同。

### A2. 极速播放不是“另一套解码器”，而是现有边下边播/代理链

- `com.example.hikerview.ui.video.util.VideoCacheHolder` 有 `initConfig()`、`needProxy(String)`、`getProxyUrl(...)`、`initHeaders(Map)`、`getCacheWhiteList()`、`release()` 等方法。
- `initConfig()` 读取用户设置键 `useProxy`、`proxyThreads`；`needProxy` 出现标记 `#fastPlayMode#`。
- `getProxyUrl` 方法体存在 `/proxyDownload`、`/proxyM3u8Download`、`/clearM3u8?`、`#threads=`、`@temp`、`#fastPlayMode#` 等常量；直接调用 `DownloadManager.addTask`、`DownloadRecordsFragment.getDownloadingPlayUrl`、`RemoteServerManager.isRunning`、`CountDownLatch.await` 等。
- **实际入口引用**：`VideoPlayerActivity.lambda$initView$12` 和 `FloatVideoController.show$lambda$17` 都直接调用 `VideoCacheHolder.getProxyUrl`；不是只有未使用类。
- `VideoCacheHolder.initHeaders` 处理 `User-Agent`/`user-agent`/`user-Agent` 名称形式，这也意味着请求头合并测试不能随意只做大小写敏感的普通 Map 比较。
- `PlayerFastPlayOfficer.handle` 确认有现成的设置 UI 文案和配置：开关 `useProxy`、线程数 `proxyThreads`（3/6/10/16/24/32/跟随下载）、清理策略 `proxyAutoClean`、黑名单模式键 `upb`，并有“缓存最多 2G”“播放失败自动加黑名单”等产品文案。**文案不等于机制已经经动态测试证实**。
- 特别注意：`VideoCacheHolder.getProxyUrl` 含 `getFailedSet` 与失败路径，可能在开启极速播放后对特定 URL 采取回退/避让；先确认实际触发策略再优化，不能无条件将任何媒体丢给代理。

### A3. 拖动/续播具有自己的状态链

- `VideoPlayerActivity.fastPositionJump(long)` 直接调用 `ManualPlayer.getCurrentPosition/getDuration/seekTo` 与 `HeavyTaskUtil.saveNowPlayerPos`；浮窗端 `FloatVideoController.fastPositionJump` 也会记录进度。
- `ExoUserPlayer.seekTo(long)`、`seekTo(int,long)` 最终调用 `SimpleExoPlayer.seekTo`；`GestureVideoPlayer.endGesture()` 同样调用 ExoPlayer seek。
- `VideoPlayerActivity.onPause` 保存当前播放进度，`HeavyTaskUtil.saveNowPlayerPos` 还有 DLNA、浮窗等调用方。
- **不能直接断言卡顿发生在 seekTo**。需要分别统计：解析/选集准备、URI 代理、首次媒体打开、快进后数据读取、解码恢复、进度保存/恢复。把“按键调用 seek”和“seek 后缓冲完成”分开测量。
- `VideoPlayerActivity.playNow(boolean)` 存在 `startPlayerNoPlay`、`getPlayData`、字幕/弹幕和多线路处理路径；未来新播放器需要保持原始 PlayData 与其头/音轨/选集/字幕/弹幕/续播 ID 映射不变。

## B. 兼容宿主的重要补充：不仅是 160 个原生注解 API

### B1. JS 方法包装生成机制

- `JSEngine.getAllFunctions()` 直接遍历 `Class.getDeclaredMethods()` 并读取 `@JSAnnotation`；`getFunctionStr()` 使用方法名称、签名、`@Parameter` 的 `value/defaultValue/defaultInt` 生成 JS 包装。
- 生成模板不是无类型桥接，存在 `JSON.parse(retStr)`、布尔字符串转换、`parseInt(retStr)`、字符串化返回、Java `InputStream` 特例和原生对象返回。
- 基于用户上传的 `HikerView_8.83_JS_API_Contract.json`：**160 个注解方法 / 17 个显式别名 / 唯一重复导出别名 `refresh`**，对应 `refreshPage(Object,Object)` 与 `setPageReverse(Object)`。这是静态冲突候选；实际覆盖顺序、分派规则需在原版真机用无害测试规则核对，不宣称确定 Bug。
- 因此兼容合同必须包含 **JS 导出名 + Java 参数顺序/默认值 + 上下文 + 返回值类型 + 错误模式 + 同名覆盖策略**，不能只保留方法名单。

### B2. APK 的 `assets/Hikerurl.js` 实际包含规则 DSL 与模块缓存

- 8.83 中的 `Hikerurl.js` 为可直接读取的约 18KB / 520 行 JS，标记为“海阔url点击事件生成工具”，其中定义 `$(...)`、`$.fn`、`$.require` 和 `$.importRequire`，通过 `Object.defineProperty(..., '$')` 注册。
- `$.fn` 包含 `rule`、`lazyRule`、`x5Rule`、`input`、`confirm`、`x5Lazy`、`webLazy`、`select`、`image`、`b64`；输出对应 `@rule=`、`@lazyRule=`、`select://` 等海阔路由字符串或序列化脚本。
- `$.require` 使用 JS 侧 `Module._cache = new Map()`、`module.exports`、JS/JSON 加载分支和路径解析：相对路径映射规则私有数据区，HTTP(S) 模块映射 `hiker://files/libs/<md5>.js`，裸名字映射 `hiker://page/<name>`。
- `goPreRule()` 解析规则 `preRule` 中预处理 include 标记，并能通过 `$.require/$.importRequire` 注入 `$.hiker`；独立兼容容器必须验证预处理执行顺序与页面脚本作用域。
- `JSEngine.getJsPlugin()` 直接从 APK assets 读取 `Hikerurl.js`，`runScript()` 含 `eval(getJsPlugin())` 路径。**Rhino + 160 个 Java 注解 API 仍不足以完整替代当前宿主；这个 JS 工具层和页面/模块状态合同也必须覆盖。**
- 不应原封不动公开或重新许可第三方整段源码；本报告仅保留事实、接口及兼容性边界。

## C. 推荐可重复性能 / 兼容验证矩阵（未来原版真机 + 独立 Test）

| 场景 | 关键变量 | 记录指标 |
| --- | --- | --- |
| MP4 直连 | 普通 URL / 带 Referer+UA / 302 跳转 / Range | 首帧时间、快进后恢复时间、错误码、返回时是否记录进度 |
| HLS | 明文 playlist / 带 Header 分片 / 切清晰度 / 长列表 | playlist 获取/分片时间、切换/拖动恢复、头是否继承 |
| 代理对照 | 极速关闭 / 线程 3/6/10 / 失败后重试 / 缓存自动或手动清理 | 首帧、seek、吞吐、后台下载数、缓存占用、黑名单变化 |
| 选集/字幕弹幕 | 单线路/多线路、快速切集、字幕/音频/弹幕启停 | PlayData 各字段保留，未向播放器队列混入无关动作 |
| 远程模块 | `require(url,options,build)`、`rc`、`$.require`、预处理 include | 首次/二次缓存、版本切换、错旧缓存、相对路径 |
| 页面 DSL | `$().rule/lazyRule/select/input/image`、`setResult`、`updateItem` | 路由、弹窗、数据类型、刷新/返回栈/图片 Header |
| 兼容边界 | `refresh` 重复别名，显式默认参数、类型转换 | 函数最终行为、异常提示，不凭静态判断 |

所有测试必须先在未经修改的官方 8.83 上形成基线，再对照独立并存的实验客户端；不要提前混入一并更换播放器、路由、脚本引擎的多因素改动。

## D. 阶段判定及下一步

1. 已确认真实 API 包装类型分派、内置 JS URL/模块 DSL、ExoPlayer 自报版本 2.15.1、四类 MediaSource 工厂路径、极速播放代理功能接入正常/浮窗播放器、拖动/续播调用路径。
2. **未证实**实际代理比直连快、播放器内核是否存在更多实际可用选项、同名 `refresh` 在真实运行时如何解析，以及 8.83 在 Android 16 的运行表现。
3. 技术路线：优先将 `PlayData + Header + URI Proxy + Seek/Progress + Danmu/Subtitle` 抽象为播放器兼容合同；将 `JSEngine API + Hikerurl.js DSL + Module/PreRule + UI EventBus` 抽象为规则兼容合同。原版 APK 保持只读，不直接修改 Stable。
