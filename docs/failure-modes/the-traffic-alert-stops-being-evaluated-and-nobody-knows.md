---
updated: 2026-10-07
update_when: alerting on the machine lands, DigitalOcean changes how it treats alerts on Droplets without its agent, or how traffic is reported changes
decays: slow
status: active
---

# The traffic alert stops being evaluated and nobody knows

## Threatens

No promise to players directly. It threatens
[ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md), which
reports runaway traffic by alert rather than stopping it, so a machine sending traffic bills at $0.01
per GiB until someone notices.

## How it happens

1. The production Droplet carries no metrics agent, and its outbound-traffic alert is attached
   through the API by tag, per
   [ADR-0060](../decisions/0060-outbound-traffic-is-alerted-on-by-digitalocean-with-no-metrics-agent-on-the-droplet.md).
2. DigitalOcean evaluates that policy today, though its docs say alerts need the agent, per "Hosting —
   DigitalOcean's metrics agent" in [../constraints.md](../constraints.md).
3. DigitalOcean stops evaluating policies on Droplets without the agent, or its monitoring has an
   outage, or the Droplet is replaced without the tag.
4. The policy still exists and reads as configured. No email arrives, because nothing crossed a
   threshold that nothing is checking.

## Why here specifically

**Quiet looks the same as broken.** An alert that is not firing and an alert that cannot fire send
the same nothing, and a small public site's ordinary traffic is far below the threshold, so silence
is the normal state.

**The arrangement rests on behaviour DigitalOcean does not document**, so a change to it would arrive
without notice.

## How we'd notice

**Nothing would tell us, today.** The policy is listed by `doctl monitoring alert list` whether or not
it is evaluated. [How is the server operated?](../questions/how-is-the-server-operated.md) at M10 is
where a check that the alert still fires is decided.

## What reduces it

**A check that makes the alert fire on purpose**, such as a policy with a threshold the machine's
normal traffic crosses, kept alongside the real one, or a periodic burst of traffic. Either would be
decided at M10. Creating the Droplet with its tag in the same command as the rest of its setup keeps
step 3's replacement case from depending on a second step. Nothing yet.
