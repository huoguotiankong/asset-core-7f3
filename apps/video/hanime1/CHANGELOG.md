# Hanime1 Changelog

> 程序级长期技术记忆。事实优先级：用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划。

## 当前基线
- Legacy `1.2.1`：仅保留历史。
- 当前 Test：`2.0.0-test.29` / Build `20029`。
- Test Shell：`apps/video/hanime1/hanime1_remote_test_v4_b20029.txt` / Shell v4 / 规则 version `2026082234`。
- Test Bootstrap：`apps/video/hanime1/bootstrap_test_v4_b20029.js` / `minBuild=20029` / `defaultRelease=20029`。
- Remote Manager：`2.0.1`。
- Stable 尚未晋级。
- **Test27、Test28 均已隔离，不允许作为当前 UI recovery base。**

## 2026-08-22 18:07：Test28 启动 ReferenceError
用户从云端仓库覆盖 Test28 后，实机启动仍直接报错：

```text
Hanime1解析失败！
ReferenceError: “HanimeUI11” 未定义。
来源：eval code#1(eval)
行数：2
```

### 根因
Test28 已对新增 JS 做过 `node --check`，所以这次不是语法错误，而是**顶层运行依赖错误**。

`apps/video/hanime1/releases/2.0.0-test.28/ui28.js` 最后一行写成：

```js
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9,HanimeUI11,HanimeLayout12);
```

但当前真实恢复链从未定义 `HanimeUI11`。Test11 的 `ui_common.js` 实际是：

```js
(function(U){ ... U.epLabel=epLabel; })(HanimeUI10);
```

即 Test11 只是继续增强 `HanimeUI10`，并没有创建 `HanimeUI11`。`node --check` 只能证明源码可解析，无法发现 IIFE 参数求值时的未定义全局，因此 Test28 语法门禁通过、实机仍在模块加载阶段 ReferenceError。

### Test29 修复
- 冻结 Test28，不原地覆盖 immutable release。
- Test29 **不加载 Test27/Test28 UI 模块**。
- Recovery 重新从最后可启动的 Test26 开始。
- 加载新模块前显式预检：`HanimeCore / HanimeProvider / HanimePages / HanimeUI9 / HanimeLayout12`。
- `ui29.js` 不再依赖 `HanimeUI11`，也不再为一个很小的 `epLabel()` 跨版本依赖 UI helper；选集标签函数直接局部实现。
- 仅复用 Test28 已单独确认安全的 `replies28.js / creator28.js`；UI 和 Settings 使用 Test29 新模块。
- 新增 `tools/js_runtime_smoke_guard.py`，与 `tools/js_syntax_guard.py` 组成 Parse Gate + Load Gate 双门禁。
- 专项事故：`docs/INCIDENT_JS_RUNTIME_GLOBAL_DEPENDENCY_20260822.md`。

Test29 发布前已实际执行：
- `ui29.js / settings29.js / recovery_loader.js / bootstrap_test_v4_b20029.js` → `node --check` 通过。
- `ui29.js / settings29.js` → 用真实允许的运行全局做顶层烟雾执行，通过；不再存在 `HanimeUI11` 依赖。
- Release 增加 `runtimeContract.requiredGlobals` 和 `forbiddenGlobals:["HanimeUI11"]`。

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
- Test28 不 require Test27，而是从 Test26 恢复。
- 新增 `tools/js_syntax_guard.py`，以后新增/修改 JS 在切 Test/Candidate 元数据前必须跑语法门禁。
- 专项事故：`docs/INCIDENT_JS_SYNTAX_RELEASE_20260822.md`。

## Test29 当前功能目标
### 回复链
继续使用 Test28 的独立安全回复模块：

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

目标：恢复 Test26 实机出现的“查看 X 条回复打不开”，同时保留减少重复请求的性能方向。

### 作者目录 / 作者主页
Test26 自写第二套作者 HTML parser 实机不可用。Test28/29 统一复用现有：

```text
P.search({query, type:'artist', page})
→ r.artists[]
```

- 有关键词：走官网作者搜索。
- 无关键词：展示最近从视频详情访问过的作者。
- 作者主页继续用 canonical query 搜索作者作品。
- 上传者主页继续委托 Test26/Test17 已验证链，作者与上传账号保持两个实体。

### 首页 / 详情 UI
Test29 继续实现用户明确要求的可感知 UI 升级：
- 首页：推荐 / 片库 / 漫画 / 我的 / 设置 → `icon_5_no_crop` + 仓库静态 SVG。
- 当前栏目使用绿色 active SVG，不再叠黑色 `●`。
- 视频详情：播放 / 评论 / 加入片单 / 下载原片 → `icon_4` + 静态 SVG。
- 图标固定在 `apps/video/hanime1/assets/icons/`，不依赖 data-URI、第三方 favicon/CDN。

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
- **Test27：启动期 JavaScript SyntaxError，永久隔离。**
- **Test28：顶层 `HanimeUI11` ReferenceError，永久隔离其 UI 模块。**
- 禁止把 GitHub 新 Release 已发布当作手机已运行新 Release。
- 禁止 Cloud Repo 广告 Build 高于实际安装 Shell/Bootstrap 基线。
- 禁止新 JS 模块未做语法检查就切 Test/Candidate 元数据。
- **禁止把“文件版本号/文件名”推断成运行全局对象名；必须读取真实导出/增强对象。**
- **`node --check` 通过不等于模块可加载；新增/修改远程 JS 还必须做顶层 Load Smoke。**

## 当前恢复链
```text
hanime1_remote_test_v4_b20029.txt
→ bootstrap_test_v4_b20029.js?v=20029
→ Remote Manager v2.0.1
→ Test29 release
→ Test29 recovery_loader
→ Test26 recovery_loader
→ Test25 → Test24 → Test23 → Test17/Test12 稳定链
→ runtime global preflight
→ replies28.js（安全复用）
→ creator28.js（安全复用）
→ ui29.js
→ settings29.js
```

**注意：Test27 不进入运行链；Test28 的 `ui28.js` 也不进入运行链。**

## Test29 实机验收
- [ ] 从“我的规则仓库”重新导入 Test29 后首页可正常打开，无 SyntaxError / ReferenceError。
- [ ] 设置显示 `2.0.0-test.29 · Build 20029 · Shell v4`。
- [ ] 首页五个导航显示真实 SVG 图标，当前项绿色。
- [ ] 详情四个主操作显示图标。
- [ ] 作者/上传者头像不退化。
- [ ] 作者目录能打开；输入作者名有结果；作者主页作品列表可用。
- [ ] 主评论正文和头像正常。
- [ ] “查看 16 条回复 / 5 条回复”等楼中楼可打开。
- [ ] 二次打开同线程更快，首次空解析不会被缓存。
- [ ] 播放、登录、选集、片库、漫画无回归。

## 后续路线
1. Test29 先完成实机闭环，任何启动/回复/作者问题先修，不继续堆功能。
2. 通过后进入评论社区增强：点赞数、点赞/点踩状态与动作、举报。
3. 再做作者订阅状态/订阅动作与账号中心联动。
4. 主要功能稳定后做 Consolidated Candidate，压缩 Test15～29 历史增量链。

---
## 版本记录
### 2.0.0-test.29 / Build 20029 / 2026-08-22
- 修复 Test28 `HanimeUI11` 未定义导致的启动 ReferenceError。
- 从 Test26 重建并增加运行全局 preflight；不加载 Test27/Test28 UI 模块。
- `ui29.js` 内置 `epLabel()`，不再猜测跨版本 UI helper 全局名。
- 保留更多回复、作者目录与图标 UI 目标。
- 新增 `js_runtime_smoke_guard.py` 与 runtimeContract。
- 新 Shell/Bootstrap/minBuild/defaultRelease 锁定 Build20029。

### 2.0.0-test.28 / Build 20028 / 2026-08-22
- 从 Test26 直接重建并通过语法检查，但 `ui28.js` 顶层错误引用不存在的 `HanimeUI11`，实机启动 ReferenceError；已隔离。

### 2.0.0-test.27 / Build 20027 / 2026-08-22
- 计划修复更多回复、作者目录并图标化 UI，但发布模块存在 JavaScript 语法错误，实机启动失败；已隔离。

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
