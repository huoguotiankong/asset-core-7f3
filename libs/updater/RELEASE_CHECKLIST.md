# Hiker Cloud 远程模块发布检查清单

> 适用于所有使用 `libs/updater/remote_manager.js` 的远程小程序。发布前必须逐项核对，不允许跳过。

## 1. 模块路径规则（强制）

- `release.json` 中 `modules[].path` **一律使用“仓库根目录相对路径”**。
- 模块实际位于仓库根目录时，例如 `acfun_fix_v045.js`，可以写：
  - `acfun_fix_v045.js`
- 模块位于子目录时，例如 `apps/video/acfun/acfun_fix_v047.js`，必须写完整：
  - `apps/video/acfun/acfun_fix_v047.js`
- **禁止把子目录模块只写 basename**，例如禁止：
  - `acfun_fix_v047.js`（当文件实际位于 `apps/video/acfun/` 时）
- 同一个 Release 内禁止混淆“相对当前应用目录”和“相对仓库根目录”两套路径语义。

### 发布前路径验证

在更新 `latest.json` 之前，必须逐个确认 `release.json` 中每个模块对应的最终 Raw URL 能访问：

`https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/<ref>/<modules[].path>?hc_release=<version>`

只要有一个模块 404 / 空内容，就禁止发布 `latest.json`。

## 2. Version / Build 规则（强制）

- `build` 必须单调递增；新正式发布不得复用已经下发过的 Build。
- **已经被设备加载/保存过的 version + build，不允许原地修改 Release 模块列表后继续沿用。**
- 如果某个 Release 已经错误下发，即使只是修路径，也必须：
  1. 新建更高 Build；
  2. 必要时新建新版本号；
  3. 将新 Build 设置为 Bootstrap `minBuild/defaultRelease`；
  4. 让旧 activeRelease 被强制越过。

原因：Remote Manager 会把完整 `current Release` 保存到 `hc_remote_state_<appId>`。设备已经保存的旧 Release 不会因为 GitHub 上同版本 `release.json` 被修改而自动刷新。

## 3. 坏 Release 救援规则

如果错误 Release 已经进入用户设备：

- 第一层：在旧错误 URL 补兼容桥，保证旧 activeRelease 不再 404；
- 第二层：发布更高 Build，强制 `minBuild` 越过旧状态；
- 第三层：必要时提高 Bootstrap `?v=` / require version，绕过旧壳缓存；
- 第四层：云仓库安装入口同步新 Bootstrap，确保覆盖导入也能救援。

**禁止只修改同 Build 的 `release.json` 后认为客户端会自动恢复。**

## 4. 发布文件同步矩阵

一次正式业务发布至少核对：

1. 业务模块文件已提交；
2. `apps/<category>/<app>/releases/<version>/release.json`；
3. `apps/<category>/<app>/latest.json`；
4. 应用 `manifest.json` 的 defaultVersion/defaultBuild；
5. Bootstrap 的 `minBuild/defaultRelease/verify`；
6. 如果 Bootstrap 内容变化：提升 Bootstrap 自身版本和 `require(..., version)` 缓存号；
7. 云仓库导入规则（例如 `acfun_remote_v5.txt`）指向正确 Bootstrap 缓存号；
8. 根 `manifest.json` 显示版本与说明同步；
9. 如有 registry/channels/索引文件，同步更新；
10. CHANGELOG 记录本次业务变更与发布链变更。

### 必须保持的一致性

- `latest.version == release.version`
- `latest.build == release.build`
- `release.verify` 与实际模块最终 `ac.build` 一致
- Bootstrap `defaultRelease.version/build` 与稳定基线一致
- Bootstrap `minBuild <= defaultRelease.build`，救援发布通常应设为当前新 Build
- 应用 manifest `defaultVersion/defaultBuild` 与稳定基线一致
- 根 manifest 的展示版本不能落后于实际可导入基线

## 5. 正确发布顺序

必须按以下顺序，不能先更新 `latest.json`：

1. 提交所有新业务模块；
2. 从 GitHub 再读取一次，确认文件真实存在；
3. 创建 `release.json`；
4. 逐个验证 Release 最终 Raw 模块 URL；
5. 验证 `verify` 对应的实际 build 字符串；
6. 更新 Bootstrap/应用 manifest（如果需要）；
7. 更新云仓库导入入口（如果需要）；
8. 最后才更新 `latest.json`；
9. 最后同步根 `manifest.json` / registry / changelog。

## 6. 发布后必须测试的 3 种状态

每次至少考虑三种客户端：

- **新安装**：本地没有 `hc_remote_state_*`；
- **正常升级**：本地保存上一个正常 Build；
- **脏状态/坏 Release**：本地保存一个已经发布过但模块路径错误、模块缺失或验证失败的 activeRelease。

只有三类都能进入程序，才算发布链完成。

## 7. ACFun 0.4.8 发布事故记录（2026-08-21）

### 事故

`acfun_fix_v047.js` / `acfun_fix_v048.js` 实际位于：

- `apps/video/acfun/acfun_fix_v047.js`
- `apps/video/acfun/acfun_fix_v048.js`

但初版 0.4.8 Release 只写了 basename，Remote Manager 按仓库根目录拼接后请求：

- `/main/acfun_fix_v047.js?hc_release=0.4.8`

导致 404，ACFun 启动失败。

### 二次事故原因

随后虽然修正了 GitHub 上的 0.4.8 Release，但设备已经把旧 Build 148 Release 完整保存到 `hc_remote_state_acfun`。由于 Build 没变，`minBuild=148` 无法替换旧状态，所以覆盖导入后仍继续访问旧错误 URL。

### 最终修复

- 根目录增加 v047/v048 兼容桥，救援旧错误 URL；
- 发布 0.4.9 / Build 149；
- Bootstrap 最低基线升到 149；
- Bootstrap 缓存号升级，云仓库入口同步；
- 新 Release 使用明确的仓库根相对完整路径。

### 永久规则

**远程模块新增/移动目录时，必须同时检查模块实际 GitHub 路径、Release path、最终 Raw URL；错误 Release 一旦下发，禁止复用原 Build 修补。**

---

本文件属于发布门禁文档。后续所有远程小程序发布都应参考，不仅限于 ACFun。
