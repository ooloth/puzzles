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

**The renderer does not constrain it.** [ADR-0038](../decisions/0038-the-renderer-is-react.md)
chose React, whose published runtime calls neither `eval` nor `new Function`, so a policy without
`unsafe-eval` costs it nothing. Libraries adopted later are what could still need either, so each is
checked against the policy when it is adopted.

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

Nothing else waits on it before whatever serves the client's files is chosen, which is where the
header is set.

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

**Whether React, or a library adopted with it, injects inline `<style>` elements has not been
checked.** It matters because a policy without `unsafe-inline` for styles blocks injected
style elements unless their hashes are listed, and hashes only work for content fixed at build time.

*Unverified — nothing has been read or run for this.*

**React and React DOM contain no `eval` or `new Function` in their published builds.**
*Measured — a scan of `react` and `react-dom` 19.3.0 for those calls, run by a research agent
2026-09-23 and recorded in the renderer question, read with
`git show b931fb7:docs/questions/what-renders-the-client.md`.*
