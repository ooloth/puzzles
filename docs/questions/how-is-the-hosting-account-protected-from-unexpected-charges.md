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

**Why it is hard to rule out.** DigitalOcean has no spending cap, so nothing built in stops a charge
once it has begun. What can be set is how likely each cause is, how soon the maintainer hears, and
whether something of our own stops it. The maintainer would rather block than only be told, if that
is possible.

**Environments:** production, plus any account the maintainer uses to measure or rehearse. Local runs
incur no charge.

## What would settle it

A set of account settings and habits, scored against the properties below, and recorded where the
maintainer and a future agent will follow them. Most of it is read from DigitalOcean's documentation.
The token's scopes can be checked against the API.

## Properties the answer is scored against

Derived from the moments the account can be charged: a token being created, used and leaked; a
script creating resources; a spike leaving resources behind; a month of traffic; a card failing; the
maintainer signing in, or being unable to; and, later, a pipeline or a recovery script holding a
token of its own.

1. **A leaked credential or a faulty script can create only a bounded amount.** Rests on the
   maintainer's wish never to find a larger bill than expected, stated on 2026-09-30.
2. **Spending beyond the expected amount reaches the maintainer within hours.** Same source.
3. **The account's sign-in resists takeover.** Same source, and the security theme in
   [../guarantees/README.md](../guarantees/README.md).
4. **A failed payment never powers the machine down without the maintainer knowing first.** Rests on
   the account entry under **Risk** in
   [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md).
5. **The cost of traffic is bounded, or noticed before it grows.** Same source as property 1.
6. **Keeping these true needs no recurring attention.** Rests on property 5 of
   [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md),
   the maintainer's "it just works" and "it's so easy".
7. **The maintainer can always get back into the account.** A lockout is not a charge, but it stops
   a bill being paid or a machine being restored, so it ends in the late-payment path of property 4.
   Rests on the account entry under **Risk** in
   [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), and on
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md),
   whose host replacement needs someone able to act on the account.
8. **A token held by automation is bounded the same way as one held by a person.** A deploy pipeline
   and the no-person recovery that property 5 of
   [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) makes reachable will
   each hold a token, stored somewhere other than the maintainer's laptop. Added 2026-09-30.
9. *Replaced 2026-09-30 by 9a and 9b.* It read "Spending past a set amount is stopped, not only
   reported", from the maintainer's "I would ideally like to block overbilling rather than only alert
   on it if that's possible." The maintainer then ruled out stopping the site, and drew the line
   between illegitimate spending, to be blocked, and popularity, to be decided when it happens.
   - **9a. Illegitimate creation or use of billed resources is prevented, not only reported.** The
     maintainer, 2026-09-30: "If it's something illegitimate, I would want that blocked."
   - **9b. Traffic cost, legitimate or not, reaches the maintainer long before it nears the ceiling,
     and nothing takes the site down to stop it.** The maintainer, 2026-09-30: "No, I don't want the
     site to go down", and "If it's site popularity, that'll be interesting to decide what to do
     about." The ceiling is
     [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md)'s.
11. **An alert reaches the maintainer even when one channel fails or the maintainer is away.**
    Charges grow slowly enough that how long nobody looks decides the bill, not how fast an alert
    fires. Rests on the same wish as property 1. Added 2026-09-30.
10. **Stopping spending never destroys the store or its copy.** Rests on
    [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md).
    It exists because the bluntest way to stop a charge, deleting the resource or letting a payment
    fail, is also the way the store is lost. Added 2026-09-30.

**Deferred:** other accounts that bill for running the system. The store's off-machine copy will sit
in a second provider's account, and
[ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md)
counts its charges. That account is chosen by
[how is the store backed up?](how-is-the-store-backed-up.md), which applies these properties to it.

**Resources.** Network binds, as outbound transfer is the one charge that grows with players rather
than with what we create, which is property 5. CPU, memory and storage do not bind: they are bought
in fixed sizes, so they change the bill only when something is created or resized, which properties 1
and 8 cover.

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

**A team's Droplets are capped by a tier, which bounds what a leaked token can create.**

- The lowest tier allows 3 Droplets, and only "Basic Shared CPU Droplets, up to $48". The highest
  allows 100 of any kind.
- The tier also caps load balancers, reserved IPs, volumes and inference. The page gives no tier
  limits for Spaces, Kubernetes or databases.
- The page does not say which tier a new team starts at, or whether tiers rise by themselves. Team
  owners can "view resource usage and increase limits".
- So a leak at tier 1 is bounded at about 3 × $48 = $144 a month of Droplets, plus whatever products
  the tier does not cap. *Reasoned from the table.*
- This account's tier is unknown. The API's `GET /v2/account` returns it as `droplet_limit`, but the
  current token lacks `account:read` and got a 403 on 2026-09-30.

*Sourced — [resource limits](https://docs.digitalocean.com/platform/resource-limits/), opened by the
session that wrote this on 2026-09-30. This replaces an earlier entry taken from search summaries
and never opened.*

**A failed payment puts the account on hold, then powers it down, then may delete it, and the owner
is emailed at the first two stages.**

- Past due: "We email the account owner" and "We place the account on hold, which prevents creating
  new resources". "The account's existing resources continue to run."
- Suspended: "We email the account owner and the account is suspended", and "We power down the
  account's resources".
- Then "we may permanently delete the account's resources. Deleted resources cannot be recovered."
- "DigitalOcean does not publish fixed timelines for these stages."
- After paying, "you need to manually turn your resources (like Droplets) back on".

So an email reaches the owner before anything powers down. How long the gap is, nobody says.

*Sourced — [late payments](https://docs.digitalocean.com/platform/billing/late-payments/), opened by
the session that wrote this on 2026-09-30.*

**The API token used for the measurements.** It has custom scopes covering Droplets and SSH keys, but
not account reading or tag creation, as `doctl` showed on 2026-09-30.

**The numbers a spend alert sits against** are in [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md): about $10 a month for hosting as a
preference, and $20 as a ceiling.

**What the maintainer set on 2026-09-30:**

- a spend alert;
- "Secure Sign-In", which admits only members who sign in "via Google or GitHub or a DigitalOcean
  account with two-factor authentication". The maintainer signs in with GitHub;
- a 30-day token, to be deleted once the measurement work ends.

**Secure Sign-In does not check for 2FA on a Google or GitHub sign-in.** "This setting doesn't
strictly require 2FA. Google and GitHub sign-ins are accepted for secure sign-in, but DigitalOcean
does not detect or enforce 2FA for these sign-in methods." So the account's sign-in is as strong as
the GitHub account's. Whether that account has 2FA could not be read on 2026-09-30: `gh api user`
returned `two_factor_authentication: null`, which is what a token without the `user` scope sees.
Teams settings can be changed only in the control panel, not the API or `doctl`.

*Sourced — [require secure sign-in](https://docs.digitalocean.com/platform/teams/how-to/require-secure-sign-in/)
and [secure sign-in](https://docs.digitalocean.com/platform/teams/settings/secure-sign-in/), from a
search summary of both pages on 2026-09-30. The quote was not opened at its page.*

**Spend alerts can be set at several thresholds, on total spend or on chosen products, and arrive
only by email.** The page offers preset percentages and "Add custom threshold", and a choice between
"Total spend" and "Specific products". It mentions no webhook or API for receiving them. *Sourced —
[spend alerts](https://docs.digitalocean.com/platform/billing/billing-alerts/), opened by the session
that wrote this on 2026-09-30.*

**Costs found that sit outside a Droplet's price:**

- a reserved IPv4 costs $5 a month while it is not assigned;
- uptime checks cost $1 a month each after the first;
- Spaces costs from $5 a month once enabled;
- backups cost 20 or 30% of the Droplet's price.

*Read by research agents on 2026-09-29 and 30 from DigitalOcean's
[reserved IP pricing](https://docs.digitalocean.com/products/networking/reserved-ips/details/pricing/),
[uptime pricing](https://docs.digitalocean.com/products/uptime/details/pricing/),
[Spaces pricing](https://www.digitalocean.com/pricing/spaces-object-storage) and
[backup pricing](https://docs.digitalocean.com/products/backups/details/pricing/). The uptime figure
was opened by the session that wrote this. The reserved IP figure was opened on 2026-09-30 by a later
session: "$5.00 per month ($0.01 per hour) when reserved but not assigned", and reserved IPv6 is free.
The Spaces and backup figures are still the agents' reading.*

### First research pass, 2026-09-30

*Four research agents read DigitalOcean's and GitHub's docs, one per group of properties plus one
listing every approach. Each claim below says whether the session that wrote this opened it at its
source or is passing on an agent's reading.*

**Nothing DigitalOcean offers stops spending without stopping the machine.** Three facts, each opened
at its source:

- "Droplets incur charges for as long as they remain on the platform, even if they are powered down."
  So powering off does not stop a Droplet's charge, and destroying it destroys the store. *Sourced —
  [unrecognised charges](https://docs.digitalocean.com/support/i-dont-recognize-a-charge-on-my-invoice/).*
- Prepayment caps nothing: "Prepayment does not waive the Customer's obligation to pay for usage
  exceeding the credit balance." *Sourced —
  [prepayment terms](https://www.digitalocean.com/legal/prepayments-and-resource-tier-terms).*
- A limited card ends in the late-payment path above. "We currently do not accept prepaid cards",
  and the page suggests PayPal instead. *Sourced —
  [card declined](https://docs.digitalocean.com/support/why-was-my-card-declined/).*

**A failed mid-month charge can suspend the account at once.** The prepayment terms say: "If an
Auto-charge amount is met and the primary payment method fails, DigitalOcean reserves the right to
suspend account access and resource availability immediately until the balance is settled." The
auto-charge amount is $25 at tier 1 and $50 at tier 2. It applies when a team "does not have a payment
history yet". This qualifies the late-payment finding above: an email before power-down is the
documented path for a failed monthly charge, but not a promise for a failed auto-charge. *Sourced —
the [prepayment terms](https://www.digitalocean.com/legal/prepayments-and-resource-tier-terms) and
[paying bills](https://docs.digitalocean.com/platform/billing/pay-bills/), both opened.* The late
payments page also says "If the default payment method fails, we try charging other payment methods
on file", so a backup card is the documented defence. *Agent's reading, not opened.*

**The Droplet limit loosens by itself.** "As you build payment history over time with successful,
non-zero invoices, your tier and limits can increase automatically." So property 1's bound from the
tier table is a bound for a new account only. No page was found saying an owner can lower a limit.
*Sourced — [paying bills](https://docs.digitalocean.com/platform/billing/pay-bills/), opened.*

**Token scopes separate creating from deleting.** The Droplet scopes are `droplet:read`,
`droplet:create`, `droplet:update`, `droplet:delete` and `droplet:admin`. The firewall scopes are
`firewall:read`, `create`, `update` and `delete`. The one billing scope is `billing:read`. The aliases
`api:read` and `api:write` "automatically expand to include new API endpoints". The page says nothing
about limiting a token to a project or tag. *Sourced —
[scopes](https://docs.digitalocean.com/reference/api/scopes/), opened.*

- So a token can be denied creation, but a token that can delete one Droplet can delete every Droplet,
  including the one holding the store. *Reasoned from the scopes.*
- "You cannot edit the scope of a token after creation." *Agent's reading, not opened.*
- A token exposed publicly in a new-format `dop_v1_` token is revoked automatically: "we will
  automatically revoke it and notify you". *Agent's reading, not opened.*
- Deploying over SSH needs no DigitalOcean token. *Reasoned: SSH reaches the machine without the
  API.*

**Spend alerts cannot see transfer until it is invoiced.** "Because alerts are based on actual usage,
projections of Droplet transfer in excess of the transfer pool do not trigger an alert until they are
applied to the invoice." So property 5 is not met by spend alerts. *Sourced —
[spend alerts](https://docs.digitalocean.com/platform/billing/billing-alerts/), opened.* Whether the
billing API's `month_to_date_usage` includes transfer before the invoice is unknown.

**DigitalOcean Monitoring can alert on a Droplet's outbound traffic.** Its metrics include "Public
Outbound Bandwidth", over windows of "5 min, 10 min, 30 min, or 1 hour", to email or Slack. It is "a
free, opt-in service", and "Only Droplets with the DigitalOcean metrics agent installed are available
to select." The page gives no unit. An agent read it as a rate in Mbps, which catches a surge but not a
slow climb toward the pool. *Sourced —
[set up alerts](https://docs.digitalocean.com/products/monitoring/how-to/set-up-alerts/), opened.*

**What a traffic overage costs.** At $0.01 per GiB beyond the 1 TB pool, reaching the $20 ceiling
from a $6 Droplet takes about 1.4 TB beyond the pool in a month, or roughly 4 to 5 Mbps sustained on
top of the pool's own share. *Reasoned from the bandwidth figures above.*

**Losing GitHub can lose the DigitalOcean account for days, or for good.**

- GitHub: "GitHub Support will not be able to restore access to accounts with two-factor
  authentication enabled if you lose your two-factor authentication credentials." The recovery methods
  are recovery codes, passkeys, security keys, a fallback phone number, and verified devices, SSH keys
  or personal access tokens. A request is answered "within three business days". *Sourced —
  [recovering 2FA](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/recovering-your-account-if-you-lose-your-2fa-credentials),
  opened.*
- DigitalOcean: "open a support ticket using the email associated with your DigitalOcean account and
  let us know you need to reset your authentication method", with "a photo of your government-issued
  ID", and the name on it must match the account. No turnaround is stated. *Sourced —
  [lost GitHub access](https://docs.digitalocean.com/support/i-lost-access-to-the-github-account-i-use-to-sign-into-digitalocean/),
  opened.*
- A DigitalOcean account signs in one way: email and password with DigitalOcean's own 2FA, or GitHub,
  or Google. DigitalOcean's 2FA offers an authenticator app or SMS and backup codes, and no security
  keys were found. A second team owner is possible by changing a member's role. Whether a team can have
  two owners was found only in an old community answer. *Agent's reading, not opened.*

**No alert for a new sign-in or a new token was found** in DigitalOcean's docs. *Agent's reading.*

**A schedule on GitHub Actions stops by itself in a quiet public repository.** "In a public
repository, scheduled workflows are automatically disabled when no repository activity has occurred in
60 days." This repository is public. *Sourced —
[disabling a workflow](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/disabling-and-enabling-a-workflow),
opened.*

**Reported causes of surprise DigitalOcean bills** are a compromised Droplet sending traffic, often
through an exposed service or a weak SSH password, and forgotten resources, including powered-off
Droplets. *Agent's reading of secondhand sources and one community thread title. Weak.*

### Second research pass, 2026-09-30

*Three research agents read DigitalOcean's, GitHub's and Cloudflare's docs on usage-billed products,
teams and tokens, and a kill switch. As before, each claim says who opened it.*

**This account, as the maintainer's console showed it on 2026-09-30:** tier 2, with an auto-charge
amount of $50. Limits: 10 Droplets, 0 Droplet GPUs, 4 database clusters, 1 load balancer, 10
reserved IPs, 2 TB and 5,000 volumes, 15 each of GenAI agents, knowledge bases, guardrails and hosted
agent sessions, and 0 dedicated inference endpoints. **Three GenAI guardrails exist that the maintainer
did not create.** Guardrail usage "is tracked per agent and billed based on usage", so an idle one
costs nothing. Where they came from is unknown. *Agent's reading for the billing quote.*

**Serverless inference cannot run up a bill past its prepaid balance.** It needs "a positive prepaid
account balance before you can send inference requests", and "When your balance reaches $0,
DigitalOcean suspends your access to Serverless Inference until you replenish it." Auto-reload exists
but is off by default. The balance is per team. Tiers 1 and 2 "do not have access to any Anthropic
models and OpenAI models (except gpt-oss-120b and gpt-oss-20b)". *Sourced —
[inference prepayment](https://docs.digitalocean.com/products/inference/how-to/manage-serverless-inference-prepayment/)
and [inference limits](https://docs.digitalocean.com/products/inference/details/limits/), opened.*
This refutes an agent's estimate in this pass of $3.8k to $43k a day from tier 2's token-rate quota,
which assumed usage is billed afterwards and priced Anthropic models tier 2 cannot call. Turning on
auto-reload or adding a balance needs the control panel, as far as anything found says, so the route
to an inference bill is a taken-over sign-in rather than a token. *Reasoned; no API for prepayment was
found, which is the absence of a mention.*

**What a token that can create things could cost at tier 2, per month:**

- Databases: the largest single node listed is MongoDB at "$975.24". Four clusters of one node is
  about $3,900, and standby nodes would multiply that. Whether the tier limits a cluster's size was not
  found. *Sourced — [database pricing](https://www.digitalocean.com/pricing/managed-databases), opened.*
- Droplets: 10 at up to $84 is $840. *Agent's reading of the resource-limits page.*
- Volumes: 2 TB at $0.10 per GiB is about $200. *Agent's reading.*
- Spaces, Functions and App Platform appear in no tier limit, and bill by use or by count. *Agent's
  reading.*

So a leaked token with broad create scopes could cost several thousand dollars a month, and a token
that can create only Droplets about $840, while the tier stays at 2. *Reasoned from the figures above.*

**Teams are billed separately.** "Each team has separate billing and its own payment information
unless it belongs to an organization." Teams cost nothing. Whether a new team starts at tier 1 was not
found. *Agent's reading of [teams](https://docs.digitalocean.com/platform/teams/), not opened.*

**Spend alerts go to owners and billers, by email.** A biller has full access to billing and nothing
else, so a second address the maintainer controls, invited as a biller, is a second recipient. Whether
a team can have two owners is still unconfirmed. *Agent's reading of
[predefined roles](https://docs.digitalocean.com/platform/teams/roles/predefined/), not opened.*

**Tokens.** No API to list or revoke personal access tokens was found; the control panel does it. No
notification on token creation or new sign-in was found. *Agent's reading.* A Droplet's metadata
service lists no API token. *Agent's reading of
[metadata](https://docs.digitalocean.com/products/droplets/how-to/retrieve-droplet-metadata/).*

**A kill switch has nowhere good to run, and its token can delete production.**

- DigitalOcean Functions' scheduled triggers "are currently in private preview", with "a maximum of 3
  triggers" and "no charge … during private preview but this is subject to change". *Agent's reading
  of [schedule functions](https://docs.digitalocean.com/products/functions/how-to/schedule-functions/).*
- Cloudflare Workers' free plan allows 5 cron triggers a minute apart at least, with 50 subrequests per
  run. That is a second provider's account holding a DigitalOcean token. *Agent's reading.*
- GitHub Actions stops a schedule after 60 days without activity in a public repository, per the first
  pass.
- Delete scopes exist per product, but none can be limited to some resources. A token with
  `droplet:delete` can delete the Droplet holding the store. DigitalOcean has no deletion protection
  for Droplets; a request for it has been open on its ideas board since 2021. *Agent's reading.*
- The balance API's `month_to_date_usage` is "Amount used in the current billing period as of the
  `generated_at` time". How fresh it is, and whether it includes transfer before the invoice, is not
  documented. *Agent's reading of DigitalOcean's OpenAPI specification.*
- An attacker who has taken over the sign-in can delete the kill switch's token in the control panel.
  So the switch stops only what a token or a forgotten resource causes. *Reasoned.*
