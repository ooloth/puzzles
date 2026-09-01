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

### Question files still size their arguments against a seven-day Safari window

**You'll see** "Safari clears all script-writable storage after seven days" repeated across
[questions/](questions/) — in
[is cross-device resume in scope for v1?](questions/is-cross-device-resume-in-scope-for-v1.md) in
several places, in
[how does a second device recognise the same person?](questions/how-does-a-second-device-recognise-the-same-person.md),
in [how does the app itself stay available offline?](questions/how-does-the-app-itself-stay-available-offline.md),
and in [ADR-0002](decisions/0002-the-client-holds-and-mutates-puzzle-state.md)'s risk section. Read
together they make a lapsed player look like a normal case.

**Actually** the number is thirty, and seven is a penalty applied only to a domain reached by a
tracker-originated decorated link — a shape nobody arriving at this app matches.
[constraints.md](constraints.md) is correct and is the authority; the question files predate it and
have not been resized. The difference is not cosmetic: it is roughly a four-fold change in how many
players are ever exposed, and several of those findings argue for machinery that a thirty-day
window may not justify.

**So** take the figure from `constraints.md` and treat any argument in a question file that turns
on the length of the gap as needing to be re-run before it is used. ADR-0002 is append-only and its
conclusion still holds — client-held state is evictable either way — so only the magnitude in its
risk section is stale.

### The stack is mid-decision, and looks more settled than it is

**You'll see** a repository with no code in it, a `constraints.md` full of browser specifics, and
question files citing detailed research into React, Preact, Svelte, Vite and Bun. It reads as
though the stack is broadly agreed and nobody has got round to typing the install command.

**Actually** only the delivery platform is chosen.
[ADR-0003](decisions/0003-this-is-delivered-over-the-web.md) settled that this is delivered over
the web on 2026-08-31, which is why the browser specifics in `constraints.md` are in scope — they
are the price of that one decision and are labelled as such. Everything else in the stack is still
open: the language, what renders the client, what holds a player's work, whether a server exists,
and where it deploys. The research inside the question files is homework for decisions still to be
made, not the conclusions of decisions already made — a shortlist is not a choice.

**So** install nothing yet, and work [questions/README.md](questions/README.md) in the order it
gives. Each entry names what it derives from, so the order is checkable rather than asserted. If
you are about to reach for a tool that is not the next entry in that order, that is the signal to
stop and find the decision above it.

<!-- Template:

### <What you'll run into that looks contradictory>

**You'll see** <the misleading thing — two patterns, a dead path, a step that no longer works>

**Actually** <which one is current, which is dead, and why both are still here>

**So** <what to do today>
-->
