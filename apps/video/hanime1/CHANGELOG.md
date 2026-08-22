# Hanime1 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。已验证事实与待实机验证内容必须分开记录。

## 当前基线
- Legacy：`1.2.1` 仅保留历史/回退记录，不再作为开发运行基线。
- Test：`2.0.0-test.5` / Build `20005`，Shell rule version `2026082214`。
- Test4 由 2026-08-22 第三轮实机截图驱动，集中处理图片、播放、评论、登录/片库四条主链；仍未晋级 Stable。

## 已验证实机事实
- Test1：Shell/四区 UI 可打开；主站当前无 Challenge 时可直接进入真实首页。
- Test2：首页 Banner + 首卡可见，说明网络链正常，但 Hiker DOM 列表遍历不完整。
- Test3：首页第一分区已恢复 `最新上市 · 12`，卡片标题/时长/观看数据正常，详情文字和详情封面可见。
- Test3 仍存在：① 首页卡片/首页 Banner 图片为空；② 详情页播放提示“未解析到可播放地址”；③ 评论页标题显示 `%5B...` 编码且列表为空；④ 片库停留在登录门槛，浏览器会话不能直接识别。

## Test4 设计与实现
### 图片链
- 首页卡片解析优先匹配 `img.main-thumb`，再回退普通图片，避免取到占位图/图标。
- 所有 Hanime 图片链接统一追加海阔官方 `@headers={...}`，携带与页面一致的 `User-Agent` 和 `Referer`。
- 搜索、预告、相关推荐、账号头像、片库和漫画封面同步走图片头适配。

### 播放链
- 不再依赖 Hiker 对 `video#player > source` 的嵌套 DOM 解析；从详情原始 HTML 直接提取全部 `<source>`，并回退 `<video src>` / 页面脚本中的 mp4/m3u8。
- PlayModel 继续使用 `{urls,names,headers}`，每条线路的 `Referer` 改为 `${base}/watch?v=<id>`，与 Han1mePlus 当前播放器一致。
- 详情页显示“播放 · N画质”和可用画质列表，便于实机判断 source 是否恢复。

### 评论链
- `/loadComment?type=video&id=<id>` 与 `/loadReplies?id=<commentId>` 保持官方接口。
- 按 Han1mePlus 当前结构：`#comment-start` 每条评论 4 个子节点一组；Test4 改为原始 HTML 中 `comment-index-text` 两字段配对，并按 `reply-section-wrapper-<id>` 对齐评论 ID。
- 评论/回复页面 query 参数最多解码两次，修复页面标题 `%5B...`。

### 账号与片库
- `profile()` 改为原始 HTML 识别 `#user-modal-trigger -> /user/<id>`，再读取 `/user/<id>/edit` 中昵称/邮箱/CSRF。
- 浏览器会话不再必须先保存为受管账号：只要官网 Cookie 已登录，片库可直接识别；用户可再点击“同步当前登录”保存为多账号条目。
- 片库继续读取 `/saves`、`/likes`、`/playlists`、`/histories`、`/subscriptions`，视频卡同样使用 raw HTML + 图片头适配。
- 登录页启动时显式切到 browser session，并增加“检测当前登录”和“同步当前登录”。

### UI / 分类
- 搜索分类补全官网当前 `裏番 / 泡面番 / Motion Anime / 3DCG / 2.5D / 2D动画 / AI生成 / MMD / Cosplay`。
- 设置页版本显示修正为 Test4 / Build 20004。

## Test5 发布前审计修正
- Test4 原子提交后、交付实机前的模拟调用审计发现：评论模块使用 `textClass(...)` 但未从 Common 显式绑定；语法检查可通过，实际打开有评论的视频时会触发 `ReferenceError`。
- Test5 只新增新版 Common build marker 与修正后的 Comments 模块，Test4 的 Media / Account / UI 模块继续按已校验 SHA 复用。
- 本地模拟调用已实际覆盖：原始 `<source>` → 多画质 PlayModel、账号 `/user/<id>/edit` 识别、评论+回复解析；模拟结果均返回预期数据。
- 因此 Test4 不作为下一轮用户验证版本；下一轮直接测试 Test5。

## Challenge / Cookie 约束
- 只有真实 Cloudflare Challenge 才进入自动 `fetchCodeByWebView`，自动处理失败时保留可见 X5 验证页。
- 账号 Cookie 与 `cf_clearance` 分层；切换受管账号不覆盖浏览器 clearance。
- 不恢复“盲试镜像域名绕挑战”的旧方案。

## 回归清单
- [x] Shell 可打开
- [x] 当前主站无 Challenge 时可直接进入真实首页
- [x] Test3 第一分区恢复 12 张卡片数据
- [x] Test3 详情文字/封面可见
- [ ] Test4 首页 Banner/卡片封面恢复
- [ ] Test4 视频多画质播放
- [ ] Test4 评论/回复列表与标题正常
- [ ] Test4 网页登录、浏览器会话识别与账号同步
- [ ] Test4 稍后看 / 收藏 / 片单 / 订阅 / 历史
- [ ] 搜索筛选/翻页
- [ ] 漫画首页/详情/阅读
- [ ] 主站实际触发 Challenge 时自动 WebView + X5 恢复

---
## 版本记录
### 2.0.0-test.5 / Build 20005 / 2026-08-22
- Test4 发布前审计修正版；修复 Comments 模块 `textClass` 运行时 helper 未绑定。
- 复用 Test4 已校验媒体/账号/UI 模块；模拟回归通过播放 source、账号识别、评论与回复。

### 2.0.0-test.4 / Build 20004 / 2026-08-22
- 第三轮实机综合修复；发布模块拆分为 Common / Media / Account / Comments / UI，避免单个大热修对象并便于后续独立回归。
- 修复图片请求头与 main-thumb 选图。
- 重写原始 HTML 播放 source 提取并修正 watch Referer。
- 评论按 4 子节点结构重写，修复 URL 编码标题。
- 浏览器会话可直接识别账号/片库，登录页增加检测与同步。
- 补全官网视频分类并优化详情/设置诊断。

### 2.0.0-test.3 / Build 20003
- 原始 HTML 首页分区/卡片解析；第一分区实机恢复 12 条；详情封面恢复。

### 2.0.0-test.2 / Build 20002
- 首页相邻节点与 Challenge 判定热修，实机仍只有 Banner + 首卡。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
