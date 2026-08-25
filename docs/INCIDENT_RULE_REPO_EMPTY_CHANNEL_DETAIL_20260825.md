# 规则仓 RC36 多版本详情 0 个版本事故

## 实机现象
- 用户升级到 RC36 后，规则仓自身页面正常，但 Pornhub、JavBus、JavDB、MyAv 等多版本程序详情统一显示“版本数量 0 个 / 可用版本 0 个”。
- 业务程序自身文件、各自 `channels.json` 并未丢失。

## 根因
- RC36 为修复首页性能，取消首页对所有程序 `channels.json` 的预取，这是正确方向。
- 但 Stable 3.5.5 的 Single Workspace 程序卡点击逻辑只在 WebView 内执行 `go('detail', id)`，详情直接读取首页初始化时已经序列化的 `DATA.programs`。
- 首页没有预取 channels 时，channel-group 的 `program.channels=[]`；点击详情不会重新调用 Runtime，因此所有多版本详情都显示 0 个版本。

## 禁止修法
- 禁止为了修详情重新在首页循环读取所有程序 `channels.json`，这会重新引入 N+1 网络请求和启动阻塞。
- 禁止把统一 snapshot 再提升为版本真相源；它只能作为离线摘要，不能替代 per-app `channels.json`。

## 正确修法
- 首页保持 cache-only、零 channels 网络请求。
- channel-group 首次点击且前端 `channels` 为空时，通过一个轻量 lazyRule 只读取当前程序自己的 `channels.json`，写入本地 per-app cache，然后进入完整详情。
- 已有 per-app cache 时详情直接打开，不重复联网。
- 程序版本真相仍是各程序自己的 `channels.json`。

## 回归要求
- 首页二次启动不得因本修复变慢。
- 任一多版本程序首次详情最多新增当前程序 1 份 channels 控制面读取，不能触发全目录网络请求。
- Pornhub、JavBus、JavDB、MyAv 等应恢复实际 Stable/Test/Local 卡片，不得再显示 0 个。
