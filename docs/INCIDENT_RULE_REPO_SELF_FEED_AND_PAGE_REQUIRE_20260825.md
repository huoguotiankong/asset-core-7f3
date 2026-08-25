# 规则仓测试版自更新再次失效与错误页面模块 require（2026-08-25）

## 用户实机现象

用户在 RC29 / Build419 实机确认：

1. 规则仓测试版再次看不到已经发布的下一 Test（RC30）。
2. 底部“更新中心 → 同步程序目录”弹出：
   `轻同步失败：Module "hiker://page/ruleRepoCore" cannot be found.`
3. 规则仓自身详情仍显示当前安装/当前运行 RC29，无法通过该同步动作拿到下一 Test。

## 直接根因 A：把页面路由当作 require 模块

RC28 `self_update_patch.js` 的 `workspaceStaticAction('sync')` 中存在：

```js
var r=$.require('hiker://page/ruleRepoCore'),x=r.lightSync();
```

`hiker://page/ruleRepoCore` 是页面路由，不是可由 `$.require()` 加载的本地 JS 模块。在当前海阔环境中会直接抛 `Module ... cannot be found`，并且在真正调用 `lightSync()` 之前中断。

固定规则：
- `hiker://page/...` 只能作为页面导航地址，不得作为 `require()` / `$.require()` 的模块路径。
- 运行时模块必须使用已验证的 `hiker://files/...` + `getPath(...)` + 原生 `require(file://)` 链。

## 直接根因 B：自更新 feed 仍以 @main 内容为真相

RC28 的 self feed 虽然对 Raw / GitHub Raw / jsDelivr `@main` 加了时间戳和 no-cache，但三个入口本质仍在请求可变分支内容。边缘缓存、重定向缓存或分支解析延迟都可能导致旧 Test 元数据继续被读取。

RC28→RC29 曾实机通过，说明该方案“有时可用”，但不能作为正式长期自更新控制面。

## RC31 修复

### 1. HEAD-Pinned Self Feed

检查测试仓自身版本时：

```text
GitHub Branch API / Commits API
→ 得到 main 当前 40 位 commit SHA
→ 使用该 SHA 生成 immutable Raw / GitHub Raw / jsDelivr channels.json URL
→ 三镜像读取并按 Test Build 判定
→ 保存为 self_channels_v2.json
```

因此版本真相来自 GitHub 当前 HEAD，而不是某个 `@main` 边缘节点返回的旧正文。

### 2. 轻同步本地 Bridge

“同步程序目录”改成：

```text
本地 shell_bridge_v9.js
→ require(getPath(...))
→ RuleRepoBridge.load()
→ 当前本地 Runtime.lightSync()
```

不再 `require(hiker://page/ruleRepoCore)`。

### 3. 保留 RC30 Import Fast Path

RC31 继续加载 RC30 `import_fast_path_patch.js` 和 immutable `importRef` 目录，不回退导入提速方案。

## 回归要求

1. 当前 RC29 必须通过自身详情“检查版本”发现 RC31 / Build421。
2. RC31 覆盖安装后重启，应显示 RC31 当前运行。
3. RC31 点击“同步程序目录”不得再出现 `hiker://page/ruleRepoCore` 模块错误。
4. 发布下一 Test 时，RC31 必须通过 HEAD-Pinned feed 自行发现下一 Build。
5. Stable 3.5.5 在 1~4 全通过前继续冻结。
