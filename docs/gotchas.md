---
updated: 2026-09-26
update_when: you were surprised
decays: slow
status: active
---

# Gotchas

Non-obvious things about **this repo** that will bite you. The trigger is emotional: if you
were surprised, write it down now — that's the moment the knowledge exists and is about to
be lost.

Durable only. Anything with an end date → [unfinished.md](unfinished.md).
Facts about the outside world → [constraints.md](constraints.md).

### A browser can show an old app at `localhost:5173`

Actually: the renderer spikes behind [ADR-0038](decisions/0038-the-renderer-is-react.md) ran on the
same address as `pnpm dev`, and a browser can keep serving one of them from its stored site data
after the dev server has changed. Safari did; Chrome did not. Deleting the site data for `localhost`
fixes it: in Safari, Settings → Privacy → Manage Website Data; in Chrome, DevTools → Application →
Clear site data.
Bites you when: `pnpm dev` seems to serve something other than `src/client/`. `curl` shows what the
server actually sends. From M9 the app registers its own service worker on this address, which
makes this more likely.

<!-- Template:

### <What looks true but isn't>

Actually: <what's really going on>
Bites you when: <the situation where this costs time>
-->
