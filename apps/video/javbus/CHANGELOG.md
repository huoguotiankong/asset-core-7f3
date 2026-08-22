# JavBus Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实，未知信息标记“待确认”。

## 当前基线
- 程序：JavBus
- App ID：`javbus`
- Stable：`2026081903` / Legacy Local / 冻结保留
- Test：`2.0.0-alpha1` / Build `20001` / Remote Module
- Stable 入口：`javbus_2026081903.txt`
- Test 入口：`apps/video/javbus/javbus_remote_test_v1_b20001.txt`
- Test Bootstrap：`apps/video/javbus/bootstrap_test_v1.js`
- Test Release：`apps/video/javbus/releases/2.0.0-alpha1/release.json`
- Remote Manager：`libs/updater/remote_manager.js` v2.0.1
- 最后登记日期：2026-08-23

## 2.0 重写产品边界
### 原生化范围
- 首页：有码 / 无码 / 欧美三分区、全部影片 / 仅有磁力筛选、搜索、演员、分类、收藏、更多。
- 搜索：番号 / 标题 / 演员 / 厂商关键词，沿用当前分区并支持翻页。
- 分类：解析 JavBus `/genre` 体系；详情里的 `genre / director / studio / label / series` 均可回到筛选列表。
- 演员：演员列表、演员资料、出演作品、演员收藏。
- 影片详情：封面、标题、发行日期、时长、导演、制作商、发行商、系列、演员、类别、样品图、相似影片、磁力资源。
- 本地收藏：影片与演员保持两个独立实体；新存储首次读取时兼容迁移旧 Apollo 收藏。
- 网站论坛与原站兜底：不强行原生化未知社区协议，保留网页入口。

### 第三方在线播放
- JavBus 本身只提供影片元数据与磁力，不复制第三方播放解析代码。
- 统一复用 `shared/jav-playback/manager.js` Stable 通道。
- 当前共享 Stable SDK：`1.0.0-test.4`。
- 当前 Provider：MissAV / 123AV / Jable。
- 已知共享播放事实来自 JavDB 实机回归：123AV / Jable 可播；MissAV 使用“搜索真实版本 → 真详情 → packed source → master HLS → 自动最高画质”链。
- JavBus 2.0 只传番号给共享 SDK，后续播放修复优先在 shared playback 层完成，避免 JavBus/JavDB 各自漂移。

### 磁力与外部小程序联动
- JavBus 当前磁力接口合同：详情 HTML 取得 `gid` / `uc`，请求 `/ajax/uncledatoolsbyajax.php?gid=...&lang=zh&uc=...`；同时尽量携带 `img`、Referer、`existmag=all` 与 X-Requested-With。
- 磁力行支持大小/日期升降序；点击默认复制磁力。
- 长按动作：
  1. `123云盘`：读取其 `csdown` 页面模块并调用 `share_down(magnet)`，磁力会进入 `offlineDownloadResolve`。
  2. `磁力君.简`：打开 `hiker://page/SelectTorrent?rule=磁力君.简&curl=<magnet>`，由其选择海阔/复制/迅雷/PIKPAK/115/影视播放等打开方式。
  3. `云盘君.简`：该程序并没有“把任意 magnet 直接离线播放”的公开调用页，因此当前按番号打开其 `sou` 聚合搜索，不伪造磁力直连协议。
  4. 复制磁力链接。
- 上述三个外部桥接均已从用户当前提供的 `.hk小程序.zip` 实际 `rule.json` 恢复调用合同，但 JavBus 侧跨规则调用仍需本轮海阔实机验证。

## 数据源 / Parser 合同
### 列表与搜索
- 当前列表路径：
  - 有码 `/`，翻页 `/page/{page}`
  - 无码 `/uncensored`，翻页 `/uncensored/page/{page}`
  - 欧美 `/western`，翻页 `/western/page/{page}`
- 当前筛选路径：`/{typePrefix}/{filterType}/{filterValue}/{page?}`；`filterType` 主要包括 `star / genre / director / studio / label / series`。
- 当前搜索路径按已维护 JavBus scraper：`/{typePrefix}/search/{keyword}/{page}&type=1`。
- 列表当前参考选择器：`#waterfall .item`、`.photo-frame img`、`.photo-info date`、`.item-tag button`。
- `existmag=mag` = 仅有磁力；`existmag=all` = 全部影片。

### 详情
- 当前参考选择器：
  - 标题 `.container h3`
  - 大图 `.container .movie .bigImage img`
  - 信息 `.container .movie .info p`
  - 样品图 `#sample-waterfall .sample-box`
  - 相似影片 `#related-waterfall a`
- 文本标签：`發行日期 / 長度 / 導演 / 製作商 / 發行商 / 系列`。
- 详情脚本变量：`var gid = ...;`、`var uc = ...;` 用于磁力 AJAX。

### 演员
- 演员入口按 JavBus 当前网站结构使用 `/actresses`；无码/欧美分别加分区前缀。
- 演员资料参考：`.avatar-box`、`.photo-frame img`、`.photo-info .pb10`、`.photo-info p`。
- 已知资料标签：生日、年龄、身高、胸围、腰围、臀围、出生地、爱好。

### 请求策略
- 默认直接 `fetch` +移动端 UA + Referer + `existmag` Cookie。
- 页面明显为空或出现 Cloudflare challenge 标记时，才后级使用 `fetchCodeByWebView`，避免每页默认 WebView 导致速度退化。
- 当前 ChatGPT 网页抓取通道对 `javbus.com` 直接访问被拒绝，因此以上 Parser 合同来自：旧 Stable 实际源码、当前维护的 JavBus scraper 代码、当前 RSSHub 路由资料；**不能视为已经完成本轮海阔实机验证**。

## 缓存 / 状态 / 本地数据
- 新影片收藏：`hiker://files/rules/JavBus/favorites_videos.json`
- 新演员收藏：`hiker://files/rules/JavBus/favorites_actors.json`
- 旧影片收藏：`hiker://files/rules/Apollo/javbus/javbus_video.txt`
- 旧演员收藏：`hiker://files/rules/Apollo/javbus/javbus_actor.txt`
- 旧数据行合同：`title@@img@@url`；首次新收藏读取为空时自动转换为对象数组，不删除旧文件。
- 浏览偏好：`javbus_default_type`、`javbus_mag_mode`；页面临时状态使用 `javbus_home_type / javbus_search_kw / javbus_mag_sort / javbus_fav_kind`。

## 架构与版本
- Stable `2026081903` 继续冻结；它仍依赖 `ApolloRigo/R` 外部更新器，只作为回退基线。
- Test 2.0 已脱离 Apollo 运行依赖，采用：
  `Remote Shell → Bootstrap → Remote Manager → Release → Core / Compat / Runtime → Shared JAV Playback`。
- `Core`：网站协议、HTML Parser、磁力、收藏、Playback Adapter。
- `Compat`：本地文件读取兼容保护。
- `Runtime`：海阔页面与交互。
- Test 使用独立 Remote Manager app id `javbus-test`，避免与未来 Stable 状态混用。

## 已知风险与禁止回退方案
- 不允许把 Apollo 再作为 2.0 正式运行依赖；旧 Apollo 仅允许作为旧收藏数据来源。
- 不允许在 JavBus 内复制/分叉 MissAV、123AV、Jable 解析；统一走 shared playback。
- 不允许把“云盘君搜番号”描述成“磁力直传云盘君”，其当前公开规则合同不支持该说法。
- 不允许在没有海阔实机截图/请求结果时宣布 2.0 Parser、图片、防 Cloudflare、磁力、跨规则桥接完成。
- 演员与影片收藏属于两类实体，任何存储重构必须分别迁移。

## 本轮待实机回归清单：2.0.0-alpha1
- [ ] Test 从“我的规则仓库”可见且可导入，版本显示正确。
- [ ] 冷启动首页有码列表正常，封面/标题/番号/日期正常。
- [ ] 无码 / 欧美切换正常，翻页正常。
- [ ] 全部影片 / 仅有磁力 Cookie 筛选正常。
- [ ] 海阔全局搜索 + 页面内搜索正常。
- [ ] 分类页可打开，类别筛选可翻页。
- [ ] 演员列表、演员资料、演员作品正常。
- [ ] 详情封面、元数据、演员/厂商/系列/类别跳转正常。
- [ ] 样品图可显示并查看大图。
- [ ] 相似影片正常。
- [ ] 磁力 AJAX 返回；高清/字幕/大小/日期与排序正常。
- [ ] 长按磁力 → 123云盘可进入离线流程。
- [ ] 长按磁力 → 磁力君可进入 SelectTorrent。
- [ ] 长按磁力 → 云盘君按番号搜索正常。
- [ ] MissAV / 123AV / Jable 三个播放入口保持 shared playback 当前实机能力。
- [ ] 新影片收藏 / 演员收藏正常。
- [ ] 若旧 Apollo 收藏存在，首次读取兼容迁移正确且不混类。
- [ ] UI 截图复审：首页、详情、演员、分类、收藏至少各一张，再做下一版纯 UI 收敛。

## 故障与恢复记录
- 2026-08-23：重写前恢复确认旧 `2026081903` 并不是独立 JavBus Parser，而是每天从 `ApolloRigo/R/master/Hiker/𝐉𝐚𝐯𝐁𝐮𝐬` 拉远程模块并落到本地 Apollo 文件。根因不是“远程代码版”，而是核心运行事实受第三方仓库控制。2.0 Test 已从架构上移除此正式依赖，Stable 旧版保留用于回退。
- 2026-08-23：初始 Core 草稿使用了仓库中没有既有先例的 `fetchPC` 名称。提交前静态复查发现风险后，增加 `compat.js` 覆盖 `readJson()` 改用海阔已有 `fetch(hiker://files/...)` 合同；此项必须保留，避免收藏页首开 ReferenceError。

---
## 版本记录
### 2.0.0-alpha1 / Build20001 / 2026-08-23
- 首个完整重写 Test，Stable 不动。
- 建立 Stable/Test/channels/app manifest 与 Remote Manager 运行链。
- 完成有码 / 无码 / 欧美列表、搜索、分类、演员、筛选、详情、样品图、相似影片、磁力、收藏和设置的第一版原生 UI。
- 第三方播放接入共享 JAV Playback Stable（MissAV / 123AV / Jable）。
- 磁力长按接入 123云盘、磁力君.简、云盘君.简；按各程序真实规则能力分别处理。
- 旧 Apollo 影片/演员收藏加入兼容迁移，但 Apollo 不再是新版 Parser 运行依赖。
- 当前状态：代码/元数据已发布 Test，等待用户海阔实机第一轮截图与错误回传；**未晋级 Stable**。

### 2026081903 / 2026-08-19
- 重写前云仓库登记基线。
- 已知能力：视频 / 演员 / 搜索 / 本地收藏 / 收藏页分影片演员。
- 实际源码确认：核心通过 Apollo 本地文件运行，并带每日第三方远程更新逻辑。
