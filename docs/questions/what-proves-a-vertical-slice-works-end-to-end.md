---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What proves a vertical slice works end to end?

## Why it matters

Every milestone in [README.md](README.md) is described as a thin vertical slice: something that
"can be run and looked at end to end." That claim is only as real as what "looked at" actually
consists of — which command, which URL, which output counts as proof the slice works, as opposed to
proof its pieces individually compile or its tests pass in isolation.

[../verification.md](../verification.md) holds hand-written run, look-at and correct-looks-like
entries for the server from M1's first slice. Someone has to re-type each one to use it, and this
question decides whether they become something that runs. Without a concrete answer, each milestone's
observability claim is asserted rather than checkable. [../problem.md](../problem.md) names the solo
maintainer as a stakeholder, and this is the loop that runs after every milestone and every smaller
change inside one — an agent that finishes a slice has no way to confirm it actually works without
the maintainer watching it happen, unless this question has already been settled.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, when a milestone for maintainer tooling was added and the feedback loops nobody
had asked about were enumerated.

## Options

Candidates raised so far. None has been evaluated here, and what each is said to do below comes from
general knowledge of the tool rather than from anything run in this repository, except where marked.

*HTTPie (`http`).* A curl alternative with shorter syntax and coloured, formatted output. It is for
looking by hand rather than for checking, because it asserts nothing about a response. It is already
installed on the maintainer's machine at `/opt/homebrew/bin/http` (checked with `command -v` on
2026-09-22).

*Hurl.* Plain-text files, each holding a sequence of requests with assertions about the responses:
status, headers, and body content, including that a body does *not* contain something. One command
runs them all and exits non-zero on a failure. That makes it the only candidate here that turns a QA
plan into something committed and repeatable, which is the gap this question names. What it cannot
do is start or signal the server, so a check like "`SIGTERM` mid-request lets the request finish"
needs something around it.

*Posting.* A terminal UI for building and sending requests, saving them as YAML files. It is for
exploring by hand rather than for checking, the same as HTTPie, with saved requests in place of shell
history.

*A `justfile`.* `just` is a command runner: named recipes in a `justfile`, so "start the server,
run the checks against it, stop it" is one command. It does not check anything itself; it is where a
sequence like that would live. It overlaps with the `scripts` in `package.json`, which already hold
`start`, `test` and `typecheck`, so what it would have to earn is anything those scripts do badly,
such as recipes with arguments or steps that are not Node.

These are not four answers to one question. HTTPie and Posting are for a person looking; Hurl is for a
check that runs; `just` is for chaining steps. An answer here could take one from each role, or none.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*
