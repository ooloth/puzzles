---
opened: 2026-09-16
status: open
resolves_into: unsettled
---

# What must the client and the server each be able to do?

## Why it matters

Every toolchain choice in M1 is scored against something. Where that something is not written down
first, it is whichever properties the first candidate researched happened to have, and the
comparison that follows reads as an evaluation while being a search for reasons.

The list is a derivation, not a survey. Each property cites [../problem.md](../problem.md),
[../guarantees/](../guarantees/), [../constraints.md](../constraints.md) or a record in
[../decisions/](../decisions/), and no tool is named anywhere in it. Naming one is the failure this
file exists to prevent: a property written with a candidate in mind is a candidate wearing a
property's clothes, and it survives every later round because nothing distinguishes it from a real
requirement.

Two things it also produces. A property nothing in the repo supports is an assumption somebody has
been carrying, and writing the list is when it surfaces. A property that no candidate satisfies is a
constraint that has to be met some other way, and finding that before a tool is chosen is the
difference between a design and a workaround.

## What would settle it

Writing it. This is derivation from documents already here rather than research into the world, so
nothing external has to be checked and no candidate has to exist.

It is finished when a reader who does not know which candidates exist can score one against it, and
when every property names the file that establishes it. A property that cannot name one is an open
question and is asked rather than assumed.

## Resolves into

Unsettled, and deliberately left so. The three values this folder uses are `decision`, `constraint`
and `problem`. This is none of them cleanly: it settles no choice, it records no fact about the
world outside the repo, and it restates no part of the problem. What it produces is the scoring
criteria that several records in [../decisions/](../decisions/) will each cite.

Two ways out, and neither has been argued: stretch one of the three, or let the folder carry a
fourth. The frontmatter says `unsettled` until one is chosen, because a value picked to satisfy the
checker would be a wrong answer to a question nobody asked. The research backlog is found by
searching for `resolves_into: constraint` and the open choices by searching for
`resolves_into: decision`, so a guess here would land this file in a query it does not belong in.

## Source

The M1 plan in [README.md](README.md), which makes this its first phase and scores every phase after
it against the result.

## Options

N/A. This resolves into a list rather than a choice between candidate answers.

## Findings

...
