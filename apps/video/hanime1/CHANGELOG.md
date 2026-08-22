# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test 业务 Release：`2.0.0-test.26` / Build `20026`。
- 逻辑 Shell 架构：Shell v4。
- **当前云端仓库 Test 安装壳**：`apps/video/hanime1/hanime1_remote_test_v4_b20026.txt`，规则 version `2026082231`。
- **当前云端仓库 Test 安装 Bootstrap**：`apps/video/hanime1/bootstrap_test_v4_b20026.js`，`minBuild=20026`，`defaultRelease=Test26`。
- 历史兼容 Bootstrap：`apps/video/hanime1/bootstrap_test_v4.js` / require build `20024`，仍被 Test24～26 的设置页维护按钮用于 check/update/reinstall/rollback/reset；它读取同一个 `hc_remote_state_hanime1-test`，正常 update 仍可升级到远端最新 Release。
- Stable 尚未晋级。
- Test26 业务层继续基于 **Test24 已实机验证的头像/运行链 + Test25 单请求楼中楼性能链**；本轮业务功能是创作者中心与产品体验升级，不改播放解析、登录 Cookie、漫画和基础评论正文协议。

## 2026-08-22 17:24：Test26 云端仓库重新导入仍跑 Test24
用户从“我的规则仓库”重新导入已经显示为 Test26 的 Hanime1 测试版，但实机设置页仍显示：

```text
2.0.0-test.24 · Build 20024 · Shell v4
```

并且仍存在 Test24 的“头像诊断”，因此可以确认设备没有进入 Test25/Test26。

### 根因
这次不是业务 Release 错，也不是 Test26 代码没发布，而是 **Cloud Repo 广告版本与真实安装工件脱节**：

```text
test.json / channels / registry 已广告 Build 20026
→ 但 rule 仍指向 hanime1_remote_test_v4.txt
→ Shell 仍硬编码 bootstrap_test_v4.js?v=20024 / require 20024
→ Bootstrap v4 的 minBuild=20024 / defaultRelease=Test24
→ Remote Manager load() 正常启动不 fetch latest
→ 重新导入旧 Shell 只会继续加载 active release / Test24
```

因此此前“Test26 不需要升级 Shell，直接云端仓库重新导入也会得到 Test26”的判断是错误的。

### 交付热修（业务 Release 仍为 Test26 / 20026）
不覆盖 Test26 immutable release，只修安装交付层：

```text
Cloud Repo Test26
→ hanime1_remote_test_v4_b20026.txt
   rule version 2026082231
→ bootstrap_test_v4_b20026.js?v=20026
   require build 20026
   minBuild=20026
   defaultRelease=Test26 / Build20026
→ Remote Manager v2.0.1
→ 若 current < 20026，强制切 Test26
→ Test26 recovery_loader
```

同步更新：`test.json / channels.json / manifest.json / registry.json`。

### 长期强制规则
- Cloud Repo Test/Candidate 卡片广告 `Build N` 时，安装 `rule` 必须能让新装/重新导入用户进入 `Build >= N`。
- 不能只升级 `test.json/release.json`，却继续让 Cloud Repo 指向 `defaultRelease/minBuild` 落后于 N 的旧 Bootstrap。
- 逻辑 Shell v4 可以不变，但安装工件可以按 build 版本化，例如 `v4_b20026`；以后新业务版已安装用户仍走程序内 update，而 Cloud Repo 当前安装入口必须与广告 build 对齐。
- 已新增跨项目静态门禁：`tools/remote_installer_guard.py`。
- 跨程序事故文档：`docs/INCIDENT_REMOTE_RELEASE_NOT_APPLIED_20260822.md`。

## Test24：头像恢复成功，核心误判也是 Runtime 未升级
用户重新从“我的规则仓库”覆盖导入 Shell v4 / Bootstrap v4 后实机明确反馈：**“这版本有头像了”**。

历史结论：
- Test18～21 确实包含实际头像解析问题/失败方案。
- Test22/Test23 没有可靠进入设备，不能把“手机没变化”记成其业务实现失败。
- 用户 16:49 实机曾报 `“HanimeBoot” 未定义`。
- 根因是旧 `renderSettings()` 的序列化 `lazyRule` 直接引用外部 `HanimeBoot`；独立执行上下文里对象不存在，导致程序内更新自锁。
- Test24 通过新 Shell v4 + Bootstrap v4 + `minBuild=20024` 恢复设备运行链，同一套 Test23 XPath 头像引擎真正进入设备后即显示头像。

**长期结论：业务功能连续两轮以上“完全无变化”时，先验证真实 Runtime Build / Shell / Bootstrap / active release，再继续改业务代码。**

## Test25：取消头像诊断 + “查看更多回复”性能优化
用户确认头像恢复后，Test25 删除临时头像诊断，并优化评论楼中楼：

```text
Test24 旧链
打开回复页
→ oldReplies() 请求 /loadReplies 取正文
→ XPath 头像增强再次请求 /loadReplies
→ 页面为判断登录再调用 profile()
→ 一次打开可能 3～4 个串行请求
```

Test25 改为：
1. `/loadReplies` **单请求**同时解析正文、时间和 XPath 头像。
2. 评论/回复页面只读 `HanimeCore.activeAccount()` 判断按钮状态，不再为显示按钮远程调用 `profile()`。
3. 同一 commentId 增加 45 秒短缓存；发表回复后自动失效。
4. XPath 头像数量不匹配时回退当前行图片，不为了头像破坏正文。

预期：首次打开线程约 1 个 `/loadReplies`；45 秒内再次打开 0 次网络请求。

## Test26：创作者中心 + 详情/搜索/设置体验升级
### 作者目录
按 Han1mePlus 当前作者搜索契约：

```text
/search?page=<page>&query=<keyword>&type=artist
→ .search-artist-card
→ .search-artist-title
→ img[style*=object-fit]
→ .search-artist-count
→ a.overlay href 中 canonical query
```

- 筛选页增加“作者目录 / 综合搜索”。
- 搜索页增加“查找同名作者”，不在普通影片搜索时并发额外作者请求。
- 作者目录支持关键词、真实头像、作品数文本和分页。
- 作者公开元数据短缓存 10 分钟；不保存 Cookie/账号秘密。

### 独立作者主页
- 详情作者卡、作者目录卡进入独立作者视图。
- Header 显示头像、作者身份、官网作品数信息。
- 作品仍走 canonical query + 现有影片搜索链，保持卡片、播放、分页一致。
- 提供“在全部影片中搜索 / 作者目录”辅助入口。

### 上传者主页
- 继续使用 Test17 已实机通过的 `/user/<id>` 公开上传链。
- UI 与作者主页统一：头像/身份 → 官网主页/同名搜索 → 公开上传 → 分页。
- 作者与上传者严格分离。

### 视频详情 Product UX
首屏主操作重排为：

```text
播放 / 评论 / 加入片单 / 下载原片
```

- “加入片单”复用 `hanimePlaylistPicker`；未登录先登录。
- 选集继续横向 `scroll_button`，当前集显示 `▶`。
- 原“作者与上传者”改成“创作者”，作者/上传者分别进入自己的主页。
- 作品信息、标签、简介、画质、相关推荐继续保留。

### 搜索 / 筛选 / 设置
- 搜索：影片与作者发现分流，避免不必要双请求。
- 筛选：先作者目录/综合搜索，再影片类型、排序、日期、时长、标签。
- 设置：账号 → 界面 → 网络 → 测试版本 → 维护；重载/回退/Recovery 放维护区域。
- Test26 设置页维护按钮仍采用“lazyRule 内显式 require Bootstrap”模式，禁止复活 `HanimeBoot 未定义`。

## 当前真实运行/安装链
### 云端仓库新装或重新导入 Test26
```text
hanime1_remote_test_v4_b20026.txt / rule version 2026082231
→ bootstrap_test_v4_b20026.js?v=20026 / require 20026
→ Remote Manager v2.0.1
→ minBuild 20026
→ Test26 recovery_loader
→ Test25 recovery_loader
→ Test24 recovery_loader
→ Test23 recovery（Test17 稳定业务链 + XPath 头像）
→ Test24 runtime patch
→ Test25 comments performance patch
→ Test26 creator/product UX patch
```

### 已经安装 Test24+ 的用户日常升级
```text
设置 → 更新测试版
→ lazyRule 内显式 require compatibility bootstrap v4
→ HanimeBoot.update()
→ Remote Manager fetch test.json + release.json
→ load 新 Release
→ 保存 active state
```

## 更新按钮硬约束
序列化 `lazyRule` 不得直接引用外部 `HanimeBoot`：

```text
lazyRule callback
→ 显式 require(bootstrap URL, version)
→ 当前回调上下文获得 HanimeBoot
→ check / update / rollback / reinstall / reset
```

Bootstrap URL/version 必须通过 lazyRule 参数传入，不依赖外部闭包。

## 上游 Han1mePlus 当前源码确认的头像契约
### 作者头像
```text
#video-user-avatar + img
→ #video-user-avatar
→ detail 内 a[href*="/user/"] img
```

### 主评论头像
```text
/loadComment
→ #comment-start
→ root.children
→ 每 4 个直接子元素一条主评论
→ 组内第一张 img.src
```

### 楼中楼头像
```text
/loadReplies
→ div[id^="reply-start"]
→ root.children
→ 每 2 个直接子元素一条回复
→ 第 1 个 body 内第一张 img.src
```

当前 Test23～26 使用海阔内置 `xpathArray/xpa` 表达该契约；Test24 已实机证明真实头像可显示。

## 已证伪 / 禁止复活
- Test18：直接重写评论数据+头像，实机造成评论 0 条；禁止作为基线。
- Test19：全局收集 `#comment-start img` 按 index 回填；对应关系不可靠。
- Test20：commentId/用户名固定字符邻域找图；不再采用。
- Test21：自写 HTML parser 模拟 DOM children；已由内置 XPath 取代。
- Test22：临时头像诊断未可靠进入设备；诊断 UI 已取消。
- **禁止把“GitHub 新 Release 已发布”当作“手机已运行新 Release”。**
- **禁止让 Cloud Repo 广告 Build N，却让其 rule/Bootstrap 默认安装 Build M<N。**

## 登录架构
```text
X5 官网 /login
→ 用户网页登录
→ fy_bridge_app.getCookie('') 读取真实 Cookie（含 HttpOnly）
→ putVar() 回传规则侧
→ Provider.importCookie()
→ /user/<id>/edit / profile 校验
→ Core.saveAccount()
```

硬约束：不保存密码；只保存账号 Cookie；登录成功以识别真实 `/user/<id>` 和资料为准。

## 已验证功能事实
- Recovery15：首页恢复正常。
- Test16：详情区分作者与上传者；上传者头像可显示。
- Test17：上传者真实 `/user/<id>` 公共作品页可加载。
- Test24：用户实机确认作者/评论头像出现；Shell v4 交付/更新恢复链有效。
- 首页真实内容、多分区、封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析并播放。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、分类、详情基本链可用。
- 评论 `/loadComment` 与楼中楼 `/loadReplies` 正文链可用。
- 公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## Test26 当前待实机回归
- [ ] **从规则仓库同步后重新导入 Test26，设置页必须显示 `2.0.0-test.26 · Build 20026 · Shell v4`；不再出现头像诊断。**
- [ ] Test25 的作者/主评论/回复真实头像保持正常。
- [ ] “查看 X 条回复”保持单请求优化，正文/时间/头像对应正确。
- [ ] 详情四个主操作一行显示合理：播放 / 评论 / 加入片单 / 下载原片。
- [ ] 作者卡进入作者主页；头像、作者名、作品列表、分页正常。
- [ ] 上传者卡进入公开上传主页；`/user/<id>` 链不退化。
- [ ] 作者目录能打开并搜索匹配作者。
- [ ] 搜索“查找同名作者”和筛选“作者目录”正常。
- [ ] 加入片单：登录态进入 picker，未登录进入登录页。
- [ ] 设置页层级比 Test24/Test25 更简洁；维护操作仍可用。
- [ ] 登录、播放、真选集、片库、漫画无回归。

## 后续顺序
1. 先闭环 **Test26 新安装壳是否真正进入 Build20026**；未通过前不继续业务功能。
2. 通过后评审作者目录/作者主页/详情 UI 截图并做纯 UI 微调。
3. 下一阶段：评论点赞/点踩、点赞数、举报等官网元信息与交互。
4. 再做账号中心/订阅作者增强，并把订阅状态与作者主页联动。
5. 主要功能稳定后做 Consolidated Candidate，压缩 Test15～26 历史增量链。

---
## 版本记录
### 2.0.0-test.26 / Build 20026 / 2026-08-22
- 业务：作者目录、独立作者主页、统一上传者主页。
- 业务：详情首屏主操作重排为播放 / 评论 / 加入片单 / 下载原片。
- 业务：搜索/筛选增加作者发现；设置页按账号/界面/网络/版本/维护分层。
- 保留 Test25 单请求楼中楼、45 秒线程缓存和 Test24 头像链。
- **17:24 交付热修**：发现 Cloud Repo Test26 仍指向 Test24 安装壳；新增 `hanime1_remote_test_v4_b20026.txt` + `bootstrap_test_v4_b20026.js`，规则 version `2026082231`，`minBuild/defaultRelease=20026`，并切换 registry/channels/manifest/test。

### 2.0.0-test.25 / Build 20025 / 2026-08-22
- 取消头像诊断 UI。
- 楼中楼两次 `/loadReplies` 合并为一次。
- 评论/回复页移除无意义的 `P.profile()` 网络探测。
- 增加 45 秒线程缓存；发表回复后失效。

### 2.0.0-test.24 / Build 20024 / Shell v4 / 2026-08-22
- 新 Shell v4 + Bootstrap v4 修复 `HanimeBoot 未定义` 的程序内更新自锁。
- 用户重新覆盖导入后实机确认真实头像出现。
- 证明此前多轮“头像还是没有”包含 Runtime 未升级误判。

### 2.0.0-test.23 / Build 20023
- 回到 Test17 稳定业务链，头像切海阔内置 XPath。
- 当时旧 updater 自锁，未可靠进入设备；后由 Test24 真正送达并验证有效。

### 2.0.0-test.22 / Build 20022
- 临时头像诊断尝试；设备未可靠进入该 Release。

### 2.0.0-test.21 / Build 20021
- 自写 HTML parser 头像方案；仅部分回复头像出现，已淘汰。

### 2.0.0-test.20 / Build 20020
- commentId/用户名邻域头像尝试；淘汰。

### 2.0.0-test.19 / Build 20019
- 恢复 Test17 评论正文；头像附加方案未闭环。

### 2.0.0-test.18 / Build 20018
- 评论退化为 0 条；禁用。

### 2.0.0-test.17 / Build 20017
- 上传者 `/user/<id>` 公共作品链实机通过。

### 2.0.0-test.16 / Build 20016
- 详情分离作者与上传者；上传者头像正常。

### 2.0.0-test.15 / Build 20015
- Recovery：恢复 Test12 已验证运行链。

### 2.0.0-test.12 / Build 20012
- X5 bridge Cookie 登录实机成功；逐页面封面布局设置可用。

### 2.0.0-test.11 / Build 20011
- 真选集、时长格式化、评论去重。

### 2.0.0-test.8 / Build 20008
- canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
