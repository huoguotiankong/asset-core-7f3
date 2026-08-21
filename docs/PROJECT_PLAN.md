# 海阔视界程序：长期规划与开发规范

版本：1.8
日期：2026-08-21  
适用范围：本项目后续所有海阔视界 `.hk小程序`、书源/漫画源、云仓库与 GitHub 远程代码开发。

> **文档定位：长期项目总纲 + 新对话恢复入口。** 任何新对话、长对话中断、上下文丢失或隔很久重新维修程序时，先读本文件，再读《海阔小程序编写指南》和《海阔小程序编写注意事项》。如果用户指定了某个小程序，还必须继续读取该程序自己的 `CHANGELOG.md` 与当前真实版本元数据，再开始修改。新的长期决策、可靠方法、真实 Bug 和踩坑结论由 AI 主动维护，不需要用户逐项提醒。

---

## 0. 最高级恢复协议：用户只需要说“先读三份文档”

以后用户在任何新对话中只需要说：

```text
先读 GitHub 仓库里的三份文档，再开发/优化 <某个小程序>
```

这句话自动等价于下面完整动作，不需要用户继续提醒：

1. 读取 `docs/PROJECT_PLAN.md`。
2. 读取 `docs/HIKER_APP_DEVELOPMENT_GUIDE.md`。
3. 读取 `docs/HIKER_APP_DEVELOPMENT_CAUTIONS.md`。
4. 从 `registry.json` 定位目标程序。
5. 读取目标程序 `CHANGELOG.md`。
6. 读取目标程序当前 `stable.json / channels.json / latest.json / test.json / candidate.json` 中实际存在且适用的文件。
7. 读取当前 Stable/目标测试通道对应的 `release.json`、Bootstrap、Shell/入口和本次要修改的实际模块。
8. 如果涉及海阔 API/组件兼容，再查海阔官方开发手册。
9. 确认“当前实际运行版本/通道/模块”后才开始改代码。

**禁止只凭当前聊天记忆、旧聊天摘要、历史版本号或总文档中的示例版本直接开改。**

### 0.1 事实来源优先级

出现信息冲突时按以下顺序处理：

```text
用户当前明确指令
  > 用户实机截图/实机测试结果
  > 当前 stable.json / channels.json / latest.json / release.json / 实际入口源码
  > 目标程序 CHANGELOG.md 中已验证记录
  > registry.json / manifest.json
  > 三份全局文档中的架构与规范
  > 旧聊天记忆/旧摘要/推测
```

说明：

- 三份全局文档负责**长期规则和方法**，不应被当成动态版本数据库。
- 具体“现在是哪个版本、哪个接口、哪个 build”优先从目标程序当前元数据和源码确认。
- 如果发现全局文档、registry、CHANGELOG 与当前事实不一致，完成当前任务时主动修正文档，不等待用户提醒。

---

## 1. 四层长期知识体系

### 1.1 `docs/PROJECT_PLAN.md`

负责：长期方向、产品决策、架构边界、发布形态、恢复协议、事实优先级、工作流。

### 1.2 `docs/HIKER_APP_DEVELOPMENT_GUIDE.md`

负责：海阔官方 API、组件、路由、网络、存储、并发、动态 UI、成熟小程序架构和本项目验证过的通用编写方法。

### 1.3 `docs/HIKER_APP_DEVELOPMENT_CAUTIONS.md`

负责：所有兼容坑、缓存坑、版本/更新坑、UI 坑、Provider/并发/存储坑、导入/违禁词/隐私问题和真实事故教训。

### 1.4 每个程序自己的 `CHANGELOG.md`

负责：**该程序的长期技术记忆**，不能只写“新增了什么功能”。至少持续记录：

- 当前 Stable/Test/Local 基线与入口。
- 数据源、API、域名/动态域名策略。
- 登录、Cookie、Token、鉴权、签名字段和算法。
- 编码、解密、Key/IV 来源、图片解密、媒体解码/播放链。
- Provider/线路/缓存/存储/schema。
- 发生过的 Bug、症状、根因、修复、证伪方案。
- 哪些旧方案明确不能再回退。
- 每版回归结果、已知问题、恢复方式。
- APK/网页/接口复核得到的重要事实。

安全要求：只记录**算法、字段、来源、流程和验证结论**，不得写真实密码、Token、Cookie、私钥或其他敏感凭据。

程序日志模板：`templates/app/CHANGELOG_TEMPLATE.md`。

---

## 2. 自动维护制度：不需要用户提醒写文档

每次开发/维修结束前，AI 必须主动判断是否更新文档。

### 2.1 必须更新目标程序 CHANGELOG 的情况

- 版本/build/Shell/通道变化。
- 新增、删除或改变接口。
- 登录/Token/Cookie/签名变化。
- 新发现编码/解密/图片/播放处理。
- 修复 Bug，尤其是根因明确的 Bug。
- 某个尝试被证实错误或不稳定。
- 缓存/schema/状态 key 变化。
- Provider/Adapter/模块边界变化。
- 实机验证结果改变。
- 新增恢复/回退方式。

### 2.2 更新三份全局文档的条件

- 长期方向/产品规则变化 → `PROJECT_PLAN.md`。
- 新的可复用编写方法 → `HIKER_APP_DEVELOPMENT_GUIDE.md`。
- 新坑、新事故、新禁用项 → `HIKER_APP_DEVELOPMENT_CAUTIONS.md`。

同一事项可以同时更新多个文件。

### 2.3 对用户的反馈方式

文档更新完成后，只需要简要说明：

```text
已更新：
- ACFun CHANGELOG：补充 xxx 接口/解密/bug 结论
- GUIDE：新增 xxx 通用写法
- CAUTIONS：新增 xxx 风险
```

不要求用户先说“把这些写进报告”。

---

## 3. 最高级约定：自用版与分享版严格区分

### 3.1 默认自用远程版

除非用户明确说明“准备分享”，所有小程序默认按自用版开发：

```text
海阔云仓库轻量 Shell
        ↓
GitHub Bootstrap
        ↓
Versioned Remote Module Manager
        ↓
GitHub release 业务模块
        ↓
海阔 require 缓存
```

日常接口修复、UI 优化、Provider 增减原则上只升级 GitHub release，不重复下载/上传完整本地包。

### 3.2 分享纯本地版

用户明确准备分享时，必须另做完整纯本地版本：

- Core / Pages / Provider / Adapter / UI / 解析代码全部内置。
- 不依赖私人 GitHub 远程业务代码。
- 不带 Remote Manager、latest、一键升级、远程回退。
- 可上传海阔云仓库，但程序本身不能暴露或依赖私人 GitHub。
- 无 GitHub 环境仍可完整运行核心功能。

### 3.3 自用版转分享版

保留现有自用远程版，从当前 Stable 派生独立纯本地版；内置业务模块，移除远程更新链，执行隐私扫描和海阔违禁词兼容。

### 3.4 分享版隐私硬要求

必须扫描并移除：

- GitHub 用户名、repo 名、Raw 地址、私人目录结构。
- Token、Cookie、密码、API Key、私钥、测试账号。
- 私人服务器、调试接口和可反推出用户身份的信息。

不是 UI 隐藏就算移除，源码里也不能保留。

---

## 4. GitHub 与海阔云仓库职责

### 4.1 `hiker-cloud`

唯一正式源码 Monorepo，负责：

- 自用远程业务代码。
- Core / Provider / Adapter / Pages / UI。
- 版本化公共库。
- Remote Module Manager / Diagnostics。
- Stable / Candidate / Test / Local 元数据。
- release / latest / channels。
- 每个程序的 `CHANGELOG.md`。
- 模板、Guard、CI、长期文档。
- 历史 release、实验版本、recovery 入口。

### 4.2 海阔云仓库

主要承担安装中心职责：

- 自用版：轻量远程 Shell。
- 分享版：完整纯本地程序。
- 展示名称、版本、图标、分类和安装入口。

普通业务修复不应频繁修改云仓库 Shell；只有新程序首发、Shell/Bootstrap 不兼容变化、通道入口变化或分享版重新发布时才更新入口。

---

## 5. 同一程序 Stable / Test / Local 规则

对持续维护的小程序，尽量采用一个云仓库主入口 + 二级通道页。

### Stable

- 已实机验证。
- 日常使用和恢复基线。
- 不被未经验证代码覆盖。

### Candidate / Test

- 新功能先进入 Candidate/Test。
- Release Guard + 实机 smoke test 未通过前不得晋级 Stable。
- Candidate/Test 失败时废弃候选版本，不修改 Stable。

### Local

- 纯本地完整代码。
- 不依赖私人 GitHub。
- 适合分享或独立并存场景。

### 名称规则

- 普通程序 Stable/Test 使用相同程序名，通过同名覆盖切换。
- “我的规则仓库”承担自举恢复职责，是默认分名例外：正式版与测试版可以同时安装。
- Local 如需要与远程版同时保留，应使用明确的本地版名称。
- 具体规则以 `docs/HIKER_RULE_NAME_CHANNEL_POLICY.md` 为准。

---

## 6. Remote Module 标准架构

```text
Shell
 ↓
Bootstrap
 ↓
Versioned Remote Manager
 ↓
active release
 ↓
Versioned modules
 ↓
require(url, options, build)
 ↓
海阔缓存
```

### 启动

- 正常启动不主动检查最新版。
- 只加载当前激活 release。
- 已缓存稳定模块优先缓存运行。
- GitHub 暂时异常不能让已经成功运行过的 Stable 白屏。
- 关键索引允许 stale cache 兜底。

### 更新

```text
用户主动检查
 ↓
Candidate/latest metadata
 ↓
release.json
 ↓
预加载新模块
 ↓
verify / contract
 ↓
Test 实机验证
 ↓
晋级 Stable / 切 active
```

禁止先切版本后下载模块。

### 回退

保留 `current` 和 `previous`；旧 release URL/build 不变，确保真正可回退。

### Release 不可变

Stable 引用过的 release 不原地覆盖、不删除。重大故障直接新建 version/build/必要的新 Bootstrap，不在坏版本上无限叠补丁。

---

## 7. 程序目录基线

长期维护程序推荐：

```text
apps/<category>/<app>/
├─ README.md
├─ CHANGELOG.md
├─ manifest.json          # 适用时
├─ stable.json            # 远程标准化后
├─ candidate.json
├─ test.json
├─ channels.json
├─ latest.json
├─ bootstrap_vxxx.js
├─ assets/
└─ releases/
   ├─ 1.0.0/
   ├─ 1.0.1/
   └─ 1.1.0-rc1/
```

Legacy 程序即使运行代码暂时仍在根目录，也必须先建立 `apps/<category>/<app>/CHANGELOG.md` 作为技术记忆入口；后续迁移时继续沿用该日志。

`registry.json` 中每个程序必须登记 `changelog` 路径。

---

## 8. 版本与动态事实管理

### 8.1 三层版本

1. Shell version。
2. Core version/build。
3. 公共库版本（Manager / Diagnostics / compat）。

### 8.2 海阔规则壳数值 version

必须满足：

```text
0 <= version <= 2147483647
```

推荐安全 10 位 `YYYYMMDDNN`，禁止把三位 build 直接追加日期形成 11 位整数。

### 8.3 不在总文档硬依赖动态版本

总文档可记录“审计时基线”，但开发前必须重新读取目标程序 `stable/channels/latest`。

例如截至 2026-08-21 审计：

- “我的规则仓库”当前 Stable 以 `apps/tools/rule-repo/stable.json` 为准，审计时为 3.5.3 / build 377 / Shell 1.5.3。
- “我的规则仓库”当前 Test 以 `apps/tools/rule-repo/test.json` 为准，审计时为 3.5.4-rc7 / build 384 / Shell 1.0.30-test；该 Single Workspace 13.2 必须完成页面无横向漂移、首页仅程序区滚动、网页内固定五栏、35/65 分类原地展开、普通程序与多版本同页详情、显式规则上下文动作、Bootstrap Core 恢复、原生口令导入、备份、诊断、搜索、更新、设置和正式版恢复的实机截图闭环后，才允许讨论 Stable 晋级。
- ACFun Stable 以 `apps/video/acfun/stable.json` 为准，审计时为 0.4.9 / build 149。
- JavDB v3 当前 Stable/Test/Local 以 `apps/video/javdb/channels.json` 为准。

这些数字只是审计快照，不得替代开发前实时读取。

---

## 9. 公共库版本化

公共 Manager / Diagnostics / compat 不能只有一个持续变化的共享文件。

标准：

```text
libs/updater/v2.0.1/remote_manager.js
libs/updater/v2.0.2/remote_manager.js
libs/diagnostics/v1.0.0/hiker_diagnostics.js
```

Stable 应绑定具体版本路径；已发布目录只读；新功能创建新公共库版本。旧稳定程序不为了统一格式批量迁移。

---

## 10. Release Guard / CI

仓库级静态护栏：

```text
tools/release_guard.py
tools/channel_name_guard.py
.github/workflows/release-guard.yml
```

至少检查：

- 根 manifest 重复 ID/入口缺失。
- 规则壳 version 越界。
- latest/stable/candidate/test 与 release 的 id/build/path。
- release 模块存在性和声明契约。
- 多通道程序名/覆盖策略。
- Bootstrap 已知作用域风险。
- 明显凭据泄漏。
- `registry.json` 中每个程序是否登记并实际存在 `CHANGELOG.md`。

Guard 只挡静态错误，不替代海阔实机测试。

**晋级 Stable 的最低条件 = Guard 通过 + 实机关键路径通过 + 主 CHANGELOG 已同步。**

---

## 11. Diagnostics 标准

稳定程序错误页逐步接入 `libs/diagnostics/`，至少可定位：

```text
App / Stage
Shell
Core version/build
Manager
active/previous
缓存状态
已知网络通道状态
错误文本
```

Diagnostics 默认不主动联网，不输出 Cookie、Token、密码、Authorization 原值。

---

## 12. Architecture-First + Product-First

AI 在本项目同时承担产品、UX/UI、架构、工程、编程和测试职责；用户是产品决策者和最终验收者。

长期项目先产品设计、再架构、后功能：

```text
Pages
├─ Home
├─ Category
├─ Search
├─ Detail
├─ Reader / Player
├─ Updates
└─ Settings

Core
├─ Request
├─ Auth
├─ Cache
├─ Storage
├─ Task / Concurrency
├─ Diagnostics
└─ Update

Provider
Adapter
UI
Optional Modules
```

原则：

- 未启用 Provider 不初始化、不请求。
- Provider 私有状态隔离。
- 页面不重复实现 Token/签名/解密/重试。
- 非核心信息异步补齐，不阻塞首屏。
- 聚合任务并发且可超时/停止。
- 长目录分页/分段。
- 动态 UI 优先局部更新。
- 二级页优先 `hiker://page/<path>?rule=&simple=true`，避免标题栏重叠。
- 新功能不能以明显增加耦合、全局副作用和维护成本为代价。
- 发现明显体验、性能、架构债务时主动提出并纳入后续迭代，不等待用户逐项指出。

质量顺序：稳定 → 好用 → 好看 → 快速 → 易维护 → 可扩展。

---

## 13. 漫画项目长期方向

优先研究腾讯漫画、哔哩哔哩漫画、快看漫画等官方生态。

目标：

- 详情、目录、元数据尽量官方。
- 保留官方讨论区、评论区、章节讨论等社区数据。
- 正文设计成可替换 Content Provider。
- 免费章节优先官方。
- Provider 可通过设置/书籍变量切换。
- 详情定制按钮进入整书讨论区；正文定制按钮进入当前章节讨论区。

建议 Provider 合约：

```text
home()
search()
detail()
catalog()
content()
comments()
community()
```

阅读与下载尽量共用统一章节内容接口。

---

## 14. 已学习并保留的架构经验

- JavDB2：Page Module、动态搜索、本地收藏。
- 网飞猫：集中 API Client、动态域名、Token/HMAC/解密。
- 瓜子影视：可选 Native UI Extension。
- 青豆剧场：Provider/Adapter、并发聚合、分层缓存、渐进渲染。
- 聚阅：Source SDK、Provider 合约、源管理。
- 哔咔漫画：章节图片、下载、评论/楼中楼。
- R星精选：Decode、ImageAdapter、图片流解密、目录分段。
- MissAV：薄入口、类型 Renderer、异步补充、敏感字符串运行时恢复。

学习可复用架构，不复制 God Object、强耦合 Java 反射、强制在线核心和难维护混合代码。

---

## 15. 海阔违禁词、隐私与发布兼容

所有程序发布前固定检查：

1. UI 文本。
2. URL/域名。
3. Header/API 参数。
4. JSON key / 签名字段。
5. PrivateJS / 嵌套 Pages。
6. 规则壳 32 位 version。
7. 隐私和凭据。

UI 文本可零宽/运行时恢复；协议字段必须恢复真实运行值后再参与请求/签名。禁止对整个规则 JSON 无脑全局替换。

分享版隐私扫描优先级高于普通违禁词扫描。

---

## 16. 开发前强制 Preflight

修改任何已有小程序前必须先回答清楚：

```text
目标 App ID / 程序名？
当前 Stable 是什么？
当前用户实机跑的是哪个通道/版本？
目标程序 CHANGELOG 最近记录了什么？
当前入口 / Bootstrap / release / Provider 是哪些文件？
本次只应该改哪些模块？
哪些稳定能力绝不能回归？
是否需要 Test/Candidate？
是否需要 Shell 变化，还是只升 Core？
```

没有确认这些信息前，不直接开始大规模改代码。

---

## 17. 标准开发与发布工作流

```text
读取三份全局文档
 ↓
读取目标程序 CHANGELOG
 ↓
读取当前 Stable/Test/Local 元数据与真实源码
 ↓
确认实机当前版本和目标范围
 ↓
feature branch
 ↓
只改目标模块
 ↓
全新 release/build（适用时）
 ↓
Candidate / Test
 ↓
Guard + 回读
 ↓
实机 smoke test
 ↓
先更新目标程序 CHANGELOG
 ↓
更新 manifest / registry / channel metadata
 ↓
最后晋级 Stable / 切 latest
 ↓
升级与回退验证
 ↓
如有通用结论，自动同步三份全局文档
```

**主 CHANGELOG 没有同步，本次发布视为未完成。**

---

## 18. 每个程序 CHANGELOG 的最低内容要求

一个长期维护的日志至少应有：

```text
当前基线
关键技术索引
├─ API/域名
├─ 登录/鉴权/签名
├─ 编码/解密/图片/播放
└─ 缓存/状态/本地数据
已知风险与禁止回退方案
回归测试清单
故障与恢复记录
版本记录
```

重大 Bug 必须记录：

```text
症状
→ 当前版本/通道
→ 根因
→ 修复
→ 为什么旧方案错
→ 回归结果
→ 影响范围
→ 是否需要更新全局 GUIDE/CAUTIONS/PLAN
```

如果某项技术信息尚未验证，明确写“待确认”，不要为了让日志看起来完整而猜测。

---

## 19. 当前仓库日志覆盖基线

截至 2026-08-21：

- `rule-repo`：已有主 CHANGELOG，需持续保证 Stable 晋级同步主日志。
- `acfun`：已有较完整技术 CHANGELOG，已记录 APK 复核、接口、播放、封面 XOR/AES 等重要信息。
- `javdb-v3`：已建立程序级 CHANGELOG，后续维修时继续从当前运行代码回填具体接口/协议历史。
- `huangdou / mdai / hanime1 / javbus`：已建立 legacy 技术日志骨架，后续每次维修逐步补齐，不凭空补写历史。

`registry.json` 中所有程序必须登记自己的 `changelog` 路径；Release Guard 检查文件存在性。

---

## 20. 用户无需承担“项目记忆管理员”职责

用户不需要反复告诉 AI：

- “记得这是自用远程版”。
- “记得分享版不能暴露 GitHub”。
- “记得先看以前的 Bug”。
- “记得更新日志”。
- “记得把新坑写进注意事项”。
- “记得不要覆盖 Stable”。

只要用户让 AI **先读三份文档再开发目标程序**，AI 就应自行恢复这些规则、继续读取目标程序 CHANGELOG 和实际 Stable 元数据，并在任务结束时主动维护相关文档。

如果 AI 发现当前用户指令与旧规划冲突，以用户当前明确指令优先，并把新的长期决定同步回文档。

---

## 21. 新对话最短恢复口令

用户以后可以只说：

```text
先读 GitHub 仓库里的三份文档，再继续优化 ACFun。
```

AI 应自行完成：

```text
三份全局文档
→ registry 定位 ACFun
→ ACFun CHANGELOG
→ ACFun Stable/Test/Candidate/Latest
→ 当前 release / Bootstrap / 模块
→ 对照实机当前版本
→ 开始工作
```

同理适用于任何其他小程序。
