# JavBus Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实，未知信息标记“待确认”。

## 当前基线
- 程序：JavBus
- App ID：`javbus`
- Stable：`2026081903` / Legacy Local / 冻结保留
- Test：`2.0.0-alpha2` / Build `20002` / Remote Module
- Stable 入口：`javbus_2026081903.txt`
- Test 入口：`apps/video/javbus/javbus_remote_test_v2_b20002.txt`
- Test Bootstrap：`apps/video/javbus/bootstrap_test_v2.js`
- Test Release：`apps/video/javbus/releases/2.0.0-alpha2/release.json`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- JavBus 图标：官网 `https://www.javbus.com/favicon.ico`（Test/云仓库；旧 Stable 工件冻结不原地覆盖）
- 最后登记日期：2026-08-23

## 2.0 产品边界
### 原生化范围
- 首页：有码 / 无码 / 欧美、全部影片 / 仅有磁力、搜索、演员、分类、收藏、更多。
- 搜索：番号 / 标题 / 演员 / 厂商关键词并支持翻页。
- 分类：JavBus `/genre` 体系；详情里的 `genre / director / studio / label / series` 可继续筛选。
- 演员：演员列表、演员资料、出演作品、演员收藏。
- 详情：封面、标题、发行日期、时长、导演、制作商、发行商、系列、演员、标签、样品图、相似影片、磁力资源。
- 磁力：详情顶部显式入口 + 独立磁力页；点击复制，长按联动 123云盘 / 磁力君 / 云盘君。
- 本地收藏：影片与演员独立；兼容迁移旧 Apollo 收藏。
- 论坛/原站：未知社区协议不强行原生化，保留网页兜底。

### 第三方在线播放
- JavBus 只传番号给共享 `shared/jav-playback/manager.js` Stable。
- 当前共享 Stable SDK：`1.0.0-test.4`。
- 当前 Provider：MissAV / 123AV / Jable。
- 禁止在 JavBus 内复制或分叉三站解析逻辑；播放修复优先改 shared playback。

## 数据源 / Parser 合同
### 影片列表与搜索
- 有码 `/`，翻页 `/page/{page}`。
- 无码 `/uncensored`，翻页 `/uncensored/page/{page}`。
- 欧美 `/western`，翻页 `/western/page/{page}`。
- 筛选：`/{typePrefix}/{filterType}/{filterValue}/{page?}`，主要 `star / genre / director / studio / label / series`。
- 搜索：`/{typePrefix}/search/{keyword}/{page}&type=1`。
- 列表：`#waterfall .item`、`.photo-frame img`、`.photo-info date`、`.item-tag button`。
- `existmag=mag` = 仅有磁力；`existmag=all` = 全部。

### 影片详情 / 磁力
- 标题 `.container h3`。
- 大图 `.container .movie .bigImage img`。
- 信息 `.container .movie .info p`。
- 样品图 `#sample-waterfall .sample-box`。
- 相似影片 `#related-waterfall a`。
- `var gid = ...;`、`var uc = ...;` → `/ajax/uncledatoolsbyajax.php?gid=...&lang=zh&uc=...`。
- 磁力请求继续带 Referer、`existmag=all`、`X-Requested-With: XMLHttpRequest`。

### 演员：alpha2 已修正
- **演员列表真实分页入口固定为 `/{typePrefix}/actresses/{page}`，第一页也必须显式 `/1`。**
- 已由外部维护的 JavBus 采集实现交叉确认列表结构：`.item a`；姓名 `.photo-info span`；头像 `.photo-frame img`。
- alpha1 使用 `/actresses` + `.avatar-box`，实机结果是有码/无码/欧美均只解析到一个演员；该方案已证伪，禁止回退。
- 演员详情仍为 `/{typePrefix}/star/{id}`。
- 演员详情头像若页面结构未解析到图片，alpha2 使用官网稳定命名规则 `/pics/actress/{id}_a.jpg` 兜底。
- 已知资料标签：生日、年龄、身高、胸围、腰围、臀围、出生地、爱好。

## 导航 / 页面栈硬规则（本次实机事故）
- alpha1 在分类、演员、搜索页切换“有码 / 无码 / 欧美”时，用 `hiker://page/<同一功能页>` 再开一页。
- 实机表现：每切一次同级标签都会向返回栈压入一层；想回到首页需要连续返回很多次。
- **根因：把同级状态切换错误实现成页面导航。**
- alpha2 修复：同一功能工作区的 Tab / 分类类型 / 排序 / 显示方式全部使用 `putMyVar/setItem → refreshPage(false)` 或同页动态更新；只有真正的层级钻取（影片详情、演员详情、某个具体分类结果）才允许进入新页面。
- 该问题已升级为跨程序事故：`docs/INCIDENT_SAME_LEVEL_NAVIGATION_STACK_20260823.md`。以后任何海阔小程序出现同级标签不断 `hiker://page` 压栈，直接视为回归缺陷。

## alpha1 首轮实机结果（2026-08-23）
### 已工作
- 首页有码影片列表能正常加载，封面、番号和标题可见。
- 影片详情可打开，标题、日期、时长、厂商、演员、标签、第三方播放入口和样品图可见。
- 演员详情可进入并显示出演作品。

### 已确认问题
1. 演员有码 / 无码 / 欧美列表都只有一个演员。
   - 根因：演员列表 URL/selector 错误，见上文；alpha2 修复。
2. 分类/演员等页切换有码/无码/欧美不断打开新页面。
   - 根因：同级状态用新 `hiker://page` 实现；alpha2 改为当前页刷新。
3. 首页搜索框只有输入框，右侧没有“搜索”。
   - alpha2 使用 `input` 的可见标题动作，标题固定“搜索”。
4. 影片详情用户看不到磁链入口。
   - alpha1 磁力区放在 11 张样品图之后，首屏与主要操作区完全不可见，属于信息架构缺陷。
   - alpha2 在详情主操作区新增 `🧲 磁力资源`，进入独立磁力页；详情下方仅保留最多 3 条快速预览和“查看全部”。
5. 演员详情头像出现空白占位。
   - alpha2 增加 `/pics/actress/{id}_a.jpg` 兜底，并把演员 Hero 改为普通左图信息卡，减少无图时的大面积空白。
6. 首页若干功能图片图标显示异常/风格不统一。
   - alpha2 将演员/分类/收藏/更多和详情动作改成原生文字 + Emoji 图标，不再依赖不稳定的 `hiker://images/...` 或第三方小图。
7. JavBus 云仓库与 Test 小程序图标不是官网图标。
   - alpha2 切换为 JavBus 官网 favicon；旧 Stable 工件仍冻结，避免为了图标原地修改 Stable。

## UI 结构：alpha2
### 首页
- 顶部有码 / 无码 / 欧美：同页刷新。
- 全部影片 / 只看有磁力：同页刷新。
- 搜索框右侧显示“搜索”。
- 快捷入口：`👤 演员 / 🏷 分类 / ★ 收藏 / ⚙ 更多`，使用原生文字按钮，避免图片图标失效。

### 影片详情
1. Hero：封面 + 标题 + 日期/时长/分区。
2. 主操作：`▶ 在线播放 / 🧲 磁力资源 / ☆ 收藏 / 🌐 原站`。
3. 快捷信息：番号复制、日期、时长。
4. 核心资料：导演/制作商/发行商/系列。
5. 演员。
6. 标签。
7. 第三方在线播放：MissAV / 123AV / Jable，改为稳定文字按钮，不依赖站点 favicon。
8. 样品图。
9. 磁力快速预览（最多 3 条）+ 查看全部。
10. 相似影片。

### 演员详情
- 左图资料 Hero，头像有官网命名路径兜底。
- `☆ 收藏演员 / ⧉ 复制姓名 / 🌐 原站页面`。
- 出演作品三列卡片继续向下分页。

## 磁力与外部小程序联动
- `123云盘`：调用其 `csdown` 模块的 `share_down(magnet)` → `offlineDownloadResolve`。
- `磁力君.简`：`hiker://page/SelectTorrent?rule=磁力君.简&curl=<magnet>`。
- `云盘君.简`：其公开规则没有任意 magnet 直传入口，当前按番号进入 `sou` 搜索，禁止伪称磁力直传。
- 点击磁力默认复制。

## 收藏 / 状态
- 新影片收藏：`hiker://files/rules/JavBus/favorites_videos.json`
- 新演员收藏：`hiker://files/rules/JavBus/favorites_actors.json`
- 旧影片收藏：`hiker://files/rules/Apollo/javbus/javbus_video.txt`
- 旧演员收藏：`hiker://files/rules/Apollo/javbus/javbus_actor.txt`
- 旧格式：`title@@img@@url`；仅做一次兼容读取，不把 Apollo 恢复为运行依赖。
- 主要状态：`javbus_default_type / javbus_mag_mode / javbus_home_type / javbus_search_type / javbus_genres_type / javbus_actors_type / javbus_search_kw / javbus_mag_sort / javbus_fav_kind`。

## 架构与版本
- Stable `2026081903` 冻结，仍依赖 Apollo，仅作为回退基线。
- Test 2.0：`Remote Shell → Bootstrap → Remote Manager → alpha1 Core/Compat/Runtime → alpha2 Patch → Shared JAV Playback`。
- Test app id `javbus-test` 与未来 Stable Remote state 隔离。
- alpha2 不原地覆盖 alpha1；Build 20002 新 Release、新 Bootstrap、新 Shell、新规则 version。

## 已知风险 / 禁止回退
- 禁止恢复 `/actresses` 无页码 + `.avatar-box` 的演员列表实现。
- 禁止同级 Tab / 筛选 / 排序通过重复打开同一 `hiker://page` 实现。
- 禁止把磁力主入口埋到大批样品图之后。
- 禁止用未知/易失效图片 URL 作为关键功能按钮的唯一识别方式；关键操作必须有稳定文字语义。
- 禁止复制 shared playback 到 JavBus 私有模块。
- 未经实机验证不得晋级 Stable。

## alpha2 实机回归清单
- [ ] 云仓库显示 Test `2.0.0-alpha2 / Build20002`，图标为 JavBus 官网图标。
- [ ] 覆盖导入后设置页显示 alpha2 / Build20002。
- [ ] 首页搜索框右侧出现“搜索”，输入后能搜索。
- [ ] 首页快捷入口不再有异常/空白图片图标。
- [ ] 演员有码列表一次加载多名演员并可翻页。
- [ ] 演员无码列表一次加载多名演员并可翻页。
- [ ] 演员欧美列表一次加载多名演员并可翻页。
- [ ] 演员详情头像正常；资料与出演作品正常。
- [ ] 分类页连续切有码→无码→欧美→有码后，返回一次即可回到进入分类前页面，不产生多层同级历史。
- [ ] 演员页、搜索页同样不产生同级历史栈。
- [ ] 影片详情顶部出现 `🧲 磁力资源`。
- [ ] 磁力页能返回资源，大小/日期四种排序均为同页刷新。
- [ ] 磁力点击复制、长按 123云盘/磁力君/云盘君正常。
- [ ] 影片详情重排后封面、资料、播放、样品图、相似影片均无退化。
- [ ] MissAV / 123AV / Jable 保持 shared playback 当前能力。

---
## 版本记录
### 2.0.0-alpha2 / Build20002 / 2026-08-23
- 基于 alpha1 首轮真实设备截图修复，不动 Stable。
- 修复演员列表只出一人的根因：`/actresses/{page}` + `.item` 列表 Parser。
- 分类/演员/搜索同级三分区全部改为同页状态刷新，解决返回栈无限叠加。
- 首页与搜索页输入框显示右侧“搜索”。
- 影片详情重新分层，顶部新增独立磁力入口；新增 `javbusMagnets` 页面。
- 演员详情重排并增加官网演员头像命名路径兜底。
- 关键功能图标改为原生文字/Emoji，减少失效图片依赖。
- Test Shell 与云仓库使用 JavBus 官网 favicon。

### 2.0.0-alpha1 / Build20001 / 2026-08-23
- 首个完整远程重写 Test，Stable 不动。
- 建立自有 Parser/UI/Magnet/Favorites 和共享 JAV Playback 接入。
- 首轮实机证明首页/详情主链可运行，同时暴露演员列表、同级导航栈、磁力入口可见性、演员头像和图标问题；这些结论作为 alpha2 的直接修复依据。

### 2026081903 / 2026-08-19
- 重写前云仓库登记基线。
- 核心通过 Apollo 本地文件运行，并带第三方远程更新逻辑；2.0 不再允许恢复该正式运行依赖。
