---
opened: 2026-09-17
status: open
resolves_into: decision
---

# What must a dependency's stewardship satisfy?

## Why it matters

[What must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md)
names this gap and stops at naming it: "Nothing in the repository supports a property about how well
maintained a candidate is, and one is missing." Its rule is that a property without a citation is an
assumption somebody has been carrying, and it left the property out rather than softening it.

**The property is already deciding the M1 field anyway.** Three question files eliminate or downweight
candidates on stewardship, and the runtime field has two survivors that only survive because no
binding property removes them. Both are listed under **Findings**.

**The concrete cost of leaving it open.** By the repo's own rules today, Andromeda at 0.1.14 is as
eligible a runtime as Node. Nobody is going to spike Andromeda. So the elimination will happen during
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)'s spike, on
taste, unrecorded, and the record that follows will inherit it. That is the failure the property list
was written to prevent, reached by the one route it left open.

## What would settle it

Two things, in order. First, whether stewardship binds at all, which is a choice rather than a
derivation: nothing in [../problem.md](../problem.md), [../constraints.md](../constraints.md),
[../guarantees/](../guarantees/) or [../decisions/](../decisions/) supports it, so it cannot be derived
the way every other property in that list was. Second, if it binds, by what test.

A test has to be checkable from outside the project and stated so that two people applying it to the
same candidate agree. Candidate signals, none of them chosen: authorship concentration over a window,
number of releases in a window, whether a stable major exists, whether the licence can be revoked,
whether a migration with no codemod is on the roadmap. Whichever are used, the threshold is the part
that does the work and the part that is easiest to leave unstated.

**It rests on [what horizon is this built for?](what-horizon-is-this-built-for.md)** and cannot be
argued before it. "Well maintained enough" has no meaning without a duration to be enough for, and that
duration is currently assumed rather than stated in all four places this property is being used.

**A licence test already exists and is not this.** [what must the client and the server each be able to
do?](what-must-the-client-and-server-be-able-to-do.md) carries a sourced property that anything adopted
must "carry a licence that permits use inside a hosted service without obliging us to release our own
source, and that cannot be revoked". That one is derived from
[../constraints.md](../constraints.md) and it is what eliminates Elide. Stewardship is the separate
question of whether the people behind a thing will keep it working, and no document supports it.

## Resolves into

A decision record in [../decisions/](../decisions/), which the runtime, renderer, bundler and package
manager records each cite. It is a decision rather than a property added to the list above because it
cannot be derived from anything already written down: a reasonable person could decide either way on
the same evidence, which is this folder's test for a choice.

Where it resolves against binding, the record says so plainly and the eliminations that rest on it are
reversed in the files that hold them.

## Source

Raised 2026-09-17, from the gap named under "What anything adopted must be able to do" in
[what must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md),
on finding that the property it declined to write was already in use in three other question files.

## Options

*It binds, as a checkable test.* Name the signals and the thresholds, apply them uniformly, record each
elimination with the number that produced it. Strongest against the failure this question exists to
stop, because a threshold written down is a threshold a later reader can disagree with. Its cost is
that any threshold is arbitrary at the margin, and a candidate failing it by one commit is eliminated
by arithmetic rather than by judgement.

*It binds, as a judgement recorded per decision.* Each record says what about a candidate's stewardship
worried it and why, with the evidence, and no threshold is fixed in advance. Cheaper and more honest
about what is actually being assessed. Its cost is that it is not checkable: two records can reach
opposite conclusions on the same facts and nothing in the folder will show it.

*It does not bind; replaceability is scored instead.* The null option, and the one the standards say to
consider. The argument: the cost of a badly stewarded dependency is bounded by what replacing it costs,
so score that directly and stop trying to predict the future. Under this, Andromeda is eliminated (or
not) on what depending on it would cost to undo, and the same test applies to Node. It would reverse
the Solid, Lit and Preact findings in [what renders the client?](what-renders-the-client.md), all three
of which are stewardship arguments and two of which have now been found wrong on their facts.

*Not yet.* Defer, let each record argue its own grounds, and accept that the folder will not be
consistent. Listed rather than dismissed: this folder's rule is that deferring is the default and that
every sequencing error here has moved a question earlier than it belonged. The case against deferring
is specific rather than general, and it is the Andromeda case in **Why it matters**.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Nothing in the repository supports a stewardship property.** A search of
[../problem.md](../problem.md), [../constraints.md](../constraints.md),
[../guarantees/](../guarantees/) and [../decisions/](../decisions/) for "maintained", "maintenance",
"steward", "bus factor", "abandon" and "governance" returns hits only on "maintainer", which
[../problem.md](../problem.md) uses about the person writing this code and never about a dependency.

*Measured — `rg` over those paths, run in this repository on 2026-09-17 by me.*

**Where the property is already in use, and what each claim is worth after checking.** All four were
verified against their sources on 2026-09-17. Two survive, one is wrong, and one has no threshold
behind it:

- **Solid, eliminated in [what renders the client?](what-renders-the-client.md) on 2.0's timing and
  authorship.** The facts hold, with one number corrected: authorship on the 2.0 branch is 89.8%, not
  "over ninety percent". What has no source is the threshold at which a release-candidate major and a
  concentrated author base disqualify anything.
- **Lit, eliminated in [what renders the client?](what-renders-the-client.md) on tooling decay.** The
  stated disqualifier is wrong. Its template *type-checking* rules are errors by default; only the
  unknown-tag and unknown-attribute *linting* rules need strict mode. The elimination does not stand as
  written. See that file for the correction and its source.
- **Preact, downweighted in [what renders the client?](what-renders-the-client.md) against React on
  maintenance concentration.** The facts hold and are now measured. What has no source is that
  concentration outranks a measured bundle difference, which is the comparison the file actually makes.
- **Andromeda and txiki.js, surviving in
  [what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md).** That file
  states plainly that "the attribute that would separate them from the incumbents is maturity, which
  has no source here". txiki.js has since been eliminated on a binding property instead, so Andromeda
  is the live case.

**A stewardship test would reach further than the toolchain, and the record should say how far.**
Everything installed is a dependency, so a test written for a runtime also applies to a router, a
storage wrapper, a test library and whatever generates a precache manifest. A test scoped to "the big
choices" has to say what makes a choice big, or it is a judgement wearing a test's clothes.

### What the signals actually say, measured 2026-09-17

**Raw top-author share is confounded by bots, and badly enough to invert a ranking.** The single most
prolific committer over the last twelve months is an automation account in three of the four runtimes
and in one of the six renderers: Bun's is `robobun` at 60.9%, Node's is `nodejs-github-bot` at 8.2%,
and Vue's is `renovate[bot]` at 30.3%. The most prolific human is a different account with a
materially different share: Bun's is Jarred-Sumner at 14.7%, Node's is aduh95 at 8.1%, Vue's is
edison1105 at 28.8%. Read raw, Bun looks like the most concentrated project in the field; read for
humans, it is among the least.

**This is the most useful thing found today, because it is a property of the test rather than of any
candidate.** Any threshold written against "top author share" measures release tooling unless it
excludes bots, and no tool surveyed does that automatically. An option that fails this way fails
silently, because the number looks like a measurement either way.

*Measured — `gh api --paginate repos/<owner>/<repo>/commits?since=2025-09-17`, counted and grouped by
author, run 2026-09-17 by research agents which stated the command and identified the bot accounts by
inspection. I did not run them. The distinction between bot and human was made by reading account
names and sampling commits, which is judgement rather than measurement.*

**The runtime field.** Commits and distinct authors over twelve months to 2026-09-17, releases in the
same window, and governance:

| | Commits | Distinct authors | Releases | Stable ≥1.0 | Licence | Governed by |
|---|---|---|---|---|---|---|
| Node | 3,496 | 428 | 59 | yes | MIT | OpenJS Foundation |
| Deno | 3,055 | 200 | 47 | yes | MIT | Deno Land Inc. |
| Bun | 4,610 | 103 | 19 | yes | MIT | Anthropic |
| Andromeda | 89 | 7 | 26 | **no** | MPL-2.0 | no company or foundation found |

Andromeda separates from the incumbents on every column, and on one of them categorically: no release
has ever crossed 1.0, and its full tag history is 0.1.0 through 0.1.14. Deno's top human author holds
36.8%, which is the highest human concentration among the three incumbents.

**The renderer field**, same window and method. Lit is in the table because the verification pass
returned it:

| | Commits | Distinct authors | Release days | Latest stable | Governed by |
|---|---|---|---|---|---|
| React | 817 | 101 | 28 | 19.3.0 | React Foundation (Linux Foundation) |
| Svelte | 846 | 135 | 120 | 5.57.0 | independent; creator employed by Vercel |
| Vue | 423 | 106 | 51 | 3.5.43 | independent |
| Preact | 300 | 20 | 21 | 10.29.8 | community, no foundation |
| Solid | 85 | 20 | **8** | 1.9.15 | individual-led, Open Collective |
| Lit | 46 | 19 | **1** | 3.3.3 | **OpenJS Foundation** |

Solid and Lit are monorepos that tag every package per release, so the raw release-tag counts of 62
and 8 overstate frequency; the column above is distinct publish days. Lit published on one day in
twelve months, 2026-05-14, and nothing since.

*Measured — as above, run 2026-09-17 by a research agent which reported the tag-versus-date
distinction unprompted. I did not run it. Distinct-author counts are by GitHub login with a fallback
to commit email, so one person committing under two unlinked addresses is counted twice.*

**Governance quality and activity are separate signals, and in this field they disagree sharply.**
Lit has the strongest governance structure of any renderer here and the least activity of any of them.
It joined the OpenJS Foundation as an Impact Project on 2025-10-14, with "All of Lit's assets,
including code, documentation, websites, and the Lit brand" transferred out of Google, and a Technical
Steering Committee of six drawn from Google, Adobe, Reddit and independents. On governance it
outranks Preact, Solid, Svelte and Vue; on activity it is last.

So a test has to say which of the two it is testing. A test written for "will this be abandoned" and a
test written for "is anyone working on it" point at different candidates here, and the repo's existing
arguments have used the words interchangeably.

*Sourced — [lit.dev/blog/2025-10-14-openjs](https://lit.dev/blog/2025-10-14-openjs/), opened and
quoted by me on 2026-09-17.*

**Two outliers worth recording before they surprise someone.** Parcel took **14 commits from 4
authors** in twelve months, with its last release on 2026-02-02, which is the quietest project
surveyed in any category and quieter than Lit. Rsbuild is 75.5% one author across 2,102 commits, which
is the highest human concentration found anywhere in the field, inside a project backed by ByteDance's
web infrastructure team. Corporate backing did not predict low concentration and foundation governance
did not predict high activity.

*Measured — Parcel's figure re-run by me on 2026-09-17 with
`gh api --paginate repos/parcel-bundler/parcel/commits?since=2025-09-17` and confirmed at 14. The
Rsbuild figure is a research agent's, which sampled the top author's commits to confirm they were not
a bot. I did not run that one.*

**React's repository moved.** `facebook/react` now redirects to `react/react`, confirmed by me against
the GitHub API. Any link written against the old path still resolves but no longer names the owner.

### Nothing off the shelf computes the signal this question most wants

**Four runnable scoring systems exist and none of them measures authorship concentration.** OpenSSF
Scorecard is the closest to off-the-shelf: twenty named checks, a weighted composite from 0 to 10,
runnable as a CLI, a GitHub Action or a hosted API, actively maintained with v5.5.0 released
2026-04-23. Its `Maintained` check measures commit frequency and its `Contributors` check measures the
organisational diversity of recent contributors. Neither is a concentration ratio. Libraries.io
SourceRank is zero-setup and its `Contributors` factor is a raw headcount. deps.dev aggregates
Scorecard and vulnerability data into one lookup and adds no health metric of its own. OpenSSF
Criticality Score measures blast radius rather than health, so a heavily depended-on but neglected
project scores high, and its hosted dataset was discontinued after 2026-08-29.

**The one framework that defines the signal precisely is a specification rather than a tool.** CHAOSS
defines Contributor Absence Factor, formerly Bus Factor, as the smallest number of contributors
responsible for 50% of contributions over a period, and it is one of four metrics in its Starter
Project Health model. Its turnkey implementation, Augur, is archived: the repository reads "The Augur
project is no longer part of CHAOSS. Use CollectOSS instead!" CollectOSS is early, and GrimoireLab,
the other implementation, is a self-hosted analytics platform rather than a command.

**So the choice is narrower than it looked.** Adopting an existing framework means adopting Scorecard
and accepting that it does not measure the thing three question files are actually eliminating
candidates on. Measuring concentration means computing it here, which is one `gh api` call and a sort,
already done above for the whole field. The null option is unaffected by any of this.

**The EU Cyber Resilience Act does not supply a criterion.** It mandates SBOMs in SPDX or CycloneDX
with full compliance by 2027-12-11 and leaves the assessment of a dependency's health to the
manufacturer. It is a disclosure mandate rather than a scoring system.

*Sourced — [ossf/scorecard](https://github.com/ossf/scorecard) and its
[checks documentation](https://github.com/ossf/scorecard/blob/main/docs/checks.md),
[chaoss.community/starter-project-health-metrics-model](https://chaoss.community/starter-project-health-metrics-model/),
[chaoss/augur](https://github.com/chaoss/augur), [ossf/criticality_score](https://github.com/ossf/criticality_score)
and a live Libraries.io SourceRank breakdown, read 2026-09-17 by a research agent which listed each
tool's signals from its own documentation rather than from summaries. I did not open them. The CRA
wording is the agent's from secondary sources and it did not open the EUR-Lex text, so treat the legal
phrasing as unverified.*

**Replaceability and stewardship are not independent, which weakens the null option slightly.** What
makes a dependency cheap to replace is usually that it is small and that its interface is standard, and
both of those also correlate with there being less to maintain. So scoring replaceability alone may
reach the same answers by a shorter route. Recorded as an argument to test rather than one to rely on:
nothing here has checked whether the correlation holds across the actual M1 field.
