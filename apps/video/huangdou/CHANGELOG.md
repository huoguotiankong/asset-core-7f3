# 黄豆短剧 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，必须先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 当前基线
- App ID：`huangdou`
- Remote Stable：`1.8.2 / Build 18201 / Shell 1.0.0`（用户已实机验证，继续冻结）
- Remote Test：`1.9.0-test.4 / Build 19004 / Shell 1.1.3-test`
- Local：`1.8.2-local.1`
- Stable 入口：`apps/video/huangdou/huangdou_remote_v1.txt`
- Test 入口：`apps/video/huangdou/huangdou_remote_test_v5.txt`
- Local：`huangdou.txt`，导入名 `黄豆短剧 本地版`

## 当前 Test 运行链
```text
huangdou_remote_test_v5.txt / rule version 2026082302
→ bootstrap_test_v5.js / state id=huangdou-test / minBuild=19004
→ Remote Manager v2.0.1
→ releases/1.9.0-test.4/release.json
→ core.js          复用 1.9 Test1 / Stable 1.8.2 协议与 HTML Parser
→ ui_base.js       复用 Test2 跨页参数修复
→ playback.js      Test4：Session-aware Token + HLS Probe
→ pages_content.js 复用 Test1 首页/片库/搜索/我的/专题
→ pages_detail.js  Test4：locked 提示 + 合法账号会话入口
→ runtime.js       Test4 组合导出
```

## 数据 / HTML / 图片事实
- 默认 Host：`https://hddj.tv`；备用：`https://hdmgdj.tv`、`https://huangdoudj.com`。
- 首页/分类/专题/详情主要解析 HTML；关键结构：`dm-card`、`dm-topic-card`、`dm-detail-*`。
- 列表封面读取 `img.dm-card-img@src`；详情封面优先 `dm-detail-poster img.src`，再用 `og:image`。
- 站点播放协议由 Stable 1.8.2 实机验证：
```text
POST /account/guest
→ GET /play/token?r=<id>&s=<ep>
→ JSON.t
→ /play/<id>/<ep>.m3u8?t=<token>#isVideo=true#
```
- 详情 DOM 同时暴露 `data-ep-free / is-locked / data-pay-method / data-pay-price` 等权限提示字段；这些是页面层提示，不等于播放器已获得授权。

## 路由事故与固定规则
### 1.9.0-test.1 二级页 URL 冲突
实机报错：`ArticleListModel-HttpRequestError` / `Expected URL scheme 'http' or 'https' but no colon was found`。

根因：业务详情地址放进 `hiker://page/...&url=...`，`url` 与海阔页面模型语义冲突，错误发生在自定义 `detail()` 之前。

固定规则：
- 详情使用 `hddj_url`；专题使用 `hddj_topic_url`；标题使用 `hddj_title`。
- 恢复顺序：`MY_PARAMS → getParam → safeHttp / c.abs()`。
- `hiker://page` 跨页业务参数禁止使用通用 `url` 键。

## 播放连续回归与固定规则
### Test2 / Test3 实机事实
用户实机确认：
1. Test2 详情已可打开，但 `立即播放 / 收藏` 同层、`正序` 混入集数网格、locked 集被提前送入无效 `webRule://https://...`。
2. Test3 已修复上述 UI/路由问题：单线路恢复直接 HLS、选集网格只剩真实集数、收藏下沉、所有剧集都会尝试 Token；但第 5 集仍能进入播放器后黑屏并显示“播放异常，或者网络不可用”。
3. Test3 的现象说明：**拿到 Token / 拼出 m3u8 URL ≠ 已经证明该媒体响应是有效 HLS 或当前会话拥有授权。**
4. Stable 1.8.2 原实现每次播放先 POST guest，再取 Token；这对免费集已验证可用，但若用户已有会员/购买 Cookie，无条件 guest 有覆盖合法会话的风险，因此重构版不能继续把 guest 当无条件第一步。

### Test4 播放策略
- 优先使用当前 Host 已存在的 Cookie / 合法登录会话请求 `/play/token`。
- 只有当前会话拿不到 Token 时，才建立 guest 会话后再重试。
- 拿到 Token 后先用同一 `Cookie + Referer + UA` 对 m3u8 做轻量预检：真正的 HLS 必须以 `#EXTM3U` 开始。
- 真 HLS 才交给播放器，并通过海阔媒体 Header 合同携带当前 Cookie / Referer / UA。
- 若响应是 HTML、登录/会员/金币/购买/无权限等授权页面，或官网明确标记 locked 且没有有效 HLS，则产品化提示“需要登录/购买”，提供官网入口。
- **不绕过官网付费/会员授权。** Test4 只支持用户已有合法账号/购买权益的会话复用。
- 若 HLS Probe 本身因兼容问题失败，不阻塞已验证直链：仍把媒体 URL + 当前会话 Headers 交给播放器，并把 `PROBE_ERROR` 写入诊断。
- 诊断只记录 `locked/cookie` 布尔值与阶段，不记录真实 Cookie、Token。

固定规则：
- 单线路媒体不要为了架构统一强行包装多线路 PlayModel。
- 页面 locked/free 只作提示；最终授权事实以 Play API / 媒体响应为准。
- Token 存在不能直接标记 READY，至少应能区分“真实 HLS / 授权 HTML / 无效媒体响应”。
- 有账号体系的站点不得在每次播放前无条件重建 guest，必须先保护用户已有合法会话。
- 播放主区域只放播放/继续播放/真实线路；收藏、官网、诊断下沉。
- 选集网格只放真实 Episode；正倒序、范围、筛选属于独立控制层。

待实机验证：
- [ ] Test4 第 1 集可正常播放。
- [ ] Test4 第 5 集无合法权益时显示明确授权提示，而不是进入黑屏播放器。
- [ ] 若账号本身对第 5 集有合法权益：在“设置 → 账号 / 会员会话”官网登录后返回，可直接播放。
- [ ] 最近播放诊断能区分 `READY / AUTH_FAIL / HLS_FAIL / PROBE_ERROR / TOKEN_FAIL`，且不泄漏秘密。
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
- Test4 播放策略：`hddj_play_strategy_v4`
- Test4 播放诊断：`hddj_play_diag_v4`

## 回归 / 恢复
- 1.9 UI/播放没有完成本轮实机闭环前不得晋级 Stable。
- Test 异常时直接覆盖 Stable 1.8.2 或导入 `黄豆短剧 本地版`。

---
## 版本记录
### 1.9.0-test.4 / 2026-08-23
- 根据 Test3 第 5 集“已进播放器但媒体异常”的实机结果继续收敛播放链。
- 保护现有合法登录/购买 Cookie；Token 优先使用当前会话，失败才 guest fallback。
- Token 后增加 HLS 预检；媒体播放携带 Cookie / Referer / UA。
- locked 集保留视觉提示，但不直接判播放结果；无权限时明确进入官网账号/购买流程，不绕过授权。
- Build19004 / Shell v5 / Bootstrap v5，强制越过 Test3 active state。

### 1.9.0-test.3 / 2026-08-22
- 根据 Test2 实机播放页截图与后续剧集失败结果修复。
- 单线路 PlayModel 回退为直接 HLS；所有剧集先尝试 Token；取消无效 webRule fallback。
- 正倒序移出集数网格；本地收藏降到详情底部。
- 实机确认 UI 问题已收敛，但第 5 集仍进入播放器后媒体异常，因此不晋级 Stable。

### 1.9.0-test.2 / 2026-08-22
- 修复 Test1 二级页通用 `url` 参数冲突，改为 `hddj_url / hddj_topic_url`。
- 用户下一轮实机确认详情页已能正常打开。

### 1.9.0-test.1 / 2026-08-22
- 从 Stable 1.8.2 开始 Core/UI/Playback/Content/Detail/Runtime 模块化重构。
- 首轮实机发现二级页路由失败，已冻结。

### 1.8.2 Stable / 2026-08-22
- 用户实机确认 `1.8.2-test.1 / Build18201` 正常后原样晋级。
