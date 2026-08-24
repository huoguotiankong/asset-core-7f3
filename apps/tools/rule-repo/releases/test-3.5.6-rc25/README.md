# Rule Repo 3.5.6-rc25

RC25 is a shell-level delivery patch over the verified Build402 Local-First runtime.

- Stable remains 3.5.5 / Build389.
- Runtime base remains 3.5.6-rc12 / Build402.
- RC24 local catalog, local icon pack and standalone light sync remain intact.
- Ordinary `.txt` Remote / Test / Stable imports now hand off immediately to Hiker's native `home_rule_url` importer through a versioned jsDelivr URL.
- Special codecs (`hkzip`, generated local editions, retitled local editions) continue using their existing build path.
- Device validation target: clicking an ordinary version import must return to the native import prompt immediately instead of blocking inside repository `lazyRule` while Raw/API downloads run.
