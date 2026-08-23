# MyAv Changelog

> 程序级长期技术记忆。开发前必须先读全局项目文档、仓库迁移规范、`registry.json`、本文件、当前 Test/Release/Bootstrap/Shell 和用户最新实机结果。

## 当前基线（2026-08-23 13:20）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.10` / Build `10110`
- Shell Rule Version：`2026082320`
- Shell：`apps/video/myav/myav_remote_test_v10_b10110.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v10_b10110.js`
- Release：`apps/video/myav/releases/0.1.0-test.10/release.json`
- Stable：未建立，必须继续经过海阔实机回归。
- 数据源：`https://javlist.me/`
- Shared JAV Playback Stable：`1.0.0-test.4`，Provider：MissAV / 123AV / Jable。
- 云仓 MyAv 图标：`https://thumbsnap.com/i/uc3CZiMx.jpg`。

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
- 有码高级筛选根入口固定使用用户实机确认的 `default.cpp?Ttype=2`；旧缓存若仍是普通 `default.cpp` / `Ttype=1`，进入筛选时自动切换到完整模式。
- 完整筛选按五组呈现：分类 / 年份 / 标签 / 玩法 / 资源状态；每组读取当前页面全部真实链接，不做人为数量截断。
- 欧美 / 国产 / 无码继续使用各自原站入口，不拿有码 Ttype=2 强套其它频道。
- Test9 九类索引兜底、Test8 排行榜 2/3 列、Test7 中性导入壳、磁链和 Shared Playback 全部保留。

### Test10 发布自检
- Test10 Core/UI/Bootstrap 已在本地 `node --check` 通过；Release JSON、Shell 外层 JSON 与 15 个 pages 也通过静态解析。
- 根云仓首次写 Test10 后，写后自检发现 JavBus/MyAv 卡片 `categoryName/subCategory` 被整文件更新压成单层；已立即恢复：`categoryName=视频`、`subCategory=影视资料`。
- 根 `manifest.json` 与 `manifest_meta.json` revision 同步到 `202608231320`。
- 发布时保留并行最新状态，包括 ACFun Web2、汤头条 Test13；禁止用旧总索引覆盖其它程序。

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

## Test10 待实机确认
- [ ] MyAv Test10 / Build10110 可正常导入。
- [ ] `MCY-0233` 等详情页不再出现秘密入口、福利百科、广告合作联系、javpk.com 等导航垃圾词。
- [ ] 真实片商/演员/TAG 仍能显示并进入实体页。
- [ ] 设置中“影片收藏”和“演员收藏”分别有独立 2列 / 3列。
- [ ] 高级筛选有码页完整显示分类 / 年份 / 标签 / 玩法 / 资源状态，标签数量明显接近原站 `Ttype=2` 页面。
- [ ] 点击任意年份/标签/玩法后仍在当前筛选页刷新且影片列表正常。
- [ ] Test9 九类索引、排行榜排版、磁链和 Shared Playback 不退化。
