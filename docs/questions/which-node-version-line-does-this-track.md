---
opened: 2026-09-19
status: open
resolves_into: decision
---

# Which Node version line does this track?

## Why it matters

[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) chose Node and
deliberately did not choose a version line. It named a floor — type stripping runs unflagged from
v22.18.0 and v23.6.0 — and a floor is not a policy.

**The gap between the lines is behaviour, not just support dates.** `--experimental-transform-types`
was removed in v26, so the erasable subset that record commits to is stricter on Current than on an
older line, and code written against the looser one would break on upgrade rather than on adoption.
That is the direction that costs something: choosing Current now and discovering a constraint is
cheaper than choosing an older line and inheriting a constraint later.

**It is the first thing a second machine needs to agree about.** A contributor, a container and a CI
runner each resolve a Node version from somewhere, and where nothing states it they resolve three
different ones. [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) names
that artifact under **Enforced by** and records that it does not exist.

**It is not the browser floor.**
[The app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
and [ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
govern what the client is built for. Nothing there reaches the server, and conflating the two would
put a promise to players on a decision that does not affect them.

## What would settle it

Node's own release schedule, read rather than recalled: which line is Current, which is Active LTS,
when each enters Maintenance and when each ends. Those facts were established during the runtime
survey and died with the file that held them, so they need re-establishing rather than citing.

Then two checks against them. Whether the host chosen at
[where does this run?](where-does-this-run.md) constrains the line, which a managed platform may and
a bare machine will not. And whether anything this project needs exists only on Current, which today
is a question about type stripping and nothing else.

Being wrong is cheap: it is a version number in one file and a reinstall. That is an argument for
deciding it quickly and stating it, rather than for leaving it unstated, because the cost of silence
is three machines disagreeing rather than a hard migration.

## Resolves into

A decision record in [../decisions/](../decisions/), and the artifact
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) says is owed.

## Source

Raised 2026-09-19, on noticing that
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) states a floor and
explicitly declines to state a line, and that no file tracked the difference.

## Options

*Track Current, and move with it.* Newest behaviour, shortest support window per release, and the
strictest reading of the erasable subset, which is the reading the code would be written against
anyway.

*Track Active LTS.* Longest support window and the line most hosts and images default to. Its cost
here is that a constraint removed on Current may still apply, so code written against it needs
checking again at the next major.

*Pin one version and move deliberately.* Neither line, an explicit number, upgraded when there is a
reason. Most predictable and the most work.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The maintainer's stated preference is Current rather than LTS**, on the grounds that there is no
reason to forgo the updates without one. Recorded as the input it is rather than as the answer, since
no record argues it and the release schedule it should be checked against is not currently
established anywhere in this repo.

**The release-schedule facts are not in this repo.** They were established during the runtime survey
and were mined into
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) only where that record
needed them, which did not include the schedule. Read them from Node's own release repository rather
than from any figure quoted here or elsewhere.
