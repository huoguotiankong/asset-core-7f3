# 115.简 / Pan115 开发记录

状态：**Stable 1.2.0 / Build 2026092220 / 已实机验证；Test 1.2.1-test.11 / Build 2026092231 / 待实机验证**  
首次纳入：2026-09-21  
最近更新：2026-09-22

## 1.2.1-test.11 / Build 2026092231 — 从已工作的旧搜索请求原始返回中直接捕获目录 ID

### Test10 实机结论

用户继续以 `ipx-641` 实机验证 Test10：

- 搜索仍正常返回 **6 条**；
- 视频结果仍可正常播放；
- 顶部关键词摘要的 `<font ...>` 裸显已经修复；
- 点击 `ipx-641` / `ipx-641-C` 文件夹时，不再是海阔“链接为空”，但 Test10 的后置补查仍提示：

```text
已找到目录结果，但未解析到目录ID：ipx-641-C
```

因此 Test10 证明“结果卡片修正层”不会破坏旧搜索与视频播放，但也证明 **在结果渲染完成以后重新发起一个猜测出来的搜索/Client 调用，仍不能可靠获得旧搜索链中的真实目录 cid**。

状态：`partially-device-validated-superseded`，由 Test11 接手目录 ID 闭环。

### Test11 处理原则

Test11 不再在点击目录时发起第二个合成搜索请求，而是重新从手机 Test5 前快照恢复那套已经实机证明能工作的原始 `115Search`，然后只做**透明观察**：

```text
Test5 前原始搜索请求（URL / 参数 / 认证 / 时序全部不改）
→ 捕获这次请求或 115Api Client 方法的原始返回值
→ 原搜索代码照常渲染 6 条结果
→ setResult 前，从“同一份原始返回值”中按目录名称找真实 cid
→ 文件夹卡片 cid → 115FileManage
```

具体覆盖三条可能的旧实现路径：

1. 如果旧搜索直接使用海阔 `request()` / `fetch()`，Test11 仅包装调用并保存其**原样返回值**；
2. 如果旧搜索通过 `115Api.newClient()` 的搜索方法或 `getFiles()`，Test11 包装旧源码实际引用的方法，保存其**原样返回值**，调用参数与返回值均不改；
3. 最终结果输出时递归扫描已捕获响应和卡片自身元数据，按精确目录名匹配目录对象，目录判定兼容：`fid` 缺失而 `cid` 存在、`file_category=0`、`isDirectory/is_directory/is_dir` 等结构。

Test11 **不再执行 Test10 那种第二次 `/files/search` 猜测请求**，也不做后台扫描、并发或轮询。

### Test11 实机验收

继续只测 `ipx-641`：

1. 搜索仍应保持约 6 条结果；
2. `ipx-641`、`ipx-641-C` 两个文件夹应直接进入对应真实目录；
3. mp4 结果应继续播放；
4. 关键词摘要仍保持正常纯文本；
5. 若目录仍无法取得 ID，页面会提示 `目录ID仍未捕获`，此时说明旧搜索的网络调用发生在更深层模块内部，需要下一轮直接在旧结果构建语句处注入 raw item，而不是再猜接口。

安装器：`apps/cloud/pan115/releases/1.2.1-test.11/installer.js`  
Release：`apps/cloud/pan115/releases/1.2.1-test.11/release.json`  
当前状态：`pending-device-validation-raw-cid-capture`。

## 1.2.1-test.10 / Build 2026092230 — 保留旧搜索请求链，只修文件夹点击（部分通过）

Test10 只在旧搜索最终 `setResult()` 前修正结果卡片，不改搜索请求：

- 搜索 `ipx-641`：6 条，实机通过；
- 视频点击播放：实机通过；
- 关键词摘要 HTML 清理：实机通过；
- 文件夹导航：失败，后置补查无法得到真实 cid。

Test10 已证伪的点：**不能因为页面已经展示出目录名称，就假设随后用一个新构造的搜索调用能得到相同原始数据结构/认证上下文。**

状态：`partially-device-validated-superseded`，`supersededBy=1.2.1-test.11`。

## 1.2.1-test.9 / Build 2026092229 — 恢复 Test5 前原始搜索运行链（部分实机通过）

Test9 从手机本地旧规则快照恢复 Test5 前完整 `115Search`。实机确认：

- `ipx-641` 恢复约 6 条结果；
- 视频结果可播放；
- 文件夹仍是旧版空链接；
- 关键词摘要当时仍有 HTML 裸显。

因此 **Test9 恢复的搜索请求链与视频播放链，是当前不可破坏的搜索基线**。

旧搜索快照候选按新到旧：

1. `115_12104_file_manage_ux_test.json`
2. `115_12103_file_manage_test.json`
3. `115_12102_batch_manage_test.json`
4. `115_12101_recycle_clear_test.json`
5. `115_stable_120_rule.json`

状态：`partially-device-validated-superseded`。

## 1.2.1-test.8 / Build 2026092228 — 双认证搜索尝试（实机失败）

曾尝试区分：

```text
/open/ufile/files → OpenAPI Bearer → /open/ufile/search
/files            → WebAPI Cookie  → /files/search
```

实机明确显示当前是 `115 WebAPI /files/search`，但已知关键词仍为 0 条。说明即使认证体系识别正确，合成出来的新搜索请求也不等价于原始 115Search。

状态：`failed-device-validation-search-zero-results`。

## 1.2.1-test.7 / Build 2026092227 — 旧搜索恢复兜底

首次提出停止猜搜索接口，直接从手机旧缓存恢复 Test5 前 `115Search`。当时被 Test8 提前取代，后来由 Test9 正式采用并实机证明方向正确。

## 1.2.1-test.6 / Build 2026092226 — 搜索 aid / transport 热修（实机失败）

- 尝试切换 `aid=1`；
- 捕获 `getFiles()` 认证 request 再改写到搜索；
- 恢复首页右侧搜索按钮。

实机 `ipx-641` 仍为 0 条。

## 1.2.1-test.5 / Build 2026092225 — 搜索页重构（实机失败）

目标是修目录空链接并加筛选/排序/分页，但新搜索请求让已知关键词从约 6 条退化为 0 条。后续确认不能重写已工作的搜索请求链。

## 1.2.1-test.4 / Build 2026092224 — 文件管理 UX

新增/优化：

- 根目录 / 上一级 / 面包屑；
- 名称、时间、大小升降序；
- 文件夹 / 视频 / 图片 / 音频 / 文档 / 压缩包 / 其它筛选；
- 文件信息页：ID / PickCode / SHA1 / 大小 / 时间；
- 批量管理保持源目录上下文；
- 目标目录选择器加入导航、当前目录新建、最近目标。

整版尚无完整实机通过结论，但其中旧 `115Search` 属于已证明能搜索的 lineage。

## 1.2.1-test.3 / Build 2026092223 — 新建 / 重命名 / 单项复制移动

新增：新建文件夹；长按文件/文件夹支持重命名、复制、移动、删除到回收站。新建/重命名由 `file_ops_v1.js` 隔离，单项复制/移动复用 Test2 已验证的批量核心。

## 1.2.1-test.2 / Build 2026092222 — 批量删除 / 复制 / 移动（已实机验证）

用户明确确认以下能力可用：

- 多选 / 取消 / 全选本页 / 清空选择；
- 批量删除到回收站；
- 批量复制；
- 批量移动；
- 目标目录选择器。

所有批量请求顺序分批执行，不并发；一次最多 1000 项。

## 1.2.1-test.1 / Build 2026092221 — 清空回收站（已实机验证）

流程：输入 115 安全密码 → 二次确认 → 完整快照回收站 rid → `cleanRecycleBin` 分批顺序执行 → 失败立即停止并报告进度。

## Stable 1.2.0 / Build 2026092220 — Test18 原样晋级（已实机验证）

稳定能力包括：

- 普通文件/文件夹删除到回收站；
- 回收站列表 / 还原 / 永久删除；
- 磁链低频安全链；
- 离线保存目录优先 `根目录/海阔视界 → 云下载/离线下载 → 根目录`；
- 独立文件管理；
- 原版登录/Cookie、m115、115 分享、个人文件直链播放。

普通删除最终采用：捕获已验证 `revertRecycleBin()` 的真实认证 request 结构，仅将 `/rb/revert` 改 `/rb/delete`、`rid` 改 `fid[n]`，用户实机确认有效。

## 1.2.0 关键历史与永久禁用项

- Test12：确认 `rule=115.简` 中文规则名不能整体 percent encode；业务参数单独编码。
- Test13：首页降噪。
- Test14～18：逐步补齐文件管理、回收站、普通删除，最终进入 Stable 1.2.0。
- 历史 `1.2.0-test.7` 多路后台 worker 高频轮询曾造成 HTML 响应和“我的文件”空白，永久禁止后台高频/并发轮询 115。

## 长期协议与调用边界

最初基线来自用户提供的 `115.简.hk小程序`。原规则具备扫码/Cookie 登录、文件列表、全盘搜索、115 分享、离线任务、magnet/ed2k/HTTP(S) 添加、个人网盘直链播放。

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
- 高频并发轮询；
- 普通删除猜 `client.request()` 参数顺序；
- Test5 单一路径搜索重写；
- Test6 捕获 `getFiles()` 后统一改到 WebAPI `/files/search`；
- 仅修改 `aid=7/1` 就假定搜索合同正确；
- OpenAPI Bearer 与 WebAPI Cookie 端点混用；
- Test8 “识别认证模式后即可合成等价搜索请求”的假设；
- 看到合法空数组就判定请求正确；
- Test10 在结果渲染后再发起第二个猜测搜索来恢复目录 cid；
- 未经实机验证就把 Test3～Test11 标记为完整 deviceValidated。

## 当前恢复/开发边界

Stable 1.2.0 不动。Test1 清空回收站、Test2 批量删除/复制/移动已实机通过。搜索方面：**Test9 的旧请求链 + Test10 的关键词显示修正已经实机成立**；当前 Test11 只解决“从同一份已工作搜索响应中取出文件夹 cid”，不得改动搜索请求本身。目录导航闭环后，再继续其它文件管理优化。
