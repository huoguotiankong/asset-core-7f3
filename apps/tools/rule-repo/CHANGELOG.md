# 我的规则仓库 CHANGELOG

## 2026-08-24 · 3.5.6-rc24 / Build414 · Local Icon Pack
- 用户实机确认 RC23 的“轻同步”已经成功，说明同步卡死问题已经从 Runtime/安装状态链中隔离；但轻同步后、退出重进后首页仍只有“黄豆 / 麻豆 / Ha”等文字占位，真实图标没有恢复。
- 根因收口：RC23 为保证同步速度明确不下载图标，而首页真实图标来源又混合 GitHub SVG/PNG、CloudFront、站点 favicon 和外部图片站。继续逐程序在线补图既会重新引入慢源/失败源，也会让“同步成功”和“图标是否恢复”产生不确定关系。
- RC24 新增 `icon_catalog_snapshot.json`：把当前云仓程序图标统一收敛为一份约 11KB 的 SVG 品牌图标包。`sync_scheduler_v4.js` 内嵌同一份最小图标集，首次升级 RC24 即可本地落地，不要求用户先执行同步。
- 首页图标读取顺序改为：已存在且有效的本地真实图标 → 本地图标包 SVG data URI → 规则仓库默认图标。首页热路径不再把 manifest 中的外部图标 URL 交给卡片逐项加载。
- RC24 轻同步一次并行更新 `manifest.json + channel_catalog_snapshot.json + icon_catalog_snapshot.json`，仍然不加载 Runtime 状态、不逐图下载、不扫描安装状态、不自动整页刷新；RC23 已实机验证成功的轻同步边界保持不变。
- 新 `shell_bridge_v2.js` / `rule_repo_test_v161.txt` 使用独立本地图标调度器，Test 元数据升到 `3.5.6-rc24 / Build414`；Stable 继续冻结在 `3.5.5 / Build389`。
- 本轮仍需海阔实机验证：覆盖升级 RC24 后直接打开首页，确认全部程序图标不再显示文字占位；随后再执行一次轻同步并刷新，确认图标和版本详情均不退化。

## 2026-08-24 · 3.5.6-rc23 / Build413 · Standalone Light Sync
- RC22 的轻同步仍通过已经加载的 `HikerRuleRepo`/Runtime 调用，并在同步完成后执行页面刷新；实机仍可能出现同步按钮长时间不结束，难以区分到底卡在目录请求、Runtime 状态还是刷新阶段。
- RC23 新增独立 `sync_scheduler_v3.js` 与 `shell_bridge_v1.js`。轻同步直接更新根目录 + 统一版本目录，不调用 `RuleRepoLocal.load()`、不检查或重建 Build402 Runtime、不写 Runtime 状态文件，也不自动 `refreshPage()`。
- 用户实机已确认 RC23 轻同步成功，证明“同步动作与 Runtime 状态彻底解耦”的方向正确；版本详情继续保持本地统一目录零网络。
- 为避免重新引入同步阻塞，RC23 暂时明确不处理图标资产，因此本轮同步成功不能等价于图标已经恢复；该剩余问题转入 RC24 的统一本地图标包解决。

## 2026-08-24 · 3.5.6-rc22 / Build412 · Light Sync Scheduler
- 在 RC21 统一版本目录基础上把普通“同步”改为轻同步：只并行获取根 manifest 与 `channel_catalog_snapshot.json`，图标补全和安装状态扫描从同步主链拆出。
- `sync_scheduler_v2.js` 为规则仓库自身强制写入当前 RC22 真相，避免根 manifest/旧目录摘要反向覆盖当前 Test 版本；其它程序继续从统一版本目录恢复。
- RC22 仍保留同步完成后的页面刷新和运行时对象依赖，后续实机暴露出同步执行边界仍不够彻底，因此 RC23 继续把同步器从 Runtime 启动链中独立出来。

## 2026-08-24 · 3.5.6-rc21 / Build411 · Single Local Version Catalog
- 实机确认 RC20 虽然已经恢复图标和 Local-First 主启动，但 JavBus / XVideos 等多版本详情在本地无缓存时仍会调用 `shortMeta()`，按 Raw → GitHub API → jsDelivr 串行前台请求。单路 2.6~3.2 秒累积后可接近 8~9 秒，并且海阔 lazyRule 执行期间会阻塞当前交互，出现“正在快速加载版本”长时间不结束、甚至返回也像卡死。
- RC21 彻底删除“进入版本详情再联网 hydration”的产品路径。新增 `apps/tools/rule-repo/channel_catalog_snapshot.json`，由发布端把当前所有 channel-group 的 Stable/Test/Local/Web 最小可导入元数据汇总成一份约 10KB 的统一版本目录。
- 新 `local_shell_loader_v5.js` 首次安装只获取一次固定提交 `f4373829...` 的不可变版本目录并写入 `hiker://files/rules/asset-core-local/rule-repo-test/channel_catalog_v2.json`。之后 `fastChannelCache / loadChannelMetaLive / refreshFastChannelCache / load-channels` 全部只读本地目录，版本详情禁止访问 GitHub/CDN。
- 主动“同步”时才允许联网刷新 `channel_catalog_snapshot.json`；RC10 旧的 N+1 `syncLocalChannelCatalog()` 被覆盖成从统一本地目录批量灌入缓存，不再为每个程序单独请求 `channels.json`。
- 图标策略改为：真实本地缓存优先；SVG 本地内容验证后使用 data URI；本地真实图标缺失时立即显示本地生成占位图，不再把远程 URL 交给详情页等待，所以不会出现图标空白数秒后才突然出现。主动同步继续负责下载真实图标，下一次刷新后替换占位。
- `rule_repo_test_v157.txt` / Shell 1.0.57-test 使用 `shell_loader_v5.js`，测试版更新页新增“同步版本目录”和本地目录 revision/程序数状态。RC19 已实机跑通的 Build402 Runtime、Local Module Manager 2.2.0、native `require(file://)` 执行链全部保持不变。
- 新硬约束：版本详情、分类/搜索等正常浏览热路径不得发任何 GitHub/CDN 元数据请求；远程仓库只允许在安装/升级/用户主动同步时访问。Stable 继续冻结 3.5.5 / Build389，黄豆 Local-First 继续暂停，等待 RC21 实机确认所有版本详情秒开且可正常返回。

## 2026-08-24 · 3.5.6-rc20 / Build410 · Local State & Asset Convergence
- 实机确认 RC19 已成功进入首页，证明 Local-First 主启动链（内嵌 Runtime manifest → Local Module Manager 2.2.0 → Public persistent JS → native require(file://)）已经跑通；本轮停止修改启动架构，转入运行状态/本地资产收口。
- 修复规则仓库自身详情仍显示 `3.5.6-rc11 当前运行`：RC12 Runtime 中的 `channelTruth` fallback 固定在 RC11，旧 channels 快照会反向覆盖当前 Shell。RC20 的 `local_shell_loader_v4.js` 以正在运行的 Shell `3.5.6-rc20 / Build410` 作为自身唯一真相，在加载后直接生成 Stable 3.5.5 + Test RC20 两张卡并写入本地 fast channel cache，同时强制修复自身 Verified Index。
- 版本缓存合同升级为 schema5：签名只绑定 `program id + channelsPath`，不再因为根 manifest 的版本摘要/updatedAt 变化而让已成功缓存的程序 channels 集体失效；程序自己的 channels.json 继续是权威事实源。
- 通用多版本详情改为本地缓存优先；缓存缺失时仅对当前程序执行 Raw → GitHub API → jsDelivr 的短超时补齐并立即落本地，不再沿用 RC7 的长累计等待。X5 的 `load-channels/open` 动作改为直接加载本地 `shell_loader_v4.js`，不再回到旧 page core/远程 Bootstrap 链。
- 修复规则仓库首页卡片 SVG 破图：自身图标直接作为本地 SVG data URI 交给工作区；其它本地 SVG 先验证真实 `<svg>` 内容，坏文件不再因为 `fileExist=true` 被继续使用，重新同步时会以文本方式落地并转换 data URI。
- `rule_repo_test_v156.txt` 恢复完整本地页面入口，并把“测试版更新”页从 RC19 的只读运行清单改为“版本中心 + 重建本地运行包 + 本地包状态”，避免更新页退化成静态说明页。
- Stable 继续冻结在 3.5.5 / Build389；黄豆 Local-First 仍暂停，先验证 RC20 的自身版本真相、SVG、本地版本缓存和其它 channel-group 详情速度。

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
