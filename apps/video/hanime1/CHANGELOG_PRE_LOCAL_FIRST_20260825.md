# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.1` / Build `20040`，由用户明确批准将当前 Test40 作为阶段性正式基线晋级；仍保留已知账号/更多回复/UI 等待优化项，不等价于“全部问题已解决”。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v6_b20040.txt` / 规则 version `2026082247`；Bootstrap：`bootstrap_stable_v6_b20040.js` / `minBuild=20040` / `defaultRelease=20040`。
- Stable release：`apps/video/hanime1/releases/2.0.1/release.json`，运行体直接复用 immutable `2.0.0-test.40` 恢复链，再叠加 Stable settings overlay。
- 上一正式版：`2.0.0` / Build `20029` 继续完整保留，可由 Stable Remote Manager previous/rollback 回退。
- Test：`2.0.0-test.40` / Build `20040`，作为本次晋级来源与历史测试基线；下一轮 Test 必须从 Stable `2.0.1` 向前开发，不得重新从旧 Stable 2.0.0 分叉。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20040.txt` / 规则 version `2026082246`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20040.js` / `minBuild=20040` / `defaultRelease=20040`。
- Test recovery base：`2.0.0-test.39`；深层恢复链仍经过 Test38 → Test37 → Test32。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1` 仅保留历史文件 `hanime1.txt`。
- Test27 / Test28 / Test34 为 broken/quarantined，不允许作为恢复基线。

## 2026-08-22 22:20：Test40 → Stable 2.0.1

### 用户决策
用户明确表示当前仍有很多地方需要继续优化，但本轮先暂停继续追问题，并要求把**当前测试版状态更新为正式版**。因此本次属于“阶段性最佳可用基线晋级”，不是宣称 Test40 所有验收项都已通过。

### 晋级范围
- 新建 immutable Stable release：`2.0.1 / Build20040`，`promotedFrom = 2.0.0-test.40 / Build20040`。
- Stable recovery loader 直接加载 Test40 recovery chain，确保业务行为与当前 Test40 一致，不重新手工复制业务模块。
- 新建 `settings_stable.js` 覆盖 Test40 的测试版设置页/更新入口，运行时 build 最终固定显示 `2.0.1`。
- 新建 Stable Bootstrap `bootstrap_stable_v6_b20040.js`，`id=hanime1`、`latestPath=apps/video/hanime1/latest.json`、`minBuild=20040`、`defaultRelease=Stable 2.0.1`。
- 新建 Stable Shell `hanime1_remote_stable_v6_b20040.txt`，规则 version=`2026082247`，明确加载 `@main` 上的新 Bootstrap。
- Stable Remote Manager 与 Test Remote Manager 继续使用不同 app id，因此测试通道后续失败不会直接覆盖正式通道状态。
- 旧 Stable 2.0.0 / Build20029、旧 Shell/Bootstrap/release 全部保留，不原地覆盖。

### 当前正式版已包含
- Test39 已实机确认恢复的首页搜索链：输入“女友”可进入独立搜索页并返回真实结果，JSEngine#13 已解决。
- Test40 对 Test39 性能回归的隔离：切断 profile/browser-session 重入环，普通页面不再隐式联网补账号资料，账号栏目加短缓存，片单列表默认单请求而不是首屏 N+1 串行补详情。
- Test39 的回复 DOM 精确分组/null 归一、片单详情 playlist-item 分段、片库 `>` 哨兵清理等实现继续随恢复链保留。
- Test31 已验证的推荐页与播放器列表隔离、Test29/24/17 已验证的播放/头像/作者公开作品等历史能力仍在深层恢复链中。

### 已知未完成项
- 用户明确指出“还有很多需要优化的地方”；账号片单/收藏/头像、更多回复、作者/上传者页面、分类筛选与整体 UI 仍属于下一轮重点，不因晋级 Stable 被视为关闭。
- Stable 2.0.1 的定位是当前阶段比旧 Stable 2.0.0 更接近目标体验的**可继续日用基线**。
- 下一轮开发必须先从 `2.0.1 / Build20040` 建立新 Test，不允许再把 Build20029 当默认开发基线。

### 发布门禁
- Stable `release.json / recovery_loader.js / settings_stable.js / Bootstrap` 均使用新路径，不覆盖旧 Stable 文件。
- 新增 JS 在发布前按等价本地内容执行 `node --check`，通过后再写入 GitHub；写入后又从 `main` 回读 Release/Bootstrap/Shell 核对 Build、路径与规则 version。
- 新 Stable Shell 的 `2026082247` 在海阔 32 位有符号整数安全范围内。
- Stable advertised build、release build、installer build、Bootstrap `minBuild/defaultRelease.build` 均为 `20040`。

## 2026-08-22 21:49–21:52：Test39 实机结果 → Test40

### Test39 实机已确认
1. **搜索正式恢复**：输入“女友”后能进入独立搜索页，并返回 59 部真实搜索结果；说明 Test39 的 input IIFE / 固定 `hanimeSearch` 跳转方向正确，JSEngine#13 已解决。
2. **出现新的严重性能回归**：从搜索结果点击视频详情（例如“少女弹珠汽水 6”）会长时间停留在空白加载；在首页切换到“我的”“设置”等栏目也会长时间卡住。
3. 当前截图说明不是搜索接口慢，而是**进入目标页面后运行时被额外同步工作阻塞**。

### 根因：Profile/Auth Resolver 形成重入闭环
Test32 为 browser-session 登录设计了：

```text
C.activeAccount()
→ browserProfile()
→ P.profile()
```

而 Test39 `account39.js` 又在新的 `P.profile()` 内调用：

```text
P.profile()
→ P.sessionProfile32()
→ C.activeAccount()
→ browserProfile()
→ P.profile()
```

于是 browser-session、未保存为 managed account 的情况下形成真实重入环：

```text
P.profile
→ sessionProfile32
→ C.activeAccount
→ browserProfile
→ P.profile
→ ...
```

内部 try/catch 虽可能最终吞掉栈溢出/异常，但已经造成大量重复调用与等待。与此同时，Test39 为恢复“我的全部片单”又允许在 `/user/<id>/playlists` 缺标题时**逐个打开最多 16 个片单详情补 metadata**；因此“我的”首屏还可能叠加多次串行网络请求。

这两点共同解释了：
- 普通视频详情也可能被账号状态查询拖住；
- 设置页调用 `C.activeAccount()` 也会触发同一循环；
- 我的页既有 profile 重入，又有片单串行补全，最容易卡死。

### Test40 处理边界
Test40 不重写 Test39 已恢复的搜索/回复/片库逻辑，只做运行时性能隔离：
- 普通页面的 `P.profile()` 改为**只读本地/stale profile cache**，不允许隐式联网。
- `C.activeAccount()` 增加 re-entry guard，切断 `activeAccount ↔ browserProfile ↔ profile` 环。
- 真实昵称/头像权威同步只允许在“我的 / 账号中心 / 手动同步账号资料”发生；不再把账号补全放进每个页面可能调用的 Provider getter。
- 账号分区结果（片单/收藏/稍后看/订阅/历史）缓存 90 秒；同一时间窗口切换不重复请求。
- “我的片单”默认只请求一次 `/user/<id>/playlists`，同时用 DOM + raw block 从**同一个响应**提取真实 title/cover/count。
- 如果只得到真实 listId 但没有真实标题，不再自动串行打开所有详情；只显示“还有 N 个片单名称未解析”，用户主动点“补全片单资料”才执行 Test39 的慢路径。
- 继续禁止 `片单<ID>` 伪卡。
- 当时 Stable `2.0.0 / Build20029` 保持不动；随后已按用户 22:20 指令晋级为 Stable 2.0.1。

### Test40 验收顺序
- [ ] 设置页显示 `2.0.0-test.40 · Build 20040 · Shell v4`。
- [ ] 搜索“女友”仍正常，不能回归 JSEngine#13。
- [ ] 从搜索结果点击“少女弹珠汽水 6”等视频，详情应明显更快进入，不再长时间空白加载。
- [ ] 推荐/片库/漫画/我的/设置来回切换，普通栏目切换不应再被账号 profile 联网阻塞。
- [ ] “我的”首次进入允许一次账号主页/片单主列表请求，但不能再出现逐个片单串行请求造成的长卡顿。
- [ ] 账号头像/昵称若尚未同步，点“同步账号资料”后再确认；该慢操作必须是显式行为，不能污染其它页面。
- [ ] 泡面番 6 部、更多回复、片库 `>` 清理继续回归，确保 Test40 没破坏 Test39 功能修复。

## 2026-08-22 21:26–21:27：Test38 实机结果 → Test39

### Test38 实机已确认
1. **更多回复数量恢复，但字段解析错误**：一条原评论显示 33 条回复，Test38 能打开并显示“共33条回复”，说明 `commentId → /loadReplies` 身份链已经恢复；但 33 条用户名和正文全部显示字面量 `null`，头像仍占位。
2. **账号导航 UI 改善**：`片单 / 收藏 / 稍后看 / 订阅 / 历史 / 账号中心` 六项已经两行三列全部首屏可见。
3. **账号资料仍不完整**：顶部只显示邮箱 + `ID 26572`，真实昵称没有恢复，账号头像仍是占位图。
4. **片单详情从 0 部改善为 1 部，但仍错误**：片单“泡面番”官方标记 6 部，Test38 只解析出 1 部。
5. **搜索仍失败**：输入“女友”继续报 `未知链接：error:返回的值无效 (JSEngine#13)`。
6. **片库完整入口存在，但旧 `>` 哨兵仍混在筛选行**：`全部筛选 / 作者目录 / 清空筛选` 已恢复，但类型/排序/日期/时长/标签各行尾部仍出现 `>`。

这些实机结果优先于 Test38 的源码意图，Test38 不晋级 Stable。

## Test39 根因与实现

### 1. 更多回复：按当前 Han1mePlus 上游 DOM 精确分组
再次核对 `1wc10086/Han1mePlus@main/lib/src/data/remote/han1me_api.dart`，当前回复解析不是“全局 `.comment-index-text` 两两配对”，而是：

```text
/loadReplies?id=<commentId>
→ JSON.replies
→ div[id^="reply-start"]
→ root.children 每 2 个节点一组：body + post
→ body.querySelectorAll('.comment-index-text')
→ fields[0] = 用户/时间
→ fields[1] = 正文
→ body img = 头像
```

Test38 的全局 pairing 虽然碰巧算出了 33 组，却把错误节点送进 `pdfh`，海阔返回的空/异常值又被 `String()` 后渲染成了字面量 `null`。

Test39 `community39.js`：
- 保持已恢复的直接 `commentId → /loadReplies`，不再重绑 thread。
- 严格按 `reply-start` 直属子节点 body/post 两块一组。
- 用户名/正文只从 body 内部两个 `.comment-index-text` 读取。
- `clean()` 统一把空串、`null`、`undefined` 以及字符串形式 `"null" / "undefined"` 归一为空，不允许解析失败污染 UI。
- 回复头像同一次响应读取，不增加第二次网络请求。
- 仅非空结果短缓存 20 秒；发布回复后主动清缓存。
- 不覆盖已恢复的 `P.comments()` 主评论链。

### 2. 搜索：JSEngine#13 根因收敛到 input `url` 不是合法表达式
海阔 `col_type:'input'` 的 `url` 需要是一段**可求值并返回 URL 的 JS 表达式**。Test38 写成了顶层语句：

```text
putMyVar(...);
refreshPage(false);
return 'hiker://empty';
```

这里的顶层 `return` 不在函数体内，正是这条 input eval 链继续触发 `JSEngine#13` 的高概率原因。

Test39 `search39.js` 改成完整 IIFE 表达式：

```text
(function(){
  var q = String(input || '').trim();
  putMyVar(..., q);
  return 'hiker://page/hanimeSearch?rule=&simple=true';
})()
```

同时：
- `onChange` 只负责保存关键词。
- 点击右侧“搜索”进入固定 `hanimeSearch` 页面，不再动态拼 query URL。
- 搜索页从 MyVar 读取关键词，再调用真实 `P.search()`。
- Shell `searchFind` 继续直接渲染结果。

### 3. 账号资料：重新以官网当前字段为权威源
当前上游账号契约再次确认：

```text
首页 #user-modal-trigger → userId
/user/<id>/edit
→ input[name=name]
→ input[name=email]
→ img#playlist-avatar
首页 fallback：#user-modal-dp-wrapper img / .profile-avatar-wrapper img
```

Test39 `account39.js`：
- 不把旧 profile 的 name/avatar 当成权威结果，缓存过期后重新读取首页 + edit 页。
- `null / undefined` 同样过滤。
- 账号头像渲染追加 `@Referer=<当前 Hanime host>/`，解决图片 URL 正确但海阔图片请求缺 Referer 的可能性。
- 顶部优先显示真实 nickname；邮箱和 ID 放 desc。
- profile cache 30 秒，可继续由账号中心主动刷新。

### 4. 我的片单：列表与详情分两阶段恢复
Test38 证明“片单元数据”和“片单影片块”是两个独立问题：真实“泡面番 / 6部”能取到，但详情只解析 1 部。

Test39：
- **片单列表**：先从已知 wrapper 解析，再从原始 HTML 扫全部 `playlist?list=` ID；某个 ID 如果缺真实标题，则打开该真实片单详情页补 `title / cover / count`。仍禁止显示“片单<ID>”伪卡。
- **片单详情**：优先解析当前上游明确使用的 `div[id^=playlist-item-]` / `.playlist-video-list > div.user-tab-item-wrapper`。
- 若海阔 DOM 仍只返回 0–1 块，则按原始 HTML 中 `id="playlist-item-..."` 边界分段，每段独立解析 `watch?v=`、`.video-title`、`img.main-thumb`、作者和时长，避免 Test38 从一个大邻域里重复抓到同一部影片。
- 仍保留“官网片单”作为实机对照/应急入口。

### 5. 片库 `>`：按数据层哨兵清理，不再只改 Renderer
Test37/38 的 Renderer 已经没有主动新增 `>`，实机仍出现，说明旧 `filterCatalog` 数据里本身包含 `>` / more sentinel。

Test39 `library39.js` 在 catalog 标准化阶段过滤：

```text
> / › / 更多 / 更多筛选 / more / __more__
```

所有真实分类仍继续横向直接展示，并保留：

```text
全部筛选 | 作者目录 | 清空筛选
```

### 6. 发布门禁
- `community39.js / account39.js / library39.js / search39.js / settings39.js / recovery_loader.js` 已执行 `node --check`，全部通过。
- Test39 使用独立 immutable release 目录，不原地覆盖 Test38。
- Shell rule version=`2026082245`。
- `test.json / manifest / channels / registry / cloud manifest / manifest_meta / Shell / Bootstrap / release` 已切到 Build20039。
- Stable `2.0.0 / Build20029` 完全未修改。

## Test39 实机验收顺序
- [x] 首页输入“女友”并点击右侧搜索：Test39 实机已确认进入真实搜索结果页并返回 59 部，JSEngine#13 修复成立。
- [ ] 设置页显示 `2.0.0-test.39 · Build 20039 · Shell v4`。（已被 Test40 取代）
- [ ] 主评论仍正常，不能回归为 0。
- [ ] 再打开刚才“33条回复”的评论：用户名和正文应不再是 `null`；记录实际正常显示多少条。
- [ ] “我的”顶部看真实昵称和头像是否恢复。
- [ ] “我的片单”确认不只一张真实片单；若账号实际有多张，逐项对数量。
- [ ] “泡面番”官方 6 部：详情实际应向 6 部收敛；若仍少于 6，记录实际数量和哪几部出现。
- [ ] 收藏 / 稍后看 / 订阅 / 历史继续核对真实账号内容。
- [ ] 片库每行末尾旧 `>` 消失；全部筛选/作者目录/清空筛选继续存在。
- [ ] 推荐 / 播放 / 真选集 / 漫画链不回归。

## 关键已验证事实
- Stable 2.0.1 / Build20040：用户在明确知道仍有待优化问题的前提下，批准以当前 Test40 作为阶段性正式基线；因此“已晋级”是发布决策，不应被误写成所有 Test40 验收项都已通过。
- Test39：**搜索已实机恢复**；但 profile/browser-session 重入与片单 metadata 串行请求造成详情/我的/设置长时间阻塞，因此 Test39 本身不能晋级 Stable。
- Test38：回复 thread 身份链恢复到正确数量，但字段解析错误为 null；两行三列账号导航通过；片单详情从 0 改善到 1 但仍远少于官方 6；搜索仍 JSEngine#13；账号头像/昵称仍失败；筛选遗留 `>`。
- Test37：主评论恢复；真实片单标题/封面/数量恢复；完整筛选/作者入口恢复。
- Test32：browser Cookie 登录态能直接被“我的”识别；主评论仍存在。
- Test31：推荐页紧凑布局实机可用；播放器列表只剩真实播放项。
- Test29：实机启动正常；首页/详情 SVG 图标正常；上一 Stable 来源。
- Test24：作者头像、主评论头像、部分楼中楼真实头像可显示；更多回复当时可打开但偏慢，是 reply identity mapping 最后已知工作基线。
- Test17：上传者 `/user/<id>` 公开作品链实机通过。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析并直接播放。
- X5 网页登录 + Cookie bridge 可用。
- 漫画首页、漫画分类与详情基本链可用。
- 官网预告页自身 HTTP 500，继续故障降级。

## 已证伪 / 永久禁止回退
- Test18：同时重写评论数据和头像曾造成评论 0 条。
- Test19：全局收集评论图片按 index 回填不可靠。
- Test20：按 commentId/用户名固定字符邻域找图不可靠。
- Test21：自写轻量 HTML DOM parser 的合成 fixture 不能代表真实页面。
- Test25：在已工作链上改 replies rows/缓存后更多回复开始失效。
- Test27：JavaScript SyntaxError，永久 quarantine。
- Test28：顶层 `HanimeUI11` ReferenceError，永久 quarantine。
- Test31：commentId 重绑不足以修复更多回复。
- Test32：`videoId + absolute index` 二次定位失败。
- Test33：`作者 + 正文指纹` thread 二次定位失败；禁止继续堆启发式映射。
- Test34：同时覆盖 Community / Account / Library / Search 导致多域严重回归；永久 quarantine。
- Test38：全局 `.comment-index-text` 两两配对会得到正确数量但错误字段，海阔空值还会显示成字符串 `null`；禁止复用。
- Test38：`input.url` 顶层语句 + `return` 在海阔 input eval 链仍触发 JSEngine#13；以后 input URL 必须是合法表达式/IIFE。
- Test39：**禁止在 `P.profile()` 内再调用可能经 `browserProfile()` 回调 `P.profile()` 的 `sessionProfile/activeAccount` 链；任何身份 Resolver 必须先画调用图并做 re-entry guard。**
- Test39：账号片单列表首屏禁止为了补 metadata 无上限/高上限串行请求每张片单详情；默认单请求 + cache，慢补全必须显式触发。
- 已工作的评论/回复 identity mapping 不允许为了性能优化而重写；先优化重复请求、缓存、渲染。
- 禁止把浏览器 CSS selector 能力直接等同于海阔 `pdfa/pdfh`；关键列表必须有 XPath/raw 分段 fallback。
- 禁止只解析到 raw identifier 就制造用户可见业务卡片。
- 禁止“源码显示已覆盖”就认定设备正在执行；实机冲突时先查 Shell / Bootstrap / Remote state / release / load order。
- 禁止 GitHub 新 Release 当成手机已运行新 Release。
- 禁止 Cloud manifest 广告 Build 高于实际 Shell/Bootstrap/minBuild/defaultRelease。

## 当前恢复链
Stable：
```text
hanime1_remote_stable_v6_b20040.txt
→ bootstrap_stable_v6_b20040.js
→ Remote Manager id=hanime1
→ Stable 2.0.1 / Build20040
→ apps/video/hanime1/releases/2.0.1/recovery_loader.js
→ immutable Test40 recovery_loader
→ Test39 → Test38 → Test37 → Test32 ...
→ performance40
→ settings40（随后被 Stable settings overlay 覆盖）
→ apps/video/hanime1/releases/2.0.1/settings_stable.js
```

Test：
```text
hanime1_remote_test_v4_b20040.txt
→ bootstrap_test_v4_b20040.js
→ Remote Manager id=hanime1-test
→ 2.0.0-test.40 release
→ Test40 recovery_loader
→ Test39 recovery_loader
   → Test38 recovery_loader
      → Test37 recovery_loader
         → Test32 recovery_loader（browser-session + 主评论深层恢复点）
→ performance40（profile re-entry guard / stale-first / account cache / single-request playlist）
→ settings40
```

上一 Stable 保留：
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Stable 2.0.0 / Build20029
→ immutable Test29 verified baseline
```

## 版本记录
- `2.0.1 / Build20040`：当前正式版；用户批准由 Test40 阶段性晋级，使用独立 Stable release/Bootstrap/Shell，并保留 Build20029 回退链。
- `2.0.0-test.40 / Build20040`：Test39 实机性能热修；切断 profile/browser-session 重入，普通页面 profile cache-only，账号同步显式化，账号分区 90 秒缓存，片单主列表单请求 + 显式慢补全。
- `2.0.0-test.39 / Build20039`：Test38 实机定向修正；搜索已实机恢复，但出现 profile 重入/账号串行请求导致的长加载性能回归。
- `2.0.0-test.38 / Build20038`：回复数量恢复但字段全 null；账号两行导航通过；片单 6 部只解析 1；搜索/头像仍失败。
- `2.0.0-test.37 / Build20037`：主评论、真实片单卡、完整筛选/作者入口恢复。
- `2.0.0-test.34 / Build20034`：多域严重回归，永久隔离。
- `2.0.0-test.32 / Build20032`：browser-session 登录态 + 主评论深层恢复点。
- `2.0.0-test.31 / Build20031`：推荐页、播放器列表隔离实机通过。
- `2.0.0 / Build20029`：上一正式兜底，完整保留用于 rollback。
- `2.0.0-test.24 / Build20024`：真实头像出现；更多回复可打开但偏慢。
- `2.0.0-test.17 / Build20017`：上传者公开作品链实机通过。
