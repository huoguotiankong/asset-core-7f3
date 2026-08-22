# 海阔小程序编写注意事项

版本：2.9
首次建立：2026-08-20  
最近增强：2026-08-22  
文档性质：**长期踩坑档案 / 发布前必查 / 发现新坑立即追加**

> 本文档专门保存“容易踩坑、已经发生事故、跨对话最容易遗忘”的硬约束。开发已有程序前，除三份全局文档外，必须继续读取目标程序 `CHANGELOG.md`、当前 Stable/Test/Local/Candidate 元数据、release/Bootstrap/Shell/实际模块以及用户实机结果。

---

# 0. 固定使用方式

开发前：

```text
PROJECT_PLAN.md
→ HIKER_APP_DEVELOPMENT_GUIDE.md
→ 本文档 P0/P1
→ registry
→ 目标程序 CHANGELOG
→ stable/channels/latest/test/candidate/release
→ Shell/Bootstrap/实际模块
→ 用户实机版本/截图/报错
→ 才开始修改
```

发布前：

- 任一 P0 未通过，不允许晋级 Stable/切 latest。
- UI 大改没有实机截图闭环，不算完成。
- 图片/播放这种运行时能力没有实机回归，不算完成。
- 目标程序主 CHANGELOG 未同步，发布视为未完成。

---

# P0：版本、发布、自举与上下文

## 1. Stable release 不得原地覆盖

海阔 `require(url, options, version)` 会缓存远程模块。同 URL/同 version/build 很可能继续命中旧缓存。

正确：冻结旧版 → 新 version/build/release → 验证 → 再切 Stable。

## 2. 缓存型故障必须新 build / 新缓存键

已经进错误缓存时，不要继续覆盖同名文件“赌它刷新”。必要时 release URL、Bootstrap 文件名一起变化。

## 3. `stable/latest` 永远最后切

固定顺序：

```text
业务模块
→ release.json
→ Bootstrap/Shell（如需）
→ Guard/回读
→ Candidate/Test 实机
→ CHANGELOG
→ manifest/registry/channels
→ stable/latest
```

## 4. 海阔规则壳 `version` 是 32 位有符号整数

真实事故：`20260820342` 触发 `int value overflow, field: version`。

必须满足：

```text
0 <= version <= 2147483647
```

项目推荐安全 10 位 `YYYYMMDDNN`；业务 SemVer/build 与壳数值 version 分离。

## 5. 重新导入 Shell 不等于 Remote Manager 状态已切换

`hc_remote_state_<appId>` 等持久状态可能仍指向旧 Core。重大修复使用 minBuild/migration/new build；migration 必须一次性、可识别、尽量可回退。

## 5A. Remote Release 更新不等于云端仓库已经下发新 Shell

真实事故：ACFun `test.json` 已从 Alpha2 更新到 Alpha4，但测试通道继续复用同一 `acfun_remote_test_v060.txt`、同一规则数字 version 与 `bootstrap_test_v060.js?v=6000`；手机因此一直启动壳内置的 Alpha2。程序内更新又把基础 Bootstrap 的 `requireManager()` 错写成不存在的 `manager()`，最终显示“更新异常：找不到函数manager”。

Shell/Bootstrap 不兼容或需要强制迁移时，必须成套发布：

```text
新业务 build / immutable release
→ 新 Bootstrap 文件名 + 新 require 缓存键
→ 新规则 Shell 文件名 + 递增的 32 位安全 version
→ channels / manifest / registry / 根仓库索引切新路径
→ 从云端仓库同名覆盖导入
→ minBuild/defaultRelease 强制越过旧 active state
```

程序内更新只处理当前 Shell 能兼容的 Remote Release，不能替代规则仓库导入。序列化的 `lazyRule` 也不得引用不存在的继承方法或外部局部变量；回调依赖的 Bootstrap URL/version 要显式传参，管理器统一通过当前 Bootstrap 已声明的入口取得。

## 5B. 云端仓库“广告 Build”必须等于实际安装工件基线

2026-08-22 Hanime1 再次出现同类交付事故：`test.json / channels / registry` 已广告 `Test26 / Build20026`，但 Cloud Repo 仍指向旧 `hanime1_remote_test_v4.txt`；这个 Shell 固定引用 `bootstrap_test_v4.js?v=20024`，而 Bootstrap 的 `minBuild/defaultRelease` 都是 20024。Remote Manager `load()` 正常启动不会 fetch latest，所以用户从云端仓库“重新导入 Test26”后仍真实运行 Test24。

因此以后不能只检查业务 release 是否已经升版，还必须检查**安装工件闭环**：

```text
channel/test advertised build
== release.json build
== installerBuild（若使用该字段）
<= Bootstrap minBuild
<= Bootstrap defaultRelease.build
```

更准确地说，Cloud Repo 卡片广告 `Build N` 时，其 `rule` 指向的 Shell/Bootstrap 必须能保证新装或重新导入用户进入 `Build >= N`。如果逻辑 Shell 架构无需变化，可以保留同一逻辑版本号，但安装文件要按 build 版本化，例如：

```text
hanime1_remote_test_v4_b20026.txt
→ bootstrap_test_v4_b20026.js
→ minBuild/defaultRelease = 20026
```

现有已安装用户仍可走程序内 update，不要求每次业务升版都重新安装；但**云端仓库当前 Test/Candidate 的安装入口**不能长期复用一个默认只安装旧 Build 的壳。

发布前必须运行：

```text
python tools/remote_installer_guard.py --root .
```

或至少对本次通道运行 `--channel <path/to/test.json>`。该 Guard 专门拦截 advertised build 高于 Bootstrap `minBuild/defaultRelease.build` 的情况。

## 6. 关键索引不能是“单在线通道 + 短缓存 + 无 stale cache”

正确链：

```text
新鲜有效缓存
→ 主通道
→ 备用通道
→ 上一次有效 stale cache
→ 诊断错误页
```

已使用成功过的程序不应因为一次 GitHub/API 抖动直接白屏。

## 7. 备用通道不能只判断“非空”

HTML 限流页、502/503、错误 JSON、登录页都可能非空。写缓存前必须校验 HTTP/业务状态、类型、schema 和必要字段。

## 8. 严重事故不要“补丁叠补丁”

Shell/Bootstrap/Core/Manager/cache 同时变化会迅速失去可观测性。冻结坏版本，新建隔离 release，完整验证后再发布。

## 9. 自举工具必须有仓库外 Recovery

规则仓库之类“自己管理自己”的程序，至少有：正常更新中心 + 不依赖当前首页/manifest/active Core 的独立 recovery 入口。

## 10. 未读 CHANGELOG/Stable 就直接开改属于高风险行为

新对话最容易犯的是上下文错：复活旧接口、重做已证伪方案、忘记图片/播放解密链、UI 修复破坏稳定播放。

## 11. 动态事实优先级不能颠倒

```text
用户当前明确指令/实机
> stable/channels/latest/release/实际源码
> 程序 CHANGELOG
> registry/manifest
> 三份全局文档历史快照
> 旧聊天记忆
```

## 12. Stable 晋级但 CHANGELOG 未同步属于发布缺陷

CHANGELOG 是长期技术记忆，不是发布后有空再补的说明书。

## 13. CHANGELOG 不得保存真实秘密

可写算法、字段、来源、刷新方式、Key/IV 生成规则；禁止真实密码、有效 Token/Cookie/Authorization、私钥/API Secret、私人服务凭据。

## 14. 缺失历史不能靠猜

旧程序没有记录时只能标“当前已知/待确认”；不要从相似站点、旧 APK 或另一个程序推断当前协议来填满文档。

---

# P1：架构、状态、模块与并发

## 15. UI 显示版本不要硬编码多份

统一读运行时 version/build/Shell/Manager。

## 16. `preRule` 不承担重型/危险动作

禁止每次启动清 Remote state、清全部缓存、强制检查更新、大量联网、删除用户数据。

## 17. 状态 Key 必须命名空间隔离

推荐：

```text
<appId>_<providerId>_<module/page>_<key>
```

## 18. Provider 私有状态不能串源

Cookie、域名、页码、线路、失败次数、正文/评论缓存都要隔离。

## 19. 未启用 Provider 不初始化、不请求

Lazy Load 是默认。

## 20. Remote module 加载阶段不要执行不可逆动作

`require()` 优先只定义/导出对象；不要加载即登录、删文件、切版本、清数据、发一堆 API。

## 21. 公共远程库要版本化

Stable 绑定明确版本目录，例如 `libs/updater/v2.0.2/...`；已发布版本只读。

## 22. 不要为了“统一新规范”批量重构所有 Stable 旧程序

等正常升级逐步迁移，并保留回退路径。

## 23. Candidate/Test 失败就废弃候选

不要“顺手改 Stable”。

## 24. `batchExecute` task 不要闭包引用外部局部变量

通过 `param` 传入；生命周期、confirm、部分 lazyRule/rule 序列化回调同理。

## 25. 多线程不要直接并发写 `setItem/putMyVar`

task 返回结果，listener 集中写；必要时 `syncExecute()`。

## 26. 缓存必须有作用域 + schema/version

协议/模型变化时能明确失效旧缓存，不依赖用户手动“清全部缓存”。

## 27. 并发不是把所有接口/图片同时打满

按 P0/P1/P2/P3 分级，有并发上限、超时、停止条件，注意站点风控。

---

# P1：UI / UX 与原生组件

## 28. 普通组件不要塞任意 HTML

真实事故出现过 `<b>/<small>/<font>` 被原样显示。富文本只放官方明确支持的组件/字段。

## 29. `text_4/text_5` 信息量要克制

多列组件使用短文本，不硬塞复杂两行说明。

## 30. `input` 与频繁动态 flex/scroll 刷新注意失焦

输入区和动态结果区尽量隔离，结果优先局部更新。

## 31. `updateItem` 的 `extra.id` 必须全局唯一

推荐 `<app>-<page>-<module>-<entityId>`。

## 32. 二级页避免沉浸式标题栏叠加

优先 `hiker://page/<path>?rule=&simple=true`。

## 33. `x5_webview_single` 不做普通 UI

用于登录/验证码/必须网页能力；普通列表、详情优先原生组件。

## 34. 正式图标不要依赖 `data:image/svg+xml`/第三方 favicon 作为唯一资源

重要程序使用稳定 assets + fallback。

## 35. 第三方 Favicon API 只做开发阶段“发现器”

确认图标后应固化到项目 assets。不能让正式程序长期依赖若干第三方 favicon 服务轮询。

## 36. 不用大量 `blank_block` “垫高级感”

会造成首屏内容少、不同屏幕失衡。优先层级、`line/line_blank`、组件天然间距。

## 37. Emoji 不能承担正式主图标体系

不同系统字体/尺寸/颜色不一致。

## 38. 不要把所有筛选/设置常驻首屏

一级栏目常驻，高频少量筛选横向显示，大量低频条件折叠，设置/诊断后置。

## 39. 技术字段不能抢主视觉

build/schema/revision/cache key/Manager 放设置/诊断，不占 Hero。

## 40. Primary Action 与次操作不能同权

播放/阅读/导入/打开必须比复制、诊断、清缓存等更突出。

## 41. UI 大改没有实机截图闭环不得称完成

至少 Test → 实机截图 → 看层级/密度/比例/长文本/空状态 → 修正 → 再验收。

## 41A. 页面关键实体参数不能只依赖 `extra` 透传

2026-08-21 ACFun Alpha2 实机出现“详情页未命名 + 无封面”：列表卡片代码明明写了 `extra.video_id/video_title/video_img`，但部分组件/Page 跳转场景下关键自定义字段没有按预期出现在详情 `MY_PARAMS`。

通用规则：

```text
关键 entityId / contentId / chapterId
→ URL query 参数至少带 ID
→ 标题/封面等轻量种子可一并带上
→ 详情页同时读 MY_PARAMS + getParam()
→ 有 ID 但种子缺失时按 Provider/API 恢复
→ 完全无 ID 时显示错误态，不伪造“未命名”
```

`extra` 继续用于 UI 状态、长按菜单和可选数据，但不要把跨页面唯一主键的正确性只押在 `extra` 上。

## 41B. 动态分类不能把服务端所有 Station/Category 原样暴露

APP/API 可能同时返回真实业务分类、布局实验、测试频道、内部专题、排序模板。推荐：

```text
CategoryExtractor
→ 原始 CategoryModel
→ UserFacing CatalogAdapter（清洗/去重/内部项过滤）
→ Selected State
→ Renderer
```

过滤必须有当前接口/实机依据，不能重新退化成截图白名单；目标是去掉明确内部项，同时让未来新增真实分类仍能动态出现。

## 41C. 对“应当有内容”的 Feed，空数组不一定是正常成功

短视频/推荐流等正常情况下应持续有内容。如果某一路请求返回空：

- 不要立即把空列表写成长缓存。
- 先判断当前参数/模式是否匹配。
- 按已验证兼容链尝试有限 fallback。
- 所有 fallback 都空时才进入产品化空状态/诊断。
- 不得为了“有内容”无限换接口、随机参数或串到别的分类。

## 41D. 不要猜 `$().select(...)` 构造参数重载

真实事故：2026-08-21 “我的规则仓库”RC6 点击“默认排序”时，旧 `$().select(...)` 写法把第二个字符串参数“排序方式”当成需要数值解析的参数，最终抛出：

```text
For input string: "排序方式"
```

RC7 改为官方明确的：

```text
select://{"title":"排序方式","options":[...],"col":2,"js":"..."}
```

同一设备实机正常弹出两列选择面板。

长期规则：固定排序、运行方式、清理类型等静态选择优先明确 `select://`；简单文本输入可使用 `input://`。只有参数签名已经从当前官方文档/当前实机确认时才继续使用构造器重载，不从旧样本猜形参顺序。

## 41E. 同一选中态不要叠多个视觉信号

真实截图暴露过“活动蓝色图标 + 黑色 `●` + 文字”同时出现。功能没有问题，但会让原生界面显得脏乱。

原则：

- 有明确 active icon / active color 时，标题不再重复加 `●`。
- 没有可靠颜色/图标选中态时，才退回纯文本符号方案。
- 当前设备验证 `icon_5_no_crop` 活动蓝色图标正常，不代表所有海阔版本无需测试；新设备仍走 Candidate 截图闭环。

## 41F. 密集列表不要默认“主卡 + 独立标签行”

程序管理类页面中，每项再追加 2~3 个 `flex_button/scroll_button` 会显著抬高列表，而且横向空间不足时海阔可能自动出现额外 `>` 溢出入口。

若标签只是辅助信息而非独立高频动作，优先把少量标签并入主卡 `desc`；只有标签本身需要点击筛选且价值足够高时才保留独立 chips。

## 41G. 不要把“改文案、删两个按钮”误当成 UI 结构升级

2026-08-21 “我的规则仓库”RC9 已正确加载新 Core，About 页也能显示新 UI 名称，但用户实机仍明确感觉“效果没什么变化”。根因不是缓存，而是 RC9 继续沿用 RC8 的首屏骨架，只收缩工具栏与描述文本；页面区域顺序、组件族和主要交互路径几乎未变。

长期规则：

- UI 大版本必须列出旧/新首屏骨架并比较结构差异。
- 只改标题、描述、标签数量、按钮数量属于密度/文案小修，版本命名和预期要如实表达。
- `icon_1_left_pic` 等紧凑组件在不同设备上可能只稳定显示一行描述；关键状态必须放到实机确认可见的行，不依赖理论上的第二行。
- 如果用户反馈“版本升了但看起来一样”，先核对运行版本；确认已切新 Core 后，立即检查组件骨架和实机可见字段，不继续靠版本号或测试标识证明变化。

## 41H. 只重排首页、其余核心页沿用旧语法，整体仍会被判断为“没变化”

2026-08-21 “我的规则仓库”RC10 已在 About 页明确显示 `3.5.3-rc10 / Workspace 7.0 / Build 375`，首页也确实增加搜索和继续使用，但用户第二轮实机仍反馈“好了一点，整体变化不大，离预期还有很大区别”。截图证明缓存与版本链正常，问题在于首页程序列表、分类管理和多版本详情仍分别沿用旧列表、灰色胶囊筛选与长信息流，缺少目标图最醒目的数字统计、右侧状态、标签层、双栏分类树与紧凑详情关系。

长期规则：

- 大幅 UI 目标必须列出至少三张核心页面的感知锚点，不能把首页一页等同于整体产品。
- 参考图差异优先按“组件族 + 信息权重 + 跨页一致性”修复，不能继续只换区块顺序。
- 首页、分类、详情若使用三套互不相关的视觉语法，即使每页单独可用，整体仍显得像旧工具页拼接。
- `rich_text`/data-SVG 仅用于受控展示；关键操作继续是可验证的原生组件和明确路由。
- 结构测试只能证明输出骨架，最终仍必须用新版 About 截图 + 三张核心页实机截图闭环。

## 41I. data-SVG、空 SVG 和行首空格都不能按浏览器行为想当然

2026-08-21 “我的规则仓库”RC11 实机同时暴露三类渲染差异：统计卡 data-SVG 的数字 `<text>` 显示成无关字形；完全空的透明 SVG 在 `icon_2` 中显示破图占位；`rich_text` 行首全角空格被裁掉，导致标签摘要从屏幕最左侧开始。`avatar` 标题中的连续普通空格也被折叠，名称与版本发生视觉粘连。

长期规则：

- data-SVG 若仅作实验，至少使用 `path/rect` 等几何图元而不依赖字体；但关键数字不再默认使用内联 data-URI。
- 图片内的关键数字/状态必须在原生 title/desc 有文本兜底。
- 空 SVG 与低透明 drawable 都可能被目标图片链显示成破图；需要透明图片补位时应先改布局结构。
- `rich_text` 行首对齐使用 `&nbsp;` 等经过当前设备验证的写法，不依赖普通/全角空格。
- 连续空格不承担字段分隔职责，名称/版本使用明确分隔符或全角间隔。
- 修复进入 Test 后仍必须看实机；结构测试只能确认代码不再含 `<text>` 或空 SVG，不能证明目标图片解码器已经正确显示。

同一轮搜索页还确认：第五个横向范围项容易触发自动溢出 `>`；“清空”若与历史词都使用灰色 chip，会被误认为可搜索内容。低频筛选和清空动作进入明确菜单或工具入口。

## 41J. 四个横向项也会溢出；静态资源与结构重排优先于继续修 data-URI

2026-08-21 “我的规则仓库”RC1 About 已正确显示 `3.5.4-rc1 / Native Product 9.0 / Build 378`，所以用户反馈“和上一版区别不大”再次不是缓存。六张实机图同时确认：纯几何 data-SVG 统计仍显示无关图形；低透明 SVG 占位仍破图；四个带数量的 `scroll_button` 仍出现 `>`；九个 `text_3` 热门标签变成 3×3 灰色卡片墙；设置、分类与版本页的主骨架没有改变。

长期规则：

- 图片链连续两轮实机失败后，停止在同一种 data-URI 方案上换字体/路径/透明度；改用仓库内全新静态资源 URL，或直接使用原生文本组件。
- 横向溢出取决于实际标题宽度，不取决于“只有几个项目”；带数量、状态或长中文时优先等宽单行卡或 `flex_button`。
- `text_3/text_2/icon_2` 的“天然成列”不等于高级感；出现灰色按钮墙时应改为列表、折叠或分步任务结构。
- 一次迭代若首页、分类、搜索、详情/版本中心、设置仍沿用旧组件族，只修图片和文案，应标为兼容修复，不得宣传成结构升级。
- 结构版先进入 Test；Stable 只有在新版 About + 首页 + 分类 + 搜索 + 版本/设置实机截图通过后才晋级。

## 41K. 普通列表底栏不会自动固定；固定视口也必须隔离滚动容器

2026-08-21 “我的规则仓库”RC2 实机确认：即使五项导航在代码里最后追加，它仍是普通结果列表的一部分；程序越多，用户越要滚动很久才能再次找到分类、搜索、更新和设置。分类页改成纵向任务清单虽避免破图，却丢失规划稿最重要的左右层级关系。

长期规则：

- 不要把“最后 push 五项导航”描述为固定底栏；普通 `setResult` 没有已确认的 sticky/fixed 结果项属性。
- RC3 实机证伪：`x5_webview_single` 的 `desc:'float&&top'` 在目标设备上进入带 X5 首页/搜索/标签/设置工具栏的浏览器模式，后续原生结果项没有成为产品固定导航。该模式在本项目中禁止继续使用。
- RC4 实机继续证伪：`list&&screen-100` 虽能显示网页内五栏，外层结果页仍可能与底栏一起移动；只锁 `overflow-x` 也无法保证首页不会横向漂移。当前受控实现改用 `desc:'float&&screen-100'` 的单 X5，并在网页内显式锁定 `html/body/shell` 高度与双轴溢出。
- 固定底栏不是给导航写 `position:fixed` 就结束。页面必须采用“固定外壳 + `minmax(0,1fr)` 内容区 + 固定导航行”；首页 Hero、统计和工具栏保持在内容区顶部，只有“我的程序”列表拥有独立纵向滚动容器。
- 一个工作台只能有一个 `x5_webview_single`；首页、分类、搜索、普通详情、多版本详情、更新、设置和记录都在同一 DOM 内切换。内部返回栈保存视图与滚动位置，底栏切换清空内部栈，禁止每点一次就 `fba.open` 一个新的海阔页面。
- 分类目标行（例如“全部视频”“短剧”）必须在右栏原地展开程序卡；第一次点击只展开/收起，只有点击展开后的程序卡才进入同工作台详情，不能把分类行直接当页面跳转。
- 网页桥只承担真实业务边界：打开/导入具体程序、导入某个通道版本、更新仓库 Core 等。详情、搜索、分类、设置、记录等纯展示路由不得调用 `fba.open`。
- `fba.parseLazyRule` 的输入不是任意原生 lazyRule 占位串。RC5 实机证明把 `#noLoading#@lazyRule=...` 交给网页桥会在执行脚本前被 HTTP 层拒绝并报 “Expected URL scheme http/https”；网页工作台动作必须以完整 `https://...` 基址构造，再解析返回结果。原生列表页继续使用 `#noLoading#` 不代表网页桥也兼容。
- `parseLazyRule` 执行的回调不能假设仍处于生成页面的规则上下文。RC6 实机证明裸 `$.require('hiker://page/ruleRepoCore')` 会报 “Module cannot be found”，并让程序导入、备份、诊断等所有 Core 动作同时失效。子页面模块必须显式携带原始规则名（`hiker://page/<path>?rule=<规则名>`），且关键自举工具必须再提供版本化 Bootstrap/Remote Manager 恢复通道；两路失败都应收敛为 `toast://`，不得抛到系统解析框。
- `fba.importRule` 只接收软件可识别的完整口令。网页动作解析后先判断 `海阔视界… / rule:// / toast:// / copy:// / confirm://`，再调用相应接口；未知字符串和相对地址必须在工作台内报可读错误，禁止兜底交给 `fba.open`，否则会把业务数据再次当成 HTTP URL。
- 当前目标设备要求桥接 URL 中使用原始中文规则名；对 `rule` 整体 percent-encode 会直接报“找不到这个小程序”。业务参数仍应按字段编码，关键标识同时在当前 DOM 状态中保留。
- 必须保留恢复链。结构测试至少确认：仅一个 `x5_webview_single`、模式为 `float&&screen-100`、外壳无横向溢出、恰好五个底栏入口、首页只有程序列表可滚动、分类具备内联 accordion、内部导航不调用 `fba.open`、普通/多版本详情可同页返回，并模拟搜索与滚动位置恢复；最终仍以长列表实机滑动、点击/返回和深浅色截图为准。

---

# P1：Protocol / Crypto / Auth

## 42. 页面层禁止直接承担 Token/签名/解密

统一放 Protocol/API Client/ImageAdapter/PlaybackAdapter。

## 43. 有结构化 API 时不要优先扫描 HTML

HTML 更慢、更脆；扫描仅作必要兜底。

## 44. 协议/解密结论必须写目标 CHANGELOG

包括签名字段/顺序、AES/XOR/Base64/RC4、自定义解码、Key/IV 来源、图片前 N 字节处理、播放 URL 解码链、APK/网页版本差异。

## 45. 已证伪方案也要记录“不要再用”

否则未来维护者很容易再走回旧 API/错误算法。

## 46. 不要每请求/每张图重复 `eval(getCryptoJS())`

优先海阔内置 Crypto → `crypto-java.js` → 单例 CryptoJS → 必要 Java Cipher。

## 47. “看起来像 AES”不是算法依据

必须确认 mode/padding/key/iv/输入编码/处理范围。

## 48. DEX/SO/loadJavaClass 不作为普通项目默认依赖

只有官方 JS/普通 JS 无法满足明确需求时才考虑。

## 49. Token 刷新必须有生命周期模型

读取 Token → 提前量判断过期 → refreshToken → 刷新失败再登录。不要每个 API 自己写一套登录判断。

## 50. 异步任务轮询必须有上限

离线/转码/下载任务：创建 → 轮询 → 超时/失败 → 可重试；禁止无限 while/poll。

---

# P1：图片 / InputStream / 解密

## 51. 图片 `@js=` / `$().image()` 必须遵守 InputStream 契约

输入是 InputStream，返回也必须是可继续读取的 InputStream。

## 52. 图片 `@js=` 放在 Header/Cookie/Referer 标识之后

顺序错误可能让请求/解密链失效。

## 53. 自己 `fetch(...,{inputStream:true})` 得到的流要关闭

使用 `closeMe(stream)`；但不要提前关闭即将返回给图片加载器的结果流。

## 54. 先识别明文再解密

JPEG/PNG/GIF/WebP 已经正常就直接返回，禁止再次 AES/XOR。

## 55. Renderer 不负责图片解密

只调用 `ImageAdapter.image(model)`；Header、AES/XOR/3DES、缓存、缩略图策略统一在 ImageAdapter。

## 56. 重复封面不要每次重新下载+解密

首次成功后按 URL + codec schema 缓存。

## 57. 首页不要无脑拉原图并解密

首页 thumbnail；详情高分图；Reader 章节原图。

## 58. 图片失败要分阶段

至少：`URL_FIELD_EMPTY / REQUEST_FAIL / HEADER_FAIL / UNKNOWN_FORMAT / DECRYPT_FAIL / STREAM_FAIL / CACHE_FAIL`。

---

# P1：播放 / 免嗅 / 嗅探 / HLS

## 59. “能播”不等于“免嗅”

必须准确记录播放路线。`video://`、`webRule://`、`x5Rule://` 本质上是网页资源提取/嗅探兜底，不属于优先的结构化免嗅。

结构化免嗅优先指：已有直链、播放 API、静态源码 player 字段解析、已知协议字段解码/解密、已知 HLS 重建/代理。

## 60. 有直链/播放 API 时不要先网页嗅探

标准顺序：

```text
已有 directUrl
→ 官方/APP Play API
→ 普通 fetch 解析 player/source 字段
→ 已知协议字段解码/解密
→ 必要 HLS 修正/Proxy
→ fetchCodeByWebView（JS 渲染后结构化源码）
→ 可信委托解析器
→ video://
→ webRule://
→ x5Rule://
→ 原网页播放器
```

## 61. `fetchCodeByWebView` 与网页资源嗅探要区分

它可以只是等待 JS 渲染完成后读取 DOM/源码，再做结构化解析；仍有 WebView 启动成本，但不是“抓第一个媒体请求”。

## 62. “通免/魔断/lazyParse/第三方解析”不能只看函数名判断是否真免嗅

委托解析器内部可能是远程 API、网页嗅探或混合方案。必须在 CHANGELOG 记录解析器来源、输入/输出、外部依赖、失败降级。自己能从 API/源码稳定拿直链时优先自己解析。

## 63. 新项目网页嗅探不默认优先 X5

当前官方能力优先 `webRule://`，`x5Rule://` 作为兼容路径；最终以实机站点兼容为准。

## 64. `video://` 嗅探规则要精确

广告 MP4、统计资源、预览片段都可能误识别；配置 include/exclude/block 条件，不“抓到第一个 mp4/m3u8 就播”。

## 65. 不要所有 HLS 无脑 `cacheM3u8()`

仅用于一次性索引、相对 Key/segment、原索引播放中容易失效等真实场景。

## 66. `startProxyServer` 不是普通视频默认步骤

只有需要动态改写 M3U8/Key/segment/Header/响应内容或稳定短时效链接时启用。代理 URL 要可唯一识别，避免播放进度串线。

## 67. M3U8 广告清理/PNG 分片转换只按协议启用

`clearM3u8Ad*`、`cacheM3u8WithPngProxy/convertM3u8WithPngProxy` 不是所有视频固定步骤。

## 68. 不要所有播放 URL 无脑 `#noPre#`

默认预加载可能改善启动速度；只有协议证明确实会造成过期/风控/错误才禁用。

## 69. 多线路 `headers` 与 `urls` 必须按索引一一对应

不同线路不能错用同一个 Referer/UA/Cookie。

## 70. 字幕/弹幕不应无谓阻塞首次播放

先得到可播 URL；有缓存直接带上；无缓存按需/异步获取。

## 71. 播放失败必须分层诊断

至少：

```text
NO_SOURCE
AUTH_FAIL
SOURCE_PARSE
DECODE_FAIL
EXPIRED
HEADER_FAIL
HLS_FAIL
PARSER_FAIL
SNIFF_FAIL
PLAYER_FAIL
```

## 72. `x5Play://` 等播放器调用不是“获取播放地址的方法”

已经知道 URL 后如何交给播放器，与“如何拿到真实媒体地址”是两层问题，不要混在解析逻辑里。

---

# P1：模板/写源开发工具

## 73. 自动模板匹配器优先属于 Dev/Test 工具

`HTML Signature → Candidate Parser → Try → Lock` 很适合开发阶段；站点确认后 Stable 应冻结具体 Parser/Adapter，不应每次运行都从几十个模板中猜。

## 74. 自动模板匹配失败必须可诊断

至少记录：命中的 HTML 特征、候选 Parser、每个 Parser 失败阶段、最终是否 fallback。

## 75. 动态分类生成器不要把 DOM 规则、状态和 Renderer 写成一坨

推荐 `CategoryExtractor → CategoryModel → state → Renderer`。

## 76. Rule Generator 与 Runtime 分离

模板编辑器、写源工具、规则生成器不应被普通内容程序全量打包，除非产品本身就是开发工具。

---

# P1：性能、缓存与媒体资源预算

## 77. 首屏不等待评论、推荐、完整作者资料、弹幕等附加能力

核心详情先显示，P2/P3 后补。

## 78. 大目录禁止一次渲染几千项

分卷、分页、范围选择、动态加载。

## 79. 网络失败优先可用 stale cache

有有效旧数据时优先“旧数据 + 状态提示”，不要整页失败。

## 80. 缩略图/详情图/阅读原图不能同一资源预算

不同页面使用不同分辨率和缓存生命周期。

---

# P0/P1：自用、Local/分享、隐私与违禁词

## 81. 分享/Local 版禁止泄漏私人 GitHub/基础设施

清除用户名、repo、Raw URL、私人目录、Token/Cookie/API Key/测试账号/私人服务地址。

## 82. 分享纯本地版不带 Remote Manager/latest

完整业务代码内置。

## 83. 本地救援壳不等于纯本地分享版

入口本地、业务远程仍是远程版。

## 84. 禁止整个规则 JSON 无脑全局替换违禁词

UI、URL、Header、JSON key、签名字段分别处理；协议语义不能被避词破坏。

---

# P1：Diagnostics / Guard / 实机验收

## 85. 错误页不能只显示“读取失败/播放失败/图片失败”

至少能进入诊断查看版本、Provider、请求阶段、Header 模板、缓存、Codec、Playback route、fallback chain、脱敏错误。

## 86. Diagnostics 默认不主动联网、不输出秘密

优先采集本地状态和当前请求已知结果。

## 87. Release Guard 通过不等于可直接 Stable

Guard 不能替代海阔实机 JS、布局、登录态、API 风控、图片解密和播放协议。

## 88. UI/图片/播放必须有对应实机证据

- UI → 截图评审。
- 图片 → 明文/密文/Header/cache。
- 播放 → 冷启动/二次播放/画质/Header/过期/降级链。

---

# 发布前硬检查

## 上下文/版本

- [ ] 已读三份主文档 + 目标 CHANGELOG + 当前元数据/源码。
- [ ] 已确认用户实机当前通道/版本。
- [ ] Stable release 未原地覆盖。
- [ ] 新版使用新 version/build/cache key。
- [ ] 壳 version <= 2147483647。
- [ ] Remote Test/Candidate 的云仓库 advertised build、release build、installer rule/Bootstrap `minBuild/defaultRelease` 已对齐，并运行 `tools/remote_installer_guard.py`。

## 架构/数据

- [ ] JS/JSON 可解析，release 模块真实存在。
- [ ] Request/Protocol/Provider/Adapter/UI 边界清楚。
- [ ] Provider 私有状态隔离。
- [ ] 缓存 schema 可失效。
- [ ] 未启用 Provider 不初始化。
- [ ] Token 刷新/异步轮询有边界。

## UI

- [ ] 一眼看懂主任务。
- [ ] Primary Action 明显。
- [ ] 首页没有被技术信息/设置/筛选淹没。
- [ ] 卡片比例、图标、长文本、空状态可用。
- [ ] 无大量无意义 `blank_block`。
- [ ] 关键跨页 entityId 不只依赖 `extra`。
- [ ] 动态分类经过用户可见性清洗，不直接暴露内部/布局项。
- [ ] 静态选择/输入未依赖未经当前版本确认的构造器重载。
- [ ] 同一选中态没有活动图标 + 符号 + 文字重复强调。
- [ ] 密集列表没有无意义的独立标签行/溢出 `>`。
- [ ] UI 大改完成实机截图闭环。

## 图片

- [ ] Header 正确。
- [ ] 明文不会误解密。
- [ ] 密文可实际解密。
- [ ] InputStream 生命周期正确。
- [ ] 解密缓存/缩略图策略明确。
- [ ] 失败可定位阶段。

## 播放/阅读

- [ ] 已优先尝试结构化免嗅，而不是直接嗅探。
- [ ] 当前 route 被准确记录为 direct/API/source/decode/proxy/parser/sniff。
- [ ] 冷启动与二次播放正常。
- [ ] 多线路 `urls/names/headers` 对齐。
- [ ] HLS/Proxy/预加载均按协议启用，不无脑套用。
- [ ] 字幕/弹幕不阻塞首次播放。
- [ ] 失败可定位 Source/Auth/Parse/Decode/Header/HLS/Parser/Sniff/Player。
- [ ] 漫画阅读/下载共用章节内容链。

## 发布/恢复

- [ ] Guard 通过。
- [ ] Candidate/Test 核心路径实机通过。
- [ ] 网络失败缓存/备用通道符合设计。
- [ ] 违禁词扫描通过。
- [ ] Local/分享版隐私扫描通过。
- [ ] 更新/回退闭环通过。
- [ ] 自举工具 Recovery 可用。
- [ ] CHANGELOG 已记录本版技术事实。
- [ ] 新通用方法/坑已自动同步文档。
- [ ] stable/latest 最后切。

---

# 真实事故与永久教训索引

## 2026-08-20：规则仓库连续事故

- **仓库读取失败**：单 API + 短缓存 + 无 stale cache → 关键索引必须缓存 + 主备 + stale + 诊断。
- **version 整数溢出**：`20260820342` → 壳 version 使用安全 10 位。
- **重新导入仍跑旧 Core**：Remote state 与 Shell 是两层 → 重大修复用 minBuild/migration/new build。
- **坏版本叠补丁**：运行层级混乱 → 严重故障冻结旧版、新建隔离 release。
- **自举仓库坏后无法自救** → 自举工具必须仓库外 Recovery。

## 2026-08-21：长期文档/全样本复核

- **全局文档动态版本过时** → 动态事实实时读取 stable/channels/release。
- **程序缺独立 CHANGELOG** → registry 必须登记日志，发布门禁检查。
- **Stable 与主日志不同步** → CHANGELOG 是 Stable 门槛。
- **功能齐全但 UI 像后台** → 先做信息层级/组件映射，实机截图是质量门。
- **图片解密散落卡片** → ImageAdapter + 明文判断 + InputStream + 解密缓存。
- **播放只求“找到一个 URL”** → PlayModel + 分层 Playback Pipeline + 可诊断。
- **把 `video:// / webRule / x5Rule` 叫免嗅** → 严格区分结构化免嗅、委托解析、网页嗅探。
- **自动模板匹配长期运行** → 自动匹配用于 Dev/Test，Stable 锁定已确认 Parser。
- **第三方 favicon 服务被当正式图标 CDN** → 只用于发现，正式固化 assets。
- **ACFun Alpha2 详情“未命名”** → Page 关键实体 ID 不只依赖 `extra`，URL 参数 + `getParam()` + Provider 恢复形成双保险。
- **ACFun Alpha4 已发布但手机仍是 Alpha2，程序内更新报“找不到函数manager”** → Remote Release 不会自动替换 Shell；重大迁移必须新 Shell 路径 + 新规则 version + 新 Bootstrap 缓存键，并由云端仓库覆盖导入；管理器入口不得凭空改名。
- **ACFun 漫画分类暴露布局频道** → 动态分类必须经过 UserFacing CatalogAdapter，不等于服务端返回什么就全部展示什么。
- **ACFun 短视频整屏空白** → 对正常应有内容的 Feed，空数组必须进入有限 fallback/诊断，不能直接当成功终态或写成长缓存。
- **规则仓库排序选择崩溃**：猜 `$().select` 参数重载导致“排序方式”被当数值解析 → 固定选择优先官方 `select://`，简单输入可用 `input://`，先 Test 实机。
- **规则仓库选中态重复强调**：蓝色活动图标再叠黑色 `●` → 同一状态只保留一个主视觉信号。
- **规则仓库程序卡高度翻倍/出现多余 `>`**：每项独立 chips 行导致横向溢出 → 非高频标签优先并入主卡描述。
- **为了贴设计稿硬做双栏形成灰色按钮墙** → 原生近似布局以实机任务效率为准，不为形式相似牺牲密度。
- **规则仓库 RC1 纯几何 data-SVG 仍显示错图** → 关键数字使用版本化静态远程资产 + 原生文本兜底，不在同一 data-URI 解码链继续换写法。
- **低透明 SVG 占位仍显示破图** → 分类结构不得依赖透明图片补齐双栏。
- **四个带数量的横向项仍出现 `>`、`text_3` 标签形成灰墙** → 按实机标题宽度选等宽/可换行组件，不按项目数猜测。

## 2026-08-22：Remote Runtime Delivery 二次复发

- **Hanime1 Test22/23 发布但设备实际未进入，旧更新按钮报 `HanimeBoot 未定义`** → 序列化 lazyRule 内显式 require Bootstrap；先验 Runtime 再改业务。
- **Hanime1 Cloud Repo 已显示 Test26/Build20026，重新导入后仍是 Test24/Build20024** → `test/channels/registry` 广告版本不能继续指向旧安装 Shell；安装 Bootstrap 的 `minBuild/defaultRelease` 必须覆盖 advertised build；新增 build-locked installer artifact 与 `tools/remote_installer_guard.py`。
- 专项复盘：`docs/INCIDENT_REMOTE_RELEASE_NOT_APPLIED_20260822.md`。

---

# 文档维护规则

无需用户提醒：

- 新实机 Bug/事故/兼容限制 → 本文档。
- 新通用稳定写法、UI、图片/播放 Pipeline → GUIDE。
- 长期方向/架构决策 → PLAN。
- 程序专属接口、签名、解密、Bug、回归事实 → 目标 CHANGELOG。

同一个坑发生一次，就应该让以后任何新对话都能查到。
