---
updated: 2026-08-31
update_when: a way this system can fail is identified, or one actually happens
decays: slow
status: active
---

# Failure modes

Ways this system can break, how each one happens, and whether we would find out.

Distinct from its three neighbours, and the distinction is what makes this folder worth keeping.
[../constraints.md](../constraints.md) holds single facts about the world we don't control.
[../gotchas.md](../gotchas.md) holds quirks of this repo that will surprise you.
[../guarantees/](../guarantees/) states what must never break and what it costs when it does.

**A failure mode is a chain, and the chain is the insight.** It is assembled from several facts
that are each unremarkable alone — a volume fills, a health check only tests whether the process
answers, nobody looks at disk usage — and the assembly is what nobody notices until it happens.
Recording the parts separately does not record the failure.

The entries worth having most are the ones that **produce no error and no complaint**. A player
whose progress vanishes doesn't file a bug; they stop coming back. Anything that fails loudly
will be found eventually. Anything that fails quietly is found only if somebody wrote it down
first.

This folder should grow. Every incident adds one, and so does every design discussion that ends
with "wait, what happens if…".

_No failure modes recorded yet._

## What goes in an entry

One file per failure mode, named for what breaks — so a directory listing reads as a list of ways
this thing can go wrong. Group them in the index below by the guarantee they most threaten.

<!-- Template:

# <What breaks, stated as the outcome someone experiences>

## Threatens

<the guarantee or guarantees this violates, by link>

## How it happens

<the chain — each step ordinary on its own, which is why the whole is easy to miss>

## Why here specifically

<what about this system makes it plausible, rather than a generic risk any project has>

## How we'd notice

<the signal that would surface it. If there isn't one, say so plainly — that is the finding, and
it usually matters more than the failure itself.>

## What reduces it

<prevention, containment, or faster detection. "Nothing yet" is a valid and useful answer.>
-->

## The list

_Empty._ Add entries as they are identified; group them here by the guarantee they threaten.
