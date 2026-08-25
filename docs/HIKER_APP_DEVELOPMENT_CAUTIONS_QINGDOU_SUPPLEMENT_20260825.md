# HIKER_APP_DEVELOPMENT_CAUTIONS 补充：青豆样本暴露的高概率坑

日期：2026-08-25  
来源：`青豆.hk小程序(1).zip` 源码复盘  
完整证据：`docs/HIKER_SAMPLE_QINGDOU_REVIEW_20260825.md`

> 这些条目来自成熟样本中“功能很强，但长期自研不能原样复制”的实现。后续新开发/升版按 P1 防回归项检查。

## QD-01. 可导入配置禁止直接成为任意 JS 执行入口

高风险链：

```text
用户输入/口令/粘贴
→ 解码
→ 保存 JS 字符串
→ eval
```

风险：配置导入等价于远程代码执行，可访问网络、文件、Cookie、运行时全局能力；配置损坏也会直接击穿页面。

固定规则：

- 默认配置使用结构化 JSON/schema。
- 导入先验证 `kind/schema/version/required fields`，再预览，再保存为未启用状态。
- 脚本插件必须明确标记“高级/不受信任”，不作为普通用户默认能力。
- 内置/签名/审核插件与用户脚本分信任等级。
- Renderer/Parser 对脚本插件的输入输出建立显式 Contract。

## QD-02. 配置文件“能 JSON.parse”不等于可用

配置必须验证 schema，而不是只 catch JSON 语法错误。

推荐：

```text
read
→ parse
→ schemaVersion
→ required fields
→ enum/range
→ migrate
→ valid
```

失败：保存 raw backup → 恢复安全默认 → 给诊断。禁止静默覆盖唯一配置导致用户自定义全部丢失。

## QD-03. 复杂输入不要每次 onChange 都直接覆盖正式配置

解析器、Provider、JSON、主题、远程地址等使用：

```text
Draft
→ Validate
→ Save
```

`onClose` 清 Draft。用户未点保存时，正式配置保持不变。

## QD-04. 当前 active 配置不得直接删除

Plugin/Theme/Parser/Provider Manager 必须保证：

- built-in default 不可删除；
- active item 无替代时不可删除；
- active 丢失/损坏自动回默认；
- reset-one / reset-all 可恢复。

删除配置后若 activeId 仍指向不存在项，属于 P1 状态损坏。

## QD-05. 用户输入的 `col_type` / Renderer 名称必须 allowlist

不要：

```js
item.col_type = userInput;
```

正确：

```text
userInput
→ allowlist lookup
→ supported renderer
→ unknown => default + diagnostic
```

同理适用于 Page ID、Provider ID、Parser ID、Theme token 名称。

## QD-06. Protocol 请求禁止每次重复初始化 CryptoJS

样本 `getDoubanRes()` 每请求 `eval(getCryptoJS())`。长期项目统一 Crypto Runtime 单例；签名函数只调用已加载 Runtime。

发布前检查：高频列表/搜索/分页是否在循环中重复 `eval(getCryptoJS())`、重复加载 DEX/JS 运行时。

## QD-07. 网络重试禁止用同步 `Thread.sleep()` 放大卡顿

错误示例：

```text
请求失败
→ sleep 1s
→ 重试
→ sleep 1s
→ 最多 5 次
```

这可能把一次业务错误变成 5~10 秒页面假死。

固定规则：

- retry 只处理明确可重试错误；
- 设置 maxAttempts + totalBudget；
- P2/P3 附加请求更快失败；
- 不在 UI 主线程做长时间同步 sleep；
- 最终返回分层 ErrorModel。

## QD-08. 历史样本中的 API Key / HMAC Secret / DeviceId / UA 禁止复制成新协议事实

固定常量只能证明样本当时这样运行，不代表当前协议继续有效。

任何新协议：重新确认当前 APK/H5/API → 记录字段来源和签名算法 → 再进入目标 CHANGELOG。

禁止从旧规则复制：

- API Key
- HMAC/AES Secret
- 固定 UDID/DeviceId
- 固定设备型号
- 旧 User-Agent
- 旧渠道参数

然后因为“HTTP 200”就宣布协议已恢复。

## QD-09. 为提取结构化 `sources` 不要直接 eval 整段远端网页脚本

如果目标只是：

```text
sources[id] = [...]
```

优先做最小 Parser / JSON 提取。执行远端 script 会扩大：

- 任意代码执行面；
- DOM/全局变量依赖；
- 站点改版影响；
- 调试难度。

只有协议事实证明必须执行 JS 时，才进入 WebView/受控 JS runtime，并记录原因。

## QD-10. Browser/Cookie Recovery 只能处理认证/风控，不要吞并普通播放逻辑

正确链：

```text
API / PlaybackProvider
→ 明确检测 AUTH/RISK
→ BrowserAuthRecovery
→ 用户登录/验证
→ Session 更新
→ 原任务重试
```

不要“解析不到片源 → 直接打开网页让用户自己找”。只有明确风控/登录状态才进入 Recovery。

## QD-11. 快速搜索目标是外部依赖，必须检查目标规则是否可用

跨小程序：

```text
hiker://search?s=<title>&rule=<target>
```

生成前确认 target 配置合法；点击失败时给“目标规则未安装/已改名”等明确提示。不要让设置里残留的旧规则名造成静默死链。

## QD-12. 自定义筛选值必须验证范围和规范化

年份、评分、地区、标签等自定义输入：

- 年份必须在合理范围；
- 评分 low < high 且限定 0~10；
- 多标签限制数量、长度、分隔符；
- 地区/类型做 trim/去重；
- FilterState 保存规范值，不保存带 UI 文案的活动标题。

## QD-13. `immersiveTheme` 仍不是默认详情策略

青豆截图本次显示正常，不推翻项目已有实机结论。人物、详情、榜单等页面仍优先 `simple=true`；只有目标程序当前设备实机证明沉浸式无标题栏叠加且确实改善体验时才局部启用。

## QD-14. 自定义插件导入/导出不能成为隐私和凭据搬运通道

导出配置前扫描：

- Cookie / Authorization / Token；
- 私人 GitHub 地址；
- 私有 API Secret；
- 本地绝对路径；
- 账号标识。

分享版尤其禁止把这些字段打包进 ConfigEnvelope / Paste。

---

# 发布前追加检查

- [ ] 可导入配置已验证 kind/schema/version，不会自动 eval 任意文本。
- [ ] active Plugin/Theme/Parser 有默认 fallback，不能删除后悬空。
- [ ] 设置页复杂输入采用 Draft → Validate → Save。
- [ ] 自定义 `col_type/Provider/Parser` 通过 allowlist。
- [ ] 高频协议请求没有循环重复初始化 Crypto Runtime。
- [ ] Retry 有次数/总预算，没有同步长 sleep。
- [ ] 历史 API Key/Secret/DeviceId 已重新按当前协议确认。
- [ ] 网页结构化字段优先解析，不无理由 eval 远端整段脚本。
- [ ] Browser Recovery 只在明确 AUTH/RISK 场景触发。
- [ ] 跨小程序 Quick Search Target 不形成静默死链。
- [ ] 自定义筛选输入已规范化/校验。
- [ ] 配置导出已扫描隐私/凭据。
