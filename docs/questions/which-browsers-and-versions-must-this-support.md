---
opened: 2026-09-04
status: open
resolves_into: decision
---

# Which browsers and versions must this support?

## Why it matters

**Every promise in [../guarantees/](../guarantees/) is scoped to something nobody has written down.**
The Compatibility theme in [../guarantees/README.md](../guarantees/README.md) holds no promises and
says so plainly. Until this is answered, each guarantee quietly claims more than it can deliver.

**It became an M1 input on 2026-09-04.** Bun's bundler does not down-convert syntax, so recent
ECMAScript reaches whatever device opens the app. That was recorded in
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md)
as deciding the question against Bun on its own. It cannot, because the consequence has no weight
until something says which devices those are. A wide floor makes it disqualifying; an evergreen-only
floor makes it a footnote.

**[../constraints.md](../constraints.md) already names specific versions against no stated scope.**
Safari 26's install behaviour, the iOS 26 defect that breaks the first write when IndexedDB mints the
key, and IndexedDB's absence under Lockdown Mode are all recorded as facts to build around. Whether
they are facts about *our* population is unanswerable right now.

**It also blocks M2.**
[How is this tested across browsers and platforms?](how-is-this-tested-across-browsers-and-platforms.md)
cannot say what runs where without a matrix to test against.

## What would settle it

A stated floor: which engines, which minimum versions, and what a browser below the floor gets. The
last part is the half most likely to be skipped, and it is the one a player experiences.

Two inputs, and only one of them is research. The realistic device population for a small public
launch cannot be measured, because nothing is deployed and no analytics exist, so the first version
of this answer is a judgement drawn from [../problem.md](../problem.md) rather than a measurement.
What *can* be established today is the other half: what each candidate toolchain emits by default,
and what each named constraint in [../constraints.md](../constraints.md) implies about the oldest
device worth carrying.

**A floor is mechanically checkable once stated**, which is unusual for a scope decision. The syntax
level of the emitted bundle can be asserted in continuous integration, so this can resolve into a
check rather than into a rule somebody has to remember. That is worth preferring, per the portable
documentation standard on invariants a machine could check.

## Resolves into

A decision record in [../decisions/](../decisions/), and a promise in the Compatibility theme of
[../guarantees/](../guarantees/).

## Source

Raised 2026-09-04, on finding that the disqualifier recorded against Bun's bundler in
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md)
rests on a matrix nobody has written, and that the Compatibility theme has been empty since the
guarantees folder was created.

## Options

*Evergreen only.* The current and previous few versions of Safari, Chrome and Firefox, in their
desktop, iOS and Android forms. Smallest output, least transform machinery, and the floor most
likely to exclude someone on an old phone.

*A published baseline.* A named interoperability baseline rather than a hand-picked version list.
Enumerable, checkable by a tool, and revisable by moving one number. The cost is inheriting somebody
else's definition of what is safe.

*A floor derived from what the offline design already needs.* Service workers, the Cache API and
IndexedDB each have their own support floor, and the union of them may already be stricter than
anything picked by hand. This option makes the matrix a consequence rather than a choice, which is
worth testing before choosing.

*Not yet.* Leave it open and let whichever toolchain is adopted decide by default. This is the status
quo, and naming it as an option is the point: it is what happens if this file is never worked, and it
means the floor is set by a tool's default rather than by anyone.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**[../problem.md](../problem.md) points wide without giving a matrix.** Phone-first, played in
transit, general public, no assumed technical sophistication, with secondary desktop use by the same
person. That argues against an aggressive floor and does not name one.

**The toolchains differ on this, and it is the reason the question is urgent.** Bun's bundler does
not down-convert syntax and has no browserslist option; Vite exposes a build target. So the choice of
build tool either does or does not depend on this answer, depending on how wide the floor is.

*Sourced — [bun.com/docs/bundler](https://bun.com/docs/bundler), read 2026-09-04, recorded in full in
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md).*

**Nothing about the current player population is measurable yet.** No deployment, no traffic, no
analytics. Any percentage cited before there is a deployment is invented, and this file should reject
one.

*Reasoned — 2026-09-04, from there being nothing deployed.*
