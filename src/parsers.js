const COMMENT_PATTERNS = [
  /\/\*\*([\s\S]*?)\*\//g,
  /<!--([\s\S]*?)-->/g,
  /(^|\n)\s*\/\/\/?\s?(.*)/g,
  /(^|\n)\s*#\s?(.*)/g
];

export function extractCommentBlocks(content) {
  const blocks = [];

  for (const pattern of COMMENT_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const body = (match[1] || match[2] || "")
        .split("\n")
        .map((line) => line.replace(/^\s*\*+\s?/, "").trim())
        .filter(Boolean)
        .join("\n");

      if (body) {
        blocks.push(body);
      }
    }
  }

  return dedupe(blocks);
}

export function extractHeadings(markdown) {
  return dedupe(
    markdown
      .split("\n")
      .filter((line) => /^#{1,6}\s+/.test(line))
      .map((line) => line.replace(/^#{1,6}\s+/, "").trim())
      .filter(Boolean)
  );
}

export function inferCapabilities(commentBlocks) {
  const capabilities = [];
  const joined = commentBlocks.join("\n").toLowerCase();

  if (joined.includes("auth")) capabilities.push("authentication");
  if (joined.includes("cache")) capabilities.push("caching");
  if (joined.includes("queue")) capabilities.push("queue processing");
  if (joined.includes("webhook")) capabilities.push("webhook handling");
  if (joined.includes("document")) capabilities.push("documentation lifecycle");
  if (joined.includes("review")) capabilities.push("review workflow");

  return dedupe(capabilities);
}

function dedupe(items) {
  return [...new Set(items)];
}
