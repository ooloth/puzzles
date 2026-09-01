---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How does a second device recognise the same person?

## Why it matters

If cross-device resume is in scope and accounts are not, this needs an answer nobody has
proposed yet. Anything anchored solely in browser-controlled storage is disposable by both the
browser and the user.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options and findings ported from legacy ADR-11 (track progress via anonymous server-side sessions).

## Options

Ordered roughly by how much a player has to do. Several combine — anonymous recovery underneath
a durable mechanism on top is the usual shape.

*Nothing.* No identity, no recognition, no recovery. Zero friction and zero portability.

*An anonymous server-set cookie.* The browser presents it and the server returns that player's
state. Invisible, no signup, and it survives Safari's storage wipe provided the topology passes
the first-party test in [../constraints.md](../constraints.md). Useless to a second device, which
has no cookie to present.

*An emailed link that writes a local credential.* Buying or signing up sends a link; opening it on
a device marks that device as entitled. No password, no session, no account table — the email is
the credential, and can be reopened on each device the player uses. Being a bearer token in an
inbox, it is shareable. Where the credential is stored decides whether it survives.

*Payment-provider identity.* The subscription record is the account: a player enters the address
they paid with and gets a link back in. No user table and no separate signup, because paying
already required an email. Only exists for people who have paid, so it pairs with anonymous
cookies underneath.

*A magic-link account.* Email, no password. Captures the address, which is the channel for telling
players about anything paid later. Needs an email provider, its costs and its deliverability
problems.

*Passkeys.* Biometric, no password, no email provider, and cross-device transfer arrives free
through the platform keychain rather than being built. The most modern answer and the least
familiar to players; device-bound for anyone whose keychain does not sync.

*A pairing code, typed or scanned.* One device shows it, the other accepts it. No email, no
provider, and the cheapest possible transfer. See Findings for why the scanned variant is weaker
than it first appears.

*Social sign-in.* One tap, and account recovery becomes someone else's problem. Costs a dependency
and hands a third party the player list.

*A password account.* The most to build, the worst to use, and the only option carrying breach
exposure. Listed for completeness.

*Export and import a blob.* The player copies a string or file somewhere themselves. No server at
all, fully under their control, and unreasonable for an audience described as having no assumed
technical sophistication.

## Findings

**Origin topology is a factor here, and it fails silently.** If sessions are carried by a cookie,
Safari caps a server-set cookie back to seven days when it judges the setting server not genuinely
first-party — which is the shape of a static host with its API on another origin, per
[../constraints.md](../constraints.md). Serving the client and its API from one origin avoids the
test entirely. A bearer token in script-writable storage avoids it too, at the cost of living in
storage the browser evicts and being reachable by any script that runs on the page. Neither is
forced; what is forced is that this gets chosen rather than inherited from wherever the two things
happen to be deployed.


**The axis that orders all of these is where the credential lives.** Anything held by the browser
is durable only conditionally: `localStorage` is deleted by Safari after thirty days without
interaction, a cookie written by JavaScript is capped at about seven, and a server-set
`HttpOnly` cookie survives only while the setting server looks genuinely first-party. Anything
held by the *player* — an email, a passkey, a code they can retype — is durable unconditionally,
because it was never in the browser to be cleared.

That single distinction reorders the list more than convenience does. A mechanism can have
excellent UX and still be quietly unreliable if its credential sits in evictable storage.

**One shipped product demonstrates this.** Circle9 Puzzle sells an inexpensive yearly plan with no
login, writing a key into `localStorage` on each device the player opens the purchase email on.
Their instructions tell you to find that email and click it again if access is lost. That is not a
fallback for an unusual case — `localStorage` is exactly what Safari's wipe deletes, so on Safari
it is the routine path for anyone who plays less than weekly. The same design with a server-set
cookie instead of `localStorage` would be robust. The storage choice, not the login-free idea, is
what makes it fragile.

**The scanned pairing code is weaker than it sounds.** It requires both devices present and awake,
and it only flows in one direction comfortably: a laptop can display a code for a phone to scan,
but a phone cannot conveniently show one to a laptop, which is the direction a player is most
likely to want. It also assumes familiarity with scanning something that is not a restaurant menu.
A short typed code avoids both problems and is duller, which is usually the right trade.

**Recognition and having accounts are close to the same question.** Every option above answers
both — whether a player signs up falls out of whichever mechanism is chosen rather than being
decided separately. See [are there user accounts?](are-there-user-accounts.md), which may be
better merged into this one than kept beside it.
