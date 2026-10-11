# 海阔下一代 Android 客户端：产品定位与架构蓝图（2026-10-11）

> **性质：产品决策与重构边界，不表示已开始重写或完成测试。**
> 用户体验观察为第一手需求来源：海阔最突出的优势在于高度可定制的 UI 组件、接近独立 APP 的多页面呈现、小程序间自然交互；主要短板之一是播放器能力与播放页设计落后，且老旧闭源客户端难以持续获得现代原生能力和 AI 开发辅助。TVBox 衍生软件在影视播放方面有众多成熟范例，但不应把海阔下一代重做成纯影视聚合壳。关于开源历史/停更时长等属于用户观察，非本蓝图独立核验的版本史事实。

## 1. 核心产品定位

**可编程的 Android 小程序运行平台（programmable mini-app runtime），优先向下兼容海阔视界 8.83；影视是重要能力但不是产品边界。**

核心价值排序：
1. 规则/小程序兼容与数据安全（保留已存在的生态）。
2. 原生声明式 UI 表达力与可交互性（不降低页面设计上限）。
3. 多页面路由、状态恢复、跨小程序协作。
4. 可插拔的现代媒体与图片/阅读能力。
5. AI 辅助开发、调试、测试和文档生成。
6. 轻量、稳定、可长期升级。

**禁止的产品方向**：只提供统一影视海报首页+详情+选集、让不同小程序必须塞进固定模板；为新 UI 而取消旧 `col_type`、`lazyRule`、跨规则调用；把旧 APK 的所有耦合/臃肿实现原封重建；以“兼容”为由给第三方规则无限 Java/文件权限。

## 2. 不可退化的海阔体验合同

- **页面表达**：既有 `col_type` 列表/卡片/输入/图文/分组/加载/动态更新语义；支持不同小程序拥有完全不同的信息架构和视觉布局；保留空态、错误态、滚动与局部刷新；新组件按版本/能力可选启用。
- **多页面**：`hiker://page`、`simple=true`、`MY_RULE/MY_URL/MY_TYPE` 等 HostContext、路由参数、返回栈、标签页/页面恢复和跨页参数传递。避免不必要的沉浸式系统标题叠加。
- **跨小程序**：规则级 deep link、URI 编码/参数传递、搜索委托、云盘接磁链播放、返回与结果传递；权限隔离但保留可授权的跨程序协作。
- **脚本兼容**：8.83 DEX 注解导出函数、默认参数和类型、`Hikerurl.js` 的 `$().rule/lazyRule/select`、`$.require`、`preRule`、`require(url,options,version)`；不假设旧 GitHub 公开源码可直接代表 8.83 行为。
- **网络/存储**：Header/Cookie、浏览器嗅探、文件 URI、缓存版本、登录会话、备份恢复、各小程序状态隔离。
- **扩展插件**：含 DEX/native 的高级功能必须按可信/显式授权机制实现，不无条件开放任意类加载。

## 3. 新版可选能力设计

### 3.1 UI Next（增强模式，旧规则默认兼容模式）

- 除既有 `col_type` 外新增响应式卡片、瀑布流、页面局部更新、嵌套滚动、Bottom Sheet、弹层、网格、浮动操作、主题令牌等可声明能力。
- 不强制统一主题或美术风格，宿主仅统一基础手势、安全区、可访问性、导航体验；每个小程序仍拥有独立页面设计权。
- UI 的高级功能以功能探测和版本化扩展交付，不能使旧规则直接报错。

### 3.2 Player Next（可替换媒体引擎）

- `Rule Playback Intent` → `PlayRequest/PlayData + Headers/Cookie + LazyResolve + Subtitle/Danmu + Episode/Progress` → `Playback Engine Adapter`。
- 保留原有外部播放器、自带 ExoPlayer 2.15.1 行为作为对照；再研究 Media3/其他内核，并单独测试 HLS/MP4/Range、拖动/恢复、源过期、极速代理和缓存。
- 优先改善播放页美观、触控、手势、状态提示、选集、字幕、弹幕和失败诊断，不把“多内核数量”当成功指标。
- 不把播放数据解析、解密、线路和解码内核写成同一个大型 Activity。

### 3.3 Developer + AI First（开发者能力）

- 原生调试控制台：当前规则/页面/JS 阶段、脱敏网络瀑布图、错误堆栈、数据模型、图片解析链和播放错误分类。
- 可导出的最小复现 fixture、规则 API 自动补全与文档链接、规则沙箱试运行与回归测试。
- 可选 AI 助手帮助生成/修改规则、定位报错和解释 API，但**不默认上传 Cookie/Token/私人代码或网页内容**；必须支持关闭 AI/离线使用，预览代码差异后由用户确认应用。
- 自动分析脚本不得直接写入 Stable 或自动替换已安装规则。

## 4. 建议的可维护架构

```
App Shell / Navigation / Design tokens
    ↕   Capability & Permission Bus
Hiker 8.83 Compatibility Facade (APIs / $-DSL / URI / serialization)
    ↕
Rule JS Runtime & per-rule HostContext / Module Loader
    ↕
Network / Cookie / Files / Storage / Crypto / Browser
    ↕
Declarative UI Renderer + Page State + Inter-App Router
    ↕
Media & Reader Services (PlayRequest / Engine adapters / Image pipeline)
    ↕
DevTools + Optional AI Extension
```

禁止让某个单独视频站、云盘或规则名称在宿主主干中成为硬编码特判；高级功能通过版本化接口、显式能力和 per-app 状态隔离接入。

## 5. 研究/开发阶段及开工判定

- **当前阶段**：8.83 APK 静态审计、20 个小程序样本词法扫描、兼容合同提取；均不等于运行通过。
- **下一阶段**：原版 8.83 非侵入式行为 fixture 与真机测试；基于具体 8.83 API 建立 JSON 输入、期望输出/状态和错误模式；验证深链、跨小程序、图片/播放/远程模块的端到端行为。
- **正式重构 Gate**：详见 `docs/HIKER_ANDROID_883_REWRITE_READINESS_20261011.md`，尤其包括隔离包名最小宿主、原版真机基线、代表性回归、数据恢复、插件授权/安全模型。
- **一旦 Gates 达标**：明确告知用户“可以开始重构”，从轻量独立 Android 客户端底座与 8.83 兼容层开始，按领域阶段性发布独立 Test；功能先兼容再增强，播放器与 UI 在不破坏旧规则前提下升级。

**本文件是用户确认的产品目标的工程化表达，不是对 DeepCloud 实际实现的保证，也不是对 Android 版本/第三方许可的最终结论。**
