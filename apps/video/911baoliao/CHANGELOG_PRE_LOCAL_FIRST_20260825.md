# 911爆料 CHANGELOG

## 当前基线

- App ID：`911baoliao`
- 当前通道：Test
- 当前版本：`0.1.0-test.5` / Build `10105`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 初始入口：`https://begin.mrbyudbq.com/`
- 当前已验证镜像：`911bl.com` / `911bla.com` / `911bg7.com` / `d10cq29fdobmmg.cloudfront.net`
- 真实文章合同：`/archives/<numeric-id>/`
- 架构：Remote Shell → CDN Bootstrap → Remote Manager 2.0.2 多镜像 → immutable release。
- 该程序不实现评论、匿名投稿或下载功能。
- 已进入“我的规则仓库”动态目录：根 `manifest.json` → `apps/video/911baoliao/channels.json` → Test Shell。

## 0.1.0-test.5 / Build 10105 — 2026-08-23 21:18

### 真实文章合同、封面 Parser 与 LazyRule 播放根因修复

Test4 实机继续暴露两个关键事实：

1. 首页仍把 `回家的路`、`投稿方式`、`常见问题`、`所有标签`、`关于我们`、`911暑期活动`、`加入911`、`官方TG群`、`官方推特`、`广告商务` 等站点功能页当成“最新爆料”，说明继续通过标题黑名单修通用 `<a>` Parser 不可靠。
2. 点击“立即播放”仍报 `java.lang.IllegalArgumentException: Expected URL scheme 'http' or 'https' but no colon was found`，堆栈明确经过 `LazyRuleParser → HttpParser`。回读 Test1 Runtime 后确认播放按钮构造为 `$(mediaJson, articleUrl).lazyRule(...)`；根据海阔 `$().lazyRule()` 合同，外层 `$()` 的第一参数必须是一个合法 URL，因此媒体 JSON 在 lazyRule 函数执行前就被 HttpParser 当作 URL 校验并失败。Test4 的媒体 URL 规范化虽然正确，但没有修到这一层。

Test5 不再继续叠标题黑名单，而是建立站点专用合同：

- 根据当前官网主页实际链接结构，真实正文统一认定为 `/archives/<数字>/`；首页、分类、搜索和相关推荐只接受该路径。
- `回家的路 / 投稿 / FAQ / 标签 / 活动 / 社群 / 官方推荐 / 广告商务 / 关于我们` 等非 `/archives/` 页面从结构上退出内容 Feed，不再依赖标题是否命中黑名单。
- 站点可用域名候选扩展为已实际确认的 `911bl.com`、`911bla.com`、`911bg7.com`、CloudFront 永久镜像及原始入口，保留最后成功域名优先。
- 封面 Parser 扩展到 `data-bg`、`data-background`、`data-background-image`、`data-thumb`、`poster`、`data-lazy-srcset`、`srcset`、CSS `background-image:url(...)` 及卡片块内直接图片 URL 候选。
- 图片继续排除 logo、brand、favicon、loading、placeholder、404/error、二维码、APP 下载及社交导航图。
- Runtime 卡片不再使用 911 错误占位图作为文章封面；如果真实封面仍未解析到，改为文本卡，避免“所有文章都显示同一个假封面”。
- 播放链重写：单线路由详情页直接交付真实媒体 URL；多线路需要动态返回 PlayModel 时，外层改为 `$(articleUrl).lazyRule(...)`，确保 HttpParser 看到的是合法文章 URL，媒体 JSON 仅作为 lazyRule 的函数参数，不再充当 URL。
- 没有可验证结构化媒体而存在网页播放器时，直接使用 `video://<articleUrl>` 嗅探兜底。
- 收藏 lazyRule 同步改为 `$(articleUrl).lazyRule(...)`，避免把标题/封面等普通字符串塞入 `$()` URL 参数。
- 安全过滤继续保留，并加强“私密/不雅/酒店/性爱 + 泄漏/流出/偷拍”等明显非自愿私密内容模式。

### Test5 实机验收点

1. 首页“最新爆料”第一项开始必须直接是真实 `/archives/<id>/` 文章，不再出现回家、投稿、FAQ、标签、活动、社群和广告功能页。
2. 有真实封面的文章应显示自身封面；解析不到时宁可使用文本卡，也不再显示统一错误图。
3. 点击有结构化媒体的文章播放时，不得再出现 `Expected URL scheme 'http' or 'https' but no colon was found`。
4. 如果 scheme 异常消失但视频仍不能播，再进入下一阶段研究 911 自身播放器的 HLS/iframe/签名协议；不得回退到“放宽 URL 校验”方案。

## 0.1.0-test.4 / Build 10104 — 2026-08-23 21:02

### 首页广告、封面与播放链实机修复

Test3 实机已经确认 CDN 启动链和中文内部路由均恢复，能够进入首页、详情，并能解析出正文与媒体。用户随后提供两张实机截图，暴露出三个独立业务问题：

1. 首页“最新爆料”前部把站点推广/导航入口误识别成内容卡，包括 `911爆料网`、`911爆料APP`、`章鱼导航`、`看图找番`、`AI换脸脱衣`、`APP`、`Telegram`、`Twitter` 等，它们不是正常爆料文章。
2. 通用列表 Parser 会从过大的邻近 HTML 中抓图，导致大量卡片串到 911 Logo、站点宣传图或占位图；而进入真实文章详情后可以看到该文章自己的真实封面，证明详情图片链与列表卡片图片链需要分开收紧。
3. 详情已经显示“已提取 3 条媒体线路”，点击播放却由海阔抛出 `java.lang.IllegalArgumentException: Expected URL scheme 'http' or 'https' but no colon was found`。这证明结构化媒体候选中混入了未规范化/非法 URL，不能只以“正则匹配到媒体字段”作为可交付播放线路的完成条件。

Test4 新增独立 `content_adapter_patch.js`，不改 Test1 Core/Runtime 基线文件：

- 新增站点推广/导航伪条目过滤，首页、搜索、相关推荐与本地列表继续经过统一安全过滤；上述已由实机确认的广告/导航项不再进入 Feed。
- 快捷分类同步排除明显的投放/广告导航项，保留正常内容分类。
- 列表封面新增 `data-original-src`、`data-lazy`、`data-srcset`、`srcset`、`background-image` 等常见 lazy/picture 字段解析。
- 列表图片改为“当前链接内部 → 最近内容卡容器”局部取图，不再直接从超大邻域任选第一张图，降低相邻卡片/站点 Logo 串图。
- 图片候选过滤 logo、brand、favicon、loading、placeholder、error、404、二维码、APP下载/社交导航图等明显非正文封面。
- 详情正文过滤站点最新地址、永久地址、APP 下载、回家邮箱、广告合作等推广段落，避免把网站自身推广块当事件正文。
- 新增 `normalizeMediaUrl()`：处理 HTML/JS 转义、百分号编码、`//host/path`、缺冒号的 `https//...`、相对 URL，并最终强制要求真实 `http://` 或 `https://`。
- 新增 `mediaLike()` 与 `normalizeMediaList()`：播放器只接收经过 URL 规范化且符合 MP4/HLS/stream/playlist 媒体特征的线路，blob/data/javascript/空值/非法 scheme 自动剔除。
- 单线路继续直接交付；多线路只有全部通过 HTTP(S) 校验后才构造 `urls/names/headers` PlayModel；如果结构化线路全部无效，则退回 `video://` 网页媒体嗅探，而不是把坏 URL 交给播放器。
- Test4 Shell、Bootstrap 与 lazyRule 回调继续使用 jsDelivr + Remote Manager 2.0.2 多镜像；`minBuild=10104`，保留 Test2 中文路由修复和 Test3 CDN 容灾。

## 0.1.0-test.3 / Build 10103 — 2026-08-23 20:40

### Raw GitHub 启动链实机修复

用户覆盖导入 Test2 后实机启动直接报错：

`获取远程依赖失败: https://raw.githubusercontent.com/.../apps/video/911baoliao/bootstrap_test_v2_b10102.js?v=10102`

这证明 Test2 的业务代码和中文规则名路由补丁尚未执行，故障发生在最外层 Shell → Bootstrap 交付链。回读源码确认 Test2 Shell、Bootstrap Manager 以及 Core 中供 lazyRule 二次加载使用的 `C.bootstrap` 都仍以 `raw.githubusercontent.com` 为主要/唯一依赖。

Test3 采用完整 transport hotfix，而不是只替换首页入口：

- 新 Shell `911baoliao_remote_test_v3_b10103.txt` 的首页、搜索和 8 个内部页面全部从 jsDelivr 加载 Test3 Bootstrap。
- 程序图标同步切换到 jsDelivr，避免 Raw 图片域名同类失败。
- Bootstrap 升级到 Remote Manager `2.0.2`。
- Remote Manager 配置启用 `jsDelivr → GitHub Web Raw → raw.githubusercontent.com` 多镜像回退。
- Core 的 `C.bootstrap` 通过 Test3 `transport_patch.js` 同步切到 jsDelivr，确保播放、收藏、清理、检查更新等 lazyRule 不会在后续动作再次掉回旧 Raw Bootstrap。
- `minBuild=10103`，旧 Test1/Test2 激活状态会被新 Shell 的最低 Build 门槛拉回 Test3 默认 Release。
- 保留 Test2 的原始中文规则名内部路由修复，其余首页 UI、Parser、收藏/历史逻辑不变。

## 0.1.0-test.2 / Build 10102 — 2026-08-23 20:17

### 中文规则名内部路由实机修复

用户实机截图确认：911 首页已经可以正常打开并识别到官网内容，但点击首页按钮、分类或内容卡时弹出：

`找不到“911%E7%88%86%E6%96%99”这个小程序`

回读 Test1 源码后确认根因不是页面注册缺失，而是 `Bl911Core.page()` 把 `MY_RULE.title = 911爆料` 通过 `encodeURIComponent()` 写入 `hiker://page/...?...rule=`。当前海阔实机不会把该 `rule` 参数自动解码回规则名，而是直接拿 percent-encode 字符串查找小程序，因此匹配失败。

Test2 采用单点不可变补丁：

- 内部 `hiker://page/<path>?rule=` 改为保留原始中文规则名，不再 percent-encode `rule` 值。
- `cat_url / post_url / q` 等普通业务参数继续 URL 编码，避免参数串扰。
- 独立搜索输入回调同步修复，避免输入关键词后再次把规则名编码。
- 首页、分类、详情、收藏、历史、设置等页面均继续复用 Test1 Shell 页面声明，不改页面 path。
- Test1 首页 UI、通用 Parser、图片/播放链、本地收藏和历史逻辑保持不变，只修路由。

## 云端仓库发布链修复 — 2026-08-23 19:59

用户实机反馈“云端仓库没有这个小程序”后确认：首版只完成 app 目录、Release/Bootstrap/Shell 与 `registry.json`，但遗漏了手机端真正消费的根目录发布链；同时 `channels.json` 误写成内部对象结构，而不是规则仓库版本中心要求的 `schema 4 + channels[]` 合同。

已修复：

- `apps/video/911baoliao/channels.json` 改为 `schema:4`、Test-only `channels[]` 标准格式。
- 根 `manifest.json` 增加 `911baoliao` 的 `channel-group` 展示项，`channelsPath` 指向上述标准 channels 文件。
- 根目录 revision 提升并与 `manifest_meta.json` 保持一致。
- 未修改“我的规则仓库” Stable 3.5.4 的 Release、Bootstrap 或 Shell；本次只修动态目录发布数据。
- 发布判断以后必须以“manifest 卡片 + channels 可导入 + meta revision/itemCount 成对一致 + 用户实机同步”作为完整条件，`registry.json` 只作为开发恢复索引。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 产品结构

首版采用干净模块重新实现，不复制 51吃瓜 Test1~Test5 的补丁堆栈：

```text
Core
├─ Request / dynamic base
├─ dynamic Category extractor
├─ generic Feed/Search parser
├─ Detail parser
├─ Image normalizer
├─ Playback extractor / direct / iframe / sniff fallback
├─ local Favorites / History
└─ Diagnostics

Runtime
├─ Home
├─ Category Hub / Feed
├─ Search
├─ Detail / Player handoff
├─ Favorites / History
└─ Settings / Diagnostics
```

### 功能基线

- 首页热点流与自动分页。
- 官网导航动态分类，不写死 51吃瓜分类路径。
- 独立站内搜索页，多种常见搜索路径有限尝试。
- 图文详情、正文图片、相关推荐。
- 结构化 MP4/HLS、iframe 二跳媒体提取；没有结构化媒体时 `video://` 作为最后兜底。
- 单线路直接交付，多线路才构造 `urls/names/headers`。
- 详情取得的媒体 seed 直接传给播放动作，避免点击后无必要二次请求详情。
- 本地收藏、浏览历史、清理功能。
- 当前域名、HTML 长度、内容卡/分类数量和最近播放路线诊断。

### 明确不实现

- 评论及楼中楼。
- 匿名投稿、上传。
- 资源下载、侵权资源导出。

### 内容边界

首页、分类、搜索、详情与本地列表统一经过内容过滤；明显涉及未成年人或明确非自愿私密影像的条目不进入本程序浏览/播放链。

Test1 一旦发布即冻结；后续根据实机截图/诊断建立 911 专用 Adapter，以新 Test 追加，不原地覆盖。
