# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史。
- 当前 Test：`2.0.0-test.28` / Build `20028`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20028.txt` / Shell v4 / 规则 version `2026082233`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20028.js` / `minBuild=20028` / `defaultRelease=20028`。
- Remote Manager：`2.0.1`。
- Stable 尚未晋级。
- **Test27 已隔离，不允许进入任何恢复链。**

## 2026-08-22 17:54：Test27 启动即 SyntaxError
用户更新 Test27 后，Hanime1 在规则执行阶段直接报错：

```text
Hanime1解析失败！
SyntaxError: 在参数列表的后面缺少“)”
行数：41
```

### 根因
实际读取 `apps/video/hanime1/releases/2.0.0-test.27/patch_experience27.js` 后，物理第 41 行 `E.repliesPage` 中存在发布前未发现的括号错误：

```text
d.push(H.sec(... + (condition ? a : b));
```

这里应关闭三层括号（条件表达式分组 / `H.sec()` / `d.push()`），Test27 少了一个右括号，因此整个远程模块在加载阶段无法解析，首页直接崩溃。

### 事故处理
- 不原地覆盖 Test27 immutable release。
- Test27 判定为 broken/quarantined。
- 新建 Test28，并且 **Test28 不 require Test27**。
- Test28 recovery 直接从最后可启动的 Test26 恢复链开始，再加载四个拆分模块：
  - `replies28.js`
  - `creator28.js`
  - `ui28.js`
  - `settings28.js`
- 四个模块在发布元数据切换前均执行 `node --check`，全部通过。
- 新增 `tools/js_syntax_guard.py`，以后新/修改 JS Release 在切 Test/Candidate 元数据前必须跑语法门禁。

## Test28：Test27 紧急恢复 + 原计划功能继续保留
### 回复链
```text
/loadReplies?id=<commentId>
→ 一次请求
→ 优先按 reply-start 的每条 reply body 独立解析
→ body 内取 user / time / content / avatar
→ body 解析为空才退回全局 rows 两两配对
→ 非空结果缓存 90 秒
→ 空结果不缓存
→ 发表回复后清线程缓存
```

目的：恢复 Test26 实机出现的“查看 X 条回复打不开”，同时保留 Test25 希望减少重复请求的性能方向。

### 作者目录 / 作者主页
Test26 自写第二套作者 HTML parser 实机不可用。Test28 不再维护第二套契约，统一复用现有：

```text
P.search({query, type:'artist', page})
→ r.artists[]
```

- 作者目录有关键词时走官网作者搜索。
- 无关键词时展示最近从视频详情访问过的作者。
- 作者主页继续用 canonical query 搜索作者作品。
- 上传者主页继续委托 Test26/Test17 已验证链，不把作者与上传账号混为同一实体。

### 首页 / 详情 UI
继续保留 Test27 原计划的可感知 UI 升级，但由 Test28 新模块重新实现：
- 首页：推荐 / 片库 / 漫画 / 我的 / 设置 → `icon_5_no_crop` + 仓库静态 SVG。
- 当前栏目仅使用绿色 active SVG，不再叠黑色 `●`。
- 视频详情：播放 / 评论 / 加入片单 / 下载原片 → `icon_4` + 静态 SVG。
- 图标固定在 `apps/video/hanime1/assets/icons/`，不使用 data-URI 和第三方 favicon 服务。

## 运行/交付事故历史
### Test24：头像终于恢复，真正问题包含“手机没跑到新 Release”
用户重新覆盖导入 Shell v4 后明确反馈真实作者/评论头像已经显示。旧设置页程序内更新曾报：

```text
“HanimeBoot” 未定义
```

根因是序列化 `lazyRule` 回调直接引用外部 Bootstrap 对象，导致 update 根本没执行。

长期规则：**GitHub 已发布新 Release ≠ 用户手机已运行新 Release。** 连续出现“代码改了但实机完全无变化”，先核对 Runtime build / Shell / Bootstrap / Remote Manager active release。

### Test26：云端仓库广告 Build 与安装工件脱节
用户从云端仓库重新导入显示为 Test26 的版本后，设置仍显示 Test24 / Build20024。根因：Cloud Repo 仍指向旧 Shell/Bootstrap，Bootstrap `minBuild/defaultRelease` 仍为 20024，Remote Manager `load()` 不会自动 fetch latest。

修复后形成硬规则：

```text
advertised build
== release build
== installerBuild
<= bootstrap minBuild
<= bootstrap defaultRelease.build
```

并新增 `tools/remote_installer_guard.py`。

## 已验证功能事实
- Test24：作者头像、主评论头像、部分楼中楼头像真实显示；Shell v4 交付链有效。
- Test26 build-lock：用户实机设置明确显示 `2.0.0-test.26 · Build 20026 · Shell v4`，证明云端重新导入链修复成功。
- 首页真实内容、多分区、封面可用。
- 视频详情封面可用；1080 / 720 / 480 可解析并播放。
- 真选集可解析，点击其它集直接播放。
- X5 网页登录 + Cookie bridge 可用。
- 公开片库无需登录可浏览。
- 漫画首页、漫画分类与详情基本链可用。
- 主评论 `/loadComment` 正文和头像可用。
- 官网预告页当前自身 HTTP 500，继续故障降级。

## 已证伪 / 禁止回退
- Test18：同时重写评论数据和头像，曾造成评论 0 条。
- Test19：全局收集主评论图片按 index 回填，不可靠。
- Test20：commentId/用户名固定字符邻域找图，不可靠。
- Test21：自写轻量 HTML DOM parser，合成 fixture 不能代表真实页面。
- Test22：诊断层当时未可靠进入设备。
- Test25：单请求方向正确，但全局 rows 配对 + 空结果缓存造成 Test26 楼中楼回归。
- Test26：作者目录第二套 HTML parser 实机不可用。
- **Test27：启动期 JavaScript SyntaxError，永久隔离，不允许作为 recovery base。**
- 禁止把 GitHub 新 Release 已发布当作手机已运行新 Release。
- 禁止 Cloud Repo 广告 Build 高于实际安装 Shell/Bootstrap 基线。
- 禁止新 JS 模块未做语法检查就切 Test/Candidate 元数据。

## 当前恢复链
```text
hanime1_remote_test_v4_b20028.txt
→ bootstrap_test_v4_b20028.js?v=20028
→ Remote Manager v2.0.1
→ Test28 release
→ Test28 recovery_loader
→ Test26 recovery_loader
→ Test25 → Test24 → Test23 → Test17/Test12 稳定链
→ replies28.js
→ creator28.js
→ ui28.js
→ settings28.js
```

**注意：Test27 不在上面的链中。**

## Test28 实机验收
- [ ] 从“我的规则仓库”重新导入 Test28 后首页可正常打开，无 SyntaxError。
- [ ] 设置显示 `2.0.0-test.28 · Build 20028 · Shell v4`。
- [ ] 首页五个导航显示真实 SVG 图标，当前项绿色。
- [ ] 详情四个主操作显示图标。
- [ ] 作者/上传者头像不退化。
- [ ] 作者目录能打开；输入作者名有结果；作者主页作品列表可用。
- [ ] 主评论正文和头像正常。
- [ ] “查看 16 条回复 / 5 条回复”等楼中楼可打开。
- [ ] 二次打开同线程更快，首次空解析不会被缓存。
- [ ] 播放、登录、选集、片库、漫画无回归。

## 后续路线
1. Test28 先完成实机闭环，任何启动/回复/作者问题先修，不继续堆功能。
2. 通过后进入评论社区增强：点赞数、点赞/点踩状态与动作、举报。
3. 再做作者订阅状态/订阅动作与账号中心联动。
4. 主要功能稳定后做 Consolidated Candidate，压缩 Test15～28 的历史增量链。

---
## 版本记录
### 2.0.0-test.28 / Build 20028 / 2026-08-22
- 紧急隔离启动即 SyntaxError 的 Test27。
- 从 Test26 直接重建，不 require Test27。
- 回复、作者目录、图标 UI、设置拆成四个模块，并全部通过 `node --check`。
- 新 Shell/Bootstrap/minBuild/defaultRelease 锁定 Build20028。

### 2.0.0-test.27 / Build 20027 / 2026-08-22
- 计划修复更多回复、作者目录并图标化 UI，但发布模块存在 JavaScript 语法错误，实机启动失败；已废弃。

### 2.0.0-test.26 / Build 20026 / 2026-08-22
- 创作者中心、详情主操作重排、搜索/筛选作者入口、设置分层。
- Cloud Repo 初次交付曾复用旧 20024 Bootstrap，后通过 build-lock 安装壳修复。

### 2.0.0-test.25 / Build 20025 / 2026-08-22
- 取消头像诊断；楼中楼尝试单请求 + 短缓存。

### 2.0.0-test.24 / Build 20024 / 2026-08-22
- Shell v4 + Bootstrap v4 修复更新链；用户实机确认真实头像出现。

### 2.0.0-test.23 / Build 20023
- 使用海阔 XPath 头像方案；后由 Test24 真正送达设备并验证。

### 2.0.0-test.17 / Build 20017
- 上传者 `/user/<id>` 公共作品链实机通过。

### 2.0.0-test.12 / Build 20012
- X5 Cookie bridge 登录、页面布局设置可用。

### 2.0.0-test.11 / Build 20011
- 真选集、时长格式化、评论去重。

### 2.0.0-test.6 / Build 20006
- WebView 验证/登录、封面、最高画质播放、漫画首页通过实机。
