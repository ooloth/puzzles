---
updated: 2026-08-30
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
[durability.md](durability.md) differs by browser and by version, and there is currently no
statement of a floor — so "progress is never lost" is unbounded in a way nobody has agreed to.
[How does Android evict stored data?](../questions/how-does-android-evict-stored-data.md) is
unresearched on a platform we have no stated position on at all.
