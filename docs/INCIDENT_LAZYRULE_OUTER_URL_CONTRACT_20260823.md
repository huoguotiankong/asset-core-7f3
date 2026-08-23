# INCIDENT — `$().lazyRule()` 外层 URL 合同与 HttpParser scheme 异常

日期：2026-08-23

## 实机现象

911爆料 Test4 详情已成功解析出多条媒体，但点击播放仍抛：

`java.lang.IllegalArgumentException: Expected URL scheme 'http' or 'https' but no colon was found`

堆栈经过 `LazyRuleParser -> HttpParser`，错误发生在业务 lazyRule 函数执行前。

## 根因

错误写法：

```js
$(mediaJson, articleUrl).lazyRule(function(boot, media, ref){
  // ...
}, bootstrap, mediaJson, articleUrl)
```

海阔 `$().lazyRule()` 的外层 `$()` 第一参数是 URL 上下文，会进入 URL/HttpParser 处理。把 JSON、标题、封面、状态文本等普通字符串放在第一参数位置，会在 lazyRule 正文执行前触发 URL scheme 校验异常。因此后续业务函数内部再做媒体 URL 校验也无法修复。

## 正确合同

1. 外层始终使用合法 URL：

```js
$(articleUrl).lazyRule(function(playModel){
  return playModel;
}, playModelJson)
```

2. 普通参数只作为 `.lazyRule(function, arg1, arg2...)` 的函数参数传递，不放进 `$()` URL 位置。
3. 如果详情阶段已经得到单线路真实媒体 URL，优先直接把媒体 URL 交给组件，不需要 lazyRule。
4. 多线路需要返回 PlayModel 时，可用合法 article/detail URL 作为外层 lazyRule URL，再把 PlayModel JSON 作为函数参数返回。
5. 收藏、历史、设置等动作同样遵守：`$(validUrl).lazyRule(...)`，不要写成 `$(url,title,pic,desc).lazyRule(...)`。

## 回归检查

- 搜索整个新增/修改模块中的 `).lazyRule(`。
- 检查每个 `$(` 的第一参数是否明确为 `http://`、`https://`、`hiker://` 等该动作允许的合法 URL 上下文。
- 播放链同时区分两类错误：
  - `LazyRuleParser/HttpParser scheme`：先查外层 `$()` URL。
  - 播放器收到坏媒体 URL：再查媒体 normalize/PlayModel。

## 来源任务

911爆料 `0.1.0-test.5 / Build10105`，由用户海阔实机截图闭环确认 Test4 的 scheme 异常仍发生在 LazyRuleParser 层后建立。
