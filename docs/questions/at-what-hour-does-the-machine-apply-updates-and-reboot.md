---
opened: 2026-10-03
status: open
resolves_into: decision
---

# At what hour does the machine apply updates and reboot?

## Why it matters

[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
installs updates daily at one hour, and reboots then when anything needs it. That hour is when
Caddy's restart and every reboot of about 18 seconds land, and property 6 of that record requires it
to fall outside the hours players start sessions.

It interacts with [is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md):
a daily release time would make one hour the busiest of the day, and the update hour must not be it.

**Environments:** production. The production-like local run, per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
carries the same configuration and can run it at any hour.

**Until it is answered**, Debian's default holds: updates install between 06:00 and 07:00 machine
time, per [../constraints.md](../constraints.md), an hour chosen by nobody.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out on 2026-10-03 from when are updates applied to the machine? (read with
`git show cb8e751:docs/questions/when-are-updates-applied-to-the-machine.md`), whose record settled
that updates land at an hour we set and left which hour open, at the maintainer's request.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

...
