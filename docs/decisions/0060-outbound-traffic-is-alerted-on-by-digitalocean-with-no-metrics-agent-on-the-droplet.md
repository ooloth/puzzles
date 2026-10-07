---
number: 0060
status: accepted
date: 2026-10-07
---

# 0060 — Outbound traffic is alerted on by DigitalOcean, with no metrics agent on the Droplet

## Forced by

- [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md): spending is
  reported to the maintainer by alerts, and nothing stops it. Spend alerts do not see transfer until
  it is invoiced, per "Hosting — DigitalOcean has no spending cap" in
  [../constraints.md](../constraints.md), so outbound traffic needs an alert of its own.
- [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md):
  software on the machine comes from Debian, or from a repository that meets its list.
  DigitalOcean's metrics agent comes from neither, per "Hosting — DigitalOcean's metrics agent" in
  [../constraints.md](../constraints.md).
- [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md): updates
  run once a day, at an hour we set.
- DigitalOcean's alerts page: "Only Droplets with the DigitalOcean metrics agent installed are
  available to select", per
  [set up alerts](https://docs.digitalocean.com/products/monitoring/how-to/set-up-alerts/).

## Scored against

Derived from the moments something reports the Droplet's outbound traffic: the Droplet is created;
the reporter runs beside the app on a 1 GB machine with no swap; traffic rises, from popularity or a
compromised machine; the report goes quiet; the daily update runs; its publisher releases a fix or a
regression; the machine is rebuilt or replaced; the production-like local run boots the same setup;
and the maintainer, months later, wants to know what is on the machine.

1. *Safety.* Traffic at the rate in step 10 of
   [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md) reaches the
   maintainer as an email, with nobody looking, when the machine is honest
   ([ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)).
2. *Safety.* It does so when someone else holds root on the machine, the case
   [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) leaves to an
   alert. Weighed below 1 and 3, as a tie-breaker: most compromises are automated and do not forge a
   report, which is reasoned and not sourced.
3. *Safety.* A reporter on the machine stopping is not read as traffic stopping
   ([ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md), the portable
   decision-making standard's preference for loud failure).
4. *Safety.* DigitalOcean stopping collecting figures or evaluating a policy is noticed.
5. *Safety.* A checker off the machine stopping is noticed.
6. *Safety.* Nothing added can read or write the store, or reach beyond what reporting needs
   ([ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md),
   [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md), the portable
   security standard).
7. *Safety.* Every package's origin is checked before it is installed, including at creation
   (property 1 of
   [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
8. *Safety.* The machine trusts the fewest publishers its software needs (property 2 of
   [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
9. *Safety.* A security fix arrives within about a day, with no step by hand (property 3 of
   [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
10. *Safety.* No restart a player notices happens outside the chosen hour (property 6 of
    [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
11. *Safety.* An update run, with its memory and its lock on the package system, happens only at the
    chosen hour ("Hosting — Debian 13 updates itself on its own clock" in
    [../constraints.md](../constraints.md),
    [a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md)).
12. *Experience.* One update policy covers every source (property 3 of
    [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
13. *Safety.* No major-version jump, and the previous version stays installable (properties 5 and 6
    of [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
14. *Safety.* Its publisher is maintained (property 9 of
    [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
    [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)).
15. *Safety.* A rebuilt or replacement machine has the same arrangement with no step by hand
    (property 7 of
    [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
    [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
16. *Safety.* The production-like local run is the same, differing only where reaching DigitalOcean
    is impossible, with that difference stated
    ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)).
17. *Safety.* Nothing added opens an inbound port, bypasses the firewall, or fills the disk (property
    4 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md),
    [ADR-0057](0057-ssh-accepts-only-keys-and-a-firewall-on-the-machine-admits-only-ssh-http-and-https.md)).
18. *Performance.* Its memory is bounded and leaves the app its room ("Hosting — a DigitalOcean
    Droplet starts with no swap" in [../constraints.md](../constraints.md)).
19. *Experience.* The maintainer can see where it came from and what updates it, in one place
    (property 11 of
    [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
20. *Experience.* Setting it up is written-down steps a rebuild repeats, not a control-panel default
    ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property 6).
21. *Safety.* The fewest separate services sit on the path from traffic to email, since each is a
    place it can go quiet (property 3 and 4 above).
22. *Safety.* Nothing new holds a standing credential to the DigitalOcean account
    ([ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md), the portable
    security standard's least privilege).

**Resources.** None binds on the chosen option, which installs nothing on the machine: no memory, CPU,
disk or network of the machine's is spent. The agent it avoids used about 16 MB and brought a running
mail server with it.

**Maximums.** *Safety:* every abnormal outbound rate reaches the maintainer from figures nothing on
the machine can touch, and every stop in reporting is noticed. *Performance:* the machine spends
nothing on it. *Experience:* one command at setup and nothing to keep in mind afterwards. The chosen
option meets the second and third, and the first except for property 4, which needs a check that the
alert still fires; see **Risk**.

## Decision

**The production Droplet is created without DigitalOcean's metrics agent, and a DigitalOcean alert
policy on its Public Outbound Bandwidth is attached to it through the API, by tag.**

- **Creation.** The Droplet is created with `doctl compute droplet create` without
  `--enable-monitoring`, and with `--tag-name production`. The token that creates it holds
  `tag:create` as well, which creates nothing billed, so
  [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md) still holds.
- **The alert.** `doctl monitoring alert create --type
  v1/insights/droplet/public_outbound_bandwidth --compare GreaterThan --tags production`, with the
  rate and one-hour window of step 10 of
  [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md) and the
  maintainer's address, created by a short-lived token holding `monitoring:create`. The control panel
  cannot create it, since it lists only Droplets with the agent.
- **By tag, not by ID.** A rebuild keeps the Droplet's ID, but a replacement Droplet gets a new one.
  A policy on the tag reaches any Droplet created with it, so a replacement is covered by the
  creation command it is made with rather than a second step carrying a new value.
- **The local run** has no counterpart, since nothing is installed on the machine, so the two do not
  differ on the machine. The alert exists only for the Droplet.

**Why this works.** DigitalOcean's bandwidth figures come from outside the machine, and its alert
reads them. On 2026-10-07 a policy on a Droplet that never had the agent, attached first by ID and
then by tag, emailed within about 6 minutes of the figure crossing its threshold. The method and every
time are in "Hosting — DigitalOcean's metrics agent" in [../constraints.md](../constraints.md).

## Enforced by

**Nothing yet.** It is true once M1 slice 4 creates the Droplet and the policy by the runbook. Two
checks would hold it, and neither exists: a setup check that `doctl monitoring alert list` shows a
bandwidth policy on the tag and that the Droplet carries the tag; and a check that the alert still
fires, which is
[how is the server operated?](../questions/how-is-the-server-operated.md) at M11.

## Rejected

- **The metrics agent from DigitalOcean's apt repository**, as the runbook had it. Its case: it is
  DigitalOcean's documented way, and the control panel offers alerts only with it. It fails property
  11: its package installs `/etc/cron.daily/do-agent`, which runs its own `apt-get` upgrade at a
  time cron picks. **Reverses if** DigitalOcean's package stops installing its own updater and builds
  for arm64.
- **The agent, with [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
  and [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
  amended to allow it.** Its case: it keeps to DigitalOcean's documented path, and the local run
  lacking it is a difference property 16 allows. It fails property 8: it adds a publisher with root,
  whose install script runs unverified at first boot and brings in a running `exim4`, for nothing the
  alert reads. **Reverses if** DigitalOcean's alerts come to need data only the agent provides.
- **The agent from a downloaded `.deb`.** It fails property 9: nothing patches it.
- **A counter on the machine from Debian's archive, mailing the maintainer.** It fails property 3:
  when the counter or its mail relay stops, nothing says so. **Reverses if** DigitalOcean stops
  offering bandwidth alerts.
- **A counter on the machine reporting to an outside heartbeat service.** Its case is strong: Debian
  packages only, documented throughout, and a stopped ping is reported. It ties with the chosen option
  on properties 1 and 3 and fails property 2: root on the machine can keep sending pings that say
  all is well, where nothing on the machine can touch DigitalOcean's figures. **Reverses if**
  DigitalOcean's alert on an agentless Droplet is found not to fire.
- **Prometheus's node exporter with an alerting stack on the machine.** It fails property 3: the
  alerting runs on the machine it watches.
- **A scheduled job off the machine reading DigitalOcean's bandwidth API.** Its case is the strongest:
  it would notice DigitalOcean's figures stopping, which the chosen option cannot. It fails property
  21: it puts DigitalOcean, a scheduler and a third service to report the scheduler's silence on the
  path, where the chosen option has DigitalOcean alone. GitHub's scheduler, the one to hand, turns a
  public repository's schedules off after 60 days with no activity. **Reverses if** DigitalOcean's
  alert on an agentless Droplet is found to stop firing.
- **DigitalOcean's default bandwidth graph, with nobody alerted.** It fails property 1.
- **Not yet.** M1 slice 4 puts a billable machine on the internet, and
  [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) has no traffic
  report without this.

## Risk

- **It rests on behaviour DigitalOcean does not document.** The API accepts a policy on a Droplet
  without the agent, and the policy fires, but DigitalOcean's docs say alerts need the agent. If it
  starts refusing such a policy, the setup step fails, loudly. If it stops evaluating one, nothing
  says so until M11's check exists.
- **An email arrives over an hour after traffic starts.** The figure takes about 10 minutes to reach
  the true rate, the window is one hour and delivery took about 6 minutes, so about 76 minutes at
  roughly $8 an hour at the 2 Gbps limit, inside
  [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)'s reasoning.
- **One provider detects and bills.** An outage in DigitalOcean's monitoring is an outage in the only
  traffic report.
- **The control panel cannot show or edit the policy's Droplet** the way it shows an agent's, so it is
  read and changed with `doctl`.

## Revisit when

- DigitalOcean refuses a bandwidth policy on a Droplet without the agent, or one stops firing.
- DigitalOcean documents alerts on Droplets without the agent.
- [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) is superseded.
- The system grows past one Droplet.

## Also update

- [x] questions/README.md: slice 4 loses its **Must answer** on the metrics agent and gains this
      record as a **Given**
- [x] questions/how-is-digitaloceans-metrics-agent-installed-and-kept-updated.md: mined, committed,
      then deleted
- [x] questions/is-node-installed-on-the-host-or-carried-in-each-release.md: the shared properties
      move into it, since the file it points at is deleted
- [x] questions/what-are-the-servers-vitals-and-who-watches-them.md: its finding that production runs
      the agent is corrected
- [x] questions/how-is-the-server-operated.md: a check that the traffic alert still fires
- [x] [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md): the measured
      delivery time replaces "not documented"
- [x] [ADR-0056](0056-the-droplet-runs-without-digitaloceans-droplet-agent.md): its Forced by no
      longer says the traffic alert needs the metrics agent
- [x] [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md): its Enforced by no longer says
      DigitalOcean's alerts read the metrics agent
- [x] unfinished.md: the metrics agent is no longer listed as open or as a step not yet taken
- [x] constraints.md: "Hosting — DigitalOcean's metrics agent", with the spike's method and findings
- [x] failure-modes/: the traffic alert stops being evaluated and nobody knows
- [x] runbooks/set-up-the-hosting-account.md: steps 9 and 10
- [x] architecture.md: nothing; no boundary changes
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing; no local setup
