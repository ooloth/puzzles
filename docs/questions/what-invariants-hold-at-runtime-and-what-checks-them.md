---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What invariants hold at runtime, and what checks them?

## Why it matters

The rules module and the store both have properties that must always be true: a board never has
two values in one cell, a stored puzzle always has exactly one solution, a player's record always
parses. Nothing today asserts any of these. Without an assertion, a bug that produces an invalid
board fails silently — the corrupted state gets read back, rendered, and played on top of, and
nobody finds out until much later, if ever.

[The guarantees README](../guarantees/README.md) names "a partial
write is never observable" and "the board on screen always matches the board in storage" as
candidate promises.
Neither is checkable without something asserting it — a promise with no assertion behind it is a
claim, not a guarantee.

The same assertions are what let an agent verify a change without the maintainer watching. A test
that only checks the happy path can pass while quietly producing an invalid board; an assertion
that runs on every write catches it regardless of which test exercised the path.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, extending the maintainer tooling milestone past the loops that were already
obvious.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Assertions are how a corrupt-state bug becomes a crash instead of a silent write.** TigerBeetle's
TIGER_STYLE: "Assertions detect programmer errors... The only correct way to handle corrupt code is
to crash. Assertions downgrade catastrophic correctness bugs into liveness bugs." Their density rule:
"The assertion density of the code must average a minimum of two assertions per function."

*Sourced — TigerBeetle TIGER_STYLE.md,
https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md.*

**A property is worth asserting at two different points, not once behind a shared check.** "For every
property you want to enforce, try to find at least two different code paths where an assertion can be
added. For example, assert validity of data right before writing it to disk, and also immediately
after reading from disk." A duplicated assertion survives a refactor that a single shared check would
not. This maps directly onto a puzzle app: assert a board is well-formed right before writing it to
client storage, and again right after reading it back.

*Sourced — TigerBeetle TIGER_STYLE.md and
https://tigerbeetle.com/blog/2023-12-27-it-takes-two-to-contract/.*

**Assert both what is expected and what is never expected.** TIGER_STYLE calls this positive and
negative space, "because where data moves across the valid/invalid boundary... is where interesting
bugs are often found."

*Sourced — TigerBeetle TIGER_STYLE.md.*

**TigerBeetle's assertions run in production, not only in tests.** They build in Zig's `ReleaseSafe`
rather than `ReleaseFast`, so the assertions keep firing after deployment.

*Sourced — TigerBeetle TIGER_STYLE.md.*

**The honest cost: production assertions crash the process on conditions that turn out not to be real
bugs.** An independent audit by Jepsen found "seven crashes... though most resulted from overly
defensive assertions rather than core logic failures." That only nets out positive for TigerBeetle
because a crashed replica in a cluster is a liveness blip — the cluster keeps serving from the other
replicas. Crash-on-assert needs somewhere to fail to. In a browser tab it is just a broken app unless
the client reloads and resyncs; in a single server process it is downtime.

*Sourced — Jepsen, https://jepsen.io/analyses/tigerbeetle-0.16.11.*

**Two assertions per function is calibrated for a different stakes profile than this app has.**
TigerBeetle's density rule fits a team where the failure mode is a wrong balance. Where the equivalent
density would actually pay off here is likely the storage boundary and the rules module, not UI render
code — but nobody has made that judgement yet, and it stays open.

**Related TIGER_STYLE rules worth naming.** "Put a limit on everything... all loops and all queues
must have a fixed upper bound" has a direct analogue here: an unbounded queue of unsynced mutations in
client storage is the same failure shape as an unbounded loop. "All errors must be handled" is backed
by a citation that "almost all (92%) of the catastrophic system failures are the result of incorrect
handling of non-fatal errors explicitly signaled in software."

*Sourced — TigerBeetle TIGER_STYLE.md and
https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-yuan.pdf.*
