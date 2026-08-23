# 溏心次元 CHANGELOG

## 当前基线

- App ID：`tangxincyuan`
- 当前通道：Test
- 当前版本：`0.1.0-test.1` / Build `10101`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 用户当前源站入口：`https://txcy-online.buzz/banshu/`
- 架构：Remote Shell → Bootstrap → Remote Manager 2.0.1 → immutable release。
- 当前没有 Stable；首轮必须先实机验证，再建立站点专用 Adapter，禁止把 Test1 直接晋级 Stable。
- 云端仓库发布链已补齐：`channels.json` 已改为 schema 4 / `channels[]`，根 `manifest.json` revision `202608232003` 已加入溏心次元，`manifest_meta.json` 同步 revision 且 `itemCount=16`。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 产品目标

从头重写，不照搬旧小程序。首版按用户当前网页截图重建信息架构，并为后续站点 DOM/API 精确适配保留清晰模块边界：

```text
Home
├─ 搜索
├─ 官网主导航
├─ 热门女优
├─ 分类频道
└─ 最新内容

Category Hub
├─ 栏目：麻豆原创 / 代理节目 / 节目企划 / 国产精选等
├─ 系列：MD / MDS / MDX / MDXS / MDL / MMZ / MAD / MDWP等
└─ 片商：麻豆 / 果冻 / 皇家华人 / SWAG / 天美 / 精东 / 星空无限等

Actress Hub
Search
Detail / Player
Favorites / History
Settings / Diagnostics
```

### Core / Provider

- 默认入口不是域名根目录，而是完整 `https://txcy-online.buzz/banshu/`，避免错误退回 `/`。
- Root Manager 保留当前完整路径；入口失效时可从页面发现 `txcy/tangxin` 候选 URL，再进行有限探活。
- 首页、分类、女优、搜索、详情与媒体解析均由独立函数提供，不把 DOM 解析散落在 UI。
- 分类先动态读取真实 `<a>` 链接，再按栏目/系列/片商分组；不会硬猜未知分类 URL。
- 首版已加入当前截图及公开索引中确认过的分类名称词典，只用于“识别分类名称”，不硬编码跳转地址。
- 女优入口优先识别带头像且上下文含 `actor/star/model/女优/女優` 的真实链接。
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
- 设置页提供当前入口、HTML 长度、视频卡/分类/女优/导航计数、最近解析/播放诊断。
- 使用独立品牌 SVG，不依赖第三方 favicon 服务。

### 内容边界

首页、分类、搜索、详情和本地列表统一过滤明显涉及未成年人或明确非自愿私密影像的条目；这些内容不进入本程序浏览/播放链。

### 当前环境限制 / 首轮实机必测

开发环境当前无法解析 `txcy-online.buzz` DNS，无法把未知 DOM 当成事实。Test1 采用“站点特征 + 多形态兼容 Parser”，用户实机首轮需要确认：

1. 首页是否能识别真实视频卡、封面、主导航。
2. 首页女优头像和人物链接是否正确。
3. 分类中心是否完整识别 MD/MDS/MDX/MDXS/片商等分类，是否有重复或漏项。
4. 分类页分页 URL 的真实形态。
5. 搜索实际是 GET、POST 还是 AJAX。
6. 详情标题、封面、分类标签和相关推荐节点。
7. 播放字段位于详情 HTML、`player_*` 配置、iframe 还是 JS 渲染层；是否存在加密 HLS。
8. 图片是否需要额外 Cookie、特殊 Referer 或解密。

Test1 发布后冻结；后续根据用户实机截图和诊断新建更高 Build，不原地覆盖。

### 云端仓库首次发布补漏

首版业务 Release、Bootstrap、Shell 和 `registry.json` 已完成后，实际云端仓库仍未显示该程序。根因是首次发布遗漏了手机端目录真实消费链：根 `manifest.json` + `manifest_meta.json`，同时 `channels.json` 仍是内部对象格式而不是规则仓库要求的 `channels[]` 合同。

已按长期发布规范修复：

```text
channels.json → schema 4 / channels[]
→ root manifest.json 增加 tangxincyuan channel-group
→ manifest revision 202608232003
→ root manifest_meta.json 同步 revision 202608232003 / itemCount 16
→ GitHub main 回读
```

后续以用户在“我的规则仓库”执行同步后能看到程序、进入版本中心并成功导入为最终实机完成条件。
