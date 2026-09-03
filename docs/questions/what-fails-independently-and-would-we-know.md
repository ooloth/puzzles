---
opened: 2026-09-02
status: open
resolves_into: decision
---

# What fails independently, and would we know?

## Why it matters

**This is the question that decides which architecture is simpler to reason about**, and it is
currently answered nowhere. A store the process opens as a file cannot be unreachable while the
process is running: there is one thing, and it is either up or it is not. A store reached over a
network is a second thing, with its own availability, its own credentials, its own saturation
behaviour and its own way of being slow rather than absent.

That difference is architecture rather than effort, which matters because it survives being told that
maintainer effort is cheap. A removed failure domain stays removed. It is the strongest argument on
the embedded side of
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md), and it was
missed there once by being filed as an operational chore.

**Both directions remove failure modes and add others**, which is why this cannot be settled by
counting. A single machine with a single volume has no redundancy and loses everything when the disk
does. A managed store removes that and adds a network path, a credential, and a vendor.

## What would settle it

Writing the comparison out: for each candidate arrangement, what can fail on its own, what the player
sees when it does, what the maintainer sees, and whether anything would report it. The last column is
the one that decides — a failure nobody learns about is worse than a louder one, and
[the guarantees README](../guarantees/README.md)'s observability theme already names lost progress as
the motivating case for exactly that.

It does not need instrumentation to exist yet. It needs the enumeration, because the enumeration is
an input to a decision being taken now and the instrumentation is not.

## Resolves into

A decision record in [../decisions/](../decisions/), and probably entries in
[../failure-modes/](../failure-modes/) for anything found that nothing has described.

## Source

Raised 2026-09-02. An adversarial audit of the execution-shape analysis found that the store as an
independent failure domain — the app up, the store unreachable — is modelled in no file, while
[how much downtime is acceptable?](how-much-downtime-is-acceptable.md) assumes compute and store
share one machine and one fate.

## Options

Not a choice between options so much as an enumeration that has not been done. What it must cover:
the process alone, the store alone, the network between them where one exists, the credential where
one exists, and the disk beneath whichever holds the data.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The existing downtime question assumes one failure domain and says so.**
[How much downtime is acceptable?](how-much-downtime-is-acceptable.md) reasons throughout from "a
single machine with a single volume", which is true of only some of the candidate arrangements and is
stated without that caveat. Whatever is settled here should repair that file rather than sit beside
it.

*Reasoned — from reading that file, 2026-09-02.*

**Client-side absorption hides server failure from players but not from the maintainer.** Four
promises describe the app continuing while the server is unreachable, which is why server
availability carries no player-facing budget. It does not follow that failure domains are cheap: they
still have to be diagnosed, and
[../constraints.md](../constraints.md) records that a stalled connection reports as connected, so
"slow" and "gone" are not distinguishable without something built to tell them apart.

*Reasoned — from the guarantees and constraints named.*
