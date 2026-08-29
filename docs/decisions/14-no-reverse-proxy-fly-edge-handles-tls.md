# No reverse proxy — Fly's edge handles TLS

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- The original (disregarded) brainstorm assumed a self-hosted VPS with Caddy providing automatic HTTPS.
- `docs/decisions/12-host-on-fly-io.md` moved hosting to Fly.io, which changes this: Fly Proxy (their edge/anycast layer) terminates TLS automatically for both the default `*.fly.dev` subdomain and custom domains, via auto-issued Let's Encrypt certificates (`fly certs add`), then forwards decrypted traffic to the app over Fly's internal network.

## Decision

- No reverse proxy (Caddy or otherwise) runs inside the Machine. The Axum app binds a plain HTTP port internally; Fly's edge handles all TLS termination in front of it.

## Rationale

- Matches Fly's platform model — running a redundant reverse proxy inside the Machine would add a piece of infrastructure Fly already provides for free.
- Removes an entire ownership burden (cert renewal, Caddy config) that was only necessary under the VPS plan.

## Tradeoffs accepted

- This decision is specific to Fly as host. If the VPS upgrade path recorded in ADR-12 is ever taken, this reverses — a reverse proxy (e.g. Caddy) would need to be reintroduced at that point.

## Related risk

- Fly's edge proxy has documented SSE buffering/delay issues in some configurations — since Datastar's entire transport is SSE, this is tracked as a known risk to verify empirically, not assumed away by this decision. See `docs/failure-modes/` once recorded.
