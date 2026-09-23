---
updated: 2026-09-19
update_when: the rules module gains a consumer, or a renderer is chosen whose reactive primitive
  changes what this costs
decays: slow
status: active
---

# The shared rules module holds no framework-reactive state

The module implementing the puzzle rules takes plain data and returns plain data. It declares no
renderer's reactive primitive, imports no renderer, and never receives a value still wrapped in one.
Where the view layer passes it state, it passes a plain snapshot of that state.

## Why it holds

[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
requires one implementation of the rules shared by the client, the server and the generator, with no
publish step between them. The generator is a batch process with no browser and no bundler, so the
module has to be ordinary TypeScript that a bare runtime executes. A reactive primitive in it breaks
that in one of two ways depending on the renderer: a compiler-syntax primitive makes the file
unreadable without that renderer's compiler, and a runtime primitive makes every consumer of the
rules depend on a UI library to run.

The failure this prevents is the one
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
exists to prevent. A rules module the generator cannot import gets reimplemented for the generator,
and two implementations of "is this board legal" drift.

**It has no sanctioned exception**, which is why it is here rather than in
[../standards/](../standards/). A rules module that needs a renderer to run is not an unconventional
rules module; it is one that cannot do the job
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
assigned it.

## What it costs, and why that is small

Nothing. Keeping domain logic free of I/O and of framework types is ordinary design, and the survey
behind
[what renders the client?](../questions/what-renders-the-client.md) found no renderer that makes it
harder: a module that never calls a reactive primitive is untouched by every restriction any of them
imposes. The work is entirely at the boundary, where the view layer hands over a plain value rather
than a proxied one.

## Enforced by

Nothing. Asserted only.

**The check it should have is a test that imports the rules module under a bare runtime, with no
bundler and no renderer installed, and exercises it.** That fails loudly the moment a framework
import or a compiler-only primitive enters the module, and it needs no knowledge of which renderer
was chosen, so it survives the renderer decision. A lint rule forbidding renderer imports from the
rules directory catches the same thing earlier and more cheaply, and the two together catch what
either alone would miss.

Neither exists yet, because the rules module does not. Whichever slice first creates the rules module is where
these checks belong, and
[what proves a vertical slice works end to end?](../questions/what-proves-a-vertical-slice-works-end-to-end.md)
at M2 is where the runner for them gets decided.

**Both checks are part of that slice's definition of done, and this file is what says so.** They
were briefly filed as their own issue and it was closed as mis-scoped: its QA plan required adding
a renderer import to a rules directory, and neither the renderer nor the directory exists, so
nothing about it could be run or observed. An issue whose evidence cannot be collected is not
scoped yet. So the obligation lives here until there is a slice to attach it to, and whoever writes
that slice's issue carries these two checks into its done-when.

## Where it came from

The renderer survey recorded in
[what renders the client?](../questions/what-renders-the-client.md), which established that a
renderer's reactive primitive constrains the module that calls it and no other. The rule is what
turns that finding into something the codebase can rely on rather than something a future reader has
to re-derive.
