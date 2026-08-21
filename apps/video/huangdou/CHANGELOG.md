# 黄豆短剧 Changelog

> **定位：程序级长期技术记忆。** 后续开发/优化黄豆短剧前，必须先读本文件，再读三份全局文档、registry 和当前运行入口。未知技术细节统一标记待确认，禁止根据旧聊天记忆臆测。

## 当前基线
- 程序：黄豆短剧
- App ID：`huangdou`
- 当前业务基线：`1.8.2`
- 当前测试通道：`1.8.2-test.1 / Build 18201 / Shell 1.0.0-test`
- 当前本地通道：`1.8.2-local.1`
- Test 入口：`apps/video/huangdou/huangdou_remote_test_v1.txt`
- Local 源码基线：`huangdou.txt`
- Local 规则名：`黄豆短剧 本地版`
- 发布状态：Remote Test 已发布，尚未实机验证；原完整本地版保留
- 已登记能力：短剧 / 专题 / 搜索 / 收藏 / 历史
- 最后登记日期：2026-08-22

## 当前运行链

### Remote Test
```text
黄豆短剧 Shell
→ apps/video/huangdou/bootstrap_test_v1.js
→ libs/updater/remote_manager.js v2.0.1
→ apps/video/huangdou/releases/1.8.2-test.1/release.json
→ runtime.js
→ source_local_1.8.2.txt
→ 导出 hddj 业务模块
```

- Remote Manager 状态 ID：`huangdou-test`。
- 业务快照固定来自原 `huangdou.txt` blob `49aa0724e0aee42a582c56b68a8443bc8d31054a`。
- 本轮只迁移运行形态，不主动修改 1.8.2 业务逻辑。
- Test 未经海阔实机 smoke test，不得晋级 Stable。

### Local
- 原 `huangdou.txt` 完整代码继续保留。
- 规则仓库导入 Local 时仅把标题改为 `黄豆短剧 本地版`，并提升规则数值 version。
- Local 导入后业务代码完整内置，不依赖私人 GitHub 远程业务代码运行。

## 关键技术索引

### 数据源 / API
- 默认 Host：`https://hddj.tv`。
- 设置中已登记备用 Host：`https://hdmgdj.tv`、`https://huangdoudj.com`。
- 首页/分类/专题/详情以 HTML 解析为主，核心卡片标识包括 `dm-card`、`dm-topic-card`、`dm-detail-*`。

### 登录 / 鉴权 / 签名
- 播放前会尝试 `POST /account/guest` 建立访客会话。
- 播放令牌接口：`/play/token?r=<id>&s=<ep>`，返回 `t` 后组成 HLS 地址。

### 编码 / 解密 / 图片 / 播放
- 列表封面精确读取 `img.dm-card-img` 的真实 `src`，规避 `onerror` 占位图干扰。
- 详情封面优先读取 `dm-detail-poster` 内 `img.src`，再以 `og:image` 兜底。
- 播放地址：`/play/<id>/<ep>.m3u8?t=<token>#isVideo=true#`。
- 付费/锁定集不伪造直播放链，保留官网页面入口。

### 缓存 / 状态 / 本地数据
- 历史：`hddj_history`
- 收藏：`hddj_favs`
- 搜索历史：`hddj_search_history`
- 最后观看集：`hddj_last_<id>`
- Remote Test 额外使用 `hc_remote_state_huangdou-test` 命名空间及 `huangdou_remote_snapshot_182_test1` 快照缓存。

## 已知风险与禁止回退方案
- `1.8.2-test.1` 为首次 Remote Test，只完成仓库发布与静态链路，未经过海阔实机首页/详情/播放回归。
- Test 失败不得影响/删除 `huangdou.txt` 本地恢复基线。
- Stable 未建立前，不得把 Test 描述为正式稳定版。
- 未确认的协议/接口不得根据其他短剧程序套用。

## 回归测试清单
- [ ] 从“我的规则仓库”同步后能看到 Test / Local 两个通道
- [ ] 导入 Test 后规则名为 `黄豆短剧`
- [ ] 导入 Local 后规则名为 `黄豆短剧 本地版`，可与 Test 并存
- [ ] 首页/短剧列表
- [ ] 专题
- [ ] 搜索
- [ ] 详情/选集
- [ ] 播放
- [ ] 收藏
- [ ] 历史
- [ ] Test 冷启动远程加载
- [ ] 第二次启动缓存命中
- [ ] Local 脱离私人 GitHub 后核心功能仍能运行

## 故障与恢复记录
暂无新的实机故障记录。`1.8.2-test.1` 如出现问题，优先保留/导入 `黄豆短剧 本地版` 恢复使用，再定位 Shell / Bootstrap / Manager / snapshot 层。

---

## 版本记录

### 1.8.2-test.1 / 2026-08-22
- 首次发布 Remote Test。
- 新增独立 Shell / Bootstrap / Remote Manager 状态 / immutable release。
- 业务代码严格钉住 1.8.2 原本地源码快照。
- 原完整本地版继续保留，通过版本中心以 `黄豆短剧 本地版` 名称独立安装。
- 当前状态：已发布到 `asset-core-7f3@main`，待海阔实机验证。

### 1.8.2 / 2026-08-18
- 原云仓库本地基线。
- 已知功能：短剧 / 专题 / 收藏 / 历史。
