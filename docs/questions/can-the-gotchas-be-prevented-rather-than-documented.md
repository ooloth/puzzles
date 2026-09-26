---
opened: 2026-09-26
status: open
resolves_into: decision
---

# Can the gotchas be prevented rather than documented?

## Why it matters

[../gotchas.md](../gotchas.md) warns about traps a reader has to remember, and a warning helps only
someone who reads it before walking into the trap. Each entry there describes something a command
could make impossible or visible instead: a browser serving an old app at `localhost:5173`, and
`pnpm` outside the repo being Corepack's default. If every entry can become a command in
[../../CONTRIBUTING.md](../../CONTRIBUTING.md) or a check, the file has nothing left to hold and can
be deleted, and the next trap goes straight to a command rather than into a list.

## What would settle it

Going through each entry and naming the command or check that would prevent it, or saying why
none can. An entry nothing can prevent is the case for keeping the file.

## Resolves into

A decision record in [../decisions/](../decisions/): whether gotchas are recorded as prose, as
commands and checks, or both.

## Source

Raised by the maintainer on 2026-09-26, when the Corepack entry was added to
[../gotchas.md](../gotchas.md).

## Options

...

## Findings

...
