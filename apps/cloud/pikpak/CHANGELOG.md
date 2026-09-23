# PikPak 小程序 Changelog

> 2026-09-23 开始由 `asset-core-7f3@main` 正式维护。当前基线来自用户上传的 `PikPak.hk小程序(1).zip`，原规则 `version=1`；此前仓库没有 PikPak Stable/Test 元数据，因此本轮从 Test 通道建立治理，不直接创建 Stable。

## 2026-09-23 · 0.1.0-test.5 / Build10105 · 安全验证自动接回 + 临时文件安全回收

### 实机事实与 Test4 边界

- 用户实机确认账号密码登录会收到 `result:review`，官方 PikPak 随后弹出“请完成验证”的交互式风控页面。
- Test4 已能识别 review 并提供内嵌验证页，但只假设“验证后继续使用原 captcha token”，且当 Captcha init 没直接返回 `verify_url` 时仍可能没有可加载地址。
- 因此 Test4 不作为完成态，Test5 继续补齐“验证 URL → 浏览器验证 → 新 captcha token → signin”的实际闭环。

### Test5 登录链

```text
账号 + 密码（临时 MyVar）
→ Captcha init
→ 普通通过：直接 signin
→ result:review
→ 若 API 有 url：直接使用
→ 若 API 无 url：根据 captcha_token / DeviceId 生成官方 spritePuzzle 验证地址
→ hiker://page/pikpakVerify
→ x5_webview_single 完成 PikPak 官方人机验证
→ urlInterceptor + JS 注入观察验证跳转
→ 捕获验证后的 captcha_token / loading 回调
→ hiker://page/pikpakVerifyDone
→ 使用捕获 token + 同一账号/DeviceId 继续 signin
→ 保存 access_token / refresh_token
→ 清除临时密码和验证状态
```

- 不绕过或模拟人机验证，仍由 PikPak 官方验证页面完成。
- 自动回调失败时保留“验证完成，继续登录”按钮作为兜底。
- 账号密码只在本次验证流程的 `MyVar` 中暂存；登录成功、取消验证或重新安装时清理。
- 账号页增加“继续安全验证”，避免验证过程中误返回后只能重新输入。

### Magnet 临时文件清理修正

此前 Test1~Test4 的临时文件队列虽然只登记本程序创建的 Magnet/秒传对象，但清理时调用的是 `batchDelete` 永久删除。Test5 改为：

- 只处理 `temp_files` 队列中由本程序登记的文件 ID，普通网盘文件和用户主动创建的离线文件不参与自动清理。
- 自动清理仍采用延迟策略：下一次 Magnet 处理时只清理已超过约 15 分钟的临时对象，避免当前播放、拖动进度条或播放器重取分片时文件过早失效。
- 手动“清理临时播放文件”只处理该临时队列。
- 清理动作由永久 `batchDelete` 改为 `batchTrash`，进入 PikPak 回收站，可恢复，不再永久删除。
- 当前尚未宣称具备可靠的“播放器退出瞬间”回调；在海阔实机确认退出回调契约前，不用未经验证的退出即删方案。

### Test5 实机验收重点

1. 账号密码登录触发 review 后自动进入“PikPak 安全验证”。
2. 验证区域正常加载，不再出现只有提示没有验证内容。
3. 完成人机验证后应自动进入验证完成页并继续登录；若未自动跳转，点击“验证完成，继续登录”兜底。
4. 登录后首页显示已登录并正常列出根目录文件。
5. 盘内视频验证原画/转码和拖动进度条。
6. 从其他小程序调用 Magnet 播放，确认临时文件不会在播放开始时立即删除。
7. 15 分钟后或手动清理，确认仅临时对象进入回收站，普通文件不受影响。

### 当前状态

- Test：`0.1.0-test.5 / Build10105`
- Stable：尚未建立。
- 发布状态：`pending-device-validation`。

---

## 2026-09-23 · 0.1.0-test.4 / Build10104 · 官方人机验证闭环

### 新的实机事实

用户进一步在 PikPak 官方端验证：该邮箱账号使用账号密码登录时并非普通失败，而是会弹出“请完成验证”的官方风控验证层。因此 `result:review` 不能只转换成错误提示；完整登录链必须保留 captcha token 并让用户真正完成官方验证。

### Test4 登录链

```text
账号 + 密码（仅临时 MyVar）
→ POST /v1/shield/captcha/init
→ 无验证：直接 /v1/auth/signin
→ result:review / 返回 verification URL
→ hiker://page/pikpakVerify
→ x5_webview_single 打开 PikPak 官方验证 URL
→ 用户完成人机验证
→ “验证完成，继续登录”
→ 使用同一 captcha token + 同一 DeviceId 再次 /v1/auth/signin
→ 保存 access_token / refresh_token
→ 清除临时密码与验证状态
```

### 修复点

- 新增独立 `pikpakVerify` 安全验证页，不尝试绕过官方验证码。
- 验证页使用海阔 `x5_webview_single` 内嵌 PikPak 返回的官方验证 URL，并提供“验证完成，继续登录 / 重新加载验证 / 取消验证”三个明确动作。
- 验证期间账号密码只保存在 `MyVar`，登录成功或取消时立即清除；不写入 Item、仓库或远程模块。
- `finishPasswordLogin()` 复用首次 Captcha init 返回的 captcha token 和由账号密码稳定派生的 DeviceId，避免重新初始化导致刚完成的验证失效。
- Captcha 过期时允许重新初始化验证页，而不是重复吐出内部 meta。
- 修正 Test3 Web 认证档 client secret 尾部误写的一个额外字符。
- 登录前 Captcha meta 同时按当前实现提供 `email` / `phone_number`，保留 `username` 兼容字段。
- 登录请求优先 `user.mypikpak.net`，仅网络错误时回退 `.com`。
- Test3 的旧 Android 会话兼容、Drive/Share/Magnet/Playback/UI 重构全部保持不变。

### 实机验收重点

1. 账号密码登录触发风控时应自动进入“PikPak 安全验证”页面，而不是弹出 `result:review` 原始信息。
2. 验证区域应加载官方验证内容。
3. 完成验证后点击“验证完成，继续登录”，应返回账号页/首页并显示已登录。
4. 登录后验证根目录列表和盘内视频播放。
5. 若验证页为空，记录验证页截图；若验证完成后仍提示未通过，记录按钮后的 toast，用于判断 X5 Cookie/Token 是否需要进一步桥接。

### 当前状态

- Test：`0.1.0-test.4 / Build10104`
- Stable：尚未建立。
- 发布状态：`pending-device-validation`。

---

## 2026-09-23 · 0.1.0-test.3 / Build10103 · 账号密码登录协议修复

### 实机问题

用户在 Test2 账号页使用邮箱/密码登录时，界面直接弹出一大段 PikPak Captcha 内部元数据，其中包含 `result:review` / `value:"review"`，无法正常完成登录。

### 根因确认

- Test2 仍沿用上传旧版的 Android `1.23.0` 认证档：`client_id=YNxT9w7GMdWvEOKa`、旧 captcha salts、旧 redirect。
- 当前公开维护的 PikPak 客户端实现已普遍切换到 Web `2.0.0` 认证档：`client_id=YUMx5nI8ZU8Ap8pm`、新的 captcha salts、`mypikpak.com` package profile 与 `xbase.cloud` redirect。
- `result:review` / `value:"review"` 是 PikPak 风控审核分支，不应把原始内部 meta 直接展示给用户；若切换当前认证档后仍返回 review，应明确提示用户先在 PikPak 官方端完成账号验证。

### Test3 修改

- 新账号密码登录切换到 Web `2.0.0` 认证档。
- 更新 Web client id、client secret、captcha sign salts、package name、redirect URI、X-Client-ID/X-Client-Version 请求头。
- Web 登录 DeviceId 改为基于账号密码稳定派生，避免每次登录随机设备指纹导致风控波动。
- 登录 Captcha 初始化使用 Web 档 `meta.username` 语义。
- 新登录成功后会话记录 `_auth_profile=web` 和对应 device id；后续 Access Token 刷新继续使用同一档。
- 已存在的旧 Android 会话保持 `legacy` 档刷新兼容，避免 Test3 强制所有已登录用户退出重登。
- Web Refresh Token 刷新按当前公开实现不携带旧 Android client secret；legacy 刷新仍保留旧参数。
- `error_code=4002` 也纳入 Captcha 失效识别。
- 对 `result:review` / `value:"review"` 统一转换为“PikPak 风控要求先完成账号验证”的中文提示，不再暴露 client_id、captcha_sign、meta 等内部结构。
- 设置页运行信息明确显示“新登录 Web 2.0.0 / 旧会话 Android 1.23.0 legacy”。

### 当前状态

- Test：`0.1.0-test.3 / Build10103`
- Stable：尚未建立。
- 发布状态：`pending-device-validation`。
- 实机验收重点：账号密码登录 → 首页根目录 → 盘内视频播放；若仍收到 review，则先确认官方 PikPak 账号本身是否要求验证。

---

## 2026-09-23 · 0.1.0-test.2 / Build10102 · 设置页海阔原生选择器兼容修复

### 发布前门禁发现

Test1 的重构设置页原计划用自定义 `select://` URL 生成 API 线路和排序选择器。继续对照仓库成熟实现和用户上传旧版后确认：当前海阔项目没有 `select://` 已验证契约；旧 PikPak 真正可用的模式是 `$(数组).select(...)`。

为避免刚修掉旧版“请选择 + 空白”后又引入新的设置交互回归，Test1 不交付实机，直接冻结为内部基线并升 Test2。

### Test2 修改

- API 线路切换改为海阔原生 `$( ['mypikpak.com','mypikpak.net'] ).select(...)`。
- 文件排序改为海阔原生 `$( ['名称','最近修改','文件大小'] ).select(...)`。
- 选项数组不再包含空字符串。
- Test1 的 Core/Auth、Provider、Playback、首页、文件列表、分享、Magnet、离线任务和隐私迁移逻辑全部保持不变。
- Runtime 仅更新测试版身份为 `0.1.0-test.2 / Build10102`。
- 安装器继续从当前已安装旧 PikPak 本地迁移必要兼容参数和现有会话，并保留当前规则图标；不会把登录凭据写入公开仓库。

### 当前状态

- Test：`0.1.0-test.2 / Build10102`
- Stable：尚未建立。
- 发布状态：`pending-device-validation`。
- 首轮实机先验证：首页能否打开、旧登录态能否迁移、设置页是否正常；再进入分享/Magnet/播放/文件管理逐项回归。

---

## 2026-09-23 · 0.1.0-test.1 / Build10101 · 全量产品与架构重构

### 用户实机与源码基线

用户当前实机截图显示首页含“界面设置 / 账号设置 / 分享链接输入 / 收藏 / 历史 / 下载”，点击“界面设置”后弹出“请选择”但内容为空。

源码确认：

- `setting()` 的“界面设置”实际调用 `$( [""] ).select(...)`，空字符串就是实机空白弹窗的直接根因。
- 所有认证、API、分享、Magnet、播放、文件列表和 UI 混在约 30KB 的单体 `pikpak` 子页面中。
- 账号页用 `setItem('password', input)` 和 `password_bak` 持久保存明文密码。
- 首页首次账号使用会自动执行 `referral()`，包含 `operating → join_promoting → sleep(3000) → 空 share → sleep(3000)`，与用户核心任务无关且显著拖慢首屏。
- 个人盘、公开分享和 Magnet 共用一个 `page_token` MyVar，页面间存在游标串号风险。
- 原版已有个人盘、公开分享、Magnet、直链/转码播放基础能力，但模块边界、状态隔离和产品层级不足。

### Test1 Architecture Reset

重构为：

```text
Core/Auth
→ Provider (Drive / Share / Magnet / Task)
→ Playback
→ UI
→ Pages
→ Runtime
```

- Core 集中负责 DeviceId、Captcha、AccessToken、RefreshToken、API 域名、统一错误恢复。
- Provider 集中负责文件列表、文件详情、容量、文件管理、分享、Magnet 解析、离线任务。
- Playback 统一个人盘 / 分享 / Magnet / 离线任务的播放模型，多画质统一返回 `names + urls + headers`，字幕字段只在 API 真正返回可用字幕时附加。
- Pages 只编排 Home / Drive / Share / Magnet / Tasks / Account / Settings；业务页面不再散落 Token 细节。
- Runtime 只暴露海阔动作和跨小程序调用契约。

### UI / UX

- 首页重做为：账号状态 → 离线任务/新建文件夹/账号/设置 → 统一输入框 → 最近输入 → 我的文件。
- 删除旧“界面设置”空选项入口，彻底消除“请选择 + 空白”的实机问题。
- 容量改为按需刷新/缓存，不再阻塞首页文件列表。
- 统一输入支持：PikPak 分享链接、Magnet、HTTP/HTTPS 离线链接。
- 最近输入只保留 6 条，可在设置中清理。
- 文件卡长按提供下载、创建分享、重命名、移到回收站。
- 公开分享页支持密码提示和文件夹继续浏览。
- Magnet 列表显示文件大小和“秒传可用 / 离线备用”状态。
- 离线任务页显示完成/运行/等待/失败状态并支持删除任务。

### 登录与隐私

- Test1 不再把密码写入 Item；密码只使用临时 MyVar，登录请求完成后清理。
- 首次打开会优先迁移旧规则 `storage0.signin` 的现有 access/refresh token，尽量避免用户被迫重新登录。
- 迁移时清理旧 `password / password_bak` 明文项。
- 退出时同时清理 Test1 和旧规则遗留会话。
- Refresh Token 可作为高级恢复方式导入，但不在 UI 中回显明文。
- 安装器只从当前已安装旧版中本地迁移必要客户端参数，不把用户设备上的登录凭据或私有状态写入公开仓库。

### 协议兼容策略

首轮 **不同时切换登录签名档**：继续沿用用户上传版已使用的 Android `1.23.0` 客户端参数与 Captcha Sign 算法，把 UI/架构变量和协议变量分开验证。

同时参考当前 PikPak 实现补入：

- `.com / .net` API 双域名；当前选择线路网络失败时只自动降级一次。
- Access Token 认证失败优先 Refresh Token 恢复，只重试原请求一次。
- Captcha 失效统一刷新后只重试一次。

当前公开实现已出现 Android `1.53.2 / SDK 2.0.6.206003` 等更新协议档；待 Test1 首页/登录/列表/播放实机通过后，再在后续 Test 单独升级协议档，避免一次大改无法定位回归来源。

### Magnet 快速链

Test1 将 Magnet 播放改为：

```text
POST /drive/v1/resource/list
→ 展平文件树并读取 meta.hash(GCID)
→ 有 GCID：UPLOAD_TYPE_RESUMABLE 秒传建临时文件
→ 获取 PLAY 详情并起播
→ 若秒传节点暂不可解析，重建一次
→ 无 GCID / 秒传失败：回退离线任务
→ task.file_id 就绪后播放
→ 临时文件进入延迟清理队列
```

不再在首次播放器返回前同步删除临时文件；只清理由本程序登记的临时对象。

### 新增文件管理能力

- 创建文件夹。
- 重命名。
- 移到回收站（用户文件不直接永久删除）。
- 创建公开分享链接。
- 离线任务创建、查看、删除。
- 原文件下载。
- 根目录名称搜索。
- API `.com / .net` 手动切换。
- 文件排序：名称 / 最近修改 / 文件大小。

### 明确删除/禁用的旧策略

- 禁止首页自动 `referral / join_promoting / 空 share`。
- 禁止固定 3 秒 + 3 秒 sleep 作为启动流程。
- 禁止保存明文密码。
- 禁止个人盘 / 分享 / Magnet 共用全局 `page_token`。
- 禁止把“界面设置”空数组当有效菜单。

### Test1 实机验收顺序

1. 覆盖导入后首页能正常打开，不再出现空白“请选择”。
2. 已登录旧版用户确认能迁移登录态；若无旧会话，账号密码登录成功。
3. 首页根目录文件/文件夹显示正确，进入两层文件夹返回正常。
4. 盘内视频至少验证原画 + 一个转码线路；拖动进度条能恢复。
5. 公开 PikPak 分享无密码 / 有密码各测一个。
6. Magnet 单文件和多文件各测一个，确认文件列表、大小、秒传/回退和实际起播。
7. 离线任务页验证运行、完成、删除任务。
8. 新建文件夹、重命名、回收站、创建分享分别实机验证。
9. 切换 `.com / .net` API 线路，确认失败可以回退/恢复。
10. 通过截图继续第二轮 UI 密度、间距和信息层级优化。

### 当前状态

- Test：`0.1.0-test.1 / Build10101`
- Stable：尚未建立。
- 发布状态：`pending-device-validation`。
