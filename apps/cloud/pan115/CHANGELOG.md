# 115.简 / Pan115 开发记录

状态：**Stable 1.2.0 / Build 2026092220 / 已实机验证；Test 1.2.1-test.10 / Build 2026092230 / 待实机验证**  
首次纳入：2026-09-21  
最近更新：2026-09-22

## 1.2.1-test.10 / Build 2026092230 — 保留旧搜索请求链，只修文件夹点击

### Test9 实机结论

用户在 14:49 再次使用已知关键词 `ipx-641` 验证：

- 搜索结果恢复：**6 条**；
- `ipx-641-3.mp4` 等视频结果点击可正常播放；
- 旧搜索页仍存在唯一明确故障：点击 `ipx-641` / `ipx-641-C` 文件夹提示 `链接为空，规则有误！`；
- 关键词摘要仍会裸显 `<font color=...>` 标签。

因此已经证明：**Test9 恢复出来的旧 `115Search` 请求链就是当前正确搜索基线**。后续不得再修改它的请求 API、关键词处理、认证结构或分页合同。

### Test10 修改边界

Test10 直接读取当前已安装 Test9 的 `115Search` 页面，只在最终 `setResult()` 输出前包一层轻量结果修正，不重写搜索请求：

```text
Test9 旧搜索请求（完全不动）
→ 原始结果渲染
→ Test10 输出包装器
   ├─ 普通文件/视频：原 URL 原样保留
   ├─ 文件夹：补真实 cid → 115FileManage
   └─ 关键词摘要：仅去掉裸显 font 标签
```

文件夹 ID 处理顺序：

1. 若旧卡片 `extra` 已携带 `cid/categoryId/folderId`，直接使用；
2. 否则只在用户点击该文件夹时，尝试复用旧页面中实际出现的 search 方法名；
3. 若仍未拿到 ID，再做一次低频 WebAPI 搜索，以“`fid` 不存在但 `cid` 存在 = 文件夹”的既有 115 字段规则精确匹配目录名；
4. 解析出真实 `cid` 后直接进入 `115FileManage`。

整个过程没有后台轮询，也没有并发搜索；补查只发生在用户主动点击文件夹时。

### Test10 实机验收

继续使用 `ipx-641`：

1. 仍应保持约 6 条结果；
2. `ipx-641`、`ipx-641-C` 两个文件夹应可直接进入；
3. mp4 结果仍应正常播放；
4. 顶部“关键词”摘要不再显示 `<font ...>` 原始标签；
5. 原文件管理、批量删除/复制/移动、清空回收站、磁链播放和登录均不得回归。

当前状态：`pending-device-validation-folder-navigation`。

## 1.2.1-test.9 / Build 2026092229 — 恢复 Test5 前原始搜索运行链（部分实机通过）

### 实机结论

Test9 从手机本地旧规则快照恢复了 Test5 前完整 `115Search` 页面。用户实机确认：

- `ipx-641` 恢复约 6 条结果；
- 视频结果点击可播放；
- 文件夹结果仍是旧版空链接；
- 旧关键词摘要 HTML 裸显仍存在。

因此 Test9 现标记为 `partially-device-validated-superseded`，搜索请求链与视频播放链视为当前已验证基线，文件夹导航由 Test10 接手。

### Test9 处理原则

Test9 不重写搜索 API，也不把 `getFiles()` 的 request 模板改造成另一个端点。安装器从手机 Test4/Test3/Test2/Test1/Stable 规则缓存中提取 Test5 之前完整 `115Search` 页面源码，原样恢复：

```text
当前 Test8
→ 读取手机本地旧规则快照
→ 找到 version < 2026092225 的 115Search
→ 原样替换当前 115Search
→ 其它页面全部保持现状
```

恢复候选按新到旧：

1. `115_12104_file_manage_ux_test.json`
2. `115_12103_file_manage_test.json`
3. `115_12102_batch_manage_test.json`
4. `115_12101_recycle_clear_test.json`
5. `115_stable_120_rule.json`

### 保留项

- 首页搜索框右侧确认按钮继续保留；
- File Management V8 / File Information / FileOps / BatchOps / FolderPicker 全部保留；
- 清空回收站、普通删除、批量删除/复制/移动保留；
- 登录、Cookie/m115、磁链离线、播放器全部不动。

## 1.2.1-test.8 / Build 2026092228 — 双认证搜索尝试（实机失败）

Test8 先从 `client.getFiles()` 判断当前实际认证模式：

```text
/open/ufile/files → OpenAPI Bearer → /open/ufile/search
/files            → WebAPI Cookie  → /files/search
```

用户实机页面明确显示当前为 `115 WebAPI /files/search`，但 `ipx-641` 仍为 0 条，说明模式识别正确但合成的 WebAPI 搜索请求仍与原版工作链不一致。

状态：`failed-device-validation-search-zero-results`，`supersededBy=1.2.1-test.9`。

## 1.2.1-test.7 / Build 2026092227 — 旧搜索恢复兜底（未实机验证即被 Test8 取代）

Test7 首次提出停止猜请求合同，直接从手机旧安装缓存恢复 Test5 之前的 `115Search`。当时未实机验证即被 Test8 取代。Test9 在 Test8 再次失败后正式回到这条恢复路线。

## 1.2.1-test.6 / Build 2026092226 — 搜索 aid/transport 热修（实机失败）

- `/files/search` 尝试 `aid=1`；
- 捕获当前 `getFiles()` 已认证 request 结构再改写搜索；
- 恢复首页输入框右侧确认按钮。

用户实机确认 `ipx-641` 仍为 0 条。状态：`failed-device-validation-search-zero-results`。

## 1.2.1-test.5 / Build 2026092225 — 搜索页重构（实机失败）

目标是解决旧搜索页“目录点击空链接”和 HTML 裸显，并加入筛选/排序/分页。新页面能正常渲染，但同一 `ipx-641` 从旧页约 6 条结果退化为 0 条。

状态：`failed-device-validation-search-zero-results`。

## 1.2.1-test.4 / Build 2026092224 — 文件管理 UX

新增/优化：

- 根目录 / 上一级 / 面包屑；
- 名称、时间、大小升降序；
- 文件夹 / 视频 / 图片 / 音频 / 文档 / 压缩包 / 其它筛选；
- 文件信息页：ID / PickCode / SHA1 / 大小 / 时间；
- 批量管理保持源目录上下文；
- 目标目录选择器加入导航、当前目录新建、最近目标。

Test4 本身没有收到整版明确实机通过结论，但其 `115Search` 属于 Test5 之前、用户已证明能搜到 `ipx-641` 的旧搜索 lineage。

## 1.2.1-test.3 / Build 2026092223 — 新建 / 重命名 / 单项复制移动

新增：

```text
文件管理顶部 → 新建文件夹
长按文件/文件夹 → 重命名 / 复制到… / 移动到… / 删除到回收站
```

新建/重命名由 `file_ops_v1.js` 隔离；单项复制/移动复用 Test2 已验证的批量核心。未收到整版独立实机通过结论。

## 1.2.1-test.2 / Build 2026092222 — 批量删除 / 复制 / 移动（已实机验证）

用户明确反馈可用：

- 多选 / 取消 / 全选本页 / 清空选择；
- 批量删除到回收站；
- 批量复制；
- 批量移动；
- 目标目录选择器。

所有批量请求顺序分批执行，不并发；一次操作最多 1000 项。移动到当前目录、复制/移动到自身有保护。

## 1.2.1-test.1 / Build 2026092221 — 清空回收站（已实机验证）

用户明确反馈可用。流程：

```text
输入115安全密码
→ 二次确认不可恢复
→ 完整快照回收站 rid
→ cleanRecycleBin 分批顺序执行
→ 失败立即停止并报告进度
```

## Stable 1.2.0 / Build 2026092220 — Test18 原样晋级（已实机验证）

稳定基线能力：

- 普通文件/文件夹删除到回收站；
- 回收站列表 / 还原 / 永久删除；
- 磁链低频安全链；
- 离线保存目录优先 `根目录/海阔视界 → 云下载/离线下载 → 根目录`；
- 独立文件管理；
- 原版登录/Cookie、m115、115 分享、个人网盘直链播放保持原合同。

普通删除最终采用：捕获已验证 `revertRecycleBin()` 的真实认证 request 结构，仅把 `/rb/revert` 改为 `/rb/delete`、`rid` 改为 `fid[n]`，用户实机确认有效。

## 1.2.0 关键历史与禁用事故

- Test12：确认 `rule=115.简` 中文规则名不能整体 percent encode；业务参数单独编码。
- Test13：首页降噪。
- Test14～18：逐步补齐文件管理、回收站、普通删除，最终进入 Stable 1.2.0。
- 历史 `1.2.0-test.7` 曾使用多路后台 worker 高频轮询 115，实机造成 HTML 响应和“我的文件”空白。永久禁止后台高频/并发轮询 115。

## 长期协议与调用边界

最初基线来自用户提供的 `115.简.hk小程序`，原规则已具备扫码/Cookie 登录、文件列表、**全盘搜索**、115 分享、离线任务、magnet/ed2k/HTTP(S) 添加、个人网盘直链播放。

磁链外部调用固定：

```js
function playBy115(url) {
    if (!url) return "toast://未获取到磁力链接";
    return "hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url);
}
```

禁止 magnet → `115Search?kw=`。

## 已证伪 / 禁止恢复

- 自行重写完整 115 magnet 协议层；
- 历史高并发轮询；
- 普通删除猜 `client.request()` 参数顺序；
- Test5 的单一路径搜索推断链；
- Test6 的“捕获 `getFiles()` 后统一改成 WebAPI `/files/search`”方案；
- 仅修改 `aid=7/1` 就假定搜索合同正确；
- 把 OpenAPI Bearer 请求直接改到 WebAPI Cookie 端点，或反向混用；
- Test8 的“识别认证模式后即可合成等价搜索请求”假设；
- 看到合法空数组就把请求判定为正确；
- 在恢复旧搜索请求链前继续叠加新的筛选/排序协议；
- 未经实机验证就把 Test3～Test10 标记为完整 deviceValidated。

## 当前恢复/开发边界

Stable 1.2.0 不动。Test1 清空回收站、Test2 批量删除/复制/移动已实机通过。Test9 已证明旧搜索请求链可正常返回结果并播放视频；当前 Test10 只修搜索结果文件夹导航和关键词摘要显示，**不得改动 Test9 已恢复的搜索请求链**。文件夹导航实机通过后，再继续其它文件管理优化。
