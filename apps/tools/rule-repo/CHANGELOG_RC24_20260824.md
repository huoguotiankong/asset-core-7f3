# 3.5.6-rc24 / Build414 · Local Icon Pack（待实机验证）

- RC23 已由实机确认：独立轻同步可以成功完成，版本详情继续保持本地秒开；同步不再触发 Build402 Runtime 状态维护。
- RC23 后续实机仍显示“黄豆 / 麻豆 / Ha”等文字占位。根因不是轻同步失败，而是为避免同步卡死，RC23 已明确从普通同步中移除了逐程序图标下载，因此真实图标资产没有新的本地交付渠道。
- RC24 新增 `icon_catalog_snapshot.json`，当前约 11KB，覆盖根云仓当前全部程序的统一 SVG 品牌图标。不同来源的 GitHub PNG/SVG、CloudFront、favicon、外部图片站不再直接进入首页热路径。
- `sync_scheduler_v4.js` 内嵌同一份基础图标包：RC24 首次运行即可把图标包写入 `hiker://files/rules/asset-core-local/rule-repo-test/icon_catalog_v1.json`，因此不要求用户先执行同步才显示图标。
- 首页 `iconOf/localizeIcon` 改为：已存在的真实本地文件优先 → 统一本地图标包 → 规则仓库内置图标兜底；浏览热路径不逐卡访问远程图标 URL。
- 轻同步仍保持 RC23 的独立调度原则，仅一次 `batchFetch` 并行读取根 manifest、统一版本目录和约 11KB 图标包；不逐图下载、不调用 `RuleRepoLocal.load()`、不检查/重建 Runtime package state、完成后不自动整页刷新。
- 新增 `shell_bridge_v2.js` 与 `rule_repo_test_v161.txt`；Build402 Runtime、Bootstrap 1.0.55、Local Module Manager 2.2.0 全部保持不变，避免图标修复扩大到已验证主启动链。
- 当前状态：Test 已激活 3.5.6-rc24 / Build414，等待实机验证首页品牌图标是否即时显示、轻同步是否继续快速稳定。Stable 继续冻结 3.5.5 / Build389。
