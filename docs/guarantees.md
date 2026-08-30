---
updated: 2026-08-30
update_when: a promise is made to users, or an enforcement mechanism is added or removed
decays: slow
status: draft
---

# Guarantees

Things that must always be true. Violating one is **our** bug — not the platform's
(→ [constraints.md](constraints.md)), not a reversible choice (→ [decisions/](decisions/)).

An unenforced guarantee is a wish. The empty middle cell is the point: this table doubles
as a backlog of things we claim but never check.

> **Every row below is unenforced.** There is no application code in this repo — no test, no
> type, no lint rule, no monitor. That is not a gap in this document; it is the current state
> of the project, and the reason the middle column reads the way it does.
>
> Ported from `@legacy/invariants/ux.md`, which is the *only* place invariants were ever
> written. `@legacy/invariants/performance.md` and `safety.md` are both 0 bytes — the files
> existed, the content never did. Verified: `wc -c` reports `0` for each.

---

## Experience

| Must always hold | Enforced by | If violated |
|---|---|---|
| **UX-1.** Tapping a cell, entering a digit, or toggling a note renders visible feedback immediately, under any network condition including none | nothing — asserted only. **Also undefined:** "immediately" has no threshold, so this is not checkable as written | The app feels broken exactly where it must feel best. On a subway this is the difference between a product and a toy |
| **UX-2.** The app stays fully interactive, no errors or broken UI, through total connectivity loss lasting at least several minutes | nothing — asserted only | The modal use case — a commute through a tunnel — is where the app stops working |
| **UX-5.** When connectivity returns, progress syncs in the background, never showing a loading/reconnecting/error state during play, retrying silently on failure | nothing — asserted only | The player is made responsible for the network; error chrome appears during a puzzle they were enjoying |
| No merge or conflict prompt is ever shown in the ordinary sequential case | nothing — asserted only | The player is asked to arbitrate a data-model detail they cannot reason about |

## Durability

| Must always hold | Enforced by | If violated |
|---|---|---|
| **UX-3.** In-progress state (grid fills, notes) is never lost, however a session is interrupted — backgrounded, tab killed, phone locked, browser crash | nothing — asserted only | Silent loss of half an hour of a player's thinking, with no error and no recovery. The single worst failure this product can have |
| **UX-4.** Reopening — same device or a different one, seconds or days later — restores the exact prior state automatically, with no explicit sync step | nothing — asserted only. **Contradicted by legacy ADR-11** (see below) | Player switches to their laptop and finds an empty board |
| This reliability holds **without requiring an account or login** | nothing — asserted only | Durability quietly becomes conditional on signup, changing the product's shape |
| No player loses progress to Safari's eviction of script-writable storage | nothing — asserted only. Two candidate mitigations named ([constraints.md](constraints.md)), neither adopted | An iOS player who doesn't return within a week finds a wiped board, with nothing on screen to blame |

## Correctness

| Must always hold | Enforced by | If violated |
|---|---|---|
| Every puzzle served has exactly one solution | nothing — asserted only. No generator, no solver, no test exists | A player grinds a board that cannot be finished, or finds two valid answers. The core product claim is false and trust is unrecoverable |
| Completion is *derived* from state matching the solution — never a second independently-updated field | nothing — asserted only | Two sources of truth drift; a player sees a puzzle marked done that isn't, or loses credit for one that is |
| Sync is idempotent — the same move submitted twice has the effect of one move | nothing — asserted only | Retries after a flaky tower silently double-apply moves; the board diverges from what the player did |

## Safety

| Must always hold | Enforced by | If violated |
|---|---|---|
| A fault while handling one player's request never affects another player's session | nothing — asserted only | A single malformed request drops every concurrent user's session |
| No user-supplied value ever reaches the DOM unescaped | nothing — asserted only | Stored XSS |
| Real secret values never touch disk in plaintext and are never committed | nothing — asserted only — the protection is convention plus discipline; no secret-scanning hook, no CI check | Credentials in git history |

---

## Contradiction to resolve before this document is trusted

**UX-4 promises cross-device resume. Legacy ADR-11 explicitly accepts the opposite:**

> "Single-browser only: clearing cookies or switching devices loses all progress, with no
> recovery path in v1. Accepted deliberately."
> — `@legacy/decisions/11-track-progress-via-anonymous-server-side-sessions.md:30`

Both are in the ported corpus and they cannot both stand. `@legacy/invariants/ux.md:29-34`
and `@legacy/context/usage.md:22-24, 39-41` treat cross-device resume as expected; ADR-11
treats it as an accepted loss. One of these is lying to a future reader. Tracked in
[undecided.md](undecided.md); until it is settled, UX-4 above is a draft claim, not a promise.

A second, quieter version of the same problem: a last-write-wins sync **discards** the losing
write. Whether silently discarding a player's moves is compatible with "progress is never
lost" is not addressed anywhere in the corpus.

---

## Not guarantees

Found in the legacy invariants and adjacent files, but not checkable and with no defined
violation. Recorded here so they aren't lost, with where they actually belong.

| Claim | Belongs in |
|---|---|
| "Aiming for world-class, polished" solving UX | [problem.md](problem.md) — priority ranking |
| "An app with borrowed puzzles + amazing UX = success…" | [problem.md](problem.md) — the sharpest statement of what wins in the whole corpus |
| "Primarily a craft project: enjoy building something well-made" | [problem.md](problem.md) |
| "Small, genuinely public v1 within a few months" | a roadmap — a schedule, not an invariant |
| Generation deferred; scale not designed for yet | [problem.md](problem.md) — "Not this" |
| Non-goals: simultaneous multi-device editing, anti-cheat, enterprise scale | [problem.md](problem.md) — "Not this" |
| "Add infrastructure/complexity because the app requires it now" | [standards.md](standards.md) — a design principle |
| Rust "Easy Mode" conventions | [standards.md](standards.md), and only if Rust survives the pivot |
| Device CPU/RAM figures, storage estimates, RTT tiers | [constraints.md](constraints.md) — inputs to guarantees, not guarantees |
