# 海阔自定义动作分发与播放器候选污染事故（2026-08-23）

## 1. 自定义 page action 必须同步 Bootstrap dispatcher

ACFun Alpha15 新增：

```text
ACFunBoot.run('searchCenter')
ACFunBoot.run('category')
```

但 Bootstrap v4/v5 的 `run()` 只支持：

```text
home / search / detail / comments / favorites / history / settings / diag
```

因此即使 Runtime 已经存在 `ac.searchCenter()`，海阔仍直接报：

```text
未知ACFun动作:searchCenter
```

永久规则：

```text
新增 pages.path / AFunBoot.run('xxx')
→ 同一版本同步扩展 Bootstrap dispatcher
→ Shell、Bootstrap、Runtime 三处 action 名逐项比对
→ 实机点击每个自定义页面入口
```

“Runtime 有函数”不能替代“Bootstrap 能路由到函数”。

## 2. 播放主按钮不要与收藏/评论使用同组可播放组件

ACFun Stable v042 详情曾连续生成：

```text
text_3  ▶ 播放
text_3  ☆ 收藏
text_3  💬 评论
```

在当前海阔播放器行为下，点击第一个播放项进入播放器后，后两个同组项会被展示在“当前播放/播放列表”中，造成：

```text
播放 / 收藏 / 评论
```

这不是 PlayModel 真正返回了三条媒体，而是详情页组件分组污染播放器候选。

推荐：

```text
主播放：text_1 / text_icon / 单独主卡点击
收藏/评论/复制：scroll_button / icon_small_* / longClick
PlaybackAdapter 最终只返回真实媒体 urls/names
```

播放器/阅读器只能消费标准 PlayModel/ChapterModel，不应夹带 UI 动作。

## 3. lazyRule 禁止重新加载早期 Core 后再调用媒体函数

旧详情按钮存在：

```js
eval(acfun_core_src_v018);
return ac.play(...);
```

如果当前 Release 后续模块已经重写 `ac.play`，该写法会在点击瞬间重新构造旧 Core，绕开当前 PlaybackAdapter。

永久规则：

```text
跨页/延迟点击
→ require 当前 Bootstrap
→ loadOnly 当前 Release
→ 调用当前 Adapter
```

禁止把旧 Core 源码缓存当作当前业务 Runtime 执行。
