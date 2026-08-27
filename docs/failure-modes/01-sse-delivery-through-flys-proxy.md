# SSE delivery could be delayed or buffered through Fly's proxy

## Risk

Datastar's entire transport is server-sent events (`docs/decisions/01-render-with-datastar-hypermedia.md`). Fly is the chosen host (`docs/decisions/12-host-on-fly-io.md`) and its edge proxy has documented behavior that can silently delay or buffer streaming responses — directly threatening the "world-class, zero-lag" UX priority for anything that rides this transport, even though not everything does (ephemeral interaction state stays local via Datastar's signals).

Investigated in depth rather than assumed away — verdict: not a fundamental incompatibility, but three distinct, real issues each with a known fix, plus one open implementation detail that needs empirical verification.

## Three distinct causes, three distinct fixes

1. **Proxy-side compression buffering.** Fly's proxy buffers a response before compressing it, which breaks streaming. Per Fly's own docs: "The proxy only compresses responses that don't already include a `Content-Encoding` header. If your app sets one, the proxy passes the response through unmodified." So there are two valid paths, not a conflict with Datastar's own compression guidance:
   - Set `Content-Encoding: none` on the SSE response — guarantees no buffering, at the cost of zero compression.
   - Compress at the origin yourself (e.g. Brotli, streamed with a per-chunk flush) and set `Content-Encoding` explicitly — Fly's proxy then passes it through untouched, realizing Datastar's Tao-of-Datastar argument (~200:1 Brotli compression ratios justifying "fat morph" full-page fragments over minimal diffs) without triggering Fly's buffering behavior.
   - This failure mode is not Fly-specific — the same buffer-to-compress behavior exists in Nginx, Cloudflare, and Envoy.

2. **iOS/WebKit + HTTP/2 delay.** Narrow: isolated specifically to the fly-proxy × iOS-WebKit-over-HTTP/2 combination (desktop Chromium, curl, and the same iPhone on a different network path were all instant; AWS ALB with WebKit also worked fine, ruling out WebKit alone). No platform-level fix from Fly as of this writing. Confirmed workaround: restrict that endpoint to HTTP/1.1 (ALPN restriction), losing HTTP/2 only for that one endpoint.

3. **~60s idle-connection kills.** Fly's proxy terminates connections it judges idle (`error.code=2004 "App connection idle"` → 502) after roughly a minute of no bytes sent. This is standard SSE hygiene any host requires, not a Fly deficiency. Fix: periodic heartbeat/comment ping (e.g. `: heartbeat\n\n`) every 15-30s.

## Open item — needs empirical verification, not assumed

Whether `tower-http`'s `CompressionLayer` (or a hand-rolled Brotli encoder) actually flushes per-SSE-event rather than buffering internally at the compression-algorithm level before emitting output. Brotli's own window/dictionary behavior can introduce buffering independent of the HTTP layer, separate from the proxy-level buffering issue above. Untested claim — verify with a real streaming benchmark once the SSE handler exists, before relying on it for the "fat morph" compression strategy.

## When to verify

Early — build a real SSE spike/prototype deployed to Fly before building UI extensively on top of it, per the project's stated preference for empirical verification over assumption. Test on real iOS Safari specifically (not just simulators/desktop) given issue #2 above.

## Baseline implementation requirements (not optional hardening — bake in from the start)

- Set `Content-Type: text/event-stream` (per Datastar's own guidance).
- Decide and set `Content-Encoding` explicitly (`none`, or a streaming-safe compressor) rather than leaving it to Fly's default behavior.
- Implement periodic heartbeat pings on every SSE connection.
- Be ready to force HTTP/1.1 for the SSE endpoint specifically if iOS/WebKit delay is observed during real-device testing.
