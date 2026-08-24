# Local-First Runtime / 远程发布、本地运行

日期：2026-08-24
状态：Test 试点阶段
正式事实源：`huoguotiankong/asset-core-7f3@main`

## 1. 目标

把自用远程小程序从“远程代码运行 + 海阔隐式 require 缓存”升级为“远程发布、本地运行”。

正常运行时，GitHub / jsDelivr 只承担控制面职责，不再承担已安装版本的日常运行时依赖。

- 首次安装某版本：联网拉取完整版本包。
- 新版本升级：先完整下载、回读校验，再切换 active。
- 正常启动：只读取本地 active bundle。
- 更新失败：旧 active bundle 保持可运行。
- previous bundle 保留，用于回退与故障恢复。
- 图标和版本索引在安装/显式同步时落地本地。

## 2. 三层网络模型

### 控制面 Control Plane

只在显式动作发生时访问仓库：

- 云仓同步
- 检查版本
- 安装 / 覆盖导入新版本
- 重装当前本地包

控制面数据包括：

- 根 `manifest.json`：目录发现和摘要，不作为具体程序版本真相。
- 程序 `channels.json`：版本中心权威真相。
- `test.json / latest.json / stable.json`：活动通道指针。
- `release.json`：不可变版本包描述。

### 运行面 Runtime Plane

正常启动只允许依赖本地：

- Bootstrap 所需的已安装 runtime bundle
- Release 全部 JS 模块
- Release 中声明的静态代码资产 / 快照
- 程序 UI 图标
- 规则仓库的本地 channels 快照

当前共享实现：`libs/updater/v2.1.0/local_bundle_manager.js`。

本地包使用规则私有文件保存：

- `__hclocal_<app>_state.json`
- `__hclocal_<app>_b<build>.json`
- `__hclocal_<app>_b<build>_m<index>.js`

只有所有模块写入、回读和 MD5 完整性复核通过后，才能更新 `state.current`。

### 业务面 Business Plane

仍按业务需要联网，不属于 GitHub Runtime 依赖：

- 官方网站 / API
- 登录、Cookie、Token
- 视频 HLS / DASH
- 漫画正文图片
- 评论 / 社区 / 搜索等业务数据

因此 Local-First 保证的是“GitHub/CDN 故障不应使已安装代码无法启动”，不意味着业务站点本身可以离线使用。

## 3. 不可接受的假 Local-First

### 3.1 只缓存 Release 第一层模块

禁止顶层模块本地化后，模块内部继续：

- `fetch(raw.githubusercontent.com/...js)`
- `require(remote js)`
- `eval(fetch(remote source))`

迁移前必须审计递归依赖。

黄豆 1.9.0 曾存在两个典型问题：

- `core.js` 运行时再下载 1.8.2 完整 Core 快照。
- `pages_detail.js` 运行时再下载 Test5 Detail 源码并 patch/eval。

因此黄豆 Local-First 试点使用 `1.9.1-test.2`，将 `core-snapshot` 和 `detail-base` 都纳入 Release 本地包，Test1 不激活。

### 3.2 根 manifest 作为版本真相

禁止用根 manifest 的摘要版本拒绝程序自身更新后的 `channels.json`。

事实优先级：

`程序 channels.json > 根 manifest 摘要`

根 manifest 只用于发现程序、分类、排序、摘要和 channelsPath。

## 4. 图标本地化

规则仓库在显式同步时缓存程序图标，导入规则时优先把 `home_rule.icon` 改成本地路径。

程序内部固定 UI 图标也应随版本安装落地本地。

当前试点：

- 我的规则仓库：`hiker://files/cache/asset-core-local/icons/rule-repo.svg`
- 黄豆 1.9.1-test.2：library/topic/mine/settings 四个 UI 图标本地化。

后续需要继续评估：图标从 app cache 迁移到规则私有持久文件，以提高“清缓存后仍离线可用”的强度。

## 5. 规则仓库版本索引

规则仓库首页禁止恢复 N+1 网络请求。

显式“同步”负责：

1. 更新根 manifest。
2. 扫描所有 channel-group。
3. 并行拉取各程序 `channels.json`。
4. 写入每程序 Fast Channel Cache。
5. 缓存程序图标。
6. 刷新真实安装索引。

正常首页、分类、搜索目录、版本详情优先使用本地快照。

## 6. 当前试点

### 我的规则仓库

- Stable：3.5.5 / Build389，冻结。
- Test：3.5.6-rc11 / Build401。
- Shell：1.0.47-test / `rule_repo_test_v147.txt`。
- Bootstrap：1.0.47-test / `bootstrap_test_v147.js`。
- Bundle Manager：2.1.0。
- UI：Single Workspace 15.1.1。

### 黄豆短剧

- Stable：1.9.0 / Build19006，冻结。
- Test：1.9.1-test.2 / Build19102。
- Shell：`huangdou_remote_test_v8.txt`，numeric version 2026082411。
- Bootstrap：`bootstrap_test_v8.js`。
- Bundle Manager：2.1.0。
- Test1：未激活，原因是递归远程依赖审计失败。

## 7. 实机回归门禁

两个试点都必须完成：

1. 新版本覆盖导入成功。
2. 首次打开成功安装完整本地包。
3. 第二次打开明显更快。
4. 首页 / 分类 / 搜索 / 详情 / 设置正常。
5. 规则仓库同步后，多版本详情无需临时联网等待。
6. 图标显示正常。
7. GitHub / jsDelivr 不可用情况下，已安装版本仍能启动并进入本地 UI。
8. 业务站点可用时，业务数据继续正常请求。
9. 新版本安装中断，不破坏旧 active。
10. 重启海阔后本地包仍可使用。

未完成上述实机闭环前，禁止把 Local-First 迁移直接推广到所有 Stable。

## 8. 推广顺序

第一批：

- 我的规则仓库 Test
- 黄豆短剧 Test

第二批：

- 麻豆AI
- Hanime1
- ACFun
- JavDB

第三批：

- 其它自用远程程序

每个程序迁移时都必须先审计“远程套远程”和动态加载器，禁止仅机械替换 Bootstrap。
