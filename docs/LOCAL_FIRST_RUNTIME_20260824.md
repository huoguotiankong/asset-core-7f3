# Local-First Runtime / 远程发布、本地运行

日期：2026-08-24
状态：Test 试点阶段（规则仓库 RC21 已进入运行态验证）
正式事实源：`huoguotiankong/asset-core-7f3@main`

## 1. 目标

把自用远程小程序从“远程代码运行 + 隐式 require 缓存”升级为“远程发布、本地运行”。

正常运行时，GitHub / jsDelivr 只承担安装、升级、显式同步等控制面职责；已经安装的代码、版本目录和 UI 静态资产必须优先本地运行。

- 首次安装某版本：联网取得不可变 Runtime/安装清单并写本地。
- 新版本升级：新包完整写入和校验成功后才切换。
- 正常启动：只执行本地 Runtime。
- 版本详情：只读本地版本目录，禁止临时联网。
- 图标：真实本地缓存优先，缺失时立即使用本地占位，不等待远程图片。
- 更新失败：旧本地 Runtime 与旧版本目录继续可用。

## 2. 三层网络模型

### 控制面 Control Plane

只允许在显式动作访问仓库：

- 首次安装 / 覆盖导入
- 检查并升级程序
- 用户主动“同步”
- 重建本地运行包

控制面数据包括：

- 根 manifest / registry：目录发现、分类、摘要。
- 程序 channels：程序版本权威事实源。
- stable/test/latest 等活动通道指针。
- 不可变 Runtime manifest / module assets。
- 规则仓库统一 `channel_catalog_snapshot.json`。

**禁止**在首页、分类、搜索、程序详情、版本详情等正常浏览热路径发 GitHub/CDN 元数据请求。

### 运行面 Runtime Plane

正常启动只依赖本地：

- Runtime JS 模块
- Runtime package/state
- 本地版本目录
- 已缓存真实图标/静态资源
- 必要的离线 fallback 图标

当前已验证路线：

- JS 持久目录：`hiker://files/rules/asset-core-local/<app>/b<build>/`
- Runtime JS 执行：海阔原生 `require(file://...)`
- package/state：规则私有文件
- 规则仓库版本目录：`hiker://files/rules/asset-core-local/rule-repo-test/channel_catalog_v2.json`

禁止再使用“规则私有 JS 文件 + 手工 `readFile()+eval()`”作为通用运行时模块机制。RC16 以前的实机已经证明其执行语义与海阔原生 module loader 不完全等价。

### 业务面 Business Plane

仍按业务需要联网：

- 官方网站/API
- 登录/Cookie/Token
- 视频 HLS/DASH
- 漫画图片
- 评论/社区/搜索等业务数据

Local-First 保证的是：**GitHub/CDN 故障不能让已经安装的小程序代码本身打不开。**

## 3. 不可接受的假 Local-First

### 3.1 远程套远程

禁止顶层 Release 已本地化，但模块内部仍运行时下载 JS：

- `fetch(raw...js)`
- `require(remote js)`
- `eval(fetch(remote source))`

迁移前必须递归审计。

黄豆 1.9.0 曾存在 Core 快照与 Detail 基线二次远程加载，因此 Local-First Test2 把这些依赖也纳入本地安装资产。

### 3.2 根 manifest 覆盖程序 channels

版本中心事实优先级：

`程序 channels / 发布时统一 channels 快照 > 根 manifest 摘要`

根 manifest 只做发现、分类、排序和摘要。

### 3.3 详情页临时 hydration

RC20 实机证明：即使单次超时只有 2~3 秒，只要按 Raw/API/CDN 串行在 lazyRule 中获取某个程序的 `channels.json`，最坏会累积到近 8~9 秒，并阻塞返回/点击。

因此从 RC21 开始：

- 版本详情 **零网络**。
- `loadChannelMetaLive / refreshFastChannelCache / load-channels` 正常浏览时只允许访问本地统一目录。
- 仓库端发布统一 `apps/tools/rule-repo/channel_catalog_snapshot.json`。
- 安装/首次打开把不可变快照落本地。
- 用户主动“同步”时才联网更新这一个目录文件。
- 禁止重新引入每程序 N+1 channels 请求。

## 4. 图标合同

图标也是运行资产，不应在卡片渲染时才临时联网。

顺序：

1. 已验证真实本地图标。
2. SVG 本地文本校验后转 data URI。
3. 本地图标缺失时立即生成本地 data URI 占位。
4. 用户主动同步时下载真实图标并覆盖占位。

禁止因为远程图标 URL 慢而让卡片先空白数秒再突然出现。

## 5. 规则仓库统一版本目录

当前文件：

`apps/tools/rule-repo/channel_catalog_snapshot.json`

职责：

- 汇总所有 channel-group 的 Stable/Test/Local/Web 最小可导入信息。
- 包含 channel、version、build、path、mode 等版本中心运行必需字段。
- 发布端更新，不由手机在详情页拼接。
- 手机首次安装只获取一次不可变 snapshot。
- 手机日常详情只读本地 snapshot。
- 主动同步才获取 main 上的新 snapshot。

该目录解决的不是“缓存技巧”，而是把**版本中心从在线查询系统改成本地目录系统**。

## 6. 当前规则仓库试点

Stable：

- 3.5.5 / Build389，冻结。

Test RC21：

- 3.5.6-rc21 / Build411
- Shell 1.0.57-test / `rule_repo_test_v157.txt`
- 本地启动器 `local_shell_loader_v5.js`
- Runtime 基线仍为 RC12 Build402
- Local Module Manager 2.2.0
- Runtime JS 使用 native `require(file://)`
- Runtime manifest 继续内嵌 Bootstrap，不再首启读取 release.json
- 版本中心使用 Single Local Version Catalog

RC19 已实机证明主 Local-First Runtime 能正常启动；RC20 证明前台单程序 channels hydration 仍会卡死；RC21 专门删除该热路径网络依赖。

## 7. 实机回归门禁

规则仓库 RC21 必须验证：

1. 覆盖导入成功。
2. 首次打开建立/读取统一本地版本目录。
3. 第二次打开正常。
4. JavBus / XVideos / 51吃瓜等从未点过的程序详情也应直接显示版本，不出现“正在快速加载版本”长等待。
5. 在版本详情中连续进入/返回不会卡死。
6. 正常版本详情期间抓不到 GitHub/CDN channels 请求。
7. 图标本地已缓存时立即显示；未缓存时立即显示本地占位，不出现空白等待。
8. 主动同步后真实图标和版本目录可更新。
9. 关闭 Wi-Fi/移动数据后仍可打开规则仓库和已缓存版本详情。
10. Runtime 安装/升级失败不破坏旧可用包。

未完成门禁前，禁止推广到所有 Stable。

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

迁移其它程序时必须同时迁移：Runtime、递归代码依赖、版本目录、程序图标/静态 UI 资产；不能只替换 Bootstrap。