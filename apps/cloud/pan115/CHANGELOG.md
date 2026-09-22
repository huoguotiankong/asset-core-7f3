# 115.简 / Pan115 开发记录

状态：**Stable 1.2.0 / Build 2026092220 / 已实机验证；Test 1.2.1-test.6 / Build 2026092226 / 待实机验证**  
首次纳入：2026-09-21  
最近更新：2026-09-22

## 1.2.1-test.6 / Build 2026092226 — 搜索结果恢复 + 首页搜索按钮

### Test5 实机失败

用户覆盖 Test5 后继续用同一个已知关键词 `ipx-641` 实机验证。搜索页 UI、筛选按钮和纯文本摘要都正常显示，但结果从此前旧搜索页的 **6 条** 变成 **0 条**。

这说明 Test5 的“结果渲染/目录点击”重构方向没有直接报错，真正回归发生在搜索请求合同。Test5 不标记通过，已记录为 `failed-device-validation-search-zero-results` 并被 Test6 覆盖。

### 根因收敛

Test5 参考了另一个 115 Client 的实现，把 WebAPI 搜索请求写成 `aid=7`，同时还优先尝试了当前 Client 是否存在 `filesSearch()`。当前用户原有 115 搜索链此前能够返回 `ipx-641` 的 6 条结果；公开的传统 115 WebAPI `/files/search` 合同大量使用：

```text
GET https://webapi.115.com/files/search
?aid=1
&cid=0
&search_value=<keyword>
&offset=0
&limit=...
&count_folders=1
&format=json
```

因此 Test6 不再优先调用签名未知的 `filesSearch()`，而是固定复用当前已登录 `client.getFiles()` 的实际 GET 认证传输，只把业务 URL/参数替换成 `/files/search + aid=1`。

仍然遵守现有安全原则：

- 不自行拼 Cookie；
- 不猜 `client.request()` 参数顺序；
- 只捕获当前 `getFiles()` 已实际使用的认证请求模板；
- 搜索一次只发一个用户触发请求，不引入后台轮询/并发。

### 保留的 Test5 搜索改进

- 搜索结果字段继续统一归一化；
- 目录结果优先使用真实目录 ID（目录通常 `cid`，父目录 `pid`）；
- 文件夹点击直接进入 `115FileManage`，不再返回空链接；
- 视频结果继续复用 `player.resolve()`；
- 普通文件继续进入 `115FileInfo`；
- 类型筛选继续：全部 / 文件夹 / 视频 / 图片 / 音频 / 文档 / 压缩包；
- 排序继续：名称 / 时间 / 大小升降序；
- 分页继续使用重复页签名保护。

### 首页搜索按钮

用户同时要求首页搜索框右侧恢复明确的搜索按钮。海阔官方 `input` 组件的 `title` 本来就是右侧确定按钮，`extra.titleVisible:false` 会隐藏它。因此 Test6 安装器只在当前首页 `find_rule` 中把现有输入框的 `titleVisible` 恢复为 `true`；不重写输入分流逻辑，原来的：

```text
普通关键词 → 115Search
115分享链接 → 分享处理
magnet / ed2k / HTTP → 115Offline
```

继续保持。

### 模块快照

- Search V2 commit：`b98b9dd68d3340486d32f25a2f7b53b2bded6f5e`
- 搜索：`apps/cloud/pan115/modules/search_v2.js`
- 文件管理继续：`apps/cloud/pan115/modules/file_manage_v8.js`
- 文件信息继续：`apps/cloud/pan115/modules/file_info_v1.js`
- 新建/重命名继续：`apps/cloud/pan115/modules/file_ops_v1.js`
- 批量核心继续：`apps/cloud/pan115/modules/batch_ops_v1.js`
- 批量页继续：`apps/cloud/pan115/modules/file_batch_v2.js`
- 目标目录页继续：`apps/cloud/pan115/modules/folder_picker_v2.js`
- 回收站继续：`apps/cloud/pan115/modules/recycle_v5.js`
- Release：`apps/cloud/pan115/releases/1.2.1-test.6/release.json`

### Test6 实机验收

优先再次搜索 `ipx-641`：

1. 应重新出现原本约 6 条结果，而不是 0 条；
2. 点击 `ipx-641` / `ipx-641-C` 目录应进入对应文件夹；
3. 点击 mp4 应走现有 115 播放链；
4. 首页输入框右侧应出现搜索确认按钮；
5. 再验证一次文件夹/视频筛选与一种排序；
6. 登录、文件管理、批量操作、回收站、磁链播放不得回归。

当前状态：`pending-device-validation-search-hotfix`。

## 1.2.1-test.5 / Build 2026092225 — 云盘搜索专项重构（实机失败：0结果）

### 实机问题

用户在 Test4 后提供搜索 `ipx-641` 的实机截图：115 旧搜索页可正确返回 6 条搜索结果，包括目录 `ipx-641`、`ipx-641-C` 和多个 mp4 文件，但点击目录时海阔提示：

```text
链接为空，规则有误！
```

同时搜索页摘要把 HTML 字符串原样显示。Test5 因此首次重写 `115Search`：归一化结果字段、目录使用真实 ID、视频直放、普通文件进入信息页，并补齐筛选/排序/分页。

Test5 UI 和页面结构实机可打开，但同一 `ipx-641` 在新搜索请求中返回 0 条，判定搜索传输合同回归。Test5 已被 Test6 覆盖，不得晋级 Stable。

模块：`search_v1.js`；Release：`apps/cloud/pan115/releases/1.2.1-test.5/release.json`。

## 1.2.1-test.4 / Build 2026092224 — 文件管理导航 / 排序筛选 / 文件信息 / 目标目录体验

Test4 重点优化文件管理产品体验，不扩张 115 认证协议：

- 根目录 / 上一级 / 面包屑导航；
- 名称、时间、大小升降序；
- 文件夹 / 视频 / 图片 / 音频 / 文档 / 压缩包 / 其它轻量筛选；
- 长按文件信息，显示 ID / PickCode / SHA1 / 大小 / 时间等；
- 批量管理保持原目录上下文；
- 目标目录选择器增加面包屑、根目录、上一级、目录内新建与最近目标。

模块：`file_manage_v8.js`、`file_info_v1.js`、`file_batch_v2.js`、`folder_picker_v2.js`；底层仍复用 `file_ops_v1.js + batch_ops_v1.js + recycle_v5.js`。

Test4 在收到完整实机验收前被 Test5/Test6 覆盖，不标记 deviceValidated。

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

单项复制/移动不另造协议，写入单项选择集后复用 Test2 已验证的 `115BatchOps + 115FolderPicker`。Test3 后续被 Test4/Test5/Test6 覆盖，目前没有独立完整实机通过结论。

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
- Test5 的 `aid=7 + 优先 filesSearch()` 搜索传输；
- 在 Test3/Test4/Test5 未获实机明确通过时虚构 deviceValidated 状态。

## 后续开发边界

Stable 1.2.0 继续作为日常恢复基线。Test1 清空回收站、Test2 批量删除/复制/移动已实机通过；Test3/Test4 没有完整设备通过结论；Test5 搜索请求实机失败；Test6 当前优先验证搜索结果恢复和目录点击。搜索通过后再继续收敛当前目录搜索、批量选择体验、文件属性和 UI，不得为了文件管理/搜索改动登录、磁链播放、原播放器或恢复高频访问。
