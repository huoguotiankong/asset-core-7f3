# hiker-cloud 架构规范

## 目标

把海阔小程序从“单个 JSON/大段 JS”升级为可长期维护的工程：页面、Core、Provider、Adapter、UI、更新与兼容层彼此隔离，同时保持用户安装和更新尽量简单。

## 分层

```text
云仓库轻量启动壳
        ↓
Bootstrap
        ↓
Remote Module Manager
        ↓
GitHub Releases / Modules
        ↓
海阔 require 版本缓存
        ↓
App / Core / Provider / Adapter / UI
```

业务工程内部继续采用：

```text
App
├─ pages        页面与交互
├─ core         请求、缓存、状态、任务、存储
├─ providers    站点/API/APP 数据提供方
├─ adapters     将不同 Provider 统一为内部模型
├─ ui           可复用组件
└─ tools        调试、导入导出、管理
```

## 关键原则

1. 云仓库只保存轻量 `.hk` 启动壳；第一次安装仍通过“我的规则仓库”完成，不要求用户下载本地文件。
2. 业务 JS 保存在 GitHub；海阔使用 `require(url, options, version)` 加载并缓存。相同版本正常启动直接命中海阔缓存。
3. 正常启动不访问 `latest.json`；只有用户主动“检查更新 / 立即更新 / 重新加载”时才访问版本元数据。
4. 每个启动壳必须内置一个已验证的默认业务版本，保证版本状态丢失时仍有明确回退目标。
5. 更新流程必须“新版本先加载并校验，成功后再切换 activeVersion”；失败不能破坏当前版本。
6. 保留 `previousVersion`，支持一键回退；当前版本加载失败时允许自动尝试上一已知版本。
7. 页面层不重复实现签名、Token、解密、重试等网络逻辑。
8. Provider 只负责数据获取和站点特有逻辑；上层尽量使用统一模型。
9. 非核心数据（头像、推荐、评论计数等）优先异步补齐，不阻塞首屏。
10. 大目录采用 UI 分段，避免一次创建数千组件。
11. 公开仓库禁止提交账号密码、Cookie、Token、私钥等私密信息。
12. 海阔违禁词兼容在发布前统一扫描；功能字符串优先采用运行时拼接/Base64 恢复，避免破坏真实协议值。

## 版本职责

- `shellVersion`：云仓库启动壳版本。只有 Bootstrap 协议发生不兼容变化时才需要重新发布云仓库规则。
- `version/build`：业务版本，由 GitHub `latest.json` 控制，绝大多数功能更新只改变这一层。
- `Remote Module Manager`：公共更新协议版本，尽量保持长期向后兼容。

## 用户侧预期流程

```text
首次：我的规则仓库 → 安装轻量启动壳 → 第一次打开缓存默认业务模块
以后：发现问题 → GitHub发布新业务版本 → 小程序内点更新 → 完成
```

用户无需再下载 `.hk小程序.zip`、在手机文件管理器中寻找文件或手动上传本地包。
