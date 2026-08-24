# 我的规则仓库 Changelog

> **程序级长期技术记忆。** 开发/优化“我的规则仓库”前，除三份全局文档外，必须先读本文件以及当前 `stable.json / test.json / candidate.json / channels.json / latest.json`、对应 Release、Bootstrap、Shell、实际模块与用户实机结果。

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
