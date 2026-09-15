# 小黄书 CHANGELOG

## 0.1.0-test.6 / Build 10106 — 2026-09-15

状态：**当前 Test；隐藏正文规则已解码并完成本地合约 smoke，待海阔实机验证；无 Stable。**

### 规则仓库交付补充（2026-09-15）
- 首次把小黄书以 `channel-group + channelsPath` 直接加入根 `manifest.json` 后，用户实机出现“我的规则仓库”整页白屏/持续刷新；回退根 `manifest.json + manifest_meta.json` 到 20 项已知正常目录后立即恢复。
- 结合规则仓库 `hybridProgramData()` 当前实现确认：`entryType=channel-group` 或存在 `channelsPath` 时，首页构造程序数据会同步调用 `channelMeta()`；新程序一旦该远程版本元数据链路慢/失败，会把额外网络依赖带入首页热路径。
- 因此当前小黄书在根云仓目录改用**轻量单版本卡片**：`entryType=single`，直接指向 Test6 Shell，不在首页加载 `channels.json`；图标也改用仓库内现有通用图标，避免再引入目标站 favicon 外部请求。
- `apps/video/xchina/channels.json` 仍保留为程序内部版本元数据，不删除；等规则仓库后续把 channel metadata 改成详情页惰性加载或该链路完成专项实机验证后，再考虑恢复多版本卡。
- 这次目录修复不修改 Test6 Runtime/Bootstrap/Shell，不影响已冻结 Test1–Test5，也不晋级 Stable。

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
- 新增设置页：显示当前线路、缓存状态、验证入口、数据清理和版本信息。

### 已完成门禁
- JS 语法、Runtime 装载、Shell JSON/Pages JSON、Release/Test/Manifest/Channels JSON 均通过。
- 列表、分类、搜索、详情、章节、图片、媒体 Parser 已有最小合约 smoke。
- Test4 未晋级 Stable，等待海阔实机验证。
