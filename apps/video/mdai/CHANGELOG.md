# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 当前基线
- App ID：`mdai`
- Remote Stable：`2.6.3 / Build 26301 / Shell 1.0.0`（已实机验证，继续冻结）
- Remote Test：`2.8.0-test.2 / Build 28002 / Shell 1.2.1-test`
- Local：`2.6.3-local.1`
- Stable 入口：`apps/video/mdai/mdai_remote_v1.txt`
- Test 入口：`apps/video/mdai/mdai_remote_test_v7.txt`
- Local：`mdai.txt`，导入名 `麻豆AI 本地版`
- 正式图标资产：`apps/video/mdai/assets/mdai_official.png`

## 当前 Test 运行链
```text
mdai_remote_test_v7.txt / rule version 2026082305
→ bootstrap_test_v7.js / state id=mdai-test / minBuild=28002
→ Remote Manager v2.0.1
→ releases/2.8.0-test.2/release.json
→ core.js          复用 Stable 2.6.3 协议数据桥
→ playback.js      复用 2.7 Test1 PlaybackAdapter
→ ui_base.js       复用 2.8 Test1 Native UI Design System
→ pages_content.js 复用 2.8 Test1 首页 / 片库 / 搜索 / 我的 / 评论
→ pages_detail.js  复用 2.8 Test1 详情与选集信息架构
→ settings.js      复用 2.8 Test1 分组设置
→ runtime.js       Test2：跨页状态恢复 + PNG 正式图标注入
```

## 2.8 产品级 UI 重构
2.7 已解决片库缺项、分类点击压新页面、横向溢出等结构性问题，但用户实机反馈整体仍有明显“规则拼装感”，因此 2.8 不再局部换皮，重新定义跨页骨架。

```text
Home
→ 搜索
→ 推荐 / 视频 / 短剧 / 社区（固定四栏，原页切换）
→ 片库 / 收藏 / 历史 / 设置（快捷入口）
→ 业务内容区

Library
→ 视频 / 短剧
→ 原创 / 国产 / 字幕
→ 主题分类（默认折叠，按需展开全部）
→ 筛选与排序（默认折叠）
→ 内容列表

Detail
→ Hero
→ Primary Play
→ 剧情简介
→ 低频操作
→ 选集控制
→ 真实 Episode Grid
→ 猜你喜欢
```

固定实现：
- 首页固定四栏使用等宽组件，避免长标题横向溢出。
- 页面内 Tab / 分类 / 排序 / 筛选统一 `lazyRule → MyVar → refreshPage(false)`；只有首次进入独立功能页时导航一次。
- 片库已验证分类继续由 CatalogAdapter 维护稳定骨架，再合并动态接口；接口缺项不能让已知分类消失。
- 主题分类默认只展示前 6 个，使用“展开全部 / 收起”控制，避免按钮墙占满首屏。
- 高级筛选默认折叠为一行摘要，展开后才展示 `默认 / 近1月 / 20分+ / 点赞`。
- 搜索提交后在搜索页原地刷新结果，不为每个关键词继续压新页面。
- “我的”收藏/历史使用同页状态切换。
- 详情页第一主操作保持播放/继续播放；收藏、评论/片库等低频操作下沉。
- 选集控制与 Episode Grid 分离；网格内只允许真实集数。
- 2.8 首轮只重构 UI / Product 层，不改 2.7 PlaybackAdapter，避免 UI 与播放协议同时变化。

### Test2 发布前修正
发布 Test1 后静态走查发现两个导航状态风险，未等用户实机踩坑即升 Test2：
- 首页点“收藏/历史”时，Runtime 会先把 query `mode` 同步到 `mdai_mine_tab_v280`，不受上一次“我的”页状态污染。
- 短剧详情进入片库时，Runtime 会先把 query `type=drama` 同步到 `mdai_library_type_v280`，避免打开后仍显示上一次视频片库。
- 这两个修正只发生在 Runtime，不重写 Test1 UI 模块。

待实机闭环：
- [ ] 首页推荐 / 视频 / 短剧 / 社区四栏比例、间距和长标题表现自然。
- [ ] 片库默认高度明显下降，分类可展开/收起且不会压新页面。
- [ ] 搜索页连续换关键词仍在同一页面。
- [ ] 首页收藏/历史快捷入口始终进入正确状态。
- [ ] 短剧详情进入片库后始终落到短剧状态。
- [ ] 普通视频与短剧详情 Primary Play 层级明显，不被收藏/评论抢视觉。
- [ ] 选集排序/区间不混入真实集数网格。
- [ ] 不因 UI 重构导致 Stable 2.6.3 数据协议或 2.7 播放回归。

## 正式图标资产事实
用户使用独立 Favicon 工具在实机可访问环境取得原站内嵌图标：

```text
data:image/jpeg;base64,iVBORw0KGgo...
```

实际解码后的文件头是 PNG（`89 50 4E 47`），尺寸 `32×32`；内容为黑底紫/蓝渐变播放标识。Data URI 的 MIME 前缀与真实文件格式不一致，因此不能只相信声明类型。

最终处理：
- 不再依赖运行时 favicon 探测作为正式程序图标。
- 不使用第三方 Favicon API 作为长期资产源。
- 不用 AI 近似重绘，因为已经获得真实原始像素。
- Test1 曾先建立 SVG 包装资产作为过渡，但发布前考虑 Android/海阔 SVG `<image data:...>` 兼容不确定性，Test2 再固化**真实 PNG 二进制文件**：`apps/video/mdai/assets/mdai_official.png`。
- Test Shell、云仓库主卡以及 Stable/Test/Local 三个 channel card 统一引用 PNG 资产。
- 业务 Stable 2.6.3 本身未因图标改版；当前只更新仓库展示/通道事实源与 Test Shell。

固定规则：**数据 API Client 与 Raw Resource Client 必须分层；Data URI 图标若是正式来源，应先解码验证真实格式，再固化为项目静态二进制资产，不把超长 Data URI 长期塞进 manifest，也不依赖 SVG 内嵌 raster 作为唯一正式路径。**

## PlaybackAdapter 2.7
2.8 Test2 继续沿用 Test1，不在本轮改播放：
- `smart`：稳定代理 + 原始直链。
- `direct`：原始直链优先。
- `proxy`：只走站点稳定代理。
- `compat`：显式启用时才 `cacheM3u8()`。
- 播放诊断：`mdai_play_diag_v2`。

当前站点事实继续沿用 Stable 2.6.3：
- 默认 Host：`https://mdcmai4.xyz`。
- 主要接口：`/api/v1/`。
- 稳定 M3U8 代理：`/api/v1/m3u8/proxy?path=`。
- 播放请求使用当前站点 Referer/UA。

## 2.7 已解决的片库事故
- 动态接口非空时整批覆盖本地分类骨架，导致接口少项时用户可见分类消失：已改 CatalogAdapter 合并策略。
- 一级分类使用 `scroll_button` 出现右侧 `>` 溢出：固定三栏改等宽组件。
- 分类/筛选使用 `hiker://page` 跳转导致连续压页面栈：已改原页状态更新。

## 本地状态
- 历史：`mdai_watch_history_v1`
- 收藏：`mdai_favorites_v1`
- 搜索历史：`mdai_search_history_v1`
- Core 快照：`mdai_core_snapshot_263_v270`
- 播放策略：`mdai_play_strategy_v2`
- 播放诊断：`mdai_play_diag_v2`
- 2.8 首页 Tab：`mdai_home_tab_v280`
- 2.8 片库类型：`mdai_library_type_v280`
- 2.8 片库栏目：`mdai_library_menu_v280`
- 2.8 片库分类：`mdai_library_cat_v280`
- 2.8 分类展开：`mdai_library_expand_v280`
- 2.8 高级筛选展开：`mdai_library_adv_v280`
- 2.8 我的 Tab：`mdai_mine_tab_v280`

## 回归 / 恢复
- 2.8 UI 未完成实机截图闭环前不得晋级 Stable。
- Test 异常时覆盖 Stable 2.6.3 或导入 `麻豆AI 本地版`。

---
## 版本记录
### 2.8.0-test.2 / 2026-08-23
- 完整继承 Test1 UI 重构，不再重写页面模块。
- 发布前补收藏/历史、短剧片库的跨页状态恢复。
- 将原站图标从过渡 SVG 包装升级为真实 PNG 二进制资产，Test Shell/云仓库/通道卡片统一引用 PNG。
- Build28002 / Shell v7 / Bootstrap v7；Stable 2.6.3 与 PlaybackAdapter 不变。

### 2.8.0-test.1 / 2026-08-23
- 从 2.7 局部优化升级为完整产品级 UI 重构。
- 首页、片库、搜索、我的、详情、设置统一重写信息架构。
- 首次固化用户实机取得的原站图标资产；在 Test2 进一步升级为真实 PNG。

### 2.7.0-test.4 / 2026-08-23
- 修复官网图标检测误走 JSON API Client；改为原始 HTML / manifest 资源解析。

### 2.7.0-test.3 / 2026-08-22
- 首次加入官网图标检测；实机发现 HTML 被 JSON Client 提前判错。

### 2.7.0-test.2 / 2026-08-22
- 修复片库分类完整性、溢出 `>` 和分类连续开新页面问题；新增 CatalogAdapter。

### 2.7.0-test.1 / 2026-08-22
- 基于 Stable 2.6.3 开始 Core / Playback / UI / Content / Detail / Runtime 模块化重构。

### 2.6.3 Stable / 2026-08-22
- 用户实机确认 `2.6.3-test.1 / Build26301` 正常后原样晋级。
