# 115.简 / Pan115 开发记录

状态：**Stable 1.2.0 / Build 2026092220 / 已实机验证；Test 1.2.1-test.3 / Build 2026092223 / 待实机验证**  
首次纳入：2026-09-21  
最近更新：2026-09-22

## 1.2.1-test.3 / Build 2026092223 — 新建文件夹 / 重命名 / 单项快捷复制移动

用户实机确认 `1.2.1-test.2 / Build 2026092222` 的批量删除、复制、移动可以使用，因此 Test2 冻结为设备验证基线。Test3 不改已经通过的回收站清空、批量选择、批量删除/复制/移动核心，只继续补齐普通文件管理页的日常管理能力。

本版新增：

```text
文件管理顶部
→ 新建文件夹
→ 批量管理
→ 回收站
→ 刷新

文件/文件夹长按
→ 重命名
→ 复制到…
→ 移动到…
→ 删除到回收站
```

新建文件夹与重命名拆到独立 `115FileOps` 模块，不把新协议逻辑继续堆进文件浏览页。认证仍复用已经实机验证的 `revertRecycleBin()` request 传输模板，只替换目标接口与业务参数，不自行拼 Cookie，也不猜当前 Client 的 `request()` 参数签名。

为兼容当前 115 Client 的两类传输链，运行时识别 WebAPI / OpenAPI 后分别使用：

- WebAPI 新建文件夹：`/files/add`，参数 `pid + cname`；
- OpenAPI 新建文件夹：`/open/folder/add`，参数 `pid + file_name`；
- WebAPI 重命名：`/files/edit`，参数 `fid + file_name`；
- OpenAPI 重命名：`/open/ufile/update`，参数 `file_id + file_name`。

单项“复制到/移动到”不新造协议，直接把当前项目写入临时单项选择集，然后复用 Test2 已实机通过的 `115BatchOps + 115FolderPicker`。操作成功后由原目标目录选择链清除选择状态。

安全/产品边界：

- 名称不能为空、不能超过 255 个字符；
- 文件重命名提示必须输入完整文件名并保留扩展名；
- 不改原视频点击播放；
- 不改原单项删除到回收站；
- 不改批量操作核心；
- 不改回收站清空、登录、Cookie、m115、磁链离线和播放器；
- `file_ops_v1.js`、`file_manage_v7.js`、Test3 installer 已通过 `node --check` 语法门禁。

模块快照：

- commit：`a6efd0655d81b39deaf8dc3a0688952b1354ad6c`
- 文件管理：`apps/cloud/pan115/modules/file_manage_v7.js`
- 新建/重命名核心：`apps/cloud/pan115/modules/file_ops_v1.js`
- 批量核心继续：`apps/cloud/pan115/modules/batch_ops_v1.js`
- 批量页继续：`apps/cloud/pan115/modules/file_batch_v1.js`
- 目标目录页继续：`apps/cloud/pan115/modules/folder_picker_v1.js`
- 回收站继续：`apps/cloud/pan115/modules/recycle_v5.js`
- Release：`apps/cloud/pan115/releases/1.2.1-test.3/release.json`

实机验收优先顺序：

1. 当前目录新建一个测试文件夹，刷新后应立即出现；
2. 长按该文件夹重命名，名称应立即更新；
3. 长按一个可牺牲测试文件重命名，保留扩展名后文件仍正常；
4. 长按单个文件执行“复制到…”，确认源文件保留、目标目录出现副本；
5. 长按单个文件执行“移动到…”，确认源目录消失、目标目录出现；
6. 原批量删除/复制/移动仍正常；
7. 清空回收站、普通删除、磁链播放、登录和“我的文件”不得回归。

当前状态：`pending-device-validation-create-rename-quick-actions`。

## 1.2.1-test.2 / Build 2026092222 — 文件批量删除 / 复制 / 移动（已实机验证）

用户实机确认 `1.2.1-test.1 / Build 2026092221` 的“清空回收站”已经可用，因此 Test2 继续以 Test1 为设备验证基线，不再修改回收站链，新增范围只落在文件管理。

本版把普通 `115FileManage` 保持为浏览/单文件管理页，只增加一个 `☑ 批量管理` 入口；真正的选择状态、批量动作和目标目录选择拆到独立页面/模块，避免把已经稳定的文件浏览页改成复杂状态机。

新增能力：

```text
文件管理
→ 批量管理
→ 点击文件/文件夹多选或取消
→ 全选本页 / 清空选择
→ 批量删除到回收站
→ 批量复制 → 选择目标文件夹 → 确认
→ 批量移动 → 选择目标文件夹 → 确认
```

协议/认证策略继续沿用 Test18 已验证方法：不自行拼 Cookie，也不猜 `client.request()` 参数签名，而是先捕获当前 `revertRecycleBin()` 实际使用的认证 request 模板，再只替换目标接口和业务参数。

为兼容不同 115 Client 实现，运行时会识别当前认证链属于 WebAPI 还是 OpenAPI：

- WebAPI：`/rb/delete`、`/files/copy`、`/files/move`，使用 `fid[n] + pid`；
- OpenAPI：`/open/ufile/delete`、`/open/ufile/copy`、`/open/ufile/move`，使用对应 `file_ids/file_id/to_cid/pid` 字段；
- 所有批量请求均顺序执行，不做并发；每批最多 100 项，一次操作最多 1000 项；
- 移动到当前源目录直接阻止；复制/移动到已选文件夹自身直接阻止；更深层“移动到自身子目录”等服务端约束仍由 115 返回真实错误，不伪造成功。

模块快照：

- commit：`e99e050a3bde2271a30d7c52e7785dc1ba4e8c7f`
- 文件管理：`apps/cloud/pan115/modules/file_manage_v6.js`
- 批量操作核心：`apps/cloud/pan115/modules/batch_ops_v1.js`
- 批量管理页：`apps/cloud/pan115/modules/file_batch_v1.js`
- 目标目录页：`apps/cloud/pan115/modules/folder_picker_v1.js`
- 回收站继续：`apps/cloud/pan115/modules/recycle_v5.js`
- Release：`apps/cloud/pan115/releases/1.2.1-test.2/release.json`

实机结论：2026-09-22 用户明确反馈“可以了，继续进行优化吧”，批量删除、复制、移动链判定通过，Test3 以本版作为设备验证基线。

## 1.2.1-test.1 / Build 2026092221 — 清空回收站（已实机验证）

基于已实机验证的 Stable 1.2.0，只修改 `115Recycle` 回收站页面，不改登录、普通文件管理删除链、磁链离线、原文件浏览或播放器。

新增顶部 `🧹 清空回收站` 操作。由于现有 Test17/Stable 已实机验证 `cleanRecycleBin(安全密码, [rid])` 可永久删除回收站条目，本版不猜新的 115 清空接口，而是复用同一个已验证 Client 方法：先顺序读取回收站并快照全部 rid，再按小批次顺序调用 `cleanRecycleBin(password, ids)`，避免删除过程中分页位移导致漏项。

安全边界：

```text
点击清空回收站
→ 必须输入 115 安全密码
→ 再次确认“全部永久删除且不可恢复”
→ 先完整快照回收站 rid，不边翻页边删
→ 仅使用当前已登录 115Api Client
→ cleanRecycleBin 分批顺序执行，不并发
→ 任一批失败立即停止，并显示已完成/总数
→ 刷新当前回收站页面
```

额外保护：最多扫描 200 页 × 40 项；如果仍未到末页，则在开始删除前直接停止，避免超大回收站发生“只清了一部分却显示完成”。

本版同时把回收站顶部工具整理成三项等宽入口：刷新 / 文件管理 / 清空回收站。单条点击还原、长按永久删除逻辑保持 Stable 1.2.0 不变。

模块快照：

- commit：`976eb266c5bb55bba43b6676eb379cf50655ae0c`
- 回收站：`apps/cloud/pan115/modules/recycle_v5.js`
- Release：`apps/cloud/pan115/releases/1.2.1-test.1/release.json`

实机结论：2026-09-22 用户明确反馈“可以了”，清空回收站链判定通过，Test2 以此版本作为设备验证基线。

## Stable 1.2.0 / Build 2026092220 — Test18 原样晋级

2026-09-22 用户在当前实机确认 `1.2.0-test.18 / Build 2026092219` 的普通文件/文件夹删除已经可用，并明确要求升为正式版。按照“实机结果优先、Stable 不在晋级阶段继续改业务”的规则，本次冻结 Test18 作为晋级来源，新建 Stable 1.2.0 / Build 2026092220，不修改已验证业务逻辑。

本次晋级确认的文件管理链：

```text
文件管理长按删除
→ 复用当前已登录 115Api Client
→ 捕获 revertRecycleBin() 实际调用 request 的认证参数结构
→ 仅改写 /rb/revert 为 /rb/delete
→ 仅改写 rid 为 fid[0]
→ 通过原 request 函数发出请求
→ 文件进入回收站
```

回收站列表、还原和永久删除沿用 Test17 已验证实现；永久删除继续要求输入 115 安全密码。最终固定模块快照：

- commit：`d54bc67b0c3b65978b268d694967292a177b9179`
- 文件管理：`apps/cloud/pan115/modules/file_manage_v5.js`
- 回收站：`apps/cloud/pan115/modules/recycle_v4.js`

Stable 1.2.0 同时保留当前累计验证链：

- magnet 外部调用固定走 `115Offline?add=`；
- BTIH/URL 查重、`fileId` 优先定位、单主片直放、多集选集、播放缓存、失败重试；
- 离线保存目录优先 `根目录/海阔视界 → 云下载/离线下载 → 根目录`；
- 状态确认坚持单 worker、有限次数、低频访问，不恢复 Test7 的高并发轮询；
- 已验证的紧凑首页与内部路由；
- 独立文件管理与回收站页面；
- 原版登录/Cookie、m115 加解密、115 分享、普通文件浏览、播放器 `player.resolve()` 保持原合同。

Stable 安装器是“同名规则原地晋级”而不是重新造一套 115 协议层：Test18 可直接只提升 Stable 版本标识；Test17 可补齐最终 `file_manage_v5 + recycle_v4` 后晋级。更旧基线不在 Stable 安装器里重放整条历史 Test 补丁，避免把未经本轮实机复核的组合重新制造为正式版。

## 1.2.0 Test9 → Test18 演进

### Test18 / Build 2026092219 — 普通删除认证传输复用

Test17 的回收站列表、还原、永久删除已经可用，但普通文件/文件夹删除仍受 `client.request()` 参数签名不确定影响。Test18 不再猜 request 参数格式，而是运行时捕获已验证 `revertRecycleBin()` 调用 request 时的参数结构，只替换接口和业务参数，再通过原 request 函数发送。

用户实机确认：**删除可以了**。因此 Test18 判定通过并晋级 Stable 1.2.0。

### Test17 / Build 2026092218 — 删除接口与回收站链

- 文件管理删除目标切到 115 `/rb/delete`；
- 回收站继续使用 `recycle_v4`；
- 回收站列表、还原、永久删除链保持可用；
- Test18 只修普通删除的认证传输方式，没有改变这些已通过能力。

### Test16 / Build 2026092217 — 永久删除

- 在回收站长按加入“永久删除”；
- 明确不可恢复确认；
- 输入 115 安全密码后调用当前 Client 的回收站清理能力；
- 同时扩展普通文件删除能力探测，但当时尚未得到最终可靠的普通删除传输方案。

### Test15 / Build 2026092216 — 复用登录 Client

删除、回收站列表和还原不再自行拼 Cookie，而统一复用 `115Api.newClient()` 的当前已登录会话；缺少驱动方法时显示真实能力错误，不再误报“未登录”。

### Test14 / Build 2026092215 — 文件管理 Phase 2 起点

首次加入隔离的 `115FileManage` 与 `115Recycle` 页面：首页提供文件管理/回收站入口；先实现删除到回收站与点击还原，不碰登录、原“我的文件”、磁链链路和播放器。

### Test13 / Build 2026092214 — 首页降噪

- 删除搜索框右侧过长提示；
- 搜索只保留紧凑占位；
- 去掉底部 Build/开发状态说明和重复分区描述；
- 保留 Test12 的路由修复。

### Test12 / Build 2026092213 — 中文规则名路由修复

`hiker://page` 内的 `rule=115.简` 保持原始中文规则名，不对规则名整体 percent encode；业务参数 `cid/cname/kw/add/sc` 继续单独编码。

### Test11 / Build 2026092212 — 首页兼容热修

Test10 的 App 化首页在海阔实机出现编译问题，Test11 回到 Test9 的安全业务基线，用保守 ES5 语法重建首页，输入分流改为字符串前缀判断，不依赖容易触发兼容问题的正则写法。

### Test10 / Build 2026092211 — 禁用的首页初版

首次尝试 App 化首页，但实机编译异常。该实现不作为后续基线；Test11 已从 Test9 安全线重新构建。

### Test9 / Build 2026092210 — 安全磁链状态页可导入修复

修正 Test8 安装器的换行标记问题，继续保持单 worker、低频、有上限的磁链状态确认方案。用户确认 Test9 可正常导入且 115 首页可打开。

## Test6 → Test8 安全边界与事故

### Test8 / Build 2026092209

目标是单线程低频磁链状态页：新磁链提交前查一次，提交后最多低频确认两次，然后停止自动访问；结果一旦出现 `fileId` 即可进入文件/视频链。Test8 思路保留，但安装器存在换行匹配问题，最终由 Test9 修正。

### Test7 / Build 2026092208 — 禁用事故版

曾使用 8 个错峰后台任务并发轮询离线状态，实机出现：

```text
磁链页一直停在提交状态
全部离线任务返回 <!doctype html>
“我的文件”直接空白
```

用户覆盖回 Test6 后“我的文件”恢复。因此永久禁止：

- 多路并发轮询 115 状态；
- 连续多页高频任务查询；
- 为追求“实时”而长期后台访问 115；
- 任何会影响普通网盘请求稳定性的状态跟踪。

### Test6 / Build 2026092207

确立离线保存目录：

```text
根目录/海阔视界
→ 不存在则 根目录/云下载 或 离线下载
→ 都不存在才回退根目录
```

外部 magnet、手动添加离线、失败重试三条入口统一使用这套目录策略；程序名保持 `115.简` 同名覆盖以复用登录/Cookie 命名空间。

## Stable 1.1.0 / Build 2026092111

1.1.0 来自 `1.1.0-rc1` 的实机验证后原样晋级，建立了最初的稳定 magnet 播放合同：

```text
其它小程序传 magnet
→ 115Offline?add=
→ BTIH / URL 查重
→ 已存在任务直接复用
→ 新任务才提交离线
→ 完成后优先 task.fileId
→ fileId 是视频：player.resolve
→ fileId 是目录：受控扫描视频
→ 单一明显主片直接播放
→ 多集/多段进入 115OfflineResult
```

扫描最多递归约 4 层、约 500 项；sample/preview/trailer/试看/预告/花絮/广告等噪声降权。剧集场景不以“最大文件”武断选择某一集。

## 基线与协议事实

最初基线来自用户提供的 `115.简.hk小程序`，原规则已经具备：

- 115 Cookie / 扫码登录；
- 文件列表与全盘搜索；
- 115 分享；
- 离线任务；
- magnet / ed2k / HTTP(S) 离线添加；
- 个人网盘文件直链解析与播放。

确认事实：

- `addOfflineTaskURIs()` 使用 115 离线添加接口；
- `listOfflineTask()` 的 `file_id` 映射任务结果 `fileId`；
- `wp_path_id` 对应离线目标目录；
- 原 `player.resolve()` 通过 pickcode/fileId 取得直链并携带所需 UA/Header；
- 回收站与普通删除必须复用当前登录 Client 的认证传输，禁止凭空猜 Cookie/request 形态。

## 对外稳定磁链调用协议

其它小程序固定只依赖：

```js
function playBy115(url) {
    if (!url) return "toast://未获取到磁力链接";
    return "hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url);
}
```

禁止把 magnet 送到旧搜索入口：

```js
"hiker://page/115Search?rule=115.简&page=fypage&kw=" + encodeURIComponent(url)
```

用户实机已经证明该路线只会把整条 magnet 当普通文件搜索词，得到 0 条结果。

调用方不得直接依赖 `115Api`、`fileId`、离线接口、回收站接口或播放器内部实现。115 内部升级必须继续兼容 `115Offline?add=`，避免批量修改上游小程序。

## 已证伪/禁止恢复方案

- 自行重写完整 115 magnet 协议层：没有必要，增加登录/加密/播放器风险；
- 完整远程 JSON 直接作为 `home_rule_url`：曾触发规则解析错误；
- `$.require("hiker://page/115Api?rule=115.简")` 跨规则加载：海阔只接受 http/https 模块 URL；
- `fetch(hiker://home) + eval` 强行跨规则复用模块：运行时边界不稳定；
- magnet → `115Search?kw=`：已实机证伪；
- Test7 多路后台轮询：已实机造成接口 HTML 与“我的文件”空白；
- 普通删除继续猜 `client.request()` 参数顺序：Test18 已改为捕获已验证认证传输结构，禁止回退。

## 后续开发边界

Stable 1.2.0 仍是日常恢复基线；Test1 清空回收站、Test2 批量删除/复制/移动均已实机通过，Test3 的新建文件夹/重命名/单项快捷复制移动在实机通过前不得进入 Stable。后续排序、搜索、目录面包屑、更多文件属性等继续单独 Test，小步验证；不得为了文件管理改动登录、磁链播放或原播放器链。
