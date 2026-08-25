# Rule Repo 3.5.6-rc29 / Build419

RC29 is a deliberately minimal self-update closure probe.

It adds no new business/UI behavior beyond RC28. Its purpose is to prove that an already-running RC28 test repository can:

1. refresh only `apps/tools/rule-repo/channels.json`;
2. discover the higher Test Build419 without opening Stable;
3. import `rule_repo_test_v166.txt` from inside the test repository;
4. reopen as current `3.5.6-rc29 / Build419`.

Stable remains frozen at 3.5.5 / Build389 until this closure is confirmed on-device.
