import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { generateTechnicalDocument } from "../src/doc-agent.js";

test("generateTechnicalDocument writes markdown and metadata", async () => {
  const result = await generateTechnicalDocument({
    title: "Test Documentation",
    docId: "test-documentation",
    contributors: ["alice"],
    reviewers: ["bob"],
    notes: ["seed note"]
  });

  const markdown = await fs.readFile(result.outputPath, "utf8");
  const metadata = JSON.parse(await fs.readFile(result.metadataPath, "utf8"));

  assert.equal(metadata.docId, "test-documentation");
  assert.match(markdown, /# Test Documentation/);
  assert.match(markdown, /Contributors: alice/);
  assert.match(markdown, /Reviewers: bob/);
});

test("generated files live in configured output directory", async () => {
  const result = await generateTechnicalDocument({
    title: "Directory Check",
    docId: "directory-check"
  });

  assert.equal(path.basename(path.dirname(result.outputPath)), "generated-docs");
});
