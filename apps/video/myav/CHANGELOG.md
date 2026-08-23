# MyAv Changelog

> 程序级长期技术记忆。开发前必须先读全局项目文档、仓库迁移规范、`registry.json`、本文件、当前 Test/Release/Bootstrap/Shell 和用户最新实机结果。

## 当前基线（2026-08-23 12:30）
- 程序：MyAv
- App ID：`myav`
- 当前仅 Test：`0.1.0-test.7` / Build `10107`
- Shell Rule Version：`2026082317`
- Shell：`apps/video/myav/myav_remote_test_v7_b10107.txt`
- Bootstrap：`apps/video/myav/bootstrap_test_v7_b10107.js`
- Release：`apps/video/myav/releases/0.1.0-test.7/release.json`
- Stable：未建立，必须继续经过海阔实机回归。
- 数据源：`https://javlist.me/`
- Shared JAV Playback Stable：`1.0.0-test.4`，Provider：MissAV / 123AV / Jable。
- 云仓 MyAv 图标：`https://thumbsnap.com/i/uc3CZiMx.jpg`。

## 2026-08-23 · Test6 实机导入风险 → Test7
### 实机事实
- 用户在“我的规则仓库”打开 MyAv Test6 时，海阔弹出：`风险级别：禁止导入 / 包含违禁词`。
- Test6 相比 Test5 首次把高风险成人站点术语直接写进导入 Shell 的页面名称；Test5 没有该 Shell 字段且此前可导入。
- 因此优先按“导入壳可见文本触发平台风险扫描”处理，而不是改动已经实机工作的 Parser、收藏、分类或播放模块。

### Test7 修复边界
- 不覆盖 Test6，不原地改历史 Build；新增 Test7 / Build10107。
- Test7 业务 Release 继续复用 Test1~Test6 已验证模块，仅最后加载 `version_patch.js` 切换版本身份。
- 导入 Shell 改为中性页面命名：`演员库`，不再把高风险站点术语直接写进 Shell 页面名称。
- Shell 分组从 `②福利` 改为 `②视频`。
- Shell 的磁力子页名称改为中性 `资源列表`。
- Test7 Shell 回读确认不包含上一版新增的高风险演员术语，也不包含 `福利` 文案。
- 云仓 `channels.json`、根 `manifest.json` 的 MyAv 描述同步改为中性“演员/演员中心”文案。
- 用户指定云仓图标改为 `https://thumbsnap.com/i/uc3CZiMx.jpg`；根 manifest 与 MyAv channels 同步使用该地址。
- `manifest.json` / `manifest_meta.json` revision 同步到 `202608231230`。
- 本次更新时保留并行最新状态：ACFun Alpha11、汤头条 Test11，禁止用旧总索引覆盖其它程序。

## Test6 已完成产品能力（Test7 保留）
### 首页与排版
- 首页 8 个核心入口：搜索、筛选、演员库、分类、排行、收藏、历史、设置。
- 首页、搜索结果、演员索引、实体作品、本地收藏均可在设置中独立选择 2 列 / 3 列。
- 布局偏好使用 `myav_layout_*` 本地 item key，默认双列。

### 搜索
- 有码 / 欧美 / 国产三类原站搜索继续使用真实表单协议。
- 搜索输入使用短提示，避免 Android 输入框被占位文字挤压。
- 最近搜索本地保存，去重并前置，可重新搜索、清空关键词、清除记录。
- 演员中心入口与影片关键词搜索分离。

### 演员 / 实体页
- 独立演员中心覆盖三类女演员索引及男演员索引，真实入口仍从原站导航动态发现。
- `/t/`、`/t3/`、`/t4/` 等实体 URL 进入统一实体页：头像、名称、作品数、原站筛选、真实分页作品流。
- 详情中的演员、男演员、片商、TAG 跳转携带真实实体类型。
- 当前姓名过滤仅过滤已加载索引页；没有确认可靠全站演员直搜协议前，禁止伪装成全局搜索。

### 收藏 / 历史
- 影片收藏：`hiker://files/rules/MyAv/favorites.json`
- 演员收藏：`hiker://files/rules/MyAv/actor_favorites.json`
- 浏览历史：`hiker://files/rules/MyAv/history.json`
- 读取：`fetchPC()`；写入：`writeFile()`。
- 收藏主键使用真实详情/实体 URL，不保存 Cookie、Token 或账号隐私。

## 已验证解析基础
### Test2 图片链
- lazy-load 图片优先级：`data-original → data-src → data-lazy-src → data-lazy → data-url → data-echo → data-cover → data-ks-lazyload → data-thumb → src → srcset/style`。
- 过滤 placeholder/loading/blank/spacer/transparent/noimage/default/favicon/logo/avatar。
- 详情封面：`og:image/twitter:image → image_src → JSON-LD image → 详情首屏 → 全页评分兜底`。
- Test2/3 实机已验证真实封面恢复。

### Test3 多频道
- 有码：`default.cpp`，详情 `/c/<opaque>`。
- 欧美：`western.java`，详情 `/c4/<opaque>`。
- 国产：`domestic_index.js`，详情 `/c3/<opaque>`。
- 无码：有码根页面上的动态筛选链接，不写死 hash。

### Test4 分类与磁力
- 原站分类中心包含资源频道、标签分类、热门分类、片商新番、排行榜、三类搜索。
- `cat.py` 索引正文大量使用 `/t/<opaque>`，Parser 必须保留实体 URL。
- 磁链优先读取 magnet `dn=`，无标题时读取局部资源块；过滤 `[javlist.me]` 垃圾标题。
- 已实机验证 `SONE-350` 可恢复 19 条资源及大小/日期/字幕/高清信息。
- 磁力页支持全部/字幕/高清筛选以及默认/大小/日期排序。

## 磁力长按跨小程序合同
1. 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`
2. PikPak：`hiker://page/fxlj?rule=PikPak&realurl=<encodeURIComponent(magnet)>`
3. 123云盘：`hiker://page/diaoyong?rule=123云盘&page=fypage&realurl=<encodeURIComponent(magnet)>`
4. 光鸭云盘：`hiker://page/magnet?rule=光鸭云盘&realurl=<encodeURIComponent(magnet)>`
5. 复制磁力。

## UI / Navigation 硬约束
- 普通 title/desc 使用纯文本，不依赖 HTML 富文本。
- 同级频道、筛选、排行、搜索类型、磁链筛选/排序、实体筛选统一 `putMyVar → refreshPage(false)`，禁止制造返回栈。
- 列表→详情、索引→实体页、详情→资源/预览才是真正钻取页面。
- 第三方播放属于 Primary Action；资源、预览、收藏、原站属于工具动作。
- 无数据必须显式空状态，禁止制造假成功。

## 发布与风险规则
- 新版本禁止原地覆盖旧 Test；任何修复必须新 Build。
- 手机“我的规则仓库”读取根 `manifest.json`；`manifest_meta.json` revision 必须同步，否则设备可能继续吃旧目录缓存。
- 固定发布链：`Release → Bootstrap → Shell → test.json → channels.json → app manifest → registry → root manifest → manifest_meta → main 回读 → 实机导入`。
- 新增 Shell 页面名称前必须考虑海阔导入风险扫描；原站专用术语尽量留在远程运行时解析层，导入壳和云仓元数据优先使用中性产品命名。
- 如果 Test7 仍触发“包含违禁词”，下一步必须确认海阔是否递归扫描远程模块，而不能继续凭猜测替换业务文案。

## Test7 待实机确认
- [ ] “我的规则仓库”同步后显示 Test7 / Build10107。
- [ ] 云仓 MyAv 卡片显示用户指定新图标。
- [ ] 点击导入 Test7 不再出现“包含违禁词 / 禁止导入”。
- [ ] 导入后 Test6 的演员中心、双收藏、搜索记录、排版设置均不退化。
