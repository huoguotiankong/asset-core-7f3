# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.4 / Build 10104 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v4_b10104.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v4_b10104.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.4/release.json`

## 0.1.0-test.4 / Build 10104 — 论坛产品结构与 Parser 收敛

### 第三轮实机事实

用户 2026-09-23 连续实机截图确认：

1. Test3 的原生首页已能识别出 5 个 forum 链接，说明论坛入口链路已经工作；
2. 点击“国产”后，WebView 源码能解析到 **30 条主题**，说明数据并非抓不到；
3. 主题标题却被解析成 `00:24:34 / 00:24:55 / 00:26:26` 等视频时长；
4. 同一列表右侧出现默认空白图片占位，说明此前强制 `movie_1` 但没有真实缩略图；
5. 官网真实论坛 UI 显示 `最新发表 / 最新热门 / 最新精华 / 我的话题`，此前硬编码标准 Discuz `guide&view=hot` 不可靠；
6. 官网完整论坛页包含更多板块层级，而原生首页只显示 `国产 / 无码 / 字幕 / 有码 / 三级`，表明 Portal 快捷入口被误当成完整板块目录；
7. “网页登录”首次打开时实际出现站点 18+ 年龄确认页，因此账号流程必须先完成年龄确认，再进入登录。

### Test4 修复

1. **主题标题按 tid 聚合，而不是先到先得**
   - 同一个帖子可能同时存在“时长链接 / 缩略图链接 / 标题链接”；
   - 先按 `tid` 聚合全部候选；
   - 明确过滤纯时长、纯日期、纯数字、`查看帖子/回复/详情` 等通用文本；
   - 再按中文/字母长度与信息量选择最佳标题。

2. **缩略图提取**
   - 从同一 tid 的 `<img>` 中尝试读取 `data-original / data-src / zoomfile / file / src`；
   - 过滤 avatar、smiley、loading、logo；
   - 有真实缩略图才使用 `movie_1`；
   - 无图自动降级 `text_1`，不再显示默认空占位图。

3. **论坛分区入口改为 forum 优先**

```text
forum.php?mobile=2
→ forum.php?mobile=no
→ portal.php?mod=index&mobile=2
```

每级仍支持普通请求 + WebView 渲染源码。新建 `sht_forum_cache_v4`，不会继续复用 Test2/Test3 那个只缓存 5 个快捷入口的旧缓存。

4. **真实话题导航动态发现**
   - 不再假设 `最新/热门/精华` 必须是标准 `guide&view=`；
   - 先从当前论坛页按文字动态寻找 `最新发表 / 最新热门 / 最新精华` 的真实 href；
   - 找不到才使用标准 Discuz fallback。

5. **账号入口顺序修正**
   - 设置页拆为：
     1. `首次访问 / 年龄确认`；
     2. `网页登录`；
     3. `每日签到`；
   - 年龄确认由用户在官网页面手动点击，不自动绕过站点 18+ 首访确认；
   - 验证码/安全验证继续由官方网页完成；
   - Cookie 共享状态继续以海阔实机为准。

6. **保持不动**
   - Test1 的帖子详情 Parser 暂不重写；
   - 115 / 迅雷 / PikPak 磁链调用合同不动；
   - 搜索逻辑暂不扩大修改面；
   - Stable / Latest / 根 registry 仍不建立。

### 静态门禁

- `patch_forum_product.js`：`node --check` 通过；
- `bootstrap_test_v4_b10104.js`：`node --check` 通过；
- Test4 `release.json`：JSON 解析通过；
- Test4 Shell 外层规则与内层 `pages` JSON：解析通过；
- 自建 fixture 验证：同一 tid 先出现 `00:24:34`，后出现真实标题时，Parser 最终选择真实标题而不是时长。

### Test4 实机优先验收

1. 覆盖导入 Test4 后首页论坛板块数量是否明显多于 5 个，名称是否更接近官网完整论坛页；
2. 进入“国产”或其它板块，确认标题不再是 `00:24:34` 这类时长；
3. 有缩略图的主题是否显示真实图片，无缩略图时是否不再出现默认空白图；
4. `最新发表 / 最新热门 / 最新精华` 至少两项是否能得到原生主题列表；
5. 设置 → `① 首次访问 / 年龄确认`，手动确认后返回，再进入 `② 网页登录`，确认是否真正到登录页。

## 0.1.0-test.3 / Build 10103 — 主题列表渲染源码恢复

### 第二轮实机事实

用户 2026-09-23 实机确认 Test2 能进入海阔原生“热门主题”页面，但列表仍显示“当前页暂无主题 / 没有解析到主题”。说明原生页面壳已工作，但 `forum()` 的普通 HTTP 请求没有得到可识别的真实主题列表。

### 修复

1. 保持 Test1 帖子/磁链模块、Test2 首页/板块模块不动，仅新增 Test3 overlay。
2. 主题列表数据链升级为：

```text
mobile fetch
→ mobile fetchCodeByWebView 渲染后 HTML
→ PC fetch
→ PC fetchCodeByWebView 渲染后 HTML
→ 原生 Parser / Renderer
```

3. Thread URL 识别继续支持：
   - `forum.php?...tid=<id>`；
   - `forum.php?...ptid=<id>`，自动标准化为真实 viewthread；
   - `thread-<tid>-<page>-<mode>.html`。
4. WebView 只作为隐藏数据获取层，不把网页作为最终 UI。
5. 若四级链仍失败，原生页面直接显示诊断：
   - HTML 字符数；
   - anchor 链接数；
   - 识别主题数；
   - 页面 `<title>`；
   - 具体命中的 fetch / webview / pc-fetch / pc-webview 阶段。
6. 最近诊断同步写入 `sht_diag_v1`，设置页仍可查看。

### 静态门禁

- `patch_topic_render.js`：`node --check` 通过。
- `bootstrap_test_v3_b10103.js`：`node --check` 通过。
- `release.json`：JSON 解析通过。
- Test Shell 内层 `pages` JSON：解析通过。

## 0.1.0-test.2 / Build 10102 — 原生入口恢复

- Test1 首次实机：首页“论坛分区”未识别，只剩网页兜底；巨大 logo 卡片体验差。
- 首页数据链改为 `portal → mobile forum → PC forum → WebView HTML`。
- 放宽 Discuz forum/thread 链接参数顺序、伪静态 URL、无引号 href。
- 首页最新/热门/精华改为紧凑原生文本入口。
- 采用 overlay，仅覆盖首页和主题列表入口；账号和磁链合同保持不变。

## 0.1.0-test.1 / Build 10101 — 基础论坛 + 磁链云播

### 已实现基础能力

- 原生搜索框、登录/签到/搜索/设置入口；
- Discuz 论坛分区、主题、帖子 Parser 初版；
- 帖子正文/图片提取；
- 自动识别 `magnet:?xt=urn:btih:`；
- 每条磁链提供 115 / 迅雷 / PikPak / 复制；
- 115：`hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>`；
- 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`；
- PikPak：`pikpakapp://mypikpak.com/xpan/main_tab?tab=1&add_url=<magnet>`；
- 登录/签到/回复首版走同域 WebView，未实机确认前不自行伪造 formhash/POST。

## 当前禁用 / 待确认

- 未实机确认前，不直接 POST 签到或回帖。
- 不保存真实账号、密码、Cookie、formhash。
- 不把 `.net/.com` 做成每次首屏并发探活固定税。
- Test 阶段不晋级 Stable，不登记根 `registry.json`。
- 下一阶段必须先完成：论坛板块 → 主题标题/图片 → 帖子详情 → 磁链云播实机闭环，再继续原生登录状态/签到/回复/UI 精修。
