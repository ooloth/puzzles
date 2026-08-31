---
updated: 2026-08-30
update_when: a convention is agreed, or an existing one is repeatedly violated for good reason
decays: slow
status: stub
---

# Standards

How we work here. Graded, because not all rules deserve equal force:

- **Must** — no sanctioned exception; violating it means the code is wrong
- **Should** — the default; deviating needs a stated reason
- **Consider** — a prompt, not a rule

Every entry carries a rationale. A rule you can't argue with gets cargo-culted or ignored.

Conventions for _writing_ tests live here. How to _prove a change works_ against the real
system lives in [verification.md](verification.md).

## Documentation

**Must** not use tables in documentation.

Why: docs are read and edited in a plain editor far more often than they're rendered.
A table there is raw pipe-delimited text whose columns only line up because of padding
nobody wants to maintain — editing one cell means re-padding its row, a formatter re-pads
the whole block on save, and a one-word change shows up as a rewrite of every line. Any
cell holding a sentence pushes the source line past a comfortable width, and rendered
tables with prose columns are usually too wide to read anyway.

Instead: a bolded claim followed by its explanation as a paragraph, or a list with the
link on one line and its description indented beneath. Both wrap naturally at any width,
never need alignment, and produce diffs that touch only what changed. Grep also reads
them better — `rg -A1 'Enforced by' docs/guarantees.md` is a usable query against
paragraphs, and a mangled mess against table rows.

Exception: a **lookup table whose rows wouldn't wrap at 100 columns**. If any row would wrap,
it shouldn't be a table. `CLAUDE.md`'s docs index and the lookup in [README.md](README.md)
qualify at two columns with concise content in each.

**Must** update `CLAUDE.md`'s docs table and [README.md](README.md)'s together.

Why: they are the same lookup, deliberately duplicated so an agent has the map in context
without needing a file read. Adding or removing a doc means editing both, or one of them
starts pointing at something that isn't there.

<!-- Template:

## <Theme>

**Must** <rule>
Why: <consequence of not doing it>
Exception: <when it legitimately doesn't apply, or "none">
-->

Split into `standards/<theme>.md` when a theme outgrows one sitting.
