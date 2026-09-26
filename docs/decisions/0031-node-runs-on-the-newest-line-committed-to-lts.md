---
number: 0031
status: accepted
amended: 2026-09-20
date: 2026-09-19
---

# 31 — Node runs on the newest line committed to LTS

## Forced by

[ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md) chose Node, named a floor — type
stripping runs unflagged from v22.18.0 and v23.6.0 — and explicitly declined to say which version
this runs. A floor is not a version, and three machines resolve one from somewhere: a contributor's
laptop, a container and a CI runner. That record names the artifact under **Enforced by** and
records that it does not exist.

[../problem.md](../problem.md) states an intent to keep working on this for years rather than to
ship it and leave it running. That is what makes a support window worth arguing about: under a short
horizon an expiring line is somebody else's problem. It also ranks clarity over cleverness, because
one person maintains this.

## Decision

**Node runs on the newest released line that is in Active LTS, or that Node has committed to
promoting to LTS.** Every machine that runs this project's non-browser code — development,
continuous integration and production — runs that line.

**Today the rule yields 26.** v26 is released, is Current, and carries an LTS date of 2026-10-28.
Nothing newer exists. **The number is not in this record's title, and does not belong here.** It is
a value the rule produces, and it lives in whatever artifact
[what pins the toolchain versions across machines?](../questions/what-pins-the-toolchain-versions-across-machines.md)
chooses. A record whose title is a version number is a record that expires on a schedule, and
re-deciding it each time means re-deriving the reasoning each time.

**The rule is stated as a property rather than as "Current" or "Active LTS" because those two words
are expiring.** Node has announced that from v27 it ships one major a year and every release becomes
LTS, so Current and Active LTS will name the same version six months apart rather than two different
release trains. A rule phrased in those terms would keep reading as meaningful after the thing it
distinguishes had gone. This rule survives the change: under the old model it excluded odd lines
automatically, because they carry no LTS commitment, and under the new one it collapses to "the
newest line" with the Current-to-LTS wait built in.

**It commits to moving, and that is deliberate.** When a newer line ships with an LTS commitment,
this rule says to adopt it — roughly each April under the announced model, six months before that
line becomes Active LTS. What the rule does not fix is the day within that window, which is an
ordinary scheduling matter rather than a decision.

**The rule reads the commitment, not the label, and today those disagree for v27.**
`schedule.json` encodes v27 with a `maintenance` key and no `lts` key — the shape it uses for a line
that never becomes LTS — while the announcement says v27 becomes LTS in October 2027. So the
commitment has to be re-established before moving to 27 rather than read off the file. That check
falls due when v27 ships, which is the natural moment for it. **If a line ever has no LTS commitment
at all, this rule does not select it**, which is the safeguard that makes the announcement's
accuracy something this record survives rather than depends on.

**It agrees with the maintainer's stated preference, and was not derived from it.** That preference
— the newest line rather than LTS, on the grounds that there is no reason to forgo the updates
without one — was set aside for the research at his direction, and the argument above runs on
support runway and the expiring vocabulary instead. The agreement is worth recording precisely
because it makes the derivation easy to fake: a reader who suspects the reasoning was assembled
around a preferred answer should check the rejection of "adopt only once Active LTS", which is
where this record would have gone wrong if it had been.

**What was checked, by running it.** v24.21.0 and v26.9.0 were installed into a throwaway `FNM_DIR`
on an Apple M2 running macOS 26.6.2 on 2026-09-19, each binary invoked by absolute path, and the
directory deleted afterwards. A single `.ts` file importing `node:sqlite` and `node:http`, run
directly with no flags and no transpiler, created a table, ran prepared statements, served the rows
and fetched them back — identically on both. `npm install --dry-run --engine-strict vite vitest
typescript` resolved the same forty packages on both with no `EBADENGINE`.
`node --max-old-space-size=64` against an allocation loop produced `FATAL ERROR` and "JavaScript
heap out of memory" on both, so the heap bound that decided
[ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md) does not depend on the line. **These
observations eliminated nobody**, and that is the finding: capability does not separate the
candidates, so the rule is argued on support runway instead.

**No host constrains the line.** Every surviving candidate at
[where does this run?](../questions/where-does-this-run.md) — Fly.io micro-VMs, a Hetzner VPS, a
Google Compute Engine e2-micro, DigitalOcean or Linode, and Coolify on a VPS — runs an ordinary
container or an ordinary Linux machine, so the version comes from the image this project builds
rather than from the platform. Reasoned from what those candidates are, not checked against any
provider's documentation, because none of them supplies the runtime.

**CPU, memory, storage and network were asked and only one binds.** CPU does not: the client owns
solving ([ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md)), so no Node version sits on
the path from a player's input to a repaint. Network does not: the runtime version has no bearing on
what crosses the wire. Storage does not: the store is one SQLite file
([ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md)) whose size is the same under any
major. Memory binds only through the ability to bound the heap and report the failure, which is what
[ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md) turned on and which was measured
above. No throughput or latency figure was taken, because a number here would measure something this
decision does not turn on.

## Enforced by

Nothing yet, and nothing can be until the rule has somewhere to write its answer. The artifact — a
file or field naming the version, read by the laptop, the container and CI — is chosen at
[what pins the toolchain versions across machines?](../questions/what-pins-the-toolchain-versions-across-machines.md),
which is downstream of this record and of
[ADR-0032](0032-the-package-manager-is-pnpm.md) because one mechanism should pin both tools. Both
inputs have now landed. Until that lands this is asserted only, and a machine running something else will not be
told.

**A check could enforce it and none exists.** The rule is mechanical — compare the pinned version
against Node's published schedule — so it is the kind of thing a script can assert rather than a
convention anyone has to remember. Whoever builds the pin artifact is the natural person to add it.

## Rejected

**Adopt a line only once it is Active LTS, never before — because today that means adopting v24 and
migrating off it inside five weeks.** The case for it is strong and nearly universal: it is the
conservative default, it is what most container images ship, and it never runs a line that has not
had six months of Current-phase exposure first. What disqualifies it is that it selects on a label
about to flip rather than on remaining runway. v24 enters Maintenance on 2026-10-20 and v26 becomes
Active LTS on 2026-10-28, so this rule prescribes an install, a pin, and then a version bump and
reinstall a month later, arriving exactly where the chosen rule starts. That is the single reason
and it stands alone.

*Reverses if* Node's Current phase starts producing lines that are materially less reliable than
their Active LTS phase, which would make the six-month wait a thing being bought rather than a thing
being paid.

**Track the newest released line regardless of LTS commitment — because it has no safeguard if the
announced release model does not hold.** The case for it is that it is simpler than the chosen rule
and, under the announced model, gives an identical answer forever: every release becomes LTS, so
"newest" and "newest committed to LTS" never diverge. That is the strongest argument here and it is
why this option is close rather than wrong. What disqualifies it is that the announcement is thinly
evidenced — it lives in one blog post that `nodejs/Release`'s README and `schedule.json` both still
contradict. If Node ships a non-LTS line again, this rule adopts it: roughly eight months of
support, and `engines.node` ranges that refuse it, which Vitest 5.0.1
(`^22.12.0 || ^24.0.0 || >=26.0.0`) and npm 12.0.2 (`^22.22.2 || ^24.15.0 || >=26.0.0`) both
currently carry. The chosen rule costs nothing extra while the model holds and protects against it
not holding.

*Reverses if* the announced model is reflected in `schedule.json` and the `nodejs/Release` README,
at which point the LTS-commitment clause is checking something that cannot be false and could be
dropped as noise.

**Pin a version and move only when something forces it — because it converts a scheduled small move
into an unscheduled large one.** The case for it is real: maximum stability, no upgrade anyone did
not ask for, and the fewest total migrations. What disqualifies it is that end-of-life arrives
regardless, and [../problem.md](../problem.md)'s stated horizon of years guarantees this project
outlives at least one line. The move then happens under whatever pressure created it, across more
than one major at once.

*Reverses if* this project stops being actively worked, since a system nobody is changing has little
to gain from a newer runtime and something to lose from any change at all.

**Not yet, and keep only the concrete version — because the version was going to be chosen by an
unstated rule.** The case for it is the strongest objection to this whole record: M1 needs a number
in a file, not a policy, and a rule decides April 2027 today when waiting would decide it with more
information. What disqualifies it is that keeping only the concrete version still chooses it by a
rule: picking 26 because v24 expires in thirty-one days is a rule about support runway, applied once
and left unnamed. A premise doing that much work is decided rather than deferred.

*Reverses if* the rule turns out to select something unacceptable and gets overridden by hand, which
would mean the real decision procedure is judgement and this record is describing it wrongly.

## Risk

**It commits to upgrades nobody has seen.** Under the announced model this adopts a new major each
April, six months before it becomes Active LTS. That is the cost being accepted for not re-deriving
the reasoning annually, and the mitigation is only that the rule leaves the day within the window
open, so an upgrade can wait for a quiet week.

**The strictest reading of the erasable subset is now the only one available.** The rule selects 26,
where there is no middle between type stripping and a real transpiler. If
[is server TypeScript transpiled or stripped?](../questions/is-server-typescript-transpiled-or-stripped.md)
wants a construct Node cannot strip, the answer has to be a transpiler rather than a flag. That
question already names stripping as the reversible direction, so the cost is bounded — but the field
is smaller because of this record.

**Node's release model is changing and the evidence is one blog post.** `nodejs/Release`'s README
still states the superseded odd/even rule verbatim and `schedule.json` gives v27 no `lts` key.
Nothing in the Decision depends on the announcement being correct, and the LTS-commitment clause
exists precisely so that it does not — but anyone reading this record for what Node will do next is
reading the wrong document.

**`node:sqlite` is a release candidate rather than stable**, on every line this rule could select.
Not a cost of this record, since it is equally true of the rejected options, but recorded because
the repo's standing argument that the store does not narrow the runtime passes through that module
and no record had noted it sits below stable.
[Which driver reads and writes the store?](../questions/which-driver-reads-and-writes-the-store.md)
at M3 is where that is owed.

## Revisit when

A line this rule selects carries an `engines.node` conflict with a dependency this project needs, or
fails on it in a way another supported line does not.

The announced release model is contradicted by what Node actually ships — a non-LTS major after v27,
or v27 arriving with no LTS commitment.

Overriding the rule by hand becomes the normal case rather than the exception, which would mean the
real procedure is judgement and this record describes it wrongly.

## Also update

- [x] questions/README.md — the version question leaves M1's remaining work; no replacement question
      is opened, because this rule answers both which line and when it moves. The research that
      produced it reads at
      `git show 180cf22:docs/questions/which-node-version-line-does-this-track.md`
- [x] architecture.md — nothing: this names a runtime selection rule, not a boundary or a
      relationship
- [x] constraints.md — nothing: Node's release dates are facts about a tool, and they live with
      their sources in the question files that use them rather than among the limits browsers,
      networks and law impose
- [x] glossary.md — nothing: no new domain term
- [x] guarantees/ — nothing: no promise to a player turns on which Node line runs the server, and
      the compatibility promises concern browsers, governed by
      [ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
