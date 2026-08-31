---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What provides the build and dev server?

## Why it matters

[ADR-0004](../decisions/0004-a-component-framework-renders-the-client.md) rests primarily on the
inner loop being fast, and this is the component that delivers it. If the loop is slow, the
decision's main justification is not met by whatever implements it.

It is a separate question from which framework, because the two are less coupled than they appear:
most frameworks run under several toolchains, and a toolchain choice can be revisited without
rewriting the interface.

## Blocked by

N/A — nothing needs to be answered first, though a framework with a strongly implied toolchain
would narrow it.

## Blocks

N/A — nothing waits on this.

## What would settle it

Measuring the thing the decision was made for: cold start, save-to-visible-result on a warm
server, and how both behave as the project grows past a handful of files. Ecosystem maturity
matters too, since a toolchain that breaks on an ordinary dependency costs more than it saves.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out of the rendering question by ADR-0004.

## Options

...

## Findings

...
