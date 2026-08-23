# 51吃瓜 CHANGELOG

## 当前基线

- App ID：`51chigua`
- 当前通道：Test only
- 当前版本：`0.1.0-test.3`
- Build：`10103`
- Shell：`1.0.0-test.3` / rule version `2026082303`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 源站入口：`https://51cg1.com/`
- Stable：尚未建立，禁止在未实机验证前晋级。

## 0.1.0-test.3 / Build 10103 — 2026-08-23

### 本轮实机结论

Test2 已由用户实机确认：

- 首页加密封面已经恢复。
- 文章详情可以正常进入，正文文本可见。
- DPlayer/HLS 视频可以在海阔原生播放器连续播放。
- 分类中心可以显示当前官网动态分类。
- 仍存在四类产品问题：评论为空、播放器把收藏/评论/正文带成无关列表、首页/详情操作按钮过于文字化、分类页扁平且首页分类入口路由体验错误。

### 评论协议

当前详情 HTML 底部明确存在：

```html
<script ... VirtualList/virtuallist.js ... data-api="/comments/<postId>.json"></script>
```

因此 Test1/Test2 的静态 `<li id="comment-*">` Parser 路线判定为失败方案。Test3 改为：

```text
/archives/<postId>/
→ 提取 postId
→ GET /comments/<postId>.json
→ 递归兼容 data/items/list/comments/replies/children 等容器
→ 统一 Comment Model
→ 海阔 avatar 评论流
→ JSON 无法识别时才退回旧 HTML Parser
```

当前单次最多渲染 120 条，避免数千评论直接压垮页面。评论 JSON 不写入私有 KV。

### 播放上下文

Test2 视频已经实机可播，所以 Test3 不重写成功的 HLS 交付链，只修播放器上下文：

- 详情页 Primary Play 改为独立 `text_center_1`。
- 播放项后立即加入 `line` 分隔。
- 收藏、评论、分类、原站统一改成 `icon_4`，不再作为 `text_1` 紧贴播放项。
- “正文/图片/标签/相关推荐”标题改成 `rich_text` 信息标题，避免海阔播放器把它们误收为播放列表操作。
- 详情已经取得 `x.media` 后直接构造 Player Contract，点击播放不再重新加载 Bootstrap + 重新请求同一详情。
- 多个 DPlayer 视频使用 `data-video_title / data-video_id` 作为播放器真实条目名；无名称才使用“视频 N”。

### 首页与分类 UX

- 首页搜索 / 分类 / 收藏 / 历史改为程序自有 SVG 图标四宫格。
- 首页快捷分类继续保留横向 chip，但全部直接进入分类 Feed。
- 新建互不重名的内部页面：`cg51Hub`（分类中心）和 `cg51Feed`（分类内容），淘汰 `cg51Categories/cg51Category` 这种容易混淆的相似页名。
- 分类中心按官网导航重新分组：吃瓜热门 / 娱乐天地 / 黑料事件 / 吃瓜百科 / 51原创；官网动态发现且未映射的分类落到“更多分类”。
- 分类真实分页修正为 `/category/<slug>/<page>/`。
- 搜索真实入口修正为 `/search/<keyword>/`，分页为 `/search/<keyword>/<page>/`。

### UI 资产

新增程序自有操作图标：

- `search.svg`
- `categories.svg`
- `favorite.svg`
- `history.svg`
- `comment.svg`
- `web.svg`

程序主图标仍使用源站 `favicon.ico`，不恢复 Test1 的临时品牌 SVG。

### Test3 静态门禁

- `core_patch.js`：`node --check` 通过。
- `runtime_patch.js`：`node --check` 通过。
- Test1 / Test2 Release 保持不可变；Test3 仅追加 Patch + 新 Bootstrap + 新 Shell。
- Runtime 继续动态 `R.module=function(){return R;}`。

### 待实机确认

1. `/comments/<postId>.json` 当前字段是否已被通用 Comment Adapter 正确识别；如仍为空，记录接口原始结构后做定向字段适配。
2. 播放器页面是否只保留真实视频条目，不再出现“加入本地收藏 / 查看评论 / 正文”。
3. 首页四个操作图标在当前海阔 `icon_4` 下的尺寸与间距。
4. 详情四个图标的视觉密度与收藏状态刷新。
5. 首页快捷分类是否直接进入内容列表。
6. 分类中心分组与动态“更多分类”是否完整、是否需要继续调整顺序。
7. 分类第二页和搜索分页是否按当前站点真实路径正常工作。

## 0.1.0-test.2 / Build 10102 — 2026-08-23

### 实机问题

Test1 实机截图确认：首页文章标题可解析但封面缺失；程序使用临时 SVG；点击内部页面因中文规则名被 `encodeURIComponent` 导致“找不到小程序”。

### 根因与修复

- 内部 `rule=51吃瓜` 保留原始中文，只有业务参数继续 URL 编码。
- 列表/正文支持 `loadBannerDirect / loadImage / data-xkrkllgl / data-src / data-original`。
- `/xiao/` 与 `/upload/upload/` 使用 AES/CBC/PKCS7，key=`f5d965df75336270`，iv=`97b60394abc2fbe1`；海阔通过 `hiker://assets/crypto-java.js` 执行 `InputStream → AES decrypt → toInputStream()`。
- Shell/渠道图标改为源站 `https://51cg1.com/favicon.ico`。
- 首页过滤活动卡，增加 DPlayer `data-config` 媒体提取，请求加入 `user-choose=true`。

### 已知失败结论

- 禁止把中文规则名整体编码后放入 `rule=`。
- 禁止把 51CG `/xiao/`、`/upload/upload/` 当普通明文图片直出。
- 禁止继续以静态 `<li id="comment-*">` 作为评论主链。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

首版建立首页/分类/搜索/图文详情、动态域名、本地收藏/历史、直链/iframe/video:// 播放和静态评论 Parser。Test1 已冻结，不再覆盖。

## 恢复规则

Test1、Test2、Test3 都是不可变 Release。后续问题继续新建更高 Test build，禁止原地覆盖。Stable 只能从用户明确实机验证通过的 Test 晋级。
