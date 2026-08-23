# XVideos

全新独立开发的海阔视界 XVideos 小程序。默认自用远程版；当前仅有 Test 通道，未建立 Stable。

## Product Blueprint

- Home：紧凑红黑品牌区 + 搜索/分类/演员/频道/账号 + 账号与本地高频入口 + 视频 Feed。
- Search：`k / sort / datef / durf / quality` 组合筛选。
- Detail：LD+JSON 元数据、上传者、演员、标签、相关推荐、评论入口、本地收藏。
- Playback：`html5player.setVideoHLS()` + 1080/High/Low MP4；HLS master 继续展开分辨率。
- Account：X5 官方网页登录后同步 Cookie；站内喜欢、Watch Later、History。
- Creator：Pornstars / Channels / Profiles。
- Local：独立收藏与浏览足迹。
- Settings：域名覆盖、缓存、Remote Manager 更新/回退。

Test1 不伪造未确认站点接口；评论正文与公开收藏夹只在真实 DOM 中识别到实体时展示。
