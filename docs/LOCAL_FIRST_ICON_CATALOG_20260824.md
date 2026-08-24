# Local-First 图标目录交付规范（2026-08-24）

## 目标

Local-First 不只缓存 JS Runtime 和版本元数据。程序图标同样属于运行资产，正常首页/分类/搜索/版本详情不得因为图标而逐项访问 GitHub、CDN、favicon 或第三方图片站。

## 禁止做法

- 禁止首页渲染时直接把远程 `icon` URL 交给每张程序卡。
- 禁止普通“同步”串行执行 N 个 `downloadFile()` 图标下载。
- 禁止因为单个 favicon、CloudFront 或图片站超时而阻塞整个仓库页面。
- 禁止用“fileExist=true”直接认定 SVG 是有效图标；错误响应可能被保存成文本文件。

## 推荐架构

1. 发布端生成统一 `icon_catalog_snapshot.json`，以 `program id` 为键保存体积受控、已验证的本地图标描述。
2. 小型 SVG 优先直接写入 catalog；客户端转换为 `data:image/svg+xml`，避免二进制文件/编码差异。
3. 首次安装可在不可变 Scheduler/Bootstrap 内嵌一份基础图标包，保证首开不依赖额外图标网络请求。
4. 主动轻同步时，将根 manifest、统一版本目录、统一图标目录作为少量独立 JSON 并行刷新；图标目录失败时继续使用旧本地包，不清空现有资产。
5. 浏览热路径读取顺序：已验证真实本地文件 → 本地图标 catalog → 内嵌安全兜底；不得回退到远程 URL。
6. 如果后续需要恢复官方 PNG/JPG，应由发布流程提前归一化/压缩后进入单一资产包或仓库自有静态资产，不重新引入 N+1 在线图标请求。

## RC24 试点

“我的规则仓库” Test 3.5.6-rc24 / Build414 首次采用该合同：`icon_catalog_snapshot.json` 约 11KB，覆盖当前根云仓全部程序；`sync_scheduler_v4.js` 内嵌基础包并维护本地 `icon_catalog_v1.json`。RC23 已实机确认的 Standalone Light Sync、Build402 Runtime 和版本详情零网络机制保持不变。

## 验证门禁

- 首次进入首页时全部程序卡立即有图标，不出现空白等待远程图片。
- 退出重进后图标仍即时显示。
- 轻同步时间不因程序数量或外部图标站点增加而线性增长。
- 断 GitHub/断第三方图标域名时，已有本地图标仍完整显示。
- 图标包更新失败不得删除或污染上一份已验证本地图标目录。
