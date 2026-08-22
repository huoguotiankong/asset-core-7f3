# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.23` / Build `20023` / Shell `2026082229`。
- Stable 尚未晋级。
- Test23 **直接回到已验证 Test17 业务数据链**，不加载 Test18/19/20/21/22 的头像补丁；头像层改用海阔官方内置 XPath。
- Shell / Bootstrap 暂不改；已安装 Test21/22 的用户通过程序内“更新测试版”切到 Test23。

## 已验证实机事实
- Recovery15：首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test16：详情成功区分作者与上传者；上传者头像可显示；作者作品搜索可用；作者头像仍为空。首次 Shell 曾因反斜杠多转义导致海阔 SyntaxError，按成功 Shell 原文重建后恢复。
- Test17：上传者真实 `/user/<id>` 公共作品页链通过；评论 `/loadComment`、楼中楼 `/loadReplies` 可用。
- Test18：作者仍灰方块，同时评论退化成 `0 条评论`。Test18 直接覆盖评论解析的方案永久禁用。
- Test19：评论正文恢复，但作者/评论真实头像仍未恢复；“全局收集 img 再按数组顺序回填”判定无效。
- Test20：用户实机确认“还是一样，没有区别”。作者仍灰方块，主评论仍字母占位；上传者头像正常。局部 commentId/用户名邻域找图方案判定无效。
- Test21：2026-08-22 15:30 用户实机确认：**作者头像仍与原来一样；主评论头像大部分仍没有；楼中楼只有小部分显示真实自定义头像。** 回复截图中至少一条真实粉色头像成功显示，其余多条显示灰色默认人物图。该结果证明海阔 `avatar` 组件可以显示站点头像，`/loadReplies` 头像链至少部分成功，主评论/作者问题主要在 DOM/URL 提取而非图片组件完全失效。
- **Test22：2026-08-22 15:41 用户实机截图确认设置页仍没有“头像诊断”，且旧 Test12 设置模块仍显示硬编码 `2.0.0-test.12 · Build 20012`。** 这个文本本身不能证明真实运行 Build，因为它从 Test12 起就是硬编码；但“诊断区完全没有出现”说明 Test22 诊断补丁没有进入当前页面渲染上下文（可能是远程更新未生效、模块缓存/页面上下文未重载，或补丁加载失败）。因此后续版本必须同时解决“运行版本不可观测”问题，禁止继续拿硬编码版本文案判断实际运行链。
- Test12 X5 WebView bridge 登录实机成功：WebView Cookie → 规则侧导入 → profile 校验 → 保存账号。
- 首页真实内容、多分区、封面可用；视频详情封面可显示；1080/720/480 可解析并播放；真选集可直接播放；漫画首页/分类/详情基本链可用；公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## 上游 Han1mePlus 当前源码确认的头像契约
2026-08-22 已重新核对 `1wc10086/Han1mePlus@main`。

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

## 已证伪头像方案
- Test18：用海阔 `pdfa` 直接模拟 Flutter DOM 的 4/2 节点分组，同时重写评论数据。结果评论 0 条；禁用。
- Test19：`#comment-start img` 全局数组按 index 回填。评论恢复但头像失败；禁用。
- Test20：commentId/用户名固定字符邻域找 `<img>`。实机无变化；禁用。
- Test21：自写轻量 HTML 元素边界 + 顶层 children 分组。合成 fixture 能工作，但实机主评论/作者仍未通过；不能再以自写 HTML parser 作为首选。
- Test22：只增加诊断，但设备设置页没有出现诊断区；说明“诊断本身不可见”也会阻断闭环。后续诊断必须和真实运行版本标记一起直接覆盖设置页。

## Test23：海阔内置 XPath 头像恢复 + 运行链可观测
### 为什么改用 XPath
海阔官方开发者手册提供 `xpath()` / `xpathArray()`（缩写 `xpa`）直接对 HTML 执行 XPath。Test23 不再维护自写 HTML 栈解析器，而把 Han1mePlus 已知 DOM 契约直接表达为 XPath。

### 运行链
```text
Test17 已验证业务数据链
→ Test23 patch_avatar_xpath.js
→ 只增强作者/评论/回复头像 + 设置页运行版本/诊断
```

### 作者头像 XPath
```text
//*[@id="video-user-avatar"]/following-sibling::img[1]/@src
→ //*[@id="video-user-avatar"]/@src
→ //div[contains(@class,"video-description-panel")]//a[contains(@href,"/user/")]//img[1]/@src
→ 精确作者搜索 fallback
```

### 主评论头像 XPath
严格对应 Han1mePlus “每 4 个 root.children 一组”，只取每组第 1 个直接子元素内部的第一张头像：
```text
//*[@id="comment-start"]/*[position() mod 4 = 1]//img[1]/@src
```

安全门：**XPath 返回头像数量必须等于 Test17 `items.length` 才整体应用**。数量不一致时不按序硬塞，避免再次出现头像错位。

### 回复头像 XPath
```text
//div[starts-with(@id,"reply-start")]/*[position() mod 2 = 1]//img[1]/@src
```
同样要求 XPath 数量与回复 items 数量一致才批量应用。

### 设置页可观测性
Test23 完全覆盖旧 `renderSettings()`，不再显示 Test12 的硬编码版本。设置页顶部和“测试版本”区域都明确显示：
```text
2.0.0-test.23 · Build 20023
```
新增：
- `重新加载当前测试版`：调用 `HanimeBoot.reinstall()` 清理并重载当前 release 模块缓存。
- `运行头像诊断`：显示 XPath 是否可用、作者是否取到 URL、主评论 items/XPath头像/已应用数量、回复 items/XPath头像/已应用数量。
- 诊断不输出 Cookie / Token / Authorization / 密码。

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

## Test23 待实机回归
- [ ] 点击“更新测试版”后，重新进入 Hanime1 设置页，必须明确看到 `运行版本 2.0.0-test.23 · Build 20023`。若仍看见旧 Test12 文案且没有“运行版本”，说明新 release 仍未进入当前页面，不再继续测试头像。
- [ ] 设置页必须出现“重新加载当前测试版”和“头像诊断”。
- [ ] 目标视频详情作者若 XPath 取得 URL，应显示真实头像；上传者头像不能退化。
- [ ] 主评论数据保持正常；若 `XPath头像 == items`，应全部应用站点真实/默认头像，不再显示 Q/S/H/W 字母占位。
- [ ] 楼中楼数据保持正常；若 `XPath头像 == items`，应全部应用站点真实/默认头像。
- [ ] 若 XPath 数量不等于 items，截图诊断即可精确决定下一步，不再猜 DOM。
- [ ] 登录、播放、选集、片库、漫画无回归。

## 后续顺序
1. Test23：先确认真实运行 Build 和 XPath 头像命中数。
2. 头像链通过后，再做作者目录 + 独立作者主页。
3. 再通过后：评论点赞/点踩、举报等官网元信息与交互。
4. 再做账号中心/订阅作者增强。
5. 主要功能稳定后做 Consolidated Candidate，压缩历史增量链。

---
## 版本记录
### 2.0.0-test.23 / Build 20023 / 2026-08-22
- 回到 Test17 稳定业务链，不叠加 Test18~22 头像补丁。
- 头像解析切换为海阔内置 XPath，直接表达 Han1mePlus 4/2 子节点契约。
- 设置页改为真实运行版本标记，加入当前 release 重装和可见 XPath 诊断。
- 主评论/回复只有在 XPath 数量与 items 数量一致时才批量应用，避免错位。

### 2.0.0-test.22 / Build 20022 / 2026-08-22
- 计划只增加设置页头像诊断。
- 实机：诊断区未出现；旧 Test12 硬编码版本文案仍在，判定诊断/版本可观测性失败，被 Test23 替代。

### 2.0.0-test.21 / Build 20021 / 2026-08-22
- 自写 HTML parser 移植 4 子节点主评论 / 2 子节点回复契约。
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
