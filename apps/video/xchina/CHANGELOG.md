# 小黄书 CHANGELOG

## 0.1.0-test.6 / Build 10106 — 2026-09-15

状态：**当前 Test；隐藏正文规则已解码并完成本地合约 smoke，待海阔实机验证；无 Stable。**

### 阅读源隐藏正文规则落地
- [附件源码确认] 已递归解开 `ruleContent.content` 的 Base64 包装，不再只根据表层目录规则猜正文：小说正文为 `.fiction-body@p@html`；自拍图片为 `.amateur-image@html`；漫画图片为 `.comic-img-box@html`；套图图片为 `.photo-image@html`；视频与套图视频从 `main-container` 读取。
- [附件源码确认] 套图视频优先识别 m3u8；否则读取 `var domain` + `var videos=[...]`，目录里的 `#video=N` 对应数组第 N 项。Test6 在海阔侧统一展示检测到的全部媒体线路。
- [附件源码确认] 漫画图片 Referer 使用漫画独立站，套图/自拍使用主站 Referer。Test6 延续此边界，并只从图片自身域读取可用 Cookie。
- [附件源码确认] 补回 Test4 分类表漏掉的小说 `tag-2` 路由。

### Parser / 会话加固
- 正文/图片不再从命中 class 后无限向后扫描整页，而是按 `fiction-body / amateur-image / comic-img-box / photo-image` 建立内容作用域，减少推荐区、页脚图、头像混入正文。
- 小说正文不再用“遇到第一个 `</div>` 就结束”的非嵌套正则，避免正文内部嵌套节点导致后半章丢失。
- 媒体解析限定 `main-container`，支持 quoted m3u8、`var domain`、`var videos` JSON 及 JSON 失败时的 URL 回退提取。
- 继承 Test5：主站/漫画验证使用 `x5://`；HTML 与图片请求实时读取对应域 `getCookie()`。
- 新增媒体直链 live Cookie：播放 URL 按媒体自身域读取 Cookie，同时继续携带原详情页 Referer 与 UA；不会把主站 Cookie 无条件发给第三方媒体域。
- Test6 仍以冻结 Test4 为唯一 seed 做一次确定性变换，不叠加 Test5 Runtime，Test1–Test5 均保持不可变。

### 本地门禁
- `node --check`：Test6 Runtime Bundle / Bootstrap 通过。
- 合成页面 smoke：小说嵌套正文可完整提取；漫画目标容器外图片不会混入；`var domain + var videos` 可生成多条 MP4；媒体域 live Cookie 能进入播放 Header。
- Shell 外层 JSON 与 `pages` 内层 JSON 解析通过，规则 version `2026091502`。
- Release/Test/Manifest/Channels JSON 结构检查通过。

### 实机验收
1. 覆盖导入 Test6，设置页确认 `0.1.0-test.6 / Build 10106`。
2. 主站需要验证时进入 X5，返回后确认 Cookie 状态与首页加载。
3. 小说：列表 → 目录 → 长正文，重点检查正文中部/后半段不再截断。
4. 漫画：列表 → 章节 → 图片，确认没有头像/推荐图混入且图片 Referer 正常。
5. 套图/自拍：分页图片数量与原站一致；有视频的套图同时检查 m3u8 / 多 MP4。
6. 视频：详情 → 直链播放；若仍失败，记录实际播放器报错与媒体域，继续按实机 Header 调整。
7. 搜索、分类、翻页、模特关联作品做回归；未完成实机核心链验证前不得晋级 Stable。

## 0.1.0-test.5 / Build 10105 — 2026-09-15

状态：**历史 Test；代码门禁与仓库静态回读通过，未完成海阔实机验证；无 Stable。**

### X5 / Cookie 会话加固
- 保留 Test4 的小说、套图、漫画、视频、模特、搜索、分类、章节、图片和媒体 Parser，不改业务协议面。
- 主站与漫画站“浏览器验证”入口由 `web://` 改为 `x5://`，与项目已验证的 `getCookie()` 会话容器语义对齐。
- HTML 请求每次实时调用 `getCookie(url)` / `getCookie(origin)`，有 Cookie 时才附加 `Cookie` Header；不保存账号密码，不把 Cookie 明文写入 KV、文件、CHANGELOG 或日志。
- 图片请求按图片 URL 自身域名实时读取可用 Cookie，避免把主站会话无条件泄漏到第三方媒体域。
- 设置页仅显示“主站/漫画 Cookie 已读取或未读取”，不展示凭据内容。
- Cloudflare/验证页仍遵循：普通 fetch（现在自动带 live Cookie）→ 限次 WebView 兜底 → stale cache；验证页本身不写入正常 HTML 缓存。
- Test5 只以冻结 Test4 为唯一 seed 做一次确定性变换，Test1–Test4 均保持不可变；未重新引入 Test1→Test2→Test3 多层补丁链。

### Test5 实机验收
1. 覆盖导入后设置页显示 Test5 / Build 10105。
2. 打开“当前线路完成验证”应进入 X5；完成站点验证后返回设置页，主站 Cookie 状态应由“未读取”变为“已读取”（如果站点确实下发 Cookie）。
3. 刷新首页，确认无需重复验证即可读取列表；若仍失败，记录错误页/耗时，不把 403 当 Parser 空数据。
4. 漫画线路同样用 X5 验证，随后测试漫画列表 → 章节 → 图片。
5. 回归 Test4 全部核心链：小说目录/正文、套图分页/图片/附带视频、视频播放、搜索、分类、模特关联作品。
6. 未完成上述实机验证前不得晋级 Stable。

## 0.1.0-test.4 / Build 10104 — 2026-09-13

状态：**历史 Test，代码门禁与本地合约 smoke test 已通过；未完成海阔实机验证。**

### 阅读源协议补齐
- [附件源码确认] 参考用户上传的 `✈️ 小黄书-夜明空` 阅读源（源内最后更新 2025-11-13），主站仍为 `https://xchina.co/`，发布页为 `https://xiaohuangshu.me`，漫画链独立使用 `https://litu100.xyz`。
- [附件源码确认] 阅读源在返回 `Just a moment` 时会清 Cookie、打开浏览器完成验证后再连接；Test4 因此保留 Test3 的普通 fetch → 限次 WebView 兜底，并在设置页提供主站/漫画线路浏览器验证入口。
- [附件源码确认] 搜索契约：小说 `/fictions/keyword-<key>/<page>.html`、套图 `/photos/keyword-<key>/<page>.html`、视频 `/videos/keyword-<key>/<page>.html`、漫画 `/comics/kk-<key>/<page>.html`。
- [附件源码确认] 列表封面不仅可能来自 `<img>`，还大量来自 `.img` 的 `style:url(...)`；Test4 的封面解析同时支持 CSS background 与 `data-original/data-src/src`。
- [附件源码确认] 小说目录主要位于 `.chapter-container`，漫画目录位于 `.chapters`；漫画正文图片位于 `.comic-img-box`，套图/自拍正文主要位于 `.photo-image/.amateur-image`。
- [附件源码确认] 视频与带视频套图既可能直接包含 m3u8，也可能使用 `var domain` + `var videos=[...]`；Test4 统一解析两种媒体形态并附带 Referer/UA。
- [附件源码确认] 发现页提供小说标签、漫画状态/地区、套图专辑/工作室/地区、视频系列等大量固定路由；Test4 按内容类型分组还原大部分当前路由，并保留 Test3 已有模特链。

### Test4 架构与交互
- Test4 改为**独立 Runtime**：不再启动时下载 Test1 再做字符串替换；Test1 / Test2 / Test3 全部保持不可变历史版本。
- 继续使用 `rule=&simple=true` 与 `xc_url / xc_path` 命名空间，避免中文规则名和海阔保留 `url` 参数事故回归。
- 保留 Test3 私有文件 HTML 缓存、最近成功线路、主域/备用域轮询、最多两条主站 WebView 与单条漫画 WebView 兜底。
- 首页主链调整为小说 / 套图 / 漫画 / 视频，可进入模特列表；分类页按阅读源分组展示，不再使用 Test1 的少量旧系列 ID。
- 小说详情自动区分“书籍目录页 / 章节正文页”；有章节时进入目录，无章节时直接阅读正文。
- 漫画详情自动区分“作品章节页 / 图片正文页”；章节正文使用独立漫画域名并支持相对/绝对图片地址。
- 套图不再复制阅读源的“视频模式”开关：图片阅读、分页和附带视频入口并存，更适合海阔原生交互。
- 新增独立章节页、阅读器页、播放页，同时继续保留原站网页兜底与验证入口。

### 已完成门禁
- `node --check`：Test4 Runtime / Bootstrap 通过。
- Shell 外层规则 JSON 与 `pages` 内层 JSON 均可解析，规则 version 为 `2026091304`。
- Runtime 全局导出 smoke：`XChinaRemoteRuntime 0.1.0-test.4 / Build 10104`，14 个 Shell 调用入口均存在。
- 合成 HTML 功能 smoke 已验证：漫画列表 + CSS 封面、小说章节识别、小说正文、漫画图片、`var domain + var videos` 媒体解析。
- Git blob 与本地 `git hash-object` 对 runtime/bootstrap/release/test/manifest/channels/shell 逐字节核对一致。

### Test4 实机验收优先级
1. 覆盖导入 Test4 后首页可打开，Build 为 10104。
2. 小说 / 套图 / 漫画 / 视频四主标签与“模特”入口均可进入；二级页不出现规则名/URL scheme 异常。
3. 主站当前网络下普通 fetch、备用域、浏览器验证、WebView 兜底的实际表现与耗时。
4. 漫画：列表封面 → 详情/章节 → 图片正文，重点确认 `litu100.xyz` 当前网络可访问性。
5. 小说：列表 → 目录 → 正文，确认章节容器和正文 class 未变化。
6. 套图：列表 CSS 封面 → 图片 → 分页 → 附带视频。
7. 视频：列表 → 详情 → m3u8 / MP4 / `var videos` 播放；直链失败时再根据实机 HTML/报错调整 Header。
8. 搜索四类型、分组分类、翻页、模特关联作品。
9. 根据真实截图继续优化卡片比例、首页密度、分类页分组和详情页层级。

### 发布边界
- Test4 未经过海阔实机核心链验证前不得晋级 Stable。
- 本轮只切 Test，不创建或宣传 Stable。
- 若实机与附件历史规则冲突，以当前实机 HTML / 当前站点结果为最高事实，附件规则仅作为可复核协议基线。

## 0.1.0-test.3 / Build 10103 — 2026-09-13

状态：**历史 Test，待海阔实机验证；无 Stable。**

### Test3 单层整合发布
- Test3 不加载 Test2 热补丁，而是每次直接读取冻结的 Test1 Runtime，并通过一个 `runtime_bundle.js` 一次性整合 Test2 的海阔路由修复与本轮网络/缓存加固，避免 Test1 → Test2 → Test3 多层补丁链。
- 中文二级页统一使用 `rule=&simple=true` 继承当前规则上下文；详情、分页、分类等业务 URL 统一使用 `xc_url`，继续规避中文规则名编码和海阔保留 `url` 参数冲突。
- 影片 / 套图 / 小说 / 模特四条内容链及搜索、分类、分页继续沿用 Test1 的首版业务 Parser，减少本轮同时变化的业务面。

### Cloudflare / 网络与缓存加固
- 页面获取改为两阶段：先轮询当前线路、最近成功线路、主域、备用域的普通 `fetch`；全部失败后才最多尝试两条 `fetchCodeByWebView`，避免 403 时每个域名都启动 WebView 导致长时间阻塞。
- WebView 获取成功后继续使用同一 HTML Parser，并记录最近成功域名；全部失败时保留站点网页入口，不把阻断误报成“无资源”。
- HTML 页面缓存从 `setItem` 大字符串迁移到规则私有文件 `saveFile/readFile`；KV 只保存时间戳与线路等小状态，规避私有 KV 容量事故。
- 外部复核时 `https://xchina.co/` 仍可能返回 403，因此最终网络链必须以用户当前网络/代理和海阔实机为准。

### Test3 实机验收优先级
1. 覆盖导入 Test3 后首页可打开，显示 Build 10103。
2. 影片 / 套图 / 小说 / 模特四入口均可进入，不出现中文规则名或 `url` 路由异常。
3. 当前网络下主域/备用域的直连与限次 WebView 兜底耗时是否可接受。
4. 影片列表 → 详情 → HLS/MP4 播放；若直链失败，网页播放兜底可用。
5. 套图列表 → 详情 → 图片阅读 / 下一页 / 附带视频。
6. 小说上一章/下一章、模特关联影片/写真。
7. 搜索、分类、下一页。
8. 根据实机截图继续优化 UI 密度、卡片比例、空态和详情层级。

### 发布边界
- Test1、Test2 保持不可变历史版本，不原地覆盖。
- Test3 未经过海阔实机核心链验证前不得晋级 Stable。
- 根云仓库展示索引暂不把它宣传为 Stable；先完成直接 Test 交付和实机闭环。

## 0.1.0-test.2 / Build 10102 — 2026-09-13

状态：**历史 Test，待海阔实机验证；无 Stable。**

### P0 海阔路由热修复
- 保留 Test1 的影片、套图、小说、模特四条内容链及请求/解析逻辑，不改站点业务 Parser。
- 修复中文规则二级页路由：Test1 的 `rule=` 使用 `encodeURIComponent("小黄书")`，与已验证的海阔中文规则路由事故冲突；Test2 统一使用 `rule=&simple=true` 继承当前规则上下文。
- 修复业务 URL 路由参数：详情、下一页、分类跳转不再使用通用 `url` query，改为应用命名空间 `xc_url`，避免海阔页面模型/路由字段与业务参数碰撞。
- 采用 immutable hotfix：Test1 Runtime 不覆盖；Test2 `hotfix_bundle.js` 拉取 Test1 Runtime、校验锚点、只做上述合同替换后加载为 `XChinaRemoteRuntime 0.1.0-test.2 / Build10102`。

### Test2 实机验收优先级
1. 导入后首页能正常进入。
2. 点击“影片/套图/小说/模特”不出现“找不到 `%E...` 小程序”或 URL scheme/ArticleListModel 类异常。
3. 影片：列表 → 详情 → 播放。
4. 套图：列表 → 详情 → 图片阅读/附带视频。
5. 小说：列表 → 章节 → 上一章/下一章。
6. 模特：人物 → 关联影片/写真。
7. 搜索、分类、下一页。

## 0.1.0-test.1 / Build 10101 — 2026-09-13

状态：**历史 Test，不覆盖；无 Stable。**

### 站点事实
- 主站：`https://xchina.co/`。公开网址发布页当前同时给出 `xchina001.ink` 作为最新域名。
- 站点为多内容产品，不是单视频站：至少包含影片、套图/写真、模特人物与小说。
- [外部规则确认] 视频首页 `/videos.html`；列表结构 `.videos .item`；标题 `.text a`；封面 `data-poster`；时长 `.tag .duration`；分页 `.pager .next`。
- [外部规则确认] 视频搜索 `/videos/keyword-<keyword>/<page>.html`。已知系列入口：中文 AV `series-63824a975d8ae`、日本 AV `series-6206216719462`、模特私拍 `series-6030196781d85`、业余拍摄 `series-617d3e7acdcc8`、情色电影 `series-61c4d9b653b6d`、其他影片 `series-60192e83c9e05`。
- [外部规则确认] 视频详情的页面脚本内可出现 HLS 地址；历史实现对 `playhls.com` 请求设置 Host 头。
- [外部规则确认] 套图首页 `/photos.html`；列表结构 `.list .item`；搜索 `/photos/keyword-<keyword>/<page>.html`；已知 album 1~11 分类。详情既可能是图片，也可能带 `videos` JS 数组。
- [当前索引确认] 小说正文使用 `/fiction/id-...html`，正文页存在上一章/下一章；人物详情使用 `/model/id-...html`，人物列表使用 `/models/type-...`。
- 主域存在 Cloudflare/网络阻断可能，普通抓取可能 403；因此请求层不把页面绑定到单一域名。

### Test1 实现
- 建立 `XChinaRemoteRuntime` 单 Runtime 模块，页面、解析、域名切换集中在一个首版可审计实现内。
- 首页：影片/套图/小说/模特四入口，首屏只抓视频首页，避免一次启动并发四个重请求。
- 视频：列表、分类、关键词搜索、详情、HLS/MP4 脚本地址提取、相关人物/影片、网页播放兜底。
- 套图：列表、固定主题分类、关键词搜索、详情图片提取、附带视频识别、分页继续阅读。
- 小说：列表/搜索、正文提取、上一章/下一章、网页原文兜底。
- 模特：列表/搜索、人物详情、人物简介、关联影片/写真。
- 设置：自动线路、`xchina.co`、`xchina001.ink` 手动切换；显示最近成功线路和网页登录入口。
- 发布链：Remote Manager 2.0.1 + `bootstrap_test_v1_b10101.js` + immutable `releases/0.1.0-test.1/runtime.js`。

### Test1 已知问题
- 内部 `page()` 将中文规则名 URL 编码后写入 `rule`，违反已验证的海阔中文规则二级页合同。
- 详情/分页内部路由用 `url` 作为业务 query，存在海阔路由字段碰撞风险。
- 因此 Test1 不再作为推荐实机入口，直接由 Test2 替代；Test1 文件保留为不可变历史对照。

### 仍待实机验证
- `fetch()` 在用户当前网络/代理下是否能直接越过 Cloudflare；若不能，需要浏览器 Cookie 容器或站点备用域策略。
- 视频详情脚本在 2026-09 当前真实页面中的变量名和 HLS Header 是否仍与历史规则兼容。
- `/fictions.html`、`/models.html` 及其关键词搜索路径是否与当前站点完全一致。
- 套图真实图片 class、跨页数量以及带视频套图的播放器链。
- UI 卡片比例、标题长度、详情页信息层级，需要根据实机截图继续优化。

### 禁止事项
- 未实机通过前不得切 Stable。
- 不把 Cloudflare 失败误判为解析器无数据。
- 不因分类名称推断媒体类型；详情页以真实脚本/图片结构判定视频或图片。
