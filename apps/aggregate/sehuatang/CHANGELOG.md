# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.20 / Build 10120 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v20_b10120.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v20_b10120.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.20/release.json`
- Test20 继承 Test1~Test19，并新增：`releases/0.1.0-test.20/patch_mobile_guide_v20.js`。

## 0.1.0-test.20 / Build 10120 — 账号/签到手机端化与三个话题恢复

### Test19 后实机反馈

1. 用户明确要求账号、签到等站点页面默认进入手机端网页，而不是桌面网页；
2. “最新发表 / 最新热门 / 最新精华”再次无法取得主题，实机“最新热门”显示 0 条并进入空状态；
3. 首页当前访问状态仍显示“站点可访问 · Cookie 已同步”，说明这次不是全站 Cookie 完全丢失，而是三个 guide 入口自己的会话/解析链失效；
4. 本轮不扩大已经稳定的首页单页守卫、分类/排序选择器、搜索、帖子卡片、评论页和原页翻页修改面。

### Test20 修复

1. **账号 / 签到直接以 mobile=2 为入口**
   - 账号直接打开：`member.php?mod=logging&action=login&mobile=2`；
   - 签到直接打开：`plugin.php?id=dd_sign:index&mobile=2`；
   - 不再先打开站点根页再跳目标页，减少进入桌面版页面的机会；
   - X5 WebView 继续使用移动 UA；
   - 遇到当前声明式 18+ 首访页仍自动点击并同步 Cookie / access / age 状态；
   - 验证码或真人验证继续不绕过。

2. **三个话题不再调用旧 guide 实现**
   - Test19 的 `sht_auto` 仍回退较早版本 `oldForum()`，实际已再次出现 0 主题；
   - Test20 对 `latest / hot / digest` 单独接管：
     - `latest → forum.php?mod=guide&view=newthread&mobile=2`
     - `hot → forum.php?mod=guide&view=hot&mobile=2`
     - `digest → forum.php?mod=guide&view=digest&mobile=2`
   - 第一优先使用 `mobile=2` WebView，同一个会话内处理年龄确认并保存 Cookie；
   - 从渲染后的真实 `tid / thread-*` 链接重建主题列表；
   - 手机端 WebView 无结果时再尝试手机端 fetch；
   - 仍无结果才使用 PC 请求作最小兜底，不把 PC 重新升级成默认入口。

3. **Guide 独立翻页**
   - 三个话题使用独立页码状态；
   - 上一页 / 回第1页 / 下一页继续 `refreshPage(false)` 当前页刷新，不增加系统返回栈。

4. **诊断增强**
   - 新增 `guide.mobile.v20` 诊断，记录 mode / page / 实际主题数 / URL；
   - 若仍为 0 条，可直接点“手机版”查看官网当前 guide 页实际状态，方便区分年龄页、权限页与 Parser 问题。

### Test20 静态门禁

- `patch_mobile_guide_v20.js`：本地 `node --check` 通过；
- `bootstrap_test_v20_b10120.js`：本地 `node --check` 通过；
- Test20 `release.json`：本地 JSON 解析通过；
- Test20 Shell：外层规则 JSON与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092320`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test20 实机优先验收

1. 点首页“账号”，确认直接显示手机端登录页面；
2. 点“签到”，确认直接显示手机端签到页面；
3. 分别打开最新发表 / 最新热门 / 最新精华，确认能取得真实主题；
4. 三个话题点击下一页后再返回，确认不累积系统返回栈；
5. 若某一话题仍为 0，点页面“手机版”并截图官网当前页面，同时查看设置里的最近诊断。

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
- 当前下一步：Test20 实机闭环 → 账号手机端 / 签到手机端 / 最新发表 / 最新热门 / 最新精华 → 再继续页面视觉精修。
