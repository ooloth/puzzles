---
updated: 2026-08-30
update_when: a promise is made to users, or an enforcement mechanism is added or removed
decays: slow
status: active
---

# Guarantees

Things that must always be true. Violating one is **our** bug — not the platform's
(→ [constraints.md](constraints.md)), not a reversible choice (→ [decisions/](decisions/)).

An unenforced guarantee is a wish. Every entry names what enforces it, and says so plainly
where nothing does — which makes this document a backlog as well as a list of promises.
`rg -A1 'Enforced by' docs/guarantees.md` shows them all; the ones reading *nothing* are
the backlog.

Nothing is enforced yet because there is no application code yet. As the system gets built,
those lines are what tell you which promises have become real.

---

## Correctness

### Every puzzle served has exactly one solution

**Enforced by** nothing — asserted only.

**If violated** A player grinds away at a board that can't be finished, or finds a second
valid answer. The core claim of the product is false, and that trust doesn't come back.

### Every puzzle served is solvable by reasoning alone, with no guessing required

**Enforced by** nothing — asserted only.

**If violated** The player hits a wall that isn't their fault and can't tell whether they're
stuck or the puzzle is. Uniqueness alone doesn't prevent this — a board can have exactly one
solution and still be reachable only by guessing.

---

## Durability

### In-progress state is never lost, however a session is interrupted

Grid entries and notes survive the app being backgrounded, the tab being killed, the phone
being locked, and the browser crashing.

**Enforced by** nothing — asserted only.

**If violated** Half an hour of a player's thinking disappears, with no error and no
recovery. The worst failure this product can have.

### Reopening on the same device restores the exact board the player left

With no explicit sync step and no prompt.

**Enforced by** nothing — asserted only.

**If violated** The player is punished for closing the app, which they do constantly.

### Progress is kept without requiring an account or login

**Enforced by** nothing — asserted only.

**If violated** Durability becomes conditional on signing up, which changes what the product is.

---

## Responsiveness

### Input renders visible feedback immediately, under any network condition including none

Tapping a cell, entering a digit, toggling a note.

**Enforced by** nothing — asserted only. No threshold is defined yet, so this is not
checkable as written.

**If violated** The app feels broken exactly where it must feel best. In a tunnel this is
the difference between a product and a toy.

### The app stays fully interactive through a total loss of connectivity lasting several minutes

With no errors and no broken UI.

**Enforced by** nothing — asserted only.

**If violated** The modal use case — playing on a commute — is where the app stops working.

### No loading, reconnecting, or error state ever appears during normal play

**Enforced by** nothing — asserted only.

**If violated** The player is made responsible for the network, mid-puzzle.

### No merge or conflict prompt is ever shown

**Enforced by** nothing — asserted only.

**If violated** The player is asked to arbitrate a data-model detail they can't reason about.

---

Cross-device resume, a latency threshold for "immediately", and how any of these would be
verified are all open — see [questions/](questions/).
