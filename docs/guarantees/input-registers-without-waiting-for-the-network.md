---
updated: 2026-08-30
update_when: a duration budget is agreed, or an enforcement mechanism changes
decays: slow
status: active
theme: latency
enforced: no
---

# Input registers without waiting for the network

Tapping a cell, entering a digit, and toggling a note all reach the screen from local state. No player
action's visible result depends on a round trip completing.

This is deliberately structural rather than a duration, because it can be checked today: does the path
from input to paint touch the network. A millisecond budget is a second, additional promise that
doesn't exist yet.

**Enforced by** Nothing. Asserted only.

**If violated** On a weak link, connection setup alone runs to several seconds before anything
happens — which is what a frozen board actually is. Worse, a late correction invalidates reasoning the
player has already built two moves on top of.

**Bearing on this** [What latency budget makes "immediately" checkable?](../questions/what-latency-budget-makes-immediately-checkable.md)
would add the duration promise this one deliberately omits.
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) settled that the client
holds and mutates state, which is what makes this promise achievable at all — a server-owned
architecture fails it by construction.
