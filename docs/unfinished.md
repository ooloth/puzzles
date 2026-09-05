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

### The shape is settled on both sides and no tool has been chosen

**You'll see** eight records settling the store and the browser's entry document — a SQLite file on
the server's machine, a service worker answering navigations, a document produced by the build — and a
`docs/architecture.md` with boxes on both sides of the network. It reads as though the stack is
largely chosen and someone is about to start typing.

**Actually** what those records settle is the shape, and none of the tools. On the server: the store
is a file the process opens, on a machine whose disk survives a redeploy. In the browser: a service
worker answers every navigation after the first, and the entry document is a build output rather than
a per-request render. What executes TypeScript, what handles HTTP, what renders the client, what
builds it, where the machine is and what deploys to it are all open, and they are the questions M1
turns on. The architecture diagram is deliberate about this: every box cites the record that fixed it,
and the last section lists what is not decided, which is the longer list.

**So** install nothing yet, and work [questions/README.md](questions/README.md) from M1. Two
inferences those records invite do not hold, and each is argued where it belongs rather than here:

- **Do not infer the runtime from the store.** "SQLite, therefore runtime X" was checked and does not
  follow. See
  [what runs TypeScript outside the browser?](questions/what-runs-typescript-outside-the-browser.md).
- **Do not read
  [ADR-0024](decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) as
  excluding the meta-frameworks.** It binds how the entry document is produced and nothing else. See
  [what handles HTTP requests on the server?](questions/what-handles-http-requests-on-the-server.md).

<!-- Template:

### <What you'll run into that looks contradictory>

**You'll see** <the misleading thing — two patterns, a dead path, a step that no longer works>

**Actually** <which one is current, which is dead, and why both are still here>

**So** <what to do today>
-->
