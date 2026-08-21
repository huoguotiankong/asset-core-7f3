# 我的规则仓库 Recovery Shell 1.4.4

日期：2026-08-20

## 实机基线纠正

用户正式版实机实际仍是：

- Core 3.4.3 / build 343
- Bootstrap 1.4.3
- Manager 2.0.1

用户并未完成 3.5.0 正式 Core 升级。因此本次恢复发布**不修改正式 Core 版本**，只将正式 Shell / Bootstrap 热修到 1.4.4，并引入 Manager 2.0.2。

## 1.4.4 解决的问题

旧 Bootstrap 更新页的 `lazyRule` 回调直接引用 `RULE_REPO_CONFIG` / `RULE_REPO_MANAGER_URL`。海阔序列化执行回调后原作用域不可依赖，实机点击“检查 Core 更新”出现：

```text
RULE_REPO_CONFIG 未定义
```

Recovery Shell 1.4.4 改为把配置 JSON 与 Manager URL 作为 `lazyRule` 显式参数传入。

同时 Manager 2.0.2 将版本元数据与业务模块加载改为多镜像 fallback：

1. jsDelivr
2. GitHub Raw
3. GitHub Web Raw

避免更新链完全依赖一个 GitHub Raw 域名。

## 测试版恢复壳

测试版继续保持 Core 3.5.0-rc8 / build 358，同时发布 Recovery Shell 1.0.7-test：

- 修复测试版更新页同类 lazyRule 作用域问题。
- Bootstrap / Manager 优先从 jsDelivr 获取。
- RC8 继续负责事务式 manifest 同步：新目录获取失败时保留旧有效缓存。

## 发布规则

本次属于 Shell/Bootstrap 恢复热修，不等同于正式 Core 晋级。

后续正式 Core 3.5.x 必须在以下实机路径全部通过后再发布：

- Recovery Shell 覆盖导入。
- 正式版“检查更新”按钮真实点击。
- 测试版 RC8 首页加载。
- 测试版立即同步在网络失败时仍保留旧缓存。
- 更新 / 回退闭环。
