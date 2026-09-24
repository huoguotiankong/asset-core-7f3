# MyAv Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Test1-Test11 / Stable0.1.0 / 筛选、索引、磁链与收藏历史已原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界

- Stable：`0.1.0 / Build10112`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `0.1.0`，本轮不修改。
- 当前 Test：`0.1.1-test.2 / Build10202`，**等待海阔实机验证，禁止晋级 Stable**。
- Test2 Shell：`apps/video/myav/myav_remote_test_v2_b10202.txt`，rule version `2026092420`。
- Test2 Release：`apps/video/myav/releases/0.1.1-test.2/release.json`。
- Test2 Entry：`apps/video/myav/releases/0.1.1-test.2/local_entry.js`。
- Test2 业务底座：`0.1.1-test.1 / Build10201` Local-First；本轮采用薄 Overlay，不重建或改写其 Stable-derived 业务链。
- Previous Test：`0.1.1-test.1 / Build10201`，已完成 Local-First Runtime 基础实机确认，完整业务回归未宣称全部通过。
- 数据源：`https://javlist.me/`。
- Shared JAV Playback Stable：`1.0.0-test.4`，Provider：MissAV / 123AV / Jable。

---

## 2026-09-24 · 0.1.1-test.2 / Build10202 · 云盘磁力调用 + 自定义跨小程序搜索

### 用户目标

参考当前 JavDB v3 已验证/在测的调用方式，把 MyAv 的磁力和跨小程序搜索体验统一：

```text
磁力长按：
115
→ 迅雷
→ PikPak
→ 光鸭
→ 123
→ 复制磁链

详情 / 搜索：
当前番号或关键词
→ 用户自定义其它海阔小程序
→ 定向搜索
```

### 架构边界

本轮不重新拼装 Test1 的 28-source Local-First Runtime，也不修改 Stable 0.1.0 的 23 层历史业务模块。采用：

```text
Test2 Shell
→ b10202/local_entry.js
→ immutable Test1 Entry
→ Test1 Local-First Runtime Bundle
→ Test2 薄 Overlay
```

Test2 Overlay 只接管：

1. `C.magnetLongClicks()`；
2. 详情页自定义搜索入口注入；
3. 搜索页自定义搜索入口注入；
4. Settings 中的自定义搜索管理入口；
5. `myavExternalSearch` 管理页。

以下能力继续继承 Test1，不主动重写：
- 有码 / 欧美 / 国产 / 无码频道及 A/B/C/D 相关业务链；
- 登录 / 会话；
- 详情、图片、磁力 Parser；
- 高级筛选、索引、排行、演员；
- 收藏、历史；
- MissAV / 123AV / Jable 第三方播放。

### 磁力长按合同

固定显示：

```text
115 → 迅雷 → PikPak → 光鸭 → 123 → 复制磁链
```

#### 115
使用当前已验证合同：

```text
hiker://page/115Offline?rule=115.简&page=fypage&add=<完整磁链>
```

同时兼容规则名 `115`。

#### 迅雷 / PikPak / 光鸭 / 123
不再只依赖历史写死页面。点击时优先读取当前设备已安装规则：

```text
request('hiker://home@规则名')
```

解析真实 `pages` 后，按目标应用分别寻找 `download / diaoyong / fxlj / magnet / cloudAdd / offline / add` 等可用入口，并把完整磁链通过目标可能使用的 `realurl / url / add / magnet / input / shareurl` 参数传入。

光鸭沿用 JavDB v3 `3.9.54-test.1` 的实机结论：**禁止再次写死 `magnet` page**。优先动态发现当前已安装的 `光鸭云盘 / 光鸭` 真实页面；找不到专用云添加页时退回该规则的定向搜索，同时尝试把磁链写入剪贴板兼容旧版读取方式。

### 自定义跨小程序搜索

本机配置键：

```text
myav_external_search_targets_v1
```

配置只保存在本机，不写入仓库，也不保存 Cookie / Token / Authorization。

调用合同默认使用海阔通用定向搜索：

```text
hiker://search?s=<当前番号或关键词>&rule=<目标规则名>
```

管理页：`myavExternalSearch`。

支持：
- 尝试从当前海阔运行时 `getAppRules()` 读取已安装规则并选择；
- 若当前版本没有返回规则列表，则可手动输入 `显示名|规则名`；
- 只输入一个名称时，显示名和规则名相同；
- 已配置目标可输入关键词试搜；
- 长按目标可删除；
- 详情页用当前番号生成调用按钮；
- MyAv 搜索页第一页用当前搜索词生成调用按钮。

### 不可变引用

- Test2 Entry 首次提交：`9a8db2505e8e76522769ffaa5407aeb747eb71a5`
- Test2 Shell 首次提交：`131c8e03cdc40d6c9a5b1788050f5963ff272fd5`
- Test1 Base Entry：`a59c57bb599a622c53e3ffca689aa94f98636f23`
- Test2 Release：`apps/video/myav/releases/0.1.1-test.2/release.json`
- Test2 本地目录：`hiker://files/rules/asset-core-local/myav-test/b10202/`

### 当前验证状态

代码已完成静态语法检查、Shell JSON 校验和本地 hk 小程序包结构校验，但**这些不能代替海阔实机验证**。

实机必须验证：
1. Test2 身份为 `0.1.1-test.2 / Build10202`；
2. 磁力长按顺序严格为 `115 / 迅雷 / PikPak / 光鸭 / 123 / 复制磁链`；
3. 115 能收到完整磁链并进入离线页；
4. 迅雷、PikPak、光鸭、123 均至少验证当前设备安装版本的真实调用；
5. 光鸭不得再出现“找不到 magnet 这个页面”；
6. 自定义搜索目标可添加、试搜、删除；
7. 详情页按当前番号调用目标小程序搜索；
8. MyAv 搜索页按当前关键词调用目标小程序搜索；
9. 首页、搜索、高级筛选、索引、演员、排行、详情、图片、收藏、历史无回归；
10. 如账号/第三方播放当前可用，回归登录以及 MissAV / 123AV / Jable。

若 Test2 发现问题，冻结本版本并创建更高 Test build 修复，禁止原地覆盖 `0.1.1-test.2` 的不可变文件赌缓存刷新。

---

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Local-First 基础实机确认

用户海阔实机截图确认：
- 页面标题：`MyAv · 本地化诊断`；
- 版本：`0.1.1-test.1 / Build10201`；
- `本地 Runtime 已就绪`；
- Source 前缀：`15bec4419cfd`；
- 本地闭包：`28 源`；
- Runtime：`152195 bytes`；
- 可见 `共享播放SDK / 应用图标 / 业务基线` 状态卡。

该证据只证明 Local-First 本地包构建、写入、回读和 Runtime 加载主链正常，不等于筛选、磁力、Provider、账号全部逐项实机通过。

### Test1 稳定执行闭包

Test1 固定：

```text
23 个 Stable MyAv 业务模块（原顺序）
+ Local-First final overlay
+ Shared JAV Playback 1.0.0-test.2 base
+ Shared JAV Playback 1.0.0-test.4 Stable overlay
+ 123AV SVG
+ MyAv app icon SVG
= 28 sources
```

23 层业务顺序继续冻结：

```text
Core
→ Image Patch2
→ Core Patch3/4/5/6/9/10/11
→ Runtime
→ Runtime Patch2
→ UI Patch3/4/5
→ UI6 A/B/C
→ Version Patch7
→ UI Patch8/9/10/11
→ Stable Patch
```

正常二次启动使用本地 Entry + `require(file:// runtime_bundle.js)`，不再加载 Stable/Test Bootstrap、Remote Manager、远程业务 Runtime 或远程 Shared Playback Manager。

---

## 恢复与回退

- 正式恢复入口：Stable `0.1.0 / Build10112`。
- 当前增强 Test：`0.1.1-test.2 / Build10202`。
- 已完成 Local-First 基础实机确认的上一 Test：`0.1.1-test.1 / Build10201`。
- `0.1.0-test.11 / Build10111` 保留为 Stable0.1.0 晋级来源，但不再作为新 Test 直接开发基线。

## 长期不可回退事实

- 高级筛选必须保持结果 URL 与完整 Ttype=2 控制 URL 分离；不能再次从筛选结果页直接重建完整控制区。
- 九类分类索引动态发现优先、固定兜底继续保留。
- 详情元数据只在影片资料作用域解析，禁止再次把站点导航/广告词当演员、系列或 TAG。
- 影片收藏与演员收藏必须使用独立排版 key。
- 导入 Shell 保持中性页面名，避免复发平台违禁词扫描事故。
- Local-First 完成定义包含传递依赖、静态仓库资产和点击回调重入，不是“顶层 Runtime 已在本地”即可。
- 磁力云盘调用必须以目标小程序当前实机页面/参数合同为准；已被实机证伪的固定路由不得重新写回。
- 新磁力/搜索增强优先使用薄 Overlay，不为单点功能无必要重写 Stable-derived 主业务链。

## 历史

- Local-First 前完整历史：`apps/video/myav/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
