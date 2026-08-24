# 事故记录：规则仓库轻同步、图标资产与自更新真相混用（2026-08-24）

## 1. 事故范围

目标程序：`我的规则仓库·测试版`

涉及版本：

- RC21 / Build411：统一版本目录。
- RC22 / Build412：Light Sync。
- RC23 / Build413：Standalone Light Sync。
- RC24 / Build414：Local Icon Pack。

Stable `3.5.5 / Build389` 全程冻结，不属于本事故修改范围。

---

## 2. 实机症状

### 症状 A：同步曾长时间卡住

版本详情已经改成本地统一目录，但旧同步动作仍可能进入 Runtime 状态、安装索引、图标逐项下载或页面刷新链，导致用户点击同步后长时间不结束。

RC23 将同步器彻底从 Runtime 启动状态中拆出后，用户实机确认“轻同步成功”。

### 症状 B：轻同步成功后仍然没有程序图标

用户实机确认：

- 轻同步成功。
- 退出规则仓库重新进入后仍然没有真实图标。
- 首页卡片继续显示“黄豆 / 麻豆 / Ha”等文字占位。

这证明“同步成功”与“图标资产已经恢复”是两条不同的完成条件。

### 症状 C：当前 RC23 不会自然发现 RC24

RC23 为防止旧目录把当前运行版本反向覆盖，`sync_scheduler_v3.js` 使用 `selfMeta()` 把 `rule-repo` 当前 Test 强制写回 RC23。

结果是：

- 运行版本真相是正确的；
- 但“当前正在运行什么版本”与“远端现在有哪些可升级版本”被错误地复用了同一份 metadata；
- 即使远端 `channels.json` 已经出现 RC24，RC23 的本地版本目录仍可能被自身 `selfMeta()` 写回 RC23，导致用户无法从当前 Test 自然发现下一 Test。

---

## 3. 根因

### 3.1 图标不应继续作为 N 个独立在线资源参与首页或普通同步

当前根目录图标来源混合：

- GitHub SVG / PNG；
- jsDelivr；
- CloudFront；
- 站点 favicon；
- 外部图片站。

这些地址的延迟、Header、格式和可用性完全不同。若首页或普通同步逐项获取：

```text
程序数增加
→ 网络请求数线性增加
→ 任一慢源拖长总耗时
→ 某个站点失效导致局部破图
→ 同步状态难以解释
```

RC23 为修复同步卡死主动取消图标下载，因此同步成功后图标仍是占位是符合当时实现的结果，而不是同步器再次失效。

### 3.2 running truth 与 available update truth 不能混为一谈

正确需要两种不同事实：

```text
Running Self Truth
= 当前设备真正正在执行的 version/build/shell/runtime

Remote Available Truth
= 远端 channels/test/candidate 目前允许安装的 version/build/path
```

RC23 的 `selfMeta()` 适合作为 Running Self Truth，但不应覆盖 Remote Available Truth。

---

## 4. 修复方案

### 4.1 RC24：统一 Local Icon Pack

新增：

- `apps/tools/rule-repo/icon_catalog_snapshot.json`
- `apps/tools/rule-repo/sync_scheduler_v4.js`
- `apps/tools/rule-repo/shell_bridge_v2.js`
- `apps/tools/rule-repo/rule_repo_test_v161.txt`

图标交付改为：

```text
发布端维护一份 icon catalog
        ↓
首次 RC24 可直接使用内嵌最小图标集
        ↓
写入本地 icon_catalog_v1.json
        ↓
首页只读本地真实图标 / 本地图标包 data URI
```

首页不再把每个程序的外部 `icon` URL 当成实时依赖。

RC24 轻同步一次并行更新：

```text
manifest.json
+ channel_catalog_snapshot.json
+ icon_catalog_snapshot.json
```

并继续禁止：

- 加载/重建 Runtime 状态；
- N 个程序逐图下载；
- 安装状态全量扫描；
- 同步完成后自动整页刷新。

### 4.2 RC23 → RC24：一次性迁移入口

由于已经发布的 RC23 Shell/同步器使用不可变 commit，不能原地覆盖赌缓存。

因此根 `manifest.json` 临时增加：

```text
规则仓库 RC24 升级
→ apps/tools/rule-repo/rule_repo_test_v161.txt
```

用户在 RC23 再执行一次轻同步后即可看到迁移卡并覆盖安装 RC24。

RC24 实机验证通过后删除该临时迁移入口，根目录恢复正常产品结构。

---

## 5. 永久开发规则

### 规则 1：普通浏览热路径零图标网络

首页、分类、搜索、版本详情等热路径不得为了程序图标逐项访问 GitHub/CDN/站点 favicon。

优先：

```text
有效本地真实资产
→ 统一本地图标包
→ 本地占位
```

### 规则 2：同步必须按“目录 / 资产 / 状态”拆层

至少区分：

```text
Light Catalog Sync
Asset Sync
Install-State Scan
Runtime Repair
```

不能用一个“同步”按钮隐式执行所有重型工作。

### 规则 3：当前运行版本不得覆盖远端可升级版本

`selfMeta/currentRuntime` 只回答“我现在运行什么”。

`channels/test/candidate` 只回答“远端现在能安装什么”。

两者必须分字段/分对象/分缓存保存；禁止为了修复当前版本显示而覆盖远端 available channel。

### 规则 4：每个 Test 必须能够从紧邻上一 Test 自举升级

发布新 Test 的验收门禁增加：

```text
上一 Test 实机
→ 主动同步/检查更新
→ 能发现新 Test
→ 能覆盖安装
→ 首次启动成功
```

若必须让用户手工打开 GitHub Raw 链接才能升级，视为自更新控制面未完成。

### 规则 5：不可变发布文件不能原地补丁修复

已被旧 Shell 固定到 commit 的 Scheduler/Bridge 出现设计问题：

```text
冻结旧文件
→ 新文件名 / 新 commit / 新 Shell version
→ 提供显式迁移入口
```

禁止修改同 URL 后要求用户清缓存碰运气。

---

## 6. RC24 实机验收

必须完成：

1. RC23 再执行一次轻同步，确认出现“规则仓库 RC24 升级”。
2. 覆盖安装 RC24，打开后**先不执行同步**，检查首页程序图标是否立即出现。
3. 执行一次 RC24 轻同步，确认能快速结束。
4. 刷新/退出重进，确认图标仍存在。
5. 打开多个 channel-group 的版本详情，确认仍然秒开且不回退到在线 hydration。
6. 确认 Stable 3.5.5 未变化。
7. 全部通过后移除临时 RC24 升级卡，再进行后续 Candidate/Stable 决策。
