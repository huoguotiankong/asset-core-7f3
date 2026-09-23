# PikPak 小程序 Changelog

> 2026-09-23 起由 `asset-core-7f3@main` 正式维护。初始基线来自用户上传 `PikPak.hk小程序(1).zip`（原规则 version=1）。Stable 尚未建立，当前只走 Test 通道。

## 2026-09-23 · 0.1.0-test.10 / Build10110 · 官方网页登录 + Refresh Token 自动接回

### 实机结论

Test9 后账号密码 API 直登仍持续返回：

```text
Your operation is too frequent, please try again later
```

长时间等待后依旧存在，说明不能继续把 `captcha/init → signin` 作为唯一/主登录路径。当前 OpenList/PikPak 文档也明确记录：出现该错误后账号/IP 可能在一段时间内无法继续账号密码直登，推荐先在 PikPak 官方网页或官方 App 正常登录，再使用对应平台 Refresh Token 恢复会话。

### 原上传版复核

用户最初上传的 PikPak 规则采用 Android 旧认证档：

```text
client_id = YNxT9w7GMdWvEOKa
client_version = 1.23.0
package_name = com.pikcloud.pikpak
device_id = md5(username)
captcha/init → /v1/auth/signin
```

现行公开 PikPak 驱动仍保留 Android / Web 多认证档，但账号密码直登同样会受 captcha / operation-too-frequent 风控，因此 Test10 不再继续通过更换 client 参数反复撞登录接口。

### Test10 新主登录链

```text
账号页
→ 官方网页登录（推荐）
→ X5 打开 https://mypikpak.com/
→ 用户在 PikPak 官方网页正常完成邮箱/手机号/第三方账号登录与安全验证
→ 登录成功进入官方文件页
→ Test10 仅在 mypikpak.com / mypikpak.net 域扫描 localStorage / sessionStorage
→ 找到 credentials* 中 refresh_token
→ pikpakWebLoginDone
→ 以 Web profile 调 /v1/auth/token
→ 保存正式 API Session
→ 返回 PikPak 首页
```

### 安全边界

- 小程序不读取、不保存官方网页输入的密码。
- 自动提取只发生在 PikPak 官方域名，并只解析 `credentials*` / 含 `refresh_token` 的存储项。
- Refresh Token 不在 UI 页面回显；只用于恢复并维护 PikPak API 会话。
- 原来的手动 Refresh Token 登录继续保留。
- 账号密码 API 直登降级为备用，并明确提示 `operation too frequent` 风险，避免用户连续点击扩大风控。
- 退出小程序 API 会话不会强制清除 PikPak 官方网页 Cookie；这是两个独立登录状态。

### 继承能力

- Test9 txCaptcha API 直登兼容链仍保留作为备用。
- Test7 跨小程序 Magnet 会话级临时文件回收继续保留：只回收本次调用创建的临时文件，进入回收站，不永久删除。
- 普通个人文件、用户手动离线任务不参与退出清理。
- 首页、个人盘、公开分享、Magnet、离线任务、新建文件夹、重命名、回收站、下载、播放、多线路与设置继续保留。

### Test10 实机验收

1. 覆盖导入 Test10。
2. 进入 `账号 → 官方网页登录（推荐）`。
3. 在内嵌 PikPak 官方网页完成正常登录/安全验证。
4. 登录成功进入官方文件页后，应自动跳到“PikPak 登录成功”页。
5. 返回首页验证容量、根目录和盘内视频播放。
6. 最后再验证外部小程序 Magnet 调用与退出回收。

当前：Test `0.1.0-test.10 / Build10110`；Stable 尚未建立；状态 `pending-device-validation`。

---

## 历史 Test 摘要

### 0.1.0-test.9 / Build10109
- 根据当时实机 `result:review`，将 Web 2.0 fallback 验证改为 `txCaptcha.html`、`action=POST:/v1/auth/signin`、`event=signin_check`、XBASE callback。
- 修复 txCaptcha 初始 URL 被误判为验证完成的问题。
- 实机后续确认：即使契约修正，账号密码 API 直登仍可持续触发 `operation too frequent`，因此 Test10 不再把它作为主登录路径。

### 0.1.0-test.8 / Build10108
- X5 验证页增加 URL / iframe / DOM 持续 watcher，尝试捕获验证后的 captcha token 并自动继续 signin。

### 0.1.0-test.7 / Build10107
- 外部小程序 Magnet 调用建立独立 session。
- 调用页关闭时仅将本 session 临时播放文件移入 PikPak 回收站。
- 普通个人文件、手动离线文件不参与退出清理；临时播放链禁止永久删除。

### 0.1.0-test.5 / Build10105
- 首次将 `result:review` 接入 PikPak 官方人机验证页。
- 临时 Magnet 文件超过约 15 分钟或手动清理时改用 `batchTrash`，不再永久删除。

### 0.1.0-test.4 / Build10104
- 首次加入独立 `pikpakVerify` 验证页；密码仅存临时 MyVar。

### 0.1.0-test.3 / Build10103
- 新账号密码登录从上传旧版 Android 1.23.0 档切到 Web 2.0.0；旧会话仍保留 legacy 刷新兼容。

### 0.1.0-test.2 / Build10102
- 设置页改用当前设备已验证的原生选择器写法。

### 0.1.0-test.1 / Build10101
- 首次全量模块化：Core/Auth → Provider → Playback → UI → Pages → Runtime。
- 重做首页与文件浏览；加入公开分享、Magnet、离线任务、文件管理、容量、多线路；取消旧 referral / join_promoting / 固定 sleep；停止明文保存密码。

### 长期约束

- 未完成实机验证前不建立 Stable。
- 不把账号密码、Token 或用户私有状态写进公开仓库。
- 临时播放清理只允许作用于本程序明确登记的临时对象。
- 用户普通文件优先使用可恢复的回收站语义，禁止无必要永久删除。
