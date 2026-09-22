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
→ 固定 sleep(1000)
→ tasks 查询 file_id
→ lazy1(files/<id>?usage=PLAY...)
→ 同步删除临时盘内文件
→ 返回播放器 URL/多画质
```

### 当前性能问题（源码确认）

1. `diaoyong` 页面顶部调用 `rongliang()`，会在显示磁链列表前额外请求一次 `/drive/v1/about`，与磁链播放本身无关。
2. `lazy3` 每次播放磁链视频前都无条件执行 `activity()`，产生至少两次额外网络请求。
3. `yunbo()` 创建离线任务后固定 `Thread.sleep(1000)`，无论任务是否已经完成都至少等待 1 秒。
4. 固定等待后再查一次 `/drive/v1/tasks`，没有“立即命中 + 短轮询”快路径。
5. 获取播放地址后，原实现会在返回播放器之前同步调用删除接口，删除临时盘内文件又占用一次热路径网络请求。
6. 以上链路叠加后，用户体感表现为“磁链能调用，但从选择视频到真正起播偏慢”。

---

## 2026-09-22 · 1.1.0-test.1 / Build11001 · 磁链起播第一轮加速

### 修改边界

本轮只优化“外部磁链调用 → 选择文件 → 获取播放地址”的热路径，不重写登录、盘内浏览、分享链接、普通文件播放和下载逻辑。

### 优化内容

- `diaoyong` 不再为展示账号卡同步请求网盘容量，登录态直接读取本地 `authorization` 状态。
- 磁链视频点击时取消无条件 `activity()`；先直接创建离线任务，仅服务端明确返回权益/次数类错误时才执行原 `activity()` 并重试一次。
- `yunbo()` 去掉固定 `sleep(1000)`，改为 `0 / 100 / 180 / 300 / 500 ms` 短轮询；如果创建接口直接返回 `file_id` 则立即进入下一步。
- 新增统一 `resolvePlay()`，磁链临时文件播放详情请求只保留 `PLAY / hdr10 / subtitle_files` 等起播必要字段，并对播放地址未就绪做 `0 / 120 / 250 / 420 ms` 短轮询。
- 磁链临时文件不再在播放器返回前同步删除；先记录到本地队列，超过 15 分钟后在普通网盘浏览时批量清理，避免 DELETE 请求阻塞首次起播。
- 普通目录与分享链接主体流程不重写，降低本轮回归面。

### 云口令交付

用户明确要求后续迅雷测试版使用云口令，不再以本地 `.hk小程序.zip` 作为主要交付方式。

当前 Test1 使用“基于已安装规则的云端补丁导入器”：

```text
当前已安装 迅雷
→ request(hiker://home@迅雷)
→ 解析当前 rule/pages
→ 只替换 activity / yunbo / lazy1 / lazy2 / lazy3
→ 注入 resolvePlay / 临时文件延迟清理
→ 返回同名 迅雷 规则覆盖导入
```

- Installer：`cloud/xunlei/v1.1.0-test.1/import_fast_magnet.js`
- Installer 固定 Commit：`07a81b19b092b19c7efe916cb263dd118bff2e9c`
- Release：`apps/cloud/xunlei/releases/1.1.0-test.1/release.json`
- 该安装方式要求设备上先保留当前 `迅雷` 规则；若找不到 `hanshu / diaoyong` 页面会直接报错，不猜测其它版本结构。

### 风险控制

- 不修改账号 Token/Captcha/登录算法。
- 不修改迅雷分享链接转存协议。
- `activity()` 原始服务请求逻辑保留，只改变调用时机并增加 20 小时成功缓存。
- Test1 未经实机验证前不建立 Stable/Latest 指针，不写入共享 registry/manifest 活动入口。

### 实机验收

重点分三段计时：

1. 外部磁链点击 → 迅雷磁链文件列表出现。
2. 点击视频文件 → 播放器真正开始出画面。
3. 播放后拖动进度条 → 恢复播放。

同时检查：

- 第一次磁链调用是否正常。
- 连续调用 2~3 个不同磁链是否正常。
- 多画质线路是否仍存在。
- 迅雷网盘内是否出现临时文件堆积；延迟清理是否正常。
- 登录过期、Captcha、权益不足时是否能正确回退到原刷新流程。

### 当前状态

`1.1.0-test.1 / Build11001` 已切换为云口令覆盖导入，等待用户实机验证；Stable/Latest/共享 registry 均未建立或切换。
