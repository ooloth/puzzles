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

...

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

**Whether the deploy script is written in shell or in TypeScript is also left here.** The spike's
script was shell.

*Moved here 2026-10-02 from the hosting question's open entry, read with
`git show ed7f54e:docs/questions/where-does-this-run.md`.*

**What a deploy can be given to log in with, if it is not the maintainer's own login.** A key in
`authorized_keys` can carry `restrict`, which disables "port, agent and X11 forwarding, as well as
disabling PTY allocation and execution of ~/.ssh/rc", and `command=`, which runs a fixed command
"whenever this key is used for authentication", with the requested one in `SSH_ORIGINAL_COMMAND`.
`sudo` can be limited to named `systemctl` commands, where wildcards in arguments are a known hazard,
and polkit can allow one user to manage named units through `org.freedesktop.systemd1.manage-units`,
whose rules see the unit and the verb. A non-root user that controls the services is still close to
root. Kamal defaults to SSH as `root`, which is moot with no Kamal.

*Sourced by research agents on 2026-09-30 and 2026-10-05 from sshd(8), the systemd policy file and a
systemd mailing-list answer; not run. Moved here on 2026-10-06 from
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md), which left the
deploy's credential to this question. Whether `root` can log in at all is
[can root log in over SSH?](can-root-log-in-over-ssh.md), and it decides whether a deploy logging in
as `root` behind a forced command stays a candidate.*

**A rebuilt machine has a new host key, and so does the recovery ISO.** On a spike Droplet on
2026-10-06, the rebuild gave the machine a new host key, and the recovery ISO's rescue system
answered with a host key of its own, so SSH warned "REMOTE HOST IDENTIFICATION HAS CHANGED". A deploy
that trusts whatever key it meets first can be pointed at the wrong machine, and one that pins the
key breaks on every rebuild. A CA that signs the machine's host key would let the Mac and a deploy
trust a rebuilt machine without a warning, but the CA's key, or the host's own private key, would
have to reach the machine somehow, and anything in cloud-init user-data is readable by every process
there.

*Measured for the host keys, one run; reasoned for the rest. Moved here on 2026-10-06 from the
hardening question, where it was property 18: "the machine's host key is known to the person or
deploy connecting before they trust it, including after a rebuild".*
