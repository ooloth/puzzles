# Use Sentry for error tracking and alerting; defer custom metrics and additional platforms

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- Fly's built-in Grafana/Prometheus (noted as a benefit in `docs/decisions/12-host-on-fly-io.md`) covers infrastructure metrics only (CPU/memory/network/disk of the Machine) — not application-level error rates, business metrics, or alerting. Custom app metrics would require exposing a Prometheus-format `/metrics` endpoint for Fly to scrape.
- Considered: Sentry, Logfire (Pydantic's OpenTelemetry-based platform), Honeycomb, and relying solely on `fly logs`/the Fly dashboard without a dedicated error tracker.
- This is a solo-maintainer, single-instance, single-service, hobby/craft-scale app (`docs/vision.md`).

## Decision

- Sentry's free "Developer" tier (5,000 errors/month, 30-day retention, Rust SDK, one bundled uptime monitor) for error tracking and downtime alerting.
- Explicitly not adopted now: Logfire and Honeycomb.
- Explicitly deferred: a custom Prometheus `/metrics` endpoint for business-level metrics (puzzles solved, per-route error rates) feeding Fly's Grafana.

## Rationale

- One $0 tool (Sentry) covers both error alerting and basic uptime monitoring, which Fly's own health checks don't fully provide (they handle machine crash/restart but won't alert on things like a volume filling up).
- Logfire and Honeycomb both solve problems this project doesn't have yet: Honeycomb's core differentiator is high-cardinality querying and distributed tracing *across services* — with one process on one Fly Machine, there's no fleet to correlate and no service boundary to trace across. Logfire's cost advantage over Sentry only materializes at team-scale error volume this project is nowhere near, and its Rust support is reported as second-class (docs lag the Python SDK by months).
- Setup effort is roughly equivalent across all three options (`tracing-opentelemetry` for Logfire/Honeycomb vs Sentry's own `tracing`-integrated Rust SDK) — the real cost of adding either isn't integration code, it's reasoning about multiple dashboards and telemetry models for an app producing one simple linear stream of events.
- Fly's free infra-level dashboards already answer "is the machine alive" without any extra setup; building a custom metrics endpoint for business-level trends is real, legitimate value later, but not urgent now.

## Tradeoffs accepted

- No business-level metrics visibility (puzzles solved, per-route error rates) until the custom `/metrics` endpoint is eventually built.
- No distributed-tracing or high-cardinality-event tooling — acceptable since there's only one service to trace within.

## Revisit trigger

- If the architecture grows multiple services, or the "real product" branch in `docs/vision.md` materializes with genuine multi-instance or high-volume needs, Logfire's or Honeycomb's actual differentiators would start to earn their keep — reconsider then, not before.

## Rejected

- **Logfire**: real value at team/multi-service scale, not here yet; second-class Rust support.
- **Honeycomb**: core differentiator (distributed tracing across services) has no target in a single-instance app.
- **Relying solely on `fly logs`/dashboard**: no error aggregation, no alerting — would mean only discovering problems by manually checking logs.
- **Building a custom Prometheus `/metrics` endpoint now**: real effort with no urgent need yet; Fly's free infra dashboards already cover machine-level health.
