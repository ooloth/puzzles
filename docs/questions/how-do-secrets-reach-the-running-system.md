---
opened: 2026-09-02
status: open
resolves_into: decision
---

# How do secrets reach the running system?

## Why it matters

**The running app gets its first secret at M12 at the earliest**, when the store's off-machine copy
arrives with the first player's data. In M1 the app is a hard-coded response with nothing to inject,
per [what deploys the code?](what-deploys-the-code.md). The deploy holds a credential from M1, the
SSH key that reaches the Droplet, and how that key is kept is part of this question.

**The store contributes no secret at all.**
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

The host is a bare DigitalOcean Droplet per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), which supplies
no secret storage, and the app runs there as a systemd service per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).
Worth checking rather than assuming: whether local development can work without a real credential at
all, which is a property of the arrangement rather than of the tooling, and is decided by
[how is the store reached in local development?](how-is-the-store-reached-in-local-development.md).

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02. An adversarial audit of the execution-shape analysis found that credentials and
secret management for a network-attached store appear in no file, while being an operational surface
that the embedded alternative does not have at all.

## Options

*Files on the machine, readable only by the service.* The deploy writes each secret to a file that
systemd hands to the app at start, so nothing outside the Droplet holds it at run time. Least to
build on a bare machine, and the secret is then only as safe as the deploy that writes it.

*A dedicated secret store.* A managed service holding secrets that the process fetches at start-up.
More moving parts than this system's size justifies today, and the option that scales past one
deployable.

*No secret at all.* Not available. The store needs no credential, per
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md), but the deploy, the
publish path and the backup destination each still need one.

Secret storage supplied by the host is not open: a Droplet offers none, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md).

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**This outlives the store decision, which is why it is a question rather than a line in a record.**
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) removed the store's
credential and removed nothing else. What a secret is and how it travels is a separate choice that no
store shape makes.

*Reasoned — 2026-09-02.*

**Anything in cloud-init user-data is readable by every process on the Droplet.** DigitalOcean's
metadata service at `169.254.169.254` serves `user-data` with no authentication described. On a
spike Droplet on 2026-10-06 its index listed `id`, `hostname`, `user-data`, `vendor-data`,
`public-keys`, `region`, `interfaces/`, `dns/`, `floating_ip/`, `reserved_ip/`, `tags/`, `features/`
and `virtual_ips/`, none of them a token. systemd's `IPAddressDeny=link-local` on a unit is documented
to block a unit from reaching it, and
[ADR-0055](../decisions/0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md)
sets it on the app's unit. So user-data is not a place for a secret that a process other than
cloud-init must not read.

*Measured for the index, one run; the rest is a research agent's reading of DigitalOcean's metadata
docs and systemd.resource-control(5). That no endpoint below the index holds a token was not checked.
Moved here on 2026-10-06 from
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md).*
