# 夜社短剧 CHANGELOG

> 程序级长期技术记忆。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 全局文档。未实机确认的内容明确标记“待验证”。

## 2026-08-29 · 0.1.0-test.4 / Build10104 · 二级路由与首页占位修复

### Test3 实机结果
- 首页主体 UI 已正常渲染，用户明确指出上方 Hero 图片占位过大，页面首屏信息密度偏低。
- 点击内容封面和分类入口会报错。
- Test1 的分类二级页曾实际成功进入，只是参数没有 URLDecode；Test3 为修参数时把内部页面 URL 从 `rule=&simple=true` 改成了显式 `rule=<当前标题>`，与当前夜社 Shell 的已验证行为发生冲突。

### Test4 修复
- 所有内部 `hiker://page` 路由恢复为 Test1 已证明可进入的 `rule=&simple=true`；继续保留 Test2/Test3 的 `MY_URL → decodeURIComponent()` 参数恢复，因此不会再回退到百分号编码标题问题。
- 内容卡详情路由只携带 `yeshe_url + yeshe_title`，不再把 cover/desc 一并塞进页面 URL，降低长 URL 与特殊字符造成的路由风险。
- 首页 `pic_1_full` 大横幅移除，改为紧凑 `movie_1_left_pic` 品牌卡，缩短首页顶部空白区，让搜索和分类入口更靠前。
- Test3 的 direct→WebView HTML fallback、`/upload/` 图片误杀修复、可见协议诊断全部继承。

### Test4 必测
1. 点击首页任意内容封面，应能进入详情页。
2. 点击“分类大全”以及任意分类，应能进入对应页面，不再报错。
3. 分类中文标题必须正常显示，不能再出现 `%E7...`。
4. 首页顶部品牌区高度明显缩短，搜索和分类入口应进入首屏。
5. 若某个入口仍报错，请保留完整错误提示截图；下一版只针对该具体 action 修复，不再同时大改协议层。

## 2026-08-29 · 0.1.0-test.3 / Build10103 · Test2 交付前 Parser Fixture 修复

- Test2 元数据切换后，在发布前补做 Parser fixture，使用真实站常见的 `/upload/...jpg` 图片路径模拟短剧卡片。
- Fixture 发现 Test2 的图片噪声过滤正则 `ads?\\b` 会命中单词 `upload` 末尾的 `ad`（`d` 与后续 `/` 构成 word boundary），导致 `/upload/` 下的正常封面被当作广告图片丢弃；没有封面后 Card Adapter 会继续过滤整张内容卡。
- 这与 Test1 实机“页面结构能出、业务卡片全空”的现象高度吻合，因此 Test2 不再作为推荐交付，冻结并立即新建 Test3。
- Test3 将广告图片判断收紧为独立路径段 `/ad/`、`/ads/` 或明确广告资源名，不再用裸 `ad(s)?\\b` 扫整条 URL。
- 同一 fixture 已验证：`<a href="/play/123/1/2.html"><img data-src="/upload/2026/a.jpg"></a>` 可以正常产出内容卡与绝对封面 URL。
- Test3 继续完整继承 Test2 的：MY_URL 显式 URLDecode、direct → WebView HTML fallback、可见协议诊断。
- 当前推荐 Test：`0.1.0-test.3 / Build10103`；仍需用户实机确认首页、分类和实际播放，禁止晋级 Stable。

## 2026-08-29 · 0.1.0-test.2 / Build10102 · 首轮实机恢复版

### Test1 实机结果
用户当前设备确认 Test1 **不能正常使用**：
- 首页 Hero / 搜索 / 快捷入口 / Tab UI 能正常渲染，但“最近更新”没有任何业务卡片。
- 点击“AI短剧”等分类后，系统标题直接显示 `AI%E7%9F%AD%E5%89%A7`，说明当前海阔设备的 `getParam()` 在这条 `hiker://page` 链上没有替我们完成 URLDecode。
- 同一分类页显示“分类地址待解析 / 分类暂不可用”，证明分类名和 URL 的跨页恢复合同失效。
- 设置页能看到当前线路，但“协议诊断 / 播放诊断”标题下面没有具体 JSON，说明 Test1 把诊断放在 `long_text.desc` 的写法在当前设备不可见。

### 根因与修改边界
Test2 不继续堆 UI，而是只修四个已被实机证明的运行层问题：
1. **跨页参数**：不再直接依赖 `getParam()`。新增与 18AV 已验证方案一致的 `MY_URL → 正则取参数 → decodeURIComponent()` 恢复函数；所有 `yeshe_category_name / yeshe_category_url / yeshe_url / yeshe_title / yeshe_cover / yeshe_desc / kw` 都走同一合同。
2. **列表解析**：Test1 的通用 `pdfa(html,'a') → 对 node 再 pdfh` 方案对当前页面没有产出卡片；Test2 改成直接扫描完整 HTML 的 `<a href>...</a>`，从 anchor 内提取 `img data-original/data-src/data-lazy-src/data-echo/src` 与标题，减少对 node 形态的假设。
3. **传输层**：普通 `fetch()` 拿不到可解析 HTML 时，Test2 才退到 `fetchCodeByWebView()` 获取浏览器渲染后的源码；fresh last-good 仍优先，不把 WebView 变成每次首屏固定启动税。
4. **诊断可见性**：协议/播放诊断改为写到 `long_text.title`；首页空数据也会直接显示 stage / transport / HTML length，下一轮截图能区分“没请求到”还是“请求到了但 Parser 没命中”。

### Test2 运行链
```text
yeshe_remote_test_v2_b10102.txt / rule 2026082902
→ bootstrap_test_v2_b10102.js
→ Remote Manager 2.0.4 / id yeshe-test / minBuild 10102
→ releases/0.1.0-test.2
   protocol.js  Test2
   provider.js  复用冻结 Test1
   playback.js  复用冻结 Test1
   runtime.js   Test2
```

### Test2 必测
1. 覆盖导入后，首页“最近更新”是否开始出现真实卡片；若仍为空，截图里必须能看到 `stage / transport / HTML length`。
2. 点击“AI短剧”后页面标题必须正常显示“AI短剧”，不能再出现 `%E7...`。
3. “AI短剧 / 国产视频 / 动漫 / 漫画 / 写真 / 小说”各至少进入一个，确认分类 URL 已恢复。
4. 设置页必须能看到完整协议诊断 JSON；若首页仍空，把该页截图回传。
5. 只有分类和首页恢复后才继续冻结搜索、详情、播放、漫画/写真/小说 DOM；Test2 仍禁止晋级 Stable。

## 当前基线

- App ID：`yeshe`
- Stable：无
- Test：`0.1.0-test.4 / Build10104`
- 模式：自用 Remote Test
- 网站品牌入口：`https://yeshe.tv/`
- 用户 2026-08-29 当前可用入口：`https://宽宏大量f562sym.baitasi.org/`
- 运行时使用其 ASCII/Punycode 形式：`https://xn--f562sym-ph2mz2penax520c.baitasi.org`
- 短剧分发短链：`https://ysurl.win/755WwN`

## 2026-08-29 · 0.1.0-test.1 / Build10101 · Fresh Rewrite

### 已确认的网站事实

- `yeshe.tv` 当前是夜社短剧品牌落地页，公开展示都市、言情、古装、穿越、重生、逆袭、甜宠、悬疑等短剧类型。
- 品牌页“查看全部短剧/热播短剧”通过 `ysurl.win` 跳转到轮换业务域名，当前跳转目标使用 `/type/13.html?chl=yeshetv` 结构。
- 单个短剧条目已观察到 `/play/<contentId>/<line>/<episode>.html` 路径结构。
- 用户实机截图确认当前业务站左侧分类至少包含：
  - 视频：AI短剧、擦边短剧、国产视频、日本AV、欧美无码、韩国BJ。
  - 动漫：同人作品、动画卡通、3D动漫、中文动漫、里番、泡面番。
  - 有声：有声小说、淫词艳曲、激情强麦。
  - 漫画：韩国H漫、日本H漫、3D漫画。
  - 写真：素人系列、网红COS、机构套图、内购私拍、各国套图等。
  - 小说：都市生活、学生校园、家庭乱伦、玄幻武侠、同人改编等。
- 截图还确认站点存在登录、搜索、红灯秘境、每日签到、夜间模式、闲聊吹水等网页侧入口/功能。

### Test1 产品结构

```text
Home
  Hero Banner
  → 原生搜索
  → 分类大全 / 热门短剧 / 收藏 / 历史
  → 热播/言情/都市/古装/穿越/重生/逆袭/甜宠/悬疑
  → 三列内容卡

Catalog
  视频 / 动漫 / 有声 / 漫画 / 写真 / 小说
  → 动态匹配当前站点 type/list/category href
  → 当前页原生 Feed

Detail
  Hero
  → Primary Play / 阅读
  → 收藏 / 原页 / 登录 / 设置
  → 线路与选集 / 章节 / 图集 / 正文
  → 相关推荐

Mine
  收藏 / 历史 / 网站登录
  → 动态签到/社区工具

Settings
  当前线路 / 刷新线路
  → 播放兜底
  → 协议诊断 / 播放诊断
```

### Domain / Request

- 正常启动优先读取 `yeshe_last_good_origin_v1`，不每次全量探活。
- last-good 不可用时才重新发现：
  1. `ysurl.win/755WwN` 的 302 Location。
  2. 用户当前 gateway seed。
  3. stale last-good 作为最终恢复入口。
- 导航映射缓存 6 小时，避免每页重复抓取全站菜单。
- 请求层统一 UA / Referer / timeout / status / diagnostics。
- 当前动态线路发现逻辑待海阔实机验证 Location Header 的实际返回格式。

### Parser / Provider

- 列表先尝试常见 module/stui/myui/vodlist/card 结构，再退到“带图片且 href 命中 play/detail/read/book/novel/comic/album”的通用 Anchor Adapter。
- 分类中心以用户截图中的业务分类为 Product Catalog，同时使用当前站点真实导航 href 作为协议值；未解析到的分类不会伪造 URL。
- 搜索优先解析站点 form action + wd/keyword/key/q，再有限尝试常见搜索路由；成功路由缓存。
- 翻页模式仅在实际返回卡片后缓存 dash/query/slash 模式。
- 视频详情从 `/play/<id>/<line>/<episode>.html` 重建 EpisodeModel，并按线路分组。
- 非视频内容初版提供章节、正文、图集三种通用恢复链。
- **待验证**：各内容类型真实 DOM 选择器、搜索表单和翻页格式；实机结果出来后应冻结精确 Adapter，不能长期每次“猜模板”。

### Playback

Test1 的默认选择器：

```text
<video>/<source>/<audio> src
→ 页面源码中的 m3u8/mp4/mp3
→ player_aaaa / player_data JSON
→ encrypt=0/1/2 已知解码
→ iframe 一跳后重复结构化解析
→ video:// 嗅探
→ 可选 web 原页
```

- 解析到单条真实媒体地址时直接返回媒体 URL + User-Agent/Referer/Cookie Header，不强行包装多线路 PlayModel。
- 播放失败写入 `yeshe_play_diag_v1`，不保存 Token/Cookie 原值。
- **待验证**：当前网站真实 player JSON、媒体地址加密与 HLS Header；Test1 不把结构猜测写成已完成事实。

### Login / Account

- Test1 只提供“网站登录” Web 会话入口和 Cookie 复用。
- 每日签到、红灯秘境、闲聊吹水等如果能从当前导航解析到 URL，会在“我的”中提供网页入口。
- 账号资料、签到接口、收藏同步等尚未确认协议，因此 Test1 不伪造原生账号功能。

### UI / UX

- 采用夜蓝 + 品牌红 Design System，自建 versioned SVG 图标与 Hero。
- 首页只保留高频任务；全站复杂分类下沉到独立分类中心。
- 短剧类型在同一 Home PageContext 内 `refreshPage(false)`，不反复压页面栈。
- 普通详情统一 `simple=true`，避免沉浸标题栏叠加。
- 三列竖海报用于高密度浏览；详情 Primary Action 与低频动作分层。
- 选集网格只放真实 Episode；正倒序/线路属于控制层。

### 静态门禁

- `protocol.js / provider.js / playback.js / runtime.js` 已在提交前通过 `node --check`。
- Runtime 模块顺序固定：Protocol → Provider → Playback → Runtime。
- Release 模块绑定不可变 commit `c5ef26fb06a13904b6ce9830a179cacdbfa8cb04`。
- Stable 未建立，不存在覆盖 Stable 风险。

### 实机验收清单

1. 从“我的规则仓库”导入夜社短剧 Test1，首页能打开且 Banner/图标正常。
2. 首页能显示短剧卡片；切 5 次热播/言情/都市等 Tab 后返回 1 次即可离开页面。
3. 分类大全能识别截图中的视频/动漫/有声/漫画/写真/小说入口，点击后有真实列表。
4. 搜索任意已知标题能返回真实结果。
5. 任意短剧详情能解析标题、封面、选集；至少一集能直接播放或明确进入嗅探兜底。
6. 播放器列表只出现真实剧集/线路，不出现收藏、登录、设置等 DetailAction。
7. 漫画/写真/小说各至少抽测一项，确认图集/章节/正文实际 DOM；失败时记录截图和诊断。
8. 网站登录页可打开；登录后返回程序，站点 Cookie 仍可用于请求（待验证）。
9. “设置与诊断”中的当前线路、协议诊断、播放诊断可读且不泄露 Cookie/Token。
10. UI 截图复核首页、分类、详情三类页面后再进行 Test2，禁止 Test1 直接晋级 Stable。
