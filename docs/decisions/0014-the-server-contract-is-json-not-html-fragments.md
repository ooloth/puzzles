---
number: 0014
status: accepted
date: 2026-09-01
---

# 0014 — The server contract is JSON, not HTML fragments

## Forced by

**[ADR-0002](0002-the-client-holds-and-mutates-puzzle-state.md) put authoritative state on the
client**, and argued against server-driven hypermedia on its merits while doing so. This record
finishes that argument for the transport: a client that owns its state and renders from it has
nothing to do with markup arriving over the wire.

**[ADR-0003](0003-this-is-delivered-over-the-web.md) named a native shell as the recovery path that
keeps the web choice reversible.** A server that answers in HTML fragments can only be consumed by
something that renders HTML, which means the recovery path narrows to a webview wrapper and every
non-webview native client is foreclosed. That is the cost ADR-0003 recorded and did not title.

**[../guarantees/offline.md](../guarantees/offline.md) promises play continues with no network**, so
the client must be able to render a board it already holds. A server that returns markup is a server
the client cannot do without, which is the opposite shape.

**This record exists because that decision was made inside ADR-0003 and never given a title.** It sat
as a bullet in a section outside that record's Decision heading, under a record announcing it
"decides the delivery platform and nothing else".

## Decision

**Any server this project has answers in JSON. It does not return HTML fragments for the client to
insert.**

**It is conditional on a server existing and on nothing else.**
[ADR-0006](0006-what-a-players-work-survives.md) forces one, so the condition is met — but the shape
of that server is [still open](../questions/what-execution-shape-does-the-server-have.md) and this
record does not narrow it. Every execution shape can answer in JSON.

**It says nothing about the schema, the protocol, or how many endpoints there are.** REST against
RPC, one endpoint or twenty, what the payloads contain — all of that is
[what crosses the client/server boundary?](../questions/what-crosses-the-client-server-boundary.md),
open. What is settled is the format and, through it, who is allowed to consume the server.

## Rejected

- **Server-driven hypermedia — HTML fragments swapped into the page.** A serious option and one
  ADR-0002 treats as such: it removes the client state layer entirely, it is markedly less code for
  a conventional app, and its proponents are answering a real complaint about front-end complexity.
  Rejected because this is not a conventional app. ADR-0002 already put authoritative state on the
  client for latency and offline reasons, so the state layer exists whatever the transport does —
  and hypermedia then adds a second rendering path without removing the first.

- **Both: JSON for the game, fragments for everything else.** Genuinely reasonable, and it is how a
  marketing page or a settings screen would most cheaply be built. Rejected as a *contract*
  decision rather than as a technique: pages rendered whole by a server are not a client/server
  contract at all, and nothing here stops one existing. What is ruled out is the client consuming
  fragments as its data.

- **Leave it open until there is a server.** The honest "not yet". Weaker than usual here because
  the cost of deciding now is zero — ADR-0003 says so in the sentence this record is extracted from
  — and the cost of deciding late is that a client has been built against whatever shape arrived
  first.

## Risk

**It is decided with no server, no schema and no endpoint.** Nothing has been designed, so this
constrains a thing that does not exist. The defence is that the constraint is one bit wide and every
candidate satisfies it; the honest reading is that it is cheap rather than well-informed.

**It forecloses a real and currently fashionable architecture on reasoning rather than on
experience.** Nobody here has built the hypermedia version of this app to find out. ADR-0002's
argument is sound and it is still an argument.

**JSON is not the only serialisation and this record names it specifically.** Something binary or
schema-first would satisfy the same reasoning and is ruled out by the letter of this. That is
deliberate — one obvious format beats a category nobody can check — but it is a constraint the
wording imposes and the reasoning does not.

## Revisit when

- **A native shell is ruled out permanently and ADR-0002 is superseded.** Both would have to go:
  ADR-0002 alone keeps the client's state layer, which is most of the argument.
- **Payload size or parse cost is measured and found to matter.**
  [../constraints.md](../constraints.md) says transfer time is not the bottleneck once a connection
  is warm, and a measurement disagreeing with it is the finding.

## Also update

- [x] `0003-this-is-delivered-over-the-web.md` — the bullet is removed from its recovery-path
      section and cited here instead
- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — this promises a player nothing

Deliberately not decided here: whether the API is REST or RPC, what it exposes, what the payloads
contain, how it is versioned, and whether any surface outside the game is server-rendered.
