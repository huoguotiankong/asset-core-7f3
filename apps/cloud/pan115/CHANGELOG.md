# 115.简 / Pan115 开发记录

状态：**Stable 1.2.0 / Build 2026092220 / 已实机验证；Test 1.2.1-test.12 / Build 2026092232 / 待实机验证**  
首次纳入：2026-09-21  
最近更新：2026-09-22

## 1.2.1-test.12 / Build 2026092232 — 搜索目录 `fileId` 语义修复

### Test11 实机结论

用户继续搜索已知关键词 `ipx-641`：

- 仍正常返回 **6 条**；
- 关键词摘要保持纯文本；
- 旧搜索请求链没有回归；
- 点击目录仍提示：`目录ID仍未捕获：ipx-641`。

因此 Test11 的“透明捕获同一次旧搜索返回值”方向本身没有破坏功能，但目录 ID 解析规则仍错误。

### 已确认根因

重新核对当前真实运行模块 `apps/cloud/pan115/modules/file_manage_v8.js` 后确认，`115Api` 的规范化文件对象使用统一字段：

```js
fid = String(f.fileId || "");
isDir = !!f.isDirectory;
```

当 `isDirectory === true` 时，这个 `fileId` **本身就是目录 ID**，文件管理随后直接把同一个 `fileId` 作为 `cid` 打开目录。

Test11 的捕获器却把 `fileId/file_id` 当成普通文件 `fid`，并继续要求另有 `cid` 字段，因此对类似下面这种已规范化目录对象必然漏判：

```text
{name:"ipx-641", fileId:"真实目录ID", isDirectory:true}
```

这与原始 WebAPI 对象的另一种表示并不冲突：原始对象仍可能是 `fid` 缺失而 `cid` 存在 = 目录。

### Test12 修改边界

Test12 再次从 Test5 前本地快照恢复已经实机证明可用的旧 `115Search`，保持其 URL、参数、认证、关键词处理和时序不变，只修捕获器的目录字段解释：

```text
原始 WebAPI目录：!fid && cid        → 目录ID = cid
规范化115Api目录：isDirectory=true → 目录ID = fileId（优先）
```

不增加第二次搜索，不并发，不轮询。解析到目录 ID 后直接进入当前增强 `115FileManage`。

### Test12 实机验收

继续用 `ipx-641`：

1. 仍应返回约 6 条结果；
2. 点击 `ipx-641`、`ipx-641-C` 应进入各自真实目录；
3. mp4 结果继续正常播放；
4. 关键词摘要保持纯文本；
5. 原文件管理、批量删除/复制/移动、回收站、磁链播放不得回归。

当前状态：`pending-device-validation-normalized-folder-fileId`。

## 1.2.1-test.11 / Build 2026092231 — 同一次旧搜索返回值捕获（目录导航失败）

Test11 不再像 Test10 那样点击目录后重发一个猜测搜索，而是透明包装原旧搜索实际调用的 `request/fetch/115Api Client`，保存原样返回值，再在 `setResult` 前查目录对象。

实机结果：搜索 6 条和现有 UI 均正常，但目录仍提示 `目录ID仍未捕获`。后续确认失败原因不是没有数据，而是 Test11 错误要求规范化目录还必须存在独立 `cid`，没有把 `isDirectory=true + fileId` 识别为目录 ID。

状态：`failed-device-validation-folder-id-not-captured`，由 Test12 接手。

## 1.2.1-test.10 / Build 2026092230 — 保留旧搜索请求链，只修结果层（部分通过）

实机确认：

- `ipx-641`：6 条；
- 视频播放：正常；
- 关键词摘要 `<font ...>` 裸显：已修复；
- 文件夹导航：失败，后置补查无法恢复真实 ID。

Test10 证伪：不能在结果渲染后再重新构造一个搜索请求来假定能得到旧链相同数据。

## 1.2.1-test.9 / Build 2026092229 — 恢复 Test5 前原始搜索链（关键已验证基线）

从手机本地旧规则缓存恢复 Test5 前完整 `115Search`，实机确认 `ipx-641` 恢复约 6 条并且视频可播放。因此：

**Test9 恢复的旧搜索请求链是当前不可破坏的搜索基线。**

恢复候选：

1. `115_12104_file_manage_ux_test.json`
2. `115_12103_file_manage_test.json`
3. `115_12102_batch_manage_test.json`
4. `115_12101_recycle_clear_test.json`
5. `115_stable_120_rule.json`

## 1.2.1-test.5 ～ test.8 — 搜索重写失败记录

- Test5：重构搜索页后已知关键词由约 6 条退化为 0 条；
- Test6：切 `aid=1`、捕获 `getFiles()` 传输再改写搜索，仍 0 条；
- Test7：提出恢复旧搜索，但未完成实机验证即被 Test8 替代；
- Test8：已正确识别设备走 WebAPI，但合成 `/files/search` 仍 0 条。

长期结论：**不能根据 endpoint/aid/认证模式自行合成一个“看起来等价”的搜索请求。**

## 1.2.1-test.4 / Build 2026092224 — 文件管理 UX

文件管理 V8 增加：根目录/上一级/面包屑、名称/时间/大小排序、类型筛选、文件信息页、目标目录导航和最近目标等。该模块同时确认 `115Api` 规范化对象合同：`fileId` 为统一对象 ID，`isDirectory` 区分文件/目录；目录打开时直接把 `fileId` 用作 `cid`。

## 1.2.1-test.3 / Build 2026092223 — 新建 / 重命名 / 单项复制移动

增加新建文件夹，以及长按重命名、复制、移动、删除到回收站。新建/重命名隔离在 `file_ops_v1.js`，复制/移动复用批量核心。

## 1.2.1-test.2 / Build 2026092222 — 批量删除 / 复制 / 移动（已实机验证）

已验证：多选/取消/全选、批量删除到回收站、批量复制、批量移动、目标目录选择。顺序分批执行，不并发，一次最多 1000 项。

## 1.2.1-test.1 / Build 2026092221 — 清空回收站（已实机验证）

输入 115 安全密码 → 二次确认 → 快照回收站 rid → `cleanRecycleBin` 顺序分批执行；失败立即停止并报告进度。

## Stable 1.2.0 / Build 2026092220 — 已实机验证

稳定能力：普通文件/文件夹删除到回收站、回收站列表/还原/永久删除、磁链低频安全链、独立文件管理、登录/Cookie/m115、分享与个人文件直链播放。

普通删除最终采用：复用已验证 `revertRecycleBin()` 的真实认证 request 结构，只将 `/rb/revert` 改为 `/rb/delete`、`rid` 改为 `fid[n]`。

## 长期协议与禁用项

磁链外部调用固定：

```js
function playBy115(url) {
    if (!url) return "toast://未获取到磁力链接";
    return "hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url);
}
```

禁止 magnet → `115Search?kw=`。

永久避免：

- 自行重写完整 115 magnet 协议层；
- 后台高频/并发轮询（历史 Test7 曾导致 HTML 响应和“我的文件”空白）；
- 普通删除猜 `client.request()` 参数顺序；
- 重新改写 Test9 已恢复并实机证明工作的搜索请求链；
- 点击目录后另发一个猜测出来的搜索请求以恢复 ID；
- 把 `fileId` 固定解释为普通文件 ID——规范化目录同样使用 `fileId`，必须结合 `isDirectory` 判断；
- 未经实机验证就标记完整 deviceValidated。

## 当前开发边界

Stable 1.2.0 不动。Test1、Test2 已实机通过；搜索的“能搜到 + 视频播放 + 关键词显示”也已经实机成立。当前 Test12 **只验证规范化目录的 `isDirectory + fileId` 跳转**，不得改动已恢复的搜索请求链。目录导航闭环后，再继续文件管理优化。
