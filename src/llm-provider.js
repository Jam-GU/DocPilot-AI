import { config } from "./config.js";
import { stripIndent } from "./utils.js";

export async function generateOverview(context) {
  if (!config.openAiApiKey) {
    return fallbackOverview(context);
  }

  const response = await fetch(`${config.openAiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openAiApiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a technical documentation agent. Summarize implementation intent, architecture, collaboration workflow, and update policy in concise markdown prose."
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || fallbackOverview(context);
}

function fallbackOverview(context) {
  const fileSummary = context.files
    .slice(0, 6)
    .map((file) => `- ${file.path}`)
    .join("\n");

  return stripIndent(`
    This document was generated from repository comments and design references. The current scope covers ${context.summary.fileCount} files and ${context.summary.commentBlockCount} extracted comment blocks.

    The agent is designed to keep technical documentation synchronized with implementation changes, especially during pull request merges. It supports collaborative review by tracking contributors, reviewers, notes, and approvals alongside each generated document.

    Initial source sample:
    ${fileSummary || "- No files sampled yet"}
  `);
}
