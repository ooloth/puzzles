---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What does the server do with puzzle state?

## Why it matters

If a server exists, this is where two promises are kept or broken.
[../guarantees/durability.md](../guarantees/durability.md) says a player's work is never lost and
[../guarantees/offline.md](../guarantees/offline.md) says no merge or conflict prompt is ever
shown. A server able to reject a client's state leaves exactly two outcomes when it uses that
power: the work disappears, or the player is asked to choose between versions. Both are already
forbidden.

## What would settle it

The scope question above, then choosing between the options below against the two guarantees.
Most of the argument is already made.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Demoted from ADR-0003 on 2026-08-31, when a review found it specified the behaviour of a
component nothing had decided to build.

## Options

*Validate but never arbitrate.* The server refuses what is not a well-formed board of the right
shape, for a puzzle that exists, from someone entitled to write that key, within size and rate
limits. It never rejects state on the grounds that another version is more correct, and never
asks a player to choose. Where copies diverge the merge is deterministic — computable identically
by any party from the data alone, per cell.

*Store whatever it is given.* Simplest, and wrong. A client bug writing a corrupt board has that
corruption stored faithfully, made canonical, and propagated to every device that syncs, with the
local copy salvageable right up until the server accepted the bad one. An unauthenticated write
endpoint is also free storage for anyone who finds it.

*Compute the canonical merge and have clients adopt it.* Not harmful, but it buys nothing:
agreement between clients comes from the merge being deterministic, not from it being central.
It makes the server load-bearing for a case that resolves without it, and puts reconciliation out
of reach whenever the server is unreachable — the condition the app exists for.

*Reject divergent state.* Forbidden by both guarantees above.

## Findings

**What this decides beyond itself.** [What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md)
and [which database, if any?](which-database-if-any.md), since a store that never reads inside a
value has a very short list of requirements.

**Ordering is not arbitration.** A server may assign arrival order to writes without deciding
whose play was right, and it is the only way to avoid depending on device clocks agreeing. It
carries the opposite error — a device offline all day arrives last having written first — so it
is a trade rather than a fix.

**Per-cell timestamps must record when the cell changed, not when the board was written.** If a
device writes a whole board stamped with one fresh time, cells it never touched arrive looking
newer than genuine edits made elsewhere, and untouched cells silently clobber real changes.
Merging changes makes this impossible by construction; merging whole states makes it a discipline
that can be got wrong invisibly.

**The merge belongs in a pure, portable module**, alongside the puzzle rules and for the same
reason: it must run identically on every client and possibly on the server, and should outlive
whatever transport and storage are chosen around it.

**Cultured Code reached the same architecture from an unrelated direction.** They abandoned
server-side merging for Things Cloud because "it requires that all merging and conflict
resolution be done on the server — and this turns out to be really slow", with disk operations
dominating. They took a version-control-inspired design with a full local database on every
device, and that merge core survived a complete rewrite fourteen years later, from Python on App
Engine to Swift, while everything around it was replaced. Two unrelated arguments — ours from
promises, theirs from cost — arriving at the same place.

**Validating the position against the rules of the game is a separate and deferrable thing.** It
needs the rules to run on the server as well as the client, and nothing currently depends on a
puzzle genuinely being finished. The trigger is the moment anything gated does — a streak, an
unlock, a paid archive — at which point an unvalidated completion becomes worth faking, and the
decision to defer will have been made long enough ago that nobody connects the two.

**Three failure modes descend from this**, all recorded:
[a cell edit overwritten by an older one](../failure-modes/a-cell-edit-is-overwritten-by-an-older-one.md),
[a corrupt board becoming canonical](../failure-modes/a-corrupt-board-becomes-the-canonical-one.md),
and [the write endpoint as free storage](../failure-modes/the-write-endpoint-becomes-free-storage.md).
