import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { config } from "./config.js";
import { getCollaborationState } from "./collaboration-store.js";
import { generateTechnicalDocument, addReviewFeedback } from "./doc-agent.js";

export function createServer() {
  return http.createServer((req, res) => handleRequest(req, res));
}

export async function handleRequest(req, res) {
  try {
    if (req.method === "POST" && req.url === "/api/generate") {
      const body = await readBody(req);
      const result = await generateTechnicalDocument(body);
      return sendJson(res, 200, result);
    }

    if (req.method === "POST" && req.url === "/api/review") {
      const body = await readBody(req);
      const result = await addReviewFeedback(body);
      return sendJson(res, 200, result);
    }

    if (req.method === "GET" && req.url === "/api/sessions") {
      const state = await getCollaborationState();
      return sendJson(res, 200, state);
    }

    if (req.method === "GET" && req.url?.startsWith("/api/docs/")) {
      const docId = req.url.replace("/api/docs/", "");
      const docPath = path.join(config.outputDir, `${docId}.md`);
      const content = await fs.readFile(docPath, "utf8");
      res.writeHead(200, { "Content-Type": "text/markdown; charset=utf-8" });
      res.end(content);
      return;
    }

    if (req.method === "POST" && req.url === "/api/webhooks/github") {
      const body = await readBody(req);
      const merged = body?.action === "closed" && body?.pull_request?.merged;

      if (!merged) {
        return sendJson(res, 202, { ignored: true, reason: "PR not merged" });
      }

      const changedFiles = body.changedFiles || (body.pull_request?.changed_files_details || []).map((item) => item.filename);
      const title = `PR ${body.pull_request.number}: ${body.pull_request.title}`;
      const result = await generateTechnicalDocument({
        title,
        docId: `pr-${body.pull_request.number}`,
        channel: "github-pr-merge",
        contributors: [body.pull_request.user?.login].filter(Boolean),
        reviewers: (body.pull_request.requested_reviewers || []).map((reviewer) => reviewer.login),
        changedFiles
      });

      return sendJson(res, 200, result);
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

if (process.env.NODE_ENV !== "test") {
  const server = createServer();
  server.listen(config.port, config.host, () => {
    console.log(`AI doc agent listening on http://${config.host}:${config.port}`);
  });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}
