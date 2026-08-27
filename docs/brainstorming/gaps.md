Here's the gap map, organized by area:

UI/Frontend — despite being priority #1, mostly unplanned:

- Styling: Tailwind vs vanilla CSS was one of the original disregarded stub decisions and was never revisited. Still open.
- The actual grid interaction design in Datastar's DSL — we settled the paradigm (pure hypermedia, no JS), not how drag-select/keyboard-nav actually gets built.
- Which puzzle type(s) launch first (Sudoku-like vs drag-select like Star Battle/Nonogram) — you said "not decided yet" earlier and we never returned to it. This blocks the
  grid-interaction design above, since drag-select needs meaningfully more DSL work than single-cell click/type.
- Static asset serving (CSS/fonts/images) — no decision on tower-http::ServeDir vs embedding vs something else.
- Accessibility (keyboard-only play, screen readers, contrast) — not discussed at all.

Puzzle content — a real launch-blocker hiding in plain sight:

- "Upstream-sourced puzzles" was accepted as fine for v1, but which upstream, and under what license/terms, has never come up. This isn't the same question as "generation" (which
  is deliberately deferred) — you can't launch without solving this one, deferred or not.

Deployment/ops — flagged as "undecided, want tradeoffs" early on, then the conversation moved to app architecture and never came back:

- Hosting (VPS/self-hosted vs PaaS) — nothing has replaced the disregarded brainstorm's Hetzner/Caddy/systemd suggestion.
- Backups for the SQLite file — not optional; it's the one copy of everyone's progress. No decision yet.
- TLS/reverse proxy.
- Actual deploy mechanism (CD) — CI (checks on push) is decided; how a merged commit reaches production is not.
- Secrets/environment/config management across local vs prod.
- Production observability (structured logging/tracing, error visibility) — tracing was a "boring default" in the original brainstorm but never actually decided for this project.

Smaller/cross-cutting, lower urgency:

- Domain modeling for a "puzzle" as a Rust type + schema — reasonably deferred to when you're actually building (fits the /design workflow later), not a gap that needs closing now.
- Basic hardening (request limits, rate limiting on SSE endpoints) — fine to defer, no accounts yet reduces urgency.
- Migration file conventions for sqlx — implied by the sqlx ADR, not worth its own decision doc.

If I had to rank by urgency: puzzle content sourcing and backups are the two that could genuinely block or endanger a real launch if left unplanned; styling and the
grid-interaction design block actually writing UI code; hosting/deploy mechanics block getting anything in front of a user at all. Generation algorithms, accessibility depth, and
hardening are legitimately fine to leave for later.
