---
opened: 2026-09-02
status: open
resolves_into: decision
---

# What deploys the code?

## Why it matters

M1 is a *deployed* skeleton, so something has to move a build from a laptop to the running host, and
nothing currently says what. The host is a DigitalOcean Droplet, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), and the app runs there
as systemd services without containers, per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). The three
questions that sit closest all assume a deploy happens without asking what performs it:
the hosting question compared hosts until [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) settled one,
[what runs the checks on every change?](what-runs-the-checks-on-every-change.md) is scoped to what
must hold before a change is committed, and
[how is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) takes the deploy
as a given event and asks what happens around it.

It matters beyond M1 for one reason. Whether checks gate a deploy is decided here, not in the checks
question — a suite that runs on a branch and a deploy triggered by hand are independent, and a solo
maintainer with no reviewer is exactly the case where "I will run them first" and "they ran" come
apart. [ADR-0001](../decisions/0001-decisions-live-in-docs-and-work-lives-in-issues.md) makes the
same argument about intentions needing a mechanism.

The reversal cost is low, which is worth saying plainly: this is not in the class of choices that are
expensive to undo, and it should not be researched as though it were.

## What would settle it

Naming what has to be true at the moment of a deploy — whether anything must be built, whether checks
must have passed, and whether the person deploying has to be at their own machine — and then choosing
the least machinery that delivers it. None of it falls out of the host: a Droplet brings nothing to
run the app with, per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).

## Properties the answer is scored against

Copied on 2026-10-05 from how is the server reached and hardened?, read with
`git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`, which derived it for
reaching and hardening the machine and was deleted once
[ADR-0054](../decisions/0054-the-maintainers-ssh-key-is-held-in-1passwords-agent.md) to
[ADR-0059](../decisions/0059-the-maintainer-logs-in-as-a-named-user-whose-sudo-asks-for-no-password.md) settled
the maintainer's access. **What still binds here is a deploy logging in:** properties 1, 5 and 10 for
what the deploy's credential can do and hold, 7 for its logins being recorded, 8 and 15 for the
credential and its configuration being the same on a rebuilt machine and in the local run, and 18
for host keys. The other rows are settled for the maintainer's access by those records and are kept
because a deploy has to satisfy them too, not because they are open.

Derived on 2026-10-05, before any option was researched. Two other questions share moments with
this list and score against it as well as their own:
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md) shares a
deploy starting and stopping units, and
[is Node installed on the host or carried in each release?](is-node-installed-on-the-host-or-carried-in-each-release.md)
shares software being installed and patched.

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
    which expects years of active attention. Settled by
    [ADR-0055](../decisions/0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md).
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

- **1a.** Something running as the maintainer on the Mac cannot take the credential off it. A key
  file with a strong passphrase kept nowhere would survive a copy of the file alone, but not
  something running as the maintainer while the Keychain or an agent holds the passphrase.
- **1b.** Whoever holds an unlocked session or the account a credential lives in cannot export it.
  Found on 2026-10-05 to separate no candidate, per
  [ADR-0054](../decisions/0054-the-maintainers-ssh-key-is-held-in-1passwords-agent.md).
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
    2026-10-05. It bears mostly on deploys, and is open here.

**Added in later passes, 2026-10-05**

*19. Safety.* Nothing added to the path that authorises root is a package
nobody actively maintains. Per [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
and the portable security standard's Should that dependencies are well maintained. A flaw in a
module that authorises `sudo` is a route to root.

20. *Safety.* A filtering rule holds even when root on the machine is taken over. Root can rewrite
    a firewall on the machine and cannot touch one outside it. From the portable decision-making
    standard's maximum safety, and what a compromised machine costs under
    [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md).
21. *Safety.* A program that later needs to reach something new is not silently refused. A refused
    download is the case
    [a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md)
    describes: Debian's daily run logs it at debug level and carries on.


## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, on finding that M1's definition is a deployed skeleton and no question in this
folder covered the mechanism that deploys it.

## Options

*A command run by hand.* The dumbest thing that works, and it works from the first day with no
configuration. Deploys are whatever the maintainer's machine happened to contain, they cannot happen
when that machine is not present, and nothing enforces that checks ran.

*A pipeline we define, triggered by a push or a merge.* The build steps are written
down, so the deployed artifact is reproducible and checks can gate it. More configuration, and a
second environment whose drift from the local one is a real failure mode.

A host's own git integration, where a push makes the platform build and deploy, is not open: a
Droplet brings nothing that runs the app, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) and
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**What a deploy targets is settled.** [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md): the app runs as systemd services on one Droplet, with
no container runtime, so a release is a directory of built JavaScript and its `node_modules`. How the
switch between versions works is
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md). What is left here is the pipeline: what triggers a
deploy, whether checks gate it, and where a release is built. If a production dependency ever has a
native addon, a release has to be built on Linux x64, not on the maintainer's arm64 Mac.

**A check that does not gate anything is a check nobody runs.**
[What runs the checks on every change?](what-runs-the-checks-on-every-change.md) records that
`scripts/check-docs.py` exists and nothing runs it, and treats that as the shape of the whole
problem rather than an oversight. Whether this question's answer is where that gate lives, or whether
the gate sits earlier at commit time, is the one real interaction between the two.

**This is not the same question as reproducing the deployed environment locally.** They are commonly
answered by one tool and they are separable: a hand-run deploy of a release built in a local Linux
machine matching the Droplet gives strong parity with no pipeline, and a hosted pipeline building on
its vendor's runner image gives a pipeline with weak parity. See
[how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md).

**The app needs no secrets in M1.** The milestone is a hard-coded response with no database, so
there is nothing to inject into the running app. That becomes real at M3 and should not be built
before then. The deploy itself does hold one credential, the SSH key below.

*Reasoned — from M1's definition in [README.md](README.md).*

**The pipeline holds no DigitalOcean token that can create anything.**
[ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) rules out
any standing token with create scopes, because a leaked one could create thousands of dollars a month
of resources and DigitalOcean has no spending cap. A deploy that reaches the Droplet over SSH needs no
DigitalOcean token at all, so the SSH key the pipeline holds is the credential to protect. A token
with read scopes only is allowed if the pipeline needs one.

*Moved here 2026-09-30 from the hosting-account question when [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) resolved it.*

**A check that fails on a native addon in production dependencies may not be needed.**
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) names it under
Enforced by, to guard a release built on the arm64 Mac and shipped to the amd64 Droplet. A release
built on Linux x64 compiles any addon for the right CPU, so whether the check is needed depends on
where releases are built, which this question answers. The likeliest source of an addon is the
driver, at [which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md).
The check is drafted as an issue once the build location is known.

**A deploy script kept in the repository is TypeScript run on Node**, because
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) runs "every repo script"
on Node. The spike's script was shell.

*From [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md). The spike is read with
`git show ed7f54e:docs/questions/where-does-this-run.md`.*

**What a deploy can be given to log in with, if it is not the maintainer's own login.** A key in
`authorized_keys` can carry `restrict`, which disables "port, agent and X11 forwarding, as well as
disabling PTY allocation and execution of ~/.ssh/rc", and `command=`, which runs a fixed command
"whenever this key is used for authentication", with the requested one in `SSH_ORIGINAL_COMMAND`.
`sudo` can be limited to named `systemctl` commands, where wildcards in arguments are a known hazard,
and polkit can allow one user to manage named units through `org.freedesktop.systemd1.manage-units`,
whose rules see the unit and the verb. A non-root user that controls the services is still close to
root.

*Sourced by research agents on 2026-09-30 and 2026-10-05 from sshd(8), the systemd policy file and a
systemd mailing-list answer; not run. Moved here on 2026-10-05 from
how is the server reached and hardened? (read with `git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`), which left the
deploy's credential to this question. Whether `root` can log in at all is
[ADR-0058](../decisions/0058-root-does-not-log-in-over-ssh.md), which removes a deploy logging in as
`root` behind a forced command; reopening it is one line, `PermitRootLogin forced-commands-only`.*

**A rebuilt machine has a new host key, and so does the recovery ISO.** On a spike Droplet on
2026-10-05, the rebuild gave the machine a new host key, and the recovery ISO's rescue system
answered with a host key of its own, so SSH warned "REMOTE HOST IDENTIFICATION HAS CHANGED". A deploy
that trusts whatever key it meets first can be pointed at the wrong machine, and one that pins the
key breaks on every rebuild. A CA that signs the machine's host key would let the Mac and a deploy
trust a rebuilt machine without a warning, but the CA's key, or the host's own private key, would
have to reach the machine somehow, and anything in cloud-init user-data is readable by every process
there.

*Measured for the host keys, one run; reasoned for the rest. Moved here on 2026-10-05 from the
hardening question, where it was property 18: "the machine's host key is known to the person or
deploy connecting before they trust it, including after a rebuild".*
