# RC37 Detail On-Demand

- Base: Stable 3.5.5 / Build389 fast cache model + RC36 Fast Hybrid.
- Fix: channel-group cards with empty front-end `channels` no longer enter a zero-version local detail directly.
- First click loads only the selected app's authoritative `channels.json`, stores per-app cache, then opens detail.
- Home remains cache-only: no N+1 channels fetch, no device-wide rule scan.
