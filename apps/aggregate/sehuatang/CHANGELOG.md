# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.21 / Build 10121 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v21_b10121.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v21_b10121.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.21/release.json`
- Test21 继承 Test1~Test20，并新增：`releases/0.1.0-test.21/patch_guide_cards_v21.js`。

## 0.1.0-test.21 / Build 10121 — 三个话题手机网页卡片化与预览图修复

### Test20 实机反馈

1. 最新发表 / 最新热门 / 最新精华已经重新取得真实主题，说明 Test20 的 mobile=2 guide 会话、年龄确认和 Cookie 链恢复有效；
2. 原生三个话题仍是简化列表，和手机网页版差异较大；
3. Test20 主题标题抽取仍会把“本帖最后由 xxx 编辑”一类辅助文本误当标题；
4. 原生预览图显示灰色占位，而同一 mobile=2 网页中的真实缩略图可正常显示；
5. 用户要求三个话题尽量复刻手机网页卡片：作者/时间、标题、摘要、多张预览图、底部回复/点赞/观看。

### Test21 修复

1. **三个话题复用成熟手机帖子卡片 Parser**
   - 优先调用 Test15 已在普通板块实机验证过的 `parseCardsV15`；
   - 该 Parser 已具备作者、头像、时间、标题评分、摘要、真实图片和重复图过滤；
   - 只有成熟 Parser 无结果时才进入 Test21 自身的 guide fallback；
   - fallback 明确过滤“本帖最后由…编辑 / 查看帖子 / 最后回复”等非标题文字。

2. **排版向手机网页版靠拢**
   - 作者头像 / 名字 / 角色 / 时间独立一行；
   - 标题与摘要作为主内容；
   - 每帖最多取 3 张真实预览图，3 张用 `pic_3`、2 张用 `pic_2`、1 张全宽；
   - 回复 / 点赞 / 观看放在卡片底部弱化显示；
   - 每条主题之间继续使用分隔线，不重新引入大块空白。

3. **修复预览图灰色占位**
   - 主题页继续优先 `C.renderList(mobile=2)`，先触发 lazy-load；
   - 预览图统一通过 `C.imageUrl()` 输出，携带移动 UA、Cookie、Referer 与 `#originalSize#`；
   - 图片识别继续覆盖 `src / data-original / data-src / data-lazy-src / file / zoomfile / srcset` 等；
   - mobile WebView 无主题时才降级 mobile fetch，再无结果才 PC 最小兜底。

4. **保持 Test20 已恢复链路**
   - 账号 / 签到默认 mobile=2；
   - 三个话题继续同会话年龄确认 / Cookie；
   - Guide 翻页继续 `refreshPage(false)`，不增加返回栈；
   - 搜索、普通板块卡片、帖子详情、评论页、分类/排序保持不变。

### Test21 静态门禁

- `patch_guide_cards_v21.js`：本地 `node --check` 通过；
- `bootstrap_test_v21_b10121.js`：本地 `node --check` 通过；
- Test21 `release.json` / `test.json` / `channels.json` / `manifest.json`：本地 JSON 解析通过；
- Test21 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092321`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test21 实机优先验收

1. 最新精华：首两条应恢复正确主题标题，不再出现“本帖最后由…”作为主标题；
2. 最新精华 / 最新热门 / 最新发表：作者头像与名字独立一行，标题和摘要层级接近手机网页；
3. 有图片的主题应出现 1~3 张真实缩略图，不再只显示灰色占位；
4. 底部回复 / 点赞 / 观看信息存在时应弱化显示；
5. 连续翻 2~3 页后系统返回不应累积页面栈。

## 0.1.0-test.20 / Build 10120 — 账号/签到手机端化与三个话题恢复

- 账号直接打开 `member.php?mod=logging&action=login&mobile=2`；
- 签到直接打开 `plugin.php?id=dd_sign:index&mobile=2`；
- 三个话题由独立 mobile=2 guide 链接接管，先 WebView 同会话处理年龄确认/Cookie，再 mobile fetch，PC 仅最后兜底；
- Guide 使用独立页码并 `refreshPage(false)` 原页翻页；
- 实机确认三个话题已重新取得真实主题，但 Test20 简化卡片标题与图片表现不足，因此由 Test21 接管视觉与图片解析。

## 0.1.0-test.19 / Build 10119 — 首页单页守卫与分类/排序独立选择器

- 首页增加 `MY_PAGE` 守卫，`MY_PAGE > 1` 返回空结果，解决子板块到底后再次追加搜索/话题/论坛分类的问题；
- 子板块大量横向 `scroll_button` 改为两个独立 `select://`：`分类：当前分类` 与 `排序：当前排序`；
- 最新 / 热门 / 精华 / 按发帖 / 按回复等排序词即使 URL 携带当前 `typeid`，也优先按排序语义处理；
- 分类、排序、翻页继续 `refreshPage(false)`，避免返回栈累积；
- 帖子统计继续放卡片底部弱化显示。

## 0.1.0-test.18 / Build 10118 — 筛选/排序与统计栏排版修正

- 清理 `<small>/<font>` 源码泄漏和三个灰色空按钮；
- 回复 / 点赞 / 观看改为纯文本统计；
- 清理站点 `✓ / > / 更多` 等筛选噪声；
- 首次明确拆分子板块分类和排序语义。

## 0.1.0-test.17 / Build 10117 — 子板块独立分类与排序

- 普通卡片作者 / 标题 / 摘要 / 双图分层；
- 接入每个子板块自己的 `typeid/sortid` 分类与 `filter/orderby/digest` 排序；
- 分类、排序和翻页改为当前页面刷新。

## 0.1.0-test.16 / Build 10116 — 评论分离与图片正文顺序

- 帖子详情只显示楼主正文，回复拆到独立 `shtComments`；
- 顶部“复制链接”改为“评论页”，磁链复制功能保留；
- 色花图片整页补图提前到楼主正文之后；
- 作者头像、名字、角色、时间独立一行；
- 回复数 / 观看量从标题摘要移出。

## 0.1.0-test.15 / Build 10115 — 分类差异化目录

- 在线视频分类使用双列视频卡片；
- 其它分类保持普通帖子卡片；
- 色花文学优先恢复短标题；
- 色花图片正文无图时从手机端渲染整页补图；
- 普通帖子作者元数据独立一行。

## 关键历史节点

### Test14 / Build 10114
- 修复 Test13 `thread()` 漏声明 `d=[]` 的 `ReferenceError`；
- 主题卡片按当前标题锚点到下一主题锚点截取，降低广告/上一帖污染。

### Test13 / Build 10113
- mobile=2 主题卡片通过 WebView 滚动触发 lazy-load；
- 单帖最多 2 张真实预览图；
- 正文图片按手机网页版顺序逐张全宽；
- 翻页改为 `putMyVar + refreshPage(false)`，不再累积返回栈。

### Test12 / Build 10112
- 普通板块与帖子详情改为 mobile=2 优先，PC 仅最小兜底；
- 扩展 lazy/file/zoomfile/srcset 等图片识别；
- 正文开始按原 HTML 顺序拆分文字与图片。

### Test11 / Build 10111
- 建立标题 / 摘要 / 多图预览卡片和显式翻页；
- 搜索改为真实 `search.php?mod=forum` 表单提交并保存 `searchid`；
- **实机确认搜索恢复正常**。

### Test9~Test10
- 修复“HTML 很长就误判成功”，改为目标 DOM 校验；
- 帖子详情恢复 PC/mobile/WebView 多变体；
- 加入手机式图片布局及 115 / 迅雷 / PikPak 独立 SVG 图标。

### Test5~Test8
- 建立年龄确认 Cookie 持久化和声明式 18+ 自动点击；
- 六个一级大类：原创BT电影 `fid=2`、在线视频区 `41`、原档收藏 `145`、色花图片 `155`、色花文学 `154`、综合讨论区 `95`；
- 成熟旧规则确认 PC 帖子正文结构：`#postlist > div → .t_fsz → .t_f`；
- 访问状态与 Cookie 状态拆分，magnet 按 BTIH 去重。

### Test1~Test4
- 建立论坛 / 搜索 / 主题 / 帖子 Parser；
- magnet 提供 115 / 迅雷 / PikPak / 复制；
- 逐步扩展 mobile fetch → mobile WebView → PC fetch → PC WebView；
- 支持 `tid / ptid / thread-<tid>`。

## 当前禁用 / 待确认

- 不绕过验证码、人机验证或其它真人验证；
- 未实机确认前，不直接 POST 签到或回帖；
- 不保存真实账号、密码、Cookie、formhash 到仓库；运行态 Cookie 只保存在海阔本地变量 / WebView Cookie 容器；
- Test 阶段不晋级 Stable，不登记根 `registry.json`；
- 当前下一步：Test21 实机闭环 → 三个话题标题 / 作者行 / 预览图 / 统计 / 翻页 → 再继续整体视觉精修。
