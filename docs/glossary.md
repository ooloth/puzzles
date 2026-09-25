---
updated: 2026-09-25
update_when: a domain term enters the code, or code naming drifts from user language
decays: slow
status: active
---

# Glossary

Domain words and their precise meaning — plus where our code has drifted from the language
users actually use. Drift is the valuable part: divergence between domain and code naming is
a quiet, compounding source of bugs, so flag it rather than quietly tolerating it.

One line per term. Name the code identifier only when it differs from the word players use.

**client storage** — persistent storage inside the player's browser: IndexedDB, `localStorage`, the
Cache API. Evictable, per-device, and unreachable from anywhere else. See
[constraints.md](constraints.md) for how and when the browser takes it away.

**the store** — the durable copy kept off the player's device, per
[ADR-0009](decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md). Not
evictable, not per-device. Whether it is a relational database, a key-value store or a file is
settled by [ADR-0020](decisions/0020-the-stores-engine-is-sqlite.md).

> **Never write "storage" unqualified.** The two above have opposite properties — one is taken away
> without warning and belongs to one device, the other is ours and outlives every device — and a
> sentence that does not say which one it means is read as whichever the reader had in mind.

**puzzle state** — the board plus what a player needs back on reopening: the selection, and undo
history if it is kept. It is held in memory by the code under `src/client/state/`, per
[ADR-0037](decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md), saved to client
storage on every change, and synced to the store, so one puzzle's state can exist as three copies.
Where copies need telling apart, say where each lives: in memory, in client storage, in the store.

**view state** — state only the renderer needs and no promise covers: a drag in progress, whether a
dialog is open, a hover highlight. It lives in the renderer and is lost on reload, per
[ADR-0037](decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md).

**the board** — the grid a player is currently solving, including their entries and notes.

**the play record** — everything a player accumulates beyond the current board: finished puzzles,
statistics, streaks if there ever are any. Distinct from the board because it has different value
over time — a forgotten board is worth little after a month, and a streak is worth what it always
was.

**a guest** — a player who has not signed in. What a guest keeps, and for how long, is
[open](questions/how-long-does-a-guests-work-last.md).

<!-- Template:

**clue** — the number printed outside the grid. In code: `Constraint` (drifted; rename someday).

**note** — a small pencilled candidate a player writes into a cell before committing to it.
-->

