# 夜社短剧 CHANGELOG

> 程序级长期技术记忆。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 全局文档。未实机确认的内容明确标记“待验证”。

## 当前基线

- App ID：`yeshe`
- Stable：无
- Test：`0.1.0-test.1 / Build10101`
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
