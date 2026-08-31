---
updated: 2026-08-30
update_when: a documentation convention is agreed, or an existing one is repeatedly broken
decays: slow
status: active
---

# Documentation

Documentation here is correct when someone arriving cold can tell what each file holds, trust
what it says without checking its sources, and work out where a new fact belongs.

## Must

**The docs lookup in `CLAUDE.md` is identical to the one in `docs/README.md`.**
Same paths, same descriptions. The duplication is deliberate — `CLAUDE.md` is in context every
session, so an agent has the map without spending a read on it — which makes adding or removing
a document two edits. Otherwise one copy starts pointing at something that isn't there.

**Where a folder's README indexes its contents, the index lists exactly the files present.**
`questions/`, `guarantees/` and `standards/` are read through their indexes, and the index
carries a line of significance the filename can't. A file missing from it is invisible to
anyone who reads the index instead of the directory; an entry pointing at a deleted file costs
a read to discover. Bulk additions are where this drifts, so it's checked after one. Folders
whose contents are self-ordering — numbered decision records — don't need an index at all.

**Every file under `docs/` carries `updated`, `update_when` and `decays` in its frontmatter.**
`update_when` names the event that obligates a change, which is what makes a stale document
someone's responsibility rather than nobody's. `decays` tells a reader how hard to verify before
trusting: `never` for a historical record, `slow` for something deliberate, `fast` for anything
describing the present.

**Each file in `docs/questions/` holds one question, and its filename asks that question in
plain words.**
The directory listing is the index, so a filename that doesn't read as a question costs the
listing its job. One question per file also lets a decision record cite by path the question it
answers.

**Decision records are numbered and questions are not.**
Decision records are chronological and append-only, so a number is their identity and never
changes. Questions are a live set that gets edited and deleted, where numbering would only cost
renumbering.

## Should

**A document with no content yet says so explicitly.**
An empty section reads as an oversight, and anyone filling that silence invents something
plausible. A line stating that nothing has been recorded yet makes emptiness a fact rather than
a gap.

**A document whose contents could be confused with a sibling names that boundary at its top.**
The pairs that blur here are constraints against guarantees, gotchas against unfinished, and
standards against verification. A boundary line is cheapest at the point where a reader is
already deciding whether they opened the right file.

**Archival directories are labelled non-authoritative where a reader will meet them.**
`docs/@legacy/` and `docs/brainstorming/` hold superseded and unfiltered material that reads as
settled. Anything that looks authoritative and isn't costs more than it saves unless the label
sits somewhere the reader passes.

## In scope

- Files under `docs/`
- `README.md` at any level
- `CLAUDE.md`

## Out of scope

- `docs/@legacy/` and `docs/brainstorming/`, which are archival and left as they were written
