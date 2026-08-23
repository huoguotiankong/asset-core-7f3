# MyAv Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档与仓库迁移基线，再读本文件、`registry.json`、当前 Test/Stable/Release/Bootstrap/Shell 和用户实机结果。未完成海阔实机验证的内容必须标记“待确认”。

## 当前基线（2026-08-23）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.2` / Build `10102`
- Shell：`apps/video/myav/myav_remote_test_v2_b10102.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v2_b10102.js`
- Release：`apps/video/myav/releases/0.1.0-test.2/release.json`
- Test2 Patch：`image_patch.js` + `runtime_patch.js`，复用 Test1 Core/Runtime 基座，不原地覆盖 Test1。
- 图标：`apps/video/myav/assets/icon.svg`，禁止再依赖 `javlist.me/favicon.ico`。
- 数据源：`https://javlist.me/`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- Shared JAV Playback Stable：`1.0.0-test.4` / MissAV + 123AV + Jable
- Stable：尚未建立；必须完成实机回归后才允许晋级。

## 2026-08-23 · Test1 首轮实机结果 → Test2
### 已确认
- “我的规则仓库”补齐 root manifest / manifest_meta / channels 后，MyAv Test1 已能在手机端看到、导入和启动。
- 首页结构、有码/欧美/国产/无码 Tab、搜索/高级筛选/分类索引/排行榜/收藏/历史/更多/设置入口均可渲染。
- 列表已经识别出真实影片详情链接，点击可进入详情；例如 `vrkm-1905` 详情能够打开。
- 详情标题、番号、日期、时长、第三方播放区、磁力/预览/收藏/原站操作均能渲染；该实机截图识别到 `预览 20`，说明详情主体 HTML 与预览图片链已被解析。

### Test1 P0 图片故障
- 首页所有影片封面显示成同一张灰底 `AVLIST` 图，不是真实影片封面。
- 同一行多个影片出现重复/错位番号，例如多个卡片都显示成 `vrkm01890`；这是 Parser 卡片边界错误，不只是图片加载失败。
- 详情 Hero 左侧封面为空白，没有拿到真实主封面。
- `https://javlist.me/favicon.ico` 在海阔中不可作为稳定程序图标，设备实际显示的是失败后的字母/占位效果。

### 根因
1. Test1 `attrImage()` 使用单个正则 `(?:data-original|data-src|data-lazy-src|src)=...`。正则虽然把 lazy 字段写在前面，但实际匹配仍从标签左到右扫描；当原站 `<img>` 是 `src=占位图` 写在前、`data-src/data-original=真实图` 写在后时，会先命中 `src`，因此稳定拿到 AVLIST/loading 占位图。
2. Test1 列表 Parser 遇到 `/c/<opaque>` 链接后立即去详情链接前后截取约 3KB HTML，并从宽上下文中恢复番号/日期/图片。一个影片通常存在“图片链接”和“标题链接”两个相同 href，Test1 又对 href 首次出现就 `seen`，导致只保留图片锚点；标题为空后，再从宽上下文扫描 raw HTML，容易先匹配到图片文件名或相邻影片番号，于是出现串卡。
3. Test1 详情 `coverImage()` 对全页 `<img>` 做泛化扫描，缺少 `og:image / JSON-LD / 详情首屏区域` 的明确优先级，容易拿到站点公共图或根本没有可用候选。

### Test2 修复
- `image_patch.js`：
  - 图片属性改成逐字段显式读取，优先级：`data-original → data-src → data-lazy-src → data-lazy → data-url → data-echo → data-cover → data-ks-lazyload → data-thumb → src → srcset/style`。
  - 新增 placeholder 判定，过滤 loading / lazy / placeholder / blank / spacer / transparent / noimage / default / favicon / logo / avatar 等公共图。
  - 列表按**同一个详情 href 聚合全部锚点**，把图片锚点与标题锚点合并成同一影片实体，不再“首个 href 锚点即定稿”。
  - 番号/日期优先从当前影片标题锚点后的**可见文本**提取，禁止直接在 raw HTML 属性/图片 URL 中先抓番号。
  - 详情封面优先：`og:image/twitter:image → image_src → JSON-LD image → 预览区之前的详情图片 → 全页评分兜底`。
- `runtime_patch.js`：
  - Home 使用仓库自有 SVG 图标。
  - 设置页显示 Test2 / Build10102 与图片链状态。
  - Test 更新/回退 require cache key 升到 10102。
- Shell 图标、规则仓库 channels 图标、root manifest 图标全部切换为仓库自有 `assets/icon.svg`。
- 本地 synthetic smoke 已覆盖 `src=loading.jpg + data-src=real.jpg`：真实图优先；并覆盖同 href 图片/标题双锚点 + 下一卡片，输出正确 `href/code/date/image`，避免相邻番号串卡。

### Test2 待实机确认
- [ ] 首页真实封面恢复，不再显示 AVLIST 占位图。
- [ ] 首页每张卡片的番号/标题与当前卡片一致，不再串成相邻影片番号。
- [ ] `vrkm-1905` 详情 Hero 显示真实封面。
- [ ] 顶部 MyAv 程序图标显示仓库自有紫色 MyAv 图标。
- [ ] 预览 20 张仍正常，不因封面 Parser 改动退化。
- [ ] 有码/欧美/国产/无码与搜索/筛选/排行继续正常。

## Product Blueprint
### 页面地图
- Home：有码 / 欧美 / 国产 / 无码四个同级工作区，快捷进入搜索、筛选、分类索引、排行、收藏、历史、更多、设置。
- Filters：按原站当前页面动态解析年份 / 标签 / 资源状态，切换筛选只刷新当前页，不重复压栈。
- Indices：有码片商 / 有码女优 / 男优 / 有码TAG / 欧美片商 / 欧美女优 / 欧美TAG / 国产女优 / 国产TAG。
- Rankings：热门 TOP20 / 周作品排名 / 月作品排名。
- Search：有码 / 欧美 / 国产三类搜索，优先动态解析原站表单，不写死搜索字段名。
- Detail：Hero、共享第三方播放、磁力/预览/收藏/原站、档案、导演/片商/系列/类别/演员/男优/TAG、简介、磁力快速预览、预览图。
- Magnets：完整磁力列表，点击复制，长按调用云盘小程序。
- Preview：独立原图预览。
- Favorites / History：手机本地 JSON。
- More：FC2、18H漫画、欧美独立站、小说区、MyAv 原站入口；“视频在线/韩漫”当前没有从普通 HTML 得到稳定直链，不伪造入口。
- Settings：运行信息、导航缓存重置、Remote Test 更新/回退。

## 当前网站事实（2026-08-23）
- 主站公开导航包含：有码、欧美、国产、无码、FC2磁力查询、视频在线、18H次元漫画、韩漫、小说。
- 标签分类包含 9 类索引：有码片商 / 有码女优 / 男优 / 有码TAG / 欧美片商 / 欧美女优 / 欧美TAG / 国产女优 / 国产TAG。
- 首页筛选至少包含年份、标签、其它资源状态；资源状态包含全部 / 磁力 / 無碼流出 / 高清 / 字幕。
- 排行页 `top100.php` 提供热门TOP20 / 周作品排名 / 月作品排名。
- 搜索入口分别为 `search.php`、`western_search.java`、`domestic_search.php`。
- 详情可见字段：番号、发布时间、时长、导演、片商、系列、类别、演员、男优、TAG、故事简介、预览视频、磁力地址、预览图片。
- 新片可能暂时没有磁力；旧片实测详情能直接出现多条磁力，程序不能把“新片无磁力”误判为 Parser 失败。

## Protocol / Parser
- Base：`https://javlist.me`。
- 普通 HTML 请求优先 `fetch`；响应为空、过短或 challenge 时使用 `fetchCodeByWebView` 作为页面源码兜底。
- 首页导航缓存 20 分钟，仅缓存成功且长度足够的 HTML；设置页可主动重置。
- 列表实体以真实 `/c/<opaque>` 详情 URL 为主键，**不尝试解密/伪造 opaque id**。
- 分页不写死完整 query；先从当前 HTML 提取 `page=2` 模板，再替换目标 page，保留原站 year/tag/other/sort 参数。
- 筛选链接从原站当前页面动态提取，保证站点 hash/token 变化时不把历史常量写死。
- 索引入口从首页导航按显示名称发现；索引项继续使用原站真实 href。
- 搜索优先动态解析 `<form>` action/method/input name/hidden fields；失败才有限尝试常见关键词参数，并明确显示诊断，不制造伪结果。

## 第三方播放
- MyAv 不复制 Provider Parser，统一复用 `shared/jav-playback/manager.js` Stable。
- 当前 Stable SDK：`1.0.0-test.4`；Provider：MissAV / 123AV / Jable。
- 详情只把解析出的真实番号传给 Shared JAV Playback。
- 播放按钮由 SDK 的 `providerUrl()` 生成，点击时重新进入当前 Shared SDK 通道，避免 lazyRule 落回历史 Core。

## 磁力长按跨小程序合同
1. 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
2. PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encodeURIComponent(magnet)>`
3. 123云盘：`hiker://page/diaoyong?rule=123云盘&page=fypage&realurl=<encodeURIComponent(magnet)>`
4. 光鸭云盘：`hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>`
5. 复制磁力。

调用前检查目标小程序是否安装；未安装只 toast，不伪造替代入口。

## 收藏 / 历史
- 收藏：`hiker://files/rules/MyAv/favorites.json`
- 历史：`hiker://files/rules/MyAv/history.json`
- 按当前项目已验证文件 API：读取使用 `fetchPC()`，写入使用 `writeFile()`。
- 收藏主键使用真实详情 URL；保存 title/code/date/image 等展示字段，不保存 Cookie/Token 等秘密。

## UI / Navigation 硬约束
- 普通 title/desc 均按纯文本设计，不依赖 HTML `<font>/<b>`。
- 首页有码/欧美/国产/无码、筛选条件、排行模式、搜索类型全部属于同级状态切换：`putMyVar → refreshPage(false)`。
- 只有列表→详情、索引→结果、详情→磁力/预览等真正钻取才创建新 `hiker://page`。
- 第三方播放是详情 Primary Action 区；收藏、原站、磁力、预览作为工具动作放在其后，不与播放器主操作混成一套选集。
- 无磁力/无预览/无搜索结果必须显式空状态，宁可失败，不制造假卡片。

## 2026-08-23 云端仓库发布修复
- 初次发布时只完成 `registry.json`、MyAv Test/Release/Bootstrap/Shell 登记，遗漏根目录 `manifest.json`；用户实机因此在“我的规则仓库”看不到 MyAv。
- 真实云仓目录由“我的规则仓库” Stable 的 `HikerRuleRepo.manifestPath='manifest.json'` 读取，`registry.json` 不是手机端程序展示清单。
- 规则仓库还有独立 `manifest_meta.json` revision 探针；只改 manifest 不同步 meta 会让设备继续命中旧目录缓存。
- MyAv 初始 `channels.json` 使用 `{stable,test}` 内部对象结构，但规则仓库通用版本中心要求 `channels:[{channel,...}]`；现已使用 schema 4 的 Test-only 标准通道格式。
- 发布新程序/新版本到云仓以后固定检查：`registry → app channels/test/release/Shell → root manifest.json → manifest_meta.json → 规则仓库实机同步/导入`。

## 静态门禁
### Test1
- [x] Core `node --check`。
- [x] Runtime `node --check`。
- [x] Bootstrap `node --check`。
- [x] release/test/channels/manifest JSON parse。
- [x] synthetic parser smoke。
- [x] GitHub 回读。

### Test2
- [x] `image_patch.js` `node --check`。
- [x] `runtime_patch.js` `node --check`。
- [x] Bootstrap `node --check`。
- [x] Release JSON parse。
- [x] Shell 外层 JSON + 14 pages parse。
- [x] lazy-load + href-group synthetic smoke；预发布 smoke 曾发现 patch 使用循环残留 `href` 以及第二卡片上下文会吃前卡番号，已在 Test2 正式 pointer 更新前修正并重测通过。
- [ ] 海阔 Test2 实机图片回归。

## 禁止回退 / 待确认
- 禁止把站点 opaque `/c/<id>` 当成可预测业务 ID 逆推。
- 禁止写死年份/标签 hash；从当前页面读取真实 href。
- 禁止把外围独立站“视频在线/韩漫”编造为当前已原生支持。
- **禁止再用“一个正则匹配 data-src|src”来代表 lazy-load 优先级**；HTML 属性匹配必须逐字段读取，不能依赖 alternation 顺序。
- **禁止用影片锚点前后几 KB raw HTML 直接抓番号**；先按实体 href 聚合，再从当前实体的可见文本/局部结构读取。
- Test2 图片链仍需海阔实机确认；任何差异以手机结果优先，下一版必须新 Build 修正，不原地覆盖已发布 Test2。
