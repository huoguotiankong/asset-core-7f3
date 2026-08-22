# 黄豆短剧 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，必须先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 当前基线
- 程序：黄豆短剧
- App ID：`huangdou`
- Remote Stable：`1.8.2 / Build 18201 / Shell 1.0.0`
- Remote Test：`1.9.0-test.1 / Build 19001 / Shell 1.1.0-test`
- Local：`1.8.2-local.1`
- Stable 入口：`apps/video/huangdou/huangdou_remote_v1.txt`
- Test 入口：`apps/video/huangdou/huangdou_remote_test_v2.txt`
- Local 源码：`huangdou.txt`
- Local 导入规则名：`黄豆短剧 本地版`
- Stable 状态：1.8.2 已实机验证，继续冻结作为恢复基线。
- Test 状态：1.9.0-test.1 已完成静态 JS/JSON/Shell 检查并发布，等待海阔实机 UI 与播放回归。

## 当前运行链
### Stable
```text
黄豆短剧 Stable Shell
→ bootstrap_v1.js
→ Remote Manager v2.0.1 / state id=huangdou
→ releases/1.8.2/release.json
→ 已验证 1.8.2 immutable runtime/source snapshot
```

### Test 1.9
```text
黄豆短剧 Test Shell v2（7 个独立 page path）
→ bootstrap_test_v2.js / state id=huangdou-test / minBuild=19001
→ Remote Manager v2.0.1
→ releases/1.9.0-test.1/release.json
→ core.js            Stable 1.8.2 协议/HTML Parser 桥
→ ui_base.js         Native Design System / Card / Route / State helpers
→ playback.js        PlaybackAdapter
→ pages_content.js   Home / Library / Topic Index / Search / Mine
→ pages_detail.js    Detail / Topic Detail / Settings
→ runtime.js         组合并导出 hddj
```

- Stable 1.8.2 与 Local 1.8.2 本轮不修改。
- Test Shell 从 3 个 page path 扩展为 7 个，所以必须通过云端仓库重新覆盖导入 `huangdou_remote_test_v2.txt`；只点旧壳内远程更新不足以新增页面声明。
- Test Remote Manager 状态 ID 继续为 `huangdou-test`，`minBuild=19001` 强制越过旧 1.8.2-test.1 active state。

## 1.9 Product / UI Blueprint
页面地图：
- Home：搜索 → 推荐/魔改/AI漫/真人四栏原地切换 → 片库/专题/我的/设置四入口 → 继续观看/热门/最近更新。
- Library：7 个已验证内容分类用 `flex_button` 原地切换；默认三列海报，可设置双列。
- Topic：专题索引与专题详情独立，不和首页分类混在同一状态机里。
- Search：独立输入 + 本地搜索历史 + 结果；输入提交使用有效 JS 表达式并原页刷新。
- Mine：收藏/历史两栏原地切换。
- Detail：模糊 Hero → 立即/继续播放 + 收藏 → 简介 → 分组选集 → 猜你喜欢 → 官网/登录解锁。
- Settings：体验 / 播放 / 网络 / 本地数据分组；技术诊断后置。

UI 规则：
- 首页一级 Tab 固定四等宽 `text_4`，不使用会产生窄屏溢出箭头的 `scroll_button`。
- 片库大量分类使用 `flex_button`，分类切换只写状态 + `refreshPage(false)`，不压新的 `hiker://page`。
- 短剧列表/收藏/历史默认 `movie_3` 竖海报；专题卡使用 `movie_2`；详情 Hero 使用 `movie_1_vertical_pic_blur`。
- 跨页详情 URL 至少携带真实 `url/title/cover` query，不再只依赖 `extra`。
- 主导航图标使用仓库内稳定 SVG，不用 Emoji 承担正式图标。

## 数据 / HTML / 图片事实
继续复用 Stable 1.8.2 已验证结论：
- 默认 Host：`https://hddj.tv`；手动备用：`https://hdmgdj.tv`、`https://huangdoudj.com`。
- 首页/分类/专题/详情以 HTML 解析为主；关键结构：`dm-card`、`dm-topic-card`、`dm-detail-*`。
- 列表封面读取 `img.dm-card-img@src`，规避 `onerror` 占位图；详情封面优先 `dm-detail-poster img.src`，再用 `og:image`。
- 1.9 不在启动时自动探测域名；设置页提供用户点击触发的线路自检，避免网络探测阻塞首屏。

## PlaybackAdapter 1.9
当前已验证协议事实不变：
```text
POST /account/guest
→ GET /play/token?r=<id>&s=<ep>
→ JSON.t
→ /play/<id>/<ep>.m3u8?t=<token>
```

1.9 Test 重写：
- `smart`（默认）：guest → token；token 缺失时再刷新 guest 重试一次；成功后返回标准 `PlayModel {urls,names,headers}`，携带 UA + 当前剧集 Referer。
- `legacy`：走同一 guest/token 获取链，但输出与 Stable 1.8.2 一样的直接 HLS URL，作为回归对照/兼容路线。
- `web`：直接使用当前剧集 `webRule://` 网页兼容路线。
- `smart/legacy` 取 token 失败后才降级到 `webRule://`，不把网页嗅探放在结构化播放之前。
- 播放诊断写入 `hddj_play_diag_v2`，记录 `NO_SOURCE / TOKEN_FAIL / READY`、route、strategy、id/ep、host；不记录有效 token/cookie。
- 播放成功继续写 `hddj_last_<id>`，保持续播兼容。

待实机验证：
- [ ] smart 普通免费集首次播放。
- [ ] smart 连续第二集/二次播放。
- [ ] PlayModel Header 不导致已验证旧链回归。
- [ ] legacy 模式仍可作为稳定对照。
- [ ] token 失败时 webRule 降级可达。
- [ ] 付费/锁定集不伪装成免费直链。

## 本地状态
保留：
- 历史：`hddj_history`
- 收藏：`hddj_favs`
- 搜索历史：`hddj_search_history`
- 最后观看集：`hddj_last_<id>`

1.9 新增：
- 首页 Tab：`hddj_home_tab_v190`
- 片库分类：`hddj_library_cat_v190`
- 我的 Tab：`hddj_mine_tab_v190`
- 片库布局：`hddj_col_v190`
- 选集分组：`hddj_ep_group_v190`
- 倒序：`hddj_reverse_v190`
- 播放策略：`hddj_play_strategy_v2`
- 播放诊断：`hddj_play_diag_v2`
- Core 快照：`huangdou_core_snapshot_182_v190`

## 回归 / 恢复
- 1.9 UI 大改、播放重写未拿到用户实机截图/播放结果前不得晋级 Stable。
- 如 Test 出现白屏、页面路由或播放回归，直接从云端仓库覆盖 Stable 1.8.2，或导入 `黄豆短剧 本地版` 恢复。

---
## 版本记录
### 1.9.0-test.1 / 2026-08-22
- 基于已实机验证的 Stable 1.8.2 协议/HTML Parser 向前重构，不改 Stable。
- 从单体 hddj God Object 拆出 CoreBridge / UI Base / PlaybackAdapter / Content Pages / Detail Pages / Runtime。
- 首页、片库、专题、搜索、我的、设置独立；详情重做 Hero / Primary Action / 分组选集 / 推荐层级。
- 分类、首页 Tab、Mine Tab 统一采用同页状态刷新，落实跨程序“State Change ≠ Navigation”规则。
- 播放改成结构化 Token API → PlayModel；保留 legacy 对照和 webRule 后级降级；新增脱敏播放诊断。
- 新增点击触发的线路自检，不在启动阶段做多域探测。
- 当前只发布 Test；本地 JS 全量 `node --check`、release JSON、Shell 外层/内层 pages JSON 均已通过，并用 Git blob SHA 对照远端关键模块。

### 1.8.2 Stable / 2026-08-22
- 用户实机确认 `1.8.2-test.1 / Build 18201` 正常后原样晋级 Remote Stable。
- Local 保留完整本地代码，导入名固定为 `黄豆短剧 本地版`。
