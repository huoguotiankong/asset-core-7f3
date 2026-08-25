# 我的规则仓库 RC36 冻结记录

> RC36 / Build426：从 Stable 3.5.5 快启动链重基线，撤销 RC33-RC35 Flat Local-First。用户随后实机发现：除规则仓自身外，多版本程序详情全部显示“0 个可用版本”。

## 关键事实
- RC36 首页为了性能不预取所有程序 `channels.json`。
- Stable Single Workspace 的程序卡点击逻辑是在 WebView 内直接 `go('detail', id)`，不会重新执行海阔详情页 Runtime。
- 因此首页 DATA 中 `program.channels=[]` 会被原样带进详情，造成 Pornhub/JavBus/JavDB/MyAv 等所有 channel-group 显示 0 个版本。
- 这不是业务程序损坏，也不是各程序 `channels.json` 丢失，而是规则仓前端详情桥接缺失。
- RC36 的“首页不做 N+1 channels 请求”方向保留；详情行为由 RC37 改为只在首次点击当前程序时按需加载该程序 channels。
