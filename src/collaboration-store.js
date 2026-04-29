import path from "node:path";
import { config } from "./config.js";
import { ensureDir, readJson, writeJson } from "./utils.js";

const STORE_PATH = path.join(config.dataDir, "collaboration.json");

const EMPTY_STATE = {
  sessions: []
};

export async function getCollaborationState() {
  await ensureDir(config.dataDir);
  return readJson(STORE_PATH, EMPTY_STATE);
}

export async function startSession(payload) {
  const state = await getCollaborationState();
  const session = {
    id: `session_${Date.now()}`,
    docId: payload.docId,
    channel: payload.channel || "pull-request",
    contributors: payload.contributors || [],
    reviewers: payload.reviewers || [],
    notes: payload.notes || [],
    approvals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.sessions.unshift(session);
  await writeJson(STORE_PATH, state);
  return session;
}

export async function appendReview(sessionId, review) {
  const state = await getCollaborationState();
  const session = state.sessions.find((item) => item.id === sessionId);

  if (!session) {
    throw new Error(`Unknown collaboration session: ${sessionId}`);
  }

  session.notes.push({
    author: review.author,
    message: review.message,
    at: new Date().toISOString()
  });

  if (review.approved) {
    session.approvals.push({
      author: review.author,
      at: new Date().toISOString()
    });
  }

  session.updatedAt = new Date().toISOString();
  await writeJson(STORE_PATH, state);
  return session;
}
