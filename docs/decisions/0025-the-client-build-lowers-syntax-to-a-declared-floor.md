---
number: 0025
status: accepted
date: 2026-09-12
---

# 0025 — The client build lowers syntax to a declared floor

## Forced by

**[../constraints.md](../constraints.md) records that a syntax error in a script is total and happens
before any of it runs.** So the syntax the build emits is not one property of the client among many.
It decides whether there is a client at all on a given device, and it does so before any code can
detect the problem or respond to it.

**[../constraints.md](../constraints.md) records that Safari's version is fixed by the OS version
while Chrome's is not, and that Apple still patches iOS 15.** So there is a real population of
current, vendor-supported devices running a browser from 2021, and a build that emits whatever
syntax its source happens to contain will exclude them without anything reporting it.

**[../problem.md](../problem.md) describes the audience as the general public with no assumed
technical sophistication, phone-first, with secondary desktop use.** There is no basis in that
description for assuming players carry recent hardware.

**[ADR-0003](0003-this-is-delivered-over-the-web.md) chose web delivery**, which is what brings the
browser facts above into scope at all.

**The portable documentation standard holds that an invariant a machine could check is checked by a
machine rather than asserted in prose.** A syntax floor is unusual among scope decisions in being
mechanically checkable against built output, so an answer that cannot be checked is giving up
something available.

## Decision

**The client build emits JavaScript at or below a declared syntax floor, and the floor is declared
rather than inherited from whatever the source happens to use.**

**This constrains the client build and nothing else.** It is a requirement the client bundler has to
satisfy, not a choice of bundler and not a choice of floor. Where the floor is declared and what
reads it is [ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md).

**It does disqualify `bun build` as the client bundler, by consequence, and that is named here rather
than left to be discovered.** Bun's bundler does not down-convert syntax and exposes no setting that
would make it: "Bun does not down-convert syntax; if you use recent ECMAScript syntax, it appears
as-is in the bundled code." Its `target` option selects a runtime environment and resolves export
conditions rather than setting a syntax level.

*Sourced — [bun.com/docs/bundler](https://bun.com/docs/bundler), read 2026-09-04 and re-read
2026-09-12 here.*

**It says nothing about Bun as a runtime, a package manager or a test runner**, and that still holds
even though Bun has since lost all three. The runtime went to Node at
[ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md) on a heap-bounding failure that has
nothing to do with syntax lowering, and
[ADR-0032](0032-the-package-manager-is-pnpm.md) and
[what runs the tests?](../questions/what-runs-the-tests.md) each put Bun out by that record rather
than by this one. Reading this record as "not Bun" would still be the same mistake: it is
evidence about a bundler, and the other three were decided on their own.

## Enforced by

**Nothing. Asserted only, and no build exists.**

What would make it true is a client build configured with a lowering target read from the declaration
in [ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md), which
arrives at M1 with the client build, and a check over the emitted bundle confirming it, which arrives
at M2.

**The gap between those two is where this record is most likely to look honoured and not be.** A
build configured with a target emits what the tool emits, and nothing between M1 and M2 compares that
against the floor. The bundler choice is the only thing carrying this until the check exists, which
is why it appears as a given on M1 slice 2 rather than only here.

## Rejected

- **Let the emitted syntax be whatever the source happens to contain.** The case for it is that it is
  free, it is what happens by default, and on an evergreen-only audience it would cost nothing.
  **Disqualified because it fails silently.** Nothing in development reveals a floor that excludes a
  player's phone: the maintainer's own devices parse everything, the build succeeds, the tests pass,
  and the first report is a player seeing nothing at all. The floor then also drifts upward every
  time anyone writes newer syntax, so it is not even stable at whatever level it starts from.
  **Reverses if** the audience is deliberately narrowed to devices the maintainer tests on directly,
  which would contradict [../problem.md](../problem.md) as it currently stands.

- **Adopt a build tool's own default baseline as the floor.** The case for it is genuinely strong and
  it was the option most likely to be taken without noticing: a published interoperability baseline
  is defensible, enumerable, revised by people who track this full time, and costs no configuration.
  **Disqualified because it sets the floor by tool default, which is the option above with a number
  attached.** The floor then changes when the tool changes, including on an upgrade taken for
  unrelated reasons, and the promise in [../guarantees/](../guarantees/) moves without anyone
  deciding it should. **Reverses if** a record independently argues for that specific baseline as the
  right floor, at which point it is the chosen floor and the tool agreeing is a coincidence rather
  than the reason.

- **Ship two bundles, a modern one and a lowered one, selected at load.** The case for it is real:
  differential serving keeps current devices on smaller output while still reaching old ones, and it
  is an established technique with tooling behind it.

  **This option is not disqualified, and saying otherwise would be dishonest.** What defeats the
  naive form of it is that the `module`/`nomodule` pair discriminates on whether a browser supports
  modules at all, not on which syntax it can parse — so a Safari 15, which supports modules and fails
  on newer syntax, takes the modern bundle and breaks. That is a fact about the mechanism rather than
  about the option, and tooling exists that works around it.

  **It was not chosen because nothing needs it yet.** It buys bundle size on current devices in
  exchange for two bundles built, checked and debugged for the life of the product, and no
  measurement exists showing the lowered bundle is big enough for that to be worth doing.
  [../problem.md](../problem.md) ranks present need over future-proofing. **Reverses if** a
  measurement shows the lowered output costs enough on the networks
  [../constraints.md](../constraints.md) describes to be worth a second bundle.

## Risk

**Lowering syntax makes the bundle larger, and nobody has measured by how much.** That cost lands on
the 3g and 2g tiers [../constraints.md](../constraints.md) records as the modal case, which is the
same network this record is trying to serve people on. The trade is being made without the number,
because the number cannot be produced before a build exists.

**The floor is set from a world population rather than from this app's players.** Apple's adoption
figures and Google's Android requirement are facts about everyone's devices. Nothing is deployed, so
nothing is known about who actually plays this, and the record is knowingly reasoning from the wrong
population because it is the only one available.

**A declared floor is a promise that can be wrong in the expensive direction.** Claiming support for
a browser nobody tests on is worse than claiming less, because
[../guarantees/](../guarantees/) now carries it. What closes that gap is
[how is this tested across browsers and platforms?](../questions/how-is-this-tested-across-browsers-and-platforms.md)
at M2, and until that lands the promise rests on compatibility data rather than on observation.

## Revisit when

- **A measurement shows the lowered bundle costs more than the excluded devices are worth.** Runnable
  once a build exists, and it is the specific disconfirming evidence this record bets against.
- **Analytics exist and show the floor is far below anyone who actually arrives.** The floor is set
  from a world population precisely because no better one exists; the moment one does, this is
  argued against the right numbers.
- **A vendor changes what it patches**, which moves the oldest supported device and therefore the
  widest defensible floor.

## Also update

- [x] `questions/README.md` — [which browsers and versions must this support?](../questions/README.md)
      is resolved and retired from M1 slice 2, and working-notes step 1 is deleted
- [x] `constraints.md` — the device lifecycle facts and the totality of a parse error are recorded
      there and cited here
- [x] `guarantees/` — commits to
      [the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
      and
      [a device too old to run the app is told so rather than shown a blank screen](../guarantees/a-device-too-old-to-run-the-app-is-told-so-rather-than-shown-a-blank-screen.md)
- [x] `questions/what-builds-the-client-and-serves-it-in-development.md` — its Bun entry now carries a
      disqualification rather than an observation waiting on a matrix
- [x] Nothing in `architecture.md` — this constrains what the build emits, not where anything sits
- [x] Nothing in `glossary.md` — no new domain term

Deliberately not decided here: which bundler the client uses, where the floor is declared, what the
floor's value is, and what a browser below it is shown.
