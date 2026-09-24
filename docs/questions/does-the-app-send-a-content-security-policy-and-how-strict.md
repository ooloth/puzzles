---
opened: 2026-09-23
status: open
resolves_into: decision
---

# Does the app send a Content Security Policy, and how strict is it?

## Why it matters

**A Content Security Policy decides which code the browser will run on this origin**, and no record
or question here mentions one. That makes it the default by omission: no policy, so any script that
reaches the page runs with the page's full authority. That includes a player's board and, once
[are there user accounts?](are-there-user-accounts.md) settles, whatever identifies them.

**It already bears on the renderer.** Alpine's default build evaluates attribute expressions with
`new Function()`, which a policy without `unsafe-eval` blocks, per the findings in
[what renders the client?](what-renders-the-client.md). So a strict policy removes a candidate that
no policy leaves in the field, and choosing a renderer first would settle this question by accident.

**The entry document constrains what a policy can use.**
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) makes
it a build output rather than a per-request render, and
[ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) has a
service worker answer navigations from a cached copy. A per-request nonce needs a fresh document for
every response, so neither record leaves room for one. What remains is a policy of source lists and
hashes, delivered in a response header that the service worker's cached response has to carry, or
in a `<meta>` tag inside the document.

## What would settle it

Deciding whether a policy is sent, which directives it sets, and how it is delivered, then checking
it against the running app. The check is observable: load the app with the policy in force and
confirm the browser's console reports no violation, then inject a script the policy should block and
confirm it is blocked. That works once a client exists, from M1 slice 2.

**Before the renderer settles, only one part of it is needed**: whether `unsafe-eval` and inline
styles or scripts will be allowed. That is what separates renderer candidates. The rest of the policy
can wait for whatever serves the client's files.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised while rebuilding the renderer field, when Alpine's use of `new Function()` turned out to
matter only under a policy nobody had asked about.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Alpine's default build needs `unsafe-eval`, and its CSP build restricts expressions to property
access and method calls.**

*Sourced by a research agent on 2026-09-23 from Alpine's documentation and a third-party guide to
its CSP build. I did not open them.*

**Whether other renderer candidates inject inline `<style>` elements or use `eval` at runtime has
not been checked.** It matters because a policy without `unsafe-inline` for styles blocks injected
style elements unless their hashes are listed, and hashes only work for content fixed at build time.

*Unverified — no candidate has been read or run for this.*
