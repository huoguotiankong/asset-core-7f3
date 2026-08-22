# Incident: Remote Release 已发布但设备实际未运行新版本（2026-08-22）

适用范围：所有海阔自用远程小程序，尤其是 Shell → Bootstrap → Remote Manager → Release 架构。

## 事故摘要
Hanime1 在 Test18～Test23 连续围绕“作者/评论头像未修复”进行多轮排查。GitHub 的 `test.json`、release 和业务补丁都在持续升版，但用户设备实际上长期没有进入后续 Release。旧设置页中的“更新测试版”按钮使用序列化 `lazyRule`，回调里直接引用外部 Bootstrap 全局对象 `HanimeBoot`。海阔执行序列化回调时该外部上下文不存在，最终实机报：

```text
“HanimeBoot” 未定义。
```

因此设备被锁在旧 active release。后续 GitHub 代码即使已经修好头像，也没有真正送达到手机。发布全新 Shell v4 + Bootstrap v4，并让回调内部显式 `require()` Bootstrap 后，用户重新覆盖导入，新版本立刻出现真实头像，证明此前多轮“头像仍没修好”至少有一部分其实是**运行版本未切换**，不是业务头像解析持续失败。

## 第二次复发：云端仓库标 Test26，重新导入仍跑 Test24
2026-08-22 17:24，用户从“我的规则仓库”重新导入已经显示为 `2.0.0-test.26 / Build 20026` 的 Hanime1 测试版，但实机设置页仍明确显示：

```text
2.0.0-test.24 · Build 20024 · Shell v4
```

而且 Test24 的“头像诊断”区域仍然存在，说明设备确实没有进入 Test25/Test26。

这次不是 `lazyRule` 自锁，而是**云端仓库广告版本与实际安装壳脱节**：

```text
test.json / channels / registry 已广告 Build 20026
→ 但 rule 仍指向 hanime1_remote_test_v4.txt
→ 该 Shell 主模块仍硬编码 bootstrap_test_v4.js?v=20024 / require version 20024
→ Bootstrap v4 的 minBuild=20024 / defaultRelease=Test24
→ Remote Manager load() 设计上正常启动不 fetch latest
→ 重新导入旧安装壳只会继续 load 当前 active release
→ 设备仍停在 Test24
```

因此“云端仓库里看到 Test26”并不能证明“导入动作真正安装了 Test26”。这是同一类 Runtime Delivery 事故的第二种形式。

## 典型误判信号
- GitHub 元数据已经显示新 Build，但手机页面几乎完全没有变化。
- 多个相互独立的新功能/诊断标记同时都没有出现。
- 设置页版本号是硬编码文本，无法证明真实 Runtime Build。
- 用户重复反馈“还是一样”，但代码侧每轮都确认补丁已发布。
- 更新按钮报某个 Bootstrap/Manager 全局对象或函数未定义。
- **云端仓库卡片显示新版本，但导入后的设置页仍是旧 Runtime Build。**
- **channel/test metadata 的 build 已升高，但 `rule` 仍复用旧 Shell，Shell 又固定引用旧 Bootstrap/defaultRelease。**

遇到这些信号时，**必须先停业务层继续修改**，验证设备真实运行链。

## 根因
1. `lazyRule/rule` 等回调会被序列化后在独立上下文执行，不能假设创建回调时的模块局部变量、外部全局对象仍存在。
2. Remote Release 发布成功 ≠ 设备已切换到该 Release。
3. 旧 Shell/Bootstrap 的更新器一旦自身损坏，继续只改 `test.json/release.json` 无法自救。
4. UI 硬编码版本号会掩盖真实运行状态，导致把“没升级”误诊为“新业务代码无效”。
5. **Remote Manager `load()` 正常启动只加载 active release，不会为了“元数据已经升版”自动 fetch latest。**
6. **云端仓库导入的是 `rule` 指向的 Shell 实体，不是 `test.json` 里的 release 本身。若 advertised build=N，但 Shell/Bootstrap 的安装基线仍是 M<N，重新导入仍可能安装/保留 M。**

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

### 5. 云端仓库广告版本必须与安装工件一致
对任何 Remote Test/Candidate，发布门禁必须同时验证：

```text
channel/test advertised build == release.json build
installerBuild == advertised build（采用 installerBuild 字段时）
Shell rule version 已递增
Shell 引用的 Bootstrap 实体存在
Bootstrap minBuild >= advertised build
Bootstrap defaultRelease.build >= advertised build
```

如果 Cloud Repo 卡片显示 `Build N`，就不能继续让它指向一个默认只安装 `Build M (M<N)` 的旧 Shell/Bootstrap。

### 6. “逻辑 Shell 版本不变”不等于“安装壳文件可以永久复用”
Hanime1 Test26 修复采用：

```text
逻辑架构仍为 Shell v4
但云端仓库安装工件改为：
hanime1_remote_test_v4_b20026.txt
→ bootstrap_test_v4_b20026.js
→ minBuild/defaultRelease 20026
```

后续业务 Release 可以继续让**已经安装的用户**走程序内 update，不要求每次重装 Shell；但**云端仓库当前 Test 卡片的安装入口**必须能够把新装/重新导入用户带到它广告的当前 Build。若仍采用 build-locked installer，则每次广告 build 变化都应生成对应轻量 installer artifact。

### 7. 发布前运行 Remote Installer Guard
仓库新增：

```text
tools/remote_installer_guard.py
```

用于静态检查 channel metadata → release → cloud installer Shell → Bootstrap 的 build 一致性，重点拦截：

```text
advertised build > Bootstrap minBuild/defaultRelease.build
```

这条检查要在切换 Test/Candidate 云仓库入口前执行，而不是等用户实机发现。

### 8. 功能 Bug 与交付 Bug 必须分层诊断
当代码侧已有明确修复但设备无变化时，优先级固定为：

```text
设备真实运行版本
→ Shell/Bootstrap/Manager/Release 交付链
→ 模块缓存
→ 业务代码
→ UI 渲染
```

不要反过来连续重写业务逻辑。

## Hanime1 当前结论
- Test24 / Shell v4 重新覆盖导入后，用户实机确认作者/评论头像已经出现。
- Test26 第一次发布虽然业务 release 正确，但 Cloud Repo 仍复用了 Test24 安装壳，导致用户“重新导入 Test26”仍运行 Test24。
- Test26 交付热修后，Cloud Repo Test 入口改为 `hanime1_remote_test_v4_b20026.txt`，规则 version `2026082231`，并使用 `bootstrap_test_v4_b20026.js` 的 `minBuild/defaultRelease=20026`。
- 因此以后必须同时区分：**业务 Release 是否正确**、**程序内 updater 是否正确**、**云端仓库安装工件是否与广告版本一致**。
- 后续 Hanime1 及其它远程小程序出现“连续升版但实机没变化”时，首先执行本 Incident 的 Runtime Delivery 验证，不再直接继续改业务代码。
