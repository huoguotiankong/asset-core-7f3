# 我的规则仓库 Changelog

> **程序级长期技术记忆。** 开发/优化“我的规则仓库”前，除三份全局文档外，必须先读本文件以及当前 `stable.json / test.json / candidate.json / channels.json / latest.json`、对应 Release、Bootstrap、Shell。由于它同时承担安装中心与自举恢复职责，任何更新协议、缓存、通道、recovery、云端发布链变化都必须写入本日志。

## 3.5.5 Stable（Build 389 / Shell 1.5.5 / Bootstrap 1.5.5 / Manager 2.0.4）

- 用户在 RC3 修复云端更新协议后明确要求“云端仓库正式版也升上来”，因此本轮将 **3.5.5-rc3 / Build389** 作为用户指令晋级基线，正式发布 **Stable 3.5.5 / Build389**。本次不是等待额外 RC3 实机截图后自动晋级，而是依据用户当前明确发布要求执行；最终运行效果仍以正式版手机实机为准。
- Stable 3.5.5 继承 Single Workspace 13.2 已有业务/UI，并正式吸收三项后续修复：① `sync_refresh_patch.js`，目录同步成功后立即 `refreshPage(false)` 重建工作台；② Icon Delivery 1.1，本仓 Raw/WebRaw 图标统一转换到 jsDelivr，且 `channelMeta()` 的 Stable/Test/Local 版本卡图标也走同一适配；③ Remote Delivery Protocol 2.0 / Remote Manager 2.0.4。
- Remote Manager 2.0.4 对可变 `latest/test` 指针使用 Raw → WebRaw → GitHub API → jsDelivr 容错；保存最后一次成功元数据；以 `max(current build, default build, minBuild)` 为安全 floor，陈旧 CDN 指针不得把当前版本降级；全部元数据源短时不可达时继续运行当前/Bootstrap 内置安全 Release，不再把网络抖动误报为程序升级失败。
- Stable Release 新建 `releases/3.5.5/release.json`。**正式链不包含 `test/v1.0.0/state_patch.js`、旧 Test baseline 或 RC3 Test identity patch**；最终 `releases/3.5.5/stable_patch.js` 强制恢复 `hc_repo_* / hc_repo_v3_*` 正式状态命名空间、`isTestChannel()=false`，并把工作台故障恢复重新绑定到 `bootstrap_v155.js`。
- 新建 Stable Bootstrap `bootstrap_v155.js`。Shell `rule_repo_remote_v355.txt` 数值 version 为 **2026082307**，直接固定到不可变 staging commit `5036c15d8beabd4ade6482b0bcdd02910ceb6d43` 的 Bootstrap v1.5.5；Bootstrap 内 Manager 2.0.4 同样固定到不可变 commit，多镜像仅承担可用性，不再让可变 `@main` 决定已安装 Shell 的核心启动版本。
- 发布过程首次正式采用“两阶段发布”：先准备不可变 Release/Bootstrap/Test baseline 资产，确认路径存在后，再将 `stable.json / latest.json / test.json / channels.json / Shell` 作为活动指针统一切换。最终 Stable/Test 活动指针切换提交为 `449242d2b4f3ecf4ef3de023ad1b0f19e852d806`；后续根目录和 registry 更新在并发 XVideos 发布推进 `main` 后均重新基于最新 HEAD 构建，**未使用 force**，证明并发发布必须执行 fresh-HEAD rebase。
- Stable 3.5.5 发布后立即续线 **Test 3.5.5-test.1 / Build390 / Shell 1.0.36-test / Bootstrap 1.0.35-test / Manager 2.0.4**。Test 业务/UI 与 Stable 3.5.5 对齐，只重新应用 Test 独立状态、身份与 Remote Manager state；满足 `baseVersion=3.5.5` 且 `Build390 > Stable Build389`。
- 旧 Stable **3.5.4 / Build384 / Shell1.5.4** 的 Release/Shell 保留为正式回退基线；RC3 Release 继续作为本次晋级来源历史，不覆盖、不删除。
- 根 `manifest.json` 与 `manifest_meta.json` 已同步到 revision **202608232246 / itemCount16**；规则仓库条目显示 `Stable 3.5.5 / Test 3.5.5-test.1`。同时保留并发 XVideos Test7 的最新云仓条目，没有用旧快照覆盖其它程序。
- `registry.json` 已同步记录 Stable 3.5.5/Build389、Bootstrap v155、Release 3.5.5、Test 3.5.5-test.1/Build390 与 Test Release/Shell，作为后续恢复链事实源。
- 本次云端事故与发布协议沉淀在 `docs/INCIDENT_CLOUD_REPOSITORY_PUBLISH_CHAIN_20260823.md`；双通道约束同步写入 `CHANNELS.md`。以后任何远程小程序都应优先使用“不可变资产准备 → fresh HEAD → 原子活动指针切换 → manifest/meta/registry → 实机闭环”，禁止多 commit 半发布和并发 force 覆盖。

### 3.5.5 正式版实机回归重点

1. 覆盖/导入正式版后首页可正常打开，About/更新页显示 `3.5.5 / Build389`。
2. 麻豆传媒、Hanime1、汤头条等原 Raw GitHub 程序图标，以及底部“分类 / 搜索 / 更新 / 设置”图标不再破图。
3. 同步目录后当前 Single Workspace 立即刷新，且 XVideos Test7 等最新并发目录条目仍存在。
4. 正式版更新页在 GitHub/API/CDN 短时异常时应提示“当前版本可用 / 元数据暂不可达或传播中”，不应再直接报整套升级失败。
5. 程序卡导入、版本卡导入、备份、诊断、收藏、活动记录和设置不退化；任何 recovery 不得串入 Test 状态。

## 历史版本

3.5.4 Stable 及更早的完整程序级技术记录已原样保存在 [`CHANGELOG_pre_3.5.5.md`](./CHANGELOG_pre_3.5.5.md)。该文件由 3.5.5 发布前 `CHANGELOG.md` 的原始 Git blob 直接保留，禁止删除；恢复旧版本或追查历史踩坑时必须继续读取。
