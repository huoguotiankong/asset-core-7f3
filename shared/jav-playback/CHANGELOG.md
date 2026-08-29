# JAV Playback SDK CHANGELOG

## 1.1.0-test.1 / Build 11001 — 2026-08-29
- Test-only expansion from 3 to 6 Providers: MissAV, 123AV, Jable, AV01, TKTUBE, JavGuru.
- MissAV keeps the promoted Test4 parser and adds last-good domain rotation, missav.to fallback, and historical embed-id HLS fallback.
- 123AV and Jable parser bodies remain frozen from promoted 1.0.0-test.4 for regression safety.
- AV01, TKTUBE and JavGuru are self-contained; no external Hiker-rule dependency and no hard-coded Cloudflare clearance cookie.
- NJAV is not a separate Provider because njav.tv currently migrates to 123av.com.
- SupJav is deferred while ordinary requests are Cloudflare-blocked.
- Status: pending Hiker device validation. Stable pointer unchanged.

## 1.0.0-test.4 / Build 10004 — 2026-08-23
- Promoted baseline with MissAV / 123AV / Jable.
- 123AV and Jable were device-confirmed in the prior Test2 lineage.
- Stable pointer remains immutable; later work creates new Test releases.
