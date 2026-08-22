# Hanime1 Changelog

> 程序级长期技术记忆。事实以用户当前实机结果 > main 当前 Shell/Bootstrap/Release/源码 > 本文件 > registry/manifest > 历史规划为准。

## 当前基线
- Legacy `1.2.1`：仅保留历史，不再作为当前站点兼容基线。
- Test：`2.0.0-test.14` / Build `20014` / Shell `2026082223`。
- Stable 尚未晋级；Test14 等待海阔实机回归。


## Test13 实机失败 / Test14 修复
- Test13 手机上启动即报：`SyntaxError: 不允许的字符："反斜杠"`，来源 `JSEngine#8(eval)#89(Function)`，属于海阔 JS 引擎解析兼容问题，不是登录/API 故障。
- 本地 Node/Rhino 均能解析 Test13，因此以后 Hanime 发布 Guard 不能只依赖桌面 JS 解析器；新增“新模块源码反斜杠扫描”作为该运行链的兼容检查。
- 定位 Test13 新增模块时，只有 `patch_provider.js` 与 `ui_detail_comments.js` 含反斜杠字符；Test14 不在其后简单覆盖，而是从 Release 加载链中完全移除这两个 Test13 文件，并用零反斜杠写法重写对应能力。
- Test12 已实机验证成功的 X5 `fy_bridge_app.getCookie -> putVar -> importCookie -> profile` 登录链保持不变。
- 图标统一改为 Hanime1 官网红色 `H` 标识，新资产：`apps/video/hanime1/assets/hanime1_official.svg`；Shell、channels、根 manifest 同步切换新路径以避开旧图标缓存。

## 已验证实机事实
- 首页真实内容、多分区与封面可用。
- 视频详情封面可显示；1080 / 720 / 480 可解析，默认最高画质播放通过。
- `#playlist-scroll .playlist-hover-wrap` 真选集可解析，点击其它集直接播放。
- 漫画首页、漫画分类与详情基本链可用。
- 评论 `/loadComment` 可读取真实数据，楼中楼 `/loadReplies` 可用。
- 公开片库无需登录可浏览。
- 官网预告页当前自身 HTTP 500，上游恢复前保持故障降级。
- **Test12 X5 WebView bridge 登录已由用户当前实机确认成功**：网页内 `fy_bridge_app.getCookie('')` → `putVar()` → 规则侧 `importCookie()` → `profile()` 校验 → 账号保存。该结论可作为跨程序可复用方法。
- 规则侧 `getCookie()` 与 X5 WebView Cookie Jar 在当前实机环境不应假定共享；Test9-11 的直接同步路线已证伪。

## Test12 实机反馈（已闭环/继续项）
- 登录：已成功，正式从实验链升级为当前账号基础链。
- “我的”已能读取真实账号名/邮箱、片单/收藏等官网数据，但账号中心、创作者信息与 UI 仍需强化。
- 作者与评论头像为空；详情页实际网站区分“作者”和“上传者”，当前程序此前只显示作者。
- 用户要求作者目录独立页面并尽量还原官网作者主页结构。
- 用户要求分类/标签继续补全，尽量覆盖官网全部功能。

## Test13 设计与实现
### Provider
- 视频详情重新按 Han1mePlus 当前真实 DOM 解析：
  - 作者：`#video-artist-name` + `subscribe-artist-id`。
  - 作者头像：`#video-user-avatar` / 相邻图片 / 作者公开主页头像兜底。
  - 上传者：`video-description-panel` 内 `display:flex` 用户行，解析 `/user/<id>`、名称和头像。
- 新增 `publicUser13(id,path,page)`：读取官网 `/user/<id>` 公开主页，恢复头像、显示名、`@id`、订阅者数、视频数、简介、首页/影片/播放清单导航、公开影片和片单。
- 新增 `artistDirectory13(page,query)`：直接读取官网 `/search?type=artist`，解析 `.search-artist-card`、头像、作者名、视频数、分页。
- 账号 `profile()` 增强头像与订阅者/视频数量恢复。
- 评论改为按评论 body/post 结构配对解析，头像从真实评论 body 内 `<img>` 获取；继续保留回复 ID/回复数并增加可显示点赞信息。
- 回复列表同步尝试恢复头像。

### 作者 / 上传者
- 新增 `hanimeArtists` 作者目录页面：搜索、分页、三列作者卡，避免把作者混在普通影片筛选里。
- 新增 `hanimeAuthor` 公共主页页面：Hero、头像、名称、@ID、订阅者/视频数、官网主页入口、首页/影片/播放清单切换。
- 视频详情明确分成“作者”和“上传者”；两者均可进入对应公开主页（缺 ID 时退化到关键词作品搜索）。

### 账号
- `我的` 重构为真实账号工作区：账号 Hero + 账号中心/我的主页/刷新 + 稍后看/收藏/片单/订阅/历史。
- 账号中心继续保留昵称、邮箱、密码、官网资料页、多账号切换、添加账号和退出账号。
- Test12 登录桥接保持不动，避免破坏已验证链。

### 分类 / 标签
- 继续采用 Han1mePlus `assets/search_options` 对应的官方 canonical `search_key`。
- 类型、排序、日期、时长保持完整集合。
- 标签继续完整开放 7 大组：影片属性、人物关系、角色设定、外貌身材、情境场所、故事剧情、性交体位。
- 分类页增加作者目录入口与标签搜索；点击条件/标签仍直接进入结果，不恢复二次“应用筛选”。

### 评论 / 详情 UI
- 评论：头像 + 用户/时间/赞/回复 → 正文 → 明确楼中楼入口，每页 15 条。
- 详情：Hero → 播放/评论/下载 → 真选集 → 作者与上传者 → 作品信息 → 简介 → 全部内容标签 → 画质 → 相关推荐。
- 已验证播放、封面、真选集、漫画链不改协议层。

## 登录架构（当前正确链）
```text
X5 官网 /login
→ 用户完成网页登录
→ WebView 内 fy_bridge_app.getCookie('') 读取真实 Cookie（含 HttpOnly）
→ fy_bridge_app.putVar() 回传规则侧
→ Provider.importCookie()
→ /user/<id>/edit / profile 校验真实身份
→ Core.saveAccount()
```

硬约束：
- 只看到 `XSRF-TOKEN + hanime1_session` 不等于登录成功；访问登录页本身即可建立匿名 Laravel Session。
- 登录完成必须以能识别 `/user/<id>` 并读取账号资料为成功标准。
- 不假设 X5 Cookie 与规则 `getCookie()` 自动共享。
- 不保存账号密码；账号会话只保存 Cookie。

## 已验证且禁止破坏
- X5 bridge 登录链（Test12 实机成功）。
- 首页/片库签名封面链。
- 视频多画质及最高画质优先顺序。
- 真选集来源 `#playlist-scroll` 且点击直接播放。
- 漫画首页/分类/详情基本数据链。
- 官网筛选 canonical `search_key`。
- 逐页面封面布局设置。

## 待 Test14 实机回归
- [ ] 作者头像是否恢复。
- [ ] 评论/回复头像是否恢复。
- [ ] 详情是否正确区分作者与上传者，且两者名称/头像与官网一致。
- [ ] 作者目录是否能分页、搜索并显示真实作者头像/视频数。
- [ ] 作者/上传者公开主页是否能显示头像、订阅者、视频数、影片和播放清单。
- [ ] “我的”五栏（稍后看/收藏/片单/订阅/历史）是否稳定。
- [ ] 账号中心资料修改、多账号切换、退出是否不退化。
- [ ] 完整分类/标签页是否全部可浏览、标签搜索是否可用。
- [ ] 评论新布局与楼中楼入口是否更舒服。

## 技术债
- Test1-14 仍是增量覆盖链，Test14 累计 56 个模块。
- 核心功能稳定后必须建立 consolidated Candidate runtime，压缩为 Core / Provider / Pages / Account / UI / Runtime 少量模块，再考虑 Stable。

---
## 版本记录
### 2.0.0-test.14 / Build 20014 / 2026-08-22
- 修复 Test13 海阔 JS 引擎非法反斜杠启动错误。
- Release 彻底移除 Test13 两个故障模块并零反斜杠兼容重写。
- 保留已验证登录链、作者/上传者、账号、头像、评论、分类能力。
- Hanime1 小程序与云仓卡片统一切换官方红色 H 图标。

### 2.0.0-test.13 / Build 20013 / 2026-08-22
- Test12 X5 bridge 登录由实机确认成功，正式升级为账号基线。
- 作者/上传者分离，修复头像解析。
- 新增作者目录、作者/上传者公开主页。
- “我的”与账号中心重构。
- 评论头像/元信息重构。
- 完整分类增加作者入口与标签搜索。

### 2.0.0-test.12 / Build 20012
- X5 网页桥接 Cookie 登录。
- 取消片库二次筛选弹层。
- 作者点击进入作品结果。
- 评论卡片继续重排。
- 新增逐页面封面布局设置。

### 2.0.0-test.11 / Build 20011
- 选集点击直接播放、纯文本筛选状态、时长格式化、评论去重、WebView 登录尝试。

### 2.0.0-test.10 / Build 20010
- 真选集、五行筛选、fetchCookie 登录尝试、评论头像头部。

### 2.0.0-test.8 / Build 20008
- 官网 canonical search_key、完整视频/漫画 taxonomy、signed lazy cover。

### 2.0.0-test.6 / Build 20006
- WebView 负责验证/登录，业务官网直读；封面、最高画质播放、漫画首页随后通过实机。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
