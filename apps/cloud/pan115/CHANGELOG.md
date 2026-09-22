# 115.简 / Pan115 开发记录

状态：**Stable 1.2.0 / Build 2026092220 / 已实机验证；Test 1.2.1-test.8 / Build 2026092228 / 待实机验证**  
首次纳入：2026-09-21  
最近更新：2026-09-22

## 1.2.1-test.8 / Build 2026092228 — 搜索认证模式识别修复

### 新确认的根因

用户用同一已知关键词 `ipx-641` 连续验证：旧搜索可返回约 6 条，Test5/Test6 均退化为 0 条。继续核对当前 115Api 的文件列表能力、115 WebAPI 实现和 115 开放平台接口后，确认此前漏掉了一个关键边界：**当前 Client 的 `getFiles()` 可能运行在两套不同认证体系之一**。

```text
OpenAPI 模式
proapi.115.com/open/ufile/files
Authorization: Bearer access_token

WebAPI 模式
webapi.115.com/files
Cookie 登录态
```

Test5/Test6 虽然捕获了 `getFiles()` 的认证传输，但无论捕获到哪种模式，都把业务地址强行改成 `webapi.115.com/files/search`。因此“认证存在”并不等于“认证可以跨体系复用”。如果当前设备 Client 实际走 OpenAPI Bearer，把它改到 WebAPI 搜索端点就可能得到合法但为空的响应。这与实机连续 0 结果现象一致。

### Test8 搜索链

`search_v3.js` 不再预设搜索认证模式，而是先真实调用一次被拦截的 `client.getFiles()`，只读取它实际使用的请求结构并判断模式：

```text
捕获 getFiles()
├─ /open/ufile/files → OpenAPI Bearer
│   └─ GET /open/ufile/search
└─ /files            → WebAPI Cookie
    └─ GET /files/search
```

#### OpenAPI

使用：

```text
https://proapi.115.com/open/ufile/search
```

核心参数：

- `search_value`
- `limit`
- `offset`
- `fc=1`：只看文件夹
- `fc=2`：只看文件
- `type=1/2/3/4/5`：文档 / 图片 / 音频 / 视频 / 压缩包

返回字段按开放平台合同读取：

- `file_id`
- `parent_id`
- `file_name`
- `file_size`
- `pick_code`
- `user_utime`
- `file_category`：`0=文件夹`、`1=文件`

#### WebAPI

使用：

```text
https://webapi.115.com/files/search
```

恢复成熟 WebAPI 搜索参数：

- `aid=7`
- `cid=0`
- `format=json`
- `search_value`
- `offset / limit`
- `count_folders=1`
- `o / asc`
- `type=1/2/3/4/5/6`：文件夹 / 文档 / 图片 / 视频 / 音频 / 压缩包

返回字段继续兼容 `fid / cid / n / s / pc / fc / t`。

### 结果行为

- 文件夹：真实目录 ID → `115FileManage`，不返回空 URL；
- 视频：继续使用现有 `player.resolve()`；
- 其它文件：进入 `115FileInfo`；
- 搜索页保留全部 / 文件夹 / 视频 / 图片 / 音频 / 文档 / 压缩包筛选；
- WebAPI 排序由服务器完成，OpenAPI 排序在当前页结果上本地完成；
- 首页搜索框右侧确认按钮继续保留；
- 不修改登录、磁链、离线、播放器、文件管理、批量操作和回收站协议；
- 不增加后台轮询或并发搜索。

如果仍为 0 条，页面会明确显示当前识别到的搜索通道（`115开放平台 /open/ufile/search` 或 `115 WebAPI /files/search`），下一轮可以直接按真实运行模式继续定位，不再盲猜。

### Test8 实机验收

1. 使用已知关键词 `ipx-641`，应恢复旧版约 6 条结果；
2. 点击 `ipx-641`、`ipx-641-C` 两个目录，应直接打开而不是“链接为空”；
3. 点击 `ipx-641-3.mp4` 等视频，应继续走现有 115 播放链；
4. 验证“文件夹 / 视频”至少两个类型筛选；
5. 切换一次名称或时间排序；
6. 首页搜索框右侧搜索按钮仍显示并可用；
7. 回归确认文件管理、新建/重命名、批量删除/复制/移动、清空回收站、磁链离线、登录均未受影响。

模块：`apps/cloud/pan115/modules/search_v3.js`  
模块快照：`9383dad6bf441d3c15360e57ef5b16e5e17c4cfc`  
安装器：`apps/cloud/pan115/releases/1.2.1-test.8/installer.js`

当前状态：`pending-device-validation-search-dual-auth`。

## 1.2.1-test.7 / Build 2026092227 — 旧搜索恢复兜底（未实机验证即被 Test8 取代）

### 当前实机结论

用户用同一个已知关键词 `ipx-641` 连续验证：

- Test4 及更早的旧搜索页：可返回约 **6 条结果**；
- Test5：改写搜索请求后变成 **0 条**；
- Test6：把 `aid=7` 改成 `aid=1`，并继续把 `getFiles()` 的认证传输改写到 `/files/search`，实机仍然是 **0 条**。

Test7 原计划停止猜请求合同，直接从手机旧安装缓存恢复 Test5 之前的 `115Search`。这仍然保留为应急恢复思路，但会同时恢复旧搜索页“目录点击空链接”的已知缺陷。Test8 找到 OpenAPI/WebAPI 认证模式差异后，以协议正确的双模式搜索替代 Test7，因此 Test7 未进入实机验收。

状态：`superseded-before-device-validation`，`supersededBy=1.2.1-test.8`。

## 1.2.1-test.6 / Build 2026092226 — 搜索 aid/transport 热修（实机失败）

Test5 后尝试：

- `/files/search` 参数从 `aid=7` 改回 `aid=1`；
- 不再优先调用签名不确定的 `filesSearch()`；
- 捕获当前 `getFiles()` 的已认证 request 结构，再将 URL/参数替换成搜索请求；
- 同时恢复首页输入框右侧确认按钮。

用户实机确认 `ipx-641` 仍为 0 条。后续进一步确认真正问题不只是 `aid`，而是 **OpenAPI Bearer 与 WebAPI Cookie 两套认证/端点体系不能混用**。

状态：`failed-device-validation-search-zero-results`。

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

Test4 本身没有收到整版明确实机通过结论。

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
- 历史高并发轮询；
- 普通删除猜 `client.request()` 参数顺序；
- Test5 的单一路径搜索推断链；
- Test6 的“无视当前认证模式，捕获 `getFiles()` 后统一改成 WebAPI `/files/search`”方案；
- 仅修改 `aid=7/1` 就假定搜索合同正确；
- 把 OpenAPI Bearer 请求直接改到 WebAPI Cookie 端点，或反向混用；
- 看到合法空数组就把请求判定为正确；
- 未经实机验证就把 Test3～Test8 标记为 deviceValidated。

## 当前恢复/开发边界

Stable 1.2.0 不动。Test1 清空回收站、Test2 批量删除/复制/移动已实机通过。当前 Test8 只针对搜索认证模式和结果跳转修复；搜索实机闭环前不继续扩大搜索协议改动。若 `ipx-641` 仍为 0 条，必须以页面显示的真实搜索通道继续定位，不再盲改 `aid` 或跨认证体系复用请求。
