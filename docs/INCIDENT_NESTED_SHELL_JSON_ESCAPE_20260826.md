# Incident：海阔规则 Shell 的嵌套 JSON / JS 过度转义

日期：2026-08-26  
来源：Pornhub V2 `0.2.0-test.1 / Build20001` 发布前 Shell 审计  
适用：所有把 `pages` 作为 JSON 字符串、并在 `rule` 中内嵌 JavaScript 的 `.hk小程序` / `home_rule`

## 1. 症状
海阔规则壳通常存在至少三层字符串语义：

```text
home_rule 外层 JSON
→ pages 字段本身是 JSON.stringify 后的字符串
→ 每个 page.rule 又是一段 js: JavaScript 字符串
```

如果人工连续手写 `\\`、正则字面量、Unicode/BOM、`\b`、引号等转义，可能出现：

- 外层 JSON 能正常 `JSON.parse`。
- `pages` 也能正常 `JSON.parse`。
- 但最终解码出来的 JavaScript 已经多了一层反斜杠。
- 正则语义与作者以为的语义不同。
- 甚至只有在海阔 JSEngine 真正点击页面/执行入口时才暴露。

Pornhub V2 首次生成的未发布 Shell `pornhub_remote_test_v2_b20001.txt` 就在发布前复核发现 inline response validator 的正则转义层级过深。该文件从未进入 Test/Channels/Manifest 活动指针，随后新建 v3 Shell 处理。

## 2. 根因
错误思路：

```text
先脑内写 JS
→ 手工给 JSON 转义一次
→ 再手工给 pages JSON 字符串转义一次
→ 再手工补 Shell 文本转义
```

多层字符串由人工维护时，很难持续确认每一个 `\\` 最终在 JSEngine 中究竟会变成：

```text
\
\\
正则转义
普通字符串反斜杠
```

特别危险：

- `\b`
- `\uFEFF`
- `\s`
- `\/`
- 单/双引号混合
- 正则字面量
- 内嵌 JSON
- lazyRule / rule 序列化回调

## 3. 固定生成方法
以后复杂 Shell 默认按结构生成，不手工拼整段：

```text
pageRule JS 原始字符串
→ page object
→ JSON.stringify(pages)
→ home_rule object
→ JSON.stringify(home_rule)
→ 拼上海阔固定前缀
```

也就是：**每一层只让 JSON serializer 负责一次本层转义。**

如果当前工具链不能直接结构化生成，应优先把 Shell inline bootstrap 写得简单，复杂逻辑下沉到版本化 Entry/Bootstrap/Runtime，不在三层字符串里塞长正则和复杂解析器。

## 4. 发布前必须做的三层门禁

### A. 外层规则解析

```text
去掉：海阔视界，首页频道￥home_rule￥
→ JSON.parse(outer)
```

必须成功。

### B. pages 二次解析

```text
JSON.parse(outer.pages)
```

必须成功，并检查：
- 页面数量。
- path 唯一。
- 每个 rule 非空。
- 主页面存在。

### C. 解码后的 JS 语义审计

不能因为 A/B 都通过就宣布 Shell 正确。继续对最终 `page.rule` 文本检查：

- 是否出现意外的 `\\\\`。
- 正则是否仍是预期语义。
- URL/ref/build 是否正确。
- `lazyRule/rule` 是否能重新进入当前 Runtime。
- 必要时抽出 `js:` 后做最小 parse/smoke。

## 5. 版本处理
如果发现错误 Shell 已经创建但**尚未激活**：

```text
冻结该工件
→ 不原地覆盖
→ 新建 Shell 文件名
→ 提升 rule version
→ 重新门禁
→ 只把新 Shell 写入活动 Test/Candidate 指针
```

如果已经激活并进入设备缓存，则必须按 P0 发布事故处理：新 Shell 路径 + 新 rule version + 必要的新 Entry/cache key，禁止覆盖旧 URL 赌缓存。

## 6. Pornhub V2 实例

未采用：
- `apps/video/pornhub/pornhub_remote_test_v2_b20001.txt`

正式 Test Shell：
- `apps/video/pornhub/pornhub_remote_test_v3_b20001.txt`
- rule version `2026082602`

v3 的处理：
- inline 下载响应校验改成简单字符串前缀检查。
- 复杂 Runtime 逻辑全部下沉到 pinned Local Entry / Builder。
- 外层 JSON 和 pages JSON 均重新解析验证。
- Test 指针只指向 v3。

## 7. 永久教训
**JSON 能 parse 不代表嵌套 JS 语义正确。** 以后 Shell 发布门禁必须同时验证“外层结构、pages 结构、解码后的实际 JS”，复杂逻辑尽量离开 Shell 内联字符串。
