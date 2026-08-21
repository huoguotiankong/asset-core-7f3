# 程序级 CHANGELOG 覆盖审计（2026-08-21）

本文件是一次性审计记录，不是第四份全局必读报告。长期规则已经写入三份核心文档。

当前 registry 中 7 个程序均已建立/登记程序级日志：

| App ID | 程序 | CHANGELOG | 状态 |
|---|---|---|---|
| rule-repo | 我的规则仓库 | `apps/tools/rule-repo/CHANGELOG.md` | 已有完整历史，并补当前 Stable/Test |
| acfun | ACFun | `apps/video/acfun/CHANGELOG.md` | 已有较完整技术历史，并补当前 Stable/Test |
| javdb-v3 | JavDB v3 | `apps/video/javdb/CHANGELOG.md` | 已建立技术日志；具体旧协议历史后续维修时基于当前源码逐步回填 |
| huangdou | 黄豆短剧 | `apps/video/huangdou/CHANGELOG.md` | Legacy 日志骨架，未知信息明确待确认 |
| mdai | 麻豆AI | `apps/video/mdai/CHANGELOG.md` | Legacy 日志骨架，未知信息明确待确认 |
| hanime1 | Hanime1 | `apps/video/hanime1/CHANGELOG.md` | Legacy 日志骨架，未知信息明确待确认 |
| javbus | JavBus | `apps/video/javbus/CHANGELOG.md` | Legacy 日志骨架，未知信息明确待确认 |

Release Guard 已新增 registry → changelog 存在性检查。以后新增程序如果忘记建立日志，CI 应直接阻止通过。
