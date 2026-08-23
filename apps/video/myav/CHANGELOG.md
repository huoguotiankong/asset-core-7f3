# MyAv Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读全局项目文档与仓库迁移基线，再读本文件、`registry.json`、当前 Test/Stable/Release/Bootstrap/Shell 和用户实机结果。未完成海阔实机验证的内容必须标记“待确认”。

## 当前基线（2026-08-23）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.6` / Build `10106`
- Shell：`apps/video/myav/myav_remote_test_v6_b10106.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v6_b10106.js`
- Release：`apps/video/myav/releases/0.1.0-test.6/release.json`
- Shell Rule Version：`2026082316`
- Release 链：Test1 Core → Test2 图片 Patch → Test3 多频道 Patch → Test4 分类/磁链 Patch → Test5 实体页 Patch → Test6 收藏/排版/搜索 Patch → Test1 Runtime → Test2 Runtime Patch → Test3 UI → Test4 UI → Test5 UI → Test6 UI-A/UI-B/UI-C → Shared JAV Playback Stable。
- 图标：`apps/video/myav/assets/icon.svg`；工具图标包含 `search/filter/category/rank/favorite/history/more/settings/magnet/preview/actress.svg`。
- 数据源：`https://javlist.me/`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- Shared JAV Playback Stable：`1.0.0-test.4` / MissAV + 123AV + Jable
- Stable：尚未建立；Test6 的女优中心、演员收藏、页面排版和搜索增强完成实机回归前不得晋级。

## 2026-08-23 · Test5 第五轮实机结果 → Test6
### 已确认
- Test5 首页八宫格图标已正常显示，搜索/筛选/分类/排行/收藏/历史/更多/设置视觉统一；双列海报流可正常工作。
- Test5 原站搜索可正常返回结果，例如搜索 `石川澪` 可得到真实影片封面、番号与日期；但用户要求继续优化搜索工作流。
- Test5 `/t/` 实体页恢复有效：例如 `長浜みつり` 实机显示真实头像、`101 部作品`、实体类型、`全部 / 磁力 / 字幕 / 单体 / 无码破解` 原站筛选，以及双列分页作品流。
- 说明 Test4 `/t/` 钻取 + Test5 实体 Metadata/筛选模型有效，女优资料不再只是普通影片列表。

### 第五轮产品需求
1. 搜索继续优化，不只停留在“输入关键词 → 影片结果”。
2. 增加独立的女优页面，而不是必须从“分类 → 有码女优”绕行。
3. 本地收藏拆成“影片收藏”和“演员收藏”。
4. 设置中增加各页面排版选择。
5. 详情中的演员/男优/片商/TAG 应继续进入正确实体语义页面。

## Test6 产品与架构改动
### 独立女优中心
- 新增 Shell 页面：`myavActresses`，Runtime 导出 `actresses()`。
- Home 快捷入口加入“女优”，使用仓库自有 `assets/actress.svg`。
- 女优中心同页切换：`有码女优 / 欧美女优 / 国产女优 / 男优`。
- 每类入口继续从当前原站导航动态读取真实 `cat.py` 地址，不写死动态参数/hash。
- 继续复用 Test4 `parseIndexEntries()` 和原站真实分页模板；女优/男优卡片进入 `/t/` 实体页。
- 女优索引支持当前已加载页面的姓名过滤。
- **限制必须明确**：当前姓名过滤只作用于当前已加载的索引页；原站有码女优索引实机最大页约 561，当前没有确认可靠的全站“女优姓名直搜”接口，因此禁止把当前页过滤伪装成全局女优搜索。

### 搜索增强
- 输入 hint 改为短提示：`输入番号 / 名称`。
- 继续保留有码 / 欧美 / 国产三类原站搜索，不改真实后端表单协议。
- 增加最近搜索记录，本地最多保留 10 条；重复关键词去重并前置。
- 最近搜索可一键重新搜索，并提供清空关键词/清除搜索记录。
- 搜索页增加“女优库”快捷入口，使“影片关键词搜索”和“女优索引浏览”产品语义分开。
- 搜索结果海报列数由设置页独立控制。

### 影片收藏 / 演员收藏分离
- 影片收藏继续使用：`hiker://files/rules/MyAv/favorites.json`。
- 新增演员收藏：`hiker://files/rules/MyAv/actor_favorites.json`。
- 收藏页同级 Tab：`影片收藏 / 演员收藏`。
- 女优/男优实体页增加 `♡ 收藏演员 / ♥ 已收藏`。
- 演员收藏记录：真实实体 URL、名称、头像、实体类型、频道、作品数；主键使用真实实体 URL。
- 两类收藏均只保存在手机本地，不上传 Cookie/Token/隐私信息。

### 详情实体跳转类型化
- 详情 `演员` → `etype=actress`。
- 详情 `男优` → `etype=actor`。
- 详情 `片商` → `etype=studio`。
- 详情 `TAG/类别` → `etype=tag`。
- `/t/` URL 继续由统一实体 List 处理，不复制多份女优/片商/TAG页面逻辑。

### 页面排版设置
- 设置页新增各区域独立的 `2列 / 3列` 选择：
  - 首页影片：`myav_layout_home`
  - 搜索结果：`myav_layout_search`
  - 女优索引：`myav_layout_actresses`
  - 演员/片商/TAG作品：`myav_layout_entity`
  - 本地收藏：`myav_layout_favorites`
- 默认均为双列。
- 提供“恢复默认排版”，一次清除上述布局偏好。
- 页面排版只影响展示密度，不改变 Parser、URL、收藏主键或分页协议。

### Home 信息架构 Test6
- 首页保持 8 个核心图标：
  1. 搜索
  2. 筛选
  3. 女优
  4. 分类
  5. 排行
  6. 收藏
  7. 历史
  8. 设置
- “更多站点”不再占 Home 核心八宫格，保留在设置/分类中心中访问，降低首屏工具拥挤。

## Test6 本地存储
- 影片收藏：`hiker://files/rules/MyAv/favorites.json`
- 演员收藏：`hiker://files/rules/MyAv/actor_favorites.json`
- 浏览历史：`hiker://files/rules/MyAv/history.json`
- 搜索记录：Hiker item key `myav_search_history_v1`
- 页面布局：`myav_layout_*`
- JSON 文件读取继续使用 `fetchPC()`，写入继续使用 `writeFile()`。

## 2026-08-23 · Test4 第四轮实机结果 → Test5
### 已确认
- **磁力页重构有效**：`SONE-350` 实机可恢复 19 条资源，并显示真实大小/日期，例如 `6.19GB · 2024-09-29`、`5.88GB · 2024-09-15`、`9.47GB · 2024-09-07`；字幕/高清标签可识别，`[javlist.me]` 垃圾标题已消失。
- 磁力页“全部 / 字幕 / 高清”和“默认 / 大小 / 日期”同页状态区已能渲染；点击复制和长按云盘合同保持。
- **`/t/` 索引钻取修复有效**：例如 `川越にこ` 已能从女优索引进入真实作品列表并显示影片封面/番号。
- 原站完整菜单读取基本成立：实机网页可见“标签分类 / 有码热门 / 片商新番 / 排行榜 / 搜索”等菜单及子项。

### Test5 修复
- 搜索原生输入不再塞长提示，支持范围移到输入框下面。
- Home 收藏/历史/更多/设置统一使用图标。
- `/t/` 女优/男优/片商/TAG 升级为原生实体页：头像 + 名称 + 作品数 + 原站资源筛选 + 分页作品流。
- 实体页筛选只使用原站真实 href；每个实体使用独立状态 key，禁止串状态。
- synthetic 女优页 `天海つばさ [459作品]` 可恢复 `count=459`、女优类型和 `全部/磁力/字幕/单体/无码破解` 五项筛选。

## 2026-08-23 · Test3 第三轮实机结果 → Test4
### 已确认
- Test3 UI 相比 Test2 明显改善：首页/详情形成主视觉、在线播放、快捷动作、简介和资料分组。
- 欧美条目详情正常，例如日期式编号 `26.08.21.Dace` 可显示真实封面、标题、日期、磁力、预览和简介。
- 有码条目详情正常，例如 `START-613` 可显示真实封面、番号/日期/时长、Shared JAV Playback、磁力、预览和原站预览。

### Test4 根因与修复
- 磁力标题经常只有 `[javlist.me]` → magnet `dn=` 优先 + 局部 `tr/li/p/div` 资源块兜底；恢复大小/日期/字幕/高清。
- Test3 只把 9 个标签索引当“分类” → 分类中心补齐资源频道、标签分类、有码热门、片商新番、排行榜和三类搜索。
- `cat.py` 索引正文大量使用 `/t/<opaque>` → Test4 正式允许 `/t/`，并限制扫描在索引正文首尾分页之间。
- 女优索引带真实图片时使用图片卡；纯文本索引使用紧凑按钮。
- 磁力页增加全部/字幕/高清筛选 + 默认/大小/日期排序；均原页 refresh。

## 已验证基础
### 图片链 · Test2
- lazy-load 图片逐字段读取：`data-original → data-src → data-lazy-src → data-lazy → data-url → data-echo → data-cover → data-ks-lazyload → data-thumb → src → srcset/style`。
- 过滤 loading/lazy/placeholder/blank/spacer/transparent/noimage/default/favicon/logo/avatar。
- 同一详情 href 聚合图片与标题锚点，避免相邻番号串卡。
- 详情封面：`og:image/twitter:image → image_src → JSON-LD image → 详情首屏 → 全页评分兜底`。
- Test2/3 实机已证明真实封面与仓库自有 MyAv 图标有效。

### 多频道 · Test3
- 有码根：`default.cpp`；详情 `/c/<opaque>`。
- 欧美根：`western.java`；详情 `/c4/<opaque>`。
- 国产根：`domestic_index.js`；详情 `/c3/<opaque>`。
- 无码：有码 `default.cpp` 当前“其它 → 無碼流出”动态 hash 筛选，不是固定独立详情族。
- 频道入口和无码 hash 均从当前页面读取真实 href，禁止历史常量。

### 当前原站导航事实（2026-08-23）
- 分类：有码 / 欧美 / 国产 / 无码 / FC2磁力查询 / 视频在线 / 18H次元漫画 / 韩漫 / 小说。
- 标签分类：有码片商 / 有码女优 / 男优 / 有码TAG / 欧美片商 / 欧美女优 / 欧美TAG / 国产女优 / 国产TAG。
- 有码热门：单体作品 / 最佳女优 / 漫画改编 / 新人出道 / 无码破解 / 巨乳 / 辣妹 / 熟女 / 人妻 / 大屁股 / 超乳 / 巨大的根 / 猫耳 / 全部标签。
- 片商新番：MOODYZ / Madonna / kawaii / 本中 / Fitch / OPPAI / S1 / Hunter / E-BODY / Attackers。
- 排行榜：独立入口。
- 搜索：有码查询 / 欧美查询 / 国产查询。
- 有码女优索引为超大分页，实机原站显示最大页约 561；不能只做第一页或静态名单。

## 第三方播放
- MyAv 不复制 Provider Parser，统一复用 `shared/jav-playback/manager.js` Stable。
- 当前 SDK：`1.0.0-test.4`；Provider：MissAV / 123AV / Jable。
- 番号型 JAV 条目显示共享播放；欧美/国产编号体系不同，默认不强行提交，避免制造假失败。

## 磁力长按跨小程序合同
1. 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
2. PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encodeURIComponent(magnet)>`
3. 123云盘：`hiker://page/diaoyong?rule=123云盘&page=fypage&realurl=<encodeURIComponent(magnet)>`
4. 光鸭云盘：`hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>`
5. 复制磁力。
- 调用前检查目标小程序是否安装；未安装只 toast。

## UI / Navigation 硬约束
- 普通 title/desc 使用纯文本，不依赖 `<font>/<b>`。
- 首页频道、筛选、排行、搜索类型、磁链筛选/排序、实体页筛选、女优类型均属于同级状态更新，使用 `putMyVar → refreshPage(false)`。
- 列表→详情、索引→实体页、详情→磁力/预览才创建真正钻取页面。
- 第三方播放为 Primary Action；磁力/预览/收藏/原站为工具动作。
- 无数据显式显示空状态，禁止制造假卡片或假成功。

## 云端仓库发布链
- 手机“我的规则仓库”读取根 `manifest.json`，不是 `registry.json`。
- `manifest_meta.json` revision 必须与根 manifest 同步，否则设备可能继续使用旧目录缓存。
- 发布新 Test 固定检查：`Release → Bootstrap → Shell → test.json → channels.json → app manifest → registry → root manifest → manifest_meta → GitHub main 回读 → 实机导入`。
- 并行任务可能同时推进其它程序；更新 registry/root manifest 前必须重新读取 main，禁止旧快照覆盖。
- Test6 发布前最新 main 已到 ACFun `1.0.0-alpha10` / 汤头条 `0.1.0-test.10`，Test6 更新已按该快照保留。
- Test6 发布时发现 root manifest 已到 revision `202608231205`，而 `manifest_meta` 仍停在 `202608231156`；Test6 同步将两者重新对齐到 `202608231213`。

## Test6 静态门禁
- [x] `core_patch.js` `node --check`。
- [x] `ui_a.js / ui_b.js / ui_c.js` `node --check`。
- [x] Bootstrap `node --check`。
- [x] Release JSON parse。
- [x] Shell 外层 JSON + pages JSON parse。
- [x] Shell Rule Version `2026082316`，共 15 个 pages，新增 `myavActresses`。
- [x] Release Build `10106`，previous 正确指向 Test5 Build10105。
- [x] Test4 磁链与 Test5 实体页模块均保留在 Release 链中。
- [ ] 海阔 Test6 实机回归。

## Test6 实机回归重点
- [ ] 首页出现独立“女优”图标，八宫格整体排版正常。
- [ ] 女优中心有码/欧美/国产女优、男优四类能切换，头像/名称/分页正常。
- [ ] 任意女优实体页显示“收藏演员”，收藏后状态切为“已收藏”。
- [ ] 本地收藏可在“影片收藏 / 演员收藏”之间切换，数据互不混淆。
- [ ] 从影片详情点击演员，进入的实体页类型为女优；男优/片商/TAG 跳转语义正确。
- [ ] 搜索历史可记录、点击复搜、清除；原有有码/欧美/国产搜索结果不退化。
- [ ] 设置中首页/搜索/女优/实体作品/收藏的 2列/3列能分别生效并持久化。
- [ ] Test4 SONE-350 磁链 19 条、大小/日期/字幕高清、复制/长按不退化。
- [ ] 有码/欧美/国产/无码首页、详情、预览和 Shared JAV Playback 不因 Test6 回退。

## 禁止回退
- 禁止再只把 9 个标签索引当成完整分类。
- 禁止把 `/t/<hash>` 当成无状态普通列表；女优/男优/片商/TAG 属于实体页语义。
- 禁止写死 `/t/` hash、无码 other hash、年份/tag hash、实体筛选 hash。
- 禁止把 `[javlist.me]` 作为磁力有效标题。
- 禁止把长说明塞进原生 input 挤压输入区域。
- 禁止把当前页女优姓名过滤描述成全站女优搜索。
- 禁止混用影片收藏与演员收藏的本地主键/文件。
- 禁止原地覆盖已发布 Test；任何实机修复继续新 Build。
