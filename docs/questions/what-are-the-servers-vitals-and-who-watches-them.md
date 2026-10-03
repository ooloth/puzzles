---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What are the server's vitals, and who watches them?

## Why it matters

Process alive, memory, disk, request rate, error rate, latency percentiles, store size and growth
— the ordinary figures any running server has. Nothing here is unusual to want; the open part is
which of these get watched, at what cost, and by whom.

Left undecided, the answer defaults to whatever the hosting platform happens to show on its
dashboard, which is a choice made by the platform's defaults rather than one made deliberately.
[../problem.md](../problem.md) names the solo maintainer as a stakeholder, and a maintainer who
has to open a dashboard to know whether the server is healthy will do it rarely — rarely is
exactly when the answer has changed.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, extending the maintainer tooling milestone past the loops that were already
obvious.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

*Mined 2026-09-30 from where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) as it was at commit `11ac964`. These are observations for this question to weigh, not answers.*

- **DigitalOcean Monitoring is free and opt-in.** It needs its agent on the Droplet, and alerts on
  CPU, load, memory, disk use, disk I/O and bandwidth by email or Slack. Read by an agent from
  [monitoring](https://docs.digitalocean.com/products/monitoring/).
- **DigitalOcean's uptime checks run from outside the machine.** "Each Uptime check costs $1.00 per
  month", and one a month is credited free. *Sourced —
  [uptime pricing](https://docs.digitalocean.com/products/uptime/details/pricing/), opened
  2026-09-30.*
- **Other free outside monitors.**
  - UptimeRobot's free plan has 50 monitors at five-minute intervals, with email alerts. Read by an
    agent from [pricing](https://uptimerobot.com/pricing/).
  - Healthchecks.io's free plan monitors 20 heartbeat jobs, and alerts when a ping is late or reports
    `/fail`. That suits a check that Litestream's copy is fresh. Read by an agent from
    [pricing](https://healthchecks.io/pricing/).
- **Cloudflare Workers' free plan allows 5 cron triggers.** 2026 community threads report that
  one-minute triggers on free accounts do not fire, so five minutes is the safe assumption for a
  watchdog run there. Read by an agent from
  [limits](https://developers.cloudflare.com/workers/platform/limits/).
- **Node 24 names its process `MainThread`**, not `node`, in `ps`. A monitor matching on `node`
  misses it. *Measured — `ps -eo comm` on a Droplet, 2026-09-30.*
- **Memory in use on a 1 GB Droplet running the stack**, measured on Ubuntu 24.04 before the OS was
  chosen, is in the question's twelfth pass: 360 MB idle and 373 MB at the peak of a deploy. The app, Caddy and Litestream accounted for
  about 160 MB of it.
  On Debian 13, the OS per [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), the system
  alone left 769 to 784 MB available, against 701 to 726 MB on Ubuntu 24.04, so the stack has more room.
  *Measured on Droplets, 2026-10-03, in the fourth pass of the OS question, read with
  `git show 6bf04f6:docs/questions/which-os-does-the-droplet-run.md`.*
- **The production Droplet runs DigitalOcean's metrics agent**, because the outbound-traffic alert
  that [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
  relies on needs it: "Only Droplets with the DigitalOcean metrics agent installed are available to
  select." Monitoring is "a free, opt-in service", alerting by email or Slack over windows of 5, 10, 30
  or 60 minutes. The same agent serves memory and disk alerts. Its memory use on the 1 GB Droplet is
  unmeasured. *Sourced —
  [set up alerts](https://docs.digitalocean.com/products/monitoring/how-to/set-up-alerts/), opened
  2026-09-30. The alert itself is step 10 of
  [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md).*
