# Remote Module 更新协议

## 为什么不用业务源码落地文件

用户第一次安装仍然从“我的规则仓库”导入一个很小的海阔规则壳。业务代码位于 GitHub，并通过海阔官方 `require(url, options, version)` 机制加载和缓存，因此用户不需要下载 `.hk小程序.zip`、在手机文件管理器中寻找文件或重复上传完整规则。

## 文件角色

```text
apps/<category>/<app>/
├─ manifest.json          工程/迁移信息
├─ bootstrap.js           启动壳控制器，变化频率低
├─ latest.json            当前最新业务版本，仅主动检查更新时读取
└─ releases/
   └─ <version>/
      └─ release.json     该版本模块清单与校验条件
```

公共管理器：

```text
libs/updater/remote_manager.js
```

## 正常启动

1. 云仓库规则壳 `require(bootstrap.js, ..., shellBuild)`。
2. Bootstrap 读取 `hc_remote_state_<appId>` 中的 active release；如果没有状态则使用壳内置 `defaultRelease`。
3. Remote Module Manager 按顺序 `require()` 当前 release 的 modules。
4. 海阔已缓存同版本模块时直接使用缓存，不读取 `latest.json`。

## 主动更新

1. 用户点击“检查更新”才请求 `latest.json`。
2. 读取 `latest.release` 指向的 `release.json`。
3. `立即更新`先加载并执行新版本全部模块。
4. 执行 `verify` 校验。
5. 只有全部成功后才将新 release 写入 active state；旧 current 变为 previous。
6. 任何步骤失败都不切换 activeVersion。

## 回退

`rollback()` 交换 current/previous，并重新加载 previous。旧版本 URL/版本号不同，因此可以继续命中海阔旧缓存。

## 重新加载当前版本

`reinstall()` 对当前 release 每个模块执行 `deleteCache(url)`，再重新 `require()` 同版本。它用于处理缓存异常，不改变业务版本号。

## 发布规范

- Bootstrap 协议兼容时，只发布新的业务 version/build，不重新上传云仓库启动壳。
- Bootstrap 发生不兼容修改时才升级 `shellVersion` 并重新发布小壳。
- `release.json` 中的模块应为“定义/导出模块”，避免加载即执行不可逆业务操作。
- 旧版本文件原则上不可原地覆盖；新版本优先创建新文件或新 release 路径。
- `latest.json` 必须最后更新，确保它指向的 release 和模块已经全部存在。
- 发布前执行海阔违禁词兼容扫描，协议关键值不得通过简单字符替换破坏。
