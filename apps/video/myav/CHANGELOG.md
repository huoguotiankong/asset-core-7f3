# MyAv Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档与仓库迁移基线，再读本文件、`registry.json`、当前 Test/Stable/Release/Bootstrap/Shell 和用户实机结果。未完成海阔实机验证的内容必须标记“待确认”。

## 当前基线（2026-08-23）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.5` / Build `10105`
- Shell：`apps/video/myav/myav_remote_test_v5_b10105.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v5_b10105.js`
- Release：`apps/video/myav/releases/0.1.0-test.5/release.json`
- Release 链：Test1 Core → Test2 图片 Patch → Test3 多频道 Patch → Test4 分类/磁链 Patch → Test5 实体页 Patch → Test1 Runtime → Test2 Runtime Patch → Test3 UI → Test4 UI → Test5 UI → Shared JAV Playback Stable。
- 图标：`apps/video/myav/assets/icon.svg`；工具图标：`search/filter/category/rank/favorite/history/more/settings/magnet/preview.svg`。
- 数据源：`https://javlist.me/`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- Shared JAV Playback Stable：`1.0.0-test.4` / MissAV + 123AV + Jable
- Stable：尚未建立；必须完成 Test5 实体页/搜索/Home UI 实机回归后才允许晋级。

## 2026-08-23 · Test4 第四轮实机结果 → Test5
### 已确认
- **磁力页重构有效**：`SONE-350` 实机可恢复 19 条资源，并显示真实大小/日期，例如 `6.19GB · 2024-09-29`、`5.88GB · 2024-09-15`、`9.47GB · 2024-09-07`；字幕/高清标签可识别，`[javlist.me]` 垃圾标题已消失。
- 磁力页“全部 / 字幕 / 高清”和“默认 / 大小 / 日期”同页状态区已经能渲染；点击复制和长按云盘合同保持。
- **`/t/` 索引钻取修复有效**：例如 `川越にこ` 已能从女优索引进入真实作品列表并显示影片封面/番号，证明 Test4 不再错误过滤 `/t/<hash>`。
- 原站完整菜单读取基本成立：用户实机网页截图可见“标签分类 / 有码热门 / 片商新番 / 排行榜 / 搜索”等菜单及子项。

### 第四轮继续暴露的产品问题
1. **搜索输入框占位文字过长**：Test4 仍显示“输入番号 / 标题 / 演员 / 片商 / TAG”这类长绿色 title/hint，Android 原生输入控件右侧被文字占据，实际可输入区域明显过窄。
2. **Home 第二排工具视觉不统一**：搜索/筛选/分类/排行已有图标，但收藏/历史/更多/设置仍需要统一成图标入口。
3. **分类虽然能钻取，但原站实体页信息仍缺失**：当前 `/t/` 女优、片商、TAG 等被当成普通影片列表，缺少原站实体页的头像/名称/作品数/资源筛选。
4. 用户提供的原站女优页实机截图显示：女优头像、名字、`[459作品]`、筛选 `全部 / 磁力 / 字幕 / 单体 / 无码破解`、分页和双列作品流。MyAv 原生页需要还原这类结构，而不是只显示“某女优 · MyAv 原站筛选结果”。

### Test5 修复
#### 搜索输入
- `input` 的 title 不再塞长提示；空输入时只依赖短 hint：`输入关键词`。
- 支持范围 `番号 / 标题 / 演员 / 片商 / TAG` 移到输入框下面独立说明，不再占用输入区域。
- 有码 / 欧美 / 国产仍为同级 `putMyVar → refreshPage(false)`，不新增返回栈。
- 搜索结果统一使用双列 `movie_2` 卡片，与首页视觉一致。

#### Home 图标统一
- 第一排：搜索 / 筛选 / 分类 / 排行。
- 第二排：收藏 / 历史 / 更多 / 设置。
- 新增仓库自有 `history.svg / more.svg / settings.svg`；收藏继续使用 `favorite.svg`。
- 八个工具均使用 `icon_small_4`，不再混合图标按钮与纯文字按钮。

#### `/t/` 原生实体页
- `myavList` 在 URL 属于 `/t/`、`/t3/`、`/t4/` 等实体族时自动进入实体页模式；普通影片列表仍复用既有 List，不影响热门/片商专题等稳定页面。
- 索引页进入 `/t/` 条目时同时传递父索引类型：女优 / 男优 / 片商 / TAG；女优等带头像索引还传递真实图片作为实体头像首选。
- 实体页头部：头像 + 名称 + 作品数 + 实体类型。
- 作品数从原站当前页面动态解析 `xxx 作品`，不写死。
- 原站实体页筛选动态解析：`全部 / 磁力 / 字幕 / 单体 / 无码破解`；只使用原站真实 href，不伪造 filter hash。
- 每个实体使用独立状态 key，切换筛选只刷新当前页；不同女优/片商之间不会串筛选状态。
- 实体作品流使用双列海报并继续使用原站真实分页模板。
- 从分类索引进入女优、从详情演员/片商/TAG 进入 `/t/`，都由 `R.list()` 自动识别实体 URL，因此后续不需要每个入口单独复制实体页逻辑。

### Test5 synthetic smoke
- synthetic 女优页：`天海つばさ [459作品]` → 正确得到 `count=459`、`typeLabel=女优`。
- 筛选：正确恢复 `全部, 磁力, 字幕, 单体, 无码破解` 五项。
- 索引传入真实头像时，实体页优先使用索引头像，避免全页图片扫描误把首个作品封面当女优头像。

## 2026-08-23 · Test3 第三轮实机结果 → Test4
### 已确认
- Test3 UI 相比 Test2 明显改善：首页/详情进入产品化结构，详情 Hero、信息芯片、在线播放、磁力/预览/收藏/原站快捷动作、简介和资料分组均可正常渲染。
- 欧美条目详情已正常工作，例如日期式编号 `26.08.21.Dace` 能显示真实封面、标题、日期、磁力 4、预览 14 和简介。
- 有码条目详情继续正常，例如 `START-613` 可显示真实封面、番号/日期/时长、MissAV/123AV/Jable、磁力 10、预览 21 和原站预览。
- 说明 Test2 图片链 + Test3 `/c /c3 /c4` 多详情族修复均有效。

### 第三轮根因与 Test4 修复
- Test3 磁力标题经常只有 `[javlist.me]`；Test4 改为 magnet `dn=` 优先，局部 `tr/li/p/div` 资源块兜底，并恢复大小/日期/字幕/高清。
- Test3 只把 9 个标签索引当“分类”；Test4 分类中心补齐资源频道、标签分类、有码热门、片商新番、排行榜和三类搜索。
- `cat.py` 索引正文大量使用 `/t/<opaque>`；旧 Parser 主动排除了 `/t/`，Test4 正式允许 `/t/` 并限制扫描在索引正文首尾分页之间。
- 女优等索引带真实图片时使用双列图片卡；纯文本索引使用紧凑按钮。
- 磁力页增加：全部/字幕/高清筛选 + 默认/大小/日期排序；状态切换均原页 refresh。

## 当前原站导航事实（2026-08-23）
- 分类：有码 / 欧美 / 国产 / 无码 / FC2磁力查询 / 视频在线 / 18H次元漫画 / 韩漫 / 小说。
- 标签分类：有码片商 / 有码女优 / 男优 / 有码TAG / 欧美片商 / 欧美女优 / 欧美TAG / 国产女优 / 国产TAG。
- 有码热门：单体作品 / 最佳女优 / 漫画改编 / 新人出道 / 无码破解 / 巨乳 / 辣妹 / 熟女 / 人妻 / 大屁股 / 超乳 / 巨大的根 / 猫耳 / 全部标签。
- 片商新番：MOODYZ / Madonna / kawaii / 本中 / Fitch / OPPAI / S1 / Hunter / E-BODY / Attackers。
- 排行榜：独立入口。
- 搜索：有码查询 / 欧美查询 / 国产查询。
- 有码女优索引当前为超大分页（实机原站显示最大页 561），不能只做第一页或静态名单。
- 女优实体页存在头像、作品数量、资源筛选、分页作品流；Test5 起正式作为独立产品结构处理。

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

### 分类 / 磁链 · Test4
- 分类中心使用当前原站菜单树，不写死 `/t/<hash>`。
- 索引允许 `/t/` 实体链接，原站分页继续动态读取。
- 磁链标题过滤 `[javlist.me]`；大小、日期、字幕、高清从局部资源块恢复。
- 磁力点击复制；长按合同保持：迅雷 / PikPak / 123云盘 / 光鸭 / 复制。

## 第三方播放
- MyAv 不复制 Provider Parser，统一复用 `shared/jav-playback/manager.js` Stable。
- 当前 SDK：`1.0.0-test.4`；Provider：MissAV / 123AV / Jable。
- 番号型 JAV 条目显示共享播放；欧美/国产编号体系不同，默认不强行提交，避免制造假失败。

## 收藏 / 历史
- 收藏：`hiker://files/rules/MyAv/favorites.json`
- 历史：`hiker://files/rules/MyAv/history.json`
- 读取使用 `fetchPC()`，写入使用 `writeFile()`。
- 收藏主键为真实详情 URL；不保存 Cookie/Token。

## UI / Navigation 硬约束
- 普通 title/desc 使用纯文本，不依赖 `<font>/<b>`。
- 首页频道、筛选、排行、搜索类型、磁链筛选/排序、实体页筛选全部属于同级状态更新，使用 `putMyVar → refreshPage(false)`。
- 列表→详情、索引→实体页、详情→磁力/预览才创建真正钻取页面。
- 第三方播放为 Primary Action；磁力/预览/收藏/原站为工具动作。
- 无数据显式显示空状态，禁止制造假卡片或假成功。

## 云端仓库发布链
- 手机“我的规则仓库”读取根 `manifest.json`，不是 `registry.json`。
- `manifest_meta.json` revision 必须与根 manifest 同步，否则设备可能继续使用旧目录缓存。
- 发布新 Test 固定检查：`Release → Bootstrap → Shell → test.json → channels.json → app manifest → registry → root manifest → manifest_meta → GitHub main 回读 → 实机导入`。
- 并行任务可能同时推进其它程序；更新 registry/root manifest 前必须重新读取 main，并保留 ACFun、汤头条等最新状态，禁止旧快照覆盖。
- Test5 发布前读取到并保留：ACFun `1.0.0-alpha9`、汤头条 `0.1.0-test.10`。

## Test5 静态门禁
- [x] Test5 `core_patch.js` `node --check`。
- [x] Test5 `ui_patch.js` `node --check`。
- [x] Test5 Bootstrap `node --check`。
- [x] Test5 Release JSON parse，模块数 11，Build10105。
- [x] Test5 Shell 外层 JSON parse，Rule Version `2026082315`；pages JSON 可解析。
- [x] synthetic entity smoke：459作品 / 女优类型 / 五类资源筛选 / 索引头像优先。
- [x] Test4 磁链 UI 未被 Test5 覆盖；Test5 只覆盖 Home/Search/IndexList/List/Settings 和实体 Metadata。
- [ ] 海阔 Test5 实机实体页/Search/Home 回归。

## Test5 实机回归重点
- [ ] Search 输入框不再被长绿色提示挤占，能舒适输入关键词。
- [ ] 首页八个工具均显示图标：搜索/筛选/分类/排行/收藏/历史/更多/设置。
- [ ] 有码女优 → 任意女优：进入后显示女优头像、名字、作品数、资源筛选、双列作品。
- [ ] 女优页“全部 / 磁力 / 字幕 / 单体 / 无码破解”至少随机测试 3 个筛选能原页切换。
- [ ] 女优页翻页正常；从影片详情中的演员再进入 `/t/` 也能进入实体页。
- [ ] 随机测试一个片商和一个 TAG，实体页结构不退化；无头像实体允许使用 MyAv 图标/当前可用图片兜底。
- [ ] Test4 SONE-350 磁链 19 条、大小/日期/字幕高清、复制/长按不退化。
- [ ] 有码/欧美/国产/无码首页、详情、预览和 Shared JAV Playback 不因 Test5 回退。

## 禁止回退
- 禁止再只把 9 个标签索引当成“完整分类”。
- 禁止把 `/t/<hash>` 当成普通无状态列表；女优/男优/片商/TAG 属于实体页语义。
- 禁止写死 `/t/` hash、无码 other hash、年份/tag hash、实体筛选 hash。
- 禁止把 `[javlist.me]` 作为磁力有效标题。
- 禁止把长功能说明塞进原生 `input` title/hint 挤压用户输入空间。
- 禁止 Home 同一层混用四个图标工具 + 四个灰色纯文字工具。
- 禁止原地覆盖已发布 Test；任何实机修复继续新 Build。
