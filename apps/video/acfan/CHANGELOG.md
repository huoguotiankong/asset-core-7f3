# ACFAN Changelog

> 全新重写程序，App ID `acfan`。旧 `apps/video/acfun` 冻结为历史实现，不作为本程序运行依赖。

## 当前基线
- Test：`0.1.0-test.1 / Build10101 / Shell 2026091906`
- Stable：不存在
- Test Shell：`apps/video/acfan/acfan_remote_test_v1_b10101.txt`
- Bootstrap：`apps/video/acfan/bootstrap_test_v1_b10101.js`
- Release：`apps/video/acfan/releases/0.1.0-test.1/release.json`
- 当前网站终端：`https://aasf.wwvgadm0.work/mobile`

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

### 首轮实机验收
1. 首页是否能建立游客会话并正常加载精选。
2. 九频道分别切换；精选/里番 Station、动漫/视频分类分区、漫画 Station、小说/有声标签必须能切换且不叠加返回栈。
3. asigoo 封面至少抽查 6 张；其它普通图片也应正常。
4. 搜索视频、漫画、小说、有声、社区。
5. 视频详情与评论；点击立即播放后 `/mobile` 网站终端能定位目标并出画面。
6. 漫画详情/目录/章节原生阅读。
7. 小说/有声详情/章节；音频存在时可直接播放。
8. 收藏/历史/设置/接口重发现正常。
9. 依据实机截图再做第二轮 UI 密度和信息层级优化。

### 当前边界
- 本会话工具无法直接访问用户提供的动态 `.work` 域名进行网页抓取；首版网站终端按用户明确提供的最新地址配置，并以旧项目中已实机确认的协议事实建立 Provider。
- Test1 未实机验证，不得晋级 Stable。
