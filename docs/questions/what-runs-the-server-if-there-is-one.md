---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What runs the server, if there is one?

## Why it matters

It is a small decision that looks like a big one, and worth recording mainly so it is not made by
whichever runtime the first tutorial used. The server this project might need is a handful of
endpoints that put and fetch bytes — every candidate can do that, so the choice turns on operating
cost, deployment surface and how reversible it is.

## Blocked by

[What does the server hold?](what-does-the-server-hold.md) — there may be no server, in
which case this closes. Then [which database, if any?](which-database-if-any.md), because a
runtime that cannot reach the chosen store is disqualified.

## Blocks

[Where does this run?](where-does-this-run.md).

## What would settle it

Very little, once the two questions above land. The one criterion worth applying deliberately is
reversibility: write the data access against an interface the standard library already defines,
so the runtime stays a one-line change rather than a rewrite.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own.

## Options

*Node.* The default, the largest deployment surface, and the least interesting.

*Bun.* Faster start, batteries included, and a single vendor. Research recorded under
[what provides the build and dev server?](what-provides-the-build-and-dev-server.md) found the
runtime solid while the browser build was not, so this is a genuinely separate question from that
one.

*An edge runtime.* Cloudflare Workers, Deno Deploy and similar. Rules out a database with a local
file, which makes this dependent on the database question rather than beside it.

*Deno.* Standards-oriented, smaller ecosystem, no specific advantage identified here.

## Findings

**Writing data access against `node:sqlite` keeps this reversible.** Bun implements it, so the
same code runs on either runtime and the choice stops being load-bearing. Recorded during the Bun
research; it is the cheapest hedge available here.

**One incompatibility worth knowing early.** `better-sqlite3` does not work under Bun and has not
for three years. Choosing that library is therefore choosing Node, quietly, in a file that looks
like it is about the database.
