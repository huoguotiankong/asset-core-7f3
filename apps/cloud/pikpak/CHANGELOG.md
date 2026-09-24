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
## 2026-09-24 · 0.1.0-test.16 / Build10118 · 网盘管理与视频播放列表增强

### 已验证基线

用户已在海阔实机确认 Test15：官方 PikPak 网页登录可成功接入小程序，个人网盘目录可浏览，盘内视频在线播放正常。登录、个人盘和基础播放因此从“待验证”调整为“实机已通过”；Stable 仍未建立。

### Test16 功能

- 播放队列只给视频卡设置 `playlist video`，文件夹和普通文件不再进入播放器列表；Magnet 文件页同时只展示识别到的视频。
- Magnet 秒传和离线 fallback 统一把播放文件创建到根目录 `My Pack`。跨小程序调用仍维持 Test7 的会话级临时文件语义：关闭调用页后只把本次创建的对象移到回收站，不永久删除。
- 新增回收站页面：列表、单项还原、单项永久删除、清空回收站；永久删除只从回收站显式触发，并有二次确认。
- 新增文件和文件夹的移动、复制操作及目标文件夹选择页；保留下载、分享、重命名和移到回收站。
- 修复文件夹标题显示 URL 编码（如 `%E2%92%88AV`）的问题；优化首页入口、文件描述与操作提示。
- API 采用 `files:batchMove`、`files:batchCopy`、`files:batchUntrash`、`files:batchDelete`、`files/trash:empty`；普通删除和临时清理继续使用 `batchTrash`。

### 发布与验收

- 新增 6 个不可变 Test16 模块、Release、Bootstrap 与 Shell；Shell version=`2026092406`，build=`10118`。
- 已执行 JavaScript 语法、Shell JSON、Release/Bootstrap 模块顺序与路径检查。
- 待实机验证：视频列表无文件夹、跨小程序 Magnet 落入 My Pack 并可播放、退出调用页后的回收、还原/永久删除/清空、移动和复制。验证前不得建立 Stable。

当前 Test：`0.1.0-test.16 / Build10118`；Stable 尚未建立。

---
## 2026-09-24 · 0.1.0-test.17 / Build10119 · 修复回收站全盘查询并增强文件库

### Test16 实机反馈

用户确认文件可以通过 batchTrash 删除，但 Test16 回收站页面始终为空。复核当前 PikPak 客户端实现后确认：回收站、星标和全盘列表不是普通根目录查询，必须显式传递特殊范围 parent_id=*。Test16 的 listTrash() 省略了该字段，因此只得到空列表。

### Test17 修正与增强

- 回收站查询改为 GET /drive/v1/files?parent_id=*&filters={trashed.eq:true}，保留分页、还原、永久删除和清空。
- 新增星标/取消星标与“星标文件”页；星标列表同样使用全盘范围。
- 新增“最近文件”页，按修改时间查看跨文件夹项目。
- 搜索由仅根目录扩大为全盘范围的前 500 个项目，并继续兼容分享链接、Magnet 和 HTTP 输入。
- 新增文件详情页，可查看大小、时间、ID、父目录、Hash，并直接下载、星标、移动或复制。
- 新增目录筛选：全部、仅视频、仅文件夹；排序新增名称倒序。
- 首页重排为容量状态、My Pack、星标、最近、回收站、离线任务和常用操作，继续保持原生轻量 UI。
- 保留 Test15 已验证的网页登录/个人盘/播放，保留 Test16 的视频专属 playlist、My Pack Magnet 目标和安全回收策略。

### 发布与验收

- 新增不可变 Test17 Provider/UI/Pages/Runtime/Identity 模块、Release、Bootstrap 与 Shell；Shell version=2026092407，build=10119。
- 发布前执行 JavaScript 语法、模块顺序、Shell JSON、远程路径及运行时导出检查。
- 待实机验证：回收站可见性、还原/永久删除/清空、星标、移动/复制、全盘搜索、Magnet My Pack 与退出回收。验证前不得建立 Stable。

当前 Test：0.1.0-test.17 / Build10119；Stable 尚未建立。

---
## 2026-09-24 · 0.1.0-test.18 / Build10120 · 图片预览与跨应用退出回收开关

### 用户反馈

- 个人网盘图片点击后被当作下载处理，缺少直接查看图片的体验。
- 跨小程序调用 PikPak 播放 Magnet 后，需要允许用户决定关闭调用页时是否自动把本次临时播放文件移入回收站。

### Test18 修正

- Personal、Share 和任务文件的图片结果统一追加海阔图片类型标记，点击图片卡直接进入图片预览；下载仍保留在长按菜单。
- 图片卡使用独立 image class，不进入视频播放列表。
- 设置页新增“跨小程序 Magnet 退出自动回收”开关，默认开启，以保持原有安全策略。
- 开启时：跨应用 handoff 创建的文件登记到当前会话，关闭调用页后移入回收站。
- 关闭时：handoff 文件不登记为临时对象，关闭页面时跳过清理，文件保留在 My Pack。
- 手动“清理临时播放文件”仍只处理已经登记的对象，不影响普通文件。

### 发布与验收

- 新增不可变 Test18 Provider/Playback/UI/Pages/Runtime/Identity 模块、Release、Bootstrap 与 Shell；Shell version=2026092408，build=10120。
- 登录、视频播放、Test17 回收站和文件管理链未重写。
- 图片预览及开关开启/关闭两种 handoff 行为待海阔实机验证；验证前不得建立 Stable。

当前 Test：0.1.0-test.18 / Build10120；Stable 尚未建立。

---

## 2026-09-24 · 0.1.0-test.19 / Build10121 · 云盘搜索与多账号 Web Session

### Test19 功能

- 首页新增“云盘搜索”入口，按文件名检索全盘非回收站项目；结果采用 `parent_id=*` 分页读取，可筛选全部、视频、图片和文件夹。
- 海阔规则自身的全局搜索继续识别分享链接与 Magnet；普通关键词改走同一套全盘搜索结果。
- 账号页升级为本机多账号管理：自动收录当前及后续官方网页登录的 Web Session，支持一键切换、重命名和移除，最多保存 8 个账号。
- 账号切换只恢复本机已保存的 Web profile Session，不调用账号密码登录，也不进入已确认受 PikPak 风控影响的 Android captcha 登录链。
- 切换账号会隔离容量缓存、My Pack 缓存和 captcha 状态；Token 仅保存在海阔本机存储，不显示在 UI、日志或云口令中。
- 临时播放文件队列增加账号归属。手动清理和跨小程序退出自动回收只处理当前账号登记的对象，避免切换账号后误操作其他账号文件。
- 保留 Test18 图片预览与退出自动回收开关，以及 Test17 回收站、星标、最近、详情和 Test16 文件管理能力。

### 发布与验收

- 新增不可变 Test19 Core/Provider/UI/Pages/Runtime/Identity 模块、Release、Bootstrap 与完整 Shell；Shell version=`2026092409`，build=`10121`。
- 发布前执行 JavaScript 语法、模块顺序、Shell JSON、远程文件路径与运行时导出检查。
- 待海阔实机验证：全盘搜索翻页与类型筛选、第二账号网页登录接入、双向切换后目录/播放、账号移除，以及两个账号各自的临时文件回收。验证前不得建立 Stable。

当前 Test：0.1.0-test.19 / Build10121；Stable 尚未建立。

---

## 2026-09-24 · 0.1.0-test.20 / Build10122 · 修复原生搜索与新增账号流程

### Test19 实机反馈

- 目标文件夹在网盘中真实存在，但 Test19 搜索结果为空。原因是 Test19 先读取一批全盘列表，再在这一批数据中本地匹配名称，并不是真正的服务端搜索。
- “添加账号”直接打开原来的官方网页，网页仍保留旧账号登录态，因此只能再次读取旧账号，无法进入新账号登录流程。

### Test20 修正

- 搜索改用 PikPak 文件接口的原生过滤：`filters.name.contains`，由服务端在整个个人网盘中按文件名检索；保留分页及全部、视频、图片、文件夹筛选。
- 删除“每页扫描若干项目后本地匹配”的错误搜索语义；搜索结果不再受当前批次是否恰好包含目标文件影响。
- 新增账号改成独立两阶段流程：先清理官方网页的 localStorage、sessionStorage、IndexedDB、Cache 和可访问 Cookie，再登录新账号；确认网页显示新账号后，再进入原有 Test15 会话读取页。
- 网页清理仅作用于官方网页容器，不清除海阔小程序已经保存的旧账号 Session；新账号接入后可在账号页来回切换。
- 保留 Test15 已实机验证的 Web Session 接管、个人盘浏览和视频播放，不重新启用账号密码/captcha 登录。

### 发布与验收

- 新增不可变 Test20 Provider/Pages/Runtime/Identity 模块、Release、Bootstrap 与完整 Shell；Shell version=`2026092410`，build=`10122`。
- 发布前执行 JavaScript 语法、运行时导出、原生搜索请求参数、Shell JSON、模块顺序与远程路径检查。
- 待实机验证：搜索“无耻之徒”能返回已存在文件夹；新增第二账号后账号页显示两个本机会话；双向切换后的目录与播放均属于对应账号。验证前不得建立 Stable。

当前 Test：0.1.0-test.20 / Build10122；Stable 尚未建立。

---

## 2026-09-24 · 0.1.0-test.21 / Build10123 · 修复 Web Session 令牌轮换失效

### Test20 实机反馈

- 首页仍显示“Web Session 已连接”，但个人网盘文件全部无法读取。
- Drive 接口返回 `invalid refresh token ... has been refreshed by other process`，说明官方网页或其他会话已轮换 Refresh Token，而小程序仍保存旧值；这不是文件列表被删除或搜索接口故障。

### Test21 修正

- 新增 Web Session 失效识别：检测 `invalid refresh token` / `refreshed by other process` 后停止把它当成普通列表错误，并在首页、文件夹页显示“重新读取网页登录会话”入口。
- 恢复链继续只使用官方 PikPak 网页，不回退账号密码/Android captcha 登录；网页仍登录时无需再次输入账号密码。
- 重写网页凭据捕获策略：优先实际 Fetch/XHR Token 响应和 Bearer 请求，其次 IndexedDB、sessionStorage、localStorage；按完整凭据对象更新，不再以 Token 字符串长度决定新旧，避免新 Access Token 与旧 Refresh Token 混合。
- 刷新成功后合并保留账号身份、Web profile 和 device_id，并把轮换后的新 Refresh Token 写回当前账号记录；修复 refresh 响应缺少 sub 时产生重复账号快照或保留旧 Token 的问题。
- Access Token 接回成功后立即恢复文件读取；只有 Access Token 过期且 Refresh Token 再次被外部轮换时才要求重新同步网页会话。
- 保留 Test20 原生全盘搜索与新增账号流程，以及此前个人盘、播放、图片、回收站、Magnet、文件管理和临时文件清理能力。

### 发布与验收

- 新增不可变 Test21 Core/Pages/Runtime/Identity 模块、Release、Bootstrap 与完整 Shell；Shell version=`2026092411`，build=`10123`。
- 发布前执行 JavaScript 语法、模块顺序、Shell JSON、会话轮换模拟、运行时导出及远程路径检查。
- 待海阔实机验证：从仍登录的官方网页恢复会话后首页文件立即出现；退出重进仍可读取；云盘搜索可命中已存在文件夹；多账号切换后各账号目录正确。验证前不得建立 Stable。

当前 Test：0.1.0-test.21 / Build10123；Stable 尚未建立。

---

## 2026-09-24 · 0.1.0-test.22 / Build10124 · 撤销多账号并恢复单账号模型

### Test21 实机反馈与决策

- Web Session 轮换恢复仍未让个人网盘文件恢复显示。
- 用户明确要求停止多账号方向，只保留一个 PikPak 账号；不再继续修补账号列表和切换链。

### Test22 架构收敛

- 从活动 Release 中移除 Test19 多账号 Core、账号作用域临时文件模块、账号搜索页 Runtime 和 Test20 多账号导出链。
- 同时移除仍会在首次迁移时清除 Web Session 的 Test10 Android Auth/Migration/Page/Runtime 模块，活动链不再混入 Android refreshAccess/captcha 登录实现。
- 启动时清理 `accounts`、`current_account_id` 等多账号索引，只保留现有 `pikpak_v2_session` 作为唯一当前会话；再次网页登录会直接替换它。
- 账号页删除添加账号、切换、重命名和移除账号功能，只提供当前单账号状态、官方网页登录同步和清除本机会话。
- 临时播放文件恢复为单账号队列，继续遵守跨小程序 Magnet 退出自动回收开关。

### 登录恢复修正

- 网页会话接管不再仅凭 localStorage、sessionStorage 或 IndexedDB 自动返回。
- 必须在官方文件页捕获到真实 Fetch/XHR Drive 请求中的 Bearer，才允许写入本机单账号 Session；网页存储仅用于补充同一网页登录态的 Refresh Token、device_id 等字段。
- 保留 Test21 的失效诊断与首页/文件夹恢复入口；继续禁止 Android 账号密码/captcha 登录。

### 发布与验收

- 新增不可变 Test22 Core/UI/Pages/Runtime/Identity 模块、Release、Bootstrap 与完整 Shell；Shell version=`2026092412`，build=`10124`。
- 保留原生全盘搜索、个人盘浏览、视频/图片播放、My Pack Magnet、离线任务、回收站、移动/复制、星标/最近/详情和临时文件清理。
- 待海阔实机验证：官方网页进入文件页并产生 Drive 请求后能自动接回；首页文件出现；退出重进仍可读取；云盘搜索和播放正常。验证前不得建立 Stable。

当前 Test：0.1.0-test.22 / Build10124；Stable 尚未建立。

---

## 2026-09-24 · 0.1.0-test.23 / Build10125 · 官方播放线路优先与首页体验重整

### 实机反馈与根因

- 用户确认 Test22 单账号官方 Web Session 已恢复正常，账号与个人网盘不再是当前阻塞点。
- 会员账号播放仍需较长等待，拖动进度条后重新缓冲明显；代码复核确认 Test22 把通用 `web_content_link` 原文件直链固定放在播放列表第一位。
- 原始上传版在 PikPak 返回 `medias` 时只使用这些官方专用播放线路；Test1 重构时额外把原文件放到首位，改变了已验证的默认播放路径。

### Test23 播放修正

- 默认优先使用 `medias[].link.url`，保留 PikPak 返回的官方线路顺序、原画/转码名称和字幕；`web_content_link` 降为最后一条“原文件 · 备用线路”。
- 每一条播放 URL 单独附加海阔视频标记，避免只在线路 JSON 外层追加标记造成播放器识别不一致。
- 新建 Magnet 临时文件时不再看到原文件直链就立刻结束轮询；会短暂等待 `medias` 专用线路就绪，减少秒传后误走慢速原文件。
- 增加 3 分钟内存级播放详情复用，重复打开同一文件时减少一次 Drive 播放详情请求；不持久化带签名的过期地址。
- 设置页新增“官方流媒体优先（推荐）/ 原文件优先（兼容）”，默认推荐模式；图片预览、音频、下载和字幕能力继续保留。

### 首页 UI

- 首页从过长的横向按钮墙改为状态卡 + 四宫格主入口 + 轻量工具标签：云盘搜索、My Pack、最近、星标作为主入口，回收站、离线任务、新建文件夹、账号、设置收纳为次级操作。
- 状态卡集中显示单账号 Web Session、容量和播放策略；输入框、最近输入与“我的文件”内容区保持清晰分组。
- 文件卡片、纯视频播放列表、图片预览、移动/复制/删除、回收站及 Magnet 保存到 My Pack 均沿用此前实现。

### 发布与验收

- 新增不可变 Test23 Playback/UI/Pages/Runtime 模块、Release、Bootstrap 与完整 Shell；Shell version=`2026092413`，build=`10125`。
- 登录链保持 Test22 单账号官方 Web Session，不重新引入多账号、Android 密码登录或 captcha/init。
- 待海阔实机验证：会员账号点开已有视频的首帧时间、拖动到远端进度后的恢复时间、默认线路是否显示为官方 media，以及 Magnet 临时视频播放。验证前不得建立 Stable。

当前 Test：0.1.0-test.23 / Build10125；Stable 尚未建立。

---
