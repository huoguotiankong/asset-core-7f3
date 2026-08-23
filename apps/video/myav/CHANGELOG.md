# MyAv Changelog

> 程序级长期技术记忆。开发前必须先读全局项目文档、仓库迁移规范、`registry.json`、本文件、当前 Test/Release/Bootstrap/Shell 和用户最新实机结果。

## 当前基线（2026-08-23 13:31）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.11` / Build `10111`
- Shell Rule Version：`2026082321`
- Shell：`apps/video/myav/myav_remote_test_v11_b10111.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v11_b10111.js`
- Release：`apps/video/myav/releases/0.1.0-test.11/release.json`
- Stable：未建立，必须继续经过海阔实机回归。
- 数据源：`https://javlist.me/`
- Shared JAV Playback Stable：`1.0.0-test.4`，Provider：MissAV / 123AV / Jable。
- 云仓 MyAv 图标：`https://thumbsnap.com/i/uc3CZiMx.jpg`。

## 2026-08-23 · Test10 实机结果 → Test11
### 实机事实
- Test10 已进入所谓完整筛选模式，但用户实机截图仍只显示 21 个年份、22 个标签，且“玩法”整组缺失；这与原站 `default.cpp?Ttype=2` 网页中从 2026 到 1981 的长年份列表、大量标签和玩法选项明显不一致。
- 截图中 `2026` 已处于选中状态，说明当前 `myav_filter_url_normal` 已经是某个筛选结果 URL，而 Test10 又直接从该结果 URL 的 HTML 重建筛选控制区。
- 原站筛选结果页会退回精简控制区，因此即使初始入口使用 `Ttype=2`，只要选择年份/标签后再从结果页解析控件，就会重新缩成简版。
- 所以 Test10 的核心错误不是 UI 截断，也不是人为限制数量，而是“筛选结果数据源”和“完整筛选控制数据源”错误地绑定为同一个 URL。

### Test11 修复
- 高级筛选拆成两条独立链：
  - 结果 URL：继续保存并请求用户当前实际选择的年份/标签/玩法条件，用于影片列表和分页。
  - 控制 URL：从当前结果 URL 派生，保留其余 query 参数，但强制 `Ttype=2`，只用于重建完整筛选控制区。
- 新增 `C.asFullFilterUrl(url)`：若 URL 已有 `Ttype=1/2/...`，统一替换为 `Ttype=2`；没有则追加 `Ttype=2`，不丢失当前其它筛选条件。
- 新增 `C.fullFilterControl(resultUrl)`：先普通请求完整控制 URL；若年份 `<30`、标签 `<40` 或玩法 `<8`，说明仍疑似精简 HTML，再调用 `fetchCodeByWebView` 对应的 `C.fetchRendered()` 获取渲染后 DOM。
- 普通 HTML 与 WebView DOM 都解析为五组数据，并按年份/标签/玩法等数量评分，选择信息更完整的一份；不会因为 WebView 返回更短页面而盲目覆盖普通结果。
- 选择年份/标签后，控制区仍从强制 `Ttype=2` 的同条件页面读取，因此完整标签不会再因结果页切换而退回 22 项。
- 欧美 / 国产 / 无码仍使用各自原站筛选逻辑，不把有码 Ttype=2 强套过去。
- Test10 详情资料净化、影片/演员收藏独立排版，Test9 九类索引兜底，Test8 排行榜排版，Test7 中性导入壳均继续保留。

### Test11 发布自检
- Test11 Core/UI 已本地 `node --check` 通过。
- Release 在 Test10 基础上追加 `fullFilterControlPatch11` 和 `uiPatch11`，Previous 指向 Test10，可完整回退。
- Shell Rule Version：`2026082321`，Bootstrap 最低 Build：`10111`。
- 发布共享索引时遇到一次并行 GitHub head 冲突，第一次 registry 写入被 GitHub 409 拒绝，没有覆盖并行更新；重新读取后按最新 ACFun Web3 / 汤头条 Test14 基线成功写入。
- 根 `manifest.json` / `manifest_meta.json` 发布 revision：`202608231331`；云仓 MyAv 图标继续使用用户指定地址。

## 2026-08-23 · Test9 实机结果 → Test10
### 实机事实
- Test9 九类索引兜底方向有效，但影片详情 `MCY-0233` 的“系列/演员”等区域混入 `秘密入口 / 福利百科 / 广告合作联系 / javpk.com` 等站点导航词。
- 根因不是数据源真的返回这些影片元数据，而是旧 `linksBetween()` 在字段终止标记缺失或页面结构变化时会跨出影片资料区继续扫描全页导航。
- 用户要求影片收藏与演员收藏排版分别设置，不能继续共用 `myav_layout_favorites`。
- 用户实机提供完整高级筛选入口：`https://javlist.me/default.cpp?Ttype=2`。
- 原站完整筛选页实机截图确认至少存在：年份、标签、玩法，并有大量 Test1 旧筛选页未完整呈现的选项。

### Test10 修复
- 详情元数据 Parser 改为“影片资料区作用域”：从番号/发布时间附近开始，到故事简介/预览/磁力等详情边界前结束。
- 导演 / 片商 / 系列 / 类别 / 演员 / 男演员 / TAG 只接受资料作用域中的 MyAv 站内实体链接 `/t/`、`/t3/`、`/t4/` 等，不再把全站导航或外部链接当影片标签。
- 如果某字段原站当前没有可靠实体链接，宁可不显示，也禁止用页面导航补假数据。
- 收藏布局拆分：
  - 影片收藏：`myav_layout_favorites_movies`
  - 演员收藏：`myav_layout_favorites_actors`
  - 两者分别支持 2列 / 3列，互不影响。
- `layoutReset()` 同时清理排行榜、影片收藏、演员收藏新增布局 key。
- 有码高级筛选根入口固定使用用户实机确认的 `default.cpp?Ttype=2`。
- 完整筛选按五组呈现：分类 / 年份 / 标签 / 玩法 / 资源状态；Test11 已修正“从筛选结果页重建控制区会重新精简”的后续问题。
- 欧美 / 国产 / 无码继续使用各自原站入口，不拿有码 Ttype=2 强套其它频道。
- Test9 九类索引兜底、Test8 排行榜 2/3 列、Test7 中性导入壳、磁链和 Shared Playback 全部保留。

## 2026-08-23 · Test8 实机结果 → Test9
### 九类标签索引完整兜底
动态导航始终优先；只有发现失败才使用以下当前站点兜底：
- 有码片商：`https://javlist.me/cat.py?type=rpCNLOP1WDRnR2LjHsExtQ==`
- 有码女演员：`https://javlist.me/cat.py?type=0TActtgu02YfLieZ7SleLw==`
- 男演员：`https://javlist.me/cat.py?type=a3oteztILfkYtQWe89XV3w==`
- 有码TAG：`https://javlist.me/cat.py?type=6Wvt3eOMji5M_tHU6HuewA==`
- 欧美片商：`https://javlist.me/western_cat.java?type=WBvfQ1QROghlcRTERGmhww==`
- 欧美女演员：`https://javlist.me/western_cat.java?type=0TActtgu02YfLieZ7SleLw==`
- 欧美TAG：`https://javlist.me/western_cat.java?type=6Wvt3eOMji5M_tHU6HuewA==`
- 国产女演员：`https://javlist.me/domestic_cat.py?type=0TActtgu02YfLieZ7SleLw==`
- 国产TAG：`https://javlist.me/domestic_cat.py?type=6Wvt3eOMji5M_tHU6HuewA==`

### 架构规则
- 九类入口集中维护在 Core `indexFallbacks`，演员库和分类中心共用同一份映射。
- 分类中心固定展示完整九类，不再依赖 `menuGroups().tags` 是否抓全。
- 索引钻取继续复用 `myavIndexList → parseIndexEntries → /t/ 实体页`，禁止复制另一套 Parser。

## 2026-08-23 · Test7 实机结果 → Test8
- Test7 已能正常导入，说明中性 Shell 解决 Test6 “包含违禁词 / 禁止导入”问题。
- 排行榜 TOP20 / 周榜 / 月榜可正常获取真实作品。
- Test8 新增独立 `myav_layout_rankings`，排行榜默认双列，可切 2列 / 3列。
- 有码女演员入口首次采用“动态发现优先 + 当前站点兜底”，并由实机验证可恢复。

## 2026-08-23 · Test6 导入风险 → Test7
- Test6 首次把高风险站点术语直接写入导入 Shell 页面名称，海阔提示“风险级别：禁止导入 / 包含违禁词”。
- Test7 只修导入层，不破坏业务层：Shell 使用中性 `演员库`、`资源列表`、分组 `②视频`。
- 云仓公开可见描述也使用中性演员命名。
- 如果后续再触发风险，不得继续盲猜删业务代码，必须确认平台实际扫描范围。

## 当前产品能力
### 首页 / UI
- 首页核心入口：搜索、筛选、演员库、分类、排行、收藏、历史、设置。
- 首页、搜索结果、演员索引、排行榜、实体作品、影片收藏、演员收藏均可独立选择 2列 / 3列。
- 同级频道、筛选、排行、搜索类型、磁链筛选/排序、实体筛选必须 `putMyVar → refreshPage(false)`，禁止制造返回栈。

### 搜索
- 有码 / 欧美 / 国产使用原站真实搜索表单协议。
- 输入框使用短提示，避免占位文字挤压实际输入区域。
- 最近搜索本地保存、去重、可复搜和清空。
- 演员中心与影片关键词搜索保持分离；没有确认全站演员搜索协议前，不把“当前页姓名过滤”伪装成全局搜索。

### 演员 / 片商 / TAG 实体页
- `/t/`、`/t3/`、`/t4/` 等实体 URL 使用统一实体页：头像/名称/作品数/原站资源筛选/真实分页作品流。
- 详情中的演员、男演员、片商、TAG 跳转携带真实实体类型。
- 演员可独立本地收藏。

### 本地数据
- 影片收藏：`hiker://files/rules/MyAv/favorites.json`
- 演员收藏：`hiker://files/rules/MyAv/actor_favorites.json`
- 浏览历史：`hiker://files/rules/MyAv/history.json`
- 读取：`fetchPC()`；写入：`writeFile()`。
- 收藏主键使用真实详情/实体 URL，不保存 Cookie、Token 或账号隐私。

## 已验证解析基础
### 图片链（Test2）
- lazy-load 优先：`data-original → data-src → data-lazy-src → data-lazy → data-url → data-echo → data-cover → data-ks-lazyload → data-thumb → src → srcset/style`。
- 过滤 placeholder/loading/blank/spacer/transparent/noimage/default/favicon/logo/avatar。
- 详情封面：`og:image/twitter:image → image_src → JSON-LD image → 详情首屏 → 全页评分兜底`。
- Test2/3 实机已验证真实封面恢复。

### 多频道（Test3）
- 有码：`default.cpp`，详情 `/c/<opaque>`。
- 欧美：`western.java`，详情 `/c4/<opaque>`。
- 国产：`domestic_index.js`，详情 `/c3/<opaque>`。
- 无码：有码页面上的动态筛选链接，不写死 hash。

### 分类 / 磁链（Test4）
- `cat.py` 索引正文大量使用 `/t/<opaque>`，Parser 必须保留实体 URL。
- `SONE-350` 已实机验证可恢复 19 条磁链及大小/日期/字幕/高清信息。
- 磁链支持全部/字幕/高清筛选，以及默认/大小/日期排序。
- 磁链标题优先读取 magnet `dn=`，无标题再读取局部资源块，禁止显示 `[javlist.me]` 垃圾标题。

## 磁力长按跨小程序合同
1. 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
2. PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encodeURIComponent(magnet)>`
3. 123云盘：`hiker://page/diaoyong?rule=123云盘&page=fypage&realurl=<encodeURIComponent(magnet)>`
4. 光鸭云盘：`hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>`
5. 复制磁力。

## 发布与风险规则
- 新版本禁止原地覆盖旧 Test；任何修复必须新 Build。
- 手机“我的规则仓库”读取根 `manifest.json`；`manifest_meta.json` revision 必须同步。
- 固定发布链：`Release → Bootstrap → Shell → test.json → channels.json → app manifest → registry → root manifest → manifest_meta → main 回读 → 实机导入`。
- 总索引更新后必须检查其它程序未被旧快照覆盖，并检查云仓卡片 `version/desc/path/entryType/channelsPath/categoryName/subCategory`。
- 原站专用高风险术语尽量留在远程运行时解析层，导入 Shell 和云仓可见元数据优先使用中性产品命名。

## Test11 待实机确认
- [ ] MyAv Test11 / Build10111 可正常导入。
- [ ] 高级筛选即使已经选中 2026，年份数量也应明显高于 Test10 的 21 项，并接近原站完整年份区。
- [ ] 标签数量应明显高于 Test10 的 22 项；若 WebView DOM可取得完整原站结构，应恢复原站大量标签。
- [ ] “玩法”分组必须出现，不再整组缺失。
- [ ] 点击任意年份/标签/玩法后，完整控制区仍保持，不因结果 URL 改变退回精简模式。
- [ ] 筛选结果影片列表与分页正常，不因控制 URL 使用 Ttype=2 而被错误替换。
- [ ] Test10 详情资料净化、双收藏排版、Test9 九类索引、排行榜、磁链和 Shared Playback 不退化。
