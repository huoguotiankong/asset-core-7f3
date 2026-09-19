# ACFAN Changelog

> 全新重写程序，App ID `acfan`。旧 `apps/video/acfun` 冻结为历史实现，不作为本程序运行依赖。

## 当前基线
- Test：`0.1.0-test.3 / Build10103 / Shell 2026091908`
- Stable：不存在
- Test Shell：`apps/video/acfan/acfan_remote_test_v3_b10103.txt`
- Bootstrap：`apps/video/acfan/bootstrap_test_v3_b10103.js`
- Release：`apps/video/acfan/releases/0.1.0-test.3/release.json`
- 当前网站终端：`https://aasf.wwvgadm0.work/mobile`
- Test1/Test2 已冻结，不原地覆盖。

## 2026-09-19 · 0.1.0-test.3 · APK 1.9.7 Contract Rebuild

### Test2 实机事实
- 用户明确反馈 Test2 与 Test1 相比“基本没有变化”，说明继续围绕旧 Provider 打补丁没有命中真实故障点。
- 实机仍表现为封面空白、动漫分类不可用、漫画详情/正文不正常、网站终端不能稳定定位目标。

### APK 1.9.7 静态证据
重新检查用户上传的 `acfun_1.9.7` APK 后确认：
- 当前 APK 存在 `video/classTypeList`、`video/classifyList`、`video/tags/getTags`、`video/tagTitleList`、`video/getByClassify`。
- 当前 APK **不存在** Test1/Test2 沿用的 `video/getZoneListByClassifyId` 与 `video/tags/getTagsZ` 字符串，因此旧动漫筛选链已经过时。
- 当前 APK 可见图片字段包括 `imageUrl / imgUrl / thumbUrl / posterMainUrl / posterDownloadUrl / verticalImg / backImg / cardImg / dynamicImg / generatedCoverImg / templateCoverImg` 等；Test1/Test2 Provider 未完整覆盖，部分“空封面”实际可能是没有抽取到图片 URL，而不只是 XOR 解密失败。
- APK 仍可见 `2020-zq3-888`、`_480`、`imgDomain` 和 `https://cdn.ukaim.com/`，因此历史 XOR 图片合同仍保留，但必须建立在正确取到当前图片字段的前提上。

### Test3 重构
1. **Provider 按当前 APK 合同重建**
   - 视频/短视频/漫画/小说/有声/社区模型补齐当前字段。
   - 动漫/视频分类改为 `classTypeList → classifyList fallback → tags/getTags → tagTitleList → getByClassify fallback`。
   - 不再调用 APK 1.9.7 已不存在的 Zone / getTagsZ 接口。
   - 社区详情优先 `community/dynamic/dynamicInfo`。

2. **图片链重建**
   - 所有 HTTP 图片统一进入独立 `acfanImageDecoderT3`，先判断 JPEG/PNG/GIF/WebP magic；已经是明文则直接返回，非明文才 XOR 前100字节。
   - asigoo 缩略图使用 `_480`；漫画正文使用 original 链。
   - 补齐当前 APK 的图片字段后再解密，避免把“字段没取到”误判为“算法不对”。

3. **彻底绕开旧页面缓存**
   - 主模块从 `acfan` 改为 `acfanT3`。
   - 详情、搜索、评论、漫画阅读、小说/有声、网站终端、收藏历史、设置全部改为 `acfanT3*` 独立页面别名。
   - Shell 标题改为 `ACFAN·T3`，实机可直接确认是否真正加载了新版本。

4. **UI/详情继续收敛**
   - 主色改为 ACFAN 橙色。
   - 视频/漫画/小说详情统一使用紧凑左图详情，不再让空封面占据整屏。
   - 社区无图内容继续走纯文本卡。
   - 漫画章节使用紧凑网格；正文使用原图链。

5. **网站终端**
   - 保持网站只承担最终播放/阅读授权。
   - 搜索定位继续使用 value setter、input/change、Enter、form submit、搜索按钮和标题匹配多级策略。

### Test3 静态门禁
- `provider_v3.js / image_v3.js / image_decoder.js / playback_v3.js / ui_v3.js / pages_v3.js / runtime.js / bootstrap` 全部通过 `node --check`。
- Release/Test/Channels JSON 已解析通过。
- Shell 外层 JSON 与嵌套 pages JSON 已解析通过。
- Test3 不修改 Test1/Test2 immutable release。

### Test3 实机验收重点
1. 导入后顶部规则名必须明确显示 **`ACFAN·T3`**；若仍显示 `ACFAN·测试版`，说明实际未加载 Test3。
2. 精选、短视频、漫画分别抽查多张封面。
3. 动漫频道不应再出现 `getZoneListByClassifyId` 报错；检查分类与标签数据。
4. 漫画详情应至少显示标题/封面/操作区/目录或明确的网站阅读兜底，再打开章节测试原图正文。
5. 视频详情点击“立即播放”检查网站搜索是否真正提交并进入目标内容/播放器。
6. 如仍有空图，优先记录图片字段与 `acfanImageDecoderT3` 实际回调情况，不再回退旧 Provider。

## 2026-09-19 · 0.1.0-test.2 · First Device Recovery

### Test1 实机事实
用户首轮截图确认：
- 精选、短视频、漫画、社区等列表接口已经能返回真实数据，说明游客会话/API Host/基础 Provider 主链成立。
- 首页、详情、漫画列表等封面全部为空白；视频详情本身能加载标题/播放量。
- 动漫频道被 `video/getZoneListByClassifyId` 的 GET/POST 双失败直接拖成整页“加载失败”。
- 漫画列表有数据，但详情进入后呈现大面积空白，现有 blur 大卡 + 图片失败放大了问题。
- 网站终端可以打开当前 `/mobile`，注入标题也能出现在网站搜索框，但没有可靠触发搜索结果/目标卡片点击，最终播放未闭环。
- 社区列表能出数据，但无图动态仍占据大图片位，信息密度差。

### 根因与修复
- 封面尝试恢复独立 XOR 解码页；动漫/视频 Zone 失败增加降级；漫画详情改紧凑布局；网站终端增强搜索提交；社区无图动态改文本卡。
- Test2 实机反馈“基本没有变化”，因此该方案冻结，由 Test3 的 APK 1.9.7 合同重建接管。

## 2026-09-19 · 0.1.0-test.1 · Clean Rewrite

### 用户目标
- 原旧 ACFun 小程序基本废弃，要求重新设计实现。
- 新程序必须功能完整、UI 精美，不继续在旧补丁链上修修补补。

### 架构
```text
Shell / Bootstrap
→ Core
→ Protocol/Auth
→ Provider/Model
→ ImageAdapter
→ Playback/H5 Terminal
→ Native UI / Pages
→ Runtime
```

### 复用的“已验证协议事实”，不复用旧代码
- 游客认证：`POST user/traveler/`，Header 包含 `deviceId / t / s / User-Mark=acfun`。
- `s = MD5(t.substring(3,8))`；认证响应 Token 用于 `aut`。
- `encData` 使用 `token.substring(2,18)` 作为 AES/CBC/PKCS5Padding key/iv 解密。
- 历史图片合同：asigoo `_480` + XOR key=`2020-zq3-888`，只 XOR 前100字节，明文图片不得重复 XOR。
- 漫画、小说/有声、社区、Station、搜索、详情、评论等接口作为首版协议参考。

### 产品
- 首页九频道：精选 / 里番 / 动漫 / 视频 / 短视频 / 漫画 / 小说 / 有声 / 社区。
- 原生搜索、分类、标签、排序、详情、评论、收藏、历史、设置。
- 漫画章节优先原生阅读；小说/有声章节优先原生解析。
- 视频首版最终授权交给当前 `/mobile` 网站终端，小程序主体保持海阔原生 UI。

### 当前边界
- Test1/Test2 均已被实机证明存在关键问题，不得晋级 Stable；当前仅 Test3 为推荐测试基线。
