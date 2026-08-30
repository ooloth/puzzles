---
opened: 2026-08-30
status: open
---

# Does service worker background sync fire reliably on iOS?

**Why it matters** Any plan that syncs progress after connectivity returns without the app
being open depends on it. If it doesn't fire reliably, sync only happens when the player comes
back — which changes what durability can be promised.

**Would be settled by** Documentation plus a real-device test.

**Resolves into** `constraints.md`.
