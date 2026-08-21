# ACFun（远程代码版）

ACFun 是 hiker-cloud 中使用 Remote Module 架构维护的自用海阔视界小程序。

## 开发前置要求

每次开发、优化、升版 ACFun 前，必须重新读取当前仓库中的三份核心文档，不允许只依赖聊天记忆：

1. `docs/PROJECT_PLAN.md`
2. `docs/HIKER_APP_DEVELOPMENT_GUIDE.md`
3. `docs/HIKER_APP_DEVELOPMENT_CAUTIONS.md`

涉及正式版/测试版命名与通道时，再读取 `docs/HIKER_RULE_NAME_CHANNEL_POLICY.md`；涉及发布、升级、Bootstrap、Release 或远程模块时，再读取 `libs/updater/RELEASE_CHECKLIST.md`。

## 当前 Stable / Test

### Stable

- 正式版：`0.4.9 / Build 149`
- Stable：`apps/video/acfun/stable.json`
- 正式 latest：`apps/video/acfun/latest.json`
- Stable Shell：`apps/video/acfun/acfun_remote_v5.txt`
- Bootstrap：`apps/video/acfun/bootstrap_v5.js`

0.4.9 继续作为实机可用正式恢复基线冻结。测试版不得原地修改 0.4.9 Release，也不得让正式 `latest.json` 指向未经实机验证的 Alpha/RC/Test。

### Test / Candidate

- 当前测试版：`0.6.0-alpha3 / Build 154`
- Test Shell：`6.0.0-test`
- Candidate：`apps/video/acfun/candidate.json`
- Test：`apps/video/acfun/test.json`
- 通道：`apps/video/acfun/channels.json`
- Test Shell：`apps/video/acfun/acfun_remote_test_v060.txt`
- Test Bootstrap：`apps/video/acfun/bootstrap_test_v060.js`

从旧 v050 Test Shell 进入 0.6 系列时需要重新导入一次 v060 Test Shell；当前已经进入 v060 的用户，从 Alpha2 升 Alpha3 只需要在测试通道正常检查更新，不再需要重复导入 Shell。

## Alpha3 当前产品结构

0.6.0-alpha3 是 Alpha2 已真实跑到手机后的第一轮完整实机闭环版，重点不再是“代码有没有写”，而是根据截图继续调整信息层级、分类质量和功能失败态。

### 首页

- 搜索为单行 `text_icon` 入口，真正输入放到独立搜索中心。
- 精选 / 漫画 / 动漫 / 视频 / 里番使用 `icon_5` 主导航，选中彩色、未选中灰色。
- 短视频 / 收藏 / 历史 / 设置使用第二层快捷入口；Alpha3 默认使用中性灰图标降权，短视频激活时才显示品牌色。
- 设置新增“首页快捷入口”开关，可整行隐藏快捷入口，让主 Feed 更早进入首屏。
- 有播放记录时显示“继续观看”。
- 首页只显示一条当前筛选摘要；完整频道 / 分类 / 标签 / 排序统一进入独立分类中心。
- 精选首条由纯大图改为 `card_pic_1` 组合精选卡，普通视频双列，短视频使用三列竖卡，漫画三列竖封面。

### 分类

- 继续使用 APP 1.9.7 动态数据：精选/里番 Station、动漫/视频 `classTypeList`、`getTagsZ → tagTitleList`、漫画 Station。
- 动漫/视频标签继续严格绑定当前父 `classifyId/videoTypeId`。
- Alpha3 在 UI/Adapter 层过滤漫画接口暴露出的布局/开发频道，例如 `竖四 / 竖两 / 05漫画频道 / 05漫画分类`，不再把内部配置直接给用户。
- 分类页增加当前条件摘要、品牌色选中态、有效频道数量和“完成，返回 ACFun”。

### 短视频

Alpha2 实机显示“推荐”模式直接空白。Alpha3 不把空白当正常结果，短视频请求按以下顺序回退：

1. `video/list + loadType + videoContentType/videoType=shortVideo`
2. `video/list + loadType`
3. 旧 Core `videoList('short')` 分支
4. 当前 3/4 模式完全为空时尝试另一公开模式

如果仍为空，页面显示产品化空状态、重新加载和接口诊断入口，不再留整屏白页。

### 详情与评论

Alpha2 实机出现“未命名 + 无封面”的空详情。根因是部分海阔组件/页面跳转情况下不能只依赖 `extra` 透传关键实体参数。

Alpha3 固定：

- `videoId / title / cover` 同时写入 `hiker://page/acfun_detail` URL 参数。
- 详情页同时读取 `MY_PARAMS + getParam()`。
- 有 `videoId` 但标题/封面缺失时，自动调用当前已验证详情链恢复一次完整资料。
- 完全没有 `videoId` 时明确显示错误态，不再伪造“未命名”详情。
- 评论页同步支持 URL 参数恢复，继续使用 `video/commentList`，并重做最热/最新和空状态。

### 搜索 / 收藏 / 历史 / 设置

- 搜索文案只写当前实际支持的“视频 / 标题 / 标签”，不再把未实现的 UP 主搜索写进主入口。
- 搜索中心保存本机最近搜索。
- 收藏/历史支持标题搜索、最近/标题排序、确认清空。
- 设置分：首页与浏览 / 性能与图片 / 播放与内容 / 数据与维护。

## Alpha3 模块拆分

- `acfun_runtime_v060_a3.js`：用户可见分类清洗、短视频回退、详情 URL 路由。
- `acfun_ui_v060_a3_home.js`：首页、分类中心、搜索中心、搜索结果。
- `acfun_ui_v060_a3_tools.js`：收藏、历史、设置。
- `acfun_ui_v060_a3_detail.js`：视频详情与详情恢复。
- `acfun_ui_v060_a3_comments.js`：评论页面。

底层播放、图片解密缓存、漫画阅读与 APP 1.9.7 分类/标签协议继续沿用 Stable 0.4.9 已验证链路。

## 远程发布强制规则

1. `release.json` 中 `modules[].path` 一律按仓库根目录相对路径填写。
2. 子目录文件写完整路径。
3. 发布元数据前确认所有模块实际存在且最终 Raw 路径可访问。
4. 已下发 Build 不允许原地修改 Release 后复用；错误 Release 必须提升 Build。
5. 发布同步核对 Release、Stable/Test、Bootstrap、Shell、应用 manifest、根 manifest/registry。
6. 必须考虑新安装、正常升级、旧 activeRelease/Bootstrap 缓存三种状态。
7. UI/分类大改先 Test/Candidate，实机截图闭环后才讨论 Stable。
8. 实机 UI 与代码设计明显不一致时，先核对实际 build / activeRelease / Bootstrap，禁止继续盲改 UI。

## 恢复方式

测试异常时，从“我的规则仓库”重新导入 ACFun 正式版，同名覆盖即可恢复 Stable 0.4.9。
