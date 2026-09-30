---
number: 0045
status: accepted
date: 2026-09-30
---

# 0045 — Hosting costs about $10 a month, with $20 as the ceiling

## Forced by

- [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)'s property 7 rejects options on
  price, so the price needs a settled number and a rule.
- The maintainer's statements of 2026-09-30:
  - "$10 usd / month is about as high as I would ideally want to go if possible; not a hard line,
    but $20 usd/month becomes likely too expensive";
  - the target covers hosting only, not domain registration;
  - the $10 is a preference and the $20 a ceiling;
  - revenue would change it, through a decision made when it arrives;
  - the amounts are in US dollars.

## Scored against

Derived from the moments the running cost is touched: a monthly bill arriving; a setup being chosen
or rejected on price; something being added, such as a worker, backups, monitoring or a standby;
traffic growing; and a vendor raising a price.

1. The target is a number that can reject an option, in one currency and one period, and it names
   what it covers ([ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)'s property 7).
2. It says whether exceeding it is a choice or a failure (the maintainer's "not a hard line").
3. It is never met by giving up a promise to players ([../guarantees/](../guarantees/)).
4. It says what would change it ("Launch is sized small; the ceiling is not" in
   [../problem.md](../problem.md)).
5. Keeping it takes no recurring attention (the maintainer's "it just works" and "it's so easy").

CPU, memory, storage and network bind on nothing here. They are what the money buys, and the setups
that buy them are scored in [where does this run?](../questions/where-does-this-run.md).

## Decision

- **Scope.** US dollars per month, for hosting only: every recurring charge for running the system.
  That means the Droplet and any second machine, storage for the store's copy, monitoring, backups
  and reserved IPs. Domain registration is not included.
- **About $10 a month is a preference.** An option above it counts against that option, but is not
  disqualified by it.
- **$20 a month is a ceiling.** An option costing more is rejected unless the maintainer decides, in a
  record, to exceed it.
- **Promises to players are not traded for cost.** If keeping one ever needs more than $20, that is
  the explicit decision above, not a promise quietly cut.
- **Nothing raises the target by itself.** Revenue would change it, through a new decision when and if
  it arrives.
- **Where it stands.** The chosen setup was estimated at about $6 a month: a $6 Droplet, and a copy of
  the store in Backblaze B2's free tier. The ninth pass of
  [where does this run?](../questions/where-does-this-run.md) has the working.

## Enforced by

**Nothing in the repo.** The spend alert the maintainer set on DigitalOcean is the nearest thing. Its
threshold belongs to
[how is the hosting account protected from unexpected charges?](../questions/how-is-the-hosting-account-protected-from-unexpected-charges.md).

## Rejected

- **A direction with no number.** It fails property 1: it cannot reject an option, and
  [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md) already needed one. **Reverses if**
  nothing is chosen on price again, which no planned decision suggests.
- **$10 as a hard ceiling.** It fails property 2 by the maintainer's ruling, "not a hard line": it
  would make a $1 overage a failure. **Reverses if** the maintainer states that $10 must not be
  exceeded.
- **A target that rises with revenue or player count automatically.** It fails property 4 as the
  maintainer stated it: what revenue allows is not knowable now, so it is decided when it arrives.
  **Reverses if** a paid tier exists and its revenue is predictable enough to write a rule for.
- **Not yet.** Rejected because
  [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md) already rests on it.

## Risk

**A vendor's price rise eats into the gap.** DigitalOcean raised its prices once, from 1 July 2022,
the 1 GB Droplet going from $5 to $6: "for the first time there will be a price change on some of our
products". *Sourced —
[DigitalOcean's blog](https://www.digitalocean.com/blog/new-4-dollar-droplet-updated-pricing), opened
2026-09-30.* A rise of that size would take $6 to about $7.20, still under the preference.

## Revisit when

- Revenue arrives.
- A promise to players cannot be kept under $20.
- Vendor prices push the setup past $10.

## Also update

- [x] questions/README.md: M1 slice 4's Must answer becomes a **Given**
- [x] questions/what-is-the-acceptable-running-cost.md: mined in this change and deleted
- [x] questions/where-does-this-run.md: its P0 row points here
- [x] questions/how-is-the-hosting-account-protected-from-unexpected-charges.md: its spend alert's
      threshold sits relative to these numbers
- [x] [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md): property 7 cites this record
- [x] constraints.md: the hosting price history found while working this
- [x] architecture.md: no change
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: no setup introduced
