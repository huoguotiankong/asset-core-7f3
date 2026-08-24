# 我的规则仓库 Changelog

> **程序级长期技术记忆。** 开发/优化“我的规则仓库”前，除三份全局文档外，必须先读本文件以及当前 `stable.json / test.json / candidate.json / channels.json / latest.json`、对应 Release、Bootstrap、Shell、实际模块与用户实机结果。

## 3.5.6-rc6 Test（Build 396 / Shell 1.0.42-test / Bootstrap 1.0.41-test / Manager 2.0.4）

- RC5 实机确认“我的规则仓库”自身版本中心恢复正常，但黄豆短剧等其它 `channel-group` 仍显示“版本数量待加载 / 点击加载版本后显示”，并出现“已安装·版本待识别”同时上方“当前版本 1.9.0”的语义冲突。
- 根因一：RC4/RC5 的详情恢复链实际上对 `rule-repo` 有专用 `ruleRepoChannelFallback()` 与自身预加载特例，其它程序仍依赖脆弱的 X5 点击补丁触发 `load-channels`；不同入口进入详情时可能绕过该触发点，因此通用多版本程序长期停留待加载。
- RC6 升级为 **Single Workspace 14.5 / Generic Channel Hydration**：所有进入 `detail` 的路径统一在 `go()` 判断 `channel && !channelsLoaded`，只对当前一个程序执行 `loadChannels`；刷新后 `workspaceData()` 还会对 pending detail 做一次当前程序缓存补齐。首页仍禁止预取所有 `channels.json`，不会恢复 N+1。
- 通用 `loadChannelMetaLive()` 明确兼容 `item.channelsPath` 与 `item.raw.channelsPath`，并在失败诊断中带出真实 path；`rule-repo` fallback 继续只作为自身兜底，不再掩盖其它程序的加载问题。
- 根因二：多版本详情旧 UI 使用 `p.version` 作为“当前版本”，而该字段来自云端根 manifest 摘要，并不等于手机真实安装版本。RC6 改为“当前安装”：身份已确认时显示 `正式版/测试版/本地版 + installedVersion`，无法确认时只显示“已安装 · 版本待识别”，未安装显示“未安装”。禁止云端 Stable 版本冒充本地当前版本。
- 根因三：黄豆 Stable/Test Shell 实际 numeric version 可区分（Stable `2026082309`、Test6 `2026082307`），但不同海阔版本的 `getLastRules()` 可能把完整 `home_rule` 文本嵌在 `rule/content/source/ruleText/data` 字段里；RC3 的 `deviceRuleRecord()` 未解析这种嵌套字符串，因此丢失 numeric version。RC6 增强解析器，支持直接对象、完整 `海阔视界，首页频道￥home_rule￥{...}` 文本和嵌套字段。
- 新建不可变资产：`releases/test-3.5.6-rc6/generic_channel_hydration_patch.js`、`release.json`、`bootstrap_test_v141.js`、`rule_repo_test_v142.txt`。Shell 数值 `version=2026082407`。

### RC6 必须完成的实机回归门禁

1. 从 RC5 直接升级 RC6；设置页显示 `3.5.6-rc6 / Build396 / Single Workspace 14.5`。
2. 首页点击黄豆、麻豆AI、ACFun/JavDB 等任一多版本程序，第一次允许短暂加载，但必须自动进入详情并显示真实版本卡；不再要求用户手点“加载版本”。
3. 黄豆详情必须显示 Stable/Test/Local 三张卡；其它程序按其真实 `channels.json` 数量显示。
4. 多版本详情“当前安装”不得再用根 manifest 的 Stable 摘要冒充本地版本；未识别时明确写“版本待识别”。
5. 点一次“同步”后，至少黄豆这类 numeric version 明确可区分的同名 Stable/Test 应尝试识别真实通道；如海阔本地规则对象仍不暴露 numeric version，保守保持“版本待识别”，但不得误报更新。
6. 任取一个其它程序验证 Stable/Test 版本卡可导入；“打开程序”继续走 RC4 原生 descriptor 桥，不复发 jsoup 空 selector。
7. 首页 Fast Home 打开速度不得明显退化，首页网络请求数仍与程序数量解耦。
8. RC6 全链通过前，Stable 继续冻结 3.5.5。

## 3.5.6-rc5 Test（Build 395 / Shell 1.0.41-test / Bootstrap 1.0.40-test / Manager 2.0.4）

- 用户从已恢复的 Stable 3.5.5 覆盖导入 RC4 后，实机出现“**设置页已经是 3.5.6-rc4 / Build394，但规则仓库程序卡仍显示测试版 3.5.6-rc3 已安装**”；同时“界面”仍显示 `Single Workspace 14.2`，版本中心显示“待加载”。
- 根因一：RC3 的 `readVerifiedInstallIndex()/fastItemState()` 将持久化 `verified_install_index_v1` 视为安装状态最高优先级，只要旧索引存在就直接返回；跨版本覆盖导入并不会自动使旧索引失效。因此当前 Shell 已经是 RC4，详情却仍消费 RC3 自身记录。
- RC5 固定规则：**规则仓库自身（`id=rule-repo`）的当前运行 Shell 是其安装状态最高优先级真相**。`fastGroupState/fastItemState` 对自身直接使用当前 `R.version/R.build/channel`，不得再被旧 Verified Index 反向覆盖；其它程序继续使用 Verified Device Install Index。
- 新增 Runtime State Epoch：运行版本/Build/通道变化时，自动修复 `verified_install_index_v1.apps['rule-repo']`，并清理规则仓库自身的旧 channel cache 与 channel fingerprint。用户不需要手动清缓存、删除状态或重新安装旧版。
- 根因二：RC4 在 `channelsLoaded=false` 时把 `actions.open/actions.check` 指向 `load-channels` URL，但 X5 事件仍把动作 mode 作为 `open/check` 传给 `runAction()`；RC2 的刷新合同只在 `mode==='loadChannels'` 时执行 `refreshPage(true)`，因此版本数据虽然可能已经写入缓存，详情仍停留“待加载”。
- RC5 修复加载刷新合同：优先把“加载版本”按钮显式路由到 `loadChannels`；同时在 `runAction()` 增加兼容刷新条件，旧 `open/check → load-channels` 路径成功后也强制刷新，避免按钮文本与动作 mode 再次脱节。
- `workspaceData.ui` 统一为 **Single Workspace 14.4**；RC4 的空 channels 修复、`loadChannelMetaLive()`、原生 `deviceRuleOpenDescriptor + fba.open` 打开桥、Fast Home、Render Guard 与 Verified Device Install Index 均保留。
- 新建不可变资产：`releases/test-3.5.6-rc5/runtime_state_migration_patch.js`、`release.json`、`bootstrap_test_v140.js`、`rule_repo_test_v141.txt`。Shell 数值 `version=2026082406`。

### RC5 必须完成的实机回归门禁

1. 从 RC4 直接“升级测试版”到 RC5，不允许要求用户手工清状态。
2. 设置页必须同时显示 `3.5.6-rc5 · Build395` 与 `Single Workspace 14.4`。
3. “我的规则仓库”详情摘要必须显示当前测试版 RC5 已安装，禁止再出现 RC3/RC4 旧自身状态。
4. 进入自身详情后，版本中心必须最终显示 Stable 3.5.5 + Test RC5；若首次需要加载，加载成功后页面必须自动刷新，不得停留“待加载”。
5. Stable/Test 版本卡均能生成有效导入口令；再次导入测试版后当前状态仍必须保持 RC5。
6. 点击“打开程序”必须继续通过 RC4 原生 descriptor 桥正常进入，不得复发 jsoup 空 selector。
7. 至少抽测一个其它 channel-group，确认其 Verified Index 行为未被自身 runtime-authoritative 特例影响。
8. RC5 全链通过前，Stable 继续固定 3.5.5，不得再次晋级 3.5.6。

## 3.5.6-rc4 Test（Build 394 / Shell 1.0.40-test / Bootstrap 1.0.39-test / Manager 2.0.4）

- 用户补做 RC3/Stable 3.5.6 的版本中心回归后实机确认两个 P0：多版本详情显示 **版本数量 0 个 / 可用版本 0 个**，因此无法导入；点击“打开程序”触发 `java.lang.IllegalArgumentException: String must not be empty`，堆栈进入 jsoup `Selector.select` / `HomeParser.findList`。
- 版本中心根因：Fast Home 14.1 的 `fastChannelCache()` 只检查 `Array.isArray(meta.channels)`，错误地把 `{channels:[]}` 也当成已加载的有效缓存。随后 `hybridProgramData.channelsLoaded=true`，X5 不再触发 `load-channels`，空缓存会永久把真实 `channels.json` 挡住。
- RC4 升级为 **Single Workspace 14.3 / Version Center & Native Open Bridge**：空 `channels` 缓存自动失效；新增 `loadChannelMetaLive()` 绕过 RC2 cache-only `channelMeta`，显式加载必须得到至少 1 个版本才允许写缓存和提示成功；规则仓库远端版本元数据失败时仍可使用内建 Stable/Test fallback。
- 打开程序根因：工作区 `context_free_actions` 返回 `hiker://home@规则名||hiker://home`，X5 `runAction()` 再用 `fba.open` 传入空 `findRule`。网页上下文并不适合直接使用 `hiker://home@规则名`；最终 HomeParser 收到空 selector，与实机 jsoup 堆栈完全吻合。
- RC4 新增 `deviceRuleOpenDescriptor()`：从 `getRuleCount()+getLastRules()` 得到手机真实已安装规则的 `url / find_rule / preRule / col_type / group`，动作返回内部 `rr-native-open://` 描述；X5 只负责解码后调用 `fba.open(JSON.stringify(descriptor))`。同时显式拦截旧 `hiker://home@...`，缺少真实 descriptor 时只 toast，不再让 HomeParser 以空规则执行。
- RC4 保留 RC2 的 Fast Home + Render Guard、RC3 的 Verified Device Install Index 14.2；本轮不重新设计首页性能架构。
- 新建不可变资产：`releases/test-3.5.6-rc4/version_center_bridge_patch.js`、`release.json`、`bootstrap_test_v139.js`、`rule_repo_test_v140.txt`。Shell 数值 `version=2026082405`。

### RC4 必须完成的实机回归门禁

1. 从首页点击“我的规则仓库”进入详情，必须看到至少 Stable/Test 两条可用版本，不能再出现 0 个。
2. Stable/Test 版本卡均能生成有效海阔导入口令并完成覆盖导入。
3. 已安装程序点击“打开程序”必须正常进入目标程序，不能再出现 jsoup `String must not be empty`。
4. 多抽测至少一个其它 channel-group 程序，确认版本列表与导入同样正常，避免只修规则仓库自身 fallback。
5. 首页 Fast Home 速度不得退化；同步后 Verified Install Index 的已安装/可更新统计继续与列表一致。
6. 只有以上链路全部通过，3.5.6 才允许重新晋级 Stable；禁止仅凭首页正常再次发布正式版。

## Stable 3.5.6 / Build393 撤回记录

- Stable 3.5.6 曾由 RC3 按用户明确指令晋级，但晋级前遗漏“版本中心 → 版本列表 → 导入 → 打开程序”的完整实机回归。
- 用户后续实机发现上述两个 P0 后，**活动 Stable 指针立即恢复到 3.5.5 / Build389**。`releases/3.5.6/`、`bootstrap_v156.js`、`rule_repo_remote_v356.txt` 作为事故/历史工件永久保留，不删除、不原地修改。
- 该事故新增发布门禁：规则仓库自身作为“仓库管理器”，正式晋级必须至少覆盖首页、同步、版本中心、Stable/Test 列表、导入、打开程序、回退、更新中心八条核心链；任一未实机验证不得晋级。

## 3.5.6-rc3 Test（Build 393）

- 引入 Verified Device Install Index 14.2：普通首页只读持久索引；显式同步才读取海阔真实本地规则表并使用 `title + numeric version` 指纹识别通道。
- 修复 RC1/RC2 以导入历史猜安装状态导致的漏报安装和 ACFun/JavDB 假更新；无法识别版本时保守显示“已安装 · 版本待识别”。
- RC3 的首页/状态链有效，但版本中心与打开程序链未完整回归，因此不得再把“首页正常”视为正式发布充分条件。

## 历史记录

- `CHANGELOG_pre_3.5.6-stable.md`：保存 Stable 3.5.6 晋级前完整 RC1/RC2/RC3 开发记录。
- `CHANGELOG_pre_3.5.6-rc1.md`：保存 Stable 3.5.5 及此前记录。
- `CHANGELOG_pre_3.5.5.md`：保存更早历史。

恢复旧版本、追查事故或复用历史实现时，禁止删除上述历史文件。