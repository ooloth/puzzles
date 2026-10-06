---
number: 0054
status: accepted
date: 2026-10-05
---

# 0054 — The maintainer's SSH key is held in 1Password's agent

## Forced by

- [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md): the server is a bare Droplet, which
  brings no way onto it of its own, so how the maintainer gets a shell is ours to choose.
- [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) and
  [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md): that machine
  will hold the last copy of a player's work, so whoever gets a shell on it can reach every player.
- [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md): the
  DigitalOcean account is signed into through GitHub, whose passkey and recovery codes are held in
  1Password, so the 1Password account already reaches a root shell through the recovery ISO.
- The maintainer, 2026-10-05: they work from one MacBook Air, use 1Password, and have no hardware
  security key.

## Scored against

Derived from the moments a credential takes part in: the maintainer opening a shell from the Mac,
needing in after the Mac is lost or replaced, something running as the maintainer on the Mac, an
account that holds the credential being taken over, and years of keeping it.

1. Nobody but the maintainer, and a deploy acting for them, can get a shell. Two conditions are
   scored separately: something running as the maintainer on the Mac cannot take the credential off
   it; and taking over an account the credential depends on gives no shell that the DigitalOcean
   account does not already give
   ([ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md); the portable security
   standard's authentication rule).
2. Losing or replacing the Mac does not take the way in with it, short of the way back after a
   lockout (the maintainer works from one machine, stated 2026-10-05, and the portable
   decision-making standard's maximum safety).
3. One command from the Mac reaches the machine, knowing nothing beyond its name (the maintainer's
   "it just works" and "it's so easy" in
   [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)).
4. The least to configure and keep working over years (property 13 of
   [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)).
5. Nothing to buy or carry beyond the Mac: the maintainer's stated preference, 2026-10-05.

**Resources.** None binds: a login is one connection and a signature, on the Mac.

**Maximums.** Maximum safety is a credential that cannot leave the device holding it, survives that
device's loss, and depends on no account beyond the ones that already reach the machine. Maximum
experience is `ssh` with nothing to remember. A Secure Enclave or FIDO key cannot leave its device;
1Password's can, but only to someone who already has an account that reaches a root shell, so the
difference is not one the machine can feel.

## Decision

**The maintainer's SSH key is generated in 1Password and used through 1Password's SSH agent. Only its
public half is on the machine.**

- **Why 1Password rather than a key that cannot be exported.** 1Password lets anyone with the
  unlocked app export the key, which a Secure Enclave or FIDO key prevents. That difference protects
  nothing here: whoever has the 1Password account already has the DigitalOcean account, and one use
  of any credential that opens a shell can add a key to `authorized_keys`, so a key used once by the
  wrong person is as bad as one exported. The maintainer made that objection on 2026-10-05.
- **What it keeps.** On a new Mac, the key is there once 1Password is signed in. A Secure Enclave key
  would be gone with the old Mac.
- **The agent's approval setting stays at 1Password's default**, "For each new application". Asking
  for every request is the only setting that stops a process started from an already approved
  terminal from using the key, at the cost of a Touch ID prompt on every SSH connection and every
  `git` operation over SSH. The maintainer chose the default on 2026-10-05: a script running in that
  terminal can also change the code the next deploy ships, so the prompt closes one route of several.

The working, including a spike on a Droplet, is in
how is the server reached and hardened? (read with `git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`).

**What this does not settle:**

- **Which account the maintainer logs in as, and whether `sudo` asks for a password.** That is
  [ADR-0059](0059-the-maintainer-logs-in-as-a-named-user-whose-sudo-asks-for-no-password.md), and `root` does not log in over SSH, per
  [ADR-0058](0058-root-does-not-log-in-over-ssh.md).
- **The deploy's credential.** That is [what deploys the code?](../questions/what-deploys-the-code.md).

## Enforced by

**Nothing yet.** It is true once M1 slice 4 creates the Droplet with this key's public half attached.
[../../CONTRIBUTING.md](../../CONTRIBUTING.md) gains the `IdentityAgent` line that points `ssh` at
1Password's agent when slice 4 adds the section on reaching the machine, with `IdentityFile` naming
the key's public half and `IdentitiesOnly yes`: `sshd` allows six attempts by default, and an agent
offering more keys than that is refused with "Too many authentication failures", per 1Password's
docs as read by a research agent. Nothing checks that the key on the machine is the one in
1Password.

## Rejected

- **A key file in `~/.ssh` on the Mac** fails property 1, its first condition: anything running as the
  maintainer reads the file, and uses the passphrase wherever the Keychain or an agent holds it.
  **Reverses if** something running as the maintainer on the Mac stops counting as a threat, which no
  record says.
- **A user certificate from a CA the maintainer holds** fails property 4. It is a layer on another
  option rather than an alternative, since the CA's private key has to be held as a file, in
  1Password or in the Secure Enclave, and takes that option's verdicts. With one person and one
  machine it adds configuration that nothing rewards. **Reverses if** several people or machines
  need access. A *host* certificate is a different matter and is open in
  [what deploys the code?](../questions/what-deploys-the-code.md).
- **Tailscale SSH** fails property 1, its second condition: taking over the Tailscale account, or the
  identity provider behind it, grants a shell. **Reverses if** that account is accepted as part of
  the root of trust beside DigitalOcean's.
- **A key bound to the Mac's Secure Enclave**, for example through Secretive, fails property 2:
  "they are not able to be backed up, and you will not be able to transfer them to a new machine",
  per [its README](https://github.com/maxgoedjen/secretive), so a new Mac gets in only through the
  way back after a lockout. **Reverses if** 1Password stops holding the DigitalOcean sign-in, which
  would make 1Password a second account under property 1.
- **A FIDO key on a hardware authenticator** ties with 1Password on every technical row and fails
  property 5: it costs $29 or more, a second `ssh` ahead of Apple's in `PATH`, and a device to carry,
  and the maintainer prefers not to. **Reverses if** the maintainer decides to buy and carry one.
- **Not yet** — the Droplet is on the public internet from slice 4, so it needs a credential then.

## Risk

- **1Password is one root of trust for both the DigitalOcean account and the machine.** That was
  accepted on 2026-09-30, in the runbook, and this record leans on it.
- **This rests on a runbook step not yet taken.** [../unfinished.md](../unfinished.md) records that
  the GitHub passkey does not exist yet, so until it does, 1Password does not yet hold the
  DigitalOcean sign-in this record's argument relies on.
- **A process started from an approved terminal can use the key** until 1Password locks or the
  terminal quits, under the default approval setting.
- **If 1Password is unavailable, so is the way in.** The way back after a lockout keeps its password
  in 1Password too.

## Revisit when

- 1Password stops holding the DigitalOcean sign-in.
- The maintainer works from a second machine routinely, or acquires a hardware security key.
- A process on the Mac is found to have used the key without the maintainer.

## Also update

- [x] questions/README.md: slice 4 gains this record as a **Given**; its **Must answer** on access
      and hardening stays until parts B and D land
- [x] questions/how-is-the-server-reached-and-hardened.md: part A is settled here; the question
      was deleted when its last part was recorded, in [ADR-0059](0059-the-maintainer-logs-in-as-a-named-user-whose-sudo-asks-for-no-password.md)'s change
- [x] architecture.md: nothing; no code reaches the machine yet
- [x] constraints.md: nothing new
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing yet; the section on reaching the machine arrives with slice 4
