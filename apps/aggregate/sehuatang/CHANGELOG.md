# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.3 / Build 10103 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v3_b10103.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v3_b10103.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.3/release.json`

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

### Test3 实机优先验收

1. 覆盖导入 Test3；
2. 首页点“热门主题”或任意真实论坛板块；
3. 若出现主题列表，继续测试帖子详情；
4. 若仍为空，**直接截当前页即可**，因为 Test3 会把真实诊断信息显示在“诊断信息”一栏，不再需要猜测网络层返回。

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
- 下一阶段必须先完成：原生主题列表 → 原生帖子详情 → 磁链云播实机闭环，再继续原生登录状态/签到/回复/UI 精修。
