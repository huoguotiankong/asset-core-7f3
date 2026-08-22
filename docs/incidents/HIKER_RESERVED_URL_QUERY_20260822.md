# 海阔二级页业务参数 `url` 冲突事故（2026-08-22）

状态：已在黄豆短剧 `1.9.0-test.2 / Build 19002` 定点修复，等待实机复测。

## 1. 症状

黄豆短剧 `1.9.0-test.1` 首页和列表可正常显示，但点击任意短剧卡片进入 `hddjDetail` 后，海阔在自定义详情规则执行前直接弹系统错误：

```text
ArticleListModel-HttpRequestError
java.lang.IllegalArgumentException:
Expected URL scheme 'http' or 'https' but no colon was found
```

页面标题可以带入，说明 `hiker://page` 本身已打开；真正失败发生在 ArticleListModel 对 query 中 `url` 字段的预处理阶段。

## 2. 根因

Test1 卡片使用：

```text
hiker://page/hddjDetail?rule=&simple=true&url=<真实详情地址>&title=...
```

`url` 不是一个安全的普通业务参数名。海阔页面模型内部对 `url` 有自己的请求/路由语义，业务把实体 URL 塞进同名 query 后可能在页面 JS 运行前就被系统层解释。

因此这种错误无法依靠 `detail()` 内部 `try/catch` 兜底，因为错误发生得更早。

## 3. 统一修复

跨页业务参数使用 app/page 命名空间，不使用通用保留语义键：

```text
hddj_url
hddj_topic_url
hddj_title
hddj_cover
```

参数恢复：

```text
MY_PARAMS
→ getParam(app_specific_key)
→ 允许 http/https 绝对地址
→ 允许 /path 相对地址并由 Provider/Core abs() 归一
→ 其它值直接进入产品化错误态
```

卡片可以同时把专用参数写入 query 和 `extra`，但正确性不依赖通用 `url`。

## 4. 跨程序规则

以后所有海阔小程序：

- `hiker://page/<path>` 的业务实体参数不要命名为 `url`。
- 同理避免无必要使用 `rule/page/path/action` 等可能有框架语义的通用键；优先 `<appId>_<field>`。
- 关键实体参数至少同时有 URL query + Provider 恢复；`extra` 只做补充。
- 二级页网络请求前必须做 scheme/relative-path 校验，不把任意 query 原样交给 `request()`。
- 如果系统弹窗发生在自定义页面错误态之前，优先检查 Hiker 页面模型/路由参数冲突，而不是先改站点 API。

## 5. 黄豆短剧修复边界

`1.9.0-test.2` 仅替换：

- `ui_base.js`
- `pages_detail.js`
- `runtime.js`
- Test release / Bootstrap / Shell / metadata

Core、Content Pages、PlaybackAdapter 继续复用 Test1，避免为一个路由事故扩大回归范围；Stable 1.8.2 与 Local 1.8.2 均未修改。
