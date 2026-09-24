# 视色 CHANGELOG

## 0.1.0-test.11 / Build 10111 — 2026-09-24

状态：**第八轮实机反馈后的前贴片过滤方案；Test10 已进入真实播放器，但自动嗅探优先返回约 17 秒广告；无 Stable。**

### Test10 实机结果
- [实机确认] Test10 已成功进入播放器链，不再是 `player.html` 未解析问题。
- [实机确认] 默认嗅探实际播放出约 17 秒 `69Lover` 前贴片，证明当前 `video://` 会把“第一个能播放的媒体”直接当结果返回。
- [实机确认] 仅依赖 `videoExcludeRules` 的 URL 关键词无法解决：广告最终 HLS 地址本身不一定包含 `69lover` 等广告域关键词。

### Test11 修复
- Test5-Test10 Release 全部保持不可变；Test11 新增独立 `smartPrerollFilter` 模块。
- 默认播放从 `video://` 改为官方 `webRule://` 自定义轮询模式；保留 Test10 已验证的 `/video/id-<id>.html → player.html?id=<id> → player-container src` 入口链。
- `webRule` 每约 250ms 检查播放器 DOM 和已加载资源；检测到时长 `<=45s` 的视频时标记为前贴片，并把播放进度推进到接近结尾，触发站点自己的广告结束/正片切换流程。
- 只有检测到长视频（>45s / Infinity）或广告之后新出现的 HLS/MP4 请求才返回给海阔播放器，避免“第一个可播放媒体即结束嗅探”。
- 内层播放器项显式携带 `player.html` Referer 和当前 UA；不破坏播放器初始化依赖。
- 播放诊断保留“原始自动嗅探（对照）”，该项可能再次播放广告，仅用于确认差异。
- Test10 的详情元数据、分类、人物分页等逻辑通过包装旧 detail 结果继续保留，不因播放专项修复回退。

### Test11 重点回归
1. 覆盖导入 Test11，设置页确认 `Test 0.1.0-test.11 · Build 10111`。
2. 使用刚才同一条会播放 17 秒 `69Lover` 的视频，点击“智能跳过广告播放”。
3. 正常预期：可能短暂打开 Webkit 嗅探组件，但不应直接进入 17 秒广告；应在前贴片被推进/结束后再把正片媒体交给播放器。
4. 如果仍返回广告，进入“播放诊断”，分别测试“智能播放内层 1”和“原始自动嗅探（对照）”；只需反馈两项各自结果。
5. 正片播放未实机通过前不得晋级 Stable；Test11 方案通过后再把“前贴片广告不能只靠 videoExcludeRules，需延迟到正片阶段再返回媒体”的经验提炼到共享 Guide/Cautions。

## 0.1.0-test.10 / Build 10110 — 2026-09-24

状态：**第七轮实机反馈后的播放入口修复；根据 Test9 诊断修正真实详情 URL 的 ID 提取；无 Stable。**

### Test9 实机结果
- [实机确认] “播放诊断”中详情页实际为 `https://shise.me/video/id-6a9ef101ddcea.html`，而不是此前按公开规则假定的 `video.html?id=<id>`。
- [实机确认] Test9 诊断显示 `② player.html = 未解析`、`未提取到 player-container src`；因此 Test9 尚未真正进入两级播放器链，失败点在详情 ID 提取阶段，而不是 m3u8 嗅探阶段。
- [代码复核] Test9 `videoId()` 只识别 query `?id=` 和 HTML 内 `video/player.html?id=`，遗漏 `/video/id-<id>.html`，与本次实机截图完全吻合。

### Test10 修复
- Test5-Test9 Release 全部保持不可变；Test10 新增独立 `legacyDetailIdFix` 模块。
- `videoId()` 增加 `/video/id-<id>.html`、`/player/id-<id>.html` 和通用 `id-<id>.html` 识别，同时保留原 query-id 兼容。
- 对本次实机地址 `/video/id-6a9ef101ddcea.html`，会生成 `https://shise.me/player.html?id=6a9ef101ddcea`，然后继续 Test9 的 `.player-container src` → 内层播放器 → m3u8/mp4 嗅探链。
- 详情 Hero 增加已识别视频 ID，便于快速确认入口解析是否生效。
- 播放诊断新增“解析到的视频 ID”；如果② `player.html` 已出现但③仍为空，下一轮只处理 `player.html` 返回内容，不再改详情 ID。
- Test9 分类、人物分页、结构化详情元数据和播放器初始化策略全部保留。

### Test10 重点回归
1. 覆盖导入 Test10，设置页确认 `Test 0.1.0-test.10 · Build 10110`。
2. 仍使用本轮同一条 `渴望精子的女人` 测试；详情 Hero 应出现 `ID 6a9ef101ddcea`。
3. 先点“立即播放”；如果仍失败，再打开“播放诊断”。
4. 播放诊断中“解析到的视频 ID”应为 `6a9ef101ddcea`，②应至少生成 `https://shise.me/player.html?id=6a9ef101ddcea`。
5. 若③出现实际播放器 src，测试“嗅探内层播放器”；若③仍为空，只需截图该诊断页即可继续针对 player.html 内容修复。
6. 正片播放未实机通过前不得晋级 Stable。

## 0.1.0-test.9 / Build 10109 — 2026-09-24

状态：**第六轮实机反馈后的两级播放器链修复；已发布 Test9，等待正片播放与分页复测；无 Stable。**

### Test8 实机结果
- [实机确认] Test8 “立即播放”仍提示“播放异常，或者网络不可用”，说明仅在 `player.html?id=...` 页面使用 `video://` 精准嗅探仍不足以启动真实媒体链。
- [实机确认] 原站播放器页此前显示反广告拦截提示；Test8 同时通过 `blockRules` 阻断多个广告网络域，存在由我们自己的拦截策略破坏播放器初始化的风险。
- [实机确认] 人物详情链已经能展示第一页 12 条作品，但仍需要可靠的后续分页。

### 当前站点合同重新核对
- [公开当前规则确认] 当前视色视频卡把 `video.html?id=<id>` 转换为 `player.html?id=<id>` 作为播放入口。
- [公开当前规则确认] `player.html` 还不是最终播放器；需要先截取 `.player-container`，再读取其中的 `src`，以该内层地址作为实际播放器页，最后从运行时请求中嗅探 `s1.playhls.com/m3u8.php?` / m3u8 / mp4。
- [公开当前规则确认] 当前分类路由为 `series.html?id=<cateId>&page=<catePg>`；不再把旧 `/videos/series-.../<page>.html` 结构视为当前事实。

### Test9 修复
- Test5-Test8 全部保持不可变；Test9 新增独立 `twoStagePlayerFix` 模块。
- 主播放链改为：`video.html?id` → `player.html?id` → `.player-container src` → 对内层播放器执行 `video://` 运行时嗅探。
- `videoRules` 同时接受 `s1.playhls.com/m3u8.php? / playhls / vodcdn.shise.me / play.shise.me / player.shise.me / xxw-oss.shise.me / .m3u8 / .mp4`；`videoExcludeRules` 仍排除广告媒体候选。
- 播放器初始化阶段不再阻断广告脚本域；`blockRules` 仅压缩图片和字体，避免站点反广告拦截检测导致真正播放器不启动。
- 播放诊断页直接展示三层地址：详情页 → `player.html` → `player-container src`，并允许分别嗅探内层播放器与 `player.html` 回退链。
- 分类页切换为当前明确的 `series.html?id=...&page={page}` 路由。
- 人物详情若 URL 为 query-id 结构，第 2 页起直接追加/替换 `page=N`，用于突破第一页固定 12 条的边界；其他人物页面仍回退 Test7 的 next/数字分页逻辑。
- 详情元数据兼容当前 `series.html?id=...` 分类链接，并继续过滤数量后缀和导航噪声。

### Test9 重点回归
1. 覆盖导入 Test9，设置页确认 `Test 0.1.0-test.9 · Build 10109`。
2. 用刚才同一条失败视频直接点“立即播放”；若仍失败，进入“播放诊断”。
3. “播放诊断”应至少显示 `①详情页 / ②player.html / ③实际播放器 src`；如第③层为空，截图该页面即可继续精确修复。
4. 若第③层存在但仍播放失败，分别测试“嗅探内层播放器”和“回退：嗅探 player.html”，记录哪一层报错。
5. 打开 `狐不妖` 等人物详情持续下滑，确认作品能超过 12 条且不重复第一页。
6. 分类任选一项下滑 2-3 页，确认 `series.html?id=&page=` 分页生效。
7. 正片播放和分页核心链未实机通过前不得晋级 Stable。

## 0.1.0-test.8 / Build 10108 — 2026-09-24

状态：**第五轮实机反馈后的播放链专项修复；保留 Test7 人物分页和结构化详情元数据；无 Stable。**

### Test6 实机结果
- [实机确认] 海阔原生播放器仍为 `0 kb/s / 00:00`，说明 Test6 静态扫描得到的媒体候选仍不是可直接交付的正片链。
- [实机确认] 原站播放器可以打开，但页面存在大量广告层；此前网页嗅探还曾实际命中过约 16 秒广告，因此不能再把“页面第一个 m3u8 / 任意 m3u8”当正片。
- [实机确认] 详情元数据已经能取到部分分类/系列信息，但被统一混进“标签”区，出现 `日本AV / 有码AV / 麻豆传媒(3580) / >` 等语义混杂和噪声。
- [实机确认] 人物详情 `狐不妖` 已能解析 12 条关联视频，证明人物详情链已经打通；问题收敛为人物作品分页没有继续加载。

### 新增播放事实
- [公开规则确认] 多份当前视色 XBPQ 配置都把 `https://s1.playhls.com/m3u8.php?` 作为专门的“嗅探词”，说明站点真实正片地址更适合从播放器运行时请求中捕获，而不是仅静态扫描详情 HTML。
- [项目指南确认] 海阔 `video://` 支持 `videoRules / videoExcludeRules / blockRules / js / cacheM3u8`，可以限定正片资源特征并排除广告资源。

### Test8 修复
- Test5 Core/Pages、Test6 deviceFix、Test7 pagingMetaFix 全部保持不可变；Test8 新增独立 `playhlsSniffFix` 模块。
- 详情页“立即播放”切换为海阔原生 `video://` 运行时嗅探，不再默认把 Test6 静态候选直接交给播放器。
- 精准模式只接受 `s1.playhls.com/m3u8.php?`；同时通过 `videoExcludeRules / blockRules` 排除 `69lover / realsrv / doubleclick / googleads / /upload/ad / preroll / vast / banner` 等已知广告特征。
- 播放时注入轻量 JS 尝试启动常见 HTML5/DPlayer/Plyr/JWPlayer 播放按钮，让真正媒体请求进入网络链后再由 `videoRules` 捕获。
- 新“播放诊断”保留三档：播放器页精准 playhls → 详情页精准 playhls → 宽松 HLS；Test6 静态候选只作为诊断信息，不再作为默认主播放。
- 延续 Test7 的详情元数据分区：人物 / 分类 / 系列或厂牌 / 编号 / 日期 / 普通标签；过滤 `>`、数量后缀和导航噪声。
- 延续 Test7 的人物详情 `page=fypage` 和原站 next/数字分页识别，目标是突破第一页固定 12 条作品。

### Test8 重点回归
1. 覆盖导入 Test8，设置页确认 `Test 0.1.0-test.8 · Build 10108`。
2. 用本轮同一条失败视频直接点“立即播放”，确认是否能进入真正正片且总时长正常。
3. 若仍失败，进入“播放诊断”，依次测试“精准嗅探播放器页 / 精准嗅探详情页 / 宽松 HLS”，记录哪一档能抓到媒体。
4. 打开 `狐不妖` 等人物详情并持续下滑，确认作品数可以超过首屏 12 条且不会重复第一页。
5. 详情页检查分类、系列/厂牌、人物、编号、日期、普通标签是否各归其位，不再把数量或 `>` 当标签。
6. 上述核心链没有实机通过前不得晋级 Stable。

## 0.1.0-test.7 / Build 10107 — 2026-09-24

状态：**第四轮实机反馈后的数据/UI定向修复；播放链故意保持 Test6，便于隔离回归；无 Stable。**

### Test7 修复
- 人物入口改成 `page=fypage`；人物详情优先读取原站 `next / 下一页 / 数字 2` 等真实分页链接，再推导第 2、3…页。
- 如果分页 URL 不能直接模板化，则逐页跟随真实 next 链，避免再次凭站型猜分页路径。
- 详情元数据从“所有 `/videos/...` 链接都叫标签”改为分层：人物、分类、系列/厂牌、编号、日期、普通标签。
- 过滤 `>`、更多、纯数字和数量后缀等无意义标签项。
- Test7 不改 Test6 播放候选算法，避免人物分页/详情元数据修复和播放修复互相污染。

## 0.1.0-test.6 / Build 10106 — 2026-09-24

状态：**第三轮实机反馈后的定向修复；无 Stable。**

### Test5 实机结果
- [实机确认] Test5 详情可以进入，但标签仍不正确。
- [实机确认] 网页嗅探命中过约 16 秒广告，证明“第一个 m3u8 = 正片”在当前站点失效。
- [实机确认] Test5 人物汇总仍为空；当前视色结构与同站型旧阅读源存在差异。

### Test6 修复
- 同时扫描主容器、整页和 iframe 媒体候选；对前几个 m3u8 实际读取 `#EXTINF` 估算时长，短流强降权。
- 对 `69lover / advert / preroll / banner / promo / vast / ads` 等广告特征额外降权。
- 增加播放诊断页，显示候选来源、时长和评分。
- 标签增加多容器、链接和 `meta keywords` 回退；人物增加 model/star/actor/performer 等链接及纯文本搜索回退。
- 分类改为从当前站点实际 `/videos/...` 链接动态生成，不再把另一站历史 series 表当事实。

## 0.1.0-test.5 / Build 10105 — 2026-09-24

状态：**第二轮实机反馈后的站点契约重建；无 Stable。**

### 已确认问题
- Test4 修复了详情 URL 无协议错误，但播放器仍 `0 kb/s / 00:00`。
- `/models.html + .item.model` 在当前视色为空。
- 分类二级页只显示首屏 12 项，无法继续分页。

### Test5 修复
- Runtime 拆成 `core.js + pages.js`。
- 播放改为主容器 m3u8 → 原始直链 → Header 兼容 → 网页嗅探的分层方案。
- 分类入口显式使用 `page=fypage`。
- 人物页改从视频卡片汇总人物，不再依赖空 `/models.html`。
- 详情开始读取 `contentTag`。

## 0.1.0-test.4 / Build 10104 — 2026-09-24

状态：**首轮实机后的 Parser / URL 合同重建；无 Stable。**

### 实机问题与修复
- [实机确认] 点击视频进入详情曾报 `Expected URL scheme 'http' or 'https' but no colon was found`。
- 业务详情地址由通用 `url` 改成独立 `ss_url`，分类/人物参数使用 `ss_path / ss_title`，并增加 `safeDecode → abs → http(s)` 校验。
- 视频卡片改用 `.item.video` 精确结构；分类保存真实路径模板并随 `fypage` 请求后续页。
- Test1-Test3 链在 Test4 收敛成单一 Runtime，旧 Release 保持不可变。

## 0.1.0-test.3 / Build 10103 — 2026-09-24

状态：**导入兼容修复 Test；无 Stable。**

### 实机问题与修复
- [实机确认] Test2 云口令在导入阶段被海阔提示存在违禁词。
- 安装 Shell 页面名称改为中性语义；中文标题/页面名称使用 JSON Unicode 转义；安装壳图标置空，不直接暴露目标站 favicon。
- Test3 实机确认可正常导入，因此后续 Shell 持续沿用该策略。

## 0.1.0-test.2 / Build 10102 — 2026-09-24

状态：**首个实机交付 Test；无 Stable。**

- 保留 Test1 列表、分类、搜索、人物、详情和播放核心。
- 修正设置页缓存操作语义，取消无法保证清理哈希缓存的误导按钮。
- Test1 Release 保持不可变，Test2 使用独立 patch 提升版本。

## 0.1.0-test.1 / Build 10101 — 2026-09-24

状态：**首个 Test；无 Stable。**

### 初始架构与功能
- [公开规则确认] `shise.me` 与 xchina 系站点具有相近页面族，但后续实机已经证明不能直接把另一站选择器/分类合同当作视色当前事实。
- 首版采用普通 fetch → WebView/X5 会话 → stale cache 请求链，并携带 Cookie / Referer / UA。
- 首页、搜索、分类、人物、详情、推荐、收藏/历史入口、X5 验证和多层播放框架首次建立。
- 初始 Release / Bootstrap / Shell 均只发布在 `asset-core-7f3@main`，没有 `hiker-cloud` 正式依赖。
- 首版未登记 Stable；全链路实机通过前一直保持 Test-first。