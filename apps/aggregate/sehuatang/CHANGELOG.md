# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.11 / Build 10111 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v11_b10111.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v11_b10111.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.11/release.json`
- Test11 继承 Test1~Test10，并叠加 `releases/0.1.0-test.11/patch_forum_cards_search_v11.js`。

## 0.1.0-test.11 / Build 10111 — 网站式主题卡片、显式翻页、Guide 会话桥接与搜索重写

### Test10 实机反馈

1. 官方网页版板块中的单个帖子卡片可以同时展示标题、简介以及多张预览图；当前原生主题列表仍只有标题 + 一张右侧图片，且大量帖子错误显示成同一个头像，视觉与网页差距明显；
2. 当前原生板块只能看到第一页，后续页没有可见翻页入口；
3. 原生搜索仍无法返回关键词结果；
4. “最新发表 / 最新热门 / 最新精华”仍没有稳定取得主题，年龄确认 / guide 会话链仍需继续处理；
5. 普通板块本身已经能读取真实帖子，说明本轮应集中修改“主题卡片渲染、翻页、guide 与搜索”，不破坏已能进入的普通板块和帖子详情链。

### Test11 修复

1. **主题列表改为接近原网站的多图帖子卡片**
   - 不再用 `movie_1` 只显示一张右侧图片；
   - 每个主题先显示标题和当前主题容器提取出的摘要，再显示预览图库；
   - 预览图采用 `pic_3` 三列排版，单帖最多保留 6 张，页面结构变成“标题/摘要 → 预览图 → 分隔线”，更接近官方网页帖子卡片；
   - 主题图片从该主题自己的 `tbody / li / 邻近容器` 提取，不再只取标题链接内部图片。

2. **重复头像 / 公共图片过滤**
   - 继续过滤 `avatar / uc_server / ucenter / noavatar / static/image / smiley / emoji / icon` 等已知非帖子图片；
   - 对同一页所有主题的图片做频次统计，同一个 URL 若跨主题重复出现 3 次以上，视为头像或公共资源，从帖子预览图中剔除；
   - 避免 Test10 实机出现“每条帖子右边都是同一个人物头像”的问题。

3. **板块显式翻页**
   - 新增“上一页 / 第 N 页 / 下一页”原生按钮，不再依赖海阔页面 `MY_PAGE` 是否自动触发；
   - `sht_p` 明确传递页码；
   - 伪静态 `forum-<fid>-<page>.html` 与 query `page=` 两类地址都支持改写；
   - 页面顶部和底部均提供翻页入口，长列表无需返回重新进入。

4. **三个 Guide 入口改为同一 WebView 会话桥接**
   - 不再直接打开 `mod=guide&view=...` 后单独判断年龄页；
   - 先进入已验证可访问的 `forum.php?mobile=no`；
   - 若出现声明式 18+ 首访页，仍只自动点击年龄声明，不绕过验证码 / 人机验证；
   - 在同一 WebView 会话中寻找“最新发表 / 热门 / 精华”真实链接并跳转；找不到再使用标准 guide URL；
   - 成功进入后回写 Cookie，再等待真实 `tid / thread-*` 主题链接。

5. **原生搜索重写为真实网页表单提交**
   - 旧搜索只尝试历史 Discuz URL，因此实机一直 0 结果；
   - Test11 隐藏 WebView 打开官方 `search.php?mod=forum`，在真实搜索表单中填写用户关键词并提交；
   - 搜索流程同样复用年龄确认 Cookie；
   - 若官网要求验证码、安全提问或真人验证，不尝试绕过，而是在原生页提示用户打开网页版处理；
   - 搜索结果继续复用 Test11 多图主题卡片；
   - 若搜索结果 HTML 中取得 `searchid`，保存到本地并用于后续搜索分页。

6. **保持既有正常链**
   - Test10 的帖子详情、正文图片、磁链云播与 115 / 迅雷 / PikPak / 复制动作继续继承；
   - Test9 的访问状态 / Cookie 基线继续继承；
   - 六大一级分类与分组缓存不在本轮扩大修改面；
   - Stable / Latest / 根 `registry.json` 继续不建立。

### Test11 静态门禁

- `patch_forum_cards_search_v11.js`：本地 `node --check` 通过；
- `bootstrap_test_v11_b10111.js`：本地 `node --check` 通过；
- Test11 `release.json`：本地 JSON 解析通过；
- Test11 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092311`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 均明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test11 实机优先验收

1. 打开“高清中文字幕 / 亚洲有码原创”等普通板块，确认主题不再统一显示头像，而是标题/摘要下方显示该帖真实多张预览图；
2. 点击“下一页”，确认能够进入第 2 页并看到不同帖子，再测试上一页返回；
3. 搜索 `ipx-641` 等网页端确实存在的关键词，确认能取得原生结果；
4. 再测“最新发表 / 最新热门 / 最新精华”，确认同一 WebView 年龄会话桥接后是否恢复；
5. 若某项仍失败，优先提供对应页面截图和“设置 → 最近诊断”，下一轮只修失败链。

## 历史关键节点

### Test10 / Build 10110

- 三个 guide 入口首次拆出独立年龄确认 WebView；
- 帖子详情按“正文信息 + 三列预览图库 + 磁链云播 + 回复”方向收敛；
- 新增 115 / 迅雷 / PikPak 独立 SVG 图标；
- 实机随后确认主题列表仍需进一步按原网站多图卡片改造，且搜索 / 翻页仍未闭环，因此进入 Test11。

### Test9 / Build 10109

- 修复 Test8 只按 HTML 长度判成功的根因：论坛 / 主题 / 帖子分别按真实 DOM 结构判定成功；
- 帖子详情恢复 PC / mobile / WebView 多变体；
- 新增原帖、回复、复制、设置、网页版等独立 SVG 图标；
- 六大类优先复用 Test5 期间曾成功取得约 45 个论坛板块的设备缓存，并增加多策略分组。

### Test8 / Build 10108

- 主题列表开始从整条主题容器提取图片；
- 正文图片从 `rich_text` 内联改为原生 `pic_1_full` + Cookie / Referer；
- 实机出现“150 万字 HTML 但没有目标帖子 DOM”的问题，促成 Test9 内容结构校验。

### Test7 / Build 10107

- 访问状态与 Cookie 状态拆分；
- latest / hot / digest 动态发现；
- magnet 按 BTIH 全帖去重；
- 回复编号改为楼主 → 回复1 → 回复2；
- 加入视频直链与 `video://` 嗅探。

### Test6 / Build 10106

- 声明式 18+ 首访页自动点击并保存 Cookie；
- 六个一级大类固定为：原创BT电影 `fid=2`、在线视频区 `41`、原档收藏 `145`、色花图片 `155`、色花文学 `154`、综合讨论区 `95`；
- 用户提供的成熟旧规则确认 PC 帖子正文结构：`#postlist > div → .t_fsz → .t_f`；
- Test5 后实机曾成功识别约 45 个真实论坛板块。

### Test4~Test5

- Test4 同一 `tid` 聚合候选标题，过滤时长等噪声并选择真实主题标题；
- Test4 主题缩略图方向已被实机证明有效；
- Test5 建立年龄确认后的 Cookie 持久化。

### Test1~Test3

- 建立论坛 / 搜索 / 主题 / 帖子基础 Parser；
- magnet 提供 115 / 迅雷 / PikPak / 复制；
- 主题列表逐步扩展为 mobile fetch → mobile WebView → PC fetch → PC WebView；
- 支持 `tid / ptid / thread-<tid>`。

## 当前禁用 / 待确认

- 不绕过验证码、人机验证或其它真人验证；
- 未实机确认前，不直接 POST 签到或回帖；
- 不保存真实账号、密码、Cookie、formhash 到仓库；运行态 Cookie 只保存在海阔本地变量 / WebView Cookie 容器；
- Test 阶段不晋级 Stable，不登记根 `registry.json`；
- 当前下一步：Test11 实机闭环 → 主题多图卡片 / 第2页 / 搜索 / guide → 再继续帖子详情与 UI 精修。
