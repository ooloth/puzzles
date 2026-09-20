---
number: 0033
status: accepted
date: 2026-09-19
---

# 33 — an import of an undeclared dependency fails

## Forced by

[ADR-0032](0032-the-package-manager-is-pnpm.md) chose pnpm, and the single largest reason it gave was
that an import of a dependency the importing package never declared fails rather than resolving.
**That property is a setting, not a consequence of the choice**, so it needs a record of its own or
it can be given up without anyone noticing the record above lost its main argument.

[../problem.md](../problem.md) ranks clarity over cleverness because one person maintains this. A
dependency that is used but not declared is the opposite: the manifest and the imports disagree, and
nothing says so.

## Decision

**Every package declares what it imports, and the installed layout enforces it.** Under pnpm this
means the isolated linker — `node-linker` left at its default of `isolated`, never set to
`hoisted` — so a package can reach only what its own manifest names.

An import of an undeclared package throws `ERR_MODULE_NOT_FOUND` when it is written, rather than
resolving until an unrelated change in somebody else's dependency tree removes it.

**This is a property of the repository rather than of pnpm.** Yarn's Plug'n'Play enforces the same
thing, so a future move to Yarn keeps this record intact; a move to npm would break it, which is
what makes it worth writing down separately.

## Enforced by

`node-linker` staying absent from `pnpm-workspace.yaml`, which is its default. **Nothing checks
this**, and a single line added to that file during a deployment problem would silently reverse it.

A check is available and does not exist yet: an installed tree can be asserted against by importing
a known transitive dependency and requiring the import to fail. It belongs with
[what runs the checks on every change?](../questions/what-runs-the-checks-on-every-change.md) at M2,
because M1 has no runner to put it in. Until it lands, this record is the only thing standing
between the property and a one-line reversal.

## Rejected

- **A hoisted layout, the flat `node_modules` npm and Yarn Classic produce** — because it makes the
  failure silent. The undeclared import resolves, ships, and breaks later in a place unrelated to
  the change that caused it, which is the one failure shape the portable decision-making standard
  says to rank below an otherwise-worse loud one.

  The case for it is real and is why this is a decision rather than a formality: it is what every
  tool in the ecosystem assumes, it copies to another machine without thinking about symlinks, and
  it is pnpm's own recommended escape hatch for deployment targets that cannot follow them.

  **Reverses if** [where does this run?](../questions/where-does-this-run.md) selects a host that
  cannot deploy a symlinked tree and no other route exists, which is a trade this record would lose
  rather than win.

- **Keeping the isolated layout but not recording it** — because
  [ADR-0032](0032-the-package-manager-is-pnpm.md)'s reasoning depends on it, and a decision living
  only inside another record's rationale is invisible to anyone reading the listing. Somebody
  hitting a symlink problem would flip the linker as a configuration fix, which it looks like, and
  the earlier record would keep reading as sound while its main argument had gone.

## Risk

**The escape hatch and the decision are one line apart**, and the moment somebody needs the escape
hatch they will be debugging something else and under pressure. This is exactly when an unchecked
property gets traded away, which is why the missing check is named above rather than assumed.

**Strictness surfaces real breakage in third-party packages**, which is why pnpm documents a hoisted
mode at all. A dependency that relies on reaching an undeclared package will fail here and work
elsewhere, and the fix is per-package configuration rather than a switch.

## Revisit when

A dependency this project needs cannot be made to work under the isolated layout, or a deployment
target rejects symlinked trees with no alternative. Either is the condition under which the rejected
option becomes the better one.

## Also update

- [x] questions/README.md — nothing moved; this opens no question and closes none
- [x] architecture.md — nothing moved; this constrains the installed tree, not the system's parts
- [x] constraints.md — nothing moved; pnpm's linker is a choice we control, so it is not a constraint
- [x] glossary.md — nothing moved
- [x] guarantees/ — nothing moved; this promises a player nothing
