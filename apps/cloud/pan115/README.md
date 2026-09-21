# 115.简

当前正式版：**Stable 1.1.0 / Build 2026092111**。

## 定位

自用 115 网盘小程序。保留原版登录、文件浏览、分享、离线和直链播放能力，重点强化其它海阔小程序通过 magnet 调用 115 离线播放的体验。

## 对外稳定调用协议

```js
"hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url)
```

调用方只负责传入 magnet，不应直接依赖 `115Api`、fileId、离线接口或播放器内部实现。

## Stable 1.1.0

- magnet BTIH/URL 去重；
- 当前任务聚焦；
- 完成任务 `fileId` 优先定位；
- 明显单主片直接播放；
- 多集/多段进入 `115OfflineResult` 选集；
- sample/preview/预告等噪声降权；
- 播放结果缓存复用；
- 失败任务重试；
- 原版 `player.resolve`、登录、Cookie、m115 加解密不改。

## 发布文件

- `stable.json`
- `latest.json`
- `channels.json`
- `manifest.json`
- `releases/1.1.0/release.json`
- `releases/1.1.0/installer.js`
- `CHANGELOG.md`
