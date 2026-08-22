# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.24` / Build `20024` / Shell v4 / 规则 version `2026082230`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4.txt`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4.js`。
- Stable 尚未晋级。
- **Test24 是交付/运行链恢复版**：保留 Test23 的海阔内置 XPath 头像引擎，但通过全新 Shell v4 + Bootstrap v4 强制把旧设备越过 Test21/22/23 的自锁更新状态。

## 已验证实机事实
- Recovery15：首页恢复正常，证明“退回 Test12 已验证链 + 新 Bootstrap/Shell 缓存键”的恢复方案有效。
- Test16：详情成功区分作者与上传者；上传者头像可显示；作者作品搜索可用；作者头像仍为空。首次 Shell 曾因反斜杠多转义导致海阔 SyntaxError，按成功 Shell 原文重建后恢复。
- Test17：上传者真实 `/user/<id>` 公共作品页链通过；评论 `/loadComment`、楼中楼 `/loadReplies` 可用。
- Test18：作者仍灰方块，同时评论退化成 `0 条评论`。Test18 直接覆盖评论解析的方案永久禁用。
- Test19：评论正文恢复，但作者/评论真实头像仍未恢复；“全局收集 img 再按数组顺序回填”判定无效。
- Test20：用户实机确认“还是一样，没有区别”。作者仍灰方块，主评论仍字母占位；上传者头像正常。局部 commentId/用户名邻域找图方案判定无效。
- Test21：2026-08-22 15:30 用户实机确认：**作者头像仍与原来一样；主评论头像大部分仍没有；楼中楼只有小部分显示真实自定义头像。** 回复截图中至少一条真实粉色头像成功显示，其余多条显示灰色默认人物图。该结果证明海阔 `avatar` 组件可以显示站点头像，`/loadReplies` 头像链至少部分成功，主评论/作者问题主要在 DOM/URL 提取而非图片组件完全失效。
- Test22：2026-08-22 15:41 用户实机截图确认设置页没有“头像诊断”，且旧 Test12 设置模块仍显示硬编码 `2.0.0-test.12 · Build 20012`。这个文案本身不能证明真实运行 Build，但诊断区未出现说明 Test22 没有进入当前页面运行上下文。
- **Test23 未真正送达设备验证。2026-08-22 16:49 用户再次点击旧设置页“更新测试版”，设备直接提示 `“HanimeBoot” 未定义。` 设置页仍没有 Test23 的“运行版本/头像诊断”。** 根因已经明确：Test12 起沿用的 `renderSettings()` 把 `HanimeBoot.check/update/rollback()` 直接写在序列化 `lazyRule` 回调中；回调执行时没有 Bootstrap 模块的外部全局上下文，因此 `HanimeBoot` 不存在。设备因此卡在旧 active release，后续 Test22/Test23 即使 GitHub 元数据已经发布也无法通过程序内更新进入手机。
- Test12 X5 WebView bridge 登录实机成功：WebView Cookie → 规则侧导入 → profile 校验 → 保存账号。
- 首页真实内容、多分区、封面可用；视频详情封面可显示；1080/720/480 可解析并播放；真选集可直接播放；漫画首页/分类/详情基本链可用；公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。

## 当前恢复链：Test24
```text
我的规则仓库重新覆盖导入 Hanime1 测试版
→ hanime1_remote_test_v4.txt / rule version 2026082230
→ bootstrap_test_v4.js?v=20024 / require build 20024
→ Remote Manager v2.0.1
→ minBuild 20024
→ 若设备 current < 20024，强制切 defaultRelease Test24
→ Test24 recovery_loader
→ Test23 recovery（Test17 稳定业务链 + XPath 头像层）
→ patch_runtime24（更新链/设置页恢复）
```

### 为什么必须重新覆盖导入 Shell
旧设备当前已经出现 `HanimeBoot 未定义`，说明**程序内“更新测试版”按钮本身坏了**。继续只改 `test.json/release.json` 无法让这台设备自救，因为它无法成功调用 Remote Manager 的 update。

因此 Test24 按仓库/远程模块规范成套发布：
- 新 Shell 文件名：`hanime1_remote_test_v4.txt`。
- 新规则数值 version：`2026082230`。
- 新 Bootstrap 文件名：`bootstrap_test_v4.js`。
- 新 Bootstrap require cache key/build：`20024`。
- Bootstrap `minBuild=20024`，默认 release 直接绑定 Test24。
- registry/channels/manifest/test 全部切到 v4 路径。

### Test24 更新按钮的正确写法
序列化 `lazyRule` **不再直接引用外部 `HanimeBoot`**。每次检查/更新/回退/重装/恢复都在回调内部显式：

```text
require(bootstrap_test_v4.js?v=20024, ..., 20024)
→ 当前回调上下文获得 HanimeBoot
→ HanimeBoot.check/update/rollback/reinstall/reset
```

Bootstrap URL 和 version 通过 `lazyRule` 参数显式传入，不依赖模块局部变量闭包。

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
- Test22：只增加诊断，但设备设置页没有出现诊断区；不能证明其头像实现失败，因为设备未可靠进入该 release。
- **Test23 XPath 头像方案尚未得到真实设备运行验证，不能再把“旧页面看起来没变化”误记为 Test23 头像失败。必须先让 Shell v4/Test24 真正进入设备，再看诊断。**

## Test23 / Test24 头像引擎
Test23 回到 Test17 已验证业务数据链，用海阔内置 `xpathArray/xpa` 直接表达 Han1mePlus DOM 契约；Test24 沿用该引擎，不再追加第七套头像解析猜测。

### 作者
```text
//*[@id="video-user-avatar"]/following-sibling::img[1]/@src
→ //*[@id="video-user-avatar"]/@src
→ //div[contains(@class,"video-description-panel")]//a[contains(@href,"/user/")]//img[1]/@src
→ 精确作者搜索 fallback
```

### 主评论
```text
//*[@id="comment-start"]/*[position() mod 4 = 1]//img[1]/@src
```
只有 XPath 返回头像数量与 Test17 `items.length` 完全一致时才整体应用，避免错位。

### 回复
```text
//div[starts-with(@id,"reply-start")]/*[position() mod 2 = 1]//img[1]/@src
```
同样要求 XPath 数量与回复 items 数量一致才应用。

### Test24 可见诊断
设置页必须明确显示：
```text
运行版本
2.0.0-test.24 · Build 20024 · Shell v4
```
并提供：
- 重新加载当前测试版。
- 恢复 Test24 基线。
- 检查远程更新 / 更新测试版 / 回退上一测试版。
- 头像诊断。

头像诊断返回：XPath 是否可用、作者是否取到 URL、主评论 items/XPath头像/已应用数量、回复 items/XPath头像/已应用数量；不输出 Cookie、Token、Authorization 或密码。

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

## Test24 待实机回归
- [ ] **不要再用当前旧页面的“更新测试版”按钮升级**；从“我的规则仓库”重新覆盖导入 Hanime1 测试版。
- [ ] 覆盖导入后重新进入设置页，必须看到 `2.0.0-test.24 · Build 20024 · Shell v4`。看不到就停止头像测试，继续修 Shell 交付链。
- [ ] 点击“检查远程更新”不再出现 `HanimeBoot 未定义`。
- [ ] 点击“重新加载当前测试版”能正常返回成功/错误信息，不出现全局对象未定义。
- [ ] 设置页出现“头像诊断”。
- [ ] 打开目标视频和一条回复后运行诊断，记录作者 URL、主评论 XPath 数量、回复 XPath 数量。
- [ ] 只有确认 Test24 真正在设备运行后，才判断 Test23 XPath 头像方案是否有效。
- [ ] 登录、播放、真选集、片库、漫画无回归。

## 后续顺序
1. Test24：先闭环 Shell v4/Bootstrap v4 到设备的真实交付和更新链。
2. Test24 真正运行后，用可见诊断判断 XPath 头像命中；只修失败的头像层。
3. 头像链通过后，再做作者目录 + 独立作者主页。
4. 再通过后：评论点赞/点踩、举报等官网元信息与交互。
5. 再做账号中心/订阅作者增强。
6. 主要功能稳定后做 Consolidated Candidate，压缩历史增量链。

---
## 版本记录
### 2.0.0-test.24 / Build 20024 / Shell v4 / 2026-08-22
- 用户实机确认旧设置页“更新测试版”报 `HanimeBoot 未定义`，明确定位远程更新链自锁根因。
- 发布 `hanime1_remote_test_v4.txt`，规则 version `2026082230`。
- 发布 `bootstrap_test_v4.js`，新缓存键/build 20024，`minBuild=20024`，默认 release 绑定 Test24。
- 所有更新类 `lazyRule` 回调改为内部显式 require Bootstrap，再调用 `HanimeBoot`。
- 新增 `resetToDefault` 对应“恢复 Test24 基线”。
- 头像引擎沿用 Test23 XPath，不在运行链未恢复前继续盲改头像。

### 2.0.0-test.23 / Build 20023 / 2026-08-22
- 回到 Test17 稳定业务链，不叠加 Test18~22 头像补丁。
- 头像解析切换为海阔内置 XPath，直接表达 Han1mePlus 4/2 子节点契约。
- 计划覆盖设置页真实运行版本/可见诊断；**由于旧设备更新链自锁，未得到真实设备运行验证。**

### 2.0.0-test.22 / Build 20022 / 2026-08-22
- 计划只增加设置页头像诊断；设备未可靠进入该 release。

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
