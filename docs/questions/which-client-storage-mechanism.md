---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which client storage mechanism holds a player's work?

## Why it matters

It is where the promises in [../guarantees/durability.md](../guarantees/durability.md) are actually
kept or broken, and it is the one stack choice with no clean migration path: changing it later means
moving every existing player's data with code that has to run in their browser, once, correctly.
A guest has no copy anywhere to restore from if that goes wrong.

Nothing has chosen a mechanism. IndexedDB is the reflex answer and gets named in passing often
enough to look settled.

## What would settle it

The three answers above, then a table of the candidates against them: how much each holds, whether
it survives the platform's eviction, what it costs to query, and what it costs to get wrong. The
last column is the one that usually decides it.

A prototype writing and reading real board state on a real iPhone is worth more than any of it,
because the failure modes recorded in [../constraints.md](../constraints.md) do not reproduce on a
desktop browser.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, after the language record was found asserting an answer no question had asked.

## Options

*`localStorage`.* Synchronous, roughly five megabytes, string values only. What SudokuPad,
puzz.link and the New York Times games all use. Sufficient for one board and its history; not for
a cached archive. Its synchronous API is a real advantage — none of the rejected-write failure
modes below apply in the same way — and a real hazard, since it blocks the main thread.

*IndexedDB.* Asynchronous, large, structured, indexable. The default recommendation, and the
source of every storage failure recorded in `../constraints.md`.

*The Cache API.* Built for responses rather than records. A natural fit for cached puzzle content
even if player progress lives elsewhere, which makes this possibly not an either-or.

*Origin Private File System.* Newer, fast, and reached through a less-travelled path on WebKit.
Worth considering only if volume rules the first two out.

*SQLite compiled to WebAssembly, over OPFS.* Real queries on the client. Considerable weight on a
cold load, and it inherits the OPFS risks rather than escaping them.

*[LiveStore](https://livestore.dev/).* A local-first data layer rather than a storage mechanism:
SQLite in the browser, an event-sourced state model, reactive queries, and sync to a backend, as one
package. Named here so it is not overlooked, not because it is favoured.

Three things about it need weighing against this project specifically, and the first two are
independent of how good it is.

It is a **bundle**, so adopting it answers several open questions at once — this one, whether state
is [a snapshot or an event log](is-puzzle-state-a-snapshot-or-an-event-log.md), much of
[which database](which-database-if-any.md), and part of
[what the server holds](what-does-the-server-hold.md), since its sync backend is one. Those
answers may each be right, but a tool that supplies them is not an argument for them, and
[README.md](README.md) is about the order in which they are reached.
It is a candidate for this question once the others are settled, and a way of skipping them before.

It **sits across the storage boundary rather than behind it**.
[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) names one narrow storage interface,
with a single implementation behind it and nothing reaching around it, as what keeps a native shell
cheap to add. A package that also owns reactivity and sync spans that line, so adopting it spends a
door that record deliberately holds open.

It carries **SQLite as WebAssembly**, which is weight on a cold load that
[../constraints.md](../constraints.md) already describes as several seconds of round trips before
any bytes move.
[ADR-0007](../decisions/0007-that-language-is-typescript.md) weighed bundle size against that
when rejecting a WebAssembly client, so adding a WebAssembly database needs an argument rather than
an exception.

What to establish when it is evaluated, none of which is recorded here yet: release status and
maintenance activity, measured bundle size, whether the sync backend is self-hostable or a hosted
service, the licence, and whether event sourcing is required or merely idiomatic.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**If the client format is a blob the server never reads, the server's store barely matters.**
See [which database, if any?](which-database-if-any.md).

**A library is a separate and much smaller decision.** Whether to use `idb`, Dexie or nothing over
the chosen API is contained behind a persistence module and cheap to reverse, so it does not need
a record of its own.

**Two constraints already bound any answer.** Keys must be assigned rather than generated by the
store, because letting IndexedDB mint them triggers a live WebKit defect on iOS. And writes are
rejected in ordinary operation for reasons unrelated to quota, with error names that misreport the
cause — so the write path needs care under every option here. Both are in
[../constraints.md](../constraints.md).

**The obvious default may not be the right one.** IndexedDB is what everyone reaches for, and the
incumbent puzzle apps use `localStorage`. That is not decisive — none of them is offline-first in
the way this intends — but it is enough that the smaller option deserves a real hearing rather
than an assumption.

*Unverified — no source recorded.*

**[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md)'s native-shell recovery path only
stays cheap if storage has one swappable implementation.** That recovery path is a plugin swap only
if there is one place in the codebase to make it; storage calls scattered across call sites turn the
swap into a rewrite.

**Wrapping this client in a `WKWebView` does not by itself escape the storage eviction in
[../constraints.md](../constraints.md).** WebKit states that tracking prevention is enabled by
default in every `WKWebView` application, and Capacitor's own documentation warns that mobile
operating systems may still clear `localStorage`. Durability is recovered only when storage is
routed through a native plugin instead of the webview's own store.

*Sourced — WebKit and Capacitor documentation.*

**The write-failure behaviour `../constraints.md` records has to be implemented once, not at every
call site.** A write can be rejected for reasons unrelated to quota, and the error misreports the
cause. Whichever mechanism is chosen, detecting the store's absence and never treating a rejected
write as self-resolving are behaviours that belong behind one interface — implemented differently at
each call site is implemented inconsistently.

**A thin wrapper shaped like the underlying storage API is not a real boundary.** An interface
shaped like IndexedDB cannot be implemented by something that is not IndexedDB, so a pass-through
wrapper pays the cost of an interface while keeping none of the swap it exists to buy.

**A storage boundary can be drawn and then leaked through.** Nothing stops a module importing the
storage API directly once an interface exists, and nothing in this repo currently catches it. The
enforceable form is a lint rule restricting imports of the storage API to one path, whatever that
interface ends up looking like.
