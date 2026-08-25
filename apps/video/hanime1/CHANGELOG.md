# Hanime1 Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Test1→Test40 / Stable2.0.1 历史原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。恢复事实优先级仍为：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动基线
- Stable：`2.0.1 / Build20040`，继续冻结，不因本次迁移修改。
- Test：`2.0.2-test.1 / Build20101`，Shell `hanime1_remote_test_localfirst_v1_b20101.txt`，rule version `2026082510`。
- Test release：`apps/video/hanime1/releases/2.0.2-test.1/release.json`。
- 业务基线：Stable 2.0.1 = 用户批准的 Test40 状态；搜索、账号、评论头像/更多回复、播放等业务模块不在本轮主动改写。
- 更新责任：新 Test 不再用历史 Remote Manager/Bootstrap 的应用内更新按钮；版本更新由“我的规则仓库”统一管理。

## 2026-08-25 · 2.0.2-test.1 / Build20101 · Local-First Delivery Migration

### 恢复链确认
- Stable `2.0.1` 的真实运行体仍是 `Stable recovery → Test40 → Test39 → Test38 → Test37 → Test32 → Test31 → Test30 → Stable2.0.0 → Test29 → Test26 → Test25 → Test24 → Test23 → Test17 → Test16 → Test15`。
- Test15 底座固定加载 50 个基础模块；后续恢复层再叠 40 个稳定/修复模块；本轮最后加 1 个 Local-First settings overlay，总计 91 个模块。
- Test27 / Test28 / Test34 仍保持 broken/quarantined 事实；仅复用 Test29 明确选择过的 Test28 `replies28.js / creator28.js`，没有重新启用坏 UI 链。

### 新交付架构
- `final_local_patch.js`：在完整 Stable2.0.1 业务链之后覆盖设置页；保留账号/布局/线路/浏览器验证，移除远程 Bootstrap check/update/reinstall/rollback 回调，增加本地 bundle 诊断/重建。
- `local_bundle_builder.js`：source ref 固定为 `4adf88294895d309308ebfe8a10f70e42bcde011`；首次安装按历史真实顺序抓取 91 个模块，并生成 `runtime_base.js / runtime_mid.js / runtime_upper.js`。
- `local_entry.js`：正常运行只检查本地 builder/meta，并按顺序 `require(file://)` 三个 bundle。
- 新 Shell `hanime1_remote_test_localfirst_v1_b20101.txt` 约 4.5 KB；仅 Entry 缺失时从 immutable ref 安装一次，二级页面继续复用 `$.require('hanime')`。
- 正常二次启动不再加载 Remote Manager、不再访问 Bootstrap、不再执行十几层 recovery loader，也不读取 GitHub/CDN 业务代码。
- 网站业务网络请求仍按 Hanime1 本身需要正常发生；“Local-First”只描述程序代码/控制面交付，不表示视频站内容离线。

### 静态门禁
- `final_local_patch.js`、`local_bundle_builder.js`、`local_entry.js` 均按等价本地内容通过 `node --check`。
- Shell 外层 JSON、`pages` JSON、主加载器语法已通过本地解析；规则 version `2026082510` 位于 32 位有符号整数安全范围。
- Stable `2.0.1 / Build20040`、Latest、旧 Test40 工件全部未覆盖。

### 实机验收
1. 在“我的规则仓库”同步版本目录后，应看到 `Test 2.0.2-test.1 / Build20101`。
2. 首次打开 Test1 允许有一次明显等待：需要下载并生成 3 个本地 bundle。
3. 首次成功后完全退出，再第2次打开；应不再经过 GitHub/Bootstrap/recovery 链，启动明显稳定。
4. 回归首页/推荐/片库/漫画/搜索“女友”/视频详情/播放/我的/账号/评论/更多回复/设置。
5. 设置页应显示 `2.0.2-test.1 / Build20101 · Native Local-First`，点击“本地化诊断”应看到 bundle ready、91 modules、source ref。
6. 账号、评论头像、更多回复等若与 Stable2.0.1 行为不同，视为本地 bundle 合成语义回归，禁止晋级 Stable。
7. Test 通过前 Stable 继续保持 `2.0.1 / Build20040`。

## 历史
- 完整迁移前历史：`apps/video/hanime1/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
