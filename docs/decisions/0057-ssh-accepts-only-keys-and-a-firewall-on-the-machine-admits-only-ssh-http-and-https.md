---
number: 0057
status: accepted
date: 2026-10-05
---

# 0057 — SSH accepts only keys, and a firewall on the machine admits only SSH, HTTP and HTTPS

## Forced by

- [../constraints.md](../constraints.md), "Hosting — getting back onto a Droplet when SSH fails, and
  what DigitalOcean's image brings": DigitalOcean blocks mail ports on every Droplet, limits
  outbound to 2 Gbps, and keeps its Cloud Firewall separate from any firewall on the machine.
- [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md): a bare Droplet on the public
  internet from M1 slice 4, scanned by everyone rather than by anyone interested in this project.
- [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md): Caddy answers HTTP and HTTPS,
  including HTTP/3, and sends `/api/` to the app, so the app's own port is never reached from
  outside.
- [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md): illegitimate
  spending is prevented rather than stopped, and a compromised machine's outbound traffic is what
  costs money.
- [ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
  and [ADR-0049](0049-the-droplet-runs-debian-13.md): the production-like local run boots the same
  cloud-init, so it can rehearse what cloud-init writes.

## Scored against

Derived from the moments the internet touches the machine: scanners probing every port from first
boot; a browser's request over HTTP, HTTPS and HTTP/3; the maintainer's and a deploy's SSH; the
machine reaching out for updates, certificates and metrics; a mistaken rule; root taken over; a
rebuild; and the local run.

1. From the internet, only SSH and Caddy's ports accept connections
   ([ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)).
2. No route in can be opened by guessing a password, at any instant from first boot
   ([ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)).
3. The rules live in the repository's setup, run unchanged on a rebuilt machine and in the local
   run, and are rehearsed there before they reach the Droplet
   ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
   [ADR-0049](0049-the-droplet-runs-debian-13.md)).
4. Nothing added holds memory the app needs on a machine with no swap
   ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md),
   [../constraints.md](../constraints.md)).
5. A program that later needs to reach something new is not silently refused
   ([a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md)).
6. No account beyond DigitalOcean's can grant a shell when taken over (the portable security
   standard's authentication rule).
7. The maintainer reaches the machine without knowing or updating anything about where they are
   (the maintainer's "it just works" in [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)).
8. The least to configure and keep working
   ([ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)'s property 13).

Also scored and found to separate nothing: a rule that holds even when root on the machine is taken
over. Outbound stays open under property 5, and inbound rules protect nothing from whoever already
has root.

**Resources.** Memory binds as property 4. CPU does not bind: refusing scanners' connections is small
next to serving the app, reasoned rather than measured. Network does not bind as a cost.

## Decision

**`sshd` accepts keys only, with OpenSSH's own throttling of failed logins left on. An `nftables`
ruleset written by cloud-init admits, from the internet, TCP 22, 80 and 443 and UDP 443, plus ICMP
and ICMPv6, and drops everything else. Outbound traffic is not filtered. DigitalOcean's Cloud
Firewall is not used.**

Observed on a Droplet on 2026-10-05: `sshd` offered only `publickey` from the first moment it
answered, a password login was refused with `Permission denied (publickey)`, and
`PerSourcePenalties` dropped a probe that kept connecting without authenticating.

- **Why a firewall on the machine rather than DigitalOcean's.** The Cloud Firewall's rules live in
  DigitalOcean, so the local run cannot rehearse them, and a mistaken rule, one that closed 443 say,
  would show itself first on the live machine. Its one advantage, that root on the machine cannot
  change it, protects nothing once outbound is open.
- **Why outbound is open.** DigitalOcean already blocks mail ports on every Droplet, and HTTPS must
  stay open, so limiting outbound to the ports in use would leave a compromised machine free to send
  at the full 2 Gbps while refusing, with nothing reporting it, whatever later needs another port.
  The traffic itself is reported by
  [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)'s alert.
- **ICMP and ICMPv6** are admitted because path MTU discovery, and IPv6's neighbour discovery if the
  Droplet has an IPv6 address, depend on them. *Reasoned.*

The working is in
how is the server reached and hardened? (read with `git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`).

**What it commits us to:** `nftables` installed from Debian's archive, which
[ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
allows, with its ruleset in the repository's cloud-init. Whether the image already ships it was not
checked. The no-password setting itself is written by
[ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md)'s
drop-in.

**What this does not settle:**

- **Whether `root` can log in over SSH.** That is
  [ADR-0058](0058-root-does-not-log-in-over-ssh.md).
- **Limiting requests per client at the front**, which belongs to Caddy's configuration and to
  [how is the server operated?](../questions/how-is-the-server-operated.md).

## Enforced by

**Nothing yet.** It is true once M1 slice 4's cloud-init writes the ruleset. What would check it is a
scan of the machine's address from outside, in the local run and against the Droplet, that finds only
those ports open. It does not exist.

## Rejected

- **DigitalOcean's Cloud Firewall alone** fails property 3: its rules live outside the repository and
  the local run cannot rehearse them. **Reverses if** a second machine joins this one, where rules
  applied by tag cost less than rulesets on each.
- **Both firewalls** fail property 8: two sets of rules, which DigitalOcean's own docs say must be
  kept from conflicting, for no row that the second set improves. **Reverses if** a rule that root
  cannot change comes to matter, for example once outbound is limited.
- **SSH admitted only from the maintainer's address** fails property 7: each change of address is an
  edit before logging in. **Reverses if** the maintainer works from a fixed address.
- **SSH reached only through a tunnel** (Tailscale, WireGuard, Cloudflare) fails property 6: the
  tunnel's account can grant a shell. **Reverses if** that account is accepted as part of the root of
  trust.
- **fail2ban or sshguard** fails property 4: a resident process doing what `sshd`'s own throttling
  already does. That `sshd` throttles was observed once; that fail2ban's memory would matter is
  reasoned, since it was not measured. **Reverses if** `sshd`'s throttling proves insufficient in the journal.
- **SSH on a non-standard port** fails property 8: one more setting that changes no other row.
  **Reverses if** scanner noise in the journal starts to matter.
- **Outbound limited to the ports the machine uses** fails property 5. **Reverses if** outbound abuse
  on another port is observed, or the machine's outbound needs become fixed and known.
- **Not yet** — the Droplet is on the public internet from slice 4.

## Risk

- **A mistaken rule closes 80 and 443 as well as SSH**, and the way back is the Recovery Console,
  per [ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md).
- **`sshd` is exposed to the whole internet.** A flaw that needs no login is reachable until the daily
  update applies its fix, per
  [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
- **The local run rehearses our settings, not DigitalOcean's.** It boots Debian's own cloud image,
  per [ADR-0049](0049-the-droplet-runs-debian-13.md), which has none of DigitalOcean's vendor-data, so it
  shows that what we write works, not that it overrides what DigitalOcean's image adds, per
  [../constraints.md](../constraints.md), "Hosting — getting back onto a Droplet when SSH fails, and what DigitalOcean's image brings".
- **Root, once taken, can rewrite the rules.** Accepted, since nothing outside the machine would be
  protecting anything by then.

## Revisit when

- A second machine joins this one.
- The journal shows `sshd`'s throttling being overwhelmed, or abuse from the machine on a port other
  than HTTPS.
- An unpatched flaw in `sshd` that needs no login outlasts a day.

## Also update

- [x] questions/README.md: slice 4 gains this record as a **Given**
- [x] questions/how-is-the-server-reached-and-hardened.md: part B is settled here
- [x] architecture.md: nothing; no code yet
- [x] constraints.md: nothing; DigitalOcean's firewall and mail-port facts are cited from the question
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing yet
