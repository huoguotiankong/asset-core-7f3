# Remote Module 发布检查清单

每次发布业务新版本时：

1. 新建或确认业务模块文件，旧版本文件不原地覆盖。
2. 新建 `releases/<version>/release.json`，填写 version/build/modules/verify。
3. 确认所有远程模块可通过海阔 `require(url, options, version)` 独立加载。
4. 检查页面 lazyRule 是否错误依赖旧本地源码变量；必要时只保留远程 loader 兼容指令。
5. 执行海阔违禁词扫描；UI 文本可做零宽/Base64，协议值必须保持运行时原值。
6. 校验海阔规则壳的数值 `version` 字段必须为有符号 32 位整数（<= 2147483647）。统一使用 `YYYYMMDDNN` 形式的 10 位安全版本号，例如 `2026082042`；禁止把三位 build 直接追加到日期后形成 11 位整数。
7. 验证搜索、首页、详情、播放/阅读、设置和关键登录态。
8. 最后才更新 `latest.json` 指向新 release。
9. 在 `CHANGELOG.md` 记录变化。
10. 实机点击“检查更新 → 立即更新 → 回退上一版本”验证闭环。

启动壳只有 Bootstrap 协议不兼容时才需要重新发布到云仓库。
