# JavBus Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、`registry.json` 与当前运行入口。只记录已验证事实；尚未完成海阔实机验证的内容明确标记“待确认”。

## 当前基线
- 程序：JavBus
- App ID：`javbus`
- Stable：`2026081903` / Legacy Local / 冻结保留
- Test：`2.0.0-alpha3` / Build `20003` / Remote Module
- Stable 入口：`javbus_2026081903.txt`
- Test 入口：`apps/video/javbus/javbus_remote_test_v3_b20003.txt`
- Test Bootstrap：`apps/video/javbus/bootstrap_test_v3.js`
- Test Release：`apps/video/javbus/releases/2.0.0-alpha3/release.json`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- JavBus 图标：官网 `https://www.javbus.com/favicon.ico`（Test/云仓库；旧 Stable 工件冻结不原地覆盖）
- 最后登记日期：2026-08-23

## 2.0 产品边界
### 原生化范围
- 首页：有码 / 无码 / 欧美、全部影片 / 仅有磁力、搜索、演员、分类、收藏、更多。
- 搜索：番号 / 标题 / 演员 / 厂商关键词并支持翻页。
- 分类：JavBus `/genre` 体系；详情里的 `genre / director / studio / label / series` 可继续筛选。
- 演员：演员列表、演员资料、出演作品、演员收藏。
- 详情：封面、标题、发行日期、时长、导演、制作商、发行商、系列、演员、标签、预览图、相似影片、磁力资源。
- 预览：详情顶部显式 `🖼 预览` 入口 + 独立 `javbusPreview` 页面；详情下方只保留少量预览缩略图。
- 磁力：详情顶部显式 `🧲 磁力` 入口 + 独立 `javbusMagnets` 页面；点击复制，长按调用指定云盘小程序。
- 本地收藏：影片与演员独立；兼容迁移旧 Apollo 收藏。
- 论坛/原站：未知社区协议不强行原生化，保留网页兜底。

### 第三方在线播放
- JavBus 只传番号给共享 `shared/jav-playback/manager.js` Stable，不在 JavBus 内复制 Provider Parser。
- 当前共享 Stable SDK：`1.0.0-test.4`。
- 当前 Provider：MissAV / 123AV / Jable。
- alpha3 详情播放区改成三列图标宫格，图标直接使用各原网站 favicon：
  - MissAV：`https://missav.live/favicon.ico`
  - 123AV：`https://123av.com/favicon.ico`
  - Jable：`https://jable.tv/favicon.ico`
- 图标显示仍需 alpha3 海阔实机确认；播放解析能力继续由 shared playback 负责。

## 数据源 / Parser 合同
### 影片列表与搜索
- 有码 `/`，翻页 `/page/{page}`。
- 无码 `/uncensored`，翻页 `/uncensored/page/{page}`。
- 欧美 `/western`，翻页 `/western/page/{page}`。
- 筛选：`/{typePrefix}/{filterType}/{filterValue}/{page?}`，主要 `star / genre / director / studio / label / series`。
- 搜索：`/{typePrefix}/search/{keyword}/{page}&type=1`。
- 列表：`#waterfall .item`、`.photo-frame img`、`.photo-info date`、`.item-tag button`。
- `existmag=mag` = 仅有磁力；`existmag=all` = 全部。

### 影片详情
- 标题 `.container h3`。
- 大图 `.container .movie .bigImage img`。
- 信息 `.container .movie .info p`。
- 预览图 `#sample-waterfall .sample-box`。
- 相似影片 `#related-waterfall a`。

### 磁力：alpha3 重点恢复链
- alpha2 实机已确认：JavBus 原站 ABF-377 页面存在多条磁力，而小程序独立磁力页返回“暂无磁力资源”。因此“影片无磁力”已被证伪，问题在小程序 AJAX 参数/请求/解析链。
- 详情源码存在三个磁力关键变量：`var gid = ...;`、`var uc = ...;`、`var img = '...';`。
- alpha1/alpha2 只使用 `gid/uc` + 解析后的 `detail.rawImg`。alpha3 改为**优先直接提取源码原始 `img` 变量**，与维护中的 JavBus 实现一致。
- 当前 AJAX 合同：`https://www.javbus.com/ajax/uncledatoolsbyajax.php?gid=<gid>&lang=zh&img=<encodeURIComponent(img)>&uc=<uc>`。
- 请求头：桌面 Chrome UA、`Referer=<影片详情>`、`Cookie: existmag=all`、`X-Requested-With: XMLHttpRequest`、Accept/Accept-Language。
- 解析不再依赖单一 DOM 选择器；alpha3 直接按 `<tr>` + `href="magnet:?xt=urn:btih:..."` 正则恢复 title/size/date，并从行文本识别高清/字幕。
- 后级兜底顺序：普通 AJAX `fetch` → AJAX `fetchCodeByWebView` → 详情页 WebView 渲染后扫描 magnet href。
- alpha3 空结果会显示 `gid / uc / img是否取得 / AJAX响应字节数`，便于继续定位；该诊断只在失败时展示。
- **alpha3 磁力恢复是否彻底成功仍必须由用户海阔实机确认。**

### 演员：alpha2 已修正
- 演员列表分页入口固定为 `/{typePrefix}/actresses/{page}`，第一页也必须显式 `/1`。
- 列表结构：`.item a`；姓名 `.photo-info span`；头像 `.photo-frame img`。
- alpha1 使用 `/actresses` + `.avatar-box`，实机结果是有码/无码/欧美均只解析到一个演员；该方案已证伪，禁止回退。
- 演员详情仍为 `/{typePrefix}/star/{id}`。
- 演员详情头像若页面结构未解析到图片，使用官网 `/pics/actress/{id}_a.jpg` 命名规则兜底。

## 磁力长按跨小程序合同
> alpha3 按用户明确要求，只保留以下四个播放/离线目标，并复用此前 JavDB 已恢复的真实海阔调用合同；不再使用 alpha1/2 的“磁力君/云盘君”组合。

1. 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
2. PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encodeURIComponent(magnet)>`
3. 123云盘：`hiker://page/diaoyong?rule=123云盘&page=fypage&realurl=<encodeURIComponent(magnet)>`
4. 光鸭云盘：`hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>`
5. 额外保留“复制磁力”作为本地动作。

- 以上调用前先检查相应小程序是否安装；未安装只 toast，不伪造其它协议。
- 光鸭旧版曾没有磁力入口；后续光鸭 v2.0.0 已加入统一 `magnet?realurl=` 调用合同。JavBus 从 alpha3 起使用该正式入口。

## 导航 / 页面栈硬规则
- alpha1 在分类、演员、搜索页切换“有码 / 无码 / 欧美”时重复打开同级 `hiker://page`，造成返回栈不断叠加。
- alpha2 已修成 `putMyVar/setItem → refreshPage(false)`；真正层级钻取（影片详情、演员详情、具体分类结果、磁力页、预览页）才允许新开页面。
- 该事故已升级为跨程序硬约束：`docs/INCIDENT_SAME_LEVEL_NAVIGATION_STACK_20260823.md`。

## 实机回归事实
### alpha1 首轮
- 首页影片列表正常，封面、番号、标题可见。
- 影片详情主链正常，标题、日期、时长、厂商、演员、标签、第三方播放、样品图可见。
- 演员详情可进入并显示出演作品。
- 暴露演员列表只一人、同级页面反复压栈、磁力入口埋太深、演员头像和关键图标问题。

### alpha2 第二轮（2026-08-23 09:13~09:17 实机截图）
- 详情顶部磁力入口已可见，详情整体排版比 alpha1 更清晰。
- 详情预览图能正常获取，多部影片能显示 10~11 张样品图。
- 用户要求把“完整预览”入口移动到详情顶部，避免向下滑大量信息后才看到预览。
- 第三方在线播放文字按钮可见，但用户要求参考成熟 JavDB 详情页，改为原网站图标宫格。
- 原站 ABF-377 明确显示多条磁力，小程序磁力页仍为空；因此 alpha2 磁力 AJAX 链失败已被实机确认。
- 用户重新明确磁力长按目标固定为：迅雷 / PikPak / 123云盘 / 光鸭云盘。

## UI 结构：alpha3
### 影片详情
1. Hero：封面 + 标题 + 日期/时长/分区。
2. 顶部主操作：`🧲 磁力 / 🖼 预览 N / ☆ 收藏 / 🌐 原站`。
3. 第三方在线播放：MissAV / 123AV / Jable 原站 favicon 三列宫格。
4. 快捷信息：番号复制、日期、时长。
5. 核心资料：导演/制作商/发行商/系列。
6. 演员。
7. 标签。
8. 预览图：详情只放前 4 张 + “查看全部 N 张”；完整图在 `javbusPreview`。
9. 磁力：详情最多预览前 3 条 + “查看全部”；完整列表在 `javbusMagnets`。
10. 相似影片。

### 磁力页
- 大小↓ / 大小↑ / 日期↓ / 日期↑ 均当前页刷新，不压返回栈。
- 点击复制磁力。
- 长按：迅雷 / PikPak / 123云盘 / 光鸭云盘 / 复制磁力。
- 空结果显示精简诊断参数。

### 预览页
- 独立 `javbusPreview` 页面。
- 使用 `pic_1_full` 展示所有预览图；点击仍走 `pics://` 查看原图。

## 收藏 / 状态
- 新影片收藏：`hiker://files/rules/JavBus/favorites_videos.json`
- 新演员收藏：`hiker://files/rules/JavBus/favorites_actors.json`
- 旧影片收藏：`hiker://files/rules/Apollo/javbus/javbus_video.txt`
- 旧演员收藏：`hiker://files/rules/Apollo/javbus/javbus_actor.txt`
- 旧格式：`title@@img@@url`；仅做兼容读取，不把 Apollo 恢复为运行依赖。
- 主要状态：`javbus_default_type / javbus_mag_mode / javbus_home_type / javbus_search_type / javbus_genres_type / javbus_actors_type / javbus_search_kw / javbus_mag_sort / javbus_fav_kind`。

## 架构与版本
- Stable `2026081903` 冻结，仍依赖 Apollo，仅作为回退基线。
- Test 2.0：`Remote Shell → Bootstrap → Remote Manager → alpha1 Core/Compat/Runtime → alpha2 Patch → alpha3 Patch → Shared JAV Playback`。
- Test app id `javbus-test` 与未来 Stable Remote state 隔离。
- alpha3 不原地覆盖 alpha2；Build 20003 使用新 Release、新 Bootstrap、新 Shell、新规则 version `2026082303`。

## 已知风险 / 禁止回退
- 禁止恢复 `/actresses` 无页码 + `.avatar-box` 的演员列表实现。
- 禁止同级 Tab / 筛选 / 排序通过重复打开同一 `hiker://page` 实现。
- 禁止把磁力或完整预览主入口埋到长详情页底部。
- 禁止磁力 AJAX 回退到“只用封面 rawImg 替代源码 var img”的实现。
- 禁止把磁力长按重新改回磁力君/云盘君；当前明确目标为 迅雷 / PikPak / 123云盘 / 光鸭云盘。
- 禁止复制 shared playback 到 JavBus 私有模块。
- 未经实机验证不得晋级 Stable。

## alpha3 实机回归清单
- [ ] 云仓库显示 Test `2.0.0-alpha3 / Build20003`。
- [ ] 设置页显示 alpha3 / Build20003。
- [ ] 详情顶部显示 `🧲 磁力 / 🖼 预览 N / 收藏 / 原站`。
- [ ] 点击预览进入独立页面，并能看到完整样品图。
- [ ] MissAV / 123AV / Jable 显示原网站图标，三列排版正常。
- [ ] ABF-377 等原站已有磁力影片能在 `javbusMagnets` 返回多条磁力。
- [ ] 磁力标题、大小、日期、高清/字幕标记合理。
- [ ] 大小/日期四种排序均当前页刷新。
- [ ] 长按磁力 → 迅雷正常。
- [ ] 长按磁力 → PikPak 正常。
- [ ] 长按磁力 → 123云盘正常。
- [ ] 长按磁力 → 光鸭云盘正常。
- [ ] MissAV / 123AV / Jable 播放保持 shared playback 当前能力。
- [ ] alpha2 已修复的演员列表、同页导航、搜索按钮不退化。

---
## 版本记录
### 2.0.0-alpha3 / Build20003 / 2026-08-23
- 基于 alpha2 第二轮真实设备截图继续修复，Stable 不动。
- 详情顶部新增 `🖼 预览 N` 和独立 `javbusPreview`。
- 第三方在线播放切换为 MissAV / 123AV / Jable 原网站 favicon 三列宫格。
- 磁力请求改为源码 `gid/uc/img` 原始变量合同，并增加正则 Parser + WebView 后级兜底。
- 磁力长按切换为 迅雷 / PikPak / 123云盘 / 光鸭云盘，使用此前 JavDB 已恢复协议。
- 当前状态：已完成代码与元数据发布，等待海阔实机确认磁力恢复和图标/跨规则调用。

### 2.0.0-alpha2 / Build20002 / 2026-08-23
- 修复演员列表只出一人的根因：`/actresses/{page}` + `.item`。
- 分类/演员/搜索同级三分区改为同页状态刷新。
- 首页与搜索页输入框显示右侧“搜索”。
- 影片详情顶部新增独立磁力入口；新增 `javbusMagnets`。
- 演员详情重排并增加官网演员头像路径兜底。
- Test Shell 与云仓库使用 JavBus 官网 favicon。

### 2.0.0-alpha1 / Build20001 / 2026-08-23
- 首个完整远程重写 Test，Stable 不动。
- 建立自有 Parser/UI/Magnet/Favorites 和共享 JAV Playback 接入。

### 2026081903 / 2026-08-19
- 重写前云仓库登记基线。
- 核心通过 Apollo 本地文件运行，并带第三方远程更新逻辑；2.0 不再允许恢复该正式运行依赖。
