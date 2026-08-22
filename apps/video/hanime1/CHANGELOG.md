# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.27` / Build `20027`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20027.txt` / Shell v4 / 规则 version `2026082232`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20027.js` / `minBuild=20027` / `defaultRelease=20027`。
- Remote Manager：`2.0.1`。
- Stable 尚未晋级。
- Test27 直接基于 Test26 当前真实运行链，集中处理 **更多回复回归、作者目录不可用、首页/详情操作区视觉层级弱**，不改播放解析、网页登录 Cookie、漫画主链和 Test24 已验证头像协议。

## 2026-08-22 最新实机事实
### Test24：头像恢复，根因包含“设备没有真正运行到新 Release”
用户从“我的规则仓库”覆盖导入 Shell v4 后明确反馈“这版本有头像了”。之前至少 Test22/Test23 没有可靠进入设备；旧设置页 `lazyRule` 直接引用外部 `HanimeBoot`，实机报 `“HanimeBoot” 未定义`，更新动作没有真正执行。

长期结论：**GitHub 已发布新 Release ≠ 手机已经运行新 Release**。连续两版以上“代码改了、实机完全没变化”时，先验 Shell / Bootstrap / Remote Manager active state / Release build / Runtime build，再改业务代码。专项记录：`docs/INCIDENT_REMOTE_RELEASE_NOT_APPLIED_20260822.md`。

### Test26 安装交付：云端仓库广告 Build 与实际安装基线必须一致
17:24 用户从云端仓库重新导入“Test26”，设置仍显示 Test24 / Build20024。根因不是 Test26 业务代码，而是 test/channels/registry 已广告 20026，但 Cloud Repo 仍复用旧 `hanime1_remote_test_v4.txt → bootstrap_test_v4.js?v=20024`。Remote Manager 正常 `load()` 不 fetch latest，因此重新导入仍可保留 Test24 active state。

修复：Test26 改为 build-locked 安装工件 `hanime1_remote_test_v4_b20026.txt + bootstrap_test_v4_b20026.js`，`minBuild/defaultRelease=20026`。17:39 实机已明确显示 `2.0.0-test.26 · Build 20026 · Shell v4`，说明交付修复成功。

全局硬规则已同步到 `HIKER_APP_DEVELOPMENT_CAUTIONS.md`，并新增 `tools/remote_installer_guard.py`：云端仓库广告 Build、release build、installerBuild、Bootstrap minBuild/defaultRelease 必须闭环一致。

### Test26 实机产品结果
用户确认真正运行 Test26 后继续反馈：
- 首页和详情布局有变化，但整体功能增强感不强；主导航与主操作仍像普通灰色文字按钮。
- 评论页主评论和头像正常，但“查看 X 条回复”已经不能正常使用，说明 Test25 单请求回复优化存在真实回归。
- 作者目录/作者分类页无法正常使用。
- 视频详情创作者区、评论头像等 Test24 能力仍在。

因此 Test27 不继续堆评论点赞等新功能，先把以上三项作为 P0/P1 修好，并同时做可感知 UI 升级。

## Test27：更多回复恢复 + 作者目录恢复 + 图标化主导航/主操作
### 1. 更多回复
Test25 为减少请求，把回复解析改成全局 `.comment-index-text` 两两配对，并加短缓存；Test26 实机证明“查看更多回复”出现回归。

Test27 改为：

```text
GET /loadReplies?id=<commentId>
→ JSON.replies HTML
→ XPath：div[id^=reply-start] 的直接子节点
→ 每 2 个直接子节点一条回复
→ 第 1 个 body 节点内部独立找 .comment-index-text
→ 同 body 内同时取 user/content/time/avatar
→ 若 body 级 XPath 不命中，再回退旧 rows 两两配对
```

- 仍保持首次只 1 次 `/loadReplies`。
- 空解析结果 **不写缓存**，避免一次失败后持续空白。
- 非空回复缓存 90 秒；发表回复后清除线程缓存。
- 主评论打开楼中楼时额外传 `replyCount`，回复页可区分“真正 0 回复”和“页面标记有回复但本次解析未命中”。
- 头像继续沿用 Test24 已验证的真实 URL/海阔 avatar 显示链。

### 2. 作者目录
Test26 自己又写了一套 `/search?type=artist` HTML 解析，和底层 `Provider.search({type:'artist'})` 重复，增加了第二套脆弱契约。

Test27 统一复用已有 Provider：

```text
P.search({query, type:'artist', page})
→ r.artists[]
→ title / img / query / meta
```

- 有关键词：使用官网作者搜索 + 分页。
- 无关键词：不发无意义空搜索，显示“最近查看的作者”。
- 打开视频详情/作者主页时记录最近作者，最多保存 16 位公开作者元数据。
- 作者主页继续使用 canonical query 走现有影片搜索链；上传者主页继续使用 Test17 已验证 `/user/<id>` 公开上传链。
- 作者与上传者保持两个实体，不混用。

### 3. 首页与详情图标 UI
用户明确要求首页“推荐 / 片库 / 漫画 / 我的 / 设置”和详情“播放 / 评论 / 加入片单 / 下载原片”增加合适图标。

Test27 新增仓库静态 SVG：`apps/video/hanime1/assets/icons/`。

首页：
- 5 个导航改为 `icon_5_no_crop`。
- 普通状态灰色线性图标；当前页面使用绿色 active SVG。
- 去掉旧标题前的黑色 `●`，同一选中态只保留一个主要视觉信号。

视频详情：
- 4 个主操作改用海阔官方 `icon_4`：播放 / 评论 / 加入片单 / 下载原片。
- 图标全部为仓库静态 SVG，不使用 data-URI，不依赖第三方 favicon/CDN。
- 选集、创作者、作品信息、内容标签、简介、画质、相关推荐结构保持 Test26 逻辑。

## 当前恢复/更新链
```text
hanime1_remote_test_v4_b20027.txt
→ bootstrap_test_v4_b20027.js?v=20027
→ Remote Manager v2.0.1
→ active release >= 20027
→ Test27 recovery_loader
→ Test26 recovery_loader
→ Test25 recovery_loader
→ Test24 recovery_loader
→ Test23 recovery（Test17 稳定业务链 + XPath 头像）
→ Test24 runtime patch
→ Test25 comment performance patch
→ Test26 creator/product UX patch
→ Test27 reply/creator/icon UX patch
```

### 云端重新导入硬约束
每次 Test/Candidate 元数据广告新 Build，若 Cloud Repo 允许“重新导入该版本”，安装工件必须同步锁到该 Build：

```text
advertised build
== release build
== installerBuild
<= Bootstrap minBuild
<= Bootstrap defaultRelease.build
```

否则禁止发布 Cloud Repo 入口。

### 更新按钮硬约束
序列化 `lazyRule` 不得直接引用外部 `HanimeBoot`。固定：

```text
lazyRule callback
→ 显式 require(当前 build 对应 Bootstrap URL/version)
→ HanimeBoot.check/update/rollback/reinstall/reset
```

## 上游 Han1mePlus 已确认 DOM 契约
### 作者头像
```text
#video-user-avatar + img
→ #video-user-avatar
→ detail 内 a[href*="/user/"] img
```

### 主评论
```text
/loadComment
→ #comment-start
→ root.children
→ 每 4 个直接子元素组成一条主评论
→ 组内第一张 img.src
```

### 楼中楼
```text
/loadReplies
→ div[id^="reply-start"]
→ root.children
→ 每 2 个直接子元素组成一条回复
→ 第 1 个 body 内：用户名/时间/正文/第一张 img
```

Test27 的回复恢复重新回到“每个 body 独立解析”，不再把整个回复页所有 `.comment-index-text` 当作一个稳定全局数组。

## 登录架构
```text
X5 官网 /login
→ 用户网页登录
→ fy_bridge_app.getCookie('') 获取真实 Cookie（含 HttpOnly）
→ Provider.importCookie()
→ /user/<id>/edit / profile 校验
→ Core.saveAccount()
```

不保存账号密码；只保存账号 Cookie。

## 已验证功能事实
- Recovery15：首页稳定基线恢复。
- Test16：作者与上传者分离；上传者头像正常。
- Test17：上传者 `/user/<id>` 公共作品页可加载。
- Test24：用户实机确认作者/评论头像恢复；Shell v4 运行链有效。
- Test26 Build-lock：用户实机确认 Cloud Repo 可真正进入 Build20026。
- 首页真实内容、多分区、封面可用。
- 视频详情 1080 / 720 / 480 可解析并播放。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- 评论 `/loadComment` 主评论正文与真实头像可用。
- 公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前维持故障降级。

## 已证伪 / 禁止回退
- Test18：同时重写评论数据和头像，曾造成评论 0 条。
- Test19：全局收集主评论图片后按 index 回填，不可靠。
- Test20：commentId/用户名固定字符邻域找图，不可靠。
- Test21：自写轻量 HTML DOM parser，合成 fixture 不能代表真实页面。
- Test22：诊断层当时没有可靠进入设备。
- Test25：单请求方向正确，但“全局 rows 配对 + 空结果缓存”在 Test26 实机出现楼中楼回归；Test27 改为 per-reply body 解析。
- Test26：作者目录第二套自写 HTML 解析实机不可用；Test27 统一复用 Provider.search(type=artist)。
- 禁止把 GitHub 新 Release 已发布当作手机已运行新 Release。
- 禁止 Cloud Repo 广告 Build 高于其实际 Shell/Bootstrap 安装基线。

## Test27 实机验收
- [ ] 设置页明确显示 `2.0.0-test.27 · Build 20027 · Shell v4`。
- [ ] 从“我的规则仓库”重新导入 Test27 后也必须直接进入 20027，不能停留 20026/20024。
- [ ] 首页五导航显示真实图标，当前项为绿色 active icon，不再显示黑色 `●`。
- [ ] 视频详情四主操作显示图标：播放 / 评论 / 加入片单 / 下载原片。
- [ ] 作者、上传者头像继续正常。
- [ ] 作者目录页面可打开；无关键词显示最近作者；输入作者名能出现作者结果。
- [ ] 作者卡进入作者主页后作品列表正常。
- [ ] 主评论头像/正文正常。
- [ ] “查看 16 条回复 / 5 条回复”等可重新打开楼中楼，用户名、时间、正文、头像对应正确。
- [ ] 同一回复线程二次打开更快，但首次解析失败不会缓存空列表。
- [ ] 登录、播放、选集、片库、漫画无回归。

## 后续路线
1. 先用 Test27 实机截图闭环回复、作者目录和图标 UI。
2. 通过后进入评论社区增强：点赞数、点赞/点踩状态与动作、举报。
3. 再做账号中心 + 作者订阅状态/订阅动作联动。
4. 主要功能稳定后制作 Consolidated Candidate，压缩 Test15～27 历史增量链。

---
## 版本记录
### 2.0.0-test.27 / Build 20027 / 2026-08-22
- 修复 Test25/26 “查看更多回复”回归：单请求 + per-reply body 解析 + rows fallback + 不缓存空结果。
- 作者目录统一复用 `Provider.search(type=artist)`，增加最近查看作者落地页。
- 首页五导航加入仓库静态 SVG，使用 `icon_5_no_crop`；选中项绿色 active icon。
- 详情四主操作使用官方 `icon_4` + 静态 SVG。
- 新增 build-locked `hanime1_remote_test_v4_b20027.txt / bootstrap_test_v4_b20027.js`，重新导入强制进入 20027。

### 2.0.0-test.26 / Build 20026 / 2026-08-22
- 新增作者目录、作者主页、上传者主页统一体验。
- 详情主操作重排为播放 / 评论 / 加入片单 / 下载原片。
- 搜索/筛选增加作者入口；设置页重分层。
- 首次 Cloud Repo 交付复用了 Test24 Bootstrap，用户重新导入仍跑 Test24；后补 build-locked 20026 installer，实机确认进入 Test26。
- Test26 实机暴露：作者目录不可用、更多回复回归、主操作视觉仍偏普通。

### 2.0.0-test.25 / Build 20025 / 2026-08-22
- 取消头像诊断。
- 楼中楼由双请求改为单请求，并移除页面 `profile()` 登录探测。
- 增加 45 秒线程缓存；方向正确，但 Test26 实机证明回复解析实现存在回归。

### 2.0.0-test.24 / Build 20024 / Shell v4 / 2026-08-22
- 新 Shell v4 + Bootstrap v4 修复 `HanimeBoot 未定义` 更新自锁。
- 用户覆盖导入后实机确认真实头像恢复。

### 2.0.0-test.23 / Build 20023
- 回到 Test17 稳定评论业务链，头像改用海阔内置 XPath；后由 Test24 真正送达设备验证。

### 2.0.0-test.22 / Build 20022
- 临时头像诊断；设备未可靠进入该 Release。

### 2.0.0-test.21 / Build 20021
- 自写轻量 HTML parser 头像方案；仅保留历史。

### 2.0.0-test.20 / Build 20020
- commentId/用户名邻域头像尝试；禁用。

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
- X5 bridge Cookie 登录成功；逐页面封面布局设置可用。

### 2.0.0-test.11 / Build 20011
- 真选集、时长格式化、评论去重。

### 2.0.0-test.8 / Build 20008
- canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
