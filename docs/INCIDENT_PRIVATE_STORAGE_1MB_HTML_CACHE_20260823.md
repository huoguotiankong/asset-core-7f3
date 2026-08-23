# 海阔私有存储 1MB 与大型 HTML 缓存事故（2026-08-23）

## 事故
麻豆传媒 Test1 在真实设备首次启动时，JSEngine 直接报：

```text
InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入
```

故障发生在首页 Provider 把完整网页 HTML 写入 `setItem()` 时。页面原文超过海阔私有 KV 的可承受体积，导致业务解析还没开始就被中止。

2026-08-23 Test3 又出现第二种同类实机故障：业务层已经不再把完整 HTML 写 `setItem`，但影片详情仍通过 `fetchCodeByWebView()` 作为大页面 fallback，进入二级详情时再次触发同样的 1MB 私有存储错误。由此确认：**不能只排查自己代码里的 `setItem(body)`；任何会把大型渲染后 DOM/源码整体回传到私有存储链路的 helper，都必须按大文本风险处理。**

2026-08-23 Test5 又确认第三种更隐蔽的失败模式：新版本已经彻底停止写大型 HTML，但旧 Test1/Test3 曾把“具体详情 URL 的完整 HTML”写入 `madou_v1_<hash>` / `madou_v2_<hash>`。Test5 详情改走 `fetchPlainHtml()` 后不会再经过旧 `clearHtmlCache(detailUrl)`，因此这些历史大值仍留在私有 KV。此时真正报错的可能只是一个很小的浏览历史 `setItem`。由此确认：**1MB 不是只看“这次 value 多大”，还要把“整个私有存储已经被旧大值占满”作为第一类故障模型。**

## 固定结论
`setItem/getItem` 只用于小型状态，不用于保存大型网页原文、接口大响应、图片 Base64、M3U8 大文本或其它可能接近 MB 级的内容。

推荐分层：

```text
setItem / putMyVar
→ 小型状态、开关、ID、时间戳、短 URL、解析后的轻量索引

运行内存
→ 当前页面本次请求得到的完整 HTML / JSON 大响应

hiker://files / 文件缓存（确有跨页持久化需要时）
→ 大文本、大 JSON、可重建缓存
```

## 开发规则
1. 不允许通用 `fetchHtml()` 默认把完整 body 写 `setItem`。
2. 若确实需要 KV 缓存，写入前必须做长度门禁，并且总量仍要可控。
3. 对大型站点优先缓存“解析后的业务模型”，而不是缓存整页源码。
4. 旧版本已经写过 raw HTML 时，新版本要提供 migration/cleanup，不能只换新 key 让旧大值永久占空间。
5. **旧大值 migration 必须覆盖所有曾经写过的业务 URL 类型，不只清首页。** 如果旧版曾缓存详情/分类/搜索页，新版进入对应页面前必须能按旧 prefix + URL hash 精确清理旧 key。
6. 当私有 KV 已接近 1MB 时，后续一个很小的 `setItem` 也可能报同样错误；因此错误发生点不等于污染源。先查旧 raw HTML/Base64/大 JSON 占用，再查当前写入。
7. 辅助能力（浏览历史、收藏、诊断）写 KV 失败时不得拖垮详情/播放/阅读主任务。对辅助 `setItem` 必须捕获配额异常并产品化降级。
8. 清理旧大值优先使用真实删除 API（如目标环境可用的 `clearItem/removeItem`）；不要只用 `setItem(key,'')`，因为存储已经超限时连“写空串”都可能失败。
9. 出现 `私有存储内容过大` 时，先查所有 `setItem` 大字符串，同时检查 `fetchCodeByWebView`、网页渲染源码回传、Base64/data URI、本地历史/收藏序列化等隐性大文本路径，不要误判成网站反爬、DOM 解析或 JS 语法错误。
10. 大型详情/列表页若普通 `fetch/request` 已能得到业务字段，不得再为了“更完整 DOM”默认调用 `fetchCodeByWebView`。
11. 必须使用 WebView 时，优先在 WebView 内直接提取小型结构化结果，只回传必要字段；不要把整页渲染 HTML 当通用 Provider 返回值。
12. 历史/收藏/最近播放等 KV 列表必须限制字段长度、条数和总 JSON 体积；data URI/Base64 图片不得直接进入长期 KV。
13. 修复已发布 Test/Candidate 时使用新 Build/新 Release，不原地覆盖旧 URL。

## 麻豆传媒修复
### Test2 / Build10102
- 完整 HTML 仅保存在当前运行内存。
- 清理 Test1 已知 raw HTML key。
- 新请求会主动清理同 URL 的旧 raw HTML slot。
- 仅持久化 HTML 长度、时间戳等小诊断值。
- 其它小型分页模板、收藏、历史 KV 保持不变。

### Test4 / Build10104
- 详情/播放取页新增 `fetchPlainHtml()`，只使用普通 `fetch/request`，不再把 `fetchCodeByWebView` 当大型页面通用 fallback。
- `fetchHtml()` 继续只保存在当前运行内存。
- 历史/收藏加入字段裁剪、data URI 丢弃、条数与总 JSON 体积门禁。
- 内部页面直接加载当前 Test4 Bootstrap，减少升级后旧 page module 继续调用历史 Provider 的风险。
- Test4 后续被实机确认存在独立 JSEngine SyntaxError，因此其业务模块已隔离，不作为恢复基线。

### Test5 / Build10105
- 从最后可启动的 Test3 基线重新实现层级分类与安全详情请求。
- 实机确认首页与分类可以运行，但详情仍出现 1MB 报错，从而定位到“旧详情 raw HTML key 仍占用整个私有存储”的第三种事故模型。

### Test6 / Build10106
- 进入详情前按当前 detail URL 同时清理 `madou_v1_` 与 `madou_v2_` 的 raw HTML key / `_ts` key。
- 首页 legacy key 在模块加载时再次清理。
- 历史/收藏总 JSON 体积门槛进一步收紧；异常大旧列表直接清理。
- 历史/收藏 `setItem` 失败时只降级辅助能力，不再让影片详情整体退出。
