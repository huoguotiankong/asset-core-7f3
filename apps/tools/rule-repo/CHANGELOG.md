# 我的规则仓库 Changelog

> **程序级长期技术记忆。** 开发/优化“我的规则仓库”前，除三份全局文档外，必须先读本文件以及当前 `stable.json / test.json / candidate.json / channels.json / latest.json`、对应 Release、Bootstrap、Shell、实际模块与用户实机结果。

## 3.5.6 Stable（Build 393 / Shell 1.5.6 / Bootstrap 1.5.6 / Manager 2.0.4）

- 用户在 Test `3.5.6-rc3 / Build393` 发布后明确要求将当前版本晋级正式版，因此按项目 RC → Stable 原样晋级规则发布 **Stable 3.5.6 / Build393**。
- Stable 使用新的不可变运行链：`releases/3.5.6/release.json` → `bootstrap_v156.js` → `rule_repo_remote_v356.txt`。正式规则壳数值 `version=2026082404`，旧 Stable `3.5.5 / Build389 / Shell 1.5.5` 完整保留为 rollback。
- 正式 Release 吸收 RC2 的 **Fast Home 14.x + X5 Render Guard**，以及 RC3 的 **Verified Device Install Index 14.2**；不包含 Test state/baseline patch，最终 `stable_patch.js` 恢复 Stable 状态命名空间 `hc_repo_v3_*`、`channel=stable` 和 Stable Bootstrap。
- 安装/更新状态继续遵守 RC3 的“设备真相”约束：普通首页只读持久化索引；显式“同步”才读取海阔本地规则表并建立 `title + numeric version` 设备指纹，必要时才用 `hiker://home@标题` 做存在性兜底。
- Stable/Test/Local 同名规则只有在数值 `version` 与对应 Shell 指纹可靠匹配时才确认当前通道；无法确认通道/版本时显示 **已安装 · 版本待识别**，不得再使用 `importHistory / installedMap` 猜测并制造假“可更新”。
- 正式元数据已原子切换：`stable.json / latest.json / candidate.json / channels.json / manifest.json / test.json` 全部指向或记录 Stable 3.5.6；Test RC3 标记为 `promoted-source`，只保留为本次晋级来源，下一轮 Test 必须从 Stable 3.5.6 rebase。
- 根云仓 `manifest.json` 与 `registry.json` 同步更新到 Stable 3.5.6 / Test RC3，正式程序卡路径切到 `rule_repo_remote_v356.txt`，避免云仓继续广告或交付旧 Stable 3.5.5。

### Stable 3.5.6 实机回归重点

1. 由旧 Stable 3.5.5 的“正式版更新”升级，或从版本中心覆盖 Stable 3.5.6，应进入 `3.5.6 / Build393`。
2. 正式版首次打开后主动点一次“同步”，建立 **Stable 命名空间**下的 Verified Device Install Index；这次同步允许比普通首页慢。
3. 随后重复退出/进入首页应继续保持 Fast Home 的快速首屏，不得重新逐程序扫描。
4. “已安装”数量应接近设备真实安装状态；ACFun、JavDB 等同名 Stable/Test 不得仅因历史导入记录被标成假“可更新”。
5. 首页“已安装 / 可更新”数字、对应筛选以及底部更新中心必须使用同一 Verified Index。
6. 若某条本地规则只能确认存在但无法读取 numeric version，应显示“已安装/版本待识别”，不得误报更新。
7. 如 Stable 3.5.6 出现严重回归，当前正式 rollback 为 Stable 3.5.5 / Build389，不原地覆盖 Stable 3.5.6 工件。

## 3.5.6-rc3 Test（Build 393 / Shell 1.0.39-test / Bootstrap 1.0.38-test）

- RC2 实机确认渲染恢复且首页性能明显改善，但出现 `16 全部 / 3 已安装 / 2 可更新` 的错误状态，仅最近有导入历史的少数程序被识别，ACFun/JavDB 又被误判可更新。
- 根因确认：`importHistory / installedMap / group_install_v1` 只能证明规则仓库曾交付过导入口令，不能证明用户当前手机实际安装状态，也不能可靠识别同名 Stable/Test 当前通道。
- RC3 引入 **Verified Device Install Index 14.2**：显式同步使用 `getRuleCount() + getLastRules()` 读取真实本地规则表，提取规则 `title + numeric version`；多版本程序按需读取各通道 Shell 建立数值版本指纹。
- 普通首页继续只读持久索引，避免恢复 RC1 之前的 N 次同步 `hiker://home@标题` 热路径；无法识别版本时保守显示“已安装 · 版本待识别”。
- RC3 保留 RC2 的 X5 Render Guard、Fast Home、版本中心 metadata 按需加载、channel-group 更新中心与 Icon Delivery。
- 本版本现已晋级 Stable 3.5.6，后续不得继续以 RC3 作为新 Test 开发基线。

## 历史记录

- `CHANGELOG_pre_3.5.6-stable.md`：保存 Stable 3.5.6 晋级前完整的 RC1/RC2/RC3 开发记录。
- `CHANGELOG_pre_3.5.6-rc1.md`：保存 Stable 3.5.5 及此前记录。
- `CHANGELOG_pre_3.5.5.md`：保存更早历史。

恢复旧版本、追查事故或复用历史实现时，禁止删除上述历史文件。