---
number: 0010
status: accepted
date: 2026-09-01
---

# 0010 — The store needs a host, so this system has a server

## Forced by

**[ADR-0009](0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) puts the durable
copy of a player's state off their device.** A store somewhere other than the player's browser is
something that has to be reached over a network, which means something has to be listening. That is
the whole derivation, and there is no arrangement in which it comes out differently: a database with
no host is not a database anyone can read.

**Content that can be withheld reaches the same conclusion by a second route.**
[ADR-0012](0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) requires that puzzle content is
served by something that can decide whether to serve it, and
[../constraints.md](../constraints.md) records that anything shipped to a device cannot be recalled.
So gating happens before bytes leave a machine we control. That route needs a server without needing
a store, which is why the two are separate records rather than one.

**[../problem.md](../problem.md) names a demonstrable internet-facing full-stack system as one of
three maintainer purposes**, and attaches a guard to it — would this be worth building if its
demonstration value were zero. It would: both routes above stand on their own. The purpose is noted
here as an input rather than smuggled in, and it is not load-bearing.

## Decision

**This system has a server: a deployable that is not the client, running on a machine we control.**

**What forces it is hosting the store.** [ADR-0009](0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md)
established the store; this establishes that it is reachable. The title says so because a reader who
finds this record while asking "do we have a backend?" should see the reason in the same line as the
answer.

**It settles existence and nothing else.** What the server holds beyond the store, what execution
shape it runs in, and where it runs are each their own question, and
[../questions/README.md](../questions/README.md) sequences them.
[What does the server hold?](../questions/what-does-the-server-hold.md) is still worked whole against
its whole inventory — a server existing is not the same as a candidate on that list surviving.

**It is not on the interaction path.** [ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md)
put authoritative state on the client, and this does not reopen it. Everything the server does is a
background copy or a background check.

**It does not say there is a database**, only that whatever ADR-0009 established has somewhere to
live. Whether that is a relational database, a key-value store or a file is
[which database, if any?](../questions/which-database-if-any.md), open.

## Rejected

- **A static site with no server at all.** The genuine alternative, and before ADR-0009 a live one:
  puzzles ship as files, progress lives on the device, and its loss is accepted. Cheapest by a wide
  margin — nothing to operate, nothing stored about anyone, no privacy obligations. Rejected not here
  but at [ADR-0009](0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md), by
  `../problem.md`'s statement that a player's work follows them between devices. Choosing it now
  means reopening that record, which is the honest form of disagreeing with this one.

- **Rent somebody else's backend instead of having one** — a backend-as-a-service holding the store,
  with the client talking to it directly and no deployable of ours in between. Real, widely used, and
  it would satisfy ADR-0009 without this record. Rejected because it satisfies ADR-0012 only
  awkwardly: withholding content means the gate lives in someone else's rules engine rather than in
  code we write, and `../problem.md` names a demonstrable full-stack system as a maintainer purpose
  that this would hollow out. It remains a live option for *what runs the server*, which is
  [where does this run?](../questions/where-does-this-run.md) rather than this record.

- **Leave it implicit.** ADR-0009 forces this and a careful reader would infer it. Rejected because
  the file listing is the checklist of what is settled, and a constraint only derivable by inference
  is not on the checklist. One short file against somebody re-arguing whether there is a backend.

## Risk

**It reads as bigger than it is.** "There is a server" invites building one, and nothing here
schedules that or says what it does. The milestone sequence puts a same-origin endpoint answering one
route at M1 and a store behind it at M2, and neither is a server in the sense this record might be
read to authorise.

**It arrives before [what does the server hold?](../questions/what-does-the-server-hold.md) is
worked.** The danger is that question being treated as answered because a server is now settled. It
is not: [ADR-0009](0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) put exactly
one candidate on that list beyond doubt, and the others — entitlement, push, observability — have
neither survived nor been struck off.

**It has no independent basis.** Both routes to it run through other records: the store, from
[ADR-0009](0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md), and withholdable
content, from [ADR-0012](0012-puzzle-content-is-served-by-a-runtime-not-bundled.md). Nothing here
argues for a server on its own terms, which is correct — a consequence should not manufacture an
argument — but it means this record is only as sound as the two above it.

**Two routes make it look more settled than one would.** Neither route is measured, and both rest on
statements in [../problem.md](../problem.md) about what the product is for. If those statements
change, both routes change together rather than one holding the other up.

## Revisit when

- **[ADR-0009](0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) is superseded and
  the durable copy moves back onto the device**, *and*
  [ADR-0012](0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) is superseded so content no
  longer needs withholding. Either one alone leaves this standing.
- **The store turns out to be something with no host of ours** — a managed service the client reaches
  directly. That satisfies ADR-0009 without this record, and it is the live alternative named under
  Rejected rather than a hypothetical.

## Also update

- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — this promises a player nothing, and
      `guarantees/durability.md` currently promises no per-persona bound
- [x] `questions/what-does-the-server-hold.md` — a server existing does not settle what is on it,
      and that question is still worked whole

Deliberately not decided here: what the server holds, what execution shape it has, where it runs,
what it stores, whether it understands puzzle content, and when any of it is built.
