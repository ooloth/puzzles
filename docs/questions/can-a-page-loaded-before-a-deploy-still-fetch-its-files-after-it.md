---
opened: 2026-10-03
status: open
resolves_into: decision
---

# Can a page loaded before a deploy still fetch its files after it?

## Why it matters

Vite gives every built asset a content-hashed filename, per
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md), and the entry document names the
assets of the release that built it. A deploy replaces the release. A page holding the old entry
document that asks for one of its assets after the switch asks for a filename the new release does
not have. If the answer is a 404, or the entry document served in its place, the script never runs.

That is the failure
[the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
rules out, and it would be silent: no server error, and a player who sees it simply leaves.

**How often it happens depends on when the page asks.** Today the client loads its assets right
after the entry document, so the window is the few milliseconds between them, overlapping a switch
that took about three seconds in the spikes. It widens in three ways:

- a chunk loaded later in a session, by a dynamic import, is asked for minutes after the entry
  document;
- the service worker [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md)
  settles answers navigations from a document stored on the device, which can be from any earlier
  release;
- that service worker fetches its precache while it installs, which can straddle a deploy.

**Environments:** production, and the production-like local run per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
where a deploy is rehearsed and this failure can be produced on purpose.

**What it does not cover.** Whether an old client can still talk to a new API is a contract
question, not a file question. Which program serves the files is
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md), and
how the deploy moves traffic is
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md). Both
decide whether the previous release's files are still reachable after a switch, which is why this
question sits beside them.

## What would settle it

Knowing which program serves the client's files, and what a deploy does to the previous release's
directory. Then a deploy in the local run with a page loaded from the old release, asking for an old
asset after the switch, observing what comes back.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised on 2026-10-03 while ordering M1 slice 4's questions. Neither the file-serving question nor
the switch question said what happens to the previous release's assets, and the maintainer agreed it
gets its own question.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

...
