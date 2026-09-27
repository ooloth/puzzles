# Development

How to run each part of the system, and what correct output looks like. Update it in the same change
that adds a way to run or observe something, or breaks one.

Each section says which mode it is observed in and what that mode cannot show. Per
[ADR-0039](docs/decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
a change is verified in a production-like local run and only the fast loop may differ from
production. That run does not exist until M2, so everything here is the fast loop for now.

## Setup

Node on the line [ADR-0031](docs/decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md)
names, which is 26 today. pnpm switches itself to the version `packageManager` in `package.json`
names.

```sh
pnpm install
```

## Check a change

```sh
pnpm test                        # every *.test.ts: server, client build, docs checker
pnpm typecheck                   # server, client and build config, each against its tsconfig
python3 scripts/check-docs.py    # docs/: links, index entries, frontmatter
```

Expect all three to pass. Nothing runs them automatically yet; that is
[what runs the checks on every change?](docs/questions/what-runs-the-checks-on-every-change.md) at
M2. The server's tests bind a local port, and the docs checker's tests need `python3`.

Then run the sections below for the part you changed. Tests passing is not evidence that it works. A
change that adds a way to run or observe something adds its section here.

## The server answers a route

```sh
pnpm start                               # node src/server/main.ts on 127.0.0.1:3000
curl -i http://127.0.0.1:3000/hello
HOST=localhost pnpm start
```

- `pnpm start`: after pnpm's own `$ node src/server/main.ts` line, every line is JSON, and the first
  has `"msg":"Server listening at http://127.0.0.1:3000"`. `HOST` and `PORT` change the address.
- `curl`: `200`, `content-type: text/plain`, body `Hello!`. Stdout gains an `incoming request` line
  and a `request completed` line with the same `reqId`, the second carrying `responseTime`.
- `HOST=localhost`: exits 1 with a `"level":60` line whose `problems` name `HOST`.

Can't observe: how the server answers behind production's host and address, neither of which exists
yet.

## The server shuts down without cutting a request off

Add a temporary route that waits three seconds, then:

```sh
pnpm start
curl -i http://127.0.0.1:3000/<slow-route>
/bin/kill -TERM <node pid>              # half a second into the curl
```

- `curl`: the full response with `200`.
- Stdout: `shutting down`, then `request completed`, then `shut down`. The process exits 0 within a
  few milliseconds of the request finishing. Exiting after about 72 seconds means idle connections
  are no longer being reaped.

Can't observe: how production's host stops the process, since no host is chosen yet.

## A browser shows the client

```sh
pnpm dev                                 # http://localhost:5173/, live reload
pnpm build && pnpm preview               # dist/client/ at http://localhost:4173/
ls dist/client/assets/
```

- Either address: the page shows "Hello!" with no console errors. The served document's `#root` is
  empty and React fills it. The client does not call the server yet.
- `dist/client/index.html` loads one script, `assets/index-<hash>.js`.
- `pnpm preview` has no API behind it, so it is not the production-like run.

Can't observe: whether the built script parses on a browser at the floor. Nothing here runs one, and
that check is owed at M2.

## In the Claude Code sandbox

`.claude/settings.json` allows binding local ports, which the server's tests and both client servers
need.

pnpm needs two user-level sandbox settings, or it hangs without output when it fetches from the
registry: `enableWeakerNetworkIsolation: true`, so it can verify TLS certificates through macOS, and
`~/Library/pnpm` and `~/Library/Caches/pnpm` in `filesystem.allowWrite`, or it builds a second store
under `node_modules/`.

## References

- [Fastify guides](https://fastify.dev/docs/latest/Guides/)
