# MyAv Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档与仓库迁移基线，再读本文件、`registry.json`、当前 Test/Stable/Release/Bootstrap/Shell 和用户实机结果。未完成海阔实机验证的内容必须标记“待确认”。

## 当前基线（2026-08-23）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.3` / Build `10103`
- Shell：`apps/video/myav/myav_remote_test_v3_b10103.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v3_b10103.js`
- Release：`apps/video/myav/releases/0.1.0-test.3/release.json`
- Release 链：Test1 Core → Test2 `image_patch.js` → Test3 `core_patch.js` → Test1 Runtime → Test2 `runtime_patch.js` → Test3 `ui_patch.js`。
- 图标：`apps/video/myav/assets/icon.svg`；首页工具图标位于同目录 `search/filter/category/rank/favorite/magnet/preview.svg`。
- 数据源：`https://javlist.me/`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- Shared JAV Playback Stable：`1.0.0-test.4` / MissAV + 123AV + Jable
- Stable：尚未建立；必须完成多频道与新 UI 实机回归后才允许晋级。

## 2026-08-23 · Test2 第二轮实机结果 → Test3
### 已确认
- Test2 图片修复有效：有码首页大部分真实海报已经恢复，不再统一显示 `AVLIST` 灰色占位图。
- Test2 同 href 聚合有效：卡片番号不再全部串成同一个 `VRKM-1890`，可见 `VRKM-1890 / VRKM-1905 / VRKM-1873 / VRKM-1904 / URVRSP-602 / URVRSP-608` 等独立条目。
- Test2 详情封面恢复有效：`vrkm-1873` 详情顶部已经显示真实封面。
- 仓库自有 MyAv SVG 图标在实机顶部正常显示。
- 详情主体继续可解析：`VRKM-1873 · 2026-09-24 · 4201秒`、第三方播放区、`预览 21`、原站预览媒体地址与档案区均可见。

### 第二轮 P0 问题
1. 首页/详情 UI 仍是“功能堆叠”风格：灰色文字按钮过多、层级弱；详情连续纵向段落较长，主视觉、播放、工具动作和资料信息没有形成清晰产品层级。
2. 只有有码频道有内容；欧美、国产在海阔中为空。
3. 无码需要按原站当前动态 hash 筛选工作，不能被当成固定独立页面处理。

### 多频道根因（已通过当前原站重新确认）
- 有码列表详情族：`/c/<opaque>`。
- 欧美列表真实页面：`western.java`，当前详情链接族是 **`/c4/<opaque>`**；原站当前约 48 页并有完整条目。
- 国产列表真实页面：`domestic_index.js`，当前详情链接族是 **`/c3/<opaque>`**；原站当前约 3 页并有完整条目。
- Test1/Test2 `parseMovies()` 只匹配 `/c/`，所以欧美/国产页面虽然成功取得 HTML，却会得到 0 个影片实体。
- 无码不是独立详情族；当前原站通过有码 `default.cpp` 的“其它 → 無碼流出”动态筛选 URL 工作，query 中 `other/year` 值为站点当前 hash，禁止写死。

### Test3 Core 修复
- `core_patch.js` 将影片详情路径实体扩展为 `/c/`、`/c3/`、`/c4/`。
- `sectionUrl()` 改成从当前首页“分类”导航动态发现有码/欧美/国产真实入口；固定文件名仅作为兜底。
- 无码继续从当前页面“其它”区域动态发现 `無碼流出/无码流出` 链接；没有真实链接才退回有码根页，不伪造 hash。
- 增加 `detailFamily()`：`/c4/ → western`、`/c3/ → domestic`、`/c/ → normal`。
- 欧美编号兼容 `26.08.22.Mitzi.X` 一类日期式资源 ID；国产兼容 `EP31 / MD-0355 / MFK-0112 / MDSR-0013-2 / TZ-210` 等站点当前可见编号。
- Test2 图片优先级、placeholder 过滤、href 聚合与详情封面恢复全部保留。

### Test3 UI 重构
#### Home
- 顶部改成 MyAv 品牌/当前频道状态区。
- 有码 / 欧美 / 国产 / 无码保留同级 `putMyVar → refreshPage(false)` 切换，不制造返回栈。
- 搜索 / 筛选 / 分类 / 排行改为独立图标快捷入口。
- 收藏 / 历史 / 更多 / 设置收敛为第二层工具行。
- 影片流由 Test2 三列紧凑卡改成双列海报流，提升封面面积与标题可读性。
- 当前频道标题明确区分“有码主库 / 欧美库 / 国产库 / 无码流出筛选”。

#### Detail
- Hero 改为左图右信息主视觉，不再使用 Test2 顶部大面积 blur 结构。
- 番号 / 日期 / 时长作为首屏信息芯片。
- 番号型 JAV 条目继续显示 MissAV / 123AV / Jable；欧美/国产编号体系不同，Test3 不把它们强行提交到 JAV Playback 制造假失败。
- 磁力 / 预览 / 收藏 / 原站改为四个图标快捷动作。
- 原站预览视频从连续多条文本入口收敛为一个主播放入口，避免详情页出现大段“播放预览1/2/3”。
- 简介前置，档案与导演/片商/系列/类别/演员/男优/TAG 分组展示。
- 详情不再同时铺出磁力/预览的大量快速列表；完整内容进入对应独立页面查看。

## 2026-08-23 · Test1 首轮实机结果 → Test2
### 已确认
- 云仓链补齐后 MyAv Test1 可看到、导入、启动。
- 首页/详情基本结构、第三方播放、磁力/预览/收藏/原站入口可渲染。
- `vrkm-1905` 详情能打开并识别 `预览 20`。

### Test1 图片故障与根因
- 所有封面误显示 AVLIST 占位图；多个卡片番号串成 `vrkm01890`；详情 Hero 封面为空；网站 favicon 不可靠。
- 原因一：单个正则 `data-original|data-src|...|src` 实际按 HTML 属性位置命中，`src=占位图` 在前时会先被抓到，alternation 顺序不能代表 lazy-load 优先级。
- 原因二：按详情锚点前后几 KB raw HTML 抓番号/图片会吃到相邻卡片；同一个影片的图片锚点和标题锚点又被首次 `seen[href]` 截断。
- 原因三：详情全页泛扫 `<img>` 缺少 `og:image/JSON-LD/详情首屏` 优先级。

### Test2 修复
- 图片逐字段读取：`data-original → data-src → data-lazy-src → data-lazy → data-url → data-echo → data-cover → data-ks-lazyload → data-thumb → src → srcset/style`。
- 过滤 loading/lazy/placeholder/blank/spacer/transparent/noimage/default/favicon/logo/avatar。
- 同一详情 href 聚合全部图片/标题锚点，再从当前实体可见文本恢复番号/日期。
- 详情封面：`og:image/twitter:image → image_src → JSON-LD image → 预览区之前的详情图片 → 全页评分兜底`。
- 程序图标改为仓库自有 `assets/icon.svg`。
- 第二轮实机已证明以上图片链有效。

## Product Blueprint
### 页面地图
- Home：有码 / 欧美 / 国产 / 无码四个同级工作区。
- Filters：当前频道动态年份 / 标签 / 资源状态，原页刷新。
- Indices：有码片商 / 有码女优 / 男优 / 有码TAG / 欧美片商 / 欧美女优 / 欧美TAG / 国产女优 / 国产TAG。
- Rankings：热门 TOP20 / 周作品排名 / 月作品排名。
- Search：有码 / 欧美 / 国产三类搜索，优先动态解析原站表单。
- Detail：主视觉、共享第三方播放（适用番号型 JAV）、磁力/预览/收藏/原站、简介、档案与关系标签。
- Magnets：完整磁力列表，点击复制，长按调用云盘小程序。
- Preview：独立原图预览。
- Favorites / History：手机本地 JSON。
- More：FC2、18H漫画、欧美独立站、小说区、MyAv 原站；视频在线/韩漫没有稳定直链时不伪造。
- Settings：运行信息、导航重发现、Remote Test 更新/回退。

## 当前网站事实（2026-08-23）
- 主站公开导航：有码、欧美、国产、无码、FC2磁力查询、视频在线、18H次元漫画、韩漫、小说。
- 标签分类 9 类：有码片商 / 有码女优 / 男优 / 有码TAG / 欧美片商 / 欧美女优 / 欧美TAG / 国产女优 / 国产TAG。
- 有码根：`default.cpp`；欧美：`western.java`；国产：`domestic_index.js`。
- 有码详情 `/c/`；欧美详情 `/c4/`；国产详情 `/c3/`。
- 无码流出为 `default.cpp` 当前动态 `other=<hash>` 筛选，不是固定详情族。
- 筛选至少包含年份、标签、全部/磁力/無碼流出/高清/字幕。
- 排行页 `top100.php`：热门TOP20 / 周作品排名 / 月作品排名。
- 搜索：`search.php` / `western_search.java` / `domestic_search.php`。
- 新片可以真实地暂时没有磁力，不能把“0 磁力”自动当成 Parser 失败。

## Protocol / Parser
- Base：`https://javlist.me`。
- 普通 HTML 请求优先 `fetch`；响应为空、过短或 challenge 时用 `fetchCodeByWebView` 兜底。
- 首页导航成功 HTML 缓存 20 分钟；设置页可清除并重新发现。
- 影片主键始终使用真实 opaque 详情 URL，不逆推 opaque ID。
- 当前详情路径 family：`/c/ | /c3/ | /c4/`。
- 分页先从当前 HTML 读取真实 `page=2` 模板，再替换页码，保留 year/tag/other/sort/hash。
- 筛选和频道入口从当前页面读取真实 href，禁止把历史 hash 写死。
- 搜索优先解析 `<form>` action/method/input/hidden fields；失败才做有限兼容尝试，并显式失败，不造假结果。

## 第三方播放
- 统一复用 `shared/jav-playback/manager.js` Stable，不在 MyAv 复制 Provider Parser。
- 当前 SDK：`1.0.0-test.4`；Provider：MissAV / 123AV / Jable。
- Test3 只对适合的番号型 JAV 条目显示共享 JAV Playback；欧美/国产默认不伪匹配。

## 磁力长按跨小程序合同
1. 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
2. PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encodeURIComponent(magnet)>`
3. 123云盘：`hiker://page/diaoyong?rule=123云盘&page=fypage&realurl=<encodeURIComponent(magnet)>`
4. 光鸭云盘：`hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>`
5. 复制磁力。

调用前检查目标小程序是否安装；未安装只 toast。

## 收藏 / 历史
- 收藏：`hiker://files/rules/MyAv/favorites.json`
- 历史：`hiker://files/rules/MyAv/history.json`
- 读取 `fetchPC()`，写入 `writeFile()`。
- 收藏主键为真实详情 URL；不保存 Cookie/Token。

## UI / Navigation 硬约束
- 普通 title/desc 纯文本，不用 `<font>/<b>`。
- 首页频道、筛选、排行、搜索类型均是同级状态刷新，禁止反复新建相同功能页。
- 列表→详情、索引→结果、详情→磁力/预览才是真正钻取。
- 第三方播放是 Primary Action；磁力/预览/收藏/原站是工具动作。
- 预览视频不得用连续多个同类入口把详情变成伪播放列表。
- 无数据显式显示空状态，不制造假卡片。

## 云仓发布事故记忆
- `registry.json` 不是手机“我的规则仓库”的展示清单；真实目录读取 root `manifest.json`。
- root `manifest.json` 变更必须同步 `manifest_meta.json` revision，否则设备可能继续命中旧缓存。
- app `channels.json` 必须使用规则仓库统一 `channels:[{channel,...}]` 协议。
- 固定发布检查：`app modules → release → bootstrap → shell → test/channels/manifest → registry → root manifest → manifest_meta → GitHub main 回读 → 海阔实机同步/导入`。

## Test3 实机回归（待确认）
- [ ] 云仓显示 `Test 0.1.0-test.3 · Build 10103` 并可覆盖导入。
- [ ] 首页新版品牌区、4 频道、4 个图标快捷入口、双列海报流布局正常。
- [ ] 有码首页封面继续正常，无 Test2 图片回退。
- [ ] 欧美频道能显示当前原站条目，至少可见 `26.08.xx...` 一类 ID；点击 `/c4/` 详情可打开。
- [ ] 国产频道能显示当前原站条目，至少可见 `EPxx / MD-xxxx / MFK-xxxx / TZ-xxx`；点击 `/c3/` 详情可打开。
- [ ] 无码频道能通过当前动态 hash 筛选显示结果，而不是固定空白。
- [ ] 详情新版 Hero、番号/日期/时长、播放、4 快捷动作、简介与资料分组排版正常。
- [ ] `vrkm-1873` 封面和预览图片继续正常。
- [ ] MissAV / 123AV / Jable 在有码番号条目不退化。
- [ ] 磁力点击复制与长按迅雷/PikPak/123云盘/光鸭云盘不退化。

## 禁止回退
- 禁止只匹配 `/c/`；必须兼容当前 `/c3/`、`/c4/`。
- 禁止把无码当固定页面或写死 `other/year` hash。
- 禁止用一个 alternation 正则冒充 lazy-load 属性优先级。
- 禁止在影片锚点前后几 KB raw HTML 直接抓番号。
- 禁止重新依赖 `javlist.me/favicon.ico`。
- 禁止在 Test3 实机验证前建立 Stable。
