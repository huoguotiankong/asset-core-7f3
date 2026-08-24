# 规则仓库导入前台阻塞事故（2026-08-25）

## 现象

用户在“我的规则仓库·测试版”实机确认：导入最新测试版小程序特别慢；导入完成前海阔一直占用当前操作，无法继续进行其它操作。

## 根因

旧 `HikerRuleRepo.importRule()` 在点击按钮的 `lazyRule` 内先完整读取远程规则：

```text
点击导入
→ Raw GitHub fetch，timeout 20s
→ Raw 失败后 GitHub Contents API，timeout 20s
→ 完整规则文本 / hkzip 下载与解析
→ 记录本地状态
→ 最后才把“海阔视界…”规则文本返回给海阔
```

海阔 `lazyRule` 执行期间当前交互上下文被占用，因此网络慢时表现为整页卡死。问题不是规则文件本身体积，而是把“远程下载 + 容错 + 解析”放在了用户点击热路径里。

## RC25 修复

普通 `.txt` Remote / Test / Stable 规则不再由规则仓库 JS 完整下载。点击后立即返回海阔原生远程导入口令：

```text
海阔视界，首页频道合集￥home_rule_url￥<versioned jsDelivr Shell URL>
```

由海阔原生导入器负责后续读取和确认。规则仓库自己的 `lazyRule` 只负责生成口令和轻量记录，不再串行等待 Raw/API。

仍保留旧构建链的例外：

- `hkzip`：需要字节长度 / SHA256 / 解包校验。
- `javdb_local_build` 等需要现场生成完整本地规则的 codec。
- `javdb_retitle_remote` 等必须读取并重写规则元数据的 codec。

## 固定规则

1. 普通远程 `.txt` 规则导入优先使用海阔原生 `home_rule_url` 交接，不在 `lazyRule` 内预下载完整规则。
2. 用户点击热路径不得串行堆叠多个 10~20 秒网络 fallback。
3. 必须现场构建的特殊 codec 才允许保留同步构建，并应单独提示其可能耗时。
4. “导入记录”不能作为真实安装完成的唯一依据；原生导入交接后，最终是否安装成功仍由海阔实机结果确认。
5. 交付层优化必须先在 Test 实机验证，不直接改 Stable。

## 关联版本

- 问题基线：规则仓库 Test `3.5.6-rc24 / Build414`。
- 修复候选：`3.5.6-rc25 / Build415`。
- Stable：继续冻结 `3.5.5 / Build389`。
