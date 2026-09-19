---
updated: 2026-09-19
update_when: the codebase enters or leaves a state that would mislead someone reading it
decays: fast
status: active
---

# Unfinished

Heads-ups about half-built or misleading states. Nothing here tells you what you may not do.

Entries are deleted the moment they stop being true. Stale guidance here is worse than none.

### More is settled than is built, and less is settled than it looks

**You'll see** records fixing the store, the entry document, the build and the server's shape, plus a
`docs/architecture.md` with boxes on both sides of the network. It reads as a chosen stack.

**Actually** no code exists, and what renders the client, what handles HTTP, where it runs and what
deploys it are all open. Settled so far: the store is a SQLite file the server process opens, a
service worker answers navigations, the entry document is a build output, the client build and the
HTTP server are separate tools, the bundler is Vite, and everything outside the browser runs on
Node.

**So** read [questions/README.md](questions/README.md) for what is open and in what order.

### A retired question file is still on disk

**You'll see** [questions/does-one-tool-build-the-client-and-answer-http.md](questions/does-one-tool-build-the-client-and-answer-http.md).

**Actually** it is answered, by
[ADR-0028](decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md), and the
question as posed was unanswerable.

**So** don't work it. It is deleted once the floor-format record lands.

<!-- Template:

### <What looks contradictory>

**You'll see** <the misleading thing>

**Actually** <which is current and why both are here>

**So** <what to do today>
-->
