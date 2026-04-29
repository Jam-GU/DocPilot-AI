import path from "node:path";

const cwd = process.cwd();

export const config = {
  port: Number(process.env.PORT || 3100),
  host: process.env.HOST || "127.0.0.1",
  model: process.env.DOC_AGENT_MODEL || "gpt-4.1-mini",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  outputDir: path.resolve(cwd, process.env.DOC_AGENT_OUTPUT_DIR || "generated-docs"),
  designDocDir: path.resolve(cwd, process.env.DOC_AGENT_DESIGN_DOC_DIR || "design"),
  dataDir: path.resolve(cwd, ".agent-data")
};
