# 云端仓库新程序发布链遗漏事故（2026-08-23）

状态：长期硬约束 / 跨程序适用。

## 1. 事故现象

新建 MyAv `0.1.0-test.1 / Build10101` 时，已经完成：

```text
apps/video/myav/*
→ Test / Release / Bootstrap / Shell
→ registry.json
```

GitHub main 中运行链本身存在，但用户在“我的规则仓库”实机中仍看不到 MyAv。

## 2. 根因

`registry.json` 是项目开发/恢复索引，不是手机端“我的规则仓库”的展示清单。

当前 Stable 3.5.4 的真实目录链为：

```text
HikerRuleRepo.manifestPath = manifest.json
→ root manifest.json.items
→ entryType=channel-group 时读取 item.channelsPath
→ apps/<category>/<app>/channels.json
→ 导入对应 Stable/Test/Local Shell
```

同时 `repository_patch.js` 使用根 `manifest_meta.json` 的 revision 进行目录新鲜度探针：

```text
manifest.json revision
必须与
manifest_meta.json revision
同步变化
```

只改 `manifest.json`、不改 meta，设备可能继续命中旧目录缓存。

MyAv 首版还暴露了第二个问题：其 `channels.json` 最初写成 `{stable:null,test:{...}}` 的内部元数据形态，而规则仓库通用版本中心消费的是：

```json
{
  "channels": [
    {"channel":"test", "path":"..."}
  ]
}
```

因此即使仅把卡片补进 manifest，也可能出现“能看到程序，但版本中心没有可导入版本”。

## 3. 永久发布顺序

以后任何新程序首次进入“我的规则仓库”必须完整执行：

```text
1. app 目录 / CHANGELOG
2. Test/Candidate/Stable 元数据
3. release.json + 实际模块
4. Bootstrap + Shell
5. app channels.json 使用规则仓库标准 channels[] 合同
6. registry.json 登记恢复链
7. root manifest.json 增加展示条目并提升 revision
8. root manifest_meta.json 同步相同 revision + 正确 itemCount
9. GitHub main 回读上述所有路径
10. 规则仓库执行“同步”或等待 revision probe
11. 实机确认：能看到卡片 → 能进入版本中心 → 能导入 → 导入后能打开
```

**`registry 已登记 ≠ 云端仓库已发布`。**

## 4. 修改边界

普通新增程序只需要修改动态目录数据，不得为了让新程序出现而修改“我的规则仓库”Stable Release、Bootstrap 或 Shell。

只有目录协议本身变化时，才按 Test/Candidate 流程升级规则仓库 Core。

## 5. MyAv 修复记录

2026-08-23 已完成：

- `manifest.json` 加入 MyAv Test 项。
- revision 提升到 `202608231103`。
- `manifest_meta.json` 同步到相同 revision，`itemCount=9`。
- MyAv `channels.json` 改为 schema 4 / `channels[]` Test-only 标准格式。
- MyAv CHANGELOG 记录本事故和恢复链。

后续以用户实机同步结果为最终事实。
