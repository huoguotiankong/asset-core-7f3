# MyAv Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档与仓库迁移基线，再读本文件、`registry.json`、当前 Test/Stable/Release/Bootstrap/Shell 和用户实机结果。未完成海阔实机验证的内容必须标记“待确认”。

## 当前基线（2026-08-23）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.4` / Build `10104`
- Shell：`apps/video/myav/myav_remote_test_v4_b10104.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v4_b10104.js`
- Release：`apps/video/myav/releases/0.1.0-test.4/release.json`
- Release 链：Test1 Core → Test2 `image_patch.js` → Test3 `core_patch.js` → Test4 `core_patch.js` → Test1 Runtime → Test2 `runtime_patch.js` → Test3 `ui_patch.js` → Test4 `ui_patch.js`。
- 图标：`apps/video/myav/assets/icon.svg`；工具图标：`search/filter/category/rank/favorite/magnet/preview.svg`。
- 数据源：`https://javlist.me/`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- Shared JAV Playback Stable：`1.0.0-test.4` / MissAV + 123AV + Jable
- Stable：尚未建立；必须完成分类中心、磁力页和多频道实机回归后才允许晋级。

## 2026-08-23 · Test3 第三轮实机结果 → Test4
### 已确认
- Test3 UI 相比 Test2 明显改善：首页/详情进入产品化结构，详情 Hero、信息芯片、在线播放、磁力/预览/收藏/原站快捷动作、简介和资料分组均可正常渲染。
- 欧美条目详情已正常工作，例如日期式编号 `26.08.21.Dace` 能显示真实封面、标题、日期、磁力 4、预览 14 和简介。
- 有码条目详情继续正常，例如 `START-613` 可显示真实封面、番号/日期/时长、MissAV/123AV/Jable、磁力 10、预览 21 和原站预览。
- 说明 Test2 图片链 + Test3 `/c /c3 /c4` 多详情族修复均有效。

### 第三轮实机暴露的问题
1. **磁力页信息价值不足**：4 条磁链标题几乎都只显示 `[javlist.me]`，部分只有日期，没有大小、字幕/高清信息；页面纵向留白大，缺少筛选与排序。
2. **分类不完整**：Test3 “分类索引”只展示 9 个标签入口，但原站真实菜单还包含“分类 / 标签分类 / 有码热门 / 片商新番 / 排行榜 / 搜索”等完整导航体系。
3. **部分分类点击后无内容/像没反应**：原站 `cat.py` 索引页的真实条目链接大量使用 `/t/<opaque-hash>`；旧 `parseIndex()` 只允许 `cat.py/default.cpp/western/domestic` 等路径，主动把 `/t/` 条目排除了。
4. 女优等索引原站存在完整分页和图片卡，Test3 原生索引没有充分利用这些数据。

### 当前原站菜单事实（2026-08-23）
- 分类：有码 / 欧美 / 国产 / 无码 / FC2磁力查询 / 视频在线 / 18H次元漫画 / 韩漫 / 小说。
- 标签分类：有码片商 / 有码女优 / 男优 / 有码TAG / 欧美片商 / 欧美女优 / 欧美TAG / 国产女优 / 国产TAG。
- 有码热门：单体作品 / 最佳女优 / 漫画改编 / 新人出道 / 无码破解 / 巨乳 / 辣妹 / 熟女 / 人妻 / 大屁股 / 超乳 / 巨大的根 / 猫耳 / 全部标签。
- 片商新番：MOODYZ / Madonna / kawaii / 本中 / Fitch / OPPAI / S1 / Hunter / E-BODY / Attackers。
- 排行榜：独立入口。
- 搜索：有码查询 / 欧美查询 / 国产查询。
- 有码女优索引当前约 561 页；有码片商索引当前约 20 页，说明索引必须支持真正分页，不能只做首页按钮。

## Test4 修复
### 分类中心
- `分类索引` 产品概念升级为 `分类中心`，原生页面分为：
  1. 资源频道
  2. 标签分类
  3. 有码热门
  4. 片商新番
  5. 排行榜 / 三类搜索
- 菜单链接从当前首页真实导航动态解析，不写死 `/t/<hash>`。
- FC2 / 18H漫画 / 小说使用当前已确认稳定的外围站点入口；视频在线 / 韩漫在原站没有稳定直链时明确 toast，不伪造地址。
- `parseIndexEntries()` 改为只扫描索引正文（首个“首页”分页锚点到尾部分页前），避免把全站顶部菜单误当索引内容。
- 索引实体正式允许 `/t/<opaque>`，修复之前“按钮可见但进入后无条目”的根因。
- 索引条目带真实图片时使用双列卡片；纯文字索引使用紧凑按钮。
- 索引页继续复用原站真实分页模板，支持大量页数。

### 磁链 Parser
- 不再把 `[javlist.me]` 当作有效资源标题。
- 优先从 magnet `dn=` 恢复真实标题；没有 `dn` 时读取磁链所在 `tr/li/p/div` 局部资源块。
- 从局部资源块恢复：大小、日期、字幕、高清/1080p/2160p 标记。
- 纯“字幕/高清”等标签不允许冒充资源标题；无有效标题时回退为 `番号 · 资源 01/02/...`。
- 继续保持磁链去重。

### 磁力页 UI
- 顶部显示当前番号/封面和资源数量。
- 增加同页筛选：全部 / 字幕 / 高清。
- 增加同页排序：默认 / 按大小 / 按日期。
- 每条资源显示：标题、大小、日期、字幕/高清标签。
- 点击仍为复制磁链；长按合同保持：迅雷 / PikPak / 123云盘 / 光鸭 / 复制。
- 筛选/排序使用 `putMyVar → refreshPage(false)`，不制造额外返回栈。

## Test2 → Test3 已验证基础
### 图片链
- lazy-load 图片逐字段读取：`data-original → data-src → data-lazy-src → data-lazy → data-url → data-echo → data-cover → data-ks-lazyload → data-thumb → src → srcset/style`。
- 过滤 loading/lazy/placeholder/blank/spacer/transparent/noimage/default/favicon/logo/avatar。
- 同一详情 href 聚合图片与标题锚点，避免相邻番号串卡。
- 详情封面：`og:image/twitter:image → image_src → JSON-LD image → 详情首屏 → 全页评分兜底`。
- Test2/3 实机已证明真实封面与自有 MyAv 图标有效。

### 多频道
- 有码列表详情族：`/c/<opaque>`。
- 欧美：`western.java`，详情族 `/c4/<opaque>`。
- 国产：`domestic_index.js`，详情族 `/c3/<opaque>`。
- 无码：有码 `default.cpp` 当前“其它 → 無碼流出”动态 hash 筛选，不是固定独立详情族。
- 频道入口和无码 hash 均从当前页面读取真实 href，禁止历史常量。

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

调用前检查目标小程序是否安装；未安装只 toast，不伪造替代入口。

## 收藏 / 历史
- 收藏：`hiker://files/rules/MyAv/favorites.json`
- 历史：`hiker://files/rules/MyAv/history.json`
- 读取使用 `fetchPC()`，写入使用 `writeFile()`。
- 收藏主键为真实详情 URL；不保存 Cookie/Token。

## UI / Navigation 硬约束
- 普通 title/desc 使用纯文本，不依赖 `<font>/<b>`。
- 首页频道、筛选、排行、搜索类型、磁链筛选/排序全部属于同级状态更新，使用 `putMyVar → refreshPage(false)`。
- 列表→详情、索引→结果、详情→磁力/预览才创建钻取页面。
- 第三方播放为 Primary Action；磁力/预览/收藏/原站为工具动作。
- 无数据显式显示空状态，禁止制造假卡片或假成功。

## 云端仓库发布链
- 手机“我的规则仓库”读取根 `manifest.json`，不是 `registry.json`。
- `manifest_meta.json` revision 必须与根 manifest 同步，否则设备可能继续使用旧目录缓存。
- 发布新 Test 固定检查：`Release → Bootstrap → Shell → test.json → channels.json → app manifest → registry → root manifest → manifest_meta → GitHub main 回读 → 实机导入`。
- 2026-08-23 Test4 发布时发现 root manifest 已由并行任务更新到 ACFun Alpha8 / 汤头条 Test9，而 `manifest_meta` 仍停留旧 revision；MyAv 发布必须保留并行最新状态并重新把 root/meta 对齐，禁止用旧快照覆盖。

## Test4 静态门禁
- [x] `core_patch.js` `node --check`。
- [x] `ui_patch.js` `node --check`。
- [x] Bootstrap `node --check`。
- [x] Release JSON parse。
- [x] Shell 外层 JSON + 14 pages parse。
- [x] synthetic smoke：完整菜单分组 / `/t/` 索引条目 / actor 图片候选 / magnet `dn` / 大小 / 日期 / 字幕 / 高清。
- [x] Test1-Test4 Release 模块顺序确认，Test2 图片链和 Test3 多频道链不会被 Test4 覆盖。
- [ ] 海阔 Test4 实机分类/磁力回归。

## Test4 实机回归重点
- [ ] 分类中心能看到资源频道、9 类标签分类、有码热门、片商新番、排行和三类搜索。
- [ ] 随机测试：有码女优 / 有码片商 / 有码TAG / 欧美女优 / 国产女优，索引页能显示内容并翻页。
- [ ] 随机进入 3 个 `/t/` 索引条目，能继续打开真实影片列表，不再“点了没反应”。
- [ ] 有码女优等带图片索引，图片和名字不串卡。
- [ ] `26.08.21.Dace` 磁力 4 页不再全部显示 `[javlist.me]`；至少应显示番号资源名/大小/日期中的有效信息。
- [ ] 磁力页全部/字幕/高清筛选正常；按大小/按日期排序正常。
- [ ] 点击复制与长按四个云盘合同不退化。
- [ ] 有码/欧美/国产/无码首页、详情、预览和 Shared JAV Playback 不因 Test4 回退。

## 禁止回退
- 禁止再只把 9 个标签索引当成“完整分类”。
- 禁止把 `/t/<hash>` 当成无关链接过滤掉；当前原站索引和专题大量依赖它。
- 禁止写死 `/t/` hash、无码 other hash、年份/tag hash。
- 禁止把 `[javlist.me]` 作为磁力有效标题。
- 禁止用全页宽上下文扫描磁链元数据；必须优先局部资源块。
- 禁止原地覆盖已发布 Test；任何实机修复继续新 Build。
