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

## Options

...

## Findings

...
