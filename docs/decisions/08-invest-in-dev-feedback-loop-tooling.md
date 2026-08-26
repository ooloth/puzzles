# Invest in dev feedback loop tooling from day one

Status: Decided

## Context

- Fast feedback loops are a named priority (see project CLAUDE.md).
- The app is server-rendered with no client-side JS bundle, so there's no hot-module-reload path — every change means recompile, relink, restart, and browser refresh. Linking is typically the slowest part of a Rust rebuild.

## Decision

- An auto-restart watcher (bacon or cargo-watch) for recompile-and-restart on save.
- A faster linker (`lld` or `mold`, whichever fits the dev platform) configured via `.cargo/config.toml` from day one.

## Rationale

- The watcher is table stakes for any edit-save-see-result loop.
- The linker swap is a one-time, low-effort setup that can cut rebuild-and-restart to roughly 1-3 seconds for a small binary — worth doing now rather than waiting for compile times to actually start hurting, given feedback loops are an explicit project priority.
- `sccache` was considered and skipped for now: it helps cold/CI builds more than the tight local edit-loop this decision is optimizing for.

## Tradeoffs accepted

- This will never feel as fast as a JS frontend dev server (e.g. Vite/React) — there's no hot-swap path for server-rendered HTML. The ceiling here is "fast recompile-and-restart," not instant reload.
