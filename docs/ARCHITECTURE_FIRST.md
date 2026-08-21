# 海阔小程序 Architecture-First 规则

版本：1.1  
日期：2026-08-22

从 2026-08-20 起，后续新开发和大幅重构的小程序默认执行“先产品、先架构、后功能”。起点官方生态书源的模块隔离思路作为长期参考。

## 1. 当前运行仓基线

自 2026-08-22 起：

- 正式远程运行仓：`huoguotiankong/asset-core-7f3@main`。
- `landing`：只承担低信息默认展示，不用于运行。
- `hiker-cloud`：历史 Private 仓，只查历史，不新增正式运行依赖。

涉及仓库迁移必须读取 `docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`。

## 2. 模块边界

正式版在写首页、搜索、详情等业务前，先确定：

```text
Shell / Bootstrap     启动、路由、版本装载、仓库入口
Core                  请求、缓存、状态、存储、并发、更新
Provider / API        站点接口、签名、Token、解密、重试
Adapter               统一内部数据模型
Pages / UI            首页、搜索、详情、阅读器/播放器、设置
Optional Modules      评论、社区、下载、字幕、网盘、弹幕等
```

## 3. 局部维修原则

- 搜索坏了只修 Search。
- 播放坏了只修 Player/PlayAdapter。
- 某个 Provider 失效只修该 Provider。
- UI 调整优先只改 Renderer/UI。
- 更新机制变化只改 Bootstrap/Update Manager。
- 仓库地址变化必须同时检查 Shell、Bootstrap、runtime、release 和手机已安装壳。

模块之间通过明确数据契约交互。未启用的 Provider、评论、播放或其它模块不应初始化或执行。

非常小的原型允许单文件验证，但进入长期维护 Stable 前必须完成拆分。

## 4. Remote Module 版

自用 Remote Module 版的 `release.json` 按模块列出业务文件；普通业务修复尽量只修改受影响模块并发布新 release，海阔轻量壳保持稳定。

但以下变化必须升级 Shell：

- Bootstrap URL/仓库地址变化。
- 页面声明/规则壳结构变化。
- Shell 兼容字段变化。
- 旧 Shell 已经写死失效远程地址。

仓库迁移时，只有“旧仓 Private 后，不重新安装仍能正常运行”才算真正完成。

## 5. 规则仓库参考结构

“我的规则仓库”是 Architecture-First 工具程序：

```text
Shell -> Bootstrap -> Remote Manager
                    -> Repository Core
                    -> Filter / Search
                    -> Home UI
                    -> Detail / Settings / Version UI
```

正式版和测试版因自举恢复职责允许分名并存；测试版失败不能破坏正式恢复链。

旧程序不要求一次性重写。只有继续大改、频繁维修或准备长期维护时再逐步迁移，迁移优先保证现有稳定功能不回退。
