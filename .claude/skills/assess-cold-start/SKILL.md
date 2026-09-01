---
name: assess-cold-start
description: Check whether a new agent with no context could pick this repo up and know what to do next. Run near the end of a session, before handing over. TRIGGER when the user asks whether the repo is ready for a new session, whether the docs are in good shape, or before wrapping up.
---

## Why this exists

A session ends with everything in your head and very little of it written down. The usual fix is a
handoff message, which the next agent may not get and which is stale the moment anything changes.
The permanent docs are the handoff. This checks whether they actually work.

**You cannot run this check yourself.** You know what the repo means, so you will read what you
already believe into any file. The check only works from a reader with no context, which means a
subagent.

## Your task

### 1. Send a fresh agent in

Spawn one subagent — a mid-tier model is fine — with no briefing beyond the prompt below. Do not
tell it what the project is, what was worked on, or where to start. That is what is being tested.

Give it this, with the repo path filled in:

> You are a new agent starting work on the repo at `<path>`. You have no prior context. Nobody has
> briefed you.
>
> Read the repo the way you actually would on a first session, starting from whatever entry point
> you would naturally start from. Do not read every file — read what a sensible agent would read to
> orient itself, and stop when you believe you know what to do next.
>
> Then report:
>
> 1. **What is this project?** In two sentences.
> 2. **What would you do next, and why?** Name the exact question or task you would pick up, and say
>    what told you to pick it.
> 3. **How long did it take to get a confident answer to 2?** Which files did you read, in what
>    order? Was anything hard to find?
> 4. **What confused you, contradicted itself, or looked stale?** Name files and lines. This is the
>    most useful part of your report — do not soften it.
> 5. **What did you expect to find and could not?**
> 6. **What would have led you astray if you had trusted it** — a claim, an ordering, or guidance
>    that looks authoritative but appears wrong or out of date?
>
> Be specific and critical. Do not be generous. Do not edit any files.

### 2. Verify what it reports

Check its claims yourself rather than relaying them. It has less context than you, which is the
point, and also means it will sometimes be wrong about what is a problem.

Pay attention to anything it found that you did not know about. That is the highest-value part of
the report: it is the part of the repo you have stopped seeing.

### 3. Judge it against these

The check passes when all of these hold:

- **It picked the right next thing**, and for the right reason. A correct guess from a wrong signal
  is a fail — the signal is what the next agent will follow.
- **It got there quickly**, from a natural entry point, without needing to be told where to look.
- **Nothing misled it.** Stale figures, contradicted claims, and orderings that no longer hold are
  worse than gaps, because gaps announce themselves.
- **The file system agrees with the docs.** Directory names, stub files and scaffolding assert
  decisions. If a directory implies an answer to an open question, it is a decision nobody argued
  and it will be read as settled.
- **What is mid-change is flagged where a reader will meet it**, rather than only being true.
- **No question is answered and still open.** Audit `docs/questions/` for these directly, since a
  fresh agent cannot spot them — the file reads as open work and it takes knowing the answer landed
  elsewhere to see otherwise. For each, check whether what it `resolves_into` now exists: a decision
  record, a constraint, or a change to a config file or skill. Where it does, mine anything the
  answer did not carry across and delete the question. A queue containing solved problems wastes the
  next agent's first hour and makes the real work harder to find.

### 4. Report and fix

Tell the user what passed and what did not, leading with anything that would actively mislead.
Propose fixes; do not make them without approval. A gap in the docs is ordinary. A confident wrong
signal is the thing worth stopping for.
