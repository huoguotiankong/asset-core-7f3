# PikPak 小程序 Changelog

> 2026-09-23 起由 `asset-core-7f3@main` 正式维护。初始基线来自用户上传 `PikPak.hk小程序(1).zip`（原规则 version=1）。Stable 尚未建立，当前只走 Test 通道。

## 2026-09-24 · 0.1.0-test.11 / Build10113 · 官方网页会话接管候选

### 实机起点

用户覆盖导入 Test10 Build10112 后再次实机确认：账号密码点击登录时，在密码提交前的 Android `captcha/init` 阶段仍直接返回：

```text
PikPak Android 登录验证初始化失败:
Your operation is too frequent, please try again later
```

因此 Test10 已证明：即使 Android client 1.53.2、当前 8-step salts、`device_id=md5(username+password)`、Android UA/devicesign 和 identity meta 均按现行公开驱动契约实现，当前账号/IP 风控仍可在登录验证码初始化阶段直接拦截。

同期核对 OpenList 公开资料发现：2026-08-26 的 PikPak 驱动 Issue 已出现同类 `ErrorCode 4002 / captcha_invalid / operation too frequent`；其当前文档明确建议该状态下停止反复账号密码登录，改由 PikPak 官方网页或官方 App 正常授权登录后取得 Refresh Token，再恢复第三方会话。

### Test11 产品决策

Test11 不再继续围绕账号密码 `captcha/init → signin` 叠补丁，也不再把密码框作为账号页主入口。新的主认证链：

```text
账号 → 官方网页登录（推荐）
→ 海阔 X5 打开 https://mypikpak.com/
→ 用户只在 PikPak 官方页面完成登录 / Google 等第三方授权
→ 同源注入监听 mypikpak.com localStorage
→ 自动读取 credentials_* / deviceid / captcha_*
→ 提取 Web Refresh Token + Device ID + 当前 Captcha
→ Web client 2.0.0 刷新 access token
→ 保存 _auth_profile=web 会话
→ 回到 PikPak 首页继续文件 / 播放 / Magnet
```

官方网页凭据读取只发生在用户设备的同源 X5 页面；账号密码不交给小程序，不写入仓库。回调只把当前会话所需的 Refresh Token / Device ID / Captcha 交给本地 PikPak 规则运行时。

### Web Session 认证档

```text
client_id      = YUMx5nI8ZU8Ap8pm
client_secret  = PikPak Web 当前公开驱动对应值
client_version = 2.0.0
package_name   = mypikpak.com
主 user host   = user.mypikpak.com
主 drive host  = api-drive.mypikpak.com
备用           = *.mypikpak.net
```

Test11 新增 Web Session request 层：
- 优先复用官方网页当前 `captcha_*` Token，避免接管成功后立即再次触发验证码初始化。
- Access Token 失效时仅使用 Web Refresh Token 刷新。
- 必须刷新 Drive Captcha 时才使用 Web 15-step `captcha_sign`，且检测到 `operation too frequent` 后不做递归重试。
- 保留 Test10 Android Core 作为底层兼容/历史恢复，不再由 Test11 账号主页面直接触发密码登录。

### 活动模块边界

Test11 在 Test10 Build10112 基线上只新增三层不可变补丁：

- `core_web_token_patch.js`：Web Token / Device ID / Captcha 会话导入、刷新与 profile-aware request。
- `pages_web_token_patch.js`：官方网页登录 X5、localStorage bridge、账号页和设置页。
- `runtime_web_token_patch.js`：Web 登录页面导出与手动 Web Refresh Token 导入。

Provider、Playback、Magnet、handoff、临时文件回收继续沿用 Test10 已有链路，不在本轮无关重构。

### 实机验收顺序

1. 覆盖导入 Test11 Build10113。
2. 进入 `账号`，应不再显示账号密码输入框，主入口为 `官方网页登录（推荐）`。
3. 打开后在 PikPak 官方网页完成正常登录；若网页版原本已经登录，保持页面数秒即可。
4. 预期自动跳转到 `PikPak 登录接管` 并显示登录成功。
5. 返回首页验证容量、根目录文件列表和盘内视频播放。
6. 登录链通过后，再回归外部 Magnet 调用、离线创建、播放与退出回收。

当前：Test `0.1.0-test.11 / Build10113`；Stable 尚未建立；状态 `pending-device-validation`。

---

## 2026-09-23 · 0.1.0-test.10 / Build10112 · 清洁 Android 认证候选

### 实机起点

用户实机确认 Test9 账号密码登录持续返回：

```text
Your operation is too frequent, please try again later
```

本轮明确放弃 Web 2.0 账号密码认证方案，恢复并升级原版/现行 Android 认证链。Build10110（官方网页登录）与 Build10111（Android 中间候选）均冻结；Build10112 使用新的不可变 Release / Bootstrap / Shell，避免海阔缓存继续命中旧候选。

### 当前 Android 认证档

```text
client_id      = YNxT9w7GMdWvEOKa
client_secret  = PikPak Android 当前公开驱动对应值（运行代码内使用，不写用户凭据）
client_version = 1.53.2
package_name   = com.pikcloud.pikpak
sdk_version    = 2.0.6.206003
device_id      = md5(username + password)
主 user host   = user.mypikpak.net
主 drive host  = api-drive.mypikpak.net
备用           = *.mypikpak.com
```

登录前 `captcha/init` 按当前 Android 驱动契约只提交账号 identity meta（email / phone_number / username）；登录成功后再针对 `GET:/drive/v1/files` 生成 Android `captcha_sign`，使用当前 8-step salt 链。Android User-Agent 同步生成 `div101.<device_id><md5(sha1(device_id + package_name + "1appkey"))>` devicesign。

### Build10112 登录链

```text
账号页输入账号 / 密码
→ Android device_id + Android User-Agent
→ POST /v1/shield/captcha/init
   action = POST:/v1/auth/signin
   meta = email / phone_number / username
→ 返回 captcha_token：继续 Android /v1/auth/signin
→ 如返回官方验证 URL：只打开真实验证页，完成后继续 Android signin
→ 保存 Android access_token / refresh_token / sub
→ 刷新 Drive captcha_sign
→ 文件 / 播放 / Magnet 继续使用 Android Session
```

首次从旧 Test 升级时执行一次迁移：清除 Test8/Test9 遗留的 Web 验证临时变量；若检测到旧 `_auth_profile=web` 会话则清除该不兼容会话，避免账号页误显示“已登录”后再用 Android profile 请求。用户名不清除；密码仍只存在于本次登录 MyVar，登录完成/取消后由既有验证运行时清理。

### 活动模块边界

Build10112 的活动模块链不再加载 Test4/Test5/Test9 的 Web auth/captcha Core 补丁，也不加载 Test8/Test9 Web 验证页补丁。继续保留：

- 当前重构后的首页、账号、个人盘、公开分享、文件管理与设置 UI。
- 播放、多线路和下载逻辑。
- Magnet 解析、秒传/离线 fallback、跨小程序 handoff。
- Test7 之后的会话级临时文件登记与回收：退出调用页只把本次调用创建的临时文件移入 PikPak 回收站，不永久删除。
- 普通个人文件和用户手动离线任务不参与退出清理。
- 手动 Refresh Token 登录，并按 Android profile 恢复 API Session。

### 实机验收顺序

1. 覆盖导入 Test10 Build10112。
2. 进入 `账号`，直接用账号密码登录。
3. 若 PikPak 返回官方验证页，完成验证后应自动/手动接回 Android signin；未要求验证则应直接登录。
4. 登录成功后确认首页容量、根目录文件列表与盘内视频播放。
5. 登录先通过后，再回归外部 Magnet 调用及退出回收。

当前：Test `0.1.0-test.10 / Build10112`；Stable 尚未建立；状态 `pending-device-validation`。

---

## 冻结候选

### 0.1.0-test.10 / Build10111 · 已冻结
- 已切换到 Android 1.53.2 认证，但仓库同时存在两个 Build10111 变体，其中活动变体仍叠加了旧 Web auth/captcha 补丁后再覆盖 Android 实现。
- 为避免模块链歧义与同 Build 双工件缓存风险，不作为最终 Test10 交付；Build10112 改为单一清洁 Android 运行链。

### 0.1.0-test.10 / Build10110 · 已冻结
- 曾尝试“PikPak 官方网页登录 + 自动提取 Web Refresh Token”。
- 未完成用户实机验收即被当前明确需求否决，不再作为恢复基线。

---

## 历史 Test 摘要

### 0.1.0-test.9 / Build10109
- Web 2.0 fallback 使用 txCaptcha / `POST:/v1/auth/signin` / `signin_check`。
- 实机确认仍持续触发 `operation too frequent`，因此 Web 2.0 登录方向已废弃。

### 0.1.0-test.8 / Build10108
- X5 验证页加入 URL / iframe / DOM watcher，尝试捕获验证后的 captcha token。

### 0.1.0-test.7 / Build10107
- 外部小程序 Magnet 调用建立独立 session。
- 调用页关闭时仅将本 session 临时播放文件移入 PikPak 回收站。
- 普通个人文件、手动离线文件不参与退出清理；临时播放链禁止永久删除。

### 0.1.0-test.5 / Build10105
- 首次接入 PikPak 官方人机验证页。
- 临时 Magnet 文件超过约 15 分钟或手动清理时使用 `batchTrash`，不永久删除。

### 0.1.0-test.4 / Build10104
- 首次加入独立 `pikpakVerify` 验证页；密码仅存临时 MyVar。

### 0.1.0-test.3 / Build10103
- 账号密码登录从上传旧版 Android 1.23.0 档切到 Web 2.0.0；该方向现已废弃。

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
