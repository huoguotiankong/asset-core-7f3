# MyAv Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Test1-Test11 / Stable0.1.0 / 筛选、索引、磁链与收藏历史已归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界

- Stable：`0.1.0 / Build10112`，继续冻结。
- Latest：仍指向 Stable `0.1.0`，不修改。
- 当前 Test：`0.1.1-test.4 / Build10204`，等待海阔实机验证。
- Test4 Shell：`apps/video/myav/myav_remote_test_v4_b10204.txt`，rule version `2026092501`。
- Test4 Release：`apps/video/myav/releases/0.1.1-test.4/release.json`。
- Test4 Entry：`apps/video/myav/releases/0.1.1-test.4/local_entry.js`。
- Test4 业务底座：`0.1.1-test.3 / Build10203`。
- Test3 已由用户实机确认：磁链调用云盘小程序播放可以正常工作；自定义搜索仍不完整。
- 数据源：`https://javlist.me/`。
- Shared JAV Playback：MissAV / 123AV / Jable 继续继承既有 Local-First 业务链，本轮不改。

---

## 2026-09-25 · 0.1.1-test.4 / Build10204 · 页面型跨小程序搜索适配

### 实机现象

用户在 MyAv 详情页用番号 `MIDV-855` 调用已配置的 `磁力君.简`：

- 能成功打开 `磁力君.简`；
- 页面标题显示 `搜索MIDV-855`；
- 搜索输入框为空；
- 没有自动开始搜索。

这证明 MyAv → 目标规则的跨程序跳转和关键词已经到达页面级上下文，但目标搜索页没有从通用 `hiker://search` 链取得实际搜索参数。

### 磁力君.简源码确认

用户上传的 `磁力君.简.hk小程序.zip` 中：

```text
search_url = hiker://empty?searchTerms=**
searchFind -> hiker://page/sou#noHistory#?p=fypage
```

`searchFind` 只把关键词放在 item `extra.searchTerms` 和 `pageTitle` 中；而 `sou` 页面真正用于执行搜索的是：

```js
let s = getMyVar('s', '')
     || MY_PARAMS.searchTerms
     || decodeURIComponent(getParam('searchTerms', ''));
```

当前实机链路中，`extra.searchTerms` 没有变成 `sou` 页可读取的 `MY_PARAMS.searchTerms / getParam('searchTerms')`，所以出现“标题有关键词、输入框为空、未搜索”。

### Test4 修复

MyAv 不再假设所有目标小程序都兼容同一个 `hiker://search` 合同，而增加搜索适配层：

```text
读取 hiker://home@目标规则
→ 解析 search_url + pages
→ 若 search_url 包含 searchTerms=** 且存在 sou/搜索页
→ 直接调用页面型搜索
→ 否则继续走标准 hiker://search
```

`磁力君.简` 当前直接使用：

```text
hiker://page/sou?rule=磁力君.简&p=fypage&searchTerms=<encoded keyword>
```

注意：
- `rule=磁力君.简` 保持原始中文规则名，禁止再次 URL 编码；
- 只编码 `searchTerms` 业务参数；
- `myav_external_search_targets_v1` 本机配置继续保留；
- 详情页和 MyAv 搜索页已有目标按钮会被 Test4 二次改写为适配后的真实搜索 URL；
- 自定义搜索管理页的“输入关键词测试”同步使用同一适配逻辑。

### 架构边界

Test4 是 Test3 上的薄 Overlay，只处理自定义搜索：

```text
Test4 Shell
→ Test4 local_entry
→ immutable Test3 Entry
→ Test3/Test2/Test1 Local-First Runtime
→ Test4 Search Adapter
```

不修改：
- 磁力 Parser；
- 115 / 迅雷 / PikPak / 光鸭 / 123 调用链；
- 登录；
- A/B/C/D 业务线路；
- 详情、筛选、索引、收藏、历史；
- MissAV / 123AV / Jable 播放。

### 实机验收

1. 覆盖导入 Test4 后仍能正常打开 MyAv。
2. 详情页点击 `磁力君.简` 后，目标页输入框应直接显示当前番号。
3. 页面进入后应直接开始搜索，不再停留“输入关键词开始搜索”。
4. 自定义搜索管理页给 `磁力君.简` 输入测试关键词，同样应直接搜索。
5. 再测试一个普通目标，确认标准 `hiker://search` fallback 未退化。
6. 回归一条磁链，确保 Test3 已验证可用的云盘调用没有被本轮影响。

---

## 2026-09-24 · 0.1.1-test.3 / Build10203 · 中文规则名路由修复

### Test2 实机失败

Test2 把跨规则 `rule=` 做了 `encodeURIComponent`，海阔实机直接把 `%E...` 当成规则名，出现：

```text
找不到“115.%E7%AE%80”这个小程序
找不到“%E8%BF%85%E9%9B%B7”这个小程序
找不到“%E7%A3%81%E5%8A%9B%E5%90%9B.%E7%AE%80”的搜索引擎
```

与 `docs/INCIDENT_CHINESE_RULE_ROUTE_ENCODING_20260823.md` 完全一致。

### Test3 修复

- 中文/含中文规则名在 `rule=` 中保持原始值。
- 迅雷按上传包真实合同：
  `hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`。
- PikPak 按上传包真实合同：
  `hiker://page/fxlj?rule=PikPak&realurl=<encoded magnet>`。
- 115 使用已验证合同：
  `hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>`。
- 光鸭继续动态读取已安装规则 pages，但规则名不再编码。
- 自定义搜索先修正为原始规则名。

### Test3 当前实机结论

用户 2026-09-25 明确反馈：**磁链调用播放可以了**。因此 Test3 的云盘磁链交接可作为当前已验证事实保留；不要因后续修搜索而改回 Test2 逻辑。

自定义搜索仍未完成，已由 Test4 单独处理。

---

## 2026-09-24 · 0.1.1-test.2 / Build10202 · 云盘磁力调用 + 自定义搜索初版

Test2 首次增加：

```text
磁力长按：115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链
详情 / 搜索：当前番号或关键词 → 本机配置的其它海阔小程序
```

本机配置键：

```text
myav_external_search_targets_v1
```

配置只保存在本机，不包含 Cookie / Token / Authorization。

Test2 的主要教训：跨规则中文 `rule=` 不得照搬普通 URL 编码习惯；业务参数与规则标识必须分开处理。

---

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Local-First 基础实机确认

用户实机确认：
- `0.1.1-test.1 / Build10201`；
- 本地 Runtime 已就绪；
- 28 sources；
- Runtime 152195 bytes；
- Shared Playback / 本地图标 / 业务基线状态可见。

这只证明 Local-First 本地包构建、写入、回读和 Runtime 加载主链正常，不等于所有业务逐项通过。

Test1 固定本地闭包：

```text
23 个 Stable MyAv 业务模块
+ Local-First final overlay
+ Shared JAV Playback 1.0.0-test.2 base
+ Shared JAV Playback 1.0.0-test.4 overlay
+ 123AV SVG
+ MyAv app icon SVG
= 28 sources
```

---

## 恢复与回退

- 正式恢复入口：Stable `0.1.0 / Build10112`。
- 当前 Test：`0.1.1-test.4 / Build10204`。
- 磁链云盘调用已实机通过基线：`0.1.1-test.3 / Build10203`。
- Local-First 基础 Runtime 实机确认基线：`0.1.1-test.1 / Build10201`。
- 任一 Test 出现新回归时冻结该 build，新建更高 Test，禁止原地覆盖不可变 Entry/Shell 赌缓存刷新。

## 长期不可回退事实

- 高级筛选保持结果 URL 与完整 Ttype=2 控制 URL 分离。
- 九类分类索引动态发现优先、固定兜底保留。
- 详情元数据只在影片资料作用域解析。
- 影片收藏与演员收藏使用独立排版 key。
- Local-First 完成定义包含传递依赖、静态资产和点击回调重入。
- 云盘磁力调用以目标小程序当前实机/源码合同为准。
- 中文规则名放在 `rule=` 时禁止百分号编码；只编码业务参数。
- 跨小程序搜索不能假设所有规则都兼容标准 `hiker://search`；页面型搜索应建立 Adapter/Contract。
- 新磁力/搜索增强优先使用薄 Overlay，不为单点功能重写 Stable-derived 主业务链。

## 历史

- Local-First 前完整历史：`apps/video/myav/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
