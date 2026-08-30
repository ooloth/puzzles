---
opened: 2026-08-30
status: open
---

# How is the codebase laid out?

**Why it matters** Sharing puzzle logic across generator, server and client is the main
driver for splitting into packages. Premature splitting costs more than it saves at this size.

**Settled by** [what runs the server](what-runs-the-server-and-in-what-language.md) and
[what renders the client](what-renders-the-client.md) — the number of runtimes involved
mostly decides this.
