# 115.简 / Pan115 开发记录

状态：**Test only / 待海阔实机验证**  
首次纳入：2026-09-21

## 基线与已确认事实

- 基线来自用户上传的 `115.简.hk小程序.zip`，原规则为单文件 `rule.json`。
- 原实现已经具备：115 Cookie/扫码登录、文件列表、全盘搜索、115 分享、离线任务、`magnet/ed2k/http(s)` 离线添加、个人网盘文件直链解析与播放。
- `addOfflineTaskURIs()` 使用 `https://lixian.115.com/lixianssp/?ac=add_task_urls`，支持 HTTP / ED2K / magnet。
- `listOfflineTask()` 返回的 `file_id` 是离线完成后生成的文件或文件夹 ID；`wp_path_id` 在当前 JS 中映射为 `dirId`。
- 原 `player.resolve()` 已能通过 `pickcode` → `proapi.115.com/app/chrome/downurl` 获取个人网盘直链并带 UA/Header 播放。
- **用户实机确认：原版 `115.简` 直接调用 `hiker://page/115Search?rule=115.简&page=fypage&kw=<encoded magnet>` 可以完成磁链离线并进入播放链。** 这一实机事实高于此前基于静态源码对 `115Search` 的推断。

## 2026-09-21 · Test1 本地完整增强

曾新增 `115Open`，尝试自行实现：

```text
magnet / ed2k / HTTP(S)
→ 查已有任务避免重复提交
→ addOfflineTaskURIs
→ 保存/跟踪 info_hash
→ listOfflineTask
→ 完成后按 task.file_id 定位
→ 单视频播放 / 多视频选集
```

本地 JSON/脚本静态检查通过，但后续实机证明这条重实现路线没有必要，且增加了跨规则模块加载兼容风险。

此前把原版“复制调用”中的 `115Search?kw=` 判断为磁链设计问题，**该判断已被用户当前实机结果证伪**，后续禁止继续沿用。

## 2026-09-21 · Test1b / Test1c / Test1d 失败链记录

### Test1b

- 远程完整壳直接 `home_rule_url` 导入时实机报 `syntax error, unexpected token error`。
- 后续改为 `@import=js:` 先下载到 `hiker://files/cache/...` 再本地导入，导入链恢复。

### Test1c

用户实机确认 Test1c 能成功导入并打开，但点击磁链页后报：

```text
ArticleListModel-HttpRequestError-msg:
java.lang.IllegalArgumentException:
Expected URL scheme 'http' or 'https' but no colon was found
```

根因：`$.require('hiker://page/115Api?rule=115.简')` 被当前海阔进入 HTTP require/request 路径。**跨规则 `hiker://page/...` 不能当成 `$.require()` 的模块 URL 使用。**

### Test1d

尝试通过 `fetch('hiker://home@115.简') → JSON.parse(rule.pages) → eval 原版 115Api` 建立本地桥接，但用户实机仍出现同类 URL scheme 错误，说明继续绕模块边界复用 `115Api` 价值低、风险高。

同时用户指出输入框提示 `粘贴 magnet / ed2k / HTTP下载链接` 太长，影响输入体验；后续统一缩短为 `粘贴磁链`。

## 2026-09-21 · Test1e 回归原版已验证调用链

### 核心决策

停止自行重实现磁链离线播放链，直接复用用户实机已确认可工作的原版入口：

```text
"hiker://page/115Search?rule=115.简&page=fypage&kw=" + encodeURIComponent(url)
```

Test1e 只做调用壳，不再：

- 跨规则 `require` 原版 `115Api`。
- `fetch/eval` 原版 `115Api`。
- 自行跟踪离线任务 / file_id。
- 自行重写播放器。

### 工件

- `apps/cloud/pan115/test/115_enhance_overlay_test1e_rule.json`
- version：`2026092105`
- 标题继续 `115.简·测试`，覆盖前一测试壳，不影响原版 `115.简`。
- 首页输入框只显示短提示 `粘贴磁链`。
- 输入后直接进入原版 `115Search?kw=`。
- 提供外部调用模板，供磁力君/JavDB 等小程序直接调用原版 115。

### 当前验收重点

1. Test1e 覆盖导入成功。
2. 首页提示精简，输入区不再被长文案挤压。
3. 粘贴同一条用户已确认可工作的 magnet，能直接进入原版 115 的离线播放链。
4. 如果 Test1e 调用链通过，则后续其它小程序直接使用原版 `115Search?kw=`，不再依赖 `115.简·测试` 中转。
