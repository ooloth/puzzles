# Manage secrets with the 1Password CLI locally, fly secrets in production

Status: Decided

## Context

- Runtime secrets are minimal at this stage: R2 credentials for Litestream (`docs/decisions/13-back-up-sqlite-with-litestream.md`) are the main one. `docs/decisions/11-track-progress-via-anonymous-server-side-sessions.md` explicitly uses an opaque ID with a database lookup rather than a signed token, so no session-signing secret is needed.
- Considered for production: Fly's native `fly secrets set` vs a dedicated third-party secrets manager (Doppler, 1Password, Vault).
- Considered for local dev: a `dotenvy`-loaded `.env` file vs `direnv` vs the 1Password CLI (`op run`) vs no tooling at all — the author is already a 1Password user.
- sqlx's offline query-checking (`.sqlx` cache, checked into git per `06-use-hypertext-for-html-templating.md`'s sibling sqlx tooling) means `DATABASE_URL` is only needed transiently, when running `cargo sqlx prepare` after adding or changing a query — not for ordinary `cargo build`/`cargo run`.

## Decision

- Production: `fly secrets set` — Fly's native encrypted secrets store, injected as environment variables into the Machine.
- Local dev: the 1Password CLI (`op run --env-file=.env.template -- <command>`), using one committed `.env.template` file containing both plain config values (e.g. `DATABASE_URL=sqlite://dev.db`) and `op://vault/item/field` references for anything actually secret. No `dotenvy` dependency in the Rust app — `op run` injects real environment variables into the process before it starts.
- Environments: local dev and production only. No separate staging/preview environment for now.

## Rationale

- One unified mechanism (1Password CLI) handles both local secrets and local config, using a tool already part of the author's workflow, rather than introducing a separate `.env`-loading crate.
- Real secret values never touch disk in plaintext and never risk being accidentally committed — `.env.template` only ever contains `op://` references, safe to commit.
- `fly secrets` avoids adopting a third-party secrets manager at a scale that doesn't need one yet.
- Local+production-only matches the project's stated scale and YAGNI stance; CI running tests against an ephemeral SQLite file is the pre-merge safety net.

## Tradeoffs accepted

- Requires the 1Password CLI installed and signed in for local dev — a small setup dependency, acceptable since the author already uses 1Password day-to-day.
- No staging environment means changes are verified by CI and local testing before reaching production directly — accepted as sufficient at this scale, revisit if that stops being true.

## Rejected

- **`dotenvy` + plain `.env` file**: works, but stores real secret values in plaintext on disk with only `.gitignore` protecting them from being committed — the 1Password CLI avoids that risk entirely while being no more effort for someone already using 1Password.
- **A dedicated secrets manager (Doppler/1Password Connect/Vault) for production**: adds real operational surface with no clear benefit yet at this project's scale; `fly secrets` already covers the actual need.
- **A staging/preview environment now**: not needed yet at this scale; add later if it becomes a real gap.
