---
number: 0026
status: accepted
date: 2026-09-12
---

# 0026 — One config declares the browser floor for the build and the checks

## Forced by

**[ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md) requires a declared floor
and does not say where it is declared.** The build has to read it to lower to it, so something has to
hold it before the build can be configured at all.

**The portable documentation standard holds that an invariant a machine could check is checked by a
machine rather than asserted in prose.** A floor stated only in a record is a rule somebody has to
remember, and this folder is where unchecked invariants collect.

**[../problem.md](../problem.md) ranks clarity over cleverness because one person maintains this.**
Two numbers that must agree and nothing checking that they do is the shape of a thing that silently
stops agreeing.

**[../constraints.md](../constraints.md) records that a syntax error is total while a missing API
fails at its call site.** The two halves of a floor fail differently and are caught by different
tools, which is the reason both have to read the same number rather than each carrying its own.

## Decision

**One configuration declares the browser floor, and everything that depends on the floor reads it
from there.** Three consumers: the build's lowering target, a check that the emitted bundle parses at
the floor, and a check that source does not call APIs the floor lacks.

**The declaration names its versions rather than deriving them at read time.** A floor computed from
the calendar or from current usage share targets different browsers each year with nobody deciding
that, and a line that moves on its own cannot be the scope of a promise.

**Lowering the floor later is the direction that needs the checks.** Raising it can only reduce what
must be supported. Lowering it enlarges the set, and every API added while the floor was higher
becomes a candidate failure — which is a lint result when both checks read one config, and a player's
bug report otherwise.

**What format that configuration takes is
[open](../questions/what-format-declares-the-browser-floor.md)**, and is separable from this record:
the shape here is one declaration with three readers, and more than one format could carry it. It is
answered alongside the bundler, because the bundler is the consumer whose native formats differ.

### The value is not settled here

**What goes in that config today is the Safari shipping with iOS 15 and the equivalent versions of
the other engines**, because [../constraints.md](../constraints.md) records iOS 15 as the oldest
branch Apple still patches, which makes it the widest line not extending to abandoned devices.

**That value is a configuration setting rather than a decision this record takes**, and it is written
here only so a reader knows what it currently is. A reasonable person could set it differently while
agreeing with everything above, which is the test in [README.md](README.md) for whether something is
a second decision — so it is not asserted as one. Moving it is a config change and a rebuild, with no
record to supersede.

**Nothing in the architecture turns on iOS 15 rather than a later version, because the web APIs this
design depends on are supported far below both.** Service workers and the Cache API arrive at iOS
Safari 11.3, Chrome 43 and Firefox 44; IndexedDB's `getAll` and binary keys at Chrome 58 and Safari
10.3. The binding feature across the set is `<script type="module">`, at Chrome 61, Safari 10.3 and
Firefox 60. So the floor is chosen against the device population and not against a capability the
design needs.

*Sourced — `@mdn/browser-compat-data@8.1.1`, dataset timestamp 2026-09-10, queried 2026-09-12 by a
research agent and not opened here. The design in question is
[ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) plus the durability
work the offline promises in [../guarantees/](../guarantees/) imply; no application code exists, so
this is the floor the committed design needs rather than a survey of a built app.*

## Enforced by

**Nothing. Asserted only, and its three consumers land in two different milestones.**

The build's lowering target arrives with the client build at M1, and the build cannot lower without
reading a floor from somewhere, so that consumer is self-enforcing once the build exists. The two
checks arrive at M2, under
[what runs the checks on every change?](../questions/what-runs-the-checks-on-every-change.md), and
neither is self-enforcing: nothing breaks if they are never built.

**So the half most likely to be silently dropped is the half this record exists for.** Between the
two milestones the floor is declared and honoured by the build, with nothing verifying that it is,
while [the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
rests on it.

## Rejected

- **Let each tool carry its own number.** The case for it is that it is what happens by default, it
  needs no shared file, and nothing is wrong with it on the day it is set up. **Disqualified because
  it makes lowering the floor a one-way door.** Lower the build's target and the bundle starts
  parsing on older browsers, while the API check still reasons about the old, higher floor and
  reports nothing — so the app parses and then fails at the first call to something the newly
  included browsers lack, on exactly the devices the change was made to serve. **Reverses if** the
  floor is genuinely never going to move, which is a claim no record makes and which the value's
  own provisionality contradicts.

- **Declare the floor in the decision record and nowhere else.** The case for it is that it is the
  least machinery, and this repo's records are read. **Disqualified because nothing enforces it.**
  The failure it permits is the one [ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md)
  exists to prevent, reintroduced one layer up: the build emits whatever it emits, and the record
  saying otherwise is true only while somebody remembers to check it by hand. **Reverses if** no tool
  in the chain can read a machine-readable floor. The Findings in
  [what builds the client and serves it in development?](../questions/what-builds-the-client-and-serves-it-in-development.md)
  are evidence against that rather than a settled fact, so the condition is live rather than closed.

- **Declare it later, when the build exists.** Genuinely cheap and the right answer for most
  questions at this stage, which is why it is listed. **Disqualified because
  [ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md) cannot be implemented
  without it** — the build is configured with a target, and there is no version of that step that
  defers where the target comes from. This is not deferrable past the first build rather than not
  deferrable in principle. **Reverses if** [ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md)
  is reversed.

## Risk

**The API half is checked far less well than the syntax half, and one config makes both look equally
covered.** Checking emitted syntax is a parse at a stated level, and a parse either succeeds or does
not. Checking API usage is static analysis over source: it does not follow an aliased or computed
global, does not read dependencies, and by default ignores usage inside a feature-detection guard.
So the API check will pass on code that breaks at the floor, and the shared configuration invites
reading its silence as coverage. This is the weakness being knowingly accepted, and the residue
belongs to [how is this tested across browsers and platforms?](../questions/how-is-this-tested-across-browsers-and-platforms.md)
at M2.

**No tool checks behavioural parity at all.** Compatibility data records whether an API is present,
not whether it behaves the same, and [../constraints.md](../constraints.md) already carries a bug
that reproduced only on real iOS Safari over a real network. A green check is not evidence the app
works on the floor browser.

**Nothing yet exists to run these checks.** [What runs the checks on every change?](../questions/what-runs-the-checks-on-every-change.md)
is open at M2, and `scripts/check-docs.py` already exists with nothing running it. Until that is
answered, this record describes checks that are configured and not executed, which is a weaker
position than it reads as.

## Revisit when

- **A consumer in the chain cannot read the shared declaration**, which would break the single-source
  property this record exists for. Which format is shared is
  [what format declares the browser floor?](../questions/what-format-declares-the-browser-floor.md);
  the failure here is a consumer that reads no shared format at all.
- **The syntax check has caught nothing over a long period**, which would suggest the floor sits
  below anything anyone writes and the lowering is buying nothing.
- **Analytics exist**, at which point the value is argued against real players rather than against a
  world population.

## Also update

- [x] `questions/README.md` — [which browsers and versions must this support?](../questions/README.md)
      is resolved, and M2's cross-browser testing entry states what it now rests on
- [x] `guarantees/` — the floor named here is the scope
      [the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
      states
- [x] `constraints.md` — cited, nothing new imported beyond what
      [ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md) added
- [x] Nothing in `architecture.md` — no boundary or relationship changes
- [x] Nothing in `glossary.md` — no new domain term

Deliberately not decided here: which bundler reads the config, what runs the checks, and how the
floor is verified on a real device rather than against compatibility data.
