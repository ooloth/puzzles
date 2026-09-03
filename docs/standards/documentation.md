---
updated: 2026-08-31
update_when: a documentation convention is agreed, or an existing one is repeatedly broken
decays: slow
status: active
---

# Documentation

Documentation here is correct when someone arriving cold can tell what each file holds, trust
what it says without checking its sources, and work out where a new fact belongs.

## Must

**Content that appears in two places changes in one edit.**
Duplication is occasionally worth it — a map repeated where a reader already is saves them a
read — but it creates two things that can disagree, and a copy pointing at something that no
longer exists is worse than no copy at all. Where the same content sits in two files, both move
together or the second one goes.

**Where a folder is read through an index, the index lists exactly the files present.**
A file missing from it is invisible to anyone who reads the index instead of the directory, and
an entry pointing at a deleted file costs a read to discover. Bulk additions are where this
drifts, so it is checked after one. A folder whose directory listing already carries membership —
self-ordering records, filenames that read as questions — needs no index *for membership*, and one
added for that alone is a second thing to keep in step. An index earns its place by carrying what a
listing cannot: ordering, what each file rests on, why one comes before another. Where it does, it
still lists exactly the files present, because a reader who trusts it instead of the directory sees
only what it shows.

**Every file under `docs/` carries `updated`, `update_when` and `decays` in its frontmatter, except
`decisions/` and `questions/`, which carry their own.** A record carries `number`, `status` and
`date`; a question carries `opened`, `status` and `resolves_into`. Both are defined in their folder's
README and neither has room for the three fields above — a record's decay is `never` by construction
and a question's obligation to change is that somebody answers it. `scripts/check-docs.py` enforces
whichever schema applies.
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
`docs/brainstorming/` holds unfiltered material that reads as
settled. Anything that looks authoritative and isn't costs more than it saves unless the label
sits somewhere the reader passes.

## In scope

- Files under `docs/`
- `README.md` at any level
- `CLAUDE.md`

## Out of scope

- `docs/brainstorming/`, which is archival and left as it was written
