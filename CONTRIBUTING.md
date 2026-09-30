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

### DigitalOcean CLI

Needed only for work on the host, not to build or test. The server runs on a DigitalOcean Droplet,
per [ADR-0043](docs/decisions/0043-the-server-runs-on-a-digitalocean-droplet.md).

1. In the DigitalOcean console, under **API → Generate New Token**, create a token with an expiry.
   Give it custom scopes that allow creating, reading and deleting Droplets and SSH keys. Reading the
   account is not needed, so `doctl account get` returning 403 is expected.
2. Install the CLI and authenticate it:

```sh
brew install doctl
doctl auth init          # paste the token
doctl compute droplet list   # an empty table, not an error, means it works
```

## Check a change

```sh
pnpm test                        # every *.test.ts: server, client, client build, docs checker
pnpm typecheck                   # server, client and build config, each against its tsconfig
python3 scripts/check-docs.py    # docs/: links, indexes, frontmatter, record structure; see the script
```

Expect all three to pass. Nothing runs them automatically yet; that is
[what runs the checks on every change?](docs/questions/what-runs-the-checks-on-every-change.md) at
M2. The server's tests bind a local port, and the docs checker's tests need `python3`.

Then run the sections below for the part you changed. Tests passing is not evidence that it works. A
change that adds a way to run or observe something adds its section here.

## The server answers a route

```sh
pnpm start                               # node src/server/main.ts on 127.0.0.1:3000
curl -i http://127.0.0.1:3000/api/hello
curl -i http://127.0.0.1:3000/hello
HOST=localhost pnpm start
```

- `pnpm start`: after pnpm's own `$ node src/server/main.ts` line, every line is JSON, and the first
  has `"msg":"Server listening at http://127.0.0.1:3000"`. `HOST` and `PORT` change the address.
- `curl /api/hello`: `200`, `content-type: text/plain`, body `Hello!`. Stdout gains an
  `incoming request` line and a `request completed` line with the same `reqId`, the second carrying
  `responseTime`.
- `curl /hello`: `404` with a JSON body. Every route lives under `/api/`, per
  [ADR-0041](docs/decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md),
  and the server refuses to start if a route is registered anywhere else.
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

Can't observe: systemd stopping the process on the Droplet, per
[ADR-0044](docs/decisions/0044-the-server-runs-as-systemd-services-without-containers.md). Nothing is
deployed yet.

## A browser shows the server's answer

The client asks the server for `/api/hello` on its own origin, per
[ADR-0040](docs/decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md). Both
Vite servers send every path under `/api/` to the server at `http://127.0.0.1:3000` and answer every
other path themselves. Run the server in one terminal and one of the Vite servers in another:

```sh
pnpm start                               # the API, on 127.0.0.1:3000
pnpm dev                                 # http://localhost:5173/, live reload
pnpm build && pnpm preview               # dist/client/ at http://localhost:4173/
curl -i http://localhost:5173/api/hello             # or :4173 for preview, in each curl here
curl -i http://localhost:5173/api/does-not-exist
curl -i http://localhost:5173/apidocs               # also / and /api
curl -i http://localhost:5173/hello                 # differs between dev and preview
grep -o '.\{12\}/api/hello.\{2\}' dist/client/assets/*.js
```

Then stop `pnpm start` and reload the page, and start it again with `PORT=3001` and reload once more.

- Either address: the page shows "Hello!", which it fetched from `/api/hello` on the same origin. The
  served document's `#root` is empty until the answer arrives. The only console error is a 404 for
  `/favicon.ico`, which does not exist.
- `curl /api/hello`: the server's `200 text/plain` `Hello!`, and the server's stdout logs the request
  with its path unchanged. An unknown path under `/api/` gets the server's `404` JSON.
- `curl /apidocs`: the entry document with a `200`, as do `/` and `/api`. A key of `/api/` does not
  take them.
- `curl /hello`: in `pnpm dev`, `200 text/javascript`, because the dev server serves
  `src/client/hello.ts` for it (see [docs/gotchas.md](docs/gotchas.md)); in `pnpm preview`, the entry
  document. Neither reaches the server.
- With the server stopped: the page stays empty, `/api/hello` gets a `502`, the Vite terminal logs
  `http proxy error: /api/hello` with `ECONNREFUSED 127.0.0.1:3000`, and the browser console logs
  `the greeting could not be shown` with `{kind: "error-status", status: 502}`. A server started on
  another port gets the same `502`, because the proxy target is fixed until
  [how is the app run locally the way it runs deployed?](docs/questions/how-is-the-app-run-locally-the-way-it-runs-deployed.md)
  settles how the two processes find each other.
- `dist/client/index.html` loads one script, `assets/index-<hash>.js`. The `grep` finds
  `` `/api/hello` `` with no scheme or host in front of it.

Can't observe: how production serves the files and routes `/api/`, which is open in
[what serves the client's files in production?](docs/questions/what-serves-the-clients-files-in-production.md);
`pnpm preview` is the closest mode, not the production-like run. Nor whether the built script
parses on a browser at the floor, since nothing here runs one; that check is owed at M2.

## In the Claude Code sandbox

`.claude/settings.json` allows binding local ports, which the server's tests and both client servers
need.

pnpm needs two user-level sandbox settings, or it hangs without output when it fetches from the
registry: `enableWeakerNetworkIsolation: true`, so it can verify TLS certificates through macOS, and
`~/Library/pnpm` and `~/Library/Caches/pnpm` in `filesystem.allowWrite`, or it builds a second store
under `node_modules/`.

## References

- [Fastify guides](https://fastify.dev/docs/latest/Guides/)
