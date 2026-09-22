---
updated: 2026-09-22
update_when: a new way to run or observe the system exists, or an old one breaks
decays: fast
status: stub
---

# Verification

How to watch the real system do the thing. "Tests pass" is not proof a change works.

For each capability: how to run it, what to look at, what correct looks like. If something
can't be observed end to end, **say so here** and name the nearest available signal —
a recorded gap is a gap someone can close.

Test conventions go in [standards/](standards/).

_The only thing runnable today is `python3 scripts/check-docs.py`, which checks the documentation
rather than the system. Nothing of the system exists to run; the first thing that will is
[issue #3](https://github.com/ooloth/puzzles/issues/3), whose QA plan is the shape this file grows
into._

<!-- Template:

## <Capability>

Run: `<command>`
Look at: <output, endpoint, log line, screen>
Correct looks like: <specific — a value, a shape, a rendered thing>
Can't observe: <what's invisible, and the closest proxy>
-->
