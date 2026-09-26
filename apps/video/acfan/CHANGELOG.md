# ACFAN Changelog

> 全新重写程序，App ID `acfan`。旧 `apps/video/acfun` 不作为本程序运行依赖；但旧 Stable 中经实机验证成功的协议事实可以作为恢复依据。

## 当前基线
- Test：`0.2.1-test.7 / Build10207 / Shell 2026092602`
- Stable：不存在
- Test Shell：`apps/video/acfan/acfan_remote_test_v7_b10207.txt`
- Bootstrap：`apps/video/acfan/bootstrap_test_v7_b10207.js`
- Release：`apps/video/acfan/releases/0.2.1-test.7/release.json`
- 当前网站终端：`https://aasf.wwvgadm0.work/mobile`
- Test1~Test6 已冻结，不原地覆盖。

## 2026-09-26 · 0.2.1-test.7 · 实机四项修复

### 实机反馈
- 首页与详情卡片有标题、播放量，但全部封面为空白。
- 发现页只有频道和工具入口，没有真正的发现内容。
- 视频详情“立即播放”提示未取得原生播放地址。
- 顶部频道与二级分类切换会持续加载。

### 根因与修复
- `[实机+旧成功链]` 当前封面包含 `jhimage/...` 相对路径。Test6 只给 `.asigoo.com` 走解码器，并把已验证的 v0.4 解码器改写为未验证实现，导致 `jhimage → cdn.ukaim.com → XOR` 链断开。Test7 恢复已验证解码器、补回 `cdn.ukaim.com`，同时使用全新 T7 图片缓存隔离空白旧缓存。
- Provider 新增 `coverPicture/videoImg/imagePath/picture` 等 APK 字段，并把列表响应的 `imgDomain/imageDomain/cdnDomain` 继承到内容实体。
- 发现页新增热搜、十频道入口和“今日发现”真实内容区；频道入口进入独立内容页，不再依赖 `hiker://home@...` 返回首页。
- Station/Class/Tag/漫画/小说/社区分类元数据只在成功时写缓存，切换筛选时优先复用，API Host 已建立后最多探测两条线路，减少长时间阻塞。
- 播放明确收集 APK 已确认的 `videoUrl / playPath / previewUrl / m3u8H`，调用 GET `video/can/watch` 刷新，再组合 H5 decode、`/api/m3u8/play`、`/m3u8/play`、CDN 直连与 playback credential 线路。没有媒体 path 时自动打开网站终端，不再只 Toast 失败。
- 登录、账号写操作和游戏分类仍未实现；Stable 继续不存在，Test7 必须实机验收。

### Test7 实机验收
1. 覆盖导入后标题显示 `ACFAN·T7`，首页首屏和任一详情页应出现真实封面。
2. 发现页应在频道图标下方显示“今日发现”内容卡片。
3. 从首页依次进入里番、动漫、视频并切换二级标签；首次可短暂加载，后续切换应明显加快且不应一直卡住。
4. 视频详情点“立即播放”，在播放器线路中优先试“网页解码”，再试“原生接口/CDN”；若完全无 path 应自动进入网站终端。
5. 若仍异常，复制“实机诊断”的 `imageRaw/imageResolved/imageRendered/imageError/lastDiag`。

## 2026-09-26 · 0.2.0-test.6 · Clean Product Reset

### 当前要求与产品边界
- 根据用户当前要求重新写 ACFAN：**不实现账号登录，不包含游戏分类**；其余公开网站/App 功能尽可能恢复。
- UI 参考用户提供的 R星精选样本，但不照抄其粉色按钮墙、旧接口或全量 God Object；采用搜索 + 五项快捷入口 + 频道 + 内容 Feed 的原生页面地图。
- Test6 仍是自用远程测试版，没有 Stable；UI、图片、播放、漫画阅读必须经用户当前海阔实机截图/点击闭环。

### 研究证据
- `[源码确认]` APK 1.9.7 当前可见能力包括：Station、视频分类/标签、短视频、漫画、小说/有声、社区、热搜、评论、AI Square、收藏/书架与播放相关 API；游戏能力存在但本版明确排除。
- `[源码确认]` 当前官方配置 `acfun.json` 返回字符串数组形式的轮换 `.work` 网站域名。旧 Test5 的 `extractHosts()` 不会收集数组中的字符串，并额外排除 `.work`，属于确定的 Endpoint Discovery 缺陷。
- `[网络复核]` 开发环境访问用户给出的 `/mobile` 与部分轮换站点返回 `Site Unavailable`；这不覆盖用户手机当前可访问事实，网站终端继续允许自定义地址并等待实机验证。
- `[源码确认]` R星精选样本使用原生搜索、五项导航、多内容分类、同页状态切换和按媒体语义选择卡片；Test6 只继承信息层级与交互语法。

### Test6 实现
- 新建不可变 Release `0.2.0-test.6 / Build10206`，Core / Protocol / Provider+Models / Image / Playback / UI / Pages / Runtime 全部使用 T6 独立命名空间与页面别名。
- 页面覆盖：首页、十个公开频道（精选/里番/动漫/视频/短视频/漫画/小说/有声/社区/AI）、搜索状态机、热搜、热榜、发现、详情、评论、漫画 Reader、小说/有声 Reader、收藏历史、网站终端、设置与诊断。
- 登录与所有写操作未实现；社区和 AI 广场按只读内容消费。
- 分类/筛选/排序全部在同一页面状态内刷新，不用重复 `hiker://page` 堆返回栈。
- 视频、漫画、小说/有声、社区与 AI 分别进入独立详情合同；播放器队列不混入收藏/评论/设置。
- 保留旧实机验证协议：游客 `POST user/traveler/`、`encData` AES/CBC、相对图片 + imgDomain、仅 asigoo `_480` + 前100字节 XOR、漫画 `chapterList → chapterInfo → domain + imgList`。
- 视频使用 `GET video/can/watch` 原生优先，POST 仅兼容后备；网站终端保持显式次级兜底。
- 关键播放 lazyRule 每次通过 `$.require('acfanT6')` 重新进入当前 T6 Bootstrap/Release，禁止只 eval 历史 Core。
- 动态配置明确拆分：根数组/普通域名视为 H5 网站候选；只有语义键明确为 API 的地址才进入 API 候选；API 写入前必须通过真实请求。

### Test6 实机验收
1. 覆盖导入后标题必须显示 `ACFAN·T6`，设置页版本为 `0.2.0-test.6 / Build10206`。
2. 首页检查搜索、首页/热榜/发现/收藏/设置五项入口、十个内容频道，以及连续切换频道后的返回栈。
3. 分别验证精选、里番、动漫、视频、短视频、漫画、小说、有声、社区、AI 的首屏数据与封面。
4. 验证热搜、跨类型搜索、热榜、详情、评论、本地收藏与历史。
5. 验证视频原生播放；失败时使用网页播放，并反馈播放器是否出画面、进度能否持续、远距离拖动是否正常。
6. 验证漫画目录/章节全屏阅读、小说正文、有声音频；Reader 顶部是否仍被标题栏永久占用必须截图确认。
7. 若 API/封面/目录失败，进入“设置 → 实机诊断”，复制运行环境和对应频道探针。

## 2026-09-19 · 0.1.0-test.5 · Restore Device-Validated Contracts

### Test4 实机事实
- 用户确认：仅里番分类少量视频能显示封面，其它大部分封面仍为空白。
- 动漫分类、漫画详情/阅读、网站终端等此前问题基本原样，说明 Test3/Test4 的 APK 字符串推断没有命中真实运行合同。

### 根因复核
重新对照旧 ACFun Stable `0.4.9` 及其长期技术记录，确认 Test4 偏离了当时真正实机成功的实现：
1. **图片**：Stable 0.4.2 成功链是 `相对图 → 当前 session imgDomain → 仅 asigoo 封面 _480 + XOR → Dalvik UA + Referer=""`。普通 HTTP/CDN 图片直接显示。Test4 错误地把更多 HTTP 图片统一送解密器，并改变了 jhimage/Referer 处理。
2. **动漫/视频标签**：Stable 0.4.8 当前 APK 1.9.7 主链为 `classTypeList → getTagsZ → tagTitleList`，Zone 仅兼容 fallback。Test4 改成 `getTags` 主链，方向错误。
3. **漫画**：Stable 0.4.7 已实机闭环为 `comics/base/info?comicsId → chapterList → comics/base/chapterInfo?chapterId → domain + imgList`。Test4 使用泛型递归抽目录，破坏了明确主合同。

### Test5 修复
- 图片适配器恢复 Stable 0.4.2 合同：相对图使用 session `imgDomain`；只有 `.asigoo.com` 执行 `_480 + XOR前100字节`；普通图直接返回；Header 恢复 Dalvik UA + 空 Referer；独立 T5 解码页负责明文 magic 判断与缓存。
- 动漫/视频恢复 Stable 0.4.8：`classTypeList/classifyList → getTagsZ → tagTitleList`，Zone/queryVideoByZone 与 `getTags` 仅作兼容后备。
- 漫画恢复 Stable 0.4.7：详情只认 `chapterList` 主目录；章节优先 GET `chapterInfo?chapterId`；正文只认 `domain + imgList` 主结构。
- 视频详情增加 **原生播放优先**：列表/详情已有 path 则直接使用，否则 `GET video/can/watch`，失败再 POST；相对 path 进入 `/api/m3u8/h5/decode?path=`；网页播放降为第二兜底。
- 新增 `ACFAN·T5 实机诊断` 页面，直接输出当前 Host、imgDomain、各频道首批真实图片字段、动漫分类/标签探针和漫画详情/目录探针。后续失败以实机诊断数据为准，不再盲猜。
- 所有页面切换为 `acfanT5*` 独立别名，绕开旧页面缓存。

### Test5 静态门禁
- Provider/Image/ImageDecoder/Playback/UI/Runtime 与页面源片段均通过 JS 语法检查；页面源在加载器中拼接后执行。
- Release JSON、Shell 外层 JSON/嵌套 pages JSON 均已解析通过。
- Test5 仍为 `pending-device-validation`，不得晋级 Stable。

### Test5 实机验收
1. 导入后必须显示 `ACFAN·T5`。
2. 精选、里番、短视频、漫画分别查看多张封面。
3. 动漫检查分类/标签是否恢复，不应再固定卡在旧 Zone 报错。
4. 漫画详情检查 chapterList，打开章节检查 domain+imgList 原图。
5. 视频详情先点“原生播放”；失败再点“网页播放”。
6. 若仍有问题，进入首页“诊断”，复制“运行环境 / 对应频道 / 动漫链探针 / 漫画链探针”反馈。

## 2026-09-19 · Test1~Test4 历史摘要
- Test1：新 ACFAN clean rewrite，建立九频道、搜索、详情、漫画/小说/社区与 H5 终端框架。
- Test2：尝试修封面、Zone 容错、漫画详情和 H5 定位；实机反馈基本无变化。
- Test3：按 APK 1.9.7 静态字符串重建 Provider/字段，并版本化 T3 页面；后续发现部分推断与旧 Stable 实机事实冲突。
- Test4：继续强化当前字段和图片请求合同；实机仅里番少量封面有效，其它关键问题仍未解决，因此冻结。

## 长期协议事实
- 游客认证：`POST user/traveler/`；Header `deviceId / t / s / User-Mark=acfun`；`s=MD5(t.substring(3,8))`。
- `encData`：`token.substring(2,18)` 作为 AES/CBC/PKCS5Padding key/iv。
- 图片成功合同：相对图 + 当前 `imgDomain`；asigoo `_480`; XOR key `2020-zq3-888`, 仅前100字节；先判断 JPEG/PNG/GIF/WebP；Dalvik UA + 空 Referer。
- 漫画成功合同：`comics/base/info → chapterList → chapterInfo?chapterId → domain + imgList`。
- 动漫/视频已验证标签合同：`classTypeList → getTagsZ → tagTitleList`，Zone 兼容 fallback。
