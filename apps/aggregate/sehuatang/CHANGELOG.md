# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.14 / Build 10114 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v14_b10114.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v14_b10114.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.14/release.json`
- Test14 继承 Test1~Test13，并叠加 `releases/0.1.0-test.14/patch_mobile_cards_hotfix_v14.js`。

## 0.1.0-test.14 / Build 10114 — Test13 详情崩溃热修与卡片摘要边界修复

### Test13 实机反馈

1. **列表真实预览图方向已经生效**：在“亚洲有码原创”等手机端主题列表中，部分真实帖子已经能够显示 2 张左右并排预览图，说明“mobile=2 + 卡片区间提取 + 懒加载滚动”的方向正确；
2. 主题卡片文字摘要仍有明显污染：会混入上一条帖子、日期、页码、作者、广告文字，甚至出现 `target="_blank" class="js-randomBg ..."` 一类残留 HTML 属性；
3. 点击帖子详情直接报错：`ReferenceError: “d” 未定义`，错误行约为 Test13 patch 第 126 行；
4. 当前错误属于 Test13 新增层自身回归，不是站点 DOM / Cookie / 年龄确认异常，因此不应回退已经出现效果的手机端双图预览与页内翻页设计。

### Test14 根因与修复

1. **帖子详情 ReferenceError 已定位为确定代码 Bug**
   - Test13 的 `thread()` 中直接执行 `d.push(...)`，但函数局部变量声明里漏掉了 `d=[]`；
   - 因此任何能正常进入 `thread()` 的帖子都会在渲染第一批组件时直接抛出 `ReferenceError`；
   - Test14 显式恢复 `var d=[]`，其它 Test12/Test13 已建立的手机端正文请求链、图片逐张全宽、磁链云播和回复逻辑保持不变。

2. **主题卡片边界从“第一次 tid 出现”改为“最佳标题锚点”**
   - Test13 为了捕获整张帖子卡片，从 `firstIndex - 600` 开始截取源码；
   - 实机已经证明这会切进上一条卡片或 HTML 标签中间，导致摘要出现上一帖文本和半截属性；
   - Test14 对同一 tid 先评分选出最佳真实标题，再使用该标题的 `titleIndex` 作为当前卡片起点；
   - 当前卡片终点使用下一条主题的最佳标题 `titleIndex`；
   - 不再从标题前方倒退 600 字符，因此避免跨卡片污染，同时仍能保留标题之后的简介和 1~2 张预览图。

3. **摘要清洗增强**
   - 删除 `target/class/style/href/src/id/data-*` 等属性残片；
   - 清理上一页/下一页/回复/浏览/隐藏置顶帖等导航噪声；
   - 清理连续分页数字串、日期和已知广告残片；
   - 优先保留 `【影片名称】/【出演女优】/【影片容量】` 等内容型字段；
   - 摘要最长约 170 字，避免一条卡片塞进过多元数据。

4. **继续保留已实机出现效果的 Test13 能力**
   - 普通板块继续 `mobile=2` 主链；
   - 手机 WebView 继续滚动触发 lazy-load 图片；
   - 单帖最多 2 张 `pic_2` 预览图；
   - “上一页 / 下一页 / 回第1页”继续使用 `putMyVar + refreshPage(false)` 原页刷新，不增加返回栈；
   - 搜索继续继承 Test11 已实机正常的真实表单提交方案；
   - Stable / Latest / 根 `registry.json` 继续不建立。

### Test14 静态门禁

- `patch_mobile_cards_hotfix_v14.js`：本地 `node --check` 通过；
- `bootstrap_test_v14_b10114.js`：本地 `node --check` 通过；
- Test14 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092314`；
- Release / Bootstrap / Shell 均明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test14 实机优先验收

1. 重新进入刚才报错的同一帖子，确认详情页不再出现 `d 未定义`；
2. 检查正文仍按手机网页版顺序逐张全宽显示图片；
3. 回到“亚洲有码原创 / 高清中文字幕”等主题列表，确认双图预览仍在；
4. 重点观察标题下摘要：不应再出现 `target/class/style` 残片，也不应大段混入上一条帖子；
5. 连续翻 3~5 页后按系统返回，继续确认页内刷新没有增加返回层级。

## 0.1.0-test.13 / Build 10113 — 手机端帖子卡片预览、正文全宽图片、原页内翻页

### Test12 实机反馈

1. **搜索已经正常**，继续保持 Test11 的真实 `search.php` 表单提交 + `searchid` 方案，不在本轮修改搜索链；
2. 手机网页版的板块帖子卡片已经明确显示“标题 / 摘要 / 两张左右并排预览图 / 回复点赞浏览信息”，而 Test12 原生主题列表仍基本只有文字，进入帖子前看不到真实预览图；
3. 手机网页版帖子正文里的预览图片是按正文顺序逐张大图显示，Test12 对连续图片使用 `pic_3` 网格后与网站布局不一致；
4. Test12 正文图片虽然比早期版本显示更多，但仍有少量图片空白，说明真实已加载 `src` 与 lazy/file/zoomfile 等候选的优先级还需要继续收敛；
5. Test11/Test12 的“下一页”使用新的 `hiker://page/shtForum` 页面，连续翻十几页会产生十几层返回栈，用户返回最初板块需要连续按十几次返回；
6. 用户明确要求继续以 `mobile=2` 手机端页面为主，不把普通板块重新改回 PC 主链。

### Test13 修复

1. **板块列表继续 mobile=2 主链，不回退到 PC-first**
   - 普通板块仍首先打开 `mobile=2`；
   - 手机端 WebView 在检测到主题链接后不立即结束，而是额外执行两轮页面滚动，触发懒加载图片；
   - 对空/占位 `src` 主动尝试 `data-original / data-src / data-lazy-src / file / zoomfile` 写回 `src`；
   - PC 页面只在手机端预览图明显不足或手机端主题完全失败时作最小补图/兜底。

2. **主题卡片改成按相邻 tid 边界提取完整手机端卡片**
   - Test12 的 `contextAround()` 容易落在标题附近的嵌套 `div/li`，导致标题能读到但后面的预览图被截掉；
   - Test13 先收集本页所有真实 tid，再使用“当前 tid 第一次出现位置 → 下一个不同 tid 第一次出现位置”作为主题卡片源码边界；
   - 在整张手机端卡片里提取摘要与图片，不再只依赖标题附近局部 DOM；
   - 同页重复 3 次以上的图片继续视为头像/公共图过滤；
   - 单帖最多显示 2 张预览图，使用 `pic_2` 左右并排，贴近用户提供的手机网页版实际卡片；
   - 只有 1 张预览图时使用 `pic_1_full`。

3. **正文图片改成手机网页版式：逐张全宽**
   - Test12 已恢复“文字 → 图片 → 文字 → 图片”的原始先后顺序，本轮保留这一点；
   - 取消“连续图片自动三列网格”；
   - 每一张正文图片都使用 `pic_1_full`，按原始 HTML 顺序逐张输出，更接近手机网页版；
   - 点击任一图片仍可进入 `pics://` 查看整组正文图片；
   - 图片真实地址优先使用渲染后 `src`，若是 loading/placeholder/data URI 再回退 lazy/file/zoomfile 等属性。

4. **板块翻页改为当前页面内刷新，不再增加返回栈**
   - 普通板块页为每个 fid 保存独立页码变量；
   - “上一页 / 下一页 / 回第1页”使用 `putMyVar(pageKey, page) + refreshPage(false)`；
   - 翻第 2、3、10、15 页都仍处在同一个 `shtForum` 页面；
   - 按一次系统返回即可退出主题列表，不再需要按十几次返回；
   - 中间按钮在第 2 页以后直接显示“回第1页”，便于长距离快速返回开头。

5. **保持已正常模块**
   - 搜索原样继承 Test11，不扩大修改面；
   - 帖子请求链继续继承 Test12 的 `mobile WebView → mobile fetch → PC fallback`；
   - 115 / 迅雷 / PikPak / 复制独立图标及 BTIH 去重继续保留；
   - 登录 / 年龄确认 / Cookie / 视频嗅探不在本轮扩大修改面；
   - Stable / Latest / 根 `registry.json` 继续不建立。

### Test13 静态门禁

- `patch_mobile_cards_nav_v13.js`：本地 `node --check` 通过；
- `bootstrap_test_v13_b10113.js`：本地 `node --check` 通过；
- Test13 `release.json`：本地 JSON 解析通过；
- Test13 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092313`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 均明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

## 0.1.0-test.12 / Build 10112 — 手机端优先主题预览、正文图片顺序还原

### Test11 实机反馈

1. 搜索已经恢复正常；
2. 普通板块已经能看到真实主题和翻页，但进入帖子前仍基本看不到真实预览图；
3. 帖子正文图片从完全不显示进步到部分可显示，但仍有空白；
4. 帖子图片需要恢复到正文真实顺序；
5. 用户明确要求普通板块与帖子详情尽量走手机端。

### Test12 关键修复

- 普通板块改为 `mobile=2 WebView → mobile fetch → PC 最小兜底`；
- 标题/链接以手机端为主，仅按同 tid 从 PC 补图；
- 图片识别扩展到 `zoomfile/file/data-original/data-src/data-echo/data-lazy-src/data-url/data-actual/data-cfsrc/src/srcset/background-image`；
- 帖子详情改为手机端正文优先；
- 正文开始按原 HTML 顺序拆分文字与图片；
- Test12 实机确认：手机端正文主链方向正确，但连续图片网格与官网不一致，列表预览仍未闭环，因此进入 Test13。

## 0.1.0-test.11 / Build 10111 — 网站式主题卡片、显式翻页、Guide 会话桥接与搜索重写

- 主题列表首次改为“标题 / 摘要 / 多图预览”；
- 同页重复图片频次过滤，避免头像污染；
- 建立显式上一页 / 下一页；
- Guide 尝试同 WebView 会话处理年龄确认；
- 搜索改为真实 `search.php?mod=forum` 表单提交并保存 `searchid`；
- **实机确认搜索恢复正常**。

## 历史关键节点

### Test10 / Build 10110

- Guide 三入口拆出独立年龄确认 WebView；
- 帖子详情加入预览图库；
- 新增 115 / 迅雷 / PikPak 独立 SVG 图标。

### Test9 / Build 10109

- 修复“HTML 很长就误判成功”的根因，改成按论坛 / 主题 / 帖子真实 DOM 判断；
- 帖子详情恢复 PC / mobile / WebView 多变体；
- 新增原帖、回复、复制、设置、网页版独立图标；
- 六大类优先复用 Test5 曾成功取得约 45 个论坛板块的设备缓存。

### Test8 / Build 10108

- 主题列表开始从整条主题容器提取图片；
- 正文图片从 rich_text 内联改为原生图片组件 + Cookie / Referer；
- 实机出现“150 万字 HTML 但没有目标帖子 DOM”，促成 Test9 内容结构校验。

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

- Test4 同一 `tid` 聚合候选标题并过滤时长噪声；
- Test4 主题缩略图方向曾被实机证明有效；
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
- 当前下一步：Test14 实机闭环 → 帖子详情崩溃 / 列表摘要 / 双图预览 / 页内翻页 → 再继续 Guide 与 UI 精修。
