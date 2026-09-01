#!/usr/bin/env python3
"""Check docs/ for broken links, unplaced questions, and milestone ordering errors.

A milestone ordering error is a question that depends on one filed in a later
milestone. It means either the milestone is wrong or the dependency is overstated,
and both are worth knowing before a decision is made on top of it.
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

for f, ms in sorted(milestone.items()):
    p = os.path.join(QDIR, f)
    if not os.path.exists(p):
        continue
    mm = re.search(r'## Blocked by\n(.*?)\n## ', open(p).read(), re.S)
    if not mm:
        continue
    for dep in re.findall(r'\]\(([^)#][^)]*\.md)\)', mm.group(1)):
        if dep.startswith('..'):
            continue
        dms = milestone.get(dep)
        if dms and rank.get(dms, 99) > rank.get(ms, 99):
            print(f'OUT OF ORDER {ms} {f}\n             blocked by {dms} {dep}')
            bad += 1

print(f'\n{bad} problem(s)')
sys.exit(1 if bad else 0)
