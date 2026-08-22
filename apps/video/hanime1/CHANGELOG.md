# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Stable/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前活动基线
- Stable：`2.0.0` / Build `20029`，由 Test29 实机可启动基线晋级，继续冻结为独立兜底。
- Stable Shell：`apps/video/hanime1/hanime1_remote_stable_v5_b20029.txt`；Bootstrap：`bootstrap_stable_v5_b20029.js`。
- Test：`2.0.0-test.39` / Build `20039`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20039.txt` / 规则 version `2026082245`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20039.js` / `minBuild=20039` / `defaultRelease=20039`。
- Test recovery base：`2.0.0-test.38`；深层恢复链仍经过 Test37 → Test32。
- Remote Manager：Stable id=`hanime1`；Test id=`hanime1-test`；manager `2.0.1`。
- Legacy `1.2.1` 仅保留历史文件 `hanime1.txt`。
- Test27 / Test28 / Test34 为 broken/quarantined，不允许作为恢复基线。

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
- [ ] 设置页显示 `2.0.0-test.39 · Build 20039 · Shell v4`。
- [ ] 主评论仍正常，不能回归为 0。
- [ ] 再打开刚才“33条回复”的评论：用户名和正文应不再是 `null`；记录实际正常显示多少条。
- [ ] 首页输入“女友”并点击右侧搜索：不得再出现 JSEngine#13，应进入真实搜索结果页。
- [ ] “我的”顶部看真实昵称和头像是否恢复。
- [ ] “我的片单”确认不只一张真实片单；若账号实际有多张，逐项对数量。
- [ ] “泡面番”官方 6 部：详情实际应向 6 部收敛；若仍少于 6，记录实际数量和哪几部出现。
- [ ] 收藏 / 稍后看 / 订阅 / 历史继续核对真实账号内容。
- [ ] 片库每行末尾旧 `>` 消失；全部筛选/作者目录/清空筛选继续存在。
- [ ] 推荐 / 播放 / 真选集 / 漫画链不回归。

## 关键已验证事实
- Test38：回复 thread 身份链恢复到正确数量，但字段解析错误为 null；两行三列账号导航通过；片单详情从 0 改善到 1 但仍远少于官方 6；搜索仍 JSEngine#13；账号头像/昵称仍失败；筛选遗留 `>`。
- Test37：主评论恢复；真实片单标题/封面/数量恢复；完整筛选与作者目录入口恢复。
- Test32：browser Cookie 登录态能直接被“我的”识别；主评论仍存在。
- Test31：推荐页紧凑布局实机可用；播放器列表只剩真实播放项。
- Test29：实机启动正常；首页/详情 SVG 图标正常；当前 Stable 来源。
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
- 已工作的评论/回复 identity mapping 不允许为了性能优化而重写；先优化重复请求、缓存、渲染。
- 禁止把浏览器 CSS selector 能力直接等同于海阔 `pdfa/pdfh`；关键列表必须有 XPath/raw 分段 fallback。
- 禁止只解析到 raw identifier 就制造用户可见业务卡片。
- 禁止“源码显示已覆盖”就认定设备正在执行；实机冲突时先查 Shell / Bootstrap / Remote state / release / load order。
- 禁止 GitHub 新 Release 当成手机已运行新 Release。
- 禁止 Cloud manifest 广告 Build 高于实际 Shell/Bootstrap/minBuild/defaultRelease。

## 当前恢复链
```text
hanime1_remote_test_v4_b20039.txt
→ bootstrap_test_v4_b20039.js
→ Remote Manager id=hanime1-test
→ 2.0.0-test.39 release
→ Test39 recovery_loader
→ Test38 recovery_loader
   → Test37 recovery_loader
      → Test32 recovery_loader（browser-session + 主评论深层恢复点）
      → account37 / creator37 / library37 / search37 / settings37
   → community38 / account38 / search38 / settings38
→ community39
→ account39
→ library39
→ search39
→ settings39
```

Stable：
```text
hanime1_remote_stable_v5_b20029.txt
→ bootstrap_stable_v5_b20029.js
→ Stable 2.0.0 / Build20029
→ immutable Test29 verified baseline
```

## 版本记录
- `2.0.0-test.39 / Build20039`：Test38 实机定向修正；精确 reply DOM 分组 + null 归一、合法 input IIFE 搜索、权威账号资料/Referer 头像、全片单 metadata 补取、playlist-item 分段解析、筛选 `>` 哨兵清理。
- `2.0.0-test.38 / Build20038`：回复数量恢复但字段全 null；账号两行导航通过；片单 6 部只解析 1；搜索/头像仍失败。
- `2.0.0-test.37 / Build20037`：主评论、真实片单卡、完整筛选/作者入口恢复。
- `2.0.0-test.34 / Build20034`：多域严重回归，永久隔离。
- `2.0.0-test.32 / Build20032`：browser-session 登录态 + 主评论深层恢复点。
- `2.0.0-test.31 / Build20031`：推荐页、播放器列表隔离实机通过。
- `2.0.0 / Build20029`：当前正式兜底。
- `2.0.0-test.24 / Build20024`：真实头像出现；更多回复可打开但偏慢。
- `2.0.0-test.17 / Build20017`：上传者公开作品链实机通过。
