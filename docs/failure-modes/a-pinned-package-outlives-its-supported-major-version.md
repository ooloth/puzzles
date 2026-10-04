---
updated: 2026-10-03
update_when: alerting on the machine lands, a pinned program releases a new major version, or the pinning rule changes
decays: slow
status: active
---

# A pinned package outlives its supported major version

## Threatens

No promise to players directly. It threatens the machine that every session start depends on, per
[nobody can start today's puzzle](nobody-can-start-todays-puzzle.md), and property 3 of
[ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md):
a security fix reaches the machine within about a day of upstream's.

## How it happens

1. A third-party repository is pinned to its program's current major version, per
   [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md).
   Caddy is pinned to `2.*`.
2. Upstream releases a new major version. The pin holds the machine on the old line, as intended.
3. Upstream stops fixing the old line. Caddy's security policy supports only its latest 2.x, so
   once a 3.x is the latest, fixes may come only there.
4. The daily run keeps succeeding. There is nothing newer within the pin to install, so nothing
   fails and nothing is logged as wrong. The machine serves on a line whose known vulnerabilities
   nobody will fix.

## Why here specifically

**The pin exists to stop exactly the upgrade that would carry the fix.** Every daily run looks
healthy, because a run that installs nothing and a run that has nothing to install are the same
from outside. [A security update fails and nobody knows](a-security-update-fails-and-nobody-knows.md)
at least leaves an error in a log; this leaves nothing.

**A new major version is rare enough to be forgotten.** Caddy 2.0.0 was released on 4 May 2020 and 2.x
is still the current line.

*Sourced: Caddy's GitHub releases API for `v2.0.0`, opened 2026-10-03.*

## How we'd notice

**Nothing would tell us, today.** No check compares a pinned version against the versions its
repository publishes. [How is the server operated?](../questions/how-is-the-server-operated.md) at
M11 is where that check is decided, beside alerting on failed update runs. Until then this is found
only by reading upstream's release announcements, or by noticing the "Revisit when" in [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md).

## What reduces it

**A check that reports when a pinned package's repository publishes a higher major version than the
pin allows**, which M11 decides. `apt-cache policy` shows a package's version table, which should
include versions the pin excludes, so the check may need no outside service. That is reasoned from
apt's version table and not tried. Nothing yet.
