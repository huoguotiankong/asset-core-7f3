# 115.简

当前正式版：**Stable 1.2.0 / Build 2026092220**。  
晋级来源：**1.2.0-test.18 / Build 2026092219**，已完成实机验证。

## 定位

自用 115 网盘小程序。保留原版登录、文件浏览、分享、离线和直链播放能力，重点强化其它海阔小程序通过 magnet 调用 115 离线播放，以及常用文件管理/回收站能力。

## 对外稳定调用协议

```js
"hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(url)
```

调用方只负责传入 magnet，不应直接依赖 `115Api`、fileId、离线接口或播放器内部实现。

## Stable 1.2.0

- 保留磁链 BTIH/URL 去重、`fileId` 优先定位、单主片直放、多集选集、播放缓存与失败重试；
- 离线保存目录优先 `根目录/海阔视界`，其次 `云下载/离线下载`，最后才回退根目录；
- 状态跟踪继续采用单线程、有上限、低频确认，禁止恢复高并发轮询；
- 首页采用已验证的紧凑 App 化布局与正确的内部路由；
- 新增独立文件管理和回收站入口；
- 普通文件/文件夹支持删除到回收站；
- 回收站支持列表、还原与输入 115 安全密码后的永久删除；
- 普通删除复用已验证 `revertRecycleBin()` 的认证 request 传输形态，只改写 `/rb/revert → /rb/delete` 与 `rid → fid[0]`；
- 登录/Cookie、m115 加解密、原始文件浏览、115 分享、磁链播放和 `player.resolve()` 不改。

## 发布文件

- `stable.json`
- `latest.json`
- `channels.json`
- `manifest.json`
- `releases/1.2.0/release.json`
- `releases/1.2.0/installer.js`
- `CHANGELOG.md`

Stable 1.2.0 的安装器以已经存在的同名 `115.简` 为基础，保持登录命名空间；当前 Test18 用户可直接原样晋级。Test17 也可由 Stable 安装器补齐最终删除模块后晋级；更旧基线先覆盖到 Test18 再晋级，避免重建未经验证的累计补丁链。
