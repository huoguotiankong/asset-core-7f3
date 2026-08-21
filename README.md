# hiker-cloud

海阔视界私人云仓库 / GitHub 远程源码仓库。

## 当前架构

- `manifest.json`：现有“我的规则仓库”兼容清单。
- `registry.json`：新工程总索引。
- `apps/`：正式小程序，按视频、漫画、网盘、工具、聚合分类。
- `libs/`：公共更新器、兼容层、UI/Core 公共库。
- `templates/`：新小程序模板。
- `docs/`：架构与发布规范。

## Remote Module 模式

以后新小程序默认采用：

```text
云仓库轻量启动壳
      ↓
GitHub bootstrap
      ↓
Remote Module Manager
      ↓
GitHub业务模块
      ↓
海阔 require 版本缓存
```

正常启动不检查远程最新版；只有用户主动检查/更新时读取 `latest.json`。

当前首个试点：`apps/video/acfun/`。

海阔旧云仓库入口仍读取：
`https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/manifest.json`
