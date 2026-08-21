# 海阔 Stable / Test / Local 版本谱系规范

版本：1.1  
日期：2026-08-22  
适用范围：所有采用 `channels.json` 的海阔程序，以及“我的规则仓库”自身的 Stable / Test / Candidate / Local 发布。

## 1. 基本原则

Stable / Test / Local 是三个发布通道，不是三个互不相关的版本号。版本号、build、Shell 和派生关系必须表达真实开发谱系。

动态版本事实以当前 `channels.json / stable.json / test.json / latest.json / release.json` 为准；本文只定义规则，不作为永久版本数据库。

## 2. Stable

Stable 是当前已经实机验证的正式基线。

- `stable.json` / `latest.json` 只指向当前正式基线。
- Stable release 一旦发布即冻结，不原地覆盖。
- Stable 是后续 Test 和 Local 的谱系基准。
- Stable 的 Shell/Bootstrap/runtime 地址也是基线的一部分，仓库迁移时不能只迁业务模块。

## 3. Test / Candidate

Test 是“下一步准备进入 Stable 的候选”，不是长期平行旧分支。

### 3.1 Test 基础版本不得低于 Stable

例如：

- `3.5.4-rc1` → 基础版本 `3.5.4`
- `3.9.41-test.1` → 基础版本 `3.9.41`

要求：

```text
Test 基础版本 >= Stable 基础版本
```

正常向前开发时 Test 应高于 Stable；只有验证同基线重新打包、Shell、Local 构建或通道切换时，才允许同基础版本测试。

### 3.2 Stable 晋级后，下一轮 Test 必须 rebase 当前 Stable

```text
Test 通过
→ 晋级 Stable
→ 下一轮 Test 先继承新 Stable 全部模块/修复/恢复链
→ 再继续下一版本
```

禁止 Test 长期从旧 Stable 派生。

### 3.3 Test 必须与 Stable 隔离风险

- Test 失败不能覆盖 Stable 的恢复入口。
- Test Shell/Bootstrap 可以独立升级。
- “我的规则仓库”因承担自举恢复，正式版与测试版允许分名并存。
- 其他普通程序原则上 Stable/Test 同名覆盖，除非有明确产品理由。

## 4. Local

Local 是纯本地派生产物，不参与 Stable/Test 的“谁更新”排序。

推荐元数据：

```json
{
  "channel": "local",
  "version": "3.5.3-local.1",
  "baseVersion": "3.5.3",
  "derivedFromChannel": "stable",
  "derivedFromVersion": "3.5.3"
}
```

Local 必须说明派生基线；修订号只代表本地打包、隐私处理或兼容调整。

## 5. channels.json 建议字段

多通道程序推荐至少提供：

- `channel`
- `name`
- `version`
- `build`
- `path` 或本地构建信息
- `mode`
- `updatedAt`
- `desc`

Test 建议增加：

- `baseVersion`
- `targetVersion`

Local 建议增加：

- `baseVersion`
- `derivedFromChannel`
- `derivedFromVersion`

## 6. Shell / Core / 公共库三层版本

每个远程程序至少区分：

1. Shell 数值 `version` / `shellVersion`。
2. Core/业务 `version + build`。
3. Remote Manager / Diagnostics / compat 等公共库版本。

业务 release 升级不代表 Shell 自动升级。只要 Shell 内 URL、Bootstrap 地址、页面声明或规则结构发生变化，就必须显式升级 Shell 数值版本并重新覆盖安装。

## 7. 仓库迁移对版本谱系的影响

2026-08-22 起正式运行仓库统一为：

```text
huoguotiankong/asset-core-7f3@main
```

旧 `hiker-cloud` 已转 Private，仅保留历史。

迁移时必须把“仓库来源”视为发布基线的一部分：

- release 在新仓存在，不代表手机里旧 Shell 已迁移。
- 已安装 Shell 仍可能保存旧 Raw/jsDelivr URL。
- 仓库切换后必须提升 Shell version、覆盖安装并做断旧仓测试。

详细规则见 `docs/REPOSITORY_SPLIT_MIGRATION_20260822.md`。

## 8. 发布顺序

```text
读取三份全局文档
→ 读取目标 CHANGELOG + 当前 Stable/Test/Local
→ 确认版本谱系与当前运行仓
→ Test rebase 当前 Stable
→ 新 release/build
→ Guard
→ 实机 smoke test
→ CHANGELOG
→ 晋级 Stable
→ 必要时更新 Shell
→ 若有仓库切换，覆盖旧 Shell 后再断旧仓验证
```

## 9. Guard 硬规则

CI/人工检查至少覆盖：

1. Test 基础版本不能低于 Stable。
2. Local 基础版本与声明的派生关系一致。
3. Stable/Test/Local 引用入口真实存在。
4. Stable release 不被原地覆盖。
5. 普通程序 Stable/Test 保持同名覆盖；Local 使用独立本地版名称。
6. “我的规则仓库”正式/测试分名属于自举恢复例外。
7. 新正式代码不得新增对 `hiker-cloud` 的运行依赖。
8. 所有 Public 运行 URL 明确指向 `asset-core-7f3@main`，不得依赖默认 `landing`。
9. Shell 规则数值版本不得超过 `2147483647`。

## 10. 当前已验证基线（仅审计记录）

截至 2026-08-22 迁移完成并实机断旧仓验证后：

```text
我的规则仓库 Stable  3.5.3 / build 377 / Shell 1.5.3
我的规则仓库 Test    3.5.4-rc7 / build 384 / Shell 1.0.30
JavDB v3 Stable       3.9.41 / Remote
ACFun Stable          0.4.9
```

以上只是审计快照。任何后续开发仍必须重新读取当前元数据，不得直接把此段当成最新版本事实。
