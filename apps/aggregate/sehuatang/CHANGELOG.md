# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.29 / Build 10129 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v29_b10129.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v29_b10129.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.29/release.json`
- Test29 继承 Test1~Test28，并新增：`releases/0.1.0-test.29/patch_guide_thread_preview_v29.js`。

## 0.1.0-test.29 / Build 10129 — Guide 预览图改用真实帖子正文补齐

### Test28 实机反馈

1. 最新热门等三个 Guide 原生页面的排版已经与目标方向一致；
2. 但预览图片仍与 Test27 相同，完全没有显示；
3. 因此 Test28 的“Guide 卡片切片边界错误”并不是预览图缺失的主因；
4. 现阶段已能确定：Guide 页面文字/作者/统计可以原生解析，但 Guide 自身返回给规则层的 DOM/HTML 不能稳定提供可直接复用的预览图片；普通子版块和帖子详情图片链仍正常。

### Test29 方案

1. **停止继续从 Guide DOM 猜图片**
   - Guide 仍负责主题列表文字、作者、摘要、统计和排序；
   - 如果 Guide 本身已经拿到图片就直接使用；
   - 只有缺图主题才进入图片补齐链。

2. **从真实帖子页取预览图**
   - 每个缺图主题使用其真实 `mobile=2` 帖子 URL；
   - 使用海阔官方 `be/batchExecute` 多线程接口并发请求，最多由宿主控制16线程；
   - 从楼主正文区域优先识别 `zoomfile/file/data-original/data-src/data-lazy-src/data-echo/data-url/data-actual/data-cfsrc/src/srcset`；
   - 继续过滤头像、smiley、loading、placeholder、logo、广告图等噪声；
   - 每帖最多取3张。

3. **图片加载上下文改为帖子页**
   - Guide 卡片中的图片不再统一使用 Guide URL 作为 Referer；
   - 每张补齐预览图使用对应真实帖子 URL 作为 Referer，再走现有 Cookie / Mobile UA 图片链；
   - 这一点与帖子详情页已经能正常加载正文图片的运行环境对齐。

4. **性能控制**
   - 每个 `tid` 的预览结果缓存12小时；
   - 每个 Guide `mode + page` 的完整结果缓存3分钟；
   - 首次进入会比纯文字列表多一次并发补图，后续进入优先命中缓存；
   - 不修改普通子版块、搜索、帖子详情、评论页。

### Test29 静态门禁

- `patch_guide_thread_preview_v29.js`：本地 `node --check` 通过；
- `bootstrap_test_v29_b10129.js`：本地 `node --check` 通过；
- `release.json / test.json / channels.json / manifest.json`：本地 JSON 解析通过；
- Test29 Shell：外层规则 JSON和内层 `pages` JSON解析通过；
- Shell `version=2026092329`；
- Release / Bootstrap / Shell 固定 `asset-core-7f3@main`，未新增 `hiker-cloud` 依赖。

### Test29 实机优先验收

1. 最新热门第一屏是否出现真实预览图；
2. 顶部是否显示“xx 张预览图”，用于区分“没有提取到URL”和“提取到URL但加载失败”；
3. 首次进入耗时是否可接受，退出后短时间再进入是否明显变快；
4. 卡片排版、标题、摘要和统计应保持 Test28 现状不退化。

## 0.1.0-test.28 / Build 10128 — Guide 专用卡片边界解析（实机未解决预览图）

- Test27 已确认原生排版方向正确，但 Guide 仍无预览图；
- Test28 将每个 tid 第一次出现固定为卡片边界，标题选择与边界分离；
- 实机结果：排版不退化，但预览图依然完全缺失；
- 结论：不再继续把问题归因于 Guide 卡片切片，Test29 转向真实帖子页补图。

## 0.1.0-test.27 / Build 10127 — Guide 与普通子版块统一 mobile 渲染链

- 三个话题保持海阔原生页面；
- 首选 `mobile=2 + C.renderList()`；
- 作者/标题/摘要/统计排版恢复，实机确认方向正确；
- 预览图仍缺失。

## 0.1.0-test.26 / Build 10126 — Guide 原生快速链

- 撤销 Test25 网页直显，恢复海阔原生话题页；
- 首选 mobile=2 快速 fetch，进入速度改善；
- 实机结果：文字正常，但图片和手机卡片层级不足。

## 0.1.0-test.25 / Build 10125 — Guide 手机网页直显（实机否决）

- 网页直显图片与网站排版正常且快；
- 用户明确要求话题分类保持海阔原生页面，因此撤销。

## 0.1.0-test.24 / Build 10124 — Guide DOM 图片映射（实机未通过）

- WebView 按 tid 映射图片；原生层仍灰图且等待明显。

## 0.1.0-test.23 / Build 10123 — Guide 图片候选对齐（实机未通过）

- 对齐 lazy/file/zoomfile/currentSrc 等候选；原生仍灰图。

## 0.1.0-test.22 / Build 10122 — Guide DOM 图片提取

- 从渲染 DOM 抓 currentSrc/src/lazy/file/zoomfile/CSS background，候选存在但原生显示失败。

## 0.1.0-test.21 / Build 10121 — Guide 手机卡片层级

- 建立作者、标题、摘要、最多3图、评论/点赞/观看的卡片结构。

## 0.1.0-test.20 / Build 10120 — 账号/签到手机端化与 Guide 恢复

- 账号与签到默认 mobile=2；三个话题恢复 mobile Guide。

## 0.1.0-test.19 / Build 10119 — 首页单页守卫与分类/排序独立选择器

- 首页不再在下一页重复整套内容；分类和排序拆开并用页内刷新。

## 0.1.0-test.18 / Build 10118 — 筛选/统计排版修正

- 清理 HTML 噪声/灰按钮；回复/点赞/观看弱化显示。

## 0.1.0-test.17 / Build 10117 — 子板块分类与排序

- 接入各子板块自己的 typeid/sortid 与 filter/orderby/digest。

## 0.1.0-test.16 / Build 10116 — 评论分离与图片正文顺序

- 详情只显示楼主正文；评论独立 shtComments；色花图片补图提前；作者信息独立一行。

## 0.1.0-test.15 / Build 10115 — 分类差异化目录

- 在线视频双列；色花文学短标题；色花图片正文补图；普通帖子作者元数据独立。

## 关键历史节点

### Test14 / Build 10114
- 修复 `thread()` 变量错误；主题卡片按标题锚点切片。

### Test13 / Build 10113
- mobile=2 WebView触发 lazy-load；正文图片按手机网页顺序；翻页改页内刷新。

### Test12 / Build 10112
- 普通板块与帖子详情 mobile=2 优先；扩展 lazy/file/zoomfile/srcset 图片识别。

### Test11 / Build 10111
- 标题/摘要/多图预览卡片和显式翻页；**实机确认搜索恢复正常**。

### Test9~Test10
- 修复“HTML 很长即成功”的误判；详情多变体；加入115/迅雷/PikPak图标。

### Test5~Test8
- 年龄确认 Cookie；六个一级根 fid：2、41、145、155、154、95；PC正文 `#postlist > div → .t_fsz → .t_f`；访问与Cookie状态分离；BTIH去重。

### Test1~Test4
- 建立论坛/搜索/主题/帖子 Parser；magnet 115/迅雷/PikPak/复制；支持 tid/ptid/thread-id。

## 当前禁用 / 待确认

- 不绕过验证码、人机验证或其它真人验证；
- 未实机确认前，不直接 POST 签到或回帖；
- 不保存真实账号、密码、Cookie、formhash 到仓库；
- Test 阶段不晋级 Stable，不登记根 `registry.json`；
- 当前下一步：Test29 实机确认“帖子详情并发补图”能否让三个 Guide 原生页真正出现预览图片，同时观察首次加载耗时与缓存收益。
