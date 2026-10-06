---
number: 0058
status: proposed
date: 2026-10-06
---

# 0058 — Root does not log in over SSH

## Forced by

- DigitalOcean's `debian-13-x64` image lets `root` log in with the key attached at creation: on a
  Droplet on 2026-10-06, `sshd -T` reported `permitrootlogin yes`, from line 33 of the image's
  `sshd_config`, and DigitalOcean's vendor-data makes `root` the default user.
- [ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md):
  the key has to be attached at creation, because the recovery ISO imports only those keys, so it
  lands in `root`'s `authorized_keys` whatever is decided here.
- [ADR-0054](0054-the-maintainers-ssh-key-is-held-in-1passwords-agent.md): the maintainer has one
  key, so a `root` login would use the same key as their own login.

## Scored against

Derived from the moments `root` could take part in: the maintainer's login, a deploy's login, a reset
of the root password, the recovery ISO importing keys, and a rebuild.

1. Nobody but the maintainer, and a deploy acting for them, can get a shell (the portable security
   standard's authentication rule).
2. A credential reaches only what its holder needs, and a deploy's can do less than the maintainer's
   (the portable security standard's least privilege).
3. Every login leaves a record the maintainer can read afterwards (the portable decision-making
   standard's maximum safety).
4. A rebuilt machine and the local run carry the same access configuration, with no step by hand
   ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
   [ADR-0049](0049-the-droplet-runs-debian-13.md)).
5. The access configuration lives in one place in the repository (the same records).
6. The maintainer has one login to know, and nothing they might rely on is broken by a recovery
   step: the maintainer's stated preference, 2026-10-06.

**No technical row separated the options.** `root` would log in with the same key as the named user,
whose `sudo` gives root, so the holder of that key has root under every option, and every option
passes 1 to 4 alike. Property 6 is what decides it, and it is a preference rather than a derivation.

**Resources.** None binds.

## Decision

**`sshd` refuses `root`, with `PermitRootLogin no` in the drop-in that
[ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md) has
cloud-init write before any password exists.** The drop-in wins over the image's
`PermitRootLogin yes`, because the image's `sshd_config` includes `sshd_config.d/*.conf` on line 12,
before line 33, and `sshd` keeps the first value it reads. The creation-time key stays in `root`'s
`authorized_keys`, unused.

The maintainer chose it on 2026-10-06. What it buys:

- **One login, so nothing breaks under a recovery step.** DigitalOcean's docs connect with
  `ssh root@…`, and on the spike Droplet a reset of the root password left `root`'s password expired,
  after which key login as `root` failed with "Password change required but no TTY available".
- **One line**, in a file that exists anyway, which the local run rehearses.
- **What a reviewer of the system expects to see.** [../problem.md](../problem.md) gives a system
  "whose operation is worth describing to someone hiring for it" as one of the maintainer's reasons,
  and its guard, whether this would be worth doing with no demonstration value, is met by the first
  two points.

The working is in how is the server reached and hardened? and can root log in over SSH?, read with
`git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md` and
`git show 5dc67af:docs/questions/can-root-log-in-over-ssh.md`.

**What it forecloses.** A deploy logging in as `root` behind a forced command, which was a candidate
for [what deploys the code?](../questions/what-deploys-the-code.md). Reopening it is one line,
`PermitRootLogin forced-commands-only`, and a deploy can log in as its own user with limited `sudo`
instead.

## Enforced by

**Nothing yet.** It is true once M1 slice 4's cloud-init writes the drop-in. A check that `sshd -T`
reports `permitrootlogin no` in the local run and on the Droplet would hold it. It does not exist.

## Rejected

- **DigitalOcean's default, `root` accepting the creation-time key** fails property 6: a second login
  the maintainer does not need, which a reset of the root password breaks. **Reverses if** something
  the system needs comes to log in as `root`.
- **`disable_root: true` in our user-data** fails property 5: it refuses `root` in cloud-init's
  configuration, apart from the `sshd` drop-in that holds every other login rule, and it does so after
  the key has authenticated, so the journal records `Accepted publickey for root` for a session that
  never ran. **Reverses if** the `sshd` drop-in stops being where login rules live.
- **Not yet** — the default lets `root` in from slice 4.

## Risk

- **No property forced this.** It rests on a stated preference, and a later reader who disagrees
  loses nothing technical by reversing it.
- **`root`'s `authorized_keys` still holds the key.** If `PermitRootLogin` were ever changed, that key
  would let `root` in at once.

## Revisit when

- A deploy or a tool needs to log in as `root`.
- DigitalOcean's image stops putting the creation-time key into `root`'s `authorized_keys`.

## Also update

- [x] questions/README.md: slice 4 loses its **Must answer** on whether `root` can log in and gains
      this record as a **Given**
- [x] questions/can-root-log-in-over-ssh.md: worked file committed in `e1aa974`, then deleted in this
      change; nothing in it is left for another question
- [x] questions/what-deploys-the-code.md: links this record for the deploy candidate it removes
- [x] architecture.md: nothing
- [x] constraints.md: nothing
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing
