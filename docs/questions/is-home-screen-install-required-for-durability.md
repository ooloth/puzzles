---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is home-screen install required for durability?

## Why it matters

Install is the only confirmed exemption from Safari's wipe of script-writable
storage. Requiring it puts friction on an audience assumed to have no technical sophistication.
Not requiring it means the durability guarantee is materially weaker for most players than for
some — and we would be promising something we only sometimes deliver.

## What would settle it

Whether a server copy exists. If
[cross-device resume](is-cross-device-resume-in-scope-for-v1.md) brings one, install stops being
load-bearing for durability and becomes an optimisation — worth encouraging, never required. If
it does not, install is one of only two ways to keep a promise already made, and the question is
whether we are willing to condition that promise on an action most players will not take.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30. Reopened 2026-08-31 when the mechanics
of install turned out to be worse than recorded.

## Options

*Required.* The durability promise holds, and only for players who install. Everyone else is
told, or not told, that their progress is provisional.

*Encouraged but not required.* Prompt at a moment where the benefit is legible, and accept two
tiers of durability. This is what most apps do, and it means the guarantee has to be worded for
the weaker tier.

*Irrelevant.* A server copy makes local eviction survivable, so install is a performance and
convenience feature with no durability role. Costs whatever
[cross-device resume](is-cross-device-resume-in-scope-for-v1.md) costs.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Install is the mechanism; `navigator.storage.persist()` is not an alternative to it.** The API
only grants persistence to origins already exempt, and an installed app's domain is one of them —
so calling it changes nothing that installing did not already do, and in an ordinary tab it
always fails. See [../constraints.md](../constraints.md). Any design that treated `persist()` as
a second, cheaper mitigation was mistaken.

**But `persisted()` is genuinely useful, and it is the honest basis for what we tell a player.**
It reports the same membership that governs deletion, so it answers "is this player's work
actually protected" better than checking how the app was launched. If we ever say *your progress
is safe*, this is the condition that sentence should be gated on.

**Installing starts an empty store, which makes required-install worse than it sounds.**
Home-screen and tab storage are separate. A player who solves in Safari and then installs on our
prompt finds nothing there — we would have taken their progress away at the exact moment they did
what we asked. So "require install" is not a policy we can adopt at any point after first run
without also building a migration, and the migration needs somewhere to put the data, which is
the server copy this option existed to avoid.

**Safari 26 made install easier to reach and less safe to assume.** Any site can now be
installed with no manifest, but the Add to Home Screen sheet lets the player decline the isolated
store, leaving them in ordinary Safari. So showing the prompt establishes nothing, and the
protected state has to be tested rather than inferred.

**Install does not protect against the failures that actually dominate.** Eviction is the
failure this option addresses. The larger category — writes rejected because WebKit killed the
network process under memory pressure — is unaffected by install, and if anything an installed
app backgrounded on a phone is the exact lifecycle that produces it. See
[../constraints.md](../constraints.md). Requiring install would harden the app against the
smaller problem while leaving the bigger one untouched.
