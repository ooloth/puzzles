---
opened: 2026-10-06
status: open
resolves_into: decision
---

# Can root log in over SSH?

## Why it matters

**The maintainer logs in as a named user, and nothing has said whether `root` can log in too.**
[How is the server reached and hardened?](how-is-the-server-reached-and-hardened.md) found that the
maintainer logs in as a named user whose `sudo` asks for nothing. DigitalOcean's image puts the key
attached at creation into `root`'s `authorized_keys` and sets `PermitRootLogin yes`, so as created,
`root` also accepts that key. The key has to be attached at creation, because the recovery ISO imports
only keys "added to the Droplet at the time it was created". So the default leaves a second login, as
`root`, with the same key.

**It is separate from the login account.** A reasonable person could log in as a named user day to
day and keep `root` open for a script, or close it. Settling it inside that answer would let it ride on
reasoning that never weighed it.

**Environments:** production and the production-like local run, per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
which boots the same cloud-init.

## What would settle it

Scoring the options against the properties in
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md), which this
question shares, and confirming on a Droplet what each option leaves in `sshd -T` and `root`'s
`authorized_keys` after cloud-init has run.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-10-06 while drafting the records for
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md): the draft for
the login account would have set `PermitRootLogin no` as though it followed, and it does not.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**As created, `root` accepts the creation-time key.** On `debian-13-x64` on 2026-10-06, `sshd -T`
reported `permitrootlogin yes`, from line 33 of the image's `/etc/ssh/sshd_config`, and the key
attached at creation logged in as `root`. DigitalOcean's vendor-data makes `root` the default user.

*Measured on the spike Droplet in
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md), one run.*

**Resetting the root password breaks key login as `root`.** After a reset from the control panel,
`root`'s password was expired, and SSH as `root` with the key failed with "Password change required
but no TTY available" until it was changed on the console.

*Measured, same run.*
