# 规则仓库 `home_rule_url` 导入等待/卡住事故（2026-08-25）

## 现象

用户实机确认：规则仓测试版在 RC25-RC31 阶段，点击普通 Remote/Test/Stable 小程序导入后，经常需要等待很久才出现海阔导入提示，偶发长时间卡住；而 Stable 3.5.5 的旧导入链明显更快、也没有同等级卡住问题。

## 对照事实

Stable 3.5.5 的普通 `.txt` 导入：

```text
规则仓 JS 读取完整远程规则正文
→ 返回“海阔视界，首页频道￥home_rule￥...”完整 payload
→ 海阔直接解析导入
```

RC25-RC31 的普通 `.txt` 导入：

```text
规则仓返回“海阔视界，首页频道合集￥home_rule_url￥<remote Shell URL>”
→ 海阔原生远程导入器再次访问 Shell URL
→ 解析并导入
```

RC30 已把 `@main` URL 改成 fixed commit SHA，但用户仍反馈长时间等待/卡住，说明主要问题不是整个 Runtime 文件体积，也不只是 `@main` 分支解析或 CDN 缓存一致性。

## 结论

`home_rule_url` 不能被假设为“天然非阻塞”或“必然比直接 payload 更快”。在用户当前海阔环境中，它可能成为额外的远程读取/解析等待层。

因此，规则仓普通 `.txt` 导入的推荐策略改为：

1. fixed immutable `importRef` 优先；
2. Raw / GitHub Raw / jsDelivr 三镜像短超时获取完整规则正文；
3. 直接返回完整“海阔视界…”规则 payload；
4. 特殊 codec（hkzip、本地生成、改名等）继续独立构建链；
5. 网络容错必须有明确阻塞上限，禁止恢复 `20s + 20s` 级长串行 fallback。

## RC32 修复

- Test：`3.5.6-rc32 / Build422`。
- 新增 `apps/tools/rule-repo/releases/test-3.5.6-rc32/direct_payload_import_patch.js`。
- 三镜像 `batchFetch` 每路约 `2600ms` 超时；失败后才使用 `1800ms` 短串行兜底。
- 保存 `hc_repo_import_diag_v2`，记录规则正文网络读取耗时、镜像、字节数、ref、path。

## 后续判断方法

- 如果 `hc_repo_import_diag_v2.elapsed` 明显低于用户实际等待时间，则瓶颈在海阔解析/导入 payload，而不是仓库网络获取。
- 如果诊断耗时本身很高，则继续优化镜像选择、固定 ref 或本地预取，不应先改业务 Runtime。

## 禁止事项

- 不得因为 `home_rule_url` 名称像“原生远程导入”就默认它一定更快。
- 不得把用户看到的导入等待简单归因于“整个小程序文件太大”。
- 未经实机确认，不得把 RC32 导入策略直接晋级 Stable。
