# 小黄书 Test9 开发记录

## 0.1.0-test.9 / Build 10109 — 2026-09-24

状态：**当前 Test；依据用户上传 `✈️ 小黄书-夜明空` 阅读源重新建立协议层，等待海阔实机验证；无 Stable。**

### 本轮实机事实
- Test7 视频仍进入播放器后 `0 kb/s / 00:00`，强制拼接 Header 的播放器主链不能继续视为有效。
- Test7 视频列表封面正常，但漫画、套图仍大量空白，说明继续扩大通用邻域猜图不是正确方向。
- 用户要求参考项目来源里的小黄书阅读书源重新升级，并希望视频尽量免嗅、UI 增加图标。

### 上传阅读源确认的真实契约
- 主站 `https://xchina.co/`；漫画站 `https://litu100.xyz`；发布页 `https://xiaohuangshu.me`。
- 列表封面不是优先找普通 `<img>`，而是读取卡片 `.img@style`，从 `url('...')` 取真实封面地址。
- 阅读源对列表/详情封面使用主站 Referer；漫画正文图片才使用漫画独立域 Referer。
- 小说正文 `.fiction-body@p@html`；漫画 `.comic-img-box@html`；套图 `.photo-image@html`；自拍 `.amateur-image@html`。
- 视频与套图附带视频从 `main-container` 读取：quoted m3u8 优先；没有 m3u8 时读取 `var domain + var videos`。
- 搜索与发现页路由已按阅读源当前脚本重新迁入。
- 阅读源 2025-11-04 的视频修复最终把真实媒体 URL 直接交给视频类型，不存在 Test7 那套强制 `Origin/Referer/Cookie` 播放包装主链。

### Test9 重建
- 不再以 Test4/Test7 Runtime 做字符串 Patch，改为 `categories → categoryFix → core → pages` 的显式模块链。
- 列表卡片按 `fiction/photo/comic/amateur/video` 的真实 item 结构解析，封面严格优先 `.img&&style`。
- 封面最终统一附主站 Referer；漫画正文图片继续使用 `litu100.xyz` Referer。
- 视频主操作改为 `▶️ 免嗅直连`，首先交付阅读源解析出的原始媒体 URL；播放线路页另保留 Header 兼容和 `video://` 嗅探用于诊断/回退。
- 首页/分类/设置增加内容语义图标；完整迁入阅读源的小说、漫画、套图工作室/专辑、视频系列分类。
- Test9 使用独立 `xc_t9_*` 状态/缓存命名空间，Shell rule version `2026092403`，Bootstrap `minBuild=10109`。

### 发布边界
- Test9 已更新 app-local `test.json / channels.json / manifest.json`。
- Stable 仍不存在；根规则仓库展示卡暂不切 Test9，首次回归通过前使用完整云口令覆盖导入，避免把未验证版本扩散到目录热路径。

### 实机验收
1. 设置页确认 `Test 0.1.0-test.9 · Build 10109`。
2. 首页分别切套图、漫画，确认封面恢复；若仍空白，截图并进入对应原站页面核对图片实际 URL/Referer。
3. 视频详情先测 `▶️ 免嗅直连`：必须出现真实码率、真实总时长、进度可持续推进。
4. 免嗅失败时进入“播放线路”，依次测试 `免嗅 1 → Header 兼容 1 → 网页嗅探兜底`，用于锁定媒体交付层。
5. 回归小说搜索/目录/正文、漫画章节/正文、套图分页与附带视频、分类页和 X5 验证。
6. 未完成实机核心链验证前不得晋级 Stable，也不切根规则仓库卡。
