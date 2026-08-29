# Use hypertext for HTML templating

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- Need to render both full pages and many small HTML fragments (for Datastar SSE patches) from Rust data with control flow.
- Considered: maud, hypertext, askama.
- Askama's separate Jinja-like template files add an indirection layer (struct/template duplication) that doesn't fit rendering many small ad hoc fragments well — ruled out early.
- Maud and hypertext are both macro-based (HTML embedded directly in Rust, no separate files), comparable in raw single-template benchmarks, and both HTML-escape by default (XSS-safe by construction).

## Decision

- hypertext.

## Rationale

- hypertext's `Renderable` trait defers writing until `.render()`, composing nested components into one shared buffer. maud's `html!` macro allocates a fresh buffer on every macro invocation — a known, deliberately-unfixed tradeoff per maud's own maintainer. This project renders pages from many small reusable fragments (Datastar SSE patches), which is exactly the nested-composition pattern where hypertext's model helps most — though at this project's traffic the actual wall-clock difference is imperceptible.
- hypertext validates element/attribute names at compile time (maud doesn't) and has first-class extensibility for custom `data-*` attributes, directly relevant to writing Datastar markup.
- hypertext ships a maud-syntax-compatible `maud!` macro, so maud's familiar syntax is available if wanted, on top of hypertext's composition model.

## Tradeoffs accepted

- Much smaller community than maud (a few hundred GitHub stars vs maud's larger, older base), though actively maintained.
