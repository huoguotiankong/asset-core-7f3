# RC23 同步事故记录（2026-08-24）

## 实机现象
RC22 首页和版本详情已经本地秒开，但点击“同步”长时间阻塞，最终提示：

`轻同步失败：本地运行包不可用：状态文件写入失败：__hclocal22_rule-repo-test_b402.json`

## 根因
RC22 虽然将根 manifest + 统一 channel catalog 网络请求收敛为 Light Sync，但同步 lazyRule 仍先调用 `RuleRepoLocal.load()`。当该 lazyRule 上下文无法读取现有私有 package 元数据时，Loader 会误判 Build402 本地包缺失，进入 Bootstrap → Local Module Manager 2.2.0 的安装/重建路径；模块可能被重新检查/下载，最终 `saveFile(...,0)` 写规则私有 package/state 失败。于是一个本应只更新两个 JSON 的轻同步动作重新耦合了完整 Runtime 维护链，并造成长阻塞。

## RC23 修复
- 新增 `sync_scheduler_v3.js`，普通同步回调完全不调用 `RuleRepoLocal.load()`、Bootstrap 或 Local Module Manager。
- 同步仅一次 `batchFetch` 请求根 `manifest.json` + `channel_catalog_snapshot.json`，单路超时 3.8 秒。
- 成功后只写本地 manifest cache 和 `hiker://files/rules/asset-core-local/rule-repo-test/channel_catalog_v2.json`。
- 同步完成后不自动执行 `refreshPage(false)`，避免网络动作结束后马上触发完整 Runtime/页面重载；提示用户下次手动刷新/重新进入自然生效。
- 同步失败保持旧本地快照，版本详情继续可用。

## 后续共享 Runtime 修复
Local Module Manager 2.2.0 的 JS 模块已存放在公共持久目录，但 package/state 元数据仍使用规则私有 `saveFile/readFile`。后续 2.2.1 应将 package/state 同样迁移到 `hiker://files/rules/asset-core-local/<app>/meta/` 公共持久目录，并支持从已经存在的 `b<build>/m*.js` 自动重建 package manifest，避免规则更新或 lazyRule 上下文差异导致本地 Runtime 被误判丢失。

## 发布状态
- Stable: 3.5.5 / Build389（不变）
- Test: 3.5.6-rc23 / Build413
- Shell: `rule_repo_test_v160.txt`
- Runtime Base: RC12 / Build402（不变）
- Sync Scheduler: v3 standalone
