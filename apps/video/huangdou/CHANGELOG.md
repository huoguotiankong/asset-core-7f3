# 黄豆短剧 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，必须先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 当前基线
- App ID：`huangdou`
- Remote Stable：`1.8.2 / Build 18201 / Shell 1.0.0`（用户已实机验证，继续冻结）
- Remote Test：`1.9.0-test.6 / Build 19006 / Shell 1.1.5-test`
- Local：`1.8.2-local.1`
- Stable 入口：`apps/video/huangdou/huangdou_remote_v1.txt`
- Test 入口：`apps/video/huangdou/huangdou_remote_test_v7.txt`
- Local：`huangdou.txt`，导入名 `黄豆短剧 本地版`

## 当前 Test 运行链
```text
huangdou_remote_test_v7.txt / rule version 2026082307
→ bootstrap_test_v7.js / state id=huangdou-test / minBuild=19006
→ Remote Manager v2.0.1
→ releases/1.9.0-test.6/release.json
→ core.js          复用 Test1 / Stable 1.8.2 协议与 HTML Parser
→ ui_base.js       复用 Test2 跨页/UI 基线
→ playback.js      完整复用 Test4 Session-aware Token + HLS Probe
→ pages_content.js 复用 Test1 首页/片库/搜索/我的/专题
→ pages_detail.js  Test6：Pinned Test5 Detail + 【锁】兼容标识热修
→ runtime.js       Test6 组合导出
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
- 详情 DOM 暴露 `data-ep-free / is-locked / data-pay-method / data-pay-price` 等权限提示字段。
- 用户 2026-08-23 明确确认：后续无法观看的部分集数属于付费章节。

## Test5 → Test6：付费剧集 UI 标识
Test5 使用 `🔒` 标识官网 locked Episode。用户实机确认：
- 点击付费集时授权提示正确，说明 `locked` 判断已经生效。
- 但 `text_4` 集数按钮里 `🔒` 字形没有显示；选集说明的 `text_1` 中却能显示 `🔒`。

结论：这是**海阔组件/字体渲染兼容问题，不是权限判断失败**。某些 `text_4` 场景会吞掉 supplementary-plane Emoji，因此付费状态不能只依赖 Emoji 字形表达。

Test6 固定方案：
- 付费集按钮改为 `【锁】第N集`，使用普通中文/BMP 文本确保可见。
- 当前 Primary Play 是付费集时显示 `【锁】第 N 集 · 付费/解锁`。
- 选集说明改为 `【锁】为官网付费/需授权内容`。
- Test6 不修改 PlaybackAdapter；继续复用 Test4 会话保持、Token、HLS 预检与 Header 交付。
- 不绕过官网付费/会员授权。

固定规则：**关键状态（付费、锁定、失败、警告）不能只靠 Emoji 表达。对 `text_4/flex_button/scroll_button` 等组件，必须有可读文本 fallback，例如 `【锁】/付费/VIP`；Emoji 只能作为增强，不得作为唯一信息载体。**

待实机确认：
- [ ] 已知付费集在选集网格稳定显示 `【锁】`。
- [ ] 免费集不误标锁。
- [ ] 当前继续播放目标是付费集时 Primary Play 明确显示锁定状态。
- [ ] 已购买合法权益的账号会话仍按 Test4 播放链处理。

## 路由事故与固定规则
### 1.9.0-test.1 二级页 URL 冲突
实机报错：`ArticleListModel-HttpRequestError` / `Expected URL scheme 'http' or 'https' but no colon was found`。

根因：业务详情地址放进 `hiker://page/...&url=...`，`url` 与海阔页面模型语义冲突。

固定规则：
- 详情使用 `hddj_url`；专题使用 `hddj_topic_url`；标题使用 `hddj_title`。
- 恢复顺序：`MY_PARAMS → getParam → safeHttp / c.abs()`。
- `hiker://page` 跨页业务参数禁止使用通用 `url` 键。

## 播放连续回归与固定规则
用户实机确认：
1. Test2 二级详情已恢复，但播放主区混收藏、正序混入选集网格、locked 集被提前送入无效 `webRule://https://...`。
2. Test3 修复 UI/路由后，第5集仍可进入播放器但媒体异常。
3. 这证明 `Token 存在 / URL 已拼出` 不等于真实媒体已授权或 HLS 有效。
4. 用户随后确认这些后续失败集属于付费章节。

### Test4 播放策略（Test6 原样复用）
- 优先使用当前 Host 已存在的 Cookie / 合法登录会话请求 `/play/token`。
- 只有当前会话拿不到 Token 时，才建立 guest 后重试。
- Token 后使用同一 `Cookie + Referer + UA` 对 m3u8 做轻量预检；有效 HLS 应以 `#EXTM3U` 开始。
- 真 HLS 才交给播放器，并携带当前 Cookie / Referer / UA。
- 若返回登录/会员/金币/购买/无权限页面，产品化提示需要登录/购买，不让播放器显示模糊黑屏错误。
- 不绕过官网付费/会员授权；只支持用户已有合法账号/购买权益的会话复用。
- Probe 自身若因海阔兼容问题异常，可保留已验证直链合同并记录 `PROBE_ERROR`。
- 诊断不记录真实 Cookie、Token，只记录阶段与布尔状态。

固定规则：
- 单线路媒体不要为了架构统一强行包装多线路 PlayModel。
- 页面 locked/free 是 UI 权限提示；最终授权事实仍由 Play API / 媒体响应确认。
- Token 存在不能直接标记 READY。
- 有账号体系的站点不能无条件 guest 覆盖已有合法会话。
- 播放主区域只放播放/继续播放/真实线路；收藏、官网、诊断下沉。
- Episode Grid 只放真实剧集；正倒序、范围、筛选属于控制层。
- 已知付费/锁定 Episode 应在 UI 上明确区分，禁止把明显付费集伪装成普通可播放集后再报“网络异常”。

## UI / Product Blueprint
- Home：搜索 → 推荐/魔改/AI漫/真人四栏原地切换 → 片库/专题/我的/设置 → 继续观看/热门/最近更新。
- Library：7 个已验证分类原地切换；默认三列海报。
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
- Test4/Test6 播放策略：`hddj_play_strategy_v4`
- Test4/Test6 播放诊断：`hddj_play_diag_v4`

## 回归 / 恢复
- 1.9 UI/播放没有完成本轮实机闭环前不得晋级 Stable。
- Test 异常时直接覆盖 Stable 1.8.2 或导入 `黄豆短剧 本地版`。

---
## 版本记录
### 1.9.0-test.6 / 2026-08-23
- 根据 Test5 实机确认：授权判断正确，但 `text_4` 不显示 `🔒` Emoji。
- 付费集 UI 改为稳定文本 `【锁】第N集`，Primary Play 和选集说明同步使用 `【锁】`。
- PlaybackAdapter 完整复用 Test4，不改授权/媒体合同。
- Build19006 / Shell v7 / Bootstrap v7。

### 1.9.0-test.5 / 2026-08-23
- 用户明确确认后续播放失败集属于付费章节。
- 详情主按钮与选集网格尝试对官网 locked Episode 增加 `🔒`。
- 实机确认 `text_4` 集数按钮不显示该 Emoji，已冻结并由 Test6 改用文本 fallback。

### 1.9.0-test.4 / 2026-08-23
- 保护现有合法登录/购买 Cookie；Token 优先使用当前会话，失败才 guest fallback。
- Token 后增加 HLS 预检；媒体播放携带 Cookie / Referer / UA。
- locked 集不直接判播放结果；无权限时明确官网登录/购买。

### 1.9.0-test.3 / 2026-08-22
- 单线路 PlayModel 回退直接 HLS；所有剧集先尝试 Token；取消无效 webRule fallback。
- 正倒序移出选集网格；本地收藏下沉。

### 1.9.0-test.2 / 2026-08-22
- 修复 Test1 二级页通用 `url` 参数冲突，改为 `hddj_url / hddj_topic_url`。

### 1.9.0-test.1 / 2026-08-22
- 从 Stable 1.8.2 开始 Core/UI/Playback/Content/Detail/Runtime 模块化重构。

### 1.8.2 Stable / 2026-08-22
- 用户实机确认 `1.8.2-test.1 / Build18201` 正常后原样晋级。
