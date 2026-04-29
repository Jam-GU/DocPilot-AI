import { generateTechnicalDocument } from "../src/doc-agent.js";

const changedFiles = process.argv.slice(2);

const result = await generateTechnicalDocument({
  title: "Merged Pull Request Documentation Update",
  docId: "latest-pr-update",
  channel: "github-action",
  contributors: ["github-actions[bot]"],
  reviewers: ["documentation-owner"],
  changedFiles
});

console.log(JSON.stringify(result, null, 2));
