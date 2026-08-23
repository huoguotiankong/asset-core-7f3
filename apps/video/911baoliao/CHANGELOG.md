# 911爆料 CHANGELOG

## 当前基线

- App ID：`911baoliao`
- 当前通道：Test
- 当前版本：`0.1.0-test.1` / Build `10101`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 源站入口：`https://begin.mrbyudbq.com/`
- 架构：Remote Shell → Bootstrap → Remote Manager 2.0.1 → immutable release。
- 该程序不实现评论、匿名投稿或下载功能。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 产品结构

首版采用干净模块重新实现，不复制 51吃瓜 Test1~Test5 的补丁堆栈：

```text
Core
├─ Request / dynamic base
├─ dynamic Category extractor
├─ generic Feed/Search parser
├─ Detail parser
├─ Image normalizer
├─ Playback extractor / direct / iframe / sniff fallback
├─ local Favorites / History
└─ Diagnostics

Runtime
├─ Home
├─ Category Hub / Feed
├─ Search
├─ Detail / Player handoff
├─ Favorites / History
└─ Settings / Diagnostics
```

### 功能基线

- 首页热点流与自动分页。
- 官网导航动态分类，不写死 51吃瓜分类路径。
- 独立站内搜索页，多种常见搜索路径有限尝试。
- 图文详情、正文图片、相关推荐。
- 结构化 MP4/HLS、iframe 二跳媒体提取；没有结构化媒体时 `video://` 作为最后兜底。
- 单线路直接交付，多线路才构造 `urls/names/headers`。
- 详情取得的媒体 seed 直接传给播放动作，避免点击后无必要二次请求详情。
- 本地收藏、浏览历史、清理功能。
- 当前域名、HTML 长度、内容卡/分类数量和最近播放路线诊断。

### 明确不实现

- 评论及楼中楼。
- 匿名投稿、上传。
- 资源下载、侵权资源导出。

### 内容边界

首页、分类、搜索、详情与本地列表统一经过内容过滤；明显涉及未成年人或明确非自愿私密影像的条目不进入本程序浏览/播放链。

### 当前待实机确认

当前开发环境无法解析 `begin.mrbyudbq.com` DNS，因此 Test1 采用多页面形态兼容 Parser，而不是把未验证 DOM 猜成站点事实。首轮实机需要确认：

1. 首页是否能识别真实卡片与封面。
2. 分类导航的真实 URL 形态。
3. 搜索实际路由。
4. 详情正文/图片节点。
5. 播放字段位于 HTML、DPlayer config、iframe 还是 JS 渲染层。
6. 图片是否需要特殊 Header、解密或代理。

Test1 一旦发布即冻结；后续根据实机截图/诊断建立 911 专用 Adapter，以新 Test 追加，不原地覆盖。
