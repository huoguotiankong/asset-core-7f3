# 我的规则仓库 CHANGELOG

## 2026-08-24 · 3.5.6-rc12 / Build402 · Local-First Bootstrap Scope Fix
- P0 修复：RC11 首次启动时 Shell 通过 `require()` 加载 Bootstrap，但 `RuleRepoBoot` 定义在 Bootstrap IIFE 的局部作用域，导致海阔实机报错“RuleRepoBoot 未定义”，本地运行包尚未开始安装即终止。
- RC12 Shell 改为在同一 Rhino 执行作用域中 `fetch + eval` 不可变 Bootstrap，并在 eval 前显式声明 `var RuleRepoBoot`，不再依赖 `require()` 的全局导出副作用。
- RC12 Bootstrap 同样改为 `fetch + eval` Local Bundle Manager 2.1.0；在 manager() 内显式声明 `var HikerLocalBundle`，杜绝模块作用域泄漏假设。
- Local-First Runtime 15.1.1 的完整本地 Release、原子 active/previous、本地图标、全量 channels 本地快照、per-app channels 权威事实源全部保留。
- Stable 继续冻结在 3.5.5 / Build389；RC12 必须先完成首装、二次启动、版本中心、黄豆 Test2、断 GitHub 运行实机回归后才允许继续迁移或晋级。

## 2026-08-24 · 3.5.6-rc11 / Build401 · Local-First Channel Truth
- Local-First Runtime 15.1.1：程序自己的 `channels.json` 成为版本中心权威真相，根 manifest 仅承担目录发现/摘要职责。
- 保留 RC10 的本地运行包、本地图标、同步时全量 channels 快照能力。

## 2026-08-24 · Local-First Runtime Migration
- 项目开始从“远程运行”迁移为“远程发布、本地运行”：安装/升级时拉取不可变 Release 到规则私有文件，全部写入并校验成功后才切 active，previous 保留回退。
- 第一批试点：我的规则仓库 Test + 黄豆短剧 Test；Stable 均冻结。

> 历史完整记录保留在同目录既有 `CHANGELOG_pre_*` 文件及 Git 历史中。
