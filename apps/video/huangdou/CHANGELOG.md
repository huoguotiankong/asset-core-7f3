# 黄豆短剧 Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，必须先读本文件，再读三份全局文档、registry 和当前运行入口。只记录已验证事实。

## 当前基线
- 程序：黄豆短剧
- App ID：`huangdou`
- Remote Stable：`1.8.2 / Build 18201 / Shell 1.0.0`
- Remote Test：`1.8.2-test.1 / Build 18201 / Shell 1.0.0-test`
- Local：`1.8.2-local.1`
- Stable 入口：`apps/video/huangdou/huangdou_remote_v1.txt`
- Test 入口：`apps/video/huangdou/huangdou_remote_test_v1.txt`
- Local 源码：`huangdou.txt`
- Local 导入规则名：`黄豆短剧 本地版`
- 发布状态：2026-08-22 用户实机确认 Remote Test 正常，已原样晋级 Stable；Local 独立保留
- 已登记能力：短剧 / 专题 / 搜索 / 详情选集 / 播放 / 收藏 / 历史

## 当前运行链
### Stable
```text
黄豆短剧 Shell
→ apps/video/huangdou/bootstrap_v1.js
→ libs/updater/remote_manager.js v2.0.1
→ apps/video/huangdou/releases/1.8.2/release.json
→ 已验证 1.8.2-test.1 immutable runtime
→ 固定 source_local_1.8.2.txt 快照
→ hddj 业务模块
```
- Stable Remote Manager 状态 ID：`huangdou`。
- Stable 直接复用本轮已经实机验证的 Test runtime，避免晋级时产生业务差异。
- 固定业务快照 blob：`49aa0724e0aee42a582c56b68a8443bc8d31054a`。

### Test
- 状态 ID：`huangdou-test`，与 Stable 隔离。
- 当前 Test 与 Stable 为同一 1.8.2 业务基线；后续新功能必须从当前 Stable 向前开发。

### Local
- 完整本地业务代码继续保留在 `huangdou.txt`。
- 规则仓库 Local 通道强制输出 `title=黄豆短剧 本地版`，规则数值 version 为 `2026082208`。
- Local 与 Remote Stable/Test 名称不同，可独立并存；导入完成后不依赖私人 GitHub 远程业务代码运行。

## 关键技术索引
### 数据源 / API
- 默认 Host：`https://hddj.tv`；备用：`https://hdmgdj.tv`、`https://huangdoudj.com`。
- 首页/分类/专题/详情以 HTML 解析为主，关键结构：`dm-card`、`dm-topic-card`、`dm-detail-*`。

### 登录 / 播放
- 播放前尝试 `POST /account/guest` 建立访客会话。
- Token：`/play/token?r=<id>&s=<ep>`。
- 播放：`/play/<id>/<ep>.m3u8?t=<token>#isVideo=true#`。
- 付费/锁定集不伪造直播放链，保留官网入口。

### 图片
- 列表封面读取 `img.dm-card-img` 真正 `src`，规避 `onerror` 占位图。
- 详情封面优先 `dm-detail-poster img.src`，再用 `og:image`。

### 本地状态
- 历史：`hddj_history`
- 收藏：`hddj_favs`
- 搜索历史：`hddj_search_history`
- 最后观看集：`hddj_last_<id>`
- Test 快照缓存：`huangdou_remote_snapshot_182_test1`

## 已验证与风险
- [x] Remote Test 首页/列表、专题、搜索、详情/选集、播放等用户本轮实机测试正常
- [x] `1.8.2-test.1` 可晋级 Remote Stable
- [x] Stable 业务 release 冻结并保留 Test 独立状态
- [ ] Local 新名称 `黄豆短剧 本地版` 仍建议下次导入时顺手确认显示结果
- Stable release 不得原地覆盖；后续修复新建 Test/release。

---
## 版本记录
### 1.8.2 Stable / 2026-08-22
- 用户明确反馈测试正常。
- `1.8.2-test.1 / Build 18201` 原样晋级 Remote Stable。
- 新增 Stable Shell、Bootstrap、stable.json、latest.json 和 immutable release 描述。
- Local 保留完整本地代码，版本中心导入名固定为 `黄豆短剧 本地版`。

### 1.8.2-test.1 / 2026-08-22
- 首次 Remote Test；业务严格钉住原 1.8.2 本地源码快照。
- 用户随后完成实机验证并确认正常。

### 1.8.2 / 2026-08-18
- 原本地基线；已知功能：短剧 / 专题 / 收藏 / 历史。
