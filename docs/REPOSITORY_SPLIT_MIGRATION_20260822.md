# 仓库拆分与迁移基线（2026-08-22）

状态：已完成并通过实机断旧仓验证。

## 1. 当前仓库角色

### `asset-core-7f3`

当前正式运行仓库，保持 **Public**，但默认分支设为 `landing`。

- `landing`：对外默认展示分支，只保留中性入口，不承载业务代码。
- `main`：海阔远程运行分支，承载 Shell、Bootstrap、Remote Manager、业务 release、元数据、文档与资源。
- 所有新的远程地址、Raw、jsDelivr、GitHub Web Raw 都必须指向 `asset-core-7f3@main`。
- 新开发和维护不再新增任何对旧仓库的运行依赖。

### `hiker-cloud`

历史开发仓库，现为 **Private**。

- 保留历史提交、旧版本、开发过程和迁移前资料。
- 不再作为正式运行源、更新源、Raw 源或 jsDelivr 源。
- 不得因为旧文件仍存在就继续引用它。
- 需要查历史实现时可以读取；需要发布时必须把有效代码落到 `asset-core-7f3/main`。

## 2. 已验证迁移结果

2026-08-22 完成以下实机验证：

- “我的规则仓库”正式版重新覆盖后，可正常打开、同步和导入程序。
- “我的规则仓库·测试版”重新构建完整规则壳后，可正常导入、打开和导入程序。
- JavDB v3 重新覆盖后，可正常打开首页和详情。
- ACFun 在旧仓 Private 状态下仍正常运行。
- 黄豆短剧、麻豆AI、Hanime1、JavBus 可从新规则仓库正常交付；它们本身为本地规则或外部独立更新，不依赖旧仓运行。
- 最终将 `hiker-cloud` 设为 Private 后再次测试通过，判定正式运行链已脱离旧仓。

## 3. 这次迁移暴露的关键问题

迁移远程文件本身并不等于迁移完成。海阔手机里已经安装的规则壳会继续保存旧 URL。

本次真实故障：

1. 新仓代码已经迁移，但手机上旧“我的规则仓库”壳仍写死 `hiker-cloud`。
2. JavDB v3 已安装壳仍写死旧 `raw.githubusercontent.com/.../hiker-cloud/.../runtime.js`。
3. 旧仓一改 Private，旧壳立即失效；ACFun 因手机上已经安装的是新壳，所以没有受影响。
4. 测试版规则仓库迁移壳最初使用过度精简结构，重新导入时触发海阔 `begin ..., end -1` 解析异常；改成与正式版一致的完整规则字段结构并提升数值 version 后恢复。

## 4. 以后任何仓库迁移必须执行的顺序

```text
新仓准备完成
→ 完整复制正式运行文件
→ 批量替换远程 URL
→ 检查 Shell / Bootstrap / Manager / release / runtime
→ 新仓实机运行测试
→ 重新覆盖安装所有“已经落到手机里的旧规则壳”
→ 再次确认壳内 URL 已变更
→ 旧仓改 Private / 下线
→ 不重新安装，直接做断旧仓实机验证
→ 全部通过后才宣布迁移完成
```

禁止：只检查 GitHub 新仓文件正确，就直接把旧仓 Private。

## 5. 公开仓低可发现性策略

目标不是加密代码，而是降低“随手搜索关键词就发现整个项目”的概率。

- 仓库名使用中性名称：`asset-core-7f3`。
- 默认分支使用 `landing`，不在默认展示页放海阔、规则仓库、ACFun、JavDB 等明显关键词。
- 真正运行代码位于 `main`，海阔明确使用 `@main`。
- `landing` 不放 README、项目介绍、Topics、开发说明。
- 完整开发历史和旧资料放在 Private `hiker-cloud`。
- 不把该策略误解为访问控制：知道仓库地址和 `main` 分支的人仍可查看 Public 代码。

## 6. 文档维护要求

今后新对话先读：

1. `docs/PROJECT_PLAN.md`
2. `docs/HIKER_APP_DEVELOPMENT_GUIDE.md`
3. `docs/HIKER_APP_DEVELOPMENT_CAUTIONS.md`
4. 本文件（涉及仓库、远程更新、发布、迁移时必读）
5. 目标程序自己的 `CHANGELOG.md`
6. 当前 `registry.json / channels.json / stable.json / test.json / latest.json / release.json`

所有文档中如果再出现“`hiker-cloud` 是正式运行仓库”的表述，都视为历史旧信息，应改为本文件规定的新职责。

## 7. `main` 多任务并发下的原子发布规则（2026-08-23）

`asset-core-7f3@main` 现在同时承载多个小程序的正式开发和发布。实际发布“我的规则仓库”3.5.5 时，JavDB、XVideos 在同一时间窗口继续推进 `main`，证明不能再假设“本任务开始时读到的 HEAD 在发布结束时仍然有效”。

以后所有远程发布统一拆成两阶段：

```text
A. 不可变资产准备
Release / 业务模块 / Bootstrap / Shell 依赖先落盘
→ 回读确认路径和内容存在
→ 此阶段不得提前切 stable/test/latest/channels 活动指针

B. 活动指针切换
发布前重新读取最新 main HEAD
→ 基于最新 tree 仅叠加本程序的指针改动
→ 创建单个 Git tree commit
→ fast-forward main
```

如果 `main` 在 tree/commit 构建期间再次前进：

```text
禁止 force
→ 丢弃旧基线上的待发布 commit
→ 读取新的 HEAD/tree
→ 将本程序改动重新叠加到最新 tree
→ 再 fast-forward
```

目录级元数据同样遵循该原则。尤其 `manifest.json` / `manifest_meta.json` / `registry.json` 是跨程序共享文件，写入前必须重新读取当前版本，禁止用旧聊天快照或早先下载副本整体覆盖。

可变元数据交付还必须与不可变 Runtime 分离：

- Shell/Bootstrap/Release 等已发布运行文件优先固定不可变 commit 或版本路径。
- `latest.json / test.json / channels.json` 等活动指针允许变化，但客户端必须使用多源容错、最后成功缓存和 build floor，不能把 jsDelivr `@main` 的陈旧值当作强一致真相。
- 根目录卡片发布完成条件继续要求 `manifest.revision === manifest_meta.revision` 且 `manifest.items.length === manifest_meta.itemCount`。

该规则既适用于仓库迁移，也适用于迁移完成后的日常多程序并发发布。
