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


def question_files():
    for f in sorted(os.listdir('docs/questions')):
        if f.endswith('.md') and f != 'README.md':
            yield os.path.join('docs/questions', f)


# Sequencing lives in docs/questions/README.md and nowhere else. These two lead
# sentences carried it into the question files, and they spread by being copied
# rather than by being reinvented — which is what makes a literal lookup the
# right tool. A paraphrase is not caught here, because deciding whether a
# sentence is an ordering claim is a judgement. prep-for-codebase-handoff scans
# for that; this catches the copy-paste, which is the common case.
BANNED_LEADS = (
    'What this decides beyond itself',
    'Not blockers, and worth saying so',
)

# Every Findings section says what a finding is worth, in its own file, because
# a reader who lands on one question file has not read the folder's README.
FINDINGS_NOTE = 'Findings are working evidence, not settled fact.'


def check_question_sequencing():
    for path in question_files():
        for n, line in enumerate(open(path), 1):
            for phrase in BANNED_LEADS:
                if phrase in line:
                    problems.append(
                        f'SEQUENCING   {path}:{n} "{phrase}" — sequencing belongs in '
                        f'docs/questions/README.md and nowhere else'
                    )


def check_findings_note():
    """A worked Findings section carries the status note. An untouched one does not need it."""
    for path in question_files():
        text = open(path).read()
        if '## Findings' not in text:
            problems.append(f'NO FINDINGS  {path} has no Findings section')
            continue
        body = text.split('## Findings', 1)[1].strip()
        if body in ('', '...'):
            continue
        if FINDINGS_NOTE not in body:
            problems.append(
                f'UNMARKED     {path} has worked Findings without the status note '
                f'("{FINDINGS_NOTE}")'
            )


def decision_files():
    for f in sorted(os.listdir('docs/decisions')):
        if f.endswith('.md') and f != 'README.md':
            yield os.path.join('docs/decisions', f)


# The template's headings, in order. Two decisions hid for a month inside a
# section a record invented for itself, outside Decision, Rejected and Risk —
# so an unexpected heading is where a buried decision goes to live.
TEMPLATE_HEADINGS = [
    '## Forced by',
    '## Decision',
    '## Rejected',
    '## Risk',
    '## Revisit when',
    '## Also update',
]


def check_decision_headings():
    for path in decision_files():
        found = [l.rstrip() for l in open(path) if l.startswith('## ')]
        if found != TEMPLATE_HEADINGS:
            extra = [h for h in found if h not in TEMPLATE_HEADINGS]
            missing = [h for h in TEMPLATE_HEADINGS if h not in found]
            detail = []
            if extra:
                detail.append('unexpected ' + ', '.join(f'"{h}"' for h in extra))
            if missing:
                detail.append('missing ' + ', '.join(f'"{h}"' for h in missing))
            if not detail:
                detail.append('out of order')
            problems.append(f'HEADINGS     {path} — {"; ".join(detail)}')


def check_rejected_citations():
    """A rejection is held to the same evidence bar as Forced by.

    Every weak reason found in an audit of this folder argued for the option
    that lost, never for the one that won. A rejection is also never revisited,
    because reality tests the option you took and never the one you did not.
    So each rejected option cites something: a fact, a promise, a problem
    statement, or another record.
    """
    for path in decision_files():
        text = open(path).read()
        if '## Rejected' not in text:
            continue
        section = text.split('## Rejected', 1)[1].split('\n## ', 1)[0]
        # Bullets start at column 0 with "- "; continuation lines are indented.
        bullets, current = [], None
        for line in section.split('\n'):
            if line.startswith('- '):
                if current is not None:
                    bullets.append(current)
                current = line
            elif current is not None:
                current += '\n' + line
        if current is not None:
            bullets.append(current)
        for b in bullets:
            if b.strip().upper().startswith('- N/A'):
                continue
            if not cites_something(b):
                head = b.strip().split('\n')[0][:70]
                problems.append(
                    f'UNSOURCED    {path} — rejected option cites nothing: {head}'
                )


# A citation in any of the three forms this repo actually uses. Deliberately
# generous: this is a floor, not a judgement about whether each factual claim
# inside a bullet has provenance. That needs a reader, and
# prep-for-codebase-handoff scans for it.
def cites_something(text):
    if re.search(r'\]\((?!http|mailto|data:)[^)#][^)]*\)', text):
        return True
    if re.search(r'`[^`]*\.md`', text):
        return True
    if re.search(r'\bADR-\d{4}\b', text):
        return True
    return False


check_links()
check_indexes()
check_decision_checkboxes()
check_top_level_index()
check_question_sequencing()
check_findings_note()
check_decision_headings()
check_rejected_citations()

for p in problems:
    print(p)
print(f'\n{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
