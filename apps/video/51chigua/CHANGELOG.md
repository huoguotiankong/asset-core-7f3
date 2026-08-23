# 51吃瓜 CHANGELOG

## 当前基线

- App ID：`51chigua`
- 当前通道：Test only
- 当前版本：`0.1.0-test.1`
- Build：`10101`
- Shell：`1.0.0-test.1` / rule version `2026082301`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 源站入口：`https://51cg1.com/`
- Stable：尚未建立，禁止在未实机验证前晋级。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 产品与页面

首版采用海阔原生 UI，提供：

- 首页文章流与分页。
- 官网分类汇总和分类分页。
- WordPress 风格站内搜索与分页兜底。
- 文章详情：标题、日期、分类、标签、正文段落、正文图片、相关推荐。
- 视频播放入口：仅在静态页面发现媒体/iframe 证据时出现。
- 评论页：先解析静态 HTML 评论；AJAX/JS 评论待实机确认。
- 本地收藏、浏览历史、设置与诊断。

### Domain / Request

源站存在频繁切换域名的长期风险，Test1 建立独立 Domain Adapter：

```text
最后成功域名
→ 51cg1.com
→ cg51.com
→ chigua.com
→ 当前已知 51cgo* 备选
→ 首页内容特征验证
→ 从有效首页抽取官方同族域名
→ 缓存最后有效 Host
```

只自动信任 `51cg*.com / cg51.com / chigua.com` 同族域名，避免把页面广告外链误当新主站。

### Parser

当前站点按公开网页事实呈现 WordPress 风格路径：

- 文章：`/archives/<id>/`
- 分类：`/category/<slug>/`
- 分页：`/page/<n>/`
- 搜索：`/?s=<keyword>`，分页同时保留 `paged=` 兼容兜底。

Test1 使用结构特征 Parser，不绑定单一 CSS class；列表以文章永久链接为实体主键，详情优先 `og:title / og:image / article / entry-content` 等结构。

### 图片

- 列表和详情图片统一附 `User-Agent + Referer`。
- 不做无依据的图片解密。
- 正文优先过滤 logo/avatar/favicon/loading 等非内容图。
- 暂不把完整网页 HTML 写入规则私有 KV，避免私有存储被大页面快速填满。

### Playback

播放路线固定为：

```text
<source>/<video> 直链
→ JS/JSON 中 m3u8/mp4 字段
→ iframe 一层解析
→ 单线路直接媒体合同 / 多线路 PlayModel
→ 无结构化媒体时 video:// 作为最后网页媒体提取兜底
```

Test1 不引入第三方解析服务，不假装已证明“纯免嗅”。真实站点播放结构、Header、HLS/时效问题必须由海阔实机验证后再定型。

### 本地数据

- 收藏最多 100 项。
- 历史最多 60 项。
- 仅保存结构化卡片字段，不缓存全文 HTML。

### 已完成静态门禁

- `core.js`：`node --check` 通过。
- `runtime.js`：`node --check` 通过。
- `release.json`：JSON parse 通过。
- Runtime 动态导出 smoke：`home/categories/category/searchPage/search/detail/comments/favorites/history/settings` 10 个 Shell 入口均为 function。
- Runtime 使用 `R.module=function(){ return R; }`，不使用固定白名单快照。

### 待海阔实机确认

1. 首页封面是否全部正常显示、比例是否合适。
2. 分类列表是否覆盖官网当前全部主要分类。
3. 搜索结果 HTML 是否与首页同结构。
4. 文章详情正文段落与图片是否存在广告/二维码误入。
5. 吃瓜剧场/视频文章的真实播放器结构、直链与 Header。
6. `video://` 在当前海阔版本的兜底结果。
7. 评论是否静态存在；如为 AJAX/JS，定位独立评论接口。
8. UI 密度与长标题需要根据真实截图继续优化。

## 恢复规则

Test1 是首个不可变基线。任何解析/播放/UI 修复都创建更高 Test build/release，禁止原地覆盖本 Release。Stable 只能从用户实机验证通过的 Test 晋级。
