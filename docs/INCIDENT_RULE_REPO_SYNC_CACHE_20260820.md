# 我的规则仓库 2026-08-20 同步 / 更新链事故记录

## 现象 A：同步后云端目录完全不可用

海阔实机在“我的规则仓库·测试版”执行“立即同步”后提示同步失败，随后进入程序出现：

```text
云端读取失败：manifest.json
API=GitHub API读取失败
Raw=Raw读取失败
```

由于当时有效目录缓存已经被“立即同步”操作先删除，网络瞬时异常后程序没有 stale cache 可继续使用，最终出现解析失败。

## 根因 A：破坏式同步

RC6/RC7 设置页与首页同步逻辑采用：

```text
clearManifestCache()
↓
manifest(true)
```

这是错误的破坏式刷新顺序。网络请求并不是事务；在新数据成功拿到之前删除旧有效缓存，会把“可恢复的网络抖动”放大成“程序无目录可用”。

## 现象 B：正式版 3.4.3 无法检查 Core 更新

用户实机正式版实际上仍为：

```text
Core 3.4.3
Bootstrap 1.4.3
Manager 2.0.1
```

点击“检查 Core 更新”后提示：

```text
RULE_REPO_CONFIG 未定义
```

测试版旧 Shell 的更新页也存在同类风险。

## 根因 B：lazyRule 序列化后丢失 Bootstrap 顶层变量

旧 Bootstrap 的 `lazyRule(function(){...})` 回调直接引用：

```js
RULE_REPO_CONFIG
RULE_REPO_MANAGER_URL
```

海阔会对部分 lazyRule / rule 回调进行序列化执行，不能假设原执行作用域仍然存在。因此页面能正常显示，不代表点击按钮时仍能访问这些顶层变量。

正确方式：

```text
构造可序列化 config JSON
↓
lazyRule(..., configJson, managerUrl)
↓
回调内部 JSON.parse(configJson)
↓
只使用显式参数
```

以后 Bootstrap、更新页、恢复页中所有 lazyRule / select / input / confirm 等回调，都必须按“显式传参”审查，禁止依赖外层自由变量。

## 永久规则：关键缓存刷新必须事务化

任何远程索引、配置、Provider 列表、域名表等关键数据刷新都必须遵循：

```text
保留当前有效缓存
↓
请求新数据
↓
校验新数据
├─ 成功 → 原子替换旧缓存
└─ 失败 → 保留旧缓存并提示正在使用离线数据
```

禁止：

```text
先清缓存
↓
再联网
```

除非用户明确执行“彻底清理/重置”，普通“刷新/同步”不得销毁最后有效副本。

## RC8 + Recovery Shell 修复

- RC8 新增事务式 `syncManifest()`：新数据成功后才覆盖缓存，失败时保留最近有效 manifest。
- 云端文本读取扩展为 GitHub API / GitHub Raw / jsDelivr / GitHub Web Raw 多通道。
- 新增 Remote Module Manager 2.0.2：模块和版本元数据支持多镜像 fallback。
- 正式 Core 保持 3.4.3，不假定用户已经升级；新增 Recovery Shell 1.4.4 修复更新按钮作用域。
- 测试 Core 保持 3.5.0-rc8 / build 358；新增 Recovery Shell 1.0.7-test，让当前损坏测试版可以通过云端覆盖恢复。
- Stable/Core 与 Shell 版本分开管理：Shell 热修不强行宣称 Core 已升级。
- 3.5.x 新正式 Core 必须在 Recovery Shell + RC8 实机验证通过后再发布。

本事故属于 P0 发布经验，后续所有 Remote Bootstrap 必须同时通过：

1. 网络断开/单通道失败测试。
2. 无缓存与有旧缓存两种启动测试。
3. lazyRule 按钮点击实机测试，而不是只看页面是否能打开。
4. 覆盖导入恢复测试。
