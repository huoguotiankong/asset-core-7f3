# 一键更新协议 v1

## 原则

正常运行只读本地稳定代码。用户主动点击“检查更新/立即更新”时才访问 GitHub。

## 应用 manifest

```json
{
  "schema": 1,
  "id": "demo",
  "name": "Demo",
  "version": "1.0.0",
  "build": 10000,
  "entry": "hc_demo_bundle.js",
  "files": [
    {
      "path": "apps/tools/demo/bundle.js",
      "local": "hc_demo_bundle.js",
      "md5": ""
    }
  ]
}
```

`path` 为仓库相对路径；`local` 为海阔规则私有文件名；`md5` 可选，非空时更新器会校验。

## 更新流程

1. 获取远程 manifest。
2. 比较 `build`。
3. 下载全部目标文件到内存并完成完整性校验。
4. 对当前本地文件建立 `.bak` 备份。
5. 写入新文件。
6. 任意一步失败则恢复已修改文件。
7. 成功后记录新版本；保留上一版本备份供手动回退。

## 网络策略

默认 GitHub Raw；更新器允许传入镜像列表。网络全部失败时只提示“更新失败，继续使用当前版本”，不得影响正常启动。
