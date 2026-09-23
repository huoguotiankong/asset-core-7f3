# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.15 / Build 10115 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v15_b10115.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v15_b10115.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.15/release.json`
- Test15 继承 Test1~Test14，并叠加 `releases/0.1.0-test.15/patch_category_layout_v15.js`。

## 0.1.0-test.15 / Build 10115 — 分类差异化目录、图片帖补图、文学标题与作者信息拆分

### Test14 实机反馈

1. Test14 已恢复帖子详情，不再出现 Test13 的 `d 未定义` 崩溃；
2. “中文字幕”手机网页版采用两列视频卡片：每个卡片为预览图 + 时长 + 标题 + 时间/查看数；原生版仍按普通帖子卡片显示，需要仅对在线视频分类改布局；
3. 其它分类（例如亚洲有码原创）当前“标题 + 简介 + 双图预览”方向已经接近手机网站，不应一起改成视频网格；
4. 色花图片分类的帖子详情仍可能只显示文字/回复而没有正文图片，但官网手机页能显示大图；
5. 色花文学目录当前把正文摘要当主标题，官网手机页实际存在 `【伊能静】/【表姐给我介绍的小处女】` 这类独立短标题；
6. 普通帖子目录中的发布者名字、头像、版主/楼主标签、时间等元数据会混在摘要或其它字段中，用户要求单独一行显示。

### Test15 修复

1. **分类识别不靠硬编码单个子板块名**
   - 优先读取设备侧 `sht_forum_groups_v9` 六大类缓存，用当前 `fid` 判断属于哪个一级分类；
   - 在线视频为 group 1，色花图片为 group 3，色花文学为 group 4；
   - 缓存缺失时再用一级 fid/名称关键词兜底。

2. **在线视频分类单独改为双列视频卡片**
   - 只有在线视频分类使用 `movie_2` 双列卡片；
   - 每个主题优先使用第一张手机端真实预览图；
   - 描述尽量提取时长、查看数、发布时间；
   - 其它分类继续沿用 Test14 的普通帖子卡片，不一起改变。

3. **所有普通帖子把发布者信息独立一行**
   - 从当前手机端帖子卡片中识别用户空间链接、avatar、版主/管理员/楼主标签和发布时间；
   - 使用独立 `avatar` 行显示“头像 + 名字 + 角色/时间”；
   - 标题、正文简介和双图预览从下一行开始，不再把作者元数据塞进摘要。

4. **色花文学目录优先恢复真实短标题**
   - 同一 tid 收集多个标题候选；
   - 文学分类优先选择 `【...】/[...]` 一类短标题，其次选择较短的有效主题候选；
   - 长正文片段继续作为简介，不再冒充帖子标题。

5. **色花图片帖子增加正文整页补图**
   - 正文仍优先按 mobile=2 的楼层 DOM 顺序解析；
   - 若色花图片帖子所有楼层都未取到正文图片，则对手机端渲染后的完整帖子 HTML 再执行图片提取；
   - 继续过滤 avatar、smiley、static/image、loading、placeholder 等 UI/占位图；
   - 补出的真实图片使用 `pic_1_full` 全宽显示。

6. **继续保持当前已经正常的链路**
   - 搜索继续继承 Test11 已实机正常的真实 `search.php` 表单提交 + `searchid`；
   - 普通板块继续 mobile=2 优先；
   - 上一页/下一页继续 `putMyVar + refreshPage(false)` 原页刷新，不增加返回栈；
   - 115 / 迅雷 / PikPak / 复制图标、BTIH 去重、视频嗅探、访问状态/Cookie 继续保留；
   - Stable / Latest / 根 `registry.json` 继续不建立。

### Test15 静态门禁

- `patch_category_layout_v15.js`：本地 `node --check` 通过；
- `bootstrap_test_v15_b10115.js`：本地 `node --check` 通过；
- Test15 `release.json`：本地 JSON 解析通过；
- Test15 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092315`；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test15 实机优先验收

1. 打开在线视频分类中的“中文字幕”等板块，确认变成一行两张的视频卡片布局；
2. 打开亚洲有码原创等非视频板块，确认仍保留普通卡片 + 双图预览，不被视频布局影响；
3. 检查普通帖子：头像/名字/版主或楼主标签/时间应独立一行，下面才是标题、简介和预览图；
4. 打开色花文学“乱伦人妻”等板块，确认目录出现 `【...】` 形式短标题，长正文片段作为简介；
5. 打开色花图片/华人街拍区的图片帖，确认帖子详情不再只有文字和回复，能补出官网正文图片；
6. 回归搜索和连续翻页，确认没有破坏 Test11/Test13 已正常链路。

## 关键历史节点

### Test14 / Build 10114

- 修复 Test13 `thread()` 漏声明 `d=[]` 导致的 `ReferenceError`；
- 主题卡片从最佳标题锚点到下一主题锚点截取，减少上一帖/HTML 属性/广告污染；
- 保留真实双图预览与原页内刷新翻页。

### Test13 / Build 10113

- mobile=2 主题卡片通过 WebView 滚动触发 lazy-load；
- 单帖最多 2 张真实预览图；
- 正文图片按手机网页版顺序逐张全宽；
- 翻页改为 `putMyVar + refreshPage(false)`，不再累积十几层返回栈。

### Test12 / Build 10112

- 普通板块与帖子详情改为 mobile=2 优先，PC 仅最小兜底；
- 扩展 `zoomfile/file/data-original/data-src/data-echo/data-lazy-src/data-url/data-actual/data-cfsrc/src/srcset/background-image` 图片识别；
- 正文开始按原 HTML 顺序拆分文字与图片。

### Test11 / Build 10111

- 建立标题/摘要/多图预览卡片和显式翻页；
- 搜索改为真实 `search.php?mod=forum` 表单提交并保存 `searchid`；
- **实机确认搜索恢复正常**。

### Test10 / Build 10110

- 帖子详情加入手机式图片预览布局；
- 新增 115 / 迅雷 / PikPak 独立 SVG 图标。

### Test9 / Build 10109

- 修复“HTML 很长就误判成功”，改成按真实论坛/主题/帖子 DOM 判断；
- 帖子详情恢复 PC/mobile/WebView 多变体；
- 六大类重建优先复用 Test5 曾成功取得约 45 个真实板块的设备缓存。

### Test7~Test8

- 访问状态与 Cookie 状态拆分；
- latest/hot/digest 动态发现；
- magnet 按 BTIH 全帖去重；
- 回复编号改为楼主 → 回复1 → 回复2；
- 图片从 rich_text 内联逐步改为原生图片组件 + Cookie/Referer。

### Test5~Test6

- 建立年龄确认后的 Cookie 持久化与声明式 18+ 自动点击；
- 六个一级大类固定为：原创BT电影 `fid=2`、在线视频区 `41`、原档收藏 `145`、色花图片 `155`、色花文学 `154`、综合讨论区 `95`；
- 成熟旧规则确认 PC 帖子正文结构：`#postlist > div → .t_fsz → .t_f`；
- Test5 后实机曾成功识别约 45 个真实论坛板块。

### Test1~Test4

- 建立论坛 / 搜索 / 主题 / 帖子 Parser；
- magnet 提供 115 / 迅雷 / PikPak / 复制；
- 逐步扩展 mobile fetch → mobile WebView → PC fetch → PC WebView；
- 支持 `tid / ptid / thread-<tid>`；
- 同一 tid 聚合候选标题并过滤时长噪声，主题缩略图方向曾被实机证明有效。

## 当前禁用 / 待确认

- 不绕过验证码、人机验证或其它真人验证；
- 未实机确认前，不直接 POST 签到或回帖；
- 不保存真实账号、密码、Cookie、formhash 到仓库；运行态 Cookie 只保存在海阔本地变量 / WebView Cookie 容器；
- Test 阶段不晋级 Stable，不登记根 `registry.json`；
- 当前下一步：Test15 实机闭环 → 在线视频双列 / 作者行 / 文学标题 / 图片正文补图 → 再继续 Guide 与首页分类精修。
