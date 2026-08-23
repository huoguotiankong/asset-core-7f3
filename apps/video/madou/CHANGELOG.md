# 麻豆传媒 CHANGELOG

## 2026-08-23 · 0.1.0-test.3 / Build 10103

### 实机故障
- Test2 已能正常进入首页，但用户实机点击分类、影片卡/播放入口时弹出：`找不到“%E9%BA%BB%E8%B1%86%E4%BC%A0%E5%AA%92”这个小程序`。
- 首页四个快捷入口显示为海阔默认彩色圆形占位，缺少真实图标。
- 首页自适应卡片中还误识别出 `arrow` 等导航资源。

### 根因
- `MadouCore.page()` 把中文规则名 `麻豆传媒` 使用 `encodeURIComponent()` 后写进 `hiker://page/...?...&rule=`。目标海阔路由没有在规则名匹配前把该字段还原，直接把 `%E9...` 当规则名，因此二级页全部找不到当前小程序。
- 英文规则名样本不会暴露这个问题，中文规则必须按已验证的 MDAI 模式使用 `rule=&simple=true`，让二级页继承当前规则上下文。
- `icon_4` 没有设置图片时会渲染默认圆形占位；正式产品入口必须提供真实图标资源。

### Test3 修复
- 冻结 Test2，不原地覆盖；新建 Test3 / Build10103。
- 内部 `hiker://page` 统一改为 `rule=&simple=true`，URL 参数继续单独编码。
- 首页搜索不再构造带编码中文规则名的 `hiker://search`，改为进入 `madouSearch` 内部页面。
- 新增搜索、分类、收藏、历史四枚独立 SVG 图标，快捷入口切到 `icon_small_4` 并显式传入 `img/pic_url`。
- `parseCards()` 增加导航伪卡过滤，排除 `arrow / next / prev / more / menu / home` 等明显非视频条目。
- 保留 Test2 的大 HTML 内存缓存修复；本次不扩大协议层和播放解析边界。

### 回归重点
- 点击“全部分类”和横向分类标签应不再出现编码规则名错误。
- 点击任意影片卡应进入详情页。
- 进入详情后再测试“立即播放”，区分路由问题与真实媒体解析问题。
- 首页四个快捷入口应显示真实线性 SVG 图标，不再是默认彩色圆圈。
- `arrow` 伪卡应从首页内容流消失。

## 2026-08-23 · 0.1.0-test.2 / Build 10102

### 实机故障
- Test1 首次启动直接报错：`InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`。
- 用户实机截图优先于代码推测，确认故障发生在首页解析阶段，不是 DOM、分类或播放协议本身。

### 根因
- Test1 `MadouCore.fetchHtml()` 把完整网页 HTML 直接 `setItem(key, h)` 持久化。
- `madoup2.cc` 首页实际 HTML 体积超过海阔私有存储约 1MB 限制，因此在内容解析前就被 JSEngine 中止。
- 大型网页原文不属于适合 `setItem` 的状态数据；私有 KV 只应保存小型状态、索引、时间戳和诊断值。

### Test2 修复
- 冻结 Test1，不原地覆盖；新建 Test2 / Build10102。
- 新增 `storage_patch.js`，覆盖 `fetchHtml()`：完整 HTML 只保留当前运行内存，不再写入 `setItem`。
- 每次请求前清理同 URL 的旧 raw HTML 缓存槽；启动时额外清理 Test1 首页已知缓存 key。
- 仅持久化 `HTML length / fetch timestamp` 等很小的诊断值。
- `cachePrefix` 升为 `madou_v2_`，避免后续继续碰撞 Test1 HTML KV。
- 保留分页模板、收藏、历史等小型 KV，不扩大修改边界。
- 新 Bootstrap/Shell 指向 Test2，Remote Manager `minBuild` 提升到 10102。

### 回归重点
- Test2 首先验证“可以进入首页且不再弹 1MB 存储错误”。
- 启动恢复后，再继续观察真实首页 HTML、动态分类、内容卡、详情与播放链；本次不把尚未验证的解析功能误判为已完成。

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
