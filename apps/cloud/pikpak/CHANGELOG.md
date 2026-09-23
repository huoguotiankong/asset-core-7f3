# PikPak 小程序 Changelog

> 2026-09-23 起由 `asset-core-7f3@main` 正式维护。初始基线来自用户上传 `PikPak.hk小程序(1).zip`（原规则 version=1）。Stable 尚未建立，当前只走 Test 通道。

## 2026-09-23 · 0.1.0-test.10 / Build10111 · 现行 Android 认证链重做

### 当前实机起点

用户实机确认 Test9 账号密码登录持续返回：

```text
Your operation is too frequent, please try again later
```

因此本轮明确放弃 Test3～Test9 的 Web 2.0 账号密码认证方向。仓库中先前生成但未实机验收的 Test10 / Build10110“官方网页登录 + Web Refresh Token 自动接回”候选同步冻结，不再作为当前 Test；为避免海阔 `require` 缓存命中旧候选，新的 Test10 使用独立 Build10111、独立 Release/Bootstrap/Shell 路径。

### Android 当前认证档

按原上传版与当前公开 PikPak Android 驱动重新对齐：

```text
client_id      = YNxT9w7GMdWvEOKa
client_version = 1.53.2
package_name   = com.pikcloud.pikpak
sdk_version    = 2.0.6.206003
device_id      = md5(username + password)
主 user host   = user.mypikpak.net
主 drive host  = api-drive.mypikpak.net
备用           = *.mypikpak.com
```

账号密码仍只存在于海阔当前登录 MyVar；登录完成或取消后清除，不写入公开仓库或持久 Item。

### Test10 Build10111 登录链

```text
账号页输入账号 / 密码
→ Android device_id + devicesign + Android User-Agent
→ POST /v1/shield/captcha/init
   action = POST:/v1/auth/signin
   meta = email / phone_number / username（登录前 identity meta）
→ captcha/init 直接返回 captcha_token：继续 Android /v1/auth/signin
→ captcha/init 返回官方 url：只打开该真实验证 URL，不再合成 Web txCaptcha URL
→ 验证完成后带 Android captcha token 继续 signin
→ 登录成功保存 Android access_token / refresh_token / sub
→ 再针对 GET:/drive/v1/files 生成当前 Android captcha_sign
→ Drive / 文件 / 播放链继续使用 Android Session
```

登录后的 `captcha_sign` 使用当前 Android 8-step salt 链；Android User-Agent 同步生成 `div101.<device_id><md5(sha1(device_id + package_name + "1appkey"))>` devicesign。后续 Access Token 失效走 Android Refresh Token；Drive captcha 失效只允许一次 Android captcha 刷新重试，遇到 operation-too-frequent 不继续循环撞接口。

### 修改边界

本次只替换认证协议层与对应验证提示，不重做已经工作的产品层：

- 保留现有重构后的首页、个人盘、公开分享、文件管理与设置结构。
- 保留现有播放、多线路和下载逻辑。
- 保留 Magnet 解析、秒传/离线 fallback、跨小程序 handoff。
- 保留 Test7 之后的会话级临时文件登记与回收：退出调用页只把本次调用创建的临时文件移入回收站，不永久删除。
- 普通个人文件和用户手动离线任务继续不参与退出清理。
- 手动 Refresh Token 登录继续保留，但恢复会话改按 Android profile 执行。

### Test10 实机验收

1. 覆盖导入 Test10 Build10111。
2. 进入 `账号`，直接用账号密码登录。
3. 若 PikPak 返回官方验证页，完成验证后应自动/手动接回登录；若未要求验证则应直接登录成功。
4. 登录成功后确认首页容量、根目录文件列表和盘内视频播放。
5. 登录先通过后，再回归外部 Magnet 调用及退出回收。

当前：Test `0.1.0-test.10 / Build10111`；Stable 尚未建立；状态 `pending-device-validation`。

---

## 冻结候选

### 0.1.0-test.10 / Build10110 · 已冻结
- 曾尝试“PikPak 官方网页登录 + 自动提取 Web Refresh Token”。
- 未完成用户实机验收即被当前明确需求否决。
- 不再作为恢复基线，也不允许覆盖 Build10111；旧文件保留仅用于历史审计。

---

## 历史 Test 摘要

### 0.1.0-test.9 / Build10109
- 根据当时实机 `result:review`，将 Web 2.0 fallback 验证改为 `txCaptcha.html`、`action=POST:/v1/auth/signin`、`event=signin_check`、XBASE callback。
- 修复 txCaptcha 初始 URL 被误判为验证完成的问题。
- 实机后续确认：即使契约修正，账号密码 API 直登仍持续触发 `operation too frequent`；该 Web 2.0 登录方向已在 Build10111 正式废弃。

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
- 新账号密码登录从上传旧版 Android 1.23.0 档切到 Web 2.0.0；该方向现已被 Build10111 Android 认证链替代。

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
