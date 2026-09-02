---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What crosses the client/server boundary?

## Why it matters

The API shape and the database shape are usually decided together and then discovered to disagree.
Naming what actually moves — and in which direction, and how often — is what stops that.

Several things are already fixed and they constrain this more than it looks.
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) makes the client
authoritative, so nothing crossing this boundary is a request for permission.
[The network never blocks, delays or interrupts play](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md),
so every crossing is opportunistic and nothing waits on one. And
[../constraints.md](../constraints.md) records that iOS gives web apps no
background execution and no reliable session-end hook, so **the only moment anything can be sent is
while the app is on screen**, fire-and-forget.

## What would settle it

Listing each thing that moves, its direction, its trigger, and its size. A player makes an input
every one to three seconds while solving, per `../constraints.md`, so the difference between sending
each one and sending a batch on `visibilitychange` is three orders of magnitude in request volume.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01 while separating what a server holds from what it does, on finding that no
question described the traffic between them.

## Options

*Whole-record replacement.* The client sends its current state; the server stores it. Simplest, and
it makes divergence between two devices a last-write-wins problem.

*Deltas or events.* The client sends what changed. Smaller, orders naturally, and pairs with an
event log if
[that is what state is](is-puzzle-state-a-snapshot-or-an-event-log.md). More moving parts and
requires the server to apply them in order.

*Whole record up, deltas down*, or the reverse. Worth considering because the two directions have
different frequencies and different failure costs.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Payload size is not the constraint; connection setup is.** `../constraints.md` records that a
fresh connection costs three to four round trips before any payload moves, that a degraded link
sits at or below the 2g tier, and that mobile radios are expensive to wake. So the design pressure
is toward few, batched crossings rather than small ones.

**A crossing that fails must not become visible.**
[The network never blocks, delays or interrupts play](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
allows the interface to show that something is pending, and forbids the network blocking, delaying
or interrupting play. A failed send is retried later or dropped; it is never surfaced as an error
the player must act on.

**A server answering in HTML fragments narrows [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md)'s
native recovery path to a webview wrapper.** [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) names wrapping this web client in a native
shell as what keeps the web choice reversible. A server that returns markup for the client to insert
can only be consumed by something that renders HTML, which forecloses every non-webview native
client.

**The client state layer exists regardless of what crosses this boundary.**
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) already puts authoritative
state on the client for latency and offline reasons. A hypermedia-style crossing would add a second
rendering path on top of that layer rather than remove the one that already exists.

**[Play continues through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)
requires the client to render a board it already holds.** A server that returns markup for the
client to insert is a server the client cannot do without, which that guarantee rules out
regardless of what shape this boundary settles on.

**Deciding this now would bind with no server, no schema and no endpoint in existence.** Nothing
here has been designed yet, so an early answer constrains a thing that does not exist. That gap is
exactly why the previous attempt to settle this — naming JSON specifically — was withdrawn rather
than kept.

**Naming one serialisation format specifically would also rule out formats the same reasoning
allows.** A binary or schema-first format would satisfy client-authoritative, offline-first
reasoning as well as JSON does; picking JSON by name would foreclose them on convenience rather than
necessity.

**Replicache's protocol is the closest documented match to this problem's shape, and it is
archived — which makes it better to steal from than to depend on.** It defines three operations:
push submits pending mutations, pull fetches a patch, and poke is a hint to pull again that carries
no payload.

*Sourced — Replicache's "How It Works," https://doc.replicache.dev/concepts/how-it-works.*

**The cookie is the sync cursor.** Replicache describes it as "a value opaque to the client
identifying the canonical server state the client has... In its simplest implementation, the cookie
encapsulates the entire state of all data in the client view — you can think of this as a global
'version.'"

*Sourced — Replicache's server-pull reference, https://doc.replicache.dev/reference/server-pull.*

**Mutation IDs give idempotency.** Each mutation gets a sequential integer, unique per client,
assigned at creation. The server tracks the client's `lastMutationID` as the high-water mark it has
seen. On pull, the client discards pending mutations at or below that number. A mutation ID below
`nextMutationID` is treated as a no-op; one above it is an out-of-order error.

*Sourced — Replicache's server-push reference, https://doc.replicache.dev/reference/server-push.*

**The atomicity requirement is stated flatly.** Replicache: "the effects of a mutation and the
corresponding update to the lastMutationID must be revealed atomically by the datastore... otherwise
the sync protocol will have undefined and likely mysterious behavior." The sharp edge follows from
the same rule: even a mutation the server cannot handle must still advance `lastMutationID`, or the
client retries it forever.

*Sourced — Replicache's server-push reference, https://doc.replicache.dev/reference/server-push.*

**The escape hatch worth taking seriously here: Replicache's "Reset Strategy" sends a `clear` plus
the full data set on every pull, with no diffing at all.** It is documented as "the easiest possible
strategy," explicitly inefficient, and explicitly used in production for small or
infrequently-changing datasets. For 81 cells this may simply be the right answer.

*Sourced — Replicache's "Reset Strategy," https://doc.replicache.dev/strategies/reset.*

**Every mature sync protocol has exactly one "I cannot compute a diff from here" path, and it always
ends in a full resync.**

| System | Full-resync trigger |
| --- | --- |
| Replicache | Cookie unknown to the server |
| CouchDB | Source and target share no common ancestry |
| Google Calendar | HTTP 410; client told to clear storage and do a full sync |
| Microsoft Graph | HTTP 410, error code `resyncRequired` |
| Dropbox | HTTP 409, tag `reset` |

This path is not an edge case bolted on afterward in any of these systems. It is a first-class part
of the protocol in every one of them.

*Sourced — Replicache, https://doc.replicache.dev/strategies/reset; CouchDB replication protocol,
https://docs.couchdb.org/en/stable/replication/protocol.html; Google Calendar sync guide,
https://developers.google.com/workspace/calendar/api/guides/sync; Microsoft Graph community answer
on `resyncRequired`,
https://learn.microsoft.com/en-us/answers/questions/1433352/how-do-we-handle-the-410-resyncrequired-error-from;
Dropbox's detecting-changes guide, https://developers.dropbox.com/detecting-changes-guide.*

**Cursors are opaque on purpose.** Google's AIP-158 requires page tokens be "opaque (but URL-safe)
strings... not user-parseable," and explicitly rejects base64 as sufficient — the requirement is
semantic opacity, not just encoding. Dropbox requires the client resend its latest cursor even on
zero-change polls, or it can expire.

*Sourced — Google AIP-158, https://google.aip.dev/158; Dropbox's detecting-changes guide,
https://developers.dropbox.com/detecting-changes-guide.*

**Idempotency keys, and the one honest gap.** Stripe saves the status code and body of the first
request against an `Idempotency-Key` and returns the identical result on retry, including a saved
`500`; reusing a key with different parameters errors rather than silently overwriting. AWS states
the atomicity rule directly: "the process that combines recording the idempotent token and all
mutating operations related to servicing the request must meet the properties for an atomic...
operation," and warns against deriving tokens from request parameters or timestamps.

No primary source was found that endorses skipping idempotency keys for naturally idempotent
operations like "set cell to X." The "set is idempotent, increment is not" framing is folklore —
nothing found contradicts skipping keys for pure cell writes, and nothing licenses it either. The
play record (elapsed time, hint count) probably has genuine accumulator semantics, where that
exemption would stop applying regardless.

*Sourced — Stripe's idempotent-requests docs, https://docs.stripe.com/api/idempotent_requests; AWS
Builders' Library, "Making retries safe with idempotent APIs,"
https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/.*

**Partial failure mid-sync has a documented working pattern.** WatermelonDB's stated principle: "if
sync fails at any moment, and even leaves local app in inconsistent (not fully synced) state, we
should still achieve consistency with the next sync" — safety comes from making apply idempotent and
re-appliable, not from a guaranteed atomic transaction. The concrete failure shape here: eight of
twenty changed cells write, the cursor advances anyway, and the missing twelve are never re-fetched
and vanish silently from that device.

*Sourced — WatermelonDB sync frontend docs, https://watermelondb.dev/docs/Sync/Frontend.*

**Bootstrap is its own case, and most of the literature only covers one direction.** New device with
empty local storage and a server holding data is well covered. Local data existing with the server
empty is not — and it is the setup of a real production bug; see the deletes finding in
[what happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md).
Linear's sync engine uses a dedicated full-model bootstrap endpoint distinct from delta sync,
records a `firstSyncId` marking where incremental resume begins, and tracks a
`backendDatabaseVersion` specifically to detect schema drift during bootstrap. Turso hit a
bootstrap-specific bug in 2026 where a new replica's pull omitted the SQLite header page because the
implementation assumed incremental WAL pages sufficed — true incrementally, false from scratch.

*Sourced — reverse-engineered notes on Linear's sync engine,
https://github.com/wzhudev/reverse-linear-sync-engine; Turso issue #5971,
https://github.com/tursodatabase/turso/issues/5971.*
