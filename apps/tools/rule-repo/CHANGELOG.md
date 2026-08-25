# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC28 完整记录已冻结到 `CHANGELOG_RC28_20260825.md`；RC27、RC26 及更早历史继续保留。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结；RC29 自更新闭环实机通过前禁止晋级。
- Test：`3.5.6-rc29 / Build419`，Shell `rule_repo_test_v166.txt` / rule version `2026082505`。
- Runtime 基线仍为 immutable `3.5.6-rc12 / Build402` + Local Module Manager `2.2.0` + `require(file://)`。
- RC24 本地图标、RC25 原生 `.txt` 导入、RC26 普通程序三镜像版本目录、RC27 多版本更新统计、RC28 独立 self feed 全部保持。

## 2026-08-25 · 3.5.6-rc29 / Build419 · Self Update Closure Probe

### 用户实机事实
- 用户 08:59 实机截图确认：测试仓自身详情已经正确显示“当前安装：测试版 3.5.6-rc28”，可用版本中的 Test 也为 `3.5.6-rc28`，并标记“当前运行”。
- 这证明 RC28 已解决 RC26/RC27 时 selfMeta 被旧版本锁死的问题，第一阶段通过。

### RC29 目的
- RC29 不新增业务/UI功能，只作为 RC28→RC29 的自更新闭环探针。
- `channels.json` 将 Test 提升到 `RC29 / Build419` 并指向 `rule_repo_test_v166.txt`。
- RC28 的 self feed 会直接三镜像读取这个小文件，因此不需要统一大目录，也不需要打开 Stable。
- RC29 新增极薄 `self_update_probe_patch.js` 和 `shell_bridge_v7.js`：底层完整复用 RC28 已验证链，仅把当前运行身份提升到 RC29，同时继续接受未来更高 self feed。

### 静态门禁
- RC29 probe patch / Bridge 使用独立文件，不覆盖 RC28 工件。
- `rule_repo_test_v166.txt` 外层 JSON、内层 pages JSON、14 段 `js:` 入口全部通过解析和 `node --check`。
- Stable 3.5.5 / Build389、Build402 Runtime、RC24~RC28 已验证能力均未修改。

### 强制实机验收
1. 保持当前运行 RC28；**不要打开正式仓**。
2. 在测试仓进入“我的规则仓库”自身详情，点“检查版本”。
3. 当前安装仍应显示 RC28，但测试版可用版本必须变为 `3.5.6-rc29 / Build419`。
4. 直接在同一测试仓详情页点击 RC29 导入/覆盖。
5. 退出并重新打开“我的规则仓库·测试版”。
6. 再进自身详情，必须显示“当前安装：测试版 3.5.6-rc29”，并将 RC29 标记为“当前运行”。
7. 首页可更新数字、图标、检查版本和普通小程序导入不得退化。

### Stable 门禁
- 只有步骤 2~6 在**完全不借助 Stable**的情况下实机通过，测试仓自更新闭环才算成立。
- 通过后先记录验收结果，再决定是否将 RC29/后续 Candidate 晋级 Stable；未通过则 Stable 3.5.5 继续冻结。

## 历史
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
- 自更新事故：`docs/INCIDENT_RULE_REPO_SELF_UPDATE_LOCK_20260825.md`
