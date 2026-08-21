# Remote Module 更新协议

版本：2.0  
日期：2026-08-22

## 仓库基线

正式远程运行仓库统一为：

```text
huoguotiankong/asset-core-7f3@main
```

`landing` 只是默认展示分支，不承载运行入口。历史仓库 `hiker-cloud` 已转为 Private，不再作为正式远程依赖。

## 为什么不用业务源码落地文件

用户第一次安装仍然从“我的规则仓库”导入一个很小的海阔规则壳。业务代码位于 Public 运行仓，并通过海阔官方 `require(url, options, version)` 或明确 runtime loader 加载和缓存，因此用户不需要反复下载完整 `.hk小程序.zip`。

## 文件角色

```text
apps/<category>/<app>/
├─ manifest.json          工程/迁移信息
├─ stable.json            正式通道
├─ candidate.json         候选通道
├─ test.json              测试通道
├─ channels.json          通道入口
├─ bootstrap_vxxx.js      启动壳控制器
├─ latest.json            当前正式业务版本
└─ releases/
   └─ <version>/
      └─ release.json     该版本模块清单与校验条件
```

公共管理器当前位于：

```text
libs/updater/v2.0.2/remote_manager.js
```

所有模板至少应覆盖：

```text
https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}
https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}
https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}
```

## 正常启动

1. 海阔规则壳加载 `asset-core-7f3@main` 下的 Bootstrap。
2. Bootstrap 读取 `hc_remote_state_<appId>` 中的 active release；如果没有状态则使用壳内置 `defaultRelease`。
3. Remote Module Manager 按顺序加载当前 release 的 modules。
4. 海阔已缓存同版本模块时直接使用缓存，不主动读取 `latest.json`。
5. 单个镜像异常时切换其他镜像；全部失败时优先保留已验证版本/缓存，不得直接破坏 Stable。

## 主动更新

1. 用户点击“检查更新”才请求 `latest.json` 或 Test/Candidate 元数据。
2. 读取对应 `release.json`。
3. 先加载新版本全部模块。
4. 执行 `verify` / runtime contract。
5. 只有全部成功后才切换 active state；旧 current 变为 previous。
6. 任何步骤失败都不切换当前稳定版本。

## 回退与重装

- `rollback()`：交换 current/previous，并重新加载 previous。
- `reinstall()`：清理当前 release 的缓存后重新加载同版本，不改变业务版本号。
- 恢复入口必须与 Stable 隔离，不能因为 Test 失败把 Stable 的恢复链一并覆盖。

## Shell 是版本的一部分

远程业务文件迁移完成后，手机里已经安装的海阔规则壳不会自动改 URL。

因此发生仓库迁移、Bootstrap 地址变更或 runtime 地址变更时，必须：

```text
先发布新 Shell
→ 覆盖安装到实机
→ 确认 Shell 内 URL 已切换
→ 再下线旧仓库
```

2026-08-22 的仓库迁移已经证明：只改 GitHub 文件、不覆盖手机旧 Shell，会在旧仓 Private 后直接导致规则仓库/JavDB 断链。

## 发布规范

- Bootstrap 协议兼容时，只发布新的业务 version/build，不重复修改 Shell。
- Bootstrap URL、仓库名、页面声明或壳结构变化时必须升级 Shell 的数值 `version`。
- Stable 引用过的 release 不原地覆盖。
- `latest.json` 必须最后更新。
- Public 运行仓不得提交密码、Cookie、Token、私钥、测试账号。
- 发布前扫描 `hiker-cloud`、旧 Raw/jsDelivr 地址；新增正式代码中原则上应为 0 个运行引用。
- 发布前执行海阔违禁词兼容扫描，协议关键值不得被简单字符替换破坏。
- 涉及仓库切换时必须执行“旧仓 Private 后、不重新安装的断链验证”。

详细迁移事故与基线见 `docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`。
