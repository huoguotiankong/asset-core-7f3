# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC28 完整记录已冻结到 `CHANGELOG_RC28_20260825.md`；RC27、RC26 及更早历史继续保留。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结；RC28→RC29 测试仓自更新闭环已经用户实机确认通过，RC30 导入提速回归通过前暂不晋级。
- Test：`3.5.6-rc30 / Build420`，Shell `rule_repo_test_v167.txt` / rule version `2026082506`。
- Runtime 基线仍为 immutable `3.5.6-rc12 / Build402` + Local Module Manager `2.2.0` + `require(file://)`。
- RC24 本地图标、RC25 原生 `.txt` 导入、RC26 普通程序三镜像版本目录、RC27 多版本更新统计、RC28 独立 self feed、RC29 自更新闭环均保持。

## 2026-08-25 · 3.5.6-rc30 / Build420 · Immutable Import Fast Path

### RC29 实机闭环结论
- 用户 09:21 实机截图确认：详情顶部显示“当前安装：测试版 3.5.6-rc29”，可用版本中的 `测试版 3.5.6-rc29` 标记为“当前运行”。
- 本次升级由 RC28 测试仓自身发现并导入 RC29，期间不需要打开 Stable 作为跳板。
- 因此 RC28 → RC29 的“发现新 Test → 原生导入 → 覆盖安装 → 重启 → 识别新 Test”自更新闭环正式判定通过。

### 用户反馈与根因边界
- 用户反馈普通程序点击“导入”后，仍要等待较久才出现海阔原生导入提示。
- RC25 之后规则仓已经只把远程 Shell 交给 `home_rule_url`；完整 Runtime / 图片资源并不在这一步下载，所以不能把等待简单归因于整个小程序体积。
- 当前 RC25 `nativeUrl()` 使用 `cdn.jsdelivr.net/...@main/<path>?v=<version>`；`@main` 是可变分支，需要 CDN 解析当前分支指向并处理边缘缓存一致性，不适合作为已经发布版本的导入热路径。

### RC30 实现
- 新增 `releases/test-3.5.6-rc30/import_ref_catalog_v1.json`：约 3 KB，本地保存当前目录 29 个 Remote/Test/Stable `.txt` Shell 的不可变 commit SHA。
- 新增 `import_fast_path_patch.js`：普通 `.txt` 导入时优先读取对象自身 `importRef`，其次查询本地固定版本目录；命中 40 位 SHA 后生成 `cdn.jsdelivr.net/gh/<repo>@<sha>/<path>`，不再使用 `@main`。
- 若新版本尚未登记 `importRef`，自动调用 RC25 已验证的原生导入链，保持 fail-safe，不因加速目录缺项导致无法导入。
- RC30 自身 `channels.json` 已增加 `importRef`，为后续 RC31+ 自更新使用固定版本导入地址建立元数据契约。
- `shell_bridge_v8.js` 只在 RC30 首次启动缺少本地文件时，三镜像固定 commit 下载 RC30 patch 与 importRef 目录；正常启动继续 Local-First。
- `rule_repo_test_v167.txt` 固定读取 immutable `shell_bridge_v8.js`，外层 JSON、内层 pages JSON、14 段 `js:` 入口已通过解析/`node --check`。
- 本版不改 Runtime Build402，不改 Stable，不改任何业务小程序的运行代码。

### RC30 实机验收
1. 当前 RC29 测试仓点击“检查版本”，应发现 `3.5.6-rc30 / Build420`。
2. 从 RC29 覆盖导入 RC30；**这一次 RC29→RC30 仍走旧 RC25 导入器，因此耗时不能作为 RC30 提速结论**。
3. 重开测试仓，详情必须显示 RC30 / Build420 为“当前运行”。
4. 任选一个普通 Remote/Test/Stable `.txt` 小程序（建议黄豆短剧或麻豆AI），在 RC30 中再次点击导入。
5. 对比“点击导入 → 海阔弹出导入提示”的等待时间；应重点观察是否明显短于 RC29。
6. 完成一次覆盖导入，确认程序名称/版本识别和导入动作没有退化。
7. 若速度仍慢，则下一层瓶颈基本落在 jsDelivr 固定对象首包或海阔原生 `home_rule_url` 内部，不再继续把 Runtime 体积作为主因。

### Stable 门禁
- RC30 只验证导入链性能与兼容性。
- 实机确认固定 SHA 导入正常且无回归后，再把“发布版本必须携带 immutable `importRef`”写入跨程序开发规范。
- Stable 3.5.5 / Build389 在此之前继续冻结。

## 历史
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
- 自更新事故：`docs/INCIDENT_RULE_REPO_SELF_UPDATE_LOCK_20260825.md`
