# 51吃瓜 CHANGELOG

> 当前恢复入口。Local-First 迁移前的 Test1-Test5 / Stable0.1.0 / 图片 AES、评论、播放、分类、搜索完整历史归档在 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 2026-11-21 · 0.1.1-test.3 / Build10203 · 封面无 URL 的详情元数据回退

### 用户 09:41 实机诊断截图与根因边界
- 用户已打开 Test2 的「51吃瓜 · 封面诊断」，显示「封面修复 Test2」「首页与文章」「封面解析」「无封面 URL」。
- 由此确认 **Test2 诊断程序在手机上已执行**，但该次诊断没有取得第一张有效的 `rawImg`。**不等于首页或文章一定可访问**：旧诊断的 `text_2` 描述没有正常显示，实际文章数、封面数、HTML 长度均不可见。
- 因为地址为空，不能继续把 AES 密钥、CBC 图片解密或 CDN 响应当成当前首要原因。用户的实际结果优先于之前的解析模拟。不能宣称 Test2 修好了封面。
- 再审查了 Core `C.parsePosts`：提取 `/archives/数字/` 文章链接，封面仅搜索本地 HTML 图像及附近上下文。Test2 虽扩展字段，但没有在首页无图时针对单篇文章详情的 `og:image`、`twitter:image`、JSON-LD 等元数据补偿。
- 外部网页检索只能证实官网可索引文章列表，未能直接取得手机同一 HTML 的真实封面字段、图片字节；**详情 metadata 回退仍属于候选修复，不是已实机证实的当前源站协议**。

### Test3 修改
- 新模块 `apps/video/51chigua/releases/0.1.1-test.3/cover_source_patch.js` 放在不可变 Stable 业务链、Test2 Local-First 与 AES 兼容模块之后，尽量只处理封面来源和诊断。
- 首页、分类、搜索渲染前，检查每张文章卡片的原始封面 URL；只有缺失时，有限批量请求同站文章详情（最多 12 个／页；无 batchFetch 时最多顺序 4 个），依次尝试 og:image / twitter:image / 图片 JSON-LD / 视频 poster / 文章正文图片，找不到不借其它文章图片冒充。
- 成功封面按文章路径缓存三天，存储总记录不超过 120，避免频繁重新请求；沿用原 `C.image()` 的 Referer、User-Agent、Cookie 与 Test2 明文识别/AES 回退，不改播放、评论、历史和收藏。
- 改写 `R.imageDiag()`，所有关键数值直接出现在 `text_1.title` 中：HTML 长度、首页状态、文章数量、原始/最终封面数、详情请求与元数据命中、缓存命中、img/source/lazy/og:image/链接等 HTML 结构线索；有样本才展示自动兼容与原始直连两张图片，不上传 HTML、图片、账号信息。
- 新 Local-First 测试缓存 `hiker://files/rules/asset-core-local/51chigua-test/b10203/`，13 JS+7 SVG，共 20 sources；保持 10 层 Stable 业务代码固定原 SHA，Test2 两层及 Test3 修复分别固定独立 Git Ref。
- Test3 Shell rule version `2026112102`，11 页面，独立云口令，不改 Stable0.1.0、Latest、活动 Test1。

### 验证
- 模拟「首页文章链接存在但没有 img，详情页 meta og:image 有图」：能够补齐两列卡片 `rawImg` 和 `img`；重复请求从本地缓存命中，不重复发详情请求。
- 模拟新诊断 `text_1` 直接显示文章/图片/详情请求和图片域名等计数，解决 Test2 数字不显示的诊断缺陷。
- Builder 以固定源码模拟拼接 20 sources，生成 81,085 字节 Runtime，语法通过、旧远程业务源码依赖门禁通过；Bootstrap 与新规则壳构建检查通过。
- **待实机验证**：主页是否确有可用的详情元数据；CDN 请求/图片解密是否有效；首页回退请求耗时；搜索分类、正文图及播放器是否回归。
- 如果 Test3 仍没有封面，只需提供新的「封面诊断 Test3」截图，以数值明确区别 HTML/解析/详情请求/图片显示环节，不继续盲目修改 AES。

### 工件
- Entry: `apps/video/51chigua/releases/0.1.1-test.3/local_entry.js`
- Builder: `apps/video/51chigua/releases/0.1.1-test.3/local_bundle_builder.js`
- Patch: `apps/video/51chigua/releases/0.1.1-test.3/cover_source_patch.js`
- Release: `apps/video/51chigua/releases/0.1.1-test.3/release.json`
- Shell: `apps/video/51chigua/51chigua_remote_test_localfirst_v3_b10203.txt`
- Import: `apps/video/51chigua/cloud_import_test3_cover.js`
- Token: `apps/video/51chigua/cloud_token_test3_cover.txt`

---

## 2026-11-21 · Test2 封面实机失败回报与诊断闭环（不晋级）

### 新实机反馈
- 用户在收到 0.1.1-test.2 / Build10202 云口令后明确回复「封面还是不行」，因此 **Test2 不能标记为封面修复成功**；此前对 JPEG/PNG/WebP/AVIF 等格式进行的仅为模拟验证。
- 用户当前未提供「设置与诊断 → 封面与图片诊断」截图，也没有提供本机显示的 Build10202 信息。不能凭旧截图认定手机实际运行 Test2 新缓存根；也不能把图片故障定性为密钥/防盗链/CDN。
- 已回读 main 的 Shell、Entry、Release 和图片模块：Test2 Shell ruleVersion=2026112101，缓存根 b10202，且公开搜索所见源站仍有文章文本；官方海阔文档规定图片 @js 回调必须返回 InputStream 且在 @headers 之后。Test2 当前确实按此顺序拼接，但手机图片 URL/网络响应仍未知。
- 原补丁的魔数识别依赖 `java.io.BufferedInputStream` 可被宿主 JSEngine 使用，历史 crypto-java 解密 key/iv 和脚本调用路径是否在当前 8.83 真机执行成功没有数据，不再只通过 Node Java mock 假定成立。
- 公开安全扫描曾记录站点还会载入第三方资源域名（例如 pic.gyezbp.cn），但尚未确认它是否为本页文章封面；禁止根据域名名单胡乱替换海阔封面 Host。

### 下一步必须拿到的分阶段证据
- 在 Test2「设置与诊断 → 本地化诊断」确认 Build10202/Runtime ready；核对真正运行版本。
- 在「设置与诊断 → 封面与图片诊断」读取文章条数、有效封面条数、历史加密路径数、资源域名、样本路径及「自动兼容 / 原始直连」图像对照。
- 文章>0但封面0：检查新 HTML 卡片资源字段和提取边界。封面>0且双图空白：优先检查单张图片请求的 HTTP 状态/是否返回图片字节/CDN 与 Referer。原始直连可显示但自动兼容空白：检查图片 AES InputStream/回调本身。两种对照均显示但首页无图：检查首页卡片输出/图片缓存/版本。
- **当前不发布 Test3、不修改 Stable/Latest/活动 Test**；拿到真实诊断结果后做针对性 Test3，避免第三次盲修。

---
## 2026-11-21 · 0.1.1-test.2 / Build10202 · 首页空白封面兼容维修

### 实机反馈（09:14）与版本边界
- 用户提供当前手机截图：首页品牌图标、搜索/分类/收藏/历史入口、分类横条、标题都正常显示，但双列文章卡大面积空白，封面图片未显示。
- 截图并不包含版本/Build，**不能从页面样式推断用户运行的是 Stable0.1.0 还是 Local-First Test1**。本轮继续沿用当前 Test1 的 Local-First 交付架构，并从 Stable 的十层已验证业务模块派生 Test2。
- 经仓库恢复链确认 Stable0.1.0 / Build10106、Latest、活动 Test1 / Build10201 均不修改。
- 目前可访问源站 `https://51cg1.com/` 的首页文章文本仍然存在；尚未能从本地受控请求获得用户设备所见封面实际字节，**不能把“源站明文改造/密钥更换”当成已证实原因**。

### 当前源码中确认的风险点
- Test2 Core 的 `C.image` 对 `/xiao/`、`/upload/upload/` 采取无条件 AES-CBC/PKCS7 解密。若源站某个既有路径改传明文 JPEG/PNG/WebP/AVIF，强制 AES 可能破坏正常图片字节，造成卡片空白。
- 老 `C.firstImage` 优先只识别少数 `img` 属性（`data-xkrkllgl, data-original, data-src, data-lazy-src, src`）和 `loadBannerDirect/loadImage`。较新的 `data-echo/data-image/data-cover/data-srcset/srcset` 及 CSS background-image 无法提取，导致可能存在文章但 `pic_url` 为空。
- 截图尚不足以区分实际根因究竟属于 HTML 抓取、图片响应、防盗链、明文/密文、图片解密兼容或图片组件的缓存。因此本次采用**兼容修复 + 可观察诊断**，不宣称实机已完成。

### Test2 修改
- 在 10 层不可变 Stable 业务链后加载 `final_local_patch.js`（复制 Test1，version/build/root 迁移至 Test2）再加载 `image_compat_patch.js`；原分类、搜索、评论 JSON、详情、DPlayer/HLS、收藏/历史不修改。
- 封面提取新增懒加载字段、`srcset`、CSS 背景与 JS loader 的受限检测，仍以原文章链接附近的卡片片段为准，避免全站错误拼图。保留原有 `@headers` Cookie / Referer / UA。
- 对历史 AES 路径，在海阔 `$().image()` InputStream 内先读取并 reset 短图片头，识别 JPEG/PNG/GIF/BMP/WebP/AVIF/HEIF/ICO/SVG 时原样返回；非明文时沿用原 AES-CBC/PKCS7、旧 key/IV 与内置 `hiker://assets/crypto-java.js`。不在 Renderer 层手工解码 Base64 或关闭 InputStream。
- 新增 `cg51ImageDiag` 原生独立页，「设置与诊断」中可进入：统计首页文章数/提取封面数/加密路径数和主要图片域名，展示一张样本封面的「自动兼容 / 原始直连」两种效果及脱敏路径，不上传私人账号数据。
- 独立 Local-First 缓存根 `hiker://files/rules/asset-core-local/51chigua-test/b10202/`；新增 Test2 Shell 数值规则版本 `2026112101`，共 11 个页面。
- 旧 10 个业务模块和 7 个 SVG 仍固定旧 Source Ref `9bfc77fe270c30bad1228e8a8ea93842c6c9a75f`；Test2 overlay `57fbba3bc1617541d275051611ef10aa73f8d4e6`、图片补丁 `9afe6d4c059f7921bc3b9a414c5d68194b8ef113`，按路径分别 pin，不修改原不可变工件。

### 验证层级与回归
- 通过：新旧链 12 模块语法，模拟 HTML 的 `data-xkrkllgl`、`data-echo`、`srcset`、CSS 背景、JS loader 五种封面提取，以及两个文章条目对应封面 URL 和 `@headers/@js` 构造。
- 通过：模拟 Java BufferedInputStream 对 JPEG/PNG/WebP/AVIF 直接透传，对非图像字节进入原 AES 解密流程；不随意重写 key/iv。
- 通过：完整 Builder 以 19 源构造 73,744 字节 Runtime、12 业务模块 + 7 SVG；Runtime/Bootstrap JS 语法、硬禁私人 GitHub 业务依赖检查。
- **未通过真实安卓实机**：首页封面、详情正文加密图、实际 CDN 响应及 Referer、网络缓存、DPlayer/HLS 播放、收藏/历史点击重入。需要用户 Test2 截图（首页与封面诊断）继续确认。
- 回退：Stable0.1.0 / Build10106，或原 Test1 / Build10201，均未覆盖。

### 交付
- Entry：`apps/video/51chigua/releases/0.1.1-test.2/local_entry.js`
- Builder：`apps/video/51chigua/releases/0.1.1-test.2/local_bundle_builder.js`
- Final Overlay：`apps/video/51chigua/releases/0.1.1-test.2/final_local_patch.js`
- Image Patch：`apps/video/51chigua/releases/0.1.1-test.2/image_compat_patch.js`
- Release：`apps/video/51chigua/releases/0.1.1-test.2/release.json`
- Shell：`apps/video/51chigua/51chigua_remote_test_localfirst_v2_b10202.txt`
- Import：`apps/video/51chigua/cloud_import_test2_image.js`
- 云口令：`apps/video/51chigua/cloud_token_test2_image.txt`

---

## 当前活动边界
- Stable：`0.1.0 / Build10106`，继续冻结，是当前业务稳定恢复基线。
- Latest：仍指向 Stable `0.1.0`，不修改。
- Test：`0.1.1-test.1 / Build10201`，Native Local-First，**基础实机验证已通过**。
- Test Shell：`apps/video/51chigua/51chigua_remote_test_localfirst_v1_b10201.txt`，rule version `2026082526`。
- Previous Test：`0.1.0-test.5 / Build10105`，Stable0.1.0 的晋级来源，继续保留为不可变历史对照。
- 源站入口：`https://51cg1.com/`；动态域名与失败转移逻辑继续沿用 Stable。

## 2026-08-25 · Test1 Local-First 基础实机通过
用户提供当前海阔实机截图，明确显示：

```text
51吃瓜 0.1.1-test.1
Build 10201 · Native Local-First
本地 Runtime 已就绪
Source 9bfc77fe270c · 18 源 · 68653 bytes
```

因此当前可确认：
- Shell 已进入 Build10201 Local-First Test。
- 首次本地包构建已经成功。
- 本地 Runtime 已成功加载。
- 实机识别到预期 18 sources。
- Runtime 实际包大小为 68653 bytes。
- 当前设备运行的 Source Ref 前缀与 Release 预期 `9bfc77fe270c...` 一致。

当前只记为 **basic-local-first-device-validated**。该截图没有逐项证明加密封面/正文图片、分类、搜索、详情、评论、DPlayer/HLS、收藏/历史点击重入等所有业务回归，因此不得把“基础 Local-First 通过”扩大写成“完整业务回归通过”，也不据此自动晋级 Stable。

## 2026-08-25 · 0.1.1-test.1 / Build10201 · Stable-derived Local-First

### 迁移边界
本轮只迁移交付、启动、点击重入与仓库静态资产控制面，不主动修改 Stable0.1.0 已实机验证业务：
- 首页文章流、动态域名、分类与独立搜索。
- `/xiao/`、`/upload/upload/` 图片 AES/CBC/PKCS7 解密链。
- 图文详情与正文图片。
- DPlayer/HLS 结构化媒体提取和海阔原生播放。
- `/comments/<postId>.json` 评论接口、纵向评论与楼中楼。
- 本地收藏、浏览历史、设置/诊断。

`hiker://assets/crypto-java.js` 继续作为海阔内置图片解密依赖，不属于私人 GitHub 远程代码。

### Stable 真实执行闭包
```text
Core Test1
→ Runtime Test1
→ Core Patch2
→ Runtime Patch2
→ Core Patch3
→ Runtime Patch3
→ Core Patch4
→ Runtime Patch4
→ Runtime Patch5
→ Stable Patch
```

除这 10 层外，审计还确认：
1. Stable Shell 每个入口都会远程加载 `Bootstrap → Remote Manager → Release`。
2. 历史 `lazyRule` 会携带 `C.bootstrap`，收藏、播放、站点探测、清理等点击动作可能重新进入远程 Bootstrap。
3. Runtime/Test3/Test4/Test5 使用仓库 `apps/video/51chigua/assets/*.svg` 作为 UI 资产。

### Test1 完整本地闭包
```text
10 个 Stable 业务模块
+ 1 个 Local-First final overlay
+ 7 个 SVG
= 18 sources
```

本地 SVG：`categories / comment / favorite / history / icon / search / web`。

### 新运行链
```text
51吃瓜 Test Shell / rule 2026082526
→ hiker://files/rules/asset-core-local/51chigua-test/b10201/local_entry.js
→ local_bundle_builder.js
→ 首次安装 immutable Source Ref 的 18 sources
→ 每源 marker / 正文校验
→ C.bootstrap 赋值重写 + 仓库资产根本地化
→ 每模块私人仓库残留门禁
→ runtime_bundle.js + local_bootstrap.js + assets/*.svg + bundle_meta.json
→ 后续正常启动 $.require('cg51')
→ require(file:// runtime_bundle.js)
→ Cg51LocalRuntime.module()
```

正常二次启动不再加载 Stable/Test Bootstrap、`libs/updater/remote_manager.js`、远程 Core/Runtime/Patch 或仓库 SVG。51CG 站点 HTML、评论 JSON、图片、HLS、favicon 仍属于正常业务网络。

### Local Bootstrap Shim 与硬门禁
Builder 将历史 `C.bootstrap=<远程 Bootstrap>` 统一重写为 `file://.../b10201/local_bootstrap.js`。Shim 从当前 Runtime 重建 `Cg51Core / Cg51RemoteRuntime / Cg51Boot`，旧 lazyRule 合同继续成立，但不再进入 Remote Manager。

最终 Runtime 禁止残留：
- `raw.githubusercontent.com/huoguotiankong/asset-core-7f3`
- `cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3`
- `github.com/huoguotiankong/asset-core-7f3/raw`
- `libs/updater/remote_manager.js`

### 当前后续验收边界
基础 Runtime 已通过；若未来准备晋级 Stable，再补完整业务回归：
1. 完全退出后二次打开正常。
2. 首页封面、正文加密图片各验证一处。
3. 分类、独立搜索、详情、评论各进入一次。
4. 至少实际播放一个 DPlayer/HLS 视频。
5. 收藏、站点探测、清历史等历史 lazyRule 不得重新进入 Remote Bootstrap/Manager。
6. 条件允许时屏蔽 GitHub/CDN 再重开验证本地代码闭包。

## 恢复与回退
- Stable 恢复入口：`0.1.0 / Build10106`。
- 当前 Local-First Test：`0.1.1-test.1 / Build10201`，基础实机已通过。
- 若后续业务回归发现问题，从 Stable0.1.0 新建更高 Test build；禁止原地覆盖 Test1 immutable 工件。

## 长期不可回退事实
- 51吃瓜 Local-First 完成定义包含 Shell、业务模块、历史 lazyRule 重入和仓库 SVG。
- 图片 AES 属于已验证业务能力，不因交付迁移重写；`hiker://assets/crypto-java.js` 是海阔本地内置依赖。
- 评论 JSON、DPlayer/HLS、分类、搜索、收藏/历史继续以 Stable0.1.0 为业务事实基线。
- Local-First Test 不得顺手重构 Stable Parser/播放/图片协议。
- 实机 Local-First 诊断通过与完整业务回归是两层验收，必须分别记录。

## 历史
- Local-First 前完整历史：`apps/video/51chigua/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
- Stable Release：`apps/video/51chigua/releases/0.1.0/release.json`
- Local-First Test1 Release：`apps/video/51chigua/releases/0.1.1-test.1/release.json`
