# 一键更新协议 v2

日期：2026-08-22

## 原则

当前自用远程程序统一从 `huoguotiankong/asset-core-7f3@main` 加载。正常运行优先使用已经验证并缓存的 Stable release；用户主动点击“检查更新/立即更新”时才访问最新版本元数据。

历史 `hiker-cloud` 已转 Private，不再作为正式更新源。

## 远程应用 manifest / release

推荐：

```json
{
  "schema": 1,
  "id": "demo",
  "name": "Demo",
  "version": "1.0.0",
  "build": 10000,
  "ref": "main",
  "modules": [
    {"name":"core","path":"apps/tools/demo/releases/1.0.0/core.js"}
  ],
  "verify": {"global":"Demo","property":"version","equals":"1.0.0"}
}
```

## 更新流程

1. 获取 `latest.json` / Test/Candidate 元数据。
2. 读取目标 `release.json`。
3. 下载/require 全部目标模块并执行完整性/contract 校验。
4. 只有新 release 全部通过后才切 active state。
5. 当前 Stable 保留为 previous。
6. 任意一步失败，不修改当前 Stable。
7. 成功后记录新版本；保留上一版本供回退。

## 网络策略

至少支持多个远程模板：

```text
jsDelivr
GitHub Raw
GitHub Web Raw
```

全部模板必须明确指向 `asset-core-7f3@main` 或 release 自己声明的 ref。

网络全部失败时只提示更新失败并继续使用已验证版本/缓存，不得让正常启动直接失效。

## Shell 更新

业务 release 更新与 Shell 更新分离。

只有以下情况必须重新发布/覆盖 Shell：

- Bootstrap URL 变化。
- 仓库名或 runtime URL 变化。
- 页面声明结构变化。
- 海阔规则壳兼容字段变化。

仓库迁移时，更新服务器代码后还必须覆盖手机上已安装的旧 Shell。旧仓下线/Private 后，不重新安装直接测试仍正常，才视为迁移完成。

详见 `docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`。
