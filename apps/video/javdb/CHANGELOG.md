# JavDB v3 Changelog

> **定位：程序级长期技术记忆。** 后续开发/优化 JavDB v3 前，必须先读三份全局文档，再读本文件、`apps/video/javdb/channels.json`、当前 Stable/Test/Local 入口和对应运行代码。只记录已验证事实；未知协议/解密信息必须标记待确认，禁止从旧聊天记忆猜测。

## 当前基线

- 程序：JavDB v3
- App ID：`javdb-v3`
- Stable：`3.9.42` / build `2026082301` / Remote
- Stable 入口：`cloud/javdb/v3.9.42/javdb_v3.9.42_cloud.txt`
- Stable Release：`apps/video/javdb/releases/3.9.42/release.json`
- Previous Stable：`3.9.41` / build `2026082006` / `cloud/javdb/v3.9.41/javdb_v3.9.41_cloud.txt`
- Test：`3.9.42-test.5` / build `2026082245` / 已晋级 Stable 3.9.42，保留用于对照
- 上一已验证启动/UI 基线：`3.9.42-test.3` / build `2026082243`
- 上一已验证分类/排行/演员总体基线：`3.9.42-test.1` / build `2026082241`
- 已知失败 Test：`3.9.42-test.2` / build `2026082242`（首页启动 `ReferenceError: JDB 未定义`）
- 预发布冻结 Test：`3.9.42-test.4` / build `2026082244`（其声明的共享 SDK test.3 在最终回读时发现导出作用域风险，不作为用户测试入口）
- Local：`3.9.41-local` / build `2026082103` / Pure Local
- Local 构建：`cloud/javdb/v3.9.41/release_meta.json` + `runtime.js`
- 当前通道元数据：`apps/video/javdb/channels.json`
- Stable 元数据：`apps/video/javdb/stable.json`
- Latest 元数据：`apps/video/javdb/latest.json`
- 共用 JAV 播放 Manager：`shared/jav-playback/manager.js`
- 共用播放 Stable 指针：`shared/jav-playback/channels.json -> stable -> releases/1.0.0-test.4/index.js`
- 最后登记日期：2026-08-23

## 关键技术索引

### 数据源 / API / 页面解析

- 分类影片类型已确认：`0=有码`、`1=无码`、`2=欧美`、`3=FC2`、`4=动漫`。
- 分类标签字典：`GET /api/v2/tags?type={0..4}`；返回按 `category_id` 分组的完整动态标签，不手工维护静态标签全集。
- 分类影片：`GET /api/v1/movies/tags`；已验证 `filter_by` 基本结构为 `{type}:t:{main}:{extra}:{year}:{duration}:{month}`。
- 分类基本条件：`p=可播放`、`m=可下载`、`c=含字幕`、`s=单体影片`、`i=含预览图`、`v=含预览视频`。
- 普通高级标签位 `extra` 支持跨分组多选并表现为交集；年份/月只按已验证单值处理，时长 UI 保持单选。
- 分类排序：`update`、`release desc/asc`、`score`、`hit`、`want_watch_count`、`watched_count`。
- 热播榜：`GET /api/v1/rankings/playback?filter_by=all|high_score&period=daily|weekly|monthly`。
- 普通影片榜：`GET /api/v1/rankings?type={0..3}&period=daily|weekly|monthly`。
- 演员榜：`GET /api/v1/rankings/actors?type=...&filter_by=daily|weekly|monthly`。
- 演员推荐：`GET /api/v1/actors/recommend` 返回 `new_actors`、`monthly_actors`、`recommend_actors`，对应 APP 的“新人 / 月排名 / Fanza(DMM)推荐”。
- 演员列表：`GET /api/v1/actors?type=...&page=...`。
- **2026-08-23 实机进一步校正演员分类：Test1/Test3 的 UI `无码` 与 `欧美(女)` 映射写反。截图中 UI `无码`（tab=2）返回 Mia Malkova / Lana Rhoades / Lena Paul 等欧美演员；UI `欧美(女)`（tab=3）返回日文名演员。因此 3.9.42 对演员列表请求定点交换：UI tab2 → API type3，UI tab3 → API type2。有码女/有码男/欧美男保持原映射。此修正只作用 `/api/v1/actors`，不改影片分类 type 与排行榜。**
- 影片详情已具备系列、片商、导演、发行商、演员、标签、相关清单、TA还出演过、相关推荐。
- 资讯使用 `GET /api/v1/articles` / `GET /api/v1/articles/%s`。

### 登录 / 鉴权 / Cookie / 签名

- Stable Core 使用 `jdsignature` 公共签名访问公共 API；账号接口本地保存 JavDB Token，并兼容 raw / Bearer Authorization 形态。
- 登录设备 UUID 为本机随机生成并持久化，不使用固定个人设备标识。
- 禁止在本日志记录真实 Cookie、Token、测试账号或 Authorization，仅记录获取方式、生命周期和字段作用。

### 编码 / 图片 / 官方播放

- 3.9.42 继续继承 3.9.41 已有官方播放、图片、登录、评论、收藏主链，不因第三方 Provider 维修而重写。
- JavDB VIP 在线播放、官方预览、官方磁链与第三方播放保持隔离；第三方 Provider 失败不得影响官方链。

### 共享 JAV Playback SDK

- 2026-08-22 起第三方番号播放从 JavDB 私有代码拆为共享 `JAV Playback SDK`：Manager 为 `shared/jav-playback/manager.js`，版本化实现位于 `shared/jav-playback/releases/<version>/index.js`。
- Provider UI 当前只显示站点名：MissAV / 123AV / Jable。
- **2026-08-23 Test3 实机结果：123AV 可播放、Jable 可播放、MissAV 完全不可播放；123AV 图标为空。**
- 从 SDK test.4 起执行“已验证 Provider 冻结”原则：修 MissAV 不重写 123AV/Jable。
- 123AV 已验证链：`player(JSON.parse(...))` 优先；失败后 `detail/search → page-video ID → /ajax/v/<id>/videos → watch[] → player page → m3u8`；最终才 `video://detail`。多线路保持 urls/names/headers 对齐。3.9.42 只把图标改为仓库静态 `shared/jav-playback/assets/123av.svg`，播放解析不动。
- Jable 已验证链：`/videos/<code>/` → HTML HLS → WebView 兜底 → master 自动最高画质 → 最终 `video://detail`。3.9.42 不修改解析。
- MissAV SDK test.2 使用猜详情 URL/多 root 探测和脆弱 packed 解析，实机失败，禁止再作为已验证链。
- MissAV SDK test.4 恢复历史海阔成功思路：`/cn/search/<code>` → 只取搜索页真实存在详情 → 执行 `eval(...source...)` / Dean Edwards packed player → master m3u8 → 按 RESOLUTION/BANDWIDTH 自动最高画质；普通 fetch 不足时再用 WebView 获取动态详情。**该 MissAV 新链在晋级 3.9.42 时仍未取得新的明确实机播放确认，后续如有问题只发新 SDK Test 修 MissAV，不改 123AV/Jable 和 JavDB 主链。**
- SDK test.1：导出方式有作用域风险，冻结。
- SDK test.2：显式 `var JAVPlayback`；123AV/Jable 已由 Test3 实机验证，MissAV 失败。
- SDK test.3：发布后回读发现 IIFE 内嵌套 `eval(test.2)` 的导出作用域风险，在用户测试前冻结。
- SDK test.4：顶层显式声明 `var JAVPlayback`，加载 test.2 基线时将 `var JAVPlayback=` 转成对当前导出变量赋值；已完成 Manager 风格作用域 smoke test。
- **2026-08-23 用户明确要求把当前 Test5 晋级正式版，因此 Shared Playback `stable` 指针固定到 immutable `1.0.0-test.4`；未来新 Provider/修复只移动 `test` 指针，不得原地改变 Stable 指针。**

### Runtime / eval 作用域

- Test2 实机启动失败：`JSEngine#17(eval)#9(eval)` / `ReferenceError: JDB 未定义`。
- 根因：Test1 在同一个 `core()` 内 `eval(Core) -> eval(Patch) -> eval(call)`；Test2 抽出 `loadCore()` 后，Core 中 `var JDB` 只活在 `loadCore()` 局部作用域。
- Test3 修复：`core()` 与 `javdb3ExternalPlay` 均恢复同一函数作用域 direct eval。
- 2026-08-23 用户 Test3 截图证明小程序已正常进入首页/演员/更多播放，故 **Test3 启动作用域修复已实机确认有效**。
- Stable 3.9.42 使用独立 `runtime.js` 和独立 cache key，继续保持 Core/Patch/最终调用同一作用域，不复活 Test2 的 `loadCore()` 方案。
- 通用规则已同步到 `HIKER_APP_DEVELOPMENT_CAUTIONS.md`：依赖 eval 创建局部符号的加载链不能跨 helper 假定可见；语法门禁之外必须做真实导出/entry smoke test。

### UI / 信息架构

- 主导航为 `首页 / 排行 / 分类 / 演员 / 我的 / 更多`。
- “我的”聚合本地影片收藏、演员收藏、历史及 JavDB 账号内容；“更多”聚合资讯、系列/片商/导演、自定义搜索、封面布局、API 状态和设置。
- Test3 实机截图确认主框架可正常渲染。
- 3.9.42 删除演员页重复“搜索演员 / 按姓名搜索”行，统一使用顶部全局搜索；其余 UI 暂不扩大改版范围。

### 缓存 / 状态 / 本地数据

- Stable 与 Test 同名覆盖；Local 使用 `JavDB v3 本地版` 独立命名。
- Stable 3.9.42 使用新 Shell `version=2026082301`、新 runtime URL 和 `3942stable` 独立缓存键，不覆盖 3.9.41 文件。
- 分类状态继续使用 `jdb3_cat42_*`。
- Local 当前仍是 3.9.41-local；如需更新本地版，必须从已确认的 Stable 3.9.42 另行派生并做隐私扫描，不直接把远程 Shell 当本地版。

## 已知风险与禁止回退方案

- 当前 Stable 为 3.9.42；3.9.41 保留为完整 rollback，不原地覆盖或删除。
- Test1 已验证分类/排行总体结构，不因播放问题整块重写。
- Test2 已证实启动失败，禁止作为活动 Test 或 recovery base。
- Test4 不作为用户测试入口；其有效演员补丁已继承到 3.9.42，Shared SDK test.3 继续冻结。
- 第三方 Provider 属于可选能力，任一外站失败不得拖垮 JavDB 官方功能。
- 123AV/Jable 已实机可播；后续修 MissAV 时默认冻结它们的解析链。
- Shared Playback Stable 已固定到 immutable SDK test.4；后续不得让 Stable 无边界跟随 test channel。
- 下一轮 JavDB Test 必须从 Stable 3.9.42 向前开发，不再从 3.9.41 或失败 Test2 恢复。
- 未经当前源码/实机证据，不从其它 JAV 站、旧 JavDB/JavDB2 推断协议事实。

## 回归测试清单

- [x] Test1 分类：有码/无码/欧美/FC2/动漫（2026-08-22 实机确认入口和总体功能）
- [x] Test1 基本/高级筛选总体可用（2026-08-22 实机）
- [x] Test1 排行和演员入口存在并可用（2026-08-22 实机）
- [x] Test3 首屏正常进入，不再 `JDB 未定义`（2026-08-23 截图确认）
- [x] Test3 主导航可渲染（首页/排行/分类/演员/我的/更多）
- [x] Shared SDK Test2 / 123AV 可播放（2026-08-23）
- [x] Shared SDK Test2 / Jable 可播放（2026-08-23）
- [x] Shared SDK Test2 / MissAV 不可播放，已确认为待修项（2026-08-23）
- [x] Test3 / 123AV 图标为空，已确认为 UI 缺陷（2026-08-23）
- [ ] Stable 3.9.42 演员 `无码` / `欧美(女)` 新映射实机回归
- [ ] Stable 3.9.42 演员页重复搜索行已消失
- [ ] Shared SDK Stable / Manager 在海阔实机加载/version 校验正常
- [ ] 123AV 固定图标正常显示，播放仍正常
- [ ] Jable 二次回归仍正常
- [ ] MissAV 只展示真实存在版本
- [ ] MissAV 选中版本后可播放并自动最高画质
- [ ] 搜索 / 详情 / 评论 / 官方播放 / 磁链无回归
- [ ] Stable 3.9.42 同名覆盖安装正常
- [ ] Local 独立安装与隐私扫描

## 故障与恢复记录

后续每次重要 Bug 固定记录：症状 → 实机当前通道/版本 → 根因 → 修复 → 为什么旧方案错误 → 回归结果 → 是否影响 Stable/Test/Local → 是否需要更新三份全局文档。

---

## 版本记录

### 3.9.42 Stable / 2026-08-23

- 用户明确要求把当前 Test5 状态晋级正式版。
- 新建独立 `apps/video/javdb/releases/3.9.42/`、`cloud/javdb/v3.9.42/runtime.js` 和 `javdb_v3.9.42_cloud.txt`，没有原地覆盖 Stable 3.9.41。
- Stable Build：`2026082301`；规则壳 version：`2026082301`。
- 继承 Test1 分类/排行/演员扩展、Test3 eval 作用域修复、Test4 演员 type2/type3 校正和 Test5 UI/共享播放指针。
- Stable 专用 Patch 把 `J.javPlaybackChannel` 从 `test` 切为 `stable`，避免正式版随未来 SDK Test 指针漂移。
- Shared JAV Playback Stable 指针固定到 immutable SDK `1.0.0-test.4`；123AV/Jable 保留已验证解析，MissAV 保留当前新链，后续若再修只发新 SDK Test。
- 新增 `stable.json` / `latest.json`，registry/manifest/channels 同步到 Stable 3.9.42。
- Previous Stable 3.9.41 完整保留用于回退。
- Local 暂不跟随晋级，继续保持 3.9.41-local。

### 3.9.42-test.5 / 2026-08-23

- 继承 Test4 的演员映射修正：仅在 `/api/v1/actors` 中交换 UI `无码`/`欧美(女)` 对应的 API type3/type2，不修改影片分类和排行榜。
- 演员页删除重复“搜索演员”行，统一使用顶部总搜索。
- 因共享 SDK test.3 在最终发布回读时发现与 JDB 事故同类的嵌套 eval 导出风险，未让用户浪费时间测试，直接冻结。
- 新建共享 SDK `1.0.0-test.4`：显式稳定导出 `JAVPlayback`，已做 Manager 风格作用域 smoke test。
- 123AV/Jable 解析代码继续继承已实机成功的 SDK test.2；123AV 仅更换仓库固定图标。
- MissAV 单独改为“搜索真实结果 → 详情 packed source → master HLS → 自动最高画质”。
- 后按用户明确要求晋级 Stable 3.9.42。

### 3.9.42-test.4 / 2026-08-23

- 根据 Test3 实机截图发现 `无码` 与 `欧美(女)` 演员列表对调，建立定点 type=2/3 交换补丁。
- 去掉演员页重复搜索入口。
- 原计划绑定 Shared SDK test.3；发布回读时在用户测试前发现 SDK test.3 导出作用域风险，因此 Test4 不作为最终测试入口，其有效 JavDB 补丁直接继承到 Test5。

### 3.9.42-test.3 / 2026-08-23

- Test2 首页启动报 `ReferenceError: JDB 未定义`。
- 新建独立 Runtime/Shell/缓存键，恢复 `eval(Core) -> Patch -> call` 同作用域运行，不原地覆盖 Test2。
- 继承 Test1 分类/排行/演员和 Test2 UI/共享播放架构。
- **实机结果：启动恢复，首页/演员/更多播放页面可正常进入。123AV、Jable 可播放；MissAV 不可播放；123AV 图标为空。**

### 3.9.42-test.2 / 2026-08-22

- 在 Test1 上加入 APP 风格首页/我的/更多以及共享 JAV Playback SDK。
- 实机启动即失败 `ReferenceError: JDB 未定义`，根因是 Runtime eval 作用域，不代表业务 UI 设计本身被否定。
- 已冻结，不再作为活动 Test。

### 3.9.42-test.1 / 2026-08-22

- 基于 Stable 3.9.41 创建独立 Test Release。
- 分类页补齐 APP 分类、基本筛选、高级标签和想看/看过排序。
- 排行榜增加 TOP250 / 看热播 / 有码 / 无码 / 欧美 / FC2 及演员月榜。
- 演员页增加推荐 / 有码女 / 有码男 / 无码 / 欧美女 / 欧美男，推荐页拆新人 / 月排名 / Fanza(DMM)推荐。
- 用户实机确认“好了，都有了”，作为分类/排行总体可靠基线；后续截图进一步校正演员 type2/type3 的具体语义。

### 3.9.41 Stable / 2026-08-21

- 上一远程正式基线，现完整保留用于回退。
- Stable/Test 同名覆盖；异常时可重新导入该旧 Stable 恢复。
- 已登记能力：搜索 / 高级标签 / 评论 / 播放 / 收藏。

### 3.9.41-test.1 / 2026-08-21

- 上一远程测试基线，已登记为实机验证通过。

### 3.9.41-local / 2026-08-21

- 纯本地完整代码通道，规则名 `JavDB v3 本地版`。
- 可与正式/测试远程版并存。
- 导入时要求最终规则隐私扫描，不依赖私人 GitHub 才算合格。
