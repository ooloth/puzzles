---
opened: 2026-09-30
status: open
resolves_into: decision
---

# How is the hosting account protected from unexpected charges?

## Why it matters

[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on
DigitalOcean. The maintainer wants never to find a larger bill than expected. The account already
exists, with an API token that can create Droplets, so the exposure starts before launch, not at it.

**The ways a bill grows:**

- a leaked token or a faulty script creating resources;
- resources left running after a spike;
- traffic beyond the included transfer;
- a compromised sign-in.

**Why it is hard to rule out.** DigitalOcean has no spending cap, so nothing stops a charge once it
has begun. What can be set is how likely each cause is, and how soon the maintainer hears.

**Environments:** production, plus any account the maintainer uses to measure or rehearse. Local runs
incur no charge.

## What would settle it

A set of account settings and habits, scored against the properties below, and recorded where the
maintainer and a future agent will follow them. Most of it is read from DigitalOcean's documentation.
The token's scopes can be checked against the API.

## Properties the answer is scored against

Derived from the moments the account can be charged: a token being created, used and leaked; a
script creating resources; a spike leaving resources behind; a month of traffic; a card failing; and
the maintainer signing in.

1. **A leaked credential or a faulty script can create only a bounded amount.** Rests on the
   maintainer's wish never to find a larger bill than expected, stated on 2026-09-30.
2. **Spending beyond the expected amount reaches the maintainer within hours.** Same source.
3. **The account's sign-in resists takeover.** Same source, and the security theme in
   [../guarantees/README.md](../guarantees/README.md).
4. **A failed payment never powers the machine down without the maintainer knowing first.** Rests on
   "A failed card can stop and then delete the machine" in the tenth pass of
   [where does this run?](where-does-this-run.md).
5. **The cost of traffic is bounded, or noticed before it grows.** Same source as property 1.
6. **Keeping these true needs no recurring attention.** Rests on E2 in
   [where does this run?](where-does-this-run.md).

**Checked and found binding on nothing:** which region, and which OS. Neither changes what the account
can be charged for.

## Resolves into

A decision record in [../decisions/](../decisions/). The steps it settles also go into the runbook
that [where does this run?](where-does-this-run.md) lists as owed.

## Source

Raised by the maintainer on 2026-09-30, after the measurements on DigitalOcean.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**DigitalOcean has no spending cap.** "A spend alert budget is not a spending cap and does not limit
how much you can use." Its spend alerts email the team's owners and billers "within an hour of your
spend crossing a threshold", and "Each threshold notifies once per billing cycle".

*Sourced — [spend alerts](https://docs.digitalocean.com/platform/billing/billing-alerts/), read
2026-09-30.*

**Transfer is billed only outbound.**

- The allowance is "pooled cumulatively across all Droplets at the team level", and beyond it
  outbound transfer costs "$0.01 per GiB".
- "Inbound data transfer to Droplets is completely free", VPC traffic costs nothing, and "Traffic
  dropped by DigitalOcean firewall rules is not billed".
- So a flood of requests costs little in transfer, while serving far more than 1 TB a month would
  cost about $10 per extra TB.

*Sourced — [bandwidth](https://docs.digitalocean.com/platform/billing/bandwidth/), read 2026-09-30.*

**A team has a Droplet limit, which bounds how many Droplets can exist at once.**

- It is shown under the team's settings, and raising it takes a request.
- DigitalOcean says it uses "dynamic resource limits to protect our platform against bad actors".
- No default figure was found for a new account.

*Sourced, from search summaries of DigitalOcean's docs on 2026-09-30. Not opened.*

**A failed payment can power the account down and then delete it, with no published timeline.**
"We power down the account's resources", then "we may permanently delete the account's resources",
and "DigitalOcean does not publish fixed timelines for these stages". *Sourced —
[late payments](https://docs.digitalocean.com/platform/billing/late-payments/), read by an agent
2026-09-30.*

**The API token used for the measurements.** It has custom scopes covering Droplets and SSH keys, but
not account reading or tag creation, as `doctl` showed on 2026-09-30.

**What the maintainer set on 2026-09-30:**

- a spend alert;
- "Secure Sign-In", which requires team members to "sign in with Google, GitHub, or a 2FA-protected
  DigitalOcean account". The maintainer signs in with GitHub;
- a 30-day token, to be deleted once the measurement work ends.

**Costs found that sit outside a Droplet's price:**

- a reserved IPv4 costs $5 a month while it is not assigned;
- uptime checks cost $1 a month each after the first;
- Spaces costs from $5 a month once enabled;
- backups cost 20 or 30% of the Droplet's price.

The fifth and ninth passes of [where does this run?](where-does-this-run.md) have the sources.
