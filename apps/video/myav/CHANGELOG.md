# MyAv Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Test1-Test11 / Stable0.1.0 / 筛选、索引、磁链与收藏历史已归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界

- Stable：`0.1.0 / Build10112`，继续冻结。
- Latest：仍指向 Stable `0.1.0`，不修改。
- 当前 Test：`0.1.1-test.5 / Build10205`，等待海阔实机验证。
- Test5 Shell：`apps/video/myav/myav_remote_test_v5_b10205.txt`，rule version `2026092504`。
- Test5 Release：`apps/video/myav/releases/0.1.1-test.5/release.json`。
- Test5 Entry：`apps/video/myav/releases/0.1.1-test.5/local_entry.js`。
- Test5 业务底座：`0.1.1-test.4 / Build10204`。
- Test3 已由用户实机确认：磁链调用云盘小程序播放可以正常工作；后续搜索/UI Overlay 不得破坏该链。
- 数据源：`https://javlist.me/`。
- Shared JAV Playback：MissAV / 123AV / Jable 继续继承既有 Local-First 业务链，本轮不改。

---

## 2026-09-25 · 0.1.1-test.5 / Build10205 · JavDB 风格自定义搜索位置与图标

### 用户实机目标

用户当前 MyAv 详情截图确认：旧自定义搜索位于影片资料/标签区域之后，和“快捷操作”相距较远；JavDB v3 当前实机中，自定义搜索紧跟在快捷操作之后，并以小程序图标卡展示目标站点。

本轮产品目标：

```text
在线播放
→ 快捷操作
→ 自定义搜索（图标卡）
→ 简介 / 原站预览 / 影片资料
```

### 根因与结构

MyAv Stable 详情本身已有：

```text
▌ 快捷操作
磁力 / 预览 / 收藏 / 原站
```

四项使用 `icon_small_4`。

Test2 初版自定义搜索注入时尝试寻找旧的 `▌ 档案` 标记；当前详情实际使用的是 `▌ 影片资料`，因此没有命中插入点，最终被追加到详情数组末尾。Test5 不再依赖这个过期标记，而是：

1. 先移除旧 `▌ 自定义搜索` 区块；
2. 定位 `▌ 快捷操作`；
3. 跳过其后的快捷操作图标；
4. 在下一个详情 section 之前插入新的自定义搜索区块。

### 自定义搜索展示

默认样式：

```text
icon_round_small_4
```

同时提供：

```text
icon_small_4
```

作为可切换样式。

详情页和 MyAv 搜索页中的自定义目标都使用图标卡；目标标题仍显示配置的显示名。

### 新配置合同

继续复用本机 key：

```text
myav_external_search_targets_v1
```

对象 schema 从：

```json
{"name":"磁力君.简","rule":"磁力君.简"}
```

向后兼容扩展为：

```json
{"name":"磁力君.简","rule":"磁力君.简","icon":"<图片链接>"}
```

管理页输入格式参照 JavDB v3：

```text
显示名@@小程序名@@图片链接
```

仍兼容此前 MyAv 使用的：

```text
显示名|规则名
```

因此已经配置的 `磁力君.简` 不要求用户重新添加。

### 图标解析顺序

```text
显式配置 icon URL
→ 当前已安装目标小程序 home_rule.icon / pic_url / img / pic
→ 磁力类目标使用 MyAv magnet.svg 兜底
→ 当前应用/搜索图标兜底
```

自动发现的目标图标会做本机缓存，减少详情页重复读取目标规则。

### 管理页

`myavExternalSearch` 现在支持：

- 当前目标数量与展示样式；
- 目标图标预览；
- `＋ 添加`；
- `✎ 修改`；
- `− 删除`；
- `↕ 排序`：最前 / 上移 / 下移 / 最后；
- `icon_round_small_4 / icon_small_4` 样式切换；
- 清空全部；
- 旧配置无损读取。

### 搜索路由边界

Test5 **不重写** Test4 的搜索 Adapter。

仍然执行：

```text
目标 search_url 含 searchTerms=** 且存在 sou/搜索页
→ page 型搜索

其它目标
→ hiker://search
```

其中 `磁力君.简` 继续使用：

```text
hiker://page/sou?rule=磁力君.简&p=fypage&searchTerms=<encoded keyword>
```

中文规则名仍保持原始值，禁止再次对 `rule=` 做百分号编码。

### 不变边界

本轮只改自定义搜索 UI/本机配置 schema，不修改：

- 磁力 Parser；
- 115 / 迅雷 / PikPak / 光鸭 / 123 调用；
- 登录；
- A/B/C/D 线路；
- 详情解析；
- 高级筛选、索引、演员、排行；
- 收藏、历史；
- MissAV / 123AV / Jable 播放。

### 不可变引用

- Test5 Entry：`e172090ffefcd96bf263ba484091cf40f0ea7d68`
- Test5 Shell：`f358f1f7e0d835d93daa73179c0e52c28ffd119e`
- Test5 Release：`apps/video/myav/releases/0.1.1-test.5/release.json`
- Test5 本地目录：`hiker://files/rules/asset-core-local/myav-test/b10205/`
- 云口令入口：`cloud/myav/v0.1.1-test.5/import_test5_direct.js`

### 实机验收

1. 详情页“自定义搜索”必须紧跟“快捷操作”图标组之后。
2. 原来位于标签/影片资料底部的旧自定义搜索区块必须消失，不能重复显示。
3. 已保存的 `磁力君.简` 继续存在。
4. 图标正常显示；若自动图标不理想，可用“修改”补充自定义图片链接。
5. `显示名@@小程序名@@图片链接` 可以新增目标。
6. 修改、删除、排序、清空可正常执行。
7. 点击 `磁力君.简` 仍按 Test4 页面型搜索合同带当前番号搜索。
8. 回归至少一条磁链，确认 Test3 已实机通过的云盘调用没有回归。

未完成上述截图闭环前禁止晋级 Stable。

---

## 2026-09-25 · 0.1.1-test.4 / Build10204 · 页面型跨小程序搜索适配

用户实机确认 Test3 调用 `磁力君.简` 时：目标页标题已收到 `MIDV-855`，但输入框为空且没有自动搜索。上传包源码确认其 `sou` 页实际读取 `MY_PARAMS.searchTerms / getParam('searchTerms')`。

Test4 因此增加签名感知搜索 Adapter：

```text
读取 hiker://home@目标规则
→ search_url + pages
→ searchTerms=** + sou/搜索页
→ 直接 page 搜索
→ 否则 hiker://search
```

`磁力君.简` 固定使用：

```text
hiker://page/sou?rule=磁力君.简&p=fypage&searchTerms=<encoded keyword>
```

Test4 不碰 Test3 的磁力云盘调用。

---

## 2026-09-24 · 0.1.1-test.3 / Build10203 · 中文规则名路由修复

Test2 把中文 `rule=` 百分号编码后，实机出现：

```text
找不到“115.%E7%AE%80”这个小程序
找不到“%E8%BF%85%E9%9B%B7”这个小程序
找不到“%E7%A3%81%E5%8A%9B%E5%90%9B.%E7%AE%80”的搜索引擎
```

Test3 改为：

- 中文规则名在 `rule=` 中保持原始值；
- 迅雷：`diaoyong?rule=迅雷&page=fypage#<magnet>`；
- PikPak：`fxlj?rule=PikPak&realurl=<encoded magnet>`；
- 115：`115Offline?rule=115.简&page=fypage&add=<encoded magnet>`；
- 光鸭动态读取当前已安装 pages。

用户随后明确反馈：**磁链调用播放可以了**。该结论是后续版本不可回退基线。

---

## 2026-09-24 · 0.1.1-test.2 / Build10202 · 云盘磁力调用 + 自定义搜索初版

首次增加：

```text
磁力长按：115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链
详情 / 搜索：当前番号或关键词 → 本机配置其它海阔小程序
```

配置 key：`myav_external_search_targets_v1`。

主要教训：业务 URL 参数可以编码，但海阔跨规则 `rule=` 的中文规则名不能照普通 URL 参数处理。

---

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Local-First 基础实机确认

用户实机确认：

- `0.1.1-test.1 / Build10201`；
- 本地 Runtime 已就绪；
- 28 sources；
- Runtime 152195 bytes。

这只证明 Local-First 本地包构建、写入、回读和 Runtime 加载主链正常，不等于所有业务逐项通过。

---

## 恢复与回退

- 正式恢复入口：Stable `0.1.0 / Build10112`。
- 当前 Test：`0.1.1-test.5 / Build10205`。
- 自定义搜索路由底座：`0.1.1-test.4 / Build10204`。
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
- 跨小程序搜索不能假设所有规则都兼容标准 `hiker://search`；页面型搜索必须走 Adapter/Contract。
- 自定义搜索目标配置必须向后兼容；新增图标字段不能让旧 `name/rule` 配置失效。
- 新磁力/搜索增强优先使用薄 Overlay，不为单点功能重写 Stable-derived 主业务链。

## 历史

- Local-First 前完整历史：`apps/video/myav/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
