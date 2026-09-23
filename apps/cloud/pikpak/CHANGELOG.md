# PikPak 小程序 Changelog

> 2026-09-23 开始由 `asset-core-7f3@main` 正式维护。当前基线来自用户上传的 `PikPak.hk小程序(1).zip`，原规则 `version=1`；此前仓库没有 PikPak Stable/Test 元数据，因此本轮从 Test 通道建立治理，不直接创建 Stable。

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
