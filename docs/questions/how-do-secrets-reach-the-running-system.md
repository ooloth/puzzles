---
opened: 2026-09-02
status: open
resolves_into: decision
---

# How do secrets reach the running system?

## Why it matters

**M3 is where the first real secret exists**, because that is where the store gains a row and — if
the store is reached over a network — a connection string with credentials in it.
[What deploys the code?](what-deploys-the-code.md) states plainly that "Nothing about M1 requires
secrets. The milestone is a hard-coded response with no database, so there is nothing to inject and no
secret handling to design." That stops being true one milestone later.

**The store contributes no secret at all, which is smaller than this question was framed for.**
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) makes the store a file
the process opens, so there is no credential to hold, rotate or leak, and no copy of one needed on a
developer's laptop or in whatever runs the checks. What remains are secrets that have nothing to do
with the store: whatever a deploy authenticates with, whatever the generator uses if it publishes
through the server's API, and whatever object storage the backups are written to.

The cost of getting it wrong is not gradual. A credential committed to a public repository is
disclosed permanently, and this repository is public per
[ADR-0015](../decisions/0015-the-issue-tracker-is-github-issues.md).

## What would settle it

Naming what secrets exist, where each is stored, how each reaches a process at run time in every
environment, and what the recovery is when one is exposed. The last is the part usually skipped, and
it is the only part that matters on the day it is needed.

Worth checking rather than assuming: whether the chosen host supplies secret storage that is good
enough to need nothing else, and whether local development can work without a real credential at all
— which is a property of the arrangement rather than of the tooling, and is decided by
[how is the store reached in local development?](how-is-the-store-reached-in-local-development.md).

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02. An adversarial audit of the execution-shape analysis found that credentials and
secret management for a network-attached store appear in no file, while being an operational surface
that the embedded alternative does not have at all.

## Options

*Whatever the host provides.* Environment variables set through the platform's own secret storage.
Least to build, and it ties the arrangement to the host in a small way.

*A dedicated secret store.* A managed service holding secrets that the process fetches at start-up.
More moving parts than this system's size justifies today, and the option that scales past one
deployable.

*No secret at all.* Not available. It was the honest zero on this axis while the store might have
needed a credential; the store does not, and the remaining secrets — deploy, publish, backup
destination — are not removed by that.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**This outlives the store decision, which is why it is a question rather than a line in a record.**
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) removed the store's
credential and removed nothing else. What a secret is and how it travels is a separate choice that no
store shape makes.

*Reasoned — 2026-09-02.*
