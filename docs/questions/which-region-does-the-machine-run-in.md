---
opened: 2026-09-27
status: open
resolves_into: decision
---

# Which region does the machine run in?

## Why it matters

**Every wait a player has includes the round trip to one place.**
[ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) puts the server and its
store on one machine, and rules out a second one sharing the file. So there is exactly one location
every request travels to. [../problem.md](../problem.md) lists where a player waits, and each of those
waits needs the server. [../constraints.md](../constraints.md) records that a fresh connection costs
three to four round trips. The distance to the machine is paid on every one of them.

**Nothing says where the players are.** [../problem.md](../problem.md) describes them as the general
public, phone-first and in transit, and names no geography. So the input this question needs is not
written down anywhere. Asked on 2026-09-29, the maintainer said they were not sure and would assume
North America if they had to pick. That is an assumption, not a fact about the audience.
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) uses it only to require a North American region from the
host. This question still needs the fact.

**M1 deploys to `tor1` without deciding this.** The maintainer agreed on 2026-09-30 that M1 slice 4's
Droplet goes in Toronto, as a placement rather than an answer. The choice is made here, at M3,
before the first row is written.

**It becomes more expensive to change from M3.** At M1 the machine holds no data, so moving it is a
redeploy. From the first row onward, moving it means moving the store, and later a live player
record. That is why it sits at M3, where
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) leaves it to this question.

**Environments:** production only. A local run is on the maintainer's machine by definition, and per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
network distance is a difference the production-like run cannot close.

## What would settle it

Knowing where the first players are, which is a fact about the audience to be stated or found, and
then the round-trip time from there to each region the chosen host offers.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/). Where the players are may also belong in
[../problem.md](../problem.md) under "Who has it", if it turns out to be a fact about the audience
rather than only an input here.

## Source

Raised 2026-09-27, while re-checking where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) before deriving its
properties. No question file mentioned a region, and the maintainer agreed it should be tracked here
at M3.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The host constrains the set of regions available.** Hetzner Cloud offers Falkenstein, Nuremberg,
Helsinki, Ashburn, Hillsboro and Singapore. Google's free e2-micro exists only in `us-west1`,
`us-central1` and `us-east1`.

*Sourced — per the 2026-09-27 pass in where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`), read by
research agents.*

**DigitalOcean's North American datacenters are NYC1, NYC2, NYC3, SFO2, SFO3, TOR1, ATL1, RIC1,
MKC1 and MEM1, and not all of them offer every Basic Droplet.** The page marks Basic Droplets as
fully available in NYC1, NYC2, NYC3, SFO3 and TOR1. SFO2 lacks Premium AMD CPUs, ATL1 has only
Premium CPUs, RIC1 and MKC1 have only Premium Intel CPUs, and MEM1 has no Basic Droplets. SFO1 is a
legacy datacenter where only accounts with existing Droplets there can create more.

*Sourced — [regional availability](https://docs.digitalocean.com/platform/regional-availability/),
the page's HTML fetched and read on 2026-09-30.*
