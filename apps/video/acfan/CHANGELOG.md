# ACFAN Changelog

> 全新重写程序，App ID `acfan`。旧 `apps/video/acfun` 冻结为历史实现，不作为本程序运行依赖。

## 当前基线
- Test：`0.1.0-test.2 / Build10102 / Shell 2026091907`
- Stable：不存在
- Test Shell：`apps/video/acfan/acfan_remote_test_v2_b10102.txt`
- Bootstrap：`apps/video/acfan/bootstrap_test_v2_b10102.js`
- Release：`apps/video/acfan/releases/0.1.0-test.2/release.json`
- 当前网站终端：`https://aasf.wwvgadm0.work/mobile`
- Test1 已冻结，不原地覆盖。

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
1. **封面解密链**
   - Test1 把 XOR 解码挂在主模块的 `$.require('acfan').decodeImage()` 回调上，算法虽与历史一致，但没有复刻旧 ACFun 已实机成功的独立图片页面合同。
   - Test2 新增独立 `acfanImageDecoder` 页面：`$().image(...) → InputStream → JPEG/PNG/GIF/WebP magic 判断 → 非明文才 XOR 前100字节 → 本地缓存`。
   - asigoo 列表/详情缩略图继续 `_480`；漫画正文新增 original 链，不再强制 `_480`。

2. **动漫/视频分类容错**
   - `video/getZoneListByClassifyId` 降为可选增强层。
   - Zone 失败时继续尝试 `video/tags/getTagsZ`；仍失败则直接 `video/getByClassify`，禁止单个筛选接口拖死整个页面。

3. **漫画详情/阅读**
   - 漫画详情从 `movie_1_vertical_pic_blur` 改为更紧凑的竖图详情，避免空封面把整个首屏撑成大白块。
   - 章节使用 `text_4` 网格；目录为空时明确显示网站阅读入口。
   - 原生漫画正文使用 `I.original()`，保留原图尺寸。

4. **网站终端**
   - 删除“网站终端/仅承担最终授权”等开发说明头，X5 终端尽量占满页面。
   - 注入定位增强为：原生 input value setter → input/change → Enter → form.requestSubmit/form.submit → 搜索按钮 → 标题结果点击 → video/player/reader 检测。
   - 当前仍属于 H5 终端兜底，必须继续实机验证；没有宣称已经解决网站自身路由/授权变化。

5. **UI**
   - 社区无图动态改为文本卡；有图动态改左图卡，减少空白占位。
   - 其它页面继续保持原生同页筛选与统一红色品牌色，后续在图片/播放闭环后继续做视觉精修。

### Test2 静态门禁
- `fix_v2.js / image_decoder.js / runtime.js / bootstrap_test_v2_b10102.js` 已通过 `node --check`。
- Test2 release JSON 与 Shell 外层 JSON / pages JSON 已解析通过。
- Shell version `2026091907` 位于 32 位有符号整数安全范围。

### Test2 实机验收重点
1. 精选/短视频/漫画至少抽查 8 张封面是否恢复。
2. 动漫频道不再因为 Zone 失败整页报错，至少能退化到 class 列表。
3. 漫画详情能看到封面/标题/收藏/网页阅读/章节目录；打开一个章节验证原图正文。
4. 视频详情点击立即播放后，网站终端是否能真正提交搜索、点击目标并进入播放器。
5. 社区无图动态是否不再出现大面积空白图位。
6. 如果图片仍空白，优先检查 `acfanImageDecoder` 页面是否真正被当前 Shell 注册，不再继续改 XOR 算法。

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
- `s = MD5(t.substring(3,8))`。
- 认证响应 Token 用于 `aut`。
- `encData` 使用 `token.substring(2,18)` 作为 AES/CBC/PKCS5Padding key/iv 解密。
- 封面：相对 `jhimage` 通过会话 `imgDomain`；asigoo 封面使用 `_480`，XOR key=`2020-zq3-888`，只 XOR 前100字节，明文图片不得重复 XOR。
- 漫画：`comics/base/info` → 数值 chapterId → `comics/base/chapterInfo`，正文为 `domain + imgList`。
- 小说/有声：`fiction/other/tagList / fiction/base/findList / fiction/base/info / fiction/base/chapterInfo`。
- 社区：`community/dynamic/list`。
- 视频：Station、classType、zone、tag、search、detail、comment 等旧实机已确认接口继续作为协议参考。

### 产品
- 首页九频道：精选 / 里番 / 动漫 / 视频 / 短视频 / 漫画 / 小说 / 有声 / 社区。
- 原生搜索、分类、分区、标签、排序、详情、评论、收藏、历史、设置。
- 漫画章节优先原生图片阅读；小说/有声章节优先原生解析。
- 视频不继承旧项目连续失败的 HLS auth_key 补丁链。首版主播放动作进入当前 `/mobile` 网站终端，让网站前端完成最终播放授权；小程序主界面仍全部为海阔原生 UI。
- 设置页允许随时替换网站最新地址，以应对 H5 换域名。

### 静态门禁
- Test1 所有新增 JS 已通过 `node --check`。
- Shell 内 pages JSON 与应用元数据 JSON 已完成解析检查。
- 壳 version `2026091906` 位于 32 位有符号整数安全范围。

### 当前边界
- 本会话工具无法直接访问用户提供的动态 `.work` 域名进行网页抓取；网站终端按用户明确提供的最新地址配置，并以旧项目中已实机确认的协议事实建立 Provider。
- Test1 首轮实机已确认存在图片、Zone、漫画详情与 H5 定位问题，已由 Test2 接管；Test1 不得晋级 Stable。
