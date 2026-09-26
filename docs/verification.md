---
updated: 2026-09-26
update_when: a new way to run or observe the system exists, or an old one breaks
decays: fast
status: active
---

# Verification

How to watch the real system do the thing. "Tests pass" is not proof a change works.

For each capability: how to run it, what to look at, what correct looks like. If something
can't be observed end to end, **say so here** and name the nearest available signal —
a recorded gap is a gap someone can close.

Test conventions go in [standards/](standards/).

**Each capability says which mode it is observed in.** Per
[ADR-0039](decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
a change is verified in a production-like local run, and only the fast loop may differ from
production. That run does not exist until M2 builds it, so every entry below is observed in the fast
loop for now, and each says under **Can't observe** what the fast loop cannot show.

## The server answers a route

Mode: the fast loop.
Run: `pnpm start`, which runs `node src/server/main.ts`. `HOST` defaults to `127.0.0.1` and `PORT`
to `3000`.
Look at: stdout, and `curl -i http://127.0.0.1:3000/hello`.
Correct looks like: every stdout line is JSON. The first reads
`"msg":"Server listening at http://127.0.0.1:3000"`. The curl gets `200` and `Hello!` as
`text/plain`, and stdout gains an `incoming request` line and a `request completed` line sharing a
`reqId`, the second carrying `responseTime`. `HOST=localhost` exits 1 with a `"level":60` line whose
`problems` name `HOST`.
Can't observe: how the server answers behind production's host and address, neither of which exists
yet.

## The server shuts down without cutting a request off

Mode: the fast loop.
Run: `pnpm start`, then add a route that waits three seconds, curl it, and send the server's `node`
process `SIGTERM` half a second in. Use `/bin/kill` if your shell wraps `kill`.
Look at: the curl output, and how long the process takes to exit.
Correct looks like: the curl gets its full response with `200`. The process logs `shutting down`,
then `request completed`, then `shut down`, and exits 0 within a few milliseconds of the request
finishing. Exiting after about 72 seconds means idle connections are no longer being reaped.
Can't observe: how production's host stops the process, since no host is chosen yet.

## A browser shows the client

Mode: the fast loop (`pnpm dev`), plus the built client alone (`pnpm preview`), which is served with
no API behind it and so is not the production-like run.
Run: `pnpm dev` for the development server, or `pnpm build` then `pnpm preview` for the built
output.
Look at: the printed address in a browser, and `dist/client/` after a build.
Correct looks like: the page shows "Hello!" with no console errors. The served document's `#root` is
empty and React fills it. `dist/client/index.html` loads one script named `assets/index-<hash>.js`.
Can't observe: whether the built script parses on a browser at the floor. Nothing here runs one,
and that check is owed at M2.

## Automated checks

Run: `pnpm test` for the server's, the client build's and the docs checker's tests, `pnpm typecheck`
for the server, the client and the build config, and `python3 scripts/check-docs.py` for the
documentation. The server's tests bind a local port, and the docs checker's tests need `python3`.
Can't observe: nothing runs any of these on its own. That is
[what runs the checks on every change?](questions/what-runs-the-checks-on-every-change.md) at M2.

<!-- Template:

## <Capability>

Run: `<command>`
Look at: <output, endpoint, log line, screen>
Correct looks like: <specific — a value, a shape, a rendered thing>
Can't observe: <what's invisible, and the closest proxy>
-->
