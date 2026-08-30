# UX Invariants

What must always be true of the user experience, or the app isn't working
as intended — each scoped to the condition it applies under. Grounded in
`docs/context/usage.md` and `docs/context/constraints.md`.
Architecture decisions in `docs/decisions/` must cite these by name, not
restate them.

## UX-1: Instant input feedback

Tapping a cell, entering a digit, or toggling a note always renders visible
feedback immediately, under any network condition — including none.

## UX-2: Offline playability

The app stays fully interactive, with no errors or broken UI, through total
loss of connectivity lasting at least several minutes — sized to the
dropout durations in `constraints.md`'s network section (seconds to a
couple of minutes in tunnels/dead zones).

## UX-3: No progress loss

In-progress puzzle state (grid fills, notes) is never lost, regardless of
when or how a session is interrupted (app backgrounded, tab killed, phone
locked, browser crash) — because state is persisted locally before any
interruption can occur, independent of when the last successful server sync
happened.

## UX-4: Seamless resume

Reopening the app — on the same device or a different one, seconds or days
later — always restores the exact prior puzzle state automatically, with no
explicit sync step and no merge/conflict prompt in the ordinary
(sequential, non-concurrent) case.

## UX-5: Invisible sync

When connectivity returns after an offline period, locally-accumulated
progress syncs in the background — never showing a loading/reconnecting/
error state during normal play, and retrying silently on failure.
