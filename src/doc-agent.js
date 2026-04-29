import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import { startSession, appendReview } from "./collaboration-store.js";
import { generateOverview } from "./llm-provider.js";
import { renderMarkdownDocument } from "./markdown-renderer.js";
import { collectProjectContext } from "./repository-scanner.js";
import { ensureDir, slugify, writeJson } from "./utils.js";

export async function generateTechnicalDocument(request = {}) {
  const context = await collectProjectContext({ changedFiles: request.changedFiles });
  const title = request.title || "AI Documentation Agent";
  const docId = request.docId || slugify(title);
  const collaboration = await startSession({
    docId,
    channel: request.channel,
    contributors: request.contributors,
    reviewers: request.reviewers,
    notes: request.notes
  });
  const overview = await generateOverview(context);
  const content = renderMarkdownDocument({
    title,
    overview,
    sources: context.files.map((file) => file.path),
    capabilities: context.summary.capabilities,
    collaboration,
    generatedAt: new Date().toISOString()
  });

  await ensureDir(config.outputDir);
  const outputPath = path.join(config.outputDir, `${docId}.md`);
  const metadataPath = path.join(config.outputDir, `${docId}.json`);

  await fs.writeFile(outputPath, content, "utf8");
  await writeJson(metadataPath, {
    docId,
    title,
    generatedAt: new Date().toISOString(),
    sources: context.files.map((file) => file.path),
    collaborationId: collaboration.id
  });

  return {
    docId,
    outputPath,
    metadataPath,
    collaboration
  };
}

export async function addReviewFeedback({ sessionId, author, message, approved }) {
  return appendReview(sessionId, { author, message, approved });
}
