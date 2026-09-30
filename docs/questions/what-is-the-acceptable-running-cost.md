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

The maintainer stating the number, what it covers, whether it is a ceiling or a preference, and what
would change it, scored against the properties below. It is a preference to be recorded, not a fact
to be found, so no research or spike settles it.

## Properties the answer is scored against

Derived from the moments the running cost is touched: a monthly bill arriving; a setup being chosen
or rejected on price, as [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md)
did; something being added, such as a worker, backups, monitoring or a standby; traffic growing; and
a vendor raising a price.

Ways a bad answer could fail. **Safety:**

- a cost limit met by dropping a backup or a check, so work is lost to save money;
- a bill growing past the target without anyone deciding it should.

**Performance:** a limit that blocks the resize growth needs, so players wait.

**Experience:**

- a vague target that every later choice argues over again;
- one so strict that each addition needs a debate.

1. **The target is a number that can reject an option**, in one currency and one period, and it
   names what it covers: the machine, the copy of the store, monitoring, the domain, or the whole
   hosted setup. Rests on
   [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md)'s property 7, which
   already rejects options against it.
2. **It says whether exceeding it is a choice or a failure**: a preference weighed against other
   properties, or a ceiling that disqualifies. Rests on the question's own title, and on the
   maintainer's "not a hard line, but $20 usd/month becomes likely too expensive".
3. **It is never met by giving up a promise to players.** Rests on [../guarantees/](../guarantees/):
   the promises bind whatever they cost. A cost target that would require dropping the copy of the
   store is the target losing, not the promise.
4. **It says what would change it**, such as a number of players, a paid tier, or a vendor's price
   rise. Rests on "Launch is sized small; the ceiling is not" in [../problem.md](../problem.md): a
   decision that makes growing expensive needs arguing, not assuming.
5. **Keeping it takes no recurring attention.** Rests on the maintainer's "it just works" and "it's
   so easy", recorded in [where does this run?](where-does-this-run.md).

**Checked and found binding on nothing:** CPU, memory, storage and network. They are what the money
buys, and the setups that buy them are scored in [where does this run?](where-does-this-run.md), not
here.

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
This describes the period before public use and does not answer this question.

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
