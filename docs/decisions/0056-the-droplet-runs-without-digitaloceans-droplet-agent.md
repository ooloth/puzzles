---
number: 0056
status: proposed
date: 2026-10-06
---

# 0056 — The Droplet runs without DigitalOcean's Droplet agent

## Forced by

- [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md): software
  on the machine changes at one daily hour.
- DigitalOcean installs its Droplet agent by default: "You cannot currently opt out of installing the
  Droplet agent when creating a Droplet using the control panel", while the API takes
  `"with_droplet_agent":false`, per
  [manage the agent](https://docs.digitalocean.com/products/droplets/how-to/manage-agent/).
- It is not the metrics agent, which
  [ADR-0047](0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)'s traffic alert
  needs and
  [how is DigitalOcean's metrics agent installed and kept updated?](../questions/how-is-digitaloceans-metrics-agent-installed-and-kept-updated.md)
  is about. `doctl` has a flag for each.

## Scored against

Derived from what the Droplet agent does: it serves the browser Droplet Console, runs as root, writes
`authorized_keys` from the account's keys, and updates itself.

1. Software on the machine changes only at the daily hour
   ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
2. A way back after a lockout does not need a network route
   ([ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md)),
   which is what decides whether the agent's console is worth anything.

**Resources.** Memory would bind under property 11 of the access question, but the agent was not
measured, so it is not used.

## Decision

**The production Droplet is created through the API with `--droplet-agent=false`, so DigitalOcean's
Droplet agent is never installed, and the browser Droplet Console is not available.** The Recovery
Console, which needs no agent, is the console that matters, per
[ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md).

Observed on 2026-10-06: a Droplet created with `doctl compute droplet create --droplet-agent=false`
had no `droplet-agent.service` and no `/opt/digitalocean`.

**What it commits us to:** the Droplet is created with `doctl` or the API, never from the control
panel, since the panel cannot leave the agent out. That fits the token held by hand under
[ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md).

## Enforced by

**Nothing yet.** It is true once M1 slice 4's setup creates the Droplet with the flag. Nothing checks
that a Droplet still has no agent.

## Rejected

- **Keeping the agent** fails property 1: its README says "Hourly package update checks are handled
  by `droplet-agent-update.timer`", per
  [the agent's repository](https://github.com/digitalocean/droplet-agent), so its software changes
  outside the daily hour. That is read from the README and was not observed. What it would buy, the
  Droplet Console, "connects to Droplets using the network, like other SSH-based clients", so it
  fails whenever SSH does and is no way back under property 2. **Reverses if** the agent is updated
  only through a repository the daily run governs, under
  [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
  or a feature the system needs comes to depend on it.
- **Not yet** — the default installs it at creation, and taking it out afterwards is a step by hand
  on every rebuild.

## Risk

- **No Droplet Console** for a quick shell from the browser. SSH and the Recovery Console remain.
- **The control panel cannot create this Droplet.** Creating one in a hurry from the panel would
  install the agent. Whether a rebuild from the panel installs it was not checked: the spike rebuilt
  its Droplet without looking for the agent afterwards.

## Revisit when

- DigitalOcean lets the panel leave the agent out, or ships it through a repository that meets
  [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md).
- Something the system needs requires the agent.

## Also update

- [x] questions/README.md: slice 4 gains this record as a **Given**
- [x] questions/how-is-the-server-reached-and-hardened.md: part E is settled here, and its rejection
      was re-filed on property 1 before this record was drafted
- [x] architecture.md: nothing
- [x] constraints.md: nothing
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing
