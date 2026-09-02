---
number: 0015
status: accepted
date: 2026-09-01
---

# 0015 — A server exists

## Forced by

**[ADR-0006](0006-what-a-players-work-survives.md) promises that a signed-in player's work survives
on every device they use, indefinitely.** Nothing on a device can keep that promise. A second device
has never seen the first, and
[../constraints.md](../constraints.md) records that the browser clears everything script-writable
after thirty days without interaction, so a copy held only on the first device does not outlive a
lapse either.

**That record said so in its Risk section and then denied it in its footer.** The Risk read "this
forces a server, and does so before what the server holds has been argued… the outcome is no longer
genuinely open, and pretending otherwise would be theatre." The footer read "deliberately not decided
here: whether a server exists." A reader checking the footer to find out what was still open was told
the opposite of the truth by the same file.

**This record exists to make the decision findable.** It follows from ADR-0006 with no room to have
gone the other way, and it is recorded anyway, because a constraint on implementation that lives only
inside another record's Risk section is one nobody scanning
[../decisions/](../decisions/) will ever see.

## Decision

**A server exists.** Something off-device holds a durable per-player record, and the project has a
deployable that is not the client.

**It settles existence and nothing else.** What the server holds beyond that record, what shape it
runs in, where it runs, and what it does with what it holds are each their own question, and
[../questions/README.md](../questions/README.md) sequences them.
[What does the server hold?](../questions/what-does-the-server-hold.md) is still worked whole against
its whole inventory — establishing that a server exists is not the same as establishing what is on
it, and a candidate on that list still has to survive on its own merits.

**It is not on the interaction path.** [ADR-0002](0002-the-client-holds-and-mutates-puzzle-state.md)
put authoritative state on the client, and this does not reopen it. Everything the server does is a
background copy or a background check.

## Rejected

- **A static site with no server at all.** The genuine alternative and, before ADR-0006, a live one:
  puzzles ship as files, progress lives on the device, and its loss is accepted. Cheapest by a wide
  margin, nothing to operate, nothing stored about anyone. Rejected not here but at ADR-0006, by the
  promise that a signed-in player's work survives on every device — which is unkeepable without
  something off-device. Choosing it now means reopening that record, which is the honest form of
  disagreeing with this one.

- **Leave it implicit, as it was.** ADR-0006 already forced this and said so. Recording it separately
  is one more file for a conclusion nobody could have reached differently. Rejected because the file
  list is the checklist of what is settled, and a constraint that is only derivable by reading
  another record's Risk section is not on the checklist. The cost is one short file; the cost of the
  alternative is somebody re-arguing whether a server exists, or worse, assuming it does not.

## Risk

**It reads as bigger than it is.** "A server exists" invites building one, and nothing here schedules
that or says what it does. The milestone sequence puts a same-origin endpoint answering one route at
M1 and a store behind it at M2, and neither is a server in the sense this record might be read to
authorise.

**It arrives before [what does the server hold?](../questions/what-does-the-server-hold.md) is
worked**, which is the inheritance from ADR-0006 rather than a new problem. The danger is that
question being treated as answered because a server is now settled. It is not: exactly one candidate
on that list has survived, and the others have not been struck off.

**Its whole basis is one promise in one record.** If ADR-0006's signed-in bound is ever revised, this
goes with it. That is what "not independently revisable" means in practice, and it is why the
Rejected section above points at ADR-0006 rather than re-arguing durability here.

## Revisit when

- **ADR-0006 is superseded and the signed-in bound is dropped.** This has no independent basis and
  should be superseded in the same change.
- **Every other candidate in [what does the server hold?](../questions/what-does-the-server-hold.md)
  is struck off and the durable record itself is dropped.** Nothing else on that list forces a
  server on its own.

## Also update

- [x] `0006-what-a-players-work-survives.md` — its footer no longer claims this is undecided
- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — the promise this serves is already in `guarantees/durability.md`

Deliberately not decided here: what the server holds, what execution shape it has, where it runs,
what it stores, whether it understands puzzle content, and when any of it is built.
