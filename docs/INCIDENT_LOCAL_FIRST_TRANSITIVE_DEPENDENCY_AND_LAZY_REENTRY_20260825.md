# Incident：Local-First 只迁顶层文件与点击回调远程重入

日期：2026-08-25  
来源：JavDB v3 `3.9.44-test.1` + JavBus `2.0.1-test.1` Local-First 迁移审计  
适用：所有海阔远程模块迁移到本地 Runtime / `require(file://)` 的程序

## 1. 症状
表面上已经把 Shell/Runtime 下载到本地，正常首页也可以从本地启动，但以下场景仍可能访问 GitHub/CDN：

- Runtime 内部首次执行时继续 `fetch()` Core/Patch/Custom/SDK。
- 某个 SDK 的 Manager 再读取 `channels.json` 后拉远程实现。
- `lazyRule` / `select` / 长按 / 二级页点击回调在真正点击时重新 `fetch(manager)` 或重新 eval 旧 Core。
- 静态图标、模板或桥接代码仍使用私人 Raw URL。
- `domains.json` / Provider channels / feature flag 等可变配置在普通启动或定时过期后自动回仓库刷新，使控制面仍成为运行依赖。

因此“顶层 Runtime 已本地”不等于“程序代码与控制面已 Local-First”。

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

如果只保存表层 Runtime，Core/Custom/Patch、“更多播放”和用户最终点击 Provider 都仍可能重新访问远程代码源。这是典型的**传递依赖漏本地化**。

## 3. 固定审计方法
Local-First 迁移前必须画完整代码执行闭包，而不是只看 release.json 的第一层：

```text
Shell
→ Entry / Bootstrap
→ Runtime
→ Core / Patch / Provider / Adapter
→ SDK / Manager / channels
→ mutable control plane（domains / flags / provider config）
→ lazyRule / select / longClick / secondary-page callback
→ callback 内再次 require/eval/fetch 的代码
→ 静态运行资产
```

对所有可执行源和运行配置执行关键词审计：

```text
fetch(
request(
require(http
$.require(http
eval(fetch
channels.json
manager.js
domains.json
raw.githubusercontent.com
cdn.jsdelivr.net
github.com/.../raw
```

其中业务站点 API/图片/媒体 URL 要和“程序代码/控制面 URL”区分；Local-First 禁止的是正常运行继续从私人代码仓取可执行代码或强制控制面，不是让业务数据离线。

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
2. 本地 package/meta 完整后，正常二次启动不再访问私人代码仓获取程序代码或强制控制面。
3. 页面主入口、二级页和关键点击回调都从本地当前 Runtime 重入。
4. 传递 SDK/Manager/Channel 依赖已展开或固化。
5. 影响运行决策的 domains/provider/config 等控制面有本地 last-known-good。
6. 本地包完整性有 build/sourceRef/schema 校验。
7. 重建失败不能破坏已验证 Stable。
8. 用户实机完成首次安装 + 第二次启动 + 关键 action 回归后才可晋级 Stable。

## 7. 禁用做法
- 只把表层 Runtime 写入本地就宣布完成。
- 只 grep Shell，不审计 Runtime/SDK/callback/control-plane。
- 用运行时 `getItem` 缓存远程代码冒充真正本地 package。
- Local-First 页面仍把 Shared Manager/channels 作为强制在线控制面。
- 用短 TTL 让 `domains.json`、Provider 配置等在普通启动阶段自动回私人仓刷新。
- 为“代码复用”把 direct eval 链拆进 helper，未做目标 JSEngine 实机验证。
- Test 未实机通过就批量迁移 Stable。

## 8. JavBus 补充：可变配置也是控制面依赖
JavBus Stable2.0.0 已经具备成熟的多域自动切换，但 Stable Patch 会在远程域名配置超过 6 小时后自动读取 GitHub `domains.json`。这不会下载新的业务 JS，却仍然意味着正常运行行为依赖私人仓控制面。

Local-First 的推荐改造是：

```text
首次安装 / 用户主动同步
→ 下载 versioned / validated config
→ 写入本地 domains.json

普通启动
→ 本地 domains.json
→ last-known-good active domain
→ 静态兜底
→ 业务健康探测 / failover
```

远程配置刷新应改成**用户主动同步或明确的更新流程**，而不是普通启动时因为 TTL 到期自动访问仓库。

适用范围不仅是域名：
- Provider channels。
- Feature flags。
- Parser route table。
- 镜像列表。
- 业务模块选择表。
- 任何能改变程序执行路径的私人仓配置。

判断标准：**如果这个远程文件不可达会改变正常启动/点击是否成功，它就是 Local-First 执行闭包的一部分。**
