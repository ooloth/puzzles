---
opened: 2026-09-16
status: open
resolves_into: decision
---

# What does a browser below the floor see?

## Why it matters

[A device too old to run the app is told so rather than shown a blank
screen](../guarantees/a-device-too-old-to-run-the-app-is-told-so-rather-than-shown-a-blank-screen.md)
is promised, and nothing decides what the telling consists of.
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) lists what a
browser below the floor is shown among the things it deliberately does not decide.

The mechanism is already fixed and it is narrow. [../constraints.md](../constraints.md) records that
a syntax error in a script is total and happens before any of it runs, so a browser below the floor
executes none of the bundle. Anything it is meant to see has to reach it outside that bundle, which
leaves the entry document.
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) makes
that document a build output and names it as what carries this fallback.

So the promise is kept or broken by what the build puts in one file. An entry document that is an
empty root element filled in by the script gives a below-floor browser a blank screen, which is the
thing the guarantee exists to prevent, and it is the shape a client-rendered app arrives in by
default.

## What would settle it

Opening the built document in a browser below the floor and seeing what it shows. That is the whole
test. It is possible from M1 slice 2 onward, because the document exists from then, and it is worked
at M10, because nobody is below the floor until there are players and adding the fallback later
costs no more than adding it now.

What is open is what markup sits in that document, and how the build keeps it there without it
appearing twice or flashing on a browser that does run the bundle. Both are properties of the build
output, so this is checkable against the artifact rather than argued.

**The shape chosen here decides whether the entry document reads the floor.** A message shown by
default and removed by the bundle needs no knowledge of the floor. A script in the document that
tests the browser against the floor has to read the same declaration as the build, which makes it
one more reader for [what format declares the browser
floor?](what-format-declares-the-browser-floor.md) to serve. That question is answered first and
prices both shapes, so the answer here is free to take either.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) names it under
what it does not decide, and the guarantee above is what goes unkept while it stays open.

## Options

...

## Findings

...
