# 云端仓库新程序发布链遗漏事故（2026-08-23）

状态：长期硬约束 / 跨程序适用。

## 1. 事故现象

新建 MyAv `0.1.0-test.1 / Build10101` 时，已经完成：

```text
apps/video/myav/*
→ Test / Release / Bootstrap / Shell
→ registry.json
```

GitHub main 中运行链本身存在，但用户在“我的规则仓库”实机中仍看不到 MyAv。

## 2. 根因

`registry.json` 是项目开发/恢复索引，不是手机端“我的规则仓库”的展示清单。

当前 Stable 3.5.4 的真实目录链为：

```text
HikerRuleRepo.manifestPath = manifest.json
→ root manifest.json.items
→ entryType=channel-group 时读取 item.channelsPath
→ apps/<category>/<app>/channels.json
→ 导入对应 Stable/Test/Local Shell
```

同时 `repository_patch.js` 使用根 `manifest_meta.json` 的 revision 进行目录新鲜度探针：

```text
manifest.json revision
必须与
manifest_meta.json revision
同步变化
```

只改 `manifest.json`、不改 meta，设备可能继续命中旧目录缓存。

MyAv 首版还暴露了第二个问题：其 `channels.json` 最初写成 `{stable:null,test:{...}}` 的内部元数据形态，而规则仓库通用版本中心消费的是：

```json
{
  "channels": [
    {"channel":"test", "path":"..."}
  ]
}
```

因此即使仅把卡片补进 manifest，也可能出现“能看到程序，但版本中心没有可导入版本”。

## 3. 永久发布顺序

以后任何新程序首次进入“我的规则仓库”必须完整执行：

```text
1. app 目录 / CHANGELOG
2. Test/Candidate/Stable 元数据
3. release.json + 实际模块
4. Bootstrap + Shell
5. app channels.json 使用规则仓库标准 channels[] 合同
6. registry.json 登记恢复链
7. root manifest.json 增加展示条目并提升 revision
8. root manifest_meta.json 同步相同 revision + 正确 itemCount
9. GitHub main 回读上述所有路径
10. 规则仓库执行“同步”或等待 revision probe
11. 实机确认：能看到卡片 → 能进入版本中心 → 能导入 → 导入后能打开
```

**`registry 已登记 ≠ 云端仓库已发布`。**

## 4. 修改边界

普通新增程序只需要修改动态目录数据，不得为了让新程序出现而修改“我的规则仓库”Stable Release、Bootstrap 或 Shell。

只有目录协议本身变化时，才按 Test/Candidate 流程升级规则仓库 Core。

## 5. MyAv 修复记录

2026-08-23 已完成：

- `manifest.json` 加入 MyAv Test 项。
- revision 提升到 `202608231103`。
- `manifest_meta.json` 同步到相同 revision，`itemCount=9`。
- MyAv `channels.json` 改为 schema 4 / `channels[]` Test-only 标准格式。
- MyAv CHANGELOG 记录本事故和恢复链。

后续以用户实机同步结果为最终事实。

## 6. 麻豆传媒 Test3 复发记录

2026-08-23 麻豆传媒从 Test2 发布 Test3 时再次复发同类问题：

- `apps/video/madou/test.json`、`channels.json`、Release、Bootstrap、Shell 已到 Test3。
- 根 `manifest.json` 也已经显示 Test3，并提升到 revision `202608231404`。
- 但 `manifest_meta.json` 仍停在 revision `202608231342`，`itemCount` 仍为 10。
- 用户实机“我的规则仓库”因此仍看到 Test2，证明仅回读 `manifest.json` 不能判定云仓发布完成。

已修复为：

```text
manifest.json revision = 202608231411
manifest_meta.json revision = 202608231411
manifest_meta.json itemCount = 11
```

以后每次修改根 `manifest.json` 后，发布结束前必须做一个成对断言：

```text
manifest.revision === manifest_meta.revision
&& manifest.items.length === manifest_meta.itemCount
```

这个断言属于发布完成条件，不是可选检查。

## 7. 911爆料首版复发记录

2026-08-23 新建 911爆料 `0.1.0-test.1 / Build10101` 时第三次出现同类遗漏：业务目录、Test/Release/Bootstrap/Shell 与 `registry.json` 都已经存在，但根 `manifest.json` 未加入 911，用户实机同步后明确反馈“云端仓库没有这个小程序”。同时首版 `channels.json` 又误写成 `channels:{test:{...}}` 对象结构。

本次修复固定执行了完整发布链：

```text
911 channels.json → schema 4 + channels[]
→ root manifest.json 增加 channel-group
→ revision 202608231959
→ manifest_meta.json 同步 revision 202608231959 / itemCount 15
→ GitHub main 回读
→ 用户实机同步确认
```

这次复发说明“新程序发布清单”不能依赖开发者记忆。以后新建小程序的完成定义必须把 **root manifest + manifest_meta + 标准 channels[]** 作为 P0 工件，与 app Release/Shell/registry 同级检查；任何一个缺失都不得向用户描述为“已在云端仓库发布”。

## 8. Stable 3.5.4 同步后页面仍显示旧目录快照

911 的 manifest/channels/meta 全部修正并回读后，用户再次实机确认“还是没有”。继续追查当前 Stable 3.5.4 的真实代码发现：

```text
Single Workspace 打开时
→ workspaceData(items)
→ programs 被一次性序列化进 HTML

点击“同步”
→ workspaceStaticAction('sync')
→ syncManifest() 更新后台 manifest 缓存
→ 只返回 toast
→ 当前 Single Workspace HTML 不重建
```

因此出现第三层假象：**云端 manifest 已正确、手机后台缓存也可能已正确，但当前工作台仍显示同步前的静态 programs 快照。** 这不是 911 条目再次丢失，而是规则仓库同步动作缺少 UI refresh。

2026-08-23 已从 Stable 3.5.4 派生规则仓库 `3.5.4-test.2 / Build386`：

- 新增不可变 `releases/test-3.5.4-sync2/release.json`。
- 新增 `sync_refresh_patch.js`，仅覆盖同步动作。
- `syncManifest()` 成功后调用 `refreshPage(false)`，强制重建 Single Workspace。
- 新 Shell：`rule_repo_test_v132.txt`。
- 活动 `test.json` 与 `channels.json` 已指向 Test2。
- Stable 3.5.4 / Build384 不改，等待实机确认后再决定是否晋级。

以后规则仓库目录发布的实机完成条件增加一项：

```text
云端 revision 正确
&& 本地 sync 成功
&& 当前工作台重建后能看到新条目
```

仅看到“目录已更新”toast 不能视为 UI 已完成同步。

## 9. 可变元数据多源同时失败 / 陈旧 CDN 指针事故

2026-08-23 规则仓库 Test 从 Build385 向 RC2 / Build388 推进时，用户实机先后出现两种相反故障：

1. jsDelivr `@main` 仍返回旧 `test.json`，Remote Manager 因此把 Build385 误判为“已经是最新测试版”。
2. 改成 GitHub API 优先后，实机又出现 `GitHub API 内容为空`；同一时刻 Raw / WebRaw / CDN 也可能返回无效响应，导致更新页直接报“升级失败”。

结论：**可变版本指针不能依赖单一源，也不能把任一 `@main` CDN 返回值直接当作强一致真相。**

从 Remote Manager 2.0.4 起固定：

```text
可变 latest/test 指针：
Raw → WebRaw → GitHub API → jsDelivr

并且：
- 保存最后一次成功元数据；
- 设置 floor = max(当前 build, default build, minBuild)；
- 低于 floor 的 CDN/镜像结果只能判为传播滞后，禁止降级；
- 所有元数据源暂时不可达时，继续使用当前/Bootstrap 内置安全 Release；
- 网络抖动不得伪装成“程序升级失败”。
```

不可变 Release / 模块仍可使用多镜像分发，因为其路径一旦发布就不再变化。

## 10. 多 commit 半发布与并发 main 写入事故

同日继续追查发现，旧发布流程经常按多次提交依次写：

```text
release
→ test/stable/latest
→ channels
→ Bootstrap
→ Shell
→ registry
→ root manifest
→ manifest_meta
```

手机如果恰好在中间窗口读取，会得到“新指针 + 旧文件”或“新文件 + 旧指针”的半发布状态。更严重的是，项目多个对话会同时发布不同小程序；本次规则仓库发布过程中实际捕获到 JavDB、XVideos 并发推进 `main`。如果继续拿旧 HEAD 强推，会覆盖其它程序刚发布的内容。

以后统一采用两阶段协议：

```text
A. 不可变资产准备阶段
   新 Release / 模块 / Bootstrap / Shell 依赖先落盘
   → 回读确认存在
   → 此阶段不得提前切活动指针

B. 活动指针原子切换阶段
   重新读取最新 main HEAD
   → 基于最新 tree 只替换本程序 stable/test/latest/channels 等指针
   → 单个 Git tree commit
   → fast-forward main
```

如果 `main` 在 create tree / commit 期间再次前进：

```text
禁止 force
→ 重新读取新 HEAD
→ 在新 tree 上重建本程序改动
→ 再 fast-forward
```

这条规则适用于所有远程小程序，不只是“我的规则仓库”。

## 11. Stable 3.5.5 发布基线

用户明确要求将修复后的规则仓库云端正式版同步升级。最终形成：

```text
Stable 3.5.5 / Build389 / Shell1.5.5 / Bootstrap1.5.5 / Manager2.0.4
Test   3.5.5-test.1 / Build390 / Shell1.0.36-test / Bootstrap1.0.35-test
```

Stable 3.5.5 吸收：

- `sync_refresh_patch`：同步成功即时重建当前工作台；
- Icon Delivery 1.1：本仓 Raw 图标统一 CDN 交付，版本中心同样处理；
- Remote Delivery Protocol 2.0：多源可变元数据、last-known-good、安全 build floor；
- 原子发布基线。

Stable Release **不包含** Test state/baseline patch；最终恢复正式 `hc_repo_* / hc_repo_v3_*` 状态命名空间和 Stable Bootstrap。发布完成后立即续线 Test Build390，满足 `Test baseVersion = Stable version` 且 `Test build > Stable build`。

以后“云端发布完成”的定义升级为：

```text
不可变资产可回读
&& 活动指针同一原子切换
&& main fast-forward 无覆盖并发提交
&& registry 恢复链同步
&& root manifest/revision 成对同步
&& 实机可见/可导入/可打开
```
