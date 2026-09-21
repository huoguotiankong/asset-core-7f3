# 115.简 / Pan115 开发记录

状态：**Stable 1.1.0 / Build 2026092111 / 已实机验证**  
首次纳入：2026-09-21

## 当前 Stable

- Stable：`1.1.0`
- Build / rule version：`2026092111`
- Stable pointer：`apps/cloud/pan115/stable.json`
- Latest：`apps/cloud/pan115/latest.json`
- Release：`apps/cloud/pan115/releases/1.1.0/release.json`
- Installer：`apps/cloud/pan115/releases/1.1.0/installer.js`
- 发布来源：`1.1.0-rc1`
- 交付方式：`local-clone-patch/self-use`
- 业务模块固定引用：commit `c473d00a292010a63c9f5364cf45d66dbfc9593d`

Stable 1.1.0 是已实机通过的 RC1 **原样晋级**，没有在晋级阶段继续修改磁链业务逻辑。

## 基线与协议事实

基线来自用户上传的 `115.简.hk小程序.zip`，原规则为单文件 `rule.json`。原实现已具备：

- 115 Cookie / 扫码登录；
- 文件列表与全盘搜索；
- 115 分享；
- 离线任务；
- `magnet / ed2k / http(s)` 离线添加；
- 个人网盘文件直链解析与播放。

已确认：

- `addOfflineTaskURIs()` 使用 `https://lixian.115.com/lixianssp/?ac=add_task_urls`；
- `listOfflineTask()` 的 `file_id` 映射为任务结果 `fileId`；
- `wp_path_id` 映射为 `dirId`，它是任务结果的父目录；
- 原 `player.resolve()` 能通过 pickcode / fileId 取得 115 直链并带 UA/Header 播放。

## 对外磁链调用协议

其它小程序调用 115 播放 magnet 的正式入口固定为：

```js
"hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url)
```

原版旧“复制调用”里的：

```js
"hiker://page/115Search?rule=115.简&page=fypage&kw=" + encodeURIComponent(url)
```

**禁止用于 magnet。** 用户实机已证明它只会把整条 magnet 当普通网盘搜索关键词，结果为 `共0条 / 无结果`。

首页真实输入分流：

```text
115 分享链接
→ 115Share?sc=

magnet / ed2k / HTTP(S)
→ 115Offline?add=

普通关键词
→ 115Search?kw=
```

## Stable 1.1.0 磁链播放链

```text
其它小程序传 magnet
→ 115Offline?add=
→ BTIH / URL 查重
→ 当前任务聚焦
→ 已存在则复用，不重复离线
→ 新任务才提交到 115 离线
→ 完成后优先 task.fileId
→ fileId 是视频：直接进入原版 player.resolve
→ fileId 是目录：受控扫描视频
→ 过滤 sample / preview / trailer / 试看 / 预告 / 花絮 / 广告等噪声
→ 单一明显主片：直接播放
→ 多集 / 多段：进入 115OfflineResult 选集
→ 播放结果缓存复用
```

扫描边界：最多递归 4 层、最多约 500 项，避免大目录拖死页面。

## 主视频与选集判定

单主片场景：

```text
62.71 MB 小视频
4.95 GB 正片
→ 直接选择 4.95 GB 正片
```

剧集/多段场景：

```text
EP01 1.91 GB
EP02 1.92 GB
EP03 1.93 GB
→ 不猜“最大的一集”
→ 进入选集页
```

Test4/RC1 进一步增加：

- 40 位 Hex 与 32 位 Base32 BTIH 去重；
- `info_hash → 播放结果` 缓存；
- 任务记录被删除后，只要网盘目标文件仍存在，可尝试继续复用播放结果；
- 失败任务支持删除后重新提交；
- `EP1 / EP2 / EP10` 等自然排序；
- sample/preview/试看等附带小视频与主要内容分组；
- 多集/多段命名识别优先进入选集。

## 2026-09-21 实机验证结论

### 原版基线

用户实机确认：原版首页直接输入 magnet 可成功添加 115 离线任务。

### 原版完成任务问题

用户实机截图确认原版完成任务点击后：

```text
meyd-553 完成任务
→ 进入父目录
→ 再点 meyd-553 文件夹
→ 看到 UUE29.mp4 62.71 MB
→ 看到 meyd-553.mp4 4.95 GB
→ 再点正片播放
```

根因：原版完成任务使用 `t.dirId`，而真正结果应优先从 `t.fileId` 开始定位。

### RC1 / Stable 验证

用户在 `1.1.0-rc1` 实机确认通过后明确回复“可以了”。按约定将冻结 RC1 原样晋级 Stable 1.1.0。

实机通过的关键链：

1. magnet 能进入正确的 115 离线入口；
2. 已完成单主片任务可直接定位主视频，不再手动逐层进入父目录/任务目录；
3. 重复调用同一 magnet 不应重复创建相同离线任务；
4. 播放仍复用原版 `player.resolve`，未改登录、解密、直链算法。

多集选集逻辑已经过静态/mock 回归并随 RC1 冻结进入 Stable；后续如出现特殊命名误判，继续在 Test/Candidate 小步修复，不原地覆盖 Stable。

## 失败方案与禁止回退

### Test1：自行重实现完整 magnet 控制器

曾尝试自行实现：

```text
magnet → 离线 → info_hash → fileId → 播放/选集
```

功能上可行，但没有必要重写原版已经成熟的协议层，且增加模块边界风险，停止发展。

### Test1b：完整远程 JSON 直接 home_rule_url

实机报：

```text
syntax error, unexpected token error
```

后续安装器统一通过 `@import=js:` 执行生成/导入链。

### Test1c：跨规则 require 115Api

```js
$.require("hiker://page/115Api?rule=115.简")
```

实机报：

```text
Expected URL scheme 'http' or 'https'
```

结论：跨规则 `hiker://page/...` 不能作为 `$.require()` 模块 URL 使用。

### Test1d：fetch hiker://home 后 eval 跨规则模块

仍出现模块/URL 运行时问题。禁止继续用这种方式绕过规则模块边界。

### Test1e：magnet → 115Search?kw=

实机显示 `共0条 / 无结果`。这是已证伪路线，禁止恢复。

## Test2 → Test4 → RC1 演进摘要

### Test2

- 完成任务改为 `fileId` 优先；
- 单视频/目录扫描；
- 最大主片初版识别。

### Test3

- 外部 magnet 当前任务聚焦；
- 防重复提交；
- sample/预告过滤；
- 电影直放 / 多集选集；
- 新增 `115OfflineResult`。

### Test4

- Hex/Base32 BTIH；
- 播放结果缓存；
- 失败任务重试；
- 自然选集排序；
- 主内容与附带小视频分组；
- 继续保持 fileId 优先和扫描上限。

### 1.1.0-rc1

- 冻结 Test4 业务逻辑；
- 修复 Test4 installer “按钮名已改但实际复制仍是 `115Search?kw=`”的遗漏；
- 候选规则 `115.简·候选` 与原 Stable 并存；
- 实机确认后晋级 Stable 1.1.0。

## Stable 发布边界

Stable 1.1.0 没有修改：

- 115 登录 / Cookie / 扫码；
- m115 加解密；
- 115 分享链接协议；
- 普通文件列表与搜索；
- 原版 `player.resolve` 直链算法。

正式版只强化：

- magnet 外部调用入口；
- 离线查重与当前任务体验；
- `fileId` 结果定位；
- 主片/选集识别；
- 播放结果缓存与失败重试。

## 后续其它小程序接入规范

其它带 magnet 的小程序只依赖这一条稳定契约：

```js
function playBy115(url) {
    if (!url) return "toast://未获取到磁力链接";
    return "hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url);
}
```

调用方不得直接依赖 115Api、fileId、离线接口或播放器内部实现。115 内部以后升级时必须继续兼容 `115Offline?add=`，避免批量修改所有上游小程序。
