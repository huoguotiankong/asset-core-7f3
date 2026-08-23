# 单远程 Runtime 空返回导致命名空间未定义事故（2026-08-23）

## 1. 事故对象

JavDB v3 Stable 3.9.42 / Build 2026082301。

实机此前长期可打开，2026-08-23 晚间突然在首页启动报：

```text
ReferenceError: JDBCLOUD 未定义
```

## 2. 真实根因

Stable Shell 的入口为等价结构：

```javascript
eval(fetch('https://raw.githubusercontent.com/.../runtime.js'));
JDBCLOUD.core(...);
```

仓库回读确认 `runtime.js` 文件仍存在且本身能定义 `var JDBCLOUD=...`，因此不是业务文件删除，也不是 JavDB API 故障。

真正故障是 Shell 把 `raw.githubusercontent.com` 作为单点启动传输，而且没有校验 `fetch()` 返回内容。当设备网络对 Raw 临时失败或返回空字符串时：

```text
fetch(runtime) -> ''
eval('') -> 不抛异常
JDBCLOUD.core(...) -> ReferenceError: JDBCLOUD 未定义
```

因此最终异常位置会误导开发者去查命名空间/业务代码，而实际失败发生在更早的远程传输阶段。

## 3. 禁止做法

```javascript
eval(fetch(singleRemoteRuntime));
Namespace.entry();
```

尤其禁止：

- 单一 Raw/CDN 作为唯一入口；
- `fetch()` 非空/合法性不校验；
- 空响应也直接 `eval()`；
- 没有上一份有效 Runtime 缓存；
- 只在业务层 catch `Namespace undefined`，不记录实际传输阶段。

## 4. 推荐恢复架构

```text
完整 Shell
  -> immutable Bootstrap（优先稳定 CDN/固定提交）
  -> 已验证本地 Runtime cache
  -> jsDelivr
  -> GitHub Web Raw
  -> raw.githubusercontent.com
  -> 明确 TRANSPORT/RUNTIME_LOAD 错误

Runtime
  -> 已验证模块 cache
  -> 主镜像
  -> 备用镜像
  -> stale cache
  -> 明确模块错误
```

远程代码必须满足最小 marker/schema 校验后才允许写入缓存，例如 Runtime 至少确认目标导出标记存在：

```text
var JDBCLOUD=
```

HTML 限流页、登录页、空串、502 文本不能因为“非 null”就被缓存。

## 5. eval 作用域要求

本事故与 JavDB 3.9.42-test.2 的 `JDB 未定义` 事故不同，但恢复层仍必须遵守同一条作用域规则：

```text
eval(Runtime) -> JDBCLOUD.core/custom()
```

应保持在同一个 Bootstrap 方法作用域；Runtime 内：

```text
eval(Core) -> eval(Patch) -> JDB.entry()
```

也保持同一函数作用域。不要为了抽 helper 再次制造 direct-eval 局部符号生命周期问题。

## 6. 本次修复

新建 JavDB `3.9.43-test.3 / Build 2026082304`，业务/API/UI 完整继承 Stable 3.9.42，只修改远程传输：

- Shell 使用固定提交的 jsDelivr Bootstrap；
- Bootstrap 对 Runtime 使用校验后的本地缓存 + jsDelivr + GitHub Web Raw + GitHub Raw；
- Runtime 对 Core/Patch/Custom 分片使用同类多线路与缓存；
- 仅校验通过的代码进入缓存；
- Stable 3.9.42 文件不原地覆盖；
- Test1/Test2 为实机前淘汰草稿，用户只验证 Test3。

## 7. 发布门禁

远程 Shell/Bootstrap/Runtime 发布前必须检查：

- [ ] 最外层入口是否仍有单域硬依赖；
- [ ] 空字符串是否会被当作成功；
- [ ] HTML/错误页是否可能进入 eval/cache；
- [ ] 是否存在 last-known-good Runtime cache；
- [ ] Bootstrap/Runtime/业务导出作用域 smoke test；
- [ ] 新 build / 新 Shell / 新 Runtime / 新 cache key；
- [ ] Test 实机冷启动、二次启动、二级页独立进入；
- [ ] 通过后再新建 Stable，禁止原地覆盖旧 Stable。
