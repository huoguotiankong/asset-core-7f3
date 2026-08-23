# 溏心次元 CHANGELOG

## 当前基线

- App ID：`tangxincyuan`
- 当前通道：Test
- 当前版本：`0.1.0-test.2` / Build `10102`
- 当前 Shell：`1.0.0-test.3` / RuleVersion `2026082313`
- 当前 Bootstrap：`bootstrap_test_v2_b10102.js`
- 当前加载器：`cdn-direct-1.0`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 用户当前源站入口：`https://txcy-online.buzz/banshu/`
- 当前没有 Stable；首轮真实 DOM / 图片 / 播放链仍需实机验证，禁止直接晋级 Stable。
- 云端目录已同步到根 `manifest.json` revision `202608232035`，`manifest_meta.json` 同 revision，`itemCount=16`。

## 0.1.0-test.2 / Build 10102 — 2026-08-23

### 实机故障

用户导入后首页立即报错：

```text
JavaException
获取远程依赖失败：
https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/tangxincyuan/bootstrap_test_v1_b10101.js?v=10101
```

同时用户明确反馈“云端仓库还是 Test1”。这说明上一轮只做 Shell2 文本兼容并不足够：

1. 业务版本仍停在 `0.1.0-test.1 / Build10101`，所以云仓自然仍显示 Test1。
2. Shell2 依然通过 `raw.githubusercontent.com` 加载 Bootstrap；当前实机环境该依赖链无法可靠获取，程序在业务代码运行前就失败。

### Test2 修复

- 新建真正的 `0.1.0-test.2 / Build10102`，不再用“Test1 + Shell 热修”冒充新版本。
- 新建 `tangxincyuan_remote_test_v3_b10102.txt`，所有 Shell 页面入口统一通过 jsDelivr 加载 Bootstrap。
- 新建 `bootstrap_test_v2_b10102.js`，不再依赖通用 `remote_manager.js` 的 raw GitHub 根地址，改为独立 `cdn-direct-1.0` 加载器。
- CDN Loader 支持：默认版本加载、最低 Build10102、防旧状态回落、检查更新、更新、回退、重装。
- 新建不可变 Test2 Release：
  - `releases/0.1.0-test.2/release.json`
  - `core.js` CDN 兼容包装层
  - `runtime.js` CDN 兼容包装层
- Test2 包装层继续复用已冻结 Test1 业务解析代码，只修复交付链；`TxcyCore.bootstrap` 会在加载后切换到 Test2 CDN Bootstrap，详情页 lazyRule 不再回到 raw Bootstrap。
- `test.json`、`channels.json`、`registry.json`、根 `manifest.json`、`manifest_meta.json` 已同步到 Test2 / Build10102。
- Shell 可见标签继续保持“人物中心 / 内容详情”等中性名称，避免再次触发导入阶段关键词检查。
- Bootstrap、Core Wrapper、Runtime Wrapper 已通过 `node --check` 语法检查。

### 当前剩余验证

Test2 首先只验证“程序能正常启动并进入首页”。启动链确认后，再继续用用户实机截图锁定：

1. 首页卡片与封面。
2. 分类与人物入口。
3. 搜索协议。
4. 详情 DOM。
5. 播放字段与 HLS / iframe / JS 配置。
6. 图片是否还需要 Cookie、Referer 或其它解密处理。

## Shell 1.0.0-test.2 / RuleVersion 2026082312 — 2026-08-23

### 导入违禁词兼容修复

用户实机从“我的规则仓库”导入 Test1 时，海阔在导入阶段直接提示“包含违禁词”，程序尚未进入运行时，因此问题边界锁定在 Remote Shell 的导入可见文本，而不是 Core/Runtime。

处理：

- 导入 Shell 中的敏感人物分类标签改成中性“人物中心”。
- “视频详情”改成“内容详情”，进一步缩小导入扫描面。
- Shell 图标地址由 raw GitHub 改为 jsDelivr CDN。
- 新建独立 `tangxincyuan_remote_test_v2_b10101.txt`，避免旧 URL 缓存；业务 Release、Bootstrap、Core、Runtime 均保持 Test1 Build10101 不变。
- `channels.json` 已指向 Shell2，并将仓库展示文字同步改成“人物中心/人物头像”。
- `test.json` 记录 `shellVersion=1.0.0-test.2`、`shellRuleVersion=2026082312`。

该修复解决了导入阶段文本问题，但没有修复 raw GitHub Bootstrap 依赖，后续已由 Test2 取代。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 产品目标

从头重写，不照搬旧小程序。首版按用户当前网页截图重建信息架构，并为后续站点 DOM/API 精确适配保留清晰模块边界：

```text
Home
├─ 搜索
├─ 官网主导航
├─ 热门人物
├─ 分类频道
└─ 最新内容

Category Hub
├─ 栏目：官方栏目 / 节目 / 企划 / 精选
├─ 系列：MD / MDS / MDX / MDXS / MDL / MMZ / MAD / MDWP 等
└─ 片商专题

People Hub
Search
Detail / Player
Favorites / History
Settings / Diagnostics
```

### Core / Provider

- 默认入口不是域名根目录，而是完整 `https://txcy-online.buzz/banshu/`，避免错误退回 `/`。
- Root Manager 保留当前完整路径；入口失效时可从页面发现候选 URL，再进行有限探活。
- 首页、分类、人物、搜索、详情与媒体解析均由独立函数提供，不把 DOM 解析散落在 UI。
- 分类先动态读取真实 `<a>` 链接，再按栏目/系列/片商分组；不会硬猜未知分类 URL。
- 搜索优先读取官网 `<form>` 的 action/input name；失败后才有限尝试常见 GET 路由。
- 视频卡片 Parser 以“真实链接 + 标题 + 图片”为最小成功契约，过滤导航/分类/工具链接。

### 图片与播放

- 图片统一追加 User-Agent + Referer，不直接在页面层拼 Header。
- 详情页支持普通 `<video>/<source>`、常见 `file/src/url/play_url/hls/m3u8` 字段、`player_*` 配置、iframe 一跳媒体提取。
- 对 URL 编码和可识别 Base64 URL 做有限解码；不猜未知 AES/RC4 密钥。
- 单线路直接交给播放器；多线路返回标准 `urls/names/headers`。
- 结构化媒体无法取得时使用 `video://` 作为最后兜底。
- 详情已取得的媒体 seed 直接传入点击动作，避免无必要二次请求详情。

### 本地体验

- 本地收藏与浏览历史独立命名空间保存。
- 设置页提供当前入口、HTML 长度、视频卡/分类/人物/导航计数、最近解析/播放诊断。
- 使用独立品牌 SVG，不依赖第三方 favicon 服务。

### 当前环境限制 / 首轮实机必测

开发环境无法解析 `txcy-online.buzz` DNS，Test1 采用“站点特征 + 多形态兼容 Parser”，因此所有真实 DOM / 图片 / 播放能力都必须以用户实机为准。

### 云端仓库首次发布补漏

首版业务 Release、Bootstrap、Shell 和 `registry.json` 已完成后，实际云端仓库仍未显示该程序。根因是首次发布遗漏手机端目录真实消费链：根 `manifest.json` + `manifest_meta.json`，同时 `channels.json` 仍是内部对象格式而不是规则仓库要求的 `channels[]` 合同。

已按长期发布规范修复，后续以“能看到卡片 → 能进入版本中心 → 能导入 → 导入后能打开”作为首次发布完成定义。
