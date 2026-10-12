---
number: 0062
status: accepted
date: 2026-10-12
---

# 0062 — The machine reboots at the hour once it has been up 14 days

## Forced by

- [ADR-0061](0061-a-dpkg-hook-runs-a-script-that-marks-the-machine-for-reboot-when-a-process-runs-replaced-code.md):
  the detector can be wrong in silence, and misses code it does not recognise.
- Nothing alerts on either until
  [how is the server operated?](../questions/how-is-the-server-operated.md) at M11.

## Scored against

1. A detector that stops working is noticed
   ([ADR-0061](0061-a-dpkg-hook-runs-a-script-that-marks-the-machine-for-reboot-when-a-process-runs-replaced-code.md)
   property 15).
2. Replaced code no detector recognises still leaves memory
   ([ADR-0061](0061-a-dpkg-hook-runs-a-script-that-marks-the-machine-for-reboot-when-a-process-runs-replaced-code.md)
   property 16).
3. A change that stops the machine booting is found soon after it lands
   ([ADR-0061](0061-a-dpkg-hook-runs-a-script-that-marks-the-machine-for-reboot-when-a-process-runs-replaced-code.md)
   property 17).
4. The machine reboots as few times a year as possible
   ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
   property 7).
5. Extra reboots are a cost the maintainer weighs as negative (stated 2026-10-12).

## Decision

**Before each daily update, a line in a drop-in for `apt-daily-upgrade.service` writes
`/var/run/reboot-required` if the machine has been up 14 days or more. `unattended-upgrades` then
reboots at the hour.** `unattended-upgrades` checks for the marker even on a day it upgrades
nothing, read in its 2.12 source.

Replayed against the 33 detected-update days of 2025-10-12 to 2026-10-12, the cap adds 10 reboots,
for 43 in total. The maintainer chose 14 on 2026-10-12, over 7 (33 more reboots) and 30 (2 more,
with a month's silent window). The replay is read with
`git show 9de5746:docs/questions/what-detects-a-process-left-running-on-a-replaced-library.md`.

## Enforced by

**Nothing yet.** It becomes true once slice 4's cloud-init writes the drop-in.

## Rejected

- **No cap.** It fails property 1: a broken detector stays silent until M11's alerting. **Reverses
  if** that alerting exists and also covers properties 2 and 3.
- **7 days.** It fails property 5: 33 more reboots a year, twice the detector's own. **Reverses if**
  reboots at the hour stop costing anything.
- **30 days.** It fails property 1 as the maintainer weighs it: a month of silence for 8 fewer
  reboots. **Reverses if** M11's alerting makes property 1 hold without the cap.
- **Not yet.**
  [ADR-0061](0061-a-dpkg-hook-runs-a-script-that-marks-the-machine-for-reboot-when-a-process-runs-replaced-code.md)
  is built in slice 4, and so is its silence.

## Risk

About 10 reboots a year on quiet days. A broken detector still goes unnoticed for up to 14 days.

## Revisit when

M11 alerts on a failed detector run; M12 sets a downtime tolerance.

## Also update

- [x] questions/README.md: a **Given** for M1 slice 4, beside
      [ADR-0061](0061-a-dpkg-hook-runs-a-script-that-marks-the-machine-for-reboot-when-a-process-runs-replaced-code.md)
- [x] [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md):
      its reboot count and second trigger link here
- [x] failure-modes/a-security-update-fails-and-nobody-knows.md: the cap bounds a detector that is
      wrong without failing
- [x] constraints.md: `unattended-upgrades` checking the marker on days nothing upgrades, which this
      rests on
- [x] architecture.md, guarantees/, glossary.md, ../CONTRIBUTING.md: nothing
