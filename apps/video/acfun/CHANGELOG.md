# ACFun Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Stable0.4.9 / Native Alpha1→Alpha11 / Web1→Web3 历史原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.4.9 / Build149 / Shell5.11.3`，继续冻结，是当前已验证恢复基线。
- Test：`0.5.0-test.1 / Build50001`，从 Stable0.4.9 派生，只验证 Local-First 交付与启动，不主动改接口/播放/漫画/封面/UI 业务逻辑。
- Candidate：`1.0.0-alpha11 / Build10011`，保留原生协议研究链；HLS `auth_key` / CDN 验签和漫画 Reader 已知实机阻塞仍成立，不并入当前 Local-First Test。
- Web：`1.2.0-web3 / Build11003`，独立网页终端兜底，保持不变。
- Latest：仍指向 Stable0.4.9；Test50001 实机通过前不晋级 Stable。

## 2026-08-25 · 0.5.0-test.1 / Build50001 · Stable-derived Local-First

### 迁移边界
- 当前 Stable release `0.4.9` 真实业务模块固定为 8 个：`acfun_core_v018.js → acfun_patch_v019.js → acfun_ui_v042.js → acfun_fix_v043.js → acfun_fix_v045.js → acfun_fix_v047.js → acfun_fix_v048.js → acfun_fix_v049.js`。
- 本轮在上述完整 Stable 链末尾只追加 `final_local_patch.js`，总计 9 个源码单元生成一个本地 `runtime_bundle.js`。
- 图片继续复用已验证 `acfun_image_decoder_v040.js`，仅把交付方式改成本地 `image_decoder.js`。
- Source snapshot 固定为 `3ca58f0845deae19a4e5ad27ae1c84b16cef700d`；Builder、Entry、Shell 分别固定到各自 immutable commit。

### 新启动架构
```text
Shell
→ 本地 local_entry.js
→ 本地 local_bundle_builder.js
→ runtime_bundle.js + image_decoder.js
→ 正常启动只 1× require(file://) Runtime
```
- 首次打开允许联网下载 immutable Entry/Builder/9 个源码单元和 ImageDecoder，并生成本地 bundle。
- bundle/meta 完整后，后续正常启动不再加载 Remote Manager、Bootstrap 或远程业务模块。
- 网站 API、图片、视频等业务网络请求仍按 ACFun 本身需要发生；Local-First 只描述程序代码/控制面交付。

### ACFun 历史 P0 同步修复
Stable 老代码中播放、收藏、长按收藏及部分诊断 `lazyRule` 会读取 `acfun_core_src_v018` 后 `eval`。历史 Bootstrap 曾把这个兼容槽写成“重新加载远程 Bootstrap/基础 Core”，可能导致点击时丢失当前 Release 后置覆盖。

Test50001 不改这些 UI 回调，而是在完整本地 Runtime 最后统一写入：
```js
var ac=$.require('acfun');
```
到 `acfun_core_src_v018 / acfun_core_src_v019 / acfun_remote_bundle_src`。因此历史点击回调重新进入当前完整本地 Runtime，不再降级到基础 Core，也不再回 GitHub Bootstrap。

### 更新责任
- 原设置页“远程更新”路由继续保留，但新 `acfun_update` 页面改为本地版本/诊断页。
- 应用内不再通过 Remote Manager 自行 update/rollback/reinstall。
- 用户主动“检查更新”只检查当前 Test 元数据；真正覆盖更新由“我的规则仓库”统一负责。

### 静态门禁
- `final_local_patch.js`：`node --check` 通过。
- `local_entry.js`：`node --check` 通过。
- `local_bundle_builder.js`：`node --check` 通过。
- Shell 外层 JSON、9 个 `pages` JSON 解析通过；主程序 loader `node --check` 通过。
- Shell rule version `2026082512` 位于 32 位有符号整数安全范围。
- Stable/Latest/Web/Candidate 工件均未覆盖。

### 统一版本目录修正
此前 `channel_catalog_snapshot.json` 的 ACFun Stable 错写为 `Build409`，与当前 `stable.json/latest/release` 的真实 `Build149` 冲突。本轮只修正目录元数据为 `Build149`，没有修改 Stable 运行文件。

### 实机验收
1. 在“我的规则仓库”同步后应看到 `Test 0.5.0-test.1 / Build50001`。
2. 首次打开允许等待一次本地 bundle 构建；成功后完全退出。
3. 第2次打开应直接使用本地 Entry + 单 Runtime bundle，不再经过 Remote Bootstrap。
4. 回归：首页精选/里番、动漫/视频分类、短视频、搜索、视频详情、播放、收藏、历史、评论、漫画详情/章节、封面显示、设置/诊断。
5. 重点验证“视频详情 → 播放”和“收藏/长按收藏”，确认 lazyRule 没有退回旧 Core。
6. 打开“设置 → 远程更新/本地化版本”，应显示 `0.5.0-test.1 / Build50001` 和本地 bundle 状态。
7. 任何播放、漫画、图片或分类行为与 Stable0.4.9 不一致，均视为 bundle 合成/点击上下文回归，禁止晋级 Stable。

## 历史
- 完整迁移前历史：`apps/video/acfun/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
