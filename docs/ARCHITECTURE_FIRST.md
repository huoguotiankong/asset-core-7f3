# 海阔小程序 Architecture-First 规则

从 2026-08-20 起，后续新开发的小程序默认执行“先架构、后功能”。起点官方生态书源当前的模块隔离思路作为长期参考。

正式版在写首页、搜索、详情等业务前，先确定以下边界：

```text
Shell / Bootstrap     启动、路由、版本装载
Core                  请求、缓存、状态、存储、并发、更新
Provider / API        站点接口、签名、Token、解密、重试
Adapter               统一内部数据模型
Pages / UI            首页、搜索、详情、阅读器/播放器、设置
Optional Modules      评论、社区、下载、字幕、网盘、弹幕等
```

维修目标固定为局部化：搜索坏了只修 Search；播放坏了只修 Player/PlayAdapter；某个 Provider 失效只修该 Provider；UI 调整优先只改 Renderer；升级机制变化只改 Bootstrap/Update Manager。

模块之间通过明确的数据契约交互。未启用的 Provider、评论、播放或其它模块不应被初始化或执行。非常小的原型允许先单文件验证，但进入长期维护的稳定版本前必须完成拆分。

自用 Remote Module 版的 `release.json` 应按模块列出业务文件；普通业务修复尽量只修改受影响模块并发布新业务 release，云仓库轻量壳保持稳定。

“我的规则仓库 v3.0.0”是首批 Architecture-First 工具程序：

```text
Shell -> Bootstrap -> Remote Manager
                    -> Repository Core
                    -> Filter / Search
                    -> Home UI
                    -> Detail / Settings / Version UI
```

旧程序不要求一次性重写。只有继续大改、频繁维修或准备长期维护时再逐步迁移，迁移优先保证现有稳定功能不回退。
