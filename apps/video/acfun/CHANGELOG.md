# ACFun Changelog

> 当前恢复入口。2026-08-25 Local-First 迁移前的完整 Stable0.4.9 / Native Alpha1→Alpha11 / Web1→Web3 历史原样归档到 `CHANGELOG_PRE_LOCAL_FIRST_20260825.md`。事实优先级：用户当前实机 > main 当前 Shell/Release/源码 > 本文件 > registry/manifest > 历史归档。

## 当前活动边界
- Stable：`0.4.9 / Build149 / Shell5.11.3`，继续冻结，是当前已验证恢复基线。
- Test：`0.5.0-test.2 / Build50002`，从 Stable0.4.9 派生；Test50001 因实机私有存储 1MB 故障冻结，本版只修 Local-First 交付与存储边界。
- Candidate：`1.0.0-alpha11 / Build10011`，保留原生协议研究链；不并入当前 Local-First Test。
- Web：`1.2.0-web3 / Build11003`，独立网页终端兜底，保持不变。
- Latest：仍指向 Stable0.4.9；Test50002 实机通过前不晋级 Stable。

## 2026-08-25 · 0.5.0-test.2 / Build50002 · Private Storage Guard

### Test50001 实机事故
用户覆盖 Test50001 后，ACFun 在解析阶段直接报错：

```text
描述：ACFun解析失败!
来源：JSEngine
行数：848
InternalError: 私有存储内容过大 (1MB)，无法继续使用setItem写入
```

这不是站点接口、播放或图片解密故障，而是海阔私有 KV 配额事故。项目既有 `INCIDENT_PRIVATE_STORAGE_1MB_HTML_CACHE_20260823.md` 已确认：当历史大值把整个私有存储逼近 1MB 后，后续哪怕只是一个很小的 `setItem()` 也可能成为实际抛错点，因此“报错的 setItem”不一定是污染源。

### 根因边界
Stable0.4.9 的业务链里仍存在两类可重建但不适合长期放私有 KV 的控制面对象：

- `acfun_remote_config`：远程配置整体 JSON；
- `acfun_frontend_discovery`：扫描前端 HTML/JS 后生成的 bases / prefixes / routes / snippets / scripts / errors 结构。

此外旧版本曾长期保留多类诊断结果、Remote Manager 检查结果和兼容源码槽。Test50001 本身没有把本地 Runtime bundle 写入私有 KV，但继承这些历史状态后暴露了已有配额风险。

已比较 Stable 源快照 `3ca58f0845deae19a4e5ad27ae1c84b16cef700d` 到本次修复前 main：Stable0.4.9 的 8 个业务模块均未发生后续修改，因此 Test50002 继续保持真实 Stable149 业务代码不变。

### Test50002 修复
新 Runtime 仍以 Stable0.4.9 八模块为核心，加载顺序改为：

```text
storage_preflight
→ Stable 0.4.9 原 8 模块
→ storage_guard_patch
→ final_local_patch
```

`storage_preflight.js` 在 Stable 代码开始执行前：
- 删除可重建的 `acfun_frontend_discovery / acfun_remote_config`、大诊断结果、旧 Remote Manager 结果与历史兼容源码槽；
- 不清 Token、手动/已知好 Host、常规用户设置；
- 收藏/历史默认保留；
- 只有检测到旧 `acfun_favs / acfun_hist` 单项已异常超过 220KB 时，才先备份到 `hiker://files/rules/asset-core-local/acfun-user/`，再裁剪字段和体积。

`storage_guard_patch.js`：
- Remote Config 改存 `hiker://files/rules/asset-core-local/acfun-test/shared/remote_config.json`；
- Frontend Discovery 改存 `.../shared/frontend_discovery.json`；
- 仅将短时间戳、短 URL、短错误摘要继续写私有 KV，并全部容错；
- 历史/收藏 `setItem` 若再遇配额异常，只降级辅助持久化，不允许拖垮首页/详情/播放主任务。

### 缓存与发布隔离
- Test50001 / Build50001 冻结，不原地覆盖。
- Test50002 使用全新 `b50002/` 本地目录、Entry、Builder、Release、Shell 和规则 version `2026082514`。
- Stable149 / Latest / Candidate Alpha11 / Web3 全部不变。
- 正常第2次及以后启动仍是 `local_entry.js → 1× require(file://) runtime_bundle.js`，不会重新走 Remote Manager/Bootstrap。

### 不可变工件
- Storage Guard source：`9f0d5a68540ec3b2dfe65b5f064a3ab9f5737934`
- Builder：`c14350d117c04c513db63bdc44b46d7b252172fa`
- Entry：`08e1136a09a4bf41450022ec35ecacc6b675507f`
- Release + Shell：`f6fb42e4cf44e1b0a355cc9c72f1b407fa9ab8dc`

### 静态门禁
- `storage_preflight.js`：`node --check` 通过。
- `storage_guard_patch.js`：`node --check` 通过。
- `final_local_patch.js`：`node --check` 通过。
- `local_bundle_builder.js`：`node --check` 通过。
- `local_entry.js`：`node --check` 通过。
- Shell 外层规则 JSON、9 个 pages JSON 和主程序 loader 均已解析/语法检查通过。
- Shell rule version `2026082514` 位于 32 位有符号整数安全范围。

### Test50002 实机验收
1. “我的规则仓库”同步后应看到 `Test 0.5.0-test.2 / Build50002`。
2. 覆盖导入测试版并首次打开，重点确认不再出现“私有存储内容过大 (1MB)”。
3. 完全退出后第2次打开，确认直接使用本地 bundle。
4. 回归：首页精选/里番、动漫/视频分类、短视频、搜索、视频详情、免费播放、收藏/历史、评论、漫画详情/章节、封面。
5. 打开“本地化版本”，应显示 Build50002 与 `Storage Guard 0.5.0-test.2`。
6. 若仍出现 1MB 报错，优先继续清理尚未覆盖的历史私有 KV 大值，不允许误判成站点 API 或继续改 Stable 业务代码。

## 2026-08-25 · 0.5.0-test.1 / Build50001 · Stable-derived Local-First

### 迁移边界
- Stable release `0.4.9` 真实业务模块固定为 8 个：`acfun_core_v018.js → acfun_patch_v019.js → acfun_ui_v042.js → acfun_fix_v043.js → acfun_fix_v045.js → acfun_fix_v047.js → acfun_fix_v048.js → acfun_fix_v049.js`。
- Test50001 在完整 Stable 链末尾追加 `final_local_patch.js`，生成单个本地 `runtime_bundle.js`；图片复用 `acfun_image_decoder_v040.js`。
- 正常启动改为本地 Entry + 单 `require(file://)` Runtime；Alpha11 原生协议研究仍隔离在 Candidate。
- 为避免播放/收藏等历史 lazyRule 回退旧 Remote Bootstrap，兼容槽改成 `var ac=$.require('acfun');`。
- 静态门禁全部通过，但实机随后暴露私有 KV 1MB 历史状态问题，因此 Test50001 冻结为失败样本，不允许晋级 Stable。

## 历史
- 完整迁移前历史：`apps/video/acfun/CHANGELOG_PRE_LOCAL_FIRST_20260825.md`
