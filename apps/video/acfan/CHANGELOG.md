# ACFAN Changelog

> 全新重写程序，App ID `acfan`。旧 `apps/video/acfun` 不作为本程序运行依赖；但旧 Stable 中经实机验证成功的协议事实可以作为恢复依据。

## 当前基线
- Test：`0.1.0-test.5 / Build10105 / Shell 2026091910`
- Stable：不存在
- Test Shell：`apps/video/acfan/acfan_remote_test_v5_b10105.txt`
- Bootstrap：`apps/video/acfan/bootstrap_test_v5_b10105.js`
- Release：`apps/video/acfan/releases/0.1.0-test.5/release.json`
- 当前网站终端：`https://aasf.wwvgadm0.work/mobile`
- Test1~Test4 已冻结，不原地覆盖。

## 2026-09-19 · 0.1.0-test.5 · Restore Device-Validated Contracts

### Test4 实机事实
- 用户确认：仅里番分类少量视频能显示封面，其它大部分封面仍为空白。
- 动漫分类、漫画详情/阅读、网站终端等此前问题基本原样，说明 Test3/Test4 的 APK 字符串推断没有命中真实运行合同。

### 根因复核
重新对照旧 ACFun Stable `0.4.9` 及其长期技术记录，确认 Test4 偏离了当时真正实机成功的实现：
1. **图片**：Stable 0.4.2 成功链是 `相对图 → 当前 session imgDomain → 仅 asigoo 封面 _480 + XOR → Dalvik UA + Referer=""`。普通 HTTP/CDN 图片直接显示。Test4 错误地把更多 HTTP 图片统一送解密器，并改变了 jhimage/Referer 处理。
2. **动漫/视频标签**：Stable 0.4.8 当前 APK 1.9.7 主链为 `classTypeList → getTagsZ → tagTitleList`，Zone 仅兼容 fallback。Test4 改成 `getTags` 主链，方向错误。
3. **漫画**：Stable 0.4.7 已实机闭环为 `comics/base/info?comicsId → chapterList → comics/base/chapterInfo?chapterId → domain + imgList`。Test4 使用泛型递归抽目录，破坏了明确主合同。

### Test5 修复
- 图片适配器恢复 Stable 0.4.2 合同：相对图使用 session `imgDomain`；只有 `.asigoo.com` 执行 `_480 + XOR前100字节`；普通图直接返回；Header 恢复 Dalvik UA + 空 Referer；独立 T5 解码页负责明文 magic 判断与缓存。
- 动漫/视频恢复 Stable 0.4.8：`classTypeList/classifyList → getTagsZ → tagTitleList`，Zone/queryVideoByZone 与 `getTags` 仅作兼容后备。
- 漫画恢复 Stable 0.4.7：详情只认 `chapterList` 主目录；章节优先 GET `chapterInfo?chapterId`；正文只认 `domain + imgList` 主结构。
- 视频详情增加 **原生播放优先**：列表/详情已有 path 则直接使用，否则 `GET video/can/watch`，失败再 POST；相对 path 进入 `/api/m3u8/h5/decode?path=`；网页播放降为第二兜底。
- 新增 `ACFAN·T5 实机诊断` 页面，直接输出当前 Host、imgDomain、各频道首批真实图片字段、动漫分类/标签探针和漫画详情/目录探针。后续失败以实机诊断数据为准，不再盲猜。
- 所有页面切换为 `acfanT5*` 独立别名，绕开旧页面缓存。

### Test5 静态门禁
- Provider/Image/ImageDecoder/Playback/UI/Runtime 与页面源片段均通过 JS 语法检查；页面源在加载器中拼接后执行。
- Release JSON、Shell 外层 JSON/嵌套 pages JSON 均已解析通过。
- Test5 仍为 `pending-device-validation`，不得晋级 Stable。

### Test5 实机验收
1. 导入后必须显示 `ACFAN·T5`。
2. 精选、里番、短视频、漫画分别查看多张封面。
3. 动漫检查分类/标签是否恢复，不应再固定卡在旧 Zone 报错。
4. 漫画详情检查 chapterList，打开章节检查 domain+imgList 原图。
5. 视频详情先点“原生播放”；失败再点“网页播放”。
6. 若仍有问题，进入首页“诊断”，复制“运行环境 / 对应频道 / 动漫链探针 / 漫画链探针”反馈。

## 2026-09-19 · Test1~Test4 历史摘要
- Test1：新 ACFAN clean rewrite，建立九频道、搜索、详情、漫画/小说/社区与 H5 终端框架。
- Test2：尝试修封面、Zone 容错、漫画详情和 H5 定位；实机反馈基本无变化。
- Test3：按 APK 1.9.7 静态字符串重建 Provider/字段，并版本化 T3 页面；后续发现部分推断与旧 Stable 实机事实冲突。
- Test4：继续强化当前字段和图片请求合同；实机仅里番少量封面有效，其它关键问题仍未解决，因此冻结。

## 长期协议事实
- 游客认证：`POST user/traveler/`；Header `deviceId / t / s / User-Mark=acfun`；`s=MD5(t.substring(3,8))`。
- `encData`：`token.substring(2,18)` 作为 AES/CBC/PKCS5Padding key/iv。
- 图片成功合同：相对图 + 当前 `imgDomain`；asigoo `_480`; XOR key `2020-zq3-888`, 仅前100字节；先判断 JPEG/PNG/GIF/WebP；Dalvik UA + 空 Referer。
- 漫画成功合同：`comics/base/info → chapterList → chapterInfo?chapterId → domain + imgList`。
- 动漫/视频已验证标签合同：`classTypeList → getTagsZ → tagTitleList`，Zone 兼容 fallback。
