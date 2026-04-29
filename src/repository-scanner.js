import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import { extractCommentBlocks, extractHeadings, inferCapabilities } from "./parsers.js";
import { walkFiles } from "./utils.js";

const CODE_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".py",
  ".go",
  ".java",
  ".rb",
  ".rs",
  ".md",
  ".mdx",
  ".yaml",
  ".yml"
]);

export async function collectProjectContext(options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const changedFiles = options.changedFiles?.length ? options.changedFiles : null;
  const filePaths = changedFiles
    ? changedFiles.map((file) => path.resolve(baseDir, file))
    : await walkFiles(baseDir, (filePath) => CODE_EXTENSIONS.has(path.extname(filePath)));

  const files = [];

  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, "utf8");
      const relativePath = path.relative(baseDir, filePath);
      files.push({
        path: relativePath,
        commentBlocks: extractCommentBlocks(content),
        headings: path.resolve(filePath).startsWith(config.designDocDir) ? extractHeadings(content) : [],
        snippet: content.slice(0, 4000)
      });
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  const commentBlocks = files.flatMap((file) => file.commentBlocks);
  const designHeadings = files.flatMap((file) => file.headings);

  return {
    files,
    summary: {
      fileCount: files.length,
      commentBlockCount: commentBlocks.length,
      capabilities: inferCapabilities(commentBlocks),
      designHeadings
    }
  };
}
