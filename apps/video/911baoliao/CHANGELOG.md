# 911爆料 CHANGELOG

## 当前基线

- App ID：`911baoliao`
- 当前通道：Test
- 当前版本：`0.1.0-test.2` / Build `10102`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 源站入口：`https://begin.mrbyudbq.com/`
- 架构：Remote Shell → Bootstrap → Remote Manager 2.0.1 → immutable release。
- 该程序不实现评论、匿名投稿或下载功能。
- 已进入“我的规则仓库”动态目录：根 `manifest.json` → `apps/video/911baoliao/channels.json` → Test Shell。

## 0.1.0-test.2 / Build 10102 — 2026-08-23 20:17

### 中文规则名内部路由实机修复

用户实机截图确认：911 首页已经可以正常打开并识别到官网内容，但点击首页按钮、分类或内容卡时弹出：

`找不到“911%E7%88%86%E6%96%99”这个小程序`

回读 Test1 源码后确认根因不是页面注册缺失，而是 `Bl911Core.page()` 把 `MY_RULE.title = 911爆料` 通过 `encodeURIComponent()` 写入 `hiker://page/...?...rule=`。当前海阔实机不会把该 `rule` 参数自动解码回规则名，而是直接拿 percent-encode 字符串查找小程序，因此匹配失败。

Test2 采用单点不可变补丁：

- 内部 `hiker://page/<path>?rule=` 改为保留原始中文规则名，不再 percent-encode `rule` 值。
- `cat_url / post_url / q` 等普通业务参数继续 URL 编码，避免参数串扰。
- 独立搜索输入回调同步修复，避免输入关键词后再次把规则名编码。
- 首页、分类、详情、收藏、历史、设置等页面均继续复用 Test1 Shell 页面声明，不改页面 path。
- Test1 首页 UI、通用 Parser、图片/播放链、本地收藏和历史逻辑保持不变，只修路由。

本次实机也确认 Test1 至少完成了两项事实闭环：① 云仓卡片和程序导入链已经工作；② 首页可以请求到站点并输出真实分类/内容卡。下一轮重点转向分类结构、封面真实性、详情正文和播放协议。

## 云端仓库发布链修复 — 2026-08-23 19:59

用户实机反馈“云端仓库没有这个小程序”后确认：首版只完成 app 目录、Release/Bootstrap/Shell 与 `registry.json`，但遗漏了手机端真正消费的根目录发布链；同时 `channels.json` 误写成内部对象结构，而不是规则仓库版本中心要求的 `schema 4 + channels[]` 合同。

已修复：

- `apps/video/911baoliao/channels.json` 改为 `schema:4`、Test-only `channels[]` 标准格式。
- 根 `manifest.json` 增加 `911baoliao` 的 `channel-group` 展示项，`channelsPath` 指向上述标准 channels 文件。
- 根目录 revision 提升到 `202608231959`。
- `manifest_meta.json` 同步相同 revision，`itemCount=15`。
- 未修改“我的规则仓库” Stable 3.5.4 的 Release、Bootstrap 或 Shell；本次只修动态目录发布数据。
- 发布判断以后必须以“manifest 卡片 + channels 可导入 + meta revision/itemCount 成对一致 + 用户实机同步”作为完整条件，`registry.json` 只作为开发恢复索引。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 产品结构

首版采用干净模块重新实现，不复制 51吃瓜 Test1~Test5 的补丁堆栈：

```text
Core
├─ Request / dynamic base
├─ dynamic Category extractor
├─ generic Feed/Search parser
├─ Detail parser
├─ Image normalizer
├─ Playback extractor / direct / iframe / sniff fallback
├─ local Favorites / History
└─ Diagnostics

Runtime
├─ Home
├─ Category Hub / Feed
├─ Search
├─ Detail / Player handoff
├─ Favorites / History
└─ Settings / Diagnostics
```

### 功能基线

- 首页热点流与自动分页。
- 官网导航动态分类，不写死 51吃瓜分类路径。
- 独立站内搜索页，多种常见搜索路径有限尝试。
- 图文详情、正文图片、相关推荐。
- 结构化 MP4/HLS、iframe 二跳媒体提取；没有结构化媒体时 `video://` 作为最后兜底。
- 单线路直接交付，多线路才构造 `urls/names/headers`。
- 详情取得的媒体 seed 直接传给播放动作，避免点击后无必要二次请求详情。
- 本地收藏、浏览历史、清理功能。
- 当前域名、HTML 长度、内容卡/分类数量和最近播放路线诊断。

### 明确不实现

- 评论及楼中楼。
- 匿名投稿、上传。
- 资源下载、侵权资源导出。

### 内容边界

首页、分类、搜索、详情与本地列表统一经过内容过滤；明显涉及未成年人或明确非自愿私密影像的条目不进入本程序浏览/播放链。

### 当前待实机确认

当前开发环境无法解析 `begin.mrbyudbq.com` DNS，因此 Test1 采用多页面形态兼容 Parser，而不是把未验证 DOM 猜成站点事实。首轮实机需要确认：

1. 首页是否能识别真实卡片与封面。
2. 分类导航的真实 URL 形态。
3. 搜索实际路由。
4. 详情正文/图片节点。
5. 播放字段位于 HTML、DPlayer config、iframe 还是 JS 渲染层。
6. 图片是否需要特殊 Header、解密或代理。

Test1 一旦发布即冻结；后续根据实机截图/诊断建立 911 专用 Adapter，以新 Test 追加，不原地覆盖。
