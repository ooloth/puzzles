#!/usr/bin/env python3
"""Check docs/ for broken links, missing index entries, and unfinished decision records.

Run with: python3 scripts/check-docs.py

Deliberately narrow. Everything here is a fact — a link resolves or it does not,
a file appears in its index or it does not. Nothing here checks judgement. The
ordering of the milestones in docs/questions/README.md is a judgement made in
that file and is not checked, because a passing check on a sequence would only
make a wrong one look verified.

Nothing runs this automatically yet, so it is a check that does not exist for
anyone who does not think to type it. Wiring it into a commit hook or CI is
docs/questions/what-runs-the-checks-on-every-change.md, which belongs to a later
milestone — doing it now would answer that question early. It needs no runtime of
its own, so it can be wired up before the stack is chosen.
"""
import os
import re
import sys

# Each index lists the files in its own directory. Both directions are checked:
# a listed file that does not exist, and an existing file nobody listed.
# Listed explicitly rather than discovered, so that adding a directory without an
# index is a deliberate choice rather than a silent gap.
INDEXES = [
    ('docs/questions/README.md', 'docs/questions'),
    ('docs/guarantees/README.md', 'docs/guarantees'),
    ('docs/failure-modes/README.md', 'docs/failure-modes'),
    ('docs/standards/README.md', 'docs/standards'),
]

# docs/decisions/ has no index — its README describes the format, and the
# records are self-ordering by number. Adding one would create a second place to
# keep in step for no gain.

SKIP_DIRS = ('@legacy', 'brainstorming')

problems = []


def links_in(path):
    """Every relative markdown link target in a file."""
    text = open(path).read()
    return [
        l for l in re.findall(r'\]\(([^)#][^)]*)\)', text)
        if not l.startswith(('http', 'mailto', 'data:'))
    ]


def check_links():
    for root, _, files in os.walk('docs'):
        if any(skip in root for skip in SKIP_DIRS):
            continue
        for f in files:
            if not f.endswith('.md'):
                continue
            path = os.path.join(root, f)
            for link in links_in(path):
                target = os.path.normpath(os.path.join(root, link.split('#')[0]))
                if not os.path.exists(target):
                    problems.append(f'BROKEN LINK  {path} -> {link}')


def check_indexes():
    for index, directory in INDEXES:
        # Only sibling links count. An index links out to other directories too,
        # and those are not claims about what this directory contains.
        listed = {
            l.split('#')[0] for l in links_in(index)
            if l.endswith('.md') and '/' not in l
        }
        present = {
            f for f in os.listdir(directory)
            if f.endswith('.md') and f != 'README.md'
        }
        for f in sorted(present - listed):
            problems.append(f'NOT INDEXED  {directory}/{f} is missing from {index}')
        # A listed file that does not exist is already caught by check_links,
        # unless the index names it without linking it.
        for f in sorted(listed - present - {'README.md'}):
            if not os.path.exists(os.path.join(directory, f)):
                problems.append(f'INDEX STALE  {index} lists {f}, which does not exist')


def check_decision_checkboxes():
    """An unchecked box in a decision record is work the record says is outstanding.

    docs/decisions/README.md carries the template, which is unchecked by design.
    """
    for f in sorted(os.listdir('docs/decisions')):
        if not f.endswith('.md') or f == 'README.md':
            continue
        path = os.path.join('docs/decisions', f)
        for n, line in enumerate(open(path), 1):
            if line.lstrip().startswith('- [ ]'):
                item = line.strip().removeprefix('- [ ]').strip()
                problems.append(f'UNFINISHED   {path}:{n} {item}')


def check_top_level_index():
    """docs/README.md lists every top-level doc and directory. CLAUDE.md repeats it."""
    # First path segment only: a link to questions/README.md is a claim about
    # questions/, not about a file called README.md.
    listed = {l.split('/')[0].removesuffix('.md') for l in links_in('docs/README.md')}
    present = {
        f.removesuffix('.md') for f in os.listdir('docs')
        if (f.endswith('.md') and f != 'README.md') or os.path.isdir(os.path.join('docs', f))
    }
    present -= set(SKIP_DIRS)
    for f in sorted(present - listed):
        problems.append(f'NOT INDEXED  docs/{f} is missing from docs/README.md')

    claude_text = open('CLAUDE.md').read()
    claude = {
        l.split('/')[0].removesuffix('.md')
        for l in re.findall(r'`docs/([^`]+)`', claude_text)
    }
    for f in sorted(listed - claude - {'brainstorming'}):
        problems.append(f'TABLE DRIFT  docs/{f} is in docs/README.md but not CLAUDE.md')


check_links()
check_indexes()
check_decision_checkboxes()
check_top_level_index()

for p in problems:
    print(p)
print(f'\n{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
