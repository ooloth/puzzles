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

### Pass of 2026-09-19, second: the question's framing is expiring

**Node is moving to one major release a year, and every release will become LTS.** The
announcement, dated 2026-03-10, says "Starting with 27.x, Node.js will move from two major releases
per year to one", "**Every release becomes LTS**. No more odd/even distinction - Node.js 27 will
become LTS", "**One major release per year** (April), with LTS promotion in October", and "Version
numbers align with the calendar year of their initial Current release: 27.0.0 in 2027, 28.0.0 in
2028." Support duration "remains similar (30 months)". It states plainly that "Node.js 26 follows
the existing schedule. This is the last release line under the current model."

**This is the finding that reshapes the question.** "Current" and "Active LTS" are about to stop
naming two different lines. From v27 they name the same version six months apart — Current in April,
LTS in October — so a policy of tracking one or the other stops being a choice between release
trains and becomes a choice about how long to wait before adopting the only train there is. Any
argument here framed as Current-versus-LTS is arguing about a distinction with roughly one release
left in it.

*Sourced — <https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule>, fetched
as raw markdown and quoted by me on 2026-09-19.*

**The new policy lives in exactly one place, and Node's own canonical documents contradict it.**
`README.md` in `nodejs/Release` still states the superseded rule verbatim — "New even-numbered
versions are released in April and odd-numbered versions in October" and "Odd-numbered release lines
are not promoted to LTS" — six months after the announcement. `schedule.json` encodes `v27` with a
`maintenance` key and no `lts` key, which is the shape it uses for a line that never becomes LTS.
So the data this file's table above is built from does not yet know about the change. The table's
dates are still right; what it cannot tell you is what comes after v27.

*Sourced — <https://raw.githubusercontent.com/nodejs/Release/main/README.md> and the `v27` entry in
`schedule.json`, both read by me on 2026-09-19. The README quote is second-hand from a research
agent; the `schedule.json` shape I parsed myself.*

**The ecosystem encodes the old rule in `engines.node` fields, and they are enforced at install
time.** Both Vitest and npm exclude the odd lines outright: Vitest 5.0.1 declares
`^22.12.0 || ^24.0.0 || >=26.0.0` and npm 12.0.2 declares `^22.22.2 || ^24.15.0 || >=26.0.0`. Each
admits v22, v24 and v26 and refuses v23 and v25. Vite 8.3.0 (`^20.19.0 || >=22.12.0`), TypeScript
7.0.2 (`>=16.20.0`), tsx 4.23.13 (`>=18.0.0`) and pnpm 12.5.1 (`>=18.*`) impose no such carve-out.

Two things follow. Neither of the lines in play today is excluded by anything, so this does not
discriminate between v24 and v26. And the risk that "track Current" used to carry — that Current is
an odd line half the time and parts of the ecosystem will refuse it — is a risk the new release
model removes rather than one this decision has to price.

*Sourced — the `engines.node` field from `https://registry.npmjs.org/<pkg>/latest` for each package,
fetched and parsed by me on 2026-09-19.*

**`node:sqlite` does not discriminate between the lines, and it is not Stable on either.** Both v24
and v26 mark it "Stability: 1.2 - Release candidate", and neither requires a flag — it came out from
behind `--experimental-sqlite` in v22.13.0 and v23.4.0. v26 adds four `StatementSync` methods that
v24 lacks (`close()`, `resetStats()`, `stat()`, `[Symbol.dispose]()`), none of which anything here
needs. This matters beyond this question: every argument in the repo that the store does not narrow
the runtime passes through `node:sqlite`, and nothing had recorded that it sits below Stable. That
belongs to [which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md).

*Sourced — the stability marker grepped from
<https://nodejs.org/docs/latest-v24.x/api/sqlite.html> and
<https://nodejs.org/docs/latest-v26.x/api/sqlite.html> by me on 2026-09-19. The API-difference list
is second-hand from a research agent diffing the two pages.*

**The maintainer's machine already runs v26.7.0 with npm 11.19.0, managed by `fnm`.** `mise` is also
installed. This is context for
[what pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md)
rather than an argument here — what one machine happens to have is not a reason.

*Measured — `node -v`, `npm -v` and `command -v` on the maintainer's machine, 2026-09-19.*

### Pass of 2026-09-19, third: what running both lines showed

Method for everything below: `fnm` installed v24.21.0 and v26.9.0 into a throwaway `FNM_DIR`, each
binary was invoked by absolute path, and the directory was deleted afterwards. Apple M2, macOS
26.6.2, 2026-09-19. Each probe ran once; these are pass/fail observations rather than timings, so
variance does not arise.

**Both lines run the shape this project actually has, identically.** One `.ts` file importing
`node:sqlite` and `node:http`, executed directly with no flags and no transpiler: it created a table,
prepared and ran statements, served the rows over HTTP and fetched them back. Output was
`OK sqlite+http+strip -> [{"row":0,"col":0,"value":5}]` on both. So type stripping, the store's
driver and the HTTP server all work unflagged on either line, and nothing in the combination
separates them.

*Measured — as above.*

**The escape hatch is real on v24 and really gone on v26.** A file containing `enum Mark { Empty,
Star }` fails on both with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` when run plainly. Adding
`--experimental-transform-types` makes it run on v24.21.0 and makes v26.9.0 exit with `bad option:`.
This is the one capability difference found between the lines, and it is the documented one rather
than a new discovery — what the run adds is that it is confirmed behaviour rather than a changelog
entry.

*Measured — as above.*

**The toolchain resolves on both with engine checking turned on.** `npm install --dry-run
--engine-strict vite vitest typescript` added the same 40 packages under both lines with no
`EBADENGINE`. So the `engines.node` fields recorded above are not merely permissive on paper.

*Measured — as above.*

**[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md)'s deciding property
holds on both.** That record chose Node because it can bound its heap
and say why it died. `node --max-old-space-size=64` against an allocation loop produced
`FATAL ERROR` and "JavaScript heap out of memory" on v24.21.0 and v26.9.0 alike, so the reason the
runtime was chosen does not depend on the line.

*Measured — as above.*

**Nothing else was examined, and this is what that leaves open.** The probes asked whether each line
*can* do what this project needs, not how fast, at what memory cost, or with what failure mode under
load. No throughput, latency or resident-memory figure was taken, because nothing in
[../problem.md](../problem.md) puts the server on the path from input to paint — the client owns
solving, per [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) — so CPU and
network do not bind this choice and a number would have been measuring something the decision does
not turn on. Storage does not bind either: the store is one SQLite file
([ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md)) and its size does not
vary by runtime version. Memory binds only through the heap bound, which is checked above.

**No host in [where does this run?](where-does-this-run.md) constrains the line.** Its surviving
candidates are Fly.io micro-VMs, a Hetzner VPS, a Google Compute Engine e2-micro, DigitalOcean or
Linode, and Coolify on a VPS. Each runs an ordinary container or an ordinary Linux machine, so the
Node version comes from the image this project builds rather than from the platform. That closes
the second of the two checks this file's **What would settle it** asks for.

*Reasoned — from the candidate list in that file, each of which is a container or a VM. Not checked
against any provider's documentation, because none of them supplies the runtime.*
