---
opened: 2026-09-02
status: open
resolves_into: decision
---

# What serves the client's files?

## Why it matters

Something has to answer the browser when it asks for the client, and nothing currently says what.
[What runs the server?](what-runs-the-server.md) is about the runtime behind the API and says nothing
about static assets. [Where does this run?](where-does-this-run.md) picks a host, not what the host
serves with.

It is what makes an origin arrangement achievable or not. The same process can serve both the
client's files and the API, or a content delivery network can serve the files while a separate
process answers the API, or the platform can route between two deployables. Those are different
answers to [do the client and the API share an origin?](do-the-client-and-the-api-share-an-origin.md)
even when the domain is identical, and the difference is invisible from outside.

It also decides who owns cache headers.
[../constraints.md](../constraints.md) records that without content-hashed filenames a browser
revalidates every cached asset with a conditional request — cheap on a desktop, a round trip per
asset on a weak mobile link, which is the link this app is designed for.

## What would settle it

Knowing what the client is — a set of files, or something a process produces — and then what the
chosen host offers. Several hosts serve static assets as a feature, which makes this fall out rather
than be chosen; others do not, and then it is a real decision about what runs.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, when M1's requirements were listed against the questions blocking them and "a
browser can load the client" turned out to have nothing under it that said what answers the request.

## Options

*The same process that answers the API.* One deployable, one origin by construction, no routing to
arrange. The process spends work on bytes that never change, and cache headers are ours to get right.

*A content delivery network in front, the API behind.* Assets served close to the player and cached
properly with little effort. Introduces the question of whether the browser still sees one origin.

*Whatever the host provides.* Several platforms serve static assets as a feature of deploying. Least
work, and it makes the arrangement the platform's rather than ours to reason about.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Content-hashed filenames are what make an asset cacheable without a revalidation round trip**, per
[../constraints.md](../constraints.md). That is produced by whatever builds the client, so this
question and [what builds and serves the client?](what-provides-the-build-and-dev-server.md) meet at
the filenames.

**This is only a question if the client is a set of files.** If the entry document is produced per
request, the process producing it is already answering the browser, and this collapses into
[what runs the server?](what-runs-the-server.md). See
[is the entry document produced per request?](is-the-client-served-as-static-files.md).
