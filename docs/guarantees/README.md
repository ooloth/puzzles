---
updated: 2026-09-02
update_when: a promise is made to players, a promise is withdrawn, or a theme is added
decays: slow
status: active
---

# Guarantees

What must always be true for a player. Violating one is **our** bug — not the platform's
(→ [../constraints.md](../constraints.md)), and not a reversible choice
(→ [../decisions/](../decisions/)).

**One promise per file, named for the promise.** A directory listing is the list of what we owe
players, the same way a listing of [../decisions/](../decisions/) is the list of what is binding on
implementation. A theme file holding four promises hides four separate enforcement states behind one
filename, and the thing that gets violated is a promise rather than a theme.

Nothing here is enforced yet, because there is no application code yet. The `enforced` field in each
file's frontmatter is what tells you which have become real: `rg -l 'enforced: no' docs/guarantees/`
is the backlog.

Each promise states what it costs when it breaks. *How* it breaks is
[../failure-modes/](../failure-modes/) — the two are halves of one picture, and a guarantee whose
failure modes are unexamined is a promise nobody has tried to break.

## Every guarantee names what enforces it, and says so plainly where nothing does

An unenforced guarantee is a wish. Recording the absence turns this folder into a backlog as well as a
list of promises — and a wish labelled as a promise is worse than no promise, because someone will
build on it.

## A promise is enforced, or its limits are written into it

Where a promise can't be made to hold in every condition, the conditions under which it doesn't hold
are stated as part of the promise. There is no separate place for fallbacks — an escape hatch nobody
wrote down reads to a player as the promise simply being false. A guarantee with a stated boundary is
honest; one with an unstated one is not.

## Writing a guarantee

The filename is the claim, and the H1 restates it in full. Both are something you could hold against
the running system and mark true or false.

**The filename names what a player would notice, not how it is kept.** "The app never opens to a
blank screen" is the promise; "a precached fallback document is served" is the mechanism, and a
mechanism in a filename dates the moment the mechanism changes. Implementation vocabulary — storage,
state, cache, render, sync — is the sign this has been written from the inside. It does not follow
that the wording should address the player directly: these are read by whoever is auditing the
system as often as by anyone else, and plain declarative English serves both.

**The claim asserts a promise, never the absence of one.** A file saying nothing is promised about
something is the one thing this folder must not hold — an empty listing already says that, and a
file saying it reads as a commitment while making none. Within that rule, phrasing follows whatever
is most salient: "never opens to a blank screen" is sharper than any positive rewrite of it, because
the blank screen is the thing worth naming.

**Every caveat is in the filename.** A promise that holds only after the first visit, or only for the
board currently open, or only for a signed-in player, says so in its own name. A reader must never
have to know that some other file — possibly far away in the listing — carries the condition that
makes this one true. A caveat-free name is a claim that the promise is unconditional.

**One promise per file, split until each is atomic.** Where a promise differs by who is playing
(guest, signed in), by what it covers (the board in progress, past boards, a play record), or by
condition, those are separate promises and get separate files. An "and" joining two separable claims
means two files. A bundle hides the fact that one half is enforced and the other is not.

Related promises group themselves by sharing an opening phrase — `every-puzzle-…`, `the-app-…`,
`the-board-…` — so the listing sorts into families without prefixes invented for the purpose.

- Present tense, unconditional within the caveat the name states.
- Every qualifier is measurable or enumerable. If a claim needs "immediately", "several", or "normal
  play", either replace it or the guarantee isn't written yet.
- Frontmatter carries `theme` and `enforced`, so the folder can be grouped and queried without
  reading it.

Under the claim: what enforces it, what breaks if it doesn't hold, and what open questions or
constraints bear on it.

## The promises

### Puzzles — what makes a puzzle worth solving

- [Every puzzle has exactly one solution](every-puzzle-has-exactly-one-solution.md)
- [Every puzzle is solvable by deduction alone](every-puzzle-is-solvable-by-deduction-alone.md)

Promises about the *set* offered over time — that a player is never served the same puzzle twice, that
a difficulty label means the same thing across puzzles, that the catalogue never runs dry — belong
here too, and none have been made. They become real as soon as generation is on the table.

### Durability — a player's work outlives the session that made it

- [Reopening restores the board in progress with notes and selection](reopening-restores-the-board-in-progress-with-notes-and-selection.md)

Only the board in progress is covered. Boards already finished and a player's record of play have no
promise yet, and neither does any duration — those are settled by
[how long does a guest's work last?](../questions/how-long-does-a-guests-work-last.md) and
[how long does a signed-in player's work last?](../questions/how-long-does-a-signed-in-players-work-last.md),
and get written here as those records land.

### Latency — how quickly the app answers a player's action

What the app *costs* the device while doing it is performance, below.

- [Input registers without waiting for the network](input-registers-without-waiting-for-the-network.md)

### Offline — behaviour when the network is degraded or gone

For a game played on a commute this is the normal case rather than an edge case.

- [The board in play continues through a loss of connectivity](the-board-in-play-continues-through-a-loss-of-connectivity.md)
- [The app never opens to a blank screen after the first visit](the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
- [The player is never asked to retry or reconnect](the-player-is-never-asked-to-retry-or-reconnect.md)
- [Conflicts are reconciled without asking the player](conflicts-are-reconciled-without-asking-the-player.md)

Two claims that used to ride inside the retry promise — that no move is lost when a connection fails,
and that no move is reverted by a later sync — are not promised. Both are real commitments about
reconciliation that no record has argued, and they get written here if and when
[what happens to a losing write when syncing?](../questions/what-happens-to-a-losing-write-when-syncing.md)
settles.

### Accessibility — who can play, and how

Grid puzzles raise real keyboard-navigation and screen-reader questions — announcing cell position,
current value, notes, and constraint violations. **These are expensive to retrofit once an
interaction model exists**, and silence about them is not a decision to skip them.

- [Every action while solving is reachable from the keyboard](every-action-while-solving-is-reachable-from-the-keyboard.md)

**No promise is made about assistive technology**, and that is not silence.
[ADR-0013](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md) keeps it
structurally reachable — every cell is an element that can carry a name, a role and a state — without
committing to it. [Is screen reader support in scope for v1?](../questions/is-screen-reader-support-in-scope-for-v1.md)
is where that is decided, and it records open WebKit bugs covering exactly the grid mechanics a puzzle
board needs, so part of the cost there is waiting rather than working.

## Themes holding no promises yet

A theme appears here once it is an area we expect to make promises in. An empty one is a promise
nobody has written, which is worth being able to see.

**Sudoku** — promises that hold for sudoku and not for grid logic puzzles generally, so variant claims
don't quietly get generalised. Likely candidates: which constraint families are validated; a floor on
the number of givens, since below a known minimum a 9×9 grid cannot have a unique solution; what
difficulty tiers mean in terms of the techniques a solve requires. The third depends on
[is difficulty graded, and does a grade promise anything?](../questions/is-difficulty-graded-and-does-a-grade-promise-anything.md),
and grading is inherently variant-specific — what makes a sudoku hard has no counterpart in star
battle.

**Interaction** — what the interface has to convey for a player to reason at all. A display
characteristic belongs here when its absence changes what a player can *rely on*, not merely how
things look. The motivating candidate: a provisional note is always visually distinct from a committed
entry. A player who can't tell what they've decided from what they're still considering can't reason,
and reasoning is the entire activity.

**Correctness** — the program does what it says across all inputs, states and callers. Whether a
*puzzle* is sound is the puzzles theme; how code is *written* is a standard rather than a promise, and
lives in [../standards/](../standards/). Likely candidates once there is code: applying the same move
twice has the effect of applying it once; a partial write is never observable; the board on screen
always matches the board in storage. The first is already implicated by
[what happens to a losing write when syncing?](../questions/what-happens-to-a-losing-write-when-syncing.md).

**Compatibility** — which browsers, which OS versions, which device classes. Every promise in this
folder is implicitly scoped to something, and until that scope is written down each one quietly claims
more than it can deliver. This matters sooner than it looks: the storage behaviour shaping durability
differs by browser and version, and only Safari's is written down.
[How does Android evict stored data?](../questions/how-does-android-evict-stored-data.md) is
unresearched, which is half the market with no stated position at all.

**Observability** — whether we would *know* a promise had been broken, for a failure that has already
happened to a real player. The motivating case is lost progress, which produces no error, no crash and
no complaint — the player simply doesn't come back. See
[how would we learn a player lost progress?](../questions/how-would-we-learn-a-player-lost-progress.md).
Anything reporting home has to fail invisibly, because a failed report must not surface as an error
the player has to deal with.

**Performance** — what the app costs the device it runs on: battery, memory, storage, bundle size, and
how long generation takes. Two constraints will shape whatever lands here: mobile radios are expensive
to wake regardless of payload size, and client CPU and memory are not scarce for this workload. See
[../constraints.md](../constraints.md).

**Privacy** — what we know about a player, what we keep, how long we keep it, and what we never send
anywhere. Nothing has examined its obligations:
[do privacy regulations apply?](../questions/do-privacy-regulations-apply.md) resolves into a
constraint; the promises made on top of it belong here.

**Security** — what a hostile input, request, or actor cannot cause. For a single-player game with
nothing ranked or paid for the surface is small today, but it grows the moment anything is worth
gating, and gating is a door being deliberately held open rather than one expected to stay shut. See
[is there a paid tier?](../questions/is-there-a-paid-tier.md) and
[are there user accounts?](../questions/are-there-user-accounts.md).
