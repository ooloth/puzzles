---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which doors must stay open?

## Why it matters

Deferring a decision is only safe when the thing being deferred is still reachable afterwards.
Most of this project's plan is deferral — no accounts yet, no paid tier yet, no second game yet —
and that plan is sound exactly to the degree that each of those remains cheap to add. Whether it
does is a property of decisions being made now, quietly, in areas that look unrelated.

This is the question that makes "defer" a strategy rather than an omission. It is the opposite of
a v1 scope list: it does not say what ships, it says what must not become expensive.

Hosting topology is the worked example. Silent recovery after storage eviction depends on a
server-set cookie being judged first-party, which depends on how the app and its API are hosted
relative to each other — see [../constraints.md](../constraints.md). Choosing a static host with
its API elsewhere forecloses that mechanism, silently, months before anyone tries to use it.
Nothing about that choice announces itself as a door closing.

## What would settle it

Listing the futures worth preserving, and for each, naming the specific present decision that
would foreclose it and the cheap thing that keeps it open. A door with no identified threat is not
a door, it is a hope.

## Resolves into

As many records in [../decisions/](../decisions/) as it holds separable decisions, and then deletion.
Three are already written — [0009](../decisions/0009-puzzle-content-is-served-by-a-runtime.md),
[0010](../decisions/0010-nothing-about-a-puzzle-is-inferred-from-it-being-sudoku.md) and
[0013](../decisions/0013-storage-is-reached-through-one-narrow-interface.md) — and this file has
nothing left except the question of whether a door exists that nothing is tracking.

It does not resolve into a checklist in [../decisions/README.md](../decisions/README.md). That was
the earlier plan and it was wrong: a record that keeps a future reachable is titled by what it binds,
like every other record, so it is found by reading the listing rather than by a category filter.

## Source

Raised 2026-08-31, replacing a proposed "what is in v1?" question. Fixing a launch list before any
code exists is a guess; naming what must stay possible is not, and it is the artifact that makes
deferring the rest defensible.

## Options

N/A — this resolves into a list, not a choice between alternatives.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Three of the four doors this file named are now records, and the fourth is a question in M1.** What
is left here is the part nobody has done: looking for a door that nothing is tracking. A door with no
identified threat is a hope rather than a door, so the search has to name the present decision that
would foreclose each candidate, or find nothing and say so.

*A paid tier.* **Half held by a record.**
[ADR-0009](../decisions/0009-puzzle-content-is-served-by-a-runtime.md) keeps content withholdable.
The other half is entitlement and identity, whose threat is any decision making a paid tier
enforceable only by a rescue operation — and whose inputs land at M10, so it is not held open here.
[../problem.md](../problem.md) records that the tier itself is uncommitted and deliberately not ruled
out.

*Progress following a player between devices.* **Now a question rather than a door**:
[is guest recovery worth building?](is-guest-recovery-worth-building.md), which is M1's third entry.
The threat is shipping with no stable identifier, and the mechanism that would supply one is the same
one that would recover a wiped guest, so the two are decided together rather than separately.

> A locally-minted identifier is script-writable, so the browser's eviction takes it along with
> everything else — and it takes it from exactly the lapsed players who would need it. Only
> something a server sets survives, per [../constraints.md](../constraints.md). So this door is held
> open by a server, or by the player having signed in, rather than by a line of client code.
> [ADR-0006](../decisions/0006-what-a-players-work-survives.md) closes the gap a different way: the
> guest record and the account record are one shape, so signing in promotes what is there instead
> of needing an identifier to have survived.

*More puzzle types.* **Held by a record**, not by this list:
[ADR-0010](../decisions/0010-nothing-about-a-puzzle-is-inferred-from-it-being-sudoku.md). The threat was a data
model hard-coding a nine-by-nine grid of digits, and that record rules out the four assumptions that
would produce one while leaving the representation itself open.

*Silent recovery after eviction.* **The same question as the one above**, for the same reason: only a
server-set cookie survives the wipe, and deciding to mint one is deciding both.

*A native shell.* **Held by two records** —
[ADR-0013](../decisions/0013-storage-is-reached-through-one-narrow-interface.md) and
[ADR-0014](../decisions/0014-the-server-contract-is-json-not-html-fragments.md) — both extracted from
[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md), which named the recovery path and
mandated what keeps it cheap without titling either as a decision.

*Assistive technology.* **Held by
[ADR-0011](../decisions/0011-every-puzzle-cell-is-a-focusable-labelled-element.md)**, which keeps the
grid structurally reachable. The threat was a canvas renderer, chosen at M1 and asked about at M9.

**The cheap-now, expensive-later asymmetry is the whole shape of this question.** In every case
above, the door is held open by a small decision taken early — an identifier, a generic board
shape, a same-origin API — and closed by an equally small decision taken without noticing. Neither
is expensive. Only one is recoverable.

**Optionality has a cost and it is not zero.** Each door held open is a constraint on every later
decision, and a door nobody ever walks through was a tax paid for nothing. This list should stay
short, and an entry should be removed once the future it protects is genuinely abandoned.
