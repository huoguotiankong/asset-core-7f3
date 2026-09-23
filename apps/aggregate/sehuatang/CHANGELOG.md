# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.25 / Build 10125 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v25_b10125.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v25_b10125.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.25/release.json`
- Test25 继承 Test1~Test24，并新增：`releases/0.1.0-test.25/patch_guide_webview_v25.js`。

## 0.1.0-test.25 / Build 10125 — 三个话题改为 mobile=2 网页直显

### Test24 实机反馈

1. “最新热门 / 最新精华”等话题原生页仍显示三列灰色预览占位，同一主题在官网 `mobile=2` 页面中预览图正常；
2. 普通子板块同设备、同运行环境的预览图一直正常，说明海阔图片组件本身和普通板块 `C.imageUrl()` 输出链不是全局故障；
3. Test24 已经在 Guide WebView 中按 tid 直接读取已渲染图片并保存映射，但原生图片组件仍无法稳定重放这些资源；
4. 三个话题进入速度明显慢于普通板块，主要等待来自隐藏 WebView 的多段滚动、懒加载触发、DOM 映射和原生重建；
5. 官网 mobile Guide 本身图片、标题、摘要、作者、评论/浏览排版已经符合当前产品目标。

### Test25 产品/架构调整

1. **停止继续把 Guide 预览图片搬运到原生图片组件**
   - Test21~24 已连续多轮验证 DOM 属性、`currentSrc`、lazy 属性、CSS background、tid 映射、普通板块图片 Header 链；
   - 实机仍为“官网图片正常、Guide 原生灰图”，继续在同一方案上追加属性猜测价值很低；
   - Test25 将“最新发表 / 最新热门 / 最新精华”改为 `x5_webview_single` 直接显示官网 `mobile=2` Guide。

2. **直接复用手机网页成熟视觉**
   - 预览图片由浏览器本身加载，不再经过原生图片二次请求；
   - 作者头像、用户名、标签、标题、摘要、多图预览、评论/浏览统计全部保持官网手机端真实排版；
   - 不再生成三列灰色占位。

3. **明显缩短入口等待**
   - 取消 Test24 的三段滚动采图、DOM `tid -> image[]` 映射、HTML 再解析和原生列表重建；
   - Guide 页面只加载一次真实 mobile 网页；
   - 仅屏蔽 `.woff/.woff2/.ttf` 字体资源，不阻断图片；
   - 使用 `x5_webview_single` 的 `list&&screen-56` 作为主要显示区域。

4. **保留年龄确认与 Cookie 同步**
   - WebView 加载过程中继续识别声明式 18+ 页面并自动点击；
   - 正常页面继续把 WebView Cookie 同步到 `sht_web_cookie_v5`，并记录 `sht_access_ok_v7`；
   - 不绕过验证码、人机验证或其它真人挑战。

5. **Guide 点帖子仍回原生详情**
   - 使用 `x5_webview_single.extra.urlInterceptor` 识别 `tid / ptid / thread-*` 帖子链接；
   - 点击帖子后调用 `fy_bridge_app.open()` 打开 `hiker://page/shtThread`；
   - 因此帖子详情继续保留评论页、磁链识别、115 / 迅雷 / PikPak、视频嗅探等原生能力；
   - 其它普通网页导航仍留在当前手机 WebView。

6. **保持不动**
   - 普通子板块原生目录；
   - 子板块分类 / 排序；
   - 搜索；
   - 帖子详情 / 评论页；
   - 账号 / 签到 mobile=2；
   - 首页六大类与首页单页守卫。

### Test25 静态门禁

- `patch_guide_webview_v25.js`：本地 `node --check` 通过；
- `bootstrap_test_v25_b10125.js`：本地 `node --check` 通过；
- `release.json / test.json / channels.json / manifest.json`：本地 JSON 解析通过；
- Test25 Shell：外层规则 JSON与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092325`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test25 实机优先验收

1. 打开“最新热门”：首屏应直接出现官网 mobile 卡片和真实预览图，不再先等待几十秒生成原生卡片；
2. “最新发表 / 最新精华”同样检查图片与进入速度；
3. 在 Guide 手机页面点任意帖子，确认能跳回色花堂原生帖子详情，而不是丢失磁链云播能力；
4. 若帖子链接拦截在某种伪静态 URL 下未命中，仅修 urlInterceptor，不再回退原生 Guide 图片搬运方案。

## 0.1.0-test.24 / Build 10124 — Guide WebView DOM 图片映射（实机未通过）

- WebView 中按 tid 定位帖子卡片并读取实际渲染图片；
- 使用 `fba.putVar` 保存 `tid -> image[]`；
- 原生侧仍使用普通板块 `C.imageUrl()` 输出；
- 实机结果：Guide 原生预览图仍灰图，同时隐藏 WebView 采集显著拖慢页面进入；
- 结论：Test25 不再沿用“WebView采图 → 原生图片组件重放”作为 Guide 主链。

## 0.1.0-test.23 / Build 10123 — Guide 图片候选与普通板块对齐（实机未通过）

- 优先 `data-original / data-src / data-lazy-src / file / zoomfile`；
- `currentSrc/src` 只有 natural size 合格才接受；
- 原生图片输出完全复用普通板块 `C.imageUrl()`；
- 实机仍灰图。

## 0.1.0-test.22 / Build 10122 — Guide DOM 图片提取

- 从渲染 DOM 提取 `currentSrc/src/lazy/file/zoomfile` 与 CSS background；
- 页面增加主题数/图片候选数诊断；
- 实机证明 DOM 能找到图片候选，但原生显示仍失败。

## 0.1.0-test.21 / Build 10121 — Guide 卡片手机化

- 三个话题复用手机帖子卡片 Parser；
- 作者、标题、摘要、最多3张预览图、评论/点赞/观看按手机网页层级布局；
- 实机确认标题/作者结构方向正确，但原生预览图灰色。

## 0.1.0-test.20 / Build 10120 — 账号/签到手机端化与三个话题恢复

- 账号默认 `member.php?mod=logging&action=login&mobile=2`；
- 签到默认 `plugin.php?id=dd_sign:index&mobile=2`；
- 三个话题恢复 mobile=2 Guide 数据链；
- 实机确认 Guide 可取得真实主题。

## 0.1.0-test.19 / Build 10119 — 首页单页守卫与分类/排序独立选择器

- 首页 `MY_PAGE > 1` 不再重复追加整套首页；
- 子板块“分类”和“排序”拆为独立选择器；
- 分类、排序和翻页使用 `refreshPage(false)`，避免返回栈累积。

## 0.1.0-test.18 / Build 10118 — 筛选/统计排版修正

- 清理 `<small>/<font>` 源码泄漏和灰色空按钮；
- 回复 / 点赞 / 观看改为弱化统计文本；
- 清理 `✓ / > / 更多` 等筛选噪声。

## 0.1.0-test.17 / Build 10117 — 子板块独立分类与排序

- 接入各子板块自己的 `typeid/sortid` 分类和 `filter/orderby/digest` 排序；
- 作者 / 标题 / 摘要 / 双图预览分层。

## 0.1.0-test.16 / Build 10116 — 评论分离与图片正文顺序

- 帖子详情只显示楼主正文，回复拆到独立 `shtComments`；
- 顶部“复制链接”改为“评论页”；
- 色花图片补图提前到楼主正文后；
- 作者头像、名字、角色、时间独立一行。

## 0.1.0-test.15 / Build 10115 — 分类差异化目录

- 在线视频分类采用双列视频卡片；
- 色花文学补短标题；
- 色花图片正文无图时从手机渲染页补图；
- 普通帖子作者元数据独立一行。

## 关键历史节点

### Test14 / Build 10114
- 修复 Test13 `thread()` 漏声明 `d=[]` 的 `ReferenceError`；
- 主题卡片按当前标题锚点到下一主题锚点截取。

### Test13 / Build 10113
- mobile=2 主题卡片通过 WebView 滚动触发 lazy-load；
- 正文图片按手机网页版顺序逐张全宽；
- 翻页改为当前页面刷新，不再累积返回栈。

### Test12 / Build 10112
- 普通板块与帖子详情改为 mobile=2 优先，PC 最小兜底；
- 扩展 lazy/file/zoomfile/srcset 图片识别。

### Test11 / Build 10111
- 建立标题 / 摘要 / 多图预览卡片和显式翻页；
- 搜索改为真实 Discuz 搜索表单提交；
- **实机确认搜索恢复正常**。

### Test9~Test10
- 修复“HTML 很长就误判成功”；
- 帖子详情恢复 PC/mobile/WebView 多变体；
- 加入 115 / 迅雷 / PikPak 独立 SVG 图标。

### Test5~Test8
- 建立年龄确认 Cookie 持久化与声明式 18+ 自动点击；
- 六个一级大类根 fid：原创BT电影 `2`、在线视频区 `41`、原档收藏 `145`、色花图片 `155`、色花文学 `154`、综合讨论区 `95`；
- PC 帖子正文成熟结构：`#postlist > div → .t_fsz → .t_f`；
- 访问状态与 Cookie 状态拆分，magnet 按 BTIH 去重。

### Test1~Test4
- 建立论坛 / 搜索 / 主题 / 帖子 Parser；
- magnet 提供 115 / 迅雷 / PikPak / 复制；
- 支持 `tid / ptid / thread-<tid>`。

## 当前禁用 / 待确认

- 不绕过验证码、人机验证或其它真人验证；
- 未实机确认前，不直接 POST 签到或回帖；
- 不保存真实账号、密码、Cookie、formhash 到仓库；运行态 Cookie 仅保存在海阔本地变量 / WebView Cookie 容器；
- Test 阶段不晋级 Stable，不登记根 `registry.json`；
- 当前下一步：Test25 实机验证三个 Guide 的网页直显速度、图片和“点击帖子回原生详情”链路，再继续整体视觉精修。
