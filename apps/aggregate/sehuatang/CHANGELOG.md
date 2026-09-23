# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.28 / Build 10128 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v28_b10128.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v28_b10128.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.28/release.json`
- Test28 继承 Test1~Test27，并新增：`releases/0.1.0-test.28/patch_guide_card_boundary_v28.js`。

## 0.1.0-test.28 / Build 10128 — Guide 专用卡片边界解析

### Test27 实机反馈

1. 最新热门 / 最新精华已经恢复为海阔原生页面，作者、标题、摘要、统计的整体排版方向正确；
2. 但原生话题页仍完全没有预览图，而同一页面的 `mobile=2` 官网可以正常显示 3 张预览图；
3. 实机截图同时暴露一个关键线索：Test27 第一条原生卡片把官网的“摘要正文”误当成了帖子标题，说明普通子版块 `parseCardsV15` 用“最高标题分数锚点”确定 `titleIndex` 的策略不适合 Guide；
4. Guide 同一个 `tid` 在一张卡片里会出现多次链接。若把较后的摘要链接当成 `titleIndex`，从该位置到下一主题切片时，真正位于前面的标题/预览图就会被切掉，因此即使 `C.renderList()` 已经把网页图片加载出来，原生解析仍得到 0 张图。

### Test28 修正

1. **标题选择和卡片边界彻底分离**
   - 每个 `tid` 第一次出现的位置固定为整张 Guide 卡片的 `start`；
   - 标题仍从同 `tid` 的多个候选链接中评分选择，但标题再也不能改变卡片起点；
   - 图片、统计、摘要都从 `当前 tid 第一次出现 → 下一个 tid 第一次出现` 的完整区间提取。

2. **预览图直接从完整手机卡片区间提取**
   - 继续使用 `mobile=2 + C.renderList()`，不改变 Test27 已确认正确的产品形态；
   - 使用现有 `C.allImages()` 识别 `src / data-original / data-src / data-lazy-src / file / zoomfile / srcset`；
   - 每帖最多保留 3 张；
   - 同一图片若跨 3 个以上帖子重复出现则按广告/公共素材过滤，继续过滤头像、smiley、loading、placeholder 等噪声。

3. **保留 Test27 已确认正确的排版**
   - 作者头像 / 用户名 / 角色 / 时间独立一行；
   - 标题、摘要、最多 3 图、回复 / 点赞 / 观看按手机卡片层级排列；
   - 没取到可信图片就不创建灰色占位；
   - 三个话题仍为海阔原生页面，“手机版”只是辅助入口。

4. **性能与缓存**
   - 不恢复 Test24 的额外 DOM 采图映射；
   - 仍只做一轮与普通板块同级别的 `renderList` 主链；
   - Test28 使用独立 3 分钟缓存键，避免命中 Test27 的无图缓存。

### Test28 静态门禁

- `patch_guide_card_boundary_v28.js`：本地 `node --check` 通过；
- `bootstrap_test_v28_b10128.js`：本地 `node --check` 通过；
- `release.json / test.json / channels.json / manifest.json`：本地 JSON 解析通过；
- Test28 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092328`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test28 实机优先验收

1. 最新热门 / 最新精华第一屏是否出现与手机版一致的 2~3 张真实预览图；
2. 顶部摘要行若显示“xx 张预览图”，数量应大于 0；
3. 标题是否恢复成官网真正的帖子标题，而不是把摘要正文当标题；
4. 点击主题仍进入原生帖子详情，普通子版块 / 搜索 / 评论页不受影响。

## 0.1.0-test.27 / Build 10127 — Guide 与普通子版块统一 mobile 渲染链

### Test26 实机反馈

1. 最新发表 / 最新热门 / 最新精华已经恢复为海阔原生页面，进入速度比 Test24 明显改善；
2. 但 Test26 的 `mobile=2 fetchPC` 快速链只能稳定拿到文字主题，预览图再次全部丢失；
3. 作者、发布时间、摘要层级也和官网手机端、以及当前已经正常的普通子版块卡片存在差异；
4. 同一设备上普通子版块的双图预览一直正常，因此本轮不再单独猜 Guide 图片 Header，而是直接复用普通子版块已经实机成立的数据链。

### Test27 修正

1. **Guide 数据链与普通子版块统一**
   - 三个话题仍保持海阔原生页面；
   - 首选 `mobile=2 + C.renderList()` 获取手机端渲染 DOM；
   - 继续使用已验证的 `parseCardsV15` 解析作者、标题、摘要与 lazy 图片；
   - 只有渲染 DOM 完全解析不到主题时才回退 `mobile fetch`，最后才 PC fallback；
   - 不再采用 Test26 “快速 fetch 有主题就提前结束”的策略，因为实机已证明它会丢预览图。

2. **排版向官网手机端与普通板块统一**
   - 作者头像 / 用户名 / 版主或楼主 / 发布时间独立一行；
   - 标题和摘要独立显示；
   - 每帖最多显示 3 张真实预览图：3 图 `pic_3`、2 图 `pic_2`、1 图全宽；
   - 回复 / 点赞 / 观看继续弱化放在卡片底部；
   - 不生成灰色图片占位：没有可信图片就不显示图片组件。

3. **性能折中**
   - 不恢复 Test24 的“多段 DOM 采图 + tid 映射”额外流程；
   - 只执行与普通子版块相同的 `renderList` 主链；
   - 每个 `mode + page` 的解析结果缓存 3 分钟，返回话题页或短时间重复进入时直接复用缓存。

4. **保持不动**
   - 普通子版块及其分类 / 排序；
   - 搜索；
   - 帖子详情 / 评论页；
   - 账号 / 签到 mobile=2；
   - 首页六大类和首页单页守卫；
   - magnet、115 / 迅雷 / PikPak、视频嗅探。

### Test27 静态门禁

- `patch_guide_mobile_parity_v27.js`：本地 `node --check` 通过；
- `bootstrap_test_v27_b10127.js`：本地 `node --check` 通过；
- `release.json / test.json / channels.json / manifest.json`：本地 JSON 解析通过；
- Test27 Shell：外层规则 JSON与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092327`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test27 实机结果

- 排版方向已确认正确；
- 原生 Guide 仍无预览图；
- 实机截图显示摘要被误当标题，成为 Test28 卡片边界修复的直接证据。

## 0.1.0-test.26 / Build 10126 — 撤销 Guide 网页直显，恢复原生话题页

- Test25 手机网页直显虽然图片正常，但实机明确否决该产品交互；
- 三个话题恢复 `shtForum` 原生卡片；
- Test26 首选一次 `mobile=2 fetchPC`，主题不足才隐藏 WebView，进入速度明显改善；
- 实机结果：文字主题恢复且速度改善，但预览图丢失、卡片层级与官网/普通板块不一致；
- 结论：Test27 不再以“有主题文本”作为 Guide 成功标准，改为复用普通板块 mobile 渲染链。

## 0.1.0-test.25 / Build 10125 — Guide 手机网页直显（实机否决）

- Test21~24 连续尝试 Guide 原生图片搬运仍灰图；
- 一度改成 `x5_webview_single` 直接显示官网 mobile Guide，图片与网站排版正常且进入快；
- 用户明确要求话题分类必须保持海阔原生页面，因此该方案判定不接受；
- Test26 已撤销网页直显。

## 0.1.0-test.24 / Build 10124 — Guide DOM 图片映射（实机未通过）

- WebView 中按 tid 定位帖子卡片并读取实际渲染图片；
- 使用 `fba.putVar` 保存 `tid -> image[]`；
- 原生侧仍使用普通板块 `C.imageUrl()` 输出；
- 实机仍灰图，并带来明显隐藏 WebView 等待。

## 0.1.0-test.23 / Build 10123 — Guide 图片候选与普通板块对齐（实机未通过）

- 优先 lazy/file/zoomfile 等真实源；
- `currentSrc/src` 只有 natural size 合格才接受；
- 最终输出复用 `C.imageUrl()`；
- 实机仍灰图。

## 0.1.0-test.22 / Build 10122 — Guide DOM 图片提取

- 从渲染 DOM 提取 `currentSrc/src/lazy/file/zoomfile` 与 CSS background；
- 能找到图片候选，但原生显示仍失败。

## 0.1.0-test.21 / Build 10121 — Guide 卡片手机化

- 三个话题建立作者、标题、摘要、最多3图、评论/点赞/观看的手机卡片层级；
- 标题/作者结构方向正确，但预览图灰色。

## 0.1.0-test.20 / Build 10120 — 账号/签到手机端化与三个话题恢复

- 账号默认 `member.php?mod=logging&action=login&mobile=2`；
- 签到默认 `plugin.php?id=dd_sign:index&mobile=2`；
- 三个话题恢复 mobile Guide 数据链。

## 0.1.0-test.19 / Build 10119 — 首页单页守卫与分类/排序独立选择器

- 首页 `MY_PAGE > 1` 不再重复追加整套首页；
- 子板块“分类”和“排序”拆为独立选择器；
- 分类、排序和翻页使用 `refreshPage(false)`，避免返回栈累积。

## 0.1.0-test.18 / Build 10118 — 筛选/统计排版修正

- 清理 `<small>/<font>` 源码泄漏和灰色空按钮；
- 回复 / 点赞 / 观看改为弱化统计文本；
- 清理筛选噪声。

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
- 当前下一步：Test28 实机验证 Guide 预览图与真实标题是否恢复；如果顶部已经统计到预览图但图片仍不显示，再转向图片请求链本身，不再继续改卡片切片。
