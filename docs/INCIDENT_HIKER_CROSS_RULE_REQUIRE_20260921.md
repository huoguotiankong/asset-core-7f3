# 海阔跨规则模块加载事故：`hiker://page/...` 不可直接作为 `$.require()` URL

日期：2026-09-21
状态：用户实机确认

## 症状

115 磁链增强 Test1c/Test1d 尝试从测试规则复用已安装原版 `115.简` 的 `115Api` 时，实机弹出：

```text
ArticleListModel-HttpRequestError-msg:
java.lang.IllegalArgumentException:
Expected URL scheme 'http' or 'https' but no colon was found
```

## 已证实失败写法

```js
$.require('hiker://page/115Api?rule=115.简')
```

在当前海阔运行时，这类参数会进入 HTTP require/request 路径，因不是 `http/https` URL 而失败。

随后尝试 `fetch('hiker://home@规则名') → 解析 pages → eval 目标模块` 建桥，实机仍未形成稳定链，说明为了跨规则复用私有页面模块而绕运行时边界风险较高。

## 固定规则

- 不把 `hiker://page/...` 当作 `$.require()` 的模块源。
- 需要跨规则协作时，优先调用对方已经公开且实机验证过的页面/路由 contract，而不是跨规则加载其内部模块。
- 用户实机已经确认存在可用业务入口时，优先复用入口，不重复实现内部协议层。
- `node --check`、静态源码阅读均不能替代海阔实机验证。

## 本事故中的正确路径

原版 `115.简` 已由用户实机确认以下入口可以处理 magnet 并完成离线播放：

```js
"hiker://page/115Search?rule=115.简&page=fypage&kw=" + encodeURIComponent(url)
```

因此后续磁力君/JavDB 等调用 115 时直接使用该已验证路由，不再依赖跨规则 `115Api`。
