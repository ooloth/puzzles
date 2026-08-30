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

Conventions for *writing* tests live here. How to *prove a change works* against the real
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

Exception: a **lookup table whose every cell is a word or two** — short enough that it
will never wrap at any reasonable width. `CLAUDE.md`'s docs index and the routing table
in [README.md](README.md) qualify. The moment a cell wants a sentence, it isn't one of
these any more.

Scope: documentation we maintain. `@legacy/` and `brainstorming/` are archival and are left
as they were written.

**Consider** whether a table would be scanned *down* a column before reaching for one
elsewhere. That's the only thing a table does that a list can't, and it's rarer than it
feels — `guarantees.md` looked like the strongest case for it in this repo and still read
better as prose.

<!-- Template:

## <Theme>

**Must** <rule>
Why: <consequence of not doing it>
Exception: <when it legitimately doesn't apply, or "none">
-->

Split into `standards/<theme>.md` when a theme outgrows one sitting.
