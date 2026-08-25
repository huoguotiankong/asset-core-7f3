# 51吃瓜 CHANGELOG

## 当前基线

- App ID：`51chigua`
- 当前正式版：`0.1.0` / Build `10106`
- Stable Shell：`0.1.0-stable.1` / rule version `2026082306`
- 当前测试版：`0.1.0-test.5` / Build `10105`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 源站入口：`https://51cg1.com/`
- 源站 favicon：`https://51cg1.com/favicon.ico`
- 源站页面 Logo：`https://51cg1.com/usr/themes/Mirages/images/logo-2.png`
- Stable 0.1.0 已按用户明确发布要求由实机验证 Test5 原样晋级；Test5 保留为不可变晋级来源与回退参考。

## 0.1.0 / Build 10106 — 2026-08-23

### Stable 晋级

用户明确要求发布正式版。Stable 0.1.0 由 `0.1.0-test.5 / Build10105` 原样晋级，不修改业务逻辑。

正式版保留当前已实机验证链：

- 首页文章流、加密封面解密和正文图片解密。
- 分类中心、首页快捷分类和分类分页。
- 独立站内搜索页与搜索分页。
- 图文详情、DPlayer/HLS 媒体提取和海阔原生播放。
- 播放 Primary Action 与收藏/评论/正文隔离，播放器只接收真实视频条目。
- `/comments/<postId>.json` 真实评论接口、纵向评论卡片与楼中楼回复层级。
- 一级评论与楼中楼回复统一使用 51CG 官方 favicon 头像，对齐原站默认评论身份。
- 本地收藏、浏览历史、动态可用域名与设置/诊断链。

### Stable 发布结构

```text
stable.json / latest.json
→ releases/0.1.0/release.json
→ Test1~Test5 不可变模块
→ releases/0.1.0/stable_patch.js
→ bootstrap_stable_v1_b10106.js
→ 51chigua_remote_stable_v1_b10106.txt
```

`stable_patch.js` 仅切换 `version/build/channel/bootstrap` 为 Stable 身份，不改变 Provider、Parser、评论、播放、图片解密或 UI 行为。

后续新 Test 必须从 Stable 0.1.0 向前开发，不得覆盖 Test5 或 Stable 0.1.0 的不可变 Release。

## 0.1.0-test.5 / Build 10105 — 2026-08-23

### 本轮实机结论

Test4 已确认新的纵向评论布局明显优于 Test3，但评论头像仍与原站不一致：海阔页面会显示接口中的 K / Y 等字母或随机用户头像，而源站评论区实际统一使用 51CG 官方黑底粉白图标作为默认头像。

### 修复

- 评论页不再读取 `comment.img/avatar` 作为显示头像。
- 一级评论与所有楼中楼回复统一使用源站官方 `https://51cg1.com/favicon.ico`。
- 评论页顶部品牌头像也统一为同一官方 favicon。
- 保留 Test4 的昵称 / 时间 / 回复层级 / 独立正文卡片结构。
- 不修改 `/comments/<postId>.json` 评论协议、不修改评论 Parser、不修改独立搜索页、不修改播放/分类/封面链。

### Test5 门禁

- `runtime_patch.js` 已通过 `node --check`。
- Test1–Test4 Release 保持不可变；Test5 只追加新的 Runtime Patch、Release、Bootstrap 和 Shell。
- Runtime 继续动态 `R.module=function(){return R;}`。

## 0.1.0-test.4 / Build 10104 — 2026-08-23

### 本轮实机结论

Test3 实机确认：

- `/comments/<postId>.json` 已成功读取真实评论，当前测试文章可加载 58 条。
- 评论页功能已经打通，但旧 `avatar` 单行布局把昵称、正文、回复、时间横向挤在一起，阅读层级不清晰。
- 首页四个图标显示正常，但“搜索”仍走 `input://` 系统弹窗，不符合独立页面交互目标。

### 评论页重构

Test4 不再把一条评论全部塞进单个 `avatar`：

```text
头像 + 昵称
      ↓
评论 / 回复 · 时间 · 点赞数
      ↓
独立可换行正文
      ↓
分隔线
```

- 每条评论拆成“用户头部 + 独立正文”两层，长评论自然换行。
- `depth > 0` 的楼中楼回复增加 `↳ 回复` 与正文缩进，避免与一级评论混在同一视觉层。
- 评论 JSON Parser 增强 nested `user / author / member / profile / account` 对象解析。
- 头像兼容 `avatar/avatar_url/avatarUrl/head/headimg/headImg/face/photo/image`。
- 昵称兼容 `nickname/nick/username/name/displayName` 等字段。
- 增加点赞数字段兼容；接口没有头像时使用程序自己的 `comment.svg` 兜底。
- 单次评论上限从 120 调整为 160，仍避免超大评论区一次性压垮页面。

### 独立搜索页

- 首页“搜索”图标不再打开系统 `input://` 对话框。
- 点击搜索直接进入 `cg51Search` 独立页面。
- 搜索页首屏固定显示搜索头部与页面内输入框。
- 未输入关键词时显示常用分类快捷入口。
- 搜索后继续留在独立页面，显示清空搜索、全部分类与结果列表。
- 搜索数据链继续复用 Test3 已修正的 `/search/<keyword>/<page>/`，不改 Provider。

### Test4 静态门禁

- `core_patch.js`：`node --check` 通过。
- `runtime_patch.js`：`node --check` 通过。
- Test1 / Test2 / Test3 Release 保持不可变；Test4 追加 Patch + 新 Bootstrap + 新 Shell。
- Runtime 继续动态 `R.module=function(){return R;}`。

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
- 新建互不重名的内部页面：`cg51Hub`（分类中心）和 `cg51Feed`（分类内容）。
- 分类中心按官网导航重新分组：吃瓜热门 / 娱乐天地 / 黑料事件 / 吃瓜百科 / 51原创；官网动态发现且未映射的分类落到“更多分类”。
- 分类真实分页修正为 `/category/<slug>/<page>/`。
- 搜索真实入口修正为 `/search/<keyword>/`，分页为 `/search/<keyword>/<page>/`。

### UI 资产

新增程序自有操作图标：`search.svg / categories.svg / favorite.svg / history.svg / comment.svg / web.svg`。
程序主图标使用源站 `favicon.ico`。

## 0.1.0-test.2 / Build 10102 — 2026-08-23

### 实机问题与修复

- 修复中文规则名被 URL 编码导致内部页面“找不到小程序”。
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

Test1、Test2、Test3、Test4、Test5 与 Stable 0.1.0 都是不可变 Release。Stable 0.1.0 来自 Test5 原样晋级。后续新问题必须从 Stable 0.1.0 派生更高 Test，禁止覆盖既有 Test 或 Stable。
