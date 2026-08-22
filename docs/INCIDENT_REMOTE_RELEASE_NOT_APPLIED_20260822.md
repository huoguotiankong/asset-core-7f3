# Incident: Remote Release 已发布但设备实际未运行新版本（2026-08-22）

适用范围：所有海阔自用远程小程序，尤其是 Shell → Bootstrap → Remote Manager → Release 架构。

## 事故摘要
Hanime1 在 Test18～Test23 连续围绕“作者/评论头像未修复”进行多轮排查。GitHub 的 `test.json`、release 和业务补丁都在持续升版，但用户设备实际上长期没有进入后续 Release。旧设置页中的“更新测试版”按钮使用序列化 `lazyRule`，回调里直接引用外部 Bootstrap 全局对象 `HanimeBoot`。海阔执行序列化回调时该外部上下文不存在，最终实机报：

```text
“HanimeBoot” 未定义。
```

因此设备被锁在旧 active release。后续 GitHub 代码即使已经修好头像，也没有真正送达到手机。发布全新 Shell v4 + Bootstrap v4，并让回调内部显式 `require()` Bootstrap 后，用户重新覆盖导入，新版本立刻出现真实头像，证明此前多轮“头像仍没修好”至少有一部分其实是**运行版本未切换**，不是业务头像解析持续失败。

## 典型误判信号
- GitHub 元数据已经显示新 Build，但手机页面几乎完全没有变化。
- 多个相互独立的新功能/诊断标记同时都没有出现。
- 设置页版本号是硬编码文本，无法证明真实 Runtime Build。
- 用户重复反馈“还是一样”，但代码侧每轮都确认补丁已发布。
- 更新按钮报某个 Bootstrap/Manager 全局对象或函数未定义。

遇到这些信号时，**必须先停业务层继续修改**，验证设备真实运行链。

## 根因
1. `lazyRule/rule` 等回调会被序列化后在独立上下文执行，不能假设创建回调时的模块局部变量、外部全局对象仍存在。
2. Remote Release 发布成功 ≠ 设备已切换到该 Release。
3. 旧 Shell/Bootstrap 的更新器一旦自身损坏，继续只改 `test.json/release.json` 无法自救。
4. UI 硬编码版本号会掩盖真实运行状态，导致把“没升级”误诊为“新业务代码无效”。

## 强制预防规则
### 1. 每个远程程序必须有真实运行版本标记
设置/About 中显示的 version/build 必须来自当前实际加载 Runtime，不允许硬编码历史版本文案作为唯一依据。

### 2. 业务修复连续两轮“完全无变化”时先验 Runtime
至少核对：

```text
Shell 数值 version
Bootstrap 文件名/require cache key
Remote Manager active state
current release build
运行时全局 build
新版本独有的无害 UI marker
```

没有确认设备已进入目标 Build 前，不继续重写业务解析。

### 3. 序列化回调不得直接依赖外部 Bootstrap 全局
错误模式：

```text
lazyRule(function(){ HanimeBoot.update(); })
```

正确模式：

```text
lazyRule(function(bootstrapUrl, bootstrapVersion){
    require(bootstrapUrl, ..., bootstrapVersion);
    return HanimeBoot.update();
}, bootstrapUrl, bootstrapVersion)
```

Bootstrap URL/version 通过参数显式传入；回调内部重新建立所需上下文。

### 4. 更新器自身损坏时必须成套恢复

```text
新 immutable release
→ 新 Bootstrap 文件名 + 新缓存键
→ 新 Shell 文件名/规则 version
→ minBuild/defaultRelease 强制越过旧状态
→ registry/channels/manifest/test 切新路径
→ 从规则仓库重新覆盖导入
→ 实机确认 Runtime Build
```

不能指望坏掉的“程序内更新”按钮修复自己。

### 5. 功能 Bug 与交付 Bug 必须分层诊断
当代码侧已有明确修复但设备无变化时，优先级固定为：

```text
设备真实运行版本
→ Shell/Bootstrap/Manager/Release 交付链
→ 模块缓存
→ 业务代码
→ UI 渲染
```

不要反过来连续重写业务逻辑。

## Hanime1 结论
- Test24 / Shell v4 重新覆盖导入后，用户实机确认作者/评论头像已经出现。
- 因此 Test18～Test23 的历史结果必须区分“真正运行过的版本”和“仅 GitHub 已发布但设备未进入的版本”。
- 后续 Hanime1 及其它远程小程序出现“连续升版但实机没变化”时，首先执行本 Incident 的 Runtime Delivery 验证，不再直接继续改业务代码。
