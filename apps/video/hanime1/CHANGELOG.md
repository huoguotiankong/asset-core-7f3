# Hanime1 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。已验证事实与待实机验证内容必须分开记录。

## 当前基线
- Legacy：`1.2.1` 仅保留历史记录，不再作为开发运行基线。
- Test：`2.0.0-test.8` / Build `20008` / Shell `2026082217`。
- 产品方向：Han1mePlus/APK 主要用于研究 Cloudflare、Cookie、登录和官网协议；海阔实现坚持“WebView 只负责验证/登录，验证后直接读取官网 HTML/API”，不追求 APK 像素级复刻。

## 已验证实机事实
- Test1：Shell 可打开；主站无 Challenge 时能直接读取真实首页。
- Test3：首页第一分区恢复 12 张卡，详情封面恢复。
- Test5：评论可读取真实评论；详情可解析 720 / 480 / 1080。
- Test6：首页 Banner/卡片封面恢复；默认最高画质播放实机通过；漫画首页可获取；评论真实数据继续可读。
- Test7：公开片库无需登录已实机可用；视频详情播放继续为 1080 优先；评论一次可读取数百条真实数据。
- Test7 实机剩余问题：预告 `/previews/YYYYMM` 仍返回 HTTP 500；片库/相关推荐部分卡片缺封面；排序按钮切换后结果不变化；视频分类不完整；漫画缺分类目录；评论卡片仍难看；视频/漫画详情缺少标签与完整元信息。

## 长期会话/验证架构
- WebView 只负责 Cloudflare Challenge 与网页登录；正常页面不强制打开 WebView。
- 视频站与漫画站按 Origin 独立验证，验证成功后通过海阔 Cookie Jar 继续 `fetch` 官网。
- Challenge 判定覆盖 `cf-mitigated: challenge`、`cf-chl-`、challenge-form、Turnstile、Just a moment、Verify you are human 等强特征；403/429/503 仅辅助。
- 交互式 Turnstile/验证码不能承诺无人值守，必须保留可见 X5 兜底。
- 账号 Cookie 与 `cf_clearance` 分离；网页登录默认使用浏览器会话，受管多账号作为附加能力。

## Test8：官网真实 Taxonomy + 专业筛选
### 筛选参数根因
- Test7 排序按钮失效的根因已确认：之前错误猜测官网使用 `upload_date / release_date / today / week / month / views` 等内部值。
- Hanime1 当前官网与 Han1mePlus `assets/search_options/*.json` 都证明：`genre / sort / date / duration / tags[]` 直接提交官网 canonical `search_key` 字符串。
- Test8 禁止继续使用自造枚举值，所有筛选统一使用官网当前 canonical 值。

### 视频筛选
- 影片类型：全部、裏番、泡麵番、Motion Anime、3DCG、2.5D、2D動畫、AI生成、MMD、Cosplay。
- 排序：默认、最新上市、最新上傳、本日排行、本週排行、本月排行、觀看次數、讚好比例、他們在看、時長最長。
- 日期：過去 24 小時、過去 2 天、過去 1 週、過去 1 個月、過去 3 個月、過去 1 年。
- 时长：1/5/10/20/30/60 分鐘以上，以及 0–10 / 0–20 分鐘。
- 内容标签按官网分组：影片属性、人物关系、角色设定、外貌身材、情境场所、故事剧情、性交体位；支持多选 `tags[]` 与 `broad=on`。
- 新增独立 `hanimeVideoFilter` 页面，使用 `flex_button` 流式 Chip + 分组标签 + 即时结果，不再依赖首页横向按钮充当完整筛选器。

### 封面链修复
- Test7 缺图根因之一：搜索/片库卡片的 `<img src>` 可能只是 lazy placeholder，真实签名 CDN 图在 `data-src / data-srcset / srcset`。
- Test8 图片选择顺序改为：对 `main-thumb` 和普通图片逐个检测 `src → data-src → data-srcset → srcset`，跳过 data/placeholder/loading/blank，再保留官网签名 URL。
- 同一解析器覆盖公开片库、搜索、相关推荐等卡片；不合成无签名 CDN URL。

### 漫画分类与详情
- 漫画目录来自 `hanimeone.me` 官方路径：标签、作者、角色、同人、社团、语言、分类。
- 新增 `hanimeComicFilter` 页面；目录项点击后继续复用 `comicBrowse(path,page)`。
- 漫画详情解析元数据链接类型：`artists/tags/languages/categories/groups/characters/parodies`，映射为作者/标签/语言/分类/社团/角色/同人。
- 详情展示作者、上传、页数、简介、分组标签和相关漫画；标签可点击进入对应漫画列表。

### 视频详情与评论
- 视频详情补充作者、类型、观看、上传、时长、评论数以及官网内容标签；标签可直接进入同标签影片筛选。
- 已验证的最高画质排序链保持不变。
- 评论不再使用会产生大块空白头像的 `movie_1_left_pic`；Test8 改成纯文本长卡：用户名/时间/回复数一行，正文独立显示，并每页 40 条。
- 楼中楼使用相同紧凑文本布局。

### 预告回退
- `/previews/YYYYMM` 格式本身已确认正确，但 Test7 实机仍 HTTP 500，说明当前 Host/接口可用性另有问题，不能再只改月份格式。
- Test8 按 `hanime1.com → hanime1.me → hanime2.sbs` 依次尝试官方预告页；拿到 2xx 且能解析卡片即停止。
- 所有 Hanime 预告线路失败后，自动回退 Han1mePlus 已采用的 Getchu 月度新番：`all/month_title.html?genre=anime_dvd&gage=adult&year=YYYY&month=MM&gc=gc`。
- Getchu 请求使用成人 Cookie、Referer，并按海阔 `Content-Type charset=EUC-JP` 解码机制处理；该回退仍需本轮实机验证。

## 产品结构
- 主导航：探索 / 片库 / 我的 / 设置。
- 片库 = 公开影片库，不登录也可浏览和筛选。
- 我的 = 稍后看 / 收藏 / 片单 / 订阅 / 历史，这些是账号私有数据，必须登录。
- 漫画探索页提供“漫画分类”入口，不再只显示热门/最新。

## 禁止回退方案
- 不盲试镜像域名绕 Challenge；镜像只用于正常站点可达性回退。
- 不把片库和账号私有库混为一体。
- 不使用 `x5_webview_single` 承担复杂登录表单。
- 不给已经可显示的签名 CDN 图片强制追加破坏签名的 Header。
- 不猜测筛选参数枚举；必须以官网表单或官方/参考客户端 canonical `search_key` 为准。
- 不破坏已通过实机验证的最高画质优先播放链。

## 回归清单
- [x] Shell 可打开
- [x] 首页列表与封面
- [x] 视频详情封面
- [x] 多画质解析与默认最高画质播放
- [x] 评论真实数据
- [x] 漫画首页
- [x] 公开片库无需登录
- [ ] Test8 片库签名懒加载封面完整度
- [ ] Test8 排序/类型/日期/时长筛选真实生效
- [ ] Test8 标签多选 + broad
- [ ] Test8 专业影片筛选 UI
- [ ] Test8 漫画标签/作者/角色/同人/社团/语言/分类目录
- [ ] Test8 漫画详情标签/阅读/相关漫画
- [ ] Test8 视频详情元数据/标签
- [ ] Test8 评论/回复新布局与分页
- [ ] Test8 Hanime 多 Host 预告或 Getchu 回退
- [ ] 独立 X5 官网登录 + “我的”五个栏目
- [ ] 视频站/漫画站真实 Challenge 自动恢复

---
## 版本记录
### 2.0.0-test.8 / Build 20008 / 2026-08-22
- 修复真实筛选参数：全面切换为官网 canonical search_key。
- 新增专业影片筛选页、完整内容标签分组与 broad 多选。
- 修复搜索/片库/相关推荐 signed lazy cover 选取。
- 新增漫画完整目录筛选与漫画详情元数据/标签。
- 视频详情增加元信息和可点击标签；评论改紧凑文本卡 + 40 条分页。
- 预告加入多 Hanime Host 轮询与 Getchu fallback。

### 2.0.0-test.7 / Build 20007
- 公开片库与“我的”拆分；登录改独立全屏 X5；首次修正 YYYYMM；评论左图右文。

### 2.0.0-test.6 / Build 20006
- 架构收敛：WebView 只做验证/登录，业务官网直读；首页封面、最高画质播放、漫画首页后续通过实机验证。

### 2.0.0-test.3 / Build 20003
- raw HTML 首页分区/卡片解析，实机恢复多卡。

### 2.0.0-test.1 / Build 20001
- 首个 Remote Architecture-First 重写测试版。
