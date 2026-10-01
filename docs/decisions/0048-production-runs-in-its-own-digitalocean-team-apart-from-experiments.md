---
number: 0048
status: accepted
date: 2026-09-30
---

# 0048 — Production runs in its own DigitalOcean team, apart from experiments

## Forced by

- [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md) lets a token that can
  create or delete exist while the maintainer works by hand, and spikes need such tokens.
- [../constraints.md](../constraints.md), "Hosting — DigitalOcean has no spending cap": a token's
  scopes cannot be limited to particular resources, Droplets have no deletion protection, and teams
  are billed separately.

## Scored against

The twelve properties of
[ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md), restated here because
the rejection below names them. Each property's source is listed there.

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

## Decision

- **The `puzzles` team holds production and nothing else.** No token is created in it except under
  [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md)'s rules for production work.
- **The `puzzles-experiments` team holds spikes, measurements and rehearsals**, and the tokens they
  need.
- Each team has its own spend alerts, Secure Sign-In and payment methods, per
  [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md).

The maintainer created `puzzles` on 2026-09-30. It started at tier 1 and showed tier 2 the same day,
with the same limits as the older team, which became `puzzles-experiments`. So the separation does not
lower production's limits; what it buys is that a spike's token cannot reach production.

## Enforced by

The two teams exist, as the maintainer set them up on 2026-09-30. Nothing checks that a spike runs in
the right one. [../../CONTRIBUTING.md](../../CONTRIBUTING.md)'s DigitalOcean CLI section says which
team a token is created in.

## Rejected

- **One team for production and experiments.** Its case is one set of settings to keep. It fails
  property 11: a spike's token with `droplet:delete` can delete the production Droplet, because scopes
  cannot be limited to particular resources. **Reverses if** DigitalOcean adds tokens scoped to
  particular resources, or deletion protection for Droplets.
- **Not yet.** M1 slice 4 creates the production Droplet, and whichever team it is created in is
  where it stays.

## Risk

- **Two teams' settings to keep in step.** A setting added to one and forgotten in the other is the
  likely drift.
- **A spike run in the wrong team** loses the protection, and nothing catches it.

## Revisit when

- DigitalOcean adds resource-scoped tokens or deletion protection, so one team would be as safe.

## Also update

- [x] questions/README.md: covered by [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md)'s change
- [x] questions/how-is-the-hosting-account-protected-from-unexpected-charges.md: mined in this change
      and deleted
- [x] architecture.md: no change; a team is how the account is arranged, not a boundary in the system
- [x] constraints.md: team billing, added in the same change
- [x] glossary.md: nothing introduced
- [x] guarantees/: no new promise
- [x] ../CONTRIBUTING.md: which team a token is created in
- [x] runbooks/: both teams' settings
