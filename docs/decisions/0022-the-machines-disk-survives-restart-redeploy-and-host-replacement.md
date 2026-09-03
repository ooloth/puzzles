---
number: 0022
status: accepted
date: 2026-09-03
---

# 0022 — The machine's disk survives restart, redeploy and host replacement

## Forced by

**[ADR-0009](0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) makes this store the
copy that survives when the device does not.** A copy that does not survive a redeploy is not that.

**[ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) and
[ADR-0021](0021-the-server-and-its-store-share-a-machine.md) put that copy in a file on the machine
running the server**, so the machine's storage is now the thing the promise rests on.

## Decision

**The disk holding the store persists across three events: the process restarting, the application
being redeployed, and the machine being replaced.**

**This is separable from [ADR-0021](0021-the-server-and-its-store-share-a-machine.md) and is not
implied by it.** A local file on ephemeral storage satisfies co-location perfectly and fails this
entirely — Cloud Run gives a process a local filesystem that is memory-backed and per-instance, so an
arrangement that looks correct at every other layer loses the data on the next deploy. Somebody can
satisfy one of these records and break the other, which is the test for whether they are one decision
or two.

**The third event is the one that needs saying.** Surviving a restart is what a volume is for.
Surviving a redeploy is a platform behaviour that varies. Surviving the *machine* — the underlying
host failing or being replaced — is not something a single attached volume provides, so satisfying
this claim requires a copy that is not on that machine. That is
[how is the store backed up?](../questions/how-is-the-store-backed-up.md), and this record is why it
is not optional.

## Rejected

- **Ephemeral storage, with durability provided entirely by continuous replication off the machine.**
  A coherent design: treat the local file as a cache, stream every write to object storage, and
  rebuild on start. It removes the volume as a thing to provision and pay for. Rejected on the single
  reason that it makes every restart a restore, so the recovery path is exercised constantly but the
  window between a write and its replication becomes the data-loss window on *ordinary* operations
  rather than on rare ones. **Reverses if** replication becomes synchronous rather than asynchronous,
  at which point the local file genuinely is a cache.

- **A volume that survives restarts but not redeploys.** Not a design anybody chooses on purpose, and
  the one people arrive at by accident on platforms where a deploy replaces the instance. Named here
  so that it is recognisable as a defect rather than discovered as a surprise. **Reverses** never;
  this is a bug wearing a configuration.

- **Requiring the machine itself to survive**, by choosing a provider that guarantees the host. No
  provider examined offers this, and Fly states the opposite in its own documentation. Rejected
  because it is not available rather than because it is unwanted.

## Risk

**A single volume has no redundancy, and this record does not give it any.** Fly's documentation is
direct: "If your app needs a volume to function, and the NVMe drive hosting your volume fails, then
that instance of your app goes down. There's no way around that." Volumes are not replicated among
themselves, and daily snapshots "shouldn't be your primary backup method."

**So the third event in this decision is a promise the machine cannot keep alone.** It is kept by
whatever copy exists off the machine, which does not exist yet. Between this record landing and
[how is the store backed up?](../questions/how-is-the-store-backed-up.md) being answered and built,
the system has a durability claim it cannot honour. That gap is real, it is the most consequential
thing in this chain, and naming it here is the only thing stopping it being invisible.

**Recovery is a rebuild rather than a failover.** Provision, restore, redeploy — tens of minutes at
best, and hours if the procedure has not been rehearsed. This is a downtime bet taken knowingly: four
promises describe the client absorbing server unavailability, so nothing a player does during play
depends on the server being reachable. It sharpens
[how much downtime is acceptable?](../questions/how-much-downtime-is-acceptable.md) rather than
answering it, and the lever that most affects the answer is how automated the recovery is rather than
which provider is chosen.

## Revisit when

- **[ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) is reversed**, which moves the
  durable copy off this machine and dissolves this record.
- **A tolerable outage length is agreed** that a rebuild cannot meet, per the question above. Below
  roughly ten minutes, this arrangement needs a warm standby rather than a restore, and that is an
  architecture change rather than a configuration one.
- **A provider offers a replicated volume** that survives host loss without an application-level copy,
  at which case the third event becomes the platform's problem rather than ours.

## Also update

- [x] `constraints.md` — imports the fact that a volume attached to one machine is not replicated and
      its loss is unrecoverable without an off-machine copy
- [x] `questions/where-does-this-run.md` — candidates must offer storage surviving restart and
      redeploy; surviving host replacement is ours to provide
- [x] `questions/how-is-the-store-backed-up.md` — this record is why that question is not optional,
      and it is cited there
- [x] Nothing in `guarantees/` — no promise is made to a player about how long their work survives.
      That is [how long does a guest's work last?](../questions/how-long-does-a-guests-work-last.md)
      and [how long does a signed-in player's work last?](../questions/how-long-does-a-signed-in-players-work-last.md),
      both open

Deliberately not decided here: which provider, what the off-machine copy is, how often it is taken,
how it is verified, and how long a rebuild is allowed to take.
