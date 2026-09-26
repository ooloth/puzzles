---
number: 0039
status: accepted
date: 2026-09-26
---

# 39 — changes are verified in a production-like local run, and only the fast loop may differ

## Forced by

[ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) puts the client build and
the HTTP server in separate tools, so from M1's third slice onward the client and the API run locally
as two processes on two ports. Its Risk section records that the dev server does not proxy the API for
free. How that gap is closed locally decides whether local runs are same-origin, which is the
arrangement [do the client and the API share an origin?](../questions/do-the-client-and-the-api-share-an-origin.md)
settles for production. That question is a **Must answer** for M1's third slice, and it cannot settle
the local half without knowing what the local half owes production.

[../problem.md](../problem.md) names the solo maintainer as a stakeholder and ranks clarity over
cleverness because one person maintains this. A fault first seen after a deploy costs a deploy cycle
per attempt to reproduce it, and the same gap leaves an agent verifying a change on its own with two
bad choices: trust an untested assumption, or deploy to find out.

Several records make the built client differ from what the dev server serves:
[ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) makes the entry
document a build output, and [ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md)
lowers syntax to the floor at build time. Observed on 2026-09-26 with Vite 8.3.1 and this
repository's `vite.config.ts`: a class with a `static { }` block is served by the dev server
unchanged and emitted by the build as `var e, t = class {}; e = t, e.x = 1;`. So the dev server
cannot show what a browser at the floor receives.

*Measured — `createServer(...).transformRequest` against `build({ write: false })` on the same
one-line module, once each, 2026-09-26.*

## Decision

**Local work has two modes, and only one of them is bound to production.**

- **The fast loop** is what a change is written in: live reload, unbundled source, whatever keeps the
  edit-to-feedback loop short. It may differ from production.
- **The production-like run** is what a change is verified in. It runs the production artifacts in
  the production topology, and it differs from production only where a record says why.

**A difference matters if it can change what a player sees or whether a guarantee in
[../guarantees/](../guarantees/) holds.** Origin, TLS and cookie behaviour, caching headers,
compression, the built bundle and, later, the service worker all qualify. A difference that matters is
closed in the production-like run or recorded with its reason. A difference that cannot matter, such
as a port number or a log format, needs neither.

**A slice's end-to-end check is observed in the production-like run.** That is the run an issue's QA
plan names and the one [../verification.md](../verification.md) describes as correct.

Of CPU, memory, storage and network, none binds on this choice as a cost. Both modes run on the
maintainer's machine, and the only cost that differs between them is build time, which the fast loop
exists to keep off the edit path. Network is where the production-like run falls short of production
by construction: loopback shows none of the conditions [../constraints.md](../constraints.md)
records for transit links. That difference matters and cannot be closed by running locally, so it is
recorded here and belongs to
[how do we exercise offline, throttled and backgrounded conditions?](../questions/how-do-we-exercise-offline-throttled-and-backgrounded-conditions.md).

## Enforced by

**Nothing yet. Asserted only.** The production-like run does not exist. Which differences it closes,
how, and what command runs it are
[how is the app run locally the way it runs deployed?](../questions/how-is-the-app-run-locally-the-way-it-runs-deployed.md)
at M2, which builds it.

**Until then each slice is verified in the closest mode that exists**, and
[../verification.md](../verification.md) records under **Can't observe** what that mode cannot show.
That is the existing convention for a gap, and it keeps the gap visible rather than letting the fast
loop's result stand in for production's.

Once the production-like run exists, what enforces this is a check that runs a slice's end-to-end
path in it, which [what runs the checks on every change?](../questions/what-runs-the-checks-on-every-change.md)
at M2 would carry.

## Rejected

- **One mode, the fast loop, with no parity owed.** The common default, and it keeps one thing to
  maintain. It is rejected because a fault that only production's arrangement produces is first seen
  after a deploy: a proxied local API with a split production topology works locally and fails once
  deployed, and a syntax the floor cannot parse is served untouched by the dev server, per the
  observation above. **Reverses if** production's arrangement stops differing from the fast loop's in
  any way that matters, which would make the second mode redundant.
- **One mode, and it is production-like.** Nothing can hide from it. It is rejected because every
  edit then pays a production build, and the portable developer-experience standard holds the
  edit-to-feedback loop as a property worth protecting because it is paid on every iteration.
  **Reverses if** a production build rebuilds on each edit about as fast as live reload does.
- **One mode that matches production by default, with each difference recorded as an exception.**
  One mode is simpler to state than two. It is rejected because the fast loop's defining features,
  unbundled source and live reload, are themselves differences that matter: they skip the lowering to
  the floor and the build-output entry document that [ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) and [ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md) exist to secure. The
  exception list would start with the thing verification most needs to see. **Reverses if** the dev
  server applies the build's transforms, so that serving source no longer changes what a browser at
  the floor receives.
- **Verify in a deployed preview environment instead of locally.** It is production by construction.
  It is rejected because each check then costs a deploy cycle, which is the cost
  [how is the app run locally the way it runs deployed?](../questions/how-is-the-app-run-locally-the-way-it-runs-deployed.md)
  exists to avoid, and no host or deploy pipeline exists to run one. **Reverses if** a deploy to a
  preview becomes about as fast as a local production-like run. It could then complement this rather
  than replace it.
- **Not yet.** It is rejected because the origin question is a **Must answer** for M1's third slice,
  and deciding it without this leaves the local half to be wired for convenience, which is the
  direction that hides the fault.

## Risk

**Two modes to keep working, and the second can be skipped.** Until a check runs the production-like
run, verifying in it depends on someone choosing to. The fast loop giving the right answer most of
the time is exactly what makes skipping it tempting.

**Slices 3 to 6 of M1 ship before the production-like run exists.** Each is verified in the closest
mode available, so each carries a recorded gap until M2.

## Revisit when

A production build rebuilds as fast as live reload, or the dev server applies every transform the
build does. Either removes the reason for two modes.

## Also update

- [x] questions/README.md — M1's third slice gains this record as a **Given**; M2's entry for the
      local-parity question is narrowed to what is still open
- [x] questions/how-is-the-app-run-locally-the-way-it-runs-deployed.md — narrowed to which
      differences the production-like run closes, how, and what command runs it
- [x] verification.md — says which mode each capability is observed in
- [x] CONTRIBUTING.md — "Check a change" points here
- [x] unfinished.md — the production-like run is named and does not exist yet
- [x] architecture.md — nothing moved; this names no boundary in the running system
- [x] constraints.md — nothing moved; the transit-link conditions are cited rather than restated
- [x] guarantees/ — nothing moved; this promises a player nothing
