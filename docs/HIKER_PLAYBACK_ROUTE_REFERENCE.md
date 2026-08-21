# 海阔播放路线速查（研究辅助）

> 非三份启动必读文档。完整规范以 `HIKER_APP_DEVELOPMENT_GUIDE.md` 为准。

```text
已有 directUrl
→ 官方/APP Play API
→ 静态页面 player/source 字段解析
→ 已知字段解码/解密
→ 必要 HLS 修正/Proxy
→ fetchCodeByWebView 后结构化源码解析
→ 可信委托解析器
→ video://
→ webRule://
→ x5Rule://
→ 原网页播放器
```

术语：

- 结构化免嗅：前五类，不依赖网页资源嗅探器来猜媒体请求。
- 浏览器辅助源码：`fetchCodeByWebView`，等待 JS 渲染后解析 DOM/源码。
- 委托解析：`lazyParse/通免/魔断/第三方解析接口`；内部实现未知时不得直接宣称“真免嗅”。
- 网页嗅探：`video:// / webRule:// / x5Rule://`。
- `x5Play://` 等属于把已知 URL 交给播放器，不是获取真实媒体地址的方法。
