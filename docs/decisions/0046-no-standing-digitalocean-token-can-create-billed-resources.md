---
number: 0046
status: accepted
date: 2026-09-30
---

# 0046 — No standing DigitalOcean token can create billed resources

## Forced by

- [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on DigitalOcean, and
  [ADR-0045](0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md) sets $20 a month
  as the ceiling.
- [../constraints.md](../constraints.md), "Hosting — DigitalOcean has no spending cap": nothing
  DigitalOcean offers stops a charge, a token's scopes cannot be limited to particular resources, and
  a team's limits rise by themselves.
- The maintainer, 2026-09-30: "If it's something illegitimate, I would want that blocked", and "No, I
  don't want the site to go down".

## Scored against

Derived from the moments the account can be charged: a token being created, used and leaked; a script
creating resources; a spike leaving resources behind; a month of traffic; a card failing; the
maintainer signing in, or being unable to; and, later, a pipeline or a recovery script holding a token
of its own. The working is in the question, read with
`git show 8c1b927:docs/questions/how-is-the-hosting-account-protected-from-unexpected-charges.md`.

1. A leaked credential or a faulty script can create only a bounded amount (the maintainer's wish never
   to find a larger bill than expected, 2026-09-30).
2. Spending beyond the expected amount reaches the maintainer within hours (same source).
3. The account's sign-in resists takeover (same source, and the security theme in
   [../guarantees/README.md](../guarantees/README.md)).
4. A failed payment never powers the machine down without the maintainer knowing first (the account
   entry under **Risk** in [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)).
5. The cost of traffic is bounded, or noticed before it grows (same source as property 1).
6. Keeping these true needs no recurring attention (property 5 of
   [ADR-0045](0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md)).
7. The maintainer can always get back into the account (the account entry under **Risk** in
   [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md), and
   [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
8. A token held by automation is bounded the same way as one held by a person (property 5 of
   [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)).
9. Illegitimate creation or use of billed resources is prevented, not only reported (the maintainer,
   2026-09-30, as quoted above).
10. Traffic cost, legitimate or not, reaches the maintainer long before it nears the ceiling, and
    nothing takes the site down to stop it (the maintainer, 2026-09-30, as quoted above).
11. Stopping spending never destroys the store or its copy
    ([ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
12. An alert reaches the maintainer even when one channel fails or the maintainer is away (same source
    as property 1).

**Resources.** Network binds, as outbound transfer is the one charge that grows with players rather
than with what we create. CPU, memory and storage do not bind: they are bought in fixed sizes, so they
change the bill only when something is created or resized, which this record covers.

## Decision

- **A token that can create anything exists only while the maintainer is working with it by hand.** It
  gets the shortest expiry the control panel offers, and is deleted when the work ends. It is created
  in the team the work is for, which is the experiments team for anything but production, per
  [ADR-0048](0048-production-runs-in-its-own-digitalocean-team-apart-from-experiments.md).
- **No token that can create anything is stored where it outlives that work**: not in a deploy
  pipeline, not on the Droplet, not in a scheduler. How a deploy reaches the machine without one is
  for [what deploys the code?](../questions/what-deploys-the-code.md).
- **A token something needs to keep holds read scopes only.** Any other standing token is named in a
  record, with what its create scopes could cost at the team's current tier.
- **Serverless inference keeps a $0 balance with auto-reload off.** It is prepaid only, so with no
  balance nothing can bill it, whoever holds a token.

This keeps [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)'s no-person recovery reachable without building it. A token for it is
[how is the store recovered when the machine is lost?](../questions/how-is-the-store-recovered-when-the-machine-is-lost.md)'s
to argue, under the third bullet.

## Enforced by

Nothing in the repo. The control panel's token list is where it can be seen, and
[../../CONTRIBUTING.md](../../CONTRIBUTING.md)'s DigitalOcean CLI section states the rule. The steps
are in [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md).
Asserted only.

## Rejected

- **A standing token that can create Droplets only**, for a pipeline or for recovery. Its case is that
  recovery and deploys could then run with no person. It fails property 1: at tier 2 it can create ten
  Droplets of up to $84, about $840 a month, and the tier rises by itself with payment history.
  **Reverses if** DigitalOcean adds a spend cap per token or per team, or a later record accepts that
  cost for no-person recovery.
- **A standing token with broad scopes**, which is how `doctl` is usually set up. It fails property 1:
  four database clusters alone, the tier-2 limit, are about $3,900 a month at the largest single-node
  price. **Reverses if** the same as above.
- **Not yet.** The account held a token that could create Droplets until 2026-09-30, and M1 slice 4
  is about to need tokens to build the machine.

## Risk

- **A taken-over sign-in can still create anything, and can create tokens.** No notification for a new
  token or a new sign-in was found. The sign-in steps in
  [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md) make this
  unlikely, not impossible.
- **Hands-on work holds a token for its expiry period**, and a leak during it can cost what that
  token's scopes allow at the team's tier.
- **The tier rises by itself**, so what the remaining routes can cost grows over months.

## Revisit when

- DigitalOcean adds spend caps, or tokens scoped to particular resources.
- Something unattended needs a token that can create.

## Also update

- [x] questions/README.md: M1 slice 4's first Must answer becomes Givens
- [x] questions/how-is-the-hosting-account-protected-from-unexpected-charges.md: mined in this change
      and deleted
- [x] questions/what-deploys-the-code.md: a pipeline holds no token that can create
- [x] questions/how-is-the-store-recovered-when-the-machine-is-lost.md: the recovery token is argued
      there
- [x] questions/how-is-the-store-backed-up.md: the second billing account gets these properties
- [x] questions/where-does-this-run.md: its open list
- [x] architecture.md: no change; no boundary moves
- [x] constraints.md: DigitalOcean's billing, token and limit facts
- [x] glossary.md: nothing introduced
- [x] guarantees/: no new promise
- [x] ../CONTRIBUTING.md: the token instructions
- [x] runbooks/: the account's setup steps
