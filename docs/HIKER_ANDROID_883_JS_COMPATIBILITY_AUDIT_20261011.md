# 海阔视界 8.83：JS 参数合同与模块加载风险专项审计（2026-10-11）

> **性质：对用户提供的 8.83 APK 的 DEX 注解/方法常量与 APK 内置 `assets/Hikerurl.js` 源码开展的只读静态审计和隔离模拟，不是 Android 真机运行结论。** 原包未修改、未重签，现有小程序 Stable/Test 未改动。
>
> 样本 SHA-256：`a8f5be99018069a6081d9631b67e99c60970b361dc13b16f19f07498dda7348c`。前置审计：
> - `docs/HIKER_ANDROID_883_APK_AUDIT_20261011.md`
> - `docs/HIKER_ANDROID_883_METHOD_AUDIT_20261011.md`
> - `docs/HIKER_ANDROID_883_MEDIA_AND_COMPAT_AUDIT_20261011.md`

## 1. DEX @Parameter 元数据核查（本轮新增）

从实际 DEX `annotations_directory_item` → `annotation_set_ref_list` → `encoded_annotation` 解析 `JSEngine` 方法级 `@JSAnnotation` 与参数级 `@Parameter`：

| 指标 | 数量 |
| --- | ---: |
| `@JSAnnotation` 方法 | 160 |
| Java 方法总参数位 | 306 |
| 带 `@Parameter` 的参数位 | 295 |
| 有明确 `defaultValue` / `defaultInt` 的参数位 | 16 |
| 显式 JS alias | 17 |
| 唯一导出标识（方法名 + alias） | 176 |
| 重复 alias | `refresh` → `refreshPage` 和 `setPageReverse` |

另有四个方法 `buildUrl`、`post`、`postPC`、`postRequest` 共 11 个参数位没有 `@Parameter` 注解。不是解析失败，方法注解存在但参数注解列表为空。

### 1.1 内部注入参数：不能暴露为用户必填 JS 参数

8.83 `JSEngine.getFunctionStr()` 的 DEX 方法体含以下注入字符串与键；与旧公开源码的映射存在差异，以下优先采用 **8.83 APK**：

| 参数注解键 | 实际 DEX 包装常量 | 注解涉及方法数 |
| --- | --- | ---: |
| `callbackKey` | `CALLBACK_KEY` | 9 |
| `ruleKey` | `MY_RULE` | 17 |
| `urlKey` | `MY_URL`（fallback 逻辑） | 4 |
| `typeKey` | `MY_TYPE` | 4 |
| `dirKey` | `MY_DIR`（fallback 逻辑） | 1 |
| `evalKey` | `eval` | 6 |
| `ruleTitleKey` | `MY_TICKET` | 27 |

例如 `JSEngine.require(c, options, v, ruleTitleKey, evalKey)` 的后两参是宿主注入，`v` 参数在注解里有 `defaultInt=0`。`JSEngine.setResult(o, callbackKey, ruleKey, typeKey)` 后三参也主要依赖宿主上下文。不应把 Java 签名长度直接解释为规则作者必须显式传入的参数数。

8.83 DEX `getFunctionStr` 除注入字符串以外，明确存在 `!= null ? param`、` : `、返回类型变换、`java.io.InputStream` 特例；公开旧源码的 `ruleStrKey`、`param || defaultInt` 等写法不应无条件认定是 8.83 的真实逻辑。默认参数具体分支仍可进一步复核指令或以原版进行无害运行测试。

### 1.2 16 个已确认默认参数注解（来自 8.83）

- `batchExecute` 的 `success = 0`。
- `cacheM3u8` 的 `fileName = "a"`。
- `decodeStr`、`encodeStr` 的编码默认值 `UTF-8`。
- `deleteCache` 的 `c = "-1"`。
- `fetchCache`、`require`、`requireCache` 的 `v = 0`。
- `ipping` 的 `h = 3000`。
- `readFile`、`saveFile`、`writeFile` 的 `mode = 1`。
- `registerTask` 的 `time = 10000`。
- `setSearchMode` 的 `mode = 0`。
- `shareDirectory` 的 `p2 = ""`。
- `xpath` 的 `type = "string"`。

**说明：** 这些是编码在 DEX 注解中的配置值，不等于已在原版实机确认每个默认值的生效条件。

## 2. Hikerurl.js 内部兼容风险（静态 + 隔离模拟）

样本内 `assets/Hikerurl.js` 大小 18,370 bytes。下面是**样本中真实的实现片段特征**，对 JS 进行了最小语法修正的隔离环境测试，并不是对原 APK 的修改。

### 风险 A：参数重复词法声明，阻碍向标准 JS 引擎直接迁移

`$.require.eval` 内的函数形参 `id` 与内部的 `let id = id || md5(code);` 重复；Node.js v22 `node --check` 对**原始提取的 JS** 报：

```text
SyntaxError: Identifier 'id' has already been declared
```

局部只改成 `id = id || md5(code);` 后，整个文件通过 `node --check`。这证明**迁移到标准 JS 引擎时存在语法障碍**；**不证明原版 Rhino 因此无法执行**，后者要单独真机核查。

### 风险 B：`$.require` 模块加载前后参数上下文可能失配

`Module.prototype.load()` 使用 `let $temp = [$.exports, $.inputParam]`，期间修改 `$.importParam`，结束时恢复 `$.importParam = $temp[1]`。保存/恢复属性名不一致。在模拟环境中：

- 外层模块 `$.importParam = 101`；嵌套加载子模块时子模块正确读取 `102`；
- 回到外层模块后 `$.importParam` 未恢复为 `101`。
- **风险**：嵌套依赖、预处理模块之间互相污染状态；目前仅隔离模拟，未真机复现。

### 风险 C：异常分支缺少 finally，可能污染后续环境

`Module.prototype.load()` 改写 `$.exports / $.importParam` 并调用模块的 `new Function(...)`，没有 `try/finally` 恢复。隔离模拟中模块主动抛错后，`$.importParam` 仍为出错模块传入的 `73`。

- **风险**：抓住单次模块错误继续运行，可能留下与后续规则不一致的上下文。
- 修复模型：对外部模拟宿主的模块装载优先采用 `try/finally` 保存并恢复正确属性；不要在原版 APK 内直接批量替换。

### 风险 D：网络远程 JS 的 `isJsCode` 启发式误判

`Hikerurl.js` 的 `isJsCode(code)` 通过拒绝部分 HTML/XML 标记、以及搜索 `var / let / const / function / eval / call / =>` 关键词识别；简单有效但不完整。

隔离模拟中以自定义网络桩返回合法的 `module.exports = { ok: true };`，首次加载被拒绝并抛出“failed to get module ... from the network!”。本例不涉及真实网络请求。**不能据此声称所有线上 CommonJS 模块失败**；其他加载分支（已缓存、`hiker://page` 等）条件不同。

### 风险 E：模块内存缓存键只使用 resolve 后的路径（静态）

`$.require` 在 `Module._cache` 中以 `require.resolve(modulePath)` 作为 key；方法参数还可以包括 `importParam / headers / time`，但已命中 cache 时直接返回之前的 `module.exports`。

- 隔离模拟：同一 `id` 的 `$.require.eval` 第一次使用 42、第二次传入 99，缓存继续返回第一次的结果。
- 这可能是合理的 CommonJS 缓存行为，**不是自动判定的 Bug**；但对远程版本更新和状态隔离必须有明确刷新/缓存生命周期策略。

## 3. 对新宿主的精确兼容建议

1. **HostContext 契约**：分别显式模拟 `MY_RULE/MY_URL/MY_TYPE/MY_DIR/MY_TICKET/CALLBACK_KEY/eval`，且按路由/页面/回调生命周期隔离。
2. **函数包装生成**：根据 `@JSAnnotation` 和 `@Parameter` 元数据还原默认值、别名与返回类型转换，确保 `InputStream` 等特殊返回不误当作字符串。
3. **JS DSL 模块系统**：`$.require`、`$.importRequire`、`$.require.eval`、`preRule` 的规则上下文、内存/磁盘缓存、异常恢复、模块跨页生命周期都要单独验证。
4. **差异测试**：同一测试用例分别在原版 8.83 Rhino、经最小语法修正的标准 JS 隔离容器、未来 Android Test 宿主运行。将“设计上的修正”与“兼容原版行为”分开，不因模拟行为和主流 JS 标准不同就直接更改所有规则。
5. **安全边界**：规则脚本对 Java 类、网络、文件和下载操作的访问能力应是显式受控的宿主权限契约，不直接开放任意 Java 反射或系统权限。不能因兼容需求取消沙箱。

## 4. 待验证任务与证据级别

| 待办 | 证据级别 | 验收方式 |
| --- | --- | --- |
| 原版 Rhino 是否允许重复形参 `let id` | 未实机确认 | Android 8.83 非侵入式测试规则（无需秘密账户或在线服务） |
| `refresh` 别名最终绑定的函数 | 仅静态双 alias | 真机静态打印函数/简单无害调用 |
| 原版 `$.require` 嵌套 `importParam` 恢复 | 隔离 VM 模拟 | 真机嵌套模块测试和状态检查 |
| 原版 `$.require.eval` 异常后作用域恢复 | 隔离 VM 模拟 | 仅临时测试规则，捕获异常后检查变量 |
| 远程模块内容检测误判 | 隔离 VM 模拟 | 自控/离线提供内容，不请求外部业务站点 |
| `@Parameter` 默认值的 falsy/null 行为 | DEX 注解 + 部分模板常量 | 原版 Rule Test + 精确 DEX 分支确认 |
| 不同 `require` 缓存寿命、版本与刷新 | 静态 | 版本升级/跨页/重启的回归测试 |

> 本轮只分析、归档；未安装增强版、未测得性能提升，不得宣称已修复任何现有问题。
