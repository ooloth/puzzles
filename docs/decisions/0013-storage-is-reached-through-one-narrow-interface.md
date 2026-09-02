---
number: 0013
status: accepted
date: 2026-09-01
---

# 0013 — Storage is reached through one narrow interface

## Forced by

**[ADR-0003](0003-this-is-delivered-over-the-web.md) chose web delivery on the condition that
wrapping in a native shell stays cheap**, and recorded what that costs. Its correction is the
load-bearing part: wrapping does not by itself escape the storage eviction in
[../constraints.md](../constraints.md), because tracking prevention is on by default in every
`WKWebView`. Durability is recovered only when storage is routed through a native plugin instead of
the webview's own store — which is a swap of the implementation behind storage, and is only a swap
if there is one place to do it.

**[../constraints.md](../constraints.md) records that a write can fail for reasons unrelated to
quota, and that the error misidentifies its own cause.** Handling that correctly means detecting the
store's absence, never branching recovery on an error's name, and never treating a rejected write as
self-resolving. Those are behaviours, and behaviours scattered across every call site are behaviours
implemented differently in each one.

**This record exists because that decision was made inside ADR-0003 and never given a title.** It sat
in a section outside that record's Decision, Rejected and Risk headings, under a record that
announces it "decides the delivery platform and nothing else". Nobody scanning
[../decisions/](../decisions/) would have found it.

## Decision

**Everything that reads or writes persistent client storage goes through one module, and nothing
else in the codebase reaches around it.** One interface, one implementation behind it at a time.

That module is the only place that knows which storage mechanism is in use, the only place that
handles a failed write, and the only place that has to change when either of those changes.

**It says nothing about which mechanism.** IndexedDB, the Cache API, something else, or a native
plugin behind a wrapper — [which client storage mechanism holds a player's
work?](../questions/which-client-storage-mechanism.md) is open and stays open. This decides that
whatever wins is reachable from one place.

**It is about the boundary, not the shape of what crosses it.** What is stored, and whether it is a
snapshot or an event log, is [its own
question](../questions/is-puzzle-state-a-snapshot-or-an-event-log.md).

## Rejected

- **Call the storage API where it is needed.** The ordinary thing, and cheaper at every individual
  call site — no indirection, no interface to keep in step, and the browser API is right there.
  Rejected on the two facts above: a native shell becomes a rewrite rather than a swap, and the
  failure handling that `../constraints.md` describes gets implemented separately at each site, with
  the sites nobody thought about silently swallowing rejections. That is the ordinary way progress
  is lost, not an exotic one.

- **A thin pass-through wrapper that mirrors the browser API.** The compromise: one module, but its
  interface is the storage API's interface. Rejected because it is the same decision with the cost
  and none of the benefit — an interface shaped like IndexedDB cannot be implemented by something
  that is not IndexedDB, so the swap it was built for is exactly the swap it prevents.

- **Decide it when a second implementation is needed.** The honest "not yet", and the point at which
  it is needed is a native shell or a mechanism change, both of which arrive with the code already
  written against the store. Retrofitting a boundary means finding every call site, and the ones
  that get missed are the ones that break quietly.

## Risk

**A boundary can be drawn and then leaked through.** Nothing here stops a module importing the
storage API directly, and no check in this repo can catch it yet. This is enforceable — a lint rule
restricting imports of the storage API to one path — and until that exists the decision holds only
while people remember it. Recording the enforceable form here is what makes writing it a task rather
than an idea.

**One interface for two very different implementations tends to be shaped like the first.** The
native-plugin case is hypothetical and the browser case is not, so the interface will be designed
against the browser and may fit the plugin badly. The mitigation is that the interface stays narrow;
the risk is that "narrow" is a judgement nobody can check.

**It buys optionality against a shell nobody has committed to.** ADR-0003 chose the web and named
wrapping as a recovery path rather than a plan. If that path is never taken, half the reason for
this was a tax paid for nothing — the failure-handling half stands regardless.

## Revisit when

- **A native shell is ruled out permanently.** The remaining case is failure handling, which is
  weaker on its own and might be met by something less than a full boundary.
- **The interface is found to be leaking**, per the risk above, at which point the answer is the
  lint rule rather than a restatement of this record.

## Also update

- [x] `0003-this-is-delivered-over-the-web.md` — the mandate is removed from its recovery-path
      section and cited here instead
- [x] Nothing in `constraints.md` — the facts this rests on are already recorded there
- [x] Nothing in `guarantees/` — this promises a player nothing directly, though
      `guarantees/durability.md` is what it exists to protect

Deliberately not decided here: which storage mechanism is used, what the interface's operations are,
what is stored, how failures are surfaced to the rest of the app, and whether a native shell is ever
built.
