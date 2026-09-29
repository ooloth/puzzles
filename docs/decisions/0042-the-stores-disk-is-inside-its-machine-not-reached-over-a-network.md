---
number: 0042
status: accepted
date: 2026-09-28
---

# 0042 — The store's disk is inside its machine, not reached over a network

## Forced by

- [ADR-0020](0020-the-stores-engine-is-sqlite.md) makes the store SQLite, and
  [ADR-0021](0021-the-server-and-its-store-share-a-machine.md) puts its file on the server's
  machine, on a filesystem that machine mounts. That leaves open whether the disk under that
  filesystem is inside the machine or is network block storage: a virtual disk on a provider's
  storage servers, attached to one machine over the provider's network.
- "Databases — SQLite commits wait on a sync" in [../constraints.md](../constraints.md): in WAL mode
  with full durability, every commit waits for one `fsync`, and reads never sync.
- [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) requires a
  copy of the store off the machine, whatever the disk, so the machine's loss is survived by that
  copy.
- The portable performance standard: a design adds no network hop it could avoid unless the hop buys
  a property nothing else provides. The portable decision-making standard: a benefit is weighed net
  of what the system already owes by other means.

## Scored against

Derived from the moments the store's disk is touched: a player's write reaching the server and being
committed, a read of a puzzle or a board, the machine being lost, and a burst of writes at the start
of a day's play.

1. SQLite's locking and single-host requirements hold (the WAL and corruption pages cited in
   [../constraints.md](../constraints.md)).
2. A committed write waits on no network round trip beyond the player's own request (the portable
   performance standard; the sync per commit in [../constraints.md](../constraints.md)).
3. The rate of commits is not capped by a provider according to how large the disk is (the portable
   performance standard: a capacity ceiling someone else sets).
4. The store survives the machine's loss, weighed net of the off-machine copy
   [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) already requires.
5. A write the disk acknowledges is durable (SQLite trusts `fsync`, per
   [../constraints.md](../constraints.md)).

Property 1 separates nothing: a block device attached to one machine carries a filesystem that
machine mounts and locks itself, so SQLite's needs hold on either disk. Property 5 separates
nothing: no provider examined states that an acknowledged write is durable, for either kind of disk.
Property 4 separates little once weighed net: the copy
[ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) requires covers the
machine's loss on either disk, and what network block storage adds is only the writes made since that copy was last
updated.

**Maximums.** Maximum performance is a commit that crosses no network. Maximum safety for this
property is a committed write that survives the machine being destroyed, which needs a copy somewhere
else, so a copy has to cross a network at some point. A disk inside the machine, with the copy
updated continuously off it, pays that crossing in the background rather than on every commit, and
comes close to both. Whether the client can close the remaining gap, by keeping each change until
the off-machine copy has it, belongs to
[how is the store backed up?](../questions/how-is-the-store-backed-up.md) and is not settled here.

## Decision

**The disk holding the store is inside the machine that runs the server.** Network block storage is
not used for it.

**Resources.** Storage and network bind, as the location of the disk and the round trip per commit.
CPU and memory do not bind: neither kind of disk changes the work the server does or what it holds.

**This holds only if the off-machine copy is continuous.** If
[how is the store backed up?](../questions/how-is-the-store-backed-up.md) settles on a copy taken
periodically, the writes since the last copy are lost with the machine, and property 4 separates the
two kinds of disk again.

## Enforced by

**Nothing yet.** [Where does this run?](../questions/where-does-this-run.md) scores hosts against
this, and the chosen host is what makes it true.

## Rejected

- **Network block storage**, such as Google's persistent disk, AWS EBS or Hetzner Volumes. Its case
  is real: the disk is replicated across several servers and survives its machine, so the store
  outlives a host failure with no copy of our own. It fails property 2: every commit waits on a
  round trip to the storage servers, which AWS puts at "single-digit milliseconds" and Google
  publishes no figure for on its standard disk. Its survival benefit is mostly owed already by the
  off-machine copy. **Reverses if** the off-machine copy cannot be made continuous, or if a provider's
  network block storage is measured adding no latency a commit would notice.

  *Sourced — AWS's [EBS features](https://aws.amazon.com/ebs/features/): "The average latency
  between EC2 instances and EBS is single-digit milliseconds"; Google's
  [disk performance](https://docs.cloud.google.com/compute/docs/disks/performance) gives no latency
  for its standard disk. Read by research agents 2026-09-28; the working is under "Local disk against
  network block storage" in [where does this run?](../questions/where-does-this-run.md).*
- **Not yet.** Rejected because the host question scores candidates on the disk now, and several
  hosts differ on exactly this.

## Risk

**A disk inside the machine dies with it.** Fly: "Volumes are pinned to physical hosts, so when
there's a host outage the volume is unreachable." Until the off-machine copy exists at M3, a machine
failure loses the store outright. *Sourced — Fly's
[host unavailable](https://docs.fly.io/apps/trouble-host-unavailable/), opened 2026-09-28.* [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) already names that gap.

**The argument rests on a later question.** If the M3 copy is not continuous, the balance shifts,
and this record should be revisited rather than kept by default.

## Revisit when

- [How is the store backed up?](../questions/how-is-the-store-backed-up.md) settles on a copy that is
  not continuous.
- A commit's latency on a candidate's network block storage is measured and found below what a
  player's request would notice.

## Also update

- [x] questions/README.md: a **Given** for M1 slice 4
- [x] questions/where-does-this-run.md: property 6 cites this record
- [x] questions/how-is-the-store-backed-up.md: this record needs the copy to be continuous
- [x] constraints.md: SQLite's sync per commit, and reads never syncing
- [x] unfinished.md: the entry on [ADR-0021](0021-the-server-and-its-store-share-a-machine.md)'s block-device clause is removed
- [x] [ADR-0021](0021-the-server-and-its-store-share-a-machine.md): its block-device clause is removed, and it links here
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] architecture.md: no change
