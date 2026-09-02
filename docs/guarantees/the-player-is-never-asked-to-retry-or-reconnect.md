---
updated: 2026-09-02
update_when: a promise about degraded connectivity changes, or an enforcement mechanism changes
decays: slow
status: active
theme: offline
enforced: no
---

# The player is never asked to retry or reconnect

Nothing the app shows asks the player to act on the state of the network. No retry button, no
reconnect prompt, no dialogue standing between them and the board. The network is our problem to
handle rather than theirs to manage.

**This is about what the player is asked to do, not what they are shown.** Displaying that the app is
offline — a small indicator, a note that a puzzle will sync later — is permitted, and is a design
judgement rather than a broken promise. What is forbidden is making them act on it.

**Enforced by** Nothing. Asserted only.

**If violated** The player is made responsible for conditions they cannot affect, in the middle of
concentrating on something else.

**Bearing on this** [How long until a stalled connection surfaces as an error?](../questions/how-long-until-a-stalled-connection-surfaces-as-an-error.md)
— a stalled connection throws nothing, so anything built to catch errors will not notice it and the
prompt this forbids is what usually gets reached for.
[Is the player shown anything about the network?](../questions/is-the-player-shown-anything-about-the-network.md)
is the design judgement this promise deliberately leaves open.
