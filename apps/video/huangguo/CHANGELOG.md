# 黄果短剧 Changelog

> 程序级长期技术记忆。当前只有 Test，未经过用户实机完整验证，不得晋级 Stable。

## 当前基线

- App ID：`huangguo`
- Test：`0.1.0-test.3 / Build 10103 / Shell 0.1.0-test.3`
- Stable：不存在
- Test Shell：`apps/video/huangguo/huangguo_remote_test_v3_b10103.txt`
- Bootstrap：`apps/video/huangguo/bootstrap_test_v3_b10103.js`
- Release：`apps/video/huangguo/releases/0.1.0-test.3/release.json`
- 交付：不可变版本路径 + direct loader；开发测试优先直接给海阔可识别导入口令，不再要求先经过“我的规则仓库”。

## 2026-09-19 · 0.1.0-test.3 / Build10103 · 首轮实机线路与封面修复

### 实机现象

- 首页/片库在多个频道或标签下只出现同一部《AI换脸…》，榜单也仅有极少数条目，说明页面框架能运行，但实际业务 Host/列表解析结果错误。
- 首页、片库、榜单封面均显示空白占位，说明 Test2 图片回调链未在海阔实机正常完成。
- `动态线路 · 原生页面` 等开发态文案直接暴露在首页，影响成品感。

### 根因与修复

- `[确认]` Test2 的“线路 N”域名正则要求至少两个 `.`，无法识别当前官方发布页公开的 `xovufj.com / cxvwyp.com / zvbucj.com` 这类一级域名，导致线路候选缺失并可能回落到错误外链。
- `[确认]` Test2 使用 `huangguo_endpoint_v1` 缓存；即使代码修正，只要旧错误 Host 仍缓存，也会继续复现。因此 Test3 改为 `huangguo_endpoint_v2`，首次导入自动避开 Test2 错误缓存，同时“重新检测线路”会清理 v1/v2。
- Discovery 新增 `huangguo21.com`，并保留当前三条直连线路和 `huangguo.me` 作为候选；线路正则改为支持任意合法域名层级。
- 业务 Host 不再只看单个 marker，改为对 `/recommend/1/` / 首页进行结构评分；至少要出现足量 `hg-drama-card / hg-rank-item / hg-card-grid / search / recommend` 特征才通过，避免再次接受只有一两条演示数据的假业务页。
- Provider 对齐附件书源并扩大容错：优先 `.hg-card-grid&&.hg-drama-card` / `.hg-rank-list&&.hg-rank-item`，同时支持 `detail/video/play/drama/ep` 详情路径及 `data-src/data-original/data-lazy-src/src/srcset` 图片字段。
- ImageAdapter 不再直接使用自写 Java `Cipher` 链，改用海阔成熟规则已使用的 `hiker://assets/crypto-java.js`，算法保持 `AES/CBC/NoPadding`、Key `f5d965df75336270`、IV `97b60394abc2fbe1`；明文 JPEG/PNG/GIF/WebP 先透传。
- 首页开发态副标题改为普通页码信息。
- 状态：**Test3 已发布，等待第二轮实机验证；不得晋级 Stable。**

### Test3 回归重点

1. 覆盖导入 Test3 后，推荐/最新/AI短剧/AI漫剧/AI换脸/AI魔改不应再只剩同一部作品。
2. 首页、片库、榜单至少抽查 6 张封面，确认不再统一空白。
3. 设置页应显示 `Test 0.1.0-test.3 · Build 10103`，当前线路应是实际业务域名而不是 `huangguo.com` 品牌页。
4. 片库至少测试后宫/熟女/系统/奇幻；榜单测试热播/推荐/潜力；专题至少进入一个列表。
5. 数据和图片通过后再继续二级详情、选集、播放与 UI 密度第二轮优化。

## 2026-09-19 · 0.1.0-test.2 / Build10102 · 动态线路误判加固

- Test1 冻结，不原地覆盖。
- 发现 `huangguo.com` 品牌落地页仅凭“黄果/短剧”文案可能误通过弱校验，因此在首次实机前主动升 Test2。
- Endpoint Discovery 现在优先只消费发现页里的“线路 N”候选；只有没有线路候选时才检查普通外链，并显式排除 `huangguo.com / huangguoai.ai` 两个发现/品牌入口自身。
- 业务 Host 校验收紧为 `hg-drama / hg-card-grid / /recommend/ / /search/video/` 等真实内容结构，不再把品牌文案当业务有效性证据。
- Provider / Image / Playback / UI / Pages 主体仍复用 Test1 不可变模块；只新增 Core、Settings Patch 与 Runtime，降低变更面。
- Settings 诊断版本同步为 Test2 / Build10102。
- 状态：实机发现数据稀疏与封面失败，已由 Test3 取代。

## 2026-09-19 · 0.1.0-test.1 / Build10101 · 初始测试版

### 证据与边界

- `[源码确认]` 用户上传的“黄果短剧”书源使用 `https://huangguoai.ai/` 作为线路发现入口，从页面“线路 N”中提取真实业务域名，并缓存可用线路。
- `[源码确认]` 网页内容结构包含 `hg-drama-card / hg-rank-item`，支持推荐、最新、题材标签、热播/推荐/潜力榜、专题、AI短剧、AI漫剧、AI换脸、AI魔改与 `/search/video/<keyword>/` 搜索。
- `[源码确认]` 封面算法为 AES/CBC/NoPadding；Runtime 采用独立 ImageAdapter，并先识别 JPEG/PNG/GIF/WebP，明文直接透传，密文再解密。
- `[源码确认]` 播放页优先从页面 `videoSrc` 结构化字段提取媒体地址；首版同时提供 `<source>`、m3u8/mp4 源码扫描，最终才降级 `video://`。
- `[网页确认]` `https://huangguo.com/` 当前是黄果短剧品牌落地页，不把它直接当作固定业务 Host。
- `[APK 静态确认]` `hgdj1.0.5.apk` 为 Flutter 客户端，可见 playlet 分类、详情、章节、推荐、搜索、评论、收藏/点赞、权限解锁等 endpoint 字符串，同时出现 `X-Device-Fingerprint` 等协议线索。由于签名/设备指纹/响应加密合同尚未完整确认，**Test1 不把这些 APP API 伪装成已可用能力**。

### Product / UI

- Home：搜索 → 六个频道原地切换 → 片库/榜单/专题/我的 → 继续观看 → 内容 Feed。
- Library：12 个题材标签使用 `flex_button` 同页切换，禁止反复 push 新页面。
- Rank：热播/推荐/潜力三 Tab，使用 `movie_1_vertical_pic` 展示评分、标签、热度等 metadata。
- Topics：精品高分 / 灵异诡事 / 魔改电视剧使用横图语义卡进入独立专题列表。
- Search：idle 显示历史词；querying/result/empty 分离。
- Detail：Hero → Primary Play → 简介 → 标签 → 选集 → 低频操作 → 相关推荐。选集网格只放真实 Episode，收藏/官网/设置不进入播放器列表。
- Mine：本地收藏与观看历史。
- Settings：海报布局、线路重发现、本地数据清理、脱敏诊断。
- Design：芒果黄 `#F6B73C` 为唯一主强调色；正式导航图标使用仓库版本化 SVG。

### 架构

```text
Shell
→ bootstrap_test_v1_b10101.js
→ core.js
→ provider.js
→ image.js
→ playback.js
→ ui.js
→ pages.js
→ runtime.js
```

- `Core`：last-good endpoint、请求重试、参数恢复、本地收藏/历史/搜索、诊断。
- `Provider`：网页 HTML → 标准 Card/Detail/Episode Model。
- `ImageAdapter`：明文识别 + AES/CBC/NoPadding。
- `PlaybackAdapter`：`videoSrc`/源码结构化直链优先，`video://` 最终兜底。
- `Pages/UI`：只消费标准模型，不散落域名/AES/播放解析。

### 待后续

- APP API 的签名、设备指纹、请求/响应加密与账号 Session 完整逆向。
- 协议确认后再评估评论、点赞、APP 原生推荐/搜索与账号收藏是否作为 P2 Provider 接入。
- Test3 实机通过后再创建 Candidate/Stable，不直接把首版设为正式版。
