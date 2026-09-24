# 小黄书 Test9 阅读源契约

依据用户上传 `✈️ 小黄书-夜明空` 阅读源（源内最后更新 2025-11-13）重建。

- 主站：`https://xchina.co/`；漫画独立站：`https://litu100.xyz`；发布页：`https://xiaohuangshu.me`。
- 列表卡片按内容类型读取 `.item fiction/photo/comic/amateur/video`；封面优先读取 `.img@style` 中 `url('...')`。
- 列表/详情封面 Referer 按阅读源使用主站 `https://xchina.co/`，漫画正文图片 Referer 使用 `https://litu100.xyz/`。
- 小说正文：`.fiction-body@p@html`；漫画：`.comic-img-box@html`；套图：`.photo-image@html`；自拍：`.amateur-image@html`。
- 视频：`main-container` 中优先提取 quoted m3u8；套图视频无 m3u8 时按 `var domain + var videos` 组合媒体地址。
- 搜索：小说 `/fictions/keyword-...`、套图 `/photos/keyword-...`、视频 `/videos/keyword-...`、漫画独立域 `/comics/kk-...`。
- `Just a moment` 属于站点验证状态，保留 X5/同会话 Cookie 验证入口。

Test9 的第一播放策略按阅读源语义直接交付解析出的原始媒体 URL；Header 兼容和网页嗅探仅作为回退，不再把 Test7 的强制 Header 拼接当作主链。
