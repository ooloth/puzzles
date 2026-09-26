import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

const checker = join(import.meta.dirname, "check-docs.py");
const run = promisify(execFile);

const GUARANTEE = "the-app-never-opens-to-a-blank-screen-after-the-first-visit.md";
const H1 = "The app never opens to a blank screen after the first visit";

// The checker reads these paths unconditionally, so every fixture tree carries them. The
// problems they raise are not citation problems and the tests below ignore them.
const SKELETON: Record<string, string> = {
  "CLAUDE.md": "",
  "README.md": "",
  "docs/README.md": "",
  "docs/constraints.md": "",
  "docs/decisions/README.md": "",
  "docs/failure-modes/README.md": "",
  "docs/guarantees/README.md": "",
  "docs/invariants/README.md": "",
  "docs/questions/README.md": "",
  "docs/standards/README.md": "",
  [`docs/guarantees/${GUARANTEE}`]: `# ${H1}\n`,
};

/**
 * Every problem line the checker prints for a docs tree holding these files. A key ending in `/`
 * is created as an empty directory, which is how the harness leaves its working directories.
 */
async function problemLines(files: Record<string, string>): Promise<readonly string[]> {
  const root = await mkdtemp(join(tmpdir(), "check-docs-"));
  try {
    for (const [path, content] of Object.entries({ ...SKELETON, ...files })) {
      if (path.endsWith("/")) {
        await mkdir(join(root, path), { recursive: true });
        continue;
      }
      await mkdir(join(root, dirname(path)), { recursive: true });
      await writeFile(join(root, path), content);
    }
    const stdout = await run("python3", [checker], { cwd: root }).then(
      (done) => done.stdout,
      (failed: { stdout: string }) => failed.stdout,
    );
    return stdout.split("\n").filter((line) => line.trim() !== "" && !/^\d+ problem\(s\)$/.test(line));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

/** The CITATION lines the checker prints for a docs tree holding these files. */
async function citationProblems(files: Record<string, string>): Promise<readonly string[]> {
  return (await problemLines(files)).filter((line) => line.startsWith("CITATION"));
}

function citing(text: string, target = `../guarantees/${GUARANTEE}`): string {
  return `Some prose.\n\nA sentence citing [${text}](${target}) in passing.\n`;
}

test("a citation using the guarantee's H1 passes", async () => {
  assert.deepEqual(await citationProblems({ "docs/questions/q.md": citing(H1) }), []);
});

test("a citation differing from the H1 only in case passes", async () => {
  assert.deepEqual(await citationProblems({ "docs/questions/q.md": citing(H1.toLowerCase()) }), []);
});

test("a citation using the filename's words passes, since the filename carries every caveat", async () => {
  const slugWords = GUARANTEE.replace(/\.md$/, "").replaceAll("-", " ");
  assert.deepEqual(await citationProblems({ "docs/questions/q.md": citing(slugWords) }), []);
});

test("a citation using the filename itself, hyphens and all, passes", async () => {
  const slug = GUARANTEE.replace(/\.md$/, "");
  assert.deepEqual(await citationProblems({ "docs/questions/q.md": citing(slug) }), []);
});

test("a citation dropping a caveat is reported with its location and both accepted forms", async () => {
  const problems = await citationProblems({
    "docs/questions/q.md": citing("The app never opens to a blank screen"),
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0]!, /^CITATION +docs\/questions\/q\.md:3 /);
  assert.ok(problems[0]!.includes('"The app never opens to a blank screen"'), problems.join("\n"));
  assert.ok(problems[0]!.includes(`"${H1}"`), problems.join("\n"));
  assert.ok(problems[0]!.includes('"the app never opens to a blank screen after the first visit"'), problems.join("\n"));
});

test("a citation naming no promise at all is reported", async () => {
  const problems = await citationProblems({ "docs/questions/q.md": citing("the guarantee") });
  assert.equal(problems.length, 1);
  assert.ok(problems[0]!.includes('"the guarantee"'), problems.join("\n"));
});

test("link text wrapped across lines is read as one title", async () => {
  const wrapped = "Some prose.\n\nA sentence citing [The app never opens to a blank screen\nafter the first visit](../guarantees/" + GUARANTEE + ").\n";
  assert.deepEqual(await citationProblems({ "docs/questions/q.md": wrapped }), []);
});

test("a wrapped citation that drops a caveat is reported at the line where the link starts", async () => {
  const wrapped = "Line one.\n\nLine three cites [The app never opens\nto a blank screen](../guarantees/" + GUARANTEE + ").\n";
  const problems = await citationProblems({ "docs/questions/q.md": wrapped });
  assert.equal(problems.length, 1);
  assert.match(problems[0]!, /^CITATION +docs\/questions\/q\.md:3 /);
  assert.ok(problems[0]!.includes('"The app never opens to a blank screen"'), problems.join("\n"));
});

test("a citation with a fragment is still checked", async () => {
  const problems = await citationProblems({
    "docs/questions/q.md": citing("the guarantee", `../guarantees/${GUARANTEE}#enforced-by`),
  });
  assert.equal(problems.length, 1);
});

test("links to the guarantees folder or its README are not citations of a promise", async () => {
  const text = "See [every promise](../guarantees/) and [how they are written](../guarantees/README.md).\n";
  assert.deepEqual(await citationProblems({ "docs/questions/q.md": text }), []);
});

test("links inside comments and fenced blocks are ignored", async () => {
  const text = [
    "Prose.",
    "<!-- template: [the guarantee](../guarantees/" + GUARANTEE + ") -->",
    "```",
    "[the guarantee](../guarantees/" + GUARANTEE + ")",
    "```",
    "",
  ].join("\n");
  assert.deepEqual(await citationProblems({ "docs/questions/q.md": text }), []);
});

test("a citation from a root file is resolved from the repository root", async () => {
  const problems = await citationProblems({ "CLAUDE.md": citing("the guarantee", `docs/guarantees/${GUARANTEE}`) });
  assert.equal(problems.length, 1);
  assert.match(problems[0]!, /^CITATION +CLAUDE\.md:3 /);
});

test("a guarantee with no H1 is compared against its filename and does not stop the run", async () => {
  const problems = await citationProblems({
    "docs/guarantees/every-puzzle-has-exactly-one-solution.md": "No heading here.\n",
    "docs/questions/q.md": citing("every puzzle has exactly one solution", "../guarantees/every-puzzle-has-exactly-one-solution.md"),
  });
  assert.deepEqual(problems, []);
});

test("a .claude directory directly under docs/ is reported as an artifact to delete, not as unindexed", async () => {
  const problems = await problemLines({ "docs/.claude/.cc-writes/": "" });
  const artifacts = problems.filter((line) => line.startsWith("ARTIFACT"));
  assert.equal(artifacts.length, 1, problems.join("\n"));
  assert.match(artifacts[0]!, /^ARTIFACT +docs\/\.claude /);
  assert.ok(artifacts[0]!.includes("delete it"), artifacts[0]!);
  assert.ok(!problems.some((line) => line.startsWith("NOT INDEXED") && line.includes(".claude")), problems.join("\n"));
});

test("a .claude directory nested inside a docs folder is reported as an artifact", async () => {
  const problems = await problemLines({ "docs/decisions/.claude/.cc-writes/": "" });
  const artifacts = problems.filter((line) => line.startsWith("ARTIFACT"));
  assert.equal(artifacts.length, 1, problems.join("\n"));
  assert.match(artifacts[0]!, /^ARTIFACT +docs\/decisions\/\.claude /);
});

test("an ordinary directory under docs/ that the index omits is still reported as unindexed", async () => {
  const problems = await problemLines({ "docs/drafts/": "" });
  assert.ok(problems.includes("NOT INDEXED  docs/drafts is missing from docs/README.md"), problems.join("\n"));
});

test("a docs tree with no .claude directory reports no artifact", async () => {
  const problems = await problemLines({});
  assert.ok(!problems.some((line) => line.startsWith("ARTIFACT")), problems.join("\n"));
});
