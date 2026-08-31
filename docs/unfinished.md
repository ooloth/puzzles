---
updated: 2026-08-30
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

### Three decision records are known to be unsound at their root

**You'll see** [ADR-0003](decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md),
[ADR-0004](decisions/0004-a-component-framework-renders-the-client.md) and
[ADR-0006](decisions/0006-typescript-everywhere-with-the-rules-shared-as-source.md), all marked
`status: accepted`, reading as settled and citable.

**Actually** each rests on something that was never established. ADR-0003 specifies how a server
validates and merges boards, while [whether a server exists at all](questions/what-must-be-true-off-device.md)
is open. ADR-0004 rejected its alternatives on reasoning that later research contradicted — the
board is where a general-purpose framework helps least, not most, and its measured rendering cost
is about one percent of a frame. ADR-0006 states that persistence is IndexedDB, which
[no decision ever made](questions/which-client-storage-mechanism.md); its WebAssembly argument
does not need that to be true and is stronger without it.

**So** treat the *decisions* as provisional and the *reasoning* as partly wrong. Do not cite
ADR-0004's rejected section, and do not treat IndexedDB as chosen. ADR-0003's content is probably
fine and its placement is not — it may be re-derived unchanged once the server question lands.

### The client may not need the puzzle rules at all

**You'll see** [ADR-0005](decisions/0005-one-implementation-of-the-puzzle-rules.md) requiring one
shared implementation of the rules, and ADR-0006 choosing a language to satisfy it.

**Actually** ADR-0005's forcing is that the client must "tell a player their move conflicts and
recognise a completed board". The first half depends on
[how much the app helps you solve](questions/how-much-does-the-app-help-you-solve.md), which was
asked after both records were written. An austere app needs completion detection and little else.

**So** if you find yourself reasoning from "the client runs the rules", check that question first.
Both records may survive intact; neither is currently supported at its root.

<!-- Template:

### <What you'll run into that looks contradictory>

**You'll see** <the misleading thing — two patterns, a dead path, a step that no longer works>

**Actually** <which one is current, which is dead, and why both are still here>

**So** <what to do today>
-->
