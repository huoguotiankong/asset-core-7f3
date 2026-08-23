# 中文规则名二级页 `rule` 编码事故（2026-08-23）

## 现象
麻豆传媒 Test2 首页可以正常渲染，但点击分类、影片卡等内部 `hiker://page/...` 路由时，海阔提示：

```text
找不到“%E9%BA%BB%E8%B1%86%E4%BC%A0%E5%AA%92”这个小程序
```

其中 `%E9...` 是中文规则名“麻豆传媒”的 `encodeURIComponent` 结果。

## 根因
错误写法：

```js
'hiker://page/xxx?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'
```

目标海阔路由链在匹配规则名时没有先把 `rule` 参数还原为中文，而是直接把百分号编码字符串当作规则名。英文规则名通常不会暴露这个问题，因此从英文样本复制路由 helper 容易漏掉。

## 已验证正确模式
对于同一小程序内部二级页，优先使用：

```js
'hiker://page/xxx?rule=&simple=true'
```

让二级页继承当前规则上下文。业务参数仍单独 `encodeURIComponent`：

```js
var u='hiker://page/xxx?rule=&simple=true';
u+='&id='+encodeURIComponent(id);
```

该模式已在现有中文规则（麻豆AI）稳定使用，并用于麻豆传媒 Test3 修复实机故障。

## 固定规则
- 中文规则内部二级页默认 `rule=&simple=true`，不要把中文规则名编码后塞入 `rule`。
- 若必须显式跨规则跳转，先使用目标海阔版本已经实机验证的规则名传递方式，不能仅凭 URL 编码常识推测。
- 搜索输入、筛选等回调如果最终进入内部页面，也优先进入 `hiker://page/...?...&rule=&simple=true`，不要重新拼一个编码后的中文规则名。
- 出现“找不到 `%E...` 小程序”时，先查路由上下文和 `rule` 参数，不要误判成页面模块未注册或 Remote Manager 没加载。
