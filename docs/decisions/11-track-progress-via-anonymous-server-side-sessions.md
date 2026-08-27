# Track progress via anonymous server-side sessions

Status: Decided (v1 shape only — schema/column-level design still to come)

## Context

- `docs/vision.md` leans toward server-owned state (per Datastar's philosophy) over client-local state, from v1 — but explicitly left open whether that requires real user accounts at launch.
- Wanted the smallest coherent v1 shape, not a full accounts system, per an explicit request to take this in small, careful steps.
- Considered: full accounts (email/password or OAuth) from day one, vs an anonymous server-side session with no signup.

## Decision

- Anonymous sessions: an opaque random ID set in a long-lived, HTTP-only cookie on first visit. No signup, no login for v1.
- A stable per-session anchor exists server-side, mainly so a future "claim this session with an account" upgrade path has somewhere to attach without restructuring anything — the exact schema/column shape is a separate, later decision.
- Progress is tracked per session per puzzle by storing the actual in-progress state, not a separate completed/not-completed flag. Completion is derived by comparing stored state to the puzzle's solution when needed, rather than kept as a second, independently-updated field.
- Session identity uses an opaque ID plus a server-side lookup, not a self-contained signed/stateless token — a lookup is already required for progress anyway, so a signing/verification layer would add nothing.

## Rationale

- Matches "add infrastructure because the app requires it now, not because it might someday" — accounts are deferred to a possible future pro-tier gate rather than built now on spec.
- Deriving completion from stored state avoids two sources of truth (stored state vs. a completed flag) going out of sync; recomputing on read is fine at this project's scale.

## Tradeoffs accepted

- Single-browser only: clearing cookies or switching devices loses all progress, with no recovery path in v1. Accepted deliberately — the real fix (accounts) is intentionally a later concern.
- No anti-abuse measures: anonymous sessions can trivially be reset by clearing cookies. Not addressed now since no competitive/social feature (leaderboards, streaks) is currently planned; any real leaderboard would need actual accounts anyway, so this doesn't block anything later.

## Rejected

- **Full accounts from day one**: would solve cross-device continuity and abuse-resistance immediately, but contradicts the stated preference for the smallest possible v1 and for gating accounts behind a future pro tier.
- **Signed/stateless session tokens**: no clear benefit here since a database lookup is already required to fetch progress.
