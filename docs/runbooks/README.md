---
updated: 2026-09-30
update_when: what a runbook must contain changes
decays: slow
status: active
---

# Runbooks

Procedures you follow to put the live system into a known state: setting up an account, building a
machine, restoring the store. One procedure per file, named for what it does, so the listing is the
index.

**A runbook says how, never why.** Each step carries a one-line reason that links to whatever settled
it: a record in [../decisions/](../decisions/), a fact in [../constraints.md](../constraints.md), or,
where the step rests on the maintainer's preference rather than a record, the commit that holds the
working. A step that cannot link to anything is an open question, and goes to
[../questions/](../questions/) before it goes here.

**A runbook holds no status.** It describes the state to reach, not whether anyone has reached it.
Whether a step has been done belongs in the issue that does it, under the "no status in the docs" rule
in [../../CLAUDE.md](../../CLAUDE.md).

**What a runbook is not.**

- Local setup and the checks a change runs are in [../../CONTRIBUTING.md](../../CONTRIBUTING.md).
- A choice the steps carry out is a record in [../decisions/](../decisions/). Changing the choice
  means a new record, then an edit here.
- Steps that can run as a script belong in a script, which a runbook then names, per "Docs are for
  what can't be executed" in [../README.md](../README.md).
