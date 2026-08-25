# Incident：Local-First 只迁顶层文件与点击回调远程重入

日期：2026-08-25  
来源：JavDB v3 `3.9.44-test.1` Local-First 迁移审计  
适用：所有海阔远程模块迁移到本地 Runtime / `require(file://)` 的程序

## 1. 症状
表面上已经把 Shell/Runtime 下载到本地，正常首页也可以从本地启动，但以下场景仍可能访问 GitHub/CDN：

- Runtime 内部首次执行时继续 `fetch()` Core/Patch/Custom/SDK。
- 某个 SDK 的 Manager 再读取 `channels.json` 后拉远程实现。
- `lazyRule` / `select` / 长按 / 二级页点击回调在真正点击时重新 `fetch(manager)` 或重新 eval 旧 Core。
- 静态图标、模板或桥接代码仍使用私人 Raw URL。

因此“顶层 Runtime 已本地”不等于“程序代码已 Local-First”。

## 2. JavDB 实例
Stable3.9.42 的表层 Runtime 实际还依赖：

```text
7 Core fragments
+ 9 Custom fragments
+ 6 Stable patches
+ Shared JAV Playback Manager
+ channels.json
+ SDK test.4
+ SDK test.2 base
+ Provider click-time Manager re-entry
+ 123AV repository icon
```

如果只保存 `cloud/javdb/v3.9.42/runtime.js`：
- Core/Custom/Patch 仍会联网。
- “更多播放”仍会联网加载 Playback Manager。
- 用户选择 Provider 后，SDK lazyRule/select 还会再次联网加载 Manager。

这是典型的**传递依赖漏本地化**。

## 3. 固定审计方法
Local-First 迁移前必须画完整代码执行闭包，而不是只看 release.json 的第一层：

```text
Shell
→ Entry / Bootstrap
→ Runtime
→ Core / Patch / Provider / Adapter
→ SDK / Manager / channels
→ lazyRule / select / longClick / secondary-page callback
→ callback 内再次 require/eval/fetch 的代码
→ 静态运行资产
```

对所有可执行源执行关键词审计：

```text
fetch(
request(
require(http
$.require(http
eval(fetch
channels.json
manager.js
raw.githubusercontent.com
cdn.jsdelivr.net
github.com/.../raw
```

其中业务站点 API/图片/媒体 URL 要和“程序代码 URL”区分；Local-First 禁止的是正常运行继续从私人代码仓取可执行代码，不是让业务数据离线。

## 4. 点击时重入必须单独验收
页面首次渲染正确并不能证明点击动作使用当前 Runtime。

必须对关键 action 做 smoke test：

```text
播放
收藏 / 长按收藏
评论回复
登录
Provider 选择
清晰度/线路 select
重建/诊断
```

若回调需要重新进入当前业务对象，优先：

```js
$.require('<current local module>').method()
```

或通过当前 Local Entry 的稳定导出重入。

禁止：

```js
eval(fetch(oldManager));
eval(fetch(oldCore));
```

也禁止只恢复基础 Core 后假设当前 Release 的后置 Patch 仍然存在。

## 5. Direct eval 作用域不能被“抽 helper”破坏
JavDB 历史曾发生：

```text
core(): eval(Core) → eval(Patch) → JDB...
```

被重构成：

```text
loadCore(): eval(Core)
core(): loadCore() → eval(Patch) → JDB...
```

随后海阔实机报 `JDB 未定义`。

原因：direct eval 创建的局部 `var JDB` 只存在于当前函数作用域。

所以 Local-First bundle 合并时如果业务依赖 direct-eval 局部导出，必须保持：

```text
同一个 function scope：
eval(Core)
→ eval(Patches)
→ call
```

`node --check` 只能检查语法，不能替代目标 JSEngine 的作用域 smoke test。

## 6. 完成定义
Local-First 迁移至少满足：

1. 首次安装/主动升级可以访问 immutable 代码源。
2. 本地 package/meta 完整后，正常二次启动不再访问私人代码仓。
3. 页面主入口、二级页和关键点击回调都从本地当前 Runtime 重入。
4. 传递 SDK/Manager/Channel 依赖已展开或固化。
5. 本地包完整性有 build/sourceRef/schema 校验。
6. 重建失败不能破坏已验证 Stable。
7. 用户实机完成首次安装 + 第二次启动 + 关键 action 回归后才可晋级 Stable。

## 7. 禁用做法
- 只把表层 Runtime 写入本地就宣布完成。
- 只 grep Shell，不审计 Runtime/SDK/callback。
- 用运行时 `getItem` 缓存远程代码冒充真正本地 package。
- Local-First 页面仍把 Shared Manager/channels 作为强制在线控制面。
- 为“代码复用”把 direct eval 链拆进 helper，未做目标 JSEngine 实机验证。
- Test 未实机通过就批量迁移 Stable。
