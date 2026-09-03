---
updated: 2026-09-03
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

### The store is decided and the rest of the stack is not

**You'll see** four recent records settling the store — a SQLite file, on the server's machine, on a
disk that survives a redeploy — and a `docs/architecture.md` with a diagram in it. It reads as though
the stack is largely chosen and someone is about to start typing.

**Actually** the store is the only part of the stack that is settled. What executes TypeScript, what
handles HTTP, what renders the client, what builds it, where the machine is, and what deploys to it
are all open, and they are the questions M1 actually turns on. The architecture diagram is deliberate
about this: every box cites the record that fixed it, and the last section lists what is not decided,
which is the longer list.

**So** install nothing yet, and work [questions/README.md](questions/README.md) from M1. The store
records constrain the hosting choice — an ordinary process with a local disk beside it — and they
narrow nothing else. In particular they do **not** narrow the runtime: Node, Bun and Deno all ship
`node:sqlite`, so anyone reasoning "SQLite, therefore runtime X" has inherited a claim that was
checked and found false on 2026-09-03.

<!-- Template:

### <What you'll run into that looks contradictory>

**You'll see** <the misleading thing — two patterns, a dead path, a step that no longer works>

**Actually** <which one is current, which is dead, and why both are still here>

**So** <what to do today>
-->
