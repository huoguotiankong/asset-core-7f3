# 我的规则仓库 CHANGELOG

## 2026-08-24 · 3.5.6-rc19 / Build409 · Embedded Runtime Manifest
- P0 修复：RC18 实机不再出现 `Unexpected token: C`，控制面校验成功把故障明确定位为 `RC12 Runtime Release 全部镜像失败`。Raw 返回截断 JSON（`Unexpected end of stream at char 3`），GitHub Raw/jsDelivr 同时返回无效响应，说明固定 `release.json` 首启网络读取本身就是多余故障点。
- RC19 Bootstrap v1.0.55 直接内嵌不可变 Build402 Runtime 的 `id/version/build/ref/modules/verify` 清单，`release()` 只返回本地克隆；首次安装不再访问任何 `release.json` URL。
- `local_shell_loader_v3.js` 固定引用 Bootstrap v155，并在执行前验证内嵌清单 `build===402 && modules.length>0`；Shell 升到 `rule_repo_test_v155.txt`，避免继续复用 RC18 启动器 v2。
- Local Module Manager 2.2.0、Public persistent Runtime JS、native `require(file://)` 探针与模块执行路线保持不变；本轮只删除一个不必要的控制面网络依赖，不修改业务/UI Release。
- 新硬约束：与某个不可变 Runtime 一一对应且体积可控的 Release manifest，优先随 Bootstrap/安装器内嵌；GitHub/CDN 负责真正的模块资产下载，不能让固定清单成为首启单点故障。
- Stable 继续冻结在 3.5.5 / Build389；黄豆 Local-First 试点继续暂停，等待规则仓库通过 RC19 首装、二次启动与断 GitHub 门禁。

## 2026-08-24 · 3.5.6-rc18 / Build408 · Verified Control Plane
- P0 修复：RC17 实机仍报 `本地运行包不可用：Unexpected token: C`。沿错误包装链确认异常发生在 `boot().installLocal(false)`，尚未进入 native `require(file://)` 探针；根因是 Bootstrap 对新 Manager/Release 的控制面响应只做“非空/部分错误词”判断，jsDelivr 对刚发布不可变 commit 可能返回 `Couldn't ...` 文本，该文本未被 RC17 `valid()` 拒绝，随后直接 `eval()`/`JSON.parse()`，因此出现首字符 `C` 的语法错误。
- RC18 Bootstrap v1.0.54 改为控制面逐镜像强校验：Manager 默认 Raw → GitHub Raw → jsDelivr，每个候选必须实际 `eval` 并验证 `HikerLocalModules.version===2.2.0` 才算成功；Release 每个候选必须 `JSON.parse` 且通过 `id/build/modules` 身份校验。
- 错误响应黑名单补全 `Couldn't / Cannot / Error / Exception / HTTP / Request/Fetch/Network failed / Timeout / GitHub JSON error`，错误文本不得再进入代码/JSON解析阶段。
- 新增 `local_shell_loader_v2.js`，Shell 路径升级为 `rule_repo_test_v154.txt`，避免手机继续复用 RC17 已落地的旧启动器；启动器自身同样改成 Raw 优先 + `Couldn't` 识别。
- RC18 仍保留 Local Module Manager 2.2.0 与 native `require(file://)` 探针。只有控制面 Manager/Release 获取通过后才进入本地模块能力验证，因此下一次实机结果可以明确区分“控制面失败”与“本地 require 能力失败”。
- Stable 继续冻结在 3.5.5 / Build389；黄豆 Local-First 试点继续暂停，直到规则仓库完成首装、二次本地启动和断 GitHub 三项门禁。

## 2026-08-24 · 3.5.6-rc17 / Build407 · Native Local Modules
- 架构修正：RC16 实机仍在 `readFile()+eval()` 本地 Runtime 路线报 `SyntaxError: Unexpected token: C`。结合海阔官方模块文档确认，Local-First 不应自行模拟模块执行器；本地源码执行改为海阔原生模块加载语义。
- 新增共享 `Local Module Manager 2.2.0`：Runtime JS 写入 `hiker://files/rules/asset-core-local/<app>/b<build>/` 持久目录；规则私有文件只保存 package/state 元数据。
- 首次安装先写入极小 `native_require_probe.js`，通过 `require(getPath(...))` 实机验证本地 `file://` 模块能够按海阔原生 require 语义执行并导出顶层变量；探针失败时停止安装，不继续下载完整 Runtime。
- Runtime 下载完成后，正常启动不再 `readFile()+eval()`，改为按 Release 顺序 `require(file://本地模块)`；模块地址按 build 隔离，避免新旧版本覆盖。
- 新增薄启动器 `local_shell_loader_v1.js`：首页和全部子页只负责确保启动器落本地，再由启动器检查本地包、必要时调用 Bootstrap 安装，并使用原生 require 加载所有本地模块。
- RC12 Build402 业务 Release 继续复用，不重新改业务/UI；本轮只更换 Local-First 的本地持久化/执行层。
- 新硬约束：Local-First JS 运行面禁止继续使用规则私有文件 `readFile()+eval()` 作为通用模块执行机制；优先使用海阔原生本地模块能力。Stable 继续冻结在 3.5.5 / Build389，黄豆试点继续暂停，等待 RC17 首装/二次启动/断 GitHub 门禁。

## 2026-08-24 · 3.5.6-rc16 / Build406 · Validated Local Bundle
- P0 修复：RC15 实机进入本地 Runtime 执行阶段后报 `Unexpected token: E`。审计确认真实第 0 模块 `repository.js` 以正常 JS 注释开头，问题来自 Local Bundle Manager 2.1.1 仍可能把 `batchFetch` 返回的 `Error...` 等错误文本当成有效源码持久化，并对污染内容自身计算 MD5，导致完整性校验无法发现语义污染。
- 共享 Local Bundle Manager 升到 2.1.2：禁止 `Error / Exception / HTTP / Request failed / Network error / Timeout / GitHub JSON error` 等响应进入本地 JS 包；每个模块远端读取后和本地回读后均执行 JS 语法编译校验。
- RC16 首装暂时关闭批量 Runtime 下载，改为逐模块不可变多镜像下载，优先保证首次安装正确性；后续只有在实机证明可靠后才能重新引入并发加速。
- RC16 增加本地 entry loader。旧 Build402 包若执行失败，会明确标出失败模块名，自动删除污染包并使用 Manager 2.1.2 强制重建一次，再重新加载。
- Stable 继续冻结在 3.5.5 / Build389；黄豆 Local-First Test 暂停继续验证，先等规则仓库完成“首次安装成功 → 第二次本地启动 → 断 GitHub”闭环。

## 2026-08-24 · 3.5.6-rc13 ~ rc15 · Local-First 启动合同修复
- RC13：确认短模块名 `$.require('ruleRepoCore')` 不可用，尝试完整 `hiker://page/ruleRepoCore`。
- RC14：修复海阔 `saveFile/readFile` 文本规范化导致的严格原字符串写入校验误报，Manager 2.1.1 改为 BOM/CRLF/尾换行规范化后校验，并以实际回读文本建立 MD5。
- RC15：实机继续证明 `hiker://page/ruleRepoCore` 在当前首页规则上下文仍不可注册，彻底取消 page-module 启动依赖；首页与各页面直接从规则私有文件读取并 eval 本地 Runtime。
- 新门禁：Local-First 启动不得依赖海阔 page module 的隐式注册状态；本地包校验必须同时验证“文件存在/MD5”和“内容确实是可执行源码”。

## 2026-08-24 · 3.5.6-rc12 / Build402 · Local-First Bootstrap Scope Fix
- P0 修复：RC11 首次启动时 Shell 通过 `require()` 加载 Bootstrap，但 `RuleRepoBoot` 定义在 Bootstrap IIFE 的局部作用域，导致海阔实机报错“RuleRepoBoot 未定义”，本地运行包尚未开始安装即终止。
- RC12 Shell 改为在同一 Rhino 执行作用域中 `fetch + eval` 不可变 Bootstrap，并在 eval 前显式声明 `var RuleRepoBoot`，不再依赖 `require()` 的全局导出副作用。
- RC12 Bootstrap 同样改为 `fetch + eval` Local Bundle Manager 2.1.0；在 manager() 内显式声明 `var HikerLocalBundle`，杜绝模块作用域泄漏假设。
- Local-First Runtime 15.1.1 的完整本地 Release、原子 active/previous、本地图标、全量 channels 本地快照、per-app channels 权威事实源全部保留。
- Stable 继续冻结在 3.5.5 / Build389；RC12 必须先完成首装、二次启动、版本中心、黄豆 Test2、断 GitHub 运行实机回归后才允许继续迁移或晋级。

## 2026-08-24 · 3.5.6-rc11 / Build401 · Local-First Channel Truth
- Local-First Runtime 15.1.1：程序自己的 `channels.json` 成为版本中心权威真相，根 manifest 仅承担目录发现/摘要职责。
- 保留 RC10 本地运行包、本地图标、同步时全量 channels 快照能力。

## 2026-08-24 · Local-First Runtime Migration
- 项目开始从“远程运行”迁移为“远程发布、本地运行”：安装/升级时拉取不可变 Release 到规则私有文件，全部写入并校验成功后才切 active，previous 保留回退。
- 第一批试点：我的规则仓库 Test + 黄豆短剧 Test；Stable 均冻结。

> 历史完整记录保留在同目录既有 `CHANGELOG_pre_*` 文件及 Git 历史中。