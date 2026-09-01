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

### ADR-0002 cites a seven-day storage window

**You'll see** [ADR-0002](decisions/0002-the-client-holds-and-mutates-puzzle-state.md) state in its
risk section that Safari deletes script-writable storage after seven days without interaction.

**Actually** the window is thirty days, and seven applies only to a domain reached by a
tracker-originated decorated link, which is not how anyone reaches this app.
[constraints.md](constraints.md) is the authority on the figure.

**So** take the number from `constraints.md`. The decision itself is unaffected — client-held state
is evictable at either figure — so only the magnitude in that one sentence is wrong.

### The stack is mid-decision, and looks more settled than it is

**You'll see** a repository with no code in it, a `constraints.md` full of browser specifics, and
question files citing detailed research into React, Preact, Svelte, Vite and Bun. It reads as
though the stack is broadly agreed and nobody has got round to typing the install command.

**Actually** only the delivery platform is chosen.
[ADR-0003](decisions/0003-this-is-delivered-over-the-web.md) settles that this is delivered over
the web, which is why the browser specifics in `constraints.md` are in scope — they
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
