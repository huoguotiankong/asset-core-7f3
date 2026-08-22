# JavDB v3 Changelog

> **定位：程序级长期技术记忆。** 后续开发/优化 JavDB v3 前，必须先读三份全局文档，再读本文件、`apps/video/javdb/channels.json`、当前 Stable/Test/Local 入口和对应运行代码。只记录已验证事实；未知协议/解密信息必须标记待确认，禁止从旧聊天记忆猜测。

## 当前基线

- 程序：JavDB v3
- App ID：`javdb-v3`
- Stable：`3.9.41` / build `2026082006` / Remote
- Test：`3.9.42-test.1` / build `2026082241` / Remote / 待实机验证
- Local：`3.9.41-local` / build `2026082103` / Pure Local
- Stable 入口：`cloud/javdb/v3.9.41/javdb_v3.9.41_cloud.txt`
- Test 入口：`cloud/javdb/v3.9.42-test.1/javdb_v3.9.42_test1.txt`
- Test Release：`apps/video/javdb/releases/3.9.42-test.1/release.json`
- Local 构建：`cloud/javdb/v3.9.41/release_meta.json` + `runtime.js`
- 当前通道元数据：`apps/video/javdb/channels.json`
- 最后登记日期：2026-08-22

## 关键技术索引

### 数据源 / API / 页面解析

- 分类类型已由当前 APK/API 证据确认：`0=有码`、`1=无码`、`2=欧美`、`3=FC2`、`4=动漫`。
- 分类标签字典：`GET /api/v2/tags?type={0..4}`；返回按 `category_id` 分组的完整动态标签，不应手工维护静态标签全集。
- 分类影片：`GET /api/v1/movies/tags`；当前已验证 `filter_by` 基本结构为 `{type}:t:{main}:{extra}:{year}:{duration}:{month}`。
- 分类基本条件当前已确认：`p=可播放`、`m=可下载`、`c=含字幕`、`s=单体影片`、`i=含预览图`、`v=含预览视频`；`全部`使用空 main 槽位进入 Test1 实机验证，验证前不晋级 Stable。
- 普通高级标签位 `extra` 支持跨分组多选并表现为交集；年份/月当前只可靠支持单值；时长多值行为不稳定，因此 UI 保持单选。
- 分类排序已确认：`update`、`release desc/asc`、`score`、`hit`、`want_watch_count`、`watched_count`。
- 热播榜：`GET /api/v1/rankings/playback?filter_by=all|high_score&period=daily|weekly|monthly`。
- 普通影片榜：`GET /api/v1/rankings?type={0..3}&period=daily|weekly|monthly`。
- 演员榜：`GET /api/v1/rankings/actors?type=...&filter_by=daily|weekly|monthly`。
- 演员推荐：`GET /api/v1/actors/recommend` 返回 `new_actors`、`monthly_actors`、`recommend_actors`，当前 Test1 分别映射为 APP 的“新人 / 月排名 / Fanza(DMM)推荐”。
- 演员列表：`GET /api/v1/actors?type=...&page=...`。当前 APP 截图显示五个分类为 `有码(女) / 有码(男) / 无码 / 欧美(女) / 欧美(男)`；Test1 暂按 `type=0..4` 顺序映射，属于**待实机验证假设**，不能当成 Stable 协议事实。

### 登录 / 鉴权 / Cookie / 签名

- 当前 Stable Core 使用 `jdsignature` 公共签名访问公共 API；账号接口在本地保存 JavDB Token，并兼容 raw / Bearer 两种 Authorization 形态。
- 登录设备 UUID 为本机随机生成并持久化，不使用固定个人设备标识。
- 禁止把浏览器 Cookie、测试账号或临时登录态写入本日志；只记录 Cookie/Token 获取方式、生命周期和字段作用。

### 编码 / 解密 / 图片 / 播放

- Stable 3.9.41 的播放、MissAV/Jable/123AV、图片与自定义模块在 3.9.42-test.1 中全部复用，不在本次 APP 分类补全中改动。
- Test1 采用小型 `app_parity_patch.js` 覆盖 `JDB.category / JDB.rank / JDB.actorHub`，避免复制/重写 3.9.41 的大 Core，降低播放、登录、评论、收藏回归风险。

### 缓存 / 状态 / 本地数据

- Stable 与 Test 规则名相同，按同名覆盖切换；Local 使用 `JavDB v3 本地版` 独立命名，可与远程版并存。
- 3.9.42-test.1 使用独立 Core/custom/patch 缓存键，避免与 Stable 3.9.41 的远程缓存串线。
- 分类 Test1 使用 `jdb3_cat42_*` 独立筛选状态键，避免测试版新筛选模型污染 Stable 旧状态。
- Local 版发布前必须执行最终规则隐私扫描，保证不依赖私人 GitHub 运行。

## 已知风险与禁止回退方案

- 不得把 Stable/Test/Local 当成三个完全独立产品维护；核心功能修改要明确同步范围。
- Test 验证通过前不得直接覆盖 Stable。
- Local 版不得残留私人 GitHub Raw、Remote Manager 或远程更新链。
- 未经当前源码验证，不得根据旧 JavDB/JavDB2 或其他站点的解析方式推断本版本协议。
- 3.9.42-test.1 的演员 `type=0..4 -> 有码女/有码男/无码/欧美女/欧美男` 是待实机验证映射；如果实机分类错位，只修 Actor Taxonomy，不回退整个分类/榜单补丁。
- 分类“全部”空 main 槽位需要实机确认是否返回 APP 的完整分类流；若异常，只修 main=all 语义，不影响 `p/m/c/s/i/v` 已确认条件。

## 回归测试清单

- [ ] 首页/发现
- [ ] 搜索
- [ ] 分类：有码/无码/欧美/FC2/动漫
- [ ] 分类基本：全部/可播放/可下载/含字幕/单体影片/含预览图/含预览视频
- [ ] 分类高级标签多选、年份/月/时长单选
- [ ] 分类排序：发布/更新/评分/热度/想看/看过
- [ ] 排行：TOP250/看热播/有码/无码/欧美/FC2
- [ ] 排行：日榜/周榜/月榜/演员月榜
- [ ] 演员：推荐/有码女/有码男/无码/欧美女/欧美男
- [ ] 演员推荐：新人/月排名/Fanza(DMM)推荐
- [ ] 详情
- [ ] 评论
- [ ] 播放/线路
- [ ] 收藏
- [ ] Stable ↔ Test 同名覆盖
- [ ] Local 独立安装与离线于私人 GitHub 运行
- [ ] 分享/本地版隐私扫描

## 故障与恢复记录

后续每次重要 Bug 固定记录：症状 → 实机当前通道/版本 → 根因 → 修复 → 为什么旧方案错误 → 回归结果 → 是否影响 Stable/Test/Local → 是否需要更新三份全局文档。

---

## 版本记录

### 3.9.42-test.1 / 2026-08-22

- 基于 Stable 3.9.41 创建独立 Test Release，不修改 Stable 文件。
- 分类页对齐当前 APP：补齐 `全部 / 可下载 / 单体影片`，并保留可播放、字幕、预览图、预览视频；高级标签继续直接读取官方动态字典。
- 分类排序补齐 `想看人数 / 看过人数`。
- 排行榜改为 APP 六入口：`TOP250 / 看热播 / 有码 / 无码 / 欧美 / FC2`；普通类型榜增加 `演员月榜`。
- 演员页改为 APP 六入口：`推荐 / 有码(女) / 有码(男) / 无码 / 欧美(女) / 欧美(男)`；推荐页拆为 `新人 / 月排名 / Fanza(DMM)推荐`。
- 为降低回归面，只以独立 Patch 覆盖分类、排行榜、演员三块；播放、登录、搜索、详情、评论、收藏和自定义模块继续使用 3.9.41 稳定实现。
- 待实机重点确认：演员 type 0..4 分类顺序、分类“全部”空 main 槽位、TOP250 分页。

### 3.9.41 Stable / 2026-08-21

- 当前远程正式基线，作为日常稳定使用通道。
- 与 Test 使用相同程序名，可通过同名覆盖切换；Test 异常时可重新导入 Stable 覆盖恢复。
- 当前登记能力：搜索 / 高级标签 / 评论 / 播放 / 收藏。

### 3.9.41-test.1 / 2026-08-21

- 上一远程测试基线，已登记为实机验证通过。
- 3.9.42-test.1 从 Stable 3.9.41 新建独立测试层，不原地覆盖此历史测试入口。

### 3.9.41-local / 2026-08-21

- 纯本地完整代码通道，规则名 `JavDB v3 本地版`。
- 可与正式/测试远程版并存。
- 导入时要求最终规则隐私扫描，不依赖私人 GitHub 才算合格。

> 旧版本的详细接口、Bug、解密和修复历史尚未系统补录；下一次实际维修时应从当前源码、Git 历史和实机结果逐步回填，禁止凭空补写。
