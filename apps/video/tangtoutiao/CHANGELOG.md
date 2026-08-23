# 汤头条 CHANGELOG

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
