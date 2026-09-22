# 115.简 / Pan115 开发记录

状态：**Stable 1.2.0 / Build 2026092220 / 已实机验证；Test 1.2.1-test.7 / Build 2026092227 / 待实机验证**  
首次纳入：2026-09-21  
最近更新：2026-09-22

## 1.2.1-test.7 / Build 2026092227 — 恢复设备已证明可搜索的旧搜索链

### 当前实机结论

用户用同一个已知关键词 `ipx-641` 连续验证：

- Test4 及更早的旧搜索页：可返回约 **6 条结果**；
- Test5：改写搜索请求后变成 **0 条**；
- Test6：把 `aid=7` 改成 `aid=1`，并继续把 `getFiles()` 的认证传输改写到 `/files/search`，实机仍然是 **0 条**。

因此 Test6 判定为 `failed-device-validation-search-zero-results`。这轮停止继续猜 `aid / endpoint / request` 参数。

### 根因边界

Test5/Test6 的共同问题不是 UI，而是把原本已工作的搜索数据链替换成了新的推断实现。事实说明：

```text
“某个 client 方法已经完成认证”
≠
“可以把该方法的 request 模板跨 endpoint 复用”
```

即使返回的是合法 JSON、`state=true` 或空数组，也不能据此证明改写后的搜索合同正确。

### Test7 恢复策略

不再自己构造 `/files/search` 请求。安装器直接从用户设备之前安装 Test4/Test3/Test2/Test1/Stable 时留下的完整规则缓存中，提取 **Test5 之前的原始 `115Search` 页面代码**，再覆盖掉 Test5/Test6 的搜索页。

恢复顺序：

```text
hiker://files/cache/115_12104_file_manage_ux_test.json
→ 115_12103_file_manage_test.json
→ 115_12102_batch_manage_test.json
→ 115_12101_recycle_clear_test.json
→ 115_stable_120_rule.json
```

只接受 `version < 2026092225` 的规则快照，优先 Test4。Test4 安装器当时没有修改 `115Search`，而用户后续截图已经证明这一运行链能搜索出 `ipx-641` 的结果，因此它是当前最可靠的恢复源。

### 修改边界

本版只恢复 `115Search`，不回退其它当前能力：

- `file_manage_v8.js` 文件管理继续保留；
- `file_info_v1.js` 继续保留；
- `file_ops_v1.js` 新建/重命名继续保留；
- `batch_ops_v1.js + file_batch_v2.js + folder_picker_v2.js` 继续保留；
- `recycle_v5.js` 清空回收站继续保留；
- 登录/Cookie/m115、磁链离线、播放器不改；
- Test6 已恢复的首页输入框右侧搜索确认按钮继续保留。

如果设备找不到任何旧规则快照，安装器会直接停止并提示，不覆盖当前规则，避免第三次用猜测方案破坏搜索。

### Test7 验收顺序

本轮第一目标只有一个：**先把搜索结果恢复**。

1. 搜索 `ipx-641`，确认是否重新出现原来约 6 条结果；
2. 如果结果恢复，说明旧搜索数据链找回；
3. 此时旧页面的两个历史 UI 问题——关键词 HTML 裸显、文件夹点击“链接为空”——可能随旧搜索一起回来，这是本轮有意接受的阶段性回退；
4. 等搜索结果恢复后，下一版只在这份真实可用的旧 `115Search` 上做最小结果渲染/目录跳转补丁，不再碰请求层。

安装器：`apps/cloud/pan115/releases/1.2.1-test.7/installer.js`  
Release：`apps/cloud/pan115/releases/1.2.1-test.7/release.json`

当前状态：`pending-device-validation-search-recovery`。

## 1.2.1-test.6 / Build 2026092226 — 搜索 aid/transport 热修（实机失败）

Test5 后尝试：

- `/files/search` 参数从 `aid=7` 改回 `aid=1`；
- 不再优先调用签名不确定的 `filesSearch()`；
- 捕获当前 `getFiles()` 的已认证 request 结构，再将 URL/参数替换成搜索请求；
- 同时恢复首页输入框右侧确认按钮。

用户实机确认 `ipx-641` 仍为 0 条，因此此方案被证伪。**禁止继续把 `getFiles()` 的认证请求模板跨 endpoint 当作通用搜索传输。**

状态：`failed-device-validation-search-zero-results`，已被 Test7 覆盖。

## 1.2.1-test.5 / Build 2026092225 — 搜索页重构（实机失败）

目标是解决旧搜索页“目录点击空链接”和 HTML 裸显，并加入筛选/排序/分页。新页面能正常渲染，但同一 `ipx-641` 从旧页的约 6 条结果退化为 0 条。

状态：`failed-device-validation-search-zero-results`。

## 1.2.1-test.4 / Build 2026092224 — 文件管理 UX

新增/优化：

- 根目录 / 上一级 / 面包屑；
- 名称、时间、大小升降序；
- 文件夹 / 视频 / 图片 / 音频 / 文档 / 压缩包 / 其它筛选；
- 文件信息页：ID / PickCode / SHA1 / 大小 / 时间；
- 批量管理保持源目录上下文；
- 目标目录选择器加入导航、当前目录新建、最近目标。

Test4 没有修改旧 `115Search`，其安装缓存现在作为 Test7 的首选搜索恢复源。Test4 本身没有收到整版明确实机通过结论。

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
- 原版登录/Cookie、m115、115 分享、个人文件直链播放保持原合同。

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
- Test7 历史高并发轮询；
- 普通删除猜 `client.request()` 参数顺序；
- Test5 的新搜索 request 推断链；
- Test6 的“捕获 `getFiles()` 认证传输后跨 endpoint 改成 `/files/search`”方案；
- 仅修改 `aid=7/1` 就假定搜索合同正确；
- 看到合法空数组就把请求判定为正确；
- 未经实机验证就把 Test3～Test7 标记为 deviceValidated。

## 当前恢复/开发边界

Stable 1.2.0 不动。Test1 清空回收站、Test2 批量删除/复制/移动已实机通过。当前 Test7 只负责恢复 Test5 之前真实可用的搜索数据链；搜索恢复前不继续扩展搜索筛选、排序或协议层。等 `ipx-641` 结果恢复后，再从真实旧 `115Search` 做“目录点击 + 文本显示”最小补丁，并继续实机闭环。
