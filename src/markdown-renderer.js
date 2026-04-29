export function renderMarkdownDocument({ title, overview, sources, capabilities, collaboration, generatedAt }) {
  const sourceList = sources.length
    ? sources.map((source) => `- \`${source}\``).join("\n")
    : "- No source files detected";

  const capabilityList = capabilities.length
    ? capabilities.map((capability) => `- ${capability}`).join("\n")
    : "- No inferred capabilities yet";

  const collaborationNotes = collaboration?.notes?.length
    ? collaboration.notes.map((note) => `- ${note.author}: ${note.message}`).join("\n")
    : "- No review notes yet";

  const approvers = collaboration?.approvals?.length
    ? collaboration.approvals.map((item) => item.author).join(", ")
    : "Pending";

  return `# ${title}

## Overview
${overview}

## Source Coverage
${sourceList}

## Inferred Capabilities
${capabilityList}

## Collaboration
- Channel: ${collaboration?.channel || "manual"}
- Contributors: ${(collaboration?.contributors || []).join(", ") || "Unassigned"}
- Reviewers: ${(collaboration?.reviewers || []).join(", ") || "Unassigned"}
- Approved By: ${approvers}

### Notes
${collaborationNotes}

## Operational Notes
- Generated at: ${generatedAt}
- Update trigger: PR merge, manual API, or scheduled sync
- Suggested SLA: keep documentation freshness above 95%
`;
}
