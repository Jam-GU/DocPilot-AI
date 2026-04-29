import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { handleRequest } = await import("../src/index.js");

test("github webhook generates docs when PR is merged", async () => {
  const req = makeRequest({
    method: "POST",
    url: "/api/webhooks/github",
    body: {
      action: "closed",
      changedFiles: ["README.md", "src/index.js"],
      pull_request: {
        number: 18,
        title: "Improve AI doc agent",
        merged: true,
        user: { login: "alice" },
        requested_reviewers: [{ login: "tech-writer" }]
      }
    }
  });
  const res = makeResponse();

  await handleRequest(req, res);

  const payload = JSON.parse(res.body);
  assert.equal(res.statusCode, 200);
  assert.equal(payload.docId, "pr-18");
});

function makeRequest({ method, url, body }) {
  return {
    method,
    url,
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify(body));
    }
  };
}

function makeResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(chunk = "") {
      this.body += chunk;
    }
  };
}
