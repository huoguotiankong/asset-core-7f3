# 海阔原生文本 HTML / Emoji SVG 渲染事故（2026-08-23）

## 现象
汤头条 `0.1.0-test.1` 首轮实机截图出现：

- `scroll_button/text_4/text_1` 等原生文本区域直接显示 `<font color=...><b>推荐</b>`、`<b>今日推荐</b>` 源码，而不是富文本效果。
- Data-URI SVG 内直接放 Emoji 字符作为功能图标时，设备字体/系统 SVG 渲染环境可能把它显示成异形字符，视觉结果不可控。

## 根因
不能把“某些组件/某些设备能识别 HTML”推广成“所有原生 `title/desc` 都支持 HTML”。海阔不同 `col_type`、版本和渲染链对 HTML/富文本支持不同。SVG `<text>`/Emoji 又依赖字体和 glyph 支持，跨设备稳定性差。

## 固定规则
1. 普通原生 `title/desc` 默认按纯文本处理；没有明确实机证据时，不写 `<font>/<b>/<small>` 等 HTML。
2. 选中态优先使用纯文本符号、组件背景/状态属性或已验证的原生样式，而不是 HTML 着色。
3. 需要富文本时使用明确支持的 `rich_text` 或已实机验证的组件能力，并在目标设备截图闭环。
4. SVG 功能图标优先使用几何 `<path>/<rect>/<circle>`，不要依赖 Emoji 或系统字体 glyph。
5. UI 大改必须看真实截图；源码“看起来有颜色/图标”不等于设备会正确渲染。

## 恢复策略
已经进入 Test 的错误 UI 不原地覆盖同 build。新建更高 build/release，替换 UI 模块并提升 Shell/Bootstrap 缓存键；Stable 不受影响。
