---
updated: 2026-08-30
update_when: a standard is agreed, or an existing one is repeatedly broken for good reason
decays: slow
status: active
---

# Standards

What correct work looks like in this repo, stated so it can be checked.

Each entry is a claim about an artifact rather than an instruction to a reader. That's
deliberate: the same sentence then serves whoever is writing something ("produce this"),
reviewing it ("check whether this holds"), or auditing the codebase ("find where this isn't
true"), without being rephrased for each.

## Standards that reach beyond this repo

Most of what governs code here isn't in this folder. A portable set of engineering standards —
correctness, code structure, readability, testing, security, error handling, type design, and
per-language conventions — lives at
<https://github.com/ooloth/dotfiles/tree/main/tools/agents/config/standards> and uses the same
tiers and phrasing rules described below.

**This folder holds only what that set can't.** A rule true of any codebase belongs upstream; a
rule that names this project's domain, files, or conventions belongs here. When something written
here turns out to be portable, it moves. That keeps the two from drifting into weaker and stronger
copies of the same idea, where whichever one a reader finds first wins.

An agent working in this repo is expected to load the relevant portable files before designing,
writing, or reviewing code — behaviour defined by
<https://github.com/ooloth/dotfiles/blob/main/tools/agents/config/skills/uphold-standards/SKILL.md>.
Anyone working without that skill should read the portable standards directly, because this
folder on its own understates the rules actually in force.

## Tiers

Only **Must** holds unconditionally. **Should** allows a stated exception and **Consider** is
a judgment call, so nothing here is an invariant — things that are true without exception, or
the system is broken, belong in [../guarantees/](../guarantees/).

**Must** — no exceptions. A violation is always wrong. Work never produces one, and a review
flags one immediately whatever the context.

**Should** — true by default. A violation is wrong unless there is a deliberate, stated
reason for it. A review flags one and asks whether the exception applies.

**Consider** — worth raising for judgment. Neither right nor wrong by default. A review
surfaces one when the trade-off looks unresolved.

## Writing a standard

Each bold lead sentence is a claim you could hold against an artifact and mark true or false.
The subject is the artifact, not the reader — present tense, third person, no imperative verb.

Wrong: "Validate that names reflect intent."
Right: "Names use domain vocabulary and reflect intent."

An explanation follows, saying what goes wrong without it. A rule you can't argue with gets
cargo-culted or ignored.

`## In scope` and `## Out of scope` sections bound what an audit should examine.

## Files

- [documentation.md](documentation.md) — files under `docs/`, `README.md` at any level, `CLAUDE.md`

Add a file once a theme has real content. Keep this list in step with the directory.
