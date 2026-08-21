# ACFun Changelog

> **程序级长期技术记忆。** 开发/优化 ACFun 前，先读三份全局文档，再读本文件、`stable.json / test.json / candidate.json / latest.json` 与当前 release/Bootstrap。接口、签名、解密以当前 APK/源码/实机复核为准；本日志中的历史错误路线用于防止重复踩坑。

## Core 0.4.9 Stable / Build 149 / Shell 5.11.3

- 当前正式 Stable 基线；`stable.json` 与 `latest.json` 均指向 0.4.9 / Build 149。
- 0.4.9 主要修复 0.4.8 发布链错误：旧 activeRelease 曾缓存错误的根目录模块路径；0.4.9 将 v047/v048/v049 模块改为明确的 `apps/video/acfun/` 仓库相对路径，并保留根目录兼容桥，使旧错误状态也可恢复。
- 业务底座继续保留已验证链：精选/里番 Station、动态 `classTypeList`、APP 1.9.7 `getTagsZ → tagTitleList`、短视频、漫画详情/章节阅读、极速播放、封面解密和持久缓存。
- Stable 继续作为 0.5.x / 0.6.x Native UI/UX 大改的恢复基线；大改只进入 Test/Candidate，未完成实机验证前不得覆盖 Stable。

## Test 0.6.0-alpha7 / Build 158 / Test Shell 6.3.0（当前测试）

### 2026-08-22 Alpha6 实机输入

- Alpha6 已真实到达设备，证明 Shell6.2 / Bootstrap v062 / Build157 的下发链正常；本轮继续以真实页面体验而不是代码结构作为修改依据。
- 用户明确反馈 Alpha6 筛选页虽然比 Alpha5 好，但仍然“太难用”，整屏分类 Chip、展开/收起和应用/恢复按钮仍然像配置面板，不符合内容 App 的筛选体验。
- 短视频被当成常规视频卡处理，点击还会进入普通视频二级详情；用户明确要求短视频入口点击后直接播放，不再经过常规视频详情页。
- 漫画章节页顶部仍显示“章节名 + 151页”等内部信息块，并在第一张图前占用明显空间；用户要求漫画正文从首图开始、全宽连续铺满内容区。
- 社区虽然已经能加载动态，但分类仍出现 `11111111 / ceas / 帖子数据` 等明显测试/内部项，时间直接显示 ISO 原始值；动态详情还会把 Markdown 链接重复展示。
- 小说/有声分类已经能得到中文标签，但分类筛选后经常整页为空，有声“全部”也可能为空；不能把“接口字段存在”当作资源已经恢复。

### Alpha7 交互与阅读重构

- 新增 `acfun_ui_v060_a7_home.js`，筛选页不再使用多排 `flex_button` Chip 墙，改为真正的列表式筛选中心：`当前条件 → 栏目 → 频道/分类 → 标签 → 排序 → 返回首页/恢复默认`。
- 每个筛选项点击后使用原生 `select://` 选择器展示完整选项；页面只保留当前值，不再要求用户在几十个 Chip 里寻找选中项。
- 社区、小说、有声也同步改成“分类/排序”列表式选择，不再把低频分类全部常驻页面。
- 短视频 Feed 新增独立 `shortCard`：保持竖卡布局，但卡片 URL 直接调用当前 ACFun 播放链，**不进入 `acfun_detail` 常规视频二级页**。
- 短视频请求继续保留 Alpha6 的 `pageSize=30 / loadType=2/3/4` 候选，并额外加入 APK 静态出现的 `video_content_type=shortVideo` 字段兼容；仍不把任何未实机返回的候选记作已验证参数。
- 新增 `acfun_ui_v060_a7_detail.js`：漫画章节不再渲染章节标题/页数 `rich_text` 块，页面正文第一项就是 `pic_1_full`，保持系统标题栏但让漫画图片从内容区顶部开始全宽连续阅读。
- 社区动态详情清理重复 Markdown 链接，Feed/详情时间转换为“刚刚/几分钟前/几天前/月-日 时:分”等用户可读格式。

### Alpha7 资源恢复继续强化

- 新增 `acfun_runtime_v060_a7.js`，社区分类在 Alpha6 机器 token 过滤基础上继续剔除纯数字、`ceas/test/debug/demo`、帖子数据/调试/占位等明显非业务分类。
- 小说/有声 `fiction/base/findList` 扩大有限参数组合：普通小说尝试 `fictionType=1 / type=1 / fictionType=0 / 无类型`；有声尝试 `fictionType=2 + isAudio=1 / fictionType=2 / fictionType=1 + isAudio=1 / longFormAudio=1 / isAudio=1 / type=2 + audio=1`。
- 小说/有声选择某分类后若完全空，自动再请求一次同模式“全部”数据；成功时记录 `acfun_v060_a7_fiction_fallback`，避免一个无效标签直接造成整页白屏。
- 以上有声参数仍属于兼容候选，不得在未实机确认前写成“官方确定 fictionType 值”。

### Alpha7 发布边界

- 新建不可变 Release `releases/0.6.0-alpha7/release.json`，Build `158`；在 Alpha6 完整模块链末尾追加 `runtime-a7 / interaction-ui-a7 / reader-detail-a7 / shell-settings-a7`。
- 新建 `bootstrap_test_v063.js?v=6300` 与 Test Shell `acfun_remote_test_v063.txt`，规则数字版本 `2026082202`，`minBuild=158`；从“我的规则仓库 → ACFun → 测试版 → 导入/覆盖”后强制进入 Alpha7。
- `test.json / candidate.json / channels.json / manifest.json / registry.json / 根 manifest.json` 全部切到 Alpha7 Test 元数据。
- Stable `0.4.9 / Build149 / Shell5.11.3` 与 `latest.json` 继续冻结。
- Alpha7 必须继续实机验证：新筛选选择器 → 短视频列表与直接播放 → 漫画章节首图位置/连续阅读 → 社区分类/详情 → 小说/有声 → 搜索 → 常规视频详情与播放。未形成实机闭环前不得晋级 Stable。

## Test 0.6.0-alpha6 / Build 157 / Test Shell 6.2.0（上一测试）

### 2026-08-22 实机输入

- 当前 Alpha5 已真实到达设备，说明 Shell6.1 的云端仓库覆盖链有效；本轮问题已经从“版本没下发”转为真实产品/UI 与数据兼容问题。
- 分类与筛选页被巨大五栏图标、横向截断标签和低层级操作占满，信息密度低、切换成本高，用户明确要求完全重构。
- 动漫/漫画筛选后仍可出现“当前条件暂时没有内容”；短视频继续显示“接口暂未返回内容”。
- 社区分类直接暴露 `dyncat-*` 等服务端机器名，热门 UP 使用大头像纵向占位；小说分类也暴露 `fictiontag-*` 机器分类名并出现空书库。
- 本轮截图因此作为 Alpha6 的真实验收基线；任何“代码里看起来有接口”的结论都不能替代后续实机结果。

### Alpha6 筛选 UI 完全重构

- 新增 `acfun_ui_v060_a6_home.js`，不再使用“巨大主栏目图标 + 多排横向 scroll chip + 完成/重置大操作”的旧分类中心。
- 新筛选页改为：紧凑当前条件 → 单行栏目切换 → 分类自动换行 → 可选标签自动换行 → 排序 → `应用筛选 / 恢复默认`。
- 分类/标签默认只展示前 12 项，超过后提供“展开全部 / 收起”；当前选中项即使在折叠区也会保留可见，避免用户找不到当前条件。
- 选中态统一为品牌红色勾选；动漫/视频标签提供“全部”以快速退出细分条件。
- 首页个人工具从大灰色文字块改为 `icon_small_4`，筛选入口与收藏/历史/设置降为统一工具层；空 Feed 提供“换个筛选 / 恢复默认筛选”，不再只显示诊断文字。
- 社区资源页把热门 UP 改为紧凑四栏入口，社区分类/排序使用同一套 compact filter；小说/有声也使用统一的分类、排序与“查看全部”恢复逻辑。

### Alpha6 资源兼容修复

- 新增 `acfun_runtime_v060_a6.js`，继续保留 Alpha4 的递归实体采集和非空缓存，但把容易空结果的筛选参数从 UI 中隔离到兼容层。
- **动漫/视频**：根据 `classTypeList` 行内真实身份尝试 `classifyId / videoTypeId / classTypeId`；标签请求继续以 `tagTitleList` 为主并保留 `queryVideoByTag`。某个标签完全为空时不再让整页白屏，而是有限回退到当前父分类，并记录 `acfun_v060_a6_filter_fallback` 供诊断。
- **漫画**：`getStationComicsMore` 同时尝试 `stationId / comicsStationId / 两者并带`，再回退 `comics/base/findList`；第一页继续优先使用 Station 响应内嵌漫画。
- **短视频**：APK 1.9.7 Flutter AOT 静态字符串中发现明确的 `pageSize=30 loadType=2` 请求痕迹。Alpha6 因此把 `loadType=2` 加入首选候选，并继续尝试 3/4 及 `shortVideo` 类型字段。**这只是 APK 静态证据，不记作服务端参数已经实机验证；是否真正返回短视频必须看 Alpha6 实机结果。**
- **社区/小说**：UserFacing Adapter 过滤 `dyncat-* / fictiontag-* / UUID/长机器 token` 等非人类可读标签；若过滤后无有效分类，页面直接使用“全部”数据而不是展示内部 ID。
- 社区动态列表在分类/排序参数失败时提供有限无分类回退；动态卡优先寻找内容图片，避免把头像、徽章或装饰框误当帖子主图。

### Alpha6 发布边界

- 新建不可变 Release `releases/0.6.0-alpha6/release.json`，Build `157`，在 Alpha5 完整模块链末尾追加 `runtime-a6 / filter-resource-ui-a6 / shell-settings-a6`。
- 新建 `bootstrap_test_v062.js?v=6200` 与 Test Shell `acfun_remote_test_v062.txt`，规则数字版本 `2026082201`，`minBuild=157`；从“我的规则仓库 → ACFun → 测试版 → 导入/覆盖”后强制进入 Alpha6，避免继续命中 Alpha5 壳/Bootstrap 缓存。
- `test.json / candidate.json / channels.json / manifest.json / registry.json / 根 manifest.json` 全部切到 Alpha6 Test 元数据。
- Stable `0.4.9 / Build149 / Shell5.11.3` 与 `latest.json` 继续冻结，不因本轮 UI/Provider 试验改变。
- Alpha6 必须继续实机验证：筛选页 → 动漫/视频 → 漫画 → 短视频 → 社区 → 小说/有声 → 搜索 → 详情/阅读 → 视频播放。未完成截图/运行闭环前不得晋级 Stable。

## Test 0.6.0-alpha5 / Build 156 / Test Shell 6.1.0（上一测试）

### 实机事实与根因

- 用户 2026-08-21 21:16 实机截图明确显示：手机仍运行 `0.6.0-alpha2`，首页也仍是 Alpha2 的“视频 / UP主 / 标签”搜索和旧入口结构；这不是 Alpha4 UI 效果不明显，而是 Alpha4 根本没有到达设备。
- Alpha4 只切换了 `test.json / candidate.json / release.json`，却继续复用 `acfun_remote_test_v060.txt + bootstrap_test_v060.js?v=6000`。云端仓库的测试版卡仍导入同一规则入口，海阔规则壳和 Bootstrap 缓存均没有新身份；旧壳内置默认版本仍是 Alpha2。
- 旧 Test Bootstrap 的 `check/update/rollback/reinstall/resetDefault` 错误调用 `this.manager()`；它继承的基础 Bootstrap 实际只提供 `requireManager()`。因此截图中的“更新异常：找不到函数manager”是确定的源码错误，不是网络问题。

### Alpha5 云端仓库强制迁移

- 新建 `acfun_remote_test_v061.txt`，规则壳数字版本提升到 `2026082116`；规则标题仍为 `ACFun`，保持与 Stable 同名覆盖语义。
- 新建 `bootstrap_test_v061.js?v=6100` 与 Shell `6.1.0-test`，默认 Release 直接绑定 `0.6.0-alpha5 / Build156`，并设置 `minBuild=156`。从 Alpha2 / Alpha3 / Alpha4 旧 Test 状态进入时会切到全新的 Alpha5 安全基线。
- 新建不可变 Release `releases/0.6.0-alpha5/release.json`。业务模块完整继承 Alpha4 的视频搜索、漫画详情/阅读、递归分类、短视频、社区、小说、有声与五类搜索，只在末尾追加云仓库交付/设置说明模块并将运行标识提升为 Alpha5。
- 所有管理方法改回已验证的 `requireManager()`；版本页不再把“程序内更新”当新壳下发方式，而是明确引导到“我的规则仓库 → ACFun → 测试版 → 导入 / 覆盖”。本页仅保留重新加载当前模块、恢复 Alpha5 基线和业务回退。
- 根 `manifest.json`、ACFun `channels.json`、`manifest/test/candidate/registry` 全部切到新的 Test Shell 路径、Build156 与 Alpha5，使云端仓库能展示并导入真正不同的测试规则。
- Stable `0.4.9 / Build149 / Shell5.11.3` 与正式 `latest.json` 继续完全冻结；Alpha5 仍须完成首页、搜索、漫画、分类、短视频、社区、小说、有声、详情与播放实机回归后才允许晋级。

## Test 0.6.0-alpha4 / Build 155 / Test Shell 6.0.0（未成功下发到本轮实机）

### 本轮实机与 APK 事实

- 用户 2026-08-21 最新实机截图确认 Alpha3 仍存在：搜索不可用、漫画详情空白/分类混乱、精选与里番频道不全、短视频无资源；同时明确要求接回原 APP 的社区、小说和有声资源。
- 详情截图中的“未命名 + 空相关推荐”证明 Alpha3 只修了视频 URL 参数，没有恢复漫画等非视频实体的详情分发。
- 直接从 Library 恢复并复核 `acfun 1.9.7` APK（Flutter AOT）；资源清单确认首页小说、短视频、社区与六栏底部导航素材确实存在。
- APK 二进制确认当前路由族：
  - 视频：`video/list`、`video/getByClassify`、`video/classTypeList`、`station/stations`、`station/getStationMore`、`blogger/hotUpBloggers(/page)`；已有源码同时确认 `video/queryVideoByTitle → search/keyWordV2 → search/keyWord` 搜索链。
  - 漫画：`comics/station/getComicsStations`、`getStationComicsMore`、`comics/base/findList/info/chapterInfo/queryChange/getRec`、`comics/comment/commentList`。
  - 小说/有声：`fiction/other/tagList`、`fiction/base/findList/info/chapterInfo`、`fiction/commentList` 及 `fictionType / longFormAudio` 字段。
  - 社区：`dynamic/category/tree`、`community/dynamic/list/dynamicInfo/commentList/person/list`、`coterie/list`、`coterie/coterieListByCoterId`。

### Alpha4 根因修复

- **搜索回归**：Alpha3 覆盖 `ac.search()` 时丢掉已验证的 `video/queryVideoByTitle` 主接口，只剩 `keyWordV2/keyWord`。Alpha4 恢复主接口优先级，并为漫画、小说、有声、社区增加独立搜索 Provider。
- **漫画详情回归**：v047 曾按 `comics_id / comic_chapter_id` 分发，Alpha3 又用纯视频 `ac.detail()` 覆盖它。Alpha4 所有内容卡把 `content_kind + 实体 ID + 章节 ID` 写入 URL，详情按 video/comic/comic_chapter/fiction/fiction_chapter/dynamic 分发，不再依赖 `extra`。
- **分类缺失**：旧 `__v047Arr()` 命中第一个数组就返回，会漏掉 Station 响应中的其他嵌套分组。Alpha4 使用有深度/数量上限的递归实体采集器，聚合有限请求结果后按实体 ID 去重；空结果永不写成成功缓存。
- **短视频空白**：继续使用 APK 确认的 `video/list + loadType`，但改成 plain、`videoContentType/contentType=shortVideo`、`videoType=shortVideo` 和公开 3/4 备用模式的有限矩阵；响应也使用递归视频提取，不再依赖第一层数组。

### Alpha4 产品结构与 UI

- 首页分为三层：五大主栏目（精选/漫画/动漫/视频/里番）、内容扩展（短视频/社区/小说/有声）、低权重个人工具（分类/收藏/历史/设置）。内容扩展与个人工具均可在设置关闭。
- 分类中心取消多排无层级 Chip 墙；频道、分类、标签、排序分组呈现并横向滑动，选中态统一品牌色勾选。漫画继续过滤实机确认的布局/测试名称，同时动态保留服务端新增的真实分类。
- 新增社区资源中心：热门 UP、圈子、动态分类、热门/最新动态 Feed、动态详情与评论。
- 新增小说/有声资源中心：普通/有声切换、动态标签、排序、小说详情、章节目录、正文阅读；章节或作品返回 `longFormAudio`/常见音频字段时可直接音乐模式播放。
- 全站搜索中心支持视频、漫画、小说、有声、社区五类范围，搜索历史同时记录关键词和范围。
- 本地收藏扩展为视频/漫画/小说三个书架；原播放历史保持视频链不变。
- 新增 `community / novel / audio / more` 选中与未选中 SVG 资产，保持 Alpha3 红/灰图标体系。

### Alpha4 模块与验证边界

- `acfun_runtime_v060_a4.js`：递归实体提取、非空缓存、完整 Station、短视频矩阵、五类搜索、社区/小说 Provider、类型化 URL。
- `acfun_ui_v060_a4_home.js`：首页、分类中心、社区/小说/有声资源中心、全站搜索。
- `acfun_ui_v060_a4_detail.js`：漫画/小说详情与章节阅读、动态详情；视频详情继续复用 Alpha3 + Stable 播放链。
- `acfun_ui_v060_a4_comments.js`：漫画/小说/动态评论；视频评论继续复用 Alpha3。
- `acfun_ui_v060_a4_tools.js`：统一本地收藏、设置与资源路由诊断。
- 本版仍只发布到 Test/Candidate。Flutter AOT 只能确认路由和字段存在，不能替代真实服务器参数回归；尤其短视频 `loadType` 语义、有声 `fictionType/longFormAudio` 命中、社区分类参数仍须用 Alpha4 实机诊断结果继续校准。Stable 0.4.9 / Build 149 与 `latest.json` 完全不变。

## Test 0.6.0-alpha3 / Build 154 / Test Shell 6.0.0

### 实机输入

- 2026-08-21 Alpha2 已真实跑到用户手机，首页结构明显优于旧 RC：单行搜索入口、五大图标栏目、高频入口、单行筛选、Hero/Feed 均已生效。
- 同一轮实机同时暴露四个明确问题：
  1. 首页快捷入口仍过度使用品牌红，工具层视觉权重偏高。
  2. 漫画分类页直接暴露 `竖四 / 竖两 / 05漫画频道 / 05漫画分类` 等明显布局/开发频道名。
  3. 短视频“推荐”页直接空白。
  4. 视频详情出现“未命名 + 无封面”，说明关键实体参数不能只依赖页面 `extra` 透传。
- 本版只针对这些已由实机证明的问题和 Guide 2.1 的产品化原则继续升级，不改 Stable 的播放/图片/漫画协议底座。

### Alpha3 UI / UX

- 首页五大主栏目继续使用 `icon_5` 彩色选中 + 灰色未选中体系。
- 短视频 / 收藏 / 历史 / 设置默认改用中性灰图标，仅短视频处于当前栏目时使用品牌色，降低 Utility 对 Main Content 的视觉抢占。
- 设置新增 `首页快捷入口` 开关，可整行隐藏第二层工具入口，让主 Feed 更早进入首屏。
- 首条精选内容由纯 `pic_1_full` 改为 `card_pic_1` 组合精选卡，标题/元数据与图片作为一个内容单元呈现。
- 短视频列表改为 `movie_3` 竖卡，更符合短视频内容形态；普通视频继续双列 `movie_2`，漫画继续三列竖封面。
- 分类中心增加“当前条件”摘要、品牌色勾选态、有效频道数量以及“完成，返回 ACFun”。
- 搜索主文案从“视频 / UP主 / 标签”修正为当前真正实现的“视频 / 标题 / 标签”，不把未实现能力写进 UI。
- 收藏/历史继续使用独立页面，增加清除搜索入口并统一选中态。

### Alpha3 分类清洗

- 新增 `acfun_runtime_v060_a3.js`，把“服务端分类数据 → 用户可见分类”从页面代码中分离出来。
- 漫画 Station 在 UI/Adapter 层过滤当前实机确认的布局/开发项：`竖四 / 竖两 / 坚四 / 坚两 / 05漫画频道 / 05漫画分类`，并继续过滤既有测试/布局关键字。
- 过滤只作用于用户可见分类，不修改 APP 原始接口与缓存协议；后续服务端增加真实频道仍可动态出现。
- 动漫/视频继续使用 APP 1.9.7 `classTypeList` + `getTagsZ → tagTitleList`，严格绑定当前父 `classifyId/videoTypeId`；不恢复旧 Zone/全局标签兜底。

### Alpha3 短视频修复

Alpha2 “推荐”短视频为空后，不再把单一 `video/list + loadType` 视为唯一成功路径。Alpha3 固定回退顺序：

1. `video/list` + `loadType` + `videoContentType/videoType/videoTypeName = shortVideo`。
2. `video/list` + `loadType` plain 请求。
3. 旧 Core `videoList('short')` 分支（它会补 shortVideo 类型字段）。
4. 当前 3/4 模式完全为空时，尝试另一个公开模式作为最后兼容。

- 成功模式记录在本地诊断项；空结果不写成正常成功缓存。
- 多级回退仍为空时，首页显示“重新加载 + 接口诊断”产品化失败态，不留整屏白页。
- 3/4 模式语义仍需继续实机确认；当前只把它作为兼容回退，不写死新的业务结论。

### Alpha3 详情 / 评论修复

- 根因：`pic_1_full` / 某些 Page 跳转场景下，海阔对 `extra` 中自定义字段的透传并非可无条件假设；Alpha2 只从 `MY_PARAMS.video_*` 读种子数据，导致部分入口变成“未命名”。
- Alpha3 `ac.detailUrl(info)` 改为同时把 `videoId / title / cover` 编码进 `hiker://page/acfun_detail` URL 参数。
- 详情页同时读取 `MY_PARAMS + getParam()`；有 `videoId` 但标题/封面缺失时，主动调用当前已验证 `getDetail` 链恢复一次完整资料。
- 完全没有 `videoId` 时明确显示错误态和诊断入口，不再伪造“未命名”详情。
- 评论入口同样把 `videoId / title` 写入 URL；`ac.comments()` 同时读取 URL 参数，继续使用 `video/commentList`，并重做最热/最新选中态和空状态。
- 播放仍沿用 Stable 已验证链，不因详情 UI 修复改变：已有直链优先；缺失时 `video/can/watch → decode m3u8`；弹幕不阻塞首次播放。

### Alpha3 模块边界

- `acfun_runtime_v060_a3.js`：分类清洗、短视频回退、详情/评论路由。
- `acfun_ui_v060_a3_home.js`：首页、分类中心、搜索中心、搜索结果。
- `acfun_ui_v060_a3_tools.js`：收藏、历史、设置。
- `acfun_ui_v060_a3_detail.js`：详情与缺字段恢复。
- `acfun_ui_v060_a3_comments.js`：评论页面。

本版仍只进入 Test/Candidate。Stable 0.4.9 / Build 149 与正式 `latest.json` 保持冻结；下一步必须继续根据 Alpha3 实机首页、漫画分类、短视频、详情、评论和播放回归决定后续 Alpha4。

## Test 0.6.0-alpha2 / Build 153 / Test Shell 6.0.0

### 实机结论：Alpha1 实际没有跑到手机上

- 用户当时截图仍显示 RC2：顶部大搜索框、多排灰色按钮、首页常驻频道/排序；与 Alpha1 代码明显不一致。
- 根因不是 Guide UI 方法无效，而是 Remote Manager 正常启动只加载 `hc_remote_state_acfun-test.current`，不会因为仓库 `test.json` 更新就自动切 activeRelease；旧 Shell 还可能继续命中 `bootstrap_test_v050.js?v=5120` 缓存。
- 因此 Alpha2 新建 `bootstrap_test_v060.js`（require version 6000）和 `acfun_remote_test_v060.txt`，Test `minBuild=153`，默认 Release 直接绑定 Alpha2。
- 从旧 v050 Test Shell 进入 Alpha2 必须重新导入一次；之后同一 v060 Shell 的普通业务升级可继续使用测试通道更新。
- Stable 使用独立 `acfun` Remote Manager 状态，不受 Test 强制迁移影响。

### Alpha2 产品结构

- 首页改成：单行搜索入口 → `icon_5` 五大栏目 → `icon_small_4` 高频入口 → 可选继续观看 → 单行筛选 → Main Feed。
- 完整频道/分类/标签/排序迁到独立 `acfun_category` 页面。
- 新增独立搜索中心、最近搜索、收藏/历史本地搜索排序、分组设置页。
- 精选/动漫/视频/里番首条内容使用 `pic_1_full`；漫画保持三列竖封面。
- 详情改为 Hero + 播放/收藏/评论三主动作 + 简介/标签/相关推荐。
- Alpha2 真实跑到设备后，证明 v060 Shell/发布链修复有效；其视觉与功能问题由 Alpha3 继续处理。

## Test 0.6.0-alpha1 / Build 152（未形成有效实机闭环）

- 目标是把 RC2 控制面板式首页改成 APP 结构：`icon_5` 五大栏目、`icon_small_4` 高频入口、继续观看、焦点大图、持久筛选、搜索中心、收藏历史搜索排序和分组设置。
- 代码已提交，但手机仍停留旧 RC activeRelease，因此 Alpha1 不能记作实机 UI 已生效版本。

## Test 0.5.0-rc2 / Build 151

- 第二轮 Native UI/UX 大改：搜索改 `icon_1_search`，五大栏目/快捷入口压缩，分类加入摘要与展开，栏目独立排序，过滤纯箭头伪分类。
- 用户实机仍认为整体“像控制面板”；后来也证明设备长时间停留在这条旧 activeRelease。

## Test 0.5.0-rc1 / Build 150

- 首轮 Native UI/UX 与分类重构：五大主栏目、独立短视频入口、严格父级标签绑定、漫画三列竖封面、视频两列横封面。
- Stable/Test 都保持规则名 `ACFun`，通过同名覆盖切换。

## Core 0.4.8 / Shell 5.11.0

- 直接复核 `acfun 1.9.7` APK 后确认当前版本包含 `video/tags/getTagsZ` 与 `video/tagTitleList`，标签主链以当前 APK 为准，不再优先旧同源 Zone 路由。
- 视频/动漫标签先从 `video/tags/getTagsZ` 读取 `videoTagName/videoTagValue/videoTagKey`，点击后请求 `video/tagTitleList`，同时绑定当前父 `classifyId` 与 `videoTypeId`，防止标签串分类。
- `tagTitleList` 按当前标签 name/value 做有限参数兼容；旧 `getZoneListByClassifyId/queryVideoByZone` 只保留最后回退。
- 精选/里番继续用 `station/stations?classifyId=4&restricted=0/1`；动漫/视频继续用 `video/classTypeList?type=2/4`。
- 漫画继续使用 `comics/station/getComicsStations`、`comics/base/info`、章节列表和 `comics/base/chapterInfo`。
- 短视频使用 APP 独立 `/api/video/list?pageSize=15&page=...&loadType=...`；Alpha3 在此基础上增加兼容回退。

## Core 0.4.7 / Shell 5.11.0

- 分类数据以 APP 自身接口为主，不以截图可见文字作为白名单。
- 精选/里番恢复 APP Station；动漫/视频二级分类继续使用动态 `classTypeList`。
- 0.4.7 首版曾优先旧同源 Zone，0.4.8 已改为当前 APK `getTagsZ → tagTitleList` 主链。
- 漫画动态读取 Station 并接通详情/章节阅读；恢复短视频入口。

## Core 0.4.5 / Shell 5.10.0

- 一级导航恢复精选 / 漫画 / 动漫 / 视频 / 里番；后续动态接口替代早期硬编码分类。
- 分类页恢复最新上传 / 最多观看 / 最多点赞。
- 漫画接入 `getComicsStations / getStationComicsMore / findList` 等路由。
- 播放优先列表/详情已有 `videoUrl`；缺失才 `POST /api/video/can/watch {videoId}`。
- `cacheM3u8` 按视频/decode URL 缓存；移除 `#noPre#`；默认极速播放不让首次弹幕请求阻塞。
- 保留 Cache-First 页面缓存、`_480` 封面、前100字节 XOR 解密和本地缓存。

## Core 0.4.3 / Shell 5.8.0

- 分类接口补 `classifyTitle`，不再出现“分类1/2/3”占位名；普通列表固定 `/api/video/getByClassify`。
- 已有 goodHost 时常用接口优先直连，失败才回退候选路由。
- 播放链：列表直链优先；缺失时 `video/can/watch → path → /api/m3u8/h5/decode?path=...`，播放器补 UA/Referer/Origin。
- 搜索优先 `/api/video/queryVideoByTitle`，再回退 `search/keyWordV2`。
- 评论页增加短缓存；默认每页调整为 8，降低首次图片解密并发。

## Core 0.4.2 / Shell 5.7.0

- 首页推荐/最新/热门/分类/短视频改为 Cache-First；标签切换使用 `refreshPage(false)`。
- 分类长缓存、搜索短缓存、网络失败回退缓存。
- 详情默认极速详情：先用列表已有数据；完整简介/标签与相关推荐按需加载。

## Core 0.4.1 / Shell 5.6.0

- 运行时收敛为 `core + protocol + performance-ui`。
- 列表封面优先 `coverImg + _480`；成功解密后持久缓存到 `hiker://files/cache/acfun_cover`。
- 常规视频优先快速字段解析，异常结构才深层扫描；取消逐卡同步诊断写入。
- 已找到 API Host 时启用快速失败；保留自动弹幕、本地收藏、播放历史、搜索、短视频、评论和远程更新。

## Core 0.4.0 / Shell 5.5.0

- 封面进入持久解密缓存架构。
- 图片解密确认使用 `2020-zq3-888`，仅 XOR 前 100 字节；正常 JPEG/PNG/GIF/WebP 不重复解密。

## Remote Core 0.2.1

- 已确认 `/api/video/getByClassify` 返回 HTTP 200 / code 200，游客 Token 与原生签名协议正常。
- 完整 CDN 图片 URL 不强制追加 `@Referer`；相对封面优先游客登录返回 `imgDomain`。
- 增加封面原始字段 / 最终 URL / imgDomain 诊断。

## Remote Bootstrap 2.0.0 / Core 0.2.0

- `ACFun Remote Pilot` 收敛为唯一 `ACFun` 远程代码版；新增 Remote Module Release 流程。
- 正式规则标题固定 `ACFun`，规避带空格规则名的问题。

## Remote Shell 1.0.0 / Core 0.1.9

- 从本地下载业务 JS 迁移为轻量 Shell + GitHub 远程模块 + 海阔版本缓存。
- 引入 `latest.json` 和 Remote Module Manager；正常启动不请求 latest，只有主动检查/更新才访问版本元数据。

## Core 0.1.9

- APK 原生协议：`t + s(MD5) + deviceId + User-Mark + aut`。
- `encData` AES-CBC 解密。
- 修正分类视频接口与协议诊断。
