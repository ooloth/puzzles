---
opened: 2026-09-03
status: open
resolves_into: decision
---

# How is the server reached and hardened?

## Why it matters

**[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) put the last copy of a
player's work on a machine we operate.** Reaching that machine, and stopping anyone else from
reaching it, is now our problem rather than a vendor's.

**Access is needed to check a change, not only to survive an incident.** A restore drill, a look at a
log, confirming what actually shipped, running an integrity check by hand — all of it needs a way
onto the box. That is why this sits with creating the machine, at slice 4 of M1, rather than with
the questions about surviving failure: the machine is on the public internet from that slice.

**The hardening half is small and unskippable.** A machine on the public internet with a weak
configuration is compromised by scanners rather than by anyone interested in this project. The
baseline is well known and the cost of it is an afternoon, which is exactly the shape of task that
gets deferred indefinitely because it never feels urgent.

**And there is a trap specific to being one person.** Locking yourself out of a machine you alone can
reach is unrecoverable in a way that has nothing to do with attackers.
[../brainstorming/](../brainstorming/) contains lockout-recovery routes for a VPS of this shape,
which suggests somebody had already thought about it and that it is worth keeping. They are written
for RackNerd and Hetzner rather than DigitalOcean, so none of them is known to apply here.

## What would settle it

Deciding how a person and an automated deploy each get onto the machine, and what the baseline
configuration is. What any answer has to cover:

- **How a human reaches it** — keys, what holds them, and what happens when they are lost.
- **How a deploy reaches it**, which is a different credential with a different lifetime and is where
  [how do secrets reach the running system?](how-do-secrets-reach-the-running-system.md) meets this.
- **The baseline**: what is exposed, what is not, and what watches for the obvious. Whether updates
  apply themselves is settled: they install daily at one hour, per
  [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
  from the sources [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
  allows.
- **The lockout route**, because it is the failure with no remote fix.

**The host supplies none of it.**
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on a bare
DigitalOcean Droplet, which gives neither a baseline nor access through tooling of its own. So all
four items above are ours, and the question is fully scoped.

## Properties the answer is scored against

Derived on 2026-10-05, before any option was researched. Three other questions share moments with
this one, and score against this list as well as their own when they are worked:
[what deploys the code?](what-deploys-the-code.md) shares a deploy logging in;
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md) shares a
deploy starting and stopping units; and
[is Node installed on the host or carried in each release?](is-node-installed-on-the-host-or-carried-in-each-release.md)
shares software being installed and patched. Whether any of them is an input to this one is read off
the scored grid, not from this list.

The moments are: the Droplet created from `debian-13-x64` with cloud-init by the maintainer holding
a short-lived token, on the public internet from its first boot; scanners probing every port of its
address from then on; the maintainer opening a shell from their Mac to read a log, confirm what
shipped or run a check by hand; the maintainer needing in from another machine, or after the Mac is
lost or replaced; a deploy logging in, writing a release and starting and stopping units; a change
to SSH or the firewall that locks every network route out; the daily update installing a new OpenSSH
or kernel and the machine rebooting at the hour; the app compromised through a request and running
code as its own user; a credential leaking; the machine rebuilt from nothing, including the move to
Debian 14 before mid-2030; the production-like local run booting the same image and cloud-init; the
maintainer coming back after months away and needing in during an incident; and logs accumulating.

**Ways a bad answer fails.** *Safety:* someone else gets a shell; the machine is exposed with a
default or weaker configuration for some window after it boots; a lockout leaves no way back; a
leaked credential keeps working and nobody knows; a compromised app reaches root, other units or a
secret; a rebuilt or local machine is silently less hardened than the live one; the disk fills; a
compromised machine sends traffic that bills. *Performance:* a defence holds memory the app needs on
a machine with no swap; the reboot that every kernel fix needs gets longer. *Experience:* getting in
takes steps or knowledge the maintainer has to remember; the way back after a lockout is unknown or
untried when it is needed; access works only from one device; the configuration is spread across
places that drift.

**Safety**

1. Nobody but the maintainer, and a deploy acting for them, can open a shell or run a command on the
   machine. It holds the last copy of a player's work, per
   [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) and
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md),
   and the portable security standard requires authentication at every protected boundary.
2. No route in can be opened by guessing a password or using a default, at any instant from first
   boot onward, including before cloud-init has finished. A compromised machine's traffic bills at
   $0.01 per GiB, and [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
   prevents illegitimate spending rather than stopping it.
3. From the internet, only the ports the system needs accept connections: 80 and 443 for Caddy,
   which fronts the app per [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md),
   and whatever route in the answer keeps. The app's own port is not reachable from outside.
4. A lockout from every network route has a way back that does not need the network route. Either
   it recovers the machine in place, or it rebuilds it without losing the store, which
   [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md)'s property 5 and
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
   require of a lost machine anyway.
5. A credential that leaks reaches only what its holder needs, and can be revoked without revoking
   the others. A deploy's credential cannot do everything the maintainer's can. From least privilege
   in the portable security standard, and what a credential reaches is every player's work, per
   [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md).
6. Code running as the app's user reaches neither root, nor another unit, nor a secret on the
   machine. [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)
   already sandboxes the unit with `ProtectSystem=strict` and write access only to the store's
   directory, so this row scores only what the answer adds or removes.
7. Every login, successful or refused, leaves a record on the machine that the maintainer can read
   afterwards. From the portable decision-making standard's maximum safety, a system that cannot go
   wrong without noticing. Being *told* of a login is deferred, below.
8. A rebuilt machine and the production-like local run carry the same access configuration as the
   live machine, from the same cloud-init, with no step by hand. Per
   [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), which boots the same cloud-init
   locally,
   [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
   and [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
   whose configuration the local run also carries.
9. Nothing this answer configures can fill the disk. A full disk fails the store's writes, per
   [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md).
10. Nothing this answer adds needs a standing DigitalOcean token that can create resources, per
    [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md). A
    recovery route that needs one fails this row.

**Performance**

11. Nothing added for defence holds memory the app needs. The machine has 961 MB and no swap, and
    the app peaked at 373 MB, per
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) and
    [../constraints.md](../constraints.md).
12. Nothing added lengthens the reboot after a kernel fix by more than seconds. Each such reboot is
    an outage, and [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md) chose Debian 13 partly
    for its 18-second reboot.

**Experience**

13. The maintainer reaches the machine with one command from any machine they work on, knowing
    nothing beyond its name. From the portable decision-making standard's maximum experience, and the
    maintainer's stated aims for hosting in
    [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md): "it just works" and
    "it's so easy".
14. The way back after a lockout is written down where the maintainer will look, and has been run
    at least once, so it can be followed after months away. Per [../problem.md](../problem.md),
    which expects years of active attention, and this question's own **Resolves into**.
15. The access configuration lives in one place in the repository, and changing it is one edit that
    the local run rehearses before it reaches the Droplet. Per
    [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
    and [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md).
16. Hosting stays near $10 a month and under $20, per
    [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md).
    Anything paid for here counts against it.

**Checked and already owed elsewhere.** The DigitalOcean account can reset, rebuild, open a console
on or destroy the machine, so its sign-in is a route onto the machine. That it resists takeover is
property 3 of [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md),
kept by [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md). No
candidate here buys it, so it separates none.

**Deferred.** Being alerted to a login, a refused login or a failed check belongs to
[how is the server operated?](how-is-the-server-operated.md) at M11, where alerting on a failed update
is already placed by
[a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md).
Property 7 keeps the record that alerting would read. Secrets the running app holds arrive at M12
with [how do secrets reach the running system?](how-do-secrets-reach-the-running-system.md); M1 has
none.

**Resources.** Memory binds, in property 11. Storage binds through logs, in property 9. CPU does not
bind: refusing or rejecting scanners' connections is small work next to serving the app's own
requests. That is reasoned, not measured. Network does not bind as
a cost: a login is one connection. A deploy driven from the Mac over the internet has not been
measured, per [how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md),
and is measured when this is worked, not used as a property.

**Maximums.** *Safety:* only the maintainer and a weaker deploy credential can get in. No credential
works if it is copied off the device that holds it. Every login is recorded. Losing any one device or
credential still leaves a way in, and the lost one is revoked in one step. There is no instant when
the machine runs a weaker configuration than the one in the repository. *Performance:* defence costs
the app no memory and the reboot no time. *Experience:* one command from any of the maintainer's
machines, a way back that has been rehearsed, and nothing to do on a schedule.

**Added in the first pass, 2026-10-05**

Property 1 is split into the conditions it stands for, because the credential candidates all pass it
as first written:

- **1a.** Something running as the maintainer on the Mac cannot take the credential off it. Reworded
  on 2026-10-05 from "a copy of any file on the Mac's disk does not give a shell", which a key file
  with a strong passphrase kept nowhere passes, while the setup people actually run, with the
  passphrase in the Keychain or an agent, does not.
- **1b.** Whoever holds an unlocked session or the account a credential lives in cannot export it.
  Found on 2026-10-05 to separate no candidate, in the third pass below.
- **1c.** No account beyond the DigitalOcean account can grant a shell when it is taken over. The
  DigitalOcean account can already do so through the recovery ISO, so it adds nothing.

And two properties from moments the first list did not cover:

17. *Safety.* Getting back in after a lockout does not stop the app. While the machine is down nobody
    starts a puzzle they have not already got, per
    [nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md) and "Where
    a player waits" in [../problem.md](../problem.md). A lockout from SSH leaves the app serving, so
    only the way back can take it down.
18. *Safety.* The machine's host key is known to the person or deploy connecting before they trust
    it, including after a rebuild, which gives the machine a new host key. From the portable security
    standard's authentication rule, applied in the other direction. A research agent raised it on
    2026-10-05. It bears mostly on deploys, and is scored with
    [what deploys the code?](what-deploys-the-code.md).

## Resolves into

A decision record in [../decisions/](../decisions/), and content in
[../../CONTRIBUTING.md](../../CONTRIBUTING.md) about how to get onto the machine and what to look at.

## Source

Split from [how is the server operated?](how-is-the-server-operated.md) on 2026-09-03. That question
covered access, hardening, restarting, patching and noticing an outage as one thing, and sat at M16 on
the assumption that a managed platform would supply most of it.
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) removed that
assumption, and [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) put the
server on a bare Droplet.
The half about reaching the machine is needed to check a change; the half about surviving one is not,
and stays where it was.

## Options

Enumerated on 2026-10-05 by a research agent asked for the whole field, plus the candidates already
here. The question splits into parts a reasonable person could answer differently, so each part
lists its own options. How many records the answer becomes is decided once it is scored.

**A. What the maintainer's credential is.** A key file in `~/.ssh` on the Mac. A key held by
1Password's SSH agent. An SSH certificate from a CA the maintainer holds. A key bound to the Mac's
Secure Enclave, for example through the Secretive app. A FIDO key (`ed25519-sk`) on a hardware
authenticator the maintainer would have to buy. Tailscale SSH, where Tailscale's identity provider
login replaces the key.

**B. What the internet can reach.** `sshd` on port 22 open to everyone, with key-only login and
DigitalOcean's Cloud Firewall admitting only 22, 80 and 443. The same, with fail2ban or sshguard
added. Port 22 admitted only from the maintainer's current address. Port 22 closed to the internet,
with SSH reached through a tunnel: Tailscale, plain WireGuard, or Cloudflare Tunnel with Access. A
non-standard port.

**C. The way back after a lockout.** Boot the recovery ISO from the control panel. Reset the root
password from the control panel and log in on the Recovery Console. Keep a local password, held in
1Password, for the Recovery Console. Rebuild the machine from cloud-init. Keep a second, independent
network route. A snapshot taken in advance.

**D. Which account the maintainer logs in as.** `root` directly. A named user with `sudo` and no
password. A named user whose `sudo` asks for a password.

**E. Whether DigitalOcean's Droplet agent stays on the machine.** Kept, which gives the Droplet
Console. Removed, or never installed.

**F. The deploy's credential.** The maintainer's own login while deploys are by hand, or a separate
key restricted with `authorized_keys` options and limited `sudo` or polkit rules. This part is
shared with [what deploys the code?](what-deploys-the-code.md).

*Not yet* is not an option for A to D: the Droplet is on the internet from slice 4.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The operational inventory this inherits is long and was written down once already.** A volume and
its failure mode, a process manager, boot persistence, a reverse proxy, TLS issuance and renewal,
firewall and SSH hardening, unattended security updates, log rotation before a disk fills, external
uptime monitoring because a machine cannot watch itself, and an alerting channel. Roughly half of that
list belongs to this question and half to
[how is the server operated?](how-is-the-server-operated.md).

**No single item on it is hard, and the list is long enough that something falls off.** The same
inventory omitted any backup or restore procedure for the data, which is the shape of the risk here.

*Reasoned — from [../brainstorming/](../brainstorming/), which is non-authoritative and cited for what
it enumerates rather than for anything it concludes.*

*Mined 2026-09-30 from where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) as it was at commit `11ac964`. These are observations for this question to weigh, not answers.*

**On the Droplet [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md)
chose, running the systemd services of
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md):**

- **DigitalOcean's Cloud Firewall** is "a network-based, stateful firewall service for Droplets
  provided at no additional cost. Cloud firewalls block all traffic that isn't expressly permitted by
  a rule." It is separate from any firewall on the machine, such as ufw. *Sourced: the first two
  sentences read from the raw HTML of
  [the firewalls page](https://docs.digitalocean.com/products/networking/firewalls/), 2026-10-05.
  That it is separate from ufw came from a research agent reading
  [configure rules](https://docs.digitalocean.com/products/networking/firewalls/how-to/configure-rules/)
  through a summariser on 2026-10-05; that page was not opened directly.*
- **Automatic updates skip third-party repositories.** "Just adding another package repository to an
  Ubuntu system WILL NOT make `unattended-upgrades` consider it for updates!" Debian 13, the OS per
  [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), uses the same `unattended-upgrades`. So Caddy's repository,
  or NodeSource's if Node comes from it, is patched automatically only once its origin is added.
  *Sourced —
  [automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/), read by an
  agent. That source is Ubuntu's. Debian's [wiki page](https://wiki.debian.org/UnattendedUpgrades),
  read by an agent on 2026-10-05, says only that "the default configuration auto-installs security
  updates" and that more origins are enabled in `Unattended-Upgrade::Origins-Pattern`. It does not
  mention third-party repositories, and Debian's default `50unattended-upgrades` could not be
  fetched, so the claim is not re-established for Debian.*
- **Live kernel patching does not apply.** Livepatch is Ubuntu's, and the Droplet runs Debian 13 per
  [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), so kernel fixes take a reboot. When
  that happens is set by [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
  *A research agent on 2026-10-05 found a Debian intent-to-package for live patching,
  [bug 1070494](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=1070494), from May 2024 and still
  described as a prototype, but read it only through a search summary.*
- **A fresh Droplet has no swap**, per [../constraints.md](../constraints.md), where it was measured
  with `swapon --show` on a real Droplet. The spike capped the
  app with `MemoryMax` and hardened its unit with `NoNewPrivileges`, `ProtectSystem=strict`,
  `ReadWritePaths` and `PrivateTmp`. The unit is in the question's twelfth pass.
- **journald keeps logs until its own cap**, so `SystemMaxUse` bounds their disk use. A full disk
  fails the store's writes. *Reasoned.* Unset, the cap is a share of the disk: "The first pair
  defaults to 10% and the second to 15% of the size of the respective file system, but each of the
  calculated default values is capped to 4G." *Sourced: Debian trixie's
  [journald.conf(5)](https://manpages.debian.org/trixie/systemd/journald.conf.5.en.html), read by a
  research agent on 2026-10-05.*
- **Deploy tools default to SSH as root.** Kamal does, which is moot with no Kamal. A non-root user in
  a group that controls the services is still close to root. *Sourced from Kamal's
  [ssh docs](https://kamal-deploy.org/docs/configuration/ssh/) by an agent.*
- **A compromised Droplet can run up a bill through the traffic it sends out.** "Additional outbound
  transfer is billed at $0.01 per GiB", pooled across the team's Droplets. *Sourced:
  [Droplet pricing](https://docs.digitalocean.com/products/droplets/details/pricing/), read by a
  research agent on 2026-10-05.*
  [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
  reports traffic rather than cutting it, so hardening is what keeps this cause from starting. This
  entry used to say a compromised Droplet is the *most-reported* cause of a surprise bill. A research
  agent looked for a source on 2026-10-05 and found only anecdotes, so that ranking was found
  unsourced and removed.
- **Illegitimate traffic is shed without taking the site down by limiting it per client at the
  front**, not by cutting outbound traffic, which
  [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) rejects because it stops the site.
  *Reasoned, 2026-09-30.*
- **A Droplet's metadata service lists no DigitalOcean API token**, so root on the machine does not by
  itself give API access, though it does read `user-data` and any secret put there. *Agent's reading
  of [metadata](https://docs.digitalocean.com/products/droplets/how-to/retrieve-droplet-metadata/),
  2026-09-30; not opened.* A second agent read the page on 2026-10-05 and confirmed that `user-data`
  is among the paths served at `169.254.169.254`. The page says nothing about tokens either way, so
  the claim that no token is listed is still *Unverified*.

*The three entries above moved here 2026-09-30 from the hosting-account question.*

**The maintainer works from one machine, a MacBook Air, uses 1Password, and has no hardware security
key.** So "any machine they work on" in property 13 is one machine today, and losing it is the case
property 4 has to survive.

*Stated by the maintainer, 2026-10-05.*

**DigitalOcean has two browser consoles, and only one of them works when SSH does not.** The Droplet
Console "connects to Droplets using the network, like other SSH-based clients", and it fetches keys
from `169.254.169.254`, so it fails where SSH or outbound traffic to that address is blocked. The
Recovery Console "is available even if a Droplet has lost network access or the sshd process has
failed", but "it requires password authentication on the Droplet". So a machine with no password
set for any user has no console route back after a lockout.

*Sourced: read from the raw HTML of
[connect with console](https://docs.digitalocean.com/products/droplets/how-to/connect-with-console/),
2026-10-05.*

### First pass, 2026-10-05

Five research agents worked the field and the properties on 2026-10-05. Quotes marked *opened* were
read from the raw page by me; the rest are an agent's reading. Nothing below was run on a Droplet.

**What the sources establish**

- **The recovery ISO needs no password set on the Droplet.** It boots a rescue system, mounts the
  disk under `/mnt` and offers a shell and a chroot. "Root Password has randomly been set to:" is
  shown on the console, and "Any SSH keys added to the Droplet at the time it was created are
  automatically imported into the recovery ISO." It is started from the control panel by powering
  the Droplet down. *Opened:
  [recovery ISO](https://docs.digitalocean.com/products/droplets/how-to/recovery/recovery-iso/).*
- **Resetting the root password from the control panel emails a temporary password**, which must be
  changed at first login: "You will receive an email containing the Droplet's temporary password."
  It does not turn on password login over SSH. Whether it power-cycles the Droplet is not documented.
  *Opened:
  [Recovery Console](https://docs.digitalocean.com/products/droplets/how-to/recovery/recovery-console/);
  the SSH point is an agent's reading of
  [lost SSH key](https://docs.digitalocean.com/support/i-lost-the-ssh-key-for-my-droplet/).*
- **The Droplet Console is not a way back.** It needs `sshd` running and reachable through every
  firewall. *Agent's reading of
  [connect with console](https://docs.digitalocean.com/products/droplets/how-to/connect-with-console/).*
- **The Droplet agent is installed by default, runs as root, edits `authorized_keys` from the
  account's keys, and is built only for amd64.** "You cannot currently opt out of installing the
  Droplet agent when creating a Droplet using the control panel"; the API takes
  `"with_droplet_agent":false`. Its README: "The only supported GOARCH is `amd64`", so the arm64
  local run cannot carry it. *Opened:
  [manage agent](https://docs.digitalocean.com/products/droplets/how-to/manage-agent/) and the
  [agent README](https://github.com/digitalocean/droplet-agent). That it runs as root and edits
  `authorized_keys` is an agent's reading of its unit file and changelog.*
- **1Password's agent keeps the key off disk, and the key can still be exported.** "Your private
  keys never leave 1Password, are never stored locally, and are never used without your consent",
  and "You can export a private SSH key from 1Password at any time." *Opened:
  [agent security](https://developer.1password.com/docs/ssh/agent/security/) and
  [manage keys](https://developer.1password.com/docs/ssh/manage-keys/).*
- **OpenSSH on Debian 13 throttles failed logins by itself.** "Penalties are enabled by default"
  (`PerSourcePenalties`), refusing a source for a period after repeated failures. *Opened: Debian
  trixie's [sshd_config(5)](https://manpages.debian.org/trixie/openssh-server/sshd_config.5.en.html).*
- **Debian 13 removed `last`, `lastb` and `lastlog`.** "The util-linux package no longer provides
  the last or lastb commands." Logins are recorded in the journal; an agent read Debian's systemd
  package as making the journal persistent on new installs, not checked on DigitalOcean's image.
  *Opened: [trixie release notes, 5.1.9](https://www.debian.org/releases/trixie/release-notes/issues.html).*
- **Tailscale SSH leaves `sshd` alone, and an auth key expires within 90 days.** "Your SSH
  configuration … will not be modified, which means that other SSH connections to the same host,
  not made over Tailscale, will still work." "You can choose the number of days, between 1 and 90
  inclusive." *Opened: [Tailscale SSH](https://tailscale.com/kb/1193/tailscale-ssh) and
  [auth keys](https://tailscale.com/kb/1085/auth-keys).*
- **Anything in cloud-init user-data is readable by every process on the machine**, from
  `169.254.169.254`, with no authentication described. systemd's `IPAddressDeny=link-local` on a
  unit is documented to block that. *Agent's reading of DigitalOcean's metadata reference and
  systemd.resource-control(5); not run.*
- **A stock Debian 13 `sshd` allows password login**; DigitalOcean's image turns it off through a
  cloud-init drop-in, `50-cloud-init.conf`. *Agent's reading of Debian's `sshd_config` and
  DigitalOcean's lost-key page.*

**Unknowns that only a Droplet can settle:** whether `sshd` listens before cloud-init writes its
drop-in, and whether any account has a password at that moment; whether a rebuild re-runs the
original user-data, which only a 2019 community comment says; which datasource and vendor-data
`debian-13-x64` uses; whether the journal is persistent there; and the memory any added daemon
holds. Reported figures for `tailscaled` range from about 40 to 117 MB and for fail2ban up to
400 MB, none with a method.

**Scores.** One property named per rejection.

- **A.** *Key file on disk* fails 1a: anything running as the maintainer reads the file, and uses
  the passphrase wherever the Keychain or an agent holds it. *A user certificate* is not an
  alternative to the others but a layer on one of them, since the CA's private key has to be held
  as a file, in 1Password or in the Secure Enclave and takes that option's verdicts. With one person
  and one machine it adds nothing any property rewards, and fails 15 on the configuration it adds.
  *Host* certificates are a different thing and stay open: a CA that signs the machine's host key
  lets a rebuilt machine be trusted without a changed-key warning, which is property 18.
  *Tailscale SSH* fails 1c: taking over the Tailscale account, or the identity provider behind it,
  grants a shell. It was first rejected on 8, because a rebuild needs a new auth key made by hand,
  but creating a Droplet already needs a token made by hand under
  [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md), so
  that step adds little. *1Password's agent*, *a Secure Enclave key* and *a FIDO key* survive. 1Password fails 1b, where the other two pass, but the Secure Enclave and FIDO rows
  are unverified for 13 and for property 4 on losing the Mac, so this part cannot finish yet.
- **B.** *fail2ban or sshguard* fails 11: it adds a resident process for throttling `sshd` already
  does. *A non-standard port* fails 15: it is one more setting and changes no other row. *Port 22
  from the maintainer's address only* fails 13: each change of address is an edit in the control
  panel before logging in. *A tunnel* fails 1c: the tunnel's own account, Tailscale's identity
  provider or Cloudflare, can grant a shell. *Port 22 open, key-only, behind the Cloud Firewall*
  survives.
- **C.** *Rebuilding* fails 17: it replaces the machine. *A second network route* fails 1c for the
  same reason as a tunnel. The recovery ISO fails 17 as well, since it powers the machine down, but
  it is the only route that works when the disk is full or PAM is broken, so it stays as the
  fallback rather than the route. *Resetting the root password* and *a kept console password*
  survive. If the reset does not power-cycle the machine, the reset needs no secret kept anywhere.
  That is the spike.
- **D.** Not scored yet. A password asked by `sudo` would also be the console password in C.
- **E.** *Kept* fails 8: the local run is arm64 and cannot carry it. *Removed* survives.
- **F.** Not scored here. While the maintainer deploys by hand there is no second credential, and
  [what deploys the code?](what-deploys-the-code.md) scores the rest.

**No unsettled question changes any verdict above**, on this reading: a deploy from a hosted runner
reaches port 22 with a restricted key, whatever F decides, so F is not an input to A to E.

### Second pass on part A, 2026-10-05

A research agent read the three surviving credentials' sources and the man pages on the maintainer's
Mac, which runs macOS 26.6.2 with Apple's OpenSSH 10.3p1.

- **A Secure Enclave key cannot be exported or backed up.** Secretive's README: "If you protect your
  keys with the Secure Enclave, it's impossible to export them, by design", and "they are not able to
  be backed up, and you will not be able to transfer them to a new machine." Its keys are
  `ecdsa-sha2-nistp256`, which `sshd` accepts as shipped. It can require Touch ID or the login
  password for each use. It is free, maintained by one person, last released 2026-09-21, and runs its
  own agent. *Opened: the [README](https://github.com/maxgoedjen/secretive). The rest is the agent's
  reading of its source and releases.* Apple also ships an `sc_auth` command that creates
  non-exportable Secure Enclave identities and an `ssh-keychain.dylib` that may expose them to `ssh`,
  but no Apple document describes that use and it was not tried.
- **1Password's agent supports only Ed25519 and RSA keys**, and has no non-exportable option.
  *Opened: [1Password SSH agent](https://developer.1password.com/docs/ssh/agent/).* Restoring it on
  a new Mac needs the account password and the Secret Key. *An agent's reading of 1Password support.*
- **A FIDO key needs hardware and a second `ssh`.** Apple's `ssh` has no built-in USB support for
  FIDO: `ssh-keygen -t ed25519-sk` printed `No FIDO SecurityKeyProvider specified` on the Mac, so it
  needs Homebrew's OpenSSH ahead of Apple's in `PATH`. Yubico lists its FIDO-only Security Key
  "From $29 USD". Each use needs a touch. *Observed on the Mac and read from yubico.com by the agent.*
- **Two credentials in two agents** need `IdentityFile` and `IdentitiesOnly` per host, since `sshd`
  allows six attempts by default. *Agent's reading of `ssh_config(5)` and 1Password's docs.*

**Scores.** *1Password's agent* fails 1b. *A Secure Enclave key* and *a FIDO key* both pass 1a, 1b,
1c and 4. They differ on two moments, and neither difference fails a property outright. A Secure
Enclave key is lost with the Mac, so replacing the Mac goes through the way back in part C before a
new key can be added. A FIDO key survives the Mac, and costs $29 or more, a second `ssh`, and a
device to carry. Property 16 covers monthly hosting, not a one-off purchase, so nothing on the list
yet weighs that cost. **Two candidates remain.** What would separate them is the maintainer's view of
buying and carrying a key, which enters as a cited row once stated. Holding both, one as the backup,
is a third arrangement that passes every row at the FIDO key's cost.

### Third pass on part A, 2026-10-05

**The maintainer objected to 1Password's rejection**: someone with access to their 1Password has
bigger problems than this machine. The repository bears that out.
[../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md) signs into
DigitalOcean through GitHub, whose passkey and recovery codes are both held in 1Password, a choice
the maintainer made on 2026-09-30. Whoever has the 1Password account therefore has the DigitalOcean
account, and through the recovery ISO a root shell. So 1Password is already part of this machine's
root of trust, and a key held there adds no account to 1c.

**1b separates nothing, for a second reason.** One use of any credential that opens a shell can add
a key to `authorized_keys`. So a credential that cannot be exported but is used once by the wrong
person is as bad as one exported. 1b holds for the Secure Enclave and FIDO keys and fails for
1Password, and the difference it records is not one the machine can feel. *Reasoned.*

**Scores.** All three pass 1a, 1c and 4.

- *A Secure Enclave key* fails 13 on a moment the first pass did not split out: on a new Mac it does
  not work, and getting in again goes through the way back in part C before a new key can be added.
  1Password's key is on the new Mac once the account is signed in.
- *A FIDO key* ties with 1Password on every technical row. It would cost $29 or more, a second
  `ssh` ahead of Apple's in `PATH`, and a device to carry. Those are costs, so they enter only as a
  view the maintainer states, and on 2026-10-05 the maintainer confirmed they prefer not to buy and
  carry a hardware key. That is the row it fails.
- *1Password's agent* remains.

**Reversed if** 1Password stops holding the DigitalOcean sign-in, since 1c would then count it as a
second account that can grant a shell; or if the maintainer decides to buy and carry a FIDO key,
which would enter as a stated row.
