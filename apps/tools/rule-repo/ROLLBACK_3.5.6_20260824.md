# Stable 3.5.6 撤回记录

2026-08-24，用户在实机补做版本中心回归后确认 Stable 3.5.6 / Build393（由 RC3 晋级）存在两个 P0：多版本详情显示 0 个版本导致无法导入；X5“打开程序”触发 jsoup `String must not be empty`。因此活动 Stable 指针恢复到 3.5.5 / Build389，3.5.6 的 Release/Bootstrap/Shell 工件永久保留历史，不删除、不覆盖。修复线进入 Test 3.5.6-rc4 / Build394，必须完成版本列表、导入、打开程序与 Fast Home 全链实机回归后才允许再次晋级。
