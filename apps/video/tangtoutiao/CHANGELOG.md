# 汤头条 CHANGELOG

## 0.1.0-test.9 / Build 10109 — 2026-08-23

状态：**Test8 实机精修版，仍为 Test；禁止晋级 Stable。**

### Test8 实机事实
- 用户实机确认：当前视频列表封面仍全部灰。诊断 `ttt_last_image_policy` 明确为 `direct-public-image`，且候选是标准 `https://picx.yrfmba.cn/...jpeg`。结合项目图片规范可确认：**标准扩展名不等于可以裸直链，图片 Header 仍属于显示合同。** Test8 因为直接返回 URL 丢失了 UA/Accept，因此回退方向不是继续改 AES，而是恢复带 Header 的图片 URL。
- 长视频播放问题进一步收敛：某视频详情标称 `19:34`，但 `ttt_last_source_probe` 对 240P 实际统计只有 `57s`；Test8 只把 `<4s` 视为维护占位，所以把这个明显的试看/不完整片源误判为有效。结论：**播放完整性必须比较 source 实际时长和详情标称时长，不能只设绝对短阈值。**
- 短视频链可正常播放，用户明确要求短视频列表点击后直接进入播放器，不再进入普通视频详情页。
- Test8 详情页“单一真实媒体入口”方向保留，不回退多媒体 Item；这次主要继续修图片、完整片源判断与短视频交互。

### Test9 修改
- **图片 Header 修复**：`picx.yrfmba.cn / yrfmba.cn` 的标准 JPEG/PNG/GIF/WebP/BMP 不再裸返回 URL，改为海阔官方 `url@headers={...}` 合同，注入 UA + Accept；非标准图片继续走 Test6 ImageAdapter 解密链。`ttt_last_image_policy.mode` 改为 `header-public-image / decrypt-helper`。
- **完整片源判断**：播放 payload 新增详情 `expectedDuration`；预检 M3U8 后将 `#EXTINF` 总时长与标称时长比较。长视频若实际时长明显低于标称时长（例如 19:34 对 57s）直接标记 `suspicious`，继续尝试其它源。
- **Fallback 扩展**：保留 240/480/720/1080，同时仅当 `source_origin / preview_video` 看起来是实际媒体 URL 时才加入回退链；顺序为用户偏好 → 240 → 480 → 720 → 1080 → 原始 → 预览。
- **短视频直接播放**：首页短视频 Tab 和“短视频”频道的 `movie_2` 卡片直接调用 PlaybackAdapter，不再进入 `tttDetail`；播放前仍走同一完整性预检，并写入本地观看历史。
- **详情 UI 收敛**：Hero 继续纯展示；页面仍只有一个真正播放入口。清晰度改固定 `text_4`，不再使用横向 `scroll_button`，移除右侧多余 `>`；可见详情去掉技术 ID 和调试式说明，仅保留标题、作者、时长、播放量、播放、收藏、清晰度和简介。
- **修改边界**：协议、匿名会话、图片解密器、漫画动态路由、创作者排行榜和 Test8 单媒体播放结构不重写；Test9 通过 `CoreV017 Patch` 叠加在 Test8 Core 上，降低回归面。
- Release 使用 `playback_fixed.js`。同目录早先写入但未引用的 `playback.js` 在发布门禁中发现转写变量名错误，按不可变工件规则没有原地覆盖，也没有进入 Release。

### Test9 实机验收
1. 首页/长视频/短视频列表首先看封面：若仍灰，提供对应截图和 `ttt_last_image_policy`；预期应看到 `mode=header-public-image`。
2. 点击短视频卡片应直接进入播放器，不再先打开二级详情。
3. 重新测试此前标称 19:34、240P 实际 57s 的视频：57s 应被标记为不完整，不应直接播放；若其它画质/原始源存在完整线路应自动回退。
4. 若长视频仍提示无完整线路，提供 `ttt_last_source_probe`。重点看每个源的 `duration / expected / ratio / suspicious`，据此继续恢复 APP 的真实长视频授权/原始源选择逻辑。
5. 详情清晰度应为固定按钮，不再出现横向滚动 `>`；页面仍只有一个实际媒体播放入口。
6. 漫画 12 个动态分类 → `construct` 30 条作品、创作者排行榜不得退化。

## 0.1.0-test.8 / Build 10108 — 2026-08-23

状态：**Test7 实机精修版，仍为 Test；禁止晋级 Stable。**

### Test7 实机事实
- 短视频页面已经出现真实封面；长视频/精选 403 条里仍有部分灰封面，说明图片主入口已经成立，但不同图片链不能继续一刀切处理。
- 已出现真正可播放的长视频：实机视频 ID `3017032`，时长 `29:17`，240P 可正常播放并实际播放到 `06:35 / 29:17`。这证明 `source_* → M3U8 → 解密/修复 → Hiker 本地代理 → 原生播放器` 主链已经成立。
- 同时仍有部分视频/画质播放为约 2 秒“该版本已停止维护，请前往官网下载最新版本”的占位片。当前 `requestVersion/effectiveVersion/serverVersion` 均为 `9.6.2`，因此不能再把所有占位片归因于版本握手失败；必须按**每个 source 独立预检**处理混合有效/占位源。
- 详情页此前同时给 Hero、立即播放、1080/720/480/240、播放器内切换等多个条目返回真实媒体 URL。海阔会把连续同类条目识别为连续选集/章节，最终在播放器中产生“上一个 / 下一个 / 列表”等页面派生的播放列表上下文。这是结构错误，不再通过样式或播放器 URL 补丁处理。
- 漫画动态路由已真正成立：`/api/comic/home` 返回 12 个动态分类；例如分类 `api/comic/construct?id=7&page=1` 已实机返回 `list[30]`。后续可从作品列表继续接详情/章节。
- 排行榜 `getPlayRank(type)` 实际返回的是**创作者排行榜**，实机 schema 为 `array[9]>{nickname,thumb,owner_uuid,videos_count,followed_count,...,thumb_url,uuid,num}`，不是视频列表；Test7 用视频 Adapter 渲染导致“code 200 但 0 条”的伪空列表。

### Test8 修改
- **详情播放结构重构**：Hero 卡只负责展示，URL 固定 `hiker://empty`；整页只保留一个真正返回媒体 URL 的“立即播放”条目。
- **清晰度改为状态选择**：1080P/720P/480P/240P 按钮只保存偏好并刷新页面，不直接返回媒体；删除“播放器内切换”媒体条目。这样从页面结构上消除误触发连续选集/播放列表的条件。
- **播放源预检与自动回退**：点击唯一播放按钮后，先按用户偏好检查 source，再按 `240P → 480P → 720P → 1080P → preview` 回退；对 M3U8 执行明文/AES-CFB 解密并统计 `#EXTINF` 总时长，`0 < duration < 4s` 作为维护/升级占位片拒绝，不再送进播放器。
- 新增 `ttt_last_source_probe`：记录 preferred、chosen 及每个画质的 `ok/duration/mode/short/error`，用于区分“源坏 / 解密失败 / 占位片 / 自动回退成功”。
- **图片分链**：`picx.yrfmba.cn` / `yrfmba.cn` 上带标准图片扩展名的普通 JPEG/PNG/GIF/WebP/BMP 直接交海阔显示，不再强制经过图片解密回调；非标准/未知图片继续使用既有 ImageAdapter。新增 `ttt_last_image_policy`。
- **排行榜模型修复**：新增 Creator Rank Adapter，按 `num/nickname/owner_uuid/videos_count/followed_count/vip_level_str/auth_status_str/thumb_url` 渲染“创作者播放榜”，不再套视频卡；创作者详情在接口未恢复前不伪装成功。
- **漫画链保留已验证动态合同**：继续严格执行服务端每个分类自己的 `api_list + params_list`；分类缺少动态 API 时直接提示，不回退猜测接口。
- Runtime/Release/Bootstrap/Shell 全部派生为不可变 Test8 / Build10108；Shell rule version `2026082309`。

### Test8 实机验收
1. 进入任意视频详情：Hero 不应触发播放；清晰度按钮只改变选中态；真正播放入口应只有一个“立即播放”。
2. 播放后重点看**页面派生的**“上一个 / 下一个 / 列表”是否消失。若仅剩海阔原生播放器自己的通用收藏/下载/投屏等操作面板，需与页面播放列表问题分开处理。
3. 找一个此前会播 2 秒维护片的视频：Test8 应自动尝试其它画质；若所有画质都是占位/失败，应直接 toast 提示，而不是再打开 2 秒维护片。
4. 长视频封面应比 Test7 更完整；若仍有灰图，记录对应封面截图与 `ttt_last_image_policy`。
5. 排行榜应显示创作者卡片而不是 `code 200 / 0 条`；总榜/日榜/周榜/月榜继续使用 `all/daily/weekly/monthly`。
6. 漫画分类点击后应继续返回约 30 条作品，不允许因本轮播放/图片重构退化。
7. 混合播放失败时优先提供 `ttt_last_source_probe` + `ttt_last_play_sources`；图片失败提供 `ttt_last_image_policy` + 对应封面。

## 历史版本
Test7 / Build10107 及以前的完整协议、APK 逆向、图片/播放/漫画修复记录已原样归档：

- [CHANGELOG_HISTORY_TO_TEST7.md](./CHANGELOG_HISTORY_TO_TEST7.md)

后续最新回归继续记录在本文件，历史归档不再反复整份改写，以降低多程序并行发布时的冲突风险。
