# Incident：远程 Release 未做 JavaScript 语法门禁导致整程序启动失败（2026-08-22）

## 事故
Hanime1 `2.0.0-test.27 / Build20027` 发布后，用户实机启动直接报：

```text
Hanime1解析失败！
SyntaxError: 在参数列表的后面缺少“)”
行数：41
```

实际文件：`apps/video/hanime1/releases/2.0.0-test.27/patch_experience27.js`。

`E.repliesPage` 一行的 `d.push(H.sec(...))` 少一个右括号。因为该文件在 Remote Release 加载阶段执行，任何页面都还没有开始渲染，整个 Hanime1 就已经无法启动。

## 为什么这是发布事故，不只是普通业务 Bug
- 错误发生在 JS parse 阶段，`try/catch` 无法在模块内部兜住。
- Release/Bootstrap/Shell/Cloud Repo 都已经切到 Build20027，用户一更新就进入坏版本。
- 业务逻辑是否正确已经没有意义，因为解释器无法加载模块。

## 固定处理方式
发现活动 Test/Candidate 的模块有语法错误：

```text
立即冻结坏 Release
→ 不原地覆盖 immutable release
→ 新建更高 build
→ 从最后一个可启动基线恢复
→ 明确跳过坏 Release
→ 新模块先做语法检查
→ 再切 test/candidate/channels/registry/manifest
```

Hanime1 实际处理：

```text
Test27（broken）
× 不再 require

Test28
→ Test26 recovery_loader（最后可启动基线）
→ replies28.js
→ creator28.js
→ ui28.js
→ settings28.js
```

## 新的 P0 发布门禁
任何新增或修改的远程 `.js`，在修改 Test/Candidate/Stable 元数据之前必须执行：

```text
python tools/js_syntax_guard.py --root . --path <本次 release 目录>
```

或至少：

```text
node --check <changed-file.js>
```

要求：
- 所有本次新增/修改 JS 都必须返回 0。
- 不允许只检查 `release.json` / Bootstrap / Shell JSON 正确性。
- 一个 Release 拆成多个模块时，每个模块都要检查。
- Recovery loader 自身也要检查。
- 语法门禁必须发生在 channel/test/candidate metadata 切换之前。

## 结构性改进
大型单文件补丁容易把评论、作者、UI、设置等互不相关逻辑绑成一个 parse failure domain。后续优先拆成小模块：

```text
Community patch
Creator patch
UI patch
Settings/Update patch
```

即使某一个业务模块出现问题，也更容易定位、回退和独立验证。

## 永久结论
**“代码看起来合理”不能替代解释器语法检查。**

海阔远程模块发布至少要同时通过：
1. JS parse/syntax；
2. Release/路径/模块存在性；
3. Shell/Bootstrap/install build 闭环；
4. 实机页面/协议/图片/播放回归。
