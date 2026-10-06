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

Shared with [how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md),
whose list was derived on 2026-10-05. The moments here are the maintainer's login, a deploy's login,
a reset of the root password, the recovery ISO importing keys, and a rebuild. The rows that bear on
this question, by that list's numbers:

1. Nobody but the maintainer, and a deploy acting for them, can get a shell.
4. A lockout has a way back that does not need a network route.
5. A credential reaches only what its holder needs, and a deploy's can do less than the maintainer's.
7. Every login leaves a record the maintainer can read afterwards.
8. A rebuilt machine and the local run carry the same access configuration, with no step by hand.
15. The access configuration lives in one place in the repository.

**Resources.** None binds.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-10-06 while drafting the records for
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md): the draft for
the login account would have set `PermitRootLogin no` as though it followed, and it does not.

## Options

*Leave DigitalOcean's default.* `root` accepts the key attached at creation, beside the named user.

*`PermitRootLogin no`*, in the same `sshd` drop-in that refuses passwords. `sshd` refuses `root`
before it authenticates. The key stays in `root`'s `authorized_keys`, which the recovery ISO does not
read: it imports the keys attached at creation from DigitalOcean.

*`disable_root: true` in our user-data*, overriding DigitalOcean's vendor-data. cloud-init then puts a
forced command before `root`'s key that prints a message and ends the session, so the key still
authenticates and the login is cut off afterwards. *From cloud-init's docs, read by a research agent
on 2026-10-05; not run.*

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

**The drop-in wins over the image's `PermitRootLogin yes`.** The image's `/etc/ssh/sshd_config` has
`Include /etc/ssh/sshd_config.d/*.conf` on line 12 and `PermitRootLogin yes` on line 33, and `sshd`
uses the first value it reads.

*Read on the spike Droplet, 2026-10-06. That the first value wins is from sshd_config(5).*

### First pass, 2026-10-06

**No technical row separates the options.** `root` would log in with the same key as the named user,
whose `sudo` asks for nothing, so either way the holder of that key has root. Each option passes 1,
5, 8 and 15 alike.

- **7, zoomed** to what the record shows of a session as root: under the named user, `sudo` logs each
  command, but `sudo -i` logs only that, and a direct `root` login is recorded as a login. Someone
  with the key can reach an unrecorded root shell under every option, so the zoom separates nothing.
- **4:** the spike showed that resetting the root password breaks key login as `root`. That matters
  only to something that relies on `root` logging in, and nothing here does.
- **`disable_root: true`** differs from `PermitRootLogin no` only in where the login is refused: the key
  still authenticates and the session is cut off afterwards, so the journal records
  `Accepted publickey for root`. That is a difference in how the record reads, not in who gets in.

**Extended to softer rows.** [../problem.md](../problem.md) gives a system "whose operation is worth
describing to someone hiring for it" as one of the maintainer's three reasons, and closing `root` to
SSH is what a reviewer would expect to see. The same file guards that reason: "Would this component
still be worth building if its demonstration value were zero?" Here it is one line that changes no
technical row, so the guard neither rules it in nor out.

**So this is the maintainer's to decide**, as a stated preference, between leaving DigitalOcean's
default and adding `PermitRootLogin no` to the drop-in that already refuses passwords.

**What it forecloses.** A deploy that logs in as `root` with a key restricted by a forced command was
a candidate for [what deploys the code?](what-deploys-the-code.md). Closing `root` would remove it. Reopening
it costs one line in the drop-in, `PermitRootLogin forced-commands-only`, so the asymmetry is small,
and a deploy can instead log in as its own user with limited `sudo`, which that question already
lists.
