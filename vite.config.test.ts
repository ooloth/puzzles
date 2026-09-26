import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { build, type InlineConfig, type Rolldown } from "vite";

const configFile = join(import.meta.dirname, "vite.config.ts");

async function buildInMemory(overrides: InlineConfig = {}): Promise<Rolldown.OutputBundle> {
  const result = await build({ configFile, logLevel: "silent", ...overrides, build: { write: false } });
  assert.ok(!Array.isArray(result) && "output" in result, "expected a single in-memory build");
  return Object.fromEntries(result.output.map((file) => [file.fileName, file]));
}

test("the build emits an entry document that loads a content-hashed script", async () => {
  const bundle = await buildInMemory();
  const entry = bundle["index.html"];
  assert.ok(entry !== undefined && entry.type === "asset", "no index.html in the build output");

  const script = String(entry.source).match(/<script type="module"[^>]* src="\/(assets\/index-[\w-]{8,}\.js)"/);
  assert.ok(script !== null, "index.html loads no content-hashed module script");
  assert.equal(bundle[script[1]!]?.type, "chunk", `index.html loads ${script[1]}, which the build did not emit`);
});

test("the build lowers syntax the declared browser floor cannot parse", async () => {
  const project = await mkdtemp(join(tmpdir(), "floor-"));
  try {
    await writeFile(join(project, "index.html"), '<script type="module" src="./main.ts"></script>');
    // Class static blocks arrived in Safari 16.4, so the floor needs them lowered.
    await writeFile(join(project, "main.ts"), 'class Sample { static label = ""; static { Sample.label = "floor-sample"; } }\nconsole.log(Sample.label);\n');

    const bundle = await buildInMemory({ root: project });
    const code = Object.values(bundle)
      .flatMap((file) => (file.type === "chunk" ? [file.code] : []))
      .join("\n");
    assert.match(code, /floor-sample/, "the sample class is missing from the build output");
    assert.doesNotMatch(code, /\bstatic\s*\{/);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});
