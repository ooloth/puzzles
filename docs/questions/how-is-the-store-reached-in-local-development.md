---
opened: 2026-09-02
status: open
resolves_into: decision
---

# How is the store reached in local development?

## Why it matters

**The store is a SQLite file the server process opens**
([ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md),
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md)), so this is not a comparison between
arrangements. It is the narrower question of how a developer gets a database to work against:
where the file lives, what puts data in it, and whether the same file is reused between runs or made
fresh.

**It sits at M3, where the store first exists**, because it is about the daily loop rather than
about what ships, and there is no store for that loop to open before then. Nothing at M1 waits on
it — an M1 hello world has no store.

A store the process opens as a file needs nothing installed and nothing running: the file is there
or it is created. [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) records this as "local
development with nothing to install or start".

It also bears on whether a check can run anywhere.
[What runs the checks on every change?](what-runs-the-checks-on-every-change.md) at M2 inherits
whatever is decided here: a test suite that needs a live database is a different proposition from one
that does not.

## What would settle it

Describing what a maintainer and an agent each have to do to get a working store, from a clean
checkout, for each way of placing and filling the file.

Note that [../problem.md](../problem.md)'s description of work "in gaps and transit" is about
**players**. Nothing records where or how the maintainer works, so the offline case here rests on
nothing yet and is worth covering rather than assuming.

Worth checking rather than assuming: whether the local and deployed stores can be the same engine
and version, and whether anything about the arrangement makes it possible to run against production
data by accident.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/), and content for
[../../CONTRIBUTING.md](../../CONTRIBUTING.md) once there is something to run.

**This sits at M3, and M1 needs nothing from it.** Developer ergonomics is a comfort property, and
M1 is decided on which option keeps technical doors open — a different test, which ergonomics loses.
Any ergonomic difference between the arrangements can be noted in
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) without being
established first. A daily loop also needs a project to have a loop in, and slice 1 has none.

**Resist filing it earlier.** It reads like an input to the store decision, and being one is not the
same as blocking it.

## Source

Raised 2026-09-02. An adversarial audit of the execution-shape analysis found that local development
was discussed nowhere, while the embedded option's zero-install property is recorded in
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) as a benefit.

## Options

The store is a file the server process opens in every environment, per
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) and
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md), so locally it is a file too, which is
what [how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md)
asks of it. What is open is where the file lives, what puts data in it, and whether a run reuses it or
starts fresh. No options for those are recorded yet.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

*Mined 2026-09-30 from where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) as it was at commit `11ac964`. These are observations for this question to weigh, not answers.*

**A SQLite file on a macOS folder mounted into a Docker Desktop container fails under WAL.** The
server crashed with a bus error, and in one run acknowledged ids were missing from the file. The same
run with the file on the container's own disk failed nothing. SQLite's WAL needs shared memory that
such mounts do not give: "All processes using a database must be on the same host computer; WAL does
not work over a network filesystem". *Measured — three runs each way, `node:24-bookworm` under Docker
Desktop on Apple silicon, 2026-09-30. The WAL quote is sourced from
[sqlite.org/wal.html](https://www.sqlite.org/wal.html).*
