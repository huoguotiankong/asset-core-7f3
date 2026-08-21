# 我的规则仓库 2026-08-20 UI 运行时契约事故

## 现象

测试版 Recovery Shell 重新导入后，首页启动报错：

```text
TypeError: 找不到函数 pushSpacer
```

## 根因

RC1 的共享 UI 模块曾定义 `pushSpacer`、`pushEmpty`、`formatTime` 等基础 API。RC6 UI/UX 重构时，新 `ui.js` 只保留卡片渲染相关函数，遗漏了这些基础函数；但 RC6/RC7/RC8 的 Home、Category、Search、Detail、Settings 等页面仍继续调用这些 API。

之前部分实机没有立即暴露，是因为旧运行环境/旧全局对象可能残留了历史版本方法。Fresh install / Recovery Shell 会重新构造 `HikerRuleRepo`，不再具备旧方法，于是稳定复现崩溃。

## 永久规则

共享模块升级必须维护明确 API 契约：

1. 新模块不能默认继承旧版本运行时残留。
2. 替换共享 UI/Core 模块前，必须列出被其它模块依赖的公共函数。
3. 删除/改名公共 API 必须同时升级全部调用方，或提供兼容层。
4. Candidate 必须覆盖 Fresh install / 清缓存启动，不只验证“从上一版热升级”。
5. Release 在真正进入页面前执行运行时契约断言；缺函数应在版本加载阶段直接失败并给出明确缺失列表。

## RC9 修复

- 新增 `ui_foundation.js`，恢复 `pushSpacer`、`pushEmpty`、`formatTime` 等公共 UI 基础 API。
- 新增 `runtime_contract.js`，在 Candidate Patch 阶段断言首页、分类、搜索、详情、设置、UI 基础、同步和导入等关键方法均存在。
- Test/Candidate 升级至 3.5.0-rc9 / build 359。
- 新增 Test Recovery Shell 1.0.8，Fresh install 默认直接加载 RC9。
- Stable Core 继续保持 3.4.3，不受本次测试版修复影响。

这类问题归类为 P0/P1 模块契约问题，后续应纳入共享模块发布前硬检查。
