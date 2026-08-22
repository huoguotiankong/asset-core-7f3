# Incident：资源客户端契约错配与播放授权会话误判（2026-08-23）

适用范围：海阔视界所有远程小程序，尤其是同时存在 JSON API、HTML 页面、账号会话、Token/HLS 播放的程序。

## 1. MDAI：HTML ResourceDetector 误用 JSON API Client

### 实机症状
麻豆AI 2.7.0-test.3 点击“官网图标检测”时，官网已经返回正常 `<!DOCTYPE html>`，但程序提示“接口返回不是有效 JSON”。

### 根因
ResourceDetector 调用了面向 `/api/v1/*` 的 `m.request()`。该 Client 会对响应执行 JSON/schema 断言，所以 HTML 在 favicon 解析前就被错误拒绝。

### 永久规则
```text
JsonApiClient != RawHttpClient != HtmlResourceDetector
```

- JSON API Client：负责 JSON/status/schema 断言。
- RawHttpClient：只负责请求、Headers、Cookie、超时、原始响应。
- HtmlResourceDetector：在 RawHttp 之上解析 `<link rel=icon>`、manifest、meta、静态资源。
- Image/Manifest/robots/script 等资源不得因为“都来自同一个 Host”就复用强制 JSON 的 Client。
- 收到 `<!DOCTYPE html>` 对 HTML Detector 是正常输入，不是接口错误。

## 2. HuangDou：Token 存在不等于媒体已授权

### 实机症状
黄豆短剧 1.9.0-test.3 第 5 集已经取得播放 URL 并进入海阔播放器，但播放器黑屏并提示“播放异常，或者网络不可用”。详情 HTML 对后续集存在 `data-ep-free / is-locked / pay` 等权限提示。

### 根因边界
Stable 1.8.2 已验证免费集合同：

```text
POST /account/guest
→ GET /play/token?r=<id>&s=<ep>
→ token
→ /play/<id>/<ep>.m3u8?t=<token>
```

但重构时有两个错误假设：
1. 页面 `locked` 就直接跳网页——过早把 UI 提示当最终授权事实。
2. 后续又反向假设“拿到 token 就一定可播”——没有验证媒体响应是否是真 HLS、是否仍依赖 Cookie/Referer/账号购买权益。

### 永久规则
- `locked/free/VIP/pay` 是 UI/产品提示；最终播放授权以 Play API + 媒体响应为准。
- Token 只是播放链中间凭证，不等于最终 HLS 有效。
- 有账号体系时，优先保护用户当前合法登录/购买会话；**禁止每次播放前无条件重建 guest 覆盖已有会话**。
- Token 后如协议风险较高，可做有界 HLS Probe：`#EXTM3U` 才能证明拿到了真实 playlist；HTML 登录页、403/授权提示要归类为 `AUTH_FAIL`，不能交给播放器变成模糊黑屏。
- 播放器请求需要的 Cookie/Referer/UA 必须与取得 Token 的会话一致。
- 诊断只保存阶段、HTTP/媒体类型、是否存在 Cookie 等脱敏事实；禁止写真实 Token/Cookie。
- 不得绕过站点会员、购买或其它访问控制；程序只支持用户已有合法授权的会话复用。

## 3. 发布检查补充

以后相关程序在 Test/Candidate 发布前至少检查：

```text
[ ] HTML/favicon/manifest 请求是否绕开 JSON-only Client
[ ] 账号会话是否可能被 guest/anonymous 初始化覆盖
[ ] Token 成功后是否区分真实媒体与授权/错误页面
[ ] 媒体 Header 是否与获取 Token 的会话一致
[ ] locked/free 只作为提示，未替代真实 API 授权结果
[ ] 无权限时明确产品化提示，而不是进入黑屏播放器
[ ] 不保存或展示真实 Token/Cookie
```

## 4. 对应程序记录
- `apps/video/mdai/CHANGELOG.md`：2.7.0-test.3 → test.4 图标 ResourceDetector 事故。
- `apps/video/huangdou/CHANGELOG.md`：1.9.0-test.3 → test.4 会话/HLS 授权事故。
