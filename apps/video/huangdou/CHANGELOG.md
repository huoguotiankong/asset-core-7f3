# 黄豆短剧 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，必须先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 2026-08-24 · 1.9.1-test.3 / Build19103 · Native Local-First Pilot
- 触发条件：规则仓库 `3.5.6-rc24 / Build414` 的统一本地图标包已经由用户实机确认恢复图标，因此恢复此前暂停的黄豆 Local-First 试点。
- 审计 Test2 后确认其仍使用 `Local Bundle Manager 2.1.0 + readFile()/eval()` 执行本地 JS；而规则仓库后续实机已经证明该路线会放大污染源码、执行作用域和本地包恢复问题，最终稳定基线已迁移到 `Local Module Manager 2.2.0 + require(file://)`。
- Test3 从 Stable `1.9.0 / Build19006` 业务基线继续向前，不修改页面业务、收藏历史、账号/付费权限判断和 PlaybackAdapter；只迁移交付/启动架构。
- 新运行链：`huangdou_remote_test_v9.txt / rule 2026082412 → bootstrap_test_v9.js → Local Module Manager 2.2.0 → hiker://files/rules/asset-core-local/huangdou-test/b19103/*.js → require(file://) → HuangDouRemoteRuntime 1.9.1-test.3`。
- 正常启动优先读取 `__hclocal22_huangdou-test_b19103.json`，包完整时不访问 GitHub/CDN；只有首次安装、本地包缺失或主动升级时才进入远端 Bootstrap/模块下载。
- 可执行模块全部进入 Build19103 的原生本地模块包：Core Bridge、UI、Playback、Content、Detail Bridge、Runtime。Core 1.8.2 规则快照和 Detail Test5 完整基线仍因历史结构需要在本地二次展开，但已改为安装时固定到 `hiker://files/rules/asset-core-local/huangdou-test/assets/` 的只读资产，运行时不再远程抓取；不得把这一阶段描述成“完全零 eval”。
- 四个 UI SVG 同样落到稳定本地资产目录，不再绑定 Test2 的 Build19102 cache 路径；后续 build 可继续复用已校验资产。
- Release manifest 内嵌在 Bootstrap，避免固定 `release.json` 成为首次启动额外控制面故障点；真正模块路径全部绑定不可变 commit `2328da698091bc30f518a943149e801297b7bd5b`。
- 静态门禁：新增 Test3 JS 已通过 `node --check`；Shell 外层规则 JSON、`pages` JSON 和抽取后的本地加载器均通过解析/语法检查；GitHub main 已回读确认 Release、Bootstrap、Shell 存在。
- 当前状态：**Test 活动候选，等待海阔实机验证**。验收固定为：①从规则仓库覆盖安装 Test3 后首次打开成功；②退出后二次启动成功且明显走本地包；③断开/屏蔽 GitHub 后首页、片库、详情、收藏历史等本地运行链仍能正常进入（站点业务本身仍需要访问黄豆站点）；④至少验证一集可播放的免费剧集，确认播放链没有因交付架构迁移退化。未完成上述闭环前不得晋级 Stable，也不得批量复制到其它小程序。

## 当前基线
- App ID：`huangdou`
- Remote Stable：`1.9.0 / Build 19006 / Shell 1.1.5`
- Remote Test：`1.9.1-test.3 / Build 19103 / Shell 1.2.1-test-local-first-native`（待实机验证）
- Local：`1.8.2-local.1`
- Stable 入口：`apps/video/huangdou/huangdou_remote_v2.txt`
- Test 入口：`apps/video/huangdou/huangdou_remote_test_v9.txt`
- Local：`huangdou.txt`，导入名 `黄豆短剧 本地版`

## 当前 Stable 运行链
```text
huangdou_remote_v2.txt / rule version 2026082309
→ bootstrap_v2.js / state id=huangdou / minBuild=19006
→ Remote Manager v2.0.1
→ latest.json
→ releases/1.9.0/release.json
→ core.js          复用 1.9 Test1 / Stable 1.8.2 协议与 HTML Parser
→ ui_base.js       复用 Test2 跨页/UI 基线
→ playback.js      复用 Test4 Session-aware Token + HLS Probe
→ pages_content.js 复用 Test1 首页/片库/搜索/我的/专题
→ pages_detail.js  复用 Test6 【锁】兼容标识热修
→ runtime.js       复用 Test6 组合导出
```

Stable `1.9.0` 与 `1.9.0-test.6` 的业务模块完全一致；本次正式发布只新增独立 Stable release / Bootstrap / Shell 与 Stable 元数据，不改变授权、播放或 UI 逻辑。用户于 2026-08-23 明确要求将当前黄豆短剧测试链发布为正式版，此指令作为本次晋级接受依据。

## 当前 Test 运行链
```text
huangdou_remote_test_v9.txt / rule version 2026082412
→ 本地包 __hclocal22_huangdou-test_b19103.json
→ 若完整：直接 require(file://) Build19103 模块
→ 若缺失：bootstrap_test_v9.js
→ Local Module Manager 2.2.0
→ 安装固定 Core/Detail/UI 资产 + Build19103 模块
→ require(file://) HuangDouRemoteRuntime
```

Stable/Test 同名覆盖，但运行状态独立：Stable 继续使用 `huangdou` Remote Manager 状态；Test3 使用 `huangdou-test` 的 Local Module Manager 2.2.0 状态与 Build19103 包。

## 数据 / HTML / 图片事实
- 默认 Host：`https://hddj.tv`；备用：`https://hdmgdj.tv`、`https://huangdoudj.com`。
- 首页/分类/专题/详情主要解析 HTML；关键结构：`dm-card`、`dm-topic-card`、`dm-detail-*`。
- 列表封面读取 `img.dm-card-img@src`；详情封面优先 `dm-detail-poster img.src`，再用 `og:image`。
- 站点播放协议由 Stable 1.8.2 实机验证，并在 1.9 保持：
```text
POST /account/guest
→ GET /play/token?r=<id>&s=<ep>
→ JSON.t
→ /play/<id>/<ep>.m3u8?t=<token>#isVideo=true#
```
- 详情 DOM 暴露 `data-ep-free / is-locked / data-pay-method / data-pay-price` 等权限提示字段。
- 用户 2026-08-23 明确确认：后续无法观看的部分集数属于**付费章节**。

## 付费剧集 UI 标识：Test5 → Test6 → Stable 1.9.0
Test5 使用 `🔒` 标识官网 locked Episode。用户实机确认：
- 点击付费集时授权提示正确，说明 `locked` 判断已经生效。
- 但 `text_4` 集数按钮里 `🔒` 字形没有显示；选集说明的 `text_1` 中却能显示 `🔒`。

结论：这是海阔组件/字体渲染兼容问题，不是权限判断失败。某些 `text_4` 场景会吞掉 supplementary-plane Emoji，因此付费状态不能只依赖 Emoji 字形表达。

最终方案：
- 付费集按钮：`【锁】第N集`。
- 当前 Primary Play 是付费集：`【锁】第 N 集 · 付费/解锁`。
- 选集说明：`【锁】为官网付费/需授权内容`。
- `【锁】` 只表达官网页面给出的付费/授权提示，最终播放授权仍由 Play API / 媒体响应确认。
- 不实现、也不记录任何绕过官网付费/会员授权的方案。

固定规则：**关键状态（付费、锁定、失败、警告）不能只靠 Emoji 表达。对 `text_4/flex_button/scroll_button` 等组件，必须有可读文本 fallback，例如 `【锁】/付费/VIP`。**

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
1. Test2 二级详情恢复，但播放主区混收藏、正序混入选集网格、locked 集被提前送入无效 `webRule://https://...`。
2. Test3 修复 UI/路由后，第5集仍可进入播放器但媒体异常。
3. `Token 存在 / URL 已拼出` 不等于真实媒体已授权或 HLS 有效。
4. 后续失败集属于付费章节。

### Test4 播放策略（Stable 1.9.0 原样复用）
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
- 已知付费/锁定 Episode 必须在 UI 上明确区分。

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
- 播放策略：`hddj_play_strategy_v4`
- 播放诊断：`hddj_play_diag_v4`

## 回归 / 恢复
- 当前 Stable 恢复入口：`黄豆短剧 1.9.0 / Build19006`。
- 当前 Test 候选：`1.9.1-test.3 / Build19103`；失败时不得覆盖 Stable，直接从 Stable 1.9.0 或冻结的 Test2/Test3 immutable 资产新建更高 build 修复。
- Local 1.8.2 继续作为独立纯本地恢复入口，暂不随本次 Test 交付架构迁移重打包。

---
## 版本记录
### 1.9.1-test.3 / 2026-08-24
- Local-First 执行器由 2.1.0 `readFile/eval` 迁移到 2.2.0 `require(file://)`。
- Release manifest 内嵌 Bootstrap；正常启动只读 Build19103 本地模块包。
- Core/Detail 历史完整基线改为固定本地只读资产，取消正常运行时远程抓取。
- 当前等待实机闭环，不得晋级 Stable。

### 1.9.0 Stable / 2026-08-23
- 按用户明确发布指令，由 `1.9.0-test.6 / Build19006` 原样晋级。
- 新增 `releases/1.9.0/release.json`、`bootstrap_v2.js`、`huangdou_remote_v2.txt`。
- Stable state id 保持 `huangdou`，与 Test `huangdou-test` 隔离。
- Stable Shell 1.1.5 / rule version `2026082309`；业务模块与 Test6 完全相同。

### 1.9.0-test.6 / 2026-08-23
- 根据 Test5 实机确认：授权判断正确，但 `text_4` 不显示 `🔒` Emoji。
- 付费集 UI 改为稳定文本 `【锁】第N集`，Primary Play 和选集说明同步使用 `【锁】`。
- PlaybackAdapter 完整复用 Test4，不改授权/媒体合同。

### 1.9.0-test.5 / 2026-08-23
- 用户明确确认后续播放失败集属于付费章节。
- 详情主按钮与选集网格尝试对官网 locked Episode 增加 `🔒`，实机确认 `text_4` 不显示，后由 Test6 修复。

### 1.9.0-test.4 / 2026-08-23
- 保护现有合法登录/购买 Cookie；Token 优先使用当前会话，失败才 guest fallback。
- Token 后增加 HLS 预检；媒体播放携带 Cookie / Referer / UA。
- locked 集不直接判播放结果；无权限时明确官网登录/购买。

### 1.9.0-test.3 / 2026-08-22
- 单线路 PlayModel 回退直接 HLS；所有剧集先尝试 Token；取消无效 webRule fallback。
- 正倒序移出选集网格；本地收藏下沉。

### 1.9.0-test.2 / 2026-08-22
- 修复 Test1 二级页通用 `url` 参数冲突，改为 `hddj_url / hddj_topic_url`。

### 1.8.2 Stable / 2026-08-22
- 用户实机确认 `1.8.2-test.1 / Build18201` 正常后原样晋级。
