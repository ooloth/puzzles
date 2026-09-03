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
onto the box. That is why this sits with the tooling that makes a change checkable rather than with
the questions about surviving failure.

**The hardening half is small and unskippable.** A machine on the public internet with a weak
configuration is compromised by scanners rather than by anyone interested in this project. The
baseline is well known and the cost of it is an afternoon, which is exactly the shape of task that
gets deferred indefinitely because it never feels urgent.

**And there is a trap specific to being one person.** Locking yourself out of a machine you alone can
reach is unrecoverable in a way that has nothing to do with attackers.
[../brainstorming/](../brainstorming/) contains three separate lockout-recovery routes for exactly
this architecture, which suggests somebody had already thought about it and that it is worth keeping.

## What would settle it

Deciding how a person and an automated deploy each get onto the machine, and what the baseline
configuration is. What any answer has to cover:

- **How a human reaches it** — keys, what holds them, and what happens when they are lost.
- **How a deploy reaches it**, which is a different credential with a different lifetime and is where
  [how do secrets reach the running system?](how-do-secrets-reach-the-running-system.md) meets this.
- **The baseline**: what is exposed, what is not, whether updates apply themselves, and what watches
  for the obvious.
- **The lockout route**, because it is the failure with no remote fix.

**Its size depends entirely on the host.**
[Where does this run?](where-does-this-run.md) decides whether this is most of a day or almost
nothing: a managed platform supplies the machine's baseline and gives access through its own tooling,
and a bare virtual machine supplies neither. So this cannot be scoped before that question lands,
though it can be asked now.

## Resolves into

A decision record in [../decisions/](../decisions/), and content in
[../verification.md](../verification.md) about how to get onto the machine and what to look at.

## Source

Split from [how is the server operated?](how-is-the-server-operated.md) on 2026-09-03. That question
covered access, hardening, restarting, patching and noticing an outage as one thing, and sat at M16 on
the assumption that a managed platform would supply most of it.
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) removed that assumption.
The half about reaching the machine is needed to check a change; the half about surviving one is not,
and stays where it was.

## Options

...

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
