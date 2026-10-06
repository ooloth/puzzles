---
updated: 2026-10-03
update_when: a decision is made, a milestone changes, a question is split, or a requirement changes
decays: fast
status: active
---

# Questions

The sibling of [../decisions/](../decisions/): the decisions not yet made, arranged by what they
stop us building.

A directory listing of this folder is the full inventory — every filename asks its question plainly,
so there is no index here. What this file holds is **what has to be shipped, what is already
established, and which questions stand between the two**. That is the part a listing cannot show, and
the part every session was otherwise reconstructing from scratch.

## Start here

**Read [../problem.md](../problem.md) and [../guarantees/](../guarantees/) in full before deciding
what to work on.** Everything below is downstream of them, and a sequence argued without them is
argued from the wrong end. This is the path most readers arrive by, which is why it says so here as
well as in [../README.md](../README.md).

**Then work M1 from the top.** Its slices are things you can run and look at, in the order you would
build them, each with the questions that block it. Only the current milestone is laid out that way —
the rest are bare question lists on purpose, for the reason given under
**Milestones below the current one stay unplanned**.

**The milestones come first here, and the conventions follow them**, because deciding what to work
on is the daily reason to open this file and the conventions are read when maintaining it. Below the
lists: how a milestone's list is built, why lower milestones stay unplanned, how this file relates to
the issue tracker, and what goes in a question file.

## M1 — "Hello!" is live

A deployed skeleton: a client, an endpoint answering one route with a hard-coded response, and
nothing else. No database, no puzzle, no features.

**M1 is a vertical slice through the whole system, not a front end with a stub behind it.** Both
halves ship, onto a host that has to satisfy the server and whatever its store turns out to need. The
client runs almost anywhere, so it is the half least able to discriminate between hosts and must not
be what selects one — which is why hosting is the fourth slice and not the first. The only throwaway
thing in M1 is the string the endpoint returns.

**Nothing in M1 turns on the maintainer's appetite for operating infrastructure.** That is a
short-term guess against a long-lived choice. These are decided on which option keeps the most
technical properties reachable — performance, safety, portability, and the ones not yet known to
matter. A question that cannot be settled without a preference says so rather than inventing a
derivation.

A list that does not start at 1 is not missing anything: a slice's entry is deleted once its issue
closes, and the slices left keep their numbers because records cite them by number.

4. **Both halves are deployed on a host.**
   - **Given:** [../constraints.md](../constraints.md) — of the mechanisms it records, a server-set cookie is the only one carrying an identifier across Safari's storage wipe with nothing asked of the player
   - **Given:** [../constraints.md](../constraints.md) — that exemption is capped to seven days when the API answers on a *second hostname* resolving to a different provider, and an API path-routed on the app's own hostname passes by being compared with itself, unless that hostname is a CNAME and a service worker answered the navigation, which is reasoned from source and unobserved
   - **Given:** [../constraints.md](../constraints.md) — a genuinely cross-origin API is blocked outright rather than capped, so it is worse and not exempt
   - **Given:** [../constraints.md](../constraints.md) — a cached asset is used without a request only while it is fresh, and with no explicit expiry the browser may guess one, so content-hashed filenames are what make a long `max-age` safe
   - **Given:** [0021-the-server-and-its-store-share-a-machine](../decisions/0021-the-server-and-its-store-share-a-machine.md) — the host must run an ordinary process with a local disk beside it
   - **Given:** [0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network](../decisions/0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md) — and that disk is inside the machine, not network block storage
   - **Given:** [0022-the-machines-disk-survives-restart-redeploy-and-host-replacement](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) — and that disk must survive a redeploy, which platforms vary on
   - **Given:** [0040-the-client-and-the-api-answer-on-one-origin-in-production](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) — so the host must present both halves on one hostname
   - **Given:** [0041-api-paths-live-under-api-and-every-other-path-is-the-clients](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md) — so whatever serves the origin sends every path under `/api/` to the server, and no cache or cookie rule written for the files reaches it
   - **Given:** [0043-the-server-runs-on-a-digitalocean-droplet](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) — the server runs on a Droplet in a North American region, with no swap by default and live migration for host maintenance
   - **Given:** [0044-the-server-runs-as-systemd-services-without-containers](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) — the app, and any process the store's backup adds, run as systemd services, with no container runtime
   - **Given:** [0019-the-store-is-a-file-the-server-process-opens](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) — the store is a file on the machine
   - **Given:** [0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md) — hosting costs about $10 a month as a preference, and $20 as a ceiling
   - **Given:** [0046-no-standing-digitalocean-token-can-create-billed-resources](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) — a token that creates the Droplet is held by hand, expires soon and is deleted afterwards
   - **Given:** [0047-nothing-automated-deletes-or-stops-resources-to-cap-spending](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) — spending is reported by alerts, so the Droplet is created with DigitalOcean's metrics agent for the traffic alert
   - **Given:** [0048-production-runs-in-its-own-digitalocean-team-apart-from-experiments](../decisions/0048-production-runs-in-its-own-digitalocean-team-apart-from-experiments.md) — the Droplet is created in the `puzzles` team, and spikes stay in `puzzles-experiments`
   - **Given:** [0049-the-droplet-runs-debian-13](../decisions/0049-the-droplet-runs-debian-13.md) — the Droplet runs Debian 13 from `debian-13-x64`
   - **Given:** [0050-caddy-terminates-tls-in-front-of-the-app](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) — Caddy, from its own repository, terminates TLS and sends `/api/` to the app, with `0rtt off` and its certificate state restored with the machine
   - **Given:** [0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) — updates from Debian and Caddy's repository install daily at one hour, and the machine reboots then when anything needs it, never restarting a service for a library
   - **Given:** [0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md) — software comes from Debian 13's main and security suites, plus Caddy's repository pinned to `2.*`, and any further repository meets that record's list
   - **Given:** [0053-caddy-serves-the-clients-files-from-the-release-on-disk](../decisions/0053-caddy-serves-the-clients-files-from-the-release-on-disk.md) — Caddy serves the client's files from the release's directory, and each release carries at least the previous release's assets
   - **Given:** [0054-the-maintainers-ssh-key-is-held-in-1passwords-agent](../decisions/0054-the-maintainers-ssh-key-is-held-in-1passwords-agent.md) — the maintainer's key is generated in 1Password and used through its agent, with only its public half on the machine
   - **Given:** [0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it](../decisions/0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md) — a generated password kept for the Recovery Console, SSH refusing passwords before it exists, the key attached at creation, the app's unit blocking link-local addresses, and the recovery ISO as the fallback
   - **Given:** [0056-the-droplet-runs-without-digitaloceans-droplet-agent](../decisions/0056-the-droplet-runs-without-digitaloceans-droplet-agent.md) — the Droplet is created through the API with `--droplet-agent=false`
   - **Given:** [0057-ssh-accepts-only-keys-and-a-firewall-on-the-machine-admits-only-ssh-http-and-https](../decisions/0057-ssh-accepts-only-keys-and-a-firewall-on-the-machine-admits-only-ssh-http-and-https.md) — `sshd` takes keys only, and an `nftables` ruleset from cloud-init admits TCP 22, 80 and 443, UDP 443 and ICMP, with outbound open and no Cloud Firewall
     - **Must answer:** [is-node-installed-on-the-host-or-carried-in-each-release](is-node-installed-on-the-host-or-carried-in-each-release.md) — or else how Node is pinned and patched on the Droplet, by the host's package manager or as a binary inside each release, is left to whatever the setup script does, and the runtime can change under a running release with no deploy
     - **Must answer:** [how-does-a-deploy-switch-between-versions](how-does-a-deploy-switch-between-versions.md) — or else the first deploy stops the old instance however the setup script happens to, and requests in flight on it fail, which the spikes observed as 39 POSTs failing with 502
     - **Must answer:** [how-is-the-server-reached-and-hardened](how-is-the-server-reached-and-hardened.md) — or else the Droplet is on the public internet from this slice with whatever SSH and firewall setup the provisioning script happens to have, where scanners rather than anyone interested in this project can take it, and a lockout leaves no route back onto the only machine. With no player data yet, unwinding it costs a rebuilt machine and rotated credentials
     - **Must answer:** [can-root-log-in-over-ssh](can-root-log-in-over-ssh.md) — or else the Droplet keeps DigitalOcean's default, `root` accepting the key attached at creation, which no record weighed beside the named user the maintainer logs in as
     - **Must answer:** [how-is-digitaloceans-metrics-agent-installed-and-kept-updated](how-is-digitaloceans-metrics-agent-installed-and-kept-updated.md) — or else creating the Droplet with monitoring on adds DigitalOcean's own apt repository, which [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md) has not vetted, and leaving it off leaves [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)'s traffic alert with nothing to read. Either failure is silent
     - **Deferred:** [what-gives-the-clients-files-a-validator-that-changes-only-with-their-content](what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md), until players arrive — Caddy's default validator is safe and costs only full responses where a 304 would do, and a better one is one build step added later
     - **Deferred:** [which-encodings-are-the-clients-files-precompressed-in-and-what-writes-them](which-encodings-are-the-clients-files-precompressed-in-and-what-writes-them.md), until players arrive at M12 — Caddy serves an uncompressed file correctly where no compressed copy exists, so slice 4 builds without it, and writing the copies is a build step added later
     - **Deferred:** [which-region-does-the-machine-run-in](which-region-does-the-machine-run-in.md), until players arrive at M12 — slice 4 creates the Droplet in any North American region [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) allows, and until the store holds players' work, moving the machine moves only puzzles that can be written again
     - **Deferred:** [at-what-hour-does-the-machine-apply-updates-and-reboot](at-what-hour-does-the-machine-apply-updates-and-reboot.md), until players arrive at M12 — slice 4 keeps Debian's default of 06:00 to 07:00 machine time, which harms nobody until someone starts a session then
5. **The deployment answers at an address we control.**
   - **Given:** [../constraints.md](../constraints.md) — the first-party test turns on what the domain resolves to, and fails silently
   - **Given:** [0043-the-server-runs-on-a-digitalocean-droplet](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) — the Droplet serves from its own address, so nothing requires a CNAME to a provider's domain
     - **Must answer:** [how-does-the-domain-reach-the-deployment](how-does-the-domain-reach-the-deployment.md) — or else a proxy or CDN in front changes what the browser treats as the origin, which is the same silent Safari failure reached by a different route. Costs a redeploy plus whatever sits in front
6. **A change made locally reaches the deployment.**
   - **Given:** [0043-the-server-runs-on-a-digitalocean-droplet](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) — the pipeline targets one Droplet, which brings no pipeline of its own
   - **Given:** [0044-the-server-runs-as-systemd-services-without-containers](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) — a release is a directory of built JavaScript and its `node_modules`, run by systemd
   - **Given:** [0046-no-standing-digitalocean-token-can-create-billed-resources](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) — the pipeline holds no DigitalOcean token that can create anything
   - **Given:** [0034-the-repository-is-one-package](../decisions/0034-the-repository-is-one-package.md) — so the pipeline builds every deployable from one install with no publish step between the rules module and its consumers, which is what [ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) requires of it
   - **Must answer:** [what-deploys-the-code](what-deploys-the-code.md) — or else the first deploy is done by hand and stays that way, and every later milestone verifies against something nobody can reproduce. Costs a re-scaffold, and it is what [how is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) at M11 builds on

### Working notes — temporary, and deleted as its content finds permanent homes

**This section is a scratchpad, and the only one.** M1's hardest questions constrain each other across
several files, and a thought that spans three question files has nowhere else to live: a question file
holds one question's working, [../constraints.md](../constraints.md) holds facts about the world, and
neither holds "here is how these four fit together". That is what this is for. Everything here is
provisional and moves out to a record, a constraint or a question file as soon as it has earned a
permanent home. Delete what has moved rather than leaving a second copy.

**Open, and spanning more than one question file.**

- **Nothing currently spans more than one question file.** The section stays because the next
  cross-cutting thought needs somewhere to go.

## M2 — a change can be checked before it ships

M1 is the first thing that exists and the first thing that can be wrong without anyone noticing.
Everything after this is verified using whatever gets built here, so building it once now — while the
stack is chosen and little is built on it — is when it is cheapest and when it pays back most.

Each entry is a maintainer's problem rather than a thing a project ought to have, and each is the
difference between checking a change in a minute and checking it in an afternoon. They are used many
times a day, by the maintainer and by an agent working without them. This milestone produces nothing
a player can see, which is why it has to be a milestone rather than a habit.

**Tooling that checks something a later milestone creates waits for that milestone.** Reaching the
store in local development sits at M3, where the store first exists. Resetting state, loading an
arbitrary board, driving a real device and the cross-browser matrix sit at M5, where the first board
a player can touch exists. Reaching and hardening the server sits at slice 4 of M1, because the
machine is on the public internet from then.

1. [What runs the tests?](what-runs-the-tests.md) — `node --test` runs them today as a stopgap.
2. [What runs the checks on every change?](what-runs-the-checks-on-every-change.md) — `check-docs.py`
   already exists and nothing runs it, which is the shape of the whole problem.
3. [Is server TypeScript transpiled or stripped?](is-server-typescript-transpiled-or-stripped.md) —
   It sits here rather than at M1 because this is the first point it cannot be deferred further.
   Nothing in M1 needs a construct Node cannot strip, and
   [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) means the runtime
   enforces the erasable subset for free: anything else fails at execution, so the constructs cannot
   spread unnoticed while this is open. What changes here is that a test runner and the repo scripts
   start executing the same source, and a second executor is the thing that makes "what transforms
   it" a real choice rather than a default. Sits after the three above because they name the
   executors.
4. [What pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md)
   — here rather than at M1 for the same reason. M1 runs on one machine, where an unstated
   version is a fact rather than a disagreement. The second machine is the CI runner that
   [what runs the checks on every change?](what-runs-the-checks-on-every-change.md) creates, and a
   pin with only one machine to bind is a file nothing reads. It carries the artifact
   [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) says is owed, and
   the rule at [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md)
   supplies the Node value it has to hold. The package manager is
   [ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md). On the development machine the
   `pnpm` command is Corepack's shim, which reads `packageManager` and runs the version it names, per
   [../gotchas.md](../gotchas.md); whether pnpm installed without Corepack switches itself the same
   way has not been observed here, and both are mechanisms this question has to weigh.
5. [What proves a vertical slice works end to end?](what-proves-a-vertical-slice-works-end-to-end.md)
   — every milestone here claims to be observable, and nothing says what observing one consists of.
   This decides whether the checks in [../../CONTRIBUTING.md](../../CONTRIBUTING.md) become something
   that runs.
6. [How is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md)
   — a bug that only appears deployed costs a deploy cycle per attempt to reproduce it.
   [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
   settled that verification happens in a production-like local run and only the fast loop may
   differ. What is left is building that run: which differences it closes, how, and what command
   runs it.

## M3 — a puzzle comes from the store

One seeded puzzle, written to the store by hand, read back by the endpoint, and displayed however
crudely. No grid, no interaction, no generator. This is where connection handling becomes real, and
where [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s
queryability stops being a promise about a store nobody has built.

It sits here rather than at M8 because the alternative is building the client against a hard-coded
board for six milestones and meeting the store for the first time with a finished game attached.

**Operating the store waits for M12.** Until players arrive the store holds only puzzles, which can
be written again, so losing a row costs nothing. Backups, durability settings, migrations, recovery
from a lost machine, deploys that leave the store alone, secrets and the machine's region all become
real with the first player's data, and they sit at M12, where players arrive. So does whether
puzzles and player records share one store, since player records first arrive there.

1. [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — only enough of it
   to write one row and read it back. The full answer is not needed until M7.
2. [What crosses the client/server boundary?](what-crosses-the-client-server-boundary.md) — the first
   response with content in it is the first contract, so this is where the format is set.
3. [How does the client load data from the server?](how-does-the-client-load-data-from-the-server.md)
   — after the boundary above, which is its first input. This is the first fetch of content that
   becomes the board, which [ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md)
   keeps out of the renderer, so M1's fetch of "Hello!" inside a view is not the pattern to copy. What
   implements the client's state is answered at M5 and prefetching at M9, so this may need to settle
   only where fetched content enters the client and leave when it is fetched to M9.
4. [Which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md) — the
   first row is here. Its *openness* is a caveat on M1: the argument that the store does not narrow
   the runtime runs entirely through `node:sqlite`, which no record has chosen. The durability
   settings applied through it wait for M12.
5. [How is the store reached in local development?](how-is-the-store-reached-in-local-development.md)
   — the store first exists here, so this is the first milestone whose daily loop opens it. What M1
   needed was only the comparison of what each store shape would cost in the daily loop, and that is
   a finding recorded against
   [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md).

## M4 — a grid is on the screen

The M3 puzzle, rendered as a grid. Static, no interaction.

- [How is the app styled?](how-is-the-app-styled.md) — with the renderer settled at
  [ADR-0038](../decisions/0038-the-renderer-is-react.md), which ships no styling of its own, so the
  styling toolchain is a choice here rather than something React brings.

## M5 — a player can fill it in

Select a cell, enter a digit, see it. In memory only; nothing survives a reload.

1. [How does a player enter a digit?](how-does-a-player-enter-a-digit.md) — bounded by
   [ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md), which rules out a
   gesture with no keyboard form.
2. [What latency budget makes a move feel immediate?](what-latency-budget-makes-immediately-checkable.md)
   — after the above, since the budget covers the input path and what an input is comes first.
3. [What implements the client's state?](what-implements-the-clients-state.md) — the first puzzle
   state held in memory arrives here. How much a library could supply depends on the storage
   mechanism, undo depth and state shape at M6, so this is answered with those in view rather than
   ahead of them.
4. [How is the system reset to a known state?](how-is-the-system-reset-to-a-known-state.md) — two runs
   of a check are only comparable if they start from the same place, and the first state worth
   resetting is the board this milestone creates.
5. [How does anyone load an arbitrary board state?](how-does-anyone-load-an-arbitrary-board-state.md)
   — reaching a nearly-finished grid or a specific violation by playing to it is the main thing
   standing between someone and checking whether a change works.
6. [How is the app driven on a real device?](how-is-the-app-driven-on-a-real-device.md) — the primary
   platform is a phone, this is the first milestone with input worth checking on one, and
   [../constraints.md](../constraints.md) records a streaming bug that reproduced only on real iOS
   Safari over a real network.
7. [How is this tested across browsers and platforms?](how-is-this-tested-across-browsers-and-platforms.md)
   — how many devices and which, and what runs where. The matrix itself is settled by
   [ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md);
   this question is the other half, which is what to run it on. It carries more weight than it looks:
   [the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
   is promised against compatibility data rather than observation until this lands, and the API half
   of the floor is only partly checkable by any tool.

## M6 — the board survives a reload

The first durability promise anything actually keeps.

1. [Is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md) — depth is what
   decides the shape below, so it comes first even though undo itself is an M10 feature.
2. [What can a player do with no network?](what-can-a-player-do-with-no-network.md) — one board or a
   browsable archive, which sets storage volume by orders of magnitude.
3. [Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md) — a
   log of moves is also the raw material for recording play at M12, so this is answered with that
   use in view.
4. [Does the floor cover iOS 15 devices that never installed their updates?](does-the-floor-cover-ios-15-devices-that-never-installed-their-updates.md)
   — whether the floor is Safari 15.0 or 15.6, which decides whether a storage or cross-tab design
   may use the APIs Safari added at 15.2 and 15.4.
5. [Which client storage mechanism holds a player's work?](which-client-storage-mechanism.md) — the
   one stack choice with no clean migration path.

## M7 — the rules run

Illegal moves are recognised, and a finished board is recognised as finished.

1. [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — the full answer,
   now that something depends on it.
2. [How is the codebase laid out?](how-is-the-codebase-laid-out.md) — what remains of it after
   [ADR-0034](../decisions/0034-the-repository-is-one-package.md) settled the package count. Two
   parts land here: how the rules module is reached, decided by the first import of it, which is
   this milestone; and what lives inside `src/rules/`, decided once there are rules to organise.
   Its third part, whether the generator is a third deployable, waits for M8. Nothing before this
   milestone imports the rules module, which is why none of it blocks M1.

## M8 — the puzzles are real

Not one seeded row. Something published on a rhythm, fetched and rendered.

1. [Does v1 ship generated or seeded puzzles?](does-v1-ship-generated-or-seeded-puzzles.md) — first, because
   the cost of generation and when it runs only matter for v1 if v1 ships generated puzzles.
2. [How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md) — measurement, and
   the questions below turn on it when the answer above is "generated".
3. [Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)
4. [Can more than one puzzle be published per day?](can-more-than-one-puzzle-be-published-per-day.md)
   — beside the question above, which sets the rhythm, and a puzzle keyed by date alone can never
   have a sibling. M3 keys its seeded row before this is answered, and until players arrive at M12
   re-keying rewrites only puzzles that can be written again.
5. [Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md)

## M9 — it works with no network

1. [How does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
   — narrowed by [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md),
   which settled that a service worker answers the navigation. What is left is everything else: what
   the precache holds besides the document, how the manifest is generated, and what strategy anything
   other than a navigation uses. The manifest is a build output of
   [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md)'s Vite build. The fallback to the entry document excludes `^/api/`, per
   [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md).
2. [How long must offline play survive?](how-long-must-offline-play-survive.md)
3. [Is the player shown anything about the network?](is-the-player-shown-anything-about-the-network.md)
4. [How do we exercise offline, throttled and backgrounded conditions?](how-do-we-exercise-offline-throttled-and-backgrounded-conditions.md)
   — [../constraints.md](../constraints.md) records that the storage failures do not reproduce in a
   desktop browser, so the conditions this milestone is about are the hardest ones to create on
   purpose. It sits here rather than at M2 because there is nothing offline to exercise until now.
5. [Is a puzzle fetched before it is needed?](is-a-puzzle-fetched-before-it-is-needed.md) — the only
   answer that removes the most common wait in the product rather than dressing it, per
   [../problem.md](../problem.md) under "Where a player waits". It sits here rather than at M8 because
   prefetching is an offline capability and needs a rhythm to fetch ahead of, which M8 establishes.
6. [Can a page loaded before a deploy still fetch its files after it?](can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md)
   — the service worker serves an entry document from an earlier release, so its assets are asked
   for after deploys it never saw. It sits here because before this milestone the window is the
   milliseconds between the entry document and its assets. A dynamic import added earlier widens
   that window and brings it forward.

## M10 — sudoku is finished, in guest mode

Everything a guest gets: notes, undo, completion, whatever hints turn out to be.

1. [Are hints in scope?](are-hints-in-scope.md)
2. [What interactions must the grid support?](what-interactions-must-the-grid-support.md) — notes,
   undo, drag-select, keyboard navigation, highlighting.
3. [Is difficulty graded, and does a grade promise anything?](is-difficulty-graded-and-does-a-grade-promise-anything.md)
4. [What makes a puzzle a joy to solve?](what-makes-a-puzzle-a-joy-to-solve.md)
5. [Is screen reader support in scope for v1?](is-screen-reader-support-in-scope-for-v1.md) — the
   structural and keyboard halves are already settled by
   [ADR-0013](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md) and
   [ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md); what is left is
   what a cell announces.

## M11 — the running system reports its own failures

M2 is where checking a change before it ships is built. These report a failure after a change has
shipped, and they are what has to be in place before anyone arrives at M12: whether the app is
serving, whether a deploy broke it, whether a player lost progress or could, and whether the server
has stopped. They sit before M12 because the whole question there is whether players are losing
work, and nothing currently could tell us either way. What needs real traffic to mean anything, such
as vitals, alerting and diagnosing slow requests, waits for players under "Blocking nothing yet".

1. [How do we know the deployed app is serving?](how-do-we-know-the-deployed-app-is-serving.md) — a
   static client loading from cache hides a dead API for a long time.
2. [How is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) — the deploy
   is the moment a working system becomes a broken one.
3. [How would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) — the
   motivating case in the observability theme of
   [the guarantees README](../guarantees/README.md): it produces
   no error, no crash and no complaint.
4. [How would we verify progress is never lost?](how-would-we-verify-progress-is-never-lost.md) —
   backgrounding, tab kill and OS memory purge need real devices or an instrumented harness, and
   until one exists the most consequential promise in the product is enforced by nothing. Beside the
   question above: that one notices a loss in production, and this one shows before players arrive
   that none happens.
5. [What invariants hold at runtime, and what checks them?](what-invariants-hold-at-runtime-and-what-checks-them.md)
   — the correctness theme in [the guarantees README](../guarantees/README.md) names "a partial
   write is never observable" and "the board on screen always matches the board in storage" as
   candidate promises. Both are ways work is lost, and neither is checkable unless something asserts
   it where it can fail.
6. [How is the server operated?](how-is-the-server-operated.md) — restarting it and noticing it has
   stopped. Patching moved to slice 4 of M1 and is settled by
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
   except for alerting on a failed update, which stays here. It sits here because noticing an outage is this milestone's theme. The
   server runs on a bare Droplet as systemd services, per
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md), so
   systemd restarts it and the rest is ours. Its access-and-hardening half is
   [a separate question](how-is-the-server-reached-and-hardened.md) at slice 4 of M1, because the
   machine is on the public internet from then.

## M12 — players arrive, and a guest's work and play are kept off the device

The point at which the app is offered to players, and so the point at which everything owed to a
player's data has to hold. A guest has something worth keeping, the browser is the only thing
keeping it, and play is recorded from the first player onward, per [../problem.md](../problem.md).
It sits after M10 because the size of the problem is set by how much a guest has accumulated, and
after M11 because nothing before that could tell us whether work is being lost. It sits before
signing in because the whole question is what a guest gets _without_ an account.

**Players arriving here is a sketch, not a record.**
[At which milestone do players first use the app?](at-which-milestone-do-players-first-use-the-app.md)
is still open, and moving this point moves every question below that is keyed on players.

1. [Do privacy regulations apply?](do-privacy-regulations-apply.md) — first, because recording play and
   keeping a guest's work off the device both hold data about people from the first player, and the
   answer prices everything below.
2. [What must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md) —
   only what is recorded. Play that was never recorded cannot be analysed later, so the recording is
   settled before players arrive and the analysis can wait.
3. [Does a guest see anything that accumulates?](does-a-guest-see-anything-that-accumulates.md) — the
   product question that sizes everything below. A board's value decays with absence; a streak's does
   not.
4. [How long does a guest's work last?](how-long-does-a-guests-work-last.md) — the bound itself.
5. [Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) — the
   maintainer has said it comes after v1. What is left is whether v1 mints a stable identifier on
   first visit so a later account can claim it, and that is the same token guest recovery below
   would use, so it is answered first.
6. [Is guest recovery worth building?](is-guest-recovery-worth-building.md) — the mechanism. Its
   feasibility depends on M1 having held same-origin open.
7. [Is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
   — the only confirmed mitigation, and it cannot be required of anyone.
8. [What happens after a sync gives up?](what-happens-after-a-sync-gives-up.md) — a wait that ends
   has to end in something, and the player cannot be told, because
   [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
   forbids it. The first write off the device happens here, so this is the first sync that can give
   up. [The durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md)
   is what happens if it is never answered.
9. [Are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md) —
   first among the store questions below, because it decides whether the first player record goes
   into the puzzles' store or a second one, and everything below assumes an answer. Before here the
   store holds only puzzles. It does not pin the generator either way: a generator can publish
   through the server's API and run anywhere under either store locality.
10. [Which region does the machine run in?](which-region-does-the-machine-run-in.md) — every wait a
    player has includes the round trip to the one machine
    [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) allows, and nothing
    says where the players are. Before here, moving the machine moves only puzzles that can be
    written again. From here it moves players' work too.
11. [How do secrets reach the running system?](how-do-secrets-reach-the-running-system.md) — the first
    real secret arrives with the store's off-machine copy, which is first worth having here.
    [What deploys the code?](what-deploys-the-code.md) records that M1 needs none.
12. [What durability settings does the store run
    with?](what-durability-settings-does-the-store-run-with.md) — journal mode, synchronous level and
    busy timeout decide whether a committed write survives a power cut, which
    [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) deliberately left open. Answered
    here because the first player's data is the first thing that could be lost, and the question is
    framed to test whether the safest setting costs anything at all rather than to position a dial.
13. [How is the store backed up?](how-is-the-store-backed-up.md) — the first player's data exists
    here, so this is where a backup stops being hypothetical. It is set up alongside the first data
    worth keeping, and the named precedent for deferring it is an operational inventory of roughly
    twenty-five tasks written for exactly this architecture with no backup or restore procedure in
    it.
14. [Is the store's backup restorable?](is-the-stores-backup-restorable.md) — an untested restore is
    a belief. After the backup above, which is what it rehearses.
15. [How much downtime is acceptable?](how-much-downtime-is-acceptable.md) — while the server is
    down nobody starts a puzzle they have not already got, per [../problem.md](../problem.md) under
    "Where a player waits", so this is a product target. The recovery question below is the main
    lever on how long an outage lasts and needs this target first.
16. [How is the store recovered when the machine is lost?](how-is-the-store-recovered-when-the-machine-is-lost.md)
    — [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
    commits to surviving host replacement and the machine cannot deliver that alone. This is the main
    lever on how long an outage lasts, and it is ours rather than a provider's.
17. [How does a deploy avoid disturbing the store?](how-does-a-deploy-avoid-disturbing-the-store.md)
    — there is no player data before here, so nothing worth keeping can be disturbed. Two processes
    on one machine can share the file while a deploy overlaps them, as measured in the eighth and
    twelfth passes of the hosting question, read with `git show
    ed7f54e:docs/questions/where-does-this-run.md`; what must stay single is the replicator. The
    rest — checkpointing on exit, replication across a restart, rolling back past a migration — is
    real from the first player's data.
18. [What does a browser below the floor see?](what-does-a-browser-below-the-floor-see.md) — what
    keeps
    [a device too old to run the app is told so rather than shown a blank screen](../guarantees/a-device-too-old-to-run-the-app-is-told-so-rather-than-shown-a-blank-screen.md).
    The fallback is carried by the entry document the build already produces, per
    [ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md),
    so adding it here costs no more than adding it at M1. It sits here because nobody is below the
    floor until there are players. Its wrong answer is invisible, since every browser above the
    floor shows the app either way, so it is settled by opening the built document in a browser
    below the floor rather than by reading.
19. [At what hour does the machine apply updates and reboot?](at-what-hour-does-the-machine-apply-updates-and-reboot.md)
    — the hour only matters once someone starts a session at it, which is from here, and it must
    avoid the release hour
    [is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)
    may set at M8. Until then Debian's default hour harms nobody.
20. [Does the app send a Content Security Policy, and how strict is it?](does-the-app-send-a-content-security-policy-and-how-strict.md)
    — React needs neither `eval` nor injected inline styles, so nothing in the build waits on it.
    [ADR-0053](../decisions/0053-caddy-serves-the-clients-files-from-the-release-on-disk.md) settles
    that Caddy serves the client's files, so the header has a home, and a public launch is the
    latest point to decide it.
21. [What belongs on the landing page?](what-belongs-on-the-landing-page.md) — it becomes real the
    moment the app is shown to anyone who has not been told what it is, which is here.
22. [Which encodings are the client's files precompressed in, and what writes them?](which-encodings-are-the-clients-files-precompressed-in-and-what-writes-them.md)
    — a first visit sends the client uncompressed until it is answered, which costs nobody before
    players arrive and costs every one of them after.

## M13 — a player can sign in

1. [Are there user accounts?](are-there-user-accounts.md)
2. [How does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
   — likely the same question as the one above; resolve whether they merge before answering either.
3. [How long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md)
4. [Is the guest record the same shape as the account record?](is-the-guest-record-the-same-shape-as-the-account-record.md)
   — decided here rather than at M12, because it is a claim about both records at once.
5. [Does the server understand puzzle content?](does-the-server-understand-puzzle-content.md)

## M14 — work follows a player between devices

1. [Can two devices edit the same board at once?](can-two-devices-edit-the-same-board-at-once.md)
2. [What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md) —
   a losing write needs two writers, so this does not arise until cross-device resume is in scope
   and the question above is answered.
3. [How does a device know its board is behind?](how-does-a-device-know-its-board-is-behind.md) — a
   different failure from the one above and easy to mistake for it. No write loses; both copies are
   legitimate; the player simply resumes from an older board on a device that cannot tell it is
   older. It is the standing cost of the client authority
   [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) chose, and it becomes
   reachable the moment a second device does.
4. [How much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md)
5. [What wins when battery and durability conflict?](what-wins-when-battery-and-durability-conflict.md)
6. [What does the server do with puzzle state?](what-does-the-server-do-with-puzzle-state.md)

## M15 — the puzzles are ours

- [Which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md)

## M16 — something is paid for

1. [Is there a paid tier?](is-there-a-paid-tier.md)
2. [What load should the server handle?](what-load-should-the-server-handle.md)

## Blocking nothing yet

Real, and nothing is waiting on them. Several are research rather than choices.

[What must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md)
— the property list toolchain choices are scored against. The choices it served are made; what is
left open is which `resolves_into` value its shape deserves.

[How is the questions index kept readable in one pass?](how-is-the-questions-index-kept-readable-in-one-pass.md)
— this file is past what an agent can read at once, and nothing stops it growing.

[Can the gotchas be prevented rather than documented?](can-the-gotchas-be-prevented-rather-than-documented.md)
— each trap in [../gotchas.md](../gotchas.md) might become a command in the contributing guide, which
would leave that file with nothing to hold.

[How long does Safari really keep our storage?](how-long-does-safari-really-keep-our-storage.md),
[how does Android evict stored data?](how-does-android-evict-stored-data.md),
[what are the real network conditions on transit routes?](what-are-the-real-network-conditions-on-transit-routes.md),
[what do existing puzzle apps do about offline play?](what-do-existing-puzzle-apps-do-about-offline-play.md)
— research.

[How long until a stalled connection surfaces as an error?](how-long-until-a-stalled-connection-surfaces-as-an-error.md),
[what wins when correctness and latency conflict?](what-wins-when-correctness-and-latency-conflict.md),
[does craft enjoyment ever outrank user experience?](does-craft-enjoyment-ever-outrank-user-experience.md).

[At which milestone do players first use the app?](at-which-milestone-do-players-first-use-the-app.md)
— the milestone list places players at M12 as a sketch, and no record settles it. Moving that
point moves the questions at M12 that are keyed on players.

[Does any page need markup a crawler can read?](does-any-page-need-markup-a-crawler-can-read.md) and
[do content and puzzle routes share an origin?](do-content-and-puzzle-routes-share-an-origin.md) —
both become real when a URL is first shared with someone, which is M12 at the earliest, and nothing
there waits on either.
No rendering choice forecloses crawler markup: a rebuild on publish and a single runtime-rendered
route are both additive, as
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md)
records. The client and the API share one origin, per
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), so what
is open on routes is only whether a third kind joins them.

**After players arrive.** These need real traffic to mean anything, and nothing before M12 waits on
them. M11 keeps only what has to report a failure before anyone arrives.

[What are the server's vitals, and who watches them?](what-are-the-servers-vitals-and-who-watches-them.md),
[what is worth being woken up for?](what-is-worth-being-woken-up-for.md),
[how is a slow request diagnosed after the fact?](how-is-a-slow-request-diagnosed-after-the-fact.md),
[what invariants hold over stored data, and how are they audited?](what-invariants-hold-over-stored-data-and-how-are-they-audited.md),
[how would we notice a problem nobody predicted?](how-would-we-notice-a-problem-nobody-predicted.md)
and [can failure conditions be injected deliberately?](can-failure-conditions-be-injected-deliberately.md)
— operating the system once people are using it.

[How is the schema migrated?](how-is-the-schema-migrated.md) — v1 can ship with a schema it never
migrates. [ADR-0002](../decisions/0002-launch-with-sudoku-then-star-battle.md) schedules the change
that forces the first migration, star battle, after launch, and that change is where this is needed.

[What gives the client's files a validator that changes only with their content?](what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md)
— a returning visit through the service worker revalidates the entry document and `sw.js` across
deploys, and Caddy's default validator changes with every copy. The cost is a full response where a
304 would do, never a wrong one, so it is a speed improvement that can follow players.

[How do analysis and play share one store?](how-do-analysis-and-play-share-one-store.md) — the scans
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves are
long reads, and a long read blocks WAL checkpointing. Nothing is worth analysing until play has been
recorded for a while, and recording starts at M12, whose backup answer may already be the copy these
reads should run against.

[What format declares the browser floor?](what-format-declares-the-browser-floor.md) — nothing in
v1 needs a shared format: the build names the floor in its own config, and a floor left low breaks
no promise. It becomes real when a second tool has to read the floor, and the format has to suit the
tools that read it, so it is chosen with them.

[How do we learn the browser floor can rise?](how-do-we-learn-the-browser-floor-can-rise.md) —
nothing waits on it, because a floor left low breaks no promise. It becomes real when Apple stops
patching iOS 15, which nothing currently notices.

[Does a player see stats about their play?](does-a-player-see-stats-about-their-play.md) and
[can a player explore past puzzles?](can-a-player-explore-past-puzzles.md) — both are intent stated in
[../problem.md](../problem.md) that no record argues and no promise covers: "what they have solved,
and how they are doing", and a puzzle from any past day. They are here rather than at a milestone
because nothing waits on either, and because both are tracked to stop an infrastructure decision
foreclosing them without noticing. The archive question is the nearer of the two — it meets
[is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md) at M8
and [what can a player do with no network?](what-can-a-player-do-with-no-network.md) at M6, and
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) has already
constrained how an archive would be delivered.

## Building a milestone's list

Seven steps. Each one exists because skipping it produced a list that had to be rebuilt.

1. **Write the milestone's end state in one sentence.**
2. **List the observable slices between nothing and that end state.** Each is one change you can run
   and look at — something true of the system afterwards that was not true before. **Observable does
   not mean a player can see it**: a check that fails on a bad import and a script that reproduces a
   bug are both observable, and M2 is an entire milestone of them. The test is whether you can name
   what you would run and what you would expect to see. Build order, not risk order — the thing that
   renders before the thing that is served, the thing that is served before the thing that is
   deployed. Deploying is the last slice: a hosting choice made before anything exists to host is
   made against an imagined system.
3. **Under each slice, list the givens** — the records, promises and constraints already established
   that bear on *that* slice. Link each one. Where the link is to a large file, name the single
   invariant being relied on, one bullet per invariant.
4. **Under the givens, list the questions that must be worked.** A question blocks a slice if
   building without it would be **reversed**, not only if the work is impossible. Choosing a package
   manager before the runtime is settled is possible today and wrong tomorrow. The literal blockers
   are few; the reversal risks are what decide the order.

   **One label: Must answer**, whether the answer is a choice or a fact to go and find. A research
   question earns its own entry only where nothing else tracks it — where the question it informs
   records it under **Findings**, that is where it lives.

   **Every entry carries an "or else" clause: which later decision in this slice comes out wrong, and
   what unwinding it costs.** Two costs exist here. A **re-scaffold** is a day. A **migration of live
   player data** is not, and it is the only irreversible thing M1 can create. A question whose wrong
   answer costs a re-scaffold does little work at the front of a slice.

   Three things read as clauses and are not: that work cannot start, that the choice might be made
   carelessly, and a restatement of the topic. Each is true of every open question, so none
   distinguishes anything. Where a clause names a mechanism rather than a cost — "whichever is built
   first fixes the other two" — ask "so what?" until it reaches one.

   **If you cannot complete "slice N cannot be built without this because ___", it does not block
   slice N.**

   **Defer.** Every sequencing error in this file has moved a question earlier than it belonged, never
   later. An open question keeps its options and costs nothing. Where it is unclear whether something
   blocks a slice, it does not.

5. **Repeat givens and questions across slices.** Never cross-reference — no "as in slice 1". The
   repetition is what makes step 7 possible and what lets a reader audit one slice without holding
   the others in their head.
6. **Order the questions within a slice** by what has to be answered first. Where two constrain each
   other in both directions they are answered together, and each question file says so under **What
   would settle it**. That is the only place a dependency between questions is written down.

   **Questions that share moments are worked together even where neither constrains the other.** A
   request one serves and another routes, or a deploy one shapes and another carries out, is a
   moment both draw properties from, and worked one at a time each derives only what its own topic
   brings to mind. So the moments are listed once for the group and the property list is derived
   once, and each question's **Properties the answer is scored against** carries a copy of it,
   adding only what is its own. Each still settles in its own record. A candidate is scored under
   every answer an unsettled member could give, and one whose verdict changes makes that member an
   input to be settled first.

   **Grouping is generous and ordering needs evidence.** Including a question in a group that turns
   out not to matter costs nothing. Moving, splitting or reordering questions is a decision, made
   only from scored candidates: a question is coupled to another through a named candidate whose
   verdict changes with its answer, never through a shared topic. The tell that a group was missed
   is one option listed in two question files, and the first move is to split that option into the
   arrangements it covers. On 2026-10-04 "something in front of the Droplet" sat in both the
   file-serving and the domain question. Split, it was a caching proxy, which changed no
   file-serving verdict and stayed with the domain question, and an edge platform hosting the files,
   which was a file-serving candidate. Three rearrangements proposed from topic before that split
   were each withdrawn.
7. **Audit, and expect to move things.** A slice with several unrelated groups of givens is several
   slices. A slice that reads like the milestone restated is bundling. A question written as a given
   is a question — never a **Given**, whatever it is blocking. Read every "or else" clause and ask
   whether it names a consequence for *this slice* or merely describes the question; the second is
   the failure this audit is most likely to find, because it reads as a reason. Then read the
   cross-references: a choice that several files each defer to the others is a question, and it is
   usually wider than any of them. Then count how many slices each question blocks: that orders the
   slices, and says nothing about the order inside one.

**Everything a milestone installs is permanent.** A tracer bullet is the real stack doing the
smallest thing it can do — not scaffolding to be replaced two milestones later. Provisional is not a
category: if a choice would be redone shortly after the milestone, it is missing an input or the
milestone is drawn in the wrong place. Placeholder *values* are fine; placeholder *choices* are not.

**Deferring is the default, and it is the point.** An unanswered question is optionality retained,
and everything learned before it must be answered is information the answer would otherwise be made
without. The skill this list is trying to capture is spotting the moment a question can no longer be
put off, and making it as narrow as possible when that moment arrives. Closing a door is clarifying
and irreversible, so the record that closes one says which one.

**A milestone's prose holds only what its remaining slices need.** When a question is answered, what
it settled goes in the record and the milestone gains no paragraph saying so. The slice entry goes
when its issue closes, and so does any prose that only that slice needed. A milestone that reads as
an account of what was decided is carrying history the records already hold, and it pushes the
slices still to be built further down a file that is already past what one reading can cover.

## Milestones below the current one stay unplanned

They are a list of questions grouped by the milestone that first needs them, and nothing more.
**Expanding one into slices and givens before it is next is planning against a system that does not
exist yet** — the slices are only knowable once the preceding milestone's decisions have landed, and
a plan built earlier gets rewritten rather than followed. It is the same argument as deferring a
decision: plan it when you know the most, which is as late as possible.

**Adding a question to a future milestone is not expanding it**, and is always welcome. A question
discovered now and parked where it belongs is what this file is for.

When a milestone becomes the next one, run the seven steps on it. Not before.

## This file and the issue tracker

**Each slice above becomes one GitHub issue when it becomes workable**, not in advance, per
[../decisions/0015-the-issue-tracker-is-github-issues.md](../decisions/0015-the-issue-tracker-is-github-issues.md)
and
[../decisions/0016-a-delivery-slice-is-an-issue-and-its-derivation-stays-in-docs.md](../decisions/0016-a-delivery-slice-is-an-issue-and-its-derivation-stays-in-docs.md).
The tracker holds what work exists and what state it is in. This file holds why — what each slice
rests on, what blocks it, and why they are in this order. Why a slice is built the way it is sits in
its issue's comments.

**So the tracker is deliberately shorter than this list, and a slice with no issue is normal.** An
issue is filed once nothing in its entry is still a **Must answer**, because an issue written
earlier would carry a definition of done that the unanswered question is about to change. Read a
missing issue as "not workable yet", not as "not planned" — this file is the plan and the tracker is
the work.

**So nothing here records status.** No checkboxes, no "done", no "in progress". Those change daily,
this file is already the fastest-decaying document in `docs/`, and a stale checkbox in a file whose
value is being trusted is worse than no checkbox.

**The slice title is the join key.** It appears here and in the issue, and nothing checks that the two
still match — `scripts/check-docs.py` cannot see the tracker. If they disagree, the tracker is right
about what work exists and this file is right about why.

**A slice's entry is deleted once its issue closes.** What it rested on is in the records it cited,
and its definition of done is in the issue, so what would be left here is history. The slices that
remain keep their numbers, because records cite slices by number, so a gap at the front of a list
means those slices are finished rather than missing. A milestone is finished when its list is empty.

## Housekeeping

**A question resolves into as many records as it contains decisions** — the separability test in
[../decisions/README.md](../decisions/README.md). It is deleted once nothing is left in it that a
record has not settled; mine it first, since findings graduate to
[../constraints.md](../constraints.md) and reasoning belongs in whichever record it argues for.
**Mining happens in the change that lands the record, never later.** A finding a still-open question
will use moves into that question's file then, so no answered file is kept waiting for a later
record to take what it needs.
**Mining moves a claim's tier and source with it**, or the record inherits a bare assertion and the
evidence dies with the file. Where the working is too long to move, cite the commit that deleted it —
`git show <commit>^:<path>` still reads it.
**Promises are written as they fall out of records**, on the decision template's checklist, rather
than committed to in advance.

`scripts/check-docs.py` checks what is fact rather than judgement: links resolve, every question
is referenced at least once from the lists above, no link points at a heading, no question file has
grown a sequencing section. A question deliberately appears under more than one milestone where it is
needed twice, so nothing checks for a single appearance.
It does not check the ordering, because a check that passed it would only make a wrong order look
verified.

**[../decisions/](../decisions/) is the list of what is settled, and it is not repeated here.** Every
record is titled by what it settled, so the listing is the checklist of constraints in force.

<!-- Template for a milestone. Links are shown as backticked pseudo-syntax so the checker does not
     try to resolve them; write them as real markdown links.

## M<N> — <the end state, in a few words>

<One sentence: what exists when this is done, and what deliberately does not.>

1. **<A slice you can run and look at.>**
   - **Given:** `[<record-promise-or-constraint>](<its-path>)`
   - **Given:** `[../constraints.md](../constraints.md)` — <the single invariant relied on>
     - **Must answer:** `[<question-filename>](<question-filename>.md)` — or else <what breaks in this slice>
     - **Must answer:** `[<question-filename>](<question-filename>.md)` — or else <what breaks in this slice>
2. **<The next slice.>**
   - **Must answer:** `[<question-filename>](<question-filename>.md)` — or else <what breaks in this slice>

Questions are always "Must answer", never "Given", whether the answer is a choice or a fact somebody
has to find. Every one carries an "or else" clause naming what breaks in *this slice* without it —
not what the question is about. Where a slice rests on no given, its questions sit at
the top level. Link text is the filename, so the list reads without opening anything.
-->

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
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
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
guarantee, constraint, failure mode or passage of [../problem.md](../problem.md) it rests on, and the list ends
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
cited as though it were. A finding becomes binding by graduating to [../constraints.md](../constraints.md)
or by being reasoned through in a decision record — never by sitting in a question file long enough
to look settled. Every Findings section opens with that sentence, so a reader who arrives at one file
without reading this one still knows what they are holding.

**A finding that asserts a fact about the world carries the tier it was established at**, using the
same three words [../constraints.md](../constraints.md) uses — _Measured_, _Sourced_, _Reasoned_ —
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
a record in [../decisions/](../decisions/) that says what is now binding, and a list of them
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

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**<A claim about the world.>** <What it means for the options here.>

*Sourced | Measured | Reasoned | Unverified — <how we know, or that we do not>.*

**<A judgement or an implication for the options.>** <No tier: there is nothing to have established.>

-->
