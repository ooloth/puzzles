---
updated: 2026-09-12
update_when: the declared floor moves, or what a below-floor device is shown changes
decays: slow
status: active
theme: compatibility
enforced: no
---

# A device too old to run the app is told so rather than shown a blank screen

Someone whose browser falls below the declared floor sees a page saying their browser is too old.
They do not see an empty white page, and they are not left to conclude the app is broken.

**This is the other side of
[the app runs on any device still receiving security updates](the-app-runs-on-any-device-still-receiving-security-updates.md).**
That promise says who the app works for. This one says what happens to everyone else, and it exists
because a floor without a stated fallback reads to whoever is below it as the app simply being
broken.

**Whatever is shown reaches the device outside the application bundle.**
[../constraints.md](../constraints.md) records that a syntax error runs none of the script, so
nothing inside the bundle can detect this case or respond to it — a message that ships with the app
is a message that never runs. What makes this deliverable is
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md): the
entry document is produced by the build, so it can carry its own content and a handler at a syntax
level the floor browser can parse.

**This covers a browser too old to parse the bundle. It does not cover one that parses it and then
lacks an API.** That case fails at the call site, where the app is running and can respond, and it is
governed by whatever
[the app runs on any device still receiving security updates](the-app-runs-on-any-device-still-receiving-security-updates.md)
covers rather than by this promise. The two failures look identical to a player and are entirely
different to build for, which is why they are separate files.

**Enforced by** Nothing. Asserted only.
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) and
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
establish that a floor exists and where it is declared, which is what makes "below the floor" a
definite set. Neither says what a browser below it is shown, and no entry document exists yet.

**If violated** A player on an old phone gets a blank page. Per [../problem.md](../problem.md) they
have no assumed technical sophistication, so there is nothing for them to diagnose and no reason to
return. It is also the quietest failure in the product: it produces no error anyone sees, no crash
report, and no complaint, which is the same shape as the lost-progress case the observability theme
in [README.md](README.md) is built around.

**Bearing on this** [What belongs on the landing page?](../questions/what-belongs-on-the-landing-page.md)
is where the wording is decided, since this is the one message an unsupported visitor ever reads.
[How is this tested across browsers and platforms?](../questions/how-is-this-tested-across-browsers-and-platforms.md)
at M2 is what would let anyone confirm the fallback appears, which needs a browser below the floor to
run it on.
