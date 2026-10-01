Custom lint scripts we'll need to wire up to precommit, CI etc.

Likely the future home for system admin/ops scripts as well.

May be reorganized - for now a default home for helper scripts is all we need.

`check-docs.py` is in Python, which [ADR-0030](../docs/decisions/0030-typescript-outside-the-browser-runs-on-node.md) rules out for repo scripts. Its rewrite in TypeScript is issue #2. Don't add another Python script.
