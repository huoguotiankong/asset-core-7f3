# 海阔私有存储 1MB 与大型 HTML 缓存事故（2026-08-23）

## 事故
麻豆传媒 Test1 在真实设备首次启动时，JSEngine 直接报：

```text
InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入
```

故障发生在首页 Provider 把完整网页 HTML 写入 `setItem()` 时。页面原文超过海阔私有 KV 的可承受体积，导致业务解析还没开始就被中止。

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
5. 出现 `私有存储内容过大` 时，先查所有 `setItem` 大字符串，而不是误判成网站反爬、DOM 解析或 JS 语法错误。
6. 修复已发布 Test/Candidate 时使用新 Build/新 Release，不原地覆盖旧 URL。

## 麻豆传媒修复
Test2 / Build10102：
- 完整 HTML 仅保存在当前运行内存。
- 清理 Test1 已知 raw HTML key。
- 新请求会主动清理同 URL 的旧 raw HTML slot。
- 仅持久化 HTML 长度、时间戳等小诊断值。
- 其它小型分页模板、收藏、历史 KV 保持不变。
