---
number: 0036
status: accepted
date: 2026-09-22
---

# 0036 — Request and response bodies are described with zod

## Forced by

Two recorded failure modes name a described shape as their remedy.
[A corrupt board becomes the canonical one](../failure-modes/a-corrupt-board-becomes-the-canonical-one.md)
says "structural corruption is catchable at the boundary and should raise an error" and names
"validation at the write boundary".
[The server hands back state the client will not accept](../failure-modes/the-server-hands-back-state-the-client-will-not-accept.md)
is a response whose shape the client does not recognise, and it establishes that version skew is the
ordinary case rather than the exceptional one, because a cached or installed client can be
arbitrarily old while its data is current.

That last point is what decides where the check has to live. The two halves are routinely not
compiled together, so a guarantee established at compile time does not hold at the moment the
mismatch happens. The check has to run.

[ADR-0035](0035-the-http-handler-is-fastify.md) supplies the place to put it, and
[ADR-0007](0007-that-language-is-typescript.md) requires that whatever describes a shape also
produces a type.
[ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md) prices
the supply risk, and a schema library sits in every route, so leaving it is not cheap.

**Of CPU, memory, storage and network, only CPU is touched by this choice and it does not bind.**
Validating and serialising a body is per-request work, and giving up `fast-json-stringify` makes it
slower by an amount nobody has measured. What is measured is the whole request:
[../constraints.md](../constraints.md) records roughly a thousandfold of headroom on a route that
reads the store, and serialisation is one part of that request rather than an addition to it, so the
part cannot exceed the whole. That bounds the cost from above without pricing it. Memory is
unaffected: a schema is built once at startup. Storage and network are unaffected entirely — the
same bytes are written and the same bytes are sent, and what changes is only whether a mismatched
shape is allowed to become either.

*Reasoned — 2026-09-22. The thousandfold figure is measured and is about total request throughput;
the inference that it bounds serialisation is not a measurement, and no comparison of zod's encode
against `fast-json-stringify` has been run here.*

## Decision

Request and response bodies are described with zod, and the descriptions are wired into Fastify
through `fastify-type-provider-zod`'s validator and serializer compilers.

The serializer half is the point. A handler returning a value that does not match its declared
response schema produces `FST_ERR_RESPONSE_SERIALIZATION` rather than a response, so a shape that was
never promised cannot reach a client. *Measured — by me on 2026-09-21 against
`fastify-type-provider-zod` 7.0.0: a handler returning an undeclared field and a wrong type answered
`500 {"code":"FST_ERR_RESPONSE_SERIALIZATION","message":"Response doesn't match the schema"}`.* The validator half rejects a malformed body with a 400 naming
the field. Both descriptions also type the handler, so a body field that does not exist and a return
value violating the response schema are compile errors as well.

## Enforced by

Nothing yet. No code exists. What must be true when it does:

- The server calls `setValidatorCompiler` and `setSerializerCompiler` with the provider's compilers.
  Without the second, a declared response schema is documentation. **M1 slice 1**, so that no route is
  ever written against an unwired serializer.
- Every route that accepts or returns a body declares the corresponding schema. **M3 onward**, where
  the first response with content exists. A route declaring no response schema is not checked, and
  nothing reports that, so this is the half most likely to be half-built and read as finished.

## Rejected

- **TypeBox** — because it strips an undeclared field silently where zod rejects loudly, and this
  record exists to stop a shape that was never promised reaching a client. A mechanism that removes
  the offending field and returns 200 does prevent the leak, and it does so without telling anyone,
  so a handler quietly returning the wrong shape stays quiet. That is the one reason, and it
  disqualifies on its own: the portable decision-making standard prefers an option that fails loudly
  to one that fails silently, and the failure mode this record serves is already invisible.

  Two other differences were weighed and neither disqualifies. TypeBox is JSON Schema natively, so
  it keeps Fastify's `fast-json-stringify` path that zod gives up — a real advantage, costing an
  amount the headroom above bounds without pricing. And its stewardship profile is the weaker of the
  two: pre-1.0 after years, most commits from a single author, under a licence npm reports as
  "Other" rather than a standard identifier, which is what
  [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
  prices for something sitting in every route. Recorded as a cost rather than a reason, because on
  its own it would not have decided this.

  *Measured for the silent strip — by me on 2026-09-21: a handler returning an internal field
  alongside a valid board answered 200 with the field removed under TypeBox and a declared response
  schema, where `fastify-type-provider-zod` returned `500 FST_ERR_RESPONSE_SERIALIZATION`. Sourced
  for the stewardship figures — each project's npm registry metadata and the GitHub API, read
  2026-09-21 by a research agent; I did not run the queries.*
- **Plain JSON Schema object literals** — because `req.body` is then `unknown` and correct code fails
  to compile, so the reachable escape is a cast that discards every check at once.
- **No schema, validating by hand** — because both failure modes above name a described shape as the
  remedy, and a hand-written check is the discipline this record exists to replace.

## Risk

**`fastify-type-provider-zod` is community-maintained**, not in the `fastify` organisation, and this
record depends on it for the property that motivated it. Its replacement cost is bounded — the
schemas are zod either way and only the wiring is its — but it is a third party in a load-bearing
position.

**Fastify's serialisation fast path is given up.** The provider serialises through zod's encode and
`JSON.stringify` rather than `fast-json-stringify`. Accepted knowingly, and the measurement behind
that is in [../constraints.md](../constraints.md).

**Zod's JSON Schema export is lossy.** `z.toJSONSchema()` throws by default on `z.date()`, `z.map()`,
`z.set()`, `z.transform()` and `z.bigint()`. Nothing needs it today; publishing a schema to a third
party would meet it.

**A route with no response schema is silently unchecked.** The mechanism protects only what it is
told about, and nothing reports a route that declared nothing.

## Revisit when

- A schema has to be published to a consumer outside this repository, which is where zod's lossy
  JSON Schema export starts to cost something and where TypeBox's native form starts to pay.
- Serialisation throughput begins to bind, which against the recorded headroom would mean the load
  assumptions in [../problem.md](../problem.md) were wrong by about three orders of magnitude.
- `fastify-type-provider-zod` stops being maintained, which would mean wiring the compilers here
  rather than changing how shapes are described.

## Also update

- [x] questions/README.md — noted against [what crosses the client/server
      boundary?](../questions/what-crosses-the-client-server-boundary.md) at M3, which inherits the
      shape this record describes rather than choosing one
- [x] architecture.md — no boundary or relationship changes; the shape crossing the boundary is M3's
- [x] constraints.md — nothing added. It carries the total-throughput headroom this record reasons
      from, and deliberately not a serialisation measurement, because none was taken
- [x] glossary.md — no new domain terminology
- [x] guarantees/ — no promise to players falls out of this yet. The correctness theme in
      [../guarantees/README.md](../guarantees/README.md) lists "a partial write is never observable"
      as a candidate, and this record is one of the things that would have to hold first
