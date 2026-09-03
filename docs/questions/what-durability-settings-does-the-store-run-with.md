---
opened: 2026-09-03
status: open
resolves_into: decision
---

# What durability settings does the store run with?

## Why it matters

**These settings decide whether a committed write survives a power cut**, which makes them a
durability decision wearing configuration's clothes.
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) explicitly declines to settle them and
says why: journal mode, synchronous level and busy timeout determine what "committed" means.

**The default is not obviously right.** In WAL mode with `synchronous=NORMAL` — the combination most
guides recommend — a transaction can be reported as committed and then lost if the machine loses
power, because the write is in the operating system's hands rather than on the platter. `FULL` closes
that window and costs an fsync per commit. Neither is wrong; picking one without knowing that is.

**The store is the last copy** ([ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md)),
so the window this opens is a window on losing a player's work.

## What would settle it

**Measuring rather than reading, and refusing the framing that this is a trade.** The usual advice
presents durability and speed as a dial to be positioned. That framing should be resisted here until
it is demonstrated, because this product's write volume is plausibly under a hundred per second
against drivers that sustain tens of thousands — so there may simply be no cost to buying the safest
setting, and a trade nobody has to make is not a trade.

So the question to answer first is: **what does the safest configuration actually cost on the machine
this runs on, at the write rate this product produces?** If the answer is "nothing measurable", the
decision is made and no properties were traded. If it is not, the record has to say what was given up
and why.

The settings in scope, each of which should be chosen rather than defaulted into:

- **Journal mode.** WAL, and the reasons are well established — concurrent readers with a writer.
- **`synchronous`.** The one that decides the power-cut window.
- **`busy_timeout`.** What happens when a writer finds the lock held rather than failing immediately.
- **Checkpoint behaviour**, including what stops the WAL growing during a long read — which is
  [how do analysis and play share one store?](how-do-analysis-and-play-share-one-store.md).
- **Whether tables are `STRICT`**, which narrows the dynamic-typing cost
  [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) records as a standing one.

## Resolves into

A decision record in [../decisions/](../decisions/), and probably an entry in
[../constraints.md](../constraints.md) for whatever the measurement establishes.

## Source

Raised 2026-09-03, from [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md)'s statement that
these are durability decisions rather than configuration details, and from the maintainer's
instruction that the answer should try to maximise every desirable property rather than assume one has
to be sold for another.

## Options

*The safest configuration, unless it is shown to cost something.* The starting position this question
recommends testing rather than the one it assumes.

*The commonly recommended configuration* — WAL with `synchronous=NORMAL` — accepting a power-cut
window in exchange for throughput nobody has established is needed.

*Different settings for different tables or connections.* Possible, and it splits the durability
promise in a way that then has to be explained.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Write volume is likely three orders of magnitude below the drivers' capability.** Single keyed
inserts run at tens of thousands per second on ordinary hardware; this product's plausible peak is
under a hundred. That is the reason to expect the safest setting is free here, and it is a prediction
to test rather than a conclusion.

*Sourced — second-hand from a research agent's survey of benchmarks with disclosed methods,
2026-09-03. The load estimate is Reasoned and this product has no usage data.*

**An fsync on ordinary NVMe costs single-digit milliseconds.** Published figures cluster around
1.4–5.6ms depending on whether it is `fsync` or `fdatasync` and on the drive. At a hundred writes per
second that is a small fraction of a second per second of wall clock, which is the arithmetic this
question needs to check rather than assume.

*Sourced — second-hand from a research agent citing Percona benchmarks, 2026-09-03.*
