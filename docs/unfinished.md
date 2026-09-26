---
updated: 2026-09-26
update_when: the codebase enters or leaves a state that would mislead someone reading it
decays: fast
status: active
---

# Unfinished

Heads-ups about half-built or misleading states. Nothing here tells you what you may not do.

Entries are deleted the moment they stop being true. Stale guidance here is worse than none.

### More is settled than is built, and less is settled than it looks

**You'll see** records fixing the store, the entry document, the build and the server's shape, plus a
`docs/architecture.md` with boxes on both sides of the network. It reads as a chosen stack.

**Actually** the only code is a server under `src/server/` that answers one route and a client under
`src/client/` that renders "Hello!", and where the
system runs and what deploys it are open. Settled so far: the store is a SQLite
file the server process opens, a service worker answers navigations, the entry document is a build output, the client build and the HTTP server are separate
tools, the bundler is Vite, everything outside the browser runs on Node, the package manager is
pnpm, the repository is one package with each part of the system a directory under `src/`,
Fastify answers HTTP with request and response bodies described in zod, client state is held outside
the renderer under `src/client/state/`, and the renderer is React.

**So** read [questions/README.md](questions/README.md) for what is open and in what order.

### Three answered question files are still on disk

**You'll see** [questions/does-one-tool-build-the-client-and-answer-http.md](questions/does-one-tool-build-the-client-and-answer-http.md),
[questions/what-builds-the-client-and-serves-it-in-development.md](questions/what-builds-the-client-and-serves-it-in-development.md)
and [questions/what-language-are-repo-scripts-written-in.md](questions/what-language-are-repo-scripts-written-in.md),
all three carrying full working as though they were live.

**Actually** all three are answered — the first by
[ADR-0028](decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md), the second by
[ADR-0029](decisions/0029-the-client-bundler-is-vite.md), and the third by
[ADR-0030](decisions/0030-typescript-outside-the-browser-runs-on-node.md), whose Decision covers
every repo script. All three say `status: answered`, and
`grep -l 'status: answered' docs/questions/*.md` is the authoritative count.

**So** don't work any of them, and don't cite them either — the build one asserted that
[the floor record](decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
requires a browserslist config, which that record leaves open. They are deleted once their findings
are mined.

### The doc checker is written in a language no record sanctions

**You'll see** `scripts/check-docs.py`, in Python, referenced from
[questions/README.md](questions/README.md) and run as the repository's only documentation check.

**Actually** [ADR-0030](decisions/0030-typescript-outside-the-browser-runs-on-node.md) says every
repo script runs on Node, so this file contradicts a settled record. It is the only artifact in the
repository that does.

**So** don't add a second Python script. Rewriting this one needs nothing else to land first —
Node 26 runs TypeScript unflagged, so a dependency-free checker runs with nothing installed, exactly
as the Python one does.

### The test runner and the pnpm pin look chosen and are not

**You'll see** `src/server/*.test.ts` running under `node --test`, and `"packageManager":
"pnpm@12.5.1"` in `package.json`.

**Actually** both were put in place so M1's first slice could be installed and tested. They are
interim, and they come ahead of [what runs the tests?](questions/what-runs-the-tests.md) and
[what pins the toolchain versions across machines?](questions/what-pins-the-toolchain-versions-across-machines.md)
at M2, each of which may replace them.

**So** follow them for now, and don't cite either one as settled.

### Changes are to be verified in a run that does not exist yet

**You'll see** [ADR-0039](decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
`CLAUDE.md` and `CONTRIBUTING.md` saying a change is verified in a production-like local run.

**Actually** no such run exists. `pnpm dev` and `pnpm start` are the fast loop, and `pnpm preview`
serves the built client with no API behind it. Building the production-like run is
[how is the app run locally the way it runs deployed?](questions/how-is-the-app-run-locally-the-way-it-runs-deployed.md)
at M2.

**So** verify in the fast loop, and record in [verification.md](verification.md) under **Can't
observe** what it cannot show.

<!-- Template:

### <What looks contradictory>

**You'll see** <the misleading thing>

**Actually** <which is current and why both are here>

**So** <what to do today>
-->
