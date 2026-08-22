# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实，未完成实机验证的内容必须明确标记。

## 当前基线
- 程序：麻豆AI
- App ID：`mdai`
- Remote Stable：`2.6.3 / Build 26301 / Shell 1.0.0`
- Remote Test：`2.7.0-test.2 / Build 27002 / Shell 1.1.1-test`
- Local：`2.6.3-local.1`
- Stable 入口：`apps/video/mdai/mdai_remote_v1.txt`
- Test 入口：`apps/video/mdai/mdai_remote_test_v3.txt`
- Local 源码：`mdai.txt`
- Local 导入规则名：`麻豆AI 本地版`
- Stable 状态：2.6.3 已实机验证，继续冻结作为恢复基线。
- Test 状态：Test1 已完成首轮片库实机截图评审并发现分类/排版/页面栈问题；Test2 已发布修复，等待下一轮实机验证。

## 当前运行链
### Stable
```text
麻豆AI Stable Shell
→ bootstrap_v1.js
→ Remote Manager v2.0.1 / state id=mdai
→ releases/2.6.3/release.json
→ 已验证 2.6.3 immutable runtime/source snapshot
```

### Test 2.7.0-test.2
```text
麻豆AI Test Shell v3（7 个独立 page path）
→ bootstrap_test_v3.js / state id=mdai-test / minBuild=27002
→ Remote Manager v2.0.1
→ releases/2.7.0-test.2/release.json
→ core.js              复用 Test1 / Stable 2.6.3 协议数据桥
→ playback.js          复用 Test1 PlaybackAdapter
→ ui_base.js           复用 Test1 Native Design System
→ pages_content.js     Test2：片库 CatalogAdapter + 原页状态切换
→ pages_detail.js      复用 Test1 Detail / Settings
→ runtime.js           Test2 组合并导出 mdai
```

- Stable 2.6.3、Local 2.6.3、PlaybackAdapter、详情页和协议层本轮均未修改。
- Test Remote Manager 状态 ID 仍为 `mdai-test`；新 Shell 规则数值 version `2026082214`，Bootstrap `minBuild=27002`，确保覆盖导入后不会继续命中 Test1。

## 2.7 Product / UI Blueprint
页面地图：
- Home：搜索 → 短剧/最新/原创/国产/社区主栏目 → 片库/收藏/历史/设置四个快捷入口 → 主内容 Feed。
- Library：视频/短剧同一片库切换；视频为固定一级栏目 → CatalogAdapter 主题分类 → 高级筛选 → 内容结果；所有筛选在当前页刷新。
- Search：独立输入、热门搜索、最近搜索、结果。
- Mine：收藏/历史独立页面，可与首页内容区解耦。
- Detail：Hero → Primary Play/Continue → Favorite/Comment/Library → Intro → Episodes → Related。
- Settings：体验 / 播放 / 网络分组，工程信息后置。
- Comments：头像/时间/正文分层，不阻塞详情与播放。

UI 关键规则：
- 普通视频以 `movie_2` Feed 为主；短剧竖封面使用 `movie_3`；短剧详情 Hero 优先 `movie_1_vertical_pic_blur`；普通视频详情使用 `movie_1_left_pic`。
- 二级页统一 `hiker://page/<path>?rule=&simple=true`，避免沉浸式标题栏叠加。
- 关键内容 ID/type/title/cover 放入 URL query；不再把跨页正确性只押在 `extra`。
- 片库内部分类/排序/筛选禁止继续返回 `hiker://page/...` 创建新页面；统一使用 `lazyRule → putMyVar/clearMyVar → refreshPage(false)` 原页切换。
- 视频一级栏目改用固定 `text_3` 等宽三栏，避免 `scroll_button` 在窄屏出现 `>` 溢出入口。
- 主题分类使用 `flex_button`；高级筛选固定 `text_4` 四栏：默认 / 近1月 / 20分+ / 点赞。
- 选中态只保留浅色背景，不再叠加 `““...””` 富文本高亮，避免实机出现蓝底红字。

## CatalogAdapter 2.7.0-test.2
### Test1 实机问题
用户 2026-08-22 实机截图确认：
- `原创 / 国产 / 字幕` 使用 `scroll_button`，右侧出现无意义 `>` 溢出入口。
- 动态子分类存在缺项、顺序混乱的问题。
- 点击一级/二级分类会持续打开新的 `mdaiLibrary` 页面，返回栈不断加深。
- Test1 片库顶部层级偏杂乱，选中态出现高饱和背景 + 红字，视觉不统一。

### 根因
- Test1 `library()` 直接使用 `U.page('mdaiLibrary',{...})` 作为分类按钮 URL，筛选本质上是页面导航而不是当前页状态变更。
- Stable 2.6.3 `getCategories()` 的策略是“动态接口只要非空就完全替换 fallback”；接口偶发少项时，已验证分类会从 UI 消失，接口排序/menuId 波动也会直接传到 UI。

### Test2 修复
- 新增页面级 `CatalogAdapter`：
  - 已验证分类 ID / 一级归属 / UI 顺序作为稳定骨架。
  - 动态接口同 ID 数据只补充当前名称/状态等字段，不改变已验证一级归属与基本顺序。
  - 动态新增且 `menuId=1~3` 的真实分类仍会追加，避免退化成纯白名单。
  - 接口少返回某个已验证分类时，该分类仍保留，不再凭一次动态响应消失。
- 片库状态键：
  - `mdai_library_type_v271`
  - `mdai_library_menu_v271`
  - `mdai_library_cat_v271`
  - `mdai_library_drama_sort_v271`
- 视频/短剧、一级栏目、主题分类、短剧排序、高级筛选全部原页 `refreshPage(false)`。
- 首页“热门追剧/频道更多/分类更多”只在进入片库时打开一次页面，并先写入片库状态；进入后不再继续压新页面。

待实机确认：
- [ ] 片库顶部不再出现 `>` 溢出入口。
- [ ] 原创栏目稳定显示 11 个已验证分类；国产 10 个；字幕 2 个；动态新增分类可正常追加。
- [ ] 点击 视频/短剧、原创/国产/字幕、任一主题、任一高级筛选时均停留当前片库页。
- [ ] 连续切换 10 次筛选后按返回键只退出一次片库，而不是逐层返回多个片库页。
- [ ] 浅色选中态在实机上可读且不再出现蓝底红字。

## PlaybackAdapter 2.7
播放职责从原 God Object 中拆出：
```text
详情/选集媒体字段
→ collect + normalize
→ PlaybackAdapter
→ PlayModel
→ 海阔播放器
```

当前已知站点事实继续沿用 Stable 2.6.3：
- 默认 Host：`https://mdcmai4.xyz`。
- 媒体字段候选：`videoUrl / m3u8Url / hlsUrl / playUrl / sourceUrl / src / url`。
- 站点稳定代理：`/api/v1/m3u8/proxy?path=`。
- 播放请求依赖 `Referer = <host>/media/` + 当前 UA。

2.7 Test 新策略：
- `smart`：默认，稳定代理为主线路 + 原始直链为第二线路，标准 `PlayModel {urls,names,headers}`。
- `direct`：原始直链优先 + 稳定代理备用。
- `proxy`：只走站点稳定代理。
- `compat`：显式兼容模式才调用 `cacheM3u8()`；不再把缓存塞进默认首播路径。
- 播放结果记录脱敏诊断到 `mdai_play_diag_v2`，当前可区分 `NO_SOURCE / play-model / compat-cache` 和策略/线路数量。

待实机确认：
- [ ] 普通视频 smart 首播。
- [ ] 短剧单集 smart 首播。
- [ ] 播放器可见双线路并可手动切换。
- [ ] 原始直连线路实际可播性。
- [ ] compat 仅在必要时启用且可用。
- [ ] 冷启动与二次播放行为。

## 数据/API与本地状态
- 视频/短剧/帖子主要使用 `/api/v1/` 接口。
- 短剧：`/api/v1/short-dramas/...`；视频：`/api/v1/videos/...`；评论：`/api/v1/comments...`。
- 历史：`mdai_watch_history_v1`
- 收藏：`mdai_favorites_v1`
- 搜索历史：`mdai_search_history_v1`
- 2.7 Core 快照缓存：`mdai_core_snapshot_263_v270`
- 2.7 播放策略：`mdai_play_strategy_v2`
- 2.7 播放诊断：`mdai_play_diag_v2`

## 回归与恢复
- Stable 2.6.3 / Local 2.6.3 本轮均不修改。
- 2.7 UI 大改没有完成实机截图闭环前不得晋级 Stable。
- 2.7 播放未完成普通视频 + 短剧至少两类实机回归前不得晋级 Stable。
- 如 Test 出现白屏/页面路由/播放回归问题，直接覆盖导入 Stable 2.6.3 或使用 `麻豆AI 本地版` 恢复。

---
## 版本记录
### 2.7.0-test.2 / 2026-08-22
- 根据 Test1 实机片库截图进行第二轮 UI 修复。
- 修复一级分类 `scroll_button` 窄屏溢出 `>`，改为等宽三栏。
- 新增 CatalogAdapter，合并已验证分类骨架与动态接口，修复动态接口少项导致分类缺失以及顺序/归属波动直接污染 UI 的问题。
- 分类/排序/筛选全部改为原页状态切换，修复每点一次分类就新增一个片库页面的通用页面栈 Bug。
- 视频/短剧统一进同一片库；短剧热播/最新也改为原页切换。
- 高级筛选压缩成四栏，选中态改浅色单一视觉信号。
- PlaybackAdapter、详情、协议层继续复用 Test1；Stable/Local 不变。
- 当前已发布 Test，等待实机片库截图与连续切换/返回栈验证。

### 2.7.0-test.1 / 2026-08-22
- 基于 Stable 2.6.3 数据/协议层开始产品级重构。
- 从单一大对象拆出 CoreBridge / PlaybackAdapter / UI Base / Content Pages / Detail Pages / Runtime。
- 首页、片库、搜索、我的、设置、评论变为独立产品页面；详情重新建立 Hero 与主操作层级。
- 播放改为标准 PlayModel，多线路 Header 一一对应；compat cache 从默认链降为显式备用。
- 新增播放策略与脱敏诊断状态。
- 首轮实机截图确认片库存在分类完整性、排版与连续开新页问题，已在 Test2 修复。

### 2.6.3 Stable / 2026-08-22
- 用户实机确认 `2.6.3-test.1 / Build 26301` 正常后原样晋级 Remote Stable。
- Local 保留完整本地代码，导入名固定为 `麻豆AI 本地版`。
