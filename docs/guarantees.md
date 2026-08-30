---
updated: 2026-08-30
update_when: a promise is made to users, or an enforcement mechanism is added or removed
decays: slow
status: active
---

# Guarantees

Things that must always be true. Violating one is **our** bug — not the platform's
(→ [constraints.md](constraints.md)), not a reversible choice (→ [decisions/](decisions/)).

An unenforced guarantee is a wish. The empty middle cell is the point: this table doubles
as a backlog of things we claim but don't check. Nothing is enforced yet because there is
no application code yet — as the system gets built, that column is what tells you which
promises are real.

## Correctness

| Must always hold | Enforced by | If violated |
|---|---|---|
| Every puzzle served has exactly one solution | nothing — asserted only | A player grinds a board that can't be finished, or finds a second valid answer. The core claim of the product is false and the trust doesn't come back |
| Every puzzle served is solvable by reasoning alone, with no guessing required | nothing — asserted only | The player hits a wall that isn't their fault, and can't tell whether they're stuck or the puzzle is |

## Durability

| Must always hold | Enforced by | If violated |
|---|---|---|
| In-progress state — grid entries and notes — is never lost, however a session is interrupted: backgrounded, tab killed, phone locked, browser crashed | nothing — asserted only | Half an hour of a player's thinking disappears with no error and no recovery. The worst failure this product can have |
| Reopening on the same device restores the exact board the player left, with no explicit sync step | nothing — asserted only | The player is punished for closing the app, which they do constantly |
| Progress is kept without requiring an account or login | nothing — asserted only | Durability becomes conditional on signup, which changes what the product is |

## Responsiveness

| Must always hold | Enforced by | If violated |
|---|---|---|
| Tapping a cell, entering a digit, or toggling a note renders visible feedback immediately, under any network condition including none | nothing — asserted only. **No threshold is defined yet**, so this is not checkable as written | The app feels broken exactly where it must feel best. In a tunnel, this is the difference between a product and a toy |
| The app stays fully interactive, with no errors or broken UI, through a total loss of connectivity lasting several minutes | nothing — asserted only | The modal use case — playing on a commute — is where the app stops working |
| No loading, reconnecting, or error state ever appears during normal play | nothing — asserted only | The player is made responsible for the network, mid-puzzle |
| No merge or conflict prompt is ever shown | nothing — asserted only | The player is asked to arbitrate a data-model detail they can't reason about |

---

Cross-device resume, a latency threshold for "immediately", and how any of these would be
verified are all open — see [undecided.md](undecided.md).
