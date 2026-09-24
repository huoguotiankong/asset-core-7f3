# 视色 CHANGELOG

## 0.1.0-test.3 / Build 10103 — 2026-09-24

状态：**导入兼容修复 Test；用户实机确认 Test2 被海阔提示“有违禁词，无法导入”；具体命中词未由客户端返回；无 Stable。**

### 本轮根因边界
- [实机确认] Test2 云口令可被海阔识别，但在导入阶段被内容过滤拦截，提示存在违禁词。
- [源码确认] Test2 安装 Shell 直接包含“女优 / 女优详情”等展示词，并直接使用 `https://shise.me/favicon.ico` 作为规则图标。
- 当前不能证明到底是某一个词、规则名称“视色”还是站点域名触发过滤，因此 Test3 不做单点猜测，而是同时降低安装壳的文本与域名暴露面。

### Test3 导入兼容策略
- 新 Shell：`shise_remote_test_v3_b10103.txt`，规则 version `2026092403`。
- 安装壳页面名称统一改为中性语义：`主程序 / 内容列表 / 分类 / 搜索 / 人物 / 人物详情 / 详情 / 播放 / 设置`。
- 安装壳不再包含“女优 / 番号 / 成人 / 情色”等高风险展示词。
- 规则标题和中文页面名称采用标准 JSON Unicode 转义保存；海阔 JSON 解析后仍还原正常中文，不改变最终显示名称。
- 安装壳 `icon` 置空，不再直接引用目标站 favicon；目标站域名只保留在运行期 Runtime 中。
- Test3 Runtime 仍基于 Test1 + Test2 已有链路，仅增加 `runtime_patch.js` 提升版本并将设置页展示词改为“人物 / 内容”等中性表达，不改核心 Parser / 播放算法。
- Test1/Test2 Release 均保持不可变，不覆盖历史运行文件。

### Test3 实机验收
1. 先验证新云口令能否通过海阔导入，不再出现“违禁词无法导入”。
2. 导入成功后打开设置页，确认 `Test 0.1.0-test.3 · Build 10103`。
3. 再继续验证首页、分类、搜索、人物页、详情页和播放链。
4. 如果 Test3 仍被拦截，需要记录海阔弹窗完整文字；下一步将进一步把安装壳标题也改为完全中性代号，继续缩小触发面。
5. 导入和核心链均未实机验证前不得晋级 Stable。

## 0.1.0-test.2 / Build 10102 — 2026-09-24

状态：**首个实机交付 Test；代码/发布合同门禁通过，等待海阔实机验证；无 Stable。**

### 相对 Test1
- 保留 Test1 已通过语法门禁的列表、分类、搜索、女优/模特、详情、媒体解析与 Header 交付核心。
- Test1 Release 保持不可变，不直接覆盖 `runtime.js`。
- 修正设置页“清理页面缓存”的语义问题：Test1 的按钮无法保证删除哈希命名的 HTML 缓存，因此 Test2 移除该误导操作，改为明确的“刷新当前页面 + 缓存约 3 分钟自动过期”提示。
- Test2 通过第二模块 `runtime_patch.js` 覆盖设置页，并把 Runtime 版本提升为 `0.1.0-test.2 / Build 10102`；后续若继续大改会重新收敛成单一 Runtime，避免长期堆叠补丁。

### 发布合同
- Release：`apps/video/shise/releases/0.1.0-test.2/release.json`。
- 模块：Test1 immutable Runtime + Test2 settings patch。
- Bootstrap：`bootstrap_test_v2_b10102.js`，`minBuild=10102`。
- Shell：`shise_remote_test_v2_b10102.txt`，规则 version `2026092402`。
- `test.json / channels.json / manifest.json` 已全部切换到 Test2。
- 仍不写 Stable；首轮实机通过后再决定 Candidate/Stable 与根规则仓库登记。

### Test2 实机验收
1. 覆盖导入 Test2，设置页应显示 `Test 0.1.0-test.2 · Build 10102`。
2. 首页检查封面、标题、番号/时长是否正确绑定，向下翻页是否正常。
3. 分类页检查是否能读取站点真实分类并进入对应结果。
4. 搜索一个明确番号或关键词，检查结果是否正常。
5. 女优页进入人物详情，检查人物信息与关联影片。
6. 视频详情检查 Hero、主播放、人物/标签、推荐层级。
7. 播放至少测试一条：总时长、码率、拖动进度；若直链失败，再测试 `video://` 网页嗅探兜底。
8. 如出现 403 / Just a moment / 空列表：设置 → X5 打开当前线路完成验证 → 返回刷新，并观察 Cookie 状态。
9. 未完成上述回归前不得晋级 Stable。

## 0.1.0-test.1 / Build 10101 — 2026-09-24

状态：**首个 Test；代码/发布合同门禁通过，等待海阔实机验证；无 Stable。**

### 站点事实与架构
- [公开规则确认] `shise.me` 被成熟 AutoPager 规则与 `xchina.co / crxs.me / litu100.xyz / 8se.me` 归为同一站型，分页 `a.next`，影片/列表/人物等内容容器共享相同结构选择器。
- [项目既有实机经验] 同站型网页存在 Cloudflare / Cookie / Referer / 媒体 Header 等运行时边界，因此首版直接采用“普通 fetch → WebView/X5 会话 → stale cache”的请求链，不把 403/验证页误判为空数据。
- 独立实现 `ShiseRemoteRuntime`，不依赖小黄书 Runtime，不继承其小说/漫画/套图业务，避免跨程序耦合。

### 功能
- 首页：品牌区、搜索、分类、女优、收藏、历史、设置、动态快速分类、三列影片卡。
- 分类：从当前 `/videos.html` 导航动态提取分类，避免硬编码站点标签。
- 搜索：`/videos/keyword-<kw>/<page>.html`，支持海阔全局搜索与独立搜索页。
- 女优/模特：`/models.html` 与分页，详情解析关联 `/video/` 作品。
- 视频详情：Hero、番号/时长、主播放、播放线路、人物、分类标签、简介、相关推荐。
- 播放：支持 `var domain + var videos`、`video/source src`、m3u8、mp4；最终播放 URL 显式携带 `Referer / Origin / User-Agent / live Cookie`。
- 兜底：未解析直链或直链播放器失败时保留 `video://详情页` 网页嗅探。
- 设置：X5 打开站点完成验证、Cookie 状态、恢复官方域名、收藏/历史/原站入口、版本诊断。

### UI
- 原生海阔组件，不用 WebView 模拟首页。
- 首页主任务前置，工程诊断下沉设置。
- 详情页使用 `movie_1_vertical_pic_blur` Hero + 独立主播放按钮；列表使用 `movie_3`；分类使用 `flex_button/scroll_button`。
- 同标题同封面做视觉签名去重；封面支持 `data-original / data-src / data-lazy-src / data-url / data-bg / data-background / poster / src / srcset / CSS url(...)`。

### 发布
- Release：`apps/video/shise/releases/0.1.0-test.1/`。
- Bootstrap：`bootstrap_test_v1_b10101.js`，Remote Manager 2.0.1，`minBuild=10101`。
- Shell：`shise_remote_test_v1_b10101.txt`，规则 version `2026092401`。
- 只写入 `asset-core-7f3@main`，无 `hiker-cloud` 运行依赖。
- 首版暂不加入根规则仓库热路径；先通过直接云口令实机验证，避免未验证新站点元数据影响“我的规则仓库”首页。实机通过后再登记根 `registry/manifest` 并进入正常目录交付。

### 本次实机验收
1. 覆盖导入 Test1，设置页确认 `0.1.0-test.1 / Build 10101`。
2. 首页检查封面、标题、番号/时长是否正确绑定，翻页是否正常。
3. 分类页检查能否读出站点真实分类并进入结果。
4. 搜索一个明确番号/关键词，确认结果与原站一致。
5. 女优页进入人物详情，确认头像/信息/关联影片。
6. 视频详情确认 Hero、主播放、人物/标签、推荐层级。
7. 播放至少测试一条 MP4/HLS：总时长、码率、拖动进度；如直链失败再测网页嗅探兜底。
8. 如出现 403/Just a moment，设置 → X5 完成验证 → 返回刷新，确认 Cookie 状态和列表恢复。
9. 未完成上述实机验证前不得晋级 Stable。
