## 2026-09-24 · 0.1.0-test.15 / Build10117 · 网页会话本机变量与网络捕获桥

### 实机结论

Test14 已在海阔实机成功打开 `/drive/all` 并完成 PikPak 官方网页登录，网页中能看到用户个人文件夹；返回小程序后仍显示“未登录”。因此入口与官方登录已经通过，失败点收敛为“网页会话捕获/回传没有完成”。Test10～Test14 采用的 localStorage credentials 扫描和把完整 Token 塞入 hiker 查询参数的方案没有实机成功证据。

### Test15 修正

- Web 会话捕获扩展为 localStorage、sessionStorage、IndexedDB，并监听网页 Fetch/XHR 的 Authorization Bearer、Device ID、Captcha 与认证响应。
- 捕获结果通过 `fy_bridge_app.putVar` 写入海阔本机变量，只用不含 Token 的短路由打开接管页，避免超长/敏感查询参数导致跳转失败。
- 账号页增加“已读取网页登录会话”兜底入口：若自动打开接管页失败，返回账号页可手动接入本机暂存会话。
- 保留 Test13 已验证能进入网盘的 `https://mypikpak.com/drive/all`，保留 Test12 Access Token 优先和 Test11 Web profile；不恢复 Android 账号密码 captcha/init。
- 新增不可变 Test15 Page Bridge、Meta、Runtime、Release、Bootstrap 与 Shell；Shell version=2026092405，build=10117。
- Stable 未建立，登录与个人盘 API 仍待海阔实机验证。

当前 Test：`0.1.0-test.15 / Build10117`；Stable 尚未建立。

---

## 2026-09-23 · 0.1.0-test.14 / Build10116 · 修复 Test13 Bootstrap 模块路径

Test13 首次实机启动直接报错。截图中的远程 URL 显示 Bootstrap 请求了 Test13 目录下不存在的 `pages_meta_patch.js`。这是 Test13 生成 Bootstrap 时把沿用的 Test12 模块路径一并改写造成的；与网页登录、账号和 Token 无关。Test14 将该模块路径恢复到不可变 Test12 资产位置，网页登录仍使用 Test13 中的 `/drive/all` 入口模块，Web 凭据接管逻辑不变。

- 新增 Test14 Bootstrap、Release、Shell、runtime identity；数值 Shell version=2026092404，build=10116。
- 所有 Bootstrap 模块路径按 Release 清单复核；引用历史不可变模块时保留其真实版本路径。
- registry、manifest、test、channels 统一指向 Test14；Stable 未改。
- 待用户海阔实机验证启动、登录及后续 Drive 功能。

当前 Test：`0.1.0-test.14 / Build10116`；Stable 尚未建立。

---

## 2026-09-23 · 0.1.0-test.13 / Build10115 · 修正官方网页登录入口

### 实机反馈与修正

用户提供的 Test12 截图显示 X5 实际打开 PikPak 下载宣传首页，随后页面空白。这说明流程尚未进入官方登录表单或凭据接管阶段；问题在网页登录入口 URL，而不是 Access/Refresh Token 恢复。Test13 将 X5 入口从站点宣传根路径改为官方网盘应用路由 `https://mypikpak.com/drive/all`。凭据扫描、Token 桥接、Web profile 与 Refresh Token 恢复逻辑继续沿用 Test12，不再碰 Android 账号密码 captcha/init 路径。

- 新增不可变模块：`releases/0.1.0-test.13-b10115/pages_web_entry_patch.js`；调整入口及说明。
- 新增 Test13 Bootstrap、Shell、Release、runtime identity；Shell 数值版本提升至 2026092403，缓存构建号提升至 10115。
- registry、manifest、test、channels 统一指向 Test13；Stable 未改。
- 发布前检查覆盖 JS 语法、Bootstrap/Release/Shell 引用与运行时身份；官方 X5 登录及 Drive/播放/Magnet/文件管理待用户实机验收。

当前 Test：`0.1.0-test.13 / Build10115`；Stable 尚未建立。

---

# PikPak 小程序 Changelog

## 2026-09-24 · 0.1.0-test.12 / Build10114 · 官方网页 Access Token 优先

### Test11 后续收敛

Test11 已从账号密码登录切换至 PikPak 官方网页会话接管。Test12 保留该架构，并从 mypikpak.com 同源 `credentials` 同时读取当前 Access Token 与 Refresh Token。若 Access Token 存在，先直接用 Web profile 建立 API Session，不在登录接管完成后立即额外请求 Refresh Token 或主动刷新 Captcha；Access Token 缺失或后续 API 明确返回未认证时，才调用 Web profile 的 Refresh Token 路径。

```text
官方 mypikpak.com X5 登录
→ 读取 credentials / deviceid / captcha
→ 保存 _auth_profile=web、当前 Access Token 与 Refresh Token
→ 首次 Drive 请求使用 Web client 与 api-drive.mypikpak.com
→ Token 后续失效时用 Web profile 刷新
```

### 恢复链与验证

- 当前 `test.json`、`channels.json` 指向 Test12 Build10114；Test11 Build10113 与 Test10 Build10112 保留为不可变历史候选。
- Release 声明的全部模块、Bootstrap 和 Shell 路径已逐项确认存在。
- 所有 Test12 JavaScript 模块及 Bootstrap 已通过 `node --check`。
- 本地模拟确认：有网页 Access Token 时不会立即请求 `/v1/auth/token`；Drive 请求使用 Web client、Web Bearer token 与 `api-drive.mypikpak.com`；模拟 Access Token 失效后，刷新请求使用 Web client 和 `user.mypikpak.com`，不会落回 Android Refresh Token 档。
- 海阔 X5 网页注入、浏览器本地凭据捕获、Token 查询参数桥接、真实 PikPak API、个人盘/播放/Magnet/文件操作尚未做实机验收；本候选保持 `pending-device-validation`，不得建立 Stable。
- 附件基线：用户上传 `PikPak.hk小程序(1).zip`，原始规则 version=1；本分支历史恢复记录在 Test10/Test11 项中。

当前 Test：`0.1.0-test.12 / Build10114`；Stable 尚未建立。

---

> 2026-09-23 起由 `asset-core-7f3@main` 正式维护。初始基线来自用户上传 `PikPak.hk小程序(1).zip`（原规则 version=1）。Stable 尚未建立，当前只走 Test 通道。

## 2026-09-24 · 0.1.0-test.12 / Build10114 · 官方网页 Access Token 直连优先

### 实机与问题边界

用户在 Test10 Build10112 实机再次确认：账号密码登录仍在 `captcha/init` 阶段直接返回 `ErrorCode 4002 / Your operation is too frequent`。因此当前阶段不再继续围绕账号密码登录链做重试型补丁。

Test11 Build10113 已把主入口切到 PikPak 官方网页，并能从官方网页本机存储读取 Web Refresh Token / Device ID / Captcha。但复核 Test11 代码发现：官方网页 `credentials_*` 中其实已经存在当前有效 `access_token`，Test11 页面虽然读取了它，却没有把它传给接管页；Core 因而在每次网页登录接管后仍强制执行一次 Refresh Token 换票，并随后主动刷新 Drive Captcha。对于当前已经触发 PikPak 风控的账号/IP，这两次额外认证请求没有必要，且可能继续触发频控。

### Test12 修正

新的主认证链：

```text
账号 → PikPak 官方网页登录
→ 用户在官方 mypikpak.com 完成正常登录/第三方授权
→ X5 同源脚本扫描 credentials_*（localStorage / sessionStorage）
→ 同时读取当前 access_token + refresh_token
→ access_token 已存在：直接保存为 Web API Session，不立即 refresh，不主动 captcha/init
→ access_token 缺失：才使用 Web Refresh Token 恢复
→ 后续 Access Token 真正过期：再自动 Refresh
→ 返回 PikPak 首页继续个人盘 / 播放 / Magnet / 离线
```

Test12 不改变 Test11 的 Web request/profile 兼容层，也不改 Provider、Playback、Magnet、handoff 和临时文件回收语义。

### 新增不可变资产

- `releases/0.1.0-test.12-b10114/core_access_first_patch.js`
  - 覆盖 `importWebCredential()`。
  - 有官方网页 `access_token` 时直接建立 `_auth_profile=web` 会话。
  - 保存 Refresh Token 供后续过期刷新，但当前接管不主动换票。
- `releases/0.1.0-test.12-b10114/pages_access_first_patch.js`
  - 官方网页 bridge 将 `access_token + refresh_token + device_id + captcha + sub` 一起传给接管页。
  - 同时扫描 `localStorage` 与 `sessionStorage`。
- `releases/0.1.0-test.12-b10114/pages_meta_patch.js`
  - 设置页显示真实 Test12 / Build10114 运行信息。
- `releases/0.1.0-test.12-b10114/runtime_version_patch.js`
  - 最终 Runtime identity = `0.1.0-test.12 / Build10114`。
- `bootstrap_test_v12_b10114.js`
- `pikpak_remote_test_v12_b10114.txt`

本轮新增 JavaScript 已执行 `node --check` 语法门禁，包括 Test12 Core/Page/Meta/Runtime 与 Bootstrap，均通过。

### 实机验收顺序

1. 覆盖导入 Test12 Build10114。
2. 进入 `账号`，应只看到 `官方网页登录（推荐）` 和手动 Web Refresh Token 备用入口，不再出现账号密码输入框。
3. 打开官方网页登录；如果网页已经登录，进入网盘首页后停留数秒；未登录则在官方页面正常完成登录。
4. 预期自动跳到 `PikPak 登录接管`，并提示直接接入官方网页当前 Access Token。
5. 返回首页验证容量、根目录文件列表、文件夹浏览和盘内视频播放。
6. 登录链通过后，再回归 Magnet、离线任务、跨小程序 handoff 和退出调用页临时文件回收。

当前：Test `0.1.0-test.12 / Build10114`；Stable 尚未建立；状态 `pending-device-validation`。

---

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
- 调用页关闭时仅将本 session 临时播放文件移入回收站。
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