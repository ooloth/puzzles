---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What is the acceptable running cost, and is it a ceiling or a preference?

## Why it matters

The maintainer has stated a target: about $10 a month, not a hard line, with $20 a month likely too
much. The quote is in the mined findings below. This question still has to settle what that target
is for the running system and whether it is a ceiling or a preference. A ceiling changes which
platforms qualify; a preference doesn't. The two behave very differently under a traffic spike.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**For choosing a host at M1, price was a row in the comparison, per month or per year.** In
[where does this run?](where-does-this-run.md) that row became P0, scored against the maintainer's
target of about $10 a month, and
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) counts it as property 7.
This describes the period before public use and does not answer this question, which stays at M16.

*Sourced — stated by the maintainer, 2026-09-28 and 2026-09-30.*

*Mined 2026-09-30 from [where does this run?](where-does-this-run.md) as it was at commit `11ac964`. These are observations for this question to weigh, not answers.*

- **The maintainer's target, stated 2026-09-30:** "$10 usd / month is about as high as I would
  ideally want to go if possible; not a hard line, but $20 usd/month becomes likely too expensive".
- **What the chosen setup was estimated to cost:** about $6 a month. That is a $6 Droplet and a copy
  in Backblaze B2's free tier, per the ninth pass.
- **Price history found.**
  - DigitalOcean raised its prices once, from 1 July 2022, the 1 GB Droplet going from $5 to $6: "for
    the first time there will be a price change on some of our products". *Sourced —
    [DigitalOcean's blog](https://www.digitalocean.com/blog/new-4-dollar-droplet-updated-pricing),
    opened 2026-09-30.* Existing Droplets were included, per third-party coverage.
  - Linode kept its $5 plan through a 20% rise on its other shared plans in 2023.
  - Hetzner raised prices for new orders on 15 June 2026 and left existing servers alone.
  - Fly raises its memory prices on 1 October 2026.
- **How a bill grows beyond the plan** is at
  [how is the hosting account protected from unexpected charges?](how-is-the-hosting-account-protected-from-unexpected-charges.md).
