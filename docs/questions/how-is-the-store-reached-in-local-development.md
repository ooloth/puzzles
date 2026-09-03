---
opened: 2026-09-02
status: open
resolves_into: decision
---

# How is the store reached in local development?

## Why it matters

**The decision here is downstream of the store's shape, and only a finding about it is needed
earlier.** You cannot choose how to reach the store locally before knowing what the store is, so this
sits at M2 with the rest of the development loop rather than at M1. What M1 needs is the *comparison*
— what each candidate arrangement would cost in the daily loop — and that is a finding recorded
against [is the store a file or a service?](is-the-store-a-file-or-a-service.md),
not a door closed here.

It was briefly filed at M1 as a decision. That was a mistake worth recording: an input to a choice is
not the same thing as a choice, and treating one as the other puts a door where there is none.

A store the process opens as a file needs nothing installed and nothing running: the file is there or
it is created. A store reached over a network needs something to connect to — a container to start, a
hosted development instance to reach, or a second copy of the data somewhere.

That difference is felt every day rather than once, and it is one of the few places where the two
candidate arrangements differ in something the maintainer touches constantly. It belongs in the
argument, and [which database, if any?](which-database.md) records the embedded side of it — "local
development with nothing to install or start" — without the network side having been described at
all.

It also bears on whether a check can run anywhere.
[What runs the checks on every change?](what-runs-the-checks-on-every-change.md) at M2 inherits
whatever is decided here: a test suite that needs a live database is a different proposition from one
that does not.

## What would settle it

Describing what a maintainer and an agent each have to do to get a working store, from a clean
checkout, under each candidate arrangement — and what happens when that step fails with no network.

Note that [../problem.md](../problem.md)'s description of work "in gaps and transit" is about
**players**. Nothing records where or how the maintainer works, so the offline case here rests on
nothing yet and is worth covering rather than assuming.

Worth checking rather than assuming: whether a development instance of a managed store can be free
and always-on, whether the local and deployed stores can be the same engine and version, and whether
anything about the arrangement makes it possible to run against production data by accident.

## Resolves into

A decision record in [../decisions/](../decisions/), and content for
[../verification.md](../verification.md) once there is something to run.

**This sits at M2, and M1 needs nothing from it.** Developer ergonomics is a comfort property, and M1
is decided on which option keeps technical doors open — a different test, which ergonomics loses. Any
ergonomic difference between the arrangements can be noted in
[is the store a file or a service?](is-the-store-a-file-or-a-service.md) without
being established first. A daily loop also needs a project to have a loop in, and slice 1 has none.

**Resist filing it earlier.** It reads like an input to the store decision, and being one is not the
same as blocking it.

## Source

Raised 2026-09-02. An adversarial audit of the execution-shape analysis found that local development
under a network-attached store is discussed nowhere, while the embedded option's zero-install
property is recorded in [which database, if any?](which-database.md) as a benefit with nothing
weighed against it.

## Options

*The same shape as production.* Whatever runs deployed also runs locally — a file if the store is a
file, a container running the same engine if it is a service. Highest parity, which is what
[how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md)
exists to protect.

*A different shape locally.* An embedded store for development and a network store deployed, or a
hosted development instance rather than a local one. Cheaper to start, and it puts a difference
between the two environments in the layer most likely to behave differently under load and failure.

*Not yet.* Nothing is built and no store exists, so this could wait — except that it is an input to
the choice being made now rather than a consequence of it.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The embedded side of this comparison is already written down and the network side is not.**
[Which database, if any?](which-database.md) records "no database process to run, patch or monitor,
and local development with nothing to install or start" as a property of SQLite as a file. Nothing
anywhere describes what the network-attached equivalent costs, which makes the existing comparison
one-sided rather than settled.

*Reasoned — from reading that file, 2026-09-02.*
