---
opened: 2026-09-02
status: open
resolves_into: decision
---

# Does any page need markup a crawler can read?

## Why it matters

Crawlers — search engines, and the link-preview fetchers behind messaging apps and social sites — do
not reliably run JavaScript. A page whose content only exists after a script runs is, to them, empty.

This is the one requirement found so far that a build-time-rendered page satisfies only awkwardly and
a per-request-rendered page satisfies naturally. It applies to any URL where the content changes
between deploys: a puzzle published today, at a URL somebody shares, on a day nobody rebuilt the
site.

It is tracked separately from the rendering decision on purpose. If the answer is yes, the cost is
not per-request rendering — it is a rebuild triggered by publishing, or one runtime-rendered route
alongside everything else. Both are reachable from any rendering choice, which is why this question
does not need answering to make one, and why the record that makes one should say it stays reachable.

## What would settle it

Deciding whether anyone is expected to arrive at this app from a search result or a shared link, and
whether the page they arrive at must show the content or may show an invitation to open the app.

Those are product questions rather than technical ones, and the second dissolves most of the first:
a shared link that previews as "a puzzle from *(name)*, for 2 September" needs no per-puzzle markup
at all, while one that previews the grid does.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, while establishing what would force markup to be produced per request. Everything
else that looked like it might — personalisation, entitlement, session handling — turned out to be
satisfiable from the device or at an endpoint. This did not.

## Options

*No page needs it.* The app is opened by people who know what it is. Shared links preview as the site
rather than as the puzzle. Nothing is indexed beyond a landing page that changes only when it is
rebuilt.

*Static content, rebuilt on a schedule or on publish.* Pages exist as files, and publishing triggers a
rebuild. Crawlers see real markup. The lag between publishing and a crawler seeing it is whatever the
rebuild cadence is.

*Rendered per request, for those routes only.* Always current, no rebuild, and it puts a runtime on
the path for those URLs — which
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) already
established exists.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Reach is not ruled out, and this question is downstream of that.**
[../problem.md](../problem.md) scopes the launch rather than the ceiling, so an answer that assumes
nobody will ever arrive from a search result is assuming something the product statement declines to
assume.

**A shared link and an indexed page are different requirements and may have different answers.** A
preview card needs a handful of meta tags describing the puzzle; an indexed page needs the content.
The first is far cheaper and covers the case most likely to actually happen for an app of this kind.

**Whichever way this goes, it does not force the rendering model for the app itself.** A rebuild on
publish and a single runtime-rendered route are both additive to any of the candidate shapes. What
would foreclose it is a delivery arrangement with no way to produce markup for a URL at all, and
nothing under consideration has that property.
