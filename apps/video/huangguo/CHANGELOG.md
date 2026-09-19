# 黄果短剧 Changelog

> 程序级长期技术记忆。当前只有 Test，未经过用户实机完整验证，不得晋级 Stable。

## 当前基线

- App ID：`huangguo`
- Test：`0.1.0-test.5 / Build 10105 / Shell 0.1.0-test.5`
- Stable：不存在
- Test Shell：`apps/video/huangguo/huangguo_remote_test_v5_b10105.txt`
- Bootstrap：`apps/video/huangguo/bootstrap_test_v5_b10105.js`
- Release：`apps/video/huangguo/releases/0.1.0-test.5/release.json`
- 交付：不可变版本路径 + direct loader；开发测试直接提供海阔可识别完整导入口令。

## 2026-09-19 · 0.1.0-test.5 / Build10105 · 封面、搜索与播放器收敛

### 第二轮实机现象

- 列表数据已恢复为多条真实短剧，说明 Test3/4 的线路与 Provider 修复有效。
- 所有封面仍为空白占位；用户明确指出附件书源已能成功解密同站封面。
- 首页搜索框右侧显示“搜索短剧、剧情、关键词”，占用过宽，输入体验差。
- 播放可打开，但播放器出现“立即播放 / 剧情简介”等多余播放列表项。

### 证据与根因

- `[附件源码确认]` `bookSource_黄果短剧.json` 的 `coverDecodeJs` 为 `AES/CBC/NoPadding`，Key `f5d965df75336270`，IV `97b60394abc2fbe1`，对图片响应字节直接解密。
- `[附件源码确认]` 章节正文/播放只从页面严格提取 `"videoSrc":"...",`，没有网页播放器兜底。
- `[海阔成熟规则确认]` 同一 Key/IV 的既有小程序使用 `$().image(function(){ ... })` 生成图片处理后缀，再以 `imageUrl + suffix` 方式交给海阔图片加载器。
- Test4 使用 `$(url,{headers}).image(...)` 作为完整 URL，和成熟规则的后缀式调用不同；实机封面仍失败，因此 Test5 改为完全同型的 `$().image` 后缀式解密。
- Test1-4 播放适配器在 `videoSrc` 解析失败时回退 `video://页面地址`；这会把网页本身交给海阔通用解析器，从而把页面中的“立即播放/剧情简介”等节点混入播放器列表。

### Test5 修改

- ImageAdapter：`img = 原图 URL + $().image(decrypt callback)`；回调内使用 `hiker://assets/crypto-java.js`，`AES/CBC/NoPadding`，与附件算法一致。
- PlaybackAdapter：只接受页面 `videoSrc` 真实媒体直链；支持 `\\u0026`、转义斜杠和协议相对 URL；彻底移除 `video://` 网页兜底。解析失败时明确 Toast，不再伪成功。
- Search：首页和搜索页输入框右侧标题统一缩为“搜索”。
- 继续复用 Test3 已验证出数据的 Core/Provider，避免同时重动线路与解析层。
- 状态：**当前推荐测试版，等待第三轮实机验证。**

### Test5 回归重点

1. 首页至少抽查 6 张封面；片库/榜单再各抽查 2 张，确认 AES 图片实际显示。
2. 搜索框右侧应只显示“搜索”，输入区域明显变宽。
3. 任意两部短剧各播放 1 集：播放器应直接进入真实媒体，不再出现网页派生的多余列表。
4. 若某集 Toast“视频直链解析失败”，记录剧名与集数；不要恢复 `video://` 兜底，后续只扩展真实媒体字段解析。
5. 三项通过后继续处理详情页、选集密度与整体 UI 第二轮美化。

## 2026-09-19 · 0.1.0-test.4 / Build10104 · 图片 Header 合同尝试

- Test4 继续复用 Test3 线路/Provider，只替换 ImageAdapter 与 Runtime。
- 封面尝试 `$(url,{headers}).image(InputStream)` + `crypto-java` AES/CBC/NoPadding，并保留明文图片头透传。
- 第二轮实机证明：列表数据已正常，但封面仍全空白，因此该图片挂载形态对本程序无效；已由 Test5 取代。

## 2026-09-19 · 0.1.0-test.3 / Build10103 · 首轮实机线路与列表修复

- Test2 实机首页/片库只剩同一部作品、榜单极少条目，确认业务 Host 误选。
- 修复“线路 N”域名解析，支持当前一级域名；升级 endpoint cache key，摆脱旧错误缓存。
- 加强业务 Host 结构评分，Provider 对齐附件 `.hg-card-grid / .hg-drama-card / .hg-rank-item` 与多种 lazy-image 字段。
- 首页开发态文案移除。Test3 未交付即由 Test4 取代。

## 2026-09-19 · 0.1.0-test.2 / Build10102 · 动态线路误判加固

- 冻结 Test1；排除 `huangguo.com / huangguoai.ai` 品牌/发现页本身，尝试优先线路候选。
- 实机后确认仍有线路识别缺陷，已由 Test3 修复。

## 2026-09-19 · 0.1.0-test.1 / Build10101 · 初始测试版

### 初始能力

- 推荐/最新/AI短剧/AI漫剧/AI换脸/AI魔改六频道。
- 12 个题材标签、热播/推荐/潜力榜、三类专题、搜索、详情、选集、收藏、历史、设置。
- `[APK 静态确认]` `hgdj1.0.5.apk` 可见 playlet 分类、详情、章节、推荐、搜索、评论、收藏/点赞、权限解锁等 endpoint，以及 `X-Device-Fingerprint`。签名/设备指纹/响应加密合同未完整确认前，不接入为已可用功能。

### 待后续

- Test5 实机通过后再做详情/选集/UI 密度优化。
- APP API 签名、设备指纹、请求/响应加密与账号 Session 完整逆向后，再评估评论、点赞、APP 原生推荐/搜索与账号收藏。
- 未完成实机回归前不创建 Stable。
