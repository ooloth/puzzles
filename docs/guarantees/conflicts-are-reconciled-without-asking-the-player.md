---
updated: 2026-08-30
update_when: the reconciliation rule is settled, or an enforcement mechanism changes
decays: slow
status: active
theme: offline
enforced: no
---

# Conflicts are reconciled without asking the player

When two copies of a board disagree, the app resolves it. The player is never presented with a choice
between versions.

**Enforced by** Nothing. Asserted only.

**If violated** The player is asked to arbitrate a data-model detail they have no way to reason
about, and whichever they pick, they lose something.

**Bearing on this** [What happens to a losing write when syncing?](../questions/what-happens-to-a-losing-write-when-syncing.md)
is unresolved, and it matters here: last-write-wins reconciles silently by *discarding* a write, which
sits badly beside the intent that a player's work is never lost.
[How does a device know its board is behind?](../questions/how-does-a-device-know-its-board-is-behind.md)
is the case this promise is quietest about — a device that resumed from an older board has created a
divergence nobody chose, and reconciling it silently is exactly what this promise asks for.
