# 麻豆传媒 CHANGELOG

## 2026-08-23 · 0.1.0-test.1 / Build 10101

### 基线
- 新建程序 ID：`madou`，与现有 `mdai`（麻豆AI）严格隔离。
- 正式开发/运行源：`huoguotiankong/asset-core-7f3@main`。
- 源站：`https://madoup2.cc/`。
- 当前只有 Test 通道；未实机确认前禁止晋级 Stable。

### Product Blueprint
- Home：搜索 / 全部分类 / 本地收藏 / 浏览历史 + 原站动态分类 + 双列精选内容。
- Category：动态分类与分页内容流。
- Search：优先解析原站真实 `<form>`，再使用常见搜索参数做有约束 fallback。
- Detail：封面、标题、日期/时长、简介、标签、相关推荐。
- Playback：优先从详情 HTML 精确抽取 `.m3u8/.mp4`；抽取不到时使用海阔官方 `video://网页` 自动提取能力。
- Local：本地收藏、浏览历史。
- Settings：站点状态和解析计数诊断，不记录 Cookie/Token 等敏感信息。

### 分类恢复
用户实机截图显示当前侧栏至少包含：
`首页 / 精选推荐 / 欧美P站 / 原创AV / 网黄 / 乱伦 / 日韩 / 男同百合 / Onlyfans / 三级 / 猛料-SM / 成人综艺 / 短视频 / 性爱教学 / 影视剧`。
Test1 不把这些当永久 URL 常量，而是从原站导航动态提取；截图分类仅作为 fallback 标签。

### UI 决策
- 不照搬原站右侧抽屉和广告堆叠，改成海阔原生快速入口 + 横向分类 + 双列内容卡。
- 默认过滤 banner/advert/ads/promo 等广告链接，不把广告数组伪装成主内容。
- 二级页使用 `hiker://page/...?...&simple=true`，不采用沉浸式标题栏叠加结构。
- 详情页只保留一个真实“立即播放”媒体动作，避免多个清晰度媒体 item 污染海阔播放列表语义。

### 发布/索引状态
- 已写入 `registry.json`，程序恢复链可从 registry 定位到 manifest/Test/channels/release/Bootstrap/Shell/CHANGELOG。
- 已写入根 `manifest.json`，在“我的规则仓库”同步后可作为 Test 通道发现和导入。
- Test1 仍属于实机验证候选，不等于 Stable；只有首页、分类、搜索、详情、图片和播放链通过海阔实机回归后才允许晋级。

### 已知待实机确认
- 当前开发环境无法直接访问 `madoup2.cc`，因此 Test1 采用动态 DOM/JSON-LD 自适应解析器；真实 DOM 选择器、分页格式、搜索参数和播放链必须以用户手机实机结果为准继续收紧。
- 若普通 HTTP 返回验证页，Provider 会尝试 `fetchCodeByWebView`；若仍失败需根据实机诊断继续处理反爬/Cookie。
- 播放链尚未确认是否存在加密 M3U8、自定义 Header、二次接口或 JS player 配置；不能仅凭“抽到 URL”认定播放完成。
