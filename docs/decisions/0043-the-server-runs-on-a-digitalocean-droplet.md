---
number: 0043
status: accepted
date: 2026-09-30
---

# 0043 — The server runs on a DigitalOcean Droplet

## Forced by

- [ADR-0010](0010-the-store-needs-a-host-so-this-system-has-a-server.md) makes this system have a
  server, and M1 slice 4 in [../questions/README.md](../questions/README.md) needs it deployed.
- [ADR-0017](0017-nothing-on-the-request-path-scales-to-zero.md),
  [ADR-0018](0018-the-server-does-not-run-in-a-constrained-isolate.md),
  [ADR-0021](0021-the-server-and-its-store-share-a-machine.md),
  [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md),
  [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md),
  [ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md) and
  [ADR-0042](0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md) set what any
  host must allow.
- The maintainer's stated aims for the choice, recorded in
  [where does this run?](../questions/where-does-this-run.md): "it just works", "it's so easy" and
  "great price", with about $10 a month as the ideal ceiling.

## Scored against

These are the properties that decided the choice. The full list, and each candidate's score on it,
are in the question's passes. Each line names that question's row.

1. The process runs continuously and is never stopped for inactivity (row 4, [ADR-0017](0017-nothing-on-the-request-path-scales-to-zero.md)).
2. The store's disk is inside the machine and survives a restart and a redeploy (rows 6 and 7,
   [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) and [ADR-0042](0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md)).
3. The client's files and the API answer on one hostname that resolves to the host's own address
   (rows 1, 2a and 18, [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md) and [ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md)).
4. A maintenance event or failing hardware on the host costs the store minutes, not days (row 25, the
   maintainer's "stable").
5. A lost machine can be replaced and restored with no person involved: machines are created through
   an API, and the address can move to a new one (row 29, [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)'s Risk).
6. The host watches the machine and alerts on memory, disk and reachability without our running
   anything (row 35, the maintainer's "great observability").
7. The whole setup, the machine plus what recovery needs, costs about $10 a month or less (P0, the
   maintainer).
8. The price changes only when we change something (row 26).
9. The setup can be run on the maintainer's Mac the way it runs deployed (L1,
   [ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)).
10. Leaving costs a redeploy and a copy of the store (row 16,
    [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)).
11. The host offers a North American region (row 19, the maintainer's working assumption about
    where the first players are).

**Maximums.** Maximum safety is a store that survives any host event without a person. Maximum
performance is a request that crosses nothing it could avoid. Maximum experience is nothing to
build or watch. No candidate reached all three at this price. A managed database comes closest on
safety and experience, at three to twelve times the price.

## Decision

**The server runs on a DigitalOcean Droplet**: a Basic, shared-CPU virtual machine whose disk is
inside it, in a North American region.

- **Size.** 1 GB of memory at launch, $6 a month. On a real Droplet, the stack used at most 373 MB of
  961 MB with Ubuntu included, during deploys under load. The measurement is in the twelfth pass of
  [where does this run?](../questions/where-does-this-run.md). A resize that changes only CPU and
  memory can be reversed.
- **Region.** Which North American region is left to
  [which region does the machine run in?](../questions/which-region-does-the-machine-run-in.md).
- **Resources.**
  - **Memory binds lightly.** A fresh Droplet has no swap, so the app's memory is capped by its
    service.
  - **CPU does not bind** at this workload, provided nothing CPU-heavy shares the machine.
  - **Storage binds by where it is**, and row 2 settles that.
  - **Network binds as round trips**, and the region settles that.

**What this does not settle:**

- **How the app runs on the machine.** That is the next record.
- **Whether the store stays a file.** That is
  [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md), amended from the same question.
- **Where the copy of the store goes.** That is
  [how is the store backed up?](../questions/how-is-the-store-backed-up.md).
- **What triggers a deploy.** That is [what deploys the code?](../questions/what-deploys-the-code.md).

## Enforced by

**Nothing yet.** It is true once M1 slice 4 deploys to a Droplet.

## Rejected

- **Linode (Akamai), $5 a month.** Its case is strong: it ties DigitalOcean on nearly every row, it
  publishes more postmortems, and its IP Sharing moves an address to a standby without our scripting
  it. It fails property 6: its alerts cover CPU, disk activity and traffic, with no memory or
  disk-space alert and no outside uptime check, per an agent's reading on 2026-09-30.
  **Reverses if** Akamai adds memory and disk-space alerts to compute instances.
- **Fly.io, one machine with a volume, about $2.50 to $4.50.** Its case is ease: TLS, restarts and
  host patching are supplied, and it is the cheapest managed option. It fails property 4:
  "Volumes are pinned to physical hosts, so when there's a host outage the volume is unreachable",
  and "A host can be down for an hour, or a day, or sometimes longer". Recovery is a restore we run,
  losing what the copy has not caught.
  **Reverses if** Fly moves a volume off a failing host itself.

  *Sourced: [host unavailable](https://docs.fly.io/apps/trouble-host-unavailable/), opened
  2026-09-29.*
- **A managed database with a stateless server** (Fly with Neon, Fly Managed Postgres, DigitalOcean
  App Platform with Managed PostgreSQL, Render). Its case is the strongest on "it just works":
  failover is supplied, and restarts drop nothing without our own plumbing. It fails property 7. The
  cheapest setup with automatic recovery was about $31 a month. DigitalOcean's own database with a
  standby is "$30.00 per month … with at least one $30.00 per month matching standby node".
  **Reverses if** a managed database with automatic recovery fits within about $10 a month with the
  server. That is also [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md)'s condition.

  *Sourced: DigitalOcean's
  [database pricing](https://docs.digitalocean.com/products/databases/postgresql/details/pricing/),
  opened 2026-09-30. The other prices are in the eighth pass.*
- **Hetzner Cloud.** Its case is value in Europe. It fails property 7 in North America: its cheapest
  plan in a US location was $21.09 a month when read in a browser on 2026-09-29.
  **Reverses if** Hetzner prices a US plan within the target.
- **Vultr, $5 to $6 a month.** It fails property 4: no Vultr page says it live-migrates a machine for
  maintenance, and the reports found describe reboots instead. DigitalOcean documents live migration.
  **Reverses if** Vultr states in writing that it live-migrates.
- **RackNerd, $21.99 a year.** Its case is price, about a third of DigitalOcean's. It fails property 5:
  its API manages only servers that already exist, so a replacement is ordered by hand. The
  maintainer ruled on 2026-09-30 that this does not disqualify it alone, and weighed it against the
  price. So RackNerd lost on that weighing, not on one property. Its terms also say it "is not
  responsible for data integrity, regardless of circumstance".
  **Reverses if** RackNerd offers an API to create a machine.
- **Not yet.** Rejected because M1 slice 4 cannot deploy without a host.

The rest of the field is in the question's passes, each with the property it failed: Railway,
Render, Northflank, Sliplane, Upsun, Koyeb, Scaleway, Lightsail and several smaller VPS providers.

## Risk

- **One machine.** Its host dying takes the server down until a replacement is built and the store
  restored. No-person recovery (property 5) is reachable but not built.
- **The account.** If a payment fails, DigitalOcean powers the account's resources down and may
  delete them, and "DigitalOcean does not publish fixed timelines for these stages". The off-machine
  copy is what survives that.
- **The provider.** DigitalOcean's growth is in AI. Its $6 plan was unchanged on 2026-09-30, and
  property 10 keeps leaving cheap if that changes.

## Revisit when

- DigitalOcean changes the price of its Basic Droplets beyond the target, or stops live-migrating for
  host maintenance.
- A managed database with automatic recovery fits the price target.
- The first players turn out not to be in North America.
- The server's measured memory approaches the machine's.

## Also update

- [x] questions/README.md: a **Given** for M1 slices 4, 5 and 6. Slices 5 and 6 no longer wait on
  the host.
- [x] questions/where-does-this-run.md: its open entry records that this settles the host, and what
  is left.
- [x] constraints.md: what a fresh Droplet has, measured and sourced
- [x] architecture.md: the machine is a Droplet, and only its region stays open
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
