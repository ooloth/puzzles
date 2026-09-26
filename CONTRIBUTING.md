# Development

The commands for running and checking the system, as far as it exists. What correct output looks
like for each is in [docs/verification.md](docs/verification.md).

## Setup

Node on the line [ADR-0031](docs/decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md)
names, which is 26 today. pnpm switches itself to the version `packageManager` in `package.json`
names.

```sh
pnpm install
```

## Run the client

- `pnpm dev` serves the client with live reload at http://localhost:5173/.
- `pnpm build` writes the built client to `dist/client/`.
- `pnpm preview` serves `dist/client/` at http://localhost:4173/, as it would ship.

Either address shows "Hello!". The client does not call the server yet.

## Run the server

- `pnpm start` listens on `127.0.0.1:3000`. Set `HOST` and `PORT` to change it.
- `curl -i http://127.0.0.1:3000/hello` (or `http :3000/hello`) answers `200` with `Hello!`

## Check a change

Run all three before committing. Nothing runs them automatically yet.

- `pnpm test` runs every `*.test.ts` under Node's test runner: the server's tests and the client
  build's tests.
- `pnpm typecheck` checks the server, the client and the build config, each against its own
  `tsconfig.json`.
- `python3 scripts/check-docs.py` checks `docs/` for broken links, missing index entries and
  frontmatter.

Then run the part you changed, using the commands above, and compare it with
[docs/verification.md](docs/verification.md). Tests passing is not evidence that it works.

## In the Claude Code sandbox

`.claude/settings.json` allows binding local ports, which the server's tests and both client servers
need.

pnpm needs two user-level sandbox settings, or it hangs without output when it fetches from the
registry: `enableWeakerNetworkIsolation: true`, so it can verify TLS certificates through macOS, and
`~/Library/pnpm` and `~/Library/Caches/pnpm` in `filesystem.allowWrite`, or it builds a second store
under `node_modules/`.

## References

- [Fastify guides](https://fastify.dev/docs/latest/Guides/)
