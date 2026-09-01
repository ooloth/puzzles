---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What renders the client?

## Why it matters

No promise in [../guarantees/](../guarantees/) eliminates any of the options below: all of them
can render an 81-cell grid, hold state locally and work offline. That makes this a weaker
question than the ones above it, and means the rejected options stay genuinely live rather than
formally acknowledged.

This is the *class* question — framework, minimal library, or neither. Which framework is
[a separate one](which-component-framework.md), and it waits on this.

## Blocked by

The platform half is settled:
[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) chose web delivery, so this is a
question about what renders in a browser.

Still [is the client served as static files?](is-the-client-served-as-static-files.md), which
decides whether server rendering is in the field at all.

## Blocks

[Which component framework?](which-component-framework.md),
[how is the app styled?](how-is-the-app-styled.md) and
[how is the codebase laid out?](how-is-the-codebase-laid-out.md).

## What would settle it

Building the same non-trivial piece of the grid two ways — a cell that takes a digit, shows
pencil marks and highlights its peers — and comparing what the state layer looks like when the
board, its persistence and a deterministic merge all have to stay pure and testable with no
browser.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Demoted from ADR-0004 on 2026-08-31, after research contradicted the grounds on which it rejected
its alternatives.

## Options

*A component framework with a dev server.* What ADR-0004 chose. The dev server and its hot
replacement are the strongest part of the case, since the edit-to-feedback loop is paid on every
iteration for years.

*A minimal rendering library without a framework's other opinions.* ADR-0004 rejected this as
paying most of the cost for part of the benefit. Lichess ships exactly this — Snabbdom with a
custom DOM diff — at far greater scale and interaction complexity than this app.

*No framework: plain DOM, or web components.* ADR-0004 rejected this because hand-writing the
state-to-DOM binding is ongoing work "with no upside for an interface this stateful". The
evidence points the other way: the board is where a general-purpose framework helps least.

*A framework for the shell, with the board rendered directly.* Not considered by ADR-0004, and
the arrangement that recurs across comparable applications.

## Findings

**Rendering an 81-cell grid is not a performance problem, and there is a number.** Updating a cell
with no memoisation at all measured 0.368ms; memoising so only two cells re-render measured
0.185ms. The saving is roughly one percent of a frame. Nothing here can spend a faster renderer,
which removes the usual argument for both a framework and against one.

**Comparable applications converge on a pattern ADR-0004 did not consider.** tldraw keeps React
and replaced its state layer wholesale. Excalidraw renders to canvas. Lichess's board component
states its rationale as minimising DOM writes. SudokuPad — Cracking the Cryptic's client, the
closest surface analogue that exists — uses no framework and no bundler at all. The recurring
shape is a framework for the shell with direct rendering for the board.

**That evidence is weaker than it first appears, and both halves should be recorded.** tldraw and
Excalidraw are infinite canvases with thousands of objects; Lichess is optimising animation during
blitz play; SudokuPad is one developer's decade-old codebase. None of them is this app, and none
of their reasons obviously transfers. What survives is that the split is a real option that a
serious project chose, not that it is correct here.

**The surviving argument for a framework is not rendering.** It is the dev server, the state-to-DOM
binding not being hand-maintained, and the ecosystem around the browser APIs this design leans on.
Those are real; they were just not the arguments ADR-0004 made.

**The risk ADR-0004 named about itself still stands.** The maintainer's existing strength in one
ecosystem is a legitimate cost input and never a merit, and this is the decision most likely to be
familiarity wearing a reason's clothes.
