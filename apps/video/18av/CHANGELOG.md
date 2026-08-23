# 18AV CHANGELOG

## 0.1.0-test.1 / Build 10101 — 2026-08-23

状态：**全新程序第一版 Test；未经过海阔实机验证，禁止晋级 Stable。**

### 站点事实
- 主站：`https://18av.mm-cg.com/zh/`；漫画同系站：`https://18h.mm-cg.com/zh/`。
- 主站同时存在视频、写真、小说；漫画分长篇和短篇/同人，实际位于 18H 域名。
- 视频主栏目已确认包含中文字幕、有码、无码、素人、无码破解、H 动画、国产自拍等；H 动画另有有码/无码/3D 子类。
- 无码品牌使用独立 `uncensored_makersr/.../<page>.html` 路由；写真品牌使用 `cg_search/all/<name>/<page>.html`；小说分类使用 `novel_search/all/<name>/<page>.html`。
- 随机首屏分页后会切换到 `<prefix>_list/all/<page>.html`，不是 `index_<page>.html`。例如 `chinese_random/all/index.html` 的第二页为 `chinese_list/all/2.html`；漫画短篇同理从 `doujin_random` 切到 `doujin_list`。

### Product / Architecture
- 采用四类内容隔离：`Video Adapter / Comic Adapter / Photo Adapter / Novel Adapter`，不让视频播放、漫画图片、写真图集、小说正文互相污染。
- 首页为原生 Hiker UI：Hero + 视频/漫画/写真/小说四大入口 + 搜索/收藏/历史/设置 + 横向热门栏目 + 内容 Feed。
- 分类中心从静态核心栏目和官网实时导航合并生成，自动吸收品牌、写真来源、小说分类等子栏目；同 URL 去重。
- 新增独立“影片类别库”：读取 `/chinese_categorylist/list/index.html`，动态解析 `/chinese_category/<id>/<name>/<page>.html`，每个海阔分页最多渲染 120 个类别，避免一次塞入数百个按钮。
- 视频使用 `movie_2`；漫画/写真使用竖版卡；小说使用文字列表。详情页按内容类型分流。
- 漫画/写真进入 `pic_1_full` 长图阅读器；小说进入独立文本阅读器并支持 14–26px 字号切换。
- 视频详情先提取 `<video>/<source>` 和 HTML 中 `.m3u8/.mp4`，其次尝试 iframe，最后交给海阔 `video://` 媒体嗅探。该链必须实机确认后才能宣称播放完成。
- 本地收藏、浏览历史、诊断和 Test 更新检查已加入；列表规模均有限制，避免无限写入私有 KV。
- 内容安全过滤在首页、分类、搜索、详情统一生效：涉及未成年人、明显非自愿或私密泄露的条目不展示、不搜索、不进入详情。

### Test1 实机验收
1. 首页是否能打开，八个图标入口与横向分类是否排版正常，封面是否显示。
2. 中文字幕/有码/无码/动画/国产等任取两类，测试第一页和第二页，确认随机页→list 页分页转换正确。
3. 漫画长篇、漫画短篇各打开一项，确认详情封面、图片数量和阅读器真实正文图。
4. 写真图片、国产写真各打开一项，确认图集正文与 Referer 图片头。
5. 小说打开一项，确认正文不是导航/页脚，字号切换可用。
6. 视频任取 2–3 项测试播放；若失败，记录详情诊断中的媒体数、iframe 数和原网页表现，下一版只修 Playback Adapter。
7. 搜索分别测试视频/漫画/写真/小说；搜索协议属于首版探测链，若某类无结果，保留诊断继续锁定官网真实表单契约。
8. 收藏、历史、设置清理功能回归。

### 已知边界
- 还没有海阔实机截图，因此 UI 只能判定“架构和组件选择完成”，不能判定视觉最终完成。
- 漫画/写真正文图片可能存在 JavaScript 动态生成或懒加载字段，Test1 已覆盖常见 `src/data-src/data-original/data-lazy-src/data-echo`，实际缺口由实机诊断决定。
- 视频播放器真实 Server/脚本链尚未实机验证；Test1 不伪称“全部可播放”。
