---
opened: 2026-10-05
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

Derived on 2026-10-06, before any option was researched.

**The group.** This list is shared with
[is Node installed on the host or carried in each release?](is-node-installed-on-the-host-or-carried-in-each-release.md),
because if Node comes from the host, its repository meets the same moments of being installed and
patched: properties 4 to 12 apply to it as written. That question adds the moments only it has, such
as a deploy and a rollback. [What are the server's vitals, and who watches
them?](what-are-the-servers-vitals-and-who-watches-them.md) shares the agent running and reporting,
but blocks nothing yet, so nothing here decides which other figures are watched.

**The moments.** The production Droplet is created by the maintainer, holding a short-lived token,
through the API with `--droplet-agent=false`, per
[ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) and
[ADR-0056](../decisions/0056-the-droplet-runs-without-digitaloceans-droplet-agent.md); whatever
reports traffic is installed then or by setup; it runs beside the app on a 1 GB machine with no swap;
outbound traffic rises, from popularity or a compromised machine, and an alert has to reach the
maintainer; the reporting stops, because the program crashed, an update broke it or its source went
away; the daily run at the chosen hour, per
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md);
the publisher releases a fix, a new major version or a regression; the publisher's key or hosting is
compromised, rotated, moved or abandoned; the machine is rebuilt, including the move to Debian 14;
the production-like local run boots the same setup, per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
where nothing can report to DigitalOcean; and the maintainer, months later, wants to know what is on
the machine and what updates it.

**Ways a bad answer fails.** *Safety:* a compromised machine's traffic bills with nothing reporting
it; reporting stops and reads as quiet traffic; a publisher gains root on the machine without being
vetted; the reporter goes unpatched, or updates itself outside the hour; it exhausts memory and the
kernel ends the app; it can read the store; a rebuilt or local machine silently lacks it.
*Performance:* it holds memory the app needs; its own traffic counts against the pool. *Experience:*
the maintainer has one more source, one more update path and one more console setting to remember,
spread across a creation flag, setup and the control panel.

**Safety**

1. Outbound traffic at the rate step 10 of
   [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md) sets reaches
   the maintainer as an alert, with nobody looking. This is what
   [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) relies
   on, as its property 10, because spend alerts do not see transfer until it is invoiced, per "Hosting
   — DigitalOcean has no spending cap" in [../constraints.md](../constraints.md).
2. Reporting that has stopped is not read as traffic that has stopped. A silent reporter fails
   property 1 without anything saying so; from
   [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)'s
   property 10 and the portable decision-making standard's preference for loud failure. Building
   alerting in general is not owed here; see **Deferred**.
3. Nothing it adds can read or write the store, or reach beyond what reporting needs. The store is the
   last copy of a player's work, per
   [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) and
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md),
   and the portable security standard asks for least privilege.
4. Every package's origin is checked before it is installed, against a key scoped to its source or a
   checksum its publisher publishes, including at creation (property 1 of
   [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
5. The machine trusts the fewest publishers its software needs (property 2 of
   [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
6. A security fix reaches the machine within about a day of upstream's, with no step by hand
   (property 3 of
   [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
   property 1 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
7. Nothing updates or restarts itself outside the daily run at the chosen hour. One policy covers
   every source (properties 3 and 6 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
8. The daily run does not move it across a major version, and the previous version stays
   installable (properties 5 and 6 of
   [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
9. Its publisher is maintained, weighed by what moving off it would cost (property 9 of
   [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
   [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)).
10. A rebuilt machine has the same arrangement with no step by hand (property 7 of
    [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
    [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
11. The production-like local run installs and updates it the same way, on arm64 as on amd64, and
    differs only where reaching DigitalOcean is impossible, with that difference stated
    ([ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
    property 4 of
    [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
12. Nothing it adds opens an inbound port, bypasses the machine's firewall, or fills the disk without
    bound (property 4 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md),
    [ADR-0057](../decisions/0057-ssh-accepts-only-keys-and-a-firewall-on-the-machine-admits-only-ssh-http-and-https.md)).

**Performance**

13. Its memory is bounded and leaves the app its room on a 1 GB machine with no swap ("Hosting — a
    DigitalOcean Droplet starts with no swap" in [../constraints.md](../constraints.md), property 2
    of [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)).

**Experience**

14. For anything it adds, the maintainer can see where it came from and what updates it, in one
    place (property 11 of
    [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
15. Setting it up is written down as steps a rebuild repeats, not left to a control-panel default
    nobody records (property 6 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md),
    [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md)).

**Resources.** Memory binds, as property 13; the agent's use on the 1 GB Droplet is unmeasured, per
[what are the server's vitals, and who watches
them?](what-are-the-servers-vitals-and-who-watches-them.md), and is measured when this is worked.
Storage binds only through logs, in property 12. Network does not bind as a cost: reporting a few
figures a minute is small next to the 1,000 GiB pool. That is reasoned, and its size is measured with
memory. CPU does not bind: sampling counters is small next to serving requests. Reasoned, not
measured.

**Checked and binding on nothing.** Cost: DigitalOcean Monitoring is free, per the Findings in
[what are the server's vitals, and who watches
them?](what-are-the-servers-vitals-and-who-watches-them.md), and
[ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md) counts
anything paid. It separates candidates only if one costs money, so it is scored then rather than
listed.

**Deferred.** Which other figures are watched, such as memory, disk and the process being alive, is
[what are the server's vitals, and who watches
them?](what-are-the-servers-vitals-and-who-watches-them.md). Alerting on a failed update run or a
stale pin is [how is the server operated?](how-is-the-server-operated.md) at M11. Property 2 asks only
whether a candidate's own traffic alert can tell silence from quiet.

**Maximums.** *Safety:* every abnormal outbound rate, and every stop in reporting, reaches the
maintainer within the hour, from software that adds no publisher, updates with everything else at the
hour, and can read nothing but counters. *Performance:* it takes none of the app's memory.
*Experience:* nothing on the machine for the maintainer to install or remember beyond what is already
there, and one place to see it.

**Added in the first pass, 2026-10-06**

Property 1 is split into the two cases its moment names, because the candidates that report from the
machine itself and the ones that read it from outside pass the first and differ on the second:

- **1a.** The alert fires when the machine is honest and the traffic is popularity or a fault.
- **1b.** The alert fires when someone else holds root on the machine. A compromised machine sending
  traffic is the case [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
  leaves to an alert, and "Why it matters" above names it. Root can stop, rewrite or impersonate
  anything running on the machine, and cannot touch figures collected outside it.

## Resolves into

A decision record in [../decisions/](../decisions/), and a change to step 9 of
[../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md) if the way it
is installed changes.

## Source

Raised 2026-10-05 while working
how is the server reached and hardened? (read with `git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`). The maintainer
asked whether rejecting DigitalOcean's Droplet agent there also removed the metrics agent. It did
not, since they are separate programs, but reading the metrics agent's install script showed the
conflict above.

## Options

**The question as titled assumes the agent.** Stated without a solution, it is: what reports the
production Droplet's sustained outbound traffic to the maintainer, with nobody looking? The field
below was enumerated on 2026-10-06 by a research agent asked for every way to do that, and scored in
the first pass under **Findings**.

- **A. DigitalOcean's metrics agent from DigitalOcean's apt repository**, with an alert policy on
  Public Outbound Bandwidth. What runbook step 9 does today.
- **B. The same agent from a downloaded `.deb`.**
- **C. A counter on the machine from Debian's archive**, such as `vnstat` 2.13 or the interface's
  `tx_bytes`, mailing the maintainer through an SMTP relay when a threshold is crossed.
- **D. A counter on the machine, as in C, reporting to an outside heartbeat service** such as
  Healthchecks.io, which emails when a ping says the threshold was crossed and when pings stop.
- **E. Prometheus's node exporter with an alerting stack**, from Debian's archive.
- **F. Something off the machine reads DigitalOcean's own bandwidth figures** through
  `GET /v2/monitoring/metrics/droplet/bandwidth`, holding a token with `monitoring:read` only, on a
  schedule, and emails when the rate is high or when it cannot read them. Nothing is installed on the
  machine.
- **G. DigitalOcean's default bandwidth graph, with nobody alerted.**
- **H. Not yet.**

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The metrics agent and the Droplet agent are separate programs.** The metrics agent, `do-agent`,
"enables droplet metrics to be gathered and sent to DigitalOcean to provide resource usage graphs
and alerting", and its README lists Debian among the supported systems. The Droplet agent serves the
browser Droplet Console. `doctl compute droplet create` has a flag for each: `--enable-monitoring`
and `--droplet-agent`.

*Sourced: the [do-agent README](https://github.com/digitalocean/do-agent), read from its raw text,
and `doctl compute droplet create --help` on doctl 1.177.0, 2026-10-05.*

**The install script adds DigitalOcean's own apt repository.** It sets
`REPO_HOST=https://repos.insights.digitalocean.com` and writes
`/etc/apt/sources.list.d/digitalocean-agent.list` with a `signed-by` key.

*Sourced: [install.sh](https://repos.insights.digitalocean.com/install.sh), read from its raw text,
2026-10-05. Whether `--enable-monitoring` at creation installs it this way is not known: the spike
on 2026-10-05 created its Droplet without monitoring, so the agent was absent there.*

**DigitalOcean's agent repository publishes for amd64 and i386 only.** Its `Release` file reads
`Architectures: amd64 i386` and `Origin: . main`, and `dists/main/main/binary-arm64/Packages` returns
404. The amd64 index holds 48 versions, so earlier versions are kept. No GitHub release of `do-agent`
carries an arm64 asset either.

*Sourced: the repository's `Release` and `Packages` files, fetched 2026-10-06 by a research agent and
again by me. The GitHub assets were read by the agent and not re-opened.*

**The agent's package updates itself on its own clock.** `do-agent` 3.18.14's `postinst` writes
`/etc/cron.daily/do-agent`, which runs `scripts/update.sh`: it sleeps up to 900 seconds, refreshes only
`digitalocean-agent.list`, and runs `apt-get install --only-upgrade do-agent`. The same `postinst`
runs `systemctl restart do-agent`, so every upgrade restarts it, and rewrites the cron file on every
install.

*Sourced: the `.deb` from the repository's pool, unpacked 2026-10-06 by a research agent and again by
me.*

**The install script refuses any machine that is not DigitalOcean's.** `check_do` reads
`/sys/devices/virtual/dmi/id/bios_vendor` and exits with "The DigitalOcean Agent is only supported on
DigitalOcean machines" unless it reads `DigitalOcean`.

*Sourced: [install.sh](https://repos.insights.digitalocean.com/install.sh), opened 2026-10-06.*

**The agent's unit runs it as its own user with some sandboxing.** `User=do-agent`,
`ProtectSystem=full`, `ProtectHome=yes`, `NoNewPrivileges=yes`, `PrivateTmp=yes`, `Restart=always`
and `OOMScoreAdjust=-900`, the last of which makes the kernel prefer ending the app over the agent
when memory runs out. Whether it listens on `127.0.0.1:9100` was inferred from strings in the binary
and not observed.

*Sourced: the unit in the 3.18.14 `.deb`, read by a research agent 2026-10-06. Not re-opened.*

**DigitalOcean's default bandwidth graph needs no agent.** "The default Droplet graphs use metrics
collected by external tools; they require no additional services on the Droplet itself", and "three
graphs are available for any Droplet", one of them "Bandwidth public", in megabits per second. Alert
policies still need the agent.

*Sourced: [track performance](https://docs.digitalocean.com/products/droplets/how-to/track-performance/),
opened 2026-10-06.*

**The API serves bandwidth figures to a read-only token.**
`GET /v2/monitoring/metrics/droplet/bandwidth`, with `interface=public` and `direction=outbound`,
answers in megabits per second under the `monitoring:read` scope, which DigitalOcean lists as "View
Monitoring metrics and alert policies". Whether it returns figures for a Droplet without the agent is
**not known**, and it is what decides option F.

*Sourced: DigitalOcean's [scopes list](https://docs.digitalocean.com/reference/api/scopes/), opened
2026-10-06; the endpoint and its unit from DigitalOcean's OpenAPI specification, read by a research
agent and not re-opened.*

**A standing read-only token is allowed.** [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md):
"A token something needs to keep holds read scopes only."

**Nothing documents what an alert policy does when the agent stops reporting.** The alert types are
thresholds on CPU, memory, disk and bandwidth, with no type for an agent that has gone quiet. A
threshold that is never crossed because no figures arrive most plausibly stays silent. That is
inferred, not observed.

*A research agent's reading of DigitalOcean's alert docs and OpenAPI specification, 2026-10-06. Not
re-opened.*

**GitHub turns off a public repository's scheduled workflows after 60 days with no activity**, and
sends a scheduled run's notifications "to the user who last modified the cron syntax". This
repository is public.

*Sourced: GitHub's [events that trigger
workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows),
opened 2026-10-06, and the repository's API answering without authentication.*

**Debian 13 carries the counters a machine-side candidate would use.** `vnstat` 2.13-1,
`prometheus-node-exporter` 1.9.0-1, `prometheus-alertmanager` 0.28.1, `collectd` 5.12.0, `sysstat`
12.7.5 and `msmtp-mta` 1.8.28. `do-agent` is not in Debian.

*A research agent's reading of packages.debian.org, 2026-10-06. Not re-opened.*

### First pass, 2026-10-06

| | Disqualified by | Why |
|---|---|---|
| A. Agent from DigitalOcean's repository | 11 | No arm64 build, so the local run cannot install it, and its repository fails [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)'s amd64-and-arm64 rule. It would also fail 7, through its own daily cron job. **Reverses if** DigitalOcean publishes arm64 builds and the package stops installing its own updater. |
| B. Agent from a `.deb` | 6 | Nothing patches it, which [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md) rules out by name. |
| C. Machine-side counter, mailing | 2 | When the counter or the mail relay stops, nothing says so. |
| D. Machine-side counter, outside heartbeat | 1b | Passes 2, since a stopped ping is reported. Root on the machine can keep sending pings that say all is well. |
| E. Node exporter with alerting | 2 | The alerting stack runs on the machine it watches, so it goes quiet with it. |
| F. Off the machine, reading DigitalOcean's figures | none yet | 1 is **unknown**: whether the endpoint has figures for an agentless Droplet. 2 depends on what runs the schedule, since GitHub's would stop silently after 60 quiet days unless something reports its silence. |
| G. Default graph only | 1 | Nobody is alerted. |
| H. Not yet | 1 | Slice 4 puts a billable machine on the internet. |

D survives every row but 1b. F survives every row it can be scored on so far. 1b is the strongest
reading of property 1: it assumes an attacker who knows the heartbeat exists and forges it.
