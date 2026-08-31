---
updated: 2026-08-31
update_when: validation or the sync design changes
decays: slow
status: active
---

# A corrupt board becomes the canonical one

## Threatens

[durability.md](../guarantees/durability.md), and
[correctness.md](../guarantees/correctness.md) once anything depends on stored state being sound.

## How it happens

A client bug writes a malformed or nonsensical board — a partial write during a crash, a
serialisation mistake, an off-by-one in a merge. The client syncs it. The server stores it. Every
other device pulls it, and the recovery copy is now the corrupt version. The player's local copy
was salvageable right up until the moment their own device replaced it with a bad one, and then
the server made the bad one authoritative by being the thing everything else trusts.

## Why here specifically

The server copy exists precisely to be recovered from, which is what turns an ordinary client bug
into permanent data loss. A local-only design would have confined the damage to one device.
[ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md)
requires validation for exactly this reason, but validation is only as good as the checks written,
and a board can be well-formed while being wrong.

## How we'd notice

Structural corruption is catchable at the boundary and should raise an error. **Semantic
corruption — a board that parses cleanly but holds values the player never entered — produces no
error anywhere.** The player sees a grid that is not the one they left, has no vocabulary for
reporting it, and is most likely to describe it as the app losing their progress.

## What reduces it

Validation at the write boundary, which ADR-0003 requires. Keeping a bounded history of previous
states rather than overwriting in place, so a bad write can be stepped back from. And checking
the position against the rules of the game once that is affordable — currently deferred, with the
trigger recorded in ADR-0003.
