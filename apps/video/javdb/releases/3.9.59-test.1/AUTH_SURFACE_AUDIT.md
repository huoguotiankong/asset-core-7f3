# JavDB v3 · 2026-11-16 账号鉴权链审计 · Test59

状态：**源码审计与模拟通过，海阔 Android 实机 / 官方 API 真正响应尚未验证**。严禁写成「全功能鉴权已修复」。基线：Stable 3.9.42 不变，Test58 为本次直接派生版本。

## 本轮实机依据
- 20:25 在 JavDB 搜索页搜索 `meyd-831`，服务器返回 `JWTVerificationError: 请登录账号`。
- 前面 19:02 筛选/热播、19:19 预览图、19:36 VIP/磁链存在类似问题。用户此前明确反馈账号登录中。
- 登录 UI / 本地 `jdb3_user` 缓存 / 本地 `jdb3_token` / 服务端接受令牌是四个不同事实，未抓取真实服务器响应不能混为一谈。

## 真实调用链
- Hiker Shell 含 44 页；普通 Core 页面走 `$.require('javdb3').core('JDB.foo();')`，部分 Custom 走 `.custom('...')`。全局海阔搜索使用 Shell 字段 `searchFind = js:$.require('javdb3').custom('__searchFind')`。
- Local First Base（3.9.41 gzip Core，经 3.9.44/3.9.45/3.9.50～58 包装）内：
  - `JDB.apiSafe` → `JDB.api` → `buildApiHeaders('')`，**默认无 Authorization**。
  - `JDB.apiAuthSafe` → `JDB.apiAuth`，使用本规则 `jdb3_token` 的 raw/Bearer 候选。
  - Test56 AuthGate 通过 API 失败 JWT 识别重试，但此前 Test58 的 m.core 正则只注入部分方法，造成跨页面漏修。
- gzip Custom 中共 15 个键，发现直接访问官方 `jdforrepam.com` API 的只有 `javdb3Magnets`、`javdb3Search`、`__searchFind`；其它 ExternalPlay、Subtitle、CloudPlay 等主要调用第三方服务/本地规则，不能盲目塞 JavDB Authorization。

## Test59 覆盖矩阵

| 页面/功能 | 实际请求实现 | 旧问题 | Test59 路径 | 验证状态 |
|---|---|---|---|---|
| 独立搜索 `javdb3Search` | `jdbApiPath` → 无 Token 的自建 fetch 到 `/api/v2/search`，演员回退另请求 `/api/v4/movies/{id}` | 用户实机 JWT | 仅替换搜索 helper 为 `JDB.apiSafe`，经过统一 AuthGate | 真实模块结构对比、模拟通过；待实机 |
| 海阔全局搜索 `__searchFind` | 与上面同源的独立 helper | 原先未覆盖 | 同一补丁替换 helper，保留 `searchFind` 路由 | 模拟通过；待实机 |
| 首页 / 分类 / 筛选 / 排行 / 演员 / 资料库 | Core JDB methods | 旧白名单漏注入其他页面 | 全部无参 `JDB.method()` Core 页面统一注入 Test55 taxonomy+Test56 AuthGate | 静态覆盖；实际 API 待验证 |
| 详情 / 预览 / 评论 / 评论详情 / 文章 | Core JDB methods | 部分 `apiSafe` 没有 Token | 同样统一注入，不改变内容渲染、图片 Referer | 静态覆盖；实际 API 待验证 |
| 近期浏览 / 收藏 / 我的清单 / 清单详情 / 影片清单 | Core 已使用 `apiAuthSafe` 的个人账号端点，间有 `apiSafe` 的只读条目 | 原已有授权逻辑，其他公共调用可漏补丁 | 统一 Core AuthGate，不改写入动作 | 代码审计通过，待账号实测 |
| VIP 影片信息和播放 | `apiSafe(/api/v4/movies/{id})` + `apiAuthSafe(/play)` | Test57 入口漏注入，Test58 修 | 保留 Test58，继续在输出移除 `#noPre#`，不触碰媒体 Header | 模拟通过；真实首播/Seek 待验证 |
| 磁链 | Custom 自建 fetch 无 Authorization | Test58 已桥接 | 保留 Test58 替换 local helper + Test50/52 metadata/菜单 + Test54 光鸭 | 模拟通过；待实机 |
| 账号资料/附加数据 | `apiAuthSafe(/api/v1/users)` 等 | 原有客户端本身带 Token | 保留，新增诊断区分本地凭据及端点结果 | 静态通过，真实凭据待验证 |
| 站内通知 / 随机推荐 | Test55 `apiAuthSafe` 试验入口 | 新官方 APP 参数未实测 | 保留，不主动发修改已读的 POST | 实验功能，待实机 |
| 外部播放/磁力引擎/第三方字幕 | 自身第三方 HTTP / 小程序调用 | 不属于 JavDB 账号鉴权 | **不注入 JavDB Token 到第三方** | 代码隔离审计 |

## 发现但本轮不草率改变的风险

1. **评论详情「点赞」**：Base `JDB.reviewDetail` 有独立、签名的 `POST /api/v1/movies/{id}/reviews/{reviewId}/like`，当前代码头里未见 Authorization。该端点能否匿名点赞、是否要求 POST Token、表单类型及成功标志需要实机/合同确认。未经证据，不把 GET 的鉴权策略直接套到写操作。
2. **账号中心自动退出**：旧 `JDB.account` 在 `/api/v1/users` 返回部分 JWT 错误时调用 `logoutUser()`，会清除本地 token；如果是单次故障可能导致登录状态丢失。Test59 未修改这一旧流程，后续需根据实机账号诊断决定是否改成非破坏性提示，避免影响明确的「退出登录」操作。
3. 新版官方 APP 1.9.39.4 RC 的签名、JWT 时效或设备信息若与旧版不兼容，单靠增加 Header 不能保证服务端验证成功。需要真实实机错误及无敏感字段的诊断结果。
4. 变更 `m.core` 的无参调用拦截可能影响后续新增匿名页面性能，因此只对固定格式 `JDB.method();` 注入；对复杂 JS/外部模块不执行隐式重写。

## 验证和安全
- 源码级：gzip Core / gzip Custom 全部读取，Custom 15 键网络调用审计；搜索 helper 仅 1 处局部差异，前后 UI/实体/排序/历史功能源码逐字保持。
- 联合模拟：两类搜索经无凭据 HTTP → 模拟 JWT → 当前规则 token 授权重试 → 展示 mock 搜索结果；资料库页面也走相同 Core 授权；VIP 播放 URL 的 `#noPre#` 清理和 Headers 保留；诊断默认不自动发请求。
- 不输出/提交任何 Token、Cookie、密码；不将 JavDB 用户 Token 发往第三方；未修改 Stable / Latest / 活动 Test 指针。
- 下一步 Android 设备应测试搜索 + 全局搜索 + 账号诊断（账号、搜索、标签、榜单），再复测预览、VIP、磁链及我的清单。失败时只需截图错误，不需要展示凭据明文。

