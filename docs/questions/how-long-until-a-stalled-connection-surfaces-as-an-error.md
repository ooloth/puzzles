---
opened: 2026-08-30
status: open
---

# How long until a stalled connection surfaces as an error?

**Why it matters** A connection that is nominally up but stalled is the modal failure in a
tunnel, and it is the one most network code handles worst — retry logic typically fires on a
thrown error, which a silent stall never produces. No timeout figure exists anywhere.

**Would be settled by** Measurement on a real device on a real degraded link.

**Resolves into** `constraints.md`.
