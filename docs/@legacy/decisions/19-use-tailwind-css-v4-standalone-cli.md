# Use Tailwind CSS v4 (standalone CLI) for styling

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- One of the original disregarded brainstorm's stub decisions ("Tailwind vs vanilla CSS") was never revisited on its own merits — reopened from scratch here.
- The project has deliberately avoided extra toolchains throughout (no Docker, no JS framework, no Node.js anywhere) and renders HTML server-side via `hypertext` (`docs/decisions/06-use-hypertext-for-html-templating.md`).
- Priority #1 is a custom-designed, world-class solving UX (`docs/vision.md`), built by a solo maintainer without a dedicated designer, with heavy AI-assisted development.
- Tailwind v4 changed the tooling calculus significantly since the original brainstorm: a standalone CLI binary needs no Node.js/npm at all, and configuration is now CSS-native (`@import "tailwindcss"` + `@theme`), with no `tailwind.config.js`.

## Decision

- Tailwind CSS v4, via its standalone CLI binary, run in watch mode as a second process alongside `bacon`/`cargo-watch` during development.

## Rationale

- No Node.js dependency at all — fully consistent with the project's stance throughout.
- Tailwind's content-scanning works fine with `hypertext`'s Rust macros — confirmed working with Rust HTML-templating crates in practice, since Tailwind scans source files as plain text for class-name-shaped tokens regardless of templating language.
- Current frontend discourse has narrowed the general Tailwind-vs-vanilla-CSS gap, but the factors that do still differentiate them both favor Tailwind here: it wins for custom-designed, non-content-heavy UIs (this is a bespoke puzzle-grid interface), and it wins for AI-assisted development specifically, since structured utility classes are more predictable for an LLM to generate and edit than free-form CSS.
- Gives a consistent design-token scale (spacing, color, typography) without the solo maintainer having to hand-build one.

## Tradeoffs accepted

- **Only literal class-name strings are detected by Tailwind's scanner** — classes built via `format!`/string concatenation in Rust, or via Datastar's `data-class` expressions that construct a class name dynamically rather than referencing a literal one, won't be picked up. Discipline required: always reference complete literal class strings somewhere in source (a lookup table if needed), or use Tailwind's `safelist` for the rare case that requires it.
- One more watch process during development (the Tailwind CLI's `--watch`), alongside `bacon`/`cargo-watch` — mechanical to wire up, not a meaningfully worse dev loop.

## Rejected

- **Vanilla CSS**: fewer moving parts and no class-detection discipline to maintain, but leaves the solo maintainer to hand-build a consistent design-token system from scratch, working against the "world-class UX without a dedicated designer" priority.
