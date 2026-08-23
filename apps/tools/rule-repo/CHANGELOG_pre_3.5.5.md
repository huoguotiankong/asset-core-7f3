# 我的规则仓库 Changelog

> **程序级长期技术记忆。** 开发/优化“我的规则仓库”前，除三份全局文档外，必须先读本文件以及当前 `stable.json / test.json / candidate.json / channels.json / latest.json`、对应 release 和 Bootstrap。由于它同时承担安装中心与自举恢复职责，任何更新协议、缓存、通道、recovery 变化都必须写入本日志。

## 3.5.4 Stable（Build 384 / Shell 1.5.4 / Manager 2.0.2）

- 用户确认 `3.5.4-rc7 / Build 384 / Single Workspace 13.2` 已达到可用状态，并明确要求正式版升级到与最新测试版一致，因此本轮正式晋级 **Stable 3.5.4**。
- 新建不可变 `releases/3.5.4/release.json`，业务/UI 模块保持 RC7 已验证链：首页仅“我的程序”区域独立滚动且五栏固定、分类 35/65 主从结构原地展开、程序信息/搜索/设置在单工作台内切换，以及 RC7 的显式规则上下文动作桥。
- Stable 晋级不是机械复制 Test release：正式 release **移除 `test/v1.0.0/state_patch.js`**，避免正式版继续使用 `hc_repo_test_*` 收藏/最近/安装/搜索/导入记录；最终 `stable_patch.js` 强制恢复 `hc_repo_*` Stable 状态命名空间并固定 `isTestChannel()=false`。
- RC7 `context_free_actions.js` 的业务逻辑保持不变，但正式 Stable patch 将故障恢复 Bootstrap 从测试版 `bootstrap_test_v130.js` 重新绑定到 **`bootstrap_v154.js`**，避免正式版动作失败时跨入 Test Remote state。
- 新建 `bootstrap_v154.js`，Stable `latestPath` 仍为 `latest.json`，`minBuild=384`，默认 release 为 3.5.4；新建完整正式 Shell `rule_repo_remote_v354.txt`，规则数值 version 为 **2026082201**，所有 Raw/jsDelivr/Web Raw 地址显式指向 `huoguotiankong/asset-core-7f3@main`。
- `candidate.json` 标记 RC7 为 `passed-promoted`；`test.json` 保留 RC7 作为本轮已验证测试恢复基线。下一轮 Test/Candidate 必须先 rebase Stable 3.5.4，不能继续从 3.5.3 分叉。
- 正式回退基线继续保留 **3.5.3 / Build 377 / Shell 1.5.3**；3.5.4 不覆盖旧 Stable release。发布层已执行新路径、版本、状态隔离、Bootstrap/Shell/main 分支与旧仓依赖静态核对；正式 Shell 覆盖安装后的导入、备份、诊断、同步和回退仍以用户实机结果作为最终运行时判定。

## 3.5.4-rc7 Candidate / Test（Build 384 / Shell 1.0.30-test）

- 用户 RC6 实机确认首页、分类与单工作台结构已明显改善，但点击普通程序/版本卡导入、设置中的“备份状态”和“诊断信息”都会弹出同一系统错误：`Module "hiker://page/ruleRepoCore" cannot be found`。
- 根因不是三个独立入口，也不是目标程序文件失效，而是网页桥 `fba.parseLazyRule` 执行序列化回调时已经脱离当前规则上下文。RC6 回调使用裸 `$.require('hiker://page/ruleRepoCore')`，海阔无法知道该子页面属于“我的规则仓库”还是“我的规则仓库·测试版”，因此所有依赖 Core 的动作一起失败。
- **Single Workspace 13.2** 新增统一的上下文无关动作桥。动作创建时把原始当前规则名写入 `hiker://page/ruleRepoCore?rule=<规则名>` 并作为参数传给 lazyRule；程序导入、通道导入、打开、检查、收藏、同步、备份、诊断、搜索记录和历史清理全部使用同一双路加载策略。
- 第一通道加载显式规则子页面；若子页面缺失、旧 Shell 未注册或接口不完整，第二通道直接加载版本化 `bootstrap_test_v130.js`，通过 Remote Manager 恢复完整 Core。两条通道都失败时返回 `toast://操作失败…`，不再让异常穿透成系统“解析失败”对话框。
- Release Guard 新增“最终动作覆盖”检查：按 release 模块顺序定位最后生效的 `workspaceAction / workspaceStaticActions` 实现，禁止其继续裸加载 `hiker://page/ruleRepoCore`，并要求显式 `?rule=` 与 Bootstrap fallback 同时存在。旧不可变 RC6 模块可以作为历史依赖保留，但不得成为最终生效实现。
- 新建不可变 `releases/3.5.4-rc7`、`releases/test-3.5.4-rc7`、`bootstrap_test_v130.js` 与 `rule_repo_test_v130.txt`；About 显示 `3.5.4-rc7 / Single Workspace 13.2 / Build 384`，Fresh install Shell 数值 version 为 `2026082119`。
- Stable 继续冻结 **3.5.3 / Build 377 / Shell 1.5.3**。RC7 实机优先验证：① 普通程序卡导入；② Stable/Test 版本卡覆盖导入；③ 备份状态复制；④ 诊断信息展示；⑤ 同步、收藏、检查和清记录；⑥ 任一失败只出现页内 toast，不弹系统解析错误。

## 3.5.4-rc6 Candidate / Test（Build 383 / Shell 1.0.29-test）

- 用户 RC5 实机确认单工作台界面与局部滚动方向明显改善，但版本卡/导入按钮会在导入口令生成前报 `Expected URL scheme 'http' or 'https' but no colon was found`；同时首页“继续使用”仍占据一块固定高度，导致“我的程序”可滚动区域偏小。
- 根因是 RC5 把原生结果页常用的 `#noLoading#` 占位符直接交给网页桥 `parseLazyRule`。该桥的动态解析输入需要完整 HTTP/HTTPS 前缀，因此网络层在执行 lazyRule 之前就拒绝了动作；这不是目标程序规则文件损坏，也不是 `importRule` 口令格式错误。
- **Single Workspace 13.1** 为所有工作台动作新增统一的 HTTPS 基址。普通程序导入、多版本通道导入、打开、检查、收藏、同步、备份、清记录和搜索记录都从合法地址生成 lazyRule；返回的 `海阔视界…` 口令只交给官方网页接口 `fba.importRule`，`toast:// / copy:// / confirm:// / rule://` 分别处理，未知或相对地址不再误送给原生页面加载器。
- 动作层增加 900ms 防重复触发和用户可读的导入准备/异常提示，避免连续点击重复弹窗；只有合法 `http(s) / hiker / data / file` 业务地址才允许跨出工作台，进一步收敛误开页面与返回栈。
- 首页彻底移除“继续使用”固定区；最近打开仍保留在活动记录与设置清理入口，不丢历史数据。Hero、分类 chip 和数字统计区轻量压缩，程序图标延迟加载，把新增高度全部让给“我的程序”独立滚动容器。
- 新建不可变 `releases/3.5.4-rc6`、`releases/test-3.5.4-rc6`、`bootstrap_test_v129.js` 与 `rule_repo_test_v129.txt`；About 显示 `3.5.4-rc6 / Single Workspace 13.1 / Build 383`，Fresh install Shell 数值 version 为 `2026082118`。
- Stable 继续冻结 **3.5.3 / Build 377 / Shell 1.5.3**。RC6 实机优先验证：① 普通程序导入/覆盖；② 规则仓库 Stable/Test 版本卡导入；③ 收藏、检查、同步与备份不再出现 HTTP scheme 错误；④ 首页无“继续使用”且程序列表明显增高；⑤ 分类、搜索、详情和设置反复切换仍不累积海阔页面。

## 3.5.4-rc5 Candidate / Test（Build 382 / Shell 1.0.28-test）

- 用户 RC4 实机确认横向漂移、底栏缺失和中文规则名报错已有改善，但仍存在三个结构性问题：首页滚动会带动整个页面与底栏；分类的“全部视频 / 短剧”等条目仍跳新页面而不是就地展开程序；程序详情、搜索和设置持续追加海阔页面，回首页需要多次返回。
- **Single Workspace 13.0** 不再加载 RC3 `Hybrid Workspace 11` 与 RC4 `Safe Workspace 12`，避免旧页面桥和新工作台同时接管导航。RC5 只在 RC2 原生能力底座之后加载一个新的工作台模块，再执行运行时契约与 Candidate 标记。
- 页面结果改为单个 `x5_webview_single + desc:'float&&screen-100'`。HTML 根节点与工作台外壳锁定为视口高度且禁止外层滚动；首页头部、分类/状态统计、继续使用和“我的程序”工具栏属于固定区，只有程序列表使用独立纵向滚动容器，五项产品导航位于外壳固定末行。
- 分类恢复规划稿的 35/65 主从结构。点击左侧主分类只切换右栏；点击“全部视频 / 影视资料 / 短剧”等目标行在右栏原地展开或收起程序卡，不再打开新页面；只有点击展开后的程序卡才切换到程序信息。
- 首页、分类、搜索、程序信息、多版本中心、更新、设置与活动记录全部改为同一 DOM 工作台内的状态切换。内部返回使用轻量状态栈并保存各视图滚动位置；单层浏览器历史哨兵让安卓返回键先回来源、到首页再退出；底部五栏是顶层导航，一次点击即可回首页，不再通过 `fba.open` 累积内部页面。
- 程序信息页集中显示图标、云端/本地版本、安装状态、类型、大小、分类、标签、说明、主操作、收藏/检查/记录/设置/返回，以及多版本程序的 Stable/Test/Local 通道卡。旧原生按钮可能原样显示的 `<b><font>` 标记被移除。
- 网页桥只保留真实业务边界：打开程序、导入/覆盖版本、复制备份和 Core 更新；窗口 id 收敛，内部页面导航不再调用原生打开。搜索支持输入即时过滤、回车/按钮确认和历史记录；清理最近记录后当前界面立即同步。
- 新建不可变 `releases/3.5.4-rc5`、`releases/test-3.5.4-rc5`、`bootstrap_test_v128.js` 与 `rule_repo_test_v128.txt`；About 显示 `3.5.4-rc5 / Single Workspace 13.0 / Build 382`，Fresh install Shell 数值 version 为 `2026082117`。
- Stable 继续冻结 **3.5.3 / Build 377 / Shell 1.5.3**。RC5 实机必须验证：① 只有程序列表滚动且五栏不动；② 分类目标行就地展开程序；③ 展开程序进入同页信息；④ 搜索、详情、设置反复切换不增加海阔返回层级；⑤ 打开、导入、同步、回退和 Stable 恢复均可用。未完成截图闭环前不得晋级正式版。

## 3.5.4-rc4 Candidate / Test（Build 381 / Shell 1.0.27-test）

- 用户 RC3 实机确认视觉结构明显改善，但同时暴露三项 P0 回归：首页整页可左右拖动；底部显示的是 X5 自带的首页/搜索/标签/设置工具栏，而不是产品的“首页 / 分类 / 搜索 / 更新 / 设置”五栏；点击程序、版本中心或搜索会提示找不到 percent-encode 后的“我的规则仓库·测试版”。
- RC3 对 `desc:'float&&top'` 的解释被实机证伪：目标设备并未把随后追加的五个原生结果项固定在底部，而是进入带浏览器工具栏的 X5 浮动模式。以后该模式不得用于本项目固定导航，官方通用说明不能覆盖用户当前设备的真实行为。
- **Safe Workspace 12.0** 改用一个 `x5_webview_single + desc:'list&&screen-100'` 承载首页、分类或搜索内容，五项导航直接固定在该网页视口底部；页面结果不再追加原生导航项，因此也不会再露出 X5 浏览器工具栏冒充产品底栏。不支持 X5 时仍沿用 RC2 原生回退。
- 全局增加 `overflow-x:hidden / min-width:0 / width:100%` 约束，并对程序 Grid、标题工具行、分类树和横滑容器分别限制宽度；只允许分类条与最近使用容器自身横滑，整页横向漂移被锁定。
- 网页桥 `fba.open` 的子页面 URL 改为携带**原始中文规则名**并补充 `simple=true`，不再对 `rule` 值执行 `encodeURIComponent`；程序 id 仍通过 `extra.hc_repo_item_id` 和编码后的 `id` 双通道传递。详情、Stable/Test/Local 版本中心、搜索、更新和设置恢复可达。
- 新建不可变 `releases/3.5.4-rc4`、`releases/test-3.5.4-rc4`、`bootstrap_test_v127.js` 与 `rule_repo_test_v127.txt`；About 显示 `3.5.4-rc4 / Safe Workspace 12.0 / Build 381`，Fresh install Shell 数值 version 为 `2026082116`。
- Stable 继续冻结 **3.5.3 / Build 377 / Shell 1.5.3**。RC4 必须实机复核：① 首页只能纵向滚动；② 五栏带文字且分类/设置始终可见；③ 首页、分类、搜索三页均只有一个产品底栏；④ 普通程序、多版本程序、搜索、更新和设置都能进入；⑤ 返回链与正式版恢复不退化。

## 3.5.4-rc3 Candidate / Test（Build 380 / Shell 1.0.26-test）

- 用户 RC2 实机截图确认数字已可靠显示、列表信息也更接近规划稿，但暴露两个结构性阻塞：首页五项导航仍是普通结果项，程序增多后会随列表滚走；分类页虽摆脱灰色矩阵和破图，却退化成“顶部主分类 + 纵向子分类清单”，与规划稿的左主类、右子类关系相差很远。
- 对照海阔官方组件说明后确认，普通 `setResult` 列表没有可把末尾结果项固定到视口底部的属性；`x5_webview_single` 的 `desc:'float&&top'` 则明确用于“顶部网页、底部分类”，网页占满除底部分类外的高度。RC3 因此不再继续调整普通列表顺序，而是引入 **Hybrid Workspace 11.0**。
- 首页、分类、搜索各只使用一个 `x5_webview_single` 作为上方独立滚动工作区，后接五个原生 `icon_5_no_crop` 导航项；长程序列表、分类树或搜索结果只在上方滚动，导航保持在底部。设备不支持 X5 时自动回退 RC2 原生页面，避免直接白屏。
- 首页在网页工作区内重建为单行横滑主分类、可靠 HTML 数字统计、最近使用、状态/分类/排序即时筛选和紧凑程序卡；不再依赖 data-SVG 字体、透明占位或会自动生成额外 `>` 的横向原生筛选。
- 分类页恢复规划稿核心关系：左侧 35% 固定主分类列表，右侧 65% 独立滚动显示当前分类的子分类；“全部”展示所有分组。选择子分类通过网页桥写入共享筛选状态并回到首页，形成“选分类 → 看程序”的短路径。
- 网页工作区只承担高频展示与筛选；程序详情、Stable/Test/Local 版本选择、导入覆盖、打开、同步、更新、备份恢复和设置继续使用原生页面，并通过官方 `fba.open(JSON.stringify(...))` 跳转，保留自举与恢复边界。
- 新建不可变 `releases/3.5.4-rc3`、`releases/test-3.5.4-rc3`、`bootstrap_test_v126.js` 与 `rule_repo_test_v126.txt`；About 显示 `3.5.4-rc3 / Workspace 11.0 / Build 380`，Fresh install Shell 数值 version 为 `2026082115`。
- Stable 继续冻结 **3.5.3 / Build 377 / Shell 1.5.3**。RC3 实机重点验收：① 首页长列表滚动时五项导航是否始终留在底部；② 分类是否为可操作的 35/65 双栏树；③ 主分类与搜索范围无额外 `>`；④ 网页卡片点击能进入原生详情，返回链正常；⑤ 分类选择能回首页并正确筛选；⑥ 同步、导入、更新、回退和正式版恢复不得退化。

## 3.5.4-rc2 Candidate / Test（Build 379 / Shell 1.0.25-test）

- 用户 `3.5.4-rc1 / Build 378 / Native Product 9.0` 六张实机截图确认版本链和缓存切换完全正常，因此“与上一版区别不大”不是旧 Core。RC1 真正可见的改善主要是名称/版本间距、标签缩进、搜索历史语义和版本元数据；首页、分类、搜索、版本中心与设置仍沿用 RC11 主骨架，不能继续把细节修复称为产品级升级。
- RC1 两项图片修复在当前设备继续失败：纯 `path/rect` 的内联 data-SVG 统计图仍显示为无关图形；含极低透明 drawable 的 SVG 占位仍显示破图。结论升级为：关键视觉不再使用动态 data-URI，分类布局也不再依赖不可见图片占位。
- RC1 还确认带数量的四个 `scroll_button` 已足以在窄屏出现 `>`，而九个 `text_3` 热门标签形成新的灰色卡片墙。RC2 将搜索范围改为四个等宽单行 `text_4`，最近搜索与最多 6 个热门标签使用可自动换行的 `flex_button`，低频运行方式与清空继续收进更多菜单。
- RC2 定位为 **Product Workspace 10.0 / 结构版**。首页动态统计改为仓库内新路径的远程静态 SVG 数字，彻底绕开 data-URI 解码链，原生标题继续保留数量兜底；六个主分类改为可换行的 `flex_button`，消除固定横向溢出。
- 分类页删除连续成对 `icon_2`、透明占位和两列灰色矩阵，改成“可换行主分类 → 全宽主类/子类清单 → 选择子类回程序工作台”的任务结构；这不是强行复刻左右栏外形，而是保留目标稿的主类/子类关系并服从当前设备真实组件比例。
- 普通详情与多版本中心把连续纵向信息行压缩为两列信息概览，继续保留打开/更新双主操作、版本卡、五项次操作和恢复保障；设置页改为同步配置 2×2 工作台、数据操作和关于诊断三组，移除长篇实验说明与重复工程信息。
- About 固定显示 `3.5.4-rc2 / Product Workspace 10.0 / Build 379`，用来确认实机已切新结构；新建不可变 `releases/3.5.4-rc2`、`releases/test-3.5.4-rc2`、`bootstrap_test_v125.js` 与 `rule_repo_test_v125.txt`，Fresh install Shell 数值 version 为 `2026082114`。
- Stable 继续保持 **3.5.3 / Build 377 / Shell 1.5.3**，不吸收本轮结构性实验。RC2 实机重点验收：① 数字卡是否显示 7/5/0/0 而非图形字；② 首页/搜索不再出现额外 `>`；③ 分类页没有灰色双栏墙与破图；④ 搜索标签不再是 3×3 大卡；⑤ 详情/版本中心与设置是否明显缩短；⑥ 排序、同步、导入、打开、恢复和五项导航不得退化。

## 3.5.4-rc1 Candidate / Test（Build 378 / Shell 1.0.24-test）

- 用户 3.5.3-rc11 实机截图确认首页、分类、程序列表、版本中心和搜索页主体已经明显接近目标，且排序、分类、导入、导航等核心路径可继续使用；因此 RC11 冻结晋级 Stable 3.5.3，本轮 Test 从新 Stable 直接续线，目标正式版本调整为 3.5.4。
- RC11 四项实机细节进入独立修复：数字统计 data-SVG 的 `<text>` 在当前设备被错误字体/字形替代；分类空白 SVG 被图片组件识别为破图；`rich_text` 行首全角空格被裁掉导致标签层左移；`avatar` 标题里的普通空格被折叠，名称与版本看起来粘连。
- Native Product 9.0 的数字卡不再依赖任何字体：`nativeDigitArt()` 使用 `<rect>` 组合 0–9 的七段矢量字形；标题同时保留“状态 + 数字”文字兜底。即使图片解码异常，数量也不会从界面消失。
- 分类空占位改为含极低透明度矩形的有效 SVG，保持 `icon_2` 双栏宽度但不再提交完全无 drawable 的空 SVG；必须继续通过实机确认当前图片解码器不显示破图标记。
- 程序卡标签摘要使用 `&nbsp;` 构造稳定缩进，名称和版本使用全角间隔，不再依赖会被组件折叠/裁剪的行首普通空格或全角空格。
- 搜索页顶部只保留全部/已安装/可更新/收藏四项高频范围，运行方式与清空最近搜索并入右侧更多菜单，移除第五项造成的自动溢出 `>`；最近搜索改为语义列表，热门标签最多 9 项并用三列承载，清空动作不再伪装成搜索词。
- 新建不可变 `3.5.4-rc1 / build 378` Candidate/Test release、`bootstrap_test_v124.js` 与 `rule_repo_test_v124.txt`；Fresh install Shell 数值 version 为 `2026082113`。Test `baseVersion=3.5.3`、`targetVersion=3.5.4`，测试状态键继续与 Stable 隔离。
- 实机重点验收：① 四张统计卡数字是否为正确阿拉伯数字且标题数量一致；② 分类页空位是否彻底无破图；③ 程序名称/版本和标签摘要是否对齐；④ 搜索顶部无多余 `>`、清空记录不再是关键词按钮；⑤ Stable 3.5.3 仍能独立打开、同步、导入 Test 和回退。

## 3.5.3 Stable / Build 377 / Shell 1.5.3 / Manager 2.0.2

- 由用户连续实机确认的 `3.5.3-rc11 / build 376 / Native Product 8.0` 冻结晋级；晋级记录保存在 `releases/3.5.3/PROMOTION.json`，旧 Candidate/Test release 不原地修改。
- 正式版获得首页四项状态工作台、`avatar` 右侧状态、标签摘要、原生双栏分类树、紧凑普通详情和统一 Stable/Test/Local 版本中心；这是 RC11 已运行页面的稳定快照，新发现的细节修复不反向混入该快照。
- Stable 使用新 `releases/3.5.3/release.json`、`bootstrap_v153.js`、`rule_repo_remote_v353.txt` 和 Build 377；Shell 数值 version 为 `2026082165`，高于 3.5.2 的 `2026082164` 且未超过 32 位有符号整数上限。
- 正式版不加载 `testStatePatch`，继续使用 Stable 状态键；Test 3.5.4-rc1 仍使用独立测试状态键。事务式 `syncManifest()`、多镜像、stale cache、Remote Manager 2.0.2、Local 隐私门禁和自举恢复入口继续保留。
- `stable.json / latest.json / manifest.json / registry.json / channels.json` 已切换到 3.5.3；版本中心内置 fallback 同时指向 Stable 3.5.3 与 Test 3.5.4-rc1，断网或通道元数据暂不可读时仍可恢复。

## 3.5.3-rc11 Candidate / Test（Build 376 / Shell 1.0.23-test）

- 用户 RC10 实机截图确认 About 已正确显示 **3.5.3-rc10 / Build 375 / Workspace 7.0**，首页也能看到搜索与“继续使用”；因此仍然不是缓存或 Core 未升级，而是视觉目标拆解不足。
- RC10 根因复盘：只重建首页区域顺序，程序卡仍接近旧单列列表；分类页仍是灰色 pills + 结果列表；JavDB 等多版本详情仍是连续信息行 + 普通版本列表。目标图最强的四项数字统计、程序右侧状态、彩色标签层、真正双栏分类关系和紧凑详情卡均未形成，导致整套产品仍被感知为旧工具页。
- RC11 定位为 **Native Product 8.0 / 三页视觉语法重建**，一次覆盖首页、分类管理、普通详情与多版本中心；不再把单页区块重排包装成整体升级。
- 首页恢复目标图主层级：Hero 后直接展示 6 个一级分类、4 个动态数字统计卡、三项紧凑工具栏和程序列表；移除 RC10 的大搜索框与“继续使用”常驻区。程序采用 `avatar` 主行显示名称/版本与右侧状态，紧邻 `rich_text` 显示最多 3 个蓝色标签和一行弱摘要。
- 统计入口使用受控 data-SVG 将数字直接作为 `icon_small_4` 主视觉，全部/已安装/可更新/收藏分别使用品牌蓝、成功绿、提醒橙和收藏粉；选中态仍只保留一个主信号。
- 分类管理改为连续成对 `icon_2` 的原生双栏树：左栏固定主分类及数量，右栏显示当前分类组与子分类；点击子分类直接回首页展示结果。与早期连续 `text_2` 灰色按钮墙不同，本轮用图标、留白和成对关系表达层级，仍需实机确认真实比例。
- 普通详情改为紧凑信息行 + 彩色标签 + 程序说明 + `打开 / 导入或更新` 双主操作 + 五项快捷操作；多版本中心同步改为版本概览、双主操作、`avatar` 版本卡、标签摘要和五项操作，正式/测试/本地状态在卡片右侧直接可见。
- 原生组件映射已对照当前官方组件说明：`avatar.desc` 右侧富文本状态、`rich_text` 标签摘要、`icon_2` 双栏、`icon_small_3/4` 工具与统计；普通 UI 不引入 X5/WebView，避免破坏远程规则的稳定性与恢复链。
- 新增不可变 `3.5.3-rc11 / build 376` Candidate/Test release、`bootstrap_test_v123.js` 与 `rule_repo_test_v123.txt`；Fresh install Shell 数值 version 为 `2026082112`，处于 32 位有符号整数范围。Stable/latest 继续冻结在 **3.5.2 / build 364 / Shell 1.5.2**。
- RC11 实机重点验收：① About 显示 `Native Product 8.0 / Build 376`；② 首页是否出现 4 张以数字为主体的统计卡，且程序右侧可见彩色状态；③ 程序标签与摘要是否分层且不过高；④ 分类页是否形成清晰双栏树而非灰色按钮墙；⑤ 普通详情和 JavDB/ACFun 版本中心是否更接近目标稿的紧凑信息卡；⑥ 排序、同步、导入、打开、底部导航不得退化。完成结构/静态验证不等于实机通过，未完成截图闭环不得晋级 Stable。

## 3.5.3-rc10 Candidate / Test（Build 375 / Shell 1.0.22-test）

- 用户 RC9 实机截图确认 Core 已正确切到 **3.5.3-rc9 / Build 374 / Product Hub 6.0**，About 页不再显示旧的 `Native App Shell 5.0`，排序与同步两项工具栏也已生效；因此本次不是远程缓存未更新，而是 **RC9 的真实感知变化不足**。
- RC9 根因复盘：虽然删除了重复按钮、缩短了描述，但仍完整沿用 RC8 的 `Hero → 顶部分类条 → 四状态图标 → 同款单列程序卡 → 底部导航` 骨架；同时当前设备上的 `icon_1_left_pic` 程序卡只稳定露出一行描述，RC9 设计的“两行信息模型”第二行没有形成明显视觉差异。后续禁止把仅改文案/描述行数称为首页结构升级。
- RC10 定位为 **Workspace 7.0 / 首页结构重建**：首页改为 `动态状态 Hero → 原生搜索入口 → 最近/常用程序直达 → 程序库状态筛选 → 程序库分类筛选 → 排序/同步 → 程序列表 → 底部导航`，不再继续微调 RC8/RC9 原骨架。
- 新增 `icon_1_search` 原生搜索入口，点击进入既有搜索页；搜索、分类、详情、更新、设置等既有页面代码不改，避免首页重建扩散到稳定模块。
- 新增最多 4 个 `icon_small_4` 常用程序快捷入口：优先最近打开，其次收藏、真实已安装程序和目录程序；已安装普通程序点击直接打开，未安装程序或多版本程序进入详情/版本中心，长按始终可进详情。
- 首页四状态由大图标仪表盘改为程序库内部紧凑 `scroll_button` 行；主分类作为独立第二行，两个状态维度不再和 Hero 混在同一视觉层。继续使用当前设备已验证安全的纯文本 `●`，不恢复 RC3 曾原样显示的 HTML 着色。
- 首页程序卡改为单行可见信息：普通程序固定显示 `状态 · 版本 · 分类`，多版本程序固定显示 `版本中心 · 正式 / 测试 / 本地`；详情 URL 同时显式携带 `id`，不再只依赖 `extra.hc_repo_item_id`。
- 保留 RC7~RC9 已通过能力：官方 `select://` 排序、目录同步、安装状态探针、蓝色活动底部导航、紧凑列表、Stable/Test/Local 版本中心；Stable/latest 继续冻结在 **3.5.2 / build 364 / Shell 1.5.2**。
- 新增不可变 `3.5.3-rc10 / build 375` Candidate/Test release、`bootstrap_test_v122.js` 与 `rule_repo_test_v122.txt`；Fresh install Shell 数值 version 为 `2026082111`，符合 32 位有符号整数范围。
- RC10 实机重点验收：① 首屏是否明确出现搜索框和 4 个程序快捷入口；② 旧四状态大图标是否消失；③ 常用程序点击是否按安装/多版本状态正确直达；④ 程序卡一行是否能看到安装状态；⑤ 状态、分类、排序、同步切换是否正常；⑥ About 页是否显示 `Workspace 7.0`。未完成截图闭环不得晋级 Stable。

## 3.5.3-rc9 Candidate / Test（Build 374 / Shell 1.0.21-test）

- 本轮开发前重新实际读取 `PROJECT_PLAN.md 1.6`、`HIKER_APP_DEVELOPMENT_GUIDE.md 2.2`、`HIKER_APP_DEVELOPMENT_CAUTIONS.md 2.3`，并按恢复链核对 registry、Stable 3.5.2、Test RC8、Candidate、Channels、Latest、RC8 release、Bootstrap/Shell 与用户最新 RC8 实机截图；Stable/latest 继续冻结在 **3.5.2 / build 364 / Shell 1.5.2**。
- RC8 实机确认：程序列表独立标签行与溢出 `>` 已消失，蓝色活动底部导航正常，分类页比旧灰色双栏更清爽；但首页仍偏“规则列表工具页”，与目标规划图在首页主次关系、程序区工具栏密度和持续使用感上仍有明显差距。
- 发现 About 页面虽然运行 Core 已是 RC8，但仍显示 `UI Native App Shell 5.0`。根因是 RC7 `aboutPage()` 对 UI 名称硬编码；RC9 改为读取当前 `releaseLabel`，以后 Test UI 名称跟随运行时 release，不再显示历史 UI 名称。
- RC9 定位为 **Product Hub 6.0 / 首页产品化专项**，本轮刻意不改 Repository、同步、安装探针、分类、搜索、详情、版本中心等已能稳定运行的底层/页面链，优先按 GUIDE 的 Identity → Navigation → Dashboard → Main Content → Utility 顺序重新压缩首页。
- 首页四项状态继续作为唯一状态筛选：全部 / 已安装 / 可更新 / 收藏。删除与“收藏”状态重复的“只看收藏”按钮；程序工具栏从“排序 / 筛选 / 同步 / 只看收藏”收敛为 **排序 + 同步目录**，筛选入口交给“我的程序”右侧工具入口与独立分类页，减少首屏重复动作。
- 首页程序卡新增 `homeProgramCard()`：普通程序统一为第一行“版本 · 分类”，第二行“最多 2 个核心能力 · 安装/更新状态”；多版本程序统一为“正式版 / 测试版 / 本地版” + “版本中心 · 更新 · 恢复”。不再为首页显示三个以上能力标签，降低长文本截断和列表认知负担。
- 分类选中态继续使用当前设备已经验证安全的纯文本 `●` 方案。虽然官方当前文档写明 `scroll_button` 标题支持 HTML，但本项目 RC3 同一设备曾真实出现 `<font ...>` 原样显示，因此**用户当前实机结果优先于文档一般能力描述**，RC9 不重新启用 HTML 着色实验。
- 新增不可变 `3.5.3-rc9 / build 374` Candidate/Test release、`bootstrap_test_v121.js` 与 `rule_repo_test_v121.txt`；Fresh install Shell 数值 version 为 `2026082110`，符合 32 位有符号整数范围。
- RC9 实机验收聚焦首页：① 四状态切换仍正常；② 排序 `select://` 与同步不得退化；③ 首页只剩排序+同步两个工具按钮，视觉是否更接近目标稿；④ 单个程序信息是否更短、更容易扫读；⑤ About 页 UI 是否显示 `Product Hub 6.0` 而不是旧 `Native App Shell 5.0`。未完成截图闭环不得晋级 Stable。

## 3.5.3-rc8 Candidate / Test（Build 373 / Shell 1.0.20-test）

- 用户 RC7 实机截图确认：官方 `select://` 排序面板已经正常弹出，RC6 的 `For input string: "排序方式"` 回归消失；`icon_5_no_crop` 蓝色活动导航在当前设备正常显示且未裁切；Test 安装状态探针在当前设备能够把黄豆短剧、Hanime1 等已存在规则识别为“已安装”，同时未安装程序仍显示“未安装”。这些结论仅代表当前实机通过，Stable 继续保守冻结。
- RC7 仍存在明显产品化差距：活动导航和状态入口同时使用蓝色图标与黑色 `●`，形成重复选中信号；程序卡把 3 个标签拆成独立 `flex_button/scroll_button` 行，导致每个程序高度接近两张卡，并触发右侧自动溢出 `>`；分类中心双栏 `text_2` 在真实设备上形成大面积灰色按钮矩阵；版本中心顶部连续 5 条状态行信息偏散。
- RC8 进入 **Native App Shell 5.1 / Visual Density**：保留 RC7 已实机通过的官方 `select:// / input://` 路由和蓝色活动图标，不再改动更新/同步/探针等底层能力，本轮主要收敛 Renderer 与页面信息密度。
- 状态入口改为“当前筛选使用活动图标、其它状态使用灰色图标”，删除标题前 `●`；底部五项导航同样删除黑色圆点，仅由蓝色当前页图标表达选中态，减少重复视觉语言。
- 首页/分类/搜索程序列表统一改为**单卡信息模型**：`icon_1_left_pic` 主卡内部直接显示版本 / 分类 / 状态和最多 3 个能力标签；收藏作为辅助语义并回描述。默认不再为每个程序追加独立标签行，因此也消除海阔 flex/scroll 自动生成的右侧溢出箭头，显著降低列表高度。
- 多版本程序卡同样取消独立 highlights chips；正式/测试/本地版本的关键亮点直接并入版本卡第二行，避免版本中心出现“卡片 + 一排标签 + >”的重复结构。
- 分类中心放弃 RC3~RC7 的“连续成对 `text_2` 模拟双栏”方案。实机证明该近似虽然结构接近设计稿，但视觉上形成大块灰色按钮墙，信息密度和高级感都不理想。RC8 改为：主分类横向层级 → 子分类横向层级 → 可选高级筛选 → 结果列表；低频标签/运行方式/排序/批量管理继续折叠。这是按 GUIDE 2.1“组件服从真实设备比例和核心任务”的取舍，不再为了形式双栏牺牲实际体验。
- 规则仓库版本中心压缩为：Hero → 单条版本状态摘要 → 打开/同步两项主操作 → 可用版本卡 → 五项次操作 → 恢复保障；删除“当前运行/正式版本/测试版本/本地版本/版本数量”连续五行的重复展开。
- 新增不可变 `3.5.3-rc8 / build 373` Candidate/Test release、`bootstrap_test_v120.js` 与 `rule_repo_test_v120.txt`；Fresh install Shell 数值 version 为 `2026082109`，符合 32 位有符号整数范围。Stable/latest 继续保持 **3.5.2 / build 364 / Shell 1.5.2**。
- RC8 实机重点验收：① 首页列表单项高度是否明显下降；② 程序卡标签行和右侧溢出 `>` 是否消失；③ 状态/底部导航是否只保留蓝色图标选中信号；④ 分类中心是否比 RC7 灰色双栏更清爽且切换正常；⑤ 规则仓库/JavDB/ACFun 版本中心是否减少横向标签溢出；⑥ 排序、同步、探针等 RC7 已通过功能不得退化。未完成截图闭环不得晋级 Stable。

## 3.5.3-rc7 Candidate / Test（Build 372 / Shell 1.0.19-test）

- 用户 RC6 实机确认：整体密度比 RC5 好，但与规划图仍有明显差距，尤其是首页大面积灰色控件、状态区层级、详情/版本中心的信息组织和活动导航；同时首页点击“默认排序”直接出现 `For input string: "排序方式"`，这是本轮必须先解决的功能回归。
- 当前任务沿用刚刚完成的三份主文档恢复上下文，并重新核对当前 Stable 3.5.2 / Test RC6 / Candidate / Channels / Latest、RC6 release、Bootstrap/Shell 与用户最新实机截图；Stable/latest 继续冻结在 **3.5.2 / build 364 / Shell 1.5.2**。
- 排序报错根因定位到当前设备对 `$().select(...)` 构造参数的解释与旧写法不兼容：第二个字符串参数“排序方式”被当作需要数值解析的参数，最终触发 `For input string`。RC7 不再继续猜 `$().select` 参数重载，统一改用海阔官方文档明确支持的 `select://{title,options,col,js}` 路由；搜索运行方式、设置自动检查/缓存/探针/清理以及详情“更多”同步迁移。
- 备份恢复输入同步改为官方 `input://{value,hint,js}` 路由，减少 `$()` 构造重载在不同海阔版本上的兼容风险；该结论先在 Test 验证，实机通过后再考虑沉淀为跨程序通用注意事项。
- UI 进入 **Native App Shell 5.0**：四项状态从 RC6 的大块 `text_4` 灰色按钮改为 `icon_small_4` 小图标入口；全部 / 已安装 / 可更新 / 收藏继续保持同一交互模型，但视觉节奏更接近规划图的小型统计卡。
- 新增蓝色活动导航 SVG，并在 Test 使用成熟样本已存在的 `icon_5_no_crop` 组件；当前页使用品牌蓝活动图标，其它导航保持灰色。此能力仍需实机确认尺寸/裁切表现，未验证不得直接晋级 Stable。
- `sectionLine()` 从厚重的 `line_blank` 改为薄 `line`，减少 RC6 截图中一段一段的大面积灰色横带；首页“我的程序”不再用两个大 `text_2` 灰块做标题/排序，而改为普通 section toolbar + 小型排序/筛选/同步操作。
- 程序列表继续保留 RC6 已证明更适合管理中心的 `icon_1_left_pic`，不再回退到 RC5 的大 `movie_1_left_pic`；名称、版本、分类、真实/记录状态保持在主卡，标签最多 3 个作为辅助信息。
- 普通详情页进一步按规划图重排为：Hero → 云端版本/本地记录/状态/类型/运行方式/更新时间/大小信息行 → 标签 → 打开/更新两个主操作 → 收藏/检查更新/活动记录/备份/更多五项操作；去掉 RC6 四个抽象灰色统计块。
- 多版本中心进一步靠近目标详情模型：Hero → 当前运行/正式版本/测试版本/本地版本/版本数量 → 打开/同步 → 版本卡 → 五项次级操作 → 恢复保障；不再把“正式有/测试有/本地无”作为大块状态卡展示。
- 设置页继续降噪：同步、缓存、版本更新置于高频区；数据备份/恢复和活动记录独立；安装状态探针移到“实验能力”并明确不会影响 Stable；工程诊断继续后置。
- 新建不可变 `3.5.3-rc7 / build 372` Candidate/Test release、`bootstrap_test_v119.js` 与 `rule_repo_test_v119.txt`；Fresh install Shell 数值 version 为 `2026082108`，符合 32 位有符号整数范围。
- RC7 实机重点验收：① 首页排序不再报 `For input string`；② 四项状态的小图标密度是否明显优于 RC6；③ 首页灰色大块是否减少；④ 活动导航蓝色图标是否正常且不裁切；⑤ 普通详情/规则仓库版本中心是否更接近规划图；⑥ 设置页所有选择框和恢复输入是否正常。未完成截图闭环不得晋级 Stable。

## 3.5.3-rc6 Candidate / Test（Build 371 / Shell 1.0.18-test）

- 本轮开发前再次实际读取 `PROJECT_PLAN.md 1.6`、`HIKER_APP_DEVELOPMENT_GUIDE.md 2.1`、`HIKER_APP_DEVELOPMENT_CAUTIONS.md 2.1`，并核对 registry、Stable 3.5.2、Test RC5、Candidate、Channels、Latest、RC5 release/Bootstrap/Shell 与用户最新 RC5 实机截图；Stable/latest 继续冻结在 **3.5.2 / build 364 / Shell 1.5.2**。
- 用户 RC5 实机确认：`icon_4_card` 状态卡与 `movie_1_left_pic` 程序卡虽然“更像卡片”，但在规则管理场景中过大，导致首屏密度、程序列表节奏和目标规划图差距反而更明显；版本中心还出现 `icon_4_card 状态卡 / movie_1_left_pic 程序卡 / 标签 chips` 这类开发验证文案，属于产品体验回归。
- 本轮因此改为 **Product UI 4.0 / 比例优先**：不再把“组件更大、图标更多”等同于高级感，而是直接按目标规划图重设页面骨架与组件比例，优先解决“好用、爱用”而不只是“能用”。
- 首页删除 RC5 的 `测试版 RC5 / 远程模块 / 可回退 / Target UI 3.0` 等工程型标签；Hero 只保留品牌与“海阔视界专属 · 规则管理中心”，随后直接进入一级分类、四项状态、程序工具栏和程序列表。
- 首页四项状态从大图标 `icon_4_card` 回归为**单行紧凑 `text_4`**（全部 / 已安装 / 可更新 / 收藏），这是基于此前实机已经证实的安全写法：不使用多行 `text_4`，避免第二行数字被裁切。
- 程序列表从 `movie_1_left_pic` 改为更适合管理中心的紧凑 `icon_1_left_pic`；名称、版本、分类、状态集中在主卡，能力标签保留为横向 chips，不再让大图标和长卡片占满屏幕。RC5 的“大卡片管理列表”方案明确记为不继续采用。
- 首页“我的程序”与排序做成同级双列工具栏，筛选/同步/收藏保持次级横向操作；避免在列表前堆多组导航、技术状态和重复按钮。
- 分类中心继续保留原生双栏近似，但结果区同步使用紧凑程序卡；高级标签/运行方式/排序/批量管理仍默认折叠，维持目标图“左主分类 / 右子分类 / 下方结果”的任务层级。
- 普通详情页按目标 App Detail 重排：紧凑 Hero → 版本/本地记录/类型/更新时间两列信息 → 标签 → `打开程序 / 导入或更新` 两个主操作 → 收藏/检查更新/活动记录/备份/更多五项操作 → 程序信息。工程字段继续后置。
- 多版本中心删除 RC5 的开发术语 chips 和顶部“常用操作”抢位，改为：Hero → 打开/返回 → 版本概览 → 当前状态 → 版本卡 → 五项次级操作 → 版本关系/恢复保障；正式/测试/本地卡统一改用紧凑图标卡。
- RC5 的 Test 安装状态探针继续保留为实验能力，没有晋级为 Stable 可靠系统 API；实际状态读取失败时仍回退仓库记录。
- 新建不可变 `3.5.3-rc6 / build 371` Candidate/Test release、`bootstrap_test_v118.js` 与 `rule_repo_test_v118.txt`；Fresh install Shell 数值 version 为 `2026082107`，符合 32 位有符号整数范围。
- RC6 实机重点不是检查“有没有新组件”，而是直接和目标规划图对比：① 首页首屏密度；② 程序图标尺寸与单项高度；③ 四项状态是否紧凑；④ 分类结果是否不再过高；⑤ 版本中心是否像用户页面而不是开发说明页；⑥ 普通详情是否形成版本信息 + 主操作 + 五项次操作的清晰层级。未完成截图闭环不得晋级 Stable。

## 3.5.3-rc5 Candidate / Test（Build 370 / Shell 1.0.17-test）

- 用户实机确认 RC4 虽然结构已调整，但整体仍明显沿用旧组件骨架，与目标产品图在状态卡、程序卡、标签层级、详情操作密度和视觉节奏上差距较大；本轮因此不再继续“小修排版”，而是进入 **Target UI 3.0** 组件级重构。
- 开发前重新读取 `PROJECT_PLAN.md`、升级后的 `HIKER_APP_DEVELOPMENT_GUIDE.md 2.1`、`HIKER_APP_DEVELOPMENT_CAUTIONS.md 2.1`，并重新核对 registry、Stable/Test/Candidate/Channels/Latest、RC4 release/Bootstrap/Shell 与用户最新实机截图；Stable 继续冻结在 **3.5.2 / build 364 / Shell 1.5.2**。
- 首页四项状态由旧的纯文字 `text_4` 方案升级为带统一图标的 `icon_4_card` 状态卡，目标是形成更接近目标图的“全部 / 已安装或记录 / 可更新 / 收藏”视觉分组；选中态仍坚持原生纯文本语义，不再使用未验证 HTML 着色。
- 程序列表由 RC4 的 `icon_1_left_pic` 升级为 `movie_1_left_pic` 主程序卡 + 独立标签 chips + 语义分隔，使图标、名称、版本/状态、功能标签形成明确的信息层级；普通程序与多版本程序继续共用统一 Renderer，但多版本程序优先显示“版本中心”语义。
- 新增统一 SVG 资产：安装、筛选、同步、分享、备份、更多等，减少系统字符和临时符号对正式 UI 的影响；首页、详情、版本中心和设置继续沿用同一套图标语言。
- 首页增加 `Target UI 3.0 · 3.5.3-rc5` 测试标识，仅用于 Test 实机确认当前 Core 确实已经切换到 RC5，避免再次把“缓存没有更新”和“UI 改动不明显”混为同一问题；正式版晋级时该测试标识必须移除或产品化处理。
- 分类页、搜索页同步切换到新的程序卡/标签体系；复杂条件继续遵循 GUIDE 2.1：一级分类常驻，高级筛选折叠，避免把标签/排序/运行方式全部堆在首屏。
- 普通详情页继续向目标 App Detail 靠拢：Hero → 打开/导入更新主操作 → 版本/状态/分类/方式 → 标签 → 收藏/检查/分享/备份/更多五项动作 → 程序信息；不新增未验证的系统删除能力。
- 多版本 `channelPage` 同步采用 Target UI 3.0 版本块，继续保留 Stable/Test/Local 关系说明和正式版恢复路径；“我的规则仓库”仍是正式/测试分名并存例外，其他程序继续同名覆盖规则。
- 新增 Test 专用 `install_probe.js`：实验使用海阔内部 `hiker://home@规则名` 访问结果辅助判断规则是否存在；该探针默认有缓存、失败自动退回仓库导入记录，并且在未完成实机验证前**不得写入 Stable 作为可靠系统安装 API**。
- 设置页增加安装状态探针开关/状态清理入口，便于实机 A/B 验证；如果探针在不同设备或海阔版本表现不稳定，后续候选直接废弃该能力，不影响 Stable。
- 新建不可变 `3.5.3-rc5 / build 370` Candidate/Test release、`bootstrap_test_v117.js` 与独立测试 Shell。
- Stable/latest 继续保持 3.5.2；RC5 仅进入 Test/Candidate 实机验证。

## 3.5.3-rc4 Candidate / Test（Build 369 / Shell 1.0.16-test）

- 本轮开发前重新读取 `PROJECT_PLAN.md`、`HIKER_APP_DEVELOPMENT_GUIDE.md 2.0`、`HIKER_APP_DEVELOPMENT_CAUTIONS.md 2.0`，并重新核对 registry、Stable/Test/Candidate/Channels/Latest、RC3 release/Bootstrap/Shell 与用户 RC3 实机截图；Stable **仍冻结在 3.5.2 / build 364 / Shell 1.5.2**。
- 用户 RC3 实机明确暴露两个 UI 回归：`scroll_button` 标题中的 `<font color=...>` 在当前设备直接原样显示；`text_4` 采用换行“标签 + 数字”后数字没有稳定显示。RC4 将这两个实验方案正式证伪：活动筛选统一回归纯文本 `●` 选中态，统计统一使用单行短标题 + 数字，不再依赖 HTML 或多行 `text_4`。
- 按 GUIDE 2.0 的 **Hiker Native Design System** 重构 UI helper：新增语义分隔 `line_blank`、单行 metric、统一 `icon_small_4` 快捷动作、统一程序卡/版本卡 ID 与 class；不再用 HTML 颜色制造选中态，也减少 `blank_block` 人工垫高。
- 首页再次重构为真正面向“找程序/看状态/打开或更新”的主任务：Hero → 一级分类 → 四项单行状态 → 我的程序 → 排序/筛选/同步 → 程序列表 → 底部五项导航。首屏不再显示工程信息，也不再加入大块低频快捷入口。
- 分类页保留原生双栏近似，但重新以 GUIDE 2.0 的“主分类 / 子分类 / 低频高级筛选 / 结果列表”层级组织；五项导航移到页面底部，避免导航抢占分类操作区。
- 搜索页调整为“输入框 → 高频范围筛选 → 结果/最近搜索/热门标签 → 底部导航”，继续保留中文 URL 解码修复，避免 input 上方再堆导航造成搜索首屏过重。
- 普通程序详情页重构为 App 化层级：Hero → `打开 / 导入或更新` 主操作 → 版本/状态/分类/运行方式四项短指标 → 收藏/检查更新/活动记录/设置 → 程序信息/标签 → 底部导航。
- 多版本程序的 `channelPage` 做本轮最大改造：从“只有三张可导入卡片”升级为“版本中心 Hero → 打开程序/返回程序库 → 正式/测试/本地概览 → 版本卡 → 覆盖/恢复关系 → 底部导航”，让 JavDB/ACFun/规则仓库的 Stable/Test/Local 页面更接近目标图中的 App 详情与版本管理中心。
- 更新中心重构为“当前 Core + 待更新数量 + 程序目录 + 回退能力”的清晰状态页；设置页按“体验与同步 / 数据管理 / 关于”三层收敛，明确清理功能只处理规则仓库记录，不伪装成删除海阔已安装程序。
- 新建不可变 `3.5.3-rc4 / build 369` Candidate/Test release、`bootstrap_test_v116.js` 与 `rule_repo_test_v116.txt`；Fresh install Shell 数值 version 为 `2026082105`，符合 32 位有符号整数限制。
- RC4 继续继承 Stable 3.5.2 的事务式 `syncManifest()`、多镜像读取、stale cache、Remote Manager 2.0.2、Stable/Test/Local 版本谱系与本地版隐私门禁；网络失败不得清空最后有效目录缓存。
- 本轮属于 UI/UX 大改，必须执行 Release Guard 后进入 Test 实机闭环；重点验收：首页一级分类不再显示 HTML、四项状态数字完整、分类双栏、搜索输入、JavDB/ACFun 版本中心、普通详情、更新、设置。未通过实机截图验收不得晋级 Stable。

## 3.5.3-rc3 Candidate / Test（Build 368 / Shell 1.0.15-test）

- 用户实机截图确认 RC2 已稳定运行，但与目标效果图仍有明显视觉差距，本轮只继续推进 Test/Candidate，**Stable 仍冻结在 3.5.2 / build 364**。
- 首页重新按目标稿的信息顺序组织为：品牌 Hero → 主分类横向标签 → 四项状态 → “我的程序” → 排序/筛选/同步 → 程序列表；移除 RC2 首页整块“快捷入口”，减少首屏图标堆叠和视觉噪音。
- 首页五项导航改为列表末端导航，目的不是伪造固定底栏，而是在原生列表能力内让首屏结构更接近目标稿；海阔原生列表当前未采用复杂 X5 固定导航方案，避免为了视觉一致牺牲稳定性。
- 四项状态卡实验改为 `text_4` 标题内两行显示“标签 + 数字”，用 Test 实机验证是否能稳定呈现更接近目标稿的统计卡；若海阔当前版本仍裁切第二行，则下一候选回退为单行，不在 Stable 上试错。
- `scroll_button` 的活动筛选使用官方明确支持的 HTML 标题能力，仅在该组件内使用颜色强调；不把 HTML 文本扩散到已知会原样显示的普通文本组件。
- 分类中心新增**原生双栏近似布局**：连续成对输出 `text_2`，左列显示主分类，右列显示当前主分类的子分类，交互上保持主分类切换清空子分类/标签状态；这是对目标稿左右分类管理页的原生近似，不依赖 X5。
- `quickAction()` 从 `icon_4_card` 收敛为 `icon_small_4`，因此设置/关于页操作密度降低，更接近目标稿的轻量图标语言；详情、搜索、更新继续复用 RC2 已稳定页面，仅通过新 UI helper 获得统一外观，避免无必要页面重写。
- 程序卡继续使用 `icon_1_left_pic`，状态文案统一为“版本中心 / ↑ 可更新 / ✓ 已记录 / 未记录”，不伪装成海阔系统级“已安装”；官方当前只确认 `getRuleCount()` 与 `getLastRules()` 等能力，未发现可靠的按规则名枚举并读取真实本地版本 API。
- 新建不可变 `3.5.3-rc3 / build 368` Candidate/Test release、`bootstrap_test_v115.js` 与 `rule_repo_test_v115.txt`；Fresh install Shell 数值 version 为 `2026082104`，仍在 32 位有符号整数范围内。
- RC3 继续继承 Stable 3.5.2 的 Repository / Resilience / Recovery / Stable-Test-Local / 本地版隐私门禁和事务式同步；网络失败仍不得删除最后有效目录缓存。

## 3.5.3-rc2 Candidate / Test（Build 367 / Shell 1.0.14-test）

- 按用户要求先完成“测试版与正式版同基线”。新增不可变 `3.5.2-test.1 / build 366` 测试基线 release，业务模块与 Stable 3.5.2 / build 364 完全一致，仅保留测试通道独立状态与身份，作为后续开发的干净起点。
- 3.5.3-rc2 不从旧 RC12/RC1 测试栈继续叠补丁，而是从上述 Stable 对齐基线重新构建：先继承 Stable 3.5.2 的 Repository / Resilience / Recovery / Stable-Test-Local / Local 隐私门禁等能力，再覆盖 RC2 自己的 UI 页面模块。
- 新增 `premium_ui.js`，把 RC10/RC11/RC12 分散的 UI helper 收口到当前候选；首页、分类、搜索、详情、更新、设置、版本中心统一使用同一套状态文案、动作卡、程序卡和错误提示。
- 首页强化为“品牌 Hero → 五项导航 → 四项状态 → 四个快捷入口 → 分类 → 程序列表”，减少调试信息，突出高频操作和程序本体。
- 程序卡片继续保持紧凑 `icon_1_left_pic`，主信息收敛为版本 / 分类 / 仓库状态，能力标签最多显示 3 项，降低截断和视觉噪音。
- 双版本/三版本中心再次重构：只保留当前状态、版本卡和恢复说明；正式版优先、测试版次级、Local 独立，并继续遵守普通程序 Stable/Test 同名覆盖、“我的规则仓库”正式/测试分名恢复例外。
- 分类中心保留主分类和子分类常驻，高级标签/运行方式/排序/批量管理继续折叠；搜索页继续保留中文 URL 解码修复并收敛常驻筛选。
- 详情、更新、设置统一产品化：主操作与次级操作分层；工程诊断后置；同步仍使用事务式 `syncManifest()`，失败不得删除最后有效目录。
- 新 Test Bootstrap 为 `bootstrap_test_v114.js`，Fresh install Shell 为 `rule_repo_test_v114.txt`，测试通道状态继续与 Stable 隔离。
- Stable **仍保持 3.5.2 / build 364 / Shell 1.5.2**；RC2 只进入 Test/Candidate，必须通过 Guard + 海阔实机关键路径后才允许晋级。

## 3.5.2-test.1 Test Baseline Sync（Build 366）

- 这是一次发布谱系校准快照，不是新的产品功能版本。
- 业务模块严格复制 Stable 3.5.2 当前 release 组成，仅增加 `testStatePatch` 与 `test_baseline_patch.js`，用于证明后续 Test 从当前 Stable 出发，而不是继续依赖历史旧测试分支。
- 该 release 永久保留为 `apps/tools/rule-repo/releases/test-3.5.2-sync1/release.json`，后续不原地修改。

## 3.5.3-rc1 Candidate / Test（Build 365 / Shell 1.0.12-test）

- **修正版本谱系倒挂。** Stable 已经是 3.5.2 / build 364 后，不再继续沿用旧的 `3.5.0-rcN` 测试线；下一测试目标正式调整为 3.5.3，首个候选为 `3.5.3-rc1`。
- Test/Candidate 不是从 RC12 旧分支直接续号，而是先完整 **rebase 当前 Stable 3.5.2**，继承 3.5.2 已验证的 Stable/Test/Local 三通道、`channel_local_patch`、Recovery、安全同步、多镜像和运行时契约，再叠加 RC12 UI Luxe。
- `candidate.json / test.json / channels.json` 增加 `baseVersion/baseStableVersion` 与 `targetVersion`，使版本谱系可机器校验：当前 Test 基于 Stable 3.5.2，目标为 3.5.3。
- 新增 `docs/VERSION_CHANNEL_GOVERNANCE.md`，规定 Test 基础版本不得低于 Stable；Stable 晋级后下一轮 Test 必须先继承当前 Stable；Local 是纯本地派生产物，不参与“谁更新”的版本排序。
- `docs/HIKER_RULE_NAME_CHANNEL_POLICY.md` 升级并同步版本谱系要求；新增 `tools/channel_version_guard.py` 并接入 Hiker Release Guard，阻止以后再次出现 Stable 高于仍在开发 Test 基础版本的长期状态。
- ACFun / JavDB 多通道元数据补充版本谱系字段；JavDB Local 明确记录从 Stable 3.9.41 派生。
- Stable **仍保持 3.5.2 / build 364 / Shell 1.5.2**，本候选只进入 Test/Candidate，必须完成 Guard 与海阔实机关键路径后才考虑晋级。

## 3.5.2 Stable / Build 364 / Shell 1.5.2 / Manager 2.0.2

- 当前正式 Stable 基线，以 `stable.json` 为最终事实来源。
- 修复 3.5.1 曾在同一 release 路径原地覆盖模块、导致海阔继续命中旧缓存的问题；3.5.2 使用**全新 release URL/build**，再次确认 Stable 引用过的 release 不允许原地修改。
- 正式启用 Stable / Test / Local 三通道版本中心：Stable 日常使用与恢复；Test 验证远程新功能；Local 为纯本地独立版。
- 普通程序 Stable/Test 继续使用同名覆盖策略；本地版使用独立名称以便与远程版并存。“我的规则仓库”因自举恢复需求继续允许正式版与测试版分名并存。
- Stable release 继续保留 Repository/Filter/Management/Resilience/ProductState/Design/UI/UI Foundation/Home/Category/Search/Updates/Detail/Channel/History/Settings/Runtime Contract 等模块化边界，并通过运行时 contract 防止共享函数遗漏。

## 3.5.1 Stable

- 由 RC9 实机验证基线晋级，正式版恢复到具备“正式版 / 测试版”二级入口的完整管理中心。
- Stable Shell 升级为 1.5.1，Manager 使用 2.0.2，多镜像读取并修复旧 Bootstrap lazyRule 作用域问题。
- 保留 RC8 事务式安全同步：联网失败时不主动删除最后有效目录缓存。
- 保留 RC9 UI Foundation 修复与运行时 API 契约门禁，避免 `pushSpacer` 等共享函数遗漏再次进入发布。
- 正式版作为测试版故障时的固定恢复入口：从正式版版本中心可以重新导入测试版；测试异常时正式 Stable 不应被破坏。

## 3.5.0-rc12 Candidate / Test（Build 363）

- 历史 Test/Candidate UI Luxe 基线；该版本线现已冻结，不再继续向 `3.5.0-rc13` 等旧基础版本追加候选。
- 程序列表改为更紧凑的图标卡片；双版本中心减少重复 CTA；设置与更新中心动作卡片化；分类和搜索继续减负。
- 版本元数据读取增加自包含兜底，测试通道继续与 Stable 状态隔离。
- RC8/RC9 的关键稳定性结论已经被 3.5.1 Stable 吸收；RC10/RC11 的完整逐版细节没有在旧主日志中集中整理，未来如需追溯必须从对应 release/Git 历史核对，禁止凭记忆补写。
- 2026-08-21 审计确认：在 Stable 已推进到 3.5.2 后继续保留 `3.5.0-rc12` 作为活动 Test 会形成版本谱系倒挂，因此下一 Test 已改为从 Stable 3.5.2 重新派生的 3.5.3-rc1。

## 3.5.0-rc7 Candidate

- 正式版 / 测试版二级版本页再次重构，突出“正式版 · 稳定推荐”和“测试版 · 抢先体验”两条清晰路径。
- 版本页增加明确的“导入正式版 / 导入测试版”主操作，不再只依赖整卡点击提示。
- 版本页减少 build 等工程信息抢占主视觉，状态、更新时间和版本定位改为辅助信息。
- 加入海阔程序名覆盖策略提示：普通小程序正式版与测试版保持同名，通过覆盖安装切换；需要恢复时重新导入正式版即可。
- “我的规则仓库”继续作为唯一默认分名例外，正式版与测试版可同时保留，保证测试版故障时仍有稳定恢复入口。
- 新增 `docs/HIKER_RULE_NAME_CHANNEL_POLICY.md`，将程序名 / 覆盖安装 / 双通道命名策略固化为长期规范。
- 新增 `tools/channel_name_guard.py` 并接入 Hiker Release Guard CI，自动检查多通道名称和 Shell title，防止后续误给普通程序测试版加后缀。
- Candidate/Test 升级到 3.5.0-rc7 / build 357，Fresh install 使用 Bootstrap 1.0.5-test 与 `rule_repo_test_v105.txt`。

## 3.5.0 Stable

- 3.5.0-rc6 经海阔实机确认整体 UI/UX 明显改善后晋级正式版。
- 正式版升级到 Core 3.5.0 / build 356 / Bootstrap 1.5.0，并切换到版本化 `libs/updater/v2.0.1/remote_manager.js`。
- 保留 RC6 的统一设计系统、五项图标导航、产品化首页、程序卡片、分类、搜索、更新中心、详情与设置体验。
- 保留智能云端索引 revision 探测、旧缓存兜底、Remote Module 更新与回退能力。
- 新稳定 Shell 为 `rule_repo_remote_v350.txt`，数值 version 为 2026082056，符合 32 位有符号整数限制。
- Stable/latest 从 3.4.3 正式晋级到 3.5.0；3.4.3 继续作为历史回退版本保留。

## 3.5.0-rc6 Candidate

- 启动 UI/UX 专项重构，不再把“功能更多”当成体验提升，优先解决信息层级混乱、按钮重复、技术信息过多、页面密度不一致的问题。
- 新增统一 Design System：五项图标导航、统一程序卡片、统一状态文案、统一版本页与详情页操作层级。
- 首页移除 Core/build/schema/revision 等工程信息，改为“程序数量 / 当前通道 / 云端同步”用户可理解的信息；工程信息统一后置到设置与关于。
- 首页状态从四列数字卡改为横向状态筛选，并加入一次性“界面已焕新”提示，减少首屏视觉噪音。
- 程序卡片改用更紧凑的 `icon_1_left_pic`，主信息只保留名称、版本、状态和功能描述；远程/本地等实现细节不再抢占主视觉。
- 主导航改为五项图标导航：首页 / 分类 / 搜索 / 更新 / 设置，统一视觉语言与点击区域。
- 版本中心重构为“正式版 · 推荐 / 测试版 · 抢先体验”，点击整卡直接导入，版本/build/本版重点作为辅助信息。
- 普通详情页强化“打开 / 更新或导入”两个主操作，收藏、检查更新、活动记录、设置作为四项次级操作。
- 分类页、搜索页、更新页、设置页统一降噪：复杂条件使用横向筛选，工程诊断与缓存细节后置。
- 新增专用 UI 图标资产，减少 Emoji 和符号混排造成的不一致。
- 测试通道升级到 Core 3.5.0-rc6 / build 355，新增 Bootstrap 1.0.4-test 与独立测试 Shell。
- Stable/latest 继续保持 3.4.3；RC6 仅进入 Test/Candidate 实机验证。

## 3.5.0-rc5 Candidate

- 首页升级为产品化控制台：新增“继续使用”、最近打开记录、收藏快捷入口和有更新时的主动提示。
- 打开程序时会记录最近打开时间，首页、详情页和活动记录可形成连续使用体验；该记录只属于仓库自身，不冒充海阔系统日志。
- 程序卡片重新整理信息层级：名称 / 版本 / 模式 / 状态为主信息，分类和最近使用时间作为辅助信息，减少无效标签堆叠。
- 搜索中心新增“全部 / 可更新 / 收藏 / 远程 / 本地”范围筛选，并优化最近搜索、热门标签和最近使用推荐。
- 分类中心改为更紧凑的主分类横向切换 + 子分类 / 标签 / 模式 / 排序组合筛选，批量管理保持独立且明确只处理仓库记录。
- 版本选择页强化为统一版本中心，明确“正式版 · 推荐”和“测试版 · 抢先体验”，展示版本、build、更新时间、本版重点和仓库记录状态。
- 普通程序详情页强化主操作、快捷操作、最近导入、最近打开和能力标签，减少重复信息。
- 更新中心升级为 Release Center，统一展示 Core 通道、程序库同步、可更新程序、已同步程序和索引 revision 状态。
- 设置页增加最近打开清理、活动记录入口和状态备份 schema 2；备份现在包含打开历史。
- 测试通道升级到 Core 3.5.0-rc5 / build 354，新增 Bootstrap 1.0.3-test 与独立测试 Shell。
- Stable/latest 继续保持 3.4.3，RC5 仅进入 Test/Candidate 实机验证。

## 3.5.0-rc4 Candidate

- 新增 `manifest_meta.json` + revision 轻量探测：完整 manifest 继续长缓存，云端 revision 变化时才刷新完整索引，解决 30 分钟缓存导致新程序迟迟不可见的问题。
- 根 manifest 升级到 schema 8，引入通用 `entryType=channel-group` / `channelsPath`，任意程序都可复用“一个首页入口 → Stable/Test/Beta/Dev”模式。
- 首页继续降噪，删除重复快捷入口，保留主导航、状态统计、排序与手动同步。
- 程序卡片减少冗余标签和截断，多版本程序显示“正式 / 测试双通道”。
- 版本选择页增加通道 build、更新时间和本版重点。
- 更新中心明确 Stable/Test 通道，并展示智能索引同步状态。
- 设置页加入完整索引缓存和轻量 revision 探测频率配置。
- Release Guard 新增 manifest revision、channel-group、通道入口和 test.json 校验。
- 测试通道升级到 Core 3.5.0-rc4 / build 353，新增 Bootstrap 1.0.2-test 与独立测试 Shell。

## 3.5.0-rc3 Candidate
- 云仓库首页不再同时显示“我的规则仓库”和“我的规则仓库·测试版”，恢复为单一“我的规则仓库”入口。
- 点击“我的规则仓库”进入独立版本选择二级页，集中展示正式版与测试版。
- 点击“正式版”直接导入 Stable 3.4.3 Shell；点击“测试版”直接导入 Candidate 3.5.0-rc3 Shell。
- 新增 `channels.json` 作为正式/测试双通道安装元数据，后续版本更新只维护通道描述，不再向根 manifest 增加重复程序卡片。
- 测试通道升级到 Core 3.5.0-rc3 / build 352，新增 Bootstrap 1.0.1-test；正式版 Stable/latest 继续保持 3.4.3，待实机验证通过后再晋级。

## 3.5.0-rc2 Candidate

- 首页与分类中心固定保留“全部 / 视频 / 漫画 / 网盘 / 工具 / 聚合”六个主分类，即使当前数量为 0，也不隐藏分类入口，更贴近目标管理中心布局。
- 程序详情新增“打开”按钮，使用海阔官方 `hiker://home@规则名` 路由打开已安装首页频道；找不到时回到首页频道列表。
- 详情页将“打开 / 导入或更新”设为主操作，将收藏、检查更新、备份状态收拢为快捷操作。
- 保持系统级删除能力关闭：官方文档未确认删除已安装首页频道的开放 API，因此只提供清除仓库版本记录，避免伪功能。
- Candidate build 升至 351，新增独立 Bootstrap 1.5.1 与 `rule_repo_candidate_v351.txt` 测试壳，继续与正式版 Remote state 隔离。

## 3.5.0-rc1 Candidate

- 按目标管理中心效果继续重构首页：新增横向主分类标签、五项主导航、四项状态统计和更聚焦的程序列表。
- 首页状态继续使用“已记录”而不是伪装成系统级“已安装”，保持版本判断语义准确。
- 新增 Management 模块，提供批量选择、批量收藏/取消收藏、批量清除版本记录。
- 新增状态备份/恢复：可导出收藏、版本记录、最近使用、搜索/导入历史和筛选设置，不包含 Cookie、Token 或账号凭据。
- 分类中心加入批量管理模式，并继续保留主分类、子分类、标签、模式、排序组合筛选。
- 程序详情升级为应用式信息页，增加最近导入时间、版本检查、状态备份入口和安全的记录管理。
- 设置/关于页面增加备份恢复、界面适配说明和 Architecture-First 模块说明。
- Candidate Bootstrap 固定绑定 `libs/updater/v2.0.1/remote_manager.js`，测试状态与正式版 Remote Manager state 隔离。
- 新增 `stable.json` / `candidate.json` 双通道描述；Stable 继续保持 3.4.3，Candidate 未完成实机 smoke test 前不切 `latest.json`。
- 新增独立 Candidate 测试壳 `rule_repo_candidate_v350.txt`，规则数值 version 为 2026082050，保持在 32 位有符号整数范围内。

## 3.4.3

- 修复 3.4.1/3.4.2 Raw 优先读取在部分网络环境下返回非 JSON 内容时导致首页“仓库读取失败”的回归。
- 仓库索引恢复为 GitHub Contents API 优先读取，Raw 仅作为 API 失败后的兜底通道。
- Raw 通道新增 HTML、网关错误、限流文本识别，避免把错误页当作有效索引继续解析。
- 默认索引缓存从 60 秒延长到 30 分钟，显著减少 GitHub 请求次数和网络波动影响。
- 网络读取失败时，只要本地存在历史有效索引，就继续使用旧索引，不再直接让首页不可用。
- 使用独立 build 343、Bootstrap 1.4.3 和 rule_repo_remote_v343 启动壳，彻底绕开 3.4.2 已缓存模块。
- 启动壳 version 使用 2026082043，保持在海阔 32 位有符号整数范围内。

## 3.4.0

- 首页统计卡改为“标签 + 数字”单行展示，解决 text_4 第二行被裁切导致只看到数字的问题。
- 首页新增快捷入口：分类筛选、导入记录、更新中心，并增加远程/本地/最近使用/索引时间状态摘要。
- 分类中心新增“当前筛选”状态条，主分类、子分类、标签、模式与排序分段更清晰。
- 设置中心按“仓库 / 记录 / 筛选 / 关于”分组，减少长列表杂乱感。
- 新增独立“导入记录”页，同时展示最近导入与最近使用程序。
- 搜索中心增加导入记录与分类筛选快捷入口。
- 更新中心增加导入记录入口，并统一统计卡样式。
- 程序详情页增加四项状态统计和“更多操作”分区。
- Hanime1 与 ACFun 改用仓库内稳定 SVG 图标，避免灰块和低清 favicon。
- 业务模块扩展为 Repository / Filter / UI / Home / Category / Search / Updates / Detail / History / Settings。
- 新增独立 3.4.0 release 目录，继续保留 3.3.0 及更早版本回退能力。

## 3.3.0

- 升级为“专业管理台”结构：首页 / 分类 / 搜索 / 更新 / 设置 / 详情独立页面。
- 新增共享 UI 模块，统一导航、统计卡、状态文本、程序卡片和空状态。
- 首页使用海阔原生 text_4 四列统计与 text_5 五项导航，减少控件堆叠。
- 分类中心支持主分类数量、子分类数量、标签、运行模式和排序组合筛选。
- 搜索中心新增独立搜索历史、热门标签和结果页。
- 更新中心整合 Core 更新/回退与各程序“已记录 / 可更新”状态，并保留逐项安全更新。
- 程序详情页重做为应用式详情：云端版本、已记录版本、状态、分类、模式、标签和记录管理。
- 设置中心新增搜索历史、最近使用、导入历史、版本记录、收藏等数据清理能力。
- 业务模块细化为 Repository / Filter / UI / Home / Category / Search / Updates / Detail / Settings，后续可单模块维修。
- 新增独立 3.3.0 release 目录，继续保留 3.2.0 / 3.1.0 真正可回退能力。

## 3.2.0

- 首页改为“极简专业风”，减少首屏控件密度。
- 首页只保留仓库总览、搜索、状态筛选、一级分类和程序卡片。
- 子分类、标签、排序、运行模式移入独立“高级筛选”页面。
- 状态筛选统一为：全部 / 已记录 / 可更新 / 收藏 / 最近。
- 程序卡片压缩为名称、版本、运行模式、同步状态、分类与少量标签。
- 详情、版本中心和设置页继续保持独立模块，避免 UI 修改影响数据/导入逻辑。
- 新增独立 3.2.0 release 目录，继续保留真正的版本回退能力。

## 3.1.0

- UI/体验重构，首页改为仓库总览、状态统计、搜索、分类筛选、程序列表四层结构。
- 清除不兼容的 HTML 标题写法，避免 `<b>`、`<small>`、`<font>` 等字符串直接显示。
- 仓库自身图标改为真实远程 URL；分类回退图标改为独立远程 SVG 文件。
- 程序卡片统一显示版本、运行模式、导入状态、分类与标签。
- 新增最近导入版本记录，并据此显示“未记录 / 已同步 / 可更新”。
- 新增“仅看可更新”快捷筛选与首页统计。
- 详情页、版本中心和设置页重新排版。
- 3.1.0 使用独立 release 目录，保留 3.0.0 真正可回退能力。

## 3.0.0

- 从单文件内嵌 Core 升级为 Remote Module 架构。
- 新增分类、子分类、标签筛选。
- 搜索覆盖名称、描述、标签、分类与版本。
- 新增仓库收藏、最近使用、排序与版本中心。
- manifest 支持原生图标；规则自带图标直接展示，无图标时使用分类色块回退。
- 新增独立详情页、设置页、远程更新/回退页。
- Repository / Filter / Home UI / Pages UI 分模块维护.
