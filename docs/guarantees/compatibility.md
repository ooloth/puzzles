---
updated: 2026-09-01
update_when: a supported browser, OS version, or device class changes
decays: slow
status: stub
---

# Compatibility

Where the other promises hold: which browsers, which OS versions, which device classes. Every
guarantee in this folder is implicitly scoped to something, and until that scope is written
down each one quietly claims more than it can deliver.

_No promises yet._

This matters sooner than it looks. The storage behaviour that shapes
[durability.md](durability.md) differs by browser and by version, and only Safari's is written
down. [../constraints.md](../constraints.md) states its eviction window, and how long a guest's work
is expected to last against it is still open — see
[how long does a guest's work last?](../questions/how-long-does-a-guests-work-last.md) — so the
promises there hold on a platform nobody has named.
[How does Android evict stored data?](../questions/how-does-android-evict-stored-data.md) is
unresearched, which is half the market with no stated position at all.
