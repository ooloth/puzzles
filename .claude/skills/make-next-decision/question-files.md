<!-- Moved from docs/questions/README.md on 2026-10-12, so that file can stay a short list of what is
     next. Read by whoever builds or audits a milestone's list. -->

# Writing a question file

## What goes in a question file

Seven sections, in a fixed order. **Every section stays**, with `...` where nothing has been
recorded yet — the empty ones are the reminder of what hasn't been thought about.

`...` and `N/A` mean different things. `...` means nobody has looked. `N/A` means someone
looked and there is nothing — no blockers, or no options because the question resolves into a
fact rather than a choice.

Frontmatter carries `opened`, `status`, and `resolves_into` — `decision`, `constraint`, `problem`, or
`unsettled`. `status` is `open`. A question whose record lands is mined and deleted in that change, so a file
carrying `answered` is one nobody finished. That last field partitions the folder: `rg -l 'resolves_into: constraint'` is the
research backlog, and everything resolving into a decision is a choice waiting to be made.

**`unsettled` means where the answer lands has not been argued**, not that the question is unanswered
— `status` already says that. It exists because a value picked to satisfy the checker would be a wrong
answer to a question nobody asked, and because a file given the wrong value silently drops out of both
queries above, which is how a file goes missing from a list nobody knows to check. It is a real value
rather than a placeholder, so a file carrying it says under **Resolves into** what the ways out are.
It is also the one value that should be rare: exactly one file carries it today.

`scripts/check-docs.py` rejects any other value, so a typo and an invented category both fail rather
than passing quietly.

**Why it matters**, **What would settle it**, **Resolves into** and **Source** are stable and
short. **Why it matters** is what's blocked or what gets
expensive if we're wrong. It also names which environments the choice shows up in: production,
local runs, or both. A question framed only for production leaves its local half to be wired for
convenience, and per
[ADR-0039](../../../docs/decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
the production-like local run has to match whatever production gets. **There are no Blocked by,
Blocks, or What this decides beyond itself sections.** A per-file dependency list is one graph held
in sixty-odd places, each of which sees a sliver of it. It goes stale invisibly — noticing requires
re-reading everything around it — and it is trusted precisely because it reads as a fact rather than as the judgement it is. The milestone
grouping above holds the same information where every sequencing claim sits beside the others and
one file can be checked against itself. `scripts/check-docs.py` fails on the two lead sentences
that carried this before, "What this decides beyond itself" and "Not blockers, and worth saying so",
because they spread by being copied. A paraphrase gets past it.

A question that genuinely cannot be worked until another is answered says so under **What would
settle it**, in prose, as part of describing what an answer requires.
**What would settle it** is the evidence, measurement, or event that would end the question — not
another question. **Resolves into** names where the answer lands. **Source** records where the
question came from, so provenance survives the deletion of whatever raised it. It is the one
section here that is history by design, and the forward-only rule in the portable documentation
standard does not reach it. That covers where the question came from and nothing else: a **Source**
that grows into an account of how the work went has left its purpose rather than extended it.

**Properties the answer is scored against** is a numbered list of what an answer must deliver,
derived from the moments the system touches the thing being chosen. Each property cites the record,
guarantee, constraint, failure mode or passage of [docs/problem.md](../../../docs/problem.md) it rests on, and the list ends
with the properties checked and found binding on nothing. It is written before any option is named,
which is why it sits above **Options**: a list written after them is the options' own list. Step 4
of the `make-next-decision` skill is how it is derived. `scripts/check-docs.py` requires the section
in every file, above **Options**, and fails a question opened on or after 2026-09-27 whose Options
are recorded while its properties are still `...`. Questions opened earlier keep the Options they
recorded first until they are worked.

The last two grow. **Options** holds each candidate answer with its strongest case and its cost.

### While a question is being worked, its file is where the work goes

Findings are written in as they are established, not gathered at the end. Research left in a
conversation gets redone next session from a summary, and a summary is the part that has already
lost its sources.

Results that changed nothing count. A candidate checked and dropped, a claim checked and confirmed,
and a claim checked and found unsupported are all findings, and an option written down nowhere is
indistinguishable from one nobody thought of.

**Findings accumulate in passes, and each carries its own date.** A file worked more than once holds
more than one pass, so an older entry sitting below a newer one is what was known then rather than a
contradiction of what is known now. Read the dates. Where a later pass overturns an earlier one the
earlier entry is replaced rather than left underneath it, which is what makes everything still
present still believed.

Options and Findings take subheadings once they outgrow a flat list.

### A claim about a tool decays in days, not months

A toolchain claim can be overtaken by a release that ships the same week, and the rate of change is
high enough that most of a batch can fall in one re-check. So a finding about a tool carries the
date it was checked, a candidate list is re-checked rather than trusted, and **an undated claim
about a tool is treated as unverified whatever it says**.

Where a claim decays on a known date rather than gradually — a support window ending, a version
reaching end of life — the finding says so and names the date, because that is cheaper to act on
than a general warning.

Nothing enforces any of this. `scripts/check-docs.py` checks that a tier, where one is given, is a
recognised word. It does not check that a finding has one, and it cannot check whether the claim
behind it is still true.

### Findings are evidence, not fact

**Findings** holds what we've learned so far. Nothing in it is established, and nothing in it may be
cited as though it were. A finding becomes binding by graduating to [docs/constraints.md](../../../docs/constraints.md)
or by being reasoned through in a decision record — never by sitting in a question file long enough
to look settled. Every Findings section opens with that sentence, so a reader who arrives at one file
without reading this one still knows what they are holding.

**A finding that asserts a fact about the world carries the tier it was established at**, using the
same three words [docs/constraints.md](../../../docs/constraints.md) uses — _Measured_, _Sourced_, _Reasoned_ —
plus a fourth this folder needs and that file does not:

- **_Unverified — no source recorded._** Somebody wrote it down and nobody can say why it is true.
  This is the most useful tag in the set, because an unsourced number reads exactly like a sourced
  one and this is what tells them apart. Several arrived here from legacy documents and none of them
  should decide anything.

A finding that is a judgement, a product opinion, or an implication for the options here carries no
tier, because there is nothing to have established.

A finding may record what a standard _implies for these options_; it may not restate the standard
itself. The first shifts a decision and belongs here. The second is a weaker local copy of a rule
already in force, competing with the real one for whoever finds it first.

**Findings should say when a decision would close a door**, and that is the one forward-looking claim
they are for. It is not sequencing — it does not say what to answer first — it says what stops being
reachable. There is no register of open doors: a future worth keeping reachable is kept reachable by
a record in [docs/decisions/](../../../docs/decisions/) that says what is now binding, and a list of them
elsewhere would be a second copy nobody updates.

**One question per file**, and the filename asks the question as plainly as it can, so a directory
listing reads as the list of what is open.

**A question is split when only part of it blocks an early milestone.** The blocking part becomes
its own file and the rest stays where it belongs. Both halves keep the format below, and the
question that was split says what it no longer covers so a reader does not go looking for it here.

<!-- Template:

---
opened: YYYY-MM-DD
status: open
resolves_into: decision | constraint | problem | unsettled
---

# <The question, asked in plain words?>

## Why it matters

...

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

...

## Source

...

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [docs/constraints.md](../../../docs/constraints.md) or into a decision record.*

**<A claim about the world.>** <What it means for the options here.>

*Sourced | Measured | Reasoned | Unverified — <how we know, or that we do not>.*

**<A judgement or an implication for the options.>** <No tier: there is nothing to have established.>

-->
