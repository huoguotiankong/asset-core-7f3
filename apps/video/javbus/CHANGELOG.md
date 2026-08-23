# JavBus Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、`registry.json` 与当前运行入口。只记录已验证事实；尚未完成海阔实机验证的内容明确标记“待确认”。

## 当前基线
- 程序：JavBus
- App ID：`javbus`
- Stable：`2026081903` / Legacy Local / 冻结保留
- Test：`2.0.0-alpha4` / Build `20004` / Remote Module
- Stable 入口：`javbus_2026081903.txt`
- Test 入口：`apps/video/javbus/javbus_remote_test_v4_b20004.txt`
- Test Bootstrap：`apps/video/javbus/bootstrap_test_v4.js`
- Test Release：`apps/video/javbus/releases/2.0.0-alpha4/release.json`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- Shared JAV Playback Stable：`1.0.0-test.4`
- JavBus 图标：官网 `https://www.javbus.com/favicon.ico`
- 最后登记日期：2026-08-23

## 产品边界
### 原生化范围
- 首页：有码 / 无码 / 欧美、全部影片 / 仅有磁力、搜索、演员、分类、收藏、更多。
- 搜索：番号 / 标题 / 演员 / 厂商关键词并支持翻页。
- 分类：JavBus `/genre`；详情中的 genre / director / studio / label / series 可继续筛选。
- 演员：列表、资料、出演作品、本地演员收藏。
- 详情：封面、标题、日期、时长、导演、制作商、发行商、系列、演员、标签、预览图、相似影片、磁力。
- 预览：详情顶部 `🖼 预览 N` + 独立 `javbusPreview`。
- 磁力：详情顶部 `🧲 磁力` + 独立 `javbusMagnets`；点击复制，长按跨小程序。
- 本地收藏：影片 / 演员独立，并兼容旧 Apollo 收藏一次性读取。

### 第三方在线播放
- JavBus 只传番号给 `shared/jav-playback/manager.js` Stable；禁止复制 Provider Parser 到 JavBus 私有代码。
- 当前 Provider：MissAV / 123AV / Jable。
- shared Playback 当前图标合同：MissAV 原站 favicon；123AV 仓库固定 `shared/jav-playback/assets/123av.svg`；Jable 原站 favicon。

## 数据源 / Parser 合同
### 影片列表与搜索
- 有码 `/`，翻页 `/page/{page}`。
- 无码 `/uncensored`，翻页 `/uncensored/page/{page}`。
- 欧美 `/western`，翻页 `/western/page/{page}`。
- 筛选：`/{typePrefix}/{filterType}/{filterValue}/{page?}`。
- 搜索：`/{typePrefix}/search/{keyword}/{page}&type=1`。
- 列表：`#waterfall .item`、`.photo-frame img`、`.photo-info date`、`.item-tag button`。
- `existmag=mag` = 仅有磁力；`existmag=all` = 全部。

### 详情
- 标题 `.container h3`。
- 大图 `.container .movie .bigImage img`。
- 信息 `.container .movie .info p`。
- 预览 `#sample-waterfall .sample-box`。
- 相似影片 `#related-waterfall a`。

### 演员
- 演员分页必须使用 `/{typePrefix}/actresses/{page}`，第一页也显式 `/1`。
- 列表合同：`.item a`；姓名 `.photo-info span`；头像 `.photo-frame img`。
- alpha1 的 `/actresses` + `.avatar-box` 已由实机证伪：有码/无码/欧美都只得到一个演员，禁止回退。
- 演员详情 `/{typePrefix}/star/{id}`；头像缺失时可用 `/pics/actress/{id}_a.jpg` 兜底。

## 磁力链：已恢复并实机验证
### alpha2 失败事实
- 原站 ABF-377 页面明确存在多条磁力，小程序 alpha2 却返回“暂无磁力资源”，证明问题不在资源本身，而在 AJAX 参数/请求/解析链。

### alpha3 修复合同
- 从详情源码直接提取 `var gid`、`var uc`、`var img`。
- AJAX：`/ajax/uncledatoolsbyajax.php?gid=<gid>&lang=zh&img=<img>&uc=<uc>`。
- Headers：桌面 Chrome UA、详情 Referer、`Cookie: existmag=all`、`X-Requested-With: XMLHttpRequest`。
- Parser：按 `<tr>` + `href="magnet:?xt=urn:btih:..."` 正则恢复磁力标题、大小、日期，并识别高清/字幕。
- 兜底顺序：普通 AJAX fetch → AJAX WebView → 详情 WebView 渲染后扫描 magnet href。

### alpha3 实机验证（2026-08-23 09:42）
- **磁力恢复成功。** ABF-379 独立磁力页实际返回 3 条资源：5.19GB / 2.66GB / 1.73GB，并显示日期和高清标记。
- 大小/日期排序按钮已可见；排序行为仍继续回归观察，但磁力主数据链已不再属于待修问题。
- 从 alpha4 开始，除非出现新的实机回归，**禁止为了 UI 调整改动 alpha3 磁力 Parser / AJAX 主链。**

## 磁力长按跨小程序合同
1. 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
2. PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encodeURIComponent(magnet)>`
3. 123云盘：`hiker://page/diaoyong?rule=123云盘&page=fypage&realurl=<encodeURIComponent(magnet)>`
4. 光鸭云盘：`hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>`
5. 复制磁力。

- 未安装对应小程序时只 toast，不伪造其它入口。
- 用户已明确：JavBus 磁力长按固定为以上四个云盘目标，不再使用“磁力君 / 云盘君”组合。

## 导航 / 页面栈硬规则
- alpha1 把有码/无码/欧美同级 Tab 实现为不断打开新 `hiker://page`，导致返回栈叠加。
- alpha2 已改成 `putMyVar/setItem → refreshPage(false)`。
- 同级 Tab / 排序 / 筛选只刷新当前 Workspace；详情、演员详情、具体分类、磁力页、预览页才属于真正钻取。
- 跨程序事故文档：`docs/INCIDENT_SAME_LEVEL_NAVIGATION_STACK_20260823.md`。

## 实机回归历史
### alpha1
- 首页影片、详情主链、演员详情可运行。
- 暴露演员列表只一人、同级导航压栈、磁力入口埋太深、演员头像和部分图标问题。

### alpha2
- 演员列表 Parser 和同级导航已修。
- 详情顶部磁力入口已出现，详情整体排版改善。
- 预览图能取得。
- 磁力 AJAX 仍失败。

### alpha3（2026-08-23 09:42）
- **磁力已实机恢复成功。**
- 顶部预览入口能打开独立预览页，但独立页使用 `sm.thumb` 缩略图作为 `pic_1_full` 大图，实机明显模糊；详情下方直接点 `pics://sm.src` 原图则清晰。根因已确认是“把缩略图放大显示”，不是源图片质量问题。
- 第三方播放使用 `icon_3` 后，MissAV/Jable 变成超大方块，123AV favicon 为空，整体空间占用过大且视觉失衡。

## alpha4 UI 修复
### 预览页
- `javbusPreview` 的大图从 `sm.thumb` 改为 `C.image(sm.src, detailUrl)`，直接加载原始 sample 图。
- 点击仍保留 `pics://sm.src` 查看原图。
- 详情下方预览缩略图继续使用 thumb，避免无意义加载大量大图；只有独立预览页使用原图。

### 第三方播放
- `icon_3` 已由实机证明不适合三站播放入口：图标过大、留白过多。
- alpha4 改用海阔 `icon_small_3`：一行三列，小图标 + 文字，作为紧凑播放线路条。
- MissAV / Jable 继续原网站 favicon。
- 123AV 改为 Shared Playback 已固定的仓库 SVG，解决 alpha3 中间空白图标。
- 详情播放区只保留简短“第三方在线播放 / 选择线路”，不再额外堆大段说明。

## 详情信息架构：alpha4
1. Hero：封面 + 标题 + 日期 / 时长 / 分区。
2. 主操作：`🧲 磁力 / 🖼 预览 N / ☆ 收藏 / 🌐 原站`。
3. 第三方在线播放：MissAV / 123AV / Jable 紧凑三列。
4. 番号 / 日期 / 时长快捷信息。
5. 核心资料。
6. 演员。
7. 标签。
8. 预览图：前 4 张缩略图 + 查看全部原图。
9. 磁力：最多 3 条快速预览 + 查看全部；详情页不再重复显示磁力排序按钮。
10. 相似影片。

## 收藏 / 状态
- 影片收藏：`hiker://files/rules/JavBus/favorites_videos.json`
- 演员收藏：`hiker://files/rules/JavBus/favorites_actors.json`
- 旧影片收藏：`hiker://files/rules/Apollo/javbus/javbus_video.txt`
- 旧演员收藏：`hiker://files/rules/Apollo/javbus/javbus_actor.txt`
- 主要状态：`javbus_default_type / javbus_mag_mode / javbus_home_type / javbus_search_type / javbus_genres_type / javbus_actors_type / javbus_search_kw / javbus_mag_sort / javbus_fav_kind`。

## 架构与版本
- Stable `2026081903` 冻结，仅作为回退基线。
- 当前 Test：`Remote Shell → Bootstrap → Remote Manager → alpha1 Core/Compat/Runtime → alpha2 → alpha3 → alpha4 → Shared JAV Playback`。
- Test app id `javbus-test` 与未来 Stable Remote state 隔离。
- 每一轮 Test 使用新 Release / Bootstrap / Shell / rule version，不原地覆盖旧 Test 工件。

## 禁止回退
- 禁止恢复 `/actresses` 无页码 + `.avatar-box`。
- 禁止同级 Tab / 筛选 / 排序不断压新页面。
- 禁止把磁力或完整预览入口埋到详情底部。
- 禁止磁力 AJAX 回退到只用封面 rawImg 替代源码 `var img`。
- 禁止为了 UI 调整破坏 alpha3 已实机验证的磁力主链。
- 禁止独立预览页再次用 thumb 充当全宽大图。
- 禁止第三方播放再次使用导致巨型方块的 `icon_3`。
- 禁止 JavBus 私有复制 shared playback Parser。
- 未经实机验证不得晋级 Stable。

## alpha4 实机回归清单
- [ ] 云仓库显示 Test `2.0.0-alpha4 / Build20004`。
- [ ] 设置页显示 alpha4 / Build20004。
- [ ] 顶部“预览 N”进入后，图片清晰度与详情下方点击原图一致。
- [ ] 独立预览页仍可连续查看全部图片。
- [ ] 第三方在线播放变成紧凑一行三列，不再出现巨型图块。
- [ ] MissAV 图标正常。
- [ ] 123AV 固定 SVG 正常，不再空白。
- [ ] Jable 图标正常。
- [ ] 三个播放入口点击能力不退化。
- [ ] ABF-379 磁力仍能返回资源，确认 alpha4 未破坏 alpha3 磁力链。
- [ ] 迅雷 / PikPak / 123云盘 / 光鸭云盘长按调用继续实机验证。
- [ ] 演员列表、同级导航、搜索按钮无回归。

---
## 版本记录
### 2.0.0-alpha4 / Build20004 / 2026-08-23
- alpha3 磁力实机成功后的小范围 UI 修复版。
- 独立预览页改用 sample 原图，解决全宽放大 thumb 导致的模糊。
- 播放入口 `icon_3 → icon_small_3`，改为紧凑三列。
- 123AV 使用 shared Playback 固定 SVG。
- 不修改 alpha3 磁力 Parser 主链。

### 2.0.0-alpha3 / Build20003 / 2026-08-23
- 详情顶部新增独立预览入口。
- 磁力改为源码 gid/uc/img + 正则 Parser + WebView 兜底。
- 磁力长按改为 迅雷 / PikPak / 123云盘 / 光鸭云盘。
- 2026-08-23 09:42 实机确认磁力恢复成功。

### 2.0.0-alpha2 / Build20002 / 2026-08-23
- 修复演员列表只一人、同级导航压栈、搜索按钮、详情磁力入口与演员头像。

### 2.0.0-alpha1 / Build20001 / 2026-08-23
- 首个完整远程重写 Test。

### 2026081903 / 2026-08-19
- 重写前 Stable Legacy Local 基线；冻结保留。
