# Start here

<one line: what this repo is>. Full context: [problem.md](problem.md).

## The three kinds of truth

|                                  | Means                             | Test                              |
| -------------------------------- | --------------------------------- | --------------------------------- |
| [constraints.md](constraints.md) | True whether we like it or not    | Would the _environment_ break us? |
| [decisions/](decisions/)         | We chose it, reversible at a cost | Could we decide differently?      |
| [guarantees.md](guarantees.md)   | We uphold it                      | Would violating it be _our_ bug?  |

Chain: **constraint → forces → decision → promises → guarantee → enforced by → test.**
An ADR citing neither a constraint nor a user need was made on vibes.

## Doing this? Read this, update that

| Task                              | Read first                       | Update after                                    |
| --------------------------------- | -------------------------------- | ----------------------------------------------- |
| anything                          | problem                          | —                                               |
| adding a feature                  | problem, glossary, guarantees    | glossary, unfinished                            |
| choosing a dependency or platform | constraints, problem, decisions/ | new ADR **+ its bill of givens in constraints** |
| debugging a prod-only bug         | constraints, gotchas             | gotchas                                         |
| changing a core algorithm         | guarantees, verification         | guarantees                                      |
| leaving something half-done       | —                                | unfinished                                      |
| being surprised                   | —                                | gotchas                                         |
| failing to decide                 | undecided                        | undecided                                       |

## Conventions

- Every file's frontmatter carries `update_when`. **This table wins** if they disagree.
- `decays: fast` means the content describes now and expires. Verify before trusting.
- Docs are for what can't be executed. If it can be a type, a lint rule, or a test — make it that, and link to it from here.
- Before treating any entry as finished, ask what a sharp reader with none of this context would immediately push back on — and check the entry already answers it

## Not part of this structure

- [`@legacy/`](@legacy/) — the previous docs layout, kept for reference. Not authoritative.
- [`brainstorming/`](brainstorming/) — unfiltered thinking. Nothing here is decided.
