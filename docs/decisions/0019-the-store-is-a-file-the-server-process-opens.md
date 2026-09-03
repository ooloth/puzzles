---
number: 0019
status: accepted
date: 2026-09-03
---

# 0019 — The store is a file the server process opens

## Forced by

**[ADR-0009](0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) makes this store the
last copy of a player's work.** That is what it exists for, and it is what any argument here is
ultimately about.

**[ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) requires it to answer
questions later** without a migration, which rules out anything without a query language.

**[ADR-0017](0017-nothing-on-the-request-path-scales-to-zero.md) and
[ADR-0018](0018-the-server-does-not-run-in-a-constrained-isolate.md) reduced the field to two.** An
always-on process in an ordinary runtime, with either a file or a network service behind it.

**[../problem.md](../problem.md) ranks clarity over cleverness because one person maintains this**,
and ranks present need over future-proofing.

## Decision

**The store is a file the server process opens, not a service it connects to over a network.**

**What decided it was the number of things that can fail, not what either option can do.** The
technical comparison is a tie and that is established rather than assumed — scored three ways, most
recently across twelve plausible future features at five scale tiers up to a million daily active
users, with hosting held constant so that engine fit was isolated from operational outsourcing.
Nothing in the product's access pattern reaches a limit either option clears.

So the choice was made on what each arrangement costs over years of operation. On one machine, a file
has roughly five independent failure domains — the process, the host, the disk, the backup mechanism,
and lock contention. A service has those plus a daemon that can crash independently, a connection
pool, and a socket. Three fewer things that can break, every year, for a capability set this workload
never touches.

**This says nothing about operational simplicity in the sense that phrase usually carries**, and the
distinction matters because the usual version is false. Setup is a wash: standing up continuous
replication and a restore drill is about as much work as standing up a database daemon and its backup
story. Day-to-day attention is near-identical. What is actually saved is three failure domains and one
recurring maintenance event a year, since a file has no major-version upgrade.

## Rejected

- **A managed service reached over a network.** The strongest alternative, and the one most people
  would pick. Somebody else runs the storage, the replication and the point-in-time recovery; the
  tooling is decades-mature with enormous troubleshooting depth; `pg_dump` makes the data portable;
  and it is the answer that converts into experience the problem statement separately says it wants.

  **This option is not disqualified, and saying otherwise would be dishonest.** No single reason
  defeats it — the portable decision-making standard's test is whether one reason would disqualify an
  option on its own, and none here does. It was **not chosen, on a margin**, and the margin is the
  failure-domain count above: three fewer independent things to detect, diagnose and repair, bought at
  the price of capabilities the access pattern does not use.

  Two smaller things pushed in the same direction without deciding it. Every managed vendor examined
  changed its terms within five years, and a forced migration arrives on somebody else's deadline —
  PlanetScale gave thirty-two days — which is a different kind of risk for one person with a day job
  than for a team. And with continuous replication a file's recovery point is about a second, which
  beats a self-managed service with a nightly dump on the one failure that matters most here.

  **Reverses if** the product grows a feature where many players write the same row — a leaderboard
  maintained transactionally, or real-time collaborative solving — because that is the one access
  pattern where the engines differ in kind rather than in degree. [../problem.md](../problem.md)
  currently excludes both, and excludes the leaderboard case conditionally rather than permanently.

- **A database server the maintainer runs on the same machine.** Rejected because it is dominated by
  both alternatives: it takes on the daemon, the connection pool and the annual major-version upgrade
  while giving up the one thing a service is for, which is somebody else operating it. No reading of
  the evidence prefers this cell. **Reverses if** the engine's features become necessary while
  self-hosting remains preferred — which is the same condition as the reversal above, arriving by a
  different route.

- **Decide it at the third milestone instead.** Genuinely cheap, and it was the leading option until
  late in the analysis: deferring costs nothing, since the store's locality was found not to constrain
  the runtime after all. Rejected because the first milestone deploys onto a host, and
  [../questions/README.md](../questions/README.md) requires that host to satisfy "the server and
  whatever its store turns out to need". A host chosen without knowing whether a persistent volume is
  required is a host chosen against an imagined system, and that is the failure the milestone
  ordering exists to prevent. **Reverses if** the first milestone stops deploying anything.

## Risk

**The disk beneath the file is where silent loss lives, and detection is something we have to build.**
The domains this decision removes all fail loudly, in the sense that an operation throws. The one it
keeps and concentrates does not: SQLite's own documentation carries a section on a checkpoint race
that lost committed writes with no error raised for sixteen years before it was found. Corruption
detection is opt-in tooling rather than a feature that is on. The mitigation is bounded — five
scheduled jobs — and it is work that has to actually happen. It is tracked at
[how is the store backed up?](../questions/how-is-the-store-backed-up.md).

**The replication tooling is the weakest link in the chain, and it is not the engine.** SQLite is
about as battle-tested as software gets. Litestream is a much smaller project, and the evidence
gathered includes a report of a critical data-loss bug in a 2025 release and an unexplained
corruption-after-restore issue — both second-hand and neither re-checked. Betting the last copy of a
player's work on a single small dependency is the specific risk being accepted, and the reason
backups-in-depth is being designed rather than assumed.

**A single volume has no redundancy**, and recovering from a host failure means provisioning,
restoring and redeploying rather than failing over. That is a downtime bet rather than a data-loss
bet, and it is taken knowingly: four promises describe the client absorbing server unavailability, so
nothing a player is doing during play depends on the server being up. It is recorded in
[../constraints.md](../constraints.md) and it sharpens
[how much downtime is acceptable?](../questions/how-much-downtime-is-acceptable.md) rather than
answering it.

**The demonstration value of the alternative is real and is being given up.**
[../problem.md](../problem.md) names "a system whose operation is worth describing to someone hiring
for it" as one of three maintainer purposes, and the managed-service answer is the more legible one on
a résumé. That purpose carries its own guard — would this be worth building if its demonstration value
were zero — and a store passes that guard either way, which is what makes this a cost rather than a
reason.

## Revisit when

- **Many players need to write the same row.** A transactionally-maintained leaderboard, real-time
  collaborative solving, or live racing. This is the one access pattern where the two options differ
  in kind, and it is a product decision rather than a traffic level.
- **The single-writer constraint is reached in practice** — sustained write demand approaching
  fifteen thousand transactions per second, which is three to six orders of magnitude above any
  plausible near-term load.
- **A vendor offers to operate an embedded database on ordinary compute.** That product existed as
  LiteFS Cloud and was sunset in October 2024, and the cell has been empty since; the one occupant
  found requires a runtime tier
  [ADR-0018](0018-the-server-does-not-run-in-a-constrained-isolate.md) rules out. If it returns, the
  comparison changes shape.

## Also update

- [x] `questions/README.md` — three questions were answered, mined and deleted: the store-locality
      question by this record, the engine question by
      [ADR-0020](0020-the-stores-engine-is-sqlite.md), and the store round-trip measurement, which
      measured a round trip that no longer exists. Five new questions follow from this chain and are
      placed at M1, M3 and M11
- [x] `constraints.md` — imports the fact that a volume attached to one machine is not replicated and
      its loss is unrecoverable without an off-machine copy
- [x] Nothing in `guarantees/` — this promises a player nothing. What is owed them about durability is
      already [reopening restores the board in progress](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md)
      and is unchanged
- [x] `questions/how-is-the-store-backed-up.md` — opened by this record, because backups-in-depth is
      the condition that makes this choice safe rather than a detail beneath it

Deliberately not decided here: which engine, where the machine is, how the store is backed up, whether
the catalogue lives in the same store, and how much downtime is acceptable.
