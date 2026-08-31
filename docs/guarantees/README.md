---
updated: 2026-08-30
update_when: a promise is made to players, or a theme is added
decays: slow
status: active
---

# Guarantees

What must always be true for a player. Violating one is **our** bug — not the platform's
(→ [../constraints.md](../constraints.md)), and not a reversible choice
(→ [../decisions/](../decisions/)).

Nothing here is enforced yet, because there is no application code yet. As the system gets
built, the enforcement line under each promise is what tells you which of these have become
real. `rg -B6 'Asserted only' docs/guarantees/` lists everything still unbacked.

## Every guarantee names what enforces it, and says so plainly where nothing does

An unenforced guarantee is a wish. Recording the absence turns this folder into a backlog
as well as a list of promises — and a wish labelled as a promise is worse than no promise,
because someone will build on it.

## A promise is enforced, or its limits are written into it

Where a promise can't be made to hold in every condition, the conditions under which it
doesn't hold are stated as part of the promise. There is no separate place for fallbacks —
an escape hatch nobody wrote down reads to a player as the promise simply being false.
A guarantee with a stated boundary is honest; one with an unstated one is not.

## Writing a guarantee

Each heading is a claim you could hold against the running system and mark true or false.

- The subject is the player's experience or the artifact — never the implementation.
- Present tense, unconditional. "Always" is implied by being in this folder.
- Every qualifier is measurable or enumerable. If a claim needs "immediately", "several",
  or "normal play", either replace it or the guarantee isn't written yet.
- One promise per entry. An "and" joining two separable claims means two entries.

Under each claim: what enforces it, what breaks if it doesn't hold, and what open questions
or constraints bear on it.

## Themes

- [puzzles.md](puzzles.md) — what makes a puzzle worth solving, and what's offered over time
- [sudoku.md](sudoku.md) — promises that hold for sudoku and not for every variant
- [durability.md](durability.md) — a player's work outlives the session that made it
- [latency.md](latency.md) — how quickly the app answers a player's action
- [offline.md](offline.md) — behaviour when the network is degraded or gone
- [interaction.md](interaction.md) — what the interface must convey for a player to reason
- [correctness.md](correctness.md) — the program does what it says
- [accessibility.md](accessibility.md) — who can play, and how
- [compatibility.md](compatibility.md) — where the other promises hold
- [observability.md](observability.md) — whether we would know a promise had been broken
- [performance.md](performance.md) — what the app costs the device it runs on
- [privacy.md](privacy.md) — what we know about a player and what we do with it
- [security.md](security.md) — what a hostile input or actor cannot do

Add a theme once it has a real promise in it.
