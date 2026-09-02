---
updated: 2026-08-31
update_when: the codebase enters or leaves a state that would mislead someone reading it
decays: fast
status: active
---

# Unfinished

Where the codebase would mislead you right now: migrations part-way through, two patterns
coexisting, a path that looks live but isn't.

**Highest-consequence file in `docs/`.** An agent that misses it sees two patterns, picks
the dead one, and confidently spreads it.

Each entry answers one question: *what will look true that isn't, and what should I do
instead today.* Nothing here tracks progress or schedules — how far along the work is, and
when it'll finish, don't change what you should do right now.

Durable quirks that aren't going to change → [gotchas.md](gotchas.md).

### ADR-0003 disqualifies its strongest rejected option on claims nobody checked

**You'll see** [ADR-0003](decisions/0003-this-is-delivered-over-the-web.md), the record that chose
web delivery, rejecting one native codebase across iOS and Android on five specific, checkable
claims: that `react-native-macos` trails core by roughly six minor versions, that Expo has no desktop
support, that Apple Developer Program enrolment has documented multi-week silences, that Google Play
requires a twelve-tester fourteen-day closed test for personal accounts created after November 2023,
and that App Store guideline 4.3(b) has been used to reject original puzzle games as
saturated-category spam. It reads as researched.

**Actually** none of the five is in [constraints.md](constraints.md) and none carries a source. An
audit on 2026-09-01 found them, and `decisions/README.md` is explicit that a rejection is held to the
same evidence bar as **Forced by**. The record calls this "the strongest rejected option, and it
deserves the space" — and then disqualifies it on assertions.

**So** do not cite any of those five figures for anything. The conclusion may well be right: the
first Forced-by input — one codebase serving phone and desktop — decides it without them, and that
one is sourced to [problem.md](problem.md). What is unverified is the margin, not the direction.
Verifying them into `constraints.md`, or softening the rejection to what can be shown, is
outstanding work.

### The stack is mid-decision, and looks more settled than it is

**You'll see** a repository with no code in it, a `constraints.md` full of browser specifics, and
question files citing detailed research into React, Preact, Svelte, Vite and Bun. It reads as
though the stack is broadly agreed and nobody has got round to typing the install command.

**Actually** the product decisions are much further along than the stack, and the two are easy to
confuse because they sit in one folder.
[ADR-0003](decisions/0003-this-is-delivered-over-the-web.md) settles that this is delivered over the
web, which is why the browser specifics in `constraints.md` are in scope — they are the price of that
one decision and are labelled as such.
[ADR-0007](decisions/0007-that-language-is-typescript.md) settles the language.
[ADR-0010](decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) establishes that a
server exists. What it holds for a signed-in player, and for how long, is still open — see
[how long does a signed-in player's work last?](questions/how-long-does-a-signed-in-players-work-last.md).

**Every tool is still open**: what renders the client, what runs TypeScript outside the browser,
which database, what holds a player's work in the browser, and where any of it deploys. The research
inside the question files is homework for decisions still to be made, not the conclusions of
decisions already made — a shortlist is not a choice, and every Findings section now says so in its
first line.

**So** install nothing yet, and work [questions/README.md](questions/README.md) in the order it
gives. If you are about to reach for a tool that is not in the current milestone, that is the signal
to stop and find the decision above it.

<!-- Template:

### <What you'll run into that looks contradictory>

**You'll see** <the misleading thing — two patterns, a dead path, a step that no longer works>

**Actually** <which one is current, which is dead, and why both are still here>

**So** <what to do today>
-->
