# Directory Check

## Overview
This document was generated from repository comments and design references. The current scope covers 20 files and 6 extracted comment blocks.

    The agent is designed to keep technical documentation synchronized with implementation changes, especially during pull request merges. It supports collaborative review by tracking contributors, reviewers, notes, and approvals alongside each generated document.

    Initial source sample:
    - .github/workflows/update-docs.yml
- README.md
- generated-docs/directory-check.md
- generated-docs/latest-pr-update.md
- generated-docs/pr-18.md
- generated-docs/test-documentation.md

## Source Coverage
- `.github/workflows/update-docs.yml`
- `README.md`
- `generated-docs/directory-check.md`
- `generated-docs/latest-pr-update.md`
- `generated-docs/pr-18.md`
- `generated-docs/test-documentation.md`
- `prompts/system.md`
- `prompts/user-template.md`
- `scripts/run-pr-update.js`
- `src/collaboration-store.js`
- `src/config.js`
- `src/doc-agent.js`
- `src/index.js`
- `src/llm-provider.js`
- `src/markdown-renderer.js`
- `src/parsers.js`
- `src/repository-scanner.js`
- `src/utils.js`
- `test/doc-agent.test.js`
- `test/server.test.js`

## Inferred Capabilities
- documentation lifecycle

## Collaboration
- Channel: pull-request
- Contributors: Unassigned
- Reviewers: Unassigned
- Approved By: Pending

### Notes
- No review notes yet

## Operational Notes
- Generated at: 2026-04-29T03:26:48.141Z
- Update trigger: PR merge, manual API, or scheduled sync
- Suggested SLA: keep documentation freshness above 95%
