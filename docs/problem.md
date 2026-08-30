---
updated: 2026-08-30
update_when: the users, the problem, or what we optimize for changes
decays: slow
status: draft
---

# Problem

> Ported from `@legacy/vision.md` and `@legacy/context/usage.md`. Citations are to those
> files so this draft can be checked; they need pruning when `@legacy/` is deleted.

## What's missing or broken

A person has a few spare minutes in exactly the places connectivity is worst — a train, a
subway, a tunnel, an elevator, a lift between cell towers. That is where they want to play a
grid logic puzzle, and it is where puzzle apps stall on a loading screen, lose the last few
moves, or drop the board entirely when the phone reclaims the tab.

The interruption is the normal case, not the edge case: connectivity is "routinely degraded
or fully absent for stretches of seconds to several minutes… the modal condition for this
app's primary use case, not an edge case" (`usage.md:16-22`).

The mechanism is connection setup, not bandwidth. A fresh connection costs 3-4 round trips
before any payload moves; on a degraded link that is several seconds of nothing happening,
which is what a frozen loading screen actually is (`constraints.md:53-63`).

**No evidence base.** Not one source names an existing puzzle app, quotes a review, or
records a user interview. The only external precedent cited is Trello's engineering blog —
a task manager, not a puzzle game — describing the same subway frustration and ~1.5 years
of rearchitecture (`ruthless-rearchitecture…:22-25`). Whether mainstream sudoku apps already
solve this is unexamined.

## Who has it

Casual, single-player solvers of sudoku, star battle, and future grid logic games. General
public, no assumed technical sophistication. No adversarial or competitive stakes — not
multiplayer, ranked, or money-involved (`usage.md:11-14`).

**Predominantly mobile, phone-first**, with secondary laptop/desktop use at a *different*
time — the same person switching devices between sessions, never two devices editing at once
(`usage.md:16-24`).

Sessions are short bursts of minutes, frequently interrupted and resumed "sometimes seconds
later, sometimes days later," with a discrete input every 1-3 seconds while actively solving
(`usage.md:24-30`).

Audience size is deliberately small: "expect to be found by a few people, not many"
(`vision.md:11`).

**Unverified assumption:** the legacy constraints reason from a "likely-iOS-heavy mobile
audience" (`constraints.md:120-121`) with no justification offered, while also admitting no
Android research was done — "a gap, not a 'no constraint' conclusion" (`constraints.md:114-115`).
A large part of the durability analysis rests on this.

The second stakeholder is the solo maintainer, for whom this is "primarily a craft project:
enjoy building something well-made over the next ~year" (`vision.md:5`).

## What success looks like

Five stated, checkable-in-principle outcomes, ported from `@legacy/invariants/ux.md:9-40`:

1. **Instant input feedback** — tapping a cell, entering a digit, toggling a note renders
   visible feedback immediately, under any network condition including none.
2. **Offline playability** — fully interactive, no errors or broken UI, through total
   connectivity loss lasting at least several minutes.
3. **No progress loss** — in-progress state is never lost however a session is interrupted.
4. **Seamless resume** — reopening restores the exact prior state automatically, no explicit
   sync step, no conflict prompt in the ordinary sequential case.
5. **Invisible sync** — progress syncs in the background, never showing a
   loading/reconnecting/error state during play, retrying silently on failure.

Plus: "small, genuinely public v1 within a few months" (`vision.md:10`), and a quality bar
stated as "world-class, polished" (`vision.md:18`).

**Not measurable yet.** No millisecond budget defines "instant" — the only figures in the
corpus (16ms, sub-1ms, 2ms) are properties of a proposed implementation, not requirements
derived from users. No engagement, retention, or completion metric exists. "World-class,
polished" is asserted and never operationalised.

## Not this

- **Real-time simultaneous multi-device editing.** Switching devices between sessions is
  supported; two devices editing the same puzzle at the same instant is not (`usage.md:46-50`).
- **Adversarial multiplayer or leaderboard-integrity anti-cheat** — not a v1 goal
  (`usage.md:51-52`). Cheating only spoils the game for the cheater.
- **Enterprise-scale concurrent users** — "this remains a small, personal-scale project"
  (`usage.md:53-54`).
- **Designing for scale at all** — "not designing for it yet. Revisit if/when the project
  actually grows" (`vision.md:20`).
- **Puzzle generation work, for now** — "deliberately deferred. Enjoyable future challenge,
  not urgent" (`vision.md:19`). UI work comes first "regardless of which way that decision
  goes" (`vision.md:14`).
- **Speculative infrastructure** — "add infrastructure/complexity because the app requires it
  now, not because it might someday" (`vision.md:26`). And no Kubernetes-grade complexity
  (`vision.md:38`).

**Never addressed anywhere, so not actually out of scope — just unwritten:** accessibility,
internationalisation, ads, native app stores, print/export, dark mode, sharing, and which
games follow sudoku and star battle.

## What wins when things conflict

**Stated work order** (`vision.md:16-21`), verbatim:

1. Solving UX — the harder, more important problem right now.
2. Puzzle generation — deliberately deferred.
3. Scale — not designing for it yet.

The sharpest statement of what wins, and the one to reach for first (`vision.md:7`):

> An app with borrowed puzzles + amazing UX = success. An app with great generated puzzles +
> meh UX = failure.

**Derived tiebreakers** — each traceable to a stated source, but assembled into an order by
this port rather than stated as an order anywhere:

4. Tolerating absence beats optimising payload. "Design effort belongs on tolerating absence
   and avoiding unnecessary fresh-connection round trips, not on minimizing payload size"
   (`constraints.md:70-73`).
5. The interactive path beats generation throughput — generation is separable and "never has
   to compete with the interactive path" (`constraints.md:41-45`).
6. Solo-maintainer clarity beats cleverness (`vision.md:25`).
7. Present need beats future-proofing (`vision.md:26`).
8. Low, fixed running cost is a real priority — "I don't want to lose much money running this
   app" (`why-sqlite…:180`).

### Known tensions

- **Battery vs. durability.** Favour "infrequent, bursty, batched network activity"
  (`constraints.md:81-82`) — but the named mitigation for Safari's 7-day storage wipe is
  possibly "a sync cadence tight enough that 7 days of inactivity can't cause meaningful
  loss" (`constraints.md:122-125`). Tighter cadence means more radio wakes. Unresolved.
- **"No assumed technical sophistication" vs. asking users to install a PWA.** Home-screen
  install is the *one confirmed* exemption from Safari's storage cap (`constraints.md:106-109`),
  and it is friction aimed at exactly the audience assumed to have none.
- **Craft enjoyment vs. right tool.** "Enthusiastic about easy mode rust" (`hypermedia-vs-react.md:395`)
  against "a second toolchain… for a compute problem that doesn't need it"
  (`ruthless-rearchitecture…:104-126`). A values question wearing a technical costume.
- **"World-class, polished" vs. "complexity only when required now."** Polish is precisely
  where offline shells, sync queues and install prompts live, and each can be argued as not
  required yet. No tiebreaker exists.
- **Correctness vs. latency — the missing rung.** Nothing in the corpus ranks these. Given
  the failure the sources describe most vividly — an error surfacing 800ms late, after the
  player has already built two more moves on a false premise (`hypermedia-vs-react.md:735`) —
  this is the most consequential gap in the ranking.

Not for per-decision analysis — that goes in an ADR.
