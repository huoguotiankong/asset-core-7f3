# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实。

## 当前基线
- 程序：麻豆AI
- App ID：`mdai`
- Remote Stable：`2.6.3 / Build 26301 / Shell 1.0.0`
- Remote Test：`2.6.3-test.1 / Build 26301 / Shell 1.0.0-test`
- Local：`2.6.3-local.1`
- Stable 入口：`apps/video/mdai/mdai_remote_v1.txt`
- Test 入口：`apps/video/mdai/mdai_remote_test_v1.txt`
- Local 源码：`mdai.txt`
- Local 导入规则名：`麻豆AI 本地版`
- 发布状态：2026-08-22 用户实机确认 Remote Test 正常，已原样晋级 Stable；Local 独立保留
- 已登记能力：视频 / 短剧 / 搜索 / 详情播放 / 评论 / 收藏 / 历史 / 动态分类

## 当前运行链
### Stable
```text
麻豆AI Shell
→ apps/video/mdai/bootstrap_v1.js
→ libs/updater/remote_manager.js v2.0.1
→ apps/video/mdai/releases/2.6.3/release.json
→ 已验证 2.6.3-test.1 immutable runtime
→ 固定 source_local_2.6.3.txt 快照
→ mdai 业务模块
```
- Stable Remote Manager 状态 ID：`mdai`。
- Stable 直接复用本轮已经实机验证的 Test runtime，避免晋级时产生业务差异。
- 固定业务快照 blob：`0710346141c7b2d2acfe438ce0796d9b4474e72d`。

### Test
- 状态 ID：`mdai-test`，与 Stable 隔离。
- 当前 Test 与 Stable 为同一 2.6.3 业务基线；后续新功能必须从当前 Stable 向前开发。

### Local
- 完整本地业务代码继续保留在 `mdai.txt`。
- 规则仓库 Local 通道强制输出 `title=麻豆AI 本地版`，规则数值 version 为 `2026082207`。
- Local 与 Remote Stable/Test 名称不同，可独立并存；导入完成后不依赖私人 GitHub 远程业务代码运行。

## 关键技术索引
### 数据源 / API
- 默认 Host：`https://mdcmai4.xyz`。
- 视频/短剧/帖子主要使用 `/api/v1/` 接口。
- 分类动态接口优先，失败时保留本地 fallback 分类。
- 短剧：`/api/v1/short-dramas/...`；视频：`/api/v1/videos/...`；评论：`/api/v1/comments...`。

### 编码 / 图片 / 播放
- 图片相对路径通过 Host / `/api/v1/image/proxy?path=` 归一化。
- 播放优先从 `videoUrl / m3u8Url / hlsUrl / playUrl / sourceUrl / src / url` 选真实 HLS。
- 清理 `.m3u8` 后无效尾巴和旧播放标记。
- 默认 `/api/v1/m3u8/proxy?path=` 极速直连并附 `Referer + User-Agent`；兼容模式可 `cacheM3u8()`，失败回退直连。

### 本地状态
- 历史：`mdai_watch_history_v1`
- 收藏：`mdai_favorites_v1`
- 搜索历史：`mdai_search_history_v1`
- Test 快照缓存：`mdai_remote_snapshot_263_test1`

## 已验证与风险
- [x] Remote Test 首页/列表、短剧、搜索、详情/播放等用户本轮实机测试正常
- [x] `2.6.3-test.1` 可晋级 Remote Stable
- [x] Stable 业务 release 冻结并保留 Test 独立状态
- [ ] Local 新名称 `麻豆AI 本地版` 仍建议下次导入时顺手确认显示结果
- Stable release 不得原地覆盖；后续修复新建 Test/release。

---
## 版本记录
### 2.6.3 Stable / 2026-08-22
- 用户明确反馈测试正常。
- `2.6.3-test.1 / Build 26301` 原样晋级 Remote Stable。
- 新增 Stable Shell、Bootstrap、stable.json、latest.json 和 immutable release 描述。
- Local 保留完整本地代码，版本中心导入名固定为 `麻豆AI 本地版`。

### 2.6.3-test.1 / 2026-08-22
- 首次 Remote Test；业务严格钉住原 2.6.3 本地源码快照。
- 用户随后完成实机验证并确认正常。

### 2.6.3 / 2026-08-18
- 原本地基线；已知能力：视频 / 短剧 / 评论 / 收藏。
