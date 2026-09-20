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
that artifact under **Enforced by** and records that it does not exist. **Which artifact that is, is
not this question** — it is
[what pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md),
because the same mechanism has to pin the package manager too and cannot be chosen before both tools
are. This file decides the number that goes in it.

**It is not the browser floor.**
[The app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
and [ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
govern what the client is built for. Nothing there reaches the server, and conflating the two would
put a promise to players on a decision that does not affect them.

## What would settle it

Node's own release schedule, read rather than recalled: which line is Current, which is Active LTS,
when each enters Maintenance and when each ends. **Those facts are now under Findings below**, pulled
from `nodejs/Release` on 2026-09-19. They decay on a known date rather than gradually, so re-read them
after 2026-10-28.

Then two checks against them. Whether the host chosen at
[where does this run?](where-does-this-run.md) constrains the line, which a managed platform may and
a bare machine will not. And whether anything this project needs exists only on Current, which today
is a question about type stripping and nothing else.

Being wrong is cheap: it is a version number in one file and a reinstall. That is an argument for
deciding it quickly and stating it, rather than for leaving it unstated, because the cost of silence
is three machines disagreeing rather than a hard migration.

## Resolves into

A decision record in [../decisions/](../decisions/), naming the line and nothing else. The artifact
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) says is owed was moved
out of this file on 2026-09-19 to
[what pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md):
a reasonable person could pick a line and pick any of several mechanisms to state it in, so it is a
second decision, and bundled here it would have ridden along on this one's reasoning.

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

### Pass of 2026-09-19

**The release schedule, as Node publishes it.** Every date below is from `schedule.json` in Node's
own release repository.

| Line | Status on 2026-09-19 | Becomes LTS | Enters Maintenance | Ends |
| --- | --- | --- | --- | --- |
| v22 "Jod" | Maintenance | 2024-10-29 | 2025-10-21 | 2027-04-30 |
| v24 "Krypton" | Active LTS | 2025-10-28 | 2026-10-20 | 2028-04-30 |
| v26 | Current | 2026-10-28 | 2027-10-20 | 2029-04-30 |
| v27 | not started | — | 2027-10-20 | 2030-04-30 |

Odd-numbered majors carry no `lts` field at all, which is the rule stated as data. Newest releases
today are v24.21.0 and v26.9.0.

*Sourced — <https://raw.githubusercontent.com/nodejs/Release/main/schedule.json> and
<https://nodejs.org/dist/index.json>, both fetched and parsed by me on 2026-09-19. The status column
is arithmetic against today's date rather than a label either source prints.*

**The Current-versus-LTS framing in the Options above expires on 2026-10-28**, which is five weeks
away. v26 is even-numbered and already carries its `lts` date, so the line described there as having
"the shortest support window per release" becomes the Active LTS line before any of this ships, and
v24 enters Maintenance eight days before that. Whatever this question decides, it should be decided
against the schedule rather than against the words Current and LTS, which mean different things this
month than they will next month.

*Reasoned — from the dates in the table above.*

**The lines differ on type stripping, and that is a behaviour gap rather than a support-date gap.**
v24's TypeScript documentation says non-erasable syntax such as enums and parameter properties runs
"unless the flag `--experimental-transform-types` is passed". v26's says "Removed
`--experimental-transform-types` flag." So on v24 there is a middle option between stripping and a
real transpiler, and on v26 there is not. That is why
[is server TypeScript transpiled or stripped?](is-server-typescript-transpiled-or-stripped.md)
derives from this question rather than sitting beside it: this line decides how many options that
one has.

*Sourced — <https://nodejs.org/docs/latest-v24.x/api/typescript.html> and
<https://nodejs.org/docs/latest-v26.x/api/typescript.html>, both opened and quoted by me on
2026-09-19.*

**Corepack is gone from v25 onward, so the line decides whether it is on the machine.** Node's own
Corepack repository states it "is distributed with Node.js from version 14.19.0 up to (but not
including) 25.0.0", v24's Corepack documentation page carries "Corepack will no longer be distributed
starting with Node.js v25", and v26 has no such page at all — the URL returns 404. It remains
installable from the registry, so this raises a cost rather than closing a door, and the cost lands
on [which package manager?](which-package-manager.md) rather than here.

*Sourced — <https://github.com/nodejs/corepack> README, <https://nodejs.org/docs/latest-v24.x/api/corepack.html>,
and the 404 from <https://nodejs.org/docs/latest-v26.x/api/corepack.html>, all checked by me on
2026-09-19.*

**Every supported line bundles an npm older than 12.** v24.21.0 ships npm 11.19.0 and v26.9.0 ships
npm 11.19.1, so the line does not discriminate on this today. It is recorded here because it is the
kind of thing that starts discriminating without announcing it, and because
[which package manager?](which-package-manager.md) rests on it.

*Sourced — the `npm` field per release in <https://nodejs.org/dist/index.json>, parsed by me on
2026-09-19.*

**The maintainer's stated preference is Current rather than LTS**, on the grounds that there is no
reason to forgo the updates without one. **Set aside for the research phase on 2026-09-19 at the
maintainer's direction**, so the field is rebuilt and argued without it. It is kept rather than
deleted because it is a legitimate input and will be weighed once there is something to weigh it
against; it is not deleted quietly and it is not treated as the answer.
