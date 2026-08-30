---
opened: 2026-08-30
status: open
---

# Does `navigator.storage.persist()` do anything on iOS Safari?

**Why it matters** It's the commonly recommended API for durable storage and it appears
nowhere in WebKit's tracking-prevention documentation. If it works, it's a second mitigation
for the seven-day wipe. If it doesn't, code that calls it is false reassurance.

**Would be settled by** Testing on a real device. An afternoon's work.

**Resolves into** `constraints.md`.
