# RC29 device acceptance

Do not open Stable during this test.

1. Stay on running Test RC28 / Build418.
2. Open the repository's own detail page and tap `检查版本`.
3. The Test channel must become `3.5.6-rc29 / Build419` while current install remains RC28.
4. Import/overwrite RC29 from that same test repository page.
5. Reopen the test repository; current install must become RC29 / Build419.
6. Home update count, icons, fast catalog check and ordinary native import must remain functional.

Passing steps 2–5 proves the test repository can self-update without using Stable as a rescue jump point.
