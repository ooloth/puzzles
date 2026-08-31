---
updated: 2026-08-31
update_when: authentication, validation or rate limiting on the write path changes
decays: slow
status: active
---

# The write endpoint becomes free storage for strangers

## Threatens

Availability and running cost. Not a promise to players directly, but everything downstream of
the bill and the disk.

## How it happens

Progress is written by clients that were never asked to identify themselves, because the design
deliberately avoids requiring an account. An endpoint that accepts a blob against a
client-supplied key, with no authentication and no size or rate limit, is an open object store.
Somebody finds it — these get found by scanners, not by people — and it becomes a place to park
data that has nothing to do with puzzles.

## Why here specifically

The anonymous-session design is what makes the endpoint open by construction: there is no account
to check, and the token is minted on request. Every property that makes it frictionless for a
player makes it frictionless for anyone else.

## How we'd notice

Storage growth and cost, eventually. There is no error and no failed request — the system is
doing exactly what it was asked. On a free tier the first signal may be a bill or a quota, which
means noticing late.

## What reduces it

Size limits per object and per token, rate limits per token and per address, tokens issued by the
server rather than chosen by the client, and validation that the payload is a board for a puzzle
that exists — which
[ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md)
already requires and which does most of the work here. Alerting on storage growth turns a late
signal into an early one.
