# Usage Context

This document is read-only input to architecture decisions. It is written before,
and independent of, any technical choice. Decisions in `docs/decisions/` should
cite `constraints.md` or `docs/invariants/ux.md` (both derived in part from
this doc), not restate this content.

## Who

Casual, single-player puzzle solvers (sudoku, star battle, and future grid-based
logic games). General public, no assumed technical sophistication. No
adversarial or competitive stakes — this is not multiplayer, ranked, or
money-involved, so anti-cheat integrity is not a design driver.

## Where and how

- **Predominantly mobile** (phone-first), used in real commuting environments —
  trains, subways, tunnels, cell-tower handoff, dead zones — where connectivity
  is routinely degraded or fully absent for stretches of seconds to several
  minutes. This is the modal condition for this app's primary use case, not an
  edge case.
- Secondary usage on laptop/desktop browsers, typically at a different time
  than a mobile session (sequential device switching by the same person, not
  simultaneous editing from two devices at once).
- Session pattern: short-to-medium bursts (minutes), frequently interrupted
  (app backgrounded, phone locked, network dropped, browser tab killed) and
  resumed later — sometimes seconds later, sometimes days later.
- Interaction rhythm: frequent discrete inputs (cell select, digit entry, note
  toggle, undo) roughly every 1-3 seconds during active solving.

## Expectations

- Every tap feels instant (near-zero perceived delay), regardless of current
  network state.
- The app stays fully playable through total connectivity loss lasting
  multiple minutes.
- In-progress work is never lost, regardless of when or how a session is
  interrupted.
- Resuming — same device or a different device, any time later — is seamless:
  no explicit "sync now" step, no visible reconnecting/error state during
  normal play.
- This reliability holds without requiring an account/login (v1 stays
  anonymous-session-based).

## Explicit non-goals

- **Real-time simultaneous multi-device editing of the same puzzle.** A person
  may switch devices between sessions; two devices editing the same puzzle at
  the same instant is not a supported scenario. Full CRDT-grade concurrent
  conflict resolution is therefore explicitly out of scope.
- **Adversarial multiplayer or leaderboard-integrity anti-cheat.** Not a v1
  goal.
- **Enterprise-scale concurrent users.** This remains a small, personal-scale
  project.

## Status

Last reviewed: 2026-08-28.
