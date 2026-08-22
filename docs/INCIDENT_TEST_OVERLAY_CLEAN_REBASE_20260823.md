# Test Overlay 继承链失真与 Clean Rebase 事故记录（2026-08-23）

## 1. 事故背景

ACFun 0.6 Test 从 Alpha3 起长期采用“旧 Test Release + 新 Runtime/UI overlay”的方式迭代。多个版本先后重写：

- `itemInfo / FirstMedia / Cover Resolver`
- Playback / `ac.play`
- 漫画、小说、有声 Detail/Reader
- 首页/分类/搜索 Renderer
- HTTP Method/参数矩阵

Alpha13 已发生漫画退化、所有封面消失、播放仍失败的多域回归。Alpha14 虽然正确跳过 Alpha13，但仍直接继承 Alpha12，而 Alpha12 自身已经包含 Alpha3/A4/A6/A7/A8/A10/A11/A12 多层实验 overlay。

最终 Alpha14 实机仍出现：

- 首页普通视频封面全部灰图。
- 视频详情封面为空。
- 旧播放/漫画/有声等问题继续存在。

这证明：**跳过最后一个坏版本，不等于恢复链已经干净。**

## 2. 根因模式

当 Test Release 长期通过追加覆盖层演进时，最终行为由“最后一个重绑定同名函数的模块”决定。即使最后一层被移除，早期实验层仍可能继续覆盖 Stable 已验证合同。

典型危险链：

```text
Stable Parser / Adapter
→ Test A 覆盖
→ Test B 再覆盖
→ Test C 部分恢复
→ Test D 再修
```

如果 Test D 失败，只回到 Test C，并不能保证回到 Stable 行为；Test A/B 的副作用仍然存在。

## 3. 永久规则：什么时候必须 Clean Rebase

出现以下任一情况，禁止继续在当前 Test/Candidate 上叠补丁：

1. 同一版本同时回归 2 个以上独立域（如图片 + 播放、评论 + 搜索）。
2. 已经删除最新坏模块，但实机仍表现为旧回归。
3. Release 中同一核心函数被 3 层以上模块重复重写。
4. 当前 Test 的 recovery base 本身从未完成全量实机回归。
5. Stable 明确存在可用合同，而 Test 无法解释当前 method owner / load order。

固定处理：

```text
冻结失败 Test/Candidate
→ 找最后一个完整实机可用 Stable
→ 新 Release 只加载 Stable 已验证模块
→ 逐项重新加入真正需要的新能力
→ 每新增一个 Adapter/Renderer 都独立验收
→ 旧 Test overlay 不进入新活动链
```

## 4. Clean Rebase 不是“回退 UI”

Clean Rebase 的目标是恢复可信运行合同，不要求放弃新产品设计。

推荐：

```text
Stable Protocol / Parser / Media Adapter
        ↓ 保留
新 Product Model / 新 UI / 新附加 Provider
        ↓ 单独追加
```

例如 ACFun Alpha15：

- Stable 0.4.9 的 `itemInfo/image/playback/v047 comics-short-taxonomy` 保持不动。
- 九栏目产品结构继续保留。
- 社区/小说/有声作为独立 Adapter 新增。
- 不再为了新增有声去覆盖普通视频 `itemInfo/play`。

## 5. 发布门禁

Clean Rebase 发布前至少确认：

- Release 模块清单中不存在被隔离的 Test overlay。
- 新 Bootstrap 直接继承可信 Stable Bootstrap，而不是失败 Test Bootstrap。
- `minBuild` 强制越过旧 active state。
- 新 Shell 使用新 cache key / 数值 version。
- JS 通过 `node --check`。
- Release JSON、Shell 外层 JSON、pages 内层 JSON 可解析。
- 实机分别回归：图片、播放、阅读、搜索、核心列表。

## 6. ACFun 本次事实

Alpha15 / Build166 / Shell7.1：

```text
Stable 0.4.9 八模块
+ acfun_runtime_v060_a15_clean.js
```

Alpha3~14 全部退出活动 Release。

本次同时确认新的协议事实：当前 Host 下 `fiction/base/findList` 的 GET 返回 HTTP405，而真实请求存在 HTTP200，因此 fiction Adapter 使用 POST-first、GET fallback；该 Method 结论只写入 ACFun 程序知识，不泛化到其它站点。
