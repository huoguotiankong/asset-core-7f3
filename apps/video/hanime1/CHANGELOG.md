# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.25` / Build `20025`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4.txt` / Shell v4 / 规则 version `2026082230`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4.js` / minBuild `20024`。
- Stable 尚未晋级。
- Test25 直接基于 **Test24 已实机验证的头像 + Shell/Bootstrap 运行链**，本轮只做评论/回复性能和设置页收尾，不改播放、登录、选集、片库、漫画主链。

## 最新实机结论（2026-08-22）
### Test24：头像恢复成功，真正根因是“设备没有运行到新 Release”
用户重新从“我的规则仓库”覆盖导入 Shell v4 / Bootstrap v4 后，实机明确反馈：**“这版本有头像了”**。

这条结果重新解释了 Test18～Test23 的历史：
- 不能再把“GitHub 已发布新头像补丁，但手机看起来没变化”直接记为“头像解析仍失败”。
- 至少 Test22/Test23 没有可靠进入用户设备；旧设置页的程序内更新链已经自锁。
- 用户 16:49 实机报错：`“HanimeBoot” 未定义。`
- 根因是旧 `renderSettings()` 的序列化 `lazyRule` 回调直接引用外部 Bootstrap 全局对象 `HanimeBoot`；回调执行上下文中该对象不存在，导致 `update()` 根本没有执行成功。
- Test24 发布全新 Shell v4 + Bootstrap v4，`minBuild=20024`，并让每个更新类 lazyRule 回调内部显式 `require()` Bootstrap；重新覆盖导入后，新 Runtime 真正进入设备，同一套 Test23 XPath 头像引擎立即显示真实头像。

**长期结论：业务功能连续两轮以上“完全无变化”时，先验证设备真实 Runtime Build / Shell / Bootstrap / active release，再继续改业务代码。**

专项事故文档：`docs/INCIDENT_REMOTE_RELEASE_NOT_APPLIED_20260822.md`。

## Test25：取消头像诊断 + “查看更多回复”性能优化
用户确认头像已经恢复后，头像诊断完成使命，Test25 从设置页移除临时“头像诊断”区域，保留真实运行版本、重载、Test24 Recovery、检查更新、更新和回退能力。

### 性能根因
Test24 的回复打开链实际上包含多余网络请求：

```text
打开回复页
→ Test17 oldReplies() 请求一次 /loadReplies 解析用户名/正文/时间
→ Test23 XPath 头像增强再次请求同一个 /loadReplies 解析头像
→ ui_comments.js 为判断“是否登录”又调用 P.profile()
   → 未登录至少额外请求首页/CSRF
   → 已登录可能继续请求 /user/<id>/edit
```

因此一次“查看 X 条回复”可能产生 3～4 个串行 HTTP 请求，尤其移动网络下体感明显偏慢。

### Test25 优化
1. **楼中楼改为单请求解析**：只请求一次 `/loadReplies`，同一份响应同时解析回复正文与 XPath 头像，不再执行第二次头像请求。
2. **页面登录状态改用本地账户状态**：评论页/回复页只用 `HanimeCore.activeAccount()` 判断是否显示“回复/登录”按钮，不再每次打开页面调用 `profile()` 做远程账号探测。
3. **45 秒线程短缓存**：同一 commentId 的回复列表在 45 秒内再次打开直接走本地缓存；发表回复后自动清除对应线程缓存。
4. 回复文本仍沿用 Test11 的用户名/时间清洗逻辑；头像仍沿用已经实机成功的 XPath 2-child 契约。
5. 如果 XPath 数量与回复结构不匹配，优先尝试当前 `.comment-index-text` 行内图片，不为了头像破坏回复正文。

预期请求数：

```text
首次打开某回复线程：1 × /loadReplies
45 秒内再次打开：0 次网络请求
```

## 当前恢复/更新链
```text
hanime1_remote_test_v4.txt
→ bootstrap_test_v4.js?v=20024
→ Remote Manager v2.0.1
→ active release
→ Test25 recovery_loader
→ Test24 recovery_loader
→ Test23 recovery（Test17 稳定业务链 + XPath 头像）
→ Test24 runtime patch（修复 updater lazyRule）
→ Test25 comment performance patch
```

### 更新按钮硬约束
序列化 `lazyRule` 不得直接引用外部 `HanimeBoot`。固定模式：

```text
lazyRule callback
→ 显式 require(bootstrap URL, version)
→ 当前回调上下文获得 HanimeBoot
→ check / update / rollback / reinstall / reset
```

Bootstrap URL/version 必须通过 lazyRule 参数传入，不依赖外部闭包。

## 上游 Han1mePlus 当前源码确认的头像契约
2026-08-22 已核对 `1wc10086/Han1mePlus@main`。

### 作者头像
```text
#video-user-avatar + img
→ #video-user-avatar
→ detail 内 a[href*="/user/"] img
→ 读取元素 src
```

### 主评论头像
```text
/loadComment
→ #comment-start
→ root.children
→ 每 4 个直接子元素组成一条主评论
→ 组内第一张 img.src
```

### 楼中楼头像
```text
/loadReplies
→ div[id^="reply-start"]
→ root.children
→ 每 2 个直接子元素组成一条回复
→ 第 1 个 body 元素内第一张 img.src
```

当前 Test23/24/25 使用海阔内置 `xpathArray/xpa` 表达上述契约；Test24 已实机证明真实头像可显示。

## 已证伪 / 不应继续使用的方案
- Test18：直接重写 `P.comments/P.replies`，同时改评论数据与头像；实机曾造成评论 0 条。禁止作为基线。
- Test19：全局收集 `#comment-start img` 后按数组 index 回填；不可证明稳定对应关系，禁止。
- Test20：commentId/用户名固定字符邻域找图；实机“无变化”且当时 Runtime 版本不可观测，不再继续该启发式。
- Test21：自写轻量 HTML parser 模拟 DOM children；合成 fixture 通过不代表真实页面稳定，已由内置 XPath 取代。
- Test22：临时头像诊断层没有可靠进入设备；已取消。
- **禁止把“GitHub 新 Release 已发布”当作“手机已经运行新 Release”。**

## 登录架构（当前正确链）
```text
X5 官网 /login
→ 用户完成网页登录
→ fy_bridge_app.getCookie('') 读取真实 Cookie（含 HttpOnly）
→ putVar() 回传规则侧
→ Provider.importCookie()
→ /user/<id>/edit / profile 校验身份
→ Core.saveAccount()
```

硬约束：不保存账号密码；只保存账号 Cookie；登录成功以能识别真实 `/user/<id>` 和账号资料为准。

## 已验证功能事实
- Recovery15：首页恢复正常。
- Test16：详情成功区分作者与上传者；上传者头像可显示。
- Test17：上传者真实 `/user/<id>` 公共作品页可加载。
- Test24：用户实机确认作者/评论头像已经出现；Shell v4 交付链有效。
- 首页真实内容、多分区、封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析并播放。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- 评论 `/loadComment` 与楼中楼 `/loadReplies` 正文链可用。
- 公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## Test25 待实机回归
- [ ] 设置页显示 `2.0.0-test.25 · Build 20025 · Shell v4`。
- [ ] 设置页不再出现“头像诊断”。
- [ ] 作者、主评论、回复真实头像保持 Test24 正常状态，不退化。
- [ ] 点击“查看 X 条回复”首次打开速度明显优于 Test24。
- [ ] 关闭后 45 秒内再次打开同一回复线程应更快。
- [ ] 回复用户名、时间、正文、头像对应关系正确。
- [ ] 已登录用户仍能发表回复；发表后对应线程刷新能看到新回复，不被旧缓存挡住。
- [ ] 更新/检查/回退/重载不再出现 `HanimeBoot 未定义`。
- [ ] 登录、播放、真选集、片库、漫画无回归。

## 后续顺序
1. 实机闭环 Test25 回复速度和头像无回归。
2. 再做作者目录 + 独立作者主页。
3. 再做评论点赞/点踩、举报等官网元信息与交互。
4. 再做账号中心/订阅作者增强。
5. 主要功能稳定后做 Consolidated Candidate，压缩 Test15～25 的历史增量链。

---
## 版本记录
### 2.0.0-test.25 / Build 20025 / 2026-08-22
- Test24 头像链实机通过后，取消临时头像诊断 UI。
- 楼中楼由两次 `/loadReplies` 串行请求合并为一次，同时解析正文和 XPath 头像。
- 评论/回复页移除仅为登录按钮状态而执行的 `P.profile()` 网络请求，改读本地 active account。
- 增加 45 秒每线程回复缓存；发表回复后自动失效。
- Shell v4 / Bootstrap v4 / Test24 Recovery 保持不变。

### 2.0.0-test.24 / Build 20024 / Shell v4 / 2026-08-22
- 新 Shell v4 + Bootstrap v4 修复 `HanimeBoot 未定义` 的程序内更新自锁。
- 用户重新覆盖导入后实机确认真实头像已经出现。
- 证明此前多轮“头像还是没有”包含明显的 Runtime 未升级误判。

### 2.0.0-test.23 / Build 20023 / 2026-08-22
- 回到 Test17 稳定业务链，头像切换到海阔内置 XPath。
- 由于旧 updater 自锁，当时没有可靠进入用户设备；后由 Test24 真正送达并验证头像有效。

### 2.0.0-test.22 / Build 20022 / 2026-08-22
- 临时头像诊断尝试；设备未可靠进入该 Release。

### 2.0.0-test.21 / Build 20021 / 2026-08-22
- 自写 HTML parser 头像方案；部分回复头像曾出现，但不能作为最终基线。

### 2.0.0-test.20 / Build 20020 / 2026-08-22
- commentId/用户名邻域头像尝试。

### 2.0.0-test.19 / Build 20019 / 2026-08-22
- 恢复 Test17 评论正文；头像附加方案未闭环。

### 2.0.0-test.18 / Build 20018 / 2026-08-22
- 评论退化为 0 条；禁用。

### 2.0.0-test.17 / Build 20017 / 2026-08-22
- 上传者 `/user/<id>` 公共作品链实机通过。

### 2.0.0-test.16 / Build 20016 / 2026-08-22
- 详情分离作者与上传者；上传者头像正常。

### 2.0.0-test.15 / Build 20015 / 2026-08-22
- Recovery：恢复 Test12 已验证运行链。

### 2.0.0-test.12 / Build 20012
- X5 网页 bridge Cookie 登录实机成功；逐页面封面布局设置可用。

### 2.0.0-test.11 / Build 20011
- 真选集、时长格式化、评论去重。

### 2.0.0-test.8 / Build 20008
- canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
