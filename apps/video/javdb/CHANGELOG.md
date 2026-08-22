# JavDB v3 Changelog

> **定位：程序级长期技术记忆。** 后续开发/优化 JavDB v3 前，必须先读三份全局文档，再读本文件、`apps/video/javdb/channels.json`、当前 Stable/Test/Local 入口和对应运行代码。只记录已验证事实；未知协议/解密信息必须标记待确认，禁止从旧聊天记忆猜测。

## 当前基线

- 程序：JavDB v3
- App ID：`javdb-v3`
- Stable：`3.9.41` / build `2026082006` / Remote
- Test：`3.9.42-test.2` / build `2026082242` / Remote / 待实机验证
- 上一已验证 Test：`3.9.42-test.1` / build `2026082241`
- Local：`3.9.41-local` / build `2026082103` / Pure Local
- Stable 入口：`cloud/javdb/v3.9.41/javdb_v3.9.41_cloud.txt`
- Test 入口：`cloud/javdb/v3.9.42-test.2/javdb_v3.9.42_test2.txt`
- Test Release：`apps/video/javdb/releases/3.9.42-test.2/release.json`
- Local 构建：`cloud/javdb/v3.9.41/release_meta.json` + `runtime.js`
- 当前通道元数据：`apps/video/javdb/channels.json`
- 共用 JAV 播放 Manager：`shared/jav-playback/manager.js`
- 当前共用播放 Test SDK：`shared/jav-playback/releases/1.0.0-test.2/index.js`
- 最后登记日期：2026-08-22

## 关键技术索引

### 数据源 / API / 页面解析

- 分类类型已由当前 APK/API 证据确认：`0=有码`、`1=无码`、`2=欧美`、`3=FC2`、`4=动漫`。
- 分类标签字典：`GET /api/v2/tags?type={0..4}`；返回按 `category_id` 分组的完整动态标签，不应手工维护静态标签全集。
- 分类影片：`GET /api/v1/movies/tags`；当前已验证 `filter_by` 基本结构为 `{type}:t:{main}:{extra}:{year}:{duration}:{month}`。
- 分类基本条件：`p=可播放`、`m=可下载`、`c=含字幕`、`s=单体影片`、`i=含预览图`、`v=含预览视频`；2026-08-22 用户实机确认 Test1 分类页整体可用，包括“全部”。
- 普通高级标签位 `extra` 支持跨分组多选并表现为交集；年份/月当前只可靠支持单值；时长多值行为不稳定，因此 UI 保持单选。
- 分类排序已确认：`update`、`release desc/asc`、`score`、`hit`、`want_watch_count`、`watched_count`。
- 热播榜：`GET /api/v1/rankings/playback?filter_by=all|high_score&period=daily|weekly|monthly`。
- 普通影片榜：`GET /api/v1/rankings?type={0..3}&period=daily|weekly|monthly`。
- 演员榜：`GET /api/v1/rankings/actors?type=...&filter_by=daily|weekly|monthly`。
- 演员推荐：`GET /api/v1/actors/recommend` 返回 `new_actors`、`monthly_actors`、`recommend_actors`，Test1 对应 APP 的“新人 / 月排名 / Fanza(DMM)推荐”。
- 演员列表：`GET /api/v1/actors?type=...&page=...`。Test1 使用 `type=0..4` 对应 `有码(女) / 有码(男) / 无码 / 欧美(女) / 欧美(男)`；2026-08-22 用户实机确认这些入口均已出现并可用，因此当前作为已验证 UI/API 映射基线继续继承。
- 影片详情已经具备系列、片商、导演、发行商、演员、标签、相关清单、TA还出演过、相关推荐，不在 Test2 重复造入口。
- 资讯使用 `GET /api/v1/articles` / `GET /api/v1/articles/%s`，Test2 将资讯收进“更多”聚合页，不再挤占主导航。

### 登录 / 鉴权 / Cookie / 签名

- 当前 Stable Core 使用 `jdsignature` 公共签名访问公共 API；账号接口在本地保存 JavDB Token，并兼容 raw / Bearer 两种 Authorization 形态。
- 登录设备 UUID 为本机随机生成并持久化，不使用固定个人设备标识。
- 禁止把浏览器 Cookie、测试账号或临时登录态写入本日志；只记录 Cookie/Token 获取方式、生命周期和字段作用。

### 编码 / 解密 / 图片 / 播放

- Stable 3.9.41 的官方播放、图片、登录、评论与收藏在 Test2 继续复用；Test2 只替换外部第三方播放入口。
- 3.9.42-test.1 使用小型 `app_parity_patch.js` 覆盖分类/排行/演员，已由用户实机确认可用；3.9.42-test.2 在其后叠加 `app_parity_patch2.js`，不重写 Test1 已验证逻辑。
- 2026-08-22 起第三方番号播放从 JavDB 私有代码拆为共享 `JAV Playback SDK`：固定 Manager 为 `shared/jav-playback/manager.js`，业务小程序只传番号和 Provider ID，解析逻辑集中在版本化 SDK Release。
- 当前 Test SDK `1.0.0-test.2` Provider：MissAV / 123AV / Jable。Provider UI 只显示站点名，不显示实现备注。
- MissAV：并发探测默认/中文字幕/无码流出/无码版/流出版，只展示实际存在版本；详情优先解析 packed m3u8 / 直链 m3u8，WebView 兜底；master playlist 自动选择最高分辨率/带宽，不再提供手动画质切换。
- 123AV：先尝试 `player(JSON.parse(...))` 当前链；再尝试历史稳定链 `detail -> page-video ID -> /ajax/v/<id>/videos -> watch[] -> player page -> m3u8`；多线路用 `{urls,names,headers}` 返回；仅最终才回退 `video://detail`。
- Jable：`/videos/<code>/` 优先直接提取 HLS，WebView 兜底；若是 master playlist 自动选择最高变体；最终才回退 `video://detail`。
- SDK `1.0.0-test.1` 在发布前门禁发现 `eval` 后导出作用域可能不稳定，已冻结且不原地覆盖；随后新建 `1.0.0-test.2` 改为显式全局 `var JAVPlayback`。该事故证明共享播放模块同样必须 immutable release + channel pointer。
- **当前共享播放 SDK Test2 尚未完成海阔实机播放回归**；只有架构、语法和静态链路验证，不能晋级 Stable SDK。

### 缓存 / 状态 / 本地数据

- Stable 与 Test 规则名相同，按同名覆盖切换；Local 使用 `JavDB v3 本地版` 独立命名，可与远程版并存。
- 3.9.42-test.2 使用新的 Core/custom/patch 缓存键，避免与 Stable/Test1 串线。
- 分类继续使用 `jdb3_cat42_*` 独立筛选状态键。
- Test2 主导航改为 `首页 / 排行 / 分类 / 演员 / 我的 / 更多`；“我的”聚合本地片库与账号，“更多”聚合资讯、资料库与设置。
- Local 版发布前必须执行最终规则隐私扫描，保证不依赖私人 GitHub 运行。

## 已知风险与禁止回退方案

- 不得把 Stable/Test/Local 当成三个完全独立产品维护；核心功能修改要明确同步范围。
- Test 验证通过前不得直接覆盖 Stable。
- Local 版不得残留私人 GitHub Raw、Remote Manager 或远程更新链。
- 未经当前源码验证，不得根据旧 JavDB/JavDB2 或其他站点的解析方式推断本版本协议。
- Test1 已获实机确认，不得因 Test2 UI/播放问题回退或重写分类、排行、演员整块；新问题应在 Test2 对应模块定点修复。
- 第三方 Provider 是 P2/P3 可选能力；任一外站失败不得拖垮详情页或 JavDB 官方播放/磁链等 P0/P1 主链。
- 共享 JAV Playback Stable 一旦发布必须绑定具体 SDK release；坏站修复发布新 SDK Test，经实机验证后再推进 Stable，禁止原地覆盖旧稳定文件。

## 回归测试清单

- [x] Test1 分类：有码/无码/欧美/FC2/动漫（2026-08-22 用户实机确认）
- [x] Test1 分类基本/高级筛选（2026-08-22 用户实机确认整体可用）
- [x] Test1 排行入口与演员入口（2026-08-22 用户实机确认均已出现并可用）
- [ ] Test2 主导航：首页/排行/分类/演员/我的/更多
- [ ] Test2 首页：最新/推荐/磁链更新/可播放更新 + 快速筛选
- [ ] Test2 我的：本地影片/演员收藏/历史 + JavDB账号
- [ ] Test2 更多：资讯/系列/片商/导演/设置
- [ ] 搜索
- [ ] 详情
- [ ] 评论
- [ ] JavDB VIP / 官方预览 / 磁链
- [ ] 共享播放 MissAV：仅实际版本 + 自动最高画质
- [ ] 共享播放 123AV：直解/多线路/无广告误嗅探
- [ ] 共享播放 Jable：HLS/最高变体/WebView兜底
- [ ] Stable ↔ Test 同名覆盖
- [ ] Local 独立安装与离线于私人 GitHub 运行
- [ ] 分享/本地版隐私扫描

## 故障与恢复记录

后续每次重要 Bug 固定记录：症状 → 实机当前通道/版本 → 根因 → 修复 → 为什么旧方案错误 → 回归结果 → 是否影响 Stable/Test/Local → 是否需要更新三份全局文档。

---

## 版本记录

### 3.9.42-test.2 / 2026-08-22

- 直接继承用户实机确认正常的 `3.9.42-test.1`，不改其分类/排行/演员业务逻辑。
- 主导航收敛为 `首页 / 排行 / 分类 / 演员 / 我的 / 更多`，更接近官方 APP 的信息架构；不再让资讯/收藏/账号/设置全部挤在一级导航。
- “我的”新增总览/本地片库/账号聚合：本地影片收藏、演员收藏、历史、账号想看/看过/收藏/清单/近期浏览统一归位。
- “更多”聚合资讯、系列/片商/导演资料库以及自定义搜索/封面/API状态/设置。
- 修正设置页历史版本文案，显示当前 Test2 与共用播放 SDK 信息。
- “更多播放”改接共享 JAV Playback SDK，首批 Provider：MissAV、123AV、Jable；JavDB VIP、官方预览和官方磁链继续保留且与第三方代码隔离。
- Shared SDK Test1 因发布前发现 eval 导出作用域风险而冻结，Test2 使用新 release 修复，没有原地覆盖旧文件。
- 当前状态：JS 语法门禁、Shell 结构/33 pages 唯一性已通过；UI 和三 Provider 播放待海阔实机验证。

### 3.9.42-test.1 / 2026-08-22

- 基于 Stable 3.9.41 创建独立 Test Release，不修改 Stable 文件。
- 分类页对齐当前 APP：补齐 `全部 / 可下载 / 单体影片`，并保留可播放、字幕、预览图、预览视频；高级标签继续直接读取官方动态字典。
- 分类排序补齐 `想看人数 / 看过人数`。
- 排行榜改为 APP 六入口：`TOP250 / 看热播 / 有码 / 无码 / 欧美 / FC2`；普通类型榜增加 `演员月榜`。
- 演员页改为 APP 六入口：`推荐 / 有码(女) / 有码(男) / 无码 / 欧美(女) / 欧美(男)`；推荐页拆为 `新人 / 月排名 / Fanza(DMM)推荐`。
- 用户于 2026-08-22 实机反馈“好了，都有了”，确认本轮分类/排行/演员补齐可作为下一轮可靠基线。

### 3.9.41 Stable / 2026-08-21

- 当前远程正式基线，作为日常稳定使用通道。
- 与 Test 使用相同程序名，可通过同名覆盖切换；Test 异常时可重新导入 Stable 覆盖恢复。
- 当前登记能力：搜索 / 高级标签 / 评论 / 播放 / 收藏。

### 3.9.41-test.1 / 2026-08-21

- 上一远程测试基线，已登记为实机验证通过。

### 3.9.41-local / 2026-08-21

- 纯本地完整代码通道，规则名 `JavDB v3 本地版`。
- 可与正式/测试远程版并存。
- 导入时要求最终规则隐私扫描，不依赖私人 GitHub 才算合格。
