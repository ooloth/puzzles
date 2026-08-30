---
updated: 2026-08-30
update_when: a promise is made to users, or an enforcement mechanism is added or removed
decays: slow
status: stub
---

# Guarantees

Things that must always be true. Violating one is **our** bug — not the platform's
(→ [constraints.md](constraints.md)), not a reversible choice (→ [decisions/](decisions/)).

An unenforced guarantee is a wish. The empty middle cell is the point: this table doubles
as a backlog of things we claim but never check.

_No guarantees yet — no running system to be wrong about._

| Must always hold | Enforced by | If violated |
|---|---|---|
| _example_ Every generated puzzle has exactly one solution | `solver.test.ts:uniqueness` | Unsolvable board reaches a player; total trust loss |
| _example_ Progress survives a hard refresh | **nothing — asserted only** | Silent data loss |

Delete the examples on first real entry.
