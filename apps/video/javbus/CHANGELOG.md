# JavBus Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、`registry.json`、当前 Stable/Test/Release/Bootstrap/Shell。用户当前实机结果优先于历史记录。未完成海阔实机验证的内容明确标记“待确认”。

## 当前基线（2026-08-23）
- 程序：JavBus
- App ID：`javbus`
- Stable：`2.0.0` / Build `20005` / Remote / 本项目自有代码
- Stable Shell：`apps/video/javbus/javbus_remote_v2_b20005.txt`
- Stable Bootstrap：`apps/video/javbus/bootstrap_stable_v1_b20005.js`
- Stable Release：`apps/video/javbus/releases/2.0.0/release.json`
- Stable Patch：`apps/video/javbus/releases/2.0.0/stable_patch.js`
- Domain Config：`apps/video/javbus/domains.json`
- Test 晋级来源：`2.0.0-alpha4` / Build `20004`
- Test Shell：`apps/video/javbus/javbus_remote_test_v4_b20004.txt`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- Shared JAV Playback Stable：`1.0.0-test.4`
- JavBus 图标：官网 `https://www.javbus.com/favicon.ico`
- 旧 `javbus_2026081903.txt` 为第三方 Apollo 本地规则，不属于本项目实现；用户已明确允许删除，Stable 2.0.0 发布后仓库删除该工件及索引引用。

## Stable 2.0.0 发布结论
- 用户于 2026-08-23 明确要求：加入域名失效自动切换，并把当前重写版晋级正式版；旧本地版可以删除，因为不是本项目编写。
- Stable 2.0.0 由 Test alpha4 的完整运行链晋级，并新增 `stable_patch.js` 域名 Adapter；不是复制旧 Apollo 规则。
- Stable 运行链：
  `Stable Shell → Stable Bootstrap → Remote Manager → alpha1 Core/Compat/Runtime → alpha2 Patch → alpha3 Patch → alpha4 Patch → Stable Domain Patch → Shared JAV Playback Stable`。
- Stable 与 Test 使用不同 Remote Manager app id：Stable=`javbus`，Test=`javbus-test`，持久状态隔离。
- 旧 Apollo 本地工件删除后不再提供“Legacy Local/本地版”渠道；历史 alpha1~alpha4 release 继续保留，便于诊断与回滚开发，不等于保留旧第三方本地版。
- Stable 2.0.0 的域名自动切换和 alpha4 的原图预览/紧凑播放 UI 在正式发布前完成静态门禁；用户已明确要求直接晋级，后续继续以 Stable 实机结果补齐回归记录。

## 域名自动切换：Stable 2.0.0
### 用户当前事实
用户实机网页显示当前可用域名提示：
- 永久域名：`https://www.javbus.com`
- 防屏蔽：`https://www.busjav.cyou`
- 防屏蔽：`https://www.fanbus.bond`
- 防屏蔽：`https://www.buscdn.bond`

### 设计合同
- 域名列表独立存放在 `apps/video/javbus/domains.json`，代码内同时保留静态兜底列表。
- 远程域名配置缓存 6 小时；拉取失败时使用上一次有效缓存，再退回静态列表。
- 运行时保存最后一次成功域名：`javbus_active_domain`。
- 普通请求优先使用最后成功域名；如果响应为空、过短、Cloudflare challenge/拦截页或不具备 JavBus 页面指纹，自动尝试其它候选域名。
- 成功切换后立即更新 `JavBusCore.base` 并持久记忆，后续列表、搜索、详情、演员、分类、图片 Referer 和磁力详情链自然跟随当前 Base。
- 页面健康校验不是“非空即成功”，会检查 JavBus 业务指纹，如 `movie-box / waterfall / photo-info / sample-waterfall / genre / star / var gid / navbar+JavBus`，避免把限流页、拦截页或无关落地页写成成功域名。
- 每个候选域名优先普通 `fetch`，失败后允许 `fetchCodeByWebView` 作为站点过检兜底。
- 设置页显示当前域名、候选域名，并提供“重新检测可用域名”；重置后下一次业务请求重新自动选择。
- 域名远程配置文件后续可单独维护，新防屏蔽域名无需为了改常量重发整个 Stable Release。

### 禁止回退
- 禁止恢复单一写死 `https://www.javbus.com` 且失败就整页报错的策略。
- 禁止仅以 HTTP 非空判断域名健康。
- 禁止每个列表卡片/图片单独做全候选域名探测；域名切换属于 Protocol/Domain 层统一职责。
- 禁止为了域名切换修改 alpha3 已实机验证成功的磁力 Parser；只允许让 `C.base` 跟随有效域名。

## 产品范围
### 首页/搜索/分类
- 首页：有码 / 无码 / 欧美、全部影片 / 仅有磁力、搜索、演员、分类、收藏、更多。
- 搜索支持番号 / 标题 / 演员 / 厂商关键词并翻页。
- 分类使用 JavBus `/genre`；详情中的 `genre / director / studio / label / series` 可继续筛选。
- 同级“有码 / 无码 / 欧美”、排序、显示范围一律当前页刷新，禁止不断压入新的同级 `hiker://page`。

### 演员
- 演员分页固定 `/{typePrefix}/actresses/{page}`，第一页显式 `/1`。
- 列表合同：`.item a`；姓名 `.photo-info span`；头像 `.photo-frame img`。
- alpha1 的 `/actresses` + `.avatar-box` 已由实机证伪：有码/无码/欧美只得到一个演员，禁止回退。
- 演员详情 `/{typePrefix}/star/{id}`；头像缺失可用 `/pics/actress/{id}_a.jpg` 兜底。

### 影片详情
1. Hero：封面 + 标题 + 日期 / 时长 / 分区。
2. 主操作：`🧲 磁力 / 🖼 预览 N / ☆ 收藏 / 🌐 原站`。
3. 第三方在线播放：MissAV / 123AV / Jable。
4. 番号 / 日期 / 时长快捷信息。
5. 导演 / 制作商 / 发行商 / 系列。
6. 演员。
7. 标签。
8. 预览图。
9. 磁力快速预览 + 完整磁力页。
10. 相似影片。

### 预览
- 详情顶部 `🖼 预览 N` 进入独立 `javbusPreview`。
- alpha3 实机证明：独立页用 `sm.thumb` 放大到 `pic_1_full` 会明显模糊，而详情下方 `pics://sm.src` 原图清晰。
- alpha4 修复：独立预览页直接用 `C.image(sm.src, detailUrl)` 加载原始 sample；点击仍使用 `pics://sm.src`。
- 详情下方仍使用 thumb 缩略图，避免列表无意义加载全部大图。

### 第三方在线播放
- JavBus 只传番号给 `shared/jav-playback/manager.js` Stable；禁止把 Provider Parser 复制到 JavBus 私有模块。
- 当前 Provider：MissAV / 123AV / Jable。
- alpha3 使用 `icon_3` 后实机显示 MissAV/Jable 巨型方块、123AV favicon 空白，视觉失败。
- alpha4 改为 `icon_small_3` 紧凑一行三列；MissAV/Jable 使用原网站 favicon，123AV 使用 Shared Playback 固定 `shared/jav-playback/assets/123av.svg`。
- Shared Playback 当前 Stable `1.0.0-test.4`：MissAV 走搜索真实版本→详情 packed source→master HLS→最高画质；123AV/Jable 保留已验证播放链。

## 磁力：已恢复并实机验证
### alpha2 失败事实
- 原站 ABF-377 明确存在多条磁力，而 alpha2 独立磁力页返回“暂无磁力资源”，证明问题在 AJAX 参数/请求/解析链，不是影片没有磁力。

### alpha3 修复合同
- 从详情源码直接提取 `var gid`、`var uc`、`var img`。
- AJAX：`/ajax/uncledatoolsbyajax.php?gid=<gid>&lang=zh&img=<img>&uc=<uc>`。
- Headers：桌面 Chrome UA、详情 Referer、`Cookie: existmag=all`、`X-Requested-With: XMLHttpRequest`。
- Parser：按 `<tr>` + `href="magnet:?xt=urn:btih:..."` 正则恢复磁力标题、大小、日期，并识别高清/字幕。
- 兜底顺序：普通 AJAX fetch → AJAX WebView → 详情 WebView 渲染后扫描 magnet href。

### 实机验证
- 2026-08-23 09:42：ABF-379 独立磁力页成功返回 3 条资源：5.19GB / 2.66GB / 1.73GB，并显示日期和高清标记。
- 磁力主数据链判定已恢复。从 alpha4/Stable 2.0.0 开始，除非有新的实机回归，禁止为了 UI 或域名策略修改 alpha3 磁力 Parser/AJAX 主链。

## 磁力长按跨小程序合同
1. 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
2. PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encodeURIComponent(magnet)>`
3. 123云盘：`hiker://page/diaoyong?rule=123云盘&page=fypage&realurl=<encodeURIComponent(magnet)>`
4. 光鸭云盘：`hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>`
5. 复制磁力。

- 未安装对应小程序只 toast，不伪造其它入口。
- 用户已明确长按目标固定为以上四个，不再使用“磁力君 / 云盘君”组合。
- 四个跨小程序动作仍需分别完成 Stable 实机点击回归后才能标记全部通过。

## 收藏 / 状态
- 影片收藏：`hiker://files/rules/JavBus/favorites_videos.json`
- 演员收藏：`hiker://files/rules/JavBus/favorites_actors.json`
- 旧 Apollo 收藏路径仍只作为兼容读取：
  - `hiker://files/rules/Apollo/javbus/javbus_video.txt`
  - `hiker://files/rules/Apollo/javbus/javbus_actor.txt`
- 删除旧本地规则文件不等于删除用户手机收藏数据；兼容读取保留，避免无必要丢失历史收藏。
- 主要状态：`javbus_default_type / javbus_mag_mode / javbus_home_type / javbus_search_type / javbus_genres_type / javbus_actors_type / javbus_search_kw / javbus_mag_sort / javbus_fav_kind / javbus_active_domain / javbus_domain_config_cache / javbus_domain_config_ts`。

## 导航 / 页面栈硬规则
- alpha1 把有码/无码/欧美同级 Tab 实现成不断打开新页面，造成返回栈叠加。
- alpha2 已改为 `putMyVar/setItem → refreshPage(false)`。
- 同级 Tab / 排序 / 筛选只能刷新当前 Workspace；影片详情、演员详情、具体分类结果、磁力页、预览页才属于真正层级钻取。
- 跨程序事故：`docs/INCIDENT_SAME_LEVEL_NAVIGATION_STACK_20260823.md`。

## 发布与回退
- Stable 2.0.0 是第一个本项目自有 JavBus 正式远程版。
- 旧第三方本地工件在正式指针全部切换并回读后删除，不再作为可选 Stable/Local 渠道。
- Test alpha4 作为本次晋级来源暂保留；下一轮 Test 必须从 Stable 2.0.0 重新 rebase，不能继续把旧 `baseVersion=2026081903` 当新开发基线。
- Stable 新增 `latest.json`，正式版后续更新统一走 Stable Remote Manager。
- Stable Shell/Bootstrap/Release 均使用新路径和新缓存键，避免设备继续命中 Test/旧本地状态。

## Stable 2.0.0 实机回归清单
- [ ] 云仓库只展示新的 Remote Stable 2.0.0，不再展示 Legacy Local 正式版。
- [ ] 覆盖导入后首页正常，设置页显示 `2.0.0 / Build20005`。
- [ ] 当前 `www.javbus.com` 可用时正常加载。
- [ ] 当前域名失效/被拦截时自动尝试备用域名并保存成功域名。
- [ ] 设置页能看到当前域名和候选域名；“重新检测”可重置选择。
- [ ] 演员有码/无码/欧美均可一次显示多名演员并翻页。
- [ ] 分类/演员/搜索同级切换不叠加返回栈。
- [ ] 顶部预览进入后使用原图，清晰度不再低于详情下方原图入口。
- [ ] MissAV / 123AV / Jable 为紧凑三列，123AV 图标正常。
- [ ] ABF-379 等影片磁力仍能返回资源，确认域名 Adapter 未破坏 alpha3 磁力链。
- [ ] 迅雷 / PikPak / 123云盘 / 光鸭云盘长按分别实机验证。
- [ ] 三个第三方播放 Provider 不退化。

---
## 版本记录
### 2.0.0 / Build20005 / 2026-08-23
- 用户明确要求晋级正式版并删除非本项目编写的旧本地版。
- 由 Test 2.0.0-alpha4 晋级为第一个项目自有 Remote Stable。
- 新增 Domain Adapter：远程候选配置、失败自动轮询、业务指纹健康校验、WebView 兜底、成功域名持久记忆、设置页手动重检。
- 保留 alpha3 已实机验证的磁力链和 alpha4 UI 修复。
- Stable 使用独立 `javbus` Remote Manager 状态与新 Shell/Bootstrap/Release。

### 2.0.0-alpha4 / Build20004 / 2026-08-23
- 独立预览页由缩略图改用 sample 原图。
- 播放入口 `icon_3 → icon_small_3`，123AV 使用 Shared Playback 固定 SVG。
- 不修改 alpha3 磁力主链。

### 2.0.0-alpha3 / Build20003 / 2026-08-23
- 详情顶部新增预览入口。
- 磁力改为源码 gid/uc/img + 正则 Parser + WebView 兜底。
- 磁力长按改为 迅雷 / PikPak / 123云盘 / 光鸭云盘。
- 09:42 实机确认 ABF-379 磁力恢复成功。

### 2.0.0-alpha2 / Build20002 / 2026-08-23
- 修复演员列表只一人：`/actresses/{page}` + `.item`。
- 修复同级有码/无码/欧美反复压新页面。
- 增加显眼磁力入口、搜索按钮和详情 UI 重排。

### 2.0.0-alpha1 / Build20001 / 2026-08-23
- 首个自有远程重写 Test，建立 Core/Compat/Runtime、收藏、网站 Parser 与 Shared JAV Playback 接入。

### 2026081903 / 2026-08-19
- 第三方 Apollo 本地规则历史基线；2026-08-23 用户明确允许删除，不再作为正式/本地渠道。
