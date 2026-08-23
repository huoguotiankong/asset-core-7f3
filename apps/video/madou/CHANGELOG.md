# 麻豆传媒 CHANGELOG

## 2026-08-23 · 0.1.0-test.5 / Build 10105

### 实机故障
- Test4 覆盖导入后，小程序首页启动即报：`SyntaxError: 在属性列表的后面缺少“}”`，来源为 `eval code#1`，说明故障发生在活动远程模块加载/解析阶段，业务首页尚未真正执行。
- 该结果优先于仓库代码意图：Test4 虽然目标是修分类层级与详情 1MB 问题，但实机已经证明它本身不是可启动恢复基线。

### 恢复决策
- Test4 / Build10104 整体隔离，不再被 Test5 Release 引用，也不做同 URL 原地修补。
- Test5 直接从最后一个实机确认能启动的 Test3 链恢复：`Test1 Core + Test2 storagePatch + Test1 runtime + Test3 navigationUiPatch`，然后只叠加新的 `recovery_hierarchy_patch.js`。
- 新 Release 的 `previous` 明确指回 Test3，而不是 Test4；Bootstrap `minBuild=10105`，新 Shell/Bootstrap 文件名与规则 version 同步递增，强制越过设备上可能残留的 Test4 active state/cache。

### Test5 重建范围
- 重新实现“大分类 → 小分类”模型，继续以源站侧栏中的 `精选推荐 / 欧美P站 / 原创AV / 网黄 / 乱伦 / 日韩 / 男同百合 / Onlyfans / 三级 / 猛料-SM / 成人综艺 / 短视频 / 性爱教学 / 影视剧` 作为大类 marker，并按 DOM 顺序归组真实子链接。
- 详情与列表只使用普通 `fetch/request` 获取大页面，不再把 `fetchCodeByWebView` 返回的大型 HTML 当通用 Provider 回传路径。
- 完整 HTML 只保存在当前运行内存；私有 KV 只写 HTML 长度、时间戳等小诊断值。
- 历史/收藏增加 URL、标题、图片、描述长度限制，总 JSON 超过约 600KB 时主动减半，继续防止接近海阔 1MB `setItem` 上限。
- 详情播放先扫描 `.m3u8/.mp4`，没有结构化媒体时再返回 `video://详情页`，当前仍属于播放链待实机确认阶段。

### 发布门禁
- 新 `recovery_hierarchy_patch.js` 已在本地执行 `node --check` 通过。
- 新 `bootstrap_test_v5_b10105.js` 已执行 `node --check` 通过。
- Test5 Shell JSON 由脚本生成并重新 `JSON.parse` 校验通过。
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 全部切到 Test5；根目录 revision 为 `202608231436`，`itemCount=11`。

### 回归重点
1. 先只确认 Test5 能正常启动首页，不再出现 Test4 的 JSEngine SyntaxError。
2. 再测“全部分类”，确认呈现大类展开小类，而不是扁平长列表。
3. 再点任意影片进入二级详情，确认不再触发 1MB 私有存储错误。
4. 最后单独测试立即播放；播放失败再继续拆真实播放器/媒体协议，不把启动、分类、详情与播放混在一起。

## 2026-08-23 · 0.1.0-test.4 / Build 10104

### 实机故障
- Test3 已恢复分类页面进入能力，但影片二级详情仍再次报：`InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`。
- 当前“全部分类”把网站导航全部拍平成一条长列表，用户实机明确指出源站真实产品结构是“多个大分类 → 每个大分类下大量小分类”，当前 UI/信息架构错误。

### 根因判断与修改边界
- Test2 只修了业务层 `fetchHtml()` 把完整 HTML 写进 `setItem` 的问题；Test3 的详情链仍允许 `fetchCodeByWebView()` 作为大页面 fallback。实机详情页再次触发同一 1MB 报错，说明不能再把大型渲染后 HTML 回传链当通用兜底。
- Test3 `menu()` 是扁平导航模型，适合抓链接但不适合作为用户分类目录；源站侧栏已经提供“大分类标题 + 子分类链接”的天然层级，需要独立 `CategoryGroupModel`。
- 内部页面此前仍通过 `$.require('madou')` 间接调用主模块。虽然 Test3 已修中文 `rule=` 路由，但升级后仍存在页面模块缓存/旧导出残留风险。本版把每个内部 page rule 改为直接加载当前 Bootstrap。

### Test4 修复
- 冻结 Test3，新建 `0.1.0-test.4 / Build10104`，不原地覆盖旧 Release。
- 新增 `hierarchy_detail_patch.js`：
  - `fetchPlainHtml()` 只使用普通 `fetch/request`，大页面不再走 `fetchCodeByWebView` HTML 回传。
  - `fetchHtml()` 仅保存在当前运行内存，只把 HTML 长度/时间戳等小诊断值写私有 KV。
  - 本地历史/收藏统一做字段裁剪、data URI 丢弃、条数/总 JSON 体积上限，避免其它异常数据再次把 `setItem` 推近 1MB。
- 新增 `categoryGroups()`：以当前首页/侧栏 DOM 中 `精选推荐 / 欧美P站 / 原创AV / 网黄 / 乱伦 / 日韩 / 男同百合 / Onlyfans / 三级 / 猛料-SM / 成人综艺 / 短视频 / 性爱教学 / 影视剧` 等大分类作为 group marker，按 DOM 顺序把真实子链接归入各组。
- “全部分类”重做为：
  - 分类中心摘要；
  - 首页/最新快捷入口；
  - 大分类原地展开/收起；
  - 展开后使用三列小分类入口；
  - 进入某小分类的内容页后，只显示同一大分类下的兄弟小分类横向快捷切换，不再把全站菜单混进内容页。
- 首页横向导航只展示大分类，不再显示大量小分类。
- 详情页使用普通请求解析；直连 HTML 无效时显示“网页媒体嗅探 / 原站详情”两个明确兜底，不再为了拿 DOM 触发大型 WebView HTML 返回。
- Test4 Shell 的首页、搜索、列表、分类、详情、收藏、历史、设置全部直接 `require(bootstrap_test_v4_b10104.js)` 后调用当前 `MadouBoot.module()`，减少旧 page module 命中的可能。

### 云仓库发布链
- `test.json / channels.json / app manifest / registry.json / root manifest.json / manifest_meta.json` 已全部切到 Test4。
- 根目录 revision 同步为 `202608231426`，`itemCount=11`；再次执行 `manifest.revision === manifest_meta.revision` 检查，避免上次“代码已升版但云仓仍显示旧 Test”的事故。

### 回归重点
1. “我的规则仓库”同步后必须显示 `Test 0.1.0-test.4 · Build 10104`。
2. 全部分类页应看到“大分类 → 展开后的多个小分类”，不能再是一条扁平长清单。
3. 打开“萝莉少女/精品推荐/欧美P站”等任意实际小分类，列表顶部只出现同组小分类。
4. 点击任意影片进入二级详情，不应再出现 1MB `setItem` 错误。
5. 详情成功后再测试“立即播放”；若失败，下一版只处理真实播放器/媒体源协议，不把详情存储问题和播放协议问题混在一起。

## 2026-08-23 · 0.1.0-test.3 / Build 10103

### 实机故障
- Test2 已能正常进入首页，但用户实机点击分类、影片卡/播放入口时弹出：`找不到“%E9%BA%BB%E8%B1%86%E4%BC%A0%E5%AA%92”这个小程序`。
- 首页四个快捷入口显示为海阔默认彩色圆形占位，缺少真实图标。
- 首页自适应卡片中还误识别出 `arrow` 等导航资源。
- Test3 代码、`test.json`、`channels.json` 和根 `manifest.json` 已更新后，用户实机“我的规则仓库”仍显示 Test2。

### 根因
- `MadouCore.page()` 把中文规则名 `麻豆传媒` 使用 `encodeURIComponent()` 后写进 `hiker://page/...?...&rule=`。目标海阔路由没有在规则名匹配前把该字段还原，直接把 `%E9...` 当规则名，因此二级页全部找不到当前小程序。
- 英文规则名样本不会暴露这个问题，中文规则必须按已验证的 MDAI 模式使用 `rule=&simple=true`，让二级页继承当前规则上下文。
- `icon_4` 没有设置图片时会渲染默认圆形占位；正式产品入口必须提供真实图标资源。
- 云仓库目录刷新另有独立发布合同：`manifest.json revision` 必须和 `manifest_meta.json revision` 同步变化。Test3 发布时根 `manifest.json` 已到 `202608231404`，但 `manifest_meta.json` 仍停在 `202608231342`，且 `itemCount` 仍为 10；规则仓库 freshness probe 因此没有检测到新目录，继续使用缓存中的 Test2。

### Test3 修复
- 冻结 Test2，不原地覆盖；新建 Test3 / Build10103。
- 内部 `hiker://page` 统一改为 `rule=&simple=true`，URL 参数继续单独编码。
- 首页搜索不再构造带编码中文规则名的 `hiker://search`，改为进入 `madouSearch` 内部页面。
- 新增搜索、分类、收藏、历史四枚独立 SVG 图标，快捷入口切到 `icon_small_4` 并显式传入 `img/pic_url`。
- `parseCards()` 增加导航伪卡过滤，排除 `arrow / next / prev / more / menu / home` 等明显非视频条目。
- 保留 Test2 的大 HTML 内存缓存修复；本次不扩大协议层和播放解析边界。
- 2026-08-23 14:11 将根 `manifest.json` 与 `manifest_meta.json` 同步提升到 revision `202608231411`，并把 `itemCount` 修正为 11，确保“同步目录”能够识别 Test3。

### 回归重点
- 在“我的规则仓库”点击“同步目录”后，麻豆传媒应显示 `Test 0.1.0-test.3 · Build 10103`。
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
