# PikPak 小程序 Changelog

> 2026-09-23 起由 `asset-core-7f3@main` 正式维护。初始基线来自用户上传 `PikPak.hk小程序(1).zip`（原规则 version=1）。Stable 尚未建立，当前只走 Test 通道。

## 2026-09-23 · 0.1.0-test.9 / Build10109 · 当前 txCaptcha 登录验证契约修复

### 新定位

Test8 已经增加 URL / iframe / DOM 持续监听，但继续核对当前 PikPak Web 2.0 登录验证后发现，更前一层的 fallback 验证 URL 仍沿用了旧契约：

```text
/captcha/v2/spritePuzzle.html
+ action=POST:https://user.../v1/auth/signin
+ event=shield-captcha-init
+ redirect_uri=https://mypikpak.com/loading
```

当前 PikPak Web 2.0 的登录安全验证页面已经使用：

```text
/captcha/v2/txCaptcha.html
+ action=POST:/v1/auth/signin
+ event=signin_check
+ redirect_uri=xlaccsdk01://xbase.cloud/callback?state=harbor
```

如果仍按旧 action/event 完成验证，即使页面视觉上显示验证完成，真正的 signin action 也可能没有被正确放行，随后继续 signin 会再次进入 review，表现为一直卡在验证页。

### Test9 修复

- fallback 验证地址切换到 `txCaptcha.html`。
- `action` 固定为 `POST:/v1/auth/signin`，不再拼完整 user host URL。
- `event` 改为 `signin_check`。
- redirect 改为当前 XBASE callback：`xlaccsdk01://xbase.cloud/callback?state=harbor`。
- 如果 PikPak API 已直接返回 `txCaptcha` 验证 URL，则优先原样使用，不覆盖服务端参数。
- Test8 的 `urlInterceptor` 增加 `txCaptcha` 挑战页识别：初始 URL 中即使带原 captcha token，也绝不能误判成“验证已完成”。
- 捕获 XBASE callback 时，即使回调没有附带新 token，也会使用本次已验证的原 token 主动继续 signin。
- 继续保留 Test8 的 URL / iframe / DOM 成功状态 watcher，以及手动“验证完成，继续登录”兜底。
- 安装 Test9 时主动清除旧版本遗留的验证 URL / token / 临时密码，避免继续打开 Test7/Test8 已失效的 challenge；已有正式登录 Session 不主动删除。

### Test9 实机验收

1. 覆盖导入 Test9 后重新输入账号密码。
2. 登录触发 review 时，应出现 PikPak 当前官方安全验证组件，而不是直接进入“验证完成”假状态。
3. 完成拼图/人机验证后，应自动接回 signin；若没有自动接回，点击“验证完成，继续登录”应完成登录或给出真实错误。
4. 登录成功后验证根目录和盘内视频播放。
5. 再验证外部小程序 Magnet 调用与退出回收：仅本次调用临时文件进入回收站，个人文件/手动离线文件不得受影响。

当前：Test `0.1.0-test.9 / Build10109`；Stable 尚未建立；状态 `pending-device-validation`。

---

## 2026-09-23 · 0.1.0-test.8 / Build10108 · 官方验证完成后不跳转修复

### 实机现象

用户完成 PikPak 官方安全验证后，海阔内嵌页停留在“验证完成，继续登录 / 重新加载验证”区域，未自动回到登录成功状态。

### 根因

Test5/Test7 只在 `x5_webview_single` 页面加载和 URL 导航拦截时读取 `captcha_token`。PikPak 验证页完成后存在 SPA 场景：浏览器地址通过前端状态更新/`history.replaceState` 改写 token，但不触发真正页面跳转，因此 `urlInterceptor` 和一次性 JS 注入都收不到新 token。

公开 PikPak API 同类验证流程也要求在浏览器完成验证后，从地址栏取得更新后的 `captcha_token` 再继续 signin。

### Test8 修复

- X5 验证页增加持续 watcher，约每 350ms 检查一次当前地址栏 `captcha_token`。
- 同时检查 iframe `src` / 可访问的 iframe 当前地址，兼容验证组件嵌套。
- 捕获到与原 token 不同的新 token 后立即打开 `pikpakVerifyDone`，继续密码 signin。
- 如果 URL 没变化，但验证页 DOM 已出现“验证成功 / 验证完成 / 验证通过 / verified / passed”等成功状态，则用当前 token 主动确认一次 signin。
- 继续保留导航 `urlInterceptor`、手动“验证完成，继续登录”、重新加载验证三重兜底。
- 密码仍只存临时 MyVar，成功/取消后清除。
- 完整继承 Test7 的跨小程序 Magnet 会话级临时文件回收：退出调用页只回收本 session 临时文件并移入回收站，不永久删除用户文件。

### Test8 实机验收

1. 账号密码登录触发 review。
2. 完成官方人机验证后，无需手点按钮，应自动进入验证完成页并成功登录。
3. 如果自动接回未触发，点“验证完成，继续登录”应能完成登录或给出明确验证状态。
4. 登录成功后测试根目录、盘内视频播放。
5. 再测试外部小程序调用 Magnet，确认退出调用页只回收本次临时文件。

当前：Test `0.1.0-test.8 / Build10108`；Stable 尚未建立；状态 `superseded-by-test9-before-device-validation`。

---

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

---

## 历史 Test 摘要

### 0.1.0-test.5 / Build10105

- 实机确认账号密码登录会遇到 `result:review` 和 PikPak 官方“请完成验证”。
- 验证 URL 缺失时根据 captcha token / DeviceId 构造官方 spritePuzzle 验证地址；该 fallback 在 Test9 确认已落后于当前 txCaptcha 契约。
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