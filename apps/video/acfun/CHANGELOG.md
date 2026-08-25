# ACFun Changelog

> 当前恢复入口。迁移前完整 Stable0.4.9 / Native Alpha1→Alpha11 / Web1→Web3 历史见 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`；Local-First Test50001/50002 完整记录归档到 `CHANGELOG_LOCALFIRST_50001_50002.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.4.9 / Build149 / Shell5.11.3`，继续冻结。
- Test：`0.5.0-test.3 / Build50003`，规则标题改为 `ACFun·测试版`，只验证缓存/私有存储隔离后的 Local-First 运行链。
- Candidate：`1.0.0-alpha11 / Build10011`，继续独立保留。
- Web：`1.2.0-web3 / Build11003`，继续独立保留。
- Latest：仍指向 Stable0.4.9；Test50003 实机通过前不晋级 Stable。

## 2026-08-25 · 0.5.0-test.3 / Build50003 · Rule/Page Cache Isolation

### 用户实机事实
- Test50001 打开直接报：`InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`，JSEngine 行848。
- Test50002 增加 `storage_preflight`、文件型 Remote Config/Frontend Discovery Guard 和全新 `b50002` 后，用户再次实机测试仍报完全相同的行848错误。
- Test50002 的 `storage_preflight` 已插在 Stable Core 之前；如果新 bundle 真正执行，Stable Core 后续错误行号理论上应整体后移。两版错误行号完全相同，因此旧页面模块/旧运行缓存不能排除。

### 新确认的缓存冲突
Test50001 与 Test50002 Shell 均同时复用：
- 规则标题：`ACFun`
- 主程序 page path：`acfun`
- 所有入口：`$.require('acfun')`

这会让覆盖导入后的测试版继续共享旧 ACFun 私有 KV 命名空间，并可能继续命中海阔 `hiker://page/acfun` 模块缓存。

### Test50003 隔离方案
本版同时更换三层身份：

```text
规则标题：ACFun·测试版
主 page module：acfun50003
本地 Runtime 目录：hiker://files/rules/asset-core-local/acfun-test/b50003/
```

- 正式版 `ACFun` 不再被测试版覆盖，可与 `ACFun·测试版` 同时存在，便于直接对比。
- 所有首页/搜索/详情/评论/收藏/历史/设置/诊断入口统一 `$.require('acfun50003')`。
- Stable 0.4.9 原 8 个业务模块继续保持不变。
- Test50002 的 `storage_preflight` 与文件型 `storage_guard_patch` 继续复用。
- `acfun_core_src_v018/v019/acfun_remote_bundle_src` trampoline 改为 `var ac=$.require('acfun50003');`。
- 使用全新 `b50003`，不会命中 Test50001/50002 的本地 bundle。

### 不可变工件
- Test50003 overlay：`f4f3c1edfe2fdd3273e9f71db364fae53616aa47`
- Builder：`fc95796ba8393d56f0faa9b9a9b14cd59088e0f3`
- Entry：`5b1d85a36937afbda09e8cc2c69e19f0f59c2f1b`
- Release + Shell：`3d6b51dd97def4a3c30a73cb1d024aba589fe160`

### 静态门禁
- Test50003 Shell 外层规则 JSON、9 个 pages JSON 已解析通过。
- 9 个 `js:` page 入口已分别 `node --check` 通过。
- Shell rule version `2026082515` 位于 32 位有符号整数安全范围。
- Stable149 / Latest / Candidate / Web3 未修改。

### 实机验收
1. 在“我的规则仓库”同步后应看到 `ACFun·测试版 0.5.0-test.3 / Build50003`。
2. 导入后应新增独立的 `ACFun·测试版` 标签，而不是覆盖原 `ACFun`。
3. 第一次打开若成功，完全退出后再打开第2次，确认不再出现行848/1MB错误。
4. 回归首页、分类、搜索、视频详情、播放、收藏、历史、评论、漫画/封面与设置。
5. 如果 Test50003 仍出现完全相同的行848，则可基本排除旧规则标题私有 KV 和 `hiker://page/acfun` 模块缓存，下一步直接在 Stable149 运行时做全量 KV shim，而不是继续清缓存。
