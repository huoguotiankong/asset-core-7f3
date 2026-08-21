# Remote Module 发布检查清单

版本：2.0  
日期：2026-08-22

当前正式运行仓库：`huoguotiankong/asset-core-7f3@main`。`landing` 仅作低信息默认展示，历史 `hiker-cloud` 已 Private，不得再新增正式运行依赖。

每次发布业务新版本时：

1. 先读三份全局文档、目标程序 `CHANGELOG.md` 和当前 `stable/test/channels/latest/release`，确认真实运行基线。
2. 新建或确认业务模块文件，Stable 已引用文件不原地覆盖。
3. 新建 `releases/<version>/release.json`，填写 version/build/modules/verify/contract。
4. 确认所有远程模块可从 `asset-core-7f3@main` 独立加载；至少检查 jsDelivr、GitHub Raw/Web Raw 中实际使用的线路。
5. 搜索旧仓库标识 `hiker-cloud`、旧 Raw/jsDelivr 地址；新版本正式运行代码中不得新增旧仓引用。
6. 检查 Shell、Bootstrap、runtime 和页面 lazyRule 是否存在写死的旧 URL，不能只检查 release 模块。
7. 检查页面 lazyRule 是否错误依赖旧本地源码变量；需要时使用显式规则上下文或 Bootstrap 恢复链。
8. 执行海阔违禁词扫描；UI 文本可做零宽/Base64，协议值必须保持运行时真实值。
9. 校验海阔规则壳数值 `version <= 2147483647`。推荐 `YYYYMMDDNN` 10 位安全版本号；禁止 11 位整数。
10. 验证首页、搜索、详情、播放/阅读、设置、登录态，以及该程序最核心的独有功能。
11. Test/Candidate 先实机 smoke test，确认后才晋级 Stable。
12. 最后才更新 `latest.json` / `stable.json` 指向新 release。
13. 在目标程序 `CHANGELOG.md` 记录版本、根因、修复、验证结果和回退方式。
14. 实机验证“检查更新 → 立即更新 → 回退/重装”闭环。
15. 如果改过仓库地址、Bootstrap/runtime URL 或 Shell 内容，必须重新覆盖安装 Shell，并确认手机中的规则已经是新 URL。
16. 如果准备下线/Private 旧仓库：先覆盖所有旧 Shell，再把旧仓下线，然后**不重新安装**直接做断旧仓实机验证。
17. 断旧仓验证至少覆盖：规则仓库 Stable/Test 的导入、主要远程程序打开/详情、独立本地程序的交付入口。
18. 全部通过后才允许宣布迁移或发布完成。

仓库迁移事故与标准顺序见：`docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`。
