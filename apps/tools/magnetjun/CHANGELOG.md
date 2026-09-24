# 磁力君.简 Changelog

> 本程序于 2026-09-25 首次纳入 `asset-core-7f3@main` 正式版本治理。恢复事实优先级：用户当前实机结果 > 当前 Shell/Release/源码 > 本文件 > registry/channels > 历史测试包。

## 当前活动边界

- 应用显示名：`磁力君.简`，**不再出现“测试”后缀**。
- 当前 Test：`1.0.0-test.1 / Build10101`。
- 当前尚未建立 Stable；Test1 必须先经过海阔实机验证。
- Shell：`apps/tools/magnetjun/magnetjun_remote_test_v1_b10101.txt`，rule version `2026092501`。
- Release：`apps/tools/magnetjun/releases/1.0.0-test.1/release.json`。
- Runtime：`apps/tools/magnetjun/releases/1.0.0-test.1/local_entry.js`。

## 2026-09-25 · 1.0.0-test.1 / Build10101 · 首次纳管重构

### 基线来源

真实业务基线是用户上传并正在实机使用的：

`磁力君.简.hk小程序.zip`

该包内 `rule.json` 的应用标题本身为 `磁力君.简`，规则壳版本 `20250604`，包含 13 个历史页面；不是仓库里已有的同名项目。

原测试包的默认搜索源代码来自 ApolloRioo/R 的 `Hiker/磁力君.简`。本轮确认其最后一次对应更新提交为：

`5f652b003410a8518d2879b3e99db2d27ef6bc43`

适配器内部 version 为 `20250608`。

### 已确认旧问题

#### 1. 外部搜索参数没有稳定进入搜索页

旧 `searchFind`：
- 能把外部关键词放进页面标题和 `extra.searchTerms`；
- 但 `sou` 搜索页真正启动搜索依赖 `MY_PARAMS.searchTerms / getParam('searchTerms')`；
- 在当前海阔实机中会出现“标题已经显示搜索 MIDV-855，但搜索框为空、没有自动开始搜索”。

因此不能把 `extra.searchTerms` 当成稳定的跨小程序搜索合同。

#### 2. 旧版程序每天会检查上游 master 并覆盖本地程序代码

旧 `preRule` 会读取 Apollo 路径并在版本变化时直接覆盖：

`hiker://files/rules/Apollo/<MY_RULE.title>.js`

这会让我们自己的修复被上游变化重新覆盖，也不符合当前项目的版本治理要求。

### Test1 架构调整

新的运行链：

```text
磁力君.简 Shell
→ immutable local_entry.js
→ 我们自己的 Search/UI/Handoff Runtime
→ 搜索适配器固定基线
```

本轮不再跟随上游 `master` 自动更新。默认适配器基线固定到 `5f652b...`，首次加载后缓存到：

`hiker://files/rules/asset-core-local/magnetjun/legacy_adapters_20250608.js`

如果设备原先已经存在：

`hiker://files/rules/LoyDgIk/ciliSimpleRules.json`

会优先兼容读取，避免用户原来的规则配置立即丢失。

### 外部搜索标准合同

主合同：

```text
hiker://page/magnetSearch?rule=磁力君.简&page=fypage&searchTerms=<关键词>
```

搜索页同时兼容读取：
- `MY_PARAMS.searchTerms`
- `searchTerms`
- `s`
- `kw`
- `q`

用于 MyAv / JavDB / 其它海阔小程序直接传入番号或关键词并自动开始聚合搜索。

### 云盘/磁链调用

默认打开方式可选：

```text
PikPak
115
迅雷
光鸭
123
复制磁链
查询元数据
海阔视界
```

其中：
- 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
- PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encoded magnet>`
- 115：`hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>`
- 光鸭：优先识别已安装规则，找不到专用页面时使用定向搜索/剪贴板兼容；后续按实机继续收紧合同。
- 123：当前保留动态/搜索兼容，需实机继续确认当前安装版本的最佳 page 合同。

搜索结果支持长按直接选择 `115 / 迅雷 / PikPak / 光鸭 / 123 / 复制磁链`。

### 搜索与 UI

- 保留“聚合 / 精准”搜索模式。
- 首页直接承担主搜索任务，不再把调试/技术信息放在首屏。
- 搜索源使用横向按钮切换。
- 增加搜索历史。
- 增加搜索源启用/禁用管理页。
- 搜索失败不再因为最后一个并发任务为空而误判整批结果为空。
- 搜索源异常不阻塞其它来源返回。

### 实机验收

Test1 必须至少验证：
1. 首页能正常打开，标题只显示 `磁力君.简`；
2. 手工输入 `MIDV-855` 能自动聚合搜索；
3. `hiker://page/magnetSearch?...&searchTerms=MIDV-855` 进入后搜索框直接带入并自动开始搜索；
4. MyAv 自定义搜索可直接跳入并得到结果；
5. 聚合/精准切换正常；
6. 单个搜索源筛选正常；
7. 搜索源管理可启停来源；
8. PikPak / 115 / 迅雷至少各验证一次；
9. 搜索结果长按云盘菜单正常；
10. 旧版已有 `ciliSimpleRules.json` 的设备不会因为升级立即丢失原配置。

未完成上述实机闭环前禁止建立 Stable。
