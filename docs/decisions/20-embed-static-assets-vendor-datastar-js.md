# Embed static assets in the binary, vendor a pinned Datastar JS

Status: Decided

## Context

- Static assets needed: Datastar's client-side JS library, the compiled Tailwind CSS output (`docs/decisions/19-use-tailwind-css-v4-standalone-cli.md`), a favicon, and future images/fonts.
- The official `datastar` Rust crate (`docs/decisions/05-use-axum-with-official-datastar-sdk.md`) is server-side only — SSE helpers, no client-side JS bundled. The actual `datastar.js` file must be loaded separately, either vendored or via CDN.
- Datastar's own documentation states hosting the file yourself is recommended over the CDN quick-start snippet; community guidance adds that Datastar doesn't document how its CDN bundles are built, so production use should pin an exact version and verify checksums rather than trust a floating CDN tag.
- Deployment already goes through a hand-written Dockerfile (`docs/decisions/15-hand-write-dockerfile-deploy-via-github-actions.md`), so a `COPY` of a static assets directory would be cheap either way — the choice between embedding and serving from disk isn't about avoiding Docker complexity.
- Considered for serving: `tower_http::services::ServeDir` (filesystem-based) vs `rust-embed`/`tower-serve-static` (compile-time embedding into the binary).
- Considered for cache-busting: content-hashed filenames with long-lived immutable cache headers vs relying on conditional-request support (ETag/Last-Modified).

## Decision

- Vendor a specific pinned, checksum-verified version of `datastar.js` into the repository rather than loading it from a CDN.
- Embed all static assets (the vendored Datastar JS, compiled Tailwind CSS, favicon, future images/fonts) into the compiled binary via `tower-serve-static`/`rust-embed`, rather than serving them from disk via `ServeDir`.
- Defer content-hashed filenames and long-lived immutable caching for now; rely on the embedding crate's built-in conditional-request (ETag/Last-Modified) support instead.

## Rationale

- Matches Datastar's own recommendation and avoids depending on an undocumented CDN build process for a core piece of client-side interactivity.
- Embedding keeps the deployable artifact to one self-contained binary, consistent with this project's repeated preference for single-binary deployment simplicity, and removes an entire failure mode ("asset missing from the container") that a `ServeDir` + separate `COPY` step could hit if they ever drift out of sync.
- Deferring cache-busting avoids adding a build step with no current measured need; conditional requests are sufficient at this project's scale.

## Tradeoffs accepted

- Vendoring Datastar's JS means manually bumping the pinned version and re-verifying its checksum when upgrading, rather than always picking up the latest CDN build automatically. Accepted as the safer default given the stated supply-chain reasoning.
- Without content-hashed filenames, browsers revalidate cached assets via conditional requests rather than skipping the request entirely — a small, currently-immaterial cost at this project's traffic level.

## Rejected

- **CDN-loaded Datastar JS**: simpler day-to-day, but against Datastar's own production guidance.
- **`tower_http::ServeDir` from disk**: viable given Docker is already in the deploy path, but embedding removes a failure mode at no real extra cost here.
- **Content-hashed filenames now**: real value later, but an unnecessary build step before it's an actual measured problem.
