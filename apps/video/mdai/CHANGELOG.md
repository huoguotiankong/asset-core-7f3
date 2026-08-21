# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实，未完成实机验证的内容必须明确标记。

## 当前基线
- 程序：麻豆AI
- App ID：`mdai`
- Remote Stable：`2.6.3 / Build 26301 / Shell 1.0.0`
- Remote Test：`2.7.0-test.1 / Build 27001 / Shell 1.1.0-test`
- Local：`2.6.3-local.1`
- Stable 入口：`apps/video/mdai/mdai_remote_v1.txt`
- Test 入口：`apps/video/mdai/mdai_remote_test_v2.txt`
- Local 源码：`mdai.txt`
- Local 导入规则名：`麻豆AI 本地版`
- Stable 状态：2.6.3 已实机验证，继续冻结作为恢复基线。
- Test 状态：2.7.0-test.1 已发布，静态检查通过，等待海阔实机 UI 截图和播放回归。

## 当前运行链
### Stable
```text
麻豆AI Stable Shell
→ bootstrap_v1.js
→ Remote Manager v2.0.1 / state id=mdai
→ releases/2.6.3/release.json
→ 已验证 2.6.3 immutable runtime/source snapshot
```

### Test 2.7
```text
麻豆AI Test Shell v2（7 个独立 page path）
→ bootstrap_test_v2.js / state id=mdai-test / minBuild=27001
→ Remote Manager v2.0.1
→ releases/2.7.0-test.1/release.json
→ core.js              Stable 2.6.3 协议/数据桥
→ playback.js          PlaybackAdapter
→ ui_base.js           Native Design System / Model helpers
→ pages_content.js     Home / Library / Search / Mine / Comments
→ pages_detail.js      Detail / Settings
→ runtime.js           组合并导出 mdai
```

- 2.7 Test 从当前 Stable 向前开发，没有覆盖 Stable release。
- Shell 页面清单由 2 个扩展为 7 个，所以使用新 Shell `mdai_remote_test_v2.txt`、新 Bootstrap 路径和规则数值 version `2026082213`。
- Test Remote Manager 状态仍为 `mdai-test`，与 Stable `mdai` 隔离；`minBuild=27001` 防止旧 Test active state 继续命中 2.6.3-test.1。

## 2.7 Product / UI Blueprint
页面地图：
- Home：搜索 → 短剧/最新/原创/国产/社区主栏目 → 片库/收藏/历史/设置四个快捷入口 → 主内容 Feed。
- Library：短剧独立热播/最新；视频按主分类 → 动态子分类 → 结果组织，低频筛选不再占首页。
- Search：独立输入、热门搜索、最近搜索、结果。
- Mine：收藏/历史独立页面，可与首页内容区解耦。
- Detail：Hero → Primary Play/Continue → Favorite/Comment/Library → Intro → Episodes → Related。
- Settings：体验 / 播放 / 网络分组，工程信息后置。
- Comments：头像/时间/正文分层，不阻塞详情与播放。

UI 关键规则：
- 普通视频以 `movie_2` Feed 为主；短剧竖封面使用 `movie_3`；短剧详情 Hero 优先 `movie_1_vertical_pic_blur`；普通视频详情使用 `movie_1_left_pic`。
- 二级页统一 `hiker://page/<path>?rule=&simple=true`，避免沉浸式标题栏叠加。
- 关键内容 ID/type/title/cover 放入 URL query；不再把跨页正确性只押在 `extra`。
- 大量动态分类使用 `flex_button`；主栏目/少量排序使用 `scroll_button`；选集按 20~60 集分段，集数用 `text_4` 紧凑网格。
- 正式导航图标使用仓库自有 SVG assets，不让 Emoji 承担主导航。

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
- 视频/短剧/帖子主要使用 `/api/v1/` 接口；动态分类失败时保留 Stable fallback。
- 短剧：`/api/v1/short-dramas/...`；视频：`/api/v1/videos/...`；评论：`/api/v1/comments...`。
- 历史：`mdai_watch_history_v1`
- 收藏：`mdai_favorites_v1`
- 搜索历史：`mdai_search_history_v1`
- 2.7 Core 快照缓存：`mdai_core_snapshot_263_v270`
- 2.7 播放策略：`mdai_play_strategy_v2`
- 2.7 播放诊断：`mdai_play_diag_v2`

## 回归与恢复
- Stable 2.6.3 / Local 2.6.3 本轮均不修改。
- 2.7 UI 大改未拿到实机截图前不得晋级 Stable。
- 2.7 播放未完成普通视频 + 短剧至少两类实机回归前不得晋级 Stable。
- 如 Test 出现白屏/页面路由/播放回归问题，直接覆盖导入 Stable 2.6.3 或使用 `麻豆AI 本地版` 恢复。

---
## 版本记录
### 2.7.0-test.1 / 2026-08-22
- 基于 Stable 2.6.3 数据/协议层开始产品级重构。
- 从单一大对象拆出 CoreBridge / PlaybackAdapter / UI Base / Content Pages / Detail Pages / Runtime。
- 首页、片库、搜索、我的、设置、评论变为独立产品页面；详情重新建立 Hero 与主操作层级。
- 播放改为标准 PlayModel，多线路 Header 一一对应；compat cache 从默认链降为显式备用。
- 新增播放策略与脱敏诊断状态。
- 当前只发布 Test，静态 JS/JSON/Shell 解析已通过；等待用户实机截图与播放结果。

### 2.6.3 Stable / 2026-08-22
- 用户实机确认 `2.6.3-test.1 / Build 26301` 正常后原样晋级 Remote Stable。
- Local 保留完整本地代码，导入名固定为 `麻豆AI 本地版`。
