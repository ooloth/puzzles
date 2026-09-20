---
opened: 2026-09-19
status: open
resolves_into: decision
---

# What pins the toolchain versions across machines?

## Why it matters

**Three machines resolve a version from somewhere, and where nothing states it they resolve three
different ones.** A contributor's laptop, a container and a CI runner each need to agree on which
Node they run and which package manager they install with.
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) names the Node half
under **Enforced by** and records that the artifact does not exist.

**It covers both tools, which is why it is its own file.** A reasonable person could pick a Node
version and pick any of several mechanisms to state it in, so the mechanism is a second decision.
Settled inside either tool's record it would ride along on reasoning that was never about it.

**The failure it prevents is two mechanisms nobody compared.** Left unowned, the version-line record
states the Node version in whatever field its author reaches for and the package-manager record
states its own version somewhere else. Each looks complete on its own. The repo then has two pinning
mechanisms, chosen separately, neither argued.

**Corepack is why the package-manager half is newly open.** It turned a `packageManager` field into
an installed binary, and it stopped shipping with Node at v25, so the mechanism that used to answer
this question for two of the three candidates is no longer on the machine by default.

**Being wrong is cheap and the cost of silence is not.** Changing the mechanism is a file and a
line in a setup document. Having no mechanism is three machines disagreeing about which Node ran,
which is the kind of difference that surfaces as a bug nobody can reproduce.

## What would settle it

It derives from both tool choices and cannot be answered before them. A pin names a tool and a
version. **Both are now settled**: Node at
[ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) and the package
manager at [ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md). So this is unblocked.

What to establish once they have landed: which mechanisms can pin both tools rather than one, since
one mechanism is the whole point of asking this separately; whether the mechanism has to be
installed itself, and what pins *that*; whether it is advisory or enforced, because a field nothing
reads is documentation rather than a pin; and whether
[where does this run?](where-does-this-run.md) and
[what runs the checks on every change?](what-runs-the-checks-on-every-change.md) at M2 can both
consume whatever is chosen, since they are two of the three machines that have to agree.

## Resolves into

A decision record in [../decisions/](../decisions/), and the artifact
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) says is owed.

## Source

Raised 2026-09-19, while ordering M1's remaining toolchain questions. Two things surfaced it: the
Node half was bundled inside the version-line question and failed the separability test in
[../decisions/README.md](../decisions/README.md), and Corepack's removal in Node v25 left the
package-manager half with no owner at all.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Corepack is no longer distributed with Node from v25 onward.** Its repository states it "is
distributed with Node.js from version 14.19.0 up to (but not including) 25.0.0", v24's documentation
page carries "Corepack will no longer be distributed starting with Node.js v25", and v26 has no such
page. It remains installable from the registry and is still published, at 0.36.0 on 2026-08-28.

Node's TSC chose this deliberately over keeping it: the winning option was to "stop distributing
Corepack (i.e. the distribution will no longer contain a `corepack` executable) on future (i.e. 25+)
release lines of Node.js". So a mechanism built on Corepack is building on something being removed
on purpose.

*Sourced — <https://github.com/nodejs/corepack> README, <https://nodejs.org/docs/latest-v24.x/api/corepack.html>,
the 404 from <https://nodejs.org/docs/latest-v26.x/api/corepack.html>, the npm registry, and
<https://github.com/nodejs/TSC/pull/1697> for the vote. All checked by me on 2026-09-19.*

**The Node half of this now has a rule, and the rule yields a number.**
[ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) says Node runs on the
newest released line that is in Active LTS or committed to becoming it, which as of 2026-09-19 is
**26** — v26 is released and carries an LTS date of 2026-10-28, and nothing newer exists. **The
concrete version belongs in this question's artifact rather than in that record**, which is why its
title is the rule and not a version.

**That record asks for a check, and it lands here.** Its **Enforced by** notes that the rule is
mechanical — compare the pinned version against Node's published schedule — so a script can assert
it rather than anyone remembering. Whatever artifact this question chooses is what such a check
would read, so the two arrive together or the check has nothing to read.

**The maintainer's machine already runs Node v26.7.0 with npm 11.19.0, managed by `fnm`, and `mise`
is also installed.** Recorded as the starting state rather than as a candidate: what one machine
happens to have is not an argument for what three machines should agree through, and the failure
this question exists to prevent is precisely the one where the answer is whatever was already on the
laptop.

*Measured — `node -v`, `npm -v` and `command -v` on the maintainer's machine, 2026-09-19.*

**pnpm reads a version pin and switches itself to it, with no Corepack.** The binary installed from
`get.pnpm.io` reports `12.5.1` in an unpinned directory and `12.4.2` in one whose `package.json`
carries `"packageManager": "pnpm@12.4.2"`. The setting is `pmOnFail`, whose default is `download`.
So one mechanism for the package-manager half is already present in the tool
[ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md) chose, and what is left to weigh is
whether it or an external manager should own both tools rather than one.

*Measured — `pnpm --version` in a pinned and an unpinned directory, by me on 2026-09-19. The
`pmOnFail` default is Sourced from <https://pnpm.io/settings/cli>, opened by me the same day.*

**npm enforces a pin by refusing rather than by correcting.** With `devEngines.packageManager`
requiring `^12.0.0`, npm 11.19.0 stops with `EBADDEVENGINES` and names both the version found and
the version required. Recorded because it is the shape of the alternative: a mechanism that detects
a mismatch is not the same as one that resolves it, and this question has to choose which it wants.

*Measured — by me on 2026-09-19.*

**`mise` can pin npm, pnpm and Node from a checked-in config, through a backend independent of Node
and Corepack, and `fnm` cannot pin a package manager at all.** The maintainer's machine has both.
This is the main alternative to the mechanisms above, and the reason this question is not answered
by [ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md) as a side effect.

*Sourced — <https://mise.jdx.dev/registry.html> and an fnm issue reporting its Corepack path broken
on Node 25+, read 2026-09-19 by a research agent. I did not open either.*
