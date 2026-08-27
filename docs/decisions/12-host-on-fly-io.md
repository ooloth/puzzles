# Host on Fly.io

Status: Decided

## Context

- `docs/decisions/03-use-sqlite-as-the-data-store.md` requires persistent local disk on a single instance — this rules out ephemeral/serverless platforms (Cloud Run, Cloudflare Workers) outright, regardless of their pricing.
- Solo maintainer, dislikes Kubernetes-grade ops complexity, fine with lightweight/GitOps-friendly scripting.
- Extensively researched and compared, with current (2026) real numbers: Hetzner VPS (~$4.59/mo for 2vCPU/4GB), Google Compute Engine e2-micro Always Free (~$3-4/mo once its external-IPv4 fee is counted, but locked to 3 US regions with real GCP console/tooling complexity and a tighter compute ceiling), DigitalOcean and Linode/Akamai (~$24/mo for equivalent specs to Hetzner — a ~5x premium not justified by any capability gap relevant here), and Fly.io.
- Fly's default per-app billing model scales roughly linearly per deployable (no bundling discount across apps) — a real downside if a multi-app future materializes, but that future was assessed as speculative, not a near-term plan, so it doesn't drive this decision.
- The web app and puzzle-generator binaries (`04-separate-puzzle-generation-from-serving.md`) can be colocated on one Fly Machine sharing one volume — Fly volumes are single-attach (not shared across machines without LiteFS), but colocating both binaries on the same machine sidesteps that limitation entirely and preserves the "same SQLite file" design without adding LiteFS.
- Fly's shared-cpu-1x tier carries a real, non-hypothetical risk of intermittent high CPU steal — community reports describe sustained 70%+ steal on some hosts, sometimes requiring a free destroy-and-reclone to land on a less congested host. This shows up as request latency/jitter, and could trip a health-check timeout under sustained steal, though it's not typically a direct connection drop.

## Decision

- Host on Fly.io: one `shared-cpu-1x` Machine (256MB to start, bumpable), colocating the web-app and puzzle-generator binaries on that one machine with one small attached volume.
- Use a shared (not dedicated) IPv4, and disable scheduled volume snapshots (`--scheduled-snapshots=false`) — Litestream is the real backup mechanism (see `13-back-up-sqlite-with-litestream.md`), making Fly's own billed snapshots redundant.
- Treat a self-hosted VPS (Hetzner) as the explicit upgrade path if Fly's tradeoffs become unfavorable over time — e.g. generation workloads outgrow shared-cpu-1x's compute ceiling, shared-CPU flakiness proves a persistent problem, or a genuinely multi-app future materializes and needs true cost amortization across unrelated apps.

## Rationale

- Cheapest viable option found once optimized (~$2.40-3/mo), undercutting Hetzner (~$4.59/mo) and even GCE's "free" tier once its external-IP fee and tooling-complexity cost are counted.
- Retains real managed benefits a bare VPS doesn't give for free: TLS, health-checked restarts, and free built-in Prometheus/Grafana.
- Colocating the two binaries avoids Fly's volume-sharing limitation entirely, with no LiteFS complexity.
- Shared-CPU risk has cheap mitigations available before a costly upgrade is needed: monitor Fly's free dashboard for steal time, destroy-and-reclone as a free first attempt, and only move to `performance-1x` (a real 3-10x cost jump) if that proves insufficient.

## Tradeoffs accepted

- Real, non-zero shared-CPU flakiness risk at hobby scale — accepted as monitorable and cheaply mitigable rather than a blocker.
- Colocating genuinely unrelated future apps on Fly (if a multi-app future becomes real) would erode most of what makes Fly worth paying for — independent per-app deploy, TLS, and observability. Not solved now; the VPS upgrade path exists partly to address that scenario if and when it's real.
- One Machine + one volume has zero hardware-failure redundancy — the same single-point-of-failure exposure any single VM has, Hetzner included. Litestream backups cover data loss, not downtime.

## Rejected

- **Hetzner VPS now**: more compute headroom and simpler tooling, but costs more than the optimized Fly config and takes on full ops ownership (patching, TLS setup, monitoring) with no managed offset. Kept as the explicit future upgrade path instead of the initial choice.
- **GCE e2-micro Always Free**: cheaper-looking on paper, but GCP console/tooling complexity and a tighter compute ceiling — relevant given Rust's own justification (`02-use-rust-for-the-backend.md`) is future compute-heavy generation work — outweighed the marginal savings over optimized Fly.
- **DigitalOcean / Linode**: ~5x Hetzner's cost for equivalent specs, without a capability gap that justifies it here.
- **Google Cloud Run / Cloudflare Workers+D1**: architectural mismatches — ephemeral filesystem and a 60-minute hard request timeout (Cloud Run), or no persistent process or real SQLite file at all (Workers+D1) — incompatible with the already-decided shape in ADRs 01-04.
- **Coolify on a VPS**: adds a second control-plane to maintain; only pays off with a real multi-app future, which is currently speculative, not current.
