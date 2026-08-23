# MyAv Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档与仓库迁移基线，再读本文件、`registry.json`、当前 Test/Stable/Release/Bootstrap/Shell 和用户实机结果。未完成海阔实机验证的内容必须标记“待确认”。

## 当前基线（2026-08-23）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.1` / Build `10101`
- Shell：`apps/video/myav/myav_remote_test_v1_b10101.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v1_b10101.js`
- Release：`apps/video/myav/releases/0.1.0-test.1/release.json`
- 数据源：`https://javlist.me/`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- Shared JAV Playback Stable：`1.0.0-test.4` / MissAV + 123AV + Jable
- Stable：尚未建立；必须完成实机回归后才允许晋级。

## Product Blueprint · Test1
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
- 列表 Parser 以详情锚点 `/c/` 为稳定实体特征，并从同一卡片邻域恢复标题、日期、番号、资源标签和图片；Test1 需实机确认图片 DOM 与卡片边界。
- 分页不写死完整 query；先从当前 HTML 提取 `page=2` 模板，再替换目标 page，保留原站 year/tag/other/sort 参数。Test1 静态 smoke 已发现并修复 `?page=2...` 相对 query 必须保留当前文件名的问题。
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
- 已将 MyAv Test 加入根 `manifest.json`，revision 提升为 `202608231103`，云仓项目数更新为 9。
- 规则仓库还有独立 `manifest_meta.json` revision 探针；只改 manifest 不同步 meta 会让设备继续命中旧目录缓存。已同步 `manifest_meta.json` 到相同 revision / itemCount=9。
- MyAv 最初 `channels.json` 使用 `{stable,test}` 内部对象结构，但规则仓库通用版本中心要求 `channels:[{channel,...}]`；已改为 schema 4 的 Test-only 标准通道格式，保证“看得到卡片”后还能进入版本中心并导入 Test。
- 发布新程序到云仓以后固定检查：`registry → app channels/test/release/Shell → root manifest.json → manifest_meta.json → 规则仓库实机同步/导入`，不能把“registry 已登记”当成“云仓已发布”。

## Test1 静态门禁
- [x] Core `node --check`。
- [x] Runtime `node --check`。
- [x] Bootstrap `node --check`。
- [x] release/test/channels/manifest JSON parse。
- [x] 本地 synthetic parser smoke：列表 / 番号 / 磁力 / 预览图 / 预览视频 / 分页模板。
- [ ] Remote installer guard / repository guard。
- [x] GitHub 回读：registry / manifest / manifest_meta / Test / channels / Release / Bootstrap / Shell / Core / Runtime。

## Test1 实机回归（待确认）
- [ ] 从“我的规则仓库”导入 MyAv Test，首页正常启动并显示 `0.1.0-test.1 / 10101`。
- [ ] 首页有码 / 欧美 / 国产 / 无码连续切换 5 次后，系统返回一次即可离开，不叠页面栈。
- [ ] 首页影片卡有标题、日期/番号、封面；翻页正常。
- [ ] 高级筛选年份 / 标签 / 磁力 / 无码流出 / 高清 / 字幕能组合切换并刷新结果。
- [ ] 9 类分类索引至少随机验证 3 类可分页并进入结果。
- [ ] TOP20 / 周榜 / 月榜切换和翻页正常。
- [ ] 有码 / 欧美 / 国产搜索各测试一个关键词。
- [ ] 详情 Hero、档案、演员/TAG、简介正常。
- [ ] 有磁力的旧片能列出磁力；新片无磁力显示真实空状态。
- [ ] 磁力点击复制；长按分别测试 迅雷 / PikPak / 123云盘 / 光鸭云盘。
- [ ] MissAV / 123AV / Jable 至少各验证一次可播番号。
- [ ] 预览图能显示清晰原图；如果站点需要脚本展开，WebView fallback 生效。
- [ ] 收藏后进入本地收藏可见；取消收藏正常；浏览历史正常。
- [ ] 实机截图复核 Home / Filters / Detail 三个核心页面的密度、卡片比例和操作层级。

## 禁止回退 / 待确认
- 禁止把站点 opaque `/c/<id>` 当成可预测业务 ID 逆推。
- 禁止写死年份/标签 hash；从当前页面读取真实 href。
- 禁止把外围独立站“视频在线/韩漫”编造为当前已原生支持。
- Test1 的 HTML Parser 仍需海阔实机确认 DOM/图片 lazy-load 细节；任何实机差异以手机结果优先，下一版新 build 修正，不原地覆盖 Test1。
