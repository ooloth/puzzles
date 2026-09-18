---
opened: 2026-09-17
status: open
resolves_into: problem
---

# What horizon is this built for?

## Why it matters

[../problem.md](../problem.md) sizes the launch and stops there: "A small, genuinely public v1 within a
few months." Nothing in it, and nothing in [../decisions/](../decisions/), says how long the system is
meant to run afterwards or how much attention it is expected to get once it does.

**Four arguments in the M1 toolchain questions already assume an answer, and they eliminate
candidates.** Each is quoted under **Findings** with the file it sits in. The phrases used are "a
project meant to run for years with little attention" and "for a solo maintainer on a multi-year
horizon". Neither appears in [../problem.md](../problem.md), which contains no horizon language at
all.

The portable decision-making standard holds that a decision's inputs are settled before it is taken,
and that each input names the record that established it. An input that is an inference is an
undecided question. This is that question.

**It prices the upgrade treadmill, which is what most of the toolchain field actually separates on.**
A dependency that needs attention twice a year costs nothing on a project someone is working on and
costs the whole project on one nobody is.

## What would settle it

The maintainer saying so. This is a statement of intent rather than research, so nothing external has
to be checked and no candidate has to exist.

**It is not the same as how long a player's work must survive.** That is
[how long does a guest's work last?](how-long-does-a-guests-work-last.md) and
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md), both
promises to a player. This one is about how long the maintainer expects to keep paying attention, which
is a different quantity and binds different decisions.

**It is answered before
[what must a dependency's stewardship satisfy?](what-must-a-dependencys-stewardship-satisfy.md)**,
which cannot be argued without it: "well maintained enough" is meaningless without a duration to be
enough for.

## Resolves into

A paragraph in [../problem.md](../problem.md). It belongs there rather than in
[../decisions/](../decisions/) because it is a statement about what this project is for, in the same
register as "A small, genuinely public v1 within a few months" and "one person maintains this", both of
which already live there. Should it turn out that a reasonable person could have chosen otherwise on
grounds worth preserving, it takes a record instead.

## Source

Raised 2026-09-17, on finding that four eliminations in the M1 toolchain questions turn on a horizon
no document states, and that the one thing [../problem.md](../problem.md) does say about time points
the other way.

## Options

*A few months of attention, then whatever it gets.* v1 ships and the maintainer's attention moves on.
This is what [../problem.md](../problem.md) currently supports on its face. It argues for the largest
ecosystem and the least novelty available, because an unattended project breaks on whatever nobody is
watching, and it argues against anything with a migration on its roadmap.

*Years of light attention.* The demonstration purpose in [../problem.md](../problem.md) is ongoing
rather than a launch event, and a daily puzzle implies a system that keeps running. This is the option
the M1 question files have been assuming. It argues for whatever minimises the upgrade treadmill, which
is not the same thing as the largest ecosystem.

*Years of active attention.* The maintainer keeps building, so novelty costs less: someone is there
when it breaks, and a migration is work rather than an outage.

*Not yet.* The honest null option. The horizon is genuinely not knowable in advance, and the toolchain
decisions should be made on reversibility alone, scoring each candidate on what replacing it would
cost rather than on how likely it is to need replacing. Listed because doing nothing is the option
this folder's own rules say to consider, and because it would resolve
[what must a dependency's stewardship satisfy?](what-must-a-dependencys-stewardship-satisfy.md) by
removing its premise rather than by answering it.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**[../problem.md](../problem.md) contains no horizon language, and the phrases that assume one appear
only in question files.** A search of [../problem.md](../problem.md),
[../constraints.md](../constraints.md), [../guarantees/](../guarantees/) and
[../decisions/](../decisions/) for "year", "horizon", "long-lived" and "decade" returns nothing in
[../problem.md](../problem.md). The nearest statements it does carry are "A small, genuinely public v1
within a few months" and "Clarity over cleverness, because one person maintains this", and the second
is about the code written here rather than about duration.

*Measured — `rg -in 'year|horizon|long-lived|decade|multi-year' docs/problem.md` run in this repository
on 2026-09-17 by me, returning no matches.*

**The four places an unstated horizon is already doing work.** Each is quoted from the file it sits in
and each is currently eliminating or downweighting a candidate:

- [what renders the client?](what-renders-the-client.md), on Solid: "Neither suits a project meant to
  run for years with little attention."
- [what renders the client?](what-renders-the-client.md), on Preact against React: "For a solo
  maintainer on a multi-year horizon this outweighs the bundle difference above."
- [what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md), on
  governance: "it is a live input for a solo maintainer on a multi-year horizon".
- [what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md), discounting
  runtime portability: "One runtime gets chosen and kept for years, so the ability to swap is
  optionality nobody is likely to spend."

*Measured — `rg` over `docs/` on 2026-09-17 by me. The four quotes are read from the files in this
repository.*

**The last of those four argues in the opposite direction from the other three**, which is worth
noticing before the question is answered. A long horizon is used there to discount optionality, on the
grounds that a choice kept for years is a choice never revisited. The other three use a long horizon to
demand stability. Both are reasonable and they are not the same claim, so whatever answer lands has to
say which of the two it licenses.
