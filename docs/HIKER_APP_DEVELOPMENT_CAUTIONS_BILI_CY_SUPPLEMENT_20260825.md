# HIKER_APP_DEVELOPMENT_CAUTIONS 补充：哔哩.cy 样本暴露的高概率坑

日期：2026-08-25  
来源：`哔哩.cy.hk小程序(1).zip` 源码 + 当前实机截图  
完整证据：`docs/HIKER_SAMPLE_BILI_CY_REVIEW_20260825.md`

> 这些条目不是对样本作者做评价，而是把成熟样本中“能运行但不适合作为本项目长期默认架构”的写法升级成防回归规则。

---

## BC-01. Base64 不是加密，禁止用可逆编码包装账号凭据后当“共享权益 Key”

高风险模式：

```text
Cookie / Token
→ base64
→ 再 base64
→ 分享 / 导入
→ 解码后直接作为认证凭据
```

固定规则：

- Base64 只用于编码，不提供机密性。
- 禁止把真实 Cookie、Session、Bearer Token、Refresh Token 通过可逆编码包装后分享。
- 会员/付费权益只能使用当前用户自己的合法 Session 或官方明确支持的授权机制。
- 自用程序也不要提供“一键复制完整 Cookie / 分享 Cookie”的常驻产品入口。

## BC-02. Credential-bearing Request 必须优先 HTTPS

Cookie、CSRF、Token、Authorization 等凭据参与的请求禁止依赖明文 HTTP，即使目标站可能重定向到 HTTPS。

固定：

```text
https:// endpoint
+ explicit Referer/UA when protocol needs
+ sanitized diagnostics
```

不要把账号凭据交给 `http://` 后期待服务端安全重定向。

## BC-03. WebView 登录禁止用高频 Timer 持续抓 Cookie

样本存在 WebView 中每极短间隔读取 Cookie 的实现。

风险：

- 无意义 CPU/Bridge 压力。
- 页面长时间停留持续访问敏感凭据。
- 难以判断到底哪一次状态才是完整 Session。

正确：

```text
检测登录成功条件
→ 单次读 Session
→ 服务端验证
→ 持久化
→ 停止监听
```

## BC-04. Onboarding/免责声明不得 `Thread.sleep` 阻塞页面线程

样本未登录时同步 sleep 倒计时再显示登录入口。

固定规则：

- 不用循环 `Thread.sleep` 制造 UI 倒计时。
- 免责声明可以一次显示 + 用户主动确认。
- 真需要倒计时，使用非阻塞周期任务并允许页面退出时取消。
- 首屏 P0 链不能因为提示文本人为阻塞 10 秒。

## BC-05. 账号健康检查禁止“每次首页 + 全账号串行验证”

多账号情况下：

```text
打开页面
→ 验证 active
→ 再逐个联网验证所有账号
```

很容易变成隐形 N+1。

固定规则：

- Session health 有 TTL。
- active-first。
- 只有 active 失效或用户进入账号管理时才批量清理候选账号。
- 大规模清理做有界并发/后台低优先级，不阻塞普通内容页。

## BC-06. Page Router 禁止靠 `eval(request('hiker://page/...').rule)` 运行其它页面源码

这种写法可以达到模块复用效果，但长期风险是：

- 页面合同隐式。
- eval scope 难追踪。
- 静态语法/依赖检查困难。
- 一个页面修改可能在多个调用处改变行为。

固定：

```text
Router
→ explicit module export
→ render(context)
```

共享模块必须有显式参数和返回合同。

## BC-07. 外部 Parser / Script 禁止 `eval(fetch(remoteScript))` 直接进入播放主链

外部解析器如需支持：

```text
PluginManager
→ pinned version/hash/source
→ capability contract
→ Test
→ explicit fallback
```

不能：

```text
点击播放
→ fetch 某远程 JS
→ eval
→ 直接拿当前账号/文件/网络权限执行
```

Remote Script 属于高权限代码，不是普通数据配置。

## BC-08. 页面层禁止反复直接读取凭据文件并自行提取 CSRF

样本大量页面/函数直接：

```text
read account file
→ cookie.match(...csrf...)
→ request/post
```

长期会造成：

- Cookie schema 一变到处修改。
- 未登录/null 时各种运行时异常。
- 页面与协议耦合。

固定：

```text
AccountSession.active()
CsrfProvider.get()
MutationClient.post()
```

Renderer 不接触原始 Cookie 字符串。

## BC-09. Cursor/Offset Key 不能只使用页码

样本动态和足迹都存在 `storage0` 以 `"2" / "3"` 等页码保存下一页游标的模式。

风险：不同页面、账号、Query 的游标可能互相覆盖。

固定：

```text
<app>:<provider>:<account>:<route>:<entity/filterHash>:<page>
```

CursorState 必须 scope-aware。

## BC-10. 全局状态 Key 禁止使用过于泛化的中文裸 Key

例如：

```text
模式
首页
折叠
日历
关注分组
收藏类型
```

小样本中容易工作，程序扩展后容易跨页面污染。

固定：

```text
<appId>_<page>_<module>_<key>
```

例如：

```text
bili_detail_episode_layout
bili_library_filter_folded
bili_home_mode
```

## BC-11. Dynamic Tagged Union 不要无限扩大一个 Renderer God Function

动态平台新增一种类型，就在同一个函数继续加 `else if`，最终会形成：

```text
一个坏 payload
→ 整个动态页面逻辑难维护
→ 未知类型容易击穿同页其它类型
```

固定使用 Adapter Registry；未知类型单项降级，不拖垮 Feed。

## BC-12. DASH 音视频轨不要通过“复制最后一条音频”机械对齐数组长度

视频轨和音轨属于不同维度。

正确：

```text
VideoTrack
AudioTrack
→ TrackMatcher(codec/language/container/support)
→ PlayerModel
```

如果只有一个公共音轨，可以显式标记 shared audio；不要把数组“凑齐”当媒体合同。

## BC-13. 弹幕/字幕缓存不要用页面标题做唯一文件名

标题可能：

- 重名。
- 含非法/特殊字符。
- 同一个作品不同 episode/cid 共用标题。

固定：

```text
<app>/<provider>/<contentId>/<episodeId-or-cid>/<schema>.xml
```

标题只作为展示 metadata，不作为唯一缓存主键。

## BC-14. 会员/付费页面标记不是最终播放授权事实

即使 UI 显示会员/付费，也应让当前合法 Session 的 Play API 返回真实授权结果。

禁止：

```text
看到 badge=会员
→ 默认调用共享凭据/第三方解析
```

正确：

```text
current session
→ official play request
→ AUTH/ENTITLEMENT result
→ 允许的正式 fallback
```

## BC-15. 写操作成功后再更新 UI，不做无依据乐观成功

点赞、收藏、关注、追番、评论等必须校验服务端结果。

如果 Mutation 返回失败：

- 保持旧状态。
- 给用户明确错误。
- 记录 sanitized code/stage。

不能为了“点击有反馈”先更新数字，然后忽略失败。

## BC-16. 评论发表需要完整输入与响应验证

评论输入至少处理：

```text
trim
空文本
长度
未登录
CSRF 缺失
HTTP/业务 code
频率限制
```

发送成功后应优先局部插入/刷新最新评论；失败不能无提示 `refreshPage()`。

## BC-17. Creator Seed 可以降低请求，但稳定 ID 必须进入 URL/Context

从前页传 `mid/name/avatar` 作为 Seed 是好技巧，但不能只依赖 `extra` 或当前 Item。

固定：

```text
creatorId → URL/Context stable fact
name/avatar → optional seed
Provider → missing seed 时恢复
```

否则历史恢复/收藏入口直接进 Creator 页时会丢关键参数。

## BC-18. 详情页 Transient State 与 Preference State 要分开

例如：

```text
日历展开 / 当前集范围 = transient
列表/双列偏好 = preference
```

页面关闭清 transient；Preference 才跨会话持久。

不要页面一打开无条件覆盖本应记忆的用户偏好，也不要把页面临时数组长期持久化。

## BC-19. `immersiveTheme` 成功样本不能推翻本项目已有实机标题栏风险

本样本多个 PGC 页面继续使用 `#immersiveTheme#`。截图可证明该样本当前页面可用，但本项目仍遵守：

```text
普通二级页优先 simple=true
```

只有目标程序当前实机验证沉浸式无标题叠加/返回异常时，才局部启用。

## BC-20. 自动更新检测不得绑死普通内容首屏

样本在首次进入时额外请求自建更新接口。

本项目已有正式 Remote Manager / channels / release / Bootstrap 体系时，不再复制独立的页面内自更新协议。

固定：

- 更新属于 Update Manager。
- 内容 Provider 不决定版本升级。
- 更新检查失败不得影响首页内容加载。

---

# 发布前针对账号型平台新增检查

- [ ] Renderer/Page 不直接读取原始 Cookie/Token。
- [ ] 凭据请求全部 HTTPS。
- [ ] 不存在可逆凭据分享功能。
- [ ] active session health 有 TTL，不在每页验证全部账号。
- [ ] Login WebView 不高频轮询敏感凭据。
- [ ] 所有 POST Mutation 统一通过 MutationClient + CSRF/Auth Provider。
- [ ] Mutation 失败不伪更新 UI。
- [ ] Cursor key 包含 account/route/query scope。
- [ ] Dynamic 类型由 Adapter Registry 分治，未知类型单项降级。
- [ ] Creator 主键可独立恢复，Seed 只是首屏优化。
- [ ] DASH video/audio 按轨道匹配，不机械凑数组。
- [ ] 弹幕/字幕 cache 以实体 ID 命名空间化。
- [ ] 第三方解析/远程脚本没有直接 eval 进入播放主链。
- [ ] 页面临时状态与长期 Preference 分离。
- [ ] Update Manager 与业务内容页解耦。