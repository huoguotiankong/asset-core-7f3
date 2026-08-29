# 海阔小程序编写注意事项

版本：3.8  
首次建立：2026-08-20  
最近增强：2026-08-25  
文档性质：**长期踩坑档案 / 发布前必查 / 发现新坑立即追加**

> 本文档保存已经发生过的真实事故、兼容限制和发布硬约束。开发已有程序前必须继续读取目标程序 `CHANGELOG.md`、当前 Stable/Test/Local/Candidate 元数据、release/Bootstrap/Shell/实际模块以及用户当前实机结果。

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
→ 用户当前实机版本/截图/报错
→ 才开始修改
```

发布前：
- 任一 P0 未通过，不允许晋级 Stable/切 latest。
- UI 大改没有实机截图闭环，不算完成。
- 图片/播放没有实机回归，不算完成。
- 目标程序 CHANGELOG 未同步，发布视为未完成。

---

# P0：版本、发布、自举与上下文

## 1. Stable release 不得原地覆盖
海阔 `require(url, options, version)` 会缓存远程模块。同 URL/同 version/build 很可能继续命中旧缓存。

正确：冻结旧版 → 新 version/build/release → 验证 → 再切 Stable。

## 2. 缓存型故障必须新 build / 新缓存键
已经进入错误缓存时，不继续覆盖同名文件赌刷新。必要时 release URL、Bootstrap 文件名一起变化。

## 3. `stable/latest` 永远最后切

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
必须满足 `0 <= version <= 2147483647`。项目推荐安全 10 位 `YYYYMMDDNN`；业务 SemVer/build 与壳 version 分离。

## 5. 重新导入 Shell 不等于 Remote Manager 状态已切换
`hc_remote_state_<appId>` 等持久状态可能仍指向旧 Core。重大修复使用 minBuild/migration/new build，并保留回退。

## 5A. Remote Release 更新不等于云端仓库已经下发新 Shell
真实事故：ACFun Test 元数据已经升版，但 Cloud Shell/Bootstrap 仍固定旧 build，手机继续启动旧 Core；程序内更新又因管理器入口写错而失败。

Shell/Bootstrap 不兼容或需要强制迁移时必须成套发布：

```text
新业务 build / immutable release
→ 新 Bootstrap 文件名 + 新 require 缓存键
→ 新 Shell 文件名 + 递增规则 version
→ channels / manifest / registry 切新路径
→ 从云端仓库覆盖导入
→ minBuild/defaultRelease 越过旧 active state
```

序列化 `lazyRule` 不得依赖外部局部变量/全局临时对象；Bootstrap URL/version 显式传入回调。

## 5B. 云端仓库“广告 Build”必须等于实际安装工件基线
Hanime1 Test26 真实事故：test/channels/registry 广告 Build20026，但 Cloud Repo 仍指向旧 Shell → Bootstrap 20024，重新导入后仍运行 Test24。

因此 Cloud Repo 当前 Test/Candidate 必须满足：

```text
advertised build
== release.json build
== installerBuild（若使用）
<= Bootstrap minBuild
<= Bootstrap defaultRelease.build
```

逻辑 Shell 架构可以不升级，但安装工件要按 build 版本化，例如：

```text
hanime1_remote_test_v4_b20028.txt
→ bootstrap_test_v4_b20028.js
→ minBuild/defaultRelease = 20028
```

发布前运行：

```text
python tools/remote_installer_guard.py --root .
```

## 5C. 新/修改 JavaScript Release 必须先过语法门禁
Hanime1 Test27 真实事故：`patch_experience27.js` 的 `E.repliesPage` 少一个右括号，设备启动直接报：

```text
SyntaxError: 在参数列表的后面缺少“)”
```

这是 P0 发布事故：模块在 parse 阶段失败，业务 `try/catch` 无法兜底，整个小程序无法启动。

固定规则：

```text
新增/修改 JS
→ node --check / tools/js_syntax_guard.py
→ Release/路径/模块存在性检查
→ Shell/Bootstrap/install build 检查
→ 才允许切 test/candidate/stable metadata
```

推荐：

```text
python tools/js_syntax_guard.py --root . --path <本次 release 目录>
```

要求：
- 本次新增/修改的每个 `.js` 都必须检查。
- Recovery loader 和 Bootstrap 也必须检查。
- 一个模块未通过就不能切通道元数据。
- 发现活动 Test/Candidate 语法错误：**冻结坏 Release，不原地覆盖；新建更高 build，并从最后可启动基线恢复，显式跳过坏 Release。**
- 大型补丁优先拆成 Community / Creator / UI / Settings 等小模块，减少单文件 parse failure domain。

专项记录：`docs/INCIDENT_JS_SYNTAX_RELEASE_20260822.md`。

## 5D. `eval` 生成的局部变量不能跨 helper 作用域假定仍可见
JavDB `3.9.42-test.2` 真实事故：为了复用把原本同一 `core()` 内的：

```text
eval(Core)
→ eval(Patch)
→ eval('JDB.home()')
```

抽成：

```text
loadCore(){ eval(Core); eval(Patch); }
core(){ loadCore(); eval('JDB.home()'); }
```

代码通过 `node --check`，但海阔实机启动直接：

```text
ReferenceError: JDB 未定义
```

根因是 Core 中通过 direct `eval` 建立的 `var JDB` 只存在于 `loadCore()` 的函数作用域；helper 返回后，外层 `core()` 无法再访问该变量。

固定规则：
- 依赖 `eval` 创建局部 `var/function` 的链路，不得仅为了“复用”拆到另一个函数后再假设变量仍存在。
- 如果后续调用依赖 eval 中的局部符号，优先保持 `eval(Core) → eval(Patch) → call` 在**同一函数作用域**。
- 真正需要跨函数时，Core 必须显式导出到稳定对象/命名空间，并针对目标 JSEngine 实机验证；不能只看浏览器/Node 行为猜测。
- `node --check` 只能证明 parse 通过，不能证明 eval scope、closure、序列化 lazyRule、海阔 JSEngine 运行语义正确。
- Remote Runtime/Bootstrap/Loader 发布前增加最小 entry smoke test：至少执行一次“加载 Core → 调用实际导出入口”，而不是只做语法检查。
- 此类故障一旦进入已发布 URL，继续遵守新 build / 新 Shell / 新 runtime / 新 cache key，禁止原地覆盖赌缓存刷新。

## 5E. `lazyRule` 点击时不得只重新 `eval` 基础 Core 再调用已被补丁覆盖的方法
ACFun Alpha12 真实事故：页面首次渲染已经按 Release 顺序加载 Core → 多层 Runtime，仓库代码也能看到最新版 `ac.play()`；但旧视频详情的播放 `lazyRule` 在用户真正点击时又执行：

```text
getItem(core_src)
→ eval(Core)
→ ac.play(...)
```

这会在**点击执行上下文**里把同名命名空间重新初始化，导致后置 Runtime/Patch 已覆盖的方法全部丢失。结果是“页面显示最新 Build，但点击仍执行老 Core”，连续多版播放修复看起来完全无效。

固定规则：
- Remote 模块化程序中，序列化 `lazyRule/rule` 若要调用当前业务对象，默认应重新进入**当前 Bootstrap/Loader**，而不是只 eval 某个历史 Core 源字符串。
- 推荐：`require(currentBootstrap, cacheKey) → loadOnly() → CurrentNamespace.method()`，Bootstrap URL/version 作为参数显式传入 lazyRule。
- 如果为了性能确实要 eval 本地缓存，必须缓存并恢复**同一个活动 Release 的完整导出**；不能只恢复基础 Core 后假装后置覆盖仍存在。
- 发布前除了“启动入口 smoke test”，还要对关键点击路径做 **action smoke test**：首页点击播放/章节/登录时，记录实际 Runtime build/method owner，确认没有在 lazyRule 内降级到旧 Core。
- 当“源码已经覆盖、设备仍表现像旧逻辑”时，除了查 Remote state/cache/load order，还必须查按钮自身 lazyRule 是否重建了旧运行时。

## 6. 关键索引不能是“单在线通道 + 短缓存 + 无 stale cache”
正确链：新鲜缓存 → 主通道 → 备用通道 → 上一次有效 stale cache → 诊断错误页。

## 7. 备用通道不能只判断“非空”
HTML 限流页、502/503、登录页都可能非空。写缓存前校验 HTTP/业务状态、类型、schema、必要字段。

## 8. 严重事故不要补丁叠补丁
Shell/Bootstrap/Core/Manager/cache 同时变化会迅速失去可观测性。冻结坏版本，新建隔离 release，完整验证。

## 8A. 多域同时回归的 Test/Candidate 不得继续当 recovery base
Hanime1 Test34 真实事故：同一版同时覆盖 Community / Account / Library / Search 后，主评论从可见退化为 0、账号片单变成伪卡、搜索仍报错、筛选入口也与源码意图不一致。

出现这种情况时固定执行：

```text
当前失败 Test 冻结/quarantine
→ 找最后一个用户实机证明“关键旧功能仍正常”的 build
→ 新 build 直接从该实机基线恢复
→ 每次只重新叠加小范围、可独立验收的模块
```

不要因为失败版本“代码看起来更先进”就继续继承它。

## 8B. 只解析到 raw identifier 时禁止制造用户可见伪成功卡片
例如扫描到 `playlist?list=192779`，但没有解析到真实 title/cover/wrapper，不得直接展示成“片单192779”。

正确策略：真实业务字段齐全才建卡；否则标记“解析失败/待确认”并保留诊断。**宁可显式失败，不要伪造成功数据。**

## 8C. 仓库源码显示“已覆盖”不代表设备运行时真的执行了该覆盖
Hanime1 Test34 源码删除了筛选行 `>`，实机仍然出现 `>`，说明 Remote Manager active state、require cache、模块覆盖顺序或页面函数后续重绑定都可能使源码意图与设备结果不一致。

截图与源码冲突时：用户实机优先；先查 Shell → Bootstrap → Remote state → Release → module load order，再决定是否改业务 parser。

## 9. 自举工具必须有仓库外 Recovery
规则仓库等“自己管理自己”的程序至少有正常更新中心 + 不依赖当前首页/manifest/active Core 的独立 recovery。

## 10. 未读 CHANGELOG/Stable 就直接开改属于高风险
新对话最容易复活旧接口、重复已证伪方案、破坏稳定播放/登录/图片链。

## 11. 动态事实优先级不能颠倒

```text
用户明确要求/实机
> 当前 Shell/Bootstrap/Stable/Release/源码
> 程序 CHANGELOG
> registry/manifest
> 全局文档历史信息
> 旧聊天记忆/推测
```

## 12. Stable 晋级但 CHANGELOG 未同步属于发布缺陷
CHANGELOG 是长期技术记忆，不是发布后再补的说明。

## 13. CHANGELOG 不得保存真实秘密
可写算法、字段、来源、刷新方式；禁止真实密码、有效 Token/Cookie/Authorization、私钥/API Secret。

## 14. 缺失历史不能靠猜
旧程序没有记录就标“当前已知/待确认”，不从相似站点/APK推断后写成事实。

---

# P1：架构、状态、模块与并发

## 15. UI 显示版本不要硬编码多份
统一读运行时 version/build/Shell/Manager。

## 16. `preRule` 不承担重型/危险动作
禁止每次启动清 Remote state、清全部缓存、强制更新、大量联网、删用户数据。

## 17. 状态 Key 命名空间隔离
推荐 `<appId>_<providerId>_<module/page>_<key>`。

## 18. Provider 私有状态不能串源
Cookie、域名、页码、线路、失败次数、正文/评论缓存都隔离。

## 19. 未启用 Provider 不初始化、不请求
Lazy Load 为默认。

## 20. Remote module 加载阶段不要执行不可逆动作
`require()` 优先只定义/导出对象；不要加载即登录、删文件、清数据、大量请求。

## 21. 公共远程库要版本化
Stable 绑定明确版本目录；已发布版本只读。

## 22. 不为“统一规范”批量重构所有 Stable
随正常升级逐步迁移，并保留回退。

## 23. Candidate/Test 失败就废弃候选
不要顺手改 Stable。

## 24. `batchExecute` task 不要闭包引用外部局部变量
通过 `param` 传入；生命周期、confirm、部分 lazyRule/rule 序列化回调同理。

## 25. 多线程不要直接并发写 `setItem/putMyVar`
task 返回结果，listener 集中写；必要时 `syncExecute()`。

## 26. 缓存必须有作用域 + schema/version
协议/模型变化时明确失效旧缓存。

## 27. 并发不是把所有接口/图片打满
按 P0/P1/P2/P3 分级，有并发上限、超时、停止条件，注意风控。

## 27A. Auth/Profile/Session Resolver 禁止形成互相回调环
Hanime1 Test39 真实事故：

```text
P.profile()
→ P.sessionProfile32()
→ C.activeAccount()
→ browserProfile()
→ P.profile()
→ ...
```

browser-session 模式下形成重入闭环，导致视频详情、我的、设置等**并不需要补全账号资料的页面**也长时间卡在加载。

固定规则：
- 覆盖 `profile()/activeAccount()/sessionProfile()` 前先画调用图，确认没有回边。
- 如果 `activeAccount()` 的 browser fallback 可能调用 `profile()`，那么 `profile()` 内禁止再调用 `activeAccount/sessionProfile()`。
- 通用 getter（详情页、设置页、评论页可能调用）默认只读本地/stale cache；网络补全必须是显式 `refresh/sync` 动作或限定在账号页面。
- 身份 Resolver 必须有 re-entry guard；检测到重入时立即返回缓存/空结果，不继续向下递归。
- “登录态判断”与“拉取完整昵称/头像/邮箱”分层：前者应轻量，后者可以较慢但不能污染所有页面。

---

# P1：UI / UX 与原生组件

## 28. 普通组件不要塞任意 HTML
`<b>/<small>/<font>` 可能被原样显示。富文本只放官方明确支持组件/字段。

## 29. `text_4/text_5` 信息量克制
多列组件用短文本，不硬塞复杂说明。

## 30. `input` 与频繁动态刷新注意失焦
输入区与结果区尽量隔离，优先局部更新。

## 30A. `col_type:'input'` 的 `url` 必须是“可求值并返回 URL 的 JS 表达式”
Hanime1 Test36–38 连续出现 `未知链接：error:返回的值无效 (JSEngine#13)`。Test38 的典型错误是把 `input.url` 写成顶层语句并在末尾直接 `return`：

```javascript
putMyVar('q', String(input || ''));
refreshPage(false);
return 'hiker://empty';
```

海阔 input 的 `url` 会被当作表达式求值；顶层 `return` 并不位于函数体内，不能按 `lazyRule(function(){...})` 的写法想当然。

固定写法优先：

```javascript
"(function(){var q=String(input||'').trim();putMyVar('q',q);return 'hiker://page/search?rule=&simple=true';})()"
```

或直接使用简单表达式：

```javascript
"'toast://你输入的是' + input"
```

`extra.onChange` 可用于只保存输入状态；需要导航时由合法表达式返回固定页面 URL。出现 JSEngine#13 时，先检查 input URL 的**求值语法/返回类型**，不要先怀疑远端搜索 API。

## 30B. `pdfh/pdfa` 的空值必须在 Adapter 层统一归一，禁止把字符串 `null/undefined` 渲染进 UI
Hanime1 Test38 真实事故：回复数量正确恢复到 33 条，但用户名和正文全部显示字面量 `null`。原因之一是错误节点解析后，值经 `String(...)` 转换，把运行时空值变成了可见文本。

所有 HTML/DOM Adapter 的 clean helper 至少处理：

```text
null
undefined
"null"
"undefined"
空白字符串
```

这些都应归一为 `''` 或结构化 `null`，Renderer 不得把它们当真实业务文本。

## 31. `updateItem` 的 `extra.id` 必须全局唯一
推荐 `<app>-<page>-<module>-<entityId>`。

## 32. 普通二级详情页避免沉浸标题栏叠加（Reader 例外）
普通详情页优先 `hiker://page/<path>?rule=&simple=true`，保证系统标题栏与正文不叠加。

**漫画/图片章节阅读页不套用普通详情模板。** Reader 要求真正全屏时，必须使用经过目标海阔版本实机验证的独立全屏阅读容器/页面合同，见 41O；不能因为普通详情页默认 `simple=true` 就永久牺牲 Reader 顶部阅读区域。

## 33. `x5_webview_single` 不做普通 UI
用于登录/验证码/必须网页能力；普通列表/详情优先原生组件。

## 34. 正式图标不要依赖 data-URI/第三方 favicon 作为唯一资源
重要程序使用仓库静态 assets + fallback。

## 35. 第三方 Favicon API 只做发现器
确认图标后固化到项目 assets。

## 36. 不用大量 `blank_block` 垫高级感
优先信息层级、line/line_blank 和天然间距。

## 37. Emoji 不承担正式主图标体系
不同系统字体/尺寸/颜色不一致。

## 38. 不把所有筛选/设置常驻首屏
一级栏目常驻；低频条件折叠/后置。

## 39. 技术字段不能抢主视觉
build/schema/cache key/Manager 放设置/诊断。

## 40. Primary Action 与次操作不能同权
播放/阅读/导入/打开必须比复制/诊断/清缓存更突出。

## 40A. 播放主操作区域禁止混入无关详情动作
黄豆短剧 Test2 实机确认：详情页将“立即播放”和自定义“收藏”并列放在播放主区域后，进入海阔播放器时详情结果仍会出现在播放器下方/周边，视觉上形成多余“播放列表/操作面板”。

固定规则：
- 视频/音频详情页的 Primary Play 区只放**播放/继续播放/真正的线路或画质选择**。
- 收藏、设置、诊断、复制、官网等低频详情动作不得与 Primary Play 同层抢视觉；默认下沉到详情后部、更多菜单或独立“我的”。
- 海阔系统标题栏已经提供收藏能力时，不重复制造一个同权自定义收藏按钮污染播放器首屏；确实需要本地收藏时必须明确标注并降级显示。
- 播放页截图一旦出现“媒体播放器 + 无关详情控件挤在首屏”，按 UI 回归处理，不接受“功能都能点”作为完成标准。

## 41. UI 大改没有实机截图闭环不得称完成
Test → 实机截图 → 看层级/密度/比例/长文本/空状态 → 只改 UI → 再验收。

## 41A. 页面关键实体参数不能只依赖 `extra`
关键 ID 放 URL query，详情同时读 `MY_PARAMS + getParam()`；有 ID 无 seed 时按 Provider 恢复。

## 41A-2. `hiker://page` 查询参数不能假设 `getParam()` 一定已完成 URLDecode
夜社短剧 Test1 实机事故：页面跳转时正确使用 `encodeURIComponent('AI短剧')`，但目标页 `getParam('yeshe_category_name')` 实际得到 `AI%E7%9F%AD%E5%89%A7`，页面标题直接显示百分号编码；同样被编码的分类 URL 也无法进入网络层。

固定规则：
- 重要业务参数如果通过 `hiker://page/...?...=${encodeURIComponent(value)}` 传递，目标页必须把“参数是否已解码”视为**宿主版本相关行为**，不能假设 `getParam()` 永远返回原文。
- 当前已验证的稳妥恢复方式：从 `MY_URL` 中按业务命名空间键读取原始 query value，再显式 `decodeURIComponent()`；失败时保留原值。
- 标题、分类名、搜索词、entityId、真实 HTTP URL 都要使用同一 Param Adapter，不允许部分用 `getParam`、部分手工 decode，避免双重编码/解码不一致。
- UI 如果出现 `%E4%... / https%3A%2F%2F...`，优先查跨页参数合同，不要先去改 Provider/DOM Parser。
- 修复后至少回归：中文标题、带 `?&=` 的完整业务 URL、搜索关键词，以及返回栈。

## 41B. 动态分类不能原样暴露服务端所有 Station/Category
推荐：CategoryExtractor → CategoryModel → UserFacing CatalogAdapter → State → Renderer。

## 41C. 对“应当有内容”的 Feed，空数组不一定是成功
不立即写长缓存；先有限 fallback/参数兼容；最终才产品化空状态。

## 41D. 不要猜 `$().select(...)` 构造参数重载
固定选择优先明确 `select://{...}`；简单输入使用 `input://`；参数签名必须当前文档/实机确认。

## 41E. 同一选中态不要叠多个视觉信号
有 active icon/color 时不再在标题叠 `●`。

## 41F. 密集列表不要默认“主卡 + 独立标签行”
辅助标签优先并入主卡 desc，避免抬高列表/产生多余 `>`。

## 41G. 改文案/删按钮不等于 UI 结构升级
UI 大版本要比较旧/新骨架与组件族。

## 41H. 只重排首页、其他核心页沿旧语法，整体仍会被判断“没变化”
首页、分类、搜索、详情/版本中心、设置应跨页一致。

## 41I. data-SVG、空 SVG、行首空格不能按浏览器想当然
关键数字/状态优先原生文本；透明 SVG 可能破图；连续空格不承担分隔职责。

## 41J. 横向溢出取决于真实标题宽度，不取决于项目数
带数量/状态/长中文时优先等宽可换行组件，不盲用 scroll_button。

## 41K. 普通列表底栏不会自动固定
固定导航必须有真实固定外壳/独立滚动容器；网页桥与原生 lazyRule 输入契约分别验证。

## 41L. 选集网格只允许真实可操作的剧集实体
黄豆短剧 Test2 将“正序”作为 `text_4` 与第1集、第2集并排，导致控制项伪装成剧集卡。

固定规则：
- `text_3/text_4/text_5` 选集网格内每一格必须对应真实 episode/chapter/entity。
- 正序/倒序、分组范围、筛选、清空、刷新等控制项放选集标题行、独立 toolbar/flex 区或设置页，不能占用真实集数位置。
- UI 模型应保持 `EpisodeModel[]` 与 `EpisodeControls` 分离，Renderer 不靠“第一个特殊按钮”混排控制状态。

## 41M. 同一分类/筛选页面内切换标签禁止不断 `hiker://page` 压新页面栈
这是多个小程序反复出现的高频体验事故：用户只是在“电影→电视剧→动漫”“地区/年份/排序”等同一信息架构内切换条件，却每点一次都新开页面，最后回主页需要连续返回很多次。

固定规则：
- **同一页面内的分类、筛选、排序、Tab、频道切换属于 State Change，不属于 Navigation。**
- 默认使用 namespaced `putMyVar/setItem` 保存状态，然后 `refreshPage(false)`、`updateItem()`、`deleteItemByCls()+addItemAfter()` 等在当前页面重渲染。
- 只有进入真实新实体/新任务边界（影片详情、人物详情、独立榜单详情、设置等）才允许 push 新 `hiker://page`。
- 不允许把每个分类值拼成一个新的 `hiker://page/<same-page>?type=...` 来实现“看起来像 Tab”的交互。
- 若业务确实必须通过 URL 恢复筛选状态，URL 只做可恢复事实源；当前 Tab 点击仍优先在同一 PageContext 内更新，不制造重复历史栈。

强制验收：
```text
进入分类页
→ 连续切换至少 5 次分类/地区/排序
→ 按返回 1 次
→ 必须直接回到分类页的真实父页面，而不是逐层退回 5 个历史筛选状态
```

## 41N. 播放器的播放列表/选集数据源必须是纯媒体实体，禁止混入收藏、评论、设置等操作项
黄豆短剧、ACFun 等已经多次出现：详情页把“播放 / 收藏 / 评论 / 设置”做成同一批可点击结果，进入播放器后这些非媒体项被带进播放器列表，形成“播放页面列表里出现收藏”等明显污染。

固定规则：
- 传给播放器/播放列表的数据只允许来自 `EpisodeModel[] / MediaRoute[] / QualityTrack[]` 等真实媒体实体。
- 收藏、评论、设置、诊断、复制、官网、分享、演员/简介等都是 **DetailAction / Metadata**，不得进入 Player Queue / Episode List。
- 详情页可以展示收藏/评论，但必须与播放输出合同分离；点击播放时只返回媒体 URL 或结构化 PlayModel，不返回整页 UI Item 数组。
- 多线路只包含真实可切换线路/画质；排序、收藏、刷新等控制项也不能伪装成线路。
- 系统标题栏已有收藏时，默认不再在播放器相关区域重复收藏入口。

强制验收：
```text
打开任意视频详情 → 进入播放器 → 展开播放列表/选集/线路
只允许看到真实剧集、媒体线路或画质
不得出现：收藏 / 评论 / 设置 / 简介 / 诊断 / 官网 / 分享等非媒体项
```

## 41O. 漫画/图片章节 Reader 必须使用独立“全屏阅读合同”，禁止复用普通二级详情壳导致顶部永久被占
这是漫画程序反复出现的体验事故：章节已经进入阅读，但顶部仍保留普通系统标题栏、详情页占位、空白 spacer 或错误沉浸布局，导致漫画无法真正全屏，首屏被永久吃掉一块区域。

固定规则：
- `Book/Comic Detail` 与 `Chapter Reader` 必须是两个页面合同；Reader 不是普通详情列表。
- 普通详情继续遵守第 32 条，优先 `simple=true` 防止标题栏叠加；**Reader 是明确例外**，必须使用目标海阔版本已经实机验证的全屏阅读页面/容器方案。
- Reader 的持久内容区域不得人为预留普通标题栏高度，不使用 `blank_block/top.png/空图片` 等方式垫顶部。
- 如果采用 `immersiveTheme` 或其它沉浸能力，必须以当前海阔实机证明“无标题叠加、无顶部保留、滑动/返回正常”为准；不能仅凭代码或旧样本认为一定正确。
- 阅读工具栏、章节名、亮度/翻页等控制如果需要，应设计为可隐藏 Overlay；隐藏后漫画内容必须恢复完整阅读区域。
- Reader 的第一张图/第一屏内容应从可用阅读区域顶部开始，不因系统标题/页面壳永久下移。

强制验收：
```text
打开漫画章节
→ 隐藏阅读控制层
→ 截图确认顶部没有永久标题栏/空白占位侵占正文
→ 连续上下滑/翻页正常
→ 返回一次直接回漫画详情/目录
```

---

# P1：Protocol / Crypto / Auth

## 42. 页面层禁止直接承担 Token/签名/解密
放 Protocol/API Client/ImageAdapter/PlaybackAdapter。

## 43. 有结构化 API 时不要优先扫描 HTML
HTML 更慢、更脆；仅必要兜底。

## 44. 协议/解密结论必须写目标 CHANGELOG
包括签名、AES/XOR/Base64/RC4、自定义解码、Key/IV 来源、图片/播放链。

## 45. 已证伪方案也要记录“不要再用”
避免未来重复踩坑。

## 46. 不要每请求/每张图重复 `eval(getCryptoJS())`
优先内置 Crypto → crypto-java → 单例 CryptoJS → 必要 Java Cipher。

## 47. “看起来像 AES”不是依据
必须确认 mode/padding/key/iv/输入编码/处理范围。

## 48. DEX/SO/loadJavaClass 不作为普通项目默认依赖
只有普通 JS 无法满足明确需求时考虑。

## 49. Token 刷新必须有生命周期模型
读取 → 提前判断过期 → refresh → 刷新失败再登录。

## 50. 异步任务轮询必须有上限
创建 → 轮询 → 超时/失败 → 可重试；禁止无限循环。

---

# P1：图片 / InputStream / 解密

## 51. 图片 `@js=` / `$().image()` 遵守 InputStream 契约
输入是 InputStream，返回也必须可继续读取。

## 52. 图片 `@js=` 放在 Header/Cookie/Referer 标识之后
顺序错误可能让请求/解密失效。

## 53. 自己 `fetch(...,{inputStream:true})` 的流要关闭
但不要提前关闭即将返回给图片加载器的流。

## 54. 先识别明文再解密
JPEG/PNG/GIF/WebP 已正常就直接返回。

## 55. Renderer 不负责图片解密
Renderer 只调用 ImageAdapter。

## 56. 重复封面不要每次重新下载+解密
按 URL + codec schema 缓存。

## 57. 首页不要无脑拉原图
首页 thumbnail；详情高分；Reader 原图。

## 57A. 图片噪声正则禁止用裸 `ad(s)?\\b` 扫完整 URL
夜社短剧 Test2 fixture 发现：`/upload/2026/a.jpg` 中单词 `upload` 以 `ad` 结尾，后面紧跟 `/`，因此裸正则 `ads?\\b` 会把正常上传目录误判为广告路径，导致封面被过滤，进一步让整张内容卡消失。

固定规则：
- 广告过滤必须匹配明确路径段/域名，例如 `/(ad|ads)/`、`adserver`、已知广告 host；不要对整条 URL 搜索裸 `ad\\b`。
- 新增图片过滤正则时必须至少用 `/upload/`、`/download/`、`/avatar/`、真实广告 URL 做正反 fixture。
- “列表 HTML 有内容但所有卡片都没封面/全被过滤”时，除了查 DOM Parser，也要查 Image Noise Filter 是否误杀。

## 57B. 多内容站详情页禁止无条件跑全部 Parser
夜社短剧 Test4 实机出现：视频详情既有选集，又出现整页长文本和“正文图片 114 张”。根因是 Provider 在不知道内容类型的情况下同时运行 Episode / Article / Gallery / Related。

固定规则：
- Video / Comic / Photo / Novel 详情 Adapter 分离。
- 列表已知 kind 时，详情必须沿用，不再二次猜类型。
- 只有 unknown 才允许有限自动判型，而且最终只能进入一个主 Adapter。
- 视频详情如果出现几十/上百张“正文图片”，优先判定为 Parser 串型，不要先去修图片加载。
- 漫画/写真详情出现播放线路、小说详情出现图库，同样按跨类型污染处理。

## 57C. 选集标题不能直接信任“下一集/剧情解析”等 Anchor 文本
如果 href 已含稳定的 contentId / line / episode，EpisodeModel 必须从 URL 结构生成编号并按主键去重。

典型错误：
- 第1集被页面文案显示成“剧情解析无H”。
- 第2集先被“下一集”链接命中，真正的“第2集”按钮因 href 去重被丢弃。
- 相关推荐误混进同一个选集。

固定规则：
- 先按 href 结构验证同一 contentId。
- 去重键使用 `contentId|line|episode`，不是完整 Anchor 文本。
- UI 标题优先生成 `第N集`；Anchor 文本只作为无结构编号时的最后 fallback。

## 58. 图片失败分阶段诊断
至少 URL_FIELD_EMPTY / REQUEST_FAIL / HEADER_FAIL / UNKNOWN_FORMAT / DECRYPT_FAIL / STREAM_FAIL / CACHE_FAIL。

---

# P1：播放 / 免嗅 / HLS

## 59. “能播”不等于“免嗅”
准确记录 direct/API/source/decode/proxy/parser/sniff 路线。

## 60. 有直链/播放 API 时不要先网页嗅探

```text
directUrl
→ 官方 Play API
→ fetch 解析 player/source
→ 已知协议解码/解密
→ 必要 HLS 修正/Proxy
→ fetchCodeByWebView
→ 可信委托解析器
→ video://
→ webRule://
→ x5Rule://
→ 原网页播放器
```

## 61. `fetchCodeByWebView` 与网页资源嗅探要区分
它可以只是 JS 渲染后读取结构化 DOM/源码。

## 62. 通免/魔断/lazyParse/第三方解析器不能只看函数名判断“真免嗅”
记录来源、输入输出、外部依赖、fallback。

## 63. 新项目网页嗅探不默认优先 X5
优先 webRule，x5Rule 作为兼容路径，最终看实机。

## 64. `video://` include/exclude 要精确
避免广告 MP4/预览片误识别。

## 65. 不对所有 HLS 无脑 `cacheM3u8()`
仅协议需要时启用。

## 66. `startProxyServer` 不是普通视频默认步骤
只用于动态改写 M3U8/Key/segment/Header/响应内容等真实需求。

## 67. M3U8 广告清理/PNG 分片转换按协议启用
不是固定步骤。

## 68. 不对所有播放 URL 无脑 `#noPre#`
只有协议证明确实需要才禁用预加载。

## 69. 多线路 `headers` 与 `urls` 按索引一一对应
不同线路不能错 Referer/UA/Cookie。

## 69A. 单线路媒体不要为了“结构统一”滥用多线路 PlayModel
黄豆短剧 Test2 只有一个已验证 Token HLS，却包装成 `{urls:[...], names:[...], headers:[...]}`；实机播放器表现与 Stable 直接 HLS 不同，并增加了不必要的播放器 UI/兼容不确定性。

固定规则：
- 只有一条真实媒体线路且 Stable/协议事实证明直链可播时，优先直接返回媒体 URL（按协议附 `#isVideo=true#`、Header 或必要标识）。
- `urls/names/headers` 多线路模型只在**确实存在至少两条用户可切换线路/画质**时使用。
- 为了代码“统一”把单线路强行包装成多线路，不属于架构收益；如果改变播放器 UI/行为就是回归风险。
- 已验证直链合同的程序，重写播放时默认先保持输出合同不变，再独立验证是否值得升级为多线路模型。

## 69B. 页面 `locked/free` 标记不是播放 API 的最终授权事实
黄豆短剧 Test2 仅凭详情 DOM 的 `data-ep-free/is-locked` 就把后续剧集直接改成网页 fallback，导致本可继续尝试的 Token 播放链被提前截断。

固定规则：
- `locked / isVip / free=0 / pay` 等页面标记只用于 UI 提示，除非协议已实机证明它与播放授权完全一致。
- 存在已验证 Play API / Token API 时，用户点击剧集后应优先让真实 API 返回授权结果；API/Token 响应才决定是否可直播放。
- 不允许“DOM 看起来锁定 → 不请求播放 API → 直接网页/报错”这种提前判定。
- Token/API 真拒绝时再显示权限/登录/购买提示，并在诊断中记录 AUTH/TOKEN_FAIL。

## 69C. `webRule://` 不是普通 HTTP 网页地址的通用前缀
黄豆短剧 Test2 直接拼 `webRule://https://...`，实机提示“规则有误”。

固定规则：
- 只是打开官网/登录/购买页面时直接返回正常 `http://` / `https://` URL。
- `webRule://` 只在已确认当前海阔语法、参数合同和嗅探规则确实需要时使用；不能把它当成“浏览器打开”前缀。
- fallback 也必须实机验证；一个未经验证的 fallback 不能替代明确失败提示。

## 70. 字幕/弹幕不无谓阻塞首次播放
先拿可播 URL，再按需补充。

## 71. 播放失败分层诊断
NO_SOURCE / AUTH_FAIL / SOURCE_PARSE / DECODE_FAIL / EXPIRED / HEADER_FAIL / HLS_FAIL / PARSER_FAIL / SNIFF_FAIL / PLAYER_FAIL。

## 72. `x5Play://` 等是“怎么交给播放器”，不是“怎么拿真实媒体地址”
两层不要混写。

---

# P1：模板 / 写源工具

## 73. 自动模板匹配器优先 Dev/Test
站点确认后 Stable 锁定具体 Parser/Adapter。

## 74. 自动模板失败必须可诊断
记录 HTML 特征、候选 Parser、失败阶段、fallback。

## 75. 动态分类不要把 DOM 规则/状态/Renderer 写成一坨
推荐 Extractor → Model → State → Renderer。

## 76. Rule Generator 与 Runtime 分离
开发工具不要全量打包进普通内容程序。

---

# P1：性能、缓存与资源预算

## 77. 首屏不等待评论、推荐、完整作者资料、弹幕等附加能力
核心详情先显示，P2/P3 后补。

## 78. 大目录禁止一次渲染几千项
分卷/分页/范围选择/动态加载。

## 79. 网络失败优先 stale cache
有有效旧数据时优先旧数据 + 状态提示。

## 80. 缩略图/详情图/阅读原图不能同一资源预算
不同页面不同分辨率与缓存生命周期。

## 80A. 列表缺 metadata 时禁止首屏串行 N+1 详情请求
Hanime1 Test39 为了补齐片单真实标题，在“我的”片单列表缺 title 时逐个请求多个 `/playlist?list=<id>` 详情；与 profile 重入叠加后，打开“我的”会长时间卡住。

默认策略：

```text
一次主列表请求
→ 同响应 DOM/raw block 尽量补 metadata
→ stale/fresh cache
→ 仍缺字段：显示明确“待补全”状态
→ 用户显式点补全 / 后台低优先级补全 / 有界并发
```

禁止：

```text
首屏发现 N 个实体缺标题
→ for 循环同步请求 N 个详情
→ 全部结束后才 setResult
```

即便每个请求都只有 1–2 秒，N+1 串行也会把普通页面变成十几秒甚至几十秒的“假死”。

---

# P0/P1：自用 / Local / 分享 / 隐私

## 81. 分享/Local 版禁止泄漏私人 GitHub/基础设施
清除用户名、repo、Raw、Token/Cookie/API Key/私人服务地址。

## 82. 分享纯本地版不带 Remote Manager/latest
完整业务代码内置。

## 83. 本地救援壳不等于纯本地分享版
入口本地、业务远程仍是远程版。

## 84. 禁止整个规则 JSON 无脑全局替换违禁词
UI、URL、Header、JSON key、签名字段分别处理。

---

# P1：Diagnostics / Guard / 实机验收

## 85. 错误页不能只显示“读取失败”
至少可定位版本、Provider、请求阶段、Header 模板、缓存、Codec、Playback route、fallback chain、脱敏错误。

## 86. Diagnostics 默认不主动联网、不输出秘密
优先本地状态和当前请求已知结果。

## 87. Release Guard 通过不等于可直接 Stable
Guard 不能替代海阔实机 JS、布局、登录、风控、图片和播放协议。

## 88. UI/图片/播放必须有对应实机证据
UI 看截图；图片看明文/密文/Header/cache；播放看冷启动/二次播放/画质/Header/过期/fallback。

---

# P1：样本二次复盘新增防回归规则

## 89. 实体相关临时媒体/缓存文件禁止使用全局固定文件名
新片场、网飞猫样本都存在固定 `danmu.json/danmu.xml` 一类写法。单页演示可能能跑，但多视频、多标签页、并发播放或快速切换时会互相覆盖。

固定规则：

```text
错误：hiker://files/cache/danmu.json
错误：hiker://files/cache/danmu.xml

正确：<app>/<provider>/<entityId>/<episodeId>/<schema>.json
或等价命名空间化 cache key
```

适用范围不只弹幕，还包括字幕、临时 m3u8、图片解密文件、详情 JSON、播放许可等实体级数据。

## 90. 年份、月份、日期等“当前时间默认值”禁止硬编码历史常量
网飞猫样本在 2026 年仍有默认上映年份 `2025`，说明成熟旧样本也会留下时间债务。

固定规则：

- “今年 / 本月 / 今日 / 最近 N 天”必须从当前时间动态计算。
- 只有协议明确要求历史固定值时才写常量，并在 CHANGELOG 说明原因。
- 缓存 key 如果包含年月日，也必须确认时区和刷新边界。
- UI 截图里看到的某一年份不能直接复制成程序默认值。

## 91. `catch` 后无条件跳网页属于诊断反模式
旧样本常见：结构化 API/播放链任何一步异常后直接 `web://原页`。这会让请求失败、解密失败、弹幕失败、播放器失败全部表现成同一个 fallback，长期无法定位根因。

固定规则：

```text
try structured route
→ 记录 stage / status / sanitized error
→ 判断该 stage 是否允许 fallback
→ 再进入 parser/sniff/web
```

弹幕、评论、推荐等 P2/P3 附加能力失败不得把主视频/正文一起送去网页 fallback。

## 92. `setLastChapterRule` / 最新集规则不得依赖当前详情页已经解析出的临时数组
收藏页、历史页或系统独立触发最新章节时，当前详情页可能根本没有打开。

固定规则：

```text
entityId 可恢复
→ 独立 Provider.latest(entityId)
→ setResult(latestText)
```

禁止捕获当前页面 `episodes[]/chapters[]`、局部变量、临时 DOM 结果作为唯一数据源。latest 请求应轻量并允许短缓存。

## 93. 多个 Stable 共享同一 Runtime/SDK 时必须版本隔离，禁止共享不可回退黑盒
瓜子影视与一起刷的可见 Shell 几乎相同，说明共享框架本身是合理模式；风险在于如果多个产品同时依赖同一个不可审计 PrivateJS/远程 Core，一次改动可能同时击穿多个 Stable。

固定规则：

- 共享 SDK 必须显式导出契约、版本化、已发布版本只读。
- 每个 App 的 active release 明确绑定兼容 SDK 版本。
- SDK 升版逐 App Test，不“改公共文件后默认全部兼容”。
- PrivateJS/DEX/Native 黑盒不得作为普通自研小程序的默认共享 Runtime。

## 94. 动态域名/Endpoint Discovery 禁止每次首屏全量探活
有 last-good endpoint 时优先使用；只做低频/失败触发的健康检查。域名发现、DoH/TXT、配置解密、候选探活属于恢复链，不应成为每次打开页面的固定启动税。

推荐：

```text
fresh last-good
→ 快速请求
→ 失败时有限探活
→ discovery
→ stale last-good / diagnostic
```

探活必须有短超时、候选上限和停止条件。

---

# 发布前硬检查

## 上下文/版本
- [ ] 已读三份主文档 + 迁移文档（适用时）+ 目标 CHANGELOG + 当前元数据/源码。
- [ ] 已确认用户实机当前通道/版本。
- [ ] Stable release 未原地覆盖。
- [ ] 新版使用新 version/build/cache key。
- [ ] 壳 version <= 2147483647。

## JS/发布工件
- [ ] 本次新增/修改 JS 已执行 `tools/js_syntax_guard.py` 或 `node --check`。
- [ ] Remote Core/Runtime/Bootstrap 若依赖 `eval` 产生的符号，已执行真实入口的作用域 smoke test，不能只做语法检查。
- [ ] 序列化 lazyRule/rule 的关键点击动作已做 action smoke test，确认点击时仍加载当前 Release，而不是只 eval 历史 Core。
- [ ] Recovery loader / Bootstrap 同样通过语法检查。
- [ ] release JSON 可解析，模块真实存在。
- [ ] Cloud Repo advertised build 与 installer/Bootstrap 基线一致。
- [ ] broken Test/Candidate 不在新 recovery chain 中。

## 架构/数据
- [ ] Request/Protocol/Provider/Adapter/UI 边界清楚。
- [ ] Provider 私有状态隔离。
- [ ] 缓存 schema 可失效。
- [ ] 未启用 Provider 不初始化。
- [ ] Token/异步轮询有边界。
- [ ] Auth/Profile/Session Resolver 调用图无回边；存在 browser fallback 时有 re-entry guard。
- [ ] 只取得 raw identifier 时未制造用户可见伪业务卡片。
- [ ] HTML/DOM Adapter 已过滤字符串 `null/undefined`，不会直接进入 Renderer。
- [ ] 当前年/月/日等默认值来自运行时，不是过期硬编码常量。
- [ ] 实体级临时缓存/弹幕/字幕文件使用 entity-scoped key/path，不共用固定文件名。
- [ ] 共享 SDK/Runtime 有版本隔离和逐 App 兼容验证。

## UI
- [ ] 一眼看懂主任务。
- [ ] Primary Action 明显。
- [ ] 首页没有被技术信息/设置/筛选淹没。
- [ ] 卡片比例、图标、长文本、空状态可用。
- [ ] 无大量无意义 blank_block。
- [ ] 关键跨页 entityId 不只依赖 extra。
- [ ] 同一选中态没有重复强调。
- [ ] **同一分类/筛选页连续切换至少 5 次后，返回 1 次即可回真实父页面；没有用新页面堆栈模拟 Tab。**
- [ ] 播放主操作区没有收藏/设置/诊断等无关动作与 Primary Play 同权。
- [ ] **播放器展开播放列表/选集/线路后，只包含真实媒体实体，不出现收藏/评论/设置/简介/诊断/官网/分享。**
- [ ] 选集网格只包含真实剧集/章节，不混正倒序/分组/筛选控制。
- [ ] **漫画/图片章节 Reader 已实机全屏验收：隐藏控制层后顶部无永久标题栏/空白占位侵占正文。**
- [ ] 所有 `col_type:'input'` 的 URL 都是合法可求值表达式，未使用顶层裸 `return`。
- [ ] UI 大改完成实机截图闭环。

## 性能
- [ ] 普通详情/设置/评论页不会为了完整账号头像/昵称隐式联网。
- [ ] 首屏没有“列表 N 个实体 → 串行请求 N 个详情补 metadata”的 N+1 链。
- [ ] 可复用账号/列表数据有短缓存或 stale cache，切页不会重复拉相同数据。
- [ ] 动态域名/Endpoint 已优先 last-good，不在每次首屏全量探活。

## 图片
- [ ] Header 正确。
- [ ] 明文不会误解密。
- [ ] 密文可实际解密。
- [ ] InputStream 生命周期正确。
- [ ] 缓存/缩略图策略明确。

## 播放/阅读
- [ ] 已优先结构化免嗅。
- [ ] 当前 route 准确记录。
- [ ] 冷启动与二次播放正常。
- [ ] 单线路没有无必要包装成多线路 PlayModel。
- [ ] 多线路 urls/names/headers 对齐。
- [ ] 页面 locked/free 标记没有替代真实播放 API 授权结果。
- [ ] webRule/x5Rule fallback 已按真实语法实机验证，不是给普通 URL 乱加前缀。
- [ ] HLS/Proxy/预加载按协议启用。
- [ ] 字幕/弹幕不阻塞首次播放。
- [ ] fallback 前已记录失败 stage，不用 catch-all 网页跳转吞掉诊断。
- [ ] 连载内容的 latest chapter/episode 规则可脱离当前详情页独立恢复实体并请求。
- [ ] **Player Queue / Episode List 与 DetailAction/Metadata 已分离。**
- [ ] **漫画/图片 Reader 使用独立全屏合同，而不是普通详情壳；进入章节后返回一次回目录/详情。**
- [ ] 失败可分层定位。

## 发布/恢复
- [ ] Guard 通过。
- [ ] Candidate/Test 核心路径实机通过。
- [ ] 若当前 Test 多域回归，下一版已从最后实机可用基线恢复，而不是继续继承坏 Test。
- [ ] 网络失败缓存/备用通道符合设计。
- [ ] Local/分享版隐私扫描通过。
- [ ] 更新/回退闭环通过。
- [ ] 自举工具 Recovery 可用。
- [ ] CHANGELOG 已记录本版技术事实。
- [ ] 新通用坑/方法已同步文档。
- [ ] stable/latest 最后切。

---

# 真实事故与永久教训索引

## 2026-08-20：规则仓库连续事故
- 单 API + 短缓存 + 无 stale → 关键索引必须主备 + stale + 诊断。
- 壳 version 整数溢出 → 使用安全 10 位。
- 重新导入仍跑旧 Core → Remote state 与 Shell 是两层。
- 坏版本叠补丁 → 严重故障冻结旧版，新建隔离 release。
- 自举仓库坏后无法自救 → 必须仓库外 Recovery。

## 2026-08-21：UI / Provider / Remote 事故
- 关键 ID 只放 extra → 详情丢 entityId；URL query + Provider 恢复双保险。
- 动态分类原样暴露内部频道 → 引入 UserFacing CatalogAdapter。
- 正常 Feed 空数组直接缓存 → 有限 fallback 后再进入空状态。
- 猜 `$().select` 重载 → 固定选择优先 `select://`。
- active icon + `●` 重复强调 → 一个状态只保留一个视觉信号。
- chips 抬高列表/产生 `>` → 辅助标签并入 desc。
- data-SVG/透明 SVG/横向组件按浏览器想当然 → 关键图标固化 assets，并以实机宽度选组件。
- 普通结果项“最后 push”不等于固定底栏 → 固定导航必须真实隔离滚动容器。
- ACFun metadata 升版但 Cloud Shell 仍旧 → Remote Release 与安装工件必须成套闭环。

## 2026-08-22：Hanime1 连续发布事故
- Test22/23 GitHub 已有头像补丁但手机未真正进入 Release → 先验证 Runtime build，不再盲改业务。
- Test26 Cloud Repo 广告 20026、Bootstrap 默认 20024 → 新增 remote_installer_guard。
- Test27 JS 少一个右括号，启动即 SyntaxError → 新增 `tools/js_syntax_guard.py`；坏 Release 隔离，后续从最后可启动基线重建。
- Test34 同时重写评论、账号、筛选、搜索后多域回归：主评论 0、裸 list ID 假片单、片单详情 0、搜索仍 JSEngine#13、筛选实机与源码不一致 → **坏 Test 不再作为 recovery base，回到最后设备验证基线并分模块重建。**
- Test34 raw href fallback 把 `playlist?list=<id>` 直接渲染为“片单<id>” → **raw identifier 不是业务实体；没有真实 title/wrapper 就不能建用户卡。**
- Test34 源码已删除 `>` 但手机仍显示 → **源码覆盖声明不是运行事实；截图冲突时优先查 Remote state/cache/load order。**
- Test38 更多回复已经恢复到正确数量，但所有字段显示 `null` → **不能全局配对相同 class；必须按上游父子 DOM 分组，并统一过滤 `null/undefined`。**
- Test38 搜索继续 JSEngine#13 → **`col_type:'input'` 的 url 是表达式求值环境，不得照 lazyRule 函数体写顶层裸 `return`；使用简单表达式或 IIFE。**
- Test39 搜索已恢复，但详情/我的/设置长时间加载 → **Profile/Auth Resolver 出现 P.profile→sessionProfile→activeAccount→browserProfile→P.profile 重入环；通用 getter 必须 cache-only + re-entry guard，账号完整资料改显式同步。**
- Test39 我的片单为了补标题串行打开多个详情 → **列表 metadata 不完整不能在首屏做 N+1 同步请求；默认单请求解析 + cache，慢补全显式触发。**

## 2026-08-22：黄豆短剧 1.9 播放/详情连续事故
- Test1 用 `hiker://page?...&url=...` 传业务详情地址，触发 ArticleListModel URL scheme 异常 → **业务跨页参数禁止占用通用 `url`，使用应用命名空间参数并做 MY_PARAMS/getParam/URL 恢复。**
- Test2 只有单条 Token HLS 却强行包装 PlayModel，播放器 UI 与 Stable 行为发生变化 → **单线路保持直接媒体合同，多线路模型只给真正可切线路。**
- Test2 将自定义收藏与“立即播放”同层，进入播放器后形成无关操作面板 → **Primary Play 区只保留媒体任务，收藏/设置/诊断下沉。**
- Test2 将“正序”混入 `text_4` 选集网格 → **选集网格只放真实剧集，排序/分组控制与 EpisodeModel 分离。**
- Test2 仅凭 DOM locked 标记直接把后续集送入 `webRule://https://...`，实机提示规则有误 → **真实 Play/Token API 决定授权；webRule 不是普通网页前缀，fallback 也必须实机验证。**

## 2026-08-23：JavDB Runtime eval 作用域事故
- Test2 为复用抽出 `loadCore()`，把 `eval(Core)` 与最终 `JDB.home()` 调用拆到两个函数作用域；静态语法检查全部通过，但实机启动直接 `ReferenceError: JDB 未定义`。
- 永久教训：**direct eval 产生的局部 `var/function` 不保证跨 helper 可见；Runtime/Bootstrap/Loader 不能只做 node parse guard，必须增加真实入口作用域 smoke test。**
- 修复策略：冻结 Test2，使用新 Test3 Shell/runtime/cache key；恢复同作用域 `eval(Core) → eval(Patch) → call`，不原地覆盖失败 URL。

## 2026-08-23：ACFun lazyRule 重新 eval Core 导致播放补丁失效
- Alpha12 页面加载时已经进入最新 Release，但旧视频详情播放按钮在点击时仅 `eval(core v018)` 再调用 `ac.play`，把 Alpha12 后置 Runtime 覆盖掉；因此源码看似连续修复，实机实际一直执行旧播放逻辑。
- 永久教训：**关键 lazyRule 不能只恢复基础 Core；必须重新进入当前 Bootstrap/活动 Release，或显式恢复完整导出。启动成功不等于点击动作运行在当前 Runtime。**
- 同一详情页把“播放 / 收藏 / 评论”作为同级可点击结果，进入播放器后形成无关播放列表；再次验证 Primary Play 区必须只包含真实媒体任务。

## 2026-08-25：成熟样本二次复盘暴露的高概率工程债务
- 新片场/网飞猫固定 `danmu.json/xml` → **实体级临时数据必须命名空间化，避免多实体互相覆盖。**
- 网飞猫默认年份仍写死 2025 → **当前年/月/日默认值必须运行时生成。**
- 旧样本播放异常后无条件跳网页 → **fallback 前先记录失败 stage，P2/P3 失败不得拖垮主播放链。**
- latest chapter 能力如果依赖当前详情临时数组 → **收藏/历史独立触发会失效，必须只凭 entityId 重新取 Provider。**
- 瓜子/一起刷共享不可读 Runtime → **共享框架思路可取，但自研 SDK 必须显式、版本化、逐 App 验证，不能形成跨 Stable 单点故障。**

## 2026-08-25：三项反复出现的 UI / 播放 / 漫画阅读事故升级为强制回归项
- 分类、地区、年份、排序等标签切换反复通过新 `hiker://page` 实现 → 用户切几次就产生几层历史栈，回主页必须连续返回 → **同页筛选属于 State Change，不属于 Navigation；连续切换 5 次后必须只需返回 1 次离开分类页。**
- 黄豆短剧、ACFun 等多次出现播放器列表混入“收藏/评论/设置”等非媒体项 → **Player Queue / Episode List 只接受真实媒体实体，DetailAction 与播放输出合同强制分离。**
- 漫画章节多次出现顶部系统栏/详情壳/空白占位永久侵占阅读区域 → **Chapter Reader 使用独立全屏合同；普通详情 `simple=true` 规则不能机械套到 Reader；必须以实机截图证明隐藏控制层后顶部完整可读。**

---

# 文档维护规则
- 新实机 Bug/事故/兼容限制 → 本文档或专项 Incident，并在本文件索引。
- 新通用稳定写法 → GUIDE。
- 长期方向/架构决策 → PLAN。
- 程序专属接口/签名/解密/播放/Bug/回归 → 目标 CHANGELOG。
- 仓库迁移相关 → REPOSITORY_SPLIT_MIGRATION。

同一个坑发生一次，就必须让以后任何新对话都能查到。
## 原生选择器：不要手写 `select://` JSON 协议

2026-08-29 JavDB v3 Test5 实机确认：为了做“搜索记录删除/清空”而自行拼接 `select://{...}` URL，在目标海阔版本中会出现：

`error:返回的值无效 (JSEngine#13)`

以后需要单选/操作菜单时优先使用海阔正式 JS 选择器：

`$(options,1,title).select(function(){ ... })`

约束：

- 不自行猜测或拼接 select:// 内部 JSON 格式。
- select 回调完成修改后必须返回有效海阔 URL，例如 `hiker://empty` 或 `toast://...`。
- `refreshPage(false)` 只是副作用调用，不能把它自身的返回值当 URL 返回。
- 需要删除单条、切换排序、选择线路等低频动作，优先原生 select，而不是再造一整页按钮。
- 实机验证选择器回调；JSEngine 对无效返回值比普通 JS 语法检查更严格。

## API 字段可能从标量升级为对象：禁止直接 `String(object)`

2026-08-29 JavDB v3 Test6 实机确认：资讯接口中的 `author`、`category` 在当前返回中是结构化对象，UI 若直接 `String(value)` 会显示 `[object Object]`。

以后所有远程 API 的展示字段都按动态结构处理：

- 标量：直接显示。
- 数组：逐项提取可读字段后合并。
- 对象：优先读取 `name/title/label/display_name/nickname/username/value/text/slug/id` 等语义字段。
- 找不到预期字段时再递归寻找第一个可读标量，禁止直接把对象转字符串作为 UI。
- 协议 ID、筛选值和业务参数保留原对象/原 ID，不要为了显示而改写协议值。
- 这类问题属于“数据合同漂移”，静态代码检查无法发现，必须以实机返回为准。


### JAV 外链站点：镜像重复与 Cloudflare 临时凭据污染（2026-08-29）

- **禁止把迁移页或镜像域名当成独立 Provider**。例如站点明确迁移到另一 Provider 时，再保留两个按钮只会制造重复线路、错误成功率和维护负担。
- **禁止硬编码 `cf_clearance` 等 Cloudflare 临时 Cookie**。这类值短期有效并与设备/网络环境相关，复制进源码会快速失效，也可能把私有会话状态带进仓库。
- **禁止为一个播放 Provider 强依赖另一个海阔小程序**。优先抽成共享 SDK 的自包含 Adapter；若只能浏览器辅助，应明确作为 fallback，不伪装成直链解析成功。
- **新增 Provider 时不得顺手重写已实机可播 Provider**。新增与维修分开；旧站无失败证据时冻结已验证链，避免一次扩源造成多站同时回归。
- **网页能打开不等于 Player Pipeline 完成**。必须实机确认真实时长、进度推进、HLS 子分片/Key Header 与多线路数组，而不是仅以 HTTP 200 或拿到 `.m3u8` 字符串判定成功。
