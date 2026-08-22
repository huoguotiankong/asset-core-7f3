# Incident：海阔 text_4 等密集文本组件不能只依赖 Emoji 表达关键状态

日期：2026-08-23
来源：黄豆短剧 `1.9.0-test.5`

## 实机事实
黄豆详情解析得到 `ep.locked === true`，点击该集时 PlaybackAdapter 也收到 `locked=true` 并正确弹出官网付费/授权提示，证明权限状态链正确。

但 Test5 在 `text_4` 集数标题使用 `第N集 🔒` 时，实机选集网格只显示 `第N集`，锁 Emoji 不显示；同页面 `text_1` 描述中的 `🔒` 可以显示。

结论：部分海阔组件/Android 字体渲染路径对 supplementary-plane Emoji 的支持不一致，尤其密集 `text_4` 网格不能把 Emoji 当唯一状态载体。

## 固定规则
- 付费、锁定、失败、警告、VIP 等关键状态必须有普通文本 fallback。
- `text_3/text_4/text_5/flex_button/scroll_button` 优先使用 `【锁】`、`付费`、`VIP` 等稳定文本；Emoji 只能增强，不能承担唯一语义。
- Renderer 必须保证即使 Emoji 被系统字体吞掉，用户仍能明确区分状态。
- 权限 UI 标识与真实授权结论继续分离：页面 locked 负责提示，最终能否播放由 Play API / 媒体响应确认。

## 当前修复
黄豆短剧 `1.9.0-test.6 / Build19006` 将：
- `第N集 🔒` → `【锁】第N集`
- `🔒 第 N 集 · 付费/解锁` → `【锁】第 N 集 · 付费/解锁`
- 选集说明同步改为 `【锁】为官网付费/需授权内容`

PlaybackAdapter 完整复用 Test4，不改变授权/媒体协议。
