---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How is the codebase laid out?

## Why it matters

Sharing puzzle logic across generator, server and client is the main driver for splitting into
packages. Premature splitting costs more than it saves at this size.

## Blocked by

[what runs the server](what-runs-the-server-and-in-what-language.md) and
[what renders the client](what-renders-the-client.md) — the number of runtimes involved mostly
decides this.

## Blocks

N/A — nothing waits on this.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-04 (separate puzzle generation from serving).

## Options

...

## Findings

Legacy ADR-04 deliberately separated two decisions that are easy to conflate: it settled the
process-level relationship between generation and serving while explicitly refusing to prescribe
module organisation, on the grounds that it "deserves its own dedicated discussion rather than
being decided as a side detail here". Worth preserving as a precedent — process topology and
module layout are separable, and letting the second ride along inside the first is how layout
decisions get made without anyone noticing.
