---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which database, if any?

## Why it matters

It is the decision most likely to be made by reflex. Reaching for Postgres is what one does, and
for this application it may well be several times more machinery than anything requires — the
server, if it exists at all, may only ever need to put bytes under a key and hand them back.

It also constrains hosting. A database with a file on disk needs a host that has one; a managed
service does not, but bills monthly and adds a network hop. That choice interacts with the cookie
topology trap recorded in [../constraints.md](../constraints.md), which is a door that closes
silently.

## What would settle it

Writing down the actual access patterns — every read and every write the server performs, with
the key it does it by — and seeing what the smallest thing that serves them is. If every entry is
"get blob by key" and "put blob by key", that is the answer, and it is not a relational database.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, working backward from the stack to find which product truths a database choice
actually rests on. The chain runs five deep and had a gap at every level.

## Options

*None.* A static site. Puzzles ship as files; progress lives on the device; nothing is stored
centrally. Cheapest by a wide margin and genuinely possible — see the question this is blocked by.

*A key-value store.* Progress as an opaque blob under an opaque token. Serves durability and
recovery and nothing else. Cannot answer any question about aggregate usage.

*SQLite on the server.* One file, no service, real queries when they are wanted. Needs a host with
persistent disk, and backups become a thing that has to be designed rather than bought.

*A managed relational database.* Postgres or similar. Everything, forever, for a monthly fee and
an extra network hop. The right answer if per-player queryable data turns out to be required, and
considerable overhead if it does not.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Two inputs that once left this open are now settled.**
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) establishes that
the server holds a durable per-player record, so the answer is not "nothing".
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) establishes that it has to
be queryable, which is what made this a real decision rather than a possible non-decision.

**Where the data physically sits is [where does this run?](where-does-this-run.md)**, not here. The
two are close enough to be confused: an embedded database is a file on whatever box the server runs
on, so choosing one narrows the hosting options to those offering persistent local disk, while a
managed database makes hosting nearly free of the question. This decides which kind; that one
decides where.

**The runtime candidates differ in how well they embed SQLite, which is relevant here.**
[What runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md) is a
reason to note what each runtime costs for this decision — not a reason to settle this question
early so a runtime can be justified by it.

**Whether stored data has to be queryable or can stay opaque is most of what separates the options
below.** See [what must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md)
— that single distinction is the crux.

**[What the server does with puzzle state](what-does-the-server-do-with-puzzle-state.md) would
make this decision small.** Under its leading option the server checks that a payload is a
well-formed board and never interprets its contents. A store that never reads inside the value
needs to do exactly one thing, which every option above does equally well. Unless the usage
question above reverses it,
this is close to a non-decision — which is worth knowing before spending a week on it.

**The client's data representation does not constrain this.** Snapshot or event log, the server
holds whichever one it is handed. The two questions look coupled and are not, and the thing that
decouples them is the server never reading inside what it holds.

**Analytics is the only input that would change the answer.** If nothing per-player ever needs
querying, the blob store wins on every axis. If it does, the blob store cannot be extended into
one and the choice has to be made up front.
