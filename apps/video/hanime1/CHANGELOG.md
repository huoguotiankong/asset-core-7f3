# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.22` / Build `20022` / Shell `2026082229`。
- Stable 尚未晋级。
- Test22 以 Test21 为直接运行基线；Test21 又以已验证 Test17 为业务数据基线。Test22 **不再猜新的头像 DOM/图片规则，只增加设备侧可见诊断**。
- Shell / Bootstrap 未改；已安装 Test21 的用户可通过程序内“更新测试版”切到 Test22。

## 已验证实机事实
- Recovery15：用户实机确认首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test16：视频详情成功区分作者与上传者；上传者头像可显示；作者作品搜索可用；作者头像仍为空。首次 Shell 曾因多转义反斜杠导致海阔 SyntaxError，按成功 Shell 原文重建后恢复。
- Test17：上传者真实 `/user/<id>` 公共作品页链通过；评论 `/loadComment`、楼中楼 `/loadReplies` 保持可用。
- Test18：作者仍灰方块，同时评论退化成 `0 条评论`。Test18 直接覆盖评论解析的方案永久禁用。
- Test19：评论正文恢复，但作者/评论真实头像仍未恢复；“全局收集 img 再按数组顺序回填”判定无效。
- Test20：用户实机确认“还是一样，没有区别”。作者仍灰方块，主评论仍字母占位；上传者头像正常。局部 commentId/用户名邻域找图方案判定无效。
- Test21：2026-08-22 15:30 用户实机确认：**作者头像仍与原来一样；主评论头像大部分仍没有；楼中楼只有小部分显示真实自定义头像。** 当前回复截图中至少有一条真实粉色头像成功显示，其余多条显示站点/组件的灰色默认人物图。这个结果非常关键：
  - 评论/回复正文数据链继续正常；
  - 海阔 `avatar` 组件可以显示站点头像图片；
  - `/loadReplies` 的头像链至少部分成功；
  - 主评论与作者失败已经不能再归因于“海阔完全不能显示头像”，必须读取真实 DOM 命中计数再修。
- Test12 X5 WebView bridge 登录实机成功：WebView Cookie → 规则侧导入 → profile 校验 → 保存账号。
- 首页真实内容、多分区、封面可用；视频详情封面可显示；1080/720/480 可解析并播放；真选集可直接播放；漫画首页/分类/详情基本链可用；公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## 上游 Han1mePlus 当前源码确认的头像契约
2026-08-22 已重新核对 `1wc10086/Han1mePlus@main`。

### 作者头像
`han1me_api.dart` 当前顺序：

```text
#video-user-avatar + img
→ #video-user-avatar
→ detail 内 a[href*="/user/"] img
→ 读取元素 src
```

UI 在 `artistAvatarUrl == null` 时才退化为作者首字符。

### 主评论头像

```text
/loadComment
→ #comment-start
→ root.children
→ 每 4 个直接子元素组成一条主评论
→ 4 节点 wrapper.querySelector('img').src
→ wrapper 内 reply-section-wrapper-* 提取 commentId
```

### 楼中楼头像

```text
/loadReplies
→ div[id^="reply-start"]
→ root.children
→ 每 2 个直接子元素组成一条回复
→ 第 1 个 body 元素 querySelector('img').src
```

## 已证伪头像方案
- Test18：用海阔 `pdfa` 直接模拟 Flutter DOM 的 4/2 节点分组，同时重写评论数据。结果评论 0 条；禁用。
- Test19：`#comment-start img` 全局数组按 index 回填。评论恢复但头像失败；禁用。
- Test20：commentId/用户名固定字符邻域找 `<img>`。实机无变化；禁用。
- Test21：自写轻量 HTML 元素边界 + 顶层 children 分组，合成 fixture 能工作，但实机主评论/作者仍未通过。说明**合成 HTML 正确不代表真实站点 HTML 被当前轻量 parser 正确分组**。

## Test22：头像诊断门禁
Test22 的目标不是“再试一套头像选择器”，而是把 Test21 已经存在但未暴露的诊断能力真正送到设备 UI。

### 运行链
```text
Test21 当前行为
→ Test22 patch_avatar_diag.js
→ 只记录/展示诊断
→ 不改变评论正文、头像解析结果、作者/上传者、播放、登录等业务逻辑
```

### 自动记录
- 每次打开视频详情，记录最近 `videoId`。
- 设置页新增“头像诊断”区域。
- 点击“运行最近视频头像诊断”后，把结果缓存到设置页并刷新显示；诊断文本可点击复制。

### 诊断字段
```text
Build / videoId
artist / artistMethod
artistMarker / artistNearImg
commentItems
commentRoot
commentImg
commentReplyWrap
Test21 commentGroups
commentGroupAvatars
commentMatchedAvatars
replyGroups
replyGroupAvatars
commentSamples
artistSamples
```

不输出 Cookie / Token / Authorization / 密码。

### 判读规则
- `commentImg > 0` 但 `commentGroups = 0`：Test21 的真实 root/children 边界解析失败。
- `commentGroups > 0` 但 `commentGroupAvatars = 0`：分组存在，但组内 `<img>` 抽取方式与真实标签属性不匹配。
- `commentGroupAvatars > 0` 但 `matched = 0`：commentId 回绑失败，应修 ID 映射而不是图片解析。
- `matched > 0` 但 UI 仍是字母：才进入图片 URL/Header/缓存显示链排查。
- `replyGroupAvatars > 0` 且楼中楼实机已有真实头像：可把回复链作为“已成功样本”反推主评论差异。
- `artistMarker = 0`：当前详情 HTML 根本没有 `video-user-avatar` 标记，不能继续围绕该节点修。
- `artistMarker = 1` 但 `artistNearImg = 0`：应进一步确认真实邻接 DOM 或作者本身是否没有头像资源。

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

硬约束：不保存账号密码；只保存账号 Cookie；只看到 session 类 Cookie 不等于登录成功；登录成功以能识别真实 `/user/<id>` 和账号资料为准。

## 后续顺序
1. Test22：只采集一轮真实头像诊断结果。
2. 根据诊断明确根因后做 Test23；只修改失败层，不再同时改作者、评论数据结构和 UI。
3. 头像链实机通过后，再做作者目录 + 独立作者主页。
4. 再通过后：评论点赞/点踩、举报等官网元信息与交互。
5. 再做账号中心/订阅作者增强。
6. 主要功能稳定后做 Consolidated Candidate，压缩历史增量链。

---
## 版本记录
### 2.0.0-test.22 / Build 20022 / 2026-08-22
- 根据 Test21 实机“作者仍无、主评论大部分无、回复小部分有”的结果，停止继续猜头像 DOM。
- 保留 Test21 运行行为，只增加设置页可见头像诊断。
- 诊断包含真实 HTML 的 root/img/reply-wrapper 数量、Test21 group/avatar/matched 数量，以及作者 marker/附近图片证据。
- 诊断不采集任何登录秘密。

### 2.0.0-test.21 / Build 20021 / 2026-08-22
- 移植 Han1mePlus 当前 4 子节点主评论 / 2 子节点回复 DOM 分组契约。
- 实机：作者仍未恢复；主评论头像大部分仍无；楼中楼部分头像已显示。

### 2.0.0-test.20 / Build 20020 / 2026-08-22
- commentId/用户名局部邻域头像尝试；实机无变化。

### 2.0.0-test.19 / Build 20019 / 2026-08-22
- 恢复 Test17 评论正文；头像增强失败。

### 2.0.0-test.18 / Build 20018 / 2026-08-22
- 实机失败：作者仍灰方块，评论退化为 0 条；禁用。

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
