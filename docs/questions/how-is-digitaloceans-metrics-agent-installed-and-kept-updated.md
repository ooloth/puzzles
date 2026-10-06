---
opened: 2026-10-06
status: open
resolves_into: decision
---

# How is DigitalOcean's metrics agent installed and kept updated?

## Why it matters

**Two records disagree about the production Droplet, and slice 4 is where they meet.** Slice 4 takes
as a Given that the Droplet runs DigitalOcean's metrics agent, because
[ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) reports
spending by alerts, and step 9 of
[../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md) says only a
Droplet with the agent can carry the outbound-traffic alert.
[ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
allows software from Debian's archive, and a third-party apt repository only if it meets that
record's list. It names Caddy's as "the one third-party repository today". The metrics agent is not in
Debian, and its install script adds a repository of DigitalOcean's own, so creating the Droplet with
monitoring on installs from a source no record has vetted.

**Getting it wrong is silent in both directions.** An unvetted repository updates outside the daily
hour [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
sets, or not at all, and nothing reports either. Leaving the agent off leaves the traffic alert with
nothing to read, so a compromised machine's outbound traffic bills until somebody looks.

**Environments:** production. The production-like local run, per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
cannot send metrics to DigitalOcean, so how it differs there is part of the answer.

## What would settle it

Reading what `--enable-monitoring` installs at creation, and from where, on a real Droplet; then
checking DigitalOcean's repository against each item in
[ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)'s
list: a key scoped by `signed-by`, releases published promptly, the same versions for amd64 and
arm64, earlier versions kept, a maintained publisher, a pin to a major version, and an origin the
daily run can allow.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/), and a change to step 9 of
[../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md) if the way it
is installed changes.

## Source

Raised 2026-10-06 while working
how is the server reached and hardened? (read with `git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`). The maintainer
asked whether rejecting DigitalOcean's Droplet agent there also removed the metrics agent. It did
not, since they are separate programs, but reading the metrics agent's install script showed the
conflict above.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The metrics agent and the Droplet agent are separate programs.** The metrics agent, `do-agent`,
"enables droplet metrics to be gathered and sent to DigitalOcean to provide resource usage graphs
and alerting", and its README lists Debian among the supported systems. The Droplet agent serves the
browser Droplet Console. `doctl compute droplet create` has a flag for each: `--enable-monitoring`
and `--droplet-agent`.

*Sourced: the [do-agent README](https://github.com/digitalocean/do-agent), read from its raw text,
and `doctl compute droplet create --help` on doctl 1.177.0, 2026-10-06.*

**The install script adds DigitalOcean's own apt repository.** It sets
`REPO_HOST=https://repos.insights.digitalocean.com` and writes
`/etc/apt/sources.list.d/digitalocean-agent.list` with a `signed-by` key.

*Sourced: [install.sh](https://repos.insights.digitalocean.com/install.sh), read from its raw text,
2026-10-06. Whether `--enable-monitoring` at creation installs it this way is not known: the spike
on 2026-10-06 created its Droplet without monitoring, so the agent was absent there.*
