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

**Actually** no code exists, and what renders the client, what handles HTTP, how the tree is laid
out, where it runs and what deploys it are all open. Settled so far: the store is a SQLite file the
server process opens, a service worker answers navigations, the entry document is a build output,
the client build and the HTTP server are separate tools, the bundler is Vite, everything outside the
browser runs on Node, and the package manager is pnpm.

**So** read [questions/README.md](questions/README.md) for what is open and in what order.

### An answered question file is still on disk

**You'll see** [questions/does-one-tool-build-the-client-and-answer-http.md](questions/does-one-tool-build-the-client-and-answer-http.md),
carrying full working as though it were live.

**Actually** it is answered, by
[ADR-0028](decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md), and the
question as posed was unanswerable. Its frontmatter says `status: answered`.

**So** don't work it. It is deleted once the floor-format record lands and its findings are mined.

<!-- Template:

### <What looks contradictory>

**You'll see** <the misleading thing>

**Actually** <which is current and why both are here>

**So** <what to do today>
-->
