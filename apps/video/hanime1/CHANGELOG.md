# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.20` / Build `20020` / Shell `2026082229`。
- Stable 尚未晋级；Test20 继续以已验证 Test17 为运行数据基线，替换 Test19 仍未通过实机的头像增强，不叠加 Test18/Test19 的头像覆盖链。

## 已验证实机事实
- Recovery15：用户实机确认首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test16 首次 Shell 因生成时多转义一层反斜杠导致 `eval(Function)` 报 `不允许的字符：\\`；按 Test15 已验证 Shell 原文结构重建后恢复。
- Test16：视频详情成功区分作者与上传者；上传者头像可显示；作者名称点击关键词搜索能找到作品；作者头像仍为空。
- Test17：用户实机确认上传者真实公开作品已经能加载，证明 `/user/<id>` + 用户影片 Tab 路径正确；作者作品搜索继续可用。
- Test18：用户实机确认失败——作者头像仍显示灰色方块；评论页从原本可读真实评论退化成 `0 条评论`。因此 Test18 的 `P.comments/P.replies` 直接覆盖方案判定禁用，不得再作为后续基线。
- **Test19：用户 2026-08-22 实机截图确认评论正文与回复数量已经恢复，但头像增强仍失败。作者 `Collaboration Works` 仍显示灰色方块；评论列表显示字母/符号式占位头像，没有得到真实评论头像。** 因此 Test19 的“全局收集 `#comment-start img` 后按数组顺序回填 + 远程 PNG 兜底”不能视为有效头像方案。
- Test12 X5 WebView bridge 登录实机成功：网页内 `fy_bridge_app.getCookie('')` → `putVar()` → 规则侧 `importCookie()` → `profile()` 校验 → `Core.saveAccount()`。
- 首页真实内容、多分区与封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- Test17 及更早链的评论 `/loadComment` 可读取真实数据，楼中楼 `/loadReplies` 可用。
- 公开片库无需登录可浏览；逐页面封面布局设置可用。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## 登录架构（当前正确链）
```text
X5 官网 /login
→ 用户完成网页登录
→ WebView 内 fy_bridge_app.getCookie('') 读取真实 Cookie（含 HttpOnly）
→ fy_bridge_app.putVar() 回传规则侧
→ Provider.importCookie()
→ /user/<id>/edit / profile 校验真实身份
→ Core.saveAccount()
```

硬约束：
- 只看到 `XSRF-TOKEN + hanime1_session` 不等于登录成功。
- 登录完成必须以能识别 `/user/<id>` 并读取账号资料为成功标准。
- 不假设 X5 Cookie 与规则 `getCookie()` 自动共享。
- 不保存账号密码；只保存账号 Cookie。

## Test13 / Test14 事故与恢复结论
- Test13、Test14 在用户手机启动阶段均报 `SyntaxError: 不允许的字符：“\\”`，来源 `JSEngine#8(eval)#89(Function)`。
- 桌面 Node/Rhino 通过不能代表海阔运行时一定兼容。
- Recovery15 完全撤出 Test13/Test14 新运行模块，恢复到 Test12 已验证运行链，并换用 `bootstrap_test_v3.js` / `hanime1_remote_test_v3.txt`；用户实机确认首页恢复。
- 后续恢复功能必须按最小增量逐块加入，每块先实机验证再继续。
- Shell 必须基于最近一次实机验证成功的原文结构做版本替换，禁止多层 JSON 再序列化造成额外反斜杠。

## Test17：上传者真实公开作品
- 基线：Test16 已实机恢复的运行链。
- `userUploads17()` 直接读取 `/user/<id>` 公共主页；若首页没有影片，则发现该用户页真实“影片/Videos” Tab URL 后继续请求，再解析 `watch?v=` 卡片和分页。
- 实机结果：上传者作品链通过；作者头像 fallback 未通过。

## Test18：失败的头像解析尝试
- 尝试直接替换 `P.comments/P.replies`，按 Han1mePlus DOM 的 4 节点主评论 / 2 节点回复结构重建评论。
- 尝试详情 HTML 邻域 + 作者卡补作者头像，并用 SVG 兜底。
- 实机结果：作者仍灰色方块，评论退化为 0 条。
- 结论：海阔 `pdfa` 对该直接子节点方案与 Flutter DOM 解析行为不同；SVG 兜底在该 avatar 场景也不能作为可靠方案。此路径禁用。

## Test19：评论恢复成功，头像方案失败
- Recovery19 **直接加载 Test17 recovery_loader**，完全绕过 Test18，因此 Test18 的评论函数不会进入运行时。
- `P.comments()` / `P.replies()` 先调用 Test17 原函数取得已经验证的数据；只有原数据成功后，才额外请求同一接口并尝试按全局图片数组顺序补头像。
- 评论头像候选曾补充 `data-src / data-original / data-lazy-src / src / data-srcset / srcset`；作者搜索卡同样补这些字段；并加入 `assets/avatar_default.png`。
- 实机结果：**评论数据恢复，但作者/评论真实头像仍没有恢复。** 作者仍灰块；评论仍表现为字母/符号占位。
- 结论：问题已经从“评论数据解析”收敛为“头像节点上下文 + 图片请求链”。后续不得再次重写已验证评论数据，也不得继续用“页面全局图片数组按 index 对评论”的方法。

## Test20：上下文绑定头像恢复
- 运行链直接加载 Test17，不加载 Test19 `patch_avatar.js`，避免一次评论页额外重复执行两套头像补丁和多次网络请求。
- 参考当前 Han1mePlus `han1me_api.dart`：作者头像优先按 `#video-user-avatar + img`，再退到 `#video-user-avatar`。由于海阔 CSS 邻接选择器兼容性此前没有得到证明，Test20 同时增加**局部原始 HTML 邻域解析**：定位 `video-user-avatar` 标记后，只在附近真实 `<img>` 标签里读取 `data-src/data-original/data-lazy-src/src/srcset`。
- 作者搜索 fallback 只接受 `.search-artist-card` 中**作者名精确匹配**的图片，不再拿模糊搜索第一张图冒充作者。
- 评论仍先调用 Test17 `oldComments()` 获得已经验证的用户名、正文、时间、commentId、回复数量；头像只作为附加字段。
- 主评论优先利用现有 `reply-section-wrapper-<commentId>` 在原始 `/loadComment` HTML 中建立局部边界，并在该评论邻域寻找头像；失败时才按用户名顺序做局部邻域 fallback。这样不会因为页面里多出装饰图、回复图或其它 `<img>` 就让后续全部错位。
- 楼中楼继续调用 Test17 `oldReplies()`，再按每条回复用户名在 `/loadReplies` 的局部 HTML 邻域提取头像；失败只留空，不破坏回复正文。
- 真实头像 URL 统一追加 `Referer + User-Agent` 图片请求头，避免“URL 已解析出来但海阔图片加载请求缺 Header”造成灰块/占位。
- 不再强制把无真实头像的作者/评论改成远程 PNG；真实图提取失败时让原生 avatar 自行退化，避免伪装成“已修复”。
- 新增 `HanimeProvider.avatarDiagnostic20(videoId)` 作为后续排障接口，可返回作者头像候选与评论头像命中数量，不在正常 UI 暴露技术信息。
- 静态检查：Test20 patch/recovery 已通过 Node `--check`；Stable、Shell、Bootstrap 均未改动。

## Test20 待实机回归
- [ ] 首页正常，无 SyntaxError；About/诊断能确认运行 `2.0.0-test.20 / 20020`。
- [ ] 截图中的目标视频 `407597`：作者 `Collaboration Works` 不再是灰色方块，优先显示详情页真实作者图。
- [ ] 上传者 `小清水亜美` 头像继续正常，不退化。
- [ ] 评论正文、回复数仍与 Test19 一样正常，不能再次出现 `0 条评论`。
- [ ] 评论中有真实头像的用户显示官网头像；没有真实头像的用户允许原生占位，不使用错误图片冒充。
- [ ] 楼中楼正文正常且真实头像能显示。
- [ ] 登录、最高画质播放、真选集、片库、漫画无回归。

## 后续恢复顺序
1. Test20：只闭环作者/评论/回复真实头像（当前）。
2. 头像链实机通过后，再做作者目录 + 独立作者主页。
3. 再通过后：评论点赞/点踩、举报等官网元信息与交互。
4. 再通过后：账号中心与订阅作者功能。
5. 主要功能稳定后做 Consolidated Candidate，将历史增量链压缩为少量 Core / Provider / Account / Pages / UI / Runtime 模块。

---
## 版本记录
### 2.0.0-test.20 / Build 20020 / 2026-08-22
- 保留 Test17 已验证评论/回复数据链，移除 Test19 全局图片数组回填方案。
- 作者头像对齐 Han1mePlus 当前详情页真实 DOM 关系，并增加局部原始 HTML fallback。
- 评论/回复头像改为 commentId/用户名局部上下文绑定，不再依赖全局 `<img>` 顺序。
- 真实头像 URL 增加 Referer/UA 图片 Header；失败不破坏评论内容。

### 2.0.0-test.19 / Build 20019 / 2026-08-22
- Recovery：完全跳过 Test18，恢复 Test17 评论/回复数据链。
- 作者、评论、回复头像改为非破坏式附加增强。
- 实机：评论正文恢复；头像增强仍失败，已被 Test20 替换。

### 2.0.0-test.18 / Build 20018 / 2026-08-22
- 实机失败：作者仍灰色方块，评论退化为 0 条；禁止继续作为基线。

### 2.0.0-test.17 / Build 20017 / 2026-08-22
- 上传者点击改为真实 `/user/<id>` 公共上传作品，而非用户名关键词搜索；用户实机确认作品可加载。

### 2.0.0-test.16 / Build 20016 / 2026-08-22
- Recovery15 后第一块最小增量恢复：详情分离作者与上传者。
- 首次 Shell 过度转义导致启动失败；重建 Shell 后实机恢复。

### 2.0.0-test.15 / Build 20015 / 2026-08-22
- Recovery：彻底撤出 Test13/Test14 新运行模块，恢复 Test12 已验证链；用户实机确认首页恢复。

### 2.0.0-test.12 / Build 20012
- X5 网页 bridge Cookie 登录实机成功。
- 取消片库二次筛选弹层；新增逐页面封面布局设置。

### 2.0.0-test.11 / Build 20011
- 选集点击直接播放、纯文本筛选状态、时长格式化、评论去重。

### 2.0.0-test.8 / Build 20008
- 官网 canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页随后通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。