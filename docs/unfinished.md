---
updated: 2026-10-02
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

**Actually** the only code is a server under `src/server/` that answers `/api/hello` and a client
under `src/client/` that shows its answer. The host and how the app runs on it are settled, and
nothing is deployed: the front, the deploy switch and what triggers a deploy are open.
Most of what [decisions/](decisions/) settles has no code behind it yet, so read a record as a
constraint on what gets built, not as a description of what exists.

**So** read [questions/README.md](questions/README.md) for what is open and in what order.

### The hosting account's runbook describes steps not yet taken

**You'll see** [runbooks/set-up-the-hosting-account.md](runbooks/set-up-the-hosting-account.md), with
every setting the account is meant to have, written as steps with no status.

**Actually** the GitHub passkey, the production Droplet's metrics agent and its traffic alert do not
exist yet, and nobody has confirmed the mail rule.

**So** don't read the runbook as the account's current state. Delete this entry once those four are
in place.

### The doc checker is written in a language no record sanctions

**You'll see** `scripts/check-docs.py`, in Python, referenced from
[questions/README.md](questions/README.md) and run by hand as the repository's only documentation
check. Nothing runs it automatically yet.

**Actually** [ADR-0030](decisions/0030-typescript-outside-the-browser-runs-on-node.md) says every
repo script runs on Node, so this file contradicts a settled record, and `pnpm test` needs `python3`
because `scripts/check-docs.test.ts` runs it. Its rewrite is issue #2.

**So** don't add a second Python script.

### The test runner and the pnpm pin look chosen and are not

**You'll see** `*.test.ts` files under `src/` running under `node --test`, and `"packageManager":
"pnpm@12.5.1"` in `package.json`.

**Actually** both were put in place so M1's first slice could be installed and tested. They are
interim, and they come ahead of [what runs the tests?](questions/what-runs-the-tests.md) and
[what pins the toolchain versions across machines?](questions/what-pins-the-toolchain-versions-across-machines.md)
at M2, each of which may replace them.

**So** follow them for now, and don't cite either one as settled.

### Changes are to be verified in a run that does not exist yet

**You'll see** [ADR-0039](decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
`CLAUDE.md` and `CONTRIBUTING.md` saying a change is verified in a production-like local run.

**Actually** no such run exists. `pnpm dev` and `pnpm start` are the fast loop. `pnpm preview` serves
the built client with the API behind it on one origin, but not the way production will: behind a
front on a Droplet, under systemd. Building the production-like run is
[how is the app run locally the way it runs deployed?](questions/how-is-the-app-run-locally-the-way-it-runs-deployed.md)
at M2.

**So** verify in the closest mode that exists, which for anything the browser sees is
`pnpm build && pnpm preview` with the server running, and record in
[CONTRIBUTING.md](../CONTRIBUTING.md) under **Can't observe** what it cannot show.

<!-- Template:

### <What looks contradictory>

**You'll see** <the misleading thing>

**Actually** <which is current and why both are here>

**So** <what to do today>
-->
