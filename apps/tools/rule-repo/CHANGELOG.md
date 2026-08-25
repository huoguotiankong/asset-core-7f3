# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC27 完整记录冻结到 `CHANGELOG_RC27_20260825.md`；RC26 记录在 `CHANGELOG_RC26_20260825.md`；更早历史继续保留。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，测试仓自更新闭环通过前禁止晋级。
- Test：`3.5.6-rc28 / Build418`，Shell `rule_repo_test_v165.txt` / rule version `2026082504`。
- Runtime 基线仍为 immutable `3.5.6-rc12 / Build402` + Local Module Manager `2.2.0` + `require(file://)`。
- RC24 本地图标、RC25 原生 `.txt` 导入、RC26 普通程序三镜像版本目录、RC27 多版本更新统计全部保留。

## 2026-08-25 · 3.5.6-rc28 / Build418 · Self Update Feed

### 用户实机事实
- RC27 已把首页“可更新”从 `0` 修复为 `2`，说明多版本更新状态模型生效。
- 但同一实机中，“我的规则仓库·测试版”进入自身版本中心仍显示 `Test 3.5.6-rc26 / Build416`，即使更高 Test 已发布。
- 用户明确反馈：新测试版仍要从正式仓导入，因此一直不敢升级正式版。这是正确的风险判断；正式仓目前仍承担救援/跳板职责，不能在测试仓自更新失效时晋级。

### 根因
1. `catalog_refresh_v1.js` 的 `save()` 每次写统一版本目录时都会执行 `c.apps['rule-repo']=selfMeta()`，而该模块的 SELF_VERSION/BUILD 固定为 RC26/416，因此任何云端更高规则仓 Test 都会被本地重新覆盖回 RC26。
2. RC27 为修更新统计又对 `rule-repo` 的 `fastChannelCache()` 固定返回 RC27 selfMeta。它能保证当前身份正确，却仍然无法接受“未来更高版本”。
3. `channel_catalog_snapshot.json` 中规则仓 self 条目本身也属于共享目录历史快照，不应继续承担规则仓自身更新的唯一真相。
4. 结果形成“运行版本、统一目录 self、后置 patch self”三份硬编码真相，测试仓无法自举发现下一版。

### RC28 修复
- 新增 `releases/test-3.5.6-rc28/self_update_patch.js`，把“规则仓自身更新”从统一大目录解耦。
- 规则仓自身主动“检查版本”只读取小文件 `apps/tools/rule-repo/channels.json`；Raw / GitHub Raw / jsDelivr 三镜像并行，按 Test `build` 最大值选择最新有效结果。
- 最新 self channels 缓存到独立本地 `self_channels_v1.json`；正常首页/详情仍然只读本地，不因自更新重新引入启动联网。
- 当前运行 RC28/418 只作为“最低可信保底”：本地 self feed 低于 418 时显示 RC28；未来 feed 出现 RC29/419 或更高时必须接受更高版本，禁止再以当前版本覆盖未来版本。
- `fastChannelCache()`、`channelMeta()`、`fastItemState()` 对规则仓自身全部改读 self feed；因此版本中心、首页可更新与更新中心使用同一 self 真相。
- 其它小程序继续使用 RC26 统一版本目录，不因为规则仓自身更新改回逐程序联网。
- 轻同步在原 RC24/RC26 流程后追加 self feed 刷新；规则仓自身“检查版本”只刷新 self feed，不加载完整 Runtime。

### 静态门禁
- `self_update_patch.js`、`shell_bridge_v6.js` 通过 `node --check`。
- `rule_repo_test_v165.txt` 外层 JSON、`pages` JSON、14 段 `js:` 入口全部通过解析/语法检查。
- Stable 3.5.5、Runtime Build402、RC24/25/26/27 已验证功能均未修改。

### 强制发布验收
1. 本次仍需从 Stable 3.5.5 **最后一次**覆盖安装 RC28，因为 RC27 自身无法发现未来版本，这是本次要修的故障本体。
2. RC28 安装后，其自身版本中心必须至少显示当前 `RC28 / Build418`，不得再回退 RC26。
3. 点击规则仓自身“检查版本”必须快速返回，不扫描全部程序。
4. 在 RC28 实机通过后，发布一个只用于自更新闭环验证的 RC29 探针。
5. **RC28 必须在测试仓内部发现 RC29，并从测试仓直接覆盖升级 RC29；不得再借助 Stable。**
6. 只有上述闭环通过后，才允许讨论把规则仓 Stable 从 3.5.5 晋级。

## 历史
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
- 专项事故：`docs/INCIDENT_RULE_REPO_SELF_UPDATE_LOCK_20260825.md`
