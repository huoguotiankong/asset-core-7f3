# Browser Session 与 Active Account 状态分裂事故（2026-08-22）

## 现象
Hanime1 Test31 实机出现：

- 登录页能够识别账号并显示资料；
- 官网 Cookie 会话有效；
- 但首页“我的”仍显示“登录 Hanime1”；
- 收藏、片单、稍后看、订阅、历史无法进入；
- 依赖 `C.activeAccount()` 的详情操作也可能误判未登录。

## 根因
登录成功与“已保存账号”属于两个不同状态域：

```text
Browser Session
= 浏览器 Cookie / getCookie(base)
= P.profile() 可成功

Managed Account
= hanime2_accounts + hanime2_active_account
= C.activeAccount() 才非空
```

旧 Core 的 `useBrowserSession()` 会切换 browser mode 并清除 active account ID，因此完全可能出现：

```text
P.profile() != null
C.activeAccount() == null
```

如果 UI 把 `activeAccount()` 当成唯一鉴权事实，就会出现“已经登录但页面仍要求登录”。

## 修复原则
账号系统至少区分：

1. `AuthenticatedSession`：当前请求链真正可以访问登录资源。
2. `SavedAccount`：为了多账号切换而持久化的账号记录。

**SavedAccount 不是 AuthenticatedSession 的必要条件。**

推荐统一提供 session-aware 接口，例如：

```text
currentSessionAccount()
→ managed active account（优先）
→ browser Cookie + profile probe（fallback）
→ null
```

页面判断登录态、收藏/历史/片单等账号资源访问，应使用真实会话状态；“保存当前登录”只能作为多账号管理能力，不应成为查看账号内容的前置条件。

## 禁止做法
- 禁止仅凭本地保存账号 ID 判断网站是否已登录。
- 禁止 `P.profile()` 已成功后仍用另一个互不相干的 managed-state 变量阻断账号功能。
- 禁止把“保存账号”与“登录成功”混成同一个产品动作。
- 修改 Auth State 后必须同时回归：首页我的、详情账号动作、账号中心、评论发表/回复、收藏/片单/历史。

## Hanime1 Test32
Test32 新增 browser-session profile fallback：managed account 仍优先；没有 managed account 时，只要 browser Cookie + `P.profile()` 有效，就作为当前有效账号提供给“我的”、详情和账号中心。Stable 2.0.0 不受该未验证修复影响。
