---
updated: 2026-09-03
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

### Threatening durability

- [A player's progress vanishes after a month away](a-players-progress-vanishes-after-a-month-away.md)
  — storage eviction, with no error and no report. The only signal is someone not coming back.
- [A corrupt board becomes the canonical one](a-corrupt-board-becomes-the-canonical-one.md)
  — a client bug propagated by the copy that exists to be recovered from.
- [A cell edit is overwritten by an older one](a-cell-edit-is-overwritten-by-an-older-one.md)
  — clock skew inverting a merge, after which both devices agree on the wrong answer.
- [The server hands back state the client will not accept](the-server-hands-back-state-the-client-will-not-accept.md)
  — the work is intact and unreachable, usually because two devices are running different versions.
- [A player resumes from a board another device moved past](a-player-resumes-from-a-board-another-device-moved-past.md)
  — nothing is lost and nothing is wrong, and the player still watches their progress go backwards.
- [The durable copy stops being written](the-durable-copy-stops-being-written.md)
  — the write path has no human watching it, because the promise not to bother the player forbids one.
- [The backup turns out not to restore](the-backup-turns-out-not-to-restore.md)
  — a backup nobody has restored and a backup that cannot be restored look identical from outside.

### Threatening availability and cost

- [The write endpoint becomes free storage for strangers](the-write-endpoint-becomes-free-storage.md)
  — open by construction, because there is no account to check.
