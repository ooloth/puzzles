---
number: 0027
status: accepted
date: 2026-09-12
---

# 0027 — The floor declaration is a browserslist config

## Forced by

**[ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md) puts the
floor in one declaration read by three consumers and does not say what format that declaration
takes.** A shared declaration is only shared if everything that has to read it can, so the format is
what decides whether the shape holds.

**The consumers are off-the-shelf tools rather than code written here.** A bundler's lowering target,
a parser run over built output and a linter run over source are all things that exist; the format
they already read is therefore a property of the field rather than a preference.

**[../problem.md](../problem.md) ranks clarity over cleverness because one person maintains this.** A
format nothing reads natively means an adapter per consumer, which is three more things to maintain
than the shape needs.

## Decision

**The floor is declared as a browserslist configuration.** It is the format the build tools and both
classes of check read without an adapter, which is what makes
[ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)'s single
declaration reachable by all three consumers.

**The query names its versions explicitly rather than using a resolving query.** `defaults`,
`last 2 versions` and similar resolve against a usage-share dataset, which is both a moving target
and a stale one: the resolution changes as the data changes, and the data changes only when someone
updates the package that carries it. Naming versions satisfies
[ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)'s requirement
that the declaration not derive its versions at read time.

**This follows from [ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
and is recorded separately because it is separable.** A reader can accept one declaration with three
readers and still argue about the format, and the argument below is about the format alone.

**It does not decide which tools fill the three consumer roles.** Which bundler is
[what builds the client and serves it in development?](../questions/what-builds-the-client-and-serves-it-in-development.md);
what runs the two checks is
[what runs the checks on every change?](../questions/what-runs-the-checks-on-every-change.md). This
record constrains those choices to tools that read this format and settles nothing else about them.

## Enforced by

**Nothing. Asserted only, and the file does not exist.**

What would make it true is a browserslist declaration in the repository with explicit versions, and
a bundler, a syntax check and an API check each configured to read it rather than to carry their own
copy. The first of those arrives with the client build at M1 and the other two at M2, per
[ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)'s own
**Enforced by**.

**A declaration that exists while only one consumer reads it satisfies this record and not its
parent**, and the two are hard to tell apart by looking at the file.

## Rejected

- **Declare the floor in Baseline's vocabulary.** The case for it is strong and it is the alternative
  most likely to be chosen by someone starting fresh: Baseline is governed by a cross-vendor
  community group rather than by a usage-share dataset, it is revised by people who track browser
  support full time, a growing set of linters consume it directly, and it states an intent — "widely
  available" — rather than a version list somebody has to keep current. **Disqualified because it
  cannot express this floor.** Its vocabulary is a tier or a year evaluated against a fixed core
  browser set, so the only floors it can name are the ones its own promotion rule produces, and the
  line this project has taken sits below the versions "widely available" currently resolves to. A
  vocabulary that cannot state the answer cannot be the one the answer is written in. **Reverses if**
  the floor rises to or above Baseline's widely-available set, at which point Baseline can express it
  and its governance advantage over a usage-share dataset becomes a live argument again.

- **Invent a format and adapt each consumer to it.** The case for it is real: it owes nothing to a
  third-party dataset, it can say things browserslist cannot, and it cannot be changed underneath us
  by somebody else's release. **Disqualified because it costs an adapter per consumer** and buys
  nothing the shape needs — the declaration's job is to be read by three tools that already agree on
  a format, and inventing a fourth is work whose only product is a translation layer. **Reverses if**
  the floor has to express something browserslist cannot, at which point the adapters are buying
  something.

- **Use whatever format the chosen bundler prefers, and duplicate it for the checks.** The case for
  it is that it needs no decision and follows the tooling. **Disqualified because it is
  [ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)'s first
  rejected option with a different justification** — duplication is duplication whether it arrives by
  choice or by default. **Reverses if**
  [ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md) is reversed.

## Risk

**The version data behind browserslist is a third-party dataset with its own release cadence, and
this record inherits it.** Naming versions explicitly limits the exposure to how a named version is
interpreted rather than to which versions a query resolves to, but the dependency is real and is not
governed by anyone with a duty to this project.

**Choosing the format narrows the tool field before the tools are chosen.** Any consumer that reads
only Baseline vocabulary is now excluded from the two check roles, and that exclusion is made here
rather than in the record that picks the checkers, where it would be more visible to whoever is
picking them.

## Revisit when

- **The floor rises to or above Baseline's widely-available set**, which makes the rejected option
  above expressible and its governance argument live.
- **A consumer worth having reads only Baseline vocabulary**, which turns this record's narrowing
  into a real cost rather than a theoretical one.
- **Browserslist's data source changes hands or its cadence lapses**, which is the dependency named
  under Risk becoming a problem rather than an exposure.

## Also update

- [x] `questions/README.md` — M1 slice 2's givens name this alongside
      [ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
- [x] `questions/what-runs-the-checks-on-every-change.md` — both checks must read this format
- [x] Nothing in `constraints.md` — this imports no fact about the world beyond what
      [ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md) already recorded
- [x] Nothing in `guarantees/` — the promise is scoped by the floor, not by the format carrying it
- [x] Nothing in `architecture.md` — no boundary or relationship changes

Deliberately not decided here: the floor's value, which bundler reads the declaration, and what runs
the two checks.
