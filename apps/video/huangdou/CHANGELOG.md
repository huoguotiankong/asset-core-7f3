# 黄豆短剧 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，必须先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 当前基线
- App ID：`huangdou`
- Remote Stable：`1.8.2 / Build 18201 / Shell 1.0.0`（用户已实机验证，继续冻结）
- Remote Test：`1.9.0-test.3 / Build 19003 / Shell 1.1.2-test`
- Local：`1.8.2-local.1`
- Stable 入口：`apps/video/huangdou/huangdou_remote_v1.txt`
- Test 入口：`apps/video/huangdou/huangdou_remote_test_v4.txt`
- Local：`huangdou.txt`，导入名 `黄豆短剧 本地版`

## 当前 Test 运行链
```text
huangdou_remote_test_v4.txt / rule version 2026082217
→ bootstrap_test_v4.js / state id=huangdou-test / minBuild=19003
→ Remote Manager v2.0.1
→ releases/1.9.0-test.3/release.json
→ core.js          复用 1.9 Test1 / Stable 1.8.2 协议与 HTML Parser
→ ui_base.js       复用 Test2 跨页参数修复
→ playback.js      Test3：单线路 Token Direct
→ pages_content.js 复用 Test1 首页/片库/搜索/我的/专题
→ pages_detail.js  Test3：详情操作降噪、选集与剧集播放修复
→ runtime.js       Test3 组合导出
```

## 数据 / HTML / 图片事实
- 默认 Host：`https://hddj.tv`；备用：`https://hdmgdj.tv`、`https://huangdoudj.com`。
- 首页/分类/专题/详情主要解析 HTML；关键结构：`dm-card`、`dm-topic-card`、`dm-detail-*`。
- 列表封面读取 `img.dm-card-img@src`；详情封面优先 `dm-detail-poster img.src`，再用 `og:image`。
- 站点播放协议已由 Stable 1.8.2 实机验证：
```text
POST /account/guest
→ GET /play/token?r=<id>&s=<ep>
→ JSON.t
→ /play/<id>/<ep>.m3u8?t=<token>#isVideo=true#
```

## 路由事故与固定规则
### 1.9.0-test.1 二级页 URL 冲突
实机报错：`ArticleListModel-HttpRequestError` / `Expected URL scheme 'http' or 'https' but no colon was found`。

根因：业务详情地址放进 `hiker://page/...&url=...`，`url` 与海阔页面模型语义冲突，错误发生在自定义 `detail()` 之前。

固定规则：
- 详情使用 `hddj_url`；专题使用 `hddj_topic_url`；标题使用 `hddj_title`。
- 恢复顺序：`MY_PARAMS → getParam → safeHttp / c.abs()`。
- `hiker://page` 跨页业务参数禁止使用通用 `url` 键。

## 1.9.0-test.3 播放与详情收敛
用户 2026-08-22 实机确认 Test2 二级详情已能打开，但暴露三类问题：
1. 播放器顶部进入播放后，详情里的 `立即播放 / 收藏` 等页面操作仍混在播放区域，播放页面显得像多余播放列表。
2. `正序` 控制项被放进选集网格，与真实集数同层。
3. 后续部分剧集被 `locked` 标记提前送进 `webRule://https://...`，海阔直接提示规则有误，导致后几集无法尝试已验证的 Token 播放链。

Test3 固定处理：
- **单线路播放不再返回 `PlayModel {urls,names,headers}`，恢复 Stable 已验证的直接 HLS URL。** PlayModel 仅用于确实存在多条用户可切线路时。
- 所有剧集点击都先执行 `guest → token → HLS`，不再仅凭页面 `data-ep-free/is-locked` 提前判死刑。
- Token 真拿不到时只给明确权限提示，不再自动拼 `webRule://https://...`。
- 网页兼容模式和详情底部官网入口使用普通 `http/https` 页面 URL。
- `正序/倒序` 合并到“选集”标题行，点击标题切换；不再作为 `text_4` 集数按钮占位。
- 自定义本地收藏从 Primary Play 同行移到详情底部，避免播放器首屏混入与播放无关的操作；系统标题栏收藏能力继续由海阔自身处理。
- 新播放状态键：`hddj_play_strategy_v3`；诊断键：`hddj_play_diag_v3`。

待实机验证：
- [ ] 详情页只保留一个明显 Primary Play，不再在播放器首屏出现“立即播放 + 收藏”并列干扰。
- [ ] 选集网格只有真实集数，正倒序只在标题行。
- [ ] 第 1 集、第 3 集、第 5 集以及最后一集均先走 Token Direct；不再出现 `webRule://https://...` 规则有误。
- [ ] Token 无权限时显示明确 toast，不伪装成已成功播放。
- [ ] Stable 1.8.2 仍可随时覆盖恢复。

## UI / Product Blueprint
- Home：搜索 → 推荐/魔改/AI漫/真人四栏原地切换 → 片库/专题/我的/设置 → 继续观看/热门/最近更新。
- Library：7 个已验证分类用 `flex_button` 原地切换；默认三列海报。
- Search / Mine / Topic / Settings 独立 `simple=true` 页面。
- Detail：Hero → Primary Play → 简介 → 选集 → 猜你喜欢 → 低频本地收藏/官网。
- 分类、Tab、排序等状态变化统一 `refreshPage(false)`，禁止重复压 `hiker://page` 页面栈。

## 本地状态
- 历史：`hddj_history`
- 收藏：`hddj_favs`
- 搜索历史：`hddj_search_history`
- 最后观看集：`hddj_last_<id>`
- 首页 Tab：`hddj_home_tab_v190`
- 片库分类：`hddj_library_cat_v190`
- 我的 Tab：`hddj_mine_tab_v190`
- 片库布局：`hddj_col_v190`
- 选集分组：`hddj_ep_group_v190`
- 倒序：`hddj_reverse_v190`
- Test3 播放策略：`hddj_play_strategy_v3`
- Test3 播放诊断：`hddj_play_diag_v3`

## 回归 / 恢复
- 1.9 UI/播放没有完成本轮实机闭环前不得晋级 Stable。
- Test 异常时直接覆盖 Stable 1.8.2 或导入 `黄豆短剧 本地版`。

---
## 版本记录
### 1.9.0-test.3 / 2026-08-22
- 根据 Test2 实机播放页截图与后续剧集失败结果修复。
- 单线路 PlayModel 回退为直接 HLS；所有剧集先尝试 Token；取消无效 webRule fallback。
- 正倒序移出集数网格；本地收藏降到详情底部。
- Build19003 / Shell v4 / Bootstrap v4，强制越过 Test2 active state。

### 1.9.0-test.2 / 2026-08-22
- 修复 Test1 二级页通用 `url` 参数冲突，改为 `hddj_url / hddj_topic_url`。
- 用户下一轮实机确认详情页已能正常打开。

### 1.9.0-test.1 / 2026-08-22
- 从 Stable 1.8.2 开始 Core/UI/Playback/Content/Detail/Runtime 模块化重构。
- 首轮实机发现二级页路由失败，已冻结。

### 1.8.2 Stable / 2026-08-22
- 用户实机确认 `1.8.2-test.1 / Build18201` 正常后原样晋级。
