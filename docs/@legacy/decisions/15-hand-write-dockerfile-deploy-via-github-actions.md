# Hand-write the Dockerfile, deploy via GitHub Actions + flyctl

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- An earlier decision skipped Docker/Docker Compose for local development, since it adds little value for a single static Rust binary — but that decision was about the local dev workflow, not the deploy artifact.
- Fly Machines are Firecracker microVMs built from container images regardless — deploying to Fly requires an image, whether or not Docker is used locally.
- `fly launch`'s Rust auto-scanner generates a reasonable cargo-chef-based multi-stage Dockerfile, but has a known, unfixed bug that crashes on Cargo **workspaces** — exactly this project's shape per `docs/decisions/04-separate-puzzle-generation-from-serving.md`.

## Decision

- Hand-write the Dockerfile (cargo-chef multi-stage pattern) rather than relying on `fly launch`'s scanner. The final stage builds and copies both the web-app and puzzle-generator binaries, with an entrypoint/supervisor step that runs both processes on the one colocated Machine (per `docs/decisions/12-host-on-fly-io.md`).
- Deploy via GitHub Actions running `flyctl deploy --remote-only`, authenticated with a `FLY_API_TOKEN` repository secret — Fly's current standard, officially documented CD pattern.

## Rationale

- Avoids the documented workspace-scanner bug entirely rather than working around it.
- Keeps local development untouched: the Dockerfile is purely a CI/deploy build artifact. Day-to-day development still runs the raw binary via bacon/cargo-watch, with no Docker involved, consistent with the earlier "skip Docker for local dev" decision.
- `flyctl deploy --remote-only` uses Fly's remote builder, keeping build compute off the CI runner and off the deployed Machine itself.

## Tradeoffs accepted

- One more file (the Dockerfile) to maintain — but it's only touched when deploy configuration changes, not during regular development.

## Rejected

- **Relying on `fly launch`'s auto-generated Dockerfile**: breaks on Cargo workspaces, which this project uses.
