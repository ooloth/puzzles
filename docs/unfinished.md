---
updated: 2026-08-30
update_when: a migration starts, advances, or completes; something becomes knowingly broken
decays: fast
status: stub
---

# Unfinished

Where the codebase is knowingly in a half-state: migrations in flight, two patterns
coexisting, things temporarily broken.

**Highest-consequence file in `docs/`.** An agent that misses it sees two patterns, picks
the dead one, and confidently spreads it.

Every entry carries an expiry. Past it, the entry gets updated or deleted — never left
implying a state that's no longer true. An empty file is the goal state.

Durable quirks with no end date → [gotchas.md](gotchas.md).

_Nothing in flight._

<!-- Template:

### <What's half-done>

Since: YYYY-MM-DD · Expires: YYYY-MM-DD
Old way: <pattern, and where it still lives>
New way: <pattern, and where it applies>
New code should: <one-line instruction>
Done when: <observable finish line>
-->
