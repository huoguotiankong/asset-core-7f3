# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.10 / Build 10110 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v10_b10110.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v10_b10110.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.10/release.json`
- Test10 直接继承 Test1~Test9，并叠加 `releases/0.1.0-test.10/patch_thread_visual_v10.js`。

## 0.1.0-test.10 / Build 10110 — guide 独立年龄确认、网站式帖子预览图库与云播图标

### Test9 实机反馈

1. 原生搜索已可正常使用，本轮保持搜索实现不动；
2. 帖子详情正文已经恢复，但正文图片按 `pic_1_full` 逐张全宽展示时信息密度过低，且某些小图/表情会被放大成巨大图片；用户希望更接近原网站：正文信息后直接看到全部预览图，并以多图紧凑布局浏览；
3. 原网站同一帖子可一次展示多张预览图，当前原生详情应保留全部正文图片，而不是只强调单张全屏大图；
4. 115 / 迅雷 / PikPak 云播按钮仍缺少明确图标；
5. “最新发表 / 最新热门 / 最新精华”三个 guide 入口依旧取不到内容；结合普通板块、搜索、帖子正文均已可访问，优先怀疑 guide 页面有自己独立的 18+ 首访/容器 Cookie 状态，没有完全继承首页访问状态。

### Test10 修复

1. **搜索保持不动**
   - 不覆盖 `search()`，继续使用 Test9/旧链中已经实机确认可用的搜索实现；
   - 本轮只修改 guide 三入口与帖子详情展示，避免扩大已正常模块的回归面。

2. **三个 guide 入口建立独立年龄确认桥**
   - `latest / hot / digest` 不再只依赖首页已经保存的年龄状态；
   - 每个 guide URL 进入 WebView 后独立检测 `满18岁 / over 18 / please click here`；
   - 命中声明式 18+ 首访页时自动点击对应入口；
   - 越过首访页后立即通过 `fba.getCookie()` 回写 `sht_web_cookie_v5`，同时标记站点可访问；
   - 如果年龄确认后被跳回论坛首页，则主动导航回当前 `view=newthread / hot / digest` 目标；
   - 只有页面真正出现 `tid / thread-*` 主题链接才算完成，不再把空白/跳转页当成功结果；
   - 仍不尝试绕过验证码、真人验证或其它安全挑战。

3. **帖子详情改成“网站式信息 + 三列预览图库”**
   - 继续使用 Test9 已恢复的 PC / mobile / WebView 帖子正文请求链，不重写数据获取主链；
   - 每层正文先显示文本/影片信息，再把该层所有正文图全部提取出来；
   - 图片使用 `pic_3` 三列原生预览组件连续排列，更接近原网站同一主题内多图并排的浏览方式；
   - 点击任一缩略图仍可进入 `pics://` 原生图片查看；
   - 回复继续按楼主 → 回复1 → 回复2 顺序展示，带图回复也使用同样三列预览图库。

4. **过滤误放大的小图和表情**
   - 新增过滤 `static/image`、smiley、emotion、face、emoji、icon、avatar、logo、loading、none.gif、blank.gif 等资源；
   - 若图片标签明确同时给出宽高且均不超过 96px，也视为图标/表情，不进入正文预览图库；
   - 目标是避免 Test9 实机中橙黄色小图被 `pic_1_full` 放大到占据大半屏的现象。

5. **云播按钮补独立图标**
   - 新增 `cloud115.svg / thunder.svg / pikpak.svg`；
   - 115、迅雷、PikPak、复制均使用各自独立视觉图标；
   - 原帖 / 回复 / 复制链接 / 设置继续沿用 Test9 已建立的独立 SVG 图标。

6. **保持不动**
   - Test9 分类重建与六大类逻辑继续继承；
   - Test9 普通板块主题列表继续继承；
   - magnet BTIH 全帖去重、115 / 迅雷 / PikPak 调用链接不改变；
   - 视频直链与 `video://` 嗅探继续保留；
   - Stable / Latest / 根 `registry.json` 继续不建立。

### Test10 静态门禁

- `patch_thread_visual_v10.js`：本地 `node --check` 通过；
- `bootstrap_test_v10_b10110.js`：本地 `node --check` 通过；
- Test10 `release.json`：本地 JSON 解析通过；
- Test10 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092310`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test10 实机优先验收

1. 搜索 `ipx-641` 等关键词，确认搜索继续保持 Test9 当前可用状态；
2. 打开刚才“高清中文字幕”帖子，确认正文图片不再一张全屏巨大显示，而是多张三列预览，可一次看到更多图片；
3. 检查楼主、回复楼层的图片是否都能显示且点击可放大查看；
4. 检查 115 / 迅雷 / PikPak / 复制四个磁链动作是否显示不同图标，并保持原调用功能；
5. 分别打开“最新发表 / 最新热门 / 最新精华”，确认 guide 独立年龄确认后是否恢复真实主题；
6. 若 guide 仍为空，提供 Test10“设置 → 最近诊断”，诊断会记录独立年龄确认后的 URL、HTML 长度与主题数量。

## 0.1.0-test.9 / Build 10109 — 请求结果结构校验、分类重建、帖子详情恢复与独立图标

### Test8 实机反馈

1. 六个一级分类仍然全部只有 1 个子板块，说明 Test8 的“一级板块页面 / forum.php 区间 / Test7 fallback”三条链都没有取得真实子板块集合；
2. 帖子详情出现明显回归：页面诊断可得到约 `151~155 万字` HTML，但没有 `#postlist > div`，正文直接判空；
3. “最新发表 / 最新热门 / 最新精华”三项仍取不到主题，实机热门页落到 `forum.php?mod=guide&view=hot&page=1` 后仍为 0 主题；
4. 原帖、回复、网页版、搜索等 `icon_small_4` 仍显示空圆形/统一占位，不是明确的功能图标；
5. Test8 首页访问状态与 Cookie 仍正常，普通原创 BT 板块可取得约 36 条主题，因此本轮不回退年龄确认/Cookie 基线，只修运行链判定、分类、详情与图标。

### Test9 根因与修复

1. **禁止再用 HTML 长度判断“请求成功”**
   - Test8 共用 `fetchPage()`：只要 `fetchPC()` 返回长度大于 600 就直接接受，不再进入 WebView；
   - 实机已经证明“HTML 超过 150 万字”仍可能不是目标帖子 DOM，因此“内容很多”不等于“拿到了正确页面”；
   - Test9 按业务页面使用不同成功条件：
     - 论坛：必须出现真实 forum 链接；
     - 主题列表：必须出现 `tid/thread-*` 主题链接；
     - 帖子：必须出现 `#postlist / .t_fsz / .t_f / postmessage_* / .message` 等正文结构；
   - `fetchPC()` 解析失败后即使 HTML 很长，也继续执行 WebView，不再被错误页短路。

2. **六大类改为“旧成功平铺结果优先 + 多策略重建”**
   - Test5 后实机曾成功取得约 45 个真实板块，Test4 缓存键 `sht_forum_cache_v4` 因此具有设备侧已验证价值；
   - Test9 首选复用该旧成功缓存，再生成独立 `sht_forum_flat_v9`；
   - 若旧缓存不存在，则分别对 `forum.php?mobile=2 / mobile=no / 无 mobile` 执行 `fetch + WebView`，选板块数最多的真实结果；
   - 分组同时尝试：根 fid 顺序区间、`.bmw/.bm/.bm_c/.fl_tb` 结构块、六个一级分类名称源码区间、一级板块页；
   - 只接受 2~20 个子板块的合理候选为主结果，避免误把整站 40+ 板块塞进单一分类；
   - 新缓存键为 `sht_forum_groups_v9`，不受 Test7/Test8 错误缓存污染。

3. **最新 / 热门 / 精华恢复为强制双链**
   - 仍优先从真实论坛页发现对应导航 href；
   - 同时保留标准 `newthread / hot / digest` URL；
   - 每个入口同时尝试 `mobile=no / mobile=2 / 原始 URL`；
   - 每个 URL 都先 `fetchPC` 解析，0 主题则继续 WebView，再解析；不再因为返回正文很长而停止。

4. **帖子详情恢复 PC / Mobile / WebView 多变体**
   - 优先 PC `mobile=no`，其次 `mobile=2`，最后无 mobile；
   - 每个变体只有检测到真实帖子 DOM 才算成功，否则继续 WebView；
   - 楼层仍优先 `#postlist > div → .t_fsz → .t_f`；
   - 增加 `.t_fsz / div.t_f / td.t_f / [id^=postmessage_] / .message` 直接正文兜底，降低单一父容器变化造成的整页失效；
   - 保留 Test8 的“文字 rich_text + 图片原生 `pic_1_full`”方案，待帖子正文链恢复后继续实机验证图片是否真正显示。

5. **主题标题继续去噪**
   - 明确过滤“本帖最后由…编辑”、发表于/回复于等元数据候选，避免它们再次成为详情页标题；
   - 继续按同一 tid 聚合标题与右侧预览图候选。

6. **功能图标改为独立 SVG 资源**
   - 新增 `assets/icons/v1/`：账号、签到、搜索、设置、网页版、原帖、回复、复制、板块等图标；
   - `icon_small_4` 直接加载各自真实图标，不再用“统一 Logo + 标题 emoji”假装图标；
   - 一级分类 emoji 仅作为轻量文本标识，不替代操作图标。

7. **保持不动**
   - Test7 已实机正常的访问状态 / Cookie 逻辑继续继承；
   - magnet BTIH 去重、115 / 迅雷 / PikPak / 复制继续保留；
   - 视频直链与 `video://` 嗅探逻辑继续保留；
   - Stable / Latest / 根 `registry.json` 继续不建立。

### Test9 静态门禁

- `patch_forum_runtime_v9.js`：本地 `node --check` 通过后才上传；
- `bootstrap_test_v9_b10109.js`：本地 `node --check` 通过；
- Test9 `release.json`：本地 JSON 解析通过；
- Test9 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092309`，低于 32 位有符号整数上限；
- Release / Bootstrap / Shell 明确使用 `asset-core-7f3@main`，未新增 `hiker-cloud` 正式运行依赖。

### Test9 实机优先验收

1. 首页依次切换六个一级分类：重点看“原创BT电影”是否从 1 个恢复到多个子板块，并继续检查其余五类；
2. 打开“最新发表 / 最新热门 / 最新精华”，确认三项至少能取得真实主题，而不是 0 主题诊断页；
3. 打开 Test8 中报“HTML 150 万字但无正文”的同一帖子，确认正文恢复；
4. 继续检查正文图片是否由 `pic_1_full` 真正显示；
5. 查看“网页版 / 搜索 / 原帖 / 回复 / 复制链接 / 设置”等入口，确认显示不同的真实 SVG 图标；
6. 若仍失败，设置页“最近诊断”现在会记录每个 fetch/WebView 变体的 HTML 长度和是否命中目标结构，可据此只修失败链。

## 0.1.0-test.8 / Build 10108 — 子板块、主题预览图与正文图片原生渲染

### Test7 实机反馈

1. 首页六个一级分类能够正常显示，但每个一级分类下面仍只有 1 个子板块，实际网站同一大类下存在多个真实子板块；
2. 首页与若干操作位缺少明确图标，信息识别效率较低；
3. 主题列表已经能显示真实主题标题，但右侧没有像原网站那样显示帖子预览图；
4. 帖子正文文字能够解析，正文图片位置仍出现空白/占位区域，图片没有真正显示出来；
5. Test7 的站点可访问状态和 Cookie 同步已经实机正常，说明本轮不需要回退年龄确认/访问链，只针对分类与图片链修复。

### Test8 根因与修复

1. **子板块解析不再依赖论坛首页根 `.bm` 块**
   - Test7 以“包含根 fid 的 `.bm/.bm_c`”为边界，但当前站点真实 PC DOM 中该块可能只包含一级入口自身，导致六个分类均退化为 1 个板块；
   - Test8 改为分别请求六个一级板块自己的 `forum-<fid>-1.html?mobile=no` 页面，从当前一级板块页面提取真实 forum 链接；
   - 过滤六个根 fid 后保留其余子板块；
   - 若一级页面仍不足 2 个子板块，再从 `forum.php?mobile=no` 按根 fid 在源码中的位置区间切分；
   - 最后才回退 Test7 结果，避免再次把错误分组当主链；
   - 分类缓存独立升级为 `sht_forum_groups_v8`。

2. **首页和操作位补回视觉图标**
   - Test7 的 `quick()` 漏掉图片字段，`icon_small_4` 只剩空圆形占位；
   - Test8 恢复 `img/pic_url`，并给账号、签到、搜索、设置及常用入口增加明确文本图标；
   - 六个一级大类增加轻量 emoji 视觉标识；
   - 子板块切换为 `icon_2`，避免纯文本堆叠。

3. **主题列表右侧预览图改为“整条主题容器”提取**
   - Test7 只检查标题 `<a>` 标签内部的 `<img>`，而当前 Discuz 列表的预览图通常位于同一个 `tbody/li` 主题容器的其它位置；
   - Test8 为每个 tid 记录源码位置，优先截取其所属 `tbody`，其次 `li`，最后使用邻近源码上下文；
   - 在整条主题容器中按 `data-original / data-src / data-echo / data-lazy-src / zoomfile / file / src` 搜索图片；
   - 过滤 avatar、smiley、logo、loading、none.gif、blank.gif 等非主题图；
   - 识别到预览图后继续使用海阔 `movie_1`，该样式默认图片位于右侧，贴近原网站主题列表视觉。

4. **正文图片从 rich_text 内联改为原生图片组件**
   - Test7 将图片 URL 直接改写进 `rich_text` 的 `<img src>`，当前实机仍显示空白块，说明该站图片链在 rich_text 内联环境下对 Header/资源标识支持不稳定；
   - Test8 保留正文文字为 `rich_text`，先移除其中 `<img>`；
   - 每张正文图单独生成 `pic_1_full` 原生组件，图片 URL 显式带当前 Cookie + Referer；
   - `pic_1_full` 宽度铺满屏幕，高度按原图比例自适应；点击图片进入 `pics://` 原生图片查看；
   - 继续支持 `zoomfile/file/data-original/data-src/data-echo/data-lazy-src/src` 多属性识别。

5. **不扩大其它已正常模块修改面**
   - Test7 的站点可访问/Cookie 逻辑保留；
   - latest/hot/digest 动态发现保留；
   - magnet BTIH 全帖去重及 115 / 迅雷 / PikPak / 复制保留；
   - 回复编号修正保留；
   - 视频直链与 `video://` 嗅探保留；
   - Stable / Latest / 根 `registry.json` 继续不建立。

### Test8 静态门禁

- `patch_forum_visual_v8.js`：本地 `node --check` 通过；
- `bootstrap_test_v8_b10108.js`：本地 `node --check` 通过；
- `release.json`：JSON 解析通过；
- Test8 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092308`，低于 32 位有符号整数上限；
- Test8 Release / Bootstrap / Shell 均明确指向 `asset-core-7f3@main`，无新增 `hiker-cloud` 运行依赖。

### Test8 实机优先验收

1. 首页依次切换六个一级分类，确认各类不再普遍只有 1 个板块，且数量/名称接近网页真实结构；
2. 首页账号、签到、搜索、设置不再显示空圆形占位；
3. 打开原创 BT 等有缩略图的主题列表，确认带图帖子右侧出现预览图；
4. 打开此前正文图片为空白的帖子，确认图片以原生大图组件真正显示；
5. 同时回归 magnet 云播、回复编号与视频入口，确认 Test8 没有破坏 Test7 已正常功能。

## 0.1.0-test.7 / Build 10107 — 访问状态、主题列表、正文媒体与 UI 收敛

### Test6 后续实机反馈

1. 首页六大类方向正确，但页面信息仍偏重复，分类视觉需要进一步收敛；
2. “最新发表 / 最新热门 / 最新精华”进入后出现空列表；
3. 站点实际已能取得论坛数据时，首页仍可能显示“自动年龄确认尚未成功”，属于访问状态假阴性；
4. 六大类不能简单按前六个 `.bm_c` 顺序绑定，需要按真实根 `fid` 定位对应论坛块；
5. 帖子正文已能进入真实 `#postlist`，但部分正文图片仍显示占位图/加载图；
6. 同一个 magnet 在正文与云播区重复出现，视觉噪声较大；
7. 回复编号受被过滤节点影响，可能出现从“回复 2/3”开始；
8. 在线视频类帖子正文只出现“视频加载中”等占位文字，没有可直接播放入口。

### Test7 根因与修复

1. **主题列表请求链统一到 Test7 Cookie-aware Runtime**
   - Test6 只覆盖了 `home/thread`，普通板块与 guide 仍可能落回 Test4 的旧 `forum()`；
   - Test4 的旧请求只读 WebView 容器 Cookie，未复用 Test5/Test6 保存到 `sht_web_cookie_v5` 的 Cookie；
   - Test7 自己接管普通板块和 `latest/hot/digest` 的论坛列表请求，统一使用当前 Cookie、PC fetch、WebView fallback 与 `mobile=no` 变体；
   - 同一 `tid` 继续聚合标题/缩略图候选，过滤时间、纯数字和导航噪声。

2. **最新 / 热门 / 精华入口重新动态发现**
   - 先从当前真实 `forum.php` 中按“最新发表/最新主题/最新帖子、热门、精华”等文本匹配真实 href；
   - 文本匹配不到时继续识别 `mod=guide&view=newthread/hot/digest` 链接；
   - 最后才回退到标准 Discuz guide URL，不再只依赖历史入口。

3. **访问状态与 Cookie 状态彻底拆分**
   - 新增 `sht_access_ok_v7` 表示“已经越过 18+ 首访页并取得真实论坛结构”；
   - `sht_web_cookie_v5` 仍只表示 Cookie 容器已经同步；
   - 首页不再把“没有 Cookie”误判成“年龄确认失败”；
   - 设置页同时显示站点可访问状态与 Cookie 状态，并保留重新建立访问状态入口。

4. **六大类按真实根 fid 定位论坛块**

```text
原创BT电影 fid=2
在线视频区 fid=41
原档收藏   fid=145
色花图片   fid=155
色花文学   fid=154
综合讨论区 fid=95
```

- 在 `.bm / .bm_c` 块中查找包含对应根 fid 的真实块，再提取其 `dt/a` 子板块；
- 某一组解析失败时只回退到该大类自身入口，不伪造其它板块；
- 分类缓存升级为 `sht_forum_groups_v7`，避免 Test6 错误分组缓存污染。

5. **首页 UI 再收敛**
   - 最新/热门/精华改为紧凑三列 `text_3`；
   - 六个一级大类改为两行三列；
   - 当前大类以下继续使用两列子板块；
   - 不把诊断/build 等工程信息塞进首屏。

6. **帖子图片兼容增强**
   - 图片地址按 `zoomfile → file → data-original → data-src → data-echo → data-lazy-src → src` 依次挑选真实地址；
   - 跳过 `none.gif / loading / blank.gif / avatar / smiley` 等占位资源；
   - 相对地址转绝对地址，并补 Cookie + Referer + `#originalSize#`；
   - 清理旧 `src/zoomfile/file/data-*` 属性后只保留一个真实 `src`，避免占位属性重新抢占加载。

7. **磁链按 BTIH 全帖去重**
   - 不再只按完整 magnet 字符串去重，而是优先按 BTIH hash 去重；
   - 同一磁链即使 tracker/query 不同也只保留一个云播动作组；
   - 正文中的 raw magnet 文本/磁链链接移除，仅保留“磁链已识别，云播入口见正文下方”提示；
   - 115 / 迅雷 / PikPak / 复制四个动作保持不变。

8. **楼层编号修正**
   - 只对成功提取到有效 `.t_fsz/.t_f` 正文的楼层递增计数；
   - 第一条有效正文固定为“楼主”，之后连续显示“回复 1 / 回复 2 …”。

9. **在线视频播放入口**
   - 正文内直接发现 `.m3u8/.mp4` 时提供“直接播放”，并使用 `#isVideo=true#` 强制按视频处理；
   - 检测到 `<video>`、`<iframe>`、`视频加载中`、`在线播放`、播放器特征但没有直链时，提供海阔 `video://` 自动嗅探入口；
   - iframe 有实际 src 时优先嗅探 iframe，否则嗅探当前帖子；
   - 嗅探只过滤图片/字体类无关资源，不预先阻断 `.m3u8/.mp4`。

10. **保持不动**
   - 搜索功能本轮不扩大修改面；
   - 登录/验证码/真人验证仍交给官网页面；
   - 不直接 POST 签到或回复；
   - Stable / Latest / 根 `registry.json` 继续不建立，Test7 实机通过后再决定下一步。

### Test7 静态门禁

- `patch_stability_polish.js`：`node --check` 通过；上传后 Git blob SHA 与本地已检查文件一致；
- `bootstrap_test_v7_b10107.js`：`node --check` 通过；上传后 Git blob SHA 与本地已检查文件一致；
- `release.json`：JSON 解析通过；
- Test7 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092307`，低于 32 位有符号整数上限；
- Bootstrap、Release、Shell 全部明确使用 `asset-core-7f3@main`，没有新增 `hiker-cloud` 正式运行依赖。

### Test7 实机优先验收

1. 覆盖导入 Test7 后首页应直接显示六大类两行布局，切换大类后只刷新当前类子板块；
2. “最新发表 / 最新热门 / 最新精华”三项至少能恢复真实主题列表，标题与缩略图不应退化；
3. 已能正常看到论坛数据时，首页不应继续显示“年龄确认失败”；设置页应分别显示“站点可访问”和“Cookie”；
4. 打开带正文图片的帖子，确认图片不再停留在占位图；
5. 打开带 magnet 的帖子，同一 BTIH 只出现一组 115 / 迅雷 / PikPak / 复制，正文不重复铺 magnet；
6. 打开多回复帖子，确认顺序为楼主 → 回复1 → 回复2；
7. 打开在线视频帖子：有直链时测试“直接播放”；只有网页播放器时测试“嗅探播放”，并重点验证拖动/起播是否正常；
8. 若某一项失败，优先提供对应页面截图和“设置 → 最近诊断”内容，不扩大其它已正常模块的修改面。

## 0.1.0-test.6 / Build 10106 — 自动年龄确认、分组分类、帖子详情重写

### 第四轮实机事实

用户实机确认 Test5 后：

1. 原生首页已经可以识别约 45 个真实论坛板块；
2. 主题列表标题和缩略图明显比 Test3 正常，说明 Test4 的 `tid` 聚合与图片提取方向有效；
3. 45 个板块全部纵向一列，查找下方分类成本过高；
4. Test5 仍需要用户手动点击 18+ 年龄确认，因为 Test5 只负责“确认后的 Cookie 捕获/持久化”，并没有主动点击年龄按钮；
5. 帖子详情仍沿用 Test1 粗 Parser，实机出现“本帖最后由…编辑”、签名/楼主资料被误当正文，而真实帖子主体缺失；
6. 用户提供的 dy2020 成熟旧规则明确给出了当前站点 PC DOM：`#postlist > div`，正文优先 `.t_fsz`，其次 `.t_f`；论坛大类顺序为原创BT电影、在线视频区、原档收藏、色花图片、色花文学、综合讨论区。

### Test6 修复

1. **年龄确认改为自动点击**
   - 首页首次加载时，如果没有已记录确认状态，使用隐藏 `fetchCodeByWebView()` 打开站点；
   - 检测页面文本包含 `满18岁 / over 18 / please click here` 时，自动在 `a/button/input/[onclick]/[role=button]` 中寻找匹配按钮并 `click()`；
   - 跳转到真实论坛结构后保存 Cookie 和年龄确认状态；
   - `shtVerify` 可视验证页也使用同样自动点击逻辑，然后继续跳登录/签到；
   - 若未来站点加入验证码或真人挑战，不尝试绕过，只处理当前的声明式 18+ 首访页。

2. **Cookie 复用增强**
   - 同时尝试 `sehuatang.org` 与 `www.sehuatang.org` Cookie；
   - 优先复用 Test5 已保存的 `sht_web_cookie_v5`；
   - PC `fetchPC` 请求显式带 Cookie，用于论坛分组和帖子正文解析。

3. **论坛分类改为 Product-first 分组导航**

固定六个一级大类，与用户提供成熟旧规则保持一致：

```text
原创BT电影 → forum-2-1.html
在线视频区 → forum-41-1.html
原档收藏   → forum-145-1.html
色花图片   → forum-155-1.html
色花文学   → forum-154-1.html
综合讨论区 → forum-95-1.html
```

- 首页一级分类使用 `scroll_button` 横向切换；
- 只显示当前一级分类下的子板块；
- 子板块使用 `text_2` 两列布局；
- PC `forum.php` 继续按旧规则已验证的 `.bm_c → dt → a` 结构解析；
- 分组结果缓存 6 小时；
- 解析失败时至少回退到该一级大类自身，不重新显示 45 个板块长列表。

4. **帖子详情重写**
   - 不再使用 Test1 的 `postmessage_*` 粗分块作为主要链路；
   - 改用 PC 页面：

```text
#postlist > div
→ div.t_fsz Html
→ div.t_f Html fallback
```

- 作者优先 `.authi a` / `.xw1`；
- 正文使用 `rich_text` 保留原始图片和基础排版；
- 过滤 script/style/iframe、签名、`xs0`、`mbn`、`tip tip_4`、`本帖最后由…编辑` 等噪声；
- `file=` 图片属性改写为 `src=` 并补 Cookie；
- 相对图片/论坛链接改为绝对地址；
- 继续从每层正文扫描 magnet；
- 每条 magnet 保持 `115 / 迅雷 / PikPak / 复制` 四个动作；
- PC 请求拿不到正文时，再用 WebView 获取渲染后 `#postlist .t_fsz/.t_f`。

5. **保持不动**
   - Test4 的主题列表 `tid` 聚合、标题评分、缩略图解析继续使用；
   - 最新发表 / 最新热门 / 最新精华动态发现继续使用；
   - 搜索功能暂不在 Test6 扩大修改面；
   - Stable / Latest / 根 registry 继续不建立。

### Test6 静态门禁

- `patch_ux_thread_access.js`：`node --check` 通过；
- `bootstrap_test_v6_b10106.js`：`node --check` 通过；
- Test6 `release.json`：JSON 解析通过；
- Test6 Shell 外层规则及内层 `pages` JSON：解析通过。

## 0.1.0-test.5 / Build 10105 — 年龄确认 Cookie 持久化

- 参考用户提供的 dy2020 旧规则，新增 `shtVerify` X5 页面；
- 首次年龄确认仍要求人工点击；
- 确认完成后使用 `fba.getCookie()` / `fba.putVar()` 保存 Cookie 和确认状态；
- 自动继续跳转登录/签到；
- 实机结果：Cookie 持久化方向正确，但“年龄确认动作本身”仍是手动，因此 Test6 改为自动点击。

## 0.1.0-test.4 / Build 10104 — 论坛产品结构与 Parser 收敛

- 同一 `tid` 聚合候选链接，过滤 `00:24:34` 等时长并选择真实标题；
- 从同一主题链接提取真实缩略图；无图时降级 `text_1`；
- 论坛首页改为 `forum.php` 优先，避免只拿 Portal 5 个快捷入口；
- 最新发表 / 最新热门 / 最新精华从真实导航动态发现；
- 首次确认年龄后再登录。

## 0.1.0-test.3 / Build 10103 — 主题列表渲染源码恢复

- 主题列表数据链：`mobile fetch → mobile WebView → PC fetch → PC WebView`；
- 支持 `tid / ptid / thread-<tid>`；
- 失败页显示 HTML 字符数、anchor 数、主题数和页面 title。

## 0.1.0-test.2 / Build 10102 — 原生入口恢复

- 首页数据链改为 `portal → mobile forum → PC forum → WebView HTML`；
- 放宽 Discuz forum/thread 参数顺序、伪静态 URL、无引号 href；
- 首页最新/热门/精华改为紧凑原生入口。

## 0.1.0-test.1 / Build 10101 — 基础论坛 + 磁链云播

- 原生搜索、论坛分区、主题、帖子 Parser 初版；
- 帖子图片与 magnet 提取；
- magnet 提供 115 / 迅雷 / PikPak / 复制；
- 115：`hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>`；
- 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`；
- PikPak：`pikpakapp://mypikpak.com/xpan/main_tab?tab=1&add_url=<magnet>`。

## 当前禁用 / 待确认

- 未实机确认前，不直接 POST 签到或回帖；登录、验证码、人机验证继续由官方页面处理。
- 不保存真实账号、密码、Cookie、formhash 到仓库；运行态 Cookie 仅保存在海阔本地变量/WebView Cookie 容器。
- 不把 `.net/.com` 做成每次首屏并发探活固定税。
- Test 阶段不晋级 Stable，不登记根 `registry.json`。
- 下一阶段优先：Test10 实机闭环 → 确认三个 guide 入口 / 网站式预览图库 / 云播图标 / 六大类真实子板块 / 右侧主题预览图 → 再处理原生登录状态、签到、回复和 UI 精修。
