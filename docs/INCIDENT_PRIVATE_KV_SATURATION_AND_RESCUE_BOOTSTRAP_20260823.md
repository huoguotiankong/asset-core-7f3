# 事故：海阔规则私有 KV 饱和后，设置与远程自举也会被一起阻断

日期：2026-08-23

## 实机症状
麻豆传媒 Test11 已停止缓存完整 HTML，但历史版本遗留数据使规则私有 `setItem/getItem` 存储达到约 1MB。此时写入一个很小的设置值也会直接报：

`InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入`

浏览历史因捕获异常只会降级，但设置页 lazyRule 直接 `setItem`，因此整页弹 JSEngine 错误。

## 关键事实
- 不能把“本次写入很小”误判为“不会触发 1MB”。KV 已整体饱和时，任何新 `setItem` 都可能失败。
- 海阔当前文档中的私有持久文件 API 是 `saveFile / readFile / deleteFile`；旧方案里依赖 `clearItem` 清理 KV 不应再作为恢复合同。
- Remote Manager 的 `saveState()` 本身也使用 `setItem(hc_remote_state_...)`。因此救援版本如果通过 `minBuild` 强制迁移，可能在业务模块加载前就因保存 Remote State 再次失败。

## 强制恢复策略
1. 已确认 KV 饱和的规则，救援版本不得继续把关键状态写入 `setItem`。
2. 设置、媒体缓存/诊断、历史、收藏、分页模板、较大结构化缓存优先迁移到规则私有文件；完整 HTML 仍禁止持久化。
3. 救援 Bootstrap 可临时绕过 Remote Manager `load()` / `enforceMinimum()` 状态迁移，直接 `loadRelease(config, immutableDefaultRelease, false)`，确保旧 KV 无法阻断新代码启动。
4. 救援期的更新/回退入口应明确提示从云仓覆盖安装，不伪装 Remote State 仍然可写。
5. 新代码必须对所有残留 `setItem` 做热路径审计；无法立刻迁移的非关键缓存写入只能捕获失败，不能阻塞主任务。
6. 待实机确认新版本稳定后，再决定是否重建/清理旧规则状态；不要把“能继续写 KV”作为救援版本的前置条件。

## 发布门禁
出现过 1MB 私有存储事故的程序，新 Test/Candidate 发布前必须检查：
- Settings 是否还直接 `setItem`；
- History/Favorite/Media cache/diagnostic 是否有未捕获写入；
- Bootstrap/Remote Manager 是否可能在业务加载前写状态；
- `pageUrl`、分页模板等基础工具是否仍有隐蔽 `setItem`；
- 大型响应是否只驻留内存/文件而非 KV。

本事故由麻豆传媒 Test11 → Test12 实机恢复链触发，适用于后续所有远程海阔小程序。