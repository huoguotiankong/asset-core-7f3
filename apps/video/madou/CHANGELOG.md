# 麻豆传媒 CHANGELOG

> 程序：麻豆传媒（`madou`）  
> 正式运行仓：`huoguotiankong/asset-core-7f3@main`  
> 源站：`https://madoup2.cc/`  
> **历史完整技术记录（Test1–Test13、1MB 私有 KV、纯免嗅失败、播放恢复、Stable 0.1.0 晋级）已原样冻结在 `apps/video/madou/CHANGELOG_HISTORY_20260823.md`。恢复或维修本程序时，本文件与该历史归档必须一起读取。**

## 当前基线
- Stable：`0.1.0 / Build10114 / Shell 0.1.0-stable.1`，入口 `madou_remote_stable_v1_b10114.txt`。
- Test：`0.1.1-test.1 / Build10201 / Shell 1.1.0-test-local-first-native`，入口 `madou_remote_test_v14_b10201.txt`，**待海阔实机验证**。
- Stable Release：`apps/video/madou/releases/0.1.0/release.json`。
- Test Release：`apps/video/madou/releases/0.1.1-test.1/release.json`。
- Stable/Latest 本轮均不修改；失败时重新覆盖 Stable 0.1.0 即可恢复。

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Native Local-First Candidate

### 修改边界
- 从用户已接受并晋级的 Stable `0.1.0 / Build10114` rebase，只迁移**交付、启动和 serialized lazyRule 的运行时重载链**。
- 不恢复 Test11/Test12 已证伪的纯免嗅实验，不恢复详情/播放设置。
- 不改变 Test13 已接受的业务合同：标签和相关推荐默认开启；详情使用 30 分钟结构化私有文件缓存；播放保持 `直链优先 → 无直链时 video:// 网页媒体自动提取`；收藏/历史继续使用 Test12 规则私有文件。

### 为什么该程序需要 Local-First
Stable 0.1.0 为绕过历史 1MB `setItem` 饱和，已经使用 direct immutable loader，不再进入 Remote Manager 状态链；但当前每次页面进入仍是：

```text
Shell
→ 远程 require bootstrap_stable_v1_b10114.js
→ Bootstrap 再远程 require 6 个业务模块
→ 页面运行
```

而 Test1/10/12/13 运行时中的若干 `lazyRule` 还会把 `C.bootstrap` 序列化进点击回调，点击收藏/重试等操作时再次远程加载 Bootstrap。因此仅把首页启动模块写到本地仍不算完整 Local-First。

### 新运行链
```text
madou_remote_test_v14_b10201.txt / rule 2026082502
→ __hclocal22_madou-test_b10201.json
→ 包完整：直接 require(file://) 本地模块
→ 包缺失：bootstrap_test_v14_b10201.js
→ Local Module Manager 2.2.0
→ 安装 Build10201 模块 + Performance/快捷图标/Action Bootstrap 本地资产
→ MadouRemoteRuntime 0.1.1-test.1
```

- 正常二次启动不再读取 GitHub/CDN Bootstrap、Release、Remote Manager 或业务模块。
- Shell 只有 `madou` 主模块负责 package 检查/首次安装；列表、分类、详情、搜索、收藏、历史统一通过 `$.require('madou')` 复用本地 Runtime，不再每个页面重复远程自举。

### 本地模块与资产
执行模块固定到不可变 commit `6ed5b1033d69c6376a931969bf4b7f06c920b538`：
1. Test1 Core。
2. Test1 Runtime。
3. `performance_local_native.js`：只读本地 `performance_test10.js`，把 Test10 `ROOT` 从 GitHub 改成本地资产目录后再执行。
4. Test12 Storage Rescue。
5. Test13 Default Detail/Playback。
6. `identity_local_patch.js`：冻结 Test `0.1.1-test.1 / Build10201`，并把 `C.bootstrap` 指向固定本地 Action Bootstrap。

首次安装同时固定到 `hiker://files/rules/asset-core-local/madou-test/assets/`：
- `performance_test10.js`。
- `quick_search.svg`。
- `quick_categories.svg`。
- `quick_favorite.svg`。
- `quick_history.svg`。
- `action_bootstrap_b10201.js`。

### serialized lazyRule 本地重载
旧 Runtime 的收藏等按钮会在点击上下文执行：

```text
require(C.bootstrap)
→ MadouBoot.loadOnly()
→ 调 MadouCore 当前方法
```

Test1 不删除这些已验证业务函数，而是把 `C.bootstrap` 重定向到：

```text
file://.../asset-core-local/madou-test/assets/action_bootstrap_b10201.js
```

本地 Action Bootstrap 只读取 `__hclocal22_madou-test_b10201.json` 并 `require(file://)` 当前 Build10201 模块。这样页面启动和点击重载都不再回到远程 Bootstrap，也避免只 eval 基础 Core 导致后置 Storage/Detail Patch 丢失。

### 1MB 存储边界继续保持
- Local Module Manager 2.2.0 的 package/state 使用规则私有文件，不依赖 `setItem` Remote State。
- 收藏、历史、分页模板、详情结构化缓存继续沿用 Test12/Test13 私有文件方案。
- Test10 遗留的非关键分类/Feed `setItem` 缓存仍可能在旧设备 KV 饱和时失败，但这些写入已有异常降级，不能阻塞主启动、详情、播放、收藏/历史主链。
- 本轮不新增任何设置项或新的关键 `setItem` 状态。

### 静态门禁
- 新增 `performance_local_native.js`、`action_bootstrap.js`、`identity_local_patch.js` 已实际执行 `node --check` 通过。
- `bootstrap_test_v14_b10201.js` 已实际执行 `node --check` 通过。
- Shell 外层规则 JSON、内层 `pages` JSON 均实际解析成功；抽取后的 `madou` 本地加载器已执行 `node --check` 通过。
- 既有 Core/Runtime/Test12/Test13 模块继续使用 Stable 已实机接受的冻结源码，不原地覆盖。

### 实机验收门槛
当前仅是 Test 候选，未完成以下闭环前不得晋级 Stable：
1. 规则仓轻同步后，麻豆传媒版本详情出现 `0.1.1-test.1 / Build10201`。
2. 覆盖导入后首次打开：首页、分类、搜索、详情、收藏、历史均正常。
3. 退出后再次打开，确认二次启动正常且明显走本地 package。
4. 详情中的“加入/取消本地收藏”必须实机点击，确认本地 Action Bootstrap 没有因 `require(file://)` 语义退化。
5. 至少播放一个此前可播放内容，确认 `直链优先 / video://` 播放合同未退化。
6. 如条件允许，屏蔽 GitHub 后再次打开和点击收藏；站点 `madoup2.cc` 业务网络仍需保留。
7. 若出现任何 1MB 私有存储错误，记录具体页面/动作；不得通过恢复 Remote Manager 或新增设置规避。

## Stable 0.1.0 不可退化事实
以下事实来自 2026-08-23 实机与用户明确接受，后续所有 Test 必须继承，详见历史归档：
- Test12 设置链仍曾触发 `InternalError: 私有存储内容过大 (1MB)`，因此关键状态必须继续使用 `saveFile/readFile` 私有文件。
- Test11/Test12 纯免嗅 HTTP/JS 协议解析没有带来可用收益，用户明确要求停止继续攻纯免嗅。
- Test13 恢复并验证了可实际播放的 `直链优先 → video://` 路线；必须准确称为网页媒体自动提取/嗅探，不宣称免嗅。
- 标签与相关推荐默认开启，不再提供相关设置。
- Stable 0.1.0 的 direct immutable loader 是为了避开旧 Remote Manager `setItem` 状态写入；本轮 Local-First 只能进一步减少远程依赖，不能重新引入该状态链。

## 恢复入口
- Stable：`apps/video/madou/madou_remote_stable_v1_b10114.txt`。
- 历史 Test13：`apps/video/madou/madou_remote_test_v13_b10113.txt`。
- 当前 Test1：`apps/video/madou/madou_remote_test_v14_b10201.txt`。
- 历史完整记录：`apps/video/madou/CHANGELOG_HISTORY_20260823.md`。
