# asset-core-7f3 架构规范

版本：2.0  
日期：2026-08-22

## 目标

把海阔小程序从“单个 JSON/大段 JS”升级为可长期维护的工程：页面、Core、Provider、Adapter、UI、更新与兼容层彼此隔离，同时保持用户安装、恢复和更新尽量简单。

同时采用“公开运行仓 + 私有历史仓”分工，避免开发历史和明显项目关键词长期暴露在公开默认入口。

## 仓库分工

### `asset-core-7f3`

正式运行仓库，Public。

```text
landing   默认分支，仅中性展示
main      实际运行、发布和维护分支
```

所有正式远程链必须使用 `asset-core-7f3@main`。

### `hiker-cloud`

历史开发仓库，Private。

只保留历史提交、旧实现和迁移前资料；不得再作为 Shell、Bootstrap、Manager、release、runtime、Raw 或 CDN 的正式依赖。

仓库迁移细节见 `docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`。

## 远程运行分层

```text
海阔云仓库轻量启动壳
        ↓
asset-core-7f3@main / Bootstrap
        ↓
Versioned Remote Module Manager
        ↓
release.json / versioned modules
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

1. 海阔云仓库主要保存轻量启动壳；第一次安装仍可通过“我的规则仓库”完成。
2. 自用远程业务代码统一放在 `asset-core-7f3/main`；海阔使用 `require(url, options, version)` 或明确的 `fetch(runtime)` 加载。
3. 正常启动不主动访问 `latest.json`；只有用户主动检查更新时才访问版本元数据。
4. 每个启动壳必须内置已验证的默认业务版本或明确恢复入口。
5. 更新必须“先完整加载并校验新版本，再切 active release”；失败不能破坏当前 Stable。
6. 保留 current/previous 或等价回退能力。
7. 页面层不重复实现签名、Token、解密、重试等网络逻辑。
8. Provider 只负责数据获取和站点特有逻辑；上层尽量使用统一模型。
9. 非核心数据优先异步补齐，不阻塞首屏。
10. 大目录采用 UI 分段或动态加载，避免一次创建数千组件。
11. Public 运行仓禁止提交密码、Cookie、Token、私钥、测试账号等敏感信息。
12. 海阔违禁词兼容在发布前统一扫描；协议真实值不得被简单替换破坏。
13. `landing` 只承担低信息默认展示；任何运行 URL 必须明确写 `@main`，不得依赖默认分支。
14. 新代码不得新增对 `hiker-cloud` 的正式运行引用。
15. 仓库迁移时必须同时迁移“手机已经安装的 Shell”，不能只迁 GitHub 文件。

## 版本职责

- `shellVersion`：海阔规则壳/云仓库入口版本。Shell URL、Bootstrap 协议、页面声明或兼容结构变化时升级。
- `version/build`：业务版本，由 `stable/test/latest/release` 元数据管理。
- `Remote Module Manager`：公共更新协议版本，尽量长期向后兼容。
- `landing/main`：不是产品通道；`landing` 只为默认展示，`main` 才是运行分支。

## 用户侧预期流程

```text
首次：我的规则仓库 → 安装轻量 Shell → 首次打开加载并缓存业务模块
以后：发现问题 → 新 release/Test → 实机验证 → 晋级 Stable → 用户主动更新
```

## 仓库迁移硬规则

```text
复制运行文件
→ 改所有 URL
→ 新仓实机测试
→ 重新覆盖安装旧 Shell
→ 再把旧仓下线/Private
→ 不重新安装直接断旧仓验证
```

只有最后一步仍正常，才允许宣布迁移完成。
