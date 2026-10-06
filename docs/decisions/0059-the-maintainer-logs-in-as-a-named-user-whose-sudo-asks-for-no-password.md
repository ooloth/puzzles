---
number: 0059
status: accepted
date: 2026-10-05
---

# 0059 — The maintainer logs in as a named user whose sudo asks for no password

## Forced by

- [ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md): a
  password kept for the Recovery Console has to sit on an account on the machine.
- [ADR-0058](0058-root-does-not-log-in-over-ssh.md): `root` does not log in over SSH, so the
  maintainer's login is some other account.
- [ADR-0054](0054-the-maintainers-ssh-key-is-held-in-1passwords-agent.md): the maintainer's key is in
  1Password, and 1Password already holds the DigitalOcean sign-in, which reaches a root shell through
  the recovery ISO.
- The maintainer, 2026-10-05: Touch ID would be welcome where a second check is asked, and a typed
  password would mean looking up which 1Password item holds it.

## Scored against

Derived from the moments root is used: the maintainer working on the machine, a deploy run by hand,
a recovery on the console, something running as the maintainer on the Mac that rides an SSH session
already approved, and a reset of the root password.

1. A second check before root stops something that rides a session the maintainer already approved
   on the Mac, or it is not worth asking for (the portable decision-making standard: a benefit is
   weighed net of what the system already owes).
2. The maintainer's login keeps working after a reset of the root password
   ([ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md)'s
   way back, and the spike's observation in its Rejected).
3. Each use of root asks for nothing the maintainer has to look up (the maintainer's "it just works"
   in [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)).
4. Nothing on the path that authorises root is a package nobody actively maintains
   ([ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md),
   and the portable security standard's Should that dependencies are well maintained).

**Resources.** None binds.

## Decision

**The maintainer logs in over SSH as a named user in the `sudo` group, whose `sudo` asks for no
password. That user holds the password
[ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md) keeps
for the Recovery Console, which is needed only there.**

- **Why no second check.** Whoever has the 1Password account already reaches a root shell, so a check
  guards only against something running as the maintainer on the Mac that uses an approved session.
  A typed or pasted password does not stop that: it can read the password as it is typed, or call
  `op read` in a terminal already authorised. A Touch ID prompt for `sudo` does stop it, but only
  through `pam_ssh_agent_auth` with 1Password asking on every request, and that module is maintained
  by Debian's QA group alone, with upstream's last release in 2020.
- **Which password to look up, and when.** One 1Password item holds it, named for the Droplet and the
  user, and the lockout runbook names it. It is looked up only on the Recovery Console.
- **`sudo` commands are recorded** in the journal by user, terminal and command line, as observed on
  a Droplet on 2026-10-05.

The working is in how is the server reached and hardened?, part D, read with
`git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`.

**What it commits us to:** the user and its `sudo` rule are written by cloud-init, and the account's
name is the implementer's.

## Enforced by

**Nothing yet.** It is true once M1 slice 4's cloud-init creates the user. Nothing checks that its
`sudo` rule stays as written.

## Rejected

- **`root` holds the console password, and the maintainer logs in as `root`** fails property 2: on
  the spike Droplet, a reset of the root password expired `root`'s password and every key login as
  `root` then failed until it was changed on the console. It is also closed by
  [ADR-0058](0058-root-does-not-log-in-over-ssh.md). **Reverses if** that record is reversed and the
  reset stops expiring the password.
- **`sudo` asks for the user's password, typed from 1Password** fails property 3: a lookup every 15
  minutes of `sudo`, Debian's default, for a check that fails property 1's purpose. **Reverses if**
  a second check comes to guard something 1Password does not already reach.
- **`sudo` fed from `op read`**, the 1Password CLI, fails property 3 for the same reason: a step on
  every use, against something that can call `op read` in the same terminal. **Reverses if** the same.
- **`sudo` authorised through 1Password's agent by `pam_ssh_agent_auth`** fails property 4:
  `libpam-ssh-agent-auth` 0.10.3-11 in Debian 13 is maintained by the "Debian QA Group", per
  [packages.debian.org](https://packages.debian.org/trixie/libpam-ssh-agent-auth), and it would
  prompt only with 1Password set to ask for every request, which the maintainer declined in
  [ADR-0054](0054-the-maintainers-ssh-key-is-held-in-1passwords-agent.md). **Reverses if** a
  maintained module, such as the Rust `pam-ssh-agent`, reaches Debian's archive.
- **Not yet** — the Droplet needs a login from slice 4.

## Risk

- **The maintainer's key is root.** Anything that can use the key, including a process started from a
  terminal 1Password has approved, has root on the machine.
- **A password exists on the machine.** It is refused over SSH, per
  [ADR-0057](0057-ssh-accepts-only-keys-and-a-firewall-on-the-machine-admits-only-ssh-http-and-https.md),
  and its hash is readable by any process the link-local block does not cover, per
  [ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md).

## Revisit when

- A maintained module that authorises `sudo` through an SSH agent reaches Debian's archive.
- Something other than the maintainer needs a shell on the machine.
- 1Password stops holding the DigitalOcean sign-in, which would give a second check something to guard.

## Also update

- [x] questions/README.md: slice 4 loses its **Must answer** on access and hardening and gains this
      record as a **Given**
- [x] questions/how-is-the-server-reached-and-hardened.md: worked file committed in `5dc67af`, then
      deleted in this change; its findings moved out in `5dc67af`, and its property list moves to
      [what deploys the code?](../questions/what-deploys-the-code.md)
- [x] [ADR-0054](0054-the-maintainers-ssh-key-is-held-in-1passwords-agent.md) to
      [ADR-0057](0057-ssh-accepts-only-keys-and-a-firewall-on-the-machine-admits-only-ssh-http-and-https.md):
      their links to the deleted question read it from git
- [x] architecture.md: nothing
- [x] constraints.md: nothing
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing yet; reaching the machine arrives with slice 4
