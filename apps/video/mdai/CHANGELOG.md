# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 当前基线
- App ID：`mdai`
- Remote Stable：`2.6.3 / Build 26301 / Shell 1.0.0`（已实机验证，继续冻结）
- Remote Test：`2.7.0-test.4 / Build 27004 / Shell 1.1.3-test`
- Local：`2.6.3-local.1`
- Stable 入口：`apps/video/mdai/mdai_remote_v1.txt`
- Test 入口：`apps/video/mdai/mdai_remote_test_v5.txt`
- Local：`mdai.txt`，导入名 `麻豆AI 本地版`

## 当前 Test 运行链
```text
mdai_remote_test_v5.txt / rule version 2026082301
→ bootstrap_test_v5.js / state id=mdai-test / minBuild=27004
→ Remote Manager v2.0.1
→ releases/2.7.0-test.4/release.json
→ core.js          复用 Stable 2.6.3 协议数据桥
→ playback.js      复用 2.7 Test1 PlaybackAdapter
→ ui_base.js       复用 2.7 Test1 Native Design System
→ pages_content.js 复用 Test2 CatalogAdapter / 原页筛选
→ pages_detail.js  复用 Test1 Detail
→ settings_icon.js Test4：Raw HTML / Manifest 官网图标检测
→ runtime.js       Test4 组合导出
```

## 2.7 UI / Catalog 现状
Test1 首轮实机确认片库存在：分类缺项/乱序、`scroll_button` 溢出 `>`、分类点击持续打开新页面。

Test2 已修复：
- 视频/短剧同页切换。
- 原创/国产/字幕固定等宽三栏。
- CatalogAdapter 以已验证分类骨架为稳定基线，再合并动态接口；接口少项不再让已知分类消失，新增真实分类仍可追加。
- 分类/排序/筛选全部使用 `lazyRule → 状态 → refreshPage(false)`，禁止连续压入新 `hiker://page`。
- 高级筛选压成固定四栏，选中态只保留单一浅色背景。

待实机确认：
- [ ] 片库不再出现 `>` 溢出。
- [ ] 连续切换分类后返回一次即可退出片库。
- [ ] 分类骨架完整且动态新增可追加。

## 官网图标检测事故：Test3 → Test4
### Test3 实机失败
用户实机点击“设置 → 官网图标检测”后提示：

```text
图标检测失败：接口返回不是有效 JSON：<!DOCTYPE html> ...
```

这证明官网首页本身已经成功返回 HTML，但 Test3 错误复用了 `m.request('/')`。该 Core Request Client 面向 `/api/v1/*` JSON 数据，会在 HTML 资源解析器真正执行前先做 JSON 断言，因此 HTML 被误判为“接口错误”。

### 固定规则
- **数据 API Client 与 Raw Resource Client 必须分层。** 强制 JSON/schema 的 API Client 不能直接复用来获取官网 HTML、favicon、manifest、robots、静态脚本或图片元数据。
- ResourceDetector 应直接使用原始 `request/fetch`，先按响应类型判断，再交给 HTML/Manifest/Image Adapter。
- “收到 `<!DOCTYPE html>`”在 HTML ResourceDetector 中是正常输入，不应被 JSON Client 先拦截。
- 图标来源优先级：站点 HTML/manifest 自己声明 > 已验证仓库静态资产 > 第三方 favicon 发现服务；禁止继续猜 `/favicon.ico`、`/logo.png`。

### Test4 实现
1. 直接 `request(currentHost + '/')` 获取原始 HTML，不经过 `m.request()`。
2. 解析：
   - `rel=icon`
   - `apple-touch-icon`
   - `msapplication-TileImage`
   - `rel=manifest` → `manifest.icons[]`
3. 相对地址统一转为当前 Host 绝对地址，忽略 data URI。
4. 根据图标类型与 `sizes` 评分，优先站点自己声明的高规格资源。
5. 成功后保存：
   - `mdai_official_icon_detected`
   - `mdai_official_icon_source`
6. 直接返回 `copy://<真实地址>`；设置页再次打开可继续复制缓存结果。
7. 若 HTML + manifest 都没有声明图标，明确提示“未声明可用图标”，不猜地址。

待实机确认：
- [ ] Test4 点击“官网图标检测”不再出现 JSON 错误。
- [ ] 成功复制真实站点 icon URL。
- [ ] 复制 URL 可在浏览器/海阔规则图标字段直接显示。
- [ ] 确认真实地址后，把图标固化到 MDAI Stable/Test/Local/仓库 manifest assets，不长期依赖运行时检测。

## PlaybackAdapter 2.7
当前仍沿用 Test1，Test4 没修改播放：
- `smart`：稳定代理 + 原始直链。
- `direct`：原始直链优先。
- `proxy`：只走站点稳定代理。
- `compat`：显式启用时才 `cacheM3u8()`。
- 播放诊断：`mdai_play_diag_v2`。

当前站点事实继续沿用 Stable 2.6.3：
- 默认 Host：`https://mdcmai4.xyz`。
- 主要接口：`/api/v1/`。
- 稳定 M3U8 代理：`/api/v1/m3u8/proxy?path=`。
- 播放请求使用当前站点 Referer/UA。

## 本地状态
- 历史：`mdai_watch_history_v1`
- 收藏：`mdai_favorites_v1`
- 搜索历史：`mdai_search_history_v1`
- Core 快照：`mdai_core_snapshot_263_v270`
- 播放策略：`mdai_play_strategy_v2`
- 播放诊断：`mdai_play_diag_v2`
- 官网图标：`mdai_official_icon_detected`
- 官网图标来源：`mdai_official_icon_source`

## 回归 / 恢复
- 2.7 UI 与播放没有完成实机闭环前不得晋级 Stable。
- Test 异常时覆盖 Stable 2.6.3 或导入 `麻豆AI 本地版`。

---
## 版本记录
### 2.7.0-test.4 / 2026-08-23
- 根据 Test3 实机 `<!DOCTYPE html>` 被误判为非法 JSON 的结果修复官网图标检测。
- ResourceDetector 改为原始 HTML request，新增 manifest icon 支持。
- 不修改 Test2 已修好的片库，也不修改 PlaybackAdapter/详情业务。
- Build27004 / Shell v5 / Bootstrap v5 强制越过 Test3 active state。

### 2.7.0-test.3 / 2026-08-22
- 在 Test2 片库 UI 基线上新增官网原图标实机检测/复制。
- 实机确认检测错误复用了 JSON API Client，收到正常 HTML 后被提前判错；已冻结并在 Test4 修复。

### 2.7.0-test.2 / 2026-08-22
- 根据实机截图修复片库分类完整性、溢出 `>` 和分类连续开新页面问题。
- 新增 CatalogAdapter，所有片库筛选原页刷新。

### 2.7.0-test.1 / 2026-08-22
- 基于 Stable 2.6.3 开始 Core / Playback / UI / Content / Detail / Runtime 模块化重构。

### 2.6.3 Stable / 2026-08-22
- 用户实机确认 `2.6.3-test.1 / Build26301` 正常后原样晋级。
