# 磁力君.简 Changelog

> 本程序于 2026-09-25 首次纳入 `asset-core-7f3@main` 正式版本治理。真实业务基线是用户上传并正在实机使用的独立 `磁力君.简.hk小程序.zip`，不是仓库中已有的同名项目。事实优先级：用户当前实机结果 > 当前 Shell/Release/源码 > 本文件 > registry/channels > 历史测试包。

## 当前活动边界

- 应用显示名：`磁力君.简`，**不出现“测试”后缀**；Test 只属于版本通道语义。
- 当前 Test：`1.0.0-test.2 / Build10102`，是首次交付用户实机验证的纳管版本。
- `1.0.0-test.1 / Build10101`：实机前废弃，不作为恢复基线。
- 当前尚未建立 Stable；Test2 未完成海阔实机闭环前禁止建立/切换 Stable。
- Test2 Shell：`apps/tools/magnetjun/magnetjun_remote_test_v2_b10102.txt`，rule version `2026092502`。
- Test2 Release：`apps/tools/magnetjun/releases/1.0.0-test.2/release.json`。
- Test2 Runtime：`apps/tools/magnetjun/releases/1.0.0-test.2/local_entry.js`。

---

## 2026-09-25 · 1.0.0-test.2 / Build10102 · 自包含正式纳管基线

### 为什么 Test1 没有交付实机

Test1 已经移除了旧版每天从上游 `master` 自动覆盖程序代码的机制，但默认搜索适配器仍计划从一个固定外部提交加载可执行代码。虽然该提交不可变，仍不符合当前项目“`asset-core-7f3@main` 是唯一正式运行代码源”的边界。

因此在用户实机测试前主动废弃 Test1，创建 Test2：

```text
磁力君.简 Shell
→ asset-core-7f3@main immutable Runtime
→ 内置常用搜索适配器
→ 本机旧配置迁移层（如存在）
```

新的正式 Runtime 不再执行 ApolloRioo/R 的远程搜索适配器代码。

### 真实旧包基线

用户上传包：`磁力君.简.hk小程序.zip`

已确认：
- `rule.json` 应用标题本身就是 `磁力君.简`；
- 旧规则壳 version `20250604`；
- 历史页面包含搜索、网页浏览、规则管理/编辑/导入、番号匹配、磁力查询等；
- 旧默认搜索源曾来自 ApolloRioo/R，最后对应更新提交 `5f652b003410a8518d2879b3e99db2d27ef6bc43`，内部 version `20250608`；该信息只作为迁移来源事实，不再作为正式运行依赖。

### Test2 内置搜索源

首次自包含版本优先收进一组常用来源，后续根据实机可用率继续增删/修复：

```text
BTDigg
BT4G
磁力多
搜番
磁力酷
磁力狐
东京图书馆
SOBT
BTSOW
磁力发
磁力地球
```

如果设备已经存在旧版：

`hiker://files/rules/LoyDgIk/ciliSimpleRules.json`

Test2 会优先尝试兼容读取，避免原测试小程序已有的本地源配置升级后立即丢失。设置中的“恢复内置源”用于从旧配置回到 Test2 内置基线。

### 外部搜索根因与标准合同

MyAv 实机调用旧磁力君时已经确认：页面标题能收到 `MIDV-855`，但搜索框为空、不会自动搜索。

根因不是 MyAv 没有传关键词，而是旧 `searchFind` 主要把关键词放在 `extra.searchTerms`，而真正搜索页依赖 `MY_PARAMS.searchTerms / getParam('searchTerms')`。当前海阔环境并不保证这个 `extra` 自动成为目标页面 URL 参数。

Test2 固定标准合同：

```text
hiker://page/magnetSearch?rule=磁力君.简&page=fypage&searchTerms=<关键词>
```

搜索页兼容读取：
- `MY_PARAMS.searchTerms`
- URL `searchTerms`
- `s`
- `kw`
- `q`

因此 MyAv / JavDB / 其它海阔小程序可以直接传入番号并自动开始搜索。

### 搜索产品结构

- 首页就是主搜索页，不再把调试信息放在首屏。
- 支持“聚合 / 精准”模式。
- 支持横向来源切换，点击某来源可单源搜索。
- 增加最近搜索历史。
- 增加独立搜索源管理页，可启用/禁用来源。
- 并发搜索改为累计结果统计，避免旧实现因最后一个来源为空而错误显示“无结果”。
- 单个来源失败不会阻塞其它来源返回。

### 磁链与云盘调用

默认打开方式：

```text
PikPak / 115 / 迅雷 / 光鸭 / 123 / 复制磁链 / 查询元数据 / 海阔视界
```

已沿用当前项目实机确认合同：
- 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
- PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encoded magnet>`
- 115：`hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>`，兼容规则名 `115`
- 光鸭 / 123：当前保留安装检测与兼容路由，继续根据用户当前安装版本实机收紧。

搜索结果支持长按：

`115 / 迅雷 / PikPak / 光鸭 / 123 / 复制磁链`

### Test2 实机验收

必须至少验证：
1. 覆盖安装后应用名称只显示 `磁力君.简`；
2. 首页正常打开，不出现旧“测试”名称；
3. 手工输入 `MIDV-855` 能开始聚合搜索并出现真实结果；
4. MyAv 自定义搜索进入磁力君后，搜索框直接带入 `MIDV-855` 并自动搜索；
5. 聚合/精准切换正常；
6. 单个搜索源筛选正常；
7. 搜索源启停正常；
8. PikPak / 115 / 迅雷各至少实机验证一次；
9. 结果长按云盘菜单正常；
10. 原设备若存在 `ciliSimpleRules.json`，升级后旧配置兼容符合预期。

---

## 2026-09-25 · 1.0.0-test.1 / Build10101 · 未交付的首次纳管草案

Test1 完成了应用命名、外部搜索、云盘调用、搜索历史和源管理的第一轮重构，并移除了旧版每日自动覆盖代码的更新链。但由于仍存在固定外部可执行适配器依赖，在实机交付前主动被 Test2 取代。

**不可作为 Stable/恢复基线，也不需要用户安装测试。**
