---
opened: 2026-08-30
status: open
---

# What wins when correctness and latency conflict?

**Why it matters** The most consequential gap in the priority ranking. A fast local answer
that a fuller check would contradict is exactly the failure that hurts most here: a late error
invalidates the reasoning a player has already built on top of it. Being told at move three
that move one was wrong is worse than a slower answer at move one.

**Gates** the priority ranking in `problem.md`, validation architecture.
