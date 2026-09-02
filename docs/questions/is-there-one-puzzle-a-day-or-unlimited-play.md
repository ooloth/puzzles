---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is there one puzzle a day, or unlimited play?

## Why it matters

Two genuinely different products. It changes what the generator is for, whether an archive
exists, whether streaks make sense, and whether "today" needs timezone handling.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**If "today" is a server date with no player timezone, adding per-player local days later means
recomputing every stored streak.** [Can more than one puzzle be published per
day?](can-more-than-one-puzzle-be-published-per-day.md) is the catalogue-shape half of the same
problem: what "today" means for looking a puzzle up and what it means for a streak are two
different timezone questions, not one.

**A daily rhythm is the only thing here that would justify interrupting anyone.** A message that
reaches a closed app — web push — requires an application server by construction; there is no
serverless form of it. Whether it is wanted turns on the answer here.

**Push works as a wake-signal rather than a data channel, and there is a decade-proven precedent.**
Cultured Code's Things Cloud does exactly this: a change on one device goes to their server, the
server asks Apple's push service to notify the others, and those devices then **pull** the data
themselves. Their wording is that Apple's "role in this process is only to deliver notifications, not
transmit the data itself." They use low-priority push, which allows up to ten minutes of latency
reaching a dormant device, and treat that as acceptable rather than as a defect.

So if a daily rhythm ever justifies a notification, the notification carries nothing. It says "there
is something new" and the client fetches it on its own terms — which also means the offline and
latency promises are untouched, because nothing about the app's behaviour depends on the message
arriving.

*Sourced — Cultured Code's Things Cloud "Nimbus" release post,
<https://culturedcode.com/things/blog/2015/08/things-cloud-nimbus-released/>, checked 2026-09-02.*
