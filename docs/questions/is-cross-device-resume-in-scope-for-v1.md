---
opened: 2026-08-30
status: open
---

# Is cross-device resume in scope for v1?

**Why it matters** Desktop use by the same person at a different time is described as
expected, but the previous design explicitly accepted losing everything on a device switch.
Both positions are in the record. This is the sharpest contradiction inherited from the old
documents, and `guarantees/` currently promises only same-device resume because of it.

**Gates** [are there user accounts](are-there-user-accounts.md),
[how a second device recognises the same person](how-does-a-second-device-recognise-the-same-person.md),
[what happens to a losing write](what-happens-to-a-losing-write-when-syncing.md).
