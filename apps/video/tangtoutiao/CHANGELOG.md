# 汤头条 CHANGELOG

## 0.1.0-test.20 / Build 10120 — 2026-08-23

状态：**Test19 已恢复可启动后的内容协议修复与第二阶段补齐，仍为 Test；禁止晋级 Stable。**

### Test19 最新实机事实
- Test19 启动依赖热修有效，首页及已有视频功能恢复，可继续进入新增频道测试。
- 创作者页返回 `code 551 · 参数不全`，说明 Test18 将 `/api/Creator/featured` 错当成“创作者发现首页”。
- 有声首页返回 `code 200`，但结构是 `array[7]>{current:boolean,id:number,name:string,type:string,show_style:number,api_list:string,params_list:object}`；这不是作品列表，而是动态频道描述数组。
- 小说首页同样返回 `code 200`，结构为 `array[13]>{current:boolean,id:number,name:string,type:string,show_style:number,api_list:string,params_list:object}`；旧 Adapter 因此解析为 0 条。
- 社区首页实际返回 5 个动态频道描述；旧页面将它们直接渲染成“关注 / 热门 / 发现 / 精选推荐 / 狼友交流”五个超大空白块，确认频道描述与业务 Feed 必须分层。
- 排行榜“总榜”返回 `code 551 · type值只能为:daily,weekly,monthly,all`。根因是页面路由 `type=rank` 与服务端榜单参数 `type` 同名，路由值污染了 Provider 参数。
- 漫画分类/列表已实机正常：例如“发现”可显示 30 部并正常显示封面；当前缺口已经从列表推进到详情、章节和正文链。
- Test16 图片链继续有效；免费长视频与官方试看继续保持已验证播放状态。本轮仍以它们为冻结基线。
- 短视频完整时长问题仍未解决，仍只有约 2–3 秒；Test20 不宣称修复该问题，也不再次改动短视频播放器链。

### APK / 接口契约进一步确认
- `/api/Creator/featured` 不是创作者目录。APK 参数构造为 `uuid + lastId + limit`；只有已知创作者 UUID 后才能调用。
- 创作者发现 Test20 暂使用已经可返回真实创作者实体的 `/api/RankList/getPlayRank?type=all`，点击创作者后再调用 `/api/Creator/featured` `{uuid,lastId:0,limit:10}`。
- `/api/RankList/getPlayRank` 的 `type` 白名单固定为 `all / daily / weekly / monthly`；页面路由参数不得直接透传。
- 小说：`/api/novel/home` → 动态 `api_list/params_list` → 真实列表；详情 `/api/novel/detail {id}`；目录 `/api/novel/chaptersList {id,limit,page}`；正文 `/api/novel/chapterDetail {novel_id,chapter_id}`。
- 有声：`/api/audio/home` → 动态 `api_list/params_list` → 真实列表；详情 `/api/audio/detail {id}`；章节详情 `/api/audio/chapterDetail {audio_id,chapter_id}`。目录接口确认是 `/api/audio/chaptersList`，当前 Test20 对 `id` / `audio_id` 两种参数形式做有限兼容，等待实机确定唯一契约。
- 社区：`/api/community/home` 返回动态频道配置；APK 可见 `/api/community/list_post {cate,page}`、`/api/community/post_detail {id}`、`/api/community/post_comments {id,page}` 等独立链路。
- 漫画详情链已从 APK 确认：`/api//book/detail {id}` → `/api/book/list_episode {id,sort:'asc'}` → `/api/book/read {book_id,chapter_id}`。
- `ComicEpisodeBean` 可见 `comic_id / episode / episode_title / is_free / is_pay / thumb / view_money`；正文返回 `read` 图片列表。

### Test20 修改
- **动态频道 Adapter**：小说、有声、社区不再把 Home 响应直接交给内容解析器，而是统一执行 `Descriptor[] → Tab → selected.api_list + selected.params_list → real list → content model`。
- 动态频道配置缓存 10 分钟；切换小说/有声/社区子频道时不必反复请求首页描述数组。
- **社区 UI 重构**：将原来的大面积空白五分类改成紧凑横向 Tab，并加载当前频道真实 Feed；首页“社区”Tab与独立社区页统一复用同一套 Adapter。
- 新增社区帖子详情第一阶段：`/api/community/post_detail`，展示正文、媒体和已有评论字段；后续根据实机继续细化评论分页和互动动作。
- **排行榜修复**：使用独立状态 `ttt20_rank_type`，Provider 调用前只允许 `all/daily/weekly/monthly`，不再读取页面路由 `type=rank` 作为 API 参数。
- **创作者修复**：创作者入口先显示真实创作者榜单；创作者卡片可进入作品页，作品页按 APK 契约调用 `/api/Creator/featured {uuid,lastId,limit}`。
- **小说增强**：动态频道可进入真实作品列表；详情加入简介和章节列表；章节点击尝试 `/api/novel/chapterDetail` 正文。
- **有声增强**：动态频道可进入真实作品列表；详情加入章节列表；章节点击尝试 `/api/audio/chapterDetail`，若返回 `m3u8/url/play_url` 则直接交给海阔播放。
- **漫画第二阶段**：原先已经正常的 12 个动态分类和 30 部列表保持不变；卡片现在进入真实漫画详情，再取得升序章节，章节进入 `/api/book/read` 并用 `pic_1_full` 连续渲染正文图片。
- **稳定边界冻结**：Test16 图片 Adapter、Test10/Test15 免费长视频与官方试看、收费/汤币语义全部不修改；短视频 2–3 秒问题本轮也不做冒险性播放重构。
- Test20 新增 `pages_patch.js / runtime.js / release.json / Bootstrap / Shell`；新增页面/runtime 已通过本地 `node --check`，Release 显式保留 Test17→Test18→Test19→Test20 的依赖顺序。
- Shell rule version 升为 `2026082321`，Build 升为 `10120`，Test19 完整保留作为可启动回退点。

### Test20 新诊断
- `ttt_last_creator_discover`：创作者发现榜单数量和结构。
- `ttt_last_creator_featured`：指定 UUID 的 Creator/featured 结果。
- `ttt_last_rank_exact`：最终发送的合法榜单 type。
- `ttt_last_dynamic_channel`：小说/有声/社区当前 Tab、真实 api_list、params_list、内容数量与 schema。
- `ttt_last_content_detail`：小说/有声详情及章节结构。
- `ttt_last_community_detail`：社区详情媒体/评论数量。
- `ttt_last_comic_detail`：漫画详情与章节数量。
- `ttt_last_comic_read`：漫画正文页数与结构。

### Test20 实机验收重点
1. 排行榜依次测试总榜/日榜/周榜/月榜，确认不再出现 `type=rank` 的 551；创作者页应能出现真实作者，点击后再验证作品列表。
2. 小说、有声页面应先出现紧凑频道 Tab，然后出现真实作品，而不是 `array[xx]>{api_list,params_list}` 诊断空页；再测试一个作品详情和章节。
3. 社区应从五个巨大空白分类变成紧凑 Tab + Feed；点一个帖子验证详情。
4. 漫画从已正常的 30 部列表继续点进详情 → 章节 → 正文，确认章节数和图片是否真实返回。
5. 推荐/长视频/短视频封面、免费长视频和官方试看必须保持现状；短视频仍只有 2–3 秒属于已知未解决项，本轮不作为 Test20 成败误判其它频道功能。

## 0.1.0-test.19 / Build 10119 — 2026-08-23

状态：**Test18 启动依赖链热修版，仍为 Test；禁止晋级 Stable。**

### Test18 实机事故
- 用户覆盖导入 Test18 后，首页在业务请求前直接报错：`ReferenceError: TangTouTiaoPagesV025 未定义`。
- 根因不是短视频、分类接口或海阔播放器，而是 Test18 `pages_patch.js` 明确以 `TangTouTiaoPagesV025` 为基座，但 Test18 `release.json` 模块列表漏掉了 Test17 `pages_patch.js`。
- 因此 Test18 新页面补丁在 eval 阶段就失败，所有 Test18 业务逻辑均未真正进入实机执行。

### Test19 修复
- 冻结 Test18，不原地覆盖任何已发布 Test18 工件。
- 新建 Test19 / Build10119，并在 Release 中显式恢复加载顺序：`Test16 pages → Test17 pages_patch.js (TangTouTiaoPagesV025) → Test18 pages_patch.js (TangTouTiaoPagesV026) → Test19 runtime`。
- Test19 只修 Release 依赖链，不修改 Test18 的 APP `smallVideoByTag` 短视频 Provider、视频分类参数、内容频道、图片解密、长视频、官方试看、收费权限和缓存逻辑。
- Test18 仍完整保留为不可变回退工件；活动 Test、Manifest、Channels、Registry、云仓库均切换到 Test19 / Build10119。
- 发布硬规则新增：新补丁若通过 `var B=PreviousGlobal` / 继承上一层命名空间，Release Guard 必须同时验证 `PreviousGlobal` 的定义模块存在且位于当前补丁之前；仅检查“当前文件存在 + node --check”不足以防止运行时依赖缺失。

### Test19 实机验收
1. 覆盖导入云仓库里的 Test19 / Build10119，确认首页不再出现 `TangTouTiaoPagesV025 未定义`。
2. 启动恢复后再继续 Test18 原计划：短视频随机 3 个、频道→视频分类、图集/小说/有声/合集等页面。
3. 如果仍有启动级异常，直接提供完整错误弹窗；此时优先继续排查 Release 模块顺序，不先改业务 API。

## 0.1.0-test.18 / Build 10118 — 2026-08-23

状态：**Test17 缓存已验证、短视频仍只有 2–3 秒后的 Provider 修正 + 分类中心第一阶段，仍为 Test；禁止晋级 Stable。**

### Test17 最新实机事实
- 推荐/短视频/长视频第一次切换仍较慢，但后续切换明显变快，证明 Test17 的会话缓存方案已经生效；性能问题已从“每次都慢”收敛为“首次冷启动慢”。
- 推荐、长视频、短视频封面继续正常，Test16 图片链保持有效。
- 免费长视频与官方预览继续正常播放，Test10/Test15 长视频链保持有效。
- 短视频即使已经按 APK 原生契约直接使用列表 `source_240`，实际仍然只有约 2–3 秒，因此问题不再是详情重查或播放器交付层。

### 新的 APK / Provider 结论
- 原 APP 的短视频 ViewModel 实际调用 `/api/MvList/smallVideoByTag`，请求参数由 `Y2(tag,page,limit)` 构造，三个字段缺一不可。
- Test17 首选的是 PWA Provider；PWA 返回的列表 `source_240` 在实机上仍是 2–3 秒短切片，因此 Test18 改成**原 App Provider 优先**，PWA 只做兜底。
- `/api/MvList/style` 的真实参数已经逆向确认为 `id + page + size + orderBy`；此前 `551 参数不全` 就是因为没有完整按这个契约调用。

### Test18 修改
- **短视频 Provider 切换**：优先调用 App `/api/MvList/smallVideoByTag`，固定参数 `{tag:'recommend', page:1, limit:20}`；有结果即缓存 3 分钟并直接沿用 Test17 `source_240` 播放快路径。
- **PWA 降级为兜底**：只有 App 精确接口没有结果/失败时才调用 PWA `smallVideoByTag`，最后再回退 `/api/MvList/small`。
- 新增短视频精确诊断 `ttt_last_short_app_exact`，记录 App 列表第一条的 `source_240 / duration / schema`。
- **推荐/长视频缓存保持不变**：继续复用 Test17 的 5 分钟 `/api/MvList/featuredAv` 会话缓存；首次冷加载问题后续再做预热，不在本轮破坏现有稳定链。
- **内容频道第一阶段重构**：从占位入口升级为按功能域分组的真实页面。
- 视频分类接入 `/api/MvSearch/getStyle`，分类影片接入 `/api/MvList/style` 精确 `{id,page,size,orderBy:'id'}` 参数。
- 创作者入口接入 `/api/Creator/featured`。
- 图集接入 `/api/picture/home` 与 `/api/picture/detail`，详情可显示真实图片序列。
- 小说接入 `/api/novel/home`、`/api/novel/detail`，并先展示 `/api/novel/chaptersList` 前 3 章；正文下一阶段接入。
- 有声接入 `/api/audio/home` 与 `/api/audio/detail` 的基础列表/详情；章节播放下一阶段接入。
- 合集接入 `/api/compilation/list` 与 `/api/compilation/mvlist`。
- 话题、求片、粉丝团分别接入社区 topic、`/api/find/list`、`/api/club/items` 第一阶段 Adapter。
- 漫画、社区、排行榜继续复用现有已接链，不在本轮重写。
- AI 创作、游戏中心保留明确的阶段入口，不使用伪数据；下一阶段按独立数据模型开发。
- 新增频道诊断：`ttt_last_style_home`、`ttt_last_style_list`、`ttt_last_creator_featured`、`ttt_last_channel_diag`、`ttt_last_content_detail`。
- **稳定边界冻结**：Test16 图片 Adapter、Test10/Test15 长视频/试看播放、收费/汤币权限语义均不修改。
- Test18 新增 `pages_patch.js / runtime.js / release.json / Bootstrap / Shell` 均已通过本地 JS/JSON 语法门禁。
- Release / Bootstrap / Shell 派生为不可变 Test18 / Build10118；Shell rule version `2026082319`。

### Test18 实机验收重点
1. 短视频随机测试 3 个，确认 App Provider 后实际总时长是否仍只有 2–3 秒。若仍异常，只需要 `ttt_last_short_app_exact + ttt_last_short_provider + ttt_last_short_contract`。
2. 进入“频道 → 视频分类”，确认分类能正常出现；点击任一分类后应不再出现 `551 参数不全`。若异常提供 `ttt_last_style_home / ttt_last_style_list`。
3. 依次试图集、小说、有声、合集、话题、求片、粉丝团；页面结构不对时提供截图和 `ttt_last_channel_diag`，下一版按真实返回结构细化 Adapter。
4. 推荐/长视频/短视频封面、免费长视频、官方试看必须继续保持 Test16/17 状态，不允许回归。

## 历史版本
- Test17：[`CHANGELOG_HISTORY_TEST17.md`](./CHANGELOG_HISTORY_TEST17.md)
- Test16：[`CHANGELOG_HISTORY_TEST16.md`](./CHANGELOG_HISTORY_TEST16.md)
- Test15：[`CHANGELOG_HISTORY_TEST15.md`](./CHANGELOG_HISTORY_TEST15.md)
- Test14：[`CHANGELOG_HISTORY_TEST14.md`](./CHANGELOG_HISTORY_TEST14.md)
- Test11–Test13：[`CHANGELOG_HISTORY_TEST11_TO_TEST13.md`](./CHANGELOG_HISTORY_TEST11_TO_TEST13.md)
- Test8–Test10：[`CHANGELOG_HISTORY_TEST8_TO_TEST10.md`](./CHANGELOG_HISTORY_TEST8_TO_TEST10.md)
- Test7 及以前：[`CHANGELOG_HISTORY_TO_TEST7.md`](./CHANGELOG_HISTORY_TO_TEST7.md)
