# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.21` / Build `20021` / Shell `2026082229`。
- Stable 尚未晋级；Test21 仍直接以已验证 Test17 为业务数据基线，只替换作者/评论/回复头像附加层。
- 当前 Shell/Bootstrap 不变；已安装 Test20 的用户可通过程序内“更新测试版”切到 Test21。

## 已验证实机事实
- Recovery15：用户实机确认首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test16 首次 Shell 因生成时多转义一层反斜杠导致 `eval(Function)` 报 `不允许的字符：\\`；按 Test15 已验证 Shell 原文结构重建后恢复。
- Test16：视频详情成功区分作者与上传者；上传者头像可显示；作者名称点击关键词搜索能找到作品；作者头像仍为空。
- Test17：用户实机确认上传者真实公开作品已经能加载，证明 `/user/<id>` + 用户影片 Tab 路径正确；作者作品搜索继续可用。
- Test18：用户实机确认失败——作者头像仍显示灰色方块；评论页从真实评论退化成 `0 条评论`。因此 Test18 的 `P.comments/P.replies` 直接覆盖方案永久禁用。
- Test19：评论正文与回复数量恢复，但作者仍灰块、评论仍未得到真实头像；“全局收集 img 再按数组顺序回填”判定无效。
- **Test20：2026-08-22 15:18 用户实机再次确认“还是一样，没有区别”。详情页作者 `ピンクパイナップ...` 仍是灰色方块，而上传者 `zyt` 的圆形头像继续正常；评论页 279 条评论正常，但 `奇异果博士 / Saohua / 皇家马德里足球俱乐部 / 我的世界皓宸` 等仍显示海阔根据用户名生成的 Q/S/H/W 字母占位。** 这证明评论数据链正常、海阔图片组件本身也能显示站点头像（上传者已证明），当前问题主要仍是**没有从评论/作者真实 DOM 中取到头像 URL**，不是评论接口整体失败。
- Test12 X5 WebView bridge 登录实机成功：网页内 `fy_bridge_app.getCookie('')` → `putVar()` → 规则侧导入 Cookie → `profile()` 校验身份 → `Core.saveAccount()`。
- 首页真实内容、多分区与封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- Test17 及更早链的评论 `/loadComment` 可读取真实数据，楼中楼 `/loadReplies` 可用。
- 公开片库无需登录可浏览；逐页面封面布局设置可用。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## 上游 Han1mePlus 当前源码确认的头像事实
2026-08-22 重新读取 `1wc10086/Han1mePlus@main`：

### 作者头像
`han1me_api.dart` 当前顺序为：

```text
#video-user-avatar + img
→ #video-user-avatar
→ detail 内 a[href*="/user/"] img
→ 读取该元素 src
```

Han1mePlus UI 若 `artistAvatarUrl == null`，才使用作者首字符作为 `CircleAvatar` fallback；因此海阔一直显示灰方块不是理想等价表现。

### 主评论头像
Han1mePlus 不是把 `.comment-index-text` 当完整评论卡，而是：

```text
#comment-start
→ 读取 root.children
→ 每 4 个直接子元素组成一条主评论
→ 把这 4 个元素临时组合成 wrapper
→ wrapper.querySelector('img').src = 该评论头像
→ wrapper 内 reply-section-wrapper-* 提取 commentId
```

### 楼中楼头像
`/loadReplies` 当前结构为：

```text
div[id^="reply-start"]
→ 读取 root.children
→ 每 2 个直接子元素组成一条回复
→ 第 1 个元素 body 内 querySelector('img').src = 回复头像
```

这解释了 Test18/19/20 为什么反复失败：此前都没有真正复刻 Flutter DOM 的“直接子节点分组”语义，而是在海阔 `pdfa/pdfh` 的局部节点或原始 HTML 邻域上猜。

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
- `userUploads17()` 直接读取 `/user/<id>` 公共主页；若首页没有影片，则发现该用户页真实“影片/Videos” Tab URL 后继续请求，再解析 `watch?v=` 卡片和分页。
- 实机结果：上传者作品链通过；作者头像仍未通过。

## Test18：禁用方案
- 直接替换 `P.comments/P.replies` 并依赖海阔 `pdfa` 模拟 4/2 节点结构。
- 实机结果：作者仍灰块，评论变 0 条。
- 禁止再以 Test18 为基线，也禁止头像修复覆盖已验证评论正文数据。

## Test19：评论恢复成功，头像方案失败
- 直接加载 Test17，恢复评论正文。
- 头像尝试全局收集 `#comment-start img` 后按 index 回填，并加入远程 PNG 兜底。
- 实机：评论恢复，头像仍失败。
- 结论：禁止全局图片数组按序硬配。

## Test20：局部邻域方案失败
- 直接加载 Test17；评论头像尝试 commentId/用户名附近搜索 `<img>`，作者尝试 `video-user-avatar` 附近原始 HTML + 精确作者搜索。
- 实机：作者、评论头像外观与上一版无区别。
- 结论：**局部“附近找图”仍不等价于 Han1mePlus DOM 的 `root.children` 分组**。下一版必须复刻分组契约，不继续调同一类邻域窗口大小/选择器。

## Test21：精确 DOM 分组头像层
- Recovery21 **直接加载 Test17**，完全不加载 Test18/Test19/Test20 头像补丁，避免失败逻辑叠加。
- 新增轻量 HTML 元素边界解析器，仅用于头像附加层：
  - 识别指定元素的 opening/closing boundary。
  - 提取元素 inner HTML。
  - 按真正的顶层直接子元素拆分，不用 `pdfa` 猜 parent/sibling。
- `/loadComment`：严格按 Han1mePlus 当前实现，每 **4 个直接子元素**组成一条评论；组内第一张真实 `<img>` 作为头像；优先用 `reply-section-wrapper-<commentId>` 与 Test17 的 commentId 精确回绑，只有缺 id 时才按组序兜底。
- `/loadReplies`：严格按 Han1mePlus 当前实现，每 **2 个直接子元素**组成一条回复；只从每组第一个 body 元素取真实 `<img>`。
- 作者：不再只做 `video-user-avatar` 周围固定字符窗口搜索；先解析 `#video-user-avatar` 自身真实元素边界，再从其后结构寻找对应 img；失败后才进入作者名精确搜索卡 fallback。
- 若解析结果与上传者头像相同且作者/上传者名称不同，则拒绝把上传者头像冒充作者。
- 不再为头像额外拼站点 Header；Test20 已证明核心问题是 URL 未命中，且上传者站点图片当前可直接显示。先拿到真实 URL，再处理确有证据的 Header 问题。
- 头像失败只置空头像字段；评论正文、commentId、回复数、楼中楼始终返回 Test17 已验证数据。
- 新增 `HanimeProvider.avatarDiagnostic21(videoId)`，记录 `commentGroups / commentGroupAvatars / commentMatchedAvatars / replyGroups / artistMethod`，正常 UI 不展示。
- 本地合成 fixture 已验证：2 条主评论能按 id 分别取 `/a.jpg`、`/b.jpg`；2 条回复分别取 `/r1.jpg`、`/r2.jpg`；作者 `#video-user-avatar` 后相邻 img 可取 `/artist.jpg`。
- `patch_avatar.js` 已通过 Node `--check`；Stable、Shell、Bootstrap 均未改动。

## Test21 待实机回归
- [ ] 首页正常，无 SyntaxError。
- [ ] 当前截图目标 `玩美×玩媚 2`（官网当前 id `407595`）：作者 `ピンクパイナップル` 若官网提供真实头像，应显示真实头像；不能误用上传者 `zyt` 头像。
- [ ] 上传者 `zyt` 头像继续正常。
- [ ] 评论仍保持约 279 条正常数据，不能再次变 0 条。
- [ ] `奇异果博士 / Saohua / 皇家马德里足球俱乐部 / 我的世界皓宸` 等若 `/loadComment` 组内存在 `<img src>`，应显示该真实图片而不再是海阔 Q/S/H/W 字母占位。
- [ ] 打开“查看 16 条回复”等楼中楼，回复正文正常，组内有头像的回复应显示真实图。
- [ ] 登录、最高画质播放、真选集、片库、漫画无回归。

## 后续顺序
1. Test21：闭环作者/评论/回复真实头像。
2. 头像链实机通过后，再做作者目录 + 独立作者主页。
3. 再通过后：评论点赞/点踩、举报等官网元信息与交互。
4. 再通过后：账号中心与订阅作者功能。
5. 主要功能稳定后做 Consolidated Candidate，将历史增量链压缩为少量 Core / Provider / Account / Pages / UI / Runtime 模块。

---
## 版本记录
### 2.0.0-test.21 / Build 20021 / 2026-08-22
- 针对 Test20 实机“仍无变化”，停止邻域启发式，直接移植 Han1mePlus 当前 4 子节点主评论 / 2 子节点回复 DOM 分组契约。
- 主评论头像按 commentId 精确回绑；失败不影响 Test17 评论正文。
- 作者头像改为元素边界级 `#video-user-avatar` 相邻图片解析。

### 2.0.0-test.20 / Build 20020 / 2026-08-22
- commentId/用户名局部邻域头像尝试。
- 实机：作者仍灰块，评论仍字母占位；判定头像方案失败。

### 2.0.0-test.19 / Build 20019 / 2026-08-22
- Recovery：完全跳过 Test18，恢复 Test17 评论/回复数据链。
- 实机：评论正文恢复；头像增强失败。

### 2.0.0-test.18 / Build 20018 / 2026-08-22
- 实机失败：作者仍灰色方块，评论退化为 0 条；禁止继续作为基线。

### 2.0.0-test.17 / Build 20017 / 2026-08-22
- 上传者点击改为真实 `/user/<id>` 公共上传作品；用户实机确认作品可加载。

### 2.0.0-test.16 / Build 20016 / 2026-08-22
- Recovery15 后第一块最小增量恢复：详情分离作者与上传者。

### 2.0.0-test.15 / Build 20015 / 2026-08-22
- Recovery：撤出 Test13/Test14 新运行模块，恢复 Test12 已验证链；用户实机确认首页恢复。

### 2.0.0-test.12 / Build 20012
- X5 网页 bridge Cookie 登录实机成功；逐页面封面布局设置可用。

### 2.0.0-test.11 / Build 20011
- 选集点击直接播放、时长格式化、评论去重。

### 2.0.0-test.8 / Build 20008
- 官网 canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页随后通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
