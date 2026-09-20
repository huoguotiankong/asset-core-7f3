# 115.简 / Pan115 开发记录

状态：**Test only / 待海阔实机验证**  
首次纳入：2026-09-21

## 2026-09-21 · 磁链播放增强 Test1

### 来源与边界

- 基线来自用户当前上传的 `115.简.hk小程序.zip`，原规则为单文件 `rule.json`。
- 原实现已经具备：115 Cookie/扫码登录、文件列表、全盘搜索、115 分享、离线任务、`magnet/ed2k/http(s)` 离线添加、个人网盘文件直链解析与播放。
- 本轮只强化“外部磁链调用 → 115 离线 → 定位结果 → 播放/选集”链路，不改原有登录协议、m115 加解密、下载直链算法和分享播放链。
- 当前未晋级 Stable；必须经过用户海阔实机验证后再决定正式化。

### 已确认的协议事实

- `addOfflineTaskURIs()` 使用 `https://lixian.115.com/lixianssp/?ac=add_task_urls`，支持 HTTP / ED2K / magnet。
- `listOfflineTask()` 返回的 `file_id` 是离线成功后生成的文件或文件夹 ID；`wp_path_id`/当前 JS 映射 `dirId` 是其所在父文件夹 ID。
- 原 `player.resolve()` 已能通过 `pickcode` 走 `proapi.115.com/app/chrome/downurl` 获取个人网盘文件直链，并带 UA/Header 播放。

### Test1 改动

新增页面 `115Open`：

```text
外部 magnet / ed2k / HTTP(S)
→ 识别已有任务，避免重复添加
→ addOfflineTaskURIs
→ 保存 info_hash 本地映射
→ listOfflineTask 跟踪状态
→ 完成后优先按 task.file_id 直接 getFile
→ 失败时才从 task.dirId 父目录按 file_id 精确兜底
→ 文件：直接识别视频
→ 文件夹：最多 4 层、500 项、100 目录受控扫描
→ 单视频：生成直接播放入口
→ 多视频：生成选集 + “连续播放全部”播放列表
```

同步修改：

- 首页粘贴 magnet/ed2k/http(s) 从 `115Offline?add=` 改走 `115Open?url=`。
- 首页增加“磁链播放”入口。
- “复制调用”由旧 `115Search?kw=` 改为 `115Open?url=`，修复磁链被当关键词搜索的问题。
- `115Search` 输入框识别 magnet/ed2k/http(s)，自动转 `115Open`。
- `115Offline` 已完成任务点击后转 `115Open?hash=<info_hash>`，直接定位视频/选集，而不是仅打开父目录。
- 新规则测试标题使用 `115.简·测试`，本地完整 Test1 规则 version `2026092101`，与原版并存，避免未验证代码覆盖原规则。

### 防重复与性能策略

- 新入口先查询已有任务，再决定是否调用添加接口；页面刷新和同一链接重复进入不应重复创建任务。
- 每条外部链接使用本地轻量 hash key 保存对应 `info_hash`。
- 离线完成后优先使用 115 返回的 `file_id` 精确定位，不做全盘同名模糊搜索。
- 仅在直接 `getFile(file_id)` 失败时扫描 `wp_path_id` 父目录，并优先按 file_id 精确匹配；名称只作为最后的同目录精确兜底。
- 目录视频扫描设置硬上限，避免超大目录拖死页面。

### 本地静态验证

- `rule.json` 与内嵌 `pages` JSON 均能正常解析。
- 首页 + 8 个页面脚本全部通过 `node --check`。
- Node mock 模拟通过四条状态路径：无链接入口、下载中、单视频完成、多视频完成。

### 待实机验证

1. 使用当前有效 115 Cookie/扫码登录打开 Test1。
2. 测一个可秒传 magnet：确认只生成一个离线任务。
3. 任务完成后确认 `file_id` 能被 `getFile` 直接读取。
4. 单视频磁链：确认播放卡取直链并正常播放。
5. 多文件磁链：确认递归选集完整、顺序合理、“连续播放全部”有效。
6. 测真实下载中的 magnet：确认刷新状态不会重复添加任务。
7. 测失败磁链：确认“删除失败任务并重新提交”可用。
8. 从其它小程序按 `hiker://page/115Open?rule=115.简·测试&page=fypage&url=<encoded>` 调用，确认跨规则路由正常。

### 本地 Test1 工件

`115.简_磁链播放增强_Test1.hk小程序.zip`

## 2026-09-21 · Test1b 云口令交付壳

### 用户实机反馈

- 本地 `.hk小程序.zip` 导入存在问题，因此停止把 ZIP 作为当前测试主交付方式。
- 改为远程规则口令导入；仍保持 Test only，不覆盖原版 `115.简`。

### 架构调整

为了减少云端规则体积并避免重复公开/复制原版 115 协议实现，Test1b 改为轻量增强壳：

```text
115.简·测试
├─ 首页 / 115Open：磁链增强逻辑
└─ 115Api 转发页
      ↓
已安装的原版 115.简 / 115Api
      ↓
登录 / m115 协议 / 离线接口 / 文件接口 / player.resolve
```

- 原版 `115.简` 必须继续安装在设备上；Test1b 只复用其当前登录状态、协议和播放器。
- Test1b 自己保留同名 `115Api` 转发页，因为原版 `player.resolve` 的序列化 `lazyRule` 会在点击时重新 `$.require("115Api")`；转发页确保测试壳上下文仍回到原版驱动。
- 云端壳 version：`2026092102`。
- 当前远程 Test 工件：`apps/cloud/pan115/test/115_enhance_overlay_test1_rule.json`。
- 远程地址必须显式指向 `asset-core-7f3@main`，不得依赖默认 `landing`。

### 当前测试重点

1. 云口令是否能正常识别并导入 `115.简·测试`。
2. 首页是否显示“已检测到原版 115.简”。
3. 原版账号/文件/离线按钮是否可以跨规则正常打开。
4. 输入可秒传 magnet 后，是否能提交任务、定位 `file_id` 并播放。
5. 原版 `player.resolve` 经 Test1b 的 `115Api` 转发页重新进入时，是否仍能正常取得直链。

只有以上实机关键链通过后，才继续 Test2 或考虑完整远程版/Stable。
