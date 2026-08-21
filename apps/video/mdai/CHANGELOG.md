# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实，未知信息标记“待确认”。

## 当前基线
- 程序：麻豆AI
- App ID：`mdai`
- 当前业务基线：`2.6.3`
- 当前测试通道：`2.6.3-test.1 / Build 26301 / Shell 1.0.0-test`
- 当前本地通道：`2.6.3-local.1`
- Test 入口：`apps/video/mdai/mdai_remote_test_v1.txt`
- Local 源码基线：`mdai.txt`
- Local 规则名：`麻豆AI 本地版`
- 发布状态：Remote Test 已发布，尚未实机验证；原完整本地版保留
- 已登记能力：视频 / 短剧 / 评论 / 收藏 / 历史 / 动态分类
- 最后登记日期：2026-08-22

## 当前运行链

### Remote Test
```text
麻豆AI Shell
→ apps/video/mdai/bootstrap_test_v1.js
→ libs/updater/remote_manager.js v2.0.1
→ apps/video/mdai/releases/2.6.3-test.1/release.json
→ runtime.js
→ source_local_2.6.3.txt
→ 导出 mdai 业务模块
```

- Remote Manager 状态 ID：`mdai-test`，与后续 Stable/其它程序隔离。
- 业务快照固定来自原 `mdai.txt` blob `0710346141c7b2d2acfe438ce0796d9b4474e72d`。
- 本轮只迁移运行形态，不主动修改 2.6.3 业务逻辑。
- Test 未经海阔实机 smoke test，不得晋级 Stable。

### Local
- 原 `mdai.txt` 完整代码继续保留。
- 规则仓库导入 Local 时仅把标题改为 `麻豆AI 本地版`，并提升规则数值 version。
- 导入后的 Local 业务代码完整内置，不依赖私人 GitHub 远程业务代码运行。

## 关键技术索引

### 数据源 / API
- 默认 Host：`https://mdcmai4.xyz`。
- 视频/短剧/帖子等主要使用 `/api/v1/` 接口。
- 分类为动态接口优先，失败时保留本地 fallback 分类。
- 短剧使用 `/api/v1/short-dramas/...`；视频使用 `/api/v1/videos/...`；评论使用 `/api/v1/comments...`。

### 登录 / 鉴权 / 签名
- 当前 2.6.3 基线未发现需要用户登录的核心播放鉴权；更深层协议待后续实机/接口维修时补录。

### 编码 / 解密 / 图片 / 播放
- 图片相对路径通过站点 Host / `/api/v1/image/proxy?path=` 归一化。
- 播放优先从 `videoUrl / m3u8Url / hlsUrl / playUrl / sourceUrl / src / url` 中挑选真实 HLS。
- 会清理 `.m3u8` 后无效尾巴与旧海阔播放标记。
- 默认极速直连，通过 `/api/v1/m3u8/proxy?path=` 并附 `Referer + User-Agent`。
- 兼容模式可使用 `cacheM3u8()`，失败自动回退直连。

### 缓存 / 状态 / 本地数据
- 历史：`mdai_watch_history_v1`
- 收藏：`mdai_favorites_v1`
- 搜索历史：`mdai_search_history_v1`
- 动态分类存在独立缓存与时间戳。
- Remote Test 额外使用 `hc_remote_state_mdai-test` 命名空间及 `mdai_remote_snapshot_263_test1` 业务快照缓存。

## 已知风险与禁止回退方案
- `2.6.3-test.1` 是首次 Remote Test，仅完成仓库结构和静态链路发布，尚未经过海阔实机首页/详情/播放/评论回归。
- Test 失败不得覆盖或删除 `mdai.txt` 本地恢复基线。
- Stable 未建立前，不得把 Test 描述为正式稳定版。
- 不得把其他站点的接口/解密方式未经验证直接套用。

## 回归测试清单
- [ ] 从“我的规则仓库”同步后能看到 Test / Local 两个通道
- [ ] 导入 Test 后规则名为 `麻豆AI`
- [ ] 导入 Local 后规则名为 `麻豆AI 本地版`，可与 Test 并存
- [ ] Test 首页/列表
- [ ] 短剧
- [ ] 搜索
- [ ] 详情/播放
- [ ] 评论
- [ ] 收藏/历史
- [ ] Test 冷启动远程加载
- [ ] 第二次启动缓存命中
- [ ] 断网后已缓存 Test 的可恢复行为
- [ ] Local 脱离私人 GitHub 后核心功能仍能运行

## 故障与恢复记录
暂无新的实机故障记录。`2.6.3-test.1` 如出现问题，直接保留/导入 `麻豆AI 本地版` 作为恢复基线，待定位 Remote Shell / Bootstrap / Manager / snapshot 哪层失败后再发下一 Test build。

---

## 版本记录

### 2.6.3-test.1 / 2026-08-22
- 首次发布 Remote Test。
- 新增独立 Shell / Bootstrap / Remote Manager 状态 / immutable release。
- 业务代码严格钉住 2.6.3 原本地源码快照，不顺手修改业务逻辑。
- 原完整本地版继续保留，通过版本中心以 `麻豆AI 本地版` 名称独立安装。
- 当前状态：已发布到 `asset-core-7f3@main`，待海阔实机验证。

### 2.6.3 / 2026-08-18
- 原云仓库本地基线。
- 已知能力：视频 / 短剧 / 评论 / 收藏。
