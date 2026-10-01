---
number: 0047
status: accepted
date: 2026-09-30
---

# 0047 — Nothing automated deletes or stops resources to cap spending

## Forced by

- [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md) prevents what a
  token could create, which leaves the question of whether anything stops spending once it starts.
- [../constraints.md](../constraints.md), "Hosting — DigitalOcean has no spending cap": a powered-off
  Droplet still bills, prepayment caps nothing, and a declined payment leads to suspension and
  possible deletion.
- The maintainer, 2026-09-30: "I would ideally like to block overbilling rather than only alert on it
  if that's possible", then "No, I don't want the site to go down".

## Scored against

The twelve properties of
[ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md), from the same
question, restated here because the rejections below name them.

1. A leaked credential or a faulty script can create only a bounded amount.
2. Spending beyond the expected amount reaches the maintainer within hours.
3. The account's sign-in resists takeover.
4. A failed payment never powers the machine down without the maintainer knowing first.
5. The cost of traffic is bounded, or noticed before it grows.
6. Keeping these true needs no recurring attention.
7. The maintainer can always get back into the account.
8. A token held by automation is bounded the same way as one held by a person.
9. Illegitimate creation or use of billed resources is prevented, not only reported.
10. Traffic cost, legitimate or not, reaches the maintainer long before it nears the ceiling, and
    nothing takes the site down to stop it.
11. Stopping spending never destroys the store or its copy.
12. An alert reaches the maintainer even when one channel fails or the maintainer is away.

Each property's source is listed in [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md).

## Decision

**No process stops, deletes or firewalls a resource because of what it costs.**

- Illegitimate spending is prevented rather than stopped: by
  [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md) for tokens, and by
  the sign-in steps in [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md)
  for the control panel.
- Everything else, popularity included, is reported to the maintainer by the alerts in the same
  runbook, and the maintainer decides what to do.

**Why reporting is enough for traffic.** Outbound transfer beyond the pool costs $0.01 per GiB. At a
sustained 1 Gbps, which is an assumption about the Droplet's network and not a measured figure, that
is about 10,000 GiB, or $100, a day, so $1,000 takes about ten days of ignored alerts. The traffic
alert in the runbook fires once a high rate has lasted an hour. How soon DigitalOcean Monitoring
delivers it after that is not documented.

## Enforced by

Nothing, because nothing is to be built. A kill switch added later would contradict this record and
needs a new one that supersedes it.

## Rejected

- **A kill switch that deletes every resource not on an allowlist** once spend crosses a threshold. Its
  case is that it acts while the maintainer is away, which no alert does. It fails property 11:
  DigitalOcean's delete scopes cannot be limited to particular resources, and Droplets have no
  deletion protection, so its token can delete the Droplet holding the store. It would also stand as a
  token in a scheduler, which [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md) rules out for creation and this record rules out for deletion.
  **Reverses if** DigitalOcean adds tokens scoped to particular resources, or deletion protection.
- **A payment method with a spending limit**, so that charges past it are declined. Its case is that it
  is the only cap that needs nothing built. It fails property 11: a declined charge puts the account
  on hold, then suspends it, and then "we may permanently delete the account's resources", with no
  published timeline. **Reverses if** DigitalOcean offers a cap that stops a product without
  suspending the account.
- **A switch that cuts outbound traffic** with a Cloud Firewall once spend or transfer crosses a
  threshold. Its case is that its token could cause an outage but never data loss. It fails property
  10: it stops the charge by taking the site down. **Reverses if** the maintainer decides an outage is
  better than an overage.
- **Not yet.** M1 slice 4 creates the first billed machine, and
  [ADR-0045](0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md)'s spend alert
  needs a rule for what happens when it fires.

## Risk

- **A taken-over sign-in runs up charges until the maintainer reads an alert and acts.** At tier 2
  that can be thousands of dollars a month in database clusters.
- **Nothing acts while the maintainer is away**, so a long absence with an unread alert is the case
  that leads to a large bill.

## Revisit when

- DigitalOcean ships a spending cap, budget actions, deletion protection, or tokens scoped to
  particular resources.
- The maintainer decides an outage is preferable to an overage.

## Also update

- [x] questions/README.md: covered by [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md)'s change
- [x] questions/how-is-the-hosting-account-protected-from-unexpected-charges.md: mined in this change
      and deleted
- [x] architecture.md: no change
- [x] constraints.md: the facts this cites, added in the same change
- [x] glossary.md: nothing introduced
- [x] guarantees/: no new promise
- [x] ../CONTRIBUTING.md: no setup introduced
- [x] runbooks/: the alerts this relies on
