# 115.简 / Pan115 开发记录

状态：**Stable 1.2.0 / Build 2026092220 / 已实机验证；Test 1.2.1-test.5 / Build 2026092225 / 待实机验证**  
首次纳入：2026-09-21  
最近更新：2026-09-22

## 1.2.1-test.5 / Build 2026092225 — 云盘搜索专项重构

### 实机问题

用户在 Test4 后提供搜索 `ipx-641` 的实机截图：115 已正确返回 6 条搜索结果，包括目录 `ipx-641`、`ipx-641-C` 和多个 mp4 文件，但点击目录时海阔提示：

```text
链接为空，规则有误！
```

同时搜索页摘要把 HTML 字符串原样显示为：

```text
关键词：<font color="#2B6CB0">ipx-641</font> · 全部 · 共6条
```

因此本轮先冻结继续扩展文件管理功能，优先把 `115Search` 做成可正常导航、播放和管理的完整搜索页。Test3/Test4 仍未收到整体“实机通过”结论，不错误标记为 deviceValidated。

### 根因与修复边界

旧搜索页能拿到数据，但目录结果没有生成有效的海阔跳转 URL；搜索返回的目录与文件字段也不能按普通文件列表简单等同处理。115 Web 搜索返回中，普通文件通常以 `fid` 表示文件 ID、`cid` 表示父目录；目录结果可能没有 `fid`，真正目录 ID 在 `cid`，父目录在 `pid`。本版新增独立 `search_v1.js`，先把搜索响应归一化，再按资源类型构造明确动作。

```text
115Search
→ 搜索结果归一化
→ 目录：真实目录 ID → 115FileManage
→ 视频：fid/pickCode → player.resolve
→ 其它文件：fid → 115FileInfo
```

目录点击不再返回空链接，也不再提示“请到我的文件中打开”；直接进入增强文件管理页。目录跳转继续携带基础 trail，使后续根目录/上一级导航可用。

### 搜索能力

- 搜索输入框保留，关键词摘要改为原生纯文本，不再输出 `<font>` 标签；
- 类型筛选：全部 / 文件夹 / 视频 / 图片 / 音频 / 文档 / 压缩包；
- 排序：名称↑ / 名称↓ / 时间↓ / 时间↑ / 大小↓ / 大小↑；
- 默认每页 50 项，支持分页并加入重复页签名保护，避免接口忽略 offset 时无限下拉；
- 文件夹点击直接浏览；
- 视频结果直接复用现有 `player.resolve()`；
- 普通文件打开 `115FileInfo`；
- 长按支持文件信息、打开所在目录、复制文件 ID。

### 认证与协议策略

本版不重新拼 Cookie，也不新增并发搜索。优先尝试当前 Client 自带的 `filesSearch()`；如果当前 115Api 没暴露该方法，则运行时捕获已登录 `client.getFiles()` 实际使用的 GET 认证传输结构，只把业务地址安全改为 `https://webapi.115.com/files/search` 并替换搜索参数。这样继续遵守 Test18 之后“复用真实已认证传输、禁止猜 request 参数签名”的规则。

搜索协议参考并与 115 WebAPI 现有事实对齐：`/files/search` 使用 `search_value / cid / offset / limit / type / count_folders / o / asc` 等参数；目录筛选使用 `fc=1`，其它类型按 115 搜索类型编号映射。这里仅用于搜索页，不改文件管理、离线或播放协议。

### 模块快照

- Search 模块 commit：`6e2572d6bc025fd73b5c9b43f7539ed04be798ae`
- 搜索：`apps/cloud/pan115/modules/search_v1.js`
- 文件管理继续：`apps/cloud/pan115/modules/file_manage_v8.js`
- 文件信息继续：`apps/cloud/pan115/modules/file_info_v1.js`
- 新建/重命名继续：`apps/cloud/pan115/modules/file_ops_v1.js`
- 批量核心继续：`apps/cloud/pan115/modules/batch_ops_v1.js`
- 批量页继续：`apps/cloud/pan115/modules/file_batch_v2.js`
- 目标目录页继续：`apps/cloud/pan115/modules/folder_picker_v2.js`
- 回收站继续：`apps/cloud/pan115/modules/recycle_v5.js`
- Release：`apps/cloud/pan115/releases/1.2.1-test.5/release.json`

### Test5 实机验收

优先复现截图关键词 `ipx-641`：

1. 搜索结果数量应正常；关键词摘要不能再显示 HTML；
2. 点击 `ipx-641`、`ipx-641-C` 两个目录应直接进入对应目录，不出现“链接为空”；
3. 点击 `ipx-641-3.mp4` 等视频应直接走现有 115 播放链；
4. 至少验证“文件夹 / 视频”两种类型筛选；
5. 至少切换一次名称或时间排序；
6. 下拉分页不能重复第一页形成无限列表；
7. 原文件管理、新建、重命名、批量删除/复制/移动、回收站清空、磁链播放、登录不得回归。

当前状态：`pending-device-validation-search`。

## 1.2.1-test.4 / Build 2026092224 — 文件管理导航 / 排序筛选 / 文件信息 / 目标目录体验

Test4 重点优化文件管理产品体验，不扩张 115 认证协议：

- 根目录 / 上一级 / 面包屑导航；
- 名称、时间、大小升降序；
- 文件夹 / 视频 / 图片 / 音频 / 文档 / 压缩包 / 其它轻量筛选；
- 长按文件信息，显示 ID / PickCode / SHA1 / 大小 / 时间等；
- 批量管理保持原目录上下文；
- 目标目录选择器增加面包屑、根目录、上一级、目录内新建与最近目标。

模块：`file_manage_v8.js`、`file_info_v1.js`、`file_batch_v2.js`、`folder_picker_v2.js`；底层仍复用 `file_ops_v1.js + batch_ops_v1.js + recycle_v5.js`。

Test4 在收到完整实机验收前被 Test5 覆盖；不标记 deviceValidated。用户当前截图只证明旧搜索页存在明确导航缺陷，因此 Test5 优先修搜索。

## 1.2.1-test.3 / Build 2026092223 — 新建 / 重命名 / 单项复制移动

在已验证 Test2 基础上新增：

```text
文件管理顶部 → 新建文件夹
文件/文件夹长按 → 重命名 / 复制到… / 移动到… / 删除到回收站
```

新建与重命名独立到 `file_ops_v1.js`。认证继续捕获当前已登录 Client 的真实 request 模板，不自行拼 Cookie：

- WebAPI 新建：`/files/add`，`pid + cname`；
- OpenAPI 新建：`/open/folder/add`，`pid + file_name`；
- WebAPI 重命名：`/files/edit`，`fid + file_name`；
- OpenAPI 重命名：`/open/ufile/update`，`file_id + file_name`。

单项复制/移动不另造协议，写入单项选择集后复用 Test2 已验证的 `115BatchOps + 115FolderPicker`。Test3 后续被 Test4/Test5 覆盖，目前没有独立完整实机通过结论。

## 1.2.1-test.2 / Build 2026092222 — 批量删除 / 复制 / 移动（已实机验证）

用户明确反馈“可以了”，因此下列能力视为实机通过：

- 文件/文件夹多选、取消；
- 全选本页、清空选择；
- 批量删除到回收站；
- 批量复制到目标目录；
- 批量移动到目标目录；
- 目标目录选择器。

`batch_ops_v1.js` 复用当前 Client 已认证传输，按 WebAPI/OpenAPI 自动选择 `/rb/delete`、`/files/copy`、`/files/move` 或对应 `/open/ufile/*`；顺序分批执行，不并发，一次最多 1000 项；禁止移动到当前目录和复制/移动到自身。

## 1.2.1-test.1 / Build 2026092221 — 清空回收站（已实机验证）

用户明确反馈可用。回收站顶部加入“清空回收站”：

```text
输入115安全密码
→ 二次确认不可恢复
→ 先完整快照 rid
→ cleanRecycleBin(password, ids)
→ 小批顺序执行
→ 失败立即停止并报告进度
```

最多扫描 200 页 × 40 项；单条还原、单条永久删除保持原逻辑。

## Stable 1.2.0 / Build 2026092220 — Test18 原样晋级（已实机验证）

用户实机确认 `1.2.0-test.18 / Build 2026092219` 普通文件/文件夹删除可用后晋级 Stable。Stable 冻结，不在后续 Test 开发中直接修改。

已验证普通删除链：

```text
文件管理长按删除
→ 复用当前已登录115Api Client
→ 捕获 revertRecycleBin() 实际 request 认证结构
→ /rb/revert 改写 /rb/delete
→ rid 改写 fid[0]
→ 通过原 request 发出
→ 文件进入回收站
```

Stable 1.2.0 同时保留：

- `115Offline?add=` 外部 magnet 调用合同；
- BTIH/URL 查重、fileId 优先定位、单主片直放、多集选集、缓存与失败重试；
- 离线目录优先 `根目录/海阔视界 → 云下载/离线下载 → 根目录`；
- 独立文件管理、回收站列表/还原/永久删除；
- 原版登录/Cookie、m115 加解密、115 分享、普通文件浏览、`player.resolve()`。

## 1.2.0 Test9 → Test18 关键演进

- **Test18 / Build 2026092219**：普通删除不再猜 `client.request()` 参数，改为捕获已验证 `revertRecycleBin()` 的真实认证传输；用户实机确认删除可用。
- **Test17 / Build 2026092218**：文件管理删除目标切到 `/rb/delete`，回收站列表/还原/永久删除链已可用。
- **Test16**：回收站长按永久删除，要求 115 安全密码。
- **Test15**：删除、回收站统一复用 `115Api.newClient()` 当前登录会话。
- **Test14**：首次加入隔离的 `115FileManage / 115Recycle`。
- **Test13**：首页降噪，移除过长提示和重复开发信息。
- **Test12**：确认中文规则名 `rule=115.简` 不整体 percent encode，业务参数单独编码。
- **Test11**：Test10 首页兼容失败后回到安全基线，用保守 ES5 重建。
- **Test9**：修复安全磁链状态页安装器，用户确认可导入、首页可打开。

## Test7 事故与永久禁用项

Test7 曾使用多路后台 worker 高频轮询离线状态，实机出现：

```text
磁链页停在提交状态
离线任务接口返回 <!doctype html>
“我的文件”空白
```

覆盖回安全版后恢复。因此永久禁止：

- 多路并发轮询 115 状态；
- 连续多页高频任务查询；
- 为追求“实时”长期后台访问 115；
- 任何会影响普通网盘请求稳定性的状态跟踪。

## Stable 1.1.0 / Build 2026092111

建立最初稳定 magnet 播放合同：

```text
其它小程序传 magnet
→ 115Offline?add=
→ BTIH / URL 查重
→ 已有任务复用 / 新任务提交
→ 完成后优先 task.fileId
→ 视频：player.resolve
→ 目录：受控扫描视频
→ 单主片直放 / 多集进入选集
```

目录扫描受控在约 4 层、500 项；sample/preview/trailer/试看/预告/花絮/广告等噪声降权。

## 基线与长期协议事实

最初基线来自用户提供的 `115.简.hk小程序`。原规则已具备扫码/Cookie 登录、文件列表、全盘搜索、115 分享、离线任务、magnet/ed2k/HTTP(S) 添加、个人网盘直链播放。

长期确认：

- `addOfflineTaskURIs()` 是离线添加入口；
- `listOfflineTask()` 的 `file_id` 对应离线结果 `fileId`；
- `wp_path_id` 是离线目标目录；
- `player.resolve()` 通过 PickCode/fileId 获取直链并附带所需 Header；
- 普通删除、回收站、文件写操作必须复用当前登录 Client 的真实认证传输，禁止凭空猜 Cookie/request 形态；
- 搜索属于普通云盘能力，magnet 不得送入 `115Search?kw=`。

## 对外稳定磁链调用协议

调用方固定使用：

```js
function playBy115(url) {
    if (!url) return "toast://未获取到磁力链接";
    return "hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url);
}
```

禁止：

```js
"hiker://page/115Search?rule=115.简&page=fypage&kw=" + encodeURIComponent(url)
```

后者已实机证明只会把 magnet 当普通文件搜索词。

## 已证伪 / 禁止恢复方案

- 自行重写完整 115 magnet 协议层；
- 完整远程 JSON 直接作为 `home_rule_url` 的旧失败方案；
- `$.require("hiker://page/115Api?rule=115.简")` 跨规则模块加载；
- `fetch(hiker://home) + eval` 强行跨规则复用模块；
- magnet → `115Search?kw=`；
- Test7 多路后台轮询；
- 普通删除继续猜 `client.request()` 参数顺序；
- 在 Test3/Test4 未获实机明确通过时虚构 deviceValidated 状态。

## 后续开发边界

Stable 1.2.0 继续作为日常恢复基线。Test1 清空回收站、Test2 批量删除/复制/移动已实机通过；Test3/Test4 没有完整设备通过结论；Test5 当前优先验证搜索。搜索通过后再继续收敛当前目录搜索、批量选择体验、文件属性和 UI，不得为了文件管理/搜索改动登录、磁链播放、原播放器或恢复高频访问。
