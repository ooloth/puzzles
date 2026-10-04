---
opened: 2026-10-03
status: open
resolves_into: decision
---

# Which repositories may the machine install packages from?

## Why it matters

Whatever repository the Droplet installs from runs its packages' install scripts as root, and
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
installs every update from those repositories daily, with no rehearsal first. So adding a repository
is trusting its publisher with the machine, every day.

[ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) installs Caddy from Caddy's
own repository, hosted by Cloudsmith, because Debian 13's own `caddy` package is old. No record
decided that trusting that repository is acceptable. [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) chose the front, and the source came
with it. [What shape is the deployable?](what-shape-is-the-deployable.md) may add NodeSource's
repository the same way.

**Environments:** production, and the production-like local run per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
which installs from the same places.

**Until it is answered**, slice 4's setup would install Caddy from Cloudsmith because [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) says
so, and nothing states what any further repository must meet.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/). If it rules out Caddy's repository, [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md)'s
source is revisited with it.

## Source

Raised on 2026-10-03 by a handoff check, which found that [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) commits to a package source no
record settled, and that [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) then installs from it daily.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Caddy's repository names its origin `cloudsmith/caddy/stable`, and NodeSource's names
`. nodistro`.** See "Hosting — Debian 13 updates itself on its own clock" in
[../constraints.md](../constraints.md).

**Debian 13's own `caddy` package was found at 2.6.2 with open security issues and marked for
removal.**

*Sourced by a research agent on 2026-10-02, per [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md). Not re-opened.*
