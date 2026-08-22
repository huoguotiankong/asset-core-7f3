# Incident：Hanime1 楼中楼“优化后失效”事故（2026-08-22）

## 1. 结论

Hanime1 的更多回复曾经在 Test24 实机可用，但打开偏慢。后续为了优化速度与修复回复身份对应，连续改写 comment/thread identity mapping，最终从“能打开但慢”退化为“原评论显示有 12 条回复，详情却 0 条”。

核心教训：**已经实机工作的业务身份映射与协议链，不应为了性能优化而同时改写。性能优化必须优先发生在同一协议契约内部。**

推荐顺序：

```text
先冻结已工作 identity mapping / endpoint / parameter
→ 测量重复请求与渲染开销
→ 合并重复请求
→ 加短缓存（只缓存成功非空结果）
→ 优化 UI 渲染
→ 实机回归
→ 只有确认原协议本身失效时才改 identity mapping
```

## 2. 已验证时间线

### Test23 / Test24：回复可用但偏慢

Test1/Test12 的原始回复协议：

```text
主评论 c.id
→ /loadReplies?id=<commentId>
→ JSON.replies
→ .comment-index-text 两节点一条回复
```

Test23 为楼中楼头像增加 XPath 后，`P.replies()` 会先调用旧 `oldReplies(commentId)` 获取正文，再第二次请求同一个 `/loadReplies?id=<commentId>` 只为了抽取头像。

也就是：

```text
第一次 /loadReplies → 回复正文
第二次 /loadReplies → 回复头像
```

Test24 的实机反馈是“更多回复可以打开，但速度比较慢”。因此这一阶段应视为：
- identity mapping：工作。
- endpoint/parameter：工作。
- 正文 parser：工作。
- 主要性能问题之一：同一 thread 重复请求。

### Test25 以后：优化开始改变 identity mapping

后续先后尝试：
- commentId 首次重绑。
- `videoId + absolute index` 二次定位。
- 作者 + 正文指纹重新匹配 thread。

Test31 / Test32 / Test33 实机均未恢复更多回复，最终出现“原评论显示 N 条，回复页 0 条”。

这说明问题不应该继续通过增加启发式 thread 猜测来解决。

### Test34：同时改 Community 导致主评论也回归

Test34 同时重写 `P.comments()` 和 replies 关联，实机直接把主评论从可见变成 `0 条评论`，属于典型的 failure-domain 扩大。

Test37 回到 Test32 主评论链后，主评论立即恢复，进一步证明：
- 主评论链不应与楼中楼维修绑在一起。
- 修 replies 时应严格限制修改边界。

## 3. Test38 恢复策略

Test38 只修改 replies，不覆盖已在 Test37 实机恢复的 `P.comments()`：

```text
评论卡已有 c.id
→ 直接 /loadReplies?id=c.id
→ 同一响应同时解析正文 + XPath 头像
→ 成功非空结果短缓存 30 秒
→ 空结果不缓存
```

相比 Test23/Test24：
- identity mapping 不变。
- endpoint 不变。
- parameter 不变。
- parser 主结构不变。
- 只把正文和头像由两次请求合并为一次。

这是以后处理“已工作功能性能优化”的标准范式。

## 4. 永久规则

1. 已实机工作的 ID / thread / entity mapping，默认冻结。
2. “慢”与“错”必须分开维修；性能维修不顺便改协议身份映射。
3. 同一 endpoint 重复请求优先合并响应，不通过重建业务 ID 来提速。
4. 空结果不应长缓存，否则一次 transient failure 会伪装成稳定业务状态。
5. 评论主链与楼中楼链必须分模块；楼中楼维修不得无必要覆盖 `P.comments()`。
6. 启发式 index/fingerprint mapping 只能作为诊断实验，未经过实机确认不得替代已工作协议。
7. 用户实机已经证明“旧版能用、新版不能用”时，优先 diff 最后工作版本与首个坏版本，而不是继续在最新版叠补丁。
8. 对性能问题，首先检查：重复网络请求、串行请求、重复 DOM parse、重复头像请求、无效缓存与重复渲染。

## 5. 适用范围

这条规则不仅适用于 Hanime1 评论，也适用于：
- 账号实体 ID 与 Cookie/session 映射。
- 片单/收藏实体 ID。
- 漫画章节 ID。
- 播放 source/episode ID。
- 书源章节/段评 ID。
- 任意“原本可用，只是慢”的 Provider/Adapter 链。

性能优化默认遵循：**保持协议身份不变，先减少重复工作。**
