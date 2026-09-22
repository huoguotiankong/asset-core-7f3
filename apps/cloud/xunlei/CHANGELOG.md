# 迅雷小程序 Changelog

> 当前目录从 2026-09-22 开始建立正式维护记录。当前源码基线来自用户上传的 `迅雷.hk小程序(1).zip`，尚未登记为 Stable/Latest；先以 Test 做实机性能验证，验证通过后再进入正式远程化和版本治理。

## 当前基线

- 用户当前运行规则名：`迅雷`
- 上传包规则 `version`：`1`
- 当前调用入口：`hiker://page/diaoyong?rule=迅雷&page=fypage#<url-or-magnet>`
- 主要外部磁链链路：

```text
JavDB 等外部规则
→ 迅雷 diaoyong
→ rule1(resource/list)
→ 用户选择视频
→ lazy3
→ activity
→ yunbo(create offline file)
→ tasks 查询 file_id
→ PLAY detail
→ 返回播放器 URL/多画质
```

### 原始性能问题（源码确认）

1. `diaoyong` 页面顶部调用 `rongliang()`，会在显示磁链列表前额外请求一次 `/drive/v1/about`，与磁链播放本身无关。
2. `lazy3` 每次播放磁链视频前都无条件执行 `activity()`，产生至少两次额外网络请求。
3. `yunbo()` 创建离线任务后固定 `Thread.sleep(1000)`，无论任务是否已经完成都至少等待 1 秒。
4. 固定等待后再查一次 `/drive/v1/tasks`，没有“提前完成即提前返回”的快路径。
5. 获取播放地址后，原实现会在返回播放器之前同步删除临时盘内文件，又多占用一次热路径网络请求。

---

## 2026-09-22 · 1.1.0-test.2 / Build11002 · 磁链播放可靠性修复

### Test1 实机回归

用户当前实机确认：

- 外部磁链仍能正常进入迅雷，并正常显示文件列表。
- 点击实际视频文件后不能起播。
- 海阔提示：`文件(夹)不存在，请检查确认`。

这证明 Test1 的“页面变快”成立，但它把“离线任务已创建”和“盘内文件真正可播放”错误合并成同一个状态，属于起播链 P0 回归。

### 根因

Test1 `yunbo()` 为了抢速度，在创建离线任务后会尝试从多个字段立即取 ID：

```text
create response file_id
file.id
reference_resource.id
result.file_id
```

其中 `reference_resource.id` / 创建响应中的某些 ID 并不等价于“已经落盘、可通过 `/drive/v1/files/<id>?usage=PLAY` 读取的真实文件 ID”。

实机因此出现：

```text
磁链资源列表正常
→ 点击视频
→ 过早拿到占位/引用 ID
→ 请求 PLAY detail
→ 文件(夹)不存在
```

此外 Test1 的 `resolvePlay()` 一旦收到“文件不存在”类错误会立即结束，也没有给迅雷离线落盘后的最终一致性窗口留重试时间。

### Test2 修复

- `yunbo()` 不再接受 create response / `reference_resource.id` 作为播放 ID。
- **唯一可信入口改为离线任务接口返回的 `task.file_id`**。
- 去掉固定 1 秒等待，改为 `0 / 100 / 160 / 260 / 420 / 650 / 900 ms` 轮询；只要 `task.file_id` 提前出现就立即进入播放链。
- `resolvePlay()` 遇到 `文件(夹)不存在 / not found / 不存在` 时不再第一次就判死，按 `0 / 140 / 240 / 380 / 600 / 850 ms` 短退避重试。
- `lazy3()` 恢复原版“播放前先确保权益刷新”的语义，但调用 `activity(false)`：Test1 已给 `activity()` 加本地成功 TTL，因此首次需要时刷新，后续调用可快速命中；若创建任务仍返回权益类错误，`yunbo()` 会 `activity(true)` 后重试一次。
- 保留 Test1 已验证不会直接破坏资源列表的两项优化：
  - `diaoyong` 不再同步查询容量；
  - 临时文件删除继续移出首次起播热路径。

### 当前交付

- Installer：`cloud/xunlei/v1.1.0-test.2/import_magnet_reliability.js`
- Installer 固定 Commit：`d34e9a0a0fe30a02d11e605fa8b0263823d433cb`
- Release：`apps/cloud/xunlei/releases/1.1.0-test.2/release.json`
- 仍采用“读取当前已安装迅雷 → 只覆盖目标函数 → 同名覆盖导入”的云口令方式。
- Stable/Latest/共享 registry 均不切换。

### Test2 实机验收

优先级顺序：

1. 磁链文件列表正常出现。
2. 点击视频不再出现“文件(夹)不存在”。
3. 播放器真正起播。
4. 第二个、第三个不同磁链连续调用仍正常。
5. 再比较点击视频到起播的速度是否优于原始版。
6. 功能稳定后才继续优化拖动进度条恢复速度。

---

## 2026-09-22 · 1.1.0-test.1 / Build11001 · 磁链起播第一轮加速（当前已证伪部分策略）

### 修改边界

本轮只优化“外部磁链调用 → 选择文件 → 获取播放地址”的热路径，不重写登录、盘内浏览、分享链接、普通文件播放和下载逻辑。

### 优化内容

- `diaoyong` 不再为展示账号卡同步请求网盘容量，登录态直接读取本地 `authorization` 状态。
- 磁链视频点击时取消无条件 `activity()`；先直接创建离线任务，仅服务端明确返回权益/次数类错误时才执行原 `activity()` 并重试一次。
- `yunbo()` 去掉固定 `sleep(1000)`，改为短轮询，并错误地尝试从 create response / `reference_resource.id` 提前取得文件 ID。
- 新增统一 `resolvePlay()`，磁链临时文件播放详情请求只保留起播必要字段。
- 磁链临时文件不再在播放器返回前同步删除；先记录到本地队列，超过 15 分钟后再清理。

### 实机结论

- 磁链列表可以正常显示。
- 点击视频出现 `文件(夹)不存在，请检查确认`，说明提前采用非 `task.file_id` 的做法无效。
- **禁止后续再把 `reference_resource.id` 或创建接口中的未确认 ID 当作可播放文件 ID。**
- Test1 不作为后续恢复基线；Test2 从其 UI/延迟清理优化中保留安全部分，并修复文件落盘时序。

### 云口令交付

- Installer：`cloud/xunlei/v1.1.0-test.1/import_fast_magnet.js`
- Installer 固定 Commit：`07a81b19b092b19c7efe916cb263dd118bff2e9c`
- Release：`apps/cloud/xunlei/releases/1.1.0-test.1/release.json`

### 当前状态

Test1 已冻结，不再继续修改或晋级。