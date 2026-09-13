# 小黄书 CHANGELOG

## 0.1.0-test.1 / Build 10101 — 2026-09-13

状态：**Test，待海阔实机验证；无 Stable。**

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

### 待实机验证

- `fetch()` 在用户当前网络/代理下是否能直接越过 Cloudflare；若不能，需要浏览器 Cookie 容器或站点备用域策略。
- 视频详情脚本在 2026-09 当前真实页面中的变量名和 HLS Header 是否仍与历史规则兼容。
- `/fictions.html`、`/models.html` 及其关键词搜索路径是否与当前站点完全一致。
- 套图真实图片 class、跨页数量以及带视频套图的播放器链。
- UI 卡片比例、标题长度、详情页信息层级，需要根据实机截图继续优化。

### 禁止事项

- Test1 未实机通过前不得切 Stable。
- 不把 Cloudflare 失败误判为解析器无数据。
- 不因分类名称推断媒体类型；详情页以真实脚本/图片结构判定视频或图片。
