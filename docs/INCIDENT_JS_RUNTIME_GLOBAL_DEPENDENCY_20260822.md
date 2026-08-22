# Incident: JavaScript 语法通过但运行全局依赖不存在（2026-08-22）

## 事故
Hanime1 Test28 在发布前已经对新增 JavaScript 执行 `node --check`，但用户实机启动仍直接失败：

```text
ReferenceError: “HanimeUI11” 未定义。
来源：eval code#1(eval)
行数：2
```

## 根因
`apps/video/hanime1/releases/2.0.0-test.28/ui28.js` 顶层 IIFE 结尾写成：

```js
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9,HanimeUI11,HanimeLayout12);
```

但当前真实恢复链并不存在 `HanimeUI11` 这个全局对象。Test11 的 `ui_common.js` 实际是：

```js
(function(U){ ... U.epLabel=epLabel; })(HanimeUI10);
```

即 Test11 只是继续增强 `HanimeUI10`，并没有创建 `HanimeUI11`。

`node --check` 只能证明源码可解析，不能证明模块加载时引用的全局对象真实存在，所以 Test28 的语法门禁会通过，但海阔执行模块时在 IIFE 参数求值阶段直接 ReferenceError。

## 修复
Test29：

1. 冻结 Test28，不原地覆盖。
2. 不加载 Test27/Test28 UI 模块。
3. 从最后可启动的 Test26 recovery 重建。
4. Recovery 在加载新业务模块前检查：`HanimeCore / HanimeProvider / HanimePages / HanimeUI9 / HanimeLayout12`。
5. `ui29.js` 不再依赖 `HanimeUI11` 或 `HanimeUI10`；需要的 `epLabel()` 直接局部实现，缩小跨版本 UI 全局依赖。
6. 新增 `tools/js_runtime_smoke_guard.py`，用于补充 `tools/js_syntax_guard.py`。

## 跨程序硬规则
远程 JavaScript 发布至少需要两层门禁：

```text
1. Parse Gate
   node --check / js_syntax_guard.py

2. Load Gate
   顶层运行烟雾测试 / js_runtime_smoke_guard.py
   → 真实声明本次模块允许依赖的运行全局
   → 捕获 ReferenceError / 顶层初始化错误
```

尤其是以下写法必须检查真实符号来源：

```js
(function(A,B,C){ ... })(SomeCore,SomeUI12,SomeAdapter3);
```

不能因为文件名叫 `ui_11.js`、版本叫 Test11，就推测存在 `SomeUI11`。必须读取实际模块尾部赋值/导出对象。

## 发布纪律
- 语法通过 != 可加载。
- 新模块不得凭版本号猜全局对象名。
- 依赖旧模块 helper 时，优先局部实现很小的纯函数，或通过稳定公开对象访问，避免跨增量版本的幽灵全局依赖。
- Test/Candidate 切元数据前，至少执行一次“只加载模块、不触发业务网络”的顶层烟雾测试。
- 发现活动版本启动期 ReferenceError：冻结坏 Release，新 build 从最后可启动基线重建，不能继续把坏模块留在 recovery 链里。
