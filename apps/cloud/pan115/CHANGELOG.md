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

用户实机确认“原版 115 首页直接输入磁力链接”可以离线；结合源码核对，首页输入框真实分流为：

```text
115 分享链接
→ 115Share?sc=<原文>

magnet / ed2k / HTTP(S)
→ 115Offline?add=<原文>

普通关键词
→ 115Search?kw=<关键词>
```

因此其它小程序传 magnet 的正确稳定入口是：

```js
"hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url)
```

不是：

```js
"hiker://page/115Search?rule=115.简&page=fypage&kw=" + encodeURIComponent(url)
```

用户实机已证明后者只会把整条 magnet 当成网盘搜索关键词，页面显示 `共0条 / 无结果`。

### 原版“复制调用”现存缺陷

原版首页“复制调用”按钮当前仍生成 `115Search?kw=` 模板，对 magnet 不正确。正式增强版必须改成 `115Offline?add=`，或做按输入类型分流。

## 2026-09-21 · Test1 / Test1b / Test1c / Test1d 失败链

### Test1

曾新增 `115Open`，自行实现 magnet → 离线任务 → file_id → 播放/选集。静态检查与 mock 通过，但实机推进后确认没有必要，且引入跨规则模块兼容风险，停止继续发展。

### Test1b

远程完整壳直接 `home_rule_url` 导入时实机报：

```text
规则有误: syntax error, unexpected token error
```

后续改成 `@import=js:` 先下载到 `hiker://files/cache/...` 再本地导入，云口令导入链恢复。

### Test1c

点击磁链页后实机报：

```text
Expected URL scheme 'http' or 'https' but no colon was found
```

根因：`$.require('hiker://page/115Api?rule=115.简')` 被当前海阔进入 HTTP require/request 路径。结论：**跨规则 `hiker://page/...` 不能作为 `$.require()` 模块 URL 使用。**

### Test1d

尝试 `fetch('hiker://home@115.简') → 解析 pages → eval 原版 115Api` 建桥，实机仍报同类 URL scheme 错误。后续禁止继续绕模块边界复用 `115Api`。

同时用户指出输入框长提示影响体验；测试壳和后续磁链专用入口统一使用短提示。

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

因此 Test1e 判定失败并冻结；以当前实机结果和原版首页源码为准。

## 2026-09-21 · Test1f 正确回归原版离线入口

- 工件：`apps/cloud/pan115/test/115_enhance_overlay_test1f_rule.json`
- version：`2026092106`
- 标题：`115.简·测试`
- Test only，不覆盖原版 `115.简`。

Test1f 不再加载任何 115Api，也不自行实现离线逻辑，仅做最薄调用壳：

```text
粘贴磁链
→ hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>
→ 原版 115Offline 自动 addOfflineTaskURIs([autoAdd], "0")
→ 原版离线任务列表
```

### Test1f 实机结果

用户确认 magnet 能正确自动添加并完成离线，说明 `115Offline?add=` 外部入口成立；但完成任务点击后仍需多次进入文件夹才能找到视频。

实机截图：

```text
离线任务 meyd-553（完成）
→ 点击后进入父目录
→ 再点 meyd-553 文件夹
→ UUE29.mp4（62.71 MB）
→ meyd-553.mp4（4.95 GB）
→ 再点正片播放
```

源码核对确认：原 `115Offline` 完成任务点击使用 `t.dirId`，而 `dirId = wp_path_id` 是**任务结果父目录**；真正的任务结果 ID 已由离线接口返回在 `t.fileId`。

## 2026-09-21 · Test2 完成任务直播放增强

### 目标

只修完成任务点击链，不改 115 登录、m115 加解密、离线 API 和直链解析：

```text
完成任务
→ 优先 t.fileId
→ fileId 是视频：直接 player.resolve
→ fileId 是目录：最多递归 4 层 / 500 项寻找视频
→ 按大小降序
→ 默认播放最大视频
→ 找不到视频才回退文件浏览
```

用户当前 `meyd-553` 例子中，应直接选 `4.95 GB` 的 `meyd-553.mp4`，而不是 `62.71 MB` 的小视频。

### 架构

Test2 采用**本地克隆补丁**，避免跨规则 require：

```text
读取当前已安装 hiker://home@115.简
→ 保留完整原版 115Api / List / Search / Share / Account
→ 仅替换 115Offline
→ title = 115.简·测试
→ version = 2026092107
→ 作为完整规则导入
```

- 补丁：`apps/cloud/pan115/test/pan115_test2_patch.js`
- Test only。
- 同时修正原“复制调用”磁链模板为 `115Offline?add=`。
- 本地静态验证：克隆后保留全部 7 个原版页面；全部页面 `node --check` 通过。

## 2026-09-21 · Test3 磁链播放链集中优化

用户决定先把 115 的磁链调用/播放链优化好，再给其它小程序批量接入。因此 Test3 继续保持 Architecture-First：不改已经稳定的登录、协议、文件列表和个人网盘直链，仅强化 `115Offline` 与离线结果选择。

### 工件

- 补丁：`apps/cloud/pan115/test/pan115_test3_patch.js`
- commit：`0bbf7eda8c2c2a450321b1ceef4381c9aeeafdf3`
- 生成测试规则：`115.简·测试`
- version：`2026092108`
- 新增本地页面：`115OfflineResult`
- 保持 Test only，不覆盖 `115.简` Stable。

### 1. 外部 magnet 调用改成“当前任务聚焦模式”

当页面带 `add=<magnet>` 时，不再展示整页历史任务作为主界面，而是：

```text
其它小程序调用 magnet
→ 115Offline?add=
→ 查重
→ 当前磁链状态卡
→ 刷新当前状态
→ 完成后点击播放
→ 需要时可进入全部离线任务
```

这样其它小程序调用后不会被几十条历史任务淹没，更接近播放器而不是下载管理器。

### 2. 防重复提交

外部调用和手动添加都会先查现有离线任务：

- magnet 使用 40 位 hex BTIH 与 `task.infoHash` 比较；
- 同时以完整 `task.url` 精确比较兜底；
- 已存在下载中任务：直接复用，不再次 `addOfflineTaskURIs()`；
- 已存在完成任务：直接复用已下载结果。

本地 mock 已验证：相同已完成 magnet 再次调用时 `addOfflineTaskURIs()` 调用次数为 0；新 magnet 调用次数为 1。

### 3. 完成任务优先 `fileId`

点击完成任务时：

```text
t.fileId
→ 直接 getFile
→ 文件则检查是否视频
→ 文件夹则受控递归扫描
```

只有 `fileId` 缺失时才在 `t.dirId` 父目录里**按任务名精确找结果**，避免直接扫描整个父目录后误播其它历史任务。

最多递归 4 层、扫描 500 项。

### 4. 主视频智能识别

不再无条件“最大文件必播”。候选视频先过滤明显噪声：

```text
sample / preview / trailer / teaser / promo
试看 / 试播 / 预告 / 花絮 / 广告 / 宣传 / 二维码
```

同时优先使用 `>= 80 MB` 的正常视频候选。

判断逻辑：

```text
只有 1 个有效视频
→ 直接播放

最大视频 >= 500 MB，且 > 第二大视频 1.65 倍
→ 认为主片明显，直接播放

多个视频大小接近
→ 不猜主片
→ 进入 115OfflineResult 选集页
```

因此：

```text
62.71 MB 小视频 + 4.95 GB 正片
→ 直接播放 4.95 GB 正片
```

而类似：

```text
EP01 1.91 GB
EP02 1.92 GB
EP03 1.93 GB
```

会进入选集页，不会错误播放“最大的一集”。

本地 mock 已验证这两条分支：电影样例返回正片播放；三集近似大小资源返回 `115OfflineResult`。

### 5. 多视频选集页

新增 `115OfflineResult`：

- 从 `fileId` 开始递归扫描当前离线结果；
- `fileId` 缺失时按任务名在父目录精确定位；
- 最多扫描 500 项；
- 按文件名排列视频；
- 每个视频直接复用原版 `api.player.resolve` 播放。

### 6. 首页调用体验

生成测试规则时同步：

- 原首页长说明缩短为 `文件名 / 115分享链接 / 磁链`；
- `复制调用` 改名为 `复制磁链调用`；
- 复制出的 magnet 调用模板改成 `115Offline?add=`。

### Test3 静态/模拟验证

- Patch 本身 `node --check` 通过。
- 用用户上传的原版 `115.简` mock 执行 Patch 后，可生成 `115.简·测试` version `2026092108`。
- 保留原版 7 个页面并新增 `115OfflineResult`，共 8 页。
- 生成后的全部 8 个页面脚本 `node --check` 通过。
- mock 场景通过：
  1. 已完成相同 magnet → 不重复添加；
  2. `62 MB sample + 4.95 GB 正片` → 直接选择正片；
  3. 多集近似大小 → 进入选集页；
  4. 新 magnet → 只创建 1 个新任务。

### 当前实机验收重点

1. Test3 云口令导入成功，原版 `115.简` 保留。
2. 从 magnet 调用进入后只突出“当前任务”，不再先看到整页历史任务。
3. 重复调用同一 magnet 不新增重复任务。
4. `meyd-553` 已完成任务点击后直接播放 `4.95 GB` 正片。
5. 多集/多视频近似大小资源进入选集页，而不是误播最大文件。
6. 视频播放继续由原版 `player.resolve` 取得直链，确认 Header/UA 无回归。
7. 以上通过后再考虑把 Test3 能力合入正式 `115.简`，然后批量给其它磁力小程序接入。
