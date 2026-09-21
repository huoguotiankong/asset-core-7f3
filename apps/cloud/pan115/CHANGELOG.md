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

### 当前验收重点

1. 覆盖导入 Test1f。
2. 输入框保持短提示 `粘贴磁链`。
3. 粘贴 magnet 后应进入原版“离线下载”页，而不是搜索页。
4. 页面应出现“已自动添加任务”或对应离线任务。
5. 已完成任务点击后进入其保存目录，视频可由原版播放器正常播放。
6. 通过后，磁力君/JavDB/JavBus 等外部小程序直接调用 `115Offline?add=`，无需依赖测试壳中转。
