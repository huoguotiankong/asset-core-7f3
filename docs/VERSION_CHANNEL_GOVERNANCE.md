# 海阔 Stable / Test / Local 版本谱系规范

版本：1.0  
日期：2026-08-21  
适用范围：所有采用 `channels.json` 的海阔程序，以及“我的规则仓库”自身的 Stable / Test / Candidate / Local 发布。

## 1. 为什么需要版本谱系

Stable / Test / Local 是三个发布通道，不是三个互不相关的版本号。

如果正式版已经是 `3.5.2`，测试版仍显示 `3.5.0-rc12`，即使测试版代码里包含了部分更新功能，用户和维护者仍会直观理解为“测试版比正式版旧”。更严重的是，测试 release 可能继续从旧 Stable 分支演化，漏掉正式版后来已经合入的修复和能力。

因此从本规范生效起，版本号必须表达真实开发谱系。

## 2. Stable

Stable 是当前已经实机验证的正式基线。

- `stable.json` / `latest.json` 只指向当前正式基线。
- Stable release 一旦发布即冻结，不原地覆盖。
- Stable 版本是后续 Test 和 Local 的谱系基准。

## 3. Test / Candidate

Test 是“下一步准备进入 Stable 的候选”，不是长期平行旧分支。

### 3.1 Test 的基础版本不得低于 Stable

比较版本时先取数值基础版本，例如：

- `3.5.3-rc1` → 基础版本 `3.5.3`
- `3.9.41-test.1` → 基础版本 `3.9.41`

要求：

```text
Test 基础版本 >= Stable 基础版本
```

禁止：

```text
Stable 3.5.2
Test   3.5.0-rc12
```

### 3.2 正常向前开发时 Test 应高于 Stable

如果 Stable 已经是 `3.5.2`，下一轮一般应从：

```text
3.5.3-rc1   # patch 级修复/增强
```

或：

```text
3.6.0-rc1   # feature/minor 级升级
```

开始，而不是继续把 RC 序号堆在已经落后的 `3.5.0-rcN` 上。

### 3.3 允许同基础版本测试，但必须有明确原因

例如 Stable `3.9.41`，仅验证同一业务基线的重新打包、Shell、Local 构建或通道切换时，可以使用：

```text
3.9.41-test.1
```

这种 Test 不代表新产品版本，只代表同基线的测试构建。

### 3.4 Stable 晋级后，下一轮 Test 必须先 rebase 到新 Stable

流程：

```text
Test 3.5.2-rcN
  ↓ 实机通过
Stable 3.5.2
  ↓
下一轮 Test 先继承 Stable 3.5.2 的全部模块/修复/通道能力
  ↓
再开始 3.5.3-rc1 或 3.6.0-rc1
```

禁止 Test 继续从更老的 release 派生，导致“测试版 UI 更新了，但丢了 Stable 新增的 Local/Recovery/安全修复”。

## 4. Local

Local 是纯本地派生产物，不参与 Stable/Test 的“谁更新”排序。

### 4.1 Local 必须声明派生基线

推荐元数据：

```json
{
  "channel": "local",
  "version": "3.5.2-local.1",
  "baseVersion": "3.5.2",
  "derivedFromChannel": "stable",
  "derivedFromVersion": "3.5.2"
}
```

如果 Local 直接由当前 Stable 生成，`baseVersion` 应与 Stable 一致。

### 4.2 Local 版本命名

推荐：

```text
<base>-local
<base>-local.1
<base>-local.2
```

显示层可简化成：

```text
Local 3.5.2 · Pure Local
```

Local 的修订号只表示本地打包/隐私处理/兼容调整，不表示它比 Test 或 Stable“更先进”。

## 5. channels.json 元数据

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

- `baseVersion`：它从哪个 Stable 基线继续开发。
- `targetVersion`：准备晋级的目标正式版本。

Local 建议增加：

- `baseVersion`
- `derivedFromChannel`
- `derivedFromVersion`

## 6. 发布顺序

```text
读取三份全局文档
→ 读取目标 CHANGELOG + 当前 Stable/Test/Local
→ 确认版本谱系
→ Test 先 rebase 当前 Stable
→ 新 release/build
→ Guard
→ 实机 smoke test
→ CHANGELOG
→ 晋级 Stable
→ 再开启下一版本 Test
```

## 7. Guard 硬规则

CI 至少检查：

1. Test 基础版本不能低于 Stable。
2. Local 基础版本不能无理由落后于它声明的 `baseVersion`。
3. Stable/Test/Local 引用的入口真实存在。
4. Stable release 不被原地覆盖。
5. 普通程序 Stable/Test 保持同名覆盖；Local 使用独立本地版名称。
6. “我的规则仓库”正式/测试分名属于自举恢复例外。

## 8. 当前规则仓库修正基线

2026-08-21 审计发现：

```text
Stable 3.5.2 / build 364
Test   3.5.0-rc12 / build 363
```

这是历史版本线延续造成的命名倒挂，应立即结束。下一 Test 应从当前 Stable 3.5.2 重新派生，并使用 `3.5.3-rc1`（或明确的下一 minor 版本）开始新的候选线。

本规范生效后，不再出现“正式版版本号高于仍在开发的测试版基础版本”的长期状态。
