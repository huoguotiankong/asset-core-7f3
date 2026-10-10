# 海阔视界 8.83：JS 引擎与播放器方法级审计（2026-10-11）

> 状态：**已对用户上传的 APK 进行离线 DEX 结构解析、方法定义/调用索引分析以及注解解析；仍未做真机动态调试、反编译全控制流复核、APK 修改与编译。**
> 基线 SHA-256：`a8f5be99018069a6081d9631b67e99c60970b361dc13b16f19f07498dda7348c`。首轮结构审计见 `docs/HIKER_ANDROID_883_APK_AUDIT_20261011.md`。

## 1. 审计方法与证据边界

- 直接读取 APK 内 6 个 DEX 的 strings、types、method_ids、class_data、method code_item、method annotations 和字段表；遵照 Dalvik 指令宽度扫描直接 `invoke-*` 调用与 `const-string`。
- 查到的 **direct invoke** 能证明方法体存在该调用引用；不能只凭这一条推定分支必达、每次都会执行或真机行为正常。
- `@JSEngine.JSAnnotation` 从 DEX 注解读取，含显式 `alias`、`returnType` 枚举索引（经 DEX field_ids 还原为 BOOL/JSON/Num/OBJECT/STRING/VOID）。
- 非注解方法、Rhino 自带全局对象、内嵌 JS 的运行期扩展、`$` 对象及 WebView 桥接另算，**不在该 160 个方法范围内**。
- 对照源码仅用于版本差异：`qiusunshine/hikerView@master` 的 `app/src/main/java/com/example/hikerview/service/parser/JSEngine.java`（静态文件 blob `186654072f5e95543362dd293cb19d71e519be1c`）是历史源码，不能视为 8.83 当前方法实现。

## 2. JS 执行环境：确认的方法链

1. `JSEngine.runScript(String,String,boolean)` 与 `JSEngine.evalJS(String,String,boolean)` 直接调用：
   `RhinoAndroidHelper.enterContext()` → `JSEngine.initRhino(Context)` → `Context.initStandardObjects()` → `ImporterTopLevel.init(...)` → `JSEngine.initRequire(...)` → `Context.javaToJS(...)` / `ScriptableObject.putProperty(...)` → `Context.evaluateString(...)` → `Context.exit()`。
2. `initRhino()` 明确设置 Rhino 优化等级、语言版本与未处理 Promise 拒绝跟踪选项；具体参数数值与异步语义还未动态核验。
3. `initRequire()` 使用 Rhino 的 `UrlModuleSourceProvider`、`StrongCachingModuleScriptProvider` 和 `JSEngine$MyRequire`，向 Scope 注册 `requirejs`。这是一条 Rhino CommonJS 风格链，**与海阔业务 `require(url, options, version)` 不能混为一谈**。
4. `getAllFunctions()` 遍历方法的 `@JSAnnotation`，结合 `getFunctionStr()` 生成 JS 包装；包装模板包含反射 `ScriptAPI.getMethod(...)`、`MY_RULE/MY_URL/MY_TYPE/MY_DIR/MY_TICKET` 等上下文参数。这说明 API 桥接需要精确兼容参数默认值、运行上下文、类型变换和别名，不只是方法名。
5. `JSEngine.getJsPlugin()` 从 APK assets 的 `Hikerurl.js` 取内容；`runScript/evalJS` 具备 `eval(getJsPlugin())` 相关执行路径。
6. `evalLazyRule()` 使用当前规则上下文并调用 `evalJS(...)`；`setResult()` 根据页面/搜索/最新章节场景，分别委托 `callbackHomeResult`、`callbackSearchResult`、`setLastChapterResult`。
7. `JSEngine.addItem0()` 调用 `ItemModifyEvent`，`convertToArticleList()` 写入标题、图片、描述、URL、type、extra。这属于原生 UI 数据转换和事件系统，而非普通 HTML 拼接。
8. `RhinoClassShutter` 存在类可见性控制，DEX 中含 `java.lang.Runtime`、`android.app.` 等限制匹配文本。重构时需建立明确的能力允许列表，不能简单开放任意 Java 反射。

## 3. 原生 API 注解清单

- `JSEngine` 中抽取到 **160 个 `@JSAnnotation` 方法**，其中 **17 个显式 alias**。
- 注解 returnType 统计：JSON 15、STRING 56、VOID 22、OBJECT 10、BOOL 9、Num 4、未显式指定 44（以注解默认值/方法运行行为为准）。
- 示例：`batchFetch → bf`、`batchExecute → be`、`requireCache → rc`、`fetchCache → fc`、`executeWebRule → ewr`、`fetchCodeByWebView → fcbw`、`parseDom → pd`、`parseDomForArray → pdfa`、`refreshPage → refresh`、`getResCode → getCode`。
- **潜在重名风险**：`refreshPage` 与 `setPageReverse` 的注解都声明 `alias=refresh`。目前只能断言注解重复；实际 JS 包装生成顺序与最终覆盖/分派效果待核对，不能武断判断为 Bug。
- 对照历史 `JSEngine.java` 可见 **100 处 `@JSAnnotation`**；8.83 DEX 的 160 条说明兼容面已扩充。已验证历史源码无同名方法、而 8.83 存在的示例：`refreshVideoSource`、`refreshVideoUrl`、`proxyClearM3u8`、`getPageTitle`、`initChaquopy`、`startProxyServer`、`registerDNS`、`addWebProxyRule`、`getEpubMetadata`、`getEpubChapters`、`getEpubContent0`、`syncExecute`、`fetchPC`、`postPC`、`setPageParams`、`openAppIntent`。**不能只依赖 6.8 旧源码重建 8.83。**
- 完整清单已按方法签名、alias、返回类型生成离线 JSON 研究工件（本次会话的 `HikerView_8.83_JS_API_Contract.json`）；若发布为仓库基线，需同步写入无敏感信息的版本化接口契约。

## 4. 网络、远程依赖与页面路由

- `JSEngine.fetch() → fetch0() → HttpHelper.fetch0()`。底层 `HttpHelper.fetch0` 的 DEX 引用包括 OkHttp/OkGo、GET/POST/PUT/DELETE、请求头、`withHeaders`、`onlyHeaders`、`withStatusCode`、`redirect`、`timeout`、`charset`、`dns`、`inputStream` 等条件选项；只能说明存在处理逻辑，具体组合行为待验证。
- `JSEngine.post0()` 调用 `HttpHelper.generatePostOps` 后转 `fetch`。
- `JSEngine.require0()` 使用 `proxyRequire`、`fetchByHiker`、`requestForCode`、`RequireUtils.getRequireVersion`、`RequireUtils.generateRequireMap`、文件缓存及 Rhino `Function.call()` 等路径。不能用普通 `requirejs` 等价替代业务远程 `require`。
- `fetchByHiker()` 对 `hiker://files/`、`hiker://page/`、`hiker://assets/` 做分支；`PageParser.parsePageRule()` 使用 `hiker://page/`、页面 path、当前规则和参数恢复。
- `setHomeResult` / `setResult` / `setSearchResult` 与 `callbackHomeResult` / `callbackSearchResult` 共同形成上下文分发。独立宿主若只根据 JSON 盲渲染，很容易破坏搜索/分类/最新章节结果。

## 5. 播放链：直接调用证据

- `HttpParser.getPlayData(String)` 创建 `PlayData`、可解析 JSON `urls/names` 并填充线路名称、播放地址；`getHeaders(String)` 与 `getHeaders(String,PlayData,int)` 处理 URL 附加头及每条线路头。
- `PlayerChooser.startPlayer(...)` 引用 `HttpParser.getPlayData/getHeaders`，可以把数据分派到 `VideoPlayerActivity` 内置播放器或外置方案。 `PlayerChooser.decorateHeader0()` 还结合 WebView 请求头、Referer 和已嗅探媒体类型处理 M3U8/MP4。
- `VideoPlayerActivity.playNow(boolean)` 直接引用 `getPlayData`、`getHeaders`、`PlayData.getSubtitle/getDanmu/getAudioUrls/getNames`、`PlayerChooser.startPlayer`、`VideoUtil.initSwitchBox`、`ThunderManager.startDownloadMagnet` 及 `SimpleExoPlayer.getCurrentWindowIndex`。
- `VideoPlayerActivity.changeTrack()`、`initTrackListener()` 使用 ExoPlayer 2 的 `SimpleExoPlayer` 和 `DefaultTrackSelector`；`onPause()` 关联 `HeavyTaskUtil.saveNowPlayerPos`。这证明内置 ExoPlayer 2 调用链确实存在，而不是只有静态依赖。
- `VideoPlayerActivity.dealLazyRule()` 明确调用 `LazyRuleParser.parse(...)`，懒解析入口与最终解码链分离。
- `PlayerEnum` 有 18 个播放器选项常量（其中包含 `PLAYER_TWO`、`REEX`、`VLC_PLAYER`、`MX_PLAYER`、`NEXT_PLAYER` 等）；**这些是分派选择，不是 18 个内置播放内核**。
- `PlayerChooser.startReex()` 对应包 `xyz.re.player.ex`；`startVLC()` 对应 `org.videolan.vlc`；`startNextPlayer()` 对应 `dev.anilbeesetti.nextplayer`。实际安装/启动功能未验证。
- 当前 APK DEX 中未检出 `androidx.media3` 包结构；规划新 Media3 内核时需保留源地址/Headers/播放列表/字幕/弹幕/回放进度/外置调用契约，不能简单替换 Activity。
- 仍待明确：`PLAYER_TWO` 的内置实现、IJK 有无真实可达内核、缓存与 `Range`/Seek 机制、完整 HLS MediaSource/DRM 链。

## 6. 阶段性架构结论

```
Hiker rule / hiker:// protocol
  -> Rhino script context + JS API wrappers + remote require/version-cache
  -> HTTP/DOM/Crypto/File/Storage and Rule Context
  -> PageParser / ArticleList / callbacks / EventBus
  -> PlayerChooser / PlayData / Headers / LazyRuleParser
  -> VideoPlayerActivity + ExoPlayer 2 / External Players
```

**实际改造边界建议：**

1. 先固定兼容合约（JS 全局函数 + alias + 返回类型 + 默认参数 + 页面上下文 + Result）；
2. 在不触碰原版用户数据的前提下另建实验宿主或隔离补丁；
3. 优先对 `PlayData/Headers` → `Player Core` 定义可替换接口，业务解析和播放引擎分离；
4. 原生运行沙箱、权限、存储与规则数据迁移必须先测试，不能为了兼容任意规则而取消安全边界；
5. UI/图片/播放的真正完成标准仍是用户实机验证，不因静态审计宣称“修复/增强完成”。

## 7. 下次研究工作项

- 从完整 DEX 注解契约复核参数注解的默认值和别名冲突；建立可复跑的差异比较脚本。
- 方法级解析 `LazyRuleParser`、`HttpParser`、`ExoPlayerView`、`VideoCacheHolder` 的关键异常与缓冲流程，定位适合插件化的播放器边界。
- 从已验证的普通规则/远程规则/复杂二级页提取**脱敏**测试集，验证真实 API 返回类型、跨页/生命周期、下载/缓存及外置播放器。
- Android 16 独立安装、权限、迁移、数据备份的可恢复性验证。

> 本任务仅研究且未修改任何既有小程序或 APK，也未改变 Stable/Test/Release 元数据。

## 8. 第三轮深入追踪索引

新增 `docs/HIKER_ANDROID_883_MEDIA_AND_COMPAT_AUDIT_20261011.md`，继续核对实际 ExoPlayer 2.15.1、四类 MediaSource 构建、`VideoCacheHolder` 极速播放代理接入、`PlayerFastPlayOfficer` 设置、`Hikerurl.js` 的 `$` DSL 和缓存模块、JS 注解参数/返回值 wrapper。仍为静态研究，未修改 APK、未实机验证。

## 9. 第四轮参数注解与 DSL 模拟索引

继续研究见 `docs/HIKER_ANDROID_883_JS_COMPATIBILITY_AUDIT_20261011.md`：160 个 JS 方法、295 个带参数注解的参数位，16 个默认值和 7 类运行上下文注入；通过 APK `Hikerurl.js` 的独立解析与隔离 Node VM 研究发现重复 `let id`、嵌套 `$.importParam` 保存/恢复失配、异常缺少 finally、首次远程 JS 内容识别可能误拒等**未真机证实**风险。原始 APK 无修改。

