---
updated: 2026-10-01
update_when: a DigitalOcean account setting is added, changed or removed, or a record it carries out changes
decays: slow
status: active
---

# Set up the hosting account

The DigitalOcean account has two teams, per
[ADR-0048](../decisions/0048-production-runs-in-its-own-digitalocean-team-apart-from-experiments.md):
`puzzles` holds production and `puzzles-experiments` holds everything else. Team settings can be
changed only in the control panel, per [../constraints.md](../constraints.md), "Hosting —
DigitalOcean has no spending cap", so every step here is done by hand.

Where a step rests on the maintainer's preference rather than a record, its reason links to the
question that worked it, read with
`git show 8c1b927:docs/questions/how-is-the-hosting-account-protected-from-unexpected-charges.md`.

## The maintainer's sign-in

1. **Sign in to DigitalOcean with GitHub.** Losing GitHub means DigitalOcean's ID-check recovery, per
   [../constraints.md](../constraints.md), "Hosting — DigitalOcean has no spending cap".
2. **Give the GitHub account a passkey, stored in 1Password, and keep its one-time codes as a
   fallback.** Secure Sign-In does not check a GitHub sign-in for 2FA, so the account is as hard to
   take over as GitHub, per [../constraints.md](../constraints.md). A one-time code can be relayed by
   a phishing page in real time, where a passkey is bound to the real site; that is reasoned, not
   sourced here.
   The maintainer chose a synced passkey over a hardware key on 2026-09-30, accepting that 1Password
   then holds both the passkey and the recovery codes.
3. **Keep GitHub's recovery codes in 1Password.** Without them, "GitHub Support will not be able to
   restore access", per [../constraints.md](../constraints.md).

## Both teams

4. **Turn on Secure Sign-In** under the team's Settings. It admits only members who sign in with
   GitHub, Google, or a DigitalOcean account with 2FA, which keeps a password-only sign-in out, per
   [../constraints.md](../constraints.md).
5. **Keep no standing token that can create anything.** A token for hands-on work gets the shortest
   expiry offered, and is deleted when the work ends, per
   [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md).
6. **Keep the Serverless Inference balance at $0, with auto-reload off.** With no balance, nothing
   can bill it, per [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md).

## The `puzzles` team

7. **Add a spend alert on total spend, at $8, $10 and $20.** $10 and $20 are the preference and the
   ceiling in [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md),
   and $8 warns before the first. The maintainer chose one recipient, their own address, on
   2026-09-30: their mail client already gathers every inbox in one place, so a second address would
   add duplicates rather than a reader.
8. **Add PayPal as a backup payment method.** DigitalOcean tries other payment methods on file when
   the default fails, and a failed payment can end in suspension, per
   [../constraints.md](../constraints.md).
9. **Create the production Droplet with monitoring enabled**, so DigitalOcean's metrics agent is
   installed. Only Droplets with the agent can carry an alert policy, per
   [../questions/what-are-the-servers-vitals-and-who-watches-them.md](../questions/what-are-the-servers-vitals-and-who-watches-them.md).
10. **Add an alert policy on the production Droplet's Public Outbound Bandwidth, by email**, for a
    rate sustained over one hour that would use the 1,000 GiB monthly pool within a month: about 3 Mbps,
    per [../constraints.md](../constraints.md).
    Spend alerts do not see transfer until it is invoiced, per
    [../constraints.md](../constraints.md), so this is what reports traffic, per
    [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md).
    Check the metric's unit in the control panel when setting it; the docs do not state it.

## The `puzzles-experiments` team

11. **Add a spend alert on total spend, at $20.** A spike left running shows up within the month.
    The maintainer chose the figure on 2026-09-30, in the question linked above, so that it sits at
    [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md)'s
    ceiling.
12. **Add no backup payment method.** A failed payment here stalls a spike and loses no data, since
    [ADR-0048](../decisions/0048-production-runs-in-its-own-digitalocean-team-apart-from-experiments.md)
    keeps the store out of this team. The maintainer chose this on 2026-09-30, in the question linked
    above.

## The maintainer's mail

13. **Add a rule in the mail client that flags mail from DigitalOcean, and check it is not filtered as
    spam.** Every alert above arrives by email to one address, so this is what keeps one from being
    missed among other mail. The maintainer chose one address over a second recipient on 2026-09-30,
    in the question linked above, as step 7 says.
