# 115.简 / Pan115 开发记录

状态：**Test only / 待海阔实机验证**  
首次纳入：2026-09-21

## 基线与已确认事实

- 基线来自用户上传的 `115.简.hk小程序.zip`，原规则为单文件 `rule.json`。
- 原实现已经具备：115 Cookie/扫码登录、文件列表、全盘搜索、115 分享、离线任务、`magnet/ed2k/http(s)` 离线添加、个人网盘文件直链解析与播放。
- `addOfflineTaskURIs()` 使用 `https://lixian.115.com/lixianssp/?ac=add_task_urls`，支持 HTTP / ED2K / magnet。
- `listOfflineTask()` 返回的 `file_id` 是离线完成后生成的文件或文件夹 ID；`wp_path_id` 在当前 JS 中映射为 `dirId`。
- 原 `player.resolve()` 已能通过 `pickcode` → `proapi.115.com/app/chrome/downurl` 获取个人网盘直链并带 UA/Header 播放。

## 原版磁链入口：最终实机结论

2026-09-21 用户说明“原版 115 直接输入磁力链接可以离线播放”。进一步结合用户实机截图与原版源码核对后，确认这里的“直接输入”指的是 **原版首页搜索/打开输入框**，不是 `115Search?kw=` 页面参数。

原版首页输入框真实逻辑：

```text
115 分享链接
→ 115Share?sc=<原文>

magnet / ed2k / HTTP(S)
→ 115Offline?add=<原文>

普通关键词
→ 115Search?kw=<关键词>
```

因此外部小程序传 magnet 的正确入口是：

```js
"hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url)
```

而不是：

```js
"hiker://page/115Search?rule=115.简&page=fypage&kw=" + encodeURIComponent(url)
```

用户实机已证明后者只会把整条 magnet 当成网盘搜索关键词，页面显示 `共0条 / 无结果`。

### 原版“复制调用”现存缺陷

原版首页“复制调用”按钮当前仍生成 `115Search?kw=` 模板。对普通关键词可用，但对 magnet 不正确；这是原版现存调用模板缺陷。后续如正式增强原版，应把外部调用做成按输入类型分流，至少磁链走 `115Offline?add=`。

## 2026-09-21 · Test1 本地完整增强

曾新增 `115Open`，自行实现 magnet → 离线任务 → file_id → 播放/选集。静态检查与 mock 通过，但实机推进后确认该方案没有必要，且引入跨规则模块加载兼容风险，停止继续发展。

## 2026-09-21 · Test1b / Test1c / Test1d 失败链

### Test1b

- 远程完整壳直接 `home_rule_url` 导入时实机报 `syntax error, unexpected token error`。
- 改成 `@import=js:` 先下载到 `hiker://files/cache/...` 再本地导入后，云口令导入链恢复。

### Test1c

点击磁链页后实机报：

```text
Expected URL scheme 'http' or 'https' but no colon was found
```

根因：`$.require('hiker://page/115Api?rule=115.简')` 被当前海阔进入 HTTP require/request 路径。结论：**跨规则 `hiker://page/...` 不能作为 `$.require()` 模块 URL 使用。**

### Test1d

尝试 `fetch('hiker://home@115.简') → 解析 pages → eval 原版 115Api` 建桥，实机仍报同类 URL scheme 错误。停止继续绕模块边界复用 115Api。

同时用户指出输入框长提示影响体验，后续输入框统一缩短为 `粘贴磁链`。

## 2026-09-21 · Test1e 错误回归路线

Test1e 曾根据原版“复制调用”模板直接跳：

```text
115Search?kw=<magnet>
```

用户实机截图确认结果为：

```text
关键词：magnet?... · 共0条
（无结果）
```

因此 Test1e 判定失败并冻结。此前关于“`115Search?kw=` 可直接完成磁链离线播放”的判断撤销，以当前截图和原版首页源码为准。

## 2026-09-21 · Test1f 正确回归原版离线入口

- 工件：`apps/cloud/pan115/test/115_enhance_overlay_test1f_rule.json`
- version：`2026092106`
- 标题：`115.简·测试`
- Test only，不覆盖原版 `115.简`。

Test1f 不再加载任何 115Api，也不自行实现离线逻辑，仅做最薄调用壳：

```text
粘贴磁链
→ hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>
→ 原版 115Offline 在第 1 页自动 addOfflineTaskURIs([autoAdd], "0")
→ 原版离线任务列表
→ 完成任务点击进入其保存目录
→ 使用原版文件页 / player.resolve 播放
```

### Test1f 实机结果

用户确认 magnet 能正确自动添加并完成离线，说明 `115Offline?add=` 外部入口成立；但完成任务点击后仍需多次进入文件夹才能找到视频。

实机截图显示：

```text
离线任务 meyd-553（完成）
→ 点击后进入父目录
→ 再点 meyd-553 文件夹
→ 才看到 UUE29.mp4（62.71 MB）和 meyd-553.mp4（4.95 GB）
→ 再点正片播放
```

源码核对确认根因：原 `115Offline` 完成任务点击使用 `t.dirId`，而 `dirId = wp_path_id` 是**任务结果父目录**；真正的任务结果 ID 已由离线接口返回在 `t.fileId`。

## 2026-09-21 · Test2 完成任务直播放增强

### 目标

在不改 115 登录、加密、离线 API 和直链解析的前提下，只修复完成任务点击链：

```text
完成任务
→ 优先 t.fileId
→ 若 fileId 是视频：直接 player.resolve
→ 若 fileId 是目录：最多递归 4 层 / 500 项寻找视频
→ 按文件大小降序
→ 默认播放体积最大的主视频
→ 没找到视频时才回退文件浏览
```

这样可自动避开常见 `sample / 预告 / 花絮` 小文件。用户当前 `meyd-553` 例子中，应直接选择 `4.95 GB` 的 `meyd-553.mp4`，而不是 `62.71 MB` 的 `UUE29.mp4`。

### 交付架构

由于 Test1c/Test1d 已证明跨规则复用 `115Api` 不可靠，Test2 不再做轻量中转壳，而是通过云口令运行一个**本地克隆补丁**：

```text
读取当前已安装 hiker://home@115.简
→ 保留原版完整 115Api / List / Search / Share / Account 等页面
→ 仅替换 115Offline 页面为增强版
→ title 改为 115.简·测试
→ version 2026092107
→ 作为完整首页规则导入
```

这样 `$.require("115Api")` 始终发生在同一规则内部，避免之前的跨规则 require 问题。

- 补丁工件：`apps/cloud/pan115/test/pan115_test2_patch.js`
- 不可变工件 commit：`39143a4533e181aa845b5f043fb934ec6cb0264a`
- 补丁同时修正原“复制调用”磁链模板为 `115Offline?add=`。
- 本地模拟验证：补丁可从原版规则生成 `115.简·测试` version `2026092107`，保留全部 7 个原版页面；增强后的 `115Offline` 与全部页面均通过 `node --check`。

### 当前实机验收重点

1. 云口令覆盖导入 `115.简·测试` 成功。
2. 首页仍保持原版完整功能与登录状态。
3. 磁链通过首页或外部 `115Offline?add=` 成功添加。
4. 已完成任务描述显示 `点击直接播放主视频`。
5. 点击 `meyd-553` 这类任务时，不再进入父目录，而是直接播放最大视频。
6. 测一个只有单视频的任务。
7. 再测一个多集/多个同尺寸视频的任务；若“默认最大文件”不适合剧集类资源，再升级为自动判断“电影直放 / 多集选集”。
