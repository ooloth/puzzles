---
opened: 2026-08-30
status: open
---

# How would we verify progress is never lost?

**Why it matters** This can't be checked by unit tests. Backgrounding, tab kill, and OS memory
purge need real devices or an instrumented harness, and no approach has been proposed. Until
one exists, the most consequential guarantee in the product is enforced by nothing.

**Gates** the enforcement column for the durability guarantees.
