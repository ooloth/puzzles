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
from dataclasses import dataclass

# Each index lists the files in its own directory. Both directions are checked:
# a listed file that does not exist, and an existing file nobody listed.
# Listed explicitly rather than discovered, so that adding a directory without an
# index is a deliberate choice rather than a silent gap.
INDEXES = [
    ('docs/questions/README.md', 'docs/questions'),
    ('docs/guarantees/README.md', 'docs/guarantees'),
    ('docs/failure-modes/README.md', 'docs/failure-modes'),
    ('docs/standards/README.md', 'docs/standards'),
    ('docs/invariants/README.md', 'docs/invariants'),
]

# docs/decisions/ has no index — its README describes the format, and the
# records are self-ordering by number. Adding one would create a second place to
# keep in step for no gain.

SKIP_DIRS = ('brainstorming',)

problems = []


COMMENT_BLOCK = re.compile(r'<!--.*?-->', re.DOTALL)
FENCED_BLOCK = re.compile(r'^```.*?^```', re.DOTALL | re.MULTILINE)


def without_comments(text):
    """Text with HTML comment blocks and fenced code blocks removed.

    Templates live in comments and contain placeholder links on purpose. Scanning them
    reports every placeholder as broken, which is noise that trains people to ignore the
    checker. A comment is not a claim about anything, so nothing in one is checked.

    Fenced blocks are skipped for the same reason. A diagram labelling a box "ADR-0019"
    is not a prose citation that could name the wrong record — it is a picture, and the
    prose beneath it carries the real links. Requiring markdown links inside an ASCII
    diagram would mean choosing between a readable diagram and a passing check.
    """
    return FENCED_BLOCK.sub('', COMMENT_BLOCK.sub('', text))


def links_in(path):
    """Every relative markdown link target in a file, ignoring templates in comments."""
    text = without_comments(open(path).read())
    return [
        l for l in re.findall(r'\]\(([^)#][^)]*)\)', text)
        if not l.startswith(('http', 'mailto', 'data:'))
    ]


def markdown_files():
    """Every markdown file whose links are checked: all of docs/, plus the two at the root.

    Both root files link into docs/ and neither lives under it, so walking docs/ alone leaves
    them unchecked. That matters most for CLAUDE.md, which links into docs/decisions/ by number:
    decisions/README.md tells a renumbering author this script catches every link a renumber
    breaks, and that is only true if CLAUDE.md is in this list. README.md is the repo's front
    door and links to five doc paths, none of which anything else verifies.

    Only check_links and check_backticked_paths consume this. check_frontmatter walks docs/
    separately, which is why neither root file needs frontmatter to pass.
    """
    for root, _, files in os.walk('docs'):
        if any(skip in root for skip in SKIP_DIRS):
            continue
        for f in files:
            if f.endswith('.md'):
                yield root, os.path.join(root, f)
    yield '.', 'CLAUDE.md'
    yield '.', 'README.md'


def check_links():
    for root, path in markdown_files():
        for link in links_in(path):
            target = os.path.normpath(os.path.join(root, link.split('#')[0]))
            if not os.path.exists(target):
                problems.append(f'BROKEN LINK  {path} -> {link}')


# A path in backticks is a reference that looks like a link and reads like prose,
# so check_links cannot see it: that function matches markdown links only, which
# is what docs/decisions/README.md warns about when it says backticked paths "are
# invisible to scripts/check-docs.py". This closes that gap. The references most
# at risk sit inside "Also update" checkboxes, where a dead path reads as
# completed work and nothing about it looks wrong.
#
# Only paths ending in a file extension are checked. A backticked word is usually
# a field name, and "N/A" contains a slash, so anything broader reports noise.
BACKTICKED_PATH = re.compile(r'`([^`\s]+\.(?:md|py))`')

# Filenames here are lowercase-kebab, so an uppercase letter means either one of
# the three shouting filenames or a placeholder in a template — `NNNN-kebab-title.md`
# names a naming convention rather than a file. Angle brackets are the other
# placeholder form. Neither is a reference, so neither is checked.
SHOUTING_FILENAMES = ('README.md', 'CLAUDE.md', 'MEMORY.md')

# Where a backticked path may be rooted. All four conventions are in use and which
# one a given file means is not worth legislating; resolving under any is enough.
PATH_BASES = ('docs', 'scripts', '.')


def is_placeholder(ref):
    if '<' in ref:
        return True
    return any(c.isupper() for c in ref) and os.path.basename(ref) not in SHOUTING_FILENAMES


def check_backticked_paths():
    """A path written in backticks resolves to a file that exists.

    check_links only sees markdown links, and docs/decisions/README.md already warns
    that bare paths "are invisible to scripts/check-docs.py". This is the report that
    makes the warning unnecessary.
    """
    for root, path in markdown_files():
        text = without_comments(open(path).read())
        for n, line in enumerate(text.splitlines(), 1):
            for ref in BACKTICKED_PATH.findall(line):
                if is_placeholder(ref):
                    continue
                bases = (root,) + PATH_BASES
                if any(os.path.exists(os.path.normpath(os.path.join(b, ref))) for b in bases):
                    continue
                problems.append(
                    f'DEAD PATH    {path}:{n} `{ref}` does not exist under {root}/, '
                    f'docs/, scripts/ or the repo root'
                )


ANY_LINK = re.compile(r'\]\(([^)]*)\)')


def check_heading_anchors():
    """No link points at a heading.

    The portable documentation standard asks that references point at files: a path survives
    a document being reorganised, an anchor breaks the moment someone rewords a heading, and
    nothing reports it. This is that report. check_links() cannot do it: it strips the fragment
    before resolving the path, and skips same-document links entirely, so both kinds pass it.
    """
    for root, _, files in os.walk('docs'):
        if any(skip in root for skip in SKIP_DIRS):
            continue
        for f in files:
            if not f.endswith('.md'):
                continue
            path = os.path.join(root, f)
            text = without_comments(open(path).read())
            for n, line in enumerate(text.splitlines(), 1):
                for target in ANY_LINK.findall(line):
                    if target.startswith(('http', 'mailto', 'data:')):
                        continue
                    if '#' in target:
                        problems.append(
                            f'HEADING LINK {path}:{n} "{target}" points at a heading; '
                            f'link the file instead'
                        )


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
    '## Enforced by',
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


# There is deliberately no check that a rejected option cites its evidence.
# One existed and was removed on 2026-09-01: it passed ADR-0003, whose
# bullets cite problem.md for one thing and then make five specific,
# unsourced claims about vendor policies and version numbers. Whether a
# citation supports the claim beside it, and whether any single reason
# disqualifies an option alone, are readings rather than matches — and a
# check that answers neither reports a clean result on the record that
# motivated it. prep-for-codebase-handoff scans for both.


# Every reference to a decision record is a link, and the link's label matches
# the record it points at. A renumber on 2026-09-02 rewrote linked labels and
# left thirty-nine plain-text mentions alone, six of which then named the wrong
# record — ADR-0007 credited state ownership to the record about which games
# ship first. A bare mention cannot be checked; a link can.
ADR_LINK = re.compile(r'\[ADR-(\d{4})\]\((?:\.\./)?(?:decisions/)?(\d{4})-')
ADR_BARE = re.compile(r'(?<!\[)\bADR-(\d{4})\b')


def check_adr_references():
    for root, dirs, files in os.walk('docs'):
        if any(skip in root for skip in SKIP_DIRS):
            continue
        for f in files:
            if not f.endswith('.md'):
                continue
            path = os.path.join(root, f)
            body = without_comments(open(path).read())
            for n, line in enumerate(body.splitlines(), 1):
                for m in ADR_LINK.finditer(line):
                    if m.group(1) != m.group(2):
                        problems.append(
                            f'ADR LABEL    {path}:{n} label says ADR-{m.group(1)}, '
                            f'link points at {m.group(2)}'
                        )
                for m in ADR_BARE.finditer(ADR_LINK.sub('', line)):
                    problems.append(
                        f'ADR UNLINKED {path}:{n} "ADR-{m.group(1)}" is not a link, so '
                        f'nothing checks that it names the record it means'
                    )


# constraints.md states three provenance tiers and says anything asserted
# without one of them does not belong in the file. It then used a fourth,
# undefined word for most of its entries. Question findings add one more tier,
# for a claim nobody has established.
CONSTRAINT_TIERS = ('Measured', 'Sourced', 'Reasoned')
FINDING_TIERS = CONSTRAINT_TIERS + ('Unverified',)
# Deliberately a list of near-misses rather than "any word that is not a tier".
# A Findings section also opens option entries with *Word — ...*, so anything
# broader flags those. The failure this catches is a plausible synonym used as
# though it were a tier — constraints.md used "Verified" twenty-two times while
# defining three tiers that did not include it.
NEAR_MISS_TIERS = (
    'Verified', 'Confirmed', 'Established', 'Checked', 'Observed',
    'Cited', 'Documented', 'Asserted', 'Unsourced', 'Inferred',
)
TIER_TAG = re.compile(r'^\*(' + '|'.join(NEAR_MISS_TIERS + FINDING_TIERS) + r')\s+—')


def check_tiers_in(path, allowed):
    for n, line in enumerate(open(path), 1):
        m = TIER_TAG.match(line)
        if m and m.group(1) not in allowed:
            problems.append(
                f'TIER         {path}:{n} "{m.group(1)}" is not one of {", ".join(allowed)}'
            )


def check_provenance_tiers():
    check_tiers_in('docs/constraints.md', CONSTRAINT_TIERS)
    for path in question_files():
        check_tiers_in(path, FINDING_TIERS)


# Three folders, three frontmatter schemas. documentation.md states the default
# as a Must and exempts the two folders that carry their own, which their
# READMEs define. Checking it here is what stops the exemption drifting into
# "nobody bothers".
SCHEMAS = {
    'docs/decisions': ('number', 'status', 'date'),
    'docs/questions': ('opened', 'status', 'resolves_into'),
}
DEFAULT_SCHEMA = ('updated', 'update_when', 'decays')

# Checking the key is present is not the same as checking it says something.
# `resolves_into` partitions the questions folder: `rg 'resolves_into: constraint'`
# is the research backlog and `resolves_into: decision` is the open choices. A
# value outside this set silently drops a file out of both queries, which is how
# a file goes missing from a list nobody knows to check. `unsettled` is a real
# value rather than a placeholder, and questions/README.md says what it means.
ENUMS = {
    ('docs/questions', 'resolves_into'): (
        'decision', 'constraint', 'problem', 'unsettled',
    ),
}


# docs/guarantees/README.md and docs/invariants/README.md both say the filename is
# the claim and the H1 restates it in full. So the H1 may carry words the filename
# drops — "a player takes", "alone" — but every word in the filename has to appear
# in the H1, in order. That permits a faithful abbreviation and catches a title
# that has drifted from its slug, which nothing else reports: a renamed file keeps
# its old H1, and a reworded H1 keeps its old filename, and both read as correct.
CLAIM_FOLDERS = ('docs/guarantees', 'docs/invariants')


def check_h1_matches_filename():
    for directory in CLAIM_FOLDERS:
        for f in sorted(os.listdir(directory)):
            if not f.endswith('.md') or f == 'README.md':
                continue
            path = os.path.join(directory, f)
            with open(path) as fh:
                h1 = next(
                    (l[2:].strip() for l in fh if l.startswith('# ')), None
                )
            if h1 is None:
                problems.append(f'NO H1        {path} has no H1 to check against its filename')
                continue
            words = iter(re.sub(r'[^a-z0-9]+', '-', h1.lower()).strip('-').split('-'))
            missing = [w for w in f[:-3].split('-') if w not in words]
            if missing:
                problems.append(
                    f'TITLE DRIFT  {path} — H1 "{h1}" does not contain, in order: '
                    + ', '.join(missing)
                )


# A link into docs/guarantees/ is a promise quoted by name, so its text says what was
# promised. guarantees/README.md puts every caveat in the filename and the H1 restates it,
# so link text shortened any other way can drop the caveat and promise more than the file
# does: "Play continues through a loss of connectivity" loses "the board in", which is the
# whole scope of that guarantee. The text has to be the H1 or the filename, as words or
# as written, in any case. Link text wraps across lines, so links are found in the whole file rather
# than line by line, and blanked-out comments keep their newlines so line numbers hold.
GUARANTEES = 'docs/guarantees'
LINK_WITH_TEXT = re.compile(r'\[([^\]]+)\]\(([^)\s]+)\)')


@dataclass(frozen=True)
class GuaranteeCitation:
    source: str
    line: int
    text: str
    target: str


def blanked(text: str) -> str:
    """Text with comments and fenced blocks replaced by their newlines, so nothing moves."""
    keep_newlines = lambda m: '\n' * m.group(0).count('\n')
    return FENCED_BLOCK.sub(keep_newlines, COMMENT_BLOCK.sub(keep_newlines, text))


def guarantee_citations(root: str, path: str) -> list[GuaranteeCitation]:
    text = blanked(open(path).read())
    citations = []
    for m in LINK_WITH_TEXT.finditer(text):
        target = os.path.normpath(os.path.join(root, m.group(2).split('#')[0]))
        if os.path.dirname(target) != GUARANTEES or not target.endswith('.md'):
            continue
        if os.path.basename(target) == 'README.md' or not os.path.exists(target):
            continue
        citations.append(GuaranteeCitation(
            source=path,
            line=text.count('\n', 0, m.start()) + 1,
            text=' '.join(m.group(1).split()),
            target=target,
        ))
    return citations


def accepted_titles(target: str) -> list[str]:
    """The H1 where there is one, then the filename's words. A missing H1 is NO H1's report."""
    with open(target) as fh:
        h1 = next((l[2:].strip() for l in fh if l.startswith('# ')), None)
    slug = os.path.basename(target).removesuffix('.md').replace('-', ' ')
    return ([h1] if h1 else []) + [slug]


def comparable(title: str) -> str:
    """A title as the check compares it: case ignored, and a hyphen read as a space, so the
    filename itself passes as well as its words."""
    return title.lower().replace('-', ' ')


def check_guarantee_citations() -> None:
    for root, path in markdown_files():
        for citation in guarantee_citations(root, path):
            titles = accepted_titles(citation.target)
            if comparable(citation.text) in (comparable(t) for t in titles):
                continue
            problems.append(
                f'CITATION     {citation.source}:{citation.line} "{citation.text}" cites '
                f'{citation.target} by a name it does not have; use '
                + ' or '.join(f'"{t}"' for t in titles)
            )


def check_frontmatter():
    for root, dirs, files in os.walk('docs'):
        if any(skip in root for skip in SKIP_DIRS):
            continue
        required = SCHEMAS.get(root, DEFAULT_SCHEMA)
        for f in sorted(files):
            if not f.endswith('.md'):
                continue
            if f == 'README.md' and root in SCHEMAS:
                required = DEFAULT_SCHEMA
            else:
                required = SCHEMAS.get(root, DEFAULT_SCHEMA)
            path = os.path.join(root, f)
            text = open(path).read()
            if not text.startswith('---\n'):
                problems.append(f'FRONTMATTER  {path} has none')
                continue
            head = text.split('---\n', 2)[1]
            fields = {}
            for l in head.split('\n'):
                if ':' in l:
                    k, v = l.split(':', 1)
                    fields[k.strip()] = v.strip()
            missing = [k for k in required if k not in fields]
            if missing:
                problems.append(
                    f'FRONTMATTER  {path} missing {", ".join(missing)}'
                )
            for (folder, key), allowed in ENUMS.items():
                if root != folder or key not in fields:
                    continue
                if fields[key] not in allowed:
                    problems.append(
                        f'FRONTMATTER  {path} has {key}: {fields[key]!r}, '
                        f'not one of {", ".join(allowed)}'
                    )


check_links()
check_backticked_paths()
check_heading_anchors()
check_indexes()
check_decision_checkboxes()
check_top_level_index()
check_question_sequencing()
check_findings_note()
check_decision_headings()
check_adr_references()
check_provenance_tiers()
check_frontmatter()
check_h1_matches_filename()
check_guarantee_citations()

for p in problems:
    print(p)
print(f'\n{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
