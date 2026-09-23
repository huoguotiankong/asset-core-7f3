# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.12 / Build 10112 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v12_b10112.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v12_b10112.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.12/release.json`
- Test12 继承 Test1~Test11，并叠加 `releases/0.1.0-test.12/patch_mobile_order_v12.js`。

## 0.1.0-test.12 / Build 10112 — 手机端优先主题预览、正文图片顺序还原

### Test11 实机反馈

1. **搜索已经恢复正常**，说明 Test11 的真实 `search.php` 表单提交 + `searchid` 方案方向正确，本轮搜索保持不动；
2. 普通板块已经能看到真实主题和翻页，但进入帖子前仍基本看不到真实预览图；
3. 帖子正文图片已经从“完全不显示”进步到“部分能显示”，但仍有部分图片空白/加载失败；
4. Test10/Test11 的帖子详情把识别到的图片统一集中成图库，破坏了官网正文原本“文字 → 图片 → 文字 → 图片”的先后顺序；
5. 用户明确要求尽量走手机端网址，不需要普通板块和帖子详情默认全部走 PC 页面。

### Test12 修复

1. **普通板块改为 mobile=2 优先**
   - 普通 `shtForum` 不再默认先走 `mobile=no`；
   - 当前页首先对 `mobile=2` 执行 WebView 渲染并解析主题；
   - 手机端渲染页没有主题时再尝试手机端 fetch；
   - PC 仅作为兜底，不再作为普通板块主链。

2. **帖子进入前的预览图改成“手机端主数据 + PC 同 tid 补图”**
   - 主题标题、链接和主要摘要始终优先使用手机端结果；
   - 手机端当前页预览图过少时，才读取对应 PC 页面；
   - PC 结果只按相同 `tid` 合并图片，不覆盖手机端标题/链接；
   - 图片提取扩展支持：`zoomfile / file / data-original / data-src / data-echo / data-lazy-src / data-url / data-actual / data-cfsrc / src / srcset / background-image`；
   - 同一页跨多个主题重复出现 3 次以上的图片继续视为头像/公共图过滤；
   - 单帖最多保留 6 张列表预览图，使用 `pic_3` 三列显示。

3. **帖子详情改为手机端正文优先**
   - 详情页 URL 统一先改写为 `mobile=2`；
   - 请求链：`mobile WebView → mobile fetch → PC fetch → PC WebView`；
   - 只有手机端拿不到真实正文 DOM 时才回退 PC；
   - 继续兼容 `#postlist / .t_fsz / .t_f / postmessage_* / .message` 等正文结构。

4. **正文图片不再全部堆到最后**
   - Test10 的做法是：先把正文 `<img>` 全部移除，再一次性渲染图库，因此实机看到“所有图片集中在一起”；
   - Test12 按原始 HTML 中 `<img>` 的真实位置切分正文；
   - 可见文字先输出，再输出紧随其后的图片，然后继续后面的文字，实现“文字/图片/文字/图片”的原始顺序；
   - 连续出现多张图片时才使用 `pic_3` 三列网格；单张图片使用 `pic_1_full`；
   - 图片点击仍进入 `pics://` 原生查看。

5. **正文图片识别继续扩展**
   - 不再仅依赖少数 `src/data-src` 属性；
   - 同时识别 Discuz 常见 `file/zoomfile` 以及多种 lazy-load 属性；
   - 图片请求继续携带当前 Cookie、手机 UA 与正文 Referer；
   - avatar、smiley、static/image、loading、blank.gif 等 UI / 占位资源继续过滤。

6. **保持已正常模块**
   - Test11 搜索原样继承，不扩大修改面；
   - Test11 显式上一页/下一页继续保留；
   - Test10 的 115 / 迅雷 / PikPak / 复制独立图标与磁链云播继续保留；
   - Test7~Test11 的访问状态 / Cookie / BTIH 去重 / 视频嗅探继续继承；
   - Stable / Latest / 根 `registry.json` 继续不建立。

### Test12 静态门禁

- `patch_mobile_order_v12.js`：本地 `node --check` 通过；
- `bootstrap_test_v12_b10112.js`：本地 `node --check` 通过；
- Test12 `release.json`：本地 JSON 解析通过；
- Test12 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092312`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test12 实机优先验收

1. 打开“高清中文字幕 / 亚洲有码原创”等普通板块，确认主题标题下方开始出现真实帖子预览图，而不是只有纯文本；
2. 进入刚才同一个图片较多的帖子，确认正文变成按原文顺序穿插图片，而不是所有图片集中在一起；
3. 对照此前空白的图片位置，确认手机端 WebView / 扩展属性识别后可显示数量是否增加；
4. 检查下一页仍正常；
5. 搜索继续回归一次，确认 Test12 没有破坏 Test11 已正常搜索。

## 0.1.0-test.11 / Build 10111 — 网站式主题卡片、显式翻页、Guide 会话桥接与搜索重写

### Test10 实机反馈

1. 官方网页版板块中的单个帖子卡片可以同时展示标题、简介以及多张预览图；原生列表仍只有标题/错误头像；
2. 原生板块只能看到第一页；
3. 原生搜索无法返回关键词结果；
4. 最新发表 / 最新热门 / 最新精华仍不稳定；
5. 普通板块已经能读取真实帖子。

### Test11 关键修复

- 主题列表改为“标题/摘要 → 最多 6 张 `pic_3` 预览图 → 分隔线”；
- 同页图片做频次过滤，跨主题重复 3 次以上视为头像/公共图；
- 新增明确“上一页 / 第 N 页 / 下一页”，使用 `sht_p` 传递页码；
- Guide 从已通过年龄确认的 forum 页同一 WebView 会话跳转；
- 搜索改为真实 `search.php?mod=forum` 表单提交，并保存 `searchid` 支持分页；
- Test11 实机确认：**搜索恢复正常**，普通板块显式翻页已经建立；主题预览图与正文图片顺序仍需 Test12 继续处理。

## 历史关键节点

### Test10 / Build 10110

- 三个 guide 入口首次拆出独立年龄确认 WebView；
- 帖子详情按“正文信息 + 三列预览图库 + 磁链云播 + 回复”方向收敛；
- 新增 115 / 迅雷 / PikPak 独立 SVG 图标。

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
- 当前下一步：Test12 实机闭环 → 列表预览图 / 正文图片顺序 / 图片缺失 / 下一页 / 搜索回归 → 再继续 Guide 与 UI 精修。
