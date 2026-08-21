# 海阔视界程序：长期规划与开发规范

版本：1.9  
日期：2026-08-22  
适用范围：本项目后续所有海阔视界 `.hk小程序`、书源/漫画源、云仓库、GitHub 远程模块和版本治理。

> **文档定位：长期项目总纲 + 新对话恢复入口。** 新对话、长对话中断或隔很久重新维护时，先读本文件，再读《海阔小程序编写指南》和《海阔小程序编写注意事项》。涉及仓库、远程更新、迁移或发布时，还必须读取 `docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`。

---

## 0. 最高级恢复协议：用户只需要说“先读三份文档”

以后用户在任何新对话中只需要说：

```text
先读 GitHub 仓库里的三份文档，再开发/优化 <某个小程序>
```

自动等价于：

1. 读取 `docs/PROJECT_PLAN.md`。
2. 读取 `docs/HIKER_APP_DEVELOPMENT_GUIDE.md`。
3. 读取 `docs/HIKER_APP_DEVELOPMENT_CAUTIONS.md`。
4. 如果涉及 GitHub/远程模块/迁移/发布，再读 `docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`。
5. 从 `registry.json` 定位目标程序。
6. 读取目标程序 `CHANGELOG.md`。
7. 读取当前 `stable.json / channels.json / latest.json / test.json / candidate.json` 中真实存在的文件。
8. 读取对应 `release.json`、Bootstrap、Shell/入口和本次要改的模块。
9. 如涉及海阔 API/组件兼容，继续查海阔官方开发者手册。
10. 确认“当前实际运行版本/通道/模块/仓库来源”后才开始改代码。

**禁止只凭聊天记忆、旧摘要、历史版本号或本文示例版本直接开改。**

### 0.1 事实来源优先级

```text
用户当前明确指令
  > 用户实机截图/实机测试结果
  > 当前入口源码 + stable/channels/latest/release 元数据
  > 目标程序 CHANGELOG 中已验证记录
  > registry.json / manifest.json
  > 三份全局文档和专项规范
  > 旧聊天记忆/旧摘要/推测
```

如果文档与当前事实冲突，完成当前任务时主动修正文档，不等待用户提醒。

---

## 1. 长期知识体系

### `docs/PROJECT_PLAN.md`

长期方向、产品决策、仓库职责、发布形态、恢复协议、事实优先级和工作流。

### `docs/HIKER_APP_DEVELOPMENT_GUIDE.md`

海阔官方 API、组件、路由、网络、存储、并发、动态 UI，以及本项目验证过的通用编写方法。

### `docs/HIKER_APP_DEVELOPMENT_CAUTIONS.md`

兼容坑、缓存坑、版本/更新坑、UI 坑、Provider/并发/存储坑、导入/违禁词/隐私问题和真实事故教训。

### `docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`

2026-08-22 仓库拆分、断旧仓迁移事故、公开运行仓/私有历史仓职责和以后迁移硬规则。

### 每个程序自己的 `CHANGELOG.md`

负责该程序的长期技术记忆，至少持续记录：

- Stable/Test/Local 基线与入口。
- 数据源/API/动态域名策略。
- 登录/Cookie/Token/签名字段和算法。
- 编码、解密、图片处理、媒体播放链。
- Provider/Adapter/缓存/存储/schema。
- Bug 症状、根因、修复、证伪方案。
- 已知不可回退方案。
- 实机验证结果和恢复方式。
- APK/网页/接口复核得到的重要事实。

不得写真实密码、Token、Cookie、私钥等敏感凭据。

---

## 2. 自动维护制度

每次开发/维修结束前，AI 必须主动判断是否更新文档。

### 必须更新目标程序 CHANGELOG

出现以下任一情况：

- version/build/Shell/通道变化。
- 新增、删除或改变接口。
- 登录/Token/Cookie/签名变化。
- 新发现编码/解密/图片/播放处理。
- 修复根因明确的 Bug。
- 某方案被证实错误或不稳定。
- 缓存/schema/状态 key 变化。
- Provider/Adapter/模块边界变化。
- 实机验证结果变化。
- 新增恢复/回退方式。

### 更新全局文档

- 长期方向/产品规则变化 → `PROJECT_PLAN.md`。
- 新的通用编写方法 → `HIKER_APP_DEVELOPMENT_GUIDE.md`。
- 新坑、新事故、新禁用项 → `HIKER_APP_DEVELOPMENT_CAUTIONS.md` 或专项 Incident 文档。
- 仓库/发布/迁移变化 → 同步更新 architecture、remote-module、release checklist 和迁移基线。

---

## 3. 自用版与分享版严格区分

### 3.1 默认：自用远程版

除非用户明确说明“准备分享”，所有小程序默认按自用远程版开发：

```text
海阔云仓库轻量 Shell
        ↓
asset-core-7f3@main / Bootstrap
        ↓
Versioned Remote Module Manager
        ↓
release 业务模块
        ↓
海阔 require/fetch 缓存
```

日常接口修复、UI 优化、Provider 增减原则上只升级业务 release，不反复重新发完整本地包。

### 3.2 分享版：纯本地

用户明确准备分享时，必须另做完整纯本地版本：

- Core / Pages / Provider / Adapter / UI / 解析代码全部内置。
- 不依赖私人 GitHub 远程业务代码。
- 不带私人 Remote Manager、latest、一键远程升级、私人回退地址。
- 可上传海阔云仓库。
- 不暴露 GitHub 用户名、repo、Raw、私人服务器和隐私凭据。
- 无私人 GitHub 环境仍可完整运行核心功能。

### 3.3 自用版转分享版

保留现有自用远程版，从当前 Stable 派生独立纯本地版；内置业务模块、移除远程更新链，执行隐私扫描和海阔违禁词兼容。

---

## 4. 当前 GitHub 双仓职责（2026-08-22 起）

### 4.1 `asset-core-7f3`：正式运行仓

Public，但默认分支为 `landing`。

```text
asset-core-7f3
├─ landing   默认展示；只放中性入口
└─ main      真正运行/发布/维护分支
```

`main` 负责：

- 自用远程 Shell/Bootstrap/业务模块。
- Core / Provider / Adapter / Pages / UI。
- Remote Module Manager / Diagnostics。
- Stable / Candidate / Test / Local 元数据。
- release / latest / channels。
- 每个程序的 CHANGELOG。
- 模板、Guard、CI、长期文档。
- 当前有效恢复入口。

**所有正式运行 URL 必须明确指向 `asset-core-7f3@main`，不能依赖默认 `landing`。**

### 4.2 `hiker-cloud`：历史私有仓

已转为 Private，只保留：

- 历史提交。
- 迁移前旧版本。
- 旧实验实现。
- 必要的历史查阅资料。

不再允许作为：

- 正式 Shell 源。
- Bootstrap/Manager 源。
- runtime/release 源。
- Raw/jsDelivr 正式依赖。

发现新代码又引用 `hiker-cloud`，默认视为回归缺陷。

### 4.3 海阔云仓库

主要承担安装中心：

- 自用版：轻量远程 Shell。
- 分享版：完整纯本地程序。
- 展示名称、版本、图标、分类和安装入口。

普通业务修复不应频繁修改云仓库 Shell；只有 Shell/Bootstrap/仓库 URL/页面声明不兼容变化时才重新发布。

---

## 5. 仓库迁移硬规则

2026-08-22 的迁移证明：**GitHub 文件迁移完成 ≠ 用户手机里的规则壳迁移完成。**

标准顺序固定为：

```text
新仓准备
→ 复制真实运行文件
→ 替换全部远程 URL
→ 检查 Shell/Bootstrap/Manager/release/runtime
→ 新仓实机测试
→ 重新覆盖安装手机中的旧 Shell
→ 确认 Shell 内 URL 已切换
→ 旧仓 Private/下线
→ 不重新安装，直接断旧仓实机测试
→ 全部通过才算迁移完成
```

禁止再出现“只检查新仓源码正常就把旧仓 Private”的做法。

测试版 Shell 也必须采用海阔可稳定导入的完整规则结构。发生 Shell 结构变化时应提升数值 `version`，避免旧缓存继续被使用。

---

## 6. Stable / Test / Local

### Stable

- 已实机验证。
- 日常使用和恢复基线。
- 不被未经验证代码覆盖。

### Candidate / Test

- 新功能先进入候选/测试通道。
- Test 必须基于当前 Stable 向前开发。
- Guard + 实机 smoke test 未通过前不得晋级 Stable。
- Test 失败不能破坏 Stable 恢复链。

### Local

- 纯本地完整代码。
- 不依赖私人 GitHub。
- 适合分享或独立并存。

### 名称规则

- 普通程序 Stable/Test 默认同名覆盖。
- “我的规则仓库”承担自举恢复，正式版与测试版允许分名并存。
- Local 如需并存使用明确本地版名称。

具体以 `docs/HIKER_RULE_NAME_CHANNEL_POLICY.md` 和 `docs/VERSION_CHANNEL_GOVERNANCE.md` 为准。

---

## 7. Remote Module 标准架构

```text
Shell
 ↓
Bootstrap
 ↓
Versioned Remote Manager
 ↓
active release
 ↓
versioned modules
 ↓
require(url, options, build)
 ↓
海阔缓存
```

### 启动

- 正常启动不主动检查最新版。
- 只加载当前激活 release。
- 已缓存 Stable 优先缓存运行。
- 单个 GitHub/CDN 线路异常不能直接造成已验证 Stable 白屏。
- 关键索引允许 stale cache 兜底。

### 更新

```text
用户主动检查
→ Candidate/latest metadata
→ release.json
→ 预加载新模块
→ verify/runtime contract
→ Test 实机验证
→ 晋级 Stable / 切 active
```

禁止先切版本后下载模块。

### 回退

保留 current/previous 或等价恢复链。Stable 引用过的 release 不原地覆盖、不删除。

---

## 8. 程序目录基线

长期维护程序推荐：

```text
apps/<category>/<app>/
├─ README.md
├─ CHANGELOG.md
├─ manifest.json
├─ stable.json
├─ candidate.json
├─ test.json
├─ channels.json
├─ latest.json
├─ bootstrap_vxxx.js
├─ assets/
└─ releases/
   ├─ 1.0.0/
   └─ 1.1.0-rc1/
```

Legacy 程序即使运行代码仍在根目录，也必须先建立自己的 CHANGELOG；`registry.json` 中每个程序必须登记 `changelog` 路径。

---

## 9. 版本与动态事实

至少区分：

1. Shell version。
2. Core version/build。
3. 公共库版本（Manager / Diagnostics / compat）。

海阔规则壳数值 `version` 必须：

```text
0 <= version <= 2147483647
```

推荐 `YYYYMMDDNN` 10 位安全版本号。

总文档只能记录审计快照。开发前必须重新读取当前元数据。

截至 2026-08-22 迁移完成时的快照：

- 我的规则仓库 Stable：3.5.3 / build 377 / Shell 1.5.3。
- 我的规则仓库 Test：3.5.4-rc7 / build 384 / Shell 1.0.30。
- JavDB v3 Stable：3.9.41 Remote。
- ACFun Stable：0.4.9。

以上不得替代后续实时读取。

---

## 10. 公共库版本化

Manager / Diagnostics / compat 不能只有一个持续原地变化的共享文件。

标准：

- Stable 绑定具体版本路径。
- 已发布版本只读。
- 新功能创建新公共库版本。
- 旧稳定程序不为了统一格式批量迁移。

---

## 11. Release Guard / CI

仓库级静态护栏至少检查：

- 引用文件真实存在。
- Stable release 未被原地覆盖。
- Test 基线不落后于 Stable。
- Shell 数值版本合法。
- `registry.json` 的 changelog 路径存在。
- Public 运行代码不新增敏感凭据。
- 新正式代码不新增 `hiker-cloud` 运行依赖。
- `asset-core-7f3` 的运行 URL 明确使用 `main`。

**晋级 Stable 最低条件 = Guard 通过 + 实机关键路径通过 + CHANGELOG 同步。**

---

## 12. Diagnostics 标准

稳定程序错误页逐步接入统一诊断，至少能定位：

```text
App / Stage / Provider / URL family / status / error / current build / cache state
```

Diagnostics 默认不主动联网，不输出 Cookie、Token、密码、Authorization 原值。

---

## 13. Architecture-First + Product-First

长期项目先产品设计、再架构、后功能。

固定边界：

```text
Shell / Bootstrap
Core
Provider / API
Adapter
Pages / UI
Optional Modules
```

维修目标局部化：搜索坏只修 Search；播放坏只修 Player/PlayAdapter；Provider 失效只修 Provider；UI 调整优先只改 Renderer；升级变化只改 Bootstrap/Update Manager。

未启用的 Provider/评论/播放模块不应初始化或执行。

质量优先级：

```text
稳定 → 好用 → 好看 → 快速 → 易维护 → 可扩展
```

二级页面统一避免会让系统标题栏与内容重叠的沉浸式写法；优先使用成熟的独立 `hiker://page/<path>?rule=&simple=true` 页面结构。

---

## 14. 漫画项目长期方向

优先研究腾讯漫画、哔哩哔哩漫画、快看漫画等官方生态。

长期目标：

- 正版源可分别独立维护，避免一个超大聚合源导致体验和代码隔离恶化。
- 免费章节优先官方获取。
- 正文内容提供方采用可插拔 Provider/Adapter，允许书籍变量或登录设置切换。
- 官方讨论区、评论、作品社区等生态数据尽量保留。
- 书籍详情页定制按钮进入整本书讨论区；章节正文中的定制按钮进入该章节讨论区。
- 阅读与下载尽量共用统一章节内容接口。
- Provider 代码隔离，未选中的内容源不执行。

---

## 15. 已学习并保留的架构经验

- JavDB2：Page Module、动态搜索、本地收藏。
- 网飞猫：集中 API Client、动态域名、Token/HMAC/解密。
- 瓜子影视：可选 Native UI Extension。
- 青豆剧场：Provider/Adapter、并发聚合、分层缓存、渐进渲染。
- 起点官方生态：官方 Adapter、正文 Provider 可替换、社区/段评与正文解耦。

学习可复用架构，不复制 God Object、强耦合 Java 反射、强制在线核心和难维护混合代码。

---

## 16. 海阔违禁词、隐私与发布兼容

发布前固定检查：

1. UI 文本。
2. URL/域名。
3. 规则标题/作者/描述。
4. JS 字符串。
5. Token/Cookie/Key/账号。
6. GitHub 用户名/repo/Raw 地址（尤其分享版）。

分享版隐私扫描优先级高于普通违禁词扫描。

功能协议真实值不能因为“消除关键词”被直接破坏；需要兼容时优先运行时拼接/Base64 恢复。

---

## 17. 开发前强制 Preflight

修改任何已有程序前先确认：

```text
目标 App ID / 程序名？
当前 Stable/Test/Local？
当前真实 Shell/Core/build？
当前入口和仓库来源？
目标是修 Bug、升版、UI 还是架构？
必须保留哪些已验证功能？
是否属于自用远程版或准备分享？
是否有当前实机截图/错误日志？
```

没有确认这些信息前，不直接开始大规模改代码。

---

## 18. 标准开发与发布工作流

```text
读取三份全局文档
↓
读取目标 CHANGELOG
↓
读取当前元数据/入口/release
↓
确认实际运行仓库与通道
↓
复现/分析
↓
局部实现
↓
Test/Candidate
↓
Guard
↓
用户实机测试
↓
更新 CHANGELOG/必要全局文档
↓
晋级 Stable
↓
若改 Shell/仓库地址，再做覆盖安装和断旧仓验证
```

**主 CHANGELOG 没同步，本次发布视为未完成。**

---

## 19. CHANGELOG 最低内容

长期维护日志至少包含：

```text
当前基线
入口与通道
Provider/API
鉴权/签名/解密
缓存/存储
重要 Bug 与根因
失败方案/禁止回退方案
版本变化
实机验证
恢复方式
待确认项
```

未验证的信息明确写“待确认”，不能为了完整而猜测。

---

## 20. 用户不承担“项目记忆管理员”职责

用户不需要反复提醒：

- 默认自用版走远程模块。
- 分享版不能暴露私人 GitHub。
- 先读三份文档。
- Stable/Test/Local 要保持谱系。
- 二级页避免沉浸式标题栏重叠。
- 新代码统一使用 `asset-core-7f3@main`。
- 发布后主动更新 CHANGELOG 和长期文档。

这些属于项目规范，应由 AI 自动执行。

如果用户当前明确指令与旧规划冲突，以当前指令优先，并把新的长期决定同步回文档。

---

## 21. 新对话最短恢复口令

例如：

```text
先读 GitHub 仓库里的三份文档，再继续优化 ACFun。
```

或：

```text
先读三份文档和仓库迁移基线，再继续做我的规则仓库。
```

读取后必须继续定位目标程序当前真实版本和 CHANGELOG，不能仅凭总纲直接开发。
