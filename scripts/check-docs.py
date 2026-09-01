#!/usr/bin/env python3
"""Check docs/ for broken links and questions missing from the milestone list.

Run with: python3 scripts/check-docs.py

Deliberately narrow. These two are facts — a link resolves or it does not, a
question appears in docs/questions/README.md or it does not. The ordering of the
milestones is a judgement made in that file, and is not checked here: a passing
check on a sequence would only make a wrong one look verified.

Nothing runs this automatically yet, so it is a check that does not exist for
anyone who does not think to type it. Wiring it into a commit hook or CI is
docs/questions/what-runs-the-checks-on-every-change.md, which belongs to a later
milestone — doing it now would answer that question early. It needs no runtime of
its own, so it can be wired up before the stack is chosen.
"""
import os, re, sys

QDIR = 'docs/questions'
bad = 0

for root, dirs, files in os.walk('docs'):
    if '@legacy' in root or 'brainstorming' in root:
        continue
    for f in files:
        if not f.endswith('.md'):
            continue
        p = os.path.join(root, f)
        for l in re.findall(r'\]\(([^)#][^)]*)\)', open(p).read()):
            if l.startswith(('http', 'mailto', 'data:')):
                continue
            if not os.path.exists(os.path.normpath(os.path.join(root, l.split('#')[0]))):
                print(f'BROKEN LINK  {p} -> {l}')
                bad += 1

readme = open(os.path.join(QDIR, 'README.md')).read()
milestone, order, cur = {}, [], None
for line in readme.split('\n'):
    m = re.match(r'^## (M\d+) — (.*)', line)
    if m:
        cur = m.group(1); order.append(cur)
    elif line.startswith('## '):
        if 'Blocking nothing' in line:
            cur = 'ZZ'; order.append(cur)
        elif cur and cur.startswith('M'):
            cur = None
    if cur:
        for l in re.findall(r'\]\(([^)#][^)]*\.md)\)', line):
            if not l.startswith('..'):
                milestone.setdefault(l, cur)
rank = {m: i for i, m in enumerate(order)}

for f in sorted(os.listdir(QDIR)):
    if f.endswith('.md') and f != 'README.md' and f not in milestone:
        print(f'UNPLACED     {f} is in no milestone')
        bad += 1

print(f'\n{bad} problem(s)')
sys.exit(1 if bad else 0)
