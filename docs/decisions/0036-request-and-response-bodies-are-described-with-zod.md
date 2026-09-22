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
slower by an amount the headroom in [../constraints.md](../constraints.md) swallows about twelve
hundred times over. Memory is unaffected: a schema is built once at startup. Storage and network are
unaffected entirely — the same bytes are written and the same bytes are sent, and what changes is
only whether a mismatched shape is allowed to become either.

## Decision

Request and response bodies are described with zod, and the descriptions are wired into Fastify
through `fastify-type-provider-zod`'s validator and serializer compilers.

The serializer half is the point. A handler returning a value that does not match its declared
response schema produces `FST_ERR_RESPONSE_SERIALIZATION` rather than a response, so a shape that was
never promised cannot reach a client. The validator half rejects a malformed body with a 400 naming
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

- **TypeBox** — because it is pre-1.0 after years, carries 798 commits from its author against five
  from the next contributor, and ships under a non-standard licence, which is the stewardship profile
  [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
  warns about for a dependency that sits in every route. Its real advantage is genuine and was
  weighed: it is JSON Schema natively, so it keeps Fastify's `fast-json-stringify` path, which zod
  gives up. That path does not bind — the measured headroom on this workload is roughly twelve
  hundredfold. A second difference points the other way: TypeBox strips an undeclared field silently
  where zod rejects loudly, and the portable decision-making standard prefers the option that fails
  loudly.
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
- [x] constraints.md — carries the measurement behind giving up the serialisation fast path
- [x] glossary.md — no new domain terminology
- [x] guarantees/ — no promise to players falls out of this yet. The correctness theme in
      [../guarantees/README.md](../guarantees/README.md) lists "a partial write is never observable"
      as a candidate, and this record is one of the things that would have to hold first
