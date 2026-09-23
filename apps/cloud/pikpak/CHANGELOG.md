# PikPak 小程序 Changelog

> 2026-09-23 起由 `asset-core-7f3@main` 正式维护。初始基线来自用户上传 `PikPak.hk小程序(1).zip`（原规则 version=1）。Stable 尚未建立，当前只走 Test 通道。

## 2026-09-23 · 0.1.0-test.7 / Build10107 · 跨小程序调用会话级安全回收

### 当前真实链路

```text
外部小程序 realurl=Magnet
→ fxlj / handoff 建立唯一 session
→ Magnet 解析
→ GCID 秒传；失败则离线任务回退
→ 仅本次调用创建的播放临时文件写入 temp_files，并记录 origin=handoff + session
→ 播放期间保留文件
→ 用户退出调用页 onClose
→ cleanupHandoffSession(session)
→ 只把本 session 临时文件移入 PikPak 回收站
```

### 安全边界

- 普通个人网盘文件不登记为调用临时文件，不参与退出清理。
- 用户手动创建的离线任务/文件不参与调用页退出清理。
- PikPak 小程序内部普通 Magnet 临时对象仍使用延迟策略，不因其它页面退出立即回收。
- 其它已登记临时播放文件超过约 15 分钟，或手动执行“清理临时播放文件”时移入回收站。
- 临时播放链对旧 `deletePermanent()` 增加安全钳制，实际转为 `batchTrash`，禁止永久删除。
- `onClose` 属于海阔运行时能力，Test7 仍需实机确认；如果设备未触发回调，15 分钟延迟回收仍是兜底。

### 登录

完整继承 Test5：`result:review → PikPak 官方验证页 → 捕获验证后的 captcha_token → 自动继续 signin`。自动接回失败时保留“验证完成，继续登录”按钮。密码只存在临时 MyVar，成功或取消后清除。

### Test7 实机验收

1. 账号密码触发 review 后完成官方安全验证并成功登录。
2. 从其它小程序调用 Magnet，播放期间临时文件不能提前消失。
3. 退出播放器并关闭调用页后，本次临时文件应进入回收站。
4. 个人盘普通文件与手动离线文件不得被移动。
5. 普通 PikPak 内部 Magnet 不应被调用页 session 清理误伤。

当前：Test `0.1.0-test.7 / Build10107`；Stable 尚未建立；状态 `pending-device-validation`。

---

## 历史 Test 摘要

### 0.1.0-test.5 / Build10105

- 实机确认账号密码登录会遇到 `result:review` 和 PikPak 官方“请完成验证”。
- 验证 URL 缺失时根据 captcha token / DeviceId 构造官方 spritePuzzle 验证地址。
- `x5_webview_single` + URL 拦截/JS 注入捕获验证后的 captcha token，自动进入验证完成页继续 signin；保留手动继续兜底。
- 临时 Magnet 播放文件只处理本程序 `temp_files` 队列；超过约 15 分钟或手动清理时改用 `batchTrash` 进入回收站，不再永久删除。

### 0.1.0-test.4 / Build10104

- 首次接入独立 `pikpakVerify` 官方人机验证页。
- 修正 Test3 Web client secret 末尾误码，补齐 email / phone_number 登录 meta。
- 密码仅存临时 MyVar；完成或取消验证后清除。

### 0.1.0-test.3 / Build10103

- 新账号密码登录从上传旧版 Android 1.23.0 认证档切换至 Web 2.0.0 认证档。
- 旧 Android 会话仍按 legacy 档刷新，避免无必要强制退出。
- `result:review` 不再直接把 captcha 内部 meta 暴露给 UI。

### 0.1.0-test.2 / Build10102

- 设置页改回海阔已验证的 `$(数组).select(...)`，解决自定义选择器兼容风险。
- 保持 Test1 架构和业务能力不变。

### 0.1.0-test.1 / Build10101

首次全量重构：

```text
Core/Auth
→ Provider (Drive / Share / Magnet / Task)
→ Playback
→ UI
→ Pages
→ Runtime
```

主要变化：重做首页；删除旧“界面设置”空选项；取消启动 `referral / join_promoting / 固定 sleep`；停止明文保存密码；分页状态按页面/目录隔离；加入个人盘文件浏览、公开分享、Magnet、离线任务、新建文件夹、重命名、回收站、公开分享、容量刷新、双 API 线路；Magnet 优先 GCID 秒传，失败回退离线任务；播放统一为个人盘/分享/Magnet/任务文件模型。

### 长期约束

- 不直接在未实机验证前建立 Stable。
- 不把账号密码、token 或用户私有状态写进公开仓库。
- 任何临时播放清理只允许作用于本程序登记的临时对象。
- 用户普通文件优先使用可恢复的回收站语义，禁止无必要永久删除。
