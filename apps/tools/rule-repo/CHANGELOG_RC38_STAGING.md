# 我的规则仓库 CHANGELOG

> 当前恢复入口。RC37 完整失败记录冻结到 `CHANGELOG_RC37_20260825.md`。RC38 保留 RC36 的快首页基线，撤销 RC37 规则标题详情跳转。

## 当前活动基线
- Stable：`3.5.5 / Build389`，继续冻结，作为最终救援基线。
- Test：`3.5.6-rc38 / Build428`，Shell `rule_repo_test_v175.txt` / rule version `2026082520`。
- 启动：`Test Shell → bootstrap_test_v175.js → Remote Manager 2.0.4 cache → Stable 3.5.5 modules + RC36 fast_hybrid_patch.js + RC38 native_detail_batch_presence.js`。
- RC38 仍然不是 Local-First；规则仓作为控制面优先速度、正确性、可靠性和可恢复性。

## 2026-08-25 · 3.5.6-rc38 / Build428 · Native Detail + Batch Presence

### 用户实机事实
- RC37 点击多版本程序后，前台出现“正在读取当前程序版本…”；随后海阔提示找不到 URL 编码后的“我的规则仓库·测试版”这个小程序。
- 同一时刻首页统计显示 19 个程序但仅 1 个已安装，和用户手机实际安装状态明显不符。
- 首页仍显示历史临时条目“规则仓库 RC25 升级”，规则仓自身卡片描述也仍停在 RC25，说明根 manifest 的历史展示项不应继续直接暴露到当前 Test UI。

### 根因
1. RC37 的 `load-channels` lazyRule 在成功读取 channels 后返回：`hiker://page/ruleRepoDetail?rule=<规则标题>&simple=true...`。
2. 用户当前海阔环境会把非空 `rule=` 当成规则名再次查找；测试仓规则上下文并不能保证以该标题被重新解析，因此直接报“找不到这个小程序”。
3. 项目既有二级页经验明确要求使用 `hiker://page/<path>?rule=&simple=true`，让二级页继承当前规则上下文。
4. RC36/37 为消除首页 N 次设备探针，把安装状态裁剪为仓库 identity/installedMap；历史已安装规则未全部记录，因此首页只剩少量“已安装”。
5. Stable 的旧 install probe 每个程序分别 `request(hiker://home@title)` 虽能识别，但会造成 N 次本地规则查询；不能直接恢复。

### RC38 修复
1. 完全撤销 RC37 `detail_channel_bridge.js`，Release 只加载 Stable39模块 + RC36 Fast Hybrid + RC38 新桥。
2. 多版本程序首次进入详情时仍只读取**当前这一份** `channels.json`，但跳转固定为 `hiker://page/ruleRepoDetail?rule=&simple=true&id=<appId>`。
3. 不再通过“我的规则仓库·测试版”标题重新定位规则；详情页直接在当前规则上下文重新执行 Runtime。
4. 首页不恢复 channels N+1 网络预取。
5. 首页安装识别改为一次 `getLastRules()` 快照，解析成标题集合后供所有程序复用；同一页面30秒内不重复扫描。
6. `actualInstalled()` 先尊重既有 identity/installedMap，再使用单次设备快照补全历史已安装规则。
7. Runtime 层过滤历史 `rule-repo-test-upgrade` 临时项，并将规则仓首页摘要改成当前 RC38；暂不冒险整体重写根 `manifest.json`。
8. Stable 3.5.5 / Build389 不改。

### RC38 实机验收
1. 覆盖导入 RC38 / Build428。
2. 第2/3次进入首页，启动速度不得明显慢于 Stable3.5.5。
3. 首页“已安装”数量必须明显恢复到真实安装规模，不能继续只有1。
4. 首页不再出现“规则仓库 RC25 升级”临时条目；规则仓自身摘要应显示当前 Test RC38。
5. 点击 Pornhub/JavBus/JavDB/MyAv 任一多版本程序：首次允许短暂读取当前程序版本，但不得再报“找不到我的规则仓库·测试版”。
6. 详情必须显示真实 Stable/Test/Local 卡片，不得为0个。
7. 再次进入已加载程序应优先复用本地 per-app channels cache。
8. 首页性能、安装统计、详情、导入、自更新、同步全部通过前，Stable 3.5.5 不得晋级。

## 历史
- RC37：`apps/tools/rule-repo/CHANGELOG_RC37_20260825.md`
- RC36：`apps/tools/rule-repo/CHANGELOG_RC36_20260825.md`
- RC35：`apps/tools/rule-repo/CHANGELOG_RC35_20260825.md`
- RC34：`apps/tools/rule-repo/CHANGELOG_RC34_20260825.md`
- RC32 及之前：`apps/tools/rule-repo/CHANGELOG_RC32_20260825.md`
- RC28：`apps/tools/rule-repo/CHANGELOG_RC28_20260825.md`
- RC27：`apps/tools/rule-repo/CHANGELOG_RC27_20260825.md`
- RC26：`apps/tools/rule-repo/CHANGELOG_RC26_20260825.md`
- RC24 及之前：`apps/tools/rule-repo/CHANGELOG_PRE_RC26_20260825.md`
