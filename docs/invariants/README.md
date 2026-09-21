---
updated: 2026-09-19
update_when: an invariant is added, withdrawn, or gains a check that enforces it
decays: slow
status: active
---

# Invariants

What is true of this system without exception. Violating one means the system is broken, not that it
was built unconventionally.

**One invariant per file, named for the claim.** A directory listing is the list of what always
holds, the same way a listing of [../guarantees/](../guarantees/) is what is owed to players and a
listing of [../decisions/](../decisions/) is what is binding on implementation.

## How this differs from its three neighbours

Read this before deciding a new fact belongs here, because all four folders hold things that must be
respected and only one of them holds this.

- **[../guarantees/](../guarantees/)** is a promise a *player* would notice breaking. An invariant
  here is internal: a player cannot see it and would not know if it failed, but the system would be
  wrong.
- **[../decisions/](../decisions/)** holds choices that could have gone another way. An invariant
  could not. Where a reasonable person could have decided it differently, it is a record over there.
- **[../standards/](../standards/)** holds graded guidance where **Should** allows a stated exception
  and **Consider** is a judgement call. Nothing here is graded, because an invariant with a
  sanctioned exception is a standard that has been mislabelled.

An invariant usually falls out of a decision rather than being chosen. The record that produced it
links here, and the file says which record it came from.

## Writing one

The filename is the claim, and the H1 restates it in full. Both are something you could hold against
the code and mark true or false.

`scripts/check-docs.py` checks that each filename's words appear in its H1, in order, so the two
cannot drift apart unnoticed. It checks nothing else about an invariant's content.

**Every file names what enforces it, and says plainly where nothing does.** This is borrowed from
[../guarantees/](../guarantees/) and it does the same job: the folder is a backlog as well as a list,
and an invariant nobody has built a check for is indistinguishable in a listing from one already
held.

**An invariant a machine could check gets a runner, or says why it cannot have one.** The portable
documentation standard holds this, and it bites hardest here: a rule that reads as absolute and is
enforced by nobody remembering it is the one most likely to be broken without anyone noticing. Where
a check does not exist yet, the file names the check it should have.

## The invariants

- [The shared rules module holds no framework-reactive state](the-shared-rules-module-holds-no-framework-reactive-state.md)
- [No package imports what it does not declare](no-package-imports-what-it-does-not-declare.md)
