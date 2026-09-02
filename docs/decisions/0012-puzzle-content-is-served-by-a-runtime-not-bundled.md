---
number: 0012
status: accepted
date: 2026-09-01
---

# 0012 — Puzzle content is served by a runtime, not bundled

## Forced by

**[../problem.md](../problem.md) records that a paid tier is uncommitted and deliberately not ruled
out.** It says so twice — once when excluding anti-cheat, which holds only "while nothing is worth
gaining by cheating", and once in naming what the maintainer might want later. An option the problem
statement is holding open is one the architecture has to be able to reach.

**[../constraints.md](../constraints.md) records that what reaches a device cannot be recalled.**
Gating happens before bytes leave the server or not at all, so content that might ever be withheld
cannot ship as static files alongside the application. That is a property of delivery, and it is
settled when the delivery mechanism is chosen rather than when gating is wanted.

**[../standards/decisions.md](../standards/decisions.md) says decisions are deferred until leaving
one open would close a door unnoticed.** This is one of those. The milestone sequence in
[../questions/README.md](../questions/README.md) now puts a puzzle on the screen from a store at the
second milestone, which makes puzzle delivery something that gets *built* long before anyone asks
whether it can gate. Built as static files, it forecloses the paid tier silently, and nothing about
shipping a JSON file announces that.

## Decision

**Puzzle content is served by something that can decide whether to serve it, rather than shipped as
static files alongside the application.**

**The option this preserves is a paid tier**, and it is the rationale rather than the rule. What
binds implementation is the sentence above, and it binds whether or not anything is ever charged for.

This preserves an option; it does not schedule the work. No entitlement is checked, no payment
boundary exists, nothing is withheld from anyone, and no player sees any difference. What is ruled
out is a delivery shape that makes withholding impossible later.

**It applies only to content a player has not been given yet.** Anything already delivered is theirs,
including everything precached so that
[../guarantees/offline.md](../guarantees/offline.md) can be kept. That is not a leak to be closed —
it is what an offline promise means. Gating governs the boundary of what is handed over, never what
has been.

**It settles the catalogue candidate in
[what does the server hold?](../questions/what-does-the-server-hold.md)** by consequence, and that is
stated here rather than left to be discovered. That question's own finding already ties the catalogue
to entitlement rather than to delivery — an archive that might ever be gated cannot be static — so
deciding one decides the other.

## Rejected

- **Ship puzzles as static files with the application.** The strongest option on every axis except
  the one that matters. CDN caching for free, no runtime on the path to content, publishing is a
  deploy rather than a write, and the precache list is a build output — which
  [how does the app itself stay available offline?](../questions/how-does-the-app-itself-stay-available-offline.md)
  records as something only one candidate toolchain produces. Somebody weighing this would pick it,
  and plenty of puzzle sites have. Rejected because it puts every puzzle that will ever exist on
  every device, and once that is the shape, gating means moving the catalogue out of the build: a
  migration plus a caching story rebuilt from nothing, at the moment there is finally a reason to
  care.

- **Decide it when a paid tier is committed.** The honest "not yet", and the same failure ADR-0008
  found. By then the archive is static, players have it precached, and what would have been a
  decision is a migration. The option is nearly free now precisely because nothing has been
  delivered to anyone.

- **Commit to a paid tier now, and build entitlement.** Settles the question in the strongest
  possible way and over-decides badly. `../problem.md` says uncommitted, and committing drags
  identity, entitlement and payments into the first milestones — where `../problem.md` also ranks
  them below the solving experience and below play continuing.

- **Gate at the CDN with signed or expiring URLs, and keep the files static.** A real middle path
  that keeps most of the static option's advantages. Rejected because it fails against
  [offline.md](../guarantees/offline.md)'s promise rather than against the gating one: content
  precached for offline play is on the device and no URL scheme reaches it, so the mechanism
  protects exactly the content that is not the problem.

## Risk

**A runtime is now on the path to content, and it needs a caching story the static option got
free.** That is real ongoing work — cache headers, content hashing, an invalidation story — bought
against an option nobody has exercised. If the paid tier never happens, it will have been paid for
nothing.

**It settles part of a question still open.** [What does the server
hold?](../questions/what-does-the-server-hold.md) is meant to be worked once, whole, with every
candidate struck off deliberately. This strikes one off ahead of that, for a stated reason, and the
outcome of the catalogue candidate is no longer genuinely open. Pretending otherwise would be worse
than saying it.

**Nothing here stops a player copying what they have.** A determined person can read the puzzles
their own browser holds and republish them. The decision buys a boundary, not enforcement, and
`../problem.md` already rules anti-cheat out of scope. Anyone reading this as a security property is
reading it wrong.

**A daily rhythm may make this moot.** If the answer to [one puzzle a day, or unlimited
play?](../questions/is-there-one-puzzle-a-day-or-unlimited-play.md) is one a day with no archive,
there is no body of content to gate and the whole option was theoretical.

## Revisit when

- **The paid tier is definitively abandoned**, rather than merely still uncommitted. The door closes
  by choice and the runtime on the content path stops earning its cost.
- **Offline scope grows to cover the whole archive**, per [what can a player do with no
  network?](../questions/what-can-a-player-do-with-no-network.md). If everything is on the device
  anyway, gating buys nothing and the static option's advantages return unopposed.
- **The catalogue stops changing between deploys.** A fixed set that ships with a build has no
  publishing story to protect, which removes the second reason for this and leaves only the first.

## Also update

- [x] `constraints.md` — adds two facts about client-side delivery: what reaches a device cannot be
      recalled, and an offline promise puts content on the device by construction
- [x] Nothing in `guarantees/` — this promises a player nothing and deliberately withholds nothing
      from them today
- [x] `questions/what-does-the-server-hold.md` — the catalogue candidate is settled by this record
      rather than by that question

Deliberately not decided here: whether there is a paid tier, what the catalogue is stored in, whether
puzzles are generated ahead of time or on demand, whether an archive exists at all, and what a player
is entitled to.
